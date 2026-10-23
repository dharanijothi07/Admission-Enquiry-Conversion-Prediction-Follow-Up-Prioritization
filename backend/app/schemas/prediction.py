from pydantic import BaseModel, ConfigDict
from typing import List, Any
from datetime import datetime

class FeatureImpactSchema(BaseModel):
    featureName: str
    category: str
    value: Any
    weight: float
    impact: str  # 'positive' | 'negative' | 'neutral'
    explanation: str

class PredictionResponse(BaseModel):
    id: str
    enquiry_id: str
    score: float
    probability_percentage: int
    priority: str
    confidence_score: float
    model_version: str
    recommended_action: str
    top_drivers: List[FeatureImpactSchema]
    risk_factors: List[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
