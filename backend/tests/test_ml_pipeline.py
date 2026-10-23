import pytest
import os
import pandas as pd
from app.ml.config import (
    MODEL_PATH,
    METADATA_PATH,
    TARGET_COLUMN,
    EXCLUDED_LEAKAGE_COLUMNS,
    ALL_FEATURE_COLUMNS
)
from app.ml.dataset_generator import generate_synthetic_admissions_dataset
from app.ml.model_registry import ModelRegistry

def test_synthetic_dataset_integrity():
    """Verifies synthetic dataset creation, reproducibility, and absence of target leakage."""
    df = generate_synthetic_admissions_dataset(n_samples=300, random_state=42, save_to_disk=False)
    
    assert len(df) == 300
    assert TARGET_COLUMN in df.columns
    assert "is_synthetic" in df.columns
    assert (df["is_synthetic"] == True).all()

    # Target leakage verification
    for col in EXCLUDED_LEAKAGE_COLUMNS:
        assert col not in ALL_FEATURE_COLUMNS, f"Security Failure: Leakage column '{col}' found in feature list!"
        assert col not in df.columns or col in ["created_at", "updated_at"], f"Unexpected post-decision column '{col}'"

def test_model_artifact_loading():
    """Verifies that the joblib pipeline and metadata exist and load smoothly."""
    pipeline = ModelRegistry.get_pipeline()
    assert pipeline is not None
    assert hasattr(pipeline, "predict_proba")

    metadata = ModelRegistry.get_metadata()
    assert metadata["is_synthetic_benchmark"] is True
    assert "champion_metrics" in metadata
    assert "baseline_metrics" in metadata
    assert "confusion_matrix" in metadata["champion_metrics"]
    assert "calibration_curve" in metadata["champion_metrics"]

def test_ml_predict_endpoint_high_intent(client, admin_token):
    """Tests ML inference API on a high-intent merit candidate with campus visit."""
    payload = {
        "percentage_score": 94.5,
        "maths_physics_score": 96.0,
        "entrance_percentile": 95.0,
        "engagement_score": 92,
        "program": "B.Tech Artificial Intelligence & Data Science",
        "lead_source": "Alumni Referral",
        "city": "Coimbatore",
        "qualifying_exam": "12th Standard / HSC",
        "category": "General",
        "budget_range": "₹1.5L - ₹2.5L / year",
        "campus_visit_attended": True,
        "parent_accompanied": True,
        "brochure_downloaded": True,
        "hostel_required": True,
        "bus_transport_required": False
    }

    response = client.post(
        "/api/v1/ml/predict",
        headers={"Authorization": f"Bearer {admin_token}"},
        json=payload
    )
    assert response.status_code == 200
    data = response.json()
    
    assert data["is_synthetic_benchmark"] is True
    assert 0.0 <= data["score"] <= 1.0
    assert 0 <= data["probability_percentage"] <= 100
    assert data["probability_percentage"] >= 75  # High-intent lead
    assert data["priority"] in ["Urgent", "High"]
    assert len(data["top_drivers"]) > 0
    assert "disclaimer" in data

def test_ml_predict_endpoint_low_intent(client, counsellor_a_token):
    """Tests ML inference API on a passive social media lead with borderline marks."""
    payload = {
        "percentage_score": 58.0,
        "maths_physics_score": 52.0,
        "entrance_percentile": 45.0,
        "engagement_score": 25,
        "program": "B.Tech Mechanical Engineering",
        "lead_source": "Social Media (Instagram/LinkedIn)",
        "city": "Salem",
        "qualifying_exam": "12th Standard / HSC",
        "category": "General",
        "budget_range": "Under ₹1.5L / year",
        "campus_visit_attended": False,
        "parent_accompanied": False,
        "brochure_downloaded": False,
        "hostel_required": False,
        "bus_transport_required": False
    }

    response = client.post(
        "/api/v1/ml/predict",
        headers={"Authorization": f"Bearer {counsellor_a_token}"},
        json=payload
    )
    assert response.status_code == 200
    data = response.json()
    assert data["probability_percentage"] < 60
    assert data["priority"] in ["Medium", "Low"]

def test_ml_metrics_endpoint(client, admin_token):
    """Tests model evaluation report endpoint."""
    response = client.get(
        "/api/v1/ml/metrics",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["is_synthetic_benchmark"] is True
    assert data["champion_algorithm"] == "Random Forest Classifier"
    assert data["baseline_algorithm"] == "Logistic Regression"
    assert "confusion_matrix" in data["champion_metrics"]
    assert "calibration_curve" in data["champion_metrics"]
    assert data["champion_metrics"]["roc_auc"] > 0.65

def test_ml_features_and_governance_endpoint(client, admin_token):
    """Tests feature taxonomy and anti-retraining safety governance endpoint."""
    response = client.get(
        "/api/v1/ml/features",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "features_available_at_prediction_time" in data
    assert "strictly_excluded_leakage_attributes" in data
    assert "governance_rule" in data
    assert "Never automatically retrain" in data["governance_rule"]
