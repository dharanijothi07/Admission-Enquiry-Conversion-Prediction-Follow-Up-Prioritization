from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import date
from ...core.database import get_db
from ...models.interaction import Interaction
from ...models.prediction import Prediction
from ...models.user import User
from ...schemas.interaction import InteractionCreate, InteractionResponse
from ...services.prediction_engine import calculate_conversion_prediction
from ..deps import get_current_user, verify_enquiry_access

router = APIRouter(prefix="/interactions", tags=["Counsellor Interaction Logs"])

@router.get("/enquiry/{enquiry_id}", response_model=List[InteractionResponse])
def get_enquiry_interactions(
    enquiry_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lists interaction logs for an enquiry. Verified by permission guard."""
    enquiry = verify_enquiry_access(enquiry_id, current_user, db)
    return [
        InteractionResponse(
            id=i.id,
            enquiry_id=i.enquiry_id,
            counsellor_id=i.counsellor_id,
            counsellor_name=i.counsellor.full_name if i.counsellor else "System",
            type=i.type,
            notes=i.notes,
            outcome=i.outcome,
            created_at=i.created_at
        )
        for i in enquiry.interactions
    ]

@router.post("", response_model=InteractionResponse, status_code=status.HTTP_201_CREATED)
def log_interaction(
    interaction_in: InteractionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Records a phone call, WhatsApp conversation, or campus tour.
    Increases candidate engagement score and refreshes ML conversion likelihood.
    """
    enquiry = verify_enquiry_access(interaction_in.enquiry_id, current_user, db)

    interaction = Interaction(
        enquiry_id=enquiry.id,
        counsellor_id=current_user.id,
        type=interaction_in.type,
        notes=interaction_in.notes,
        outcome=interaction_in.outcome
    )
    db.add(interaction)

    # Touch enquiry telemetry
    enquiry.last_contacted_date = date.today()
    enquiry.engagement_score = min(100, (enquiry.engagement_score or 50) + 6)
    
    # Recalculate ML prediction
    pred_data = calculate_conversion_prediction(enquiry, enquiry.student)
    prediction = Prediction(
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
    db.add(prediction)

    db.commit()
    db.refresh(interaction)

    return InteractionResponse(
        id=interaction.id,
        enquiry_id=interaction.enquiry_id,
        counsellor_id=interaction.counsellor_id,
        counsellor_name=current_user.full_name,
        type=interaction.type,
        notes=interaction.notes,
        outcome=interaction.outcome,
        created_at=interaction.created_at
    )
