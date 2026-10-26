from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.constants import CLOSED_STATUSES
from app.database import get_db
from app.models import Enquiry, FollowUp
from app.schemas import (
    EnquiryCreate,
    EnquiryOut,
    EnquiryPage,
    FollowUpCreate,
    FollowUpOut,
    StatusUpdate,
)
from app.services.scoring import rescore

router = APIRouter(prefix="/enquiries", tags=["enquiries"])


def _get_or_404(db: Session, enquiry_id: int) -> Enquiry:
    enquiry = db.get(Enquiry, enquiry_id)
    if enquiry is None:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    return enquiry


@router.get("", response_model=EnquiryPage)
def list_enquiries(
    q: str | None = Query(None, description="Search name, email, phone or course"),
    status_filter: str | None = Query(None, alias="status"),
    source: str | None = None,
    priority: str | None = Query(None, description="High, Medium, Low or Closed"),
    sort: str = Query("priority", pattern="^(priority|probability|newest|name)$"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    stmt = select(Enquiry)
    if q:
        like = f"%{q.strip()}%"
        stmt = stmt.where(
            or_(
                Enquiry.student_name.ilike(like),
                Enquiry.email.ilike(like),
                Enquiry.phone.ilike(like),
                Enquiry.course_interest.ilike(like),
            )
        )
    if status_filter:
        stmt = stmt.where(Enquiry.status == status_filter)
    if source:
        stmt = stmt.where(Enquiry.source == source)

    rows = list(db.scalars(stmt))
    if priority:
        rows = [r for r in rows if r.priority_label.lower() == priority.lower()]

    if sort == "priority":
        rows.sort(key=lambda r: r.priority_score, reverse=True)
    elif sort == "probability":
        rows.sort(key=lambda r: r.conversion_probability or 0, reverse=True)
    elif sort == "newest":
        rows.sort(key=lambda r: (r.enquiry_date, r.id), reverse=True)
    else:
        rows.sort(key=lambda r: r.student_name.lower())

    start = (page - 1) * page_size
    return EnquiryPage(
        items=rows[start : start + page_size], total=len(rows), page=page, page_size=page_size
    )


@router.post("", response_model=EnquiryOut, status_code=status.HTTP_201_CREATED)
def create_enquiry(payload: EnquiryCreate, db: Session = Depends(get_db)):
    enquiry = Enquiry(**payload.model_dump())
    rescore([enquiry])
    db.add(enquiry)
    db.commit()
    db.refresh(enquiry)
    return enquiry


@router.get("/{enquiry_id}", response_model=EnquiryOut)
def get_enquiry(enquiry_id: int, db: Session = Depends(get_db)):
    return _get_or_404(db, enquiry_id)


@router.put("/{enquiry_id}", response_model=EnquiryOut)
def update_enquiry(enquiry_id: int, payload: EnquiryCreate, db: Session = Depends(get_db)):
    enquiry = _get_or_404(db, enquiry_id)
    for key, value in payload.model_dump().items():
        setattr(enquiry, key, value)
    rescore([enquiry])
    db.commit()
    db.refresh(enquiry)
    return enquiry


@router.patch("/{enquiry_id}/status", response_model=EnquiryOut)
def update_status(enquiry_id: int, payload: StatusUpdate, db: Session = Depends(get_db)):
    enquiry = _get_or_404(db, enquiry_id)
    enquiry.status = payload.status
    if payload.status in CLOSED_STATUSES:
        enquiry.next_followup_date = None
    if payload.status == "visited":
        enquiry.campus_visited = True
        rescore([enquiry])
    db.commit()
    db.refresh(enquiry)
    return enquiry


@router.delete("/{enquiry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_enquiry(enquiry_id: int, db: Session = Depends(get_db)):
    db.delete(_get_or_404(db, enquiry_id))
    db.commit()


@router.get("/{enquiry_id}/followups", response_model=list[FollowUpOut])
def list_followups(enquiry_id: int, db: Session = Depends(get_db)):
    return _get_or_404(db, enquiry_id).followups


@router.post(
    "/{enquiry_id}/followups", response_model=FollowUpOut, status_code=status.HTTP_201_CREATED
)
def add_followup(enquiry_id: int, payload: FollowUpCreate, db: Session = Depends(get_db)):
    enquiry = _get_or_404(db, enquiry_id)
    followup = FollowUp(
        enquiry_id=enquiry.id,
        channel=payload.channel,
        notes=payload.notes,
        next_followup_date=payload.next_followup_date,
    )
    db.add(followup)

    enquiry.followup_count += 1
    enquiry.last_contact_date = date.today()
    enquiry.next_followup_date = payload.next_followup_date
    if payload.new_status:
        enquiry.status = payload.new_status
    elif enquiry.status == "new":
        enquiry.status = "contacted"
    if payload.channel == "visit" or enquiry.status == "visited":
        enquiry.campus_visited = True
    if enquiry.status in CLOSED_STATUSES:
        enquiry.next_followup_date = None
    rescore([enquiry])
    db.commit()
    db.refresh(followup)
    return followup
