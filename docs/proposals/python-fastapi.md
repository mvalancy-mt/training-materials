# Python FastAPI Application Demo Proposal

## Overview

This demo demonstrates containerizing a Python FastAPI application with modern Python development practices and comprehensive CI/CD pipelines. It's designed to be beginner-friendly while showcasing production-ready patterns.

## Application Design

### Project: Task Management API
- **Framework**: FastAPI with async/await patterns
- **Database**: PostgreSQL with SQLAlchemy ORM and Alembic migrations
- **Authentication**: JWT-based auth with OAuth2
- **Caching**: Redis for session and response caching
- **Documentation**: Auto-generated OpenAPI/Swagger docs

### Features
- RESTful CRUD API for task management
- User authentication and authorization
- Database migrations with Alembic
- Background task processing with Celery
- Rate limiting and request validation
- Comprehensive API documentation
- Health and readiness checks
- Structured logging with correlation IDs

### Directory Structure
```
demos/python-fastapi/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── security.py
│   │   └── database.py
│   ├── api/
│   │   ├── __init__.py
│   │   ├── deps.py
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── auth.py
│   │       ├── tasks.py
│   │       └── users.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   └── task.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   └── task.py
│   └── tests/
│       ├── __init__.py
│       ├── conftest.py
│       ├── test_api/
│       │   ├── test_auth.py
│       │   └── test_tasks.py
│       └── test_models/
├── alembic/
│   ├── versions/
│   ├── alembic.ini
│   └── env.py
├── docker/
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   └── docker-entrypoint.sh
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── security.yml
│       └── release.yml
├── requirements/
│   ├── base.txt
│   ├── dev.txt
│   └── prod.txt
├── scripts/
│   ├── format.sh
│   ├── lint.sh
│   └── test.sh
├── docker-compose.yml
├── docker-compose.dev.yml
├── pyproject.toml
├── .pre-commit-config.yaml
├── .dockerignore
├── .gitignore
├── container-structure-test.yaml
└── README.md
```

## Docker Strategy

### Multi-Stage Production Dockerfile
```dockerfile
# Python base
FROM python:3.11-slim as python-base
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Build stage
FROM python-base as builder
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements/prod.txt /tmp/
RUN pip install --user -r /tmp/prod.txt

# Production stage
FROM python-base as production
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd -r appuser \
    && useradd -r -g appuser appuser

# Copy installed packages
COPY --from=builder /root/.local /home/appuser/.local
ENV PATH=/home/appuser/.local/bin:$PATH

WORKDIR /app
COPY --chown=appuser:appuser app/ ./app/
COPY --chown=appuser:appuser alembic/ ./alembic/
COPY --chown=appuser:appuser alembic.ini ./
COPY --chown=appuser:appuser docker/docker-entrypoint.sh ./

USER appuser
EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Development Dockerfile
```dockerfile
FROM python:3.11-slim as development

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dev dependencies
COPY requirements/dev.txt ./
RUN pip install -r dev.txt

# Install pre-commit hooks
COPY .pre-commit-config.yaml ./
RUN pre-commit install

VOLUME ["/app"]
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
```

## CI/CD Pipeline Features

### 1. Code Quality & Linting
```yaml
quality:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'
        
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements/dev.txt
        
    - name: Format check (Black)
      run: black --check --diff app/
      
    - name: Import sorting (isort)
      run: isort --check-only --diff app/
      
    - name: Linting (flake8)
      run: flake8 app/
      
    - name: Type checking (mypy)
      run: mypy app/
      
    - name: Security check (bandit)
      run: bandit -r app/ -f json -o bandit-report.json
      
    - name: Upload security scan
      uses: github/codeql-action/upload-sarif@v2
      if: always()
      with:
        sarif_file: bandit-report.json
```

### 2. Testing Matrix
```yaml
test:
  runs-on: ubuntu-latest
  strategy:
    matrix:
      python-version: ['3.9', '3.10', '3.11', '3.12']
  services:
    postgres:
      image: postgres:15
      env:
        POSTGRES_PASSWORD: testpass
        POSTGRES_DB: testdb
      options: >-
        --health-cmd pg_isready
        --health-interval 10s
        --health-timeout 5s
        --health-retries 5
    redis:
      image: redis:7-alpine
      options: >-
        --health-cmd "redis-cli ping"
        --health-interval 10s
        --health-timeout 5s
        --health-retries 5
        
  steps:
    - name: Run tests
      run: |
        pytest \
          --cov=app \
          --cov-report=xml \
          --cov-report=html \
          --junitxml=pytest-report.xml \
          -v
          
    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage.xml
        flags: unittests
        name: codecov-umbrella
```

### 3. Security & Dependency Scanning
```yaml
security:
  runs-on: ubuntu-latest
  steps:
    - name: Dependency vulnerability scan
      uses: pypa/gh-action-pip-audit@v1.0.8
      with:
        inputs: requirements/prod.txt
        
    - name: Build Docker image
      run: docker build -t python-fastapi:test .
      
    - name: Container security scan
      uses: aquasecurity/trivy-action@master
      with:
        image-ref: python-fastapi:test
        format: sarif
        output: trivy-results.sarif
        
    - name: SAST scan
      uses: github/codeql-action/init@v2
      with:
        languages: python
        queries: security-extended
```

### 4. Container Structure Tests
```yaml
schemaVersion: 2.0.0
fileExistenceTests:
  - name: 'Application exists'
    path: '/app'
    shouldExist: true
  - name: 'Entrypoint script exists'
    path: '/app/docker-entrypoint.sh'
    shouldExist: true
    permissions: '-rwxr-xr-x'
    
commandTests:
  - name: 'Python version'
    command: 'python'
    args: ['--version']
    expectedOutput: ['Python 3.11']
    
  - name: 'Non-root user'
    command: 'whoami'
    expectedOutput: ['appuser']
    
  - name: 'FastAPI import'
    command: 'python'
    args: ['-c', 'import fastapi; print("FastAPI OK")']
    expectedOutput: ['FastAPI OK']
    
  - name: 'Health check endpoint'
    setup: [['python', '-m', 'uvicorn', 'app.main:app', '--host', '0.0.0.0', '--port', '8000']]
    command: 'curl'
    args: ['-f', 'http://localhost:8000/health']
    exitCode: 0
```

### 5. Integration Testing
```yaml
integration:
  runs-on: ubuntu-latest
  steps:
    - name: Start services
      run: |
        docker-compose -f docker-compose.yml up -d
        sleep 30
        
    - name: Run integration tests
      run: |
        pytest tests/integration/ -v
        
    - name: API contract testing
      run: |
        # Using Postman/Newman
        newman run postman_collection.json \
          --environment postman_environment.json \
          --reporters cli,junit \
          --reporter-junit-export newman-report.xml
          
    - name: Load testing
      run: |
        locust -f tests/load/locustfile.py \
          --host http://localhost:8000 \
          --users 50 \
          --spawn-rate 5 \
          --run-time 2m \
          --headless
```

## Testing Strategy

### Unit Tests with Pytest
```python
# app/tests/test_api/test_tasks.py
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.core.database import get_db
from app.tests.conftest import override_get_db

client = TestClient(app)
app.dependency_overrides[get_db] = override_get_db


def test_create_task():
    """Test task creation endpoint."""
    task_data = {
        "title": "Test Task",
        "description": "Test Description",
        "priority": "high"
    }
    
    response = client.post("/api/v1/tasks/", json=task_data)
    
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == task_data["title"]
    assert "id" in data


@pytest.mark.asyncio
async def test_async_task_processing():
    """Test async task processing."""
    from app.core.tasks import process_task_async
    
    result = await process_task_async(task_id=1)
    assert result["status"] == "completed"
```

### Fixtures and Test Configuration
```python
# app/tests/conftest.py
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.main import app

# Test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


@pytest.fixture
def client():
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as client:
        yield client
    app.dependency_overrides.clear()


@pytest.fixture
def authenticated_client(client):
    # Create test user and get auth token
    response = client.post("/auth/login", json={
        "username": "testuser",
        "password": "testpass"
    })
    token = response.json()["access_token"]
    client.headers = {"Authorization": f"Bearer {token}"}
    return client
```

## Advanced Features

### 1. Background Task Processing
```python
# app/core/tasks.py
from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "tasks",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL
)

@celery_app.task
def send_email_task(email: str, subject: str, body: str):
    # Email sending logic
    pass

@celery_app.task
def generate_report_task(user_id: int):
    # Report generation logic
    pass
```

### 2. Database Migrations
```python
# alembic/versions/001_initial.py
from alembic import op
import sqlalchemy as sa

def upgrade():
    op.create_table(
        'users',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('email', sa.String(255), unique=True, nullable=False),
        sa.Column('hashed_password', sa.String(255), nullable=False),
        sa.Column('is_active', sa.Boolean, default=True),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now())
    )

def downgrade():
    op.drop_table('users')
```

### 3. Monitoring and Observability
```python
# app/core/monitoring.py
from prometheus_client import Counter, Histogram, generate_latest
import time

REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint'])
REQUEST_LATENCY = Histogram('http_request_duration_seconds', 'HTTP request latency')

@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    
    REQUEST_COUNT.labels(method=request.method, endpoint=request.url.path).inc()
    REQUEST_LATENCY.observe(duration)
    
    return response
```

## Learning Objectives

By completing this demo, engineers will learn:

1. **Modern Python Development**
   - FastAPI framework and async programming
   - Type hints and Pydantic models
   - SQLAlchemy ORM and Alembic migrations

2. **Testing Best Practices**
   - Pytest fixtures and parametrization
   - Mocking and dependency injection
   - Test coverage and reporting

3. **Container Optimization**
   - Multi-stage builds for Python
   - Dependency management and caching
   - Security hardening

4. **CI/CD Patterns**
   - Matrix testing across Python versions
   - Automated code quality checks
   - Security and dependency scanning

5. **Production Readiness**
   - Monitoring and metrics
   - Structured logging
   - Health checks and graceful shutdown

## Prerequisites

- Basic Python knowledge
- Understanding of REST APIs
- Basic SQL knowledge
- Docker fundamentals

## Estimated Time

- **Setup**: 20 minutes
- **Code exploration**: 1-2 hours
- **Running locally**: 30 minutes
- **CI/CD pipeline study**: 2-3 hours
- **Customization**: 2-4 hours

## Success Criteria

1. Application starts and serves requests
2. All tests pass in CI pipeline
3. API documentation is accessible
4. Security scans pass
5. Container structure tests validate
6. Load tests meet performance requirements