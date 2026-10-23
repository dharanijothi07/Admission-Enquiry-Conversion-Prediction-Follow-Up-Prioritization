from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date, datetime

class AdmissionCreate(BaseModel):
    enquiry_id: str
    enrollment_no: Optional[str] = None
    fee_paid: float = 0.0
    scholarship_awarded: float = 0.0
    admission_date: Optional[date] = None
    status: str = "Provisionally Admitted"

class AdmissionResponse(BaseModel):
    id: str
    enquiry_id: str
    student_id: str
    enrollment_no: str
    program: str
    fee_paid: float
    scholarship_awarded: float
    admission_date: date
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
