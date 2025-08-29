# Docker & CI/CD Overview

## Introduction

This document provides a foundational understanding of Docker containers and CI/CD pipelines using GitHub Actions. It serves as a starting point for engineers new to these technologies.

## Docker Fundamentals

### What is Docker?

Docker is a platform for developing, shipping, and running applications in containers. Containers package your application with all its dependencies, ensuring consistency across different environments.

### Key Concepts

#### Images vs Containers
- **Image**: A read-only template with instructions for creating a container
- **Container**: A runnable instance of an image

#### Dockerfile
A text file containing instructions to build a Docker image:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

#### Multi-Stage Builds
Optimize image size by using multiple FROM statements:
```dockerfile
# Build stage
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production
CMD ["node", "dist/index.js"]
```

### Container Best Practices

1. **Keep images small**: Use alpine versions when possible
2. **Layer caching**: Order Dockerfile commands from least to most frequently changing
3. **Security**: Don't run as root, scan for vulnerabilities
4. **One process per container**: Follow the single responsibility principle
5. **Use .dockerignore**: Exclude unnecessary files from build context

## CI/CD with GitHub Actions

### What is CI/CD?

- **Continuous Integration (CI)**: Automatically build and test code changes
- **Continuous Deployment (CD)**: Automatically deploy tested code to production

### GitHub Actions Components

#### Workflows
YAML files in `.github/workflows/` that define automated processes:
```yaml
name: CI Pipeline
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
```

#### Jobs
Units of work that run on separate runners:
```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: npm test
```

#### Actions
Reusable units of code that perform specific tasks:
```yaml
- uses: actions/setup-node@v3
  with:
    node-version: '18'
```

### Common CI/CD Tasks

#### 1. Code Quality Checks
```yaml
- name: Lint code
  run: |
    npm run lint
    npm run format:check
```

#### 2. Testing
```yaml
- name: Run tests
  run: |
    npm test
    npm run test:coverage
```

#### 3. Security Scanning
```yaml
- name: Security scan
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: 'myapp:latest'
```

#### 4. Building Docker Images
```yaml
- name: Build and push Docker image
  uses: docker/build-push-action@v4
  with:
    context: .
    push: true
    tags: myapp:${{ github.sha }}
```

## Container Testing Strategies

### 1. Unit Tests
Test individual components in isolation:
- Run during build process
- Fast feedback
- Language-specific frameworks

### 2. Integration Tests
Test component interactions:
- Test API endpoints
- Database connections
- External service mocks

### 3. Container Structure Tests
Validate the container itself:
```yaml
schemaVersion: 2.0.0
fileExistenceTests:
  - name: 'Check app directory'
    path: '/app'
    shouldExist: true
commandTests:
  - name: 'Node version'
    command: 'node'
    args: ['--version']
    expectedOutput: ['v18']
```

### 4. Security Scanning
- **Image scanning**: Trivy, Snyk, Grype
- **Dependency scanning**: GitHub Dependabot
- **Code scanning**: CodeQL, SonarQube

## Workflow Patterns

### 1. Feature Branch Workflow
```yaml
on:
  pull_request:
    types: [opened, synchronize]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - Checkout
      - Lint
      - Test
      - Build
      - Security scan
```

### 2. Release Workflow
```yaml
on:
  push:
    tags:
      - 'v*'
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - Build production image
      - Push to registry
      - Deploy to environment
```

### 3. Matrix Testing
Test across multiple versions/platforms:
```yaml
strategy:
  matrix:
    node-version: [16, 18, 20]
    os: [ubuntu-latest, windows-latest]
runs-on: ${{ matrix.os }}
```

## Environment Management

### Secrets
Store sensitive data securely:
```yaml
env:
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
  API_KEY: ${{ secrets.API_KEY }}
```

### Environment Variables
Configure behavior across environments:
```yaml
env:
  NODE_ENV: production
  LOG_LEVEL: info
```

## Monitoring and Debugging

### Workflow Logs
- View real-time execution logs
- Download artifacts for debugging
- Re-run failed jobs

### Status Badges
Display CI/CD status in README:
```markdown
![CI](https://github.com/user/repo/workflows/CI/badge.svg)
```

### Notifications
- Email notifications
- Slack/Discord webhooks
- GitHub status checks

## Performance Optimization

### 1. Caching Dependencies
```yaml
- uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
```

### 2. Parallel Jobs
Run independent tasks simultaneously:
```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
  test:
    runs-on: ubuntu-latest
  build:
    runs-on: ubuntu-latest
    needs: [lint, test]
```

### 3. Docker Layer Caching
```yaml
- uses: docker/setup-buildx-action@v2
- uses: docker/build-push-action@v4
  with:
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

## Common Pitfalls and Solutions

### 1. Large Docker Images
**Problem**: Slow builds and deployments
**Solution**: Multi-stage builds, alpine base images

### 2. Flaky Tests
**Problem**: Intermittent failures
**Solution**: Retry mechanisms, better test isolation

### 3. Secret Exposure
**Problem**: Credentials in code
**Solution**: GitHub Secrets, environment variables

### 4. Long Build Times
**Problem**: Slow CI/CD pipelines
**Solution**: Caching, parallel execution, optimized Dockerfiles

## Next Steps

1. Review the project proposals in `/docs/proposals/`
2. Start with a simple demo project
3. Gradually add more complex CI/CD features
4. Customize for your specific needs

## Additional Resources

- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [GitHub Actions Best Practices](https://docs.github.com/en/actions/guides)
- [12 Factor App](https://12factor.net/)
- [Container Security Guide](https://www.nist.gov/publications/application-container-security-guide)