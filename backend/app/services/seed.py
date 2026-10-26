"""Creates demo enquiries so the dashboard has something to show."""
from __future__ import annotations

import random
from datetime import date, timedelta

from sqlalchemy import delete
from sqlalchemy.orm import Session

from app.ml.synthetic import generate_synthetic
from app.models import Enquiry, FollowUp
from app.services.scoring import rescore

FIRST = ["Aarav", "Priya", "Rohan", "Ananya", "Karthik", "Meena", "Vikram", "Divya", "Arjun", "Sneha",
         "Rahul", "Kavya", "Suresh", "Lakshmi", "Imran", "Fatima", "Joseph", "Nisha", "Harini", "Dev"]
LAST = ["Kumar", "Sharma", "Iyer", "Reddy", "Nair", "Patel", "Singh", "Menon", "Das", "Rao",
        "Pillai", "Khan", "George", "Gupta", "Raman"]
CITIES = ["Chennai", "Coimbatore", "Madurai", "Bengaluru", "Hyderabad", "Kochi", "Trichy", "Salem"]


def seed_demo_data(db: Session, count: int = 90, reset: bool = False, seed: int = 7) -> int:
    if reset:
        db.execute(delete(FollowUp))
        db.execute(delete(Enquiry))
        db.commit()

    rng = random.Random(seed)
    today = date.today()
    frame = generate_synthetic(n=count, seed=seed)
    created: list[Enquiry] = []

    for i, row in enumerate(frame.to_dict("records")):
        name = f"{rng.choice(FIRST)} {rng.choice(LAST)}"
        age_days = rng.randint(1, 75)
        enquiry_date = today - timedelta(days=age_days)
        is_closed = age_days > 30 and rng.random() < 0.85  # older enquiries are mostly settled
        if is_closed:
            status = "admitted" if row["converted"] == 1 else "lost"
        elif row["campus_visited"]:
            status = rng.choice(["visited", "visited", "applied"])
        else:
            status = rng.choice(["new", "contacted", "contacted"])

        followups = int(row["followup_count"])
        last_contact = None
        if followups > 0:
            last_contact = min(today, enquiry_date + timedelta(days=rng.randint(0, max(age_days, 1))))
        next_followup = None
        if status not in ("admitted", "lost") and rng.random() < 0.5:
            next_followup = today + timedelta(days=rng.randint(-4, 6))

        created.append(
            Enquiry(
                student_name=name,
                email=f"{name.lower().replace(' ', '.')}{i}@example.com",
                phone=f"+91 9{rng.randint(100000000, 999999999)}",
                city=rng.choice(CITIES),
                course_interest=row["course_interest"],
                source=row["source"],
                previous_score=float(row["previous_score"]),
                fee_affordability=row["fee_affordability"],
                enquiry_date=enquiry_date,
                last_contact_date=last_contact,
                next_followup_date=next_followup,
                followup_count=followups,
                response_time_hours=float(row["response_time_hours"]),
                campus_visited=bool(row["campus_visited"]),
                scholarship_requested=bool(row["scholarship_requested"]),
                status=status,
                notes="Demo record",
            )
        )

    rescore(created)
    db.add_all(created)
    db.commit()
    return len(created)
