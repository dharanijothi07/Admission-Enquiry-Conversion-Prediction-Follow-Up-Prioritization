import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Boolean, DateTime
from sqlalchemy.orm import relationship
from ..core.database import Base

class Student(Base):
    __tablename__ = "students"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, index=True)
    phone = Column(String(50), nullable=False, index=True)
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False, default="Tamil Nadu")
    
    # Academic & Financial attributes for ML
    qualifying_exam = Column(String(100), nullable=False, default="12th Standard / HSC")
    percentage_score = Column(Float, nullable=False)
    maths_physics_score = Column(Float, nullable=True)
    entrance_percentile = Column(Float, nullable=True)
    category = Column(String(50), nullable=False, default="General")
    budget_range = Column(String(100), nullable=False, default="₹1.5L - ₹2.5L / year")
    hostel_required = Column(Boolean, default=False, nullable=False)
    bus_transport_required = Column(Boolean, default=False, nullable=False)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    enquiries = relationship("Enquiry", back_populates="student", cascade="all, delete-orphan")
    admissions = relationship("Admission", back_populates="student")
