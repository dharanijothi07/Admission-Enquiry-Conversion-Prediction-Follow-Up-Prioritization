"""create enquiries and followups

Revision ID: 0001
Revises:
Create Date: 2026-01-01 00:00:00
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "enquiries",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("student_name", sa.String(length=120), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=True),
        sa.Column("phone", sa.String(length=30), nullable=True),
        sa.Column("city", sa.String(length=80), nullable=True),
        sa.Column("course_interest", sa.String(length=80), nullable=False),
        sa.Column("source", sa.String(length=30), nullable=False),
        sa.Column("previous_score", sa.Float(), nullable=True),
        sa.Column("fee_affordability", sa.String(length=10), nullable=False),
        sa.Column("enquiry_date", sa.Date(), nullable=False),
        sa.Column("last_contact_date", sa.Date(), nullable=True),
        sa.Column("next_followup_date", sa.Date(), nullable=True),
        sa.Column("followup_count", sa.Integer(), nullable=False),
        sa.Column("response_time_hours", sa.Float(), nullable=False),
        sa.Column("campus_visited", sa.Boolean(), nullable=False),
        sa.Column("scholarship_requested", sa.Boolean(), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("conversion_probability", sa.Float(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_enquiries_course_interest"), "enquiries", ["course_interest"])
    op.create_index(op.f("ix_enquiries_source"), "enquiries", ["source"])
    op.create_index(op.f("ix_enquiries_status"), "enquiries", ["status"])

    op.create_table(
        "followups",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("enquiry_id", sa.Integer(), nullable=False),
        sa.Column("channel", sa.String(length=20), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("next_followup_date", sa.Date(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["enquiry_id"], ["enquiries.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_followups_enquiry_id"), "followups", ["enquiry_id"])


def downgrade() -> None:
    op.drop_index(op.f("ix_followups_enquiry_id"), table_name="followups")
    op.drop_table("followups")
    op.drop_index(op.f("ix_enquiries_status"), table_name="enquiries")
    op.drop_index(op.f("ix_enquiries_source"), table_name="enquiries")
    op.drop_index(op.f("ix_enquiries_course_interest"), table_name="enquiries")
    op.drop_table("enquiries")
