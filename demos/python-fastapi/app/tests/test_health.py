"""
Test health check endpoints.
"""

from fastapi.testclient import TestClient


def test_health_check(client: TestClient):
    """Test basic health check endpoint."""
    response = client.get("/health/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "Task Management API"
    assert data["version"] == "1.0.0"
    assert "timestamp" in data


def test_readiness_check(client: TestClient):
    """Test readiness check endpoint."""
    response = client.get("/health/ready")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ready"
    assert "checks" in data
    assert "timestamp" in data


def test_liveness_check(client: TestClient):
    """Test liveness check endpoint."""
    response = client.get("/health/live")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "alive"
    assert "pid" in data
    assert "python_version" in data
    assert "timestamp" in data
