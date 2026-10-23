import pytest

def test_login_success(client, admin_user):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@test.edu", "password": "AdminPass123!"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["role"] == "admin"
    assert data["user_id"] == admin_user.id

def test_login_wrong_password(client, admin_user):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@test.edu", "password": "WrongPassword999!"}
    )
    assert response.status_code == 401
    assert "Incorrect email or password" in response.json()["detail"]

def test_login_non_existent_email(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "ghost@edupredict.edu", "password": "Whatever123!"}
    )
    assert response.status_code == 401

def test_current_user_profile(client, admin_token):
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "admin@test.edu"
    assert data["role"] == "admin"

def test_unauthenticated_request_rejected(client):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401
