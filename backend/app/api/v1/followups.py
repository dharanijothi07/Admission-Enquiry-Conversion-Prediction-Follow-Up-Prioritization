from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from datetime import date, datetime, timezone
from ...core.database import get_db
from ...models.followup import FollowUp
from ...models.enquiry import Enquiry
from ...models.student import Student
from ...models.user import User
from ...models.priority_audit import PriorityAuditLog
from ...schemas.followup import (
    FollowUpCreate,
    FollowUpUpdate,
    FollowUpReschedule,
    FollowUpResponse,
    FollowUpOverrideRequest,
    PriorityAuditLogResponse,
    FollowUpSummaryResponse
)
from ...services.prioritization_engine import (
    FollowUpPrioritizationEngine,
    PrioritizationInput,
    PrioritizationOutput,
    GOVERNANCE_DISCLAIMER
)
from ..deps import get_current_user, verify_enquiry_access

router = APIRouter(prefix="/followups", tags=["Follow-Up Prioritization Tasks"])

def compute_engine_evaluation(f: FollowUp, db: Session, ref_date: Optional[date] = None) -> PrioritizationOutput:
    """Helper to evaluate operational prioritization for a follow-up task."""
    enquiry = f.enquiry
    last_contact = enquiry.last_contacted_date if enquiry else None
    stage = enquiry.status if enquiry else "New"
    
    # ML Conversion Propensity
    conv_prob = f.conversion_probability
    m_ver = f.model_version
    p_time = f.prediction_timestamp
    if conv_prob is None and enquiry and enquiry.predictions:
        latest_pred = enquiry.predictions[0]
        conv_prob = latest_pred.probability_percentage
        m_ver = latest_pred.model_version
        p_time = latest_pred.created_at

    # Response history from recent interactions & followups
    history: List[str] = []
    if enquiry:
        if enquiry.interactions:
            history.extend([i.outcome for i in enquiry.interactions[:3] if i.outcome])
        if enquiry.followups:
            history.extend([fu.outcome for fu in enquiry.followups[:3] if fu.outcome and fu.id != f.id])

    p_input = PrioritizationInput(
        enquiry_id=f.enquiry_id,
        scheduled_date=f.scheduled_date,
        last_contacted_date=last_contact,
        application_stage=stage,
        conversion_probability=conv_prob,
        model_version=m_ver,
        prediction_timestamp=p_time,
        counsellor_id=f.counsellor_id,
        response_history=history,
        is_overridden=f.is_overridden,
        overridden_priority=f.overridden_priority,
        override_reason=f.override_reason,
        reference_date=ref_date or date.today()
    )
    return FollowUpPrioritizationEngine.evaluate(p_input)

def enrich_followup(f: FollowUp, db: Optional[Session] = None) -> FollowUpResponse:
    """Enriches FollowUp entity with prioritization details, audit metadata, and student info."""
    student_name = f.enquiry.student.name if f.enquiry and f.enquiry.student else "Candidate"
    course = f.enquiry.program if f.enquiry else "Engineering"
    c_name = f.counsellor.full_name if f.counsellor else None
    overridden_by_name = f.overridden_by.full_name if f.overridden_by else None

    today = date.today()
    is_overdue = (f.scheduled_date < today) and (f.status == "Pending")
    is_due_today = (f.scheduled_date == today) and (f.status == "Pending")
    days_overdue = max(0, (today - f.scheduled_date).days) if is_overdue else 0

    # If pending and db provided, refresh evaluation for live accuracy
    reasons = f.priority_reasons or []
    rec_action = f.recommended_action
    score = f.operational_score or 50
    final_priority = f.priority or "Medium"

    if db and f.status == "Pending":
        eval_result = compute_engine_evaluation(f, db, today)
        score = eval_result.operational_score
        reasons = eval_result.reasons
        rec_action = eval_result.recommended_action
        if f.is_overridden:
            final_priority = f.overridden_priority or f.priority
        elif f.priority in ["Urgent", "urgent"]:
            final_priority = "Urgent"
        else:
            final_priority = eval_result.priority

    return FollowUpResponse(
        id=f.id,
        enquiry_id=f.enquiry_id,
        student_name=student_name,
        course_interested=course,
        counsellor_id=f.counsellor_id,
        counsellor_name=c_name,
        scheduled_date=f.scheduled_date,
        scheduled_time=f.scheduled_time,
        channel=f.channel,
        status=f.status,
        priority=final_priority,
        notes=f.notes,
        outcome=f.outcome,
        completed_at=f.completed_at,
        created_at=f.created_at,
        operational_score=score,
        conversion_probability=f.conversion_probability,
        priority_reasons=reasons,
        recommended_action=rec_action,
        is_overdue=is_overdue,
        is_due_today=is_due_today,
        days_overdue=days_overdue,
        is_overridden=f.is_overridden,
        overridden_priority=f.overridden_priority,
        override_reason=f.override_reason,
        overridden_by_name=overridden_by_name,
        overridden_at=f.overridden_at,
        model_version=f.model_version,
        prediction_timestamp=f.prediction_timestamp,
        governance_notice=GOVERNANCE_DISCLAIMER
    )

@router.get("/summary/operational", response_model=FollowUpSummaryResponse)
def get_operational_summary(
    counsellor_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns high-level operational counts for overdue, due-today, and priority tiers.
    Strictly segregated by counsellor role permissions.
    """
    query = db.query(FollowUp).join(Enquiry, FollowUp.enquiry_id == Enquiry.id)
    if current_user.role == "counsellor":
        query = query.filter(FollowUp.counsellor_id == current_user.id)
    elif counsellor_id:
        query = query.filter(FollowUp.counsellor_id == counsellor_id)

    tasks = query.all()
    today = date.today()

    total = len(tasks)
    pending = [t for t in tasks if t.status == "Pending"]
    overdue = [t for t in pending if t.scheduled_date < today]
    due_today = [t for t in pending if t.scheduled_date == today]
    high = [t for t in pending if str(t.priority).upper() in ["HIGH", "URGENT"] or t.scheduled_date < today]
    medium = [t for t in pending if str(t.priority).upper() == "MEDIUM" and t.scheduled_date >= today]
    low = [t for t in pending if str(t.priority).upper() == "LOW" and t.scheduled_date >= today]
    overridden = [t for t in tasks if t.is_overridden]

    return FollowUpSummaryResponse(
        total_tasks=total,
        pending_tasks=len(pending),
        overdue_tasks=len(overdue),
        due_today_tasks=len(due_today),
        high_priority_tasks=len(high),
        medium_priority_tasks=len(medium),
        low_priority_tasks=len(low),
        overridden_tasks=len(overridden),
        governance_notice=GOVERNANCE_DISCLAIMER
    )

@router.get("", response_model=List[FollowUpResponse])
def list_followups(
    status_filter: Optional[str] = Query(None, alias="status"),
    channel: Optional[str] = None,
    priority: Optional[str] = None,
    scheduled_date: Optional[date] = None,
    counsellor_id: Optional[str] = None,
    overdue_only: Optional[bool] = False,
    due_today_only: Optional[bool] = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Lists follow-up tasks with operational prioritization.
    Server permission enforcement: Counsellors see only tasks assigned to them.
    Preserves all existing query parameters and backwards compatibility.
    """
    query = db.query(FollowUp).join(Enquiry, FollowUp.enquiry_id == Enquiry.id)

    if current_user.role == "counsellor":
        query = query.filter(FollowUp.counsellor_id == current_user.id)
    elif counsellor_id:
        query = query.filter(FollowUp.counsellor_id == counsellor_id)

    if status_filter:
        query = query.filter(FollowUp.status == status_filter)
    if channel:
        query = query.filter(FollowUp.channel == channel)
    if priority:
        # Match case-insensitively
        p_clean = priority.strip()
        query = query.filter(FollowUp.priority.ilike(p_clean))
    if scheduled_date:
        query = query.filter(FollowUp.scheduled_date == scheduled_date)

    today = date.today()
    if overdue_only:
        query = query.filter(FollowUp.status == "Pending", FollowUp.scheduled_date < today)
    if due_today_only:
        query = query.filter(FollowUp.status == "Pending", FollowUp.scheduled_date == today)

    tasks = query.order_by(FollowUp.scheduled_date.asc()).all()
    return [enrich_followup(t, db) for t in tasks]

@router.post("", response_model=FollowUpResponse, status_code=status.HTTP_201_CREATED)
def schedule_followup(
    task_in: FollowUpCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Schedules a new callback or virtual meeting with automatic operational scoring."""
    enquiry = verify_enquiry_access(task_in.enquiry_id, current_user, db)

    counsellor_id = enquiry.counsellor_id or current_user.id
    task = FollowUp(
        enquiry_id=enquiry.id,
        counsellor_id=counsellor_id,
        scheduled_date=task_in.scheduled_date,
        scheduled_time=task_in.scheduled_time,
        channel=task_in.channel,
        priority=task_in.priority or "Medium",
        notes=task_in.notes,
        status="Pending"
    )
    db.add(task)
    db.flush()

    # Run Prioritization Engine on newly scheduled task
    eval_output = compute_engine_evaluation(task, db, date.today())
    task.operational_score = eval_output.operational_score
    task.priority = task_in.priority if task_in.priority else eval_output.priority
    task.priority_reasons = eval_output.reasons
    task.recommended_action = eval_output.recommended_action
    task.conversion_probability = eval_output.conversion_probability
    task.model_version = eval_output.model_version
    task.prediction_timestamp = eval_output.prediction_timestamp

    # Add audit log for initial creation and evaluation
    audit_log = PriorityAuditLog(
        followup_id=task.id,
        enquiry_id=task.enquiry_id,
        changed_by_id=current_user.id,
        action="ENGINE_EVALUATION",
        previous_priority=None,
        new_priority=task.priority,
        operational_score=task.operational_score,
        model_version=task.model_version,
        prediction_timestamp=task.prediction_timestamp,
        reasons=task.priority_reasons
    )
    db.add(audit_log)
    db.commit()
    db.refresh(task)
    return enrich_followup(task, db)

@router.post("/{task_id}/override", response_model=FollowUpResponse)
def override_task_priority(
    task_id: str,
    override_in: FollowUpOverrideRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Allows counsellors/admins to manually override engine priority with a mandatory explanation.
    Audit log records the change, model version, prediction timestamp, and reason.
    """
    task = db.query(FollowUp).filter(FollowUp.id == task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Follow-up task not found")

    verify_enquiry_access(task.enquiry_id, current_user, db)

    # Validate target priority
    raw_p = override_in.new_priority.strip().upper()
    if raw_p not in ["HIGH", "MEDIUM", "LOW", "URGENT"]:
        # Capitalize check
        raw_p = override_in.new_priority.strip().capitalize()
        if raw_p not in ["High", "Medium", "Low", "Urgent"]:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Invalid priority value. Must be HIGH, MEDIUM, LOW, or Urgent."
            )

    if not override_in.override_reason or len(override_in.override_reason.strip()) < 3:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="A substantive override reason (min 3 characters) is strictly mandatory for ethical auditability."
        )

    previous_priority = task.priority
    task.is_overridden = True
    task.overridden_priority = raw_p
    task.priority = raw_p
    task.override_reason = override_in.override_reason.strip()
    task.overridden_by_id = current_user.id
    task.overridden_at = datetime.now(timezone.utc)

    # Append to priority reasons
    existing_reasons = task.priority_reasons or []
    override_note = f"MANUAL OVERRIDE: Counsellor set priority to {raw_p} (Reason: {task.override_reason})"
    task.priority_reasons = [override_note] + [r for r in existing_reasons if not r.startswith("MANUAL OVERRIDE")]

    # Record persistent audit trail
    audit_entry = PriorityAuditLog(
        followup_id=task.id,
        enquiry_id=task.enquiry_id,
        changed_by_id=current_user.id,
        action="PRIORITY_OVERRIDE",
        previous_priority=previous_priority,
        new_priority=raw_p,
        operational_score=task.operational_score,
        model_version=task.model_version,
        prediction_timestamp=task.prediction_timestamp,
        override_reason=task.override_reason,
        reasons=task.priority_reasons
    )
    db.add(audit_entry)
    db.commit()
    db.refresh(task)

    return enrich_followup(task, db)

@router.get("/{task_id}/audit-trail", response_model=List[PriorityAuditLogResponse])
def get_task_audit_trail(
    task_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves full audit history of model versions, evaluations, and counsellor overrides."""
    task = db.query(FollowUp).filter(FollowUp.id == task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    verify_enquiry_access(task.enquiry_id, current_user, db)

    logs = db.query(PriorityAuditLog).filter(PriorityAuditLog.followup_id == task_id).order_by(desc(PriorityAuditLog.created_at)).all()
    results = []
    for l in logs:
        changed_by_name = l.changed_by.full_name if l.changed_by else "Engine System"
        results.append(
            PriorityAuditLogResponse(
                id=l.id,
                followup_id=l.followup_id,
                enquiry_id=l.enquiry_id,
                action=l.action,
                previous_priority=l.previous_priority,
                new_priority=l.new_priority,
                operational_score=l.operational_score,
                model_version=l.model_version,
                prediction_timestamp=l.prediction_timestamp,
                override_reason=l.override_reason,
                reasons=l.reasons,
                changed_by_name=changed_by_name,
                created_at=l.created_at
            )
        )
    return results

@router.patch("/{task_id}/status", response_model=FollowUpResponse)
def update_task_status(
    task_id: str,
    status_update: FollowUpUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Logs call outcome disposition and marks task completed."""
    task = db.query(FollowUp).filter(FollowUp.id == task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    verify_enquiry_access(task.enquiry_id, current_user, db)

    if status_update.status is not None:
        task.status = status_update.status
        if status_update.status == "Completed":
            task.completed_at = datetime.now(timezone.utc)
    if status_update.outcome is not None:
        task.outcome = status_update.outcome
    if status_update.notes:
        task.notes = f"{task.notes or ''} | Note: {status_update.notes}".strip(" |")

    db.commit()
    db.refresh(task)
    return enrich_followup(task, db)

@router.patch("/{task_id}/reschedule", response_model=FollowUpResponse)
def reschedule_task(
    task_id: str,
    reschedule_in: FollowUpReschedule,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Reschedules follow-up to a future date slot and recalculates operational priority."""
    task = db.query(FollowUp).filter(FollowUp.id == task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    verify_enquiry_access(task.enquiry_id, current_user, db)

    previous_priority = task.priority
    task.scheduled_date = reschedule_in.scheduled_date
    task.scheduled_time = reschedule_in.scheduled_time
    task.status = "Pending"
    if reschedule_in.notes:
        task.notes = f"{task.notes or ''} | Rescheduled: {reschedule_in.notes}".strip(" |")

    # If priority was not manually overridden, let the engine recalculate for the new date
    if not task.is_overridden:
        eval_output = compute_engine_evaluation(task, db, date.today())
        task.operational_score = eval_output.operational_score
        task.priority = eval_output.priority
        task.priority_reasons = eval_output.reasons
        task.recommended_action = eval_output.recommended_action

        audit_entry = PriorityAuditLog(
            followup_id=task.id,
            enquiry_id=task.enquiry_id,
            changed_by_id=current_user.id,
            action="RESCHEDULE_RECALCULATION",
            previous_priority=previous_priority,
            new_priority=task.priority,
            operational_score=task.operational_score,
            model_version=task.model_version,
            prediction_timestamp=task.prediction_timestamp,
            override_reason=reschedule_in.notes or "Rescheduled date recalculation",
            reasons=task.priority_reasons
        )
        db.add(audit_entry)

    db.commit()
    db.refresh(task)
    return enrich_followup(task, db)
