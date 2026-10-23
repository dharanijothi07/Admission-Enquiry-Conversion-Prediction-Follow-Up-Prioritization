import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from ..core.database import Base

class Interaction(Base):
    __tablename__ = "interactions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    enquiry_id = Column(String(36), ForeignKey("enquiries.id", ondelete="CASCADE"), nullable=False, index=True)
    counsellor_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    type = Column(String(50), nullable=False)  # 'Call', 'WhatsApp', 'Email', 'Campus Visit', 'System Note'
    notes = Column(Text, nullable=False)
    outcome = Column(String(100), nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    enquiry = relationship("Enquiry", back_populates="interactions")
    counsellor = relationship("User", back_populates="interactions")
