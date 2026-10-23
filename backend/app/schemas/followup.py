from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from datetime import date, datetime

class FollowUpCreate(BaseModel):
    enquiry_id: str
    scheduled_date: date
    scheduled_time: str = "11:00 AM"
    channel: str = "Phone Call"  # 'Phone Call' | 'WhatsApp' | 'Email' | 'Campus Visit' | 'Virtual Counselling'
    priority: Optional[str] = None     # If omitted, Prioritization Engine determines HIGH/MEDIUM/LOW
    notes: Optional[str] = None

class FollowUpUpdate(BaseModel):
    status: Optional[str] = None  # 'Pending' | 'Completed' | 'Overdue' | 'Cancelled'
    outcome: Optional[str] = None
    notes: Optional[str] = None

class FollowUpReschedule(BaseModel):
    scheduled_date: date
    scheduled_time: str
    notes: Optional[str] = None

class FollowUpOverrideRequest(BaseModel):
    new_priority: str = Field(..., description="Target priority: HIGH, MEDIUM, LOW, or Urgent")
    override_reason: str = Field(..., min_length=3, description="Mandatory counsellor justification for manual priority change")

class PriorityAuditLogResponse(BaseModel):
    id: str
    followup_id: str
    enquiry_id: str
    action: str
    previous_priority: Optional[str] = None
    new_priority: str
    operational_score: Optional[int] = None
    model_version: Optional[str] = None
    prediction_timestamp: Optional[datetime] = None
    override_reason: Optional[str] = None
    reasons: Optional[List[str]] = None
    changed_by_name: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class FollowUpResponse(BaseModel):
    id: str
    enquiry_id: str
    student_name: Optional[str] = None
    course_interested: Optional[str] = None
    counsellor_id: Optional[str] = None
    counsellor_name: Optional[str] = None
    scheduled_date: date
    scheduled_time: str
    channel: str
    status: str
    priority: str
    notes: Optional[str] = None
    outcome: Optional[str] = None
    completed_at: Optional[datetime] = None
    created_at: datetime

    # Prioritization Engine Telemetry
    operational_score: int = 50
    conversion_probability: Optional[int] = None
    priority_reasons: List[str] = Field(default_factory=list)
    recommended_action: Optional[str] = None
    is_overdue: bool = False
    is_due_today: bool = False
    days_overdue: int = 0
    
    # Counsellor Override Audit
    is_overridden: bool = False
    overridden_priority: Optional[str] = None
    override_reason: Optional[str] = None
    overridden_by_name: Optional[str] = None
    overridden_at: Optional[datetime] = None
    
    # Engine Governance Metadata
    model_version: Optional[str] = None
    prediction_timestamp: Optional[datetime] = None
    governance_notice: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class FollowUpSummaryResponse(BaseModel):
    total_tasks: int
    pending_tasks: int
    overdue_tasks: int
    due_today_tasks: int
    high_priority_tasks: int
    medium_priority_tasks: int
    low_priority_tasks: int
    overridden_tasks: int
    governance_notice: str

