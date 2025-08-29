# Go Microservice Demo Proposal

## Overview

This demo demonstrates building a high-performance Go microservice with modern Go practices, including comprehensive testing, containerization, and CI/CD pipelines. It showcases Go's strengths in building scalable, concurrent applications.

## Application Design

### Project: URL Shortener Microservice
- **Framework**: Gin HTTP framework with custom middleware
- **Database**: Redis for URL storage and PostgreSQL for analytics
- **Configuration**: Viper for configuration management
- **Logging**: Structured logging with Zap
- **Metrics**: Prometheus metrics with custom collectors
- **Testing**: Testify for assertions and Ginkgo for BDD-style tests

### Features
- URL shortening with custom aliases
- Click tracking and analytics
- Rate limiting per IP/user
- URL expiration and cleanup
- Health checks and metrics endpoints
- Graceful shutdown handling
- Distributed tracing with OpenTelemetry
- API key authentication

### Directory Structure
```
demos/go-service/
├── cmd/
│   └── server/
│       └── main.go
├── internal/
│   ├── config/
│   │   └── config.go
│   ├── handlers/
│   │   ├── health.go
│   │   ├── metrics.go
│   │   ├── shorten.go
│   │   └── redirect.go
│   ├── middleware/
│   │   ├── auth.go
│   │   ├── logging.go
│   │   ├── ratelimit.go
│   │   └── recovery.go
│   ├── models/
│   │   ├── url.go
│   │   └── analytics.go
│   ├── services/
│   │   ├── url.go
│   │   ├── analytics.go
│   │   └── cache.go
│   ├── storage/
│   │   ├── redis.go
│   │   └── postgres.go
│   └── utils/
│       ├── hash.go
│       ├── validator.go
│       └── logger.go
├── pkg/
│   ├── api/
│   │   └── types.go
│   └── errors/
│       └── errors.go
├── tests/
│   ├── unit/
│   │   ├── handlers/
│   │   ├── services/
│   │   └── utils/
│   ├── integration/
│   │   └── api/
│   └── benchmarks/
│       └── performance/
├── docker/
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   └── docker-entrypoint.sh
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── security.yml
│       └── release.yml
├── deployments/
│   ├── docker-compose.yml
│   └── k8s/
│       ├── deployment.yaml
│       ├── service.yaml
│       └── ingress.yaml
├── scripts/
│   ├── build.sh
│   ├── test.sh
│   └── benchmark.sh
├── go.mod
├── go.sum
├── Makefile
├── .golangci.yml
├── container-structure-test.yaml
└── README.md
```

## Docker Strategy

### Multi-Stage Production Dockerfile
```dockerfile
# Build stage
FROM golang:1.21-alpine AS builder

# Install git and ca-certificates for dependency fetching
RUN apk add --no-cache git ca-certificates tzdata

# Create build directory
WORKDIR /build

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build binary with optimizations
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -ldflags='-w -s -extldflags "-static"' \
    -a -installsuffix cgo \
    -o app cmd/server/main.go

# Final stage - minimal image
FROM scratch

# Copy CA certificates for HTTPS requests
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

# Copy timezone data
COPY --from=builder /usr/share/zoneinfo /usr/share/zoneinfo

# Copy binary
COPY --from=builder /build/app /app

# Create non-root user (using numeric ID for scratch)
USER 65534:65534

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD ["/app", "-health-check"]

ENTRYPOINT ["/app"]
```

### Development Dockerfile
```dockerfile
FROM golang:1.21-alpine AS development

# Install development tools
RUN apk add --no-cache \
    git \
    make \
    curl \
    bash \
    gcc \
    musl-dev

# Install development tools
RUN go install github.com/cosmtrek/air@latest && \
    go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest && \
    go install github.com/swaggo/swag/cmd/swag@latest

WORKDIR /app

# Copy go mod files for dependency caching
COPY go.mod go.sum ./
RUN go mod download

VOLUME ["/app"]
EXPOSE 8080

CMD ["air", "-c", ".air.toml"]
```

## CI/CD Pipeline Features

### 1. Code Quality & Linting
```yaml
quality:
  runs-on: ubuntu-latest
  strategy:
    matrix:
      go-version: ['1.20', '1.21']
  steps:
    - uses: actions/checkout@v4
    
    - name: Set up Go ${{ matrix.go-version }}
      uses: actions/setup-go@v4
      with:
        go-version: ${{ matrix.go-version }}
        
    - name: Cache Go modules
      uses: actions/cache@v3
      with:
        path: ~/go/pkg/mod
        key: ${{ runner.os }}-go-${{ hashFiles('**/go.sum') }}
        
    - name: Download dependencies
      run: go mod download
      
    - name: Verify dependencies
      run: go mod verify
      
    - name: Format check
      run: |
        if [ "$(gofmt -s -l . | wc -l)" -gt 0 ]; then
          gofmt -s -l .
          exit 1
        fi
        
    - name: Lint
      uses: golangci/golangci-lint-action@v3
      with:
        version: latest
        args: --timeout=5m
        
    - name: Vet
      run: go vet ./...
      
    - name: Security scan
      uses: securecodewarrior/github-action-gosec@master
      with:
        args: './...'
```

### 2. Testing Strategy
```yaml
test:
  runs-on: ubuntu-latest
  services:
    redis:
      image: redis:7-alpine
      options: >-
        --health-cmd "redis-cli ping"
        --health-interval 10s
        --health-timeout 5s
        --health-retries 5
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
        
  steps:
    - name: Run unit tests
      run: |
        go test -v -race -coverprofile=coverage.out ./...
        
    - name: Run integration tests
      env:
        REDIS_URL: redis://localhost:6379
        DATABASE_URL: postgres://postgres:testpass@localhost:5432/testdb?sslmode=disable
      run: |
        go test -v -tags=integration ./tests/integration/...
        
    - name: Run benchmarks
      run: |
        go test -bench=. -benchmem ./tests/benchmarks/...
        
    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage.out
        flags: unittests
```

### 3. Build & Release
```yaml
build:
  runs-on: ubuntu-latest
  strategy:
    matrix:
      goos: [linux, windows, darwin]
      goarch: [amd64, arm64]
      exclude:
        - goos: windows
          goarch: arm64
          
  steps:
    - name: Build binary
      env:
        GOOS: ${{ matrix.goos }}
        GOARCH: ${{ matrix.goarch }}
      run: |
        go build -v \
          -ldflags="-X main.Version=${{ github.ref_name }} -X main.BuildTime=$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
          -o bin/url-shortener-${{ matrix.goos }}-${{ matrix.goarch }}$([ "${{ matrix.goos }}" = "windows" ] && echo ".exe" || echo "") \
          cmd/server/main.go
          
    - name: Upload artifacts
      uses: actions/upload-artifact@v3
      with:
        name: binaries
        path: bin/
```

### 4. Container Security
```yaml
security:
  runs-on: ubuntu-latest
  steps:
    - name: Build Docker image
      run: docker build -t go-service:test .
      
    - name: Run Trivy vulnerability scanner
      uses: aquasecurity/trivy-action@master
      with:
        image-ref: go-service:test
        format: sarif
        output: trivy-results.sarif
        
    - name: Run container structure tests
      uses: plexsystems/container-structure-test-action@v0.3.0
      with:
        image: go-service:test
        config: container-structure-test.yaml
```

## Testing Strategy

### Unit Tests with Testify
```go
// tests/unit/services/url_test.go
package services_test

import (
    "context"
    "testing"
    "time"

    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/mock"
    "github.com/stretchr/testify/suite"

    "your-repo/internal/services"
    "your-repo/tests/mocks"
)

type URLServiceTestSuite struct {
    suite.Suite
    service     *services.URLService
    mockStorage *mocks.StorageMock
}

func (suite *URLServiceTestSuite) SetupTest() {
    suite.mockStorage = &mocks.StorageMock{}
    suite.service = services.NewURLService(suite.mockStorage)
}

func (suite *URLServiceTestSuite) TestShortenURL_Success() {
    // Arrange
    originalURL := "https://example.com/very/long/url"
    expectedShort := "abc123"
    
    suite.mockStorage.On("Store", mock.AnythingOfType("string"), originalURL, mock.AnythingOfType("time.Duration")).
        Return(nil)
    suite.mockStorage.On("GenerateShortCode").Return(expectedShort)

    // Act
    result, err := suite.service.ShortenURL(context.Background(), originalURL, time.Hour*24)

    // Assert
    assert.NoError(suite.T(), err)
    assert.Equal(suite.T(), expectedShort, result.ShortCode)
    assert.Equal(suite.T(), originalURL, result.OriginalURL)
    suite.mockStorage.AssertExpectations(suite.T())
}

func TestURLServiceTestSuite(t *testing.T) {
    suite.Run(t, new(URLServiceTestSuite))
}
```

### Benchmark Tests
```go
// tests/benchmarks/performance/url_bench_test.go
package performance

import (
    "context"
    "testing"
    "time"

    "your-repo/internal/services"
)

func BenchmarkURLService_ShortenURL(b *testing.B) {
    service := services.NewURLService(setupBenchmarkStorage())
    ctx := context.Background()
    url := "https://example.com/test"

    b.ResetTimer()
    b.RunParallel(func(pb *testing.PB) {
        for pb.Next() {
            _, err := service.ShortenURL(ctx, url, time.Hour)
            if err != nil {
                b.Fatal(err)
            }
        }
    })
}

func BenchmarkURLService_RedirectURL(b *testing.B) {
    service := setupBenchmarkServiceWithData()
    ctx := context.Background()
    shortCode := "test123"

    b.ResetTimer()
    for i := 0; i < b.N; i++ {
        _, err := service.GetOriginalURL(ctx, shortCode)
        if err != nil {
            b.Fatal(err)
        }
    }
}
```

### Integration Tests
```go
// tests/integration/api/url_integration_test.go
//go:build integration

package api_test

import (
    "bytes"
    "encoding/json"
    "net/http"
    "net/http/httptest"
    "testing"

    "github.com/gin-gonic/gin"
    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/suite"

    "your-repo/cmd/server"
    "your-repo/internal/config"
)

type APIIntegrationTestSuite struct {
    suite.Suite
    router *gin.Engine
    server *httptest.Server
}

func (suite *APIIntegrationTestSuite) SetupSuite() {
    gin.SetMode(gin.TestMode)
    cfg := config.LoadTestConfig()
    suite.router = server.SetupRouter(cfg)
    suite.server = httptest.NewServer(suite.router)
}

func (suite *APIIntegrationTestSuite) TearDownSuite() {
    suite.server.Close()
}

func (suite *APIIntegrationTestSuite) TestFullURLWorkflow() {
    // Test URL shortening
    shortenReq := map[string]interface{}{
        "url": "https://example.com/test",
        "expires_in": "24h",
    }
    
    reqBody, _ := json.Marshal(shortenReq)
    resp, err := http.Post(
        suite.server.URL+"/api/v1/shorten",
        "application/json",
        bytes.NewBuffer(reqBody),
    )
    
    assert.NoError(suite.T(), err)
    assert.Equal(suite.T(), http.StatusCreated, resp.StatusCode)
    
    var shortenResp map[string]string
    json.NewDecoder(resp.Body).Decode(&shortenResp)
    shortCode := shortenResp["short_code"]
    
    // Test URL redirection
    redirectResp, err := http.Get(suite.server.URL + "/r/" + shortCode)
    assert.NoError(suite.T(), err)
    assert.Equal(suite.T(), http.StatusMovedPermanently, redirectResp.StatusCode)
}

func TestAPIIntegrationTestSuite(t *testing.T) {
    suite.Run(t, new(APIIntegrationTestSuite))
}
```

## Configuration Management

### Configuration with Viper
```go
// internal/config/config.go
package config

import (
    "time"

    "github.com/spf13/viper"
)

type Config struct {
    Server   ServerConfig   `mapstructure:"server"`
    Database DatabaseConfig `mapstructure:"database"`
    Redis    RedisConfig    `mapstructure:"redis"`
    Auth     AuthConfig     `mapstructure:"auth"`
    Logging  LoggingConfig  `mapstructure:"logging"`
}

type ServerConfig struct {
    Host         string        `mapstructure:"host"`
    Port         int           `mapstructure:"port"`
    ReadTimeout  time.Duration `mapstructure:"read_timeout"`
    WriteTimeout time.Duration `mapstructure:"write_timeout"`
    IdleTimeout  time.Duration `mapstructure:"idle_timeout"`
}

func LoadConfig() (*Config, error) {
    viper.SetDefault("server.host", "0.0.0.0")
    viper.SetDefault("server.port", 8080)
    viper.SetDefault("server.read_timeout", "10s")
    viper.SetDefault("server.write_timeout", "10s")
    viper.SetDefault("server.idle_timeout", "60s")

    viper.AutomaticEnv()
    viper.SetEnvPrefix("APP")

    var config Config
    if err := viper.Unmarshal(&config); err != nil {
        return nil, err
    }

    return &config, nil
}
```

## Advanced Features

### 1. Graceful Shutdown
```go
// cmd/server/main.go
func main() {
    cfg, err := config.LoadConfig()
    if err != nil {
        log.Fatal("Failed to load config:", err)
    }

    router := setupRouter(cfg)
    
    srv := &http.Server{
        Addr:         fmt.Sprintf(":%d", cfg.Server.Port),
        Handler:      router,
        ReadTimeout:  cfg.Server.ReadTimeout,
        WriteTimeout: cfg.Server.WriteTimeout,
        IdleTimeout:  cfg.Server.IdleTimeout,
    }

    // Start server in goroutine
    go func() {
        if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
            log.Fatal("Failed to start server:", err)
        }
    }()

    // Wait for interrupt signal
    quit := make(chan os.Signal, 1)
    signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
    <-quit

    log.Println("Shutting down server...")

    // Graceful shutdown with timeout
    ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
    defer cancel()

    if err := srv.Shutdown(ctx); err != nil {
        log.Fatal("Server forced to shutdown:", err)
    }

    log.Println("Server exited")
}
```

### 2. Middleware Stack
```go
// internal/middleware/logging.go
func LoggingMiddleware(logger *zap.Logger) gin.HandlerFunc {
    return gin.LoggerWithFormatter(func(param gin.LogFormatterParams) string {
        logger.Info("HTTP Request",
            zap.String("method", param.Method),
            zap.String("path", param.Path),
            zap.Int("status", param.StatusCode),
            zap.Duration("latency", param.Latency),
            zap.String("client_ip", param.ClientIP),
            zap.String("user_agent", param.Request.UserAgent()),
        )
        return ""
    })
}

// internal/middleware/ratelimit.go
func RateLimitMiddleware(limiter *rate.Limiter) gin.HandlerFunc {
    return func(c *gin.Context) {
        if !limiter.Allow() {
            c.JSON(http.StatusTooManyRequests, gin.H{
                "error": "Rate limit exceeded",
            })
            c.Abort()
            return
        }
        c.Next()
    }
}
```

## Container Structure Tests
```yaml
schemaVersion: 2.0.0
fileExistenceTests:
  - name: 'Binary exists'
    path: '/app'
    shouldExist: true
    permissions: '-rwxr-xr-x'
    
  - name: 'CA certificates exist'
    path: '/etc/ssl/certs/ca-certificates.crt'
    shouldExist: true
    
commandTests:
  - name: 'Application version'
    command: '/app'
    args: ['-version']
    exitCode: 0
    
  - name: 'Health check'
    command: '/app'
    args: ['-health-check']
    exitCode: 0
    
metadataTest:
  user: '65534'
  exposedPorts: ['8080']
  
licenseTests:
  - debian: false
```

## Learning Objectives

Engineers will learn:

1. **Modern Go Development**
   - Go modules and dependency management
   - Gin framework and middleware patterns
   - Structured logging and configuration

2. **Concurrency Patterns**
   - Goroutines and channels
   - Context usage for cancellation
   - Race condition prevention

3. **Performance Optimization**
   - Benchmarking and profiling
   - Memory optimization techniques
   - CPU and memory profiling

4. **Production Best Practices**
   - Graceful shutdown patterns
   - Health check implementation
   - Observability and monitoring

5. **Container Optimization**
   - Multi-stage builds for Go
   - Minimal container images (scratch)
   - Security considerations

## Prerequisites

- Basic Go knowledge
- HTTP and REST API concepts
- Basic understanding of containerization
- Familiarity with Redis/PostgreSQL

## Estimated Time

- **Setup**: 20 minutes
- **Code exploration**: 2-3 hours
- **Local development**: 1 hour
- **CI/CD pipeline study**: 2-3 hours
- **Performance optimization**: 2-4 hours

## Success Criteria

1. Application builds and runs efficiently
2. All tests pass including benchmarks
3. Container image is minimal (<10MB)
4. API responds under 10ms for cached URLs
5. Security scans pass
6. Graceful shutdown works correctly