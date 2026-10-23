from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class MLPredictionRequest(BaseModel):
    percentage_score: float = Field(..., ge=0.0, le=100.0, description="12th / Qualifying Board Marks (%)")
    maths_physics_score: Optional[float] = Field(None, ge=0.0, le=100.0, description="PCM / Core Subject Marks (%)")
    entrance_percentile: Optional[float] = Field(None, ge=0.0, le=100.0, description="Entrance Exam Percentile")
    engagement_score: int = Field(50, ge=0, le=100, description="Digital Portal Telemetry Score (0-100)")
    program: str = Field(..., description="Applied Degree Program")
    lead_source: str = Field(..., description="Acquisition Marketing Channel")
    city: str = Field("Chennai", description="Candidate Hometown City")
    qualifying_exam: str = Field("12th Standard / HSC", description="Qualifying Exam Stream")
    category: str = Field("General", description="Reservation Quota Category")
    budget_range: str = Field("₹1.5L - ₹2.5L / year", description="Tuition Affordability Range")
    campus_visit_attended: bool = Field(False, description="Whether student attended in-person campus tour")
    parent_accompanied: bool = Field(False, description="Whether parent accompanied during walk-in")
    brochure_downloaded: bool = Field(False, description="Whether syllabus prospectus was downloaded")
    hostel_required: bool = Field(False, description="Campus hostel accommodation needed")
    bus_transport_required: bool = Field(False, description="College bus commute needed")

class FeatureDriver(BaseModel):
    featureName: str
    category: str
    value: Any
    weight: float
    impact: str
    explanation: str

class MLPredictionResponse(BaseModel):
    score: float
    probability_percentage: int
    priority: str
    confidence_score: float
    model_version: str
    model_algorithm: str
    recommended_action: str
    top_drivers: List[FeatureDriver]
    is_synthetic_benchmark: bool
    disclaimer: str

class MLMetricsResponse(BaseModel):
    is_synthetic_benchmark: bool
    disclaimer: str
    model_version: str
    champion_algorithm: str
    baseline_algorithm: str
    target_definition: str
    time_window_days: int
    time_window_description: str
    evaluation_strategy: str
    dataset_split: Dict[str, int]
    champion_metrics: Dict[str, Any]
    baseline_metrics: Dict[str, Any]
    feature_importances: List[Dict[str, Any]]
    all_input_features: List[str]
    safety_governance: Dict[str, Any]
