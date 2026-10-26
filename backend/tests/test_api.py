VALID = {
    "student_name": "Asha Raman",
    "email": "asha@example.com",
    "phone": "+91 98765 43210",
    "course_interest": "MBA",
    "source": "referral",
    "previous_score": 80,
    "campus_visited": True,
}


def test_health(client):
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"
    assert r.json()["database"] == "connected"


def test_create_get_update_delete(client):
    created = client.post("/api/enquiries", json=VALID)
    assert created.status_code == 201
    body = created.json()
    assert 0 <= body["conversion_probability"] <= 1
    assert body["priority_label"] in {"High", "Medium", "Low"}

    eid = body["id"]
    assert client.get(f"/api/enquiries/{eid}").json()["student_name"] == "Asha Raman"

    updated = client.put(f"/api/enquiries/{eid}", json={**VALID, "student_name": "Asha R"})
    assert updated.json()["student_name"] == "Asha R"

    assert client.delete(f"/api/enquiries/{eid}").status_code == 204
    assert client.get(f"/api/enquiries/{eid}").status_code == 404


def test_validation_errors(client):
    bad = {**VALID, "source": "carrier_pigeon", "email": "not-an-email", "previous_score": 150}
    r = client.post("/api/enquiries", json=bad)
    assert r.status_code == 422


def test_followup_updates_enquiry(client):
    eid = client.post("/api/enquiries", json=VALID).json()["id"]
    r = client.post(f"/api/enquiries/{eid}/followups", json={"channel": "call", "notes": "Spoke"})
    assert r.status_code == 201
    enquiry = client.get(f"/api/enquiries/{eid}").json()
    assert enquiry["followup_count"] == 1
    assert enquiry["status"] == "contacted"
    assert enquiry["last_contact_date"] is not None


def test_predict(client):
    payload = {"course_interest": "MBA", "source": "referral", "campus_visited": True}
    r = client.post("/api/predict", json=payload)
    assert r.status_code == 200
    assert 0 <= r.json()["probability"] <= 1
    weak = client.post(
        "/api/predict",
        json={"course_interest": "MBA", "source": "social_media", "fee_affordability": "low",
              "response_time_hours": 120},
    ).json()["probability"]
    assert weak < r.json()["probability"]


def test_demo_seed_dashboard_and_priority_queue(client):
    assert client.post("/api/demo/seed").json()["created"] > 0
    assert client.post("/api/demo/seed").status_code == 409

    summary = client.get("/api/dashboard/summary").json()
    assert summary["total_enquiries"] == summary["open_enquiries"] + summary["admitted"] + summary["lost"]

    queue = client.get("/api/followups/priority?limit=5").json()
    scores = [e["priority_score"] for e in queue]
    assert scores == sorted(scores, reverse=True)
    assert all(e["status"] not in ("admitted", "lost") for e in queue)


def test_retrain(client):
    client.post("/api/demo/seed")
    r = client.post("/api/ml/retrain")
    assert r.status_code == 200
    assert r.json()["enquiries_rescored"] > 0
    assert client.get("/api/ml/model-info").json()["algorithm"] == "LogisticRegression"
