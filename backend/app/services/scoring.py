"""Glue between the database and the ML model."""
from __future__ import annotations

from typing import Any

import pandas as pd
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.ml.features import FEATURE_COLUMNS, TARGET
from app.ml.model import predict_many
from app.ml.synthetic import generate_synthetic
from app.models import Enquiry

MIN_REAL_ROWS = 100  # labelled enquiries needed before real data is used for training
MIN_PER_CLASS = 15


def enquiry_to_features(e: Enquiry) -> dict[str, Any]:
    return {
        "course_interest": e.course_interest,
        "source": e.source,
        "fee_affordability": e.fee_affordability,
        "previous_score": e.previous_score,
        "followup_count": e.followup_count,
        "response_time_hours": e.response_time_hours,
        "campus_visited": e.campus_visited,
        "scholarship_requested": e.scholarship_requested,
    }


def rescore(enquiries: list[Enquiry]) -> None:
    """Update conversion_probability on the given enquiries (caller commits)."""
    probs = predict_many([enquiry_to_features(e) for e in enquiries])
    for e, p in zip(enquiries, probs):
        e.conversion_probability = p


def rescore_all(db: Session) -> int:
    rows = list(db.scalars(select(Enquiry)))
    rescore(rows)
    db.commit()
    return len(rows)


def build_training_frame(db: Session) -> tuple[pd.DataFrame, str]:
    """Use real admitted/lost enquiries when there are enough; otherwise use synthetic data."""
    closed = list(db.scalars(select(Enquiry).where(Enquiry.status.in_(["admitted", "lost"]))))
    labels = [1 if e.status == "admitted" else 0 for e in closed]
    positives = sum(labels)
    if len(closed) >= MIN_REAL_ROWS and min(positives, len(closed) - positives) >= MIN_PER_CLASS:
        df = pd.DataFrame([enquiry_to_features(e) for e in closed])
        df[TARGET] = labels
        return df[FEATURE_COLUMNS + [TARGET]], "database"
    return generate_synthetic(), "synthetic"
