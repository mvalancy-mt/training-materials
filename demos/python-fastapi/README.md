# Python FastAPI Demo - Docker + CI/CD

This demo showcases a Python FastAPI application with comprehensive Docker containerization and GitHub Actions CI/CD pipeline.

## Features

- ✅ FastAPI web framework with automatic API documentation
- ✅ Multi-stage Docker build for production optimization  
- ✅ Comprehensive test suite with pytest
- ✅ Code quality tools (Black, isort, flake8, mypy)
- ✅ Security scanning with Bandit and Trivy
- ✅ Container structure testing
- ✅ GitHub Actions CI/CD pipeline
- ✅ Health check endpoints

## API Endpoints

### Core Endpoints
- `GET /` - Root endpoint with API info
- `GET /docs` - Interactive API documentation (Swagger UI)
- `GET /redoc` - Alternative API documentation

### Health Checks
- `GET /health/` - Basic health check
- `GET /health/ready` - Readiness check  
- `GET /health/live` - Liveness check

### Task Management
- `GET /api/v1/tasks/` - List all tasks (with filtering and pagination)
- `POST /api/v1/tasks/` - Create a new task
- `GET /api/v1/tasks/{id}` - Get specific task
- `PUT /api/v1/tasks/{id}` - Update task
- `DELETE /api/v1/tasks/{id}` - Delete task
- `GET /api/v1/tasks/stats/summary` - Get task statistics

## Quick Start

### 1. Using Docker Compose (Recommended)

```bash
# Clone the repository
git clone https://github.com/mvalancy-mt/training-materials.git
cd training-materials/demos/python-fastapi

# Build and start the application
docker-compose up --build

# The API will be available at:
# - http://localhost:8000 - API root
# - http://localhost:8000/docs - Interactive documentation
```

### 2. Local Development

```bash
# Install Python 3.11+
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate

# Install dependencies
pip install -r requirements-dev.txt

# Run the application
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Using Docker Only

```bash
# Build the image
docker build -t python-fastapi .

# Run the container
docker run -p 8000:8000 python-fastapi
```

## Testing the API

### Using curl

```bash
# Health check
curl http://localhost:8000/health

# Create a task
curl -X POST http://localhost:8000/api/v1/tasks/ \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Learn Docker",
    "description": "Complete the Docker training materials",
    "priority": "high",
    "status": "pending"
  }'

# List tasks
curl http://localhost:8000/api/v1/tasks/

# Get task statistics
curl http://localhost:8000/api/v1/tasks/stats/summary
```

### Using the Interactive Docs

1. Open http://localhost:8000/docs in your browser
2. Try out the API endpoints directly in the browser
3. View request/response schemas and examples

## Development Workflow

### Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest app/tests/test_tasks.py -v
```

### Code Quality

```bash
# Format code
black app/

# Sort imports
isort app/

# Lint code
flake8 app/

# Type check
mypy app/

# Security scan
bandit -r app/
```

### Docker Development

```bash
# Build development image
docker build -f Dockerfile.dev -t python-fastapi:dev .

# Run with volume mount for development
docker run -p 8000:8000 -v $(pwd)/app:/app/app python-fastapi:dev
```

## CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/python-fastapi-ci.yml`) includes:

### 1. Code Quality Checks
- ✅ Code formatting (Black)
- ✅ Import sorting (isort)  
- ✅ Linting (flake8)
- ✅ Type checking (mypy)
- ✅ Security scanning (Bandit)

### 2. Testing
- ✅ Unit and integration tests
- ✅ Test coverage reporting
- ✅ Matrix testing across Python versions

### 3. Docker Build & Security
- ✅ Multi-stage Docker build
- ✅ Container security scanning (Trivy)
- ✅ Container structure testing
- ✅ Functional testing of running container

### 4. Performance Testing
- ✅ Load testing with Apache Bench
- ✅ API endpoint performance validation

## Project Structure

```
demos/python-fastapi/
├── app/
│   ├── main.py              # FastAPI application entry point
│   ├── core/
│   │   └── config.py        # Application configuration
│   ├── models/
│   │   └── task.py          # Pydantic models
│   ├── api/
│   │   └── v1/
│   │       ├── tasks.py     # Task API endpoints
│   │       └── health.py    # Health check endpoints
│   └── tests/
│       ├── conftest.py      # Test configuration
│       ├── test_main.py     # Main app tests
│       ├── test_health.py   # Health endpoint tests
│       └── test_tasks.py    # Task API tests
├── Dockerfile               # Production Docker build
├── docker-compose.yml       # Local development setup
├── requirements.txt         # Production dependencies
├── requirements-dev.txt     # Development dependencies
├── pyproject.toml          # Project configuration
├── container-structure-test.yaml  # Container validation
└── README.md               # This file
```

## Learning Objectives

This demo teaches:

### Docker Best Practices
- Multi-stage builds for smaller production images
- Non-root user for security
- Health checks for container monitoring
- Proper dependency management and caching

### CI/CD Patterns
- Automated testing and quality checks
- Security scanning integration
- Container testing strategies
- Performance validation

### Python/FastAPI Development
- Modern Python project structure
- API development with automatic documentation
- Testing strategies for web APIs
- Configuration management

## Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Find and kill process using port 8000
lsof -ti:8000 | xargs kill -9
```

**Docker build fails:**
```bash
# Clear Docker cache
docker system prune -a

# Rebuild without cache
docker build --no-cache -t python-fastapi .
```

**Tests failing:**
```bash
# Install test dependencies
pip install -r requirements-dev.txt

# Run specific failing test
pytest app/tests/test_tasks.py::test_create_task -v
```

## Next Steps

1. **Add Database**: Replace in-memory storage with PostgreSQL
2. **Add Authentication**: Implement JWT-based user authentication
3. **Add Background Tasks**: Use Celery for async task processing
4. **Add Monitoring**: Integrate Prometheus metrics
5. **Add Caching**: Implement Redis caching layer

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and add tests
4. Ensure all CI checks pass: `pytest && black app/ && flake8 app/`
5. Submit a pull request

## License

This project is part of the training-materials repository under the MIT License.