# 🚀 TypeScript API Performance Testing Framework

A comprehensive performance testing and monitoring solution built with Artillery.js, providing enterprise-grade performance validation with progressive CI/CD integration.

## 📋 Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Performance Test Scenarios](#performance-test-scenarios)
- [CI/CD Integration](#cicd-integration)
- [Performance Dashboard](#performance-dashboard)
- [Regression Detection](#regression-detection)
- [Monitoring & Alerting](#monitoring--alerting)
- [Advanced Usage](#advanced-usage)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

This performance testing framework provides:

- **Progressive Load Testing**: Light, moderate, and heavy load scenarios
- **Memory Leak Detection**: Long-running tests to identify memory issues
- **Baseline Management**: Automated baseline recording and comparison
- **Regression Detection**: Automated performance regression identification
- **Real-time Dashboard**: Visual monitoring with charts and alerts
- **CI/CD Integration**: Seamless integration with progressive strictness model

### Architecture

```
tests/performance/
├── scenarios/           # Artillery.js test scenarios
│   ├── light-load.yml      # 5-10 req/s basic validation
│   ├── moderate-load.yml   # 20-50 req/s sustained load
│   ├── heavy-load.yml      # 100-200 req/s stress test
│   └── memory-test.yml     # 5-minute memory leak detection
├── scripts/            # Performance utilities
│   ├── performance-processor.js    # Custom Artillery functions
│   ├── baseline-recorder.js        # Baseline establishment
│   ├── regression-detector.js      # Performance regression detection
│   └── dashboard-updater.js        # Dashboard data generation
├── dashboard/          # Performance monitoring UI
│   ├── performance-dashboard.html      # Static dashboard template
│   └── performance-dashboard-live.html # Live dashboard (generated)
├── data/              # Performance data storage
│   ├── performance-baseline.json   # Current baseline metrics
│   └── dashboard-data.json         # Dashboard data cache
└── reports/           # Generated reports
    ├── baseline-report.html        # Baseline establishment report
    └── regression-report-*.html    # Regression analysis reports
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install  # Installs Artillery.js and Clinic.js
```

### 2. Start Your Application

```bash
npm run build
npm start &  # Run in background
```

### 3. Run Performance Tests

```bash
# Light load test (recommended for development)
npm run test:perf:light

# Moderate load test (recommended for staging)
npm run test:perf:moderate

# Heavy stress test (recommended for production validation)
npm run test:perf:heavy

# Memory leak detection
npm run test:perf:memory
```

### 4. Establish Baseline

```bash
# Record current performance as baseline
npm run test:perf:baseline
```

### 5. Monitor Performance

```bash
# Generate dashboard with latest metrics
npm run perf:dashboard

# Open the dashboard
open tests/performance/dashboard/performance-dashboard-live.html
```

## 📊 Performance Test Scenarios

### Light Load Test (`light-load.yml`)

**Purpose**: Basic functionality validation and development testing

- **Load**: 5-10 requests/second
- **Duration**: 60 seconds
- **Target**: Feature branches, development environments
- **Thresholds**:
  - P95 Response Time: ≤ 200ms
  - P99 Response Time: ≤ 500ms
  - Error Rate: ≤ 0.1%

**Test Patterns**:
- Health checks and readiness probes
- Basic CRUD operations
- Read-heavy workloads (70% GET requests)

```bash
npm run test:perf:light
```

### Moderate Load Test (`moderate-load.yml`)

**Purpose**: Sustained load validation for staging environments

- **Load**: 20-50 requests/second
- **Duration**: 180 seconds (3 minutes)
- **Target**: Develop branch, staging environments
- **Thresholds**:
  - P95 Response Time: ≤ 300ms
  - P99 Response Time: ≤ 800ms
  - Error Rate: ≤ 1%

**Test Patterns**:
- Concurrent operations
- Mixed read/write workloads (60/40 split)
- Error handling under load

```bash
npm run test:perf:moderate
```

### Heavy Load Test (`heavy-load.yml`)

**Purpose**: Stress testing and production readiness validation

- **Load**: 100-200 requests/second (ramping)
- **Duration**: 300 seconds (5 minutes)
- **Target**: Main branch, production validation
- **Thresholds**:
  - P95 Response Time: ≤ 500ms
  - P99 Response Time: ≤ 1500ms
  - Error Rate: ≤ 5%

**Test Patterns**:
- Rate limiter stress testing
- High-concurrency CRUD operations
- Resource exhaustion scenarios
- Breaking point identification

```bash
npm run test:perf:heavy
```

### Memory Test (`memory-test.yml`)

**Purpose**: Memory leak detection and resource management validation

- **Load**: 30 requests/second
- **Duration**: 300 seconds (5 minutes)
- **Pattern**: Continuous operations with large payloads
- **Target**: Memory leak detection

```bash
npm run test:perf:memory
```

## 🔄 CI/CD Integration

The performance testing framework integrates with the progressive CI/CD strictness model:

### Basic CI (Feature Branches)
```yaml
- name: ⚡ Light performance test
  run: npm run test:perf:light
```

### Comprehensive CI (Develop Branch)
```yaml
- name: 🚀 Moderate performance test
  run: npm run test:perf:moderate
```

### Ultra-Strict CI (Main Branch)
```yaml
- name: 🚀 Heavy performance & stress test
  run: |
    npm run test:perf:heavy
    npm run test:perf:regression  # Regression detection
```

### Performance Gate Criteria

| Branch | Test Type | P95 Threshold | P99 Threshold | Error Rate | Action on Failure |
|--------|-----------|---------------|---------------|------------|------------------|
| feature/* | Light Load | 200ms | 500ms | 0.1% | Fail build |
| develop | Moderate Load | 300ms | 800ms | 1.0% | Fail build |
| main | Heavy Load | 500ms | 1500ms | 5.0% | Fail build + Regression check |

## 📊 Performance Dashboard

### Accessing the Dashboard

```bash
# Update dashboard data and generate live dashboard
npm run perf:dashboard

# Open the dashboard
open tests/performance/dashboard/performance-dashboard-live.html
```

### Dashboard Features

- **Real-time Metrics**: P95/P99 response times, error rates, throughput
- **Historical Trends**: Performance over time with interactive charts
- **Baseline Comparison**: Current vs baseline performance visualization
- **Test Results Table**: Recent test execution results
- **Performance Alerts**: Automated alerting for regressions
- **System Monitoring**: Memory and CPU usage tracking

### Dashboard Components

1. **Metric Cards**: Key performance indicators with trend analysis
2. **Interactive Charts**: Historical performance visualization
3. **Test Results**: Tabular view of recent test executions
4. **Alerts Panel**: Performance warnings and regressions
5. **System Health**: Resource utilization monitoring

## 🔍 Regression Detection

### Baseline Management

```bash
# Record new baseline (typically after major releases)
npm run test:perf:baseline

# Check current baseline
cat tests/performance/data/performance-baseline.json
```

### Automatic Regression Detection

```bash
# Run regression detection against current baseline
npm run test:perf:regression
```

### Regression Thresholds

The system automatically detects regressions when:

- **P95 Response Time**: > 20% increase from baseline
- **P99 Response Time**: > 20% increase from baseline
- **Error Rate**: > 2x baseline (minimum 0.5%)
- **Throughput**: > 20% decrease from baseline

### Regression Reports

Regression detection generates detailed HTML reports in `tests/performance/reports/`:

- Performance comparison tables
- Trend analysis and recommendations
- Historical context and troubleshooting tips
- Action items for performance recovery

## 🚨 Monitoring & Alerting

### Alert Types

1. **Performance Regressions**: Threshold violations vs baseline
2. **System Resource Alerts**: High memory/CPU usage
3. **Error Rate Spikes**: Unusual error patterns
4. **Throughput Degradation**: Capacity reduction

### Alert Severity Levels

- **Critical**: Immediate action required (error rate > 2x baseline)
- **High**: Significant performance impact (P95 > 20% increase)
- **Medium**: Notable degradation requiring investigation
- **Low**: Minor variations within acceptable ranges

### Monitoring Dashboard

```bash
# Update monitoring data
npm run perf:monitor

# View alerts and system health
npm run perf:dashboard
```

## 🔧 Advanced Usage

### Custom Test Scenarios

Create custom Artillery.js scenarios in `tests/performance/scenarios/`:

```yaml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
  processor: "../scripts/performance-processor.js"

scenarios:
  - name: "Custom Test Scenario"
    flow:
      - post:
          url: "/api/v1/tasks"
          json:
            title: "Custom Test {{ $randomString() }}"
            priority: "{{ $randomPriority() }}"
```

### Custom Metrics Collection

Extend `performance-processor.js` to collect custom metrics:

```javascript
function collectCustomMetrics(requestParams, response, context, ee, next) {
  // Custom business logic metrics
  if (response.body && response.body.data) {
    const responseTime = response.timings.response;
    ee.emit('histogram', 'custom_response_time', responseTime);
  }

  return next();
}
```

### Environment-Specific Configuration

Set environment variables for different test environments:

```bash
# Development
export PERF_TARGET="http://localhost:3000"
export PERF_DURATION=60

# Staging
export PERF_TARGET="https://staging.example.com"
export PERF_DURATION=180

# Production validation
export PERF_TARGET="https://api.example.com"
export PERF_DURATION=300
```

### Memory Profiling with Clinic.js

```bash
# Generate detailed memory profiles
npm run test:perf:memory

# Analyze results
open .clinic/*/clinic-doctor.html
```

## 🚨 Troubleshooting

### Common Issues

#### High Response Times

**Symptoms**: P95/P99 times exceed thresholds
**Investigation**:
```bash
# Check system resources
npm run perf:monitor

# Run memory profiling
npm run test:perf:memory

# Review application logs
docker logs <container_id>
```

**Common Causes**:
- Database connection pool exhaustion
- Unoptimized queries
- Memory leaks
- CPU-intensive operations

#### Error Rate Increases

**Symptoms**: Error rate > baseline thresholds
**Investigation**:
```bash
# Check error patterns in logs
grep ERROR logs/app.log | tail -50

# Verify endpoint availability
curl -f http://localhost:3000/health

# Check rate limiting
curl -v http://localhost:3000/api/v1/tasks
```

#### Memory Leaks

**Symptoms**: Steadily increasing memory usage
**Investigation**:
```bash
# Generate memory profile
npm run test:perf:memory

# Check heap snapshots
node --inspect src/app.js
```

### Performance Test Failures

#### Artillery Test Failures

```bash
# Verify application is running
curl http://localhost:3000/health

# Check Artillery configuration
artillery validate tests/performance/scenarios/light-load.yml

# Debug with verbose output
artillery run tests/performance/scenarios/light-load.yml --verbose
```

#### Baseline Issues

```bash
# Reset baseline if corrupted
rm tests/performance/data/performance-baseline.json
npm run test:perf:baseline

# Verify baseline data
cat tests/performance/data/performance-baseline.json | jq '.'
```

### CI/CD Integration Issues

#### Docker Container Performance

```bash
# Check container resources
docker stats

# Verify health checks
docker exec <container> curl http://localhost:3000/health

# Review container logs
docker logs <container> --tail 100
```

#### Network Connectivity

```bash
# Test from CI environment
curl -f $PERF_TARGET/health

# Check DNS resolution
nslookup localhost

# Verify port accessibility
telnet localhost 3000
```

### Getting Help

1. **Check Dashboard**: Review metrics and alerts in the performance dashboard
2. **Review Reports**: Examine regression reports for detailed analysis
3. **System Monitoring**: Use `npm run perf:monitor` for system health
4. **Memory Profiling**: Use Clinic.js for memory leak detection
5. **CI/CD Logs**: Review GitHub Actions logs for specific failure details

---

## 📝 Performance Testing Best Practices

### 1. Test Environment Consistency

- Use identical environment configurations
- Maintain consistent load patterns
- Isolate performance tests from other processes

### 2. Baseline Management

- Update baselines after major releases
- Document baseline establishment criteria
- Review baselines quarterly for relevance

### 3. Progressive Testing

- Start with light load tests during development
- Increase load intensity as code matures
- Use heavy load tests for production validation

### 4. Monitoring Integration

- Monitor performance continuously
- Set up alerts for regression detection
- Review performance trends regularly

### 5. Test Data Management

- Use realistic test data volumes
- Maintain test data consistency
- Clean up test data after execution

---

*This performance testing framework represents enterprise-grade practices for TypeScript API performance validation and monitoring.*
