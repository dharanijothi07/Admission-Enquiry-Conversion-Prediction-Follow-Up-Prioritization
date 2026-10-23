"""001_initial_schema

Revision ID: 001_initial
Revises: 
Create Date: 2026-10-23 14:40:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '001_initial'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # 1. Users Table
    op.create_table(
        'users',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=False),
        sa.Column('role', sa.String(length=50), nullable=False),
        sa.Column('department', sa.String(length=255), nullable=True),
        sa.Column('phone', sa.String(length=50), nullable=True),
        sa.Column('avatar_url', sa.String(length=500), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('1')),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)

    # 2. Students Table
    op.create_table(
        'students',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('phone', sa.String(length=50), nullable=False),
        sa.Column('city', sa.String(length=100), nullable=False),
        sa.Column('state', sa.String(length=100), nullable=False),
        sa.Column('qualifying_exam', sa.String(length=100), nullable=False),
        sa.Column('percentage_score', sa.Float(), nullable=False),
        sa.Column('maths_physics_score', sa.Float(), nullable=True),
        sa.Column('entrance_percentile', sa.Float(), nullable=True),
        sa.Column('category', sa.String(length=50), nullable=False),
        sa.Column('budget_range', sa.String(length=100), nullable=False),
        sa.Column('hostel_required', sa.Boolean(), nullable=False, server_default=sa.text('0')),
        sa.Column('bus_transport_required', sa.Boolean(), nullable=False, server_default=sa.text('0')),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_students_email'), 'students', ['email'], unique=False)
    op.create_index(op.f('ix_students_phone'), 'students', ['phone'], unique=False)

    # 3. Enquiries Table
    op.create_table(
        'enquiries',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('application_no', sa.String(length=50), nullable=False),
        sa.Column('student_id', sa.String(length=36), nullable=False),
        sa.Column('counsellor_id', sa.String(length=36), nullable=True),
        sa.Column('program', sa.String(length=255), nullable=False),
        sa.Column('lead_source', sa.String(length=100), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('engagement_score', sa.Integer(), nullable=False, server_default='50'),
        sa.Column('brochure_downloaded', sa.Boolean(), nullable=False, server_default=sa.text('0')),
        sa.Column('campus_visit_attended', sa.Boolean(), nullable=False, server_default=sa.text('0')),
        sa.Column('parent_accompanied', sa.Boolean(), nullable=False, server_default=sa.text('0')),
        sa.Column('enquiry_date', sa.Date(), nullable=False),
        sa.Column('last_contacted_date', sa.Date(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['counsellor_id'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['student_id'], ['students.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_enquiries_application_no'), 'enquiries', ['application_no'], unique=True)
    op.create_index(op.f('ix_enquiries_counsellor_id'), 'enquiries', ['counsellor_id'], unique=False)
    op.create_index(op.f('ix_enquiries_student_id'), 'enquiries', ['student_id'], unique=False)

    # 4. Interactions Table
    op.create_table(
        'interactions',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('enquiry_id', sa.String(length=36), nullable=False),
        sa.Column('counsellor_id', sa.String(length=36), nullable=True),
        sa.Column('type', sa.String(length=50), nullable=False),
        sa.Column('notes', sa.Text(), nullable=False),
        sa.Column('outcome', sa.String(length=100), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['counsellor_id'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['enquiry_id'], ['enquiries.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_interactions_enquiry_id'), 'interactions', ['enquiry_id'], unique=False)

    # 5. FollowUps Table
    op.create_table(
        'followups',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('enquiry_id', sa.String(length=36), nullable=False),
        sa.Column('counsellor_id', sa.String(length=36), nullable=True),
        sa.Column('scheduled_date', sa.Date(), nullable=False),
        sa.Column('scheduled_time', sa.String(length=20), nullable=False),
        sa.Column('channel', sa.String(length=50), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('priority', sa.String(length=20), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('outcome', sa.String(length=100), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['counsellor_id'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['enquiry_id'], ['enquiries.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_followups_enquiry_id'), 'followups', ['enquiry_id'], unique=False)
    op.create_index(op.f('ix_followups_counsellor_id'), 'followups', ['counsellor_id'], unique=False)
    op.create_index(op.f('ix_followups_scheduled_date'), 'followups', ['scheduled_date'], unique=False)

    # 6. Predictions Table
    op.create_table(
        'predictions',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('enquiry_id', sa.String(length=36), nullable=False),
        sa.Column('score', sa.Float(), nullable=False),
        sa.Column('probability_percentage', sa.Integer(), nullable=False),
        sa.Column('priority', sa.String(length=20), nullable=False),
        sa.Column('confidence_score', sa.Float(), nullable=False),
        sa.Column('model_version', sa.String(length=100), nullable=False),
        sa.Column('recommended_action', sa.Text(), nullable=False),
        sa.Column('top_drivers', sa.JSON(), nullable=False),
        sa.Column('risk_factors', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['enquiry_id'], ['enquiries.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_predictions_enquiry_id'), 'predictions', ['enquiry_id'], unique=False)

    # 7. Admissions Table
    op.create_table(
        'admissions',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('enquiry_id', sa.String(length=36), nullable=False),
        sa.Column('student_id', sa.String(length=36), nullable=False),
        sa.Column('enrollment_no', sa.String(length=50), nullable=False),
        sa.Column('program', sa.String(length=255), nullable=False),
        sa.Column('fee_paid', sa.Float(), nullable=False),
        sa.Column('scholarship_awarded', sa.Float(), nullable=False),
        sa.Column('admission_date', sa.Date(), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['enquiry_id'], ['enquiries.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['student_id'], ['students.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('enquiry_id'),
        sa.UniqueConstraint('enrollment_no')
    )

def downgrade() -> None:
    op.drop_table('admissions')
    op.drop_table('predictions')
    op.drop_table('followups')
    op.drop_table('interactions')
    op.drop_table('enquiries')
    op.drop_table('students')
    op.drop_table('users')
