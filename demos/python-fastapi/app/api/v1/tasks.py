"""
Task API endpoints.
"""

from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse

from app.models.task import Task, TaskCreate, TaskPriority, TaskStatus, TaskUpdate

router = APIRouter()

# In-memory storage for demo purposes
# In production, this would be a database
tasks_db = []
next_id = 1


@router.get("/", response_model=List[Task])
async def get_tasks(
    status: Optional[TaskStatus] = Query(None, description="Filter by status"),
    priority: Optional[TaskPriority] = Query(None, description="Filter by priority"),
    limit: int = Query(10, ge=1, le=100, description="Number of tasks to return"),
    offset: int = Query(0, ge=0, description="Number of tasks to skip"),
):
    """Get all tasks with optional filtering."""
    filtered_tasks = tasks_db.copy()

    # Apply filters
    if status:
        filtered_tasks = [task for task in filtered_tasks if task["status"] == status]
    if priority:
        filtered_tasks = [
            task for task in filtered_tasks if task["priority"] == priority
        ]

    # Apply pagination
    paginated_tasks = filtered_tasks[offset : offset + limit]

    return paginated_tasks


@router.get("/{task_id}", response_model=Task)
async def get_task(task_id: int):
    """Get a specific task by ID."""
    task = next((task for task in tasks_db if task["id"] == task_id), None)
    if not task:
        raise HTTPException(status_code=404, detail=f"Task with ID {task_id} not found")
    return task


@router.post("/", response_model=Task, status_code=201)
async def create_task(task_data: TaskCreate):
    """Create a new task."""
    global next_id

    # Create new task
    new_task = {
        "id": next_id,
        "title": task_data.title,
        "description": task_data.description,
        "status": task_data.status,
        "priority": task_data.priority,
        "due_date": task_data.due_date,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    tasks_db.append(new_task)
    next_id += 1

    return new_task


@router.put("/{task_id}", response_model=Task)
async def update_task(task_id: int, task_update: TaskUpdate):
    """Update an existing task."""
    task = next((task for task in tasks_db if task["id"] == task_id), None)
    if not task:
        raise HTTPException(status_code=404, detail=f"Task with ID {task_id} not found")

    # Update only provided fields
    update_data = task_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        task[field] = value

    task["updated_at"] = datetime.utcnow()

    return task


@router.delete("/{task_id}")
async def delete_task(task_id: int):
    """Delete a task."""
    global tasks_db

    task = next((task for task in tasks_db if task["id"] == task_id), None)
    if not task:
        raise HTTPException(status_code=404, detail=f"Task with ID {task_id} not found")

    tasks_db = [task for task in tasks_db if task["id"] != task_id]

    return JSONResponse(
        status_code=200, content={"message": f"Task {task_id} deleted successfully"}
    )


@router.get("/stats/summary")
async def get_task_summary():
    """Get task statistics summary."""
    if not tasks_db:
        return {"total": 0, "by_status": {}, "by_priority": {}}

    total = len(tasks_db)

    # Count by status
    by_status = {}
    for status in TaskStatus:
        count = len([task for task in tasks_db if task["status"] == status])
        by_status[status.value] = count

    # Count by priority
    by_priority = {}
    for priority in TaskPriority:
        count = len([task for task in tasks_db if task["priority"] == priority])
        by_priority[priority.value] = count

    return {"total": total, "by_status": by_status, "by_priority": by_priority}
