from collections import Counter
from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.constants import CLOSED_STATUSES, SOURCES, STATUSES
from app.database import get_db
from app.models import Enquiry
from app.schemas import DashboardSummary, EnquiryOut, SourceStat

router = APIRouter(tags=["dashboard"])


@router.get("/dashboard/summary", response_model=DashboardSummary)
def dashboard_summary(db: Session = Depends(get_db)):
    rows = list(db.scalars(select(Enquiry)))
    today = date.today()
    open_rows = [r for r in rows if r.status not in CLOSED_STATUSES]
    admitted = sum(1 for r in rows if r.status == "admitted")
    lost = sum(1 for r in rows if r.status == "lost")

    by_status = Counter(r.status for r in rows)
    buckets = {"0-20%": 0, "20-40%": 0, "40-60%": 0, "60-80%": 0, "80-100%": 0}
    for r in open_rows:
        p = r.conversion_probability or 0.0
        buckets[list(buckets)[min(int(p * 5), 4)]] += 1

    by_source = []
    for s in SOURCES:
        src_rows = [r for r in rows if r.source == s]
        a = sum(1 for r in src_rows if r.status == "admitted")
        l = sum(1 for r in src_rows if r.status == "lost")
        by_source.append(
            SourceStat(
                source=s,
                total=len(src_rows),
                admitted=a,
                lost=l,
                conversion_rate=round(a / (a + l), 3) if (a + l) else None,
            )
        )

    return DashboardSummary(
        total_enquiries=len(rows),
        open_enquiries=len(open_rows),
        admitted=admitted,
        lost=lost,
        conversion_rate=round(admitted / (admitted + lost), 3) if (admitted + lost) else None,
        expected_admissions=round(sum(r.conversion_probability or 0.0 for r in open_rows), 1),
        high_priority=sum(1 for r in open_rows if r.priority_label == "High"),
        followups_due=sum(
            1 for r in open_rows if r.next_followup_date and r.next_followup_date <= today
        ),
        by_status={s: by_status.get(s, 0) for s in STATUSES},
        by_source=by_source,
        probability_buckets=buckets,
    )


@router.get("/followups/priority", response_model=list[EnquiryOut])
def priority_queue(limit: int = Query(10, ge=1, le=100), db: Session = Depends(get_db)):
    """Open enquiries ordered by who should be contacted first."""
    rows = [r for r in db.scalars(select(Enquiry)) if r.status not in CLOSED_STATUSES]
    rows.sort(key=lambda r: r.priority_score, reverse=True)
    return rows[:limit]
