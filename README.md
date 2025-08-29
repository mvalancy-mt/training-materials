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

## Getting Started

### Prerequisites

- Git and GitHub account
- Docker Desktop or Docker Engine
- GitHub CLI (for testing workflows)
- Language-specific tools (varies by demo)

### Quick Start

1. Clone this repository:
   ```bash
   git clone https://github.com/mvalancy-mt/training-materials.git
   cd training-materials
   ```

2. Start with the Python FastAPI demo (most beginner-friendly):
   ```bash
   cd demos/python-fastapi
   docker-compose up --build
   ```

3. Open http://localhost:8000/docs to see the API documentation

4. Study the `.github/workflows/` files to understand the CI/CD pipeline

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