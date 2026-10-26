"""Train, save, load and use the admission conversion model (scikit-learn)."""
from __future__ import annotations

import json
import threading
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score, roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from app.config import get_settings
from app.ml.features import (
    CATEGORICAL,
    CATEGORICAL_LABELS,
    DEFAULT_SCORE,
    FEATURE_COLUMNS,
    NUMERIC,
    NUMERIC_LABELS,
    TARGET,
)
from app.ml.synthetic import generate_synthetic

_lock = threading.Lock()
_pipeline: Pipeline | None = None
_meta: dict[str, Any] | None = None


def _paths() -> tuple[Path, Path]:
    model_dir = Path(get_settings().model_dir)
    return model_dir / "model.joblib", model_dir / "model_meta.json"


def build_pipeline() -> Pipeline:
    prep = ColumnTransformer(
        [
            ("cat", OneHotEncoder(handle_unknown="ignore"), CATEGORICAL),
            ("num", StandardScaler(), NUMERIC),
        ],
        sparse_threshold=0.0,  # always return a dense array
    )
    return Pipeline([("prep", prep), ("clf", LogisticRegression(max_iter=1000))])


def rows_to_frame(rows: list[dict[str, Any]]) -> pd.DataFrame:
    """Turn a list of feature dicts into a clean DataFrame the pipeline can read."""
    df = pd.DataFrame(rows).reindex(columns=FEATURE_COLUMNS)
    df["previous_score"] = pd.to_numeric(df["previous_score"], errors="coerce").fillna(DEFAULT_SCORE)
    for col in ("followup_count", "response_time_hours"):
        df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)
    for col in ("campus_visited", "scholarship_requested"):
        df[col] = df[col].fillna(False).astype(int)
    return df


def train_and_save(df: pd.DataFrame, data_source: str) -> dict[str, Any]:
    """Fit the model on `df` (feature columns + 'converted'), save it and return metadata."""
    global _pipeline, _meta
    X = rows_to_frame(df[FEATURE_COLUMNS].to_dict("records"))
    y = df[TARGET].astype(int).to_numpy()

    X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    check = build_pipeline().fit(X_tr, y_tr)
    proba = check.predict_proba(X_te)[:, 1]
    pred = (proba >= 0.5).astype(int)
    metrics = {
        "accuracy": round(float(accuracy_score(y_te, pred)), 4),
        "precision": round(float(precision_score(y_te, pred, zero_division=0)), 4),
        "recall": round(float(recall_score(y_te, pred, zero_division=0)), 4),
        "roc_auc": round(float(roc_auc_score(y_te, proba)), 4),
    }

    final = build_pipeline().fit(X, y)  # refit on all rows for the saved model
    meta = {
        "algorithm": "LogisticRegression",
        "data_source": data_source,
        "n_samples": int(len(df)),
        "conversion_rate_in_training_data": round(float(y.mean()), 4),
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "metrics": metrics,
    }

    model_path, meta_path = _paths()
    model_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(final, model_path)
    meta_path.write_text(json.dumps(meta, indent=2))
    with _lock:
        _pipeline, _meta = final, meta
    return meta


def get_model() -> Pipeline:
    """Return the loaded model, loading it from disk or training a starter model if needed."""
    global _pipeline, _meta
    if _pipeline is not None:
        return _pipeline
    model_path, meta_path = _paths()
    with _lock:
        if _pipeline is not None:
            return _pipeline
        if model_path.exists() and meta_path.exists():
            _pipeline = joblib.load(model_path)
            _meta = json.loads(meta_path.read_text())
            return _pipeline
    train_and_save(generate_synthetic(), data_source="synthetic")
    assert _pipeline is not None
    return _pipeline


def get_meta() -> dict[str, Any]:
    get_model()
    return dict(_meta or {})


def predict_many(rows: list[dict[str, Any]]) -> list[float]:
    if not rows:
        return []
    proba = get_model().predict_proba(rows_to_frame(rows))[:, 1]
    return [round(float(p), 4) for p in proba]


def _readable(feature_name: str) -> str:
    kind, _, rest = feature_name.partition("__")
    if kind == "num":
        return NUMERIC_LABELS.get(rest, rest)
    for col, label in CATEGORICAL_LABELS.items():
        if rest.startswith(col + "_"):
            value = rest[len(col) + 1:].replace("_", " ")
            return f"{label}: {value}"
    return rest


def explain(row: dict[str, Any], top_n: int = 3) -> list[dict[str, Any]]:
    """Return the factors that pushed this enquiry's score up or down the most."""
    model = get_model()
    X = model.named_steps["prep"].transform(rows_to_frame([row]))[0]
    names = model.named_steps["prep"].get_feature_names_out()
    contrib = np.asarray(X) * model.named_steps["clf"].coef_[0]

    factors = [
        {"feature": _readable(str(n)), "impact": round(float(c), 3)}
        for n, c in zip(names, contrib)
        if abs(c) >= 0.05
    ]
    ups = sorted((f for f in factors if f["impact"] > 0), key=lambda f: -f["impact"])[:top_n]
    downs = sorted((f for f in factors if f["impact"] < 0), key=lambda f: f["impact"])[:top_n]
    return [dict(f, direction="up") for f in ups] + [dict(f, direction="down") for f in downs]
