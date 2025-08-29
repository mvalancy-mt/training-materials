# Docker & CI/CD Training Materials

A comprehensive collection of training materials and example projects demonstrating best practices for containerizing applications with Docker and implementing CI/CD pipelines using GitHub Actions. This repository focuses specifically on the intersection of Docker containerization and automated CI/CD workflows.

## Purpose

This repository serves as a hands-on guide for engineers new to Docker containers and GitHub Actions CI/CD. It provides practical examples and templates for:

- Creating containerized applications in various programming languages
- Implementing automated CI/CD pipelines with GitHub Actions
- Running automated tests, linting, and security checks on containerized apps
- Building and validating Docker images with proper CI/CD integration
- Following container and CI/CD best practices

## Repository Structure

```
training-materials/
├── README.md                    # This file
├── LICENSE                      # MIT License
├── docs/                        # Documentation and proposals
│   ├── overview.md             # Docker and CI/CD concepts
│   └── proposals/              # Project proposals for each demo
├── demos/                       # Working example projects
│   ├── python-fastapi/         # Python FastAPI demo with full CI/CD
│   ├── typescript-node/        # TypeScript/Node.js demo
│   ├── cpp-app/                # C++ application demo
│   └── go-service/             # Go microservice demo
└── templates/                   # Reusable templates
    ├── github-actions/         # GitHub Actions workflow templates
    └── docker/                 # Dockerfile templates
```

## Demo Projects

Each demo project includes:

1. **Application Code**: A simple but realistic containerized application
2. **Dockerfile**: Multi-stage build optimized for the language
3. **Docker Compose**: Local development setup
4. **GitHub Actions**: Complete CI/CD pipeline including:
   - Code quality checks (linting, formatting)
   - Automated testing (unit, integration, container tests)
   - Security scanning (dependency, container, SAST)
   - Docker image building and testing
   - Container structure validation

## Focus Areas: Docker + CI/CD Integration

This repository specifically demonstrates:

### Docker Best Practices
- Multi-stage builds for production optimization
- Security hardening and minimal attack surface
- Layer caching and build optimization
- Container structure testing

### CI/CD Pipeline Patterns
- Automated Docker image building
- Container security scanning
- Multi-architecture builds
- Container testing strategies
- Image registry integration

### Language-Specific Examples
- **Python FastAPI**: Web API with PostgreSQL, comprehensive testing
- **TypeScript/Node.js**: Express API with MongoDB, real-time features
- **C++**: HTTP server with CMake, performance testing
- **Go**: Microservice with Redis, high-performance patterns

## Git Branching Strategy

This repository demonstrates a **production-ready Git workflow** with **ruthless branch management** and **strict CI/CD enforcement**:

```
┌─────────────────────────────────────────────────────────────┐
│                     GIT BRANCHING STRATEGY                  │
└─────────────────────────────────────────────────────────────┘

main           ←─── 🔒 PROTECTED (No direct pushes)
│              ←─── ✅ Ultra-strict CI (100% coverage required)
│              ←─── 🚀 ALWAYS PRODUCTION-READY (latest Docker tag)
│              ←─── ⚡ DEPLOY TO FIELD WITH NO NOTICE
│
├── develop    ←─── 🔄 Integration branch (WIP)
│   │          ←─── ✅ Comprehensive CI on push
│   │          ←─── 🚨 Strict CI on PR to main
│   │
│   ├── feature/user-auth     ⚡ TEMPORARY (deleted after merge)
│   ├── feature/api-v2        ⚡ TEMPORARY (deleted after merge)
│   ├── hotfix/security-fix   ⚡ TEMPORARY (deleted after merge)
│   └── bugfix/login-bug      ⚡ TEMPORARY (deleted after merge)
│
└── 💀 All feature branches deleted immediately after merge
```

### Branch Protection & CI Strictness Levels

| Branch | Direct Push | CI Requirements | Deployment |
|--------|-------------|-----------------|------------|
| `main` | ❌ **BLOCKED** | 🚨 **Ultra-Strict**: 100% test coverage, zero vulnerabilities, container scan | 🚀 **Production (latest tag)** |
| `develop` | ❌ **BLOCKED** | ✅ **Comprehensive**: 95% coverage, security scan, quality gates | 🚗 **All Test Vehicles (daily)** |
| `feature/*` | ✅ Allowed | ⚡ **Basic**: 90% coverage, fast feedback | 🧪 **Test Benches (on-demand)** |
| `hotfix/*` | ✅ Allowed | 🚨 **Ultra-Strict**: Same as main branch (production-ready) | ⚠️ **Emergency Production** |
| `bugfix/*` | ✅ Allowed | ⚡ **Basic**: 90% coverage, fast feedback | 🧪 **Test Benches (on-demand)** |
| `docs/*` | ✅ Allowed | 📝 **Documentation**: Lint checks, link validation | ❌ **None** |

### Workflow Examples

```bash
# Feature Development (PUSH FIRST, WORK SECOND)
git checkout develop
git checkout -b feature/new-api-endpoint

# IMMEDIATELY push to origin - others need to see what you're working on
git push -u origin feature/new-api-endpoint
echo "# Working on new API endpoint" > PROGRESS.md
git add PROGRESS.md
git commit -m "Start work on new API endpoint"
git push

# Now do the actual work - commit and push frequently
# ... make changes ...
git add .
git commit -m "Add endpoint structure"
git push

# ... more changes ...
git add .
git commit -m "Implement validation logic"
git push

# Create PR to develop (comprehensive CI) - NO DIRECT PUSH TO DEVELOP
gh pr create --base develop --title "Add new API endpoint"
# ⚡ Triggers comprehensive CI: 95% coverage, security scans

# After PR merge: RUTHLESS DELETION
git branch -d feature/new-api-endpoint
git push origin --delete feature/new-api-endpoint

# Release Process (ultra-strict CI)
git checkout develop
gh pr create --base main --title "Release v2.1.0"
# ⚡ Triggers ultra-strict CI: 100% coverage, zero vulnerabilities

# Hotfix Process (production emergency)
git checkout main
git checkout -b hotfix/security-vulnerability
# ... fix critical issue ...
git push -u origin hotfix/security-vulnerability

# Direct PR to main (ultra-strict CI)
gh pr create --base main --title "HOTFIX: Critical security patch"
# ⚡ Same strict requirements as main branch

# Test Bench Deployment (feature validation)
git push -u origin feature/new-feature
# ⚡ Automatically builds and deploys to available test bench
# Access via: https://testbench-feature-new-feature.internal.com

# Daily Test Vehicle Reset (happens automatically at 6 AM)
# All test vehicles/products automatically get latest develop firmware
# Ensures clean, consistent testing environment on real hardware every day
```

## Getting Started

### Prerequisites

- Git and GitHub account
- Docker Desktop or Docker Engine
- GitHub CLI (for testing workflows)
- Language-specific tools (varies by demo)

### 🚨 MANDATORY SECURITY SETUP

**⚠️ REQUIRED - NO EXCEPTIONS - 2 COMMANDS ONLY:**

```bash
pip install pre-commit && pre-commit install
```

**This BLOCKS commits with secrets. See [SETUP.md](SETUP.md) for details.**

### Quick Start

1. Clone this repository:
   ```bash
   git clone https://github.com/mvalancy-mt/training-materials.git
   cd training-materials
   ```

2. **🚨 MANDATORY: Enable secret protection** (choose one):
   ```bash
   # Option A: Manual (2 commands)
   pip install pre-commit && pre-commit install

   # Option B: Automated (1 command)
   ./scripts/setup-repo.sh
   ```

3. Start with the Python FastAPI demo (most beginner-friendly):
   ```bash
   cd demos/python-fastapi
   docker-compose up --build
   ```

4. Open http://localhost:8000/docs to see the API documentation

5. Study the `.github/workflows/` files to understand the CI/CD pipeline

6. **Experience the branching strategy**:
   ```bash
   # Create a feature branch (temporary!)
   git checkout -b feature/test-changes

   # IMMEDIATELY push to origin (others need visibility)
   git push -u origin feature/test-changes

   # Make some changes, commit and push frequently
   echo "# Test" >> test.md
   git add test.md && git commit -m "Test commit"
   git push

   # Create PR and watch the CI/CD pipeline in action
   gh pr create --base develop --title "Test PR"
   ```

## 🚨 **Critical Standard Operating Procedure**

### **PUSH FIRST, WORK SECOND - No Exceptions**

**Every new branch must be pushed to origin immediately after creation, before any work begins:**

```bash
# ✅ CORRECT: Push first, work second
git checkout develop
git checkout -b feature/user-authentication
git push -u origin feature/user-authentication  # ← IMMEDIATE
echo "# Working on user authentication" > PROGRESS.md
git add PROGRESS.md
git commit -m "Start user authentication work"
git push
# Now begin actual development...

# ❌ WRONG: Working without pushing first
git checkout -b feature/secret-project
# ... hours of work ...
# Laptop dies, work lost forever
```

### **Why This Matters**

- **🔄 Visibility**: Team knows what you're working on
- **💾 Backup**: Work is safe in origin, not just local
- **🚫 Conflicts**: Prevents duplicate work on same feature
- **📱 Mobility**: Can switch devices and continue work
- **⚡ Laptop Failure**: Zero work lost - everything in origin
- **👥 Collaboration**: Others can see progress and help

### **The Golden Rule**

> **"Your laptop can be destroyed at any moment and you should lose almost no work."**

This means:
- Create branch → Push immediately
- Make changes → Commit and push
- Continue work → Commit and push frequently
- Never go more than 30 minutes without pushing

**Commit early, commit often, push always.** 🔄

## 🚀 **Production-Ready Main Branch Philosophy**

### Key Principle: **Main = Always Deployable**

The `main` branch follows a **zero-notice deployment** philosophy:

- **✅ Always Production-Ready**: Every commit can be deployed to production immediately
- **🏷️ Latest Docker Tag**: All builds automatically tagged as `latest` in container registry
- **⚡ Field Deployment**: Ready for immediate customer deployment with no additional testing
- **🛡️ Zero-Defect Policy**: Ultra-strict CI ensures no broken code ever reaches main
- **🔒 Immutable Quality**: 100% test coverage, zero security vulnerabilities, full container scan

### Why This Matters

```bash
# This should ALWAYS work without hesitation:
docker pull your-registry/app:latest
docker run -d -p 8000:8000 your-registry/app:latest

# Immediate customer deployment:
kubectl set image deployment/app app=your-registry/app:latest
```

**Everything in main is field-tested, security-validated, and production-proven.** 🎯

## 🧪 **Test Infrastructure & Deployment Strategy**

### **Automated Test Environment Management**

This workflow supports a comprehensive test infrastructure with **custom GitHub runners** and **automated deployments**:

#### **🚗 Test Vehicle Daily Reset (Develop Branch)**
```bash
# Automated daily at 6:00 AM via GitHub Actions scheduled workflow
name: Daily Test Vehicle Reset
on:
  schedule:
    - cron: '0 6 * * *'  # 6 AM daily

jobs:
  reset-test-vehicles:
    runs-on: [self-hosted, test-vehicle-controller]
    steps:
      - name: 🔄 Flash develop firmware to all test vehicles
        run: |
          # Flash latest develop to all test vehicles/products
          ./scripts/flash-vehicle.sh vehicle-001 registry/app:develop
          ./scripts/flash-vehicle.sh vehicle-002 registry/app:develop
          ./scripts/flash-vehicle.sh vehicle-003 registry/app:develop

          # Verify all vehicles are operational
          ./scripts/health-check.sh vehicle-001
          ./scripts/health-check.sh vehicle-002
          ./scripts/health-check.sh vehicle-003

          # Reset vehicle state to known baseline
          ./scripts/reset-vehicle-state.sh --all
```

#### **🧪 Feature Branch Test Bench Deployment**
```bash
# Triggered on every feature branch push
on:
  push:
    branches: ['feature/*', 'bugfix/*']

jobs:
  deploy-to-test-bench:
    runs-on: [self-hosted, test-bench-manager]
    steps:
      - name: 🏗️ Build and deploy to available test bench
        run: |
          # Find available test bench
          BENCH=$(kubectl get deployments -l type=test-bench,status=available -o name | head -1)

          # Deploy feature branch
          kubectl set image $BENCH app=registry/app:${{ github.ref_name }}
          kubectl label deployment/${BENCH#*/} branch=${{ github.ref_name }}

          # Expose via ingress
          echo "🌐 Available at: https://testbench-${{ github.ref_name }}.internal.com"
```

### **Test Environment Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                    TEST INFRASTRUCTURE                      │
└─────────────────────────────────────────────────────────────┘

Production (main)     🚀 registry/app:latest
├── Customer Sites    ├── Field deployments
├── Staging          ├── Pre-production validation
└── Load Testing     └── Performance verification

Test Vehicles (develop) 🚗 registry/app:develop
├── Vehicle-001      ├── Real product with latest firmware (daily @ 6 AM)
├── Vehicle-002      ├── Integration testing on actual hardware
├── Vehicle-003      ├── QA validation with real sensors/actuators
└── Vehicle-N        └── Performance testing on physical units

Test Benches (features) 🧪 registry/app:feature-name
├── Bench-A          ├── feature/user-auth → testbench-user-auth.internal.com
├── Bench-B          ├── feature/api-v2 → testbench-api-v2.internal.com
├── Bench-C          ├── bugfix/memory-leak → testbench-memory-leak.internal.com
└── Bench-N          └── Auto-cleanup after branch deletion
```

### **Key Benefits**

- **🔄 Daily Fresh Start**: Test vehicles flashed with develop firmware every morning
- **🧪 Isolated Testing**: Features tested on HIL benches before vehicle deployment
- **⚡ Fast Feedback**: Developers can test on real hardware daily
- **🚗 Real Hardware Validation**: Develop branch tested on actual products
- **🚀 Field Ready**: Main branch proven on real vehicles before customer deployment

## Learning Path

### For Beginners
1. Read `docs/overview.md` for Docker and CI/CD fundamentals
2. Work through the Python FastAPI demo
3. Study the GitHub Actions workflows
4. Try building and testing locally with Docker

### For Intermediate Users
1. Compare different language implementations
2. Study advanced CI/CD features (matrix builds, security scanning)
3. Customize workflows for your needs
4. Explore multi-stage build optimizations

## Key Learning Objectives

By working through these materials, you will learn:

- **Docker Containerization**
  - Writing efficient, secure Dockerfiles
  - Multi-stage builds and layer optimization
  - Container testing and validation
  - Production deployment patterns

- **CI/CD Automation**
  - GitHub Actions workflow design
  - Automated testing strategies
  - Security scanning integration
  - Docker registry workflows

- **Best Practices**
  - Container security hardening
  - Performance optimization
  - Monitoring and observability
  - Deployment strategies

## Contributing

We welcome contributions! Please:
1. Fork the repository
2. Create a feature branch
3. Add tests for new demos
4. Ensure CI/CD pipelines pass
5. Submit a pull request

## Resources

### Documentation
- [Docker Documentation](https://docs.docker.com/)
- [GitHub Actions Documentation](https://docs.github.com/actions)
- [Container Structure Tests](https://github.com/GoogleContainerTools/container-structure-test)

### Tools Used
- **Security**: Trivy, Snyk, GitHub Security Scanning
- **Testing**: Language-specific frameworks + container testing
- **Quality**: ESLint, Pylint, golangci-lint, clang-tidy

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For questions or issues:
1. Check existing [GitHub Issues](https://github.com/mvalancy-mt/training-materials/issues)
2. Create a new issue with details about your problem
3. Include information about which demo you're working with

---

**Focus**: This repository specifically targets the intersection of Docker containerization and GitHub Actions CI/CD. All demos emphasize practical, production-ready patterns for containerized applications with automated testing and deployment workflows.
