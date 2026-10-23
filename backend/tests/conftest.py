import pytest
import os
import sys

# Ensure backend root is on sys.path and set test database URL
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
os.environ["DATABASE_URL"] = "sqlite:///./test_admissions.db"

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from app.core.database import Base, get_db
from app.core.security import get_password_hash, create_access_token
from app.models.user import User
from app.models.student import Student
from app.models.enquiry import Enquiry
from app.models.prediction import Prediction
from app.services.prediction_engine import calculate_conversion_prediction
from app.main import app

# In-memory SQLite for blazing fast automated tests
TEST_DATABASE_URL = "sqlite:///./test_admissions.db"
test_engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)
    if os.path.exists("./test_admissions.db"):
        try:
            os.remove("./test_admissions.db")
        except Exception:
            pass

@pytest.fixture
def db():
    connection = test_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def admin_user(db):
    user = User(
        id="test-admin-uuid",
        email="admin@test.edu",
        hashed_password=get_password_hash("AdminPass123!"),
        full_name="Dr. Test Admin",
        role="admin",
        department="Admissions Council",
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@pytest.fixture
def counsellor_a(db):
    user = User(
        id="test-counsellor-a-uuid",
        email="counsellor.a@test.edu",
        hashed_password=get_password_hash("CounsellorPassA1!"),
        full_name="Counsellor Alpha",
        role="counsellor",
        department="Engineering",
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@pytest.fixture
def counsellor_b(db):
    user = User(
        id="test-counsellor-b-uuid",
        email="counsellor.b@test.edu",
        hashed_password=get_password_hash("CounsellorPassB1!"),
        full_name="Counsellor Beta",
        role="counsellor",
        department="Management",
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@pytest.fixture
def admin_token(admin_user):
    return create_access_token(subject=admin_user.id, role="admin")

@pytest.fixture
def counsellor_a_token(counsellor_a):
    return create_access_token(subject=counsellor_a.id, role="counsellor")

@pytest.fixture
def counsellor_b_token(counsellor_b):
    return create_access_token(subject=counsellor_b.id, role="counsellor")

@pytest.fixture
def enquiry_of_counsellor_a(db, counsellor_a):
    student = Student(
        id="test-student-a",
        name="Candidate Alpha",
        email="student.a@gmail.com",
        phone="9876543210",
        city="Coimbatore",
        state="Tamil Nadu",
        qualifying_exam="12th Standard / HSC",
        percentage_score=91.5,
        maths_physics_score=94.0
    )
    db.add(student)
    db.flush()

    enquiry = Enquiry(
        id="test-enquiry-a",
        application_no="APP-2026-TEST-A",
        student_id=student.id,
        counsellor_id=counsellor_a.id,
        program="B.Tech Artificial Intelligence & Data Science",
        lead_source="Walk-in / Campus Visit",
        status="Campus Visit Scheduled",
        campus_visit_attended=True,
        parent_accompanied=True,
        engagement_score=90
    )
    db.add(enquiry)
    db.flush()

    pred = calculate_conversion_prediction(enquiry, student)
    prediction = Prediction(
        enquiry_id=enquiry.id,
        score=pred["score"],
        probability_percentage=pred["probability_percentage"],
        priority=pred["priority"],
        confidence_score=pred["confidence_score"],
        model_version=pred["model_version"],
        recommended_action=pred["recommended_action"],
        top_drivers=pred["top_drivers"],
        risk_factors=pred["risk_factors"]
    )
    db.add(prediction)
    db.commit()
    db.refresh(enquiry)
    return enquiry
