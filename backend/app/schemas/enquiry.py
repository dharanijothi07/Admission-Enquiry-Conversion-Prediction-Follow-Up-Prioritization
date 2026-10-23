from pydantic import BaseModel, ConfigDict, EmailStr, Field
from typing import Optional, List
from datetime import date, datetime
from .student import StudentResponse
from .prediction import PredictionResponse
from .interaction import InteractionResponse
from .followup import FollowUpResponse

class EnquiryCreate(BaseModel):
    # Student details
    student_name: str
    email: EmailStr
    phone: str
    city: str
    state: str = "Tamil Nadu"
    qualifying_exam: str = "12th Standard / HSC"
    percentage_score: float = Field(..., ge=0.0, le=100.0)
    maths_physics_score: Optional[float] = Field(None, ge=0.0, le=100.0)
    entrance_percentile: Optional[float] = Field(None, ge=0.0, le=100.0)
    category: str = "General"
    budget_range: str = "₹1.5L - ₹2.5L / year"
    hostel_required: bool = False
    bus_transport_required: bool = False

    # Enquiry details
    program: str
    lead_source: str
    status: str = "New"
    counsellor_id: Optional[str] = None
    engagement_score: int = Field(50, ge=0, le=100)
    brochure_downloaded: bool = False
    campus_visit_attended: bool = False
    parent_accompanied: bool = False

class EnquiryUpdate(BaseModel):
    # Candidate details update
    student_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    percentage_score: Optional[float] = None
    maths_physics_score: Optional[float] = None
    entrance_percentile: Optional[float] = None
    budget_range: Optional[str] = None
    hostel_required: Optional[bool] = None
    bus_transport_required: Optional[bool] = None

    # Lifecycle update
    program: Optional[str] = None
    lead_source: Optional[str] = None
    status: Optional[str] = None
    counsellor_id: Optional[str] = None
    engagement_score: Optional[int] = None
    brochure_downloaded: Optional[bool] = None
    campus_visit_attended: Optional[bool] = None
    parent_accompanied: Optional[bool] = None

class EnquiryResponse(BaseModel):
    id: str
    application_no: str
    student_id: str
    student: StudentResponse
    program: str
    lead_source: str
    status: str
    counsellor_id: Optional[str] = None
    counsellor_name: Optional[str] = None
    engagement_score: int
    brochure_downloaded: bool
    campus_visit_attended: bool
    parent_accompanied: bool
    enquiry_date: date
    last_contacted_date: Optional[date] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    # Dynamic ML prediction & priority tier
    latest_prediction: Optional[PredictionResponse] = None
    priority_tier: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class EnquiryDetailResponse(EnquiryResponse):
    interactions: List[InteractionResponse] = []
    followup_tasks: List[FollowUpResponse] = []
