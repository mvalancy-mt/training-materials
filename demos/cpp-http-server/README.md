# C++ HTTP Server - Production CI/CD Demo

A high-performance C++ HTTP server demonstrating production-ready CI/CD practices with comprehensive testing, security scanning, and automated deployments.

## Features

- **RESTful API**: Complete task management API with CRUD operations
- **High Performance**: Built with libmicrohttpd for optimal performance
- **Memory Safety**: Modern C++20 with RAII, smart pointers, and sanitizers
- **Security Hardened**: Stack protection, position independent executable
- **Comprehensive Testing**: Unit tests with address/undefined behavior sanitizers
- **Production Ready**: Multi-stage Docker builds, health checks, graceful shutdown

## API Endpoints

### Health & Monitoring
- `GET /health` - Basic health check
- `GET /health/ready` - Readiness probe
- `GET /health/live` - Liveness probe
- `GET /health/metrics` - System metrics

### Task Management
- `GET /api/v1/tasks` - List all tasks (with filtering & pagination)
- `GET /api/v1/tasks/{id}` - Get specific task
- `POST /api/v1/tasks` - Create new task
- `PUT /api/v1/tasks/{id}` - Update task
- `DELETE /api/v1/tasks/{id}` - Delete task
- `GET /api/v1/tasks/stats/summary` - Task statistics

## Quick Start

### Development (Local)

```bash
# Install dependencies (Ubuntu/Debian)
sudo apt-get update
sudo apt-get install -y build-essential cmake pkg-config \
    libmicrohttpd-dev libjsoncpp-dev libssl-dev

# Build and run
mkdir build && cd build
cmake -DCMAKE_BUILD_TYPE=Debug ..
make -j$(nproc)

# Run tests
make test

# Start server
./http_server 8000
```

### Production (Docker)

```bash
# Build container
docker build -t cpp-http-server:latest .

# Run container
docker run -d -p 8000:8000 --name http-server cpp-http-server:latest

# Health check
curl http://localhost:8000/health
```

## Development Workflow

This project follows the **production-ready branching strategy**:

```bash
# Create feature branch
git checkout develop
git checkout -b feature/new-endpoint

# Make changes and test locally
mkdir build && cd build
cmake -DCMAKE_BUILD_TYPE=Debug ..
make test

# Push feature branch (deploys to test bench)
git push -u origin feature/new-endpoint
# ⚡ Automatically deployed to: testbench-new-endpoint.internal.com

# Create PR to develop (comprehensive CI)
gh pr create --base develop --title "Add new endpoint"
# ⚡ Triggers 95% coverage requirement, security scans

# After merge to develop (test vehicle deployment)
# ⚡ Next day at 6 AM: flashed to all test vehicles

# Release to production
gh pr create --base main --title "Release v1.1.0"  
# ⚡ Ultra-strict CI: 100% coverage, zero vulnerabilities
```

## Architecture

### Core Components

```cpp
namespace http_server {
    class HttpServer {
        // Main HTTP server using libmicrohttpd
        // Thread-safe request handling
        // Graceful shutdown support
    };
    
    class TaskManager {
        // Thread-safe task CRUD operations
        // In-memory storage with atomic operations
        // Statistics and filtering support
    };
    
    class HealthCheck {
        // System health monitoring
        // Kubernetes-ready probes
        // Performance metrics
    };
}
```

### Security Features

- **Memory Safety**: Modern C++20 with RAII patterns
- **Stack Protection**: `-fstack-protector-strong` compilation flag
- **Position Independent**: PIE executable for ASLR
- **Sanitizers**: AddressSanitizer and UBSan in debug builds
- **Dependency Scanning**: Automated vulnerability checks
- **Non-root Container**: Runs as unprivileged user

### Performance Optimizations

- **Zero-Copy**: Efficient string handling and JSON processing
- **Thread Safety**: Lockless operations where possible
- **Connection Pooling**: Efficient HTTP connection management
- **Release Builds**: `-O3` optimization with NDEBUG

## Testing Strategy

### Unit Tests
```bash
# Run all tests with sanitizers
cd build
make test

# Run with coverage
cmake -DCMAKE_BUILD_TYPE=Debug -DENABLE_COVERAGE=ON ..
make test
lcov --capture --directory . --output-file coverage.info
```

### Integration Tests
```bash
# Container health tests
docker run -d -p 8000:8000 cpp-http-server:latest
./scripts/integration-tests.sh
```

### Performance Tests
```bash
# Load testing
ab -n 10000 -c 100 http://localhost:8000/api/v1/tasks
wrk -t12 -c400 -d30s http://localhost:8000/health
```

## CI/CD Pipeline

### Branch Strategy
- **feature/***: HIL test bench deployment, basic CI (90% coverage)
- **develop**: Test vehicle firmware flash daily, comprehensive CI (95% coverage)  
- **main**: Production deployment, ultra-strict CI (100% coverage, zero vulnerabilities)

### Security Scanning
- **Static Analysis**: cppcheck, clang-static-analyzer
- **Dynamic Analysis**: AddressSanitizer, UBSan, Valgrind
- **Dependency Scanning**: Known vulnerability database checks
- **Container Scanning**: Trivy security analysis
- **Secret Detection**: Multi-pattern credential scanning

### Deployment Targets
- **Test Benches**: Automatic HIL deployment for feature branches
- **Test Vehicles**: Daily firmware flash from develop branch
- **Production**: Field-ready deployment from main branch

## Monitoring

### Health Endpoints
- `GET /health` - Returns 200 if server is running
- `GET /health/ready` - Kubernetes readiness probe
- `GET /health/live` - Kubernetes liveness probe
- `GET /health/metrics` - System performance metrics

### Metrics Available
- Memory usage and CPU utilization
- Request count and response times
- Active connections and thread pool status
- Task statistics and database health

## Production Deployment

### Container Registry
```bash
# Tag for production
docker tag cpp-http-server:latest registry.company.com/cpp-http-server:v1.0.0
docker tag cpp-http-server:latest registry.company.com/cpp-http-server:latest

# Deploy to production (from main branch only)
kubectl set image deployment/cpp-http-server app=registry.company.com/cpp-http-server:latest
```

### Zero-Notice Deployment Ready
Every commit to `main` is **immediately field-deployable**:
- 100% test coverage validated
- Zero security vulnerabilities
- Tested on real hardware (test vehicles)
- Performance benchmarks passed
- Ready for customer environments

**Main branch = Production ready. No exceptions.** 🚀