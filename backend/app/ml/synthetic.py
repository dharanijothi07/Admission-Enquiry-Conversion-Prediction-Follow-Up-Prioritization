"""Synthetic (made-up) training data.

There is no real admissions history when you first start, so this module creates realistic-looking
data using simple rules: students who visit the campus, reply quickly, come via referrals and can
afford the fees convert more often. Replace it with real data by using the "Retrain" button once
you have at least 100 enquiries marked 'admitted' or 'lost'.
"""
import numpy as np
import pandas as pd

from app.constants import COURSES, FEE_LEVELS, SOURCES
from app.ml.features import FEATURE_COLUMNS, TARGET

SOURCE_EFFECT = {
    "referral": 0.9,
    "walk_in": 0.6,
    "education_fair": 0.1,
    "phone_call": 0.0,
    "website": -0.2,
    "social_media": -0.5,
}
FEE_EFFECT = {"low": -0.9, "medium": 0.0, "high": 0.6}


def _sigmoid(x: np.ndarray) -> np.ndarray:
    return 1.0 / (1.0 + np.exp(-x))


def generate_synthetic(n: int = 3000, seed: int = 42) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    course_effect = {c: float(rng.normal(0, 0.25)) for c in COURSES}

    df = pd.DataFrame(
        {
            "course_interest": rng.choice(COURSES, n),
            "source": rng.choice(SOURCES, n, p=[0.25, 0.15, 0.15, 0.25, 0.1, 0.1]),
            "fee_affordability": rng.choice(FEE_LEVELS, n, p=[0.25, 0.5, 0.25]),
            "previous_score": np.clip(rng.normal(68, 13, n), 35, 99).round(1),
            "followup_count": rng.poisson(2.5, n).clip(0, 12),
            "response_time_hours": np.clip(rng.lognormal(2.6, 0.9, n), 0.5, 240).round(1),
            "campus_visited": rng.random(n) < 0.35,
            "scholarship_requested": rng.random(n) < 0.3,
        }
    )

    logit = (
        -1.7
        + df["source"].map(SOURCE_EFFECT)
        + df["fee_affordability"].map(FEE_EFFECT)
        + df["course_interest"].map(course_effect)
        + 1.1 * df["campus_visited"].astype(float)
        + 0.03 * (df["previous_score"] - 65)
        + 0.28 * df["followup_count"].clip(upper=6)
        - 0.012 * df["response_time_hours"].clip(upper=96)
        - 0.2 * df["scholarship_requested"].astype(float)
        + rng.normal(0, 0.6, n)
    )
    df[TARGET] = (rng.random(n) < _sigmoid(logit.to_numpy())).astype(int)
    df["campus_visited"] = df["campus_visited"].astype(int)
    df["scholarship_requested"] = df["scholarship_requested"].astype(int)
    return df[FEATURE_COLUMNS + [TARGET]]
