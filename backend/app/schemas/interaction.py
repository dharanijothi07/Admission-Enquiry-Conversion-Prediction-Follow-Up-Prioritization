from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class InteractionCreate(BaseModel):
    enquiry_id: str
    type: str  # 'Call' | 'WhatsApp' | 'Email' | 'Campus Visit' | 'System Note'
    notes: str
    outcome: Optional[str] = None

class InteractionResponse(BaseModel):
    id: str
    enquiry_id: str
    counsellor_id: Optional[str] = None
    counsellor_name: Optional[str] = None
    type: str
    notes: str
    outcome: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
