import os
import json
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple

from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    average_precision_score,
    brier_score_loss,
    confusion_matrix
)
from sklearn.calibration import calibration_curve
from sklearn.model_selection import StratifiedKFold, cross_val_score

from .config import (
    MODEL_PATH,
    METADATA_PATH,
    MODEL_VERSION,
    TARGET_COLUMN,
    NUMERICAL_FEATURES,
    CATEGORICAL_FEATURES,
    BINARY_FEATURES,
    ALL_FEATURE_COLUMNS,
    EXCLUDED_LEAKAGE_COLUMNS,
    TIME_WINDOW_DAYS,
    TIME_WINDOW_DESCRIPTION,
    ACADEMIC_INTEGRITY_DISCLAIMER
)
from .dataset_generator import generate_synthetic_admissions_dataset

def build_preprocessing_pipeline() -> ColumnTransformer:
    """Creates a leak-free ColumnTransformer for numerical, categorical, and binary features."""
    num_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler())
    ])

    cat_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="constant", fill_value="Unknown")),
        ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False))
    ])

    bin_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent"))
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", num_pipeline, NUMERICAL_FEATURES),
            ("cat", cat_pipeline, CATEGORICAL_FEATURES),
            ("bin", bin_pipeline, BINARY_FEATURES)
        ],
        remainder="drop"
    )
    return preprocessor

def evaluate_classifier(
    pipeline: Pipeline,
    X_train: pd.DataFrame,
    y_train: pd.Series,
    X_test: pd.DataFrame,
    y_test: pd.Series,
    name: str
) -> Dict[str, Any]:
    """Fits and evaluates a classification pipeline, reporting calibration and metrics."""
    pipeline.fit(X_train, y_train)
    y_pred = pipeline.predict(X_test)
    y_prob = pipeline.predict_proba(X_test)[:, 1]

    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred, zero_division=0))
    rec = float(recall_score(y_test, y_pred, zero_division=0))
    f1 = float(f1_score(y_test, y_pred, zero_division=0))
    roc_auc = float(roc_auc_score(y_test, y_prob))
    pr_auc = float(average_precision_score(y_test, y_prob))
    brier = float(brier_score_loss(y_test, y_prob))

    cm = confusion_matrix(y_test, y_pred)
    tn, fp, fn, tp = [int(v) for v in cm.ravel()]

    prob_true, prob_pred = calibration_curve(y_test, y_prob, n_bins=5, strategy="uniform")
    cal_points = [
        {"bin": f"Bin {idx+1}", "predictedProb": round(float(p_pred), 3), "trueFraction": round(float(p_true), 3)}
        for idx, (p_true, p_pred) in enumerate(zip(prob_true, prob_pred))
    ]

    return {
        "model_name": name,
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1_score": round(f1, 4),
        "roc_auc": round(roc_auc, 4),
        "pr_auc": round(pr_auc, 4),
        "brier_score": round(brier, 4),
        "confusion_matrix": {
            "true_positive": tp,
            "false_positive": fp,
            "false_negative": fn,
            "true_negative": tn
        },
        "calibration_curve": cal_points
    }

def train_and_version_model(
    df: pd.DataFrame = None,
    save_artifacts: bool = True
) -> Dict[str, Any]:
    """
    Executes full ML training pipeline:
    1. Validates no target leakage columns are included in feature matrix.
    2. Splits data temporally across admission cycles (Train: 2024-2025, Test: 2026).
    3. Trains Baseline Logistic Regression & Champion Random Forest.
    4. Evaluates precision, recall, F1, ROC-AUC, calibration error.
    5. Saves unified preprocessing + model artifact with versioned metadata.
    """
    if df is None:
        df = generate_synthetic_admissions_dataset(n_samples=6000, random_state=42)

    # 1. Anti-Target Leakage Check
    for col in EXCLUDED_LEAKAGE_COLUMNS:
        assert col not in ALL_FEATURE_COLUMNS, f"LEAKAGE DETECTED: Column '{col}' is in feature columns!"

    X = df[ALL_FEATURE_COLUMNS]
    y = df[TARGET_COLUMN]

    # 2. Temporal Cycle-based Split (2024-2025 Historical Cohorts vs 2026 Out-of-Time Test)
    if "admission_cycle" in df.columns:
        train_mask = df["admission_cycle"].isin(["2024", "2025"])
        test_mask = df["admission_cycle"] == "2026"
        X_train, y_train = X[train_mask], y[train_mask]
        X_test, y_test = X[test_mask], y[test_mask]
        split_description = "Temporal Cycle Holdout (Train: 2024-2025 Cycles, Test: 2026 Cycle)"
    else:
        from sklearn.model_selection import train_test_split
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.25, random_state=42, stratify=y
        )
        split_description = "Stratified Train/Test (75% / 25%)"

    print(f"Training set: {X_train.shape[0]} samples, Test set: {X_test.shape[0]} samples")

    # 3. Model 1: Baseline Logistic Regression Pipeline
    preprocessor_lr = build_preprocessing_pipeline()
    lr_classifier = LogisticRegression(
        class_weight="balanced",
        max_iter=1000,
        random_state=42
    )
    pipeline_lr = Pipeline([
        ("preprocessor", preprocessor_lr),
        ("classifier", lr_classifier)
    ])
    metrics_lr = evaluate_classifier(pipeline_lr, X_train, y_train, X_test, y_test, "Logistic Regression (Baseline)")

    # 4. Model 2: Champion Random Forest Classifier Pipeline
    preprocessor_rf = build_preprocessing_pipeline()
    rf_classifier = RandomForestClassifier(
        n_estimators=150,
        max_depth=8,
        min_samples_split=5,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1
    )
    pipeline_rf = Pipeline([
        ("preprocessor", preprocessor_rf),
        ("classifier", rf_classifier)
    ])
    metrics_rf = evaluate_classifier(pipeline_rf, X_train, y_train, X_test, y_test, "Random Forest Classifier (Champion)")

    # 5. Extract Feature Importances from Champion
    # Extract feature names after One-Hot Encoding
    preprocessor_rf_fitted = pipeline_rf.named_steps["preprocessor"]
    cat_encoder = preprocessor_rf_fitted.named_transformers_["cat"].named_steps["onehot"]
    cat_names = cat_encoder.get_feature_names_out(CATEGORICAL_FEATURES).tolist()
    all_feature_names_transformed = NUMERICAL_FEATURES + cat_names + BINARY_FEATURES

    rf_importances = pipeline_rf.named_steps["classifier"].feature_importances_
    
    # Aggregate importances back to raw input features for transparency
    feature_importance_summary = []
    for raw_feat in ALL_FEATURE_COLUMNS:
        # Sum all transformed column importances belonging to this raw feature
        matching_indices = [idx for idx, name in enumerate(all_feature_names_transformed) if name.startswith(raw_feat)]
        if matching_indices:
            imp_val = float(np.sum(rf_importances[matching_indices]))
        else:
            imp_val = 0.0
        feature_importance_summary.append({
            "feature": raw_feat,
            "importance": round(imp_val, 4)
        })

    feature_importance_summary.sort(key=lambda x: x["importance"], reverse=True)

    # 6. Champion Model Packaging & Versioning
    champion_pipeline = pipeline_rf
    champion_metrics = metrics_rf

    metadata = {
        "is_synthetic_benchmark": True,
        "disclaimer": ACADEMIC_INTEGRITY_DISCLAIMER,
        "model_version": MODEL_VERSION,
        "champion_algorithm": "Random Forest Classifier",
        "baseline_algorithm": "Logistic Regression",
        "target_definition": TARGET_COLUMN,
        "time_window_days": TIME_WINDOW_DAYS,
        "time_window_description": TIME_WINDOW_DESCRIPTION,
        "evaluation_strategy": split_description,
        "dataset_split": {
            "total_records": len(df),
            "train_records": len(X_train),
            "test_records": len(X_test)
        },
        "champion_metrics": champion_metrics,
        "baseline_metrics": metrics_lr,
        "feature_importances": feature_importance_summary[:8],
        "all_input_features": ALL_FEATURE_COLUMNS,
        "safety_governance": {
            "auto_retraining_allowed": False,
            "policy": "Never automatically retrain on live or unverified records without supervisor verification."
        }
    }

    if save_artifacts:
        joblib.dump(champion_pipeline, MODEL_PATH)
        with open(METADATA_PATH, "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=2)
        print(f"Model saved to: {MODEL_PATH}")
        print(f"Metadata saved to: {METADATA_PATH}")

    return {
        "pipeline": champion_pipeline,
        "metadata": metadata
    }

if __name__ == "__main__":
    train_and_version_model()
