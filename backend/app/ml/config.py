import os

# --------------------------------------------------------------------------
# Machine Learning Pipeline Configuration & Feature Dictionary
# --------------------------------------------------------------------------

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ARTIFACTS_DIR = os.path.join(BASE_DIR, "artifacts")
DATA_DIR = os.path.join(BASE_DIR, "data")

os.makedirs(ARTIFACTS_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)

MODEL_VERSION = "v1.0.0"
MODEL_FILENAME = f"admission_model_{MODEL_VERSION}.joblib"
METADATA_FILENAME = f"admission_model_{MODEL_VERSION}_metadata.json"
DATASET_FILENAME = "synthetic_admissions_dataset.csv"

MODEL_PATH = os.path.join(ARTIFACTS_DIR, MODEL_FILENAME)
METADATA_PATH = os.path.join(ARTIFACTS_DIR, METADATA_FILENAME)
DATASET_PATH = os.path.join(DATA_DIR, DATASET_FILENAME)

# Target Definition
TARGET_COLUMN = "converted_in_window"
TIME_WINDOW_DAYS = 45
TIME_WINDOW_DESCRIPTION = (
    "Binary conversion target: 1 = Candidate completed seat enrollment and paid "
    "admission fee within 45 days of initial enquiry; 0 = Did not enroll / dropped out."
)

# Academic Integrity Disclaimer
ACADEMIC_INTEGRITY_DISCLAIMER = (
    "ACADEMIC RESEARCH PROTOTYPE: Evaluated on reproducible synthetic data for "
    "college final-year project demonstration. Results do NOT represent live operational "
    "college performance or audited institutional metrics."
)

# Feature Taxonomy & Availability at Prediction Time
NUMERICAL_FEATURES = [
    "percentage_score",        # 12th / Qualifying Board Marks (35.0 - 100.0)
    "maths_physics_score",    # PCM / Relevant Subject Cutoff (0.0 - 100.0)
    "entrance_percentile",    # Entrance Exam Percentile (0.0 - 100.0)
    "engagement_score"        # Telemetry Engagement (0 - 100)
]

CATEGORICAL_FEATURES = [
    "program",                # Degree program applied
    "lead_source",            # Marketing / Attribution channel
    "city",                   # Candidate hometown
    "qualifying_exam",        # HSC / Diploma / UG
    "category",               # Reservation quota / category
    "budget_range"            # Annual tuition affordability tier
]

BINARY_FEATURES = [
    "campus_visit_attended",  # Walk-in visit attended (0 or 1)
    "parent_accompanied",     # Parent accompanied candidate (0 or 1)
    "brochure_downloaded",    # Curriculum brochure downloaded (0 or 1)
    "hostel_required",        # Campus accommodation needed (0 or 1)
    "bus_transport_required"  # College bus transit required (0 or 1)
]

ALL_FEATURE_COLUMNS = NUMERICAL_FEATURES + CATEGORICAL_FEATURES + BINARY_FEATURES

# ANTI-TARGET LEAKAGE CHECKLIST:
# These fields MUST be strictly excluded from model training and prediction inputs!
EXCLUDED_LEAKAGE_COLUMNS = [
    # Direct Identifiers (PII)
    "student_name",
    "email",
    "phone",
    "application_no",
    "student_id",
    # Post-Decision Attributes (Target Leakage)
    "fee_paid",
    "scholarship_awarded",
    "enrollment_no",
    "admission_date",
    "final_status",
    "receipt_no",
    "created_at",
    "updated_at"
]
