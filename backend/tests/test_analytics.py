import pytest

def test_dashboard_kpis(client, admin_token, enquiry_of_counsellor_a):
    response = client.get(
        "/api/v1/analytics/dashboard",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "total_enquiries" in data
    assert "avg_conversion_probability" in data
    assert "overall_conversion_rate" in data
    assert data["total_enquiries"] >= 1

def test_funnel_stages(client, admin_token):
    response = client.get(
        "/api/v1/analytics/funnel",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 5
    stages = [s["stage"] for s in data]
    assert "Total Enquiries" in stages
    assert "Enrolled Seats" in stages

def test_source_performance(client, admin_token):
    response = client.get(
        "/api/v1/analytics/sources",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_monthly_trends(client, admin_token):
    response = client.get(
        "/api/v1/analytics/monthly-trends",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)
