# 🔷 TypeScript API Demo - Comprehensive CI/CD Training

**Modern TypeScript/Node.js API with enterprise-grade CI/CD pipeline**

## 🎯 Overview

This TypeScript API demo demonstrates comprehensive CI/CD practices for modern Node.js applications, featuring:

- **Express.js REST API** with TypeScript, Zod validation, and comprehensive error handling
- **Enterprise Security** with Helmet, CORS, rate limiting, and input validation
- **100% Test Coverage** with Jest, supertest, and comprehensive test suites
- **Docker Multi-Stage Build** with distroless runtime and security hardening
- **Escalating CI/CD Pipeline** with branch-specific strictness levels

## 🏗️ Architecture

### Core Components

- **Express.js Application** (`src/app.ts`) - Main application server
- **Task Management API** (`src/controllers/task-controller.ts`) - RESTful task operations
- **Zod Data Models** (`src/models/task.ts`) - Type-safe request/response validation
- **Security Middleware** (`src/middleware/security.ts`) - Comprehensive security controls
- **Health Monitoring** (`src/utils/health.ts`) - Application health and readiness checks

### API Endpoints

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

### Prerequisites
- Node.js 18+ (recommended: 20)
- Docker (optional)
- Git

### Local Development

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

### Testing the API

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

```bash
# Build and run with docker-compose
docker-compose up --build

# API available at: http://localhost:3000
# With monitoring: docker-compose --profile monitoring up
```

## 🔒 Security Features

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

### Test Coverage Requirements

| Branch Type | Coverage Requirement |
|-------------|---------------------|
| Feature Branches | ≥90% line coverage |
| Develop Branch | ≥95% line coverage |
| Main Branch | 100% line coverage |

### Test Categories

- **Unit Tests** (`tests/task.test.ts`) - API endpoint testing
- **Security Tests** (`tests/security.test.ts`) - Security middleware validation
- **Health Tests** (`tests/health.test.ts`) - Health check functionality
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

### Pipeline Stages by Branch

| Branch | Stage | Requirements |
|--------|-------|-------------|
| `feature/*` | ⚡ **Basic CI** | 90% coverage, basic security |
| `develop` | ✅ **Comprehensive CI** | 95% coverage, enhanced security, multi-node testing |
| `main` | 🚨 **Ultra-Strict CI** | 100% coverage, zero vulnerabilities, production simulation |

### Key CI/CD Features

- **Multi-Node Testing** - Node.js 18, 20, 21 compatibility
- **Advanced Secret Detection** - TypeScript-specific pattern matching
- **Container Security Scanning** - Trivy vulnerability analysis
- **Production Simulation** - Full deployment testing
- **Quality Metrics** - Code analysis and build optimization

## 🐳 Docker Architecture

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

```bash
# Start with monitoring stack
docker-compose --profile monitoring up

# Prometheus UI: http://localhost:9090
```

## 🔧 Development Workflow

### Code Quality Standards

- **TypeScript Strict Mode** - Ultra-strict type checking enabled
- **ESLint Security Rules** - Security-focused linting with `eslint-plugin-security`
- **Prettier Formatting** - Consistent code formatting
- **Pre-commit Hooks** - Secret detection and formatting validation

### Branch Protection Strategy

```bash
# Standard development workflow
git checkout develop
git pull origin main              # Sync with production
git checkout -b feature/new-api   # Create feature branch
git push -u origin feature/new-api # Push first (SOP)

# Development cycle
npm run dev                       # Local development
npm run test:coverage            # Validate changes
git commit -m "feat: add new API endpoint"

# CI pipeline automatically runs based on branch strictness level
```

## 🎓 Learning Objectives

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
