import random
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from typing import List, Optional
from datetime import date, datetime, timezone
from ...core.database import get_db
from ...models.enquiry import Enquiry
from ...models.student import Student
from ...models.prediction import Prediction
from ...models.interaction import Interaction
from ...models.user import User
from ...schemas.enquiry import (
    EnquiryCreate,
    EnquiryUpdate,
    EnquiryResponse,
    EnquiryDetailResponse
)
from ...schemas.student import StudentResponse
from ...schemas.prediction import PredictionResponse
from ...services.prediction_engine import calculate_conversion_prediction
from ..deps import get_current_user, verify_enquiry_access

router = APIRouter(prefix="/enquiries", tags=["Enquiry Management"])

def enrich_enquiry_response(enquiry: Enquiry) -> EnquiryResponse:
    """Helper to convert Enquiry model to EnquiryResponse schema with nested prediction."""
    latest_pred = enquiry.predictions[0] if enquiry.predictions else None
    resp = EnquiryResponse(
        id=enquiry.id,
        application_no=enquiry.application_no,
        student_id=enquiry.student_id,
        student=StudentResponse.model_validate(enquiry.student),
        program=enquiry.program,
        lead_source=enquiry.lead_source,
        status=enquiry.status,
        counsellor_id=enquiry.counsellor_id,
        counsellor_name=enquiry.counsellor.full_name if enquiry.counsellor else None,
        engagement_score=enquiry.engagement_score,
        brochure_downloaded=enquiry.brochure_downloaded,
        campus_visit_attended=enquiry.campus_visit_attended,
        parent_accompanied=enquiry.parent_accompanied,
        enquiry_date=enquiry.enquiry_date,
        last_contacted_date=enquiry.last_contacted_date,
        created_at=enquiry.created_at,
        updated_at=enquiry.updated_at,
        latest_prediction=PredictionResponse.model_validate(latest_pred) if latest_pred else None,
        priority_tier=latest_pred.priority if latest_pred else "Medium"
    )
    return resp

@router.get("", response_model=List[EnquiryResponse])
def list_enquiries(
    search: Optional[str] = Query(None, description="Search by student name, email, phone, or application number"),
    program: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    lead_source: Optional[str] = None,
    counsellor_id: Optional[str] = None,
    min_probability: Optional[int] = Query(None, ge=0, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieves filtered list of enquiries.
    SERVER PERMISSION ENFORCEMENT:
    - If user is a counsellor, query is strictly filtered to enquiry.counsellor_id == current_user.id.
    - If user is an admin, they can access all leads or filter by any counsellor.
    """
    query = db.query(Enquiry).join(Student, Enquiry.student_id == Student.id)

    # Permission boundary
    if current_user.role == "counsellor":
        query = query.filter(Enquiry.counsellor_id == current_user.id)
    elif counsellor_id:
        query = query.filter(Enquiry.counsellor_id == counsellor_id)

    # Search filter
    if search:
        s = f"%{search.strip().lower()}%"
        query = query.filter(
            or_(
                Student.name.ilike(s),
                Student.email.ilike(s),
                Student.phone.ilike(s),
                Enquiry.application_no.ilike(s),
                Student.city.ilike(s)
            )
        )

    if program:
        query = query.filter(Enquiry.program == program)
    if status:
        query = query.filter(Enquiry.status == status)
    if lead_source:
        query = query.filter(Enquiry.lead_source == lead_source)

    enquiries = query.order_by(desc(Enquiry.created_at)).all()

    # In-memory post-filters for prediction priority/probability
    results = []
    for enq in enquiries:
        enriched = enrich_enquiry_response(enq)
        if priority and enriched.priority_tier != priority:
            continue
        if min_probability is not None:
            prob = enriched.latest_prediction.probability_percentage if enriched.latest_prediction else 0
            if prob < min_probability:
                continue
        results.append(enriched)
    return results

@router.post("", response_model=EnquiryResponse, status_code=status.HTTP_201_CREATED)
def create_enquiry(
    enquiry_in: EnquiryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Registers a new student dossier & admission enquiry.
    Automatically runs the ML Prediction Engine and generates TreeSHAP feature attributions.
    """
    # 1. Create Student record
    student = Student(
        name=enquiry_in.student_name,
        email=enquiry_in.email.strip().lower(),
        phone=enquiry_in.phone.strip(),
        city=enquiry_in.city,
        state=enquiry_in.state,
        qualifying_exam=enquiry_in.qualifying_exam,
        percentage_score=enquiry_in.percentage_score,
        maths_physics_score=enquiry_in.maths_physics_score,
        entrance_percentile=enquiry_in.entrance_percentile,
        category=enquiry_in.category,
        budget_range=enquiry_in.budget_range,
        hostel_required=enquiry_in.hostel_required,
        bus_transport_required=enquiry_in.bus_transport_required
    )
    db.add(student)
    db.flush()

    # 2. Determine assigned counsellor
    assigned_counsellor_id = enquiry_in.counsellor_id
    if current_user.role == "counsellor" and not assigned_counsellor_id:
        assigned_counsellor_id = current_user.id

    # 3. Generate Application Number
    total_existing = db.query(Enquiry).count()
    app_no = f"APP-2026-{str(total_existing + 101).zfill(4)}"

    # 4. Create Enquiry
    enquiry = Enquiry(
        application_no=app_no,
        student_id=student.id,
        counsellor_id=assigned_counsellor_id,
        program=enquiry_in.program,
        lead_source=enquiry_in.lead_source,
        status=enquiry_in.status,
        engagement_score=enquiry_in.engagement_score,
        brochure_downloaded=enquiry_in.brochure_downloaded,
        campus_visit_attended=enquiry_in.campus_visit_attended,
        parent_accompanied=enquiry_in.parent_accompanied,
        enquiry_date=date.today()
    )
    db.add(enquiry)
    db.flush()

    # 5. Run ML Prediction Engine
    pred_data = calculate_conversion_prediction(enquiry, student)
    prediction = Prediction(
        enquiry_id=enquiry.id,
        score=pred_data["score"],
        probability_percentage=pred_data["probability_percentage"],
        priority=pred_data["priority"],
        confidence_score=pred_data["confidence_score"],
        model_version=pred_data["model_version"],
        recommended_action=pred_data["recommended_action"],
        top_drivers=pred_data["top_drivers"],
        risk_factors=pred_data["risk_factors"]
    )
    db.add(prediction)

    # 6. Log initial system note
    interaction = Interaction(
        enquiry_id=enquiry.id,
        counsellor_id=current_user.id,
        type="System Note",
        notes=f"Enquiry registered via {enquiry.lead_source}. Initial ML conversion score computed at {pred_data['probability_percentage']}% ({pred_data['priority']} Priority)."
    )
    db.add(interaction)

    db.commit()
    db.refresh(enquiry)
    return enrich_enquiry_response(enquiry)

@router.get("/{enquiry_id}", response_model=EnquiryDetailResponse)
def get_enquiry_details(
    enquiry_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieves full student dossier, interaction history, and follow-up tasks.
    Enforces server-side permissions: Counsellors can only view their own assigned leads.
    """
    enquiry = verify_enquiry_access(enquiry_id, current_user, db)
    base_resp = enrich_enquiry_response(enquiry)

    from ...schemas.interaction import InteractionResponse
    from ...schemas.followup import FollowUpResponse

    interactions = [
        InteractionResponse(
            id=i.id,
            enquiry_id=i.enquiry_id,
            counsellor_id=i.counsellor_id,
            counsellor_name=i.counsellor.full_name if i.counsellor else "System",
            type=i.type,
            notes=i.notes,
            outcome=i.outcome,
            created_at=i.created_at
        )
        for i in enquiry.interactions
    ]

    followups = [
        FollowUpResponse(
            id=f.id,
            enquiry_id=f.enquiry_id,
            student_name=enquiry.student.name,
            course_interested=enquiry.program,
            counsellor_id=f.counsellor_id,
            counsellor_name=f.counsellor.full_name if f.counsellor else None,
            scheduled_date=f.scheduled_date,
            scheduled_time=f.scheduled_time,
            channel=f.channel,
            status=f.status,
            priority=f.priority,
            notes=f.notes,
            outcome=f.outcome,
            completed_at=f.completed_at,
            created_at=f.created_at
        )
        for f in enquiry.followups
    ]

    return EnquiryDetailResponse(
        **base_resp.model_dump(),
        interactions=interactions,
        followup_tasks=followups
    )

@router.put("/{enquiry_id}", response_model=EnquiryResponse)
def update_enquiry(
    enquiry_id: str,
    updates: EnquiryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Updates student credentials and enquiry status.
    Automatically recalculates ML conversion score and logs an updated Prediction record.
    Server permission check ensures counsellors only edit assigned leads.
    """
    enquiry = verify_enquiry_access(enquiry_id, current_user, db)
    student = enquiry.student

    # Update student fields
    if updates.student_name is not None:
        student.name = updates.student_name
    if updates.email is not None:
        student.email = updates.email.strip().lower()
    if updates.phone is not None:
        student.phone = updates.phone.strip()
    if updates.city is not None:
        student.city = updates.city
    if updates.state is not None:
        student.state = updates.state
    if updates.percentage_score is not None:
        student.percentage_score = updates.percentage_score
    if updates.maths_physics_score is not None:
        student.maths_physics_score = updates.maths_physics_score
    if updates.entrance_percentile is not None:
        student.entrance_percentile = updates.entrance_percentile
    if updates.budget_range is not None:
        student.budget_range = updates.budget_range
    if updates.hostel_required is not None:
        student.hostel_required = updates.hostel_required
    if updates.bus_transport_required is not None:
        student.bus_transport_required = updates.bus_transport_required

    # Update enquiry fields
    if updates.program is not None:
        enquiry.program = updates.program
    if updates.lead_source is not None:
        enquiry.lead_source = updates.lead_source
    if updates.status is not None:
        enquiry.status = updates.status
    if updates.counsellor_id is not None and current_user.role == "admin":
        enquiry.counsellor_id = updates.counsellor_id
    if updates.engagement_score is not None:
        enquiry.engagement_score = updates.engagement_score
    if updates.brochure_downloaded is not None:
        enquiry.brochure_downloaded = updates.brochure_downloaded
    if updates.campus_visit_attended is not None:
        enquiry.campus_visit_attended = updates.campus_visit_attended
    if updates.parent_accompanied is not None:
        enquiry.parent_accompanied = updates.parent_accompanied

    enquiry.updated_at = datetime.now(timezone.utc)

    # Recalculate ML prediction
    pred_data = calculate_conversion_prediction(enquiry, student)
    new_prediction = Prediction(
        enquiry_id=enquiry.id,
        score=pred_data["score"],
        probability_percentage=pred_data["probability_percentage"],
        priority=pred_data["priority"],
        confidence_score=pred_data["confidence_score"],
        model_version=pred_data["model_version"],
        recommended_action=pred_data["recommended_action"],
        top_drivers=pred_data["top_drivers"],
        risk_factors=pred_data["risk_factors"]
    )
    db.add(new_prediction)

    db.commit()
    db.refresh(enquiry)
    return enrich_enquiry_response(enquiry)

@router.delete("/{enquiry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_enquiry(
    enquiry_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Deletes an enquiry record. Verified by server-side permission."""
    enquiry = verify_enquiry_access(enquiry_id, current_user, db)
    db.delete(enquiry)
    db.commit()
    return None
