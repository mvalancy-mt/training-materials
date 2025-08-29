#!/usr/bin/env node

/**
 * Performance Baseline Recorder
 * Records baseline performance metrics for regression detection
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BASELINE_FILE = path.join(__dirname, '../data/performance-baseline.json');
const REPORTS_DIR = path.join(__dirname, '../reports');

async function recordBaseline() {
  console.log('🎯 Recording Performance Baseline...');

  try {
    // Ensure reports directory exists
    if (!fs.existsSync(REPORTS_DIR)) {
      fs.mkdirSync(REPORTS_DIR, { recursive: true });
    }

    // Ensure data directory exists
    const dataDir = path.join(__dirname, '../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Run light load test to establish baseline
    console.log('Running light load test for baseline...');
    const testOutput = execSync(
      'npm run test:perf:light',
      {
        cwd: path.join(__dirname, '../../../'),
        encoding: 'utf8',
        stdio: 'pipe'
      }
    );

    // Parse Artillery output for metrics
    const metrics = parseArtilleryOutput(testOutput);

    // Record baseline with timestamp
    const baseline = {
      timestamp: new Date().toISOString(),
      commit: getCurrentCommit(),
      environment: {
        node_version: process.version,
        platform: process.platform,
        arch: process.arch
      },
      metrics: metrics,
      thresholds: {
        p95_response_time: metrics.p95 * 1.2, // 20% tolerance
        p99_response_time: metrics.p99 * 1.2,
        error_rate: Math.max(metrics.error_rate * 2, 0.5), // At least 0.5%
        requests_per_second: metrics.rps * 0.8 // 20% decrease tolerance
      }
    };

    // Save baseline
    fs.writeFileSync(BASELINE_FILE, JSON.stringify(baseline, null, 2));

    // Generate baseline report
    generateBaselineReport(baseline);

    console.log('✅ Performance baseline recorded successfully!');
    console.log(`📊 Baseline Metrics:`);
    console.log(`   P95 Response Time: ${metrics.p95}ms`);
    console.log(`   P99 Response Time: ${metrics.p99}ms`);
    console.log(`   Error Rate: ${metrics.error_rate}%`);
    console.log(`   Requests/Second: ${metrics.rps}`);
    console.log(`📁 Baseline saved to: ${BASELINE_FILE}`);

  } catch (error) {
    console.error('❌ Failed to record baseline:', error.message);
    process.exit(1);
  }
}

function parseArtilleryOutput(output) {
  const lines = output.split('\n');
  const metrics = {
    p95: 0,
    p99: 0,
    error_rate: 0,
    rps: 0,
    total_requests: 0
  };

  for (const line of lines) {
    // Parse response time percentiles
    if (line.includes('Response time') && line.includes('p95')) {
      const match = line.match(/p95[:\s]+(\d+(?:\.\d+)?)/);
      if (match) metrics.p95 = parseFloat(match[1]);
    }

    if (line.includes('Response time') && line.includes('p99')) {
      const match = line.match(/p99[:\s]+(\d+(?:\.\d+)?)/);
      if (match) metrics.p99 = parseFloat(match[1]);
    }

    // Parse error rate
    if (line.includes('Errors:') || line.includes('Error rate')) {
      const match = line.match(/(\d+(?:\.\d+)?)%/);
      if (match) metrics.error_rate = parseFloat(match[1]);
    }

    // Parse requests per second
    if (line.includes('Requests/sec') || line.includes('RPS')) {
      const match = line.match(/(\d+(?:\.\d+)?)/);
      if (match) metrics.rps = parseFloat(match[1]);
    }

    // Parse total requests
    if (line.includes('Requests completed')) {
      const match = line.match(/(\d+)/);
      if (match) metrics.total_requests = parseInt(match[1]);
    }
  }

  return metrics;
}

function getCurrentCommit() {
  try {
    return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}

function generateBaselineReport(baseline) {
  const reportPath = path.join(REPORTS_DIR, 'baseline-report.html');
  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Performance Baseline Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f4f4f4; padding: 20px; border-radius: 5px; }
        .metric { margin: 10px 0; padding: 10px; background: #e8f5e9; border-radius: 3px; }
        .threshold { margin: 10px 0; padding: 10px; background: #fff3e0; border-radius: 3px; }
        .timestamp { color: #666; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎯 Performance Baseline Report</h1>
        <p class="timestamp">Recorded: ${baseline.timestamp}</p>
        <p>Commit: <code>${baseline.commit}</code></p>
        <p>Environment: Node ${baseline.environment.node_version} on ${baseline.environment.platform}/${baseline.environment.arch}</p>
    </div>

    <h2>📊 Baseline Metrics</h2>
    <div class="metric">P95 Response Time: <strong>${baseline.metrics.p95}ms</strong></div>
    <div class="metric">P99 Response Time: <strong>${baseline.metrics.p99}ms</strong></div>
    <div class="metric">Error Rate: <strong>${baseline.metrics.error_rate}%</strong></div>
    <div class="metric">Requests per Second: <strong>${baseline.metrics.rps}</strong></div>
    <div class="metric">Total Requests: <strong>${baseline.metrics.total_requests}</strong></div>

    <h2>🎚️ Performance Thresholds</h2>
    <div class="threshold">P95 Response Time Threshold: <strong>${baseline.thresholds.p95_response_time}ms</strong></div>
    <div class="threshold">P99 Response Time Threshold: <strong>${baseline.thresholds.p99_response_time}ms</strong></div>
    <div class="threshold">Error Rate Threshold: <strong>${baseline.thresholds.error_rate}%</strong></div>
    <div class="threshold">RPS Threshold: <strong>${baseline.thresholds.requests_per_second}</strong></div>

    <h2>📝 Notes</h2>
    <p>This baseline was established using the light load test scenario. Use this data to detect performance regressions in future test runs.</p>
    <p>Thresholds are set with reasonable tolerance levels to account for normal performance variations.</p>
</body>
</html>`;

  fs.writeFileSync(reportPath, html);
  console.log(`📄 Baseline report generated: ${reportPath}`);
}

// Run baseline recording if called directly
if (require.main === module) {
  recordBaseline();
}

module.exports = { recordBaseline, parseArtilleryOutput };
