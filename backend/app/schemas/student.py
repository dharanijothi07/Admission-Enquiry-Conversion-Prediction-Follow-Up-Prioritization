from pydantic import BaseModel, EmailStr, ConfigDict, Field
from typing import Optional
from datetime import datetime

class StudentBase(BaseModel):
    name: str
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

class StudentCreate(StudentBase):
    pass

class StudentUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    percentage_score: Optional[float] = None
    maths_physics_score: Optional[float] = None
    entrance_percentile: Optional[float] = None
    category: Optional[str] = None
    budget_range: Optional[str] = None
    hostel_required: Optional[bool] = None
    bus_transport_required: Optional[bool] = None

class StudentResponse(StudentBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
