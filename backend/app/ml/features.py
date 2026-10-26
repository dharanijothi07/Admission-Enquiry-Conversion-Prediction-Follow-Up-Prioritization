"""Which columns the model uses. Keep this file in sync with the Enquiry database model."""
CATEGORICAL = ["course_interest", "source", "fee_affordability"]
NUMERIC = [
    "previous_score",
    "followup_count",
    "response_time_hours",
    "campus_visited",
    "scholarship_requested",
]
FEATURE_COLUMNS = CATEGORICAL + NUMERIC
TARGET = "converted"

# Used when an enquiry has no academic score recorded.
DEFAULT_SCORE = 65.0

NUMERIC_LABELS = {
    "previous_score": "Academic score",
    "followup_count": "Number of follow-ups",
    "response_time_hours": "Time taken to reply",
    "campus_visited": "Campus visit",
    "scholarship_requested": "Scholarship request",
}
CATEGORICAL_LABELS = {
    "course_interest": "Course",
    "source": "Enquiry source",
    "fee_affordability": "Fee affordability",
}
