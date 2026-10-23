import uuid
from datetime import datetime, timezone, date
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Date, ForeignKey
from sqlalchemy.orm import relationship
from ..core.database import Base

class Enquiry(Base):
    __tablename__ = "enquiries"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    application_no = Column(String(50), unique=True, index=True, nullable=False)
    student_id = Column(String(36), ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    counsellor_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    
    program = Column(String(255), nullable=False)
    lead_source = Column(String(100), nullable=False)
    status = Column(String(50), nullable=False, default="New")  # New, Contacted, In Discussion, Campus Visit Scheduled, Application Submitted, Converted, Lost
    
    # Telemetry and Engagement
    engagement_score = Column(Integer, default=50, nullable=False)
    brochure_downloaded = Column(Boolean, default=False, nullable=False)
    campus_visit_attended = Column(Boolean, default=False, nullable=False)
    parent_accompanied = Column(Boolean, default=False, nullable=False)
    
    enquiry_date = Column(Date, default=date.today, nullable=False)
    last_contacted_date = Column(Date, nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    student = relationship("Student", back_populates="enquiries")
    counsellor = relationship("User", back_populates="assigned_enquiries", foreign_keys=[counsellor_id])
    interactions = relationship("Interaction", back_populates="enquiry", cascade="all, delete-orphan", order_by="desc(Interaction.created_at)")
    followups = relationship("FollowUp", back_populates="enquiry", cascade="all, delete-orphan", order_by="FollowUp.scheduled_date")
    predictions = relationship("Prediction", back_populates="enquiry", cascade="all, delete-orphan", order_by="desc(Prediction.created_at)")
    admission = relationship("Admission", back_populates="enquiry", uselist=False)
