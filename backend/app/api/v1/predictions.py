from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ...core.database import get_db
from ...models.prediction import Prediction
from ...models.user import User
from ...schemas.prediction import PredictionResponse
from ...services.prediction_engine import calculate_conversion_prediction
from ..deps import get_current_user, verify_enquiry_access

router = APIRouter(prefix="/predictions", tags=["ML Prediction History"])

@router.get("/enquiry/{enquiry_id}", response_model=List[PredictionResponse])
def get_prediction_history(
    enquiry_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves chronological score history and feature weights for an enquiry."""
    enquiry = verify_enquiry_access(enquiry_id, current_user, db)
    return [PredictionResponse.model_validate(p) for p in enquiry.predictions]

@router.post("/enquiry/{enquiry_id}/recalculate", response_model=PredictionResponse)
def recalculate_enquiry_score(
    enquiry_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Triggers on-demand TreeSHAP recalculation for a lead."""
    enquiry = verify_enquiry_access(enquiry_id, current_user, db)
    pred_data = calculate_conversion_prediction(enquiry, enquiry.student)
    
    new_prediction = Prediction(
        enquiry_id=enquiry.id,
        score=pred_data["score"],
        probability_percentage=pred_data["probability_percentage"],
        priority=pred_data["priority"],
        confidence_score=pred_data["confidence_score"],
        model_version=pred_data["model_version"],
        recommended_action=pred_data["recommended_action"],
        top_drivers=pred_data["top_drivers"],
        risk_factors=pred_data["risk_factors"]
    )
    db.add(new_prediction)
    db.commit()
    db.refresh(new_prediction)
    return PredictionResponse.model_validate(new_prediction)
