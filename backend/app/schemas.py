"""Pydantic models: validate incoming requests and shape outgoing responses."""
from __future__ import annotations

import re
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator

from app.constants import ChannelT, FeeLevelT, SourceT, StatusT


class EnquiryBase(BaseModel):
    student_name: str = Field(min_length=1, max_length=120)
    email: EmailStr | None = None
    phone: str | None = Field(default=None, max_length=30)
    city: str | None = Field(default=None, max_length=80)
    course_interest: str = Field(min_length=1, max_length=80)
    source: SourceT
    previous_score: float | None = Field(default=None, ge=0, le=100)
    fee_affordability: FeeLevelT = "medium"
    enquiry_date: date = Field(default_factory=date.today)
    last_contact_date: date | None = None
    next_followup_date: date | None = None
    followup_count: int = Field(default=0, ge=0, le=200)
    response_time_hours: float = Field(default=24.0, ge=0, le=720)
    campus_visited: bool = False
    scholarship_requested: bool = False
    status: StatusT = "new"
    notes: str | None = Field(default=None, max_length=2000)

    @field_validator("student_name", "course_interest")
    @classmethod
    def _strip_required(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("must not be blank")
        return v

    @field_validator("email", "phone", "city", "notes", mode="before")
    @classmethod
    def _blank_to_none(cls, v):
        if isinstance(v, str):
            v = v.strip()
            return v or None
        return v

    @field_validator("phone")
    @classmethod
    def _check_phone(cls, v: str | None) -> str | None:
        if v is not None and not re.fullmatch(r"\+?[0-9][0-9 ()\-]{5,28}", v):
            raise ValueError("enter a valid phone number, for example +91 98765 43210")
        return v

    @model_validator(mode="after")
    def _check_dates(self):
        if self.last_contact_date and self.last_contact_date < self.enquiry_date:
            raise ValueError("last_contact_date cannot be before enquiry_date")
        return self


class EnquiryCreate(EnquiryBase):
    pass


class EnquiryOut(EnquiryBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    conversion_probability: float | None
    priority_score: float
    priority_label: str
    recommended_action: str
    created_at: datetime
    updated_at: datetime


class EnquiryPage(BaseModel):
    items: list[EnquiryOut]
    total: int
    page: int
    page_size: int


class StatusUpdate(BaseModel):
    status: StatusT


class FollowUpCreate(BaseModel):
    channel: ChannelT
    notes: str | None = Field(default=None, max_length=2000)
    next_followup_date: date | None = None
    new_status: StatusT | None = None

    @field_validator("notes", mode="before")
    @classmethod
    def _blank_notes(cls, v):
        if isinstance(v, str):
            v = v.strip()
            return v or None
        return v


class FollowUpOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    enquiry_id: int
    channel: str
    notes: str | None
    next_followup_date: date | None
    created_at: datetime


class PredictRequest(BaseModel):
    course_interest: str = Field(min_length=1, max_length=80)
    source: SourceT
    fee_affordability: FeeLevelT = "medium"
    previous_score: float | None = Field(default=None, ge=0, le=100)
    followup_count: int = Field(default=0, ge=0, le=200)
    response_time_hours: float = Field(default=24.0, ge=0, le=720)
    campus_visited: bool = False
    scholarship_requested: bool = False


class Factor(BaseModel):
    feature: str
    impact: float
    direction: str


class PredictResponse(BaseModel):
    probability: float
    band: str
    factors: list[Factor]


class ModelInfo(BaseModel):
    algorithm: str
    data_source: str
    n_samples: int
    conversion_rate_in_training_data: float
    trained_at: str
    metrics: dict[str, float]


class RetrainResponse(BaseModel):
    model: ModelInfo
    enquiries_rescored: int


class SourceStat(BaseModel):
    source: str
    total: int
    admitted: int
    lost: int
    conversion_rate: float | None


class DashboardSummary(BaseModel):
    total_enquiries: int
    open_enquiries: int
    admitted: int
    lost: int
    conversion_rate: float | None
    expected_admissions: float
    high_priority: int
    followups_due: int
    by_status: dict[str, int]
    by_source: list[SourceStat]
    probability_buckets: dict[str, int]
