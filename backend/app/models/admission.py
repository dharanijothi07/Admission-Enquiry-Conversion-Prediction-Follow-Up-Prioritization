import uuid
from datetime import datetime, timezone, date
from sqlalchemy import Column, String, Float, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from ..core.database import Base

class Admission(Base):
    __tablename__ = "admissions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    enquiry_id = Column(String(36), ForeignKey("enquiries.id", ondelete="RESTRICT"), unique=True, nullable=False)
    student_id = Column(String(36), ForeignKey("students.id", ondelete="RESTRICT"), nullable=False)
    
    enrollment_no = Column(String(50), unique=True, index=True, nullable=False)
    program = Column(String(255), nullable=False)
    fee_paid = Column(Float, default=0.0, nullable=False)
    scholarship_awarded = Column(Float, default=0.0, nullable=False)
    admission_date = Column(Date, default=date.today, nullable=False)
    status = Column(String(50), default="Provisionally Admitted", nullable=False)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    enquiry = relationship("Enquiry", back_populates="admission")
    student = relationship("Student", back_populates="admissions")
