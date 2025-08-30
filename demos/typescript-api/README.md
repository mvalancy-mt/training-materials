# 🔷 TypeScript API Demo - Comprehensive CI/CD Training

**Modern TypeScript/Node.js API with enterprise-grade CI/CD pipeline**

## 🎯 Overview

This TypeScript API demo demonstrates comprehensive CI/CD practices for modern Node.js applications, featuring:

- **Express.js REST API** with TypeScript, Zod validation, and comprehensive error handling
- **Enterprise Security** with Helmet, CORS, rate limiting, and input validation
- **96.33% Test Coverage** with Jest, supertest, and comprehensive test suites
- **Docker Multi-Stage Build** with distroless runtime and security hardening
- **Escalating CI/CD Pipeline** with branch-specific strictness levels

```mermaid
graph TB
    subgraph "🚀 Demo Features"
        A[TypeScript API] --> B[Express.js Server]
        A --> C[Zod Validation]
        A --> D[96.33% Coverage]

        E[Enterprise Security] --> F[Helmet.js Headers]
        E --> G[CORS Protection]
        E --> H[Rate Limiting]

        I[Docker Multi-Stage] --> J[Alpine Build]
        I --> K[Distroless Runtime]
        I --> L[Security Hardening]

        M[CI/CD Pipeline] --> N[Basic CI - 90%]
        M --> O[Comprehensive CI - 95%]
        M --> P[Ultra-Strict CI - 96%+]
    end

    style A fill:#2196f3,color:#ffffff
    style E fill:#ff9800,color:#ffffff
    style I fill:#9c27b0,color:#ffffff
    style M fill:#4caf50,color:#ffffff
```

## 🏗️ Architecture

### Application Structure

```mermaid
flowchart TB
    subgraph "📁 TypeScript API Structure"
        A[src/app.ts<br/>Express.js Server] --> B[src/controllers/<br/>task-controller.ts]
        A --> C[src/middleware/<br/>security.ts]
        A --> D[src/utils/<br/>health.ts]

        B --> E[src/models/<br/>task.ts - Zod Schemas]

        F[tests/<br/>Test Suites] --> G[96.33% Coverage]

        H[Docker/<br/>Multi-Stage] --> I[Alpine Build Stage]
        H --> J[Distroless Runtime]
    end

    style A fill:#1976d2,color:#ffffff
    style B fill:#2e7d32,color:#ffffff
    style F fill:#f9a825,color:#ffffff
    style H fill:#ad1457,color:#ffffff
```

### Core Components

- **Express.js Application** (`src/app.ts`) - Main application server
- **Task Management API** (`src/controllers/task-controller.ts`) - RESTful task operations
- **Zod Data Models** (`src/models/task.ts`) - Type-safe request/response validation
- **Security Middleware** (`src/middleware/security.ts`) - Comprehensive security controls
- **Health Monitoring** (`src/utils/health.ts`) - Application health and readiness checks

### API Endpoints

```mermaid
graph LR
    subgraph "📡 REST API Endpoints"
        A[Client Request] --> B{Route}

        B -->|GET /health| C[Health Status]
        B -->|GET /ready| D[Readiness Check]
        B -->|GET /api/v1/tasks| E[List Tasks]
        B -->|POST /api/v1/tasks| F[Create Task]
        B -->|GET /api/v1/tasks/:id| G[Get Task]
        B -->|PUT /api/v1/tasks/:id| H[Update Task]
        B -->|DELETE /api/v1/tasks/:id| I[Delete Task]
        B -->|GET /api/v1/tasks/stats| J[Task Statistics]

        C --> K[JSON Response]
        D --> K
        E --> K
        F --> K
        G --> K
        H --> K
        I --> K
        J --> K
    end

    style A fill:#1976d2,color:#ffffff
    style K fill:#2e7d32,color:#ffffff
```

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Application health status |
| GET | `/ready` | Readiness probe for Kubernetes |
| GET | `/api/v1/tasks` | List all tasks (with filtering) |
| POST | `/api/v1/tasks` | Create new task |
| GET | `/api/v1/tasks/:id` | Get task by ID |
| PUT | `/api/v1/tasks/:id` | Update existing task |
| DELETE | `/api/v1/tasks/:id` | Delete task |
| GET | `/api/v1/tasks/stats` | Task statistics |

## 🚀 Quick Start

```mermaid
flowchart LR
    A[1. Prerequisites] --> B[2. Local Setup]
    B --> C[3. Development]
    C --> D[4. Testing]
    D --> E[5. Docker Deploy]

    style A fill:#f57c00,color:#ffffff
    style B fill:#9c27b0,color:#ffffff
    style C fill:#2e7d32,color:#ffffff
    style D fill:#1976d2,color:#ffffff
    style E fill:#ad1457,color:#ffffff
```

### Prerequisites
- Node.js 18+ (recommended: 20)
- Docker (optional)
- Git

### Local Development Workflow

```mermaid
flowchart TB
    subgraph "🛠️ Development Setup"
        A[cd demos/typescript-api] --> B[npm install]
        B --> C[cp .env.example .env]
        C --> D[npm run dev]
        D --> E[🌐 http://localhost:3000]

        F[Health Check] --> G[🏥 /health endpoint]
        F --> H[🎯 /ready endpoint]

        I[API Testing] --> J[📝 /api/v1/tasks]
        I --> K[📊 /api/v1/tasks/stats]
    end

    style A fill:#ffecb3
    style E fill:#c8e6c9
    style G fill:#bbdefb
    style H fill:#bbdefb
```

```bash
cd demos/typescript-api

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev

# API available at: http://localhost:3000
# Health check: http://localhost:3000/health
```

### Testing & Quality Assurance

```mermaid
graph TB
    subgraph "🧪 Quality Pipeline"
        A[npm run test:coverage] --> B[96.33% Coverage]
        C[npm run typecheck] --> D[TypeScript Validation]
        E[npm run lint] --> F[ESLint Security]
        G[npm run format:check] --> H[Code Formatting]

        B --> I[Quality Gate ✅]
        D --> I
        F --> I
        H --> I
    end

    style A fill:#fff9c4
    style B fill:#c8e6c9
    style I fill:#4caf50,color:#fff
```

```bash
# Run all tests with coverage
npm run test:coverage

# Type checking
npm run typecheck

# Code formatting
npm run format:check

# ESLint analysis
npm run lint

# Production build
npm run build
npm start
```

### Docker Deployment

```mermaid
flowchart TB
    subgraph "🐳 Docker Deployment"
        A[docker-compose up --build] --> B[Multi-Stage Build]
        B --> C[Alpine Build Stage]
        B --> D[Distroless Runtime]

        E[Production Ready] --> F[🌐 Port 3000]
        E --> G[🔒 Security Hardened]
        E --> H[📊 Health Monitoring]

        I[Optional Monitoring] --> J[Prometheus Stack]
        I --> K[🔍 Metrics UI]
    end

    style A fill:#e3f2fd
    style D fill:#c8e6c9
    style G fill:#ffcdd2
```

```bash
# Build and run with docker-compose
docker-compose up --build

# API available at: http://localhost:3000
# With monitoring: docker-compose --profile monitoring up
```

## 🔒 Security Features

```mermaid
graph TB
    subgraph "🛡️ Multi-Layer Security Architecture"
        subgraph "Application Security"
            A[Helmet.js Headers] --> A1[CSP, HSTS, X-Frame]
            B[CORS Protection] --> B1[Origin Validation]
            C[Rate Limiting] --> C1[100 req/min]
            D[Input Validation] --> D1[Zod Schemas]
            E[Error Handling] --> E1[No Info Leakage]
        end

        subgraph "Container Security"
            F[Distroless Runtime] --> F1[No Shell/Package Manager]
            G[Non-Root User] --> G1[Unprivileged Execution]
            H[Read-Only FS] --> H1[Immutable Runtime]
            I[Capability Drop] --> I1[Minimal Permissions]
            J[Multi-Stage Build] --> J1[Minimal Attack Surface]
        end

        subgraph "CI/CD Security"
            K[Secret Detection] --> K1[Pre-commit Hooks]
            L[Dependency Scan] --> L1[Vulnerability Check]
            M[Container Scan] --> M1[Trivy Analysis]
            N[Zero Vulnerabilities] --> N1[Production Gate]
        end
    end

    style A fill:#ffebee
    style F fill:#fff3e0
    style K fill:#e8f5e9
```

### Built-in Security Controls

- **Helmet.js Integration** - Security headers (CSP, HSTS, X-Frame-Options)
- **CORS Configuration** - Cross-origin resource sharing controls
- **Rate Limiting** - Request throttling (100 requests/minute)
- **Input Validation** - Zod schema validation for all endpoints
- **Error Handling** - Secure error responses without information leakage

### Container Security

- **Distroless Runtime** - No shell, package manager, or unnecessary tools
- **Non-Root User** - Application runs as unprivileged user
- **Read-Only Filesystem** - Container filesystem is read-only
- **Security Capabilities** - All Linux capabilities dropped
- **Multi-Stage Build** - Minimal attack surface

## 📊 Testing Strategy

### Test Coverage by Branch Type

```mermaid
graph LR
    subgraph "📈 Progressive Coverage Requirements"
        A[feature/*<br/>≥90% Coverage] --> B[develop<br/>≥95% Coverage]
        B --> C[main<br/>≥96% Coverage]

        A1[Fast Feedback] --> B1[Enhanced Testing]
        B1 --> C1[Production Ready]

        A2[Basic Security] --> B2[Container Scan]
        B2 --> C2[Zero Vulnerabilities]
    end

    style A fill:#bbdefb
    style B fill:#90caf9
    style C fill:#64b5f6
```

### Current Coverage Achievement

```mermaid
pie title "Test Coverage Distribution - 96.33%"
    "Covered Lines" : 96.33
    "Uncovered Lines" : 3.67
```

| Branch Type | Coverage Requirement | Current Status |
|-------------|---------------------|----------------|
| Feature Branches | ≥90% line coverage | ✅ 96.33% |
| Develop Branch | ≥95% line coverage | ✅ 96.33% |
| Main Branch | ≥96% line coverage | ✅ 96.33% |

### Test Suite Architecture

```mermaid
flowchart TB
    subgraph "🧪 Test Categories"
        A[Unit Tests] --> A1[tests/task.test.ts<br/>API Endpoints]
        A --> A2[tests/security.test.ts<br/>Security Middleware]
        A --> A3[tests/health.test.ts<br/>Health Monitoring]
        A --> A4[tests/complete-coverage.test.ts<br/>Edge Cases]

        B[Integration Tests] --> B1[Full API Workflow]
        B --> B2[Error Handling]
        B --> B3[Rate Limiting]

        C[Quality Gates] --> C1[96.33% Line Coverage]
        C --> C2[96.87% Function Coverage]
        C --> C3[82.25% Branch Coverage]
    end

    style A1 fill:#e1f5fe
    style C1 fill:#4caf50,color:#fff
    style C2 fill:#4caf50,color:#fff
    style C3 fill:#4caf50,color:#fff
```

### Test Categories

- **Unit Tests** (`tests/task.test.ts`) - API endpoint testing
- **Security Tests** (`tests/security.test.ts`) - Security middleware validation
- **Health Tests** (`tests/health.test.ts`) - Health check functionality
- **Coverage Tests** (`tests/complete-coverage.test.ts`) - Edge case validation
- **Integration Tests** - Full API workflow testing

```bash
# Run specific test suites
npm test -- --testPathPattern=task.test.ts
npm test -- --testPathPattern=security.test.ts
npm test -- --testPathPattern=health.test.ts

# Watch mode for development
npm test -- --watch
```

## 🚢 CI/CD Pipeline

### Escalating Pipeline Architecture

```mermaid
flowchart TB
    subgraph "🔄 Progressive CI/CD Pipeline"
        subgraph "Feature Branch CI - ⚡ Basic (90%)"
            A[Code Push] --> A1[Lint & Format]
            A1 --> A2[Unit Tests]
            A2 --> A3[90% Coverage Check]
            A3 --> A4[Basic Security Scan]
            A4 --> A5[✅ Merge to Develop]
        end

        subgraph "Develop Branch CI - ✅ Comprehensive (95%)"
            B[PR to Develop] --> B1[All Basic Checks]
            B1 --> B2[Multi-Node Testing]
            B2 --> B3[95% Coverage Check]
            B3 --> B4[Container Security Scan]
            B4 --> B5[Integration Tests]
            B5 --> B6[✅ Ready for Main]
        end

        subgraph "Main Branch CI - 🚨 Ultra-Strict (96%+)"
            C[PR to Main] --> C1[All Previous Checks]
            C1 --> C2[96%+ Coverage Check]
            C2 --> C3[Zero Vulnerabilities]
            C3 --> C4[Production Simulation]
            C4 --> C5[Performance Tests]
            C5 --> C6[🚀 Production Deploy]
        end
    end

    style A5 fill:#4caf50,color:#fff
    style B6 fill:#2196f3,color:#fff
    style C6 fill:#ff5722,color:#fff
```

### Pipeline Stages by Branch

| Branch | Stage | Requirements | Duration |
|--------|-------|-------------|----------|
| `feature/*` | ⚡ **Basic CI** | 90% coverage, basic security | ~5 min |
| `develop` | ✅ **Comprehensive CI** | 95% coverage, enhanced security, multi-node testing | ~10 min |
| `main` | 🚨 **Ultra-Strict CI** | 96%+ coverage, zero vulnerabilities, production simulation | ~15 min |

### CI/CD Feature Matrix

```mermaid
graph TB
    subgraph "🛠️ CI/CD Capabilities"
        A[Multi-Node Testing] --> A1[Node.js 18, 20, 21]
        B[Security Pipeline] --> B1[Secret Detection]
        B --> B2[Dependency Scan]
        B --> B3[Container Scan - Trivy]
        B --> B4[SAST Analysis]

        C[Quality Gates] --> C1[Progressive Coverage]
        C --> C2[TypeScript Strict]
        C --> C3[ESLint Security]
        C --> C4[Prettier Format]

        D[Production Readiness] --> D1[Docker Build Test]
        D --> D2[Health Check Validation]
        D --> D3[Performance Benchmarks]
        D --> D4[Zero-Downtime Deploy]
    end

    style A1 fill:#e1f5fe
    style B4 fill:#ffebee
    style C1 fill:#e8f5e9
    style D4 fill:#fff3e0
```

### Key CI/CD Features

- **Multi-Node Testing** - Node.js 18, 20, 21 compatibility
- **Advanced Secret Detection** - TypeScript-specific pattern matching
- **Container Security Scanning** - Trivy vulnerability analysis
- **Production Simulation** - Full deployment testing
- **Quality Metrics** - Code analysis and build optimization

## 🐳 Docker Architecture

### Multi-Stage Build Visualization

```mermaid
flowchart TB
    subgraph "🏗️ Docker Multi-Stage Build"
        subgraph "Stage 1: Build Environment"
            A[node:20-alpine] --> A1[npm install]
            A1 --> A2[TypeScript Compilation]
            A2 --> A3[npm prune --production]
            A3 --> A4[Build Artifacts]
        end

        subgraph "Stage 2: Production Runtime"
            B[gcr.io/distroless/nodejs20] --> B1[Copy /dist]
            B1 --> B2[Copy node_modules]
            B2 --> B3[Non-root User: 1001]
            B3 --> B4[Read-only Filesystem]
            B4 --> B5[Health Check Integration]
        end

        A4 --> B1

        subgraph "Security Features"
            C[No Shell] --> C1[No Package Manager]
            C1 --> C2[No Debug Tools]
            C2 --> C3[Minimal Attack Surface]
        end

        B5 --> C
    end

    style A fill:#bbdefb
    style B fill:#c8e6c9
    style C fill:#ffcdd2
```

### Container Security Architecture

```mermaid
graph TB
    subgraph "🔒 Security Layers"
        A[Base Image Security] --> A1[Distroless Runtime]
        A1 --> A2[No Shell/Package Manager]
        A2 --> A3[Minimal Dependencies]

        B[Runtime Security] --> B1[Non-root User: 1001]
        B1 --> B2[Read-only Filesystem]
        B2 --> B3[Dropped Capabilities]

        C[Network Security] --> C1[Port 3000 Only]
        C1 --> C2[Health Check Endpoint]
        C2 --> C3[Graceful Shutdown]

        D[Build Security] --> D1[Multi-stage Optimization]
        D1 --> D2[Production Dependencies Only]
        D2 --> D3[Vulnerability Scanning]
    end

    style A1 fill:#e8f5e9
    style B1 fill:#fff3e0
    style C1 fill:#e3f2fd
    style D1 fill:#fce4ec
```

### Multi-Stage Build Process

```dockerfile
# Stage 1: Build Environment (node:20-alpine)
- Install dependencies
- TypeScript compilation
- Dependency pruning

# Stage 2: Production Runtime (distroless/nodejs20)
- Copy build artifacts only
- Non-root user execution
- Minimal attack surface
```

### Container Features

- **Health Checks** - Built-in container health monitoring
- **Security Hardening** - Distroless base, capability restrictions
- **Resource Optimization** - Multi-stage build for minimal image size
- **Production Ready** - Environment-based configuration

## 📈 Performance & Monitoring

### Health Monitoring Architecture

```mermaid
flowchart TB
    subgraph "📊 Application Monitoring"
        A[Health Endpoint] --> A1[System Status]
        A1 --> A2[Memory Usage %]
        A1 --> A3[Uptime Tracking]
        A1 --> A4[Version Info]

        B[Ready Endpoint] --> B1[Kubernetes Probe]
        B1 --> B2[Database Connection]
        B1 --> B3[External Dependencies]

        C[Performance Metrics] --> C1[Response Times]
        C --> C2[Request Counts]
        C --> C3[Error Rates]
        C --> C4[Memory Utilization]
    end

    subgraph "🔍 Optional Monitoring Stack"
        D[Prometheus] --> D1[Metrics Collection]
        D1 --> D2[Time-series Storage]
        D2 --> D3[Alert Rules]

        E[Grafana] --> E1[Visualization]
        E1 --> E2[Dashboards]
        E1 --> E3[Real-time Charts]
    end

    A --> D
    B --> D
    C --> D

    style A1 fill:#4caf50,color:#fff
    style B1 fill:#2196f3,color:#fff
    style D1 fill:#ff9800,color:#fff
```

### Application Health Response

```mermaid
graph LR
    subgraph "🏥 Health Check Response"
        A[GET /health] --> B{System Status}

        B -->|Healthy| C[Memory < 90%]
        B -->|Degraded| D[Memory 90-95%]
        B -->|Unhealthy| E[Memory > 95%]

        C --> F[200 OK Response]
        D --> G[200 Degraded Response]
        E --> H[503 Unhealthy Response]

        I[Response Includes:] --> J[Uptime: seconds]
        I --> K[Version: 1.0.0]
        I --> L[Memory: used/total/%]
        I --> M[Environment: production]
    end

    style C fill:#4caf50,color:#fff
    style D fill:#ff9800,color:#fff
    style E fill:#f44336,color:#fff
```

### Application Metrics

```bash
# View application metrics
curl http://localhost:3000/health

# Example response:
{
  "success": true,
  "data": {
    "status": "healthy",
    "uptime": 125.432,
    "version": "1.0.0",
    "environment": "production",
    "memory": {
      "used": 45672448,
      "total": 67108864,
      "percentage": 68
    }
  }
}
```

### Optional Prometheus Integration

```mermaid
flowchart LR
    subgraph "📊 Monitoring Stack Deployment"
        A[docker-compose --profile monitoring up] --> B[Prometheus Server]
        B --> C[Metrics Scraping]
        C --> D[Time-series DB]

        E[Application] --> F[/health endpoint]
        F --> G[Metrics Export]
        G --> C

        H[Grafana] --> I[Dashboard UI]
        I --> J[Real-time Charts]
        J --> K[Alert Notifications]
    end

    style B fill:#e65100,color:#fff
    style H fill:#f57c00,color:#fff
    style K fill:#d32f2f,color:#fff
```

```bash
# Start with monitoring stack
docker-compose --profile monitoring up

# Prometheus UI: http://localhost:9090
# Grafana UI: http://localhost:3001
```

## 🔧 Development Workflow

### Development Lifecycle

```mermaid
flowchart TB
    subgraph "🔄 Standard Development Cycle"
        A[Start: checkout develop] --> B[git pull origin develop]
        B --> C[Create feature branch]
        C --> D[Push branch immediately]
        D --> E[Local development]

        E --> F[Code Changes]
        F --> G[npm run dev - Test locally]
        G --> H[npm run test:coverage]
        H --> I{Tests Pass?}

        I -->|No| F
        I -->|Yes| J[git commit & push]
        J --> K[Create PR to develop]
        K --> L[CI Pipeline Runs]
        L --> M{CI Passes?}

        M -->|No| N[Fix Issues]
        N --> F
        M -->|Yes| O[Merge to develop]
        O --> P[Delete feature branch]
    end

    style D fill:#ff9800,color:#fff
    style H fill:#2196f3,color:#fff
    style O fill:#4caf50,color:#fff
```

### Code Quality Pipeline

```mermaid
graph TB
    subgraph "⚡ Quality Standards"
        A[TypeScript Strict Mode] --> A1[Ultra-strict type checking]
        B[ESLint Security Rules] --> B1[eslint-plugin-security]
        C[Prettier Formatting] --> C1[Consistent code style]
        D[Pre-commit Hooks] --> D1[Secret detection]
        D --> D2[Formatting validation]

        E[Quality Gates] --> E1[96.33% Coverage]
        E --> E2[Zero TypeScript Errors]
        E --> E3[No Security Issues]
        E --> E4[Formatted Code]
    end

    style A1 fill:#e1f5fe
    style B1 fill:#ffebee
    style E1 fill:#4caf50,color:#fff
    style E2 fill:#4caf50,color:#fff
```

### Code Quality Standards

- **TypeScript Strict Mode** - Ultra-strict type checking enabled
- **ESLint Security Rules** - Security-focused linting with `eslint-plugin-security`
- **Prettier Formatting** - Consistent code formatting
- **Pre-commit Hooks** - Secret detection and formatting validation

### Branch Protection Strategy

```bash
# Standard development workflow
git checkout develop
git pull origin develop           # Sync with develop
git checkout -b feature/new-api   # Create feature branch
git push -u origin feature/new-api # Push first (SOP)

# Development cycle
npm run dev                       # Local development
npm run test:coverage            # Validate changes
git commit -m "feat: add new API endpoint"

# CI pipeline automatically runs based on branch strictness level
```

## 🎓 Learning Objectives

### Learning Path

```mermaid
flowchart TB
    subgraph "🎯 TypeScript API Learning Journey"
        A[Start Here] --> B[1. Environment Setup]
        B --> C[2. Run Demo Locally]
        C --> D[3. Explore API Endpoints]
        D --> E[4. Examine Test Coverage]
        E --> F[5. Study Security Features]
        F --> G[6. Docker Deployment]
        G --> H[7. CI/CD Pipeline]
        H --> I[8. Make Your Own Changes]

        J[Branch Exercises] --> J1[Feature Branch - Basic CI]
        J1 --> J2[Develop Branch - Comprehensive CI]
        J2 --> J3[Main Branch - Ultra-Strict CI]

        K[Advanced Topics] --> K1[Container Security]
        K --> K2[Production Monitoring]
        K --> K3[Performance Optimization]
    end

    style A fill:#4caf50,color:#fff
    style I fill:#ff9800,color:#fff
    style J3 fill:#d32f2f,color:#fff
```

### Knowledge Areas

```mermaid
graph TB
    subgraph "📚 Core Learning Areas"
        subgraph "TypeScript/Node.js"
            A[Strict Type Checking] --> A1[Type Safety]
            B[Express.js APIs] --> B1[RESTful Design]
            C[Zod Validation] --> C1[Schema-based Validation]
            D[Error Handling] --> D1[Secure Responses]
        end

        subgraph "Testing & Quality"
            E[Jest Testing] --> E1[96.33% Coverage]
            F[Supertest] --> F1[API Integration Tests]
            G[Security Testing] --> G1[Middleware Validation]
            H[Health Checks] --> H1[Monitoring Tests]
        end

        subgraph "DevOps & Deployment"
            I[Docker Multi-Stage] --> I1[Production Optimization]
            J[CI/CD Pipeline] --> J1[Progressive Strictness]
            K[Security Scanning] --> K1[Trivy Integration]
            L[Container Hardening] --> L1[Distroless Runtime]
        end
    end

    style A1 fill:#e1f5fe
    style E1 fill:#4caf50,color:#fff
    style I1 fill:#fff3e0
```

### TypeScript/Node.js Concepts

- Modern TypeScript with strict type checking
- Express.js REST API development
- Zod schema validation and type safety
- Comprehensive error handling patterns
- Security middleware implementation

### CI/CD Concepts

- Escalating pipeline strictness by branch
- Multi-version compatibility testing
- Container security scanning with Trivy
- Test coverage requirements and validation
- Production deployment simulation

### Docker Concepts

- Multi-stage builds for optimization
- Distroless containers for security
- Health check implementation
- Container orchestration with docker-compose
- Security hardening techniques

## 🛡️ Security Best Practices

### Code Security
- Input validation with Zod schemas
- Rate limiting and CORS protection
- Security headers with Helmet.js
- Environment variable management

### Container Security
- Distroless runtime environment
- Non-root user execution
- Minimal attack surface
- Regular vulnerability scanning

### CI/CD Security
- Advanced secret detection patterns
- Zero-vulnerability policies for production
- Container image signing (production)
- Security audit automation

---

## 📚 Additional Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Docker Security Best Practices](https://docs.docker.com/develop/security-best-practices/)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)

**This demo provides a comprehensive foundation for enterprise TypeScript API development with production-ready CI/CD practices.**
