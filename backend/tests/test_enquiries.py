import pytest

def test_create_enquiry_auto_predicts_conversion(client, admin_token):
    payload = {
        "student_name": "Rajarajan Sundaram",
        "email": "rajarajan.s@gmail.com",
        "phone": "9840112345",
        "city": "Thanjavur",
        "state": "Tamil Nadu",
        "qualifying_exam": "12th Standard / HSC",
        "percentage_score": 93.5,
        "maths_physics_score": 96.0,
        "category": "General",
        "budget_range": "₹1.5L - ₹2.5L / year",
        "hostel_required": True,
        "bus_transport_required": False,
        "program": "B.Tech Computer Science & Engineering",
        "lead_source": "Alumni Referral",
        "status": "New",
        "engagement_score": 85,
        "brochure_downloaded": True,
        "campus_visit_attended": True,
        "parent_accompanied": True
    }

    response = client.post(
        "/api/v1/enquiries",
        headers={"Authorization": f"Bearer {admin_token}"},
        json=payload
    )
    assert response.status_code == 201
    data = response.json()
    assert data["student"]["name"] == "Rajarajan Sundaram"
    assert "application_no" in data
    
    # Verify auto-prediction
    assert data["latest_prediction"] is not None
    pred = data["latest_prediction"]
    assert pred["score"] >= 0.85
    assert pred["priority"] == "Urgent"
    assert len(pred["top_drivers"]) > 0

def test_list_enquiries_search_filter(client, admin_token, enquiry_of_counsellor_a):
    response = client.get(
        "/api/v1/enquiries?search=Candidate Alpha",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    leads = response.json()
    assert len(leads) >= 1
    assert leads[0]["student"]["name"] == "Candidate Alpha"

def test_update_enquiry_recalculates_score(client, counsellor_a_token, enquiry_of_counsellor_a):
    # Candidate attended campus visit with parent
    response = client.put(
        f"/api/v1/enquiries/{enquiry_of_counsellor_a.id}",
        headers={"Authorization": f"Bearer {counsellor_a_token}"},
        json={
            "campus_visit_attended": True,
            "parent_accompanied": True,
            "status": "Campus Visit Scheduled"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["campus_visit_attended"] is True
    assert data["latest_prediction"]["probability_percentage"] >= 80
