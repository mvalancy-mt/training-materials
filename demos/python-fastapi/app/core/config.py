"""
Application configuration settings.
"""

import os
from functools import lru_cache
from typing import Optional

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings."""

    # Application
    app_name: str = "Task Management API"
    debug: bool = False

    # Server
    host: str = "0.0.0.0"
    port: int = 8000

    # Database
    database_url: Optional[str] = None

    # Security
    secret_key: str = "dev-key-change-in-production"  # Default dev key

    # Environment
    environment: str = "development"

    class Config:
        env_file = ".env"
        case_sensitive = False

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

        # Set debug mode based on environment
        if self.environment.lower() in ["development", "dev"]:
            self.debug = True

        # Use environment variables if available
        self.host = os.getenv("HOST", self.host)
        self.port = int(os.getenv("PORT", self.port))
        self.database_url = os.getenv("DATABASE_URL", self.database_url)
        self.secret_key = os.getenv("SECRET_KEY", self.secret_key)
        self.environment = os.getenv("ENVIRONMENT", self.environment)


@lru_cache()
def get_settings() -> Settings:
    """Get cached application settings."""
    return Settings()
