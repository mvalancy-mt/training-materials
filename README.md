# 🚀 Enterprise CI/CD Training Materials

> **Production-Ready Docker & CI/CD Training Platform**
> A comprehensive collection of enterprise-grade demos showcasing containerization, automated testing, and progressive CI/CD pipelines with real-world strictness escalation.

## 📊 Quick Overview

```mermaid
graph TB
    subgraph "🏗️ What You'll Learn"
        A[Docker Best Practices] --> B[Multi-Stage Builds]
        A --> C[Security Hardening]
        A --> D[Container Testing]

        E[CI/CD Pipelines] --> F[GitHub Actions]
        E --> G[Progressive Strictness]
        E --> H[Automated Deployment]

        I[Enterprise Patterns] --> J[96%+ Test Coverage]
        I --> K[Security Scanning]
        I --> L[Branch Protection]
    end

    style A fill:#2196f3,color:#ffffff
    style E fill:#ff9800,color:#ffffff
    style I fill:#9c27b0,color:#ffffff
```

## 🎯 Purpose & Learning Objectives

This repository provides **hands-on, production-ready examples** for engineers learning Docker containerization and enterprise CI/CD practices. Each demo represents real-world scenarios with actual challenges and solutions.

### What Makes This Training Unique

- **🔄 Progressive CI/CD Strictness**: Experience realistic quality gates (90% → 95% → 96%+)
- **🛡️ Security-First Approach**: Mandatory secret detection, container scanning, SAST
- **📈 Real Coverage Metrics**: Actual achieved coverage (96.33%), not theoretical 100%
- **🚀 Production Simulation**: Test vehicles, staging deployments, emergency hotfixes

## 🏗️ Repository Architecture

```mermaid
graph LR
    subgraph "📁 Repository Structure"
        A[training-materials/] --> B[demos/]
        A --> C[docs/]
        A --> D[.github/workflows/]
        A --> E[templates/]

        B --> F[typescript-api/]
        B --> G[cpp-http-server/]
        B --> H[python-fastapi/]

        F --> F1[96.33% Coverage]
        G --> G1[Production Ready]
        H --> H1[Coming Soon]

        D --> I[Basic CI]
        D --> J[Comprehensive CI]
        D --> K[Ultra-Strict CI]
    end

    style A fill:#4caf50,color:#ffffff
    style F1 fill:#2e7d32,color:#ffffff
    style G1 fill:#2e7d32,color:#ffffff
```

## 🔄 Git Workflow & CI/CD Pipeline

### Branch Strategy with Progressive Quality Gates

```mermaid
gitGraph
    commit id: "Initial Setup"
    branch develop
    checkout develop
    commit id: "Base Features"

    branch feature/api-v2
    checkout feature/api-v2
    commit id: "Add Endpoint"
    commit id: "Add Tests (90%)"
    checkout develop
    merge feature/api-v2 tag: "CI: 95% Required"

    branch feature/security
    checkout feature/security
    commit id: "Security Fix"
    commit id: "Add Tests (92%)"
    checkout develop
    merge feature/security tag: "CI: 95% Required"

    checkout main
    merge develop tag: "CI: 96%+ Required"

    branch hotfix/critical
    checkout hotfix/critical
    commit id: "Emergency Fix"
    checkout main
    merge hotfix/critical tag: "CI: 96%+ Required"
```

### CI/CD Pipeline Architecture

```mermaid
flowchart TB
    subgraph "Developer Workflow"
        A[Local Development] --> B{Pre-commit Hooks}
        B -->|Pass| C[Git Push]
        B -->|Fail: Secrets Found| D[Blocked!]
    end

    subgraph "CI Pipeline Stages"
        C --> E{Branch Type?}

        E -->|feature/*| F[Basic CI<br/>90% Coverage]
        E -->|develop| G[Comprehensive CI<br/>95% Coverage]
        E -->|PR to main| H[Ultra-Strict CI<br/>96%+ Coverage]

        F --> I[Unit Tests]
        F --> J[Linting]
        F --> K[Security Scan]

        G --> L[All Basic Tests]
        G --> M[Integration Tests]
        G --> N[Container Scan]
        G --> O[Multi-Version Test]

        H --> P[All Previous Tests]
        H --> Q[Production Build]
        H --> R[Zero Vulnerabilities]
        H --> S[Performance Tests]
    end

    subgraph "Deployment"
        F -->|Pass| T[Test Bench]
        G -->|Pass| U[Test Vehicles]
        H -->|Pass| V[Production]
    end

    style D fill:#d32f2f,color:#ffffff
    style V fill:#2e7d32,color:#ffffff
    style H fill:#f57c00,color:#ffffff
```

## 📋 Progressive CI/CD Requirements

### Escalating Quality Standards by Branch

```mermaid
graph LR
    subgraph "Quality Gate Progression"
        A[feature/*<br/>90% Coverage] --> B[develop<br/>95% Coverage]
        B --> C[main<br/>96%+ Coverage]

        A1[Fast Feedback<br/>5 min] --> B1[Comprehensive<br/>10 min]
        B1 --> C1[Ultra-Strict<br/>15 min]

        A2[Basic Security] --> B2[Container Scan]
        B2 --> C2[Zero Vulnerabilities]
    end

    style A fill:#1976d2,color:#ffffff
    style B fill:#1565c0,color:#ffffff
    style C fill:#0d47a1,color:#ffffff
```

| Branch Level | Coverage Required | Security Requirements | Build Time | Deployment Target |
|-------------|------------------|----------------------|------------|-------------------|
| **feature/** | ≥90% | Pre-commit + SAST | ~5 min | Test Bench (on-demand) |
| **develop** | ≥95% | + Container Scanning | ~10 min | Test Vehicles (daily) |
| **main** | ≥96% | + Zero Vulnerabilities | ~15 min | Production (immediate) |

## 🚀 Demo Projects Overview

### Current Production-Ready Demos

```mermaid
flowchart LR
    subgraph "TypeScript API Demo"
        TS[Express.js API] --> TS1[96.33% Coverage]
        TS --> TS2[20 Test Cases]
        TS --> TS3[Rate Limiting]
        TS --> TS4[Health Checks]
        TS --> TS5[Docker Multi-Stage]
    end

    subgraph "C++ HTTP Server"
        CPP[libmicrohttpd] --> CPP1[CMake Build]
        CPP --> CPP2[Memory Safety]
        CPP --> CPP3[Alpine Linux]
        CPP --> CPP4[REST API]
        CPP --> CPP5[Production Ready]
    end

    subgraph "Python FastAPI"
        PY[FastAPI] --> PY1[Coming Soon]
        PY --> PY2[PostgreSQL]
        PY --> PY3[Async/Await]
        PY --> PY4[OpenAPI Docs]
    end

    style TS1 fill:#2e7d32,color:#ffffff
    style CPP5 fill:#2e7d32,color:#ffffff
    style PY1 fill:#f57c00,color:#ffffff
```

### TypeScript API Demo Details

- **Technology**: Express.js, TypeScript, Zod validation
- **Coverage**: 96.33% lines, 96.87% functions
- **Features**: CRUD API, rate limiting, health monitoring
- **Security**: Helmet, CORS, input validation, secret detection
- **Container**: Multi-stage Alpine Linux, distroless runtime

### C++ HTTP Server Demo Details

- **Technology**: Modern C++17, libmicrohttpd, CMake
- **Features**: RESTful API, task management, health checks
- **Security**: Memory safety, stack protection, minimal attack surface
- **Container**: Multi-stage build, Alpine base, production optimized

## 🛡️ Security Framework

### Multi-Layer Security Architecture

```mermaid
flowchart TB
    subgraph "Security Layers"
        A[Pre-commit Hooks] --> A1[Secret Detection<br/>6 Patterns]
        A --> A2[Code Formatting]

        B[CI Security] --> B1[Dependency Scan]
        B --> B2[Container Scan]
        B --> B3[SAST Analysis]

        C[Runtime Security] --> C1[Non-root User]
        C --> C2[Minimal Base Image]
        C --> C3[Read-only Filesystem]
    end

    style A fill:#d32f2f,color:#ffffff
    style B fill:#f57c00,color:#ffffff
    style C fill:#2e7d32,color:#ffffff
```

## 🚦 Getting Started

### Prerequisites

```bash
# Required Tools
- Docker Desktop or Docker Engine 20+
- Git 2.30+
- Node.js 18+ (for TypeScript demo)
- CMake 3.20+ (for C++ demo)
- GitHub CLI (gh) for PR workflows
```

### 🔒 Mandatory Security Setup (2 Commands)

```bash
# REQUIRED - Installs pre-commit hooks for secret detection
pip install pre-commit && pre-commit install
```

> ⚠️ **This is NON-NEGOTIABLE** - Prevents accidental secret commits

### Quick Start Guide

```mermaid
flowchart LR
    A[1. Clone Repo] --> B[2. Install Pre-commit]
    B --> C[3. Create Feature Branch]
    C --> D[4. Make Changes]
    D --> E[5. Run Tests Locally]
    E --> F[6. Push & Create PR]
    F --> G[7. CI Validation]
    G --> H[8. Merge & Cleanup]

    style B fill:#f57c00,color:#ffffff
    style G fill:#1976d2,color:#ffffff
```

```bash
# 1. Clone repository
git clone https://github.com/mvalancy-mt/training-materials.git
cd training-materials

# 2. Install security hooks (MANDATORY)
pip install pre-commit && pre-commit install

# 3. Create feature branch
git checkout develop
git checkout -b feature/my-improvement

# 4. Test TypeScript demo
cd demos/typescript-api
npm install
npm test  # Should see 96.33% coverage

# 5. Make your changes and commit
git add .
git commit -m "feat: Add awesome improvement"

# 6. Push and create PR
git push -u origin feature/my-improvement
gh pr create --base develop --title "Add awesome improvement"
```

## 📊 Real-World Metrics & Achievements

### Coverage Statistics (Actual Production Values)

```mermaid
pie title "TypeScript API Test Coverage"
    "Covered Lines" : 96.33
    "Uncovered Lines" : 3.67
```

| Metric | Target | Achieved | Status |
|--------|--------|----------|--------|
| Line Coverage | 96% | 96.33% | ✅ Exceeds |
| Function Coverage | 96% | 96.87% | ✅ Exceeds |
| Statement Coverage | 96% | 96.00% | ✅ Meets |
| Branch Coverage | 75% | 82.25% | ✅ Exceeds |

## 🔄 Workflow Examples

### Feature Development Flow

```bash
# ALWAYS start from develop
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/new-endpoint

# IMMEDIATELY push to track remotely
git push -u origin feature/new-endpoint

# Work iteratively with frequent commits
echo "Working on new endpoint" > PROGRESS.md
git add . && git commit -m "docs: Start new endpoint work"
git push

# Implement feature
# ... make changes ...
git add . && git commit -m "feat: Add endpoint structure"
git push

# ... more changes ...
git add . && git commit -m "test: Add endpoint tests"
git push

# Create PR when ready (triggers CI)
gh pr create --base develop \
  --title "feat: Add new endpoint" \
  --body "Implements new /api/v2/endpoint with full test coverage"

# After merge, clean up immediately
git checkout develop
git pull origin develop
git branch -d feature/new-endpoint
git push origin --delete feature/new-endpoint
```

### Emergency Hotfix Flow

```bash
# Hotfix branches from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-security-fix

# Apply fix with tests
# ... fix issue ...
git add . && git commit -m "fix: Patch critical security vulnerability"
git push -u origin hotfix/critical-security-fix

# Direct PR to main (ultra-strict CI)
gh pr create --base main \
  --title "HOTFIX: Critical security patch" \
  --body "Fixes CVE-2024-XXXX with immediate production deployment"

# After merge, sync to develop
git checkout develop
git pull origin main
git push origin develop
```

## 📚 Documentation Structure

| Document | Purpose | Audience |
|----------|---------|----------|
| [README.md](README.md) | Overview & quick start | All developers |
| [SETUP.md](SETUP.md) | Detailed environment setup | New team members |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Contribution guidelines | Contributors |
| [CI-REQUIREMENTS.md](docs/CI-REQUIREMENTS.md) | Complete CI/CD specifications | DevOps engineers |
| Demo READMEs | Language-specific guides | Demo users |

## 🎯 Learning Path

```mermaid
graph TD
    A[Start Here] --> B[1. Read Overview]
    B --> C[2. Setup Environment]
    C --> D[3. Run TypeScript Demo]
    D --> E[4. Explore CI Pipeline]
    E --> F[5. Create Feature Branch]
    F --> G[6. Make Small Change]
    G --> H[7. Experience CI Gates]
    H --> I[8. Review C++ Demo]
    I --> J[Advanced: Build Your Own]

    style A fill:#2e7d32,color:#ffffff
    style J fill:#f57c00,color:#ffffff
```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Contribution Checklist

- [ ] Pre-commit hooks installed
- [ ] Tests pass locally with required coverage
- [ ] Documentation updated
- [ ] PR created to `develop` (not `main`)
- [ ] CI checks passing
- [ ] Code reviewed

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) for details.

## 🙋 Support & Questions

- **Issues**: [GitHub Issues](https://github.com/mvalancy-mt/training-materials/issues)
- **Discussions**: [GitHub Discussions](https://github.com/mvalancy-mt/training-materials/discussions)
- **Security**: Report vulnerabilities privately via GitHub Security tab

---

<div align="center">

**Built with ❤️ for Enterprise CI/CD Training**

*Demonstrating real-world patterns, not theoretical perfection*

</div>
