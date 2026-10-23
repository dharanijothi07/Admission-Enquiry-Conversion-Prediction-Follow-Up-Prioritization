import pytest
from datetime import date, timedelta

def test_schedule_and_complete_followup(client, counsellor_a_token, enquiry_of_counsellor_a):
    # 1. Schedule a call task
    today_str = date.today().isoformat()
    response = client.post(
        "/api/v1/followups",
        headers={"Authorization": f"Bearer {counsellor_a_token}"},
        json={
            "enquiry_id": enquiry_of_counsellor_a.id,
            "scheduled_date": today_str,
            "scheduled_time": "02:30 PM",
            "channel": "Phone Call",
            "priority": "Urgent",
            "notes": "Discuss hostel allocation fees with parents"
        }
    )
    assert response.status_code == 201
    task_data = response.json()
    task_id = task_data["id"]
    assert task_data["status"] == "Pending"
    assert task_data["priority"] == "Urgent"

    # 2. Complete task with outcome disposition
    comp_resp = client.patch(
        f"/api/v1/followups/{task_id}/status",
        headers={"Authorization": f"Bearer {counsellor_a_token}"},
        json={
            "status": "Completed",
            "outcome": "High Intent - Scheduling Campus Visit",
            "notes": "Father agreed to visit campus on Saturday"
        }
    )
    assert comp_resp.status_code == 200
    updated = comp_resp.json()
    assert updated["status"] == "Completed"
    assert updated["outcome"] == "High Intent - Scheduling Campus Visit"
    assert updated["completed_at"] is not None

def test_reschedule_followup(client, counsellor_a_token, enquiry_of_counsellor_a):
    # Create task
    today_str = date.today().isoformat()
    task = client.post(
        "/api/v1/followups",
        headers={"Authorization": f"Bearer {counsellor_a_token}"},
        json={
            "enquiry_id": enquiry_of_counsellor_a.id,
            "scheduled_date": today_str,
            "scheduled_time": "11:00 AM",
            "channel": "WhatsApp",
            "priority": "High"
        }
    ).json()

    # Reschedule to tomorrow
    tomorrow_str = (date.today() + timedelta(days=1)).isoformat()
    resched_resp = client.patch(
        f"/api/v1/followups/{task['id']}/reschedule",
        headers={"Authorization": f"Bearer {counsellor_a_token}"},
        json={
            "scheduled_date": tomorrow_str,
            "scheduled_time": "04:00 PM",
            "notes": "Candidate in entrance examination"
        }
    )
    assert resched_resp.status_code == 200
    resched_data = resched_resp.json()
    assert resched_data["scheduled_date"] == tomorrow_str
    assert resched_data["scheduled_time"] == "04:00 PM"
    assert resched_data["status"] == "Pending"

def test_log_interaction_bumps_telemetry(client, counsellor_a_token, enquiry_of_counsellor_a):
    response = client.post(
        "/api/v1/interactions",
        headers={"Authorization": f"Bearer {counsellor_a_token}"},
        json={
            "enquiry_id": enquiry_of_counsellor_a.id,
            "type": "Campus Visit",
            "notes": "Student attended AI GPU lab demonstration with Dean",
            "outcome": "High Intent - Scheduling Campus Visit"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["type"] == "Campus Visit"
    assert data["enquiry_id"] == enquiry_of_counsellor_a.id
