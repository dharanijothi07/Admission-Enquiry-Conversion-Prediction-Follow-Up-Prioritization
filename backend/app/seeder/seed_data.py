from datetime import date, datetime, timezone
from sqlalchemy.orm import Session
from ..core.database import SessionLocal, engine, Base
from ..core.security import get_password_hash
from ..models.user import User
from ..models.student import Student
from ..models.enquiry import Enquiry
from ..models.interaction import Interaction
from ..models.followup import FollowUp
from ..models.prediction import Prediction
from ..services.prediction_engine import calculate_conversion_prediction

def seed_database():
    """
    Seeds database with authentic academic college project fictional data.
    All student records and contact details are purely synthetic fixtures.
    """
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # Check if users already seeded
        existing_admin = db.query(User).filter(User.email == "admin@edupredict.edu").first()
        if existing_admin:
            print("Database already contains seed records. Skipping to preserve existing data.")
            return

        print("Seeding initial users and counsellors...")

        # 1. Seed Users
        admin_user = User(
            id="user-admin-1",
            email="admin@edupredict.edu",
            hashed_password=get_password_hash("Admin@123"),
            full_name="Dr. S. Rangarajan",
            role="admin",
            department="Admissions Directorate & Strategy",
            phone="+91 94432 10001",
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            is_active=True
        )
        db.add(admin_user)

        counsellor_priya = User(
            id="user-counsellor-1",
            email="priya@edupredict.edu",
            hashed_password=get_password_hash("Priya@123"),
            full_name="Priya Sundaram",
            role="counsellor",
            department="Engineering & Technology Admissions",
            phone="+91 98401 23456",
            avatar_url="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
            is_active=True
        )
        db.add(counsellor_priya)

        counsellor_rajesh = User(
            id="user-counsellor-2",
            email="rajesh@edupredict.edu",
            hashed_password=get_password_hash("Rajesh@123"),
            full_name="Rajesh Kannan",
            role="counsellor",
            department="Management & Computer Applications",
            phone="+91 98402 34567",
            avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
            is_active=True
        )
        db.add(counsellor_rajesh)

        counsellor_sneha = User(
            id="user-counsellor-3",
            email="sneha@edupredict.edu",
            hashed_password=get_password_hash("Sneha@123"),
            full_name="Sneha Raman",
            role="counsellor",
            department="Outreach & Lateral Entry Admissions",
            phone="+91 98403 45678",
            avatar_url="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
            is_active=True
        )
        db.add(counsellor_sneha)

        counsellor_arun = User(
            id="user-counsellor-4",
            email="arun@edupredict.edu",
            hashed_password=get_password_hash("Arun@123"),
            full_name="Arun Karthik",
            role="counsellor",
            department="Engineering (Electronics & Mechanical)",
            phone="+91 98404 56789",
            avatar_url="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
            is_active=True
        )
        db.add(counsellor_arun)
        db.flush()

        # 2. Seed Fictional Candidates & Enquiries
        candidates_data = [
            {
                "name": "Karthik Sivakumar",
                "email": "karthik.siva26@gmail.com",
                "phone": "+91 98840 12890",
                "city": "Coimbatore",
                "program": "B.Tech Artificial Intelligence & Data Science",
                "lead_source": "Walk-in / Campus Visit",
                "status": "Campus Visit Scheduled",
                "counsellor_id": "user-counsellor-1",
                "pct": 92.4,
                "mp": 95.0,
                "eng": 94,
                "visit": True,
                "parent": True,
                "app_no": "APP-2026-0081"
            },
            {
                "name": "Ananya Meenakshi",
                "email": "ananya.meenu@outlook.com",
                "phone": "+91 97910 88210",
                "city": "Madurai",
                "program": "B.Tech Computer Science & Engineering",
                "lead_source": "Website Form",
                "status": "In Discussion",
                "counsellor_id": "user-counsellor-1",
                "pct": 89.6,
                "mp": 91.5,
                "eng": 86,
                "visit": False,
                "parent": False,
                "app_no": "APP-2026-0082"
            },
            {
                "name": "Vignesh Balaji",
                "email": "vignesh.balaji05@gmail.com",
                "phone": "+91 94441 55672",
                "city": "Chennai",
                "program": "B.Tech Information Technology",
                "lead_source": "Google Search Ads",
                "status": "Application Submitted",
                "counsellor_id": "user-counsellor-2",
                "pct": 84.0,
                "mp": 82.5,
                "eng": 78,
                "visit": True,
                "parent": True,
                "app_no": "APP-2026-0083"
            },
            {
                "name": "Deepak Krishnan",
                "email": "deepak.krishnan03@yahoo.com",
                "phone": "+91 98845 99312",
                "city": "Salem",
                "program": "B.Tech Electronics & Communication",
                "lead_source": "Education Fair / Expo",
                "status": "Contacted",
                "counsellor_id": "user-counsellor-4",
                "pct": 76.5,
                "mp": 74.0,
                "eng": 54,
                "visit": False,
                "parent": False,
                "app_no": "APP-2026-0084"
            },
            {
                "name": "Harini Jayaraman",
                "email": "harini.j2004@gmail.com",
                "phone": "+91 97890 11445",
                "city": "Tiruchirappalli",
                "program": "MCA - Cloud Computing",
                "lead_source": "Alumni Referral",
                "status": "In Discussion",
                "counsellor_id": "user-counsellor-2",
                "pct": 87.2,
                "mp": 88.0,
                "eng": 88,
                "visit": False,
                "parent": False,
                "app_no": "APP-2026-0085"
            },
            {
                "name": "Pooja Venkatesh",
                "email": "pooja.venkat2005@gmail.com",
                "phone": "+91 98414 66321",
                "city": "Chennai",
                "program": "B.Tech Artificial Intelligence & Data Science",
                "lead_source": "Walk-in / Campus Visit",
                "status": "Converted",
                "counsellor_id": "user-counsellor-1",
                "pct": 94.8,
                "mp": 96.0,
                "eng": 98,
                "visit": True,
                "parent": True,
                "app_no": "APP-2026-0087"
            }
        ]

        print("Seeding students, enquiries, and running ML prediction engine...")

        for data in candidates_data:
            student = Student(
                name=data["name"],
                email=data["email"],
                phone=data["phone"],
                city=data["city"],
                state="Tamil Nadu",
                qualifying_exam="12th Standard / HSC",
                percentage_score=data["pct"],
                maths_physics_score=data["mp"],
                category="General",
                budget_range="₹1.5L - ₹2.5L / year",
                hostel_required=True if data["city"] != "Chennai" else False,
                bus_transport_required=True if data["city"] == "Chennai" else False
            )
            db.add(student)
            db.flush()

            enquiry = Enquiry(
                application_no=data["app_no"],
                student_id=student.id,
                counsellor_id=data["counsellor_id"],
                program=data["program"],
                lead_source=data["lead_source"],
                status=data["status"],
                engagement_score=data["eng"],
                brochure_downloaded=True,
                campus_visit_attended=data["visit"],
                parent_accompanied=data["parent"],
                enquiry_date=date.today()
            )
            db.add(enquiry)
            db.flush()

            # Run prediction engine
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

            # Seed an interaction log
            interaction = Interaction(
                enquiry_id=enquiry.id,
                counsellor_id=data["counsellor_id"],
                type="Call",
                notes=f"Candidate discussed {data['program']} curriculum and admission criteria.",
                outcome="Interested - Requested Prospectus"
            )
            db.add(interaction)

            # Seed a scheduled follow-up
            followup = FollowUp(
                enquiry_id=enquiry.id,
                counsellor_id=data["counsellor_id"],
                scheduled_date=date.today(),
                scheduled_time="11:30 AM",
                channel="Phone Call",
                status="Pending" if data["status"] != "Converted" else "Completed",
                priority=pred["priority"],
                notes="Follow up with scholarship breakdown and campus tour registration."
            )
            db.add(followup)

        db.commit()
        print("Demo dataset seeded successfully! (Admin: admin@edupredict.edu / Admin@123, Counsellor: priya@edupredict.edu / Priya@123)")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
