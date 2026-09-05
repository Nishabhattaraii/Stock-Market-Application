def test_health_check(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_login_flow(client, admin_user):
    response = client.post("/api/v1/auth/login", data={"username": "test_admin@nepse.com", "password": "admin123"})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "test_admin@nepse.com"

def test_companies_endpoint(client, auth_headers):
    response = client.get("/api/v1/companies", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_crawls_endpoint(client, auth_headers):
    response = client.get("/api/v1/crawls", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)
