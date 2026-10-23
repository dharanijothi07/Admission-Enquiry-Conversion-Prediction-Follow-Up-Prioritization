import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from ..core.database import Base

class PriorityAuditLog(Base):
    __tablename__ = "priority_audit_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    followup_id = Column(String(36), ForeignKey("followups.id", ondelete="CASCADE"), nullable=False, index=True)
    enquiry_id = Column(String(36), ForeignKey("enquiries.id", ondelete="CASCADE"), nullable=False, index=True)
    changed_by_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)

    action = Column(String(50), nullable=False, default="PRIORITY_OVERRIDE")  # 'ENGINE_EVALUATION', 'PRIORITY_OVERRIDE'
    previous_priority = Column(String(20), nullable=True)
    new_priority = Column(String(20), nullable=False)
    operational_score = Column(Integer, nullable=True)
    
    model_version = Column(String(100), nullable=True)
    prediction_timestamp = Column(DateTime(timezone=True), nullable=True)
    override_reason = Column(Text, nullable=True)
    reasons = Column(JSON, nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    followup = relationship("FollowUp", back_populates="audit_logs")
    changed_by = relationship("User")
