import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from ..core.database import Base

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    enquiry_id = Column(String(36), ForeignKey("enquiries.id", ondelete="CASCADE"), nullable=False, index=True)
    
    score = Column(Float, nullable=False)
    probability_percentage = Column(Integer, nullable=False)
    priority = Column(String(20), nullable=False)  # 'Urgent', 'High', 'Medium', 'Low'
    confidence_score = Column(Float, nullable=False, default=0.91)
    model_version = Column(String(100), nullable=False, default="XGBoost-Ensemble-v2.3 (Demo/College Prototype)")
    recommended_action = Column(Text, nullable=False)
    
    # Explainable AI attributions (list of FeatureImpact dicts)
    top_drivers = Column(JSON, nullable=False, default=list)
    # List of risk factor strings
    risk_factors = Column(JSON, nullable=False, default=list)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    enquiry = relationship("Enquiry", back_populates="predictions")
