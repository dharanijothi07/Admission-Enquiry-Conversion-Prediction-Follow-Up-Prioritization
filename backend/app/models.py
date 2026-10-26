"""Database tables."""
from __future__ import annotations

from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.services.prioritization import compute_priority, recommend_action


class Enquiry(Base):
    __tablename__ = "enquiries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    student_name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str | None] = mapped_column(String(255))
    phone: Mapped[str | None] = mapped_column(String(30))
    city: Mapped[str | None] = mapped_column(String(80))
    course_interest: Mapped[str] = mapped_column(String(80), nullable=False, index=True)
    source: Mapped[str] = mapped_column(String(30), nullable=False, index=True)
    previous_score: Mapped[float | None] = mapped_column(Float)
    fee_affordability: Mapped[str] = mapped_column(String(10), nullable=False, default="medium")
    enquiry_date: Mapped[date] = mapped_column(Date, nullable=False, default=date.today)
    last_contact_date: Mapped[date | None] = mapped_column(Date)
    next_followup_date: Mapped[date | None] = mapped_column(Date)
    followup_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    response_time_hours: Mapped[float] = mapped_column(Float, nullable=False, default=24.0)
    campus_visited: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    scholarship_requested: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="new", index=True)
    notes: Mapped[str | None] = mapped_column(Text)
    conversion_probability: Mapped[float | None] = mapped_column(Float)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    followups: Mapped[list["FollowUp"]] = relationship(
        back_populates="enquiry", cascade="all, delete-orphan", order_by="FollowUp.id.desc()"
    )

    # Priority is calculated on read so it always reflects today's date.
    @property
    def priority_score(self) -> float:
        return compute_priority(self)[0]

    @property
    def priority_label(self) -> str:
        return compute_priority(self)[1]

    @property
    def recommended_action(self) -> str:
        return recommend_action(self)


class FollowUp(Base):
    __tablename__ = "followups"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    enquiry_id: Mapped[int] = mapped_column(
        ForeignKey("enquiries.id", ondelete="CASCADE"), nullable=False, index=True
    )
    channel: Mapped[str] = mapped_column(String(20), nullable=False)
    notes: Mapped[str | None] = mapped_column(Text)
    next_followup_date: Mapped[date | None] = mapped_column(Date)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    enquiry: Mapped[Enquiry] = relationship(back_populates="followups")
