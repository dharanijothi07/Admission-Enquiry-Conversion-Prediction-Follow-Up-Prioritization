from fastapi import APIRouter, Depends
from typing import Dict, Any
from ..deps import get_current_user
from ...models.user import User
from ...schemas.ml import MLPredictionRequest, MLPredictionResponse, MLMetricsResponse
from ...ml.model_registry import ModelRegistry
from ...ml.config import (
    TIME_WINDOW_DAYS,
    TIME_WINDOW_DESCRIPTION,
    ACADEMIC_INTEGRITY_DISCLAIMER,
    NUMERICAL_FEATURES,
    CATEGORICAL_FEATURES,
    BINARY_FEATURES,
    EXCLUDED_LEAKAGE_COLUMNS
)

router = APIRouter(prefix="/ml", tags=["Machine Learning Inference & Evaluation"])

@router.post("/predict", response_model=MLPredictionResponse)
def predict_candidate_conversion(
    request: MLPredictionRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Executes real-time inference using the versioned Random Forest Champion Pipeline.
    Evaluates conversion likelihood, priority tier, and explainable feature drivers.
    """
    features = request.model_dump()
    result = ModelRegistry.predict(features)
    return MLPredictionResponse(**result)

@router.get("/metrics", response_model=MLMetricsResponse)
def get_model_evaluation_metrics(
    current_user: User = Depends(get_current_user)
):
    """
    Retrieves reproducible evaluation report comparing Baseline Logistic Regression
    against Champion Random Forest on holdout test cohort.
    Includes Precision, Recall, F1, ROC-AUC, Brier score, and Confusion Matrix.
    """
    metadata = ModelRegistry.get_metadata()
    return MLMetricsResponse(**metadata)

@router.get("/features")
def get_feature_taxonomy(
    current_user: User = Depends(get_current_user)
):
    """
    Documents all features available at prediction time, target definition,
    and anti-leakage exclusion checklist.
    """
    return {
        "target_definition": {
            "name": "converted_in_window",
            "time_window_days": TIME_WINDOW_DAYS,
            "description": TIME_WINDOW_DESCRIPTION
        },
        "features_available_at_prediction_time": {
            "numerical": NUMERICAL_FEATURES,
            "categorical": CATEGORICAL_FEATURES,
            "binary_flags": BINARY_FEATURES
        },
        "strictly_excluded_leakage_attributes": EXCLUDED_LEAKAGE_COLUMNS,
        "disclaimer": ACADEMIC_INTEGRITY_DISCLAIMER,
        "governance_rule": "Never automatically retrain on live unverified outcomes."
    }
