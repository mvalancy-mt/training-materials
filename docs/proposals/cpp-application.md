# C++ Application Demo Proposal

## Overview

This demo showcases containerizing a C++ application with modern build systems and implementing comprehensive CI/CD pipelines. It demonstrates best practices for C++ development in containerized environments.

## Application Design

### Project: HTTP Server with REST API
- **Framework**: cpp-httplib or Crow framework
- **Build System**: CMake with vcpkg for dependency management
- **Testing**: Google Test (gtest) framework
- **Documentation**: Doxygen for API documentation

### Features
- RESTful API endpoints (GET, POST, PUT, DELETE)
- JSON request/response handling
- Basic authentication middleware
- Health check endpoint
- Prometheus metrics endpoint
- Configuration via environment variables
- Structured logging

### Directory Structure
```
demos/cpp-app/
├── src/
│   ├── main.cpp
│   ├── server.cpp
│   ├── handlers/
│   │   ├── health.cpp
│   │   ├── users.cpp
│   │   └── metrics.cpp
│   └── utils/
│       ├── config.cpp
│       ├── logger.cpp
│       └── json_helper.cpp
├── include/
│   ├── server.hpp
│   ├── handlers/
│   └── utils/
├── tests/
│   ├── unit/
│   │   ├── test_server.cpp
│   │   └── test_handlers.cpp
│   └── integration/
│       └── test_api.cpp
├── docker/
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   └── scripts/
│       ├── build.sh
│       └── test.sh
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── security.yml
│       └── release.yml
├── CMakeLists.txt
├── vcpkg.json
├── conanfile.txt
├── docker-compose.yml
├── .clang-format
├── .clang-tidy
├── container-structure-test.yaml
└── README.md
```

## Docker Strategy

### Multi-Stage Dockerfile
```dockerfile
# Build stage
FROM ubuntu:22.04 AS builder
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    git \
    pkg-config \
    curl \
    zip \
    unzip \
    tar
    
# Install vcpkg
WORKDIR /vcpkg
COPY vcpkg.json ./
RUN git clone https://github.com/Microsoft/vcpkg.git . && \
    ./bootstrap-vcpkg.sh && \
    ./vcpkg install

WORKDIR /app
COPY CMakeLists.txt ./
COPY src/ ./src/
COPY include/ ./include/

RUN cmake -B build -S . -DCMAKE_BUILD_TYPE=Release \
    -DCMAKE_TOOLCHAIN_FILE=/vcpkg/scripts/buildsystems/vcpkg.cmake && \
    cmake --build build --parallel $(nproc)

# Production stage
FROM ubuntu:22.04 AS production
RUN apt-get update && apt-get install -y \
    ca-certificates && \
    rm -rf /var/lib/apt/lists/* && \
    groupadd -r appuser && \
    useradd -r -g appuser appuser

WORKDIR /app
COPY --from=builder /app/build/cpp-app ./
COPY --from=builder /app/config/ ./config/

USER appuser
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

CMD ["./cpp-app"]
```

### Development Dockerfile
```dockerfile
FROM ubuntu:22.04 AS development
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    gdb \
    valgrind \
    clang-format \
    clang-tidy \
    doxygen \
    curl \
    git

WORKDIR /app
VOLUME ["/app"]
CMD ["bash"]
```

## CI/CD Pipeline Features

### 1. Code Quality & Static Analysis
```yaml
quality:
  runs-on: ubuntu-latest
  steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup C++
      uses: aminya/setup-cpp@v1
      with:
        compiler: gcc
        cmake: true
        
    - name: Format check
      run: |
        find src include -name "*.cpp" -o -name "*.hpp" | \
        xargs clang-format --dry-run --Werror
        
    - name: Static analysis
      run: |
        clang-tidy src/*.cpp include/*.hpp -- \
        -I./include -std=c++17
        
    - name: CPP Check
      uses: deep-thought/cppcheck-action@main
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
```

### 2. Build & Test Matrix
```yaml
build:
  runs-on: ${{ matrix.os }}
  strategy:
    matrix:
      os: [ubuntu-latest, ubuntu-20.04]
      compiler: [gcc, clang]
      build-type: [Debug, Release]
  steps:
    - name: Build
      run: |
        cmake -B build -S . \
        -DCMAKE_BUILD_TYPE=${{ matrix.build-type }} \
        -DCMAKE_CXX_COMPILER=${{ matrix.compiler == 'clang' && 'clang++' || 'g++' }}
        cmake --build build --parallel
        
    - name: Run tests
      run: |
        cd build
        ctest --output-on-failure --parallel
        
    - name: Memory leak check
      if: matrix.build-type == 'Debug'
      run: |
        valgrind --leak-check=full --error-exitcode=1 \
        ./build/tests/unit_tests
```

### 3. Security Scanning
```yaml
security:
  runs-on: ubuntu-latest
  steps:
    - name: Build Docker image
      run: docker build -t cpp-app:test .
      
    - name: Container security scan
      uses: aquasecurity/trivy-action@master
      with:
        image-ref: cpp-app:test
        format: sarif
        output: trivy-results.sarif
        
    - name: Upload scan results
      uses: github/codeql-action/upload-sarif@v2
      with:
        sarif_file: trivy-results.sarif
```

### 4. Container Structure Tests
```yaml
schemaVersion: 2.0.0
fileExistenceTests:
  - name: 'Application binary exists'
    path: '/app/cpp-app'
    shouldExist: true
  - name: 'Config directory exists'
    path: '/app/config'
    shouldExist: true
    
commandTests:
  - name: 'Application runs'
    command: '/app/cpp-app'
    args: ['--version']
    exitCode: 0
    
  - name: 'Non-root user'
    command: 'whoami'
    expectedOutput: ['appuser']
    
licenseTests:
  - debian: true
    files: ['/usr/share/doc/*/copyright']
```

### 5. Performance Testing
```yaml
performance:
  runs-on: ubuntu-latest
  steps:
    - name: Start application
      run: |
        docker run -d -p 8080:8080 --name test-app cpp-app:test
        sleep 5
        
    - name: Load testing
      run: |
        # Using Apache Bench
        ab -n 1000 -c 10 http://localhost:8080/health
        
        # Using wrk
        wrk -t4 -c40 -d30s --latency http://localhost:8080/api/users
        
    - name: Resource monitoring
      run: |
        docker stats --no-stream test-app
```

## Testing Strategy

### Unit Tests (Google Test)
```cpp
#include <gtest/gtest.h>
#include "server.hpp"

class ServerTest : public ::testing::Test {
protected:
    void SetUp() override {
        server = std::make_unique<HttpServer>(8081);
    }
    
    std::unique_ptr<HttpServer> server;
};

TEST_F(ServerTest, HealthEndpointReturnsOk) {
    auto response = server->get("/health");
    EXPECT_EQ(response.status, 200);
    EXPECT_EQ(response.body, "{\"status\":\"ok\"}");
}
```

### Integration Tests
```cpp
TEST(IntegrationTest, FullApiWorkflow) {
    // Start server in background thread
    auto server_thread = std::thread([]() {
        HttpServer server(8082);
        server.start();
    });
    
    // Wait for server startup
    std::this_thread::sleep_for(std::chrono::seconds(1));
    
    // Test API endpoints
    httplib::Client client("http://localhost:8082");
    
    auto res = client.Post("/api/users", 
                          "{\"name\":\"test\"}", 
                          "application/json");
    ASSERT_TRUE(res);
    EXPECT_EQ(res->status, 201);
    
    // Cleanup
    server_thread.detach();
}
```

## Advanced Features

### 1. Cross-Platform Builds
- Windows (MSVC), Linux (GCC/Clang), macOS support
- ARM64 and AMD64 architecture support

### 2. Package Management
- vcpkg for C++ libraries
- Conan as alternative package manager
- Static vs dynamic linking strategies

### 3. Observability
- OpenTelemetry integration
- Structured logging with spdlog
- Prometheus metrics export
- Health check endpoints

### 4. Security Hardening
- Address Sanitizer (ASan) in debug builds
- Control Flow Integrity (CFI)
- Stack protection
- Non-executable stack

## Learning Objectives

By completing this demo, engineers will learn:

1. **Modern C++ Development**
   - CMake build systems
   - Package management with vcpkg
   - C++17/20 features usage

2. **Container Optimization**
   - Multi-stage builds for C++ applications
   - Minimal base images
   - Static vs dynamic linking considerations

3. **Quality Assurance**
   - Static analysis tools (clang-tidy, cppcheck)
   - Memory leak detection with Valgrind
   - Code formatting with clang-format

4. **Testing Strategies**
   - Unit testing with Google Test
   - Integration testing approaches
   - Performance testing methodologies

5. **Security Best Practices**
   - Container security scanning
   - Vulnerability management
   - Secure coding practices

## Prerequisites

- Basic C++ knowledge (C++11 or later)
- Understanding of build systems (Make/CMake)
- Familiarity with HTTP concepts
- Docker basics

## Estimated Time

- **Setup**: 30 minutes
- **Understanding code**: 1-2 hours
- **Building and testing**: 1 hour
- **CI/CD pipeline exploration**: 2-3 hours
- **Customization exercises**: 2-4 hours

## Success Criteria

1. Application builds successfully in container
2. All tests pass in CI/CD pipeline
3. Security scans show no critical vulnerabilities
4. Container structure tests validate image
5. Performance benchmarks meet requirements
6. Documentation is complete and accurate