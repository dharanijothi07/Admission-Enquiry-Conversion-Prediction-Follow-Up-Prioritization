"""Follow-up prioritization: decides who the counsellor should contact first.

priority_score (0-100) = 100 * (0.60 * conversion_probability
                              + 0.25 * overdue
                              + 0.15 * freshness)

  conversion_probability  from the ML model (0-1)
  overdue                 days since last contact / 10, capped at 1 (a follow-up date that has
                          passed counts as fully overdue)
  freshness               exp(-days since enquiry / 30): newer enquiries are warmer

Labels: High >= 60, Medium >= 40, Low below that. Closed enquiries (admitted/lost) get 'Closed'.
"""
from __future__ import annotations

import math
from datetime import date
from typing import Any

from app.constants import CLOSED_STATUSES

HIGH_THRESHOLD = 60.0
MEDIUM_THRESHOLD = 40.0
DEFAULT_PROBABILITY = 0.3  # used until the model has scored an enquiry


def compute_priority(e: Any, today: date | None = None) -> tuple[float, str]:
    if e.status in CLOSED_STATUSES:
        return 0.0, "Closed"
    today = today or date.today()
    prob = e.conversion_probability if e.conversion_probability is not None else DEFAULT_PROBABILITY

    last_touch = e.last_contact_date or e.enquiry_date
    days_idle = max((today - last_touch).days, 0)
    overdue = min(days_idle / 10.0, 1.0)
    if e.next_followup_date is not None and e.next_followup_date <= today:
        overdue = 1.0

    days_old = max((today - e.enquiry_date).days, 0)
    freshness = math.exp(-days_old / 30.0)

    score = round(100.0 * (0.60 * prob + 0.25 * overdue + 0.15 * freshness), 1)
    label = "High" if score >= HIGH_THRESHOLD else "Medium" if score >= MEDIUM_THRESHOLD else "Low"
    return score, label


def recommend_action(e: Any, today: date | None = None) -> str:
    """A short plain-English next step for the counsellor."""
    if e.status == "admitted":
        return "Admitted. Complete onboarding."
    if e.status == "lost":
        return "Closed as lost."
    today = today or date.today()
    prob = e.conversion_probability if e.conversion_probability is not None else DEFAULT_PROBABILITY
    if e.next_followup_date is not None and e.next_followup_date <= today:
        return "Follow-up is due. Contact today."
    if e.status == "applied":
        return "Help complete the application and fee payment."
    if not e.campus_visited and prob >= 0.4:
        return "Invite for a campus visit."
    if e.fee_affordability == "low" or e.scholarship_requested:
        return "Share fee structure and scholarship options."
    if prob >= 0.6:
        return "Call now. Strong intent."
    last_touch = e.last_contact_date or e.enquiry_date
    if (today - last_touch).days >= 7:
        return "No contact for a week. Send a check-in message."
    return "Keep nurturing with course updates."
