from pydantic import BaseModel
from typing import List

class DashboardMetricsResponse(BaseModel):
    total_enquiries: int
    urgent_follow_ups: int
    predicted_high_intent: int
    avg_conversion_probability: float
    overall_conversion_rate: float
    pending_tasks_today: int
    completed_tasks_this_week: int

class FunnelStageResponse(BaseModel):
    stage: str
    count: int
    dropoff: str

class SourcePerformanceResponse(BaseModel):
    source: str
    count: int
    converted: int
    rate: float

class MonthlyTrendResponse(BaseModel):
    month: str
    enquiries: int
    conversions: int
    high_intent_leads: int
