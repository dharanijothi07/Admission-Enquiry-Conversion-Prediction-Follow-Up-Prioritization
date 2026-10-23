import pytest

def test_counsellor_can_access_own_assigned_lead(client, counsellor_a_token, enquiry_of_counsellor_a):
    response = client.get(
        f"/api/v1/enquiries/{enquiry_of_counsellor_a.id}",
        headers={"Authorization": f"Bearer {counsellor_a_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == enquiry_of_counsellor_a.id
    assert data["student"]["name"] == "Candidate Alpha"

def test_counsellor_forbidden_from_other_counsellor_lead(client, counsellor_b_token, enquiry_of_counsellor_a):
    """
    CRITICAL SECURITY & ACCESS CONTROL CHECK:
    Counsellor B attempts to inspect a candidate assigned to Counsellor A.
    Server MUST reject with HTTP 403 Forbidden.
    """
    response = client.get(
        f"/api/v1/enquiries/{enquiry_of_counsellor_a.id}",
        headers={"Authorization": f"Bearer {counsellor_b_token}"}
    )
    assert response.status_code == 403
    assert "Access denied" in response.json()["detail"]

def test_counsellor_forbidden_from_updating_other_counsellor_lead(client, counsellor_b_token, enquiry_of_counsellor_a):
    """Counsellor B attempts to modify status or details of Counsellor A's lead."""
    response = client.put(
        f"/api/v1/enquiries/{enquiry_of_counsellor_a.id}",
        headers={"Authorization": f"Bearer {counsellor_b_token}"},
        json={"status": "Converted"}
    )
    assert response.status_code == 403
    assert "Access denied" in response.json()["detail"]

def test_admin_can_access_any_lead(client, admin_token, enquiry_of_counsellor_a):
    """Admins bypass counsellor boundaries and maintain macro oversight over all leads."""
    response = client.get(
        f"/api/v1/enquiries/{enquiry_of_counsellor_a.id}",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    assert response.json()["id"] == enquiry_of_counsellor_a.id

def test_counsellor_forbidden_from_user_management(client, counsellor_a_token):
    """Counsellor cannot view staff list or provision users."""
    response = client.get(
        "/api/v1/users",
        headers={"Authorization": f"Bearer {counsellor_a_token}"}
    )
    assert response.status_code == 403
    assert "Admin privileges required" in response.json()["detail"]

def test_admin_can_access_user_management(client, admin_token):
    response = client.get(
        "/api/v1/users",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)
