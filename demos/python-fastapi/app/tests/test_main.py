"""
Test main application endpoints.
"""

import pytest
from fastapi.testclient import TestClient


def test_root_endpoint(client: TestClient):
    """Test root endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Task Management API"
    assert data["version"] == "1.0.0"
    assert "timestamp" in data


def test_docs_endpoint(client: TestClient):
    """Test API documentation endpoint."""
    response = client.get("/docs")
    assert response.status_code == 200


def test_openapi_endpoint(client: TestClient):
    """Test OpenAPI specification endpoint."""
    response = client.get("/openapi.json")
    assert response.status_code == 200
    data = response.json()
    assert data["info"]["title"] == "Task Management API"
    assert data["info"]["version"] == "1.0.0"
