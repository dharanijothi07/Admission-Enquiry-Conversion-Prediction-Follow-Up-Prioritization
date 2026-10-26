from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.ml.model import explain, get_meta, predict_many, train_and_save
from app.schemas import ModelInfo, PredictRequest, PredictResponse, RetrainResponse
from app.services.scoring import build_training_frame, rescore_all

router = APIRouter(tags=["machine learning"])


def _band(p: float) -> str:
    return "High" if p >= 0.6 else "Medium" if p >= 0.35 else "Low"


@router.post("/predict", response_model=PredictResponse)
def predict(payload: PredictRequest):
    """What-if prediction: nothing is saved."""
    row = payload.model_dump()
    probability = predict_many([row])[0]
    return PredictResponse(probability=probability, band=_band(probability), factors=explain(row))


@router.get("/ml/model-info", response_model=ModelInfo)
def model_info():
    return get_meta()


@router.post("/ml/retrain", response_model=RetrainResponse)
def retrain(db: Session = Depends(get_db)):
    """Retrain on real admitted/lost enquiries (if there are enough) and re-score everyone."""
    df, source = build_training_frame(db)
    meta = train_and_save(df, data_source=source)
    return RetrainResponse(model=meta, enquiries_rescored=rescore_all(db))
