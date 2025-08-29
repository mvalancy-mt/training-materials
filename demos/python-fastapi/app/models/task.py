"""
Task model definition.
"""

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class TaskStatus(str, Enum):
    """Task status enumeration."""

    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class TaskPriority(str, Enum):
    """Task priority enumeration."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class TaskBase(BaseModel):
    """Base task model."""

    title: str = Field(
        ..., min_length=1, max_length=200, description="Task title"
    )
    description: Optional[str] = Field(
        None, max_length=1000, description="Task description"
    )
    status: TaskStatus = Field(TaskStatus.PENDING, description="Task status")
    priority: TaskPriority = Field(
        TaskPriority.MEDIUM, description="Task priority"
    )
    due_date: Optional[datetime] = Field(None, description="Task due date")


class TaskCreate(TaskBase):
    """Task creation model."""

    pass


class TaskUpdate(BaseModel):
    """Task update model."""

    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    due_date: Optional[datetime] = None


class Task(TaskBase):
    """Complete task model."""

    id: int = Field(..., description="Task ID")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: Optional[datetime] = Field(
        None, description="Last update timestamp"
    )

    class Config:
        json_encoders = {datetime: lambda dt: dt.isoformat()}
        schema_extra = {
            "example": {
                "id": 1,
                "title": "Complete project documentation",
                "description": "Write comprehensive documentation for the API",
                "status": "pending",
                "priority": "high",
                "due_date": "2023-12-31T23:59:59",
                "created_at": "2023-12-01T10:00:00",
                "updated_at": "2023-12-01T10:00:00",
            }
        }
