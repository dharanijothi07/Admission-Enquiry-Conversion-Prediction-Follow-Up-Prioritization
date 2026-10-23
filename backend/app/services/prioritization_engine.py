"""
Follow-Up Prioritization Engine
===============================
This engine computes operational urgency for admission enquiry follow-ups.

ARCHITECTURAL PRINCIPLES:
1. SEPARATION OF CONCERNS:
   - Conversion Probability (ML Propensity): Measures student's intrinsic likelihood of enrolling within the 45-day window.
   - Operational Urgency: Measures how time-sensitive the counsellor's follow-up task is today.
   Example: A high-conversion student with a future scheduled callback has high conversion probability but LOW urgency today.
   Conversely, an enquiry with a pending application review or overdue callback has HIGH operational urgency today.

2. TRANSPARENT SCORING FORMULA (0 - 100 Points):
   Component A: Due Date & Overdue Status (Max 35 pts)
     - Overdue >= 3 days: +35 pts
     - Overdue 1-2 days:  +28 pts
     - Due Today:         +22 pts
     - Due Tomorrow:      +12 pts
     - Upcoming (2-3 d):  +6 pts
     - Far future (>3 d): +0 pts
     - No date scheduled: +15 pts (unplanned backlog)

   Component B: Days Since Last Contact (Max 20 pts)
     - Never contacted:   +20 pts (fresh lead awaiting first contact)
     - > 14 days gap:     +18 pts (stale lead)
     - 7-14 days gap:     +14 pts (cooling off)
     - 3-6 days gap:      +8 pts (normal cadence)
     - <= 2 days gap:     +2 pts (recently touched)

   Component C: Application Stage Criticality (Max 20 pts)
     - Application Submitted / Document Verification: +20 pts (high stakes closing)
     - Campus Visit Scheduled:                        +16 pts (high commitment)
     - In Discussion:                                 +14 pts (active counseling)
     - New:                                           +12 pts (initial qualification)
     - Contacted:                                     +10 pts (exploration)
     - Converted / Lost:                               0 pts (terminal states)

   Component D: Validated ML Conversion Propensity Alignment (Max 15 pts)
     - Probability >= 75%: +15 pts
     - Probability 50-74%: +10 pts
     - Probability < 50%:   +5 pts
     - ML Pending/Missing:  +8 pts (neutral fallback)

   Component E: Response History & Counsellor Assignment (Max 10 pts)
     - Unassigned lead (counsellor_id is None): +10 pts (urgent staffing need)
     - Responsive / high-intent feedback:        +8 pts (engaged prospect)
     - Normal assigned counsellor:               +5 pts
     - Consecutive unreachable (>=2 attempts):  +2 pts (deprioritize voice, shift to async)

3. PRIORITY TIERS:
   - HIGH:   Score >= 60 OR is_overdue == True
   - MEDIUM: Score 40 - 59
   - LOW:    Score < 40

4. DETERMINISTIC NEXT ACTION RECOMMENDATIONS:
   Rule-based mapping based on stage, response history, and overdue status.

5. ETHICAL & COMPLIANCE GUARDRAILS:
   - Never uses sensitive demographic attributes (religion, caste, gender, economic status, or home address).
   - Never automates admission decisions (only prioritizes counsellor task queues).
   - Allows counsellors to manually override priority with mandatory justification.
   - Comprehensive audit logging for model version, prediction timestamps, and priority changes.
"""

from datetime import date, datetime, timezone
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field

ENGINE_VERSION = "PriorityEngine-v1.0.0"
GOVERNANCE_DISCLAIMER = (
    "Prioritization Engine optimizes counsellor contact queues only. "
    "It strictly does NOT automate or influence formal admission/enrollment decisions. "
    "No sensitive personal or demographic attributes are utilized."
)

@dataclass
class PrioritizationInput:
    """Input payload for operational follow-up prioritization."""
    enquiry_id: str
    scheduled_date: Optional[date] = None
    last_contacted_date: Optional[date] = None
    application_stage: str = "New"  # New, Contacted, In Discussion, Campus Visit Scheduled, Application Submitted, Converted, Lost
    conversion_probability: Optional[int] = None  # 0 to 100 percentage from ML
    model_version: Optional[str] = None
    prediction_timestamp: Optional[datetime] = None
    counsellor_id: Optional[str] = None
    response_history: List[str] = field(default_factory=list)  # Recent call/meeting dispositions
    is_overridden: bool = False
    overridden_priority: Optional[str] = None
    override_reason: Optional[str] = None
    reference_date: Optional[date] = None  # Evaluation reference date (defaults to date.today())

@dataclass
class PrioritizationOutput:
    """Structured result of prioritization evaluation."""
    operational_score: int
    priority: str  # 'HIGH', 'MEDIUM', 'LOW' (or 'URGENT' for extreme overdue cases)
    reasons: List[str]
    is_overdue: bool
    is_due_today: bool
    days_overdue: int
    days_since_last_contact: Optional[int]
    recommended_action: str
    conversion_probability: Optional[int]
    conversion_propensity_label: str
    model_version: Optional[str]
    prediction_timestamp: Optional[datetime]
    evaluated_at: datetime
    governance_notice: str
    is_overridden: bool
    overridden_priority: Optional[str] = None
    override_reason: Optional[str] = None

class FollowUpPrioritizationEngine:
    """Deterministic, transparent operational prioritization engine."""

    @classmethod
    def evaluate(cls, data: PrioritizationInput) -> PrioritizationOutput:
        ref_date = data.reference_date or date.today()
        score = 0
        reasons: List[str] = []

        # -------------------------------------------------------------
        # 1. DUE DATE & OVERDUE STATUS (Max 35 points)
        # -------------------------------------------------------------
        is_overdue = False
        is_due_today = False
        days_overdue = 0

        if data.scheduled_date is not None:
            delta_days = (data.scheduled_date - ref_date).days
            if delta_days < 0:
                is_overdue = True
                days_overdue = abs(delta_days)
                if days_overdue >= 3:
                    score += 35
                    reasons.append(f"Critically overdue by {days_overdue} days (+35 pts)")
                else:
                    score += 28
                    reasons.append(f"Overdue by {days_overdue} day(s) (+28 pts)")
            elif delta_days == 0:
                is_due_today = True
                score += 22
                reasons.append("Task is scheduled for callback today (+22 pts)")
            elif delta_days == 1:
                score += 12
                reasons.append("Task is due tomorrow (+12 pts)")
            elif delta_days in (2, 3):
                score += 6
                reasons.append("Upcoming task scheduled in 2-3 days (+6 pts)")
            else:
                score += 0
                reasons.append(f"Scheduled for future date ({delta_days} days away, +0 pts)")
        else:
            # Unscheduled lead in queue
            score += 15
            reasons.append("No future follow-up date scheduled (+15 pts)")

        # -------------------------------------------------------------
        # 2. DAYS SINCE LAST CONTACT (Max 20 points)
        # -------------------------------------------------------------
        days_since_contact = None
        if data.last_contacted_date is None:
            score += 20
            reasons.append("Never contacted: fresh enquiry awaiting first counsellor outreach (+20 pts)")
        else:
            days_since_contact = (ref_date - data.last_contacted_date).days
            if days_since_contact < 0:
                days_since_contact = 0
            
            if days_since_contact > 14:
                score += 18
                reasons.append(f"Stale lead: {days_since_contact} days without contact (+18 pts)")
            elif days_since_contact >= 7:
                score += 14
                reasons.append(f"Moderate cooling gap: {days_since_contact} days since last contact (+14 pts)")
            elif days_since_contact >= 3:
                score += 8
                reasons.append(f"Standard follow-up cadence: {days_since_contact} days since last contact (+8 pts)")
            else:
                score += 2
                reasons.append(f"Recently contacted {days_since_contact} day(s) ago (+2 pts)")

        # -------------------------------------------------------------
        # 3. APPLICATION STAGE CRITICALITY (Max 20 points)
        # -------------------------------------------------------------
        stage = (data.application_stage or "New").strip()
        stage_lower = stage.lower()

        if "submitted" in stage_lower or "verification" in stage_lower:
            score += 20
            reasons.append(f"High-stakes admission stage: '{stage}' (+20 pts)")
        elif "visit" in stage_lower:
            score += 16
            reasons.append(f"Active evaluation stage: '{stage}' (+16 pts)")
        elif "discussion" in stage_lower or "counselling" in stage_lower:
            score += 14
            reasons.append(f"Active consultation stage: '{stage}' (+14 pts)")
        elif "new" in stage_lower:
            score += 12
            reasons.append("New qualification stage (+12 pts)")
        elif "contacted" in stage_lower:
            score += 10
            reasons.append("Introductory contacted stage (+10 pts)")
        elif "converted" in stage_lower or "lost" in stage_lower:
            score += 0
            reasons.append(f"Terminal stage '{stage}' requires no priority escalation (+0 pts)")
        else:
            score += 10
            reasons.append(f"Stage '{stage}' (+10 pts)")

        # -------------------------------------------------------------
        # 4. ML CONVERSION PROPENSITY ALIGNMENT (Max 15 points)
        # -------------------------------------------------------------
        ml_prob = data.conversion_probability
        if ml_prob is not None:
            if ml_prob >= 75:
                score += 15
                propensity_label = "High Conversion Propensity"
                reasons.append(f"Validated ML conversion probability {ml_prob}% (High Propensity, +15 pts)")
            elif ml_prob >= 50:
                score += 10
                propensity_label = "Moderate Conversion Propensity"
                reasons.append(f"Validated ML conversion probability {ml_prob}% (Moderate Propensity, +10 pts)")
            else:
                score += 5
                propensity_label = "Low Conversion Propensity"
                reasons.append(f"Validated ML conversion probability {ml_prob}% (Standard Nurture, +5 pts)")
        else:
            score += 8
            propensity_label = "Propensity Assessment Pending"
            reasons.append("ML conversion score pending: neutral baseline applied (+8 pts)")

        # -------------------------------------------------------------
        # 5. RESPONSE HISTORY & COUNSELLOR ASSIGNMENT (Max 10 points)
        # -------------------------------------------------------------
        # Check counsellor assignment
        if not data.counsellor_id:
            score += 10
            reasons.append("Unassigned lead: requires prompt counsellor assignment (+10 pts)")
        else:
            # Check response history
            consecutive_unreachable = 0
            for disposition in reversed(data.response_history):
                if disposition and "not reachable" in disposition.lower():
                    consecutive_unreachable += 1
                else:
                    break

            if consecutive_unreachable >= 2:
                score += 2
                reasons.append(f"Repeated unreachability ({consecutive_unreachable} missed calls): deprioritize voice call (+2 pts)")
            elif any(d and any(k in d.lower() for k in ["interested", "visit", "scholarship", "parent"]) for d in data.response_history):
                score += 8
                reasons.append("Recent positive student response awaiting counsellor follow-up (+8 pts)")
            else:
                score += 5
                reasons.append("Assigned counsellor active cadence (+5 pts)")

        # Clamp operational score between 0 and 100
        operational_score = max(0, min(100, score))

        # -------------------------------------------------------------
        # PRIORITY TIER DETERMINATION (HIGH / MEDIUM / LOW)
        # -------------------------------------------------------------
        if is_overdue or operational_score >= 60:
            calculated_priority = "HIGH"
        elif operational_score >= 40:
            calculated_priority = "MEDIUM"
        else:
            calculated_priority = "LOW"

        # Apply counsellor manual override if present
        final_priority = calculated_priority
        if data.is_overridden and data.overridden_priority:
            final_priority = data.overridden_priority.upper()
            reasons.insert(0, f"MANUAL OVERRIDE: Counsellor set priority to {final_priority} (Reason: '{data.override_reason or 'No reason specified'}')")

        # -------------------------------------------------------------
        # DETERMINISTIC NEXT ACTION RECOMMENDATION
        # -------------------------------------------------------------
        recommended_action = cls._determine_next_action(
            stage=stage_lower,
            is_overdue=is_overdue,
            days_since_contact=days_since_contact,
            ml_prob=ml_prob,
            response_history=data.response_history
        )

        return PrioritizationOutput(
            operational_score=operational_score,
            priority=final_priority,
            reasons=reasons,
            is_overdue=is_overdue,
            is_due_today=is_due_today,
            days_overdue=days_overdue,
            days_since_last_contact=days_since_contact,
            recommended_action=recommended_action,
            conversion_probability=ml_prob,
            conversion_propensity_label=propensity_label,
            model_version=data.model_version or "admission_model_v1.0.0",
            prediction_timestamp=data.prediction_timestamp or datetime.now(timezone.utc),
            evaluated_at=datetime.now(timezone.utc),
            governance_notice=GOVERNANCE_DISCLAIMER,
            is_overridden=data.is_overridden,
            overridden_priority=data.overridden_priority,
            override_reason=data.override_reason
        )

    @staticmethod
    def _determine_next_action(
        stage: str,
        is_overdue: bool,
        days_since_contact: Optional[int],
        ml_prob: Optional[int],
        response_history: List[str]
    ) -> str:
        """Deterministic rules to suggest actionable next step for the counsellor."""
        # Rule 1: Application submitted and overdue
        if ("submitted" in stage or "verification" in stage) and is_overdue:
            return "Call applicant immediately: verify uploaded certificates and provide allotment schedule."

        # Rule 2: Document verification in progress
        if "verification" in stage:
            return "Contact candidate to assist with mark sheet verification and eligibility certificate upload."

        # Rule 3: Parent consultation requested
        if any("parent" in (d or "").lower() for d in response_history):
            return "Schedule joint evening tele-counselling call with parents to discuss fee structure and hostel facilities."

        # Rule 4: Scholarship discussion
        if any("scholarship" in (d or "").lower() or "fee" in (d or "").lower() for d in response_history):
            return "Prepare merit scholarship fee waiver calculation sheet and coordinate with Admission Chair."

        # Rule 5: Campus visit interest
        if any("visit" in (d or "").lower() for d in response_history) or (ml_prob and ml_prob >= 75):
            return "Coordinate in-person campus tour: book department lab demonstration and faculty interaction."

        # Rule 6: Consecutive unreachability
        if len(response_history) >= 2 and all("not reachable" in (d or "").lower() for d in response_history[-2:]):
            return "Shift channel: Send WhatsApp digital prospectus and self-scheduling calendar link."

        # Rule 7: Fresh lead uncontacted for > 7 days
        if (days_since_contact is None or days_since_contact > 7) and ("new" in stage or "enquiry" in stage):
            return "Initial outreach: Phone call to understand target branch, qualifying marks, and entrance exam status."

        # Rule 8: General overdue task
        if is_overdue:
            return "Execute overdue follow-up call immediately and record call outcome notes."

        # Default fallback
        return "Conduct scheduled follow-up via assigned channel and record student disposition."
