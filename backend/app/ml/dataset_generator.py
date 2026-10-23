import os
import random
import numpy as np
import pandas as pd
from typing import Tuple
from .config import (
    DATASET_PATH,
    TARGET_COLUMN,
    ALL_FEATURE_COLUMNS,
    NUMERICAL_FEATURES,
    CATEGORICAL_FEATURES,
    BINARY_FEATURES
)

PROGRAMS = [
    "B.Tech Artificial Intelligence & Data Science",
    "B.Tech Computer Science & Engineering",
    "B.Tech Information Technology",
    "B.Tech Electronics & Communication",
    "B.Tech Mechanical Engineering",
    "B.Sc Data Science & AI",
    "MCA - Cloud Computing",
    "MBA - Technology Management"
]

LEAD_SOURCES = [
    "Website Form",
    "Walk-in / Campus Visit",
    "Alumni Referral",
    "Education Fair / Expo",
    "Google Search Ads",
    "Social Media (Instagram/LinkedIn)",
    "School Outreach Program"
]

CITIES = [
    "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem",
    "Vellore", "Erode", "Tirunelveli", "Kochi", "Bengaluru"
]

CATEGORIES = ["General", "OBC", "SC/ST", "Management Quota"]
BUDGET_RANGES = [
    "Under ₹1.5L / year",
    "₹1.5L - ₹2.5L / year",
    "Above ₹2.5L / year",
    "Seeking Scholarship"
]

QUALIFYING_EXAMS = [
    "12th Standard / HSC",
    "Diploma",
    "Undergraduate Degree"
]

def generate_synthetic_admissions_dataset(
    n_samples: int = 6000,
    random_state: int = 42,
    save_to_disk: bool = True
) -> pd.DataFrame:
    """
    Generates a reproducible, fictional synthetic dataset for admission enquiry conversion modeling.
    
    LABELING & INTEGRITY:
    - 'is_synthetic' is set to True on every record.
    - Features represent only telemetry available at enquiry/qualification time.
    - Explicitly excludes direct personal identifiers and post-decision enrollment metadata.
    """
    np.random.seed(random_state)
    random.seed(random_state)

    # 1. Temporal Admission Cycles (for Cycle/Time-based validation)
    # 2024: 2,000 | 2025: 2,000 | 2026: 2,000
    cycles = ["2024"] * (n_samples // 3) + ["2025"] * (n_samples // 3) + ["2026"] * (n_samples - 2 * (n_samples // 3))
    random.shuffle(cycles)

    records = []

    for i in range(n_samples):
        cycle = cycles[i]
        
        # Demographics & Program
        program = random.choice(PROGRAMS)
        lead_source = random.choice(LEAD_SOURCES)
        city = random.choice(CITIES)
        category = random.choice(CATEGORIES)
        budget = random.choice(BUDGET_RANGES)
        
        exam = "Undergraduate Degree" if ("MCA" in program or "MBA" in program) else "12th Standard / HSC"

        # Academic Credentials (Latent distribution)
        # Board marks mean 78.5%, std 10.5%
        pct_score = float(np.clip(np.random.normal(78.5, 10.5), 45.0, 99.5))
        mp_score = float(np.clip(pct_score + np.random.normal(1.5, 4.0), 40.0, 100.0))
        entrance_pctl = float(np.clip(pct_score + np.random.normal(-2.0, 7.0), 30.0, 99.8))

        # Engagement & Campus telemetry
        brochure = bool(random.random() < 0.65)
        campus_visit = bool(random.random() < 0.38)
        parent_accompanied = bool(campus_visit and (random.random() < 0.72))
        hostel = bool(city != "Chennai" and (random.random() < 0.70))
        bus_transit = bool(city == "Chennai" and (random.random() < 0.60))
        
        # Digital Engagement Score (0 - 100)
        base_eng = 45 + (15 if brochure else 0) + (25 if campus_visit else 0) + np.random.normal(0, 10)
        engagement = int(np.clip(base_eng, 10, 100))

        # -------------------------------------------------------------
        # LATENT CONVERSION UTILITY FUNCTION: z = beta * X + epsilon
        # Realistic empirical coefficients matching admission cell physics
        # -------------------------------------------------------------
        z = -1.80  # Baseline intercept (~25% prior conversion rate)
        
        # Academic cutoff contribution
        if pct_score >= 90.0:
            z += 1.15
        elif pct_score >= 80.0:
            z += 0.65
        elif pct_score < 60.0:
            z -= 0.85

        # Campus walk-in with parents (strongest single closing factor)
        if campus_visit and parent_accompanied:
            z += 1.40
        elif campus_visit:
            z += 0.75
        else:
            z -= 0.40

        # Channel attribution weights
        if lead_source == "Alumni Referral":
            z += 1.10
        elif lead_source == "Walk-in / Campus Visit":
            z += 0.85
        elif "Social Media" in lead_source:
            z -= 0.45
        elif lead_source == "Website Form":
            z += 0.15

        # Engagement telemetry contribution
        if engagement >= 80:
            z += 0.60
        elif engagement < 40:
            z -= 0.50

        # Program demand factor
        if "Artificial Intelligence" in program or "Computer Science" in program:
            z += 0.35

        # Affordability match
        if budget == "Under ₹1.5L / year":
            z -= 0.40
        elif budget == "Seeking Scholarship" and pct_score >= 90:
            z += 0.50

        # Gaussian stochastic error (simulates unobserved human decision variance)
        z += float(np.random.normal(0, 0.45))

        # Sigmoid probability
        prob = 1.0 / (1.0 + np.exp(-z))
        converted = 1 if (np.random.random() < prob) else 0

        record = {
            "enquiry_id": f"SYNTH-ENQ-{str(i+1).zfill(5)}",
            "admission_cycle": cycle,
            "is_synthetic": True,
            "program": program,
            "lead_source": lead_source,
            "city": city,
            "qualifying_exam": exam,
            "percentage_score": round(pct_score, 1),
            "maths_physics_score": round(mp_score, 1),
            "entrance_percentile": round(entrance_pctl, 1),
            "category": category,
            "budget_range": budget,
            "campus_visit_attended": int(campus_visit),
            "parent_accompanied": int(parent_accompanied),
            "brochure_downloaded": int(brochure),
            "hostel_required": int(hostel),
            "bus_transport_required": int(bus_transit),
            "engagement_score": engagement,
            TARGET_COLUMN: converted
        }
        records.append(record)

    df = pd.DataFrame(records)

    if save_to_disk:
        df.to_csv(DATASET_PATH, index=False)
        print(f"Synthetic dataset saved to: {DATASET_PATH} (Shape: {df.shape})")

    return df

if __name__ == "__main__":
    generate_synthetic_admissions_dataset()
