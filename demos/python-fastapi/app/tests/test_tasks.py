"""
Test task API endpoints.
"""
import pytest
from fastapi.testclient import TestClient


def test_get_empty_tasks(client: TestClient):
    """Test getting tasks when none exist."""
    # Clear any existing tasks
    client.delete("/api/v1/tasks/1")  # This might fail, but that's ok
    
    response = client.get("/api/v1/tasks/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_create_task(client: TestClient, sample_task):
    """Test creating a new task."""
    response = client.post("/api/v1/tasks/", json=sample_task)
    assert response.status_code == 201
    data = response.json()
    
    assert data["title"] == sample_task["title"]
    assert data["description"] == sample_task["description"]
    assert data["status"] == sample_task["status"]
    assert data["priority"] == sample_task["priority"]
    assert "id" in data
    assert "created_at" in data
    assert "updated_at" in data


def test_get_task_by_id(client: TestClient, sample_task):
    """Test getting a specific task by ID."""
    # First create a task
    create_response = client.post("/api/v1/tasks/", json=sample_task)
    task_id = create_response.json()["id"]
    
    # Then get it by ID
    response = client.get(f"/api/v1/tasks/{task_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == task_id
    assert data["title"] == sample_task["title"]


def test_get_nonexistent_task(client: TestClient):
    """Test getting a task that doesn't exist."""
    response = client.get("/api/v1/tasks/99999")
    assert response.status_code == 404
    data = response.json()
    assert "not found" in data["detail"].lower()


def test_update_task(client: TestClient, sample_task):
    """Test updating an existing task."""
    # Create a task first
    create_response = client.post("/api/v1/tasks/", json=sample_task)
    task_id = create_response.json()["id"]
    
    # Update the task
    update_data = {"title": "Updated Task Title", "status": "in_progress"}
    response = client.put(f"/api/v1/tasks/{task_id}", json=update_data)
    
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == update_data["title"]
    assert data["status"] == update_data["status"]
    assert data["description"] == sample_task["description"]  # Should remain unchanged


def test_update_nonexistent_task(client: TestClient):
    """Test updating a task that doesn't exist."""
    update_data = {"title": "Updated Task"}
    response = client.put("/api/v1/tasks/99999", json=update_data)
    assert response.status_code == 404


def test_delete_task(client: TestClient, sample_task):
    """Test deleting a task."""
    # Create a task first
    create_response = client.post("/api/v1/tasks/", json=sample_task)
    task_id = create_response.json()["id"]
    
    # Delete the task
    response = client.delete(f"/api/v1/tasks/{task_id}")
    assert response.status_code == 200
    data = response.json()
    assert "deleted successfully" in data["message"]
    
    # Verify it's gone
    get_response = client.get(f"/api/v1/tasks/{task_id}")
    assert get_response.status_code == 404


def test_delete_nonexistent_task(client: TestClient):
    """Test deleting a task that doesn't exist."""
    response = client.delete("/api/v1/tasks/99999")
    assert response.status_code == 404


def test_task_statistics(client: TestClient, sample_task):
    """Test getting task statistics."""
    # Create a few tasks
    tasks_to_create = [
        {**sample_task, "status": "pending", "priority": "high"},
        {**sample_task, "status": "in_progress", "priority": "medium"},
        {**sample_task, "status": "completed", "priority": "low"},
    ]
    
    for task in tasks_to_create:
        client.post("/api/v1/tasks/", json=task)
    
    # Get statistics
    response = client.get("/api/v1/tasks/stats/summary")
    assert response.status_code == 200
    data = response.json()
    
    assert "total" in data
    assert "by_status" in data
    assert "by_priority" in data
    assert data["total"] >= 3  # At least the tasks we created


def test_task_filtering(client: TestClient, sample_task):
    """Test filtering tasks by status and priority."""
    # Create tasks with different statuses
    tasks = [
        {**sample_task, "status": "pending", "priority": "high"},
        {**sample_task, "status": "in_progress", "priority": "medium"},
        {**sample_task, "status": "pending", "priority": "low"},
    ]
    
    for task in tasks:
        client.post("/api/v1/tasks/", json=task)
    
    # Test status filtering
    response = client.get("/api/v1/tasks/?status=pending")
    assert response.status_code == 200
    data = response.json()
    for task in data:
        assert task["status"] == "pending"
    
    # Test priority filtering
    response = client.get("/api/v1/tasks/?priority=high")
    assert response.status_code == 200
    data = response.json()
    for task in data:
        assert task["priority"] == "high"


def test_task_pagination(client: TestClient, sample_task):
    """Test task pagination."""
    # Create multiple tasks
    for i in range(5):
        task_data = {**sample_task, "title": f"Task {i}"}
        client.post("/api/v1/tasks/", json=task_data)
    
    # Test limit
    response = client.get("/api/v1/tasks/?limit=2")
    assert response.status_code == 200
    data = response.json()
    assert len(data) <= 2
    
    # Test offset
    response = client.get("/api/v1/tasks/?limit=2&offset=2")
    assert response.status_code == 200
    data = response.json()
    assert len(data) <= 2


def test_create_task_validation(client: TestClient):
    """Test task creation with invalid data."""
    # Test empty title
    invalid_task = {"title": "", "description": "Test"}
    response = client.post("/api/v1/tasks/", json=invalid_task)
    assert response.status_code == 422
    
    # Test missing required fields
    response = client.post("/api/v1/tasks/", json={})
    assert response.status_code == 422