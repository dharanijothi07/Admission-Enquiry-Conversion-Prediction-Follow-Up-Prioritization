import uuid
from datetime import datetime, timezone, date
from sqlalchemy import Column, String, Integer, Boolean, Text, Date, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from ..core.database import Base

class FollowUp(Base):
    __tablename__ = "followups"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    enquiry_id = Column(String(36), ForeignKey("enquiries.id", ondelete="CASCADE"), nullable=False, index=True)
    counsellor_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    
    scheduled_date = Column(Date, nullable=False, index=True)
    scheduled_time = Column(String(20), nullable=False, default="11:00 AM")
    channel = Column(String(50), nullable=False, default="Phone Call")  # 'Phone Call', 'WhatsApp', 'Email', 'Campus Visit', 'Virtual Counselling'
    status = Column(String(50), nullable=False, default="Pending", index=True)  # 'Pending', 'Completed', 'Overdue', 'Cancelled'
    priority = Column(String(20), nullable=False, default="Medium")  # 'HIGH', 'MEDIUM', 'LOW' (or 'Urgent')
    notes = Column(Text, nullable=True)
    outcome = Column(String(100), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Prioritization Engine Telemetry & Audit
    operational_score = Column(Integer, nullable=False, default=50)
    conversion_probability = Column(Integer, nullable=True)  # ML propensity percentage (0-100)
    priority_reasons = Column(JSON, nullable=True, default=list)  # Transparent reasons breakdown
    recommended_action = Column(Text, nullable=True)  # Deterministic next action suggestion
    model_version = Column(String(100), nullable=True, default="admission_model_v1.0.0")
    prediction_timestamp = Column(DateTime(timezone=True), nullable=True)

    # Counsellor Override Audit
    is_overridden = Column(Boolean, nullable=False, default=False)
    overridden_priority = Column(String(20), nullable=True)
    override_reason = Column(Text, nullable=True)
    overridden_by_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    overridden_at = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    enquiry = relationship("Enquiry", back_populates="followups")
    counsellor = relationship("User", back_populates="followups", foreign_keys=[counsellor_id])
    overridden_by = relationship("User", foreign_keys=[overridden_by_id])
    audit_logs = relationship("PriorityAuditLog", back_populates="followup", cascade="all, delete-orphan", order_by="desc(PriorityAuditLog.created_at)")
