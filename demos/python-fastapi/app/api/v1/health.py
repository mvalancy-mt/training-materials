"""
Health check endpoints.
"""
from datetime import datetime
from fastapi import APIRouter, status
from fastapi.responses import JSONResponse
import os
import sys

router = APIRouter()


@router.get("/")
async def health_check():
    """Basic health check endpoint."""
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "service": "Task Management API",
            "version": "1.0.0",
        },
    )


@router.get("/ready")
async def readiness_check():
    """Readiness check endpoint."""
    # In a real app, check database connectivity, external services, etc.
    checks = {
        "database": "ok",  # Would be actual DB check
        "memory": "ok",
        "disk": "ok",
    }

    all_healthy = all(check == "ok" for check in checks.values())

    return JSONResponse(
        status_code=status.HTTP_200_OK
        if all_healthy
        else status.HTTP_503_SERVICE_UNAVAILABLE,
        content={
            "status": "ready" if all_healthy else "not_ready",
            "timestamp": datetime.utcnow().isoformat(),
            "checks": checks,
        },
    )


@router.get("/live")
async def liveness_check():
    """Liveness check endpoint."""
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "status": "alive",
            "timestamp": datetime.utcnow().isoformat(),
            "uptime_seconds": "N/A",  # Would calculate actual uptime
            "pid": os.getpid(),
            "python_version": sys.version.split()[0],
        },
    )