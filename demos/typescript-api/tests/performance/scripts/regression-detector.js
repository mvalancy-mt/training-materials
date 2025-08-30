#!/usr/bin/env node

/**
 * Performance Regression Detector
 * Compares current performance against baseline to detect regressions
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { parseArtilleryOutput } = require('./baseline-recorder');

const BASELINE_FILE = path.join(__dirname, '../data/performance-baseline.json');
const REPORTS_DIR = path.join(__dirname, '../reports');

async function detectRegressions() {
  console.log('🔍 Running Performance Regression Detection...');

  try {
    // Check if baseline exists
    if (!fs.existsSync(BASELINE_FILE)) {
      console.log('⚠️  No baseline found. Recording new baseline...');
      const { recordBaseline } = require('./baseline-recorder');
      await recordBaseline();
      console.log('✅ Baseline recorded. Run regression detection again to compare against baseline.');
      return;
    }

    // Load baseline
    const baseline = JSON.parse(fs.readFileSync(BASELINE_FILE, 'utf8'));
    console.log(`📊 Loaded baseline from ${baseline.timestamp}`);

    // Run current performance test
    console.log('🚀 Running current performance test...');
    const testOutput = execSync(
      'npm run test:perf:light',
      {
        cwd: path.join(__dirname, '../../../'),
        encoding: 'utf8',
        stdio: 'pipe'
      }
    );

    // Parse current metrics
    const currentMetrics = parseArtilleryOutput(testOutput);

    // Compare against baseline
    const comparison = compareMetrics(baseline, currentMetrics);

    // Generate regression report
    generateRegressionReport(baseline, currentMetrics, comparison);

    // Output results
    displayResults(comparison);

    // Exit with appropriate code
    if (comparison.hasRegressions) {
      console.log('❌ Performance regressions detected!');
      process.exit(1);
    } else {
      console.log('✅ No performance regressions detected.');
      process.exit(0);
    }

  } catch (error) {
    console.error('❌ Regression detection failed:', error.message);
    process.exit(1);
  }
}

function compareMetrics(baseline, current) {
  const comparison = {
    timestamp: new Date().toISOString(),
    commit: getCurrentCommit(),
    hasRegressions: false,
    results: {}
  };

  // Compare P95 response time
  comparison.results.p95 = {
    baseline: baseline.metrics.p95,
    current: current.p95,
    threshold: baseline.thresholds.p95_response_time,
    change: ((current.p95 - baseline.metrics.p95) / baseline.metrics.p95 * 100).toFixed(2),
    regression: current.p95 > baseline.thresholds.p95_response_time,
    status: current.p95 > baseline.thresholds.p95_response_time ? 'FAIL' : 'PASS'
  };

  // Compare P99 response time
  comparison.results.p99 = {
    baseline: baseline.metrics.p99,
    current: current.p99,
    threshold: baseline.thresholds.p99_response_time,
    change: ((current.p99 - baseline.metrics.p99) / baseline.metrics.p99 * 100).toFixed(2),
    regression: current.p99 > baseline.thresholds.p99_response_time,
    status: current.p99 > baseline.thresholds.p99_response_time ? 'FAIL' : 'PASS'
  };

  // Compare error rate
  comparison.results.error_rate = {
    baseline: baseline.metrics.error_rate,
    current: current.error_rate,
    threshold: baseline.thresholds.error_rate,
    change: ((current.error_rate - baseline.metrics.error_rate) / Math.max(baseline.metrics.error_rate, 0.01) * 100).toFixed(2),
    regression: current.error_rate > baseline.thresholds.error_rate,
    status: current.error_rate > baseline.thresholds.error_rate ? 'FAIL' : 'PASS'
  };

  // Compare requests per second (lower is worse)
  comparison.results.rps = {
    baseline: baseline.metrics.rps,
    current: current.rps,
    threshold: baseline.thresholds.requests_per_second,
    change: ((current.rps - baseline.metrics.rps) / baseline.metrics.rps * 100).toFixed(2),
    regression: current.rps < baseline.thresholds.requests_per_second,
    status: current.rps < baseline.thresholds.requests_per_second ? 'FAIL' : 'PASS'
  };

  // Check if any regressions detected
  comparison.hasRegressions = Object.values(comparison.results).some(result => result.regression);

  return comparison;
}

function getCurrentCommit() {
  try {
    return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}

function generateRegressionReport(baseline, current, comparison) {
  const reportPath = path.join(REPORTS_DIR, `regression-report-${Date.now()}.html`);

  // Ensure reports directory exists
  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Performance Regression Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f4f4f4; padding: 20px; border-radius: 5px; }
        .pass { background: #e8f5e9; color: #2e7d32; }
        .fail { background: #ffebee; color: #c62828; }
        .metric-row { margin: 10px 0; padding: 15px; border-radius: 5px; }
        .summary { padding: 20px; margin: 20px 0; border-radius: 5px; }
        .timestamp { color: #666; font-size: 0.9em; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f2f2f2; }
        .change-positive { color: #2e7d32; }
        .change-negative { color: #c62828; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔍 Performance Regression Report</h1>
        <p class="timestamp">Analysis Date: ${comparison.timestamp}</p>
        <p>Current Commit: <code>${comparison.commit}</code></p>
        <p>Baseline Date: ${baseline.timestamp}</p>
    </div>

    <div class="summary ${comparison.hasRegressions ? 'fail' : 'pass'}">
        <h2>${comparison.hasRegressions ? '❌ REGRESSIONS DETECTED' : '✅ NO REGRESSIONS'}</h2>
        <p>${comparison.hasRegressions ?
          'Performance has degraded beyond acceptable thresholds.' :
          'All performance metrics are within acceptable ranges.'}</p>
    </div>

    <h2>📊 Detailed Comparison</h2>
    <table>
        <tr>
            <th>Metric</th>
            <th>Baseline</th>
            <th>Current</th>
            <th>Change</th>
            <th>Threshold</th>
            <th>Status</th>
        </tr>
        ${Object.entries(comparison.results).map(([metric, data]) => `
        <tr class="${data.status === 'PASS' ? 'pass' : 'fail'}">
            <td><strong>${metric.toUpperCase()}</strong></td>
            <td>${formatMetric(metric, data.baseline)}</td>
            <td>${formatMetric(metric, data.current)}</td>
            <td class="${parseFloat(data.change) >= 0 ? 'change-negative' : 'change-positive'}">
                ${data.change}%
            </td>
            <td>${formatMetric(metric, data.threshold)}</td>
            <td><strong>${data.status}</strong></td>
        </tr>
        `).join('')}
    </table>

    <h2>📝 Recommendations</h2>
    <ul>
        ${comparison.hasRegressions ?
          getRecommendations(comparison.results).map(rec => `<li>${rec}</li>`).join('') :
          '<li>Performance is stable. Continue monitoring with regular regression tests.</li>'}
    </ul>

    <h2>🔧 Troubleshooting</h2>
    <p>If regressions are detected:</p>
    <ul>
        <li>Review recent code changes that might impact performance</li>
        <li>Check if external dependencies have been updated</li>
        <li>Verify test environment consistency</li>
        <li>Consider running memory profiling with <code>npm run test:perf:memory</code></li>
        <li>Run heavy load tests to identify breaking points</li>
    </ul>
</body>
</html>`;

  fs.writeFileSync(reportPath, html);
  console.log(`📄 Regression report generated: ${reportPath}`);
}

function formatMetric(metric, value) {
  switch (metric) {
    case 'p95':
    case 'p99':
      return `${value}ms`;
    case 'error_rate':
      return `${value}%`;
    case 'rps':
      return `${value} req/s`;
    default:
      return value.toString();
  }
}

function getRecommendations(results) {
  const recommendations = [];

  if (results.p95.regression || results.p99.regression) {
    recommendations.push('Response times have increased significantly. Review recent code changes and consider profiling.');
  }

  if (results.error_rate.regression) {
    recommendations.push('Error rate has increased. Check logs for new error patterns and recent API changes.');
  }

  if (results.rps.regression) {
    recommendations.push('Throughput has decreased. Consider performance optimizations and resource scaling.');
  }

  return recommendations;
}

function displayResults(comparison) {
  console.log('\n📊 Performance Comparison Results:');
  console.log('=====================================');

  Object.entries(comparison.results).forEach(([metric, data]) => {
    const status = data.status === 'PASS' ? '✅' : '❌';
    const change = parseFloat(data.change);
    const changeIndicator = change >= 0 ? '📈' : '📉';

    console.log(`${status} ${metric.toUpperCase()}: ${formatMetric(metric, data.current)} (${changeIndicator} ${data.change}%)`);
    console.log(`   Baseline: ${formatMetric(metric, data.baseline)} | Threshold: ${formatMetric(metric, data.threshold)}`);
  });

  console.log('=====================================');
}

// Run regression detection if called directly
if (require.main === module) {
  detectRegressions();
}

module.exports = { detectRegressions, compareMetrics };
