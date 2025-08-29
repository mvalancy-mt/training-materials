/**
 * Artillery.js Performance Test Processor
 * Provides custom functions and metrics collection for performance testing
 */

const fs = require('fs');
const path = require('path');

module.exports = {
  // Generate random string for test data
  generateRandomString: generateRandomString,

  // Custom metrics collection
  collectCustomMetrics: collectCustomMetrics,

  // Performance assertion helpers
  validateResponseTime: validateResponseTime,

  // Test data generators
  generateTaskData: generateTaskData,

  // Cleanup functions
  cleanupTestData: cleanupTestData
};

/**
 * Generate random string for test scenarios
 */
function generateRandomString(context, events, done) {
  context.vars.$randomString = () => {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
  };
  return done();
}

/**
 * Collect custom performance metrics
 */
function collectCustomMetrics(requestParams, response, context, ee, next) {
  const startTime = Date.now();

  // Track response times by endpoint
  const endpoint = requestParams.url || 'unknown';
  const method = requestParams.method || 'GET';
  const endpointKey = `${method}_${endpoint.replace(/\/api\/v1\/tasks\/[^\/]+/, '/api/v1/tasks/{id}')}`;

  // Custom metrics
  if (response.statusCode >= 400) {
    ee.emit('counter', `errors.${endpointKey}`, 1);
    ee.emit('counter', `errors.status_${response.statusCode}`, 1);
  } else {
    ee.emit('counter', `success.${endpointKey}`, 1);
  }

  // Track response size
  if (response.body) {
    const responseSize = JSON.stringify(response.body).length;
    ee.emit('histogram', `response_size.${endpointKey}`, responseSize);
  }

  // Track memory usage if available in health endpoint
  if (endpoint === '/health' && response.body && response.body.data && response.body.data.memory) {
    const memoryUsage = response.body.data.memory.percentage;
    ee.emit('histogram', 'memory_usage_percentage', memoryUsage);

    if (memoryUsage > 90) {
      ee.emit('counter', 'memory_warnings', 1);
    }
  }

  return next();
}

/**
 * Validate response time against SLA
 */
function validateResponseTime(requestParams, response, context, ee, next) {
  const responseTime = response.timings ? response.timings.response : 0;
  const slaThreshold = context.vars.slaThreshold || 1000; // Default 1s

  if (responseTime > slaThreshold) {
    ee.emit('counter', 'sla_violations', 1);
    console.log(`SLA violation: ${requestParams.url} took ${responseTime}ms (threshold: ${slaThreshold}ms)`);
  }

  return next();
}

/**
 * Generate realistic task data
 */
function generateTaskData(context, events, done) {
  const priorities = ['low', 'medium', 'high', 'critical'];
  const statuses = ['pending', 'in-progress', 'completed', 'cancelled'];

  const titles = [
    'Implement user authentication',
    'Fix database performance issue',
    'Update API documentation',
    'Deploy to staging environment',
    'Review security vulnerabilities',
    'Optimize query performance',
    'Update dependency versions',
    'Implement caching layer',
    'Fix memory leak in service',
    'Add monitoring and alerting'
  ];

  const descriptions = [
    'This task requires immediate attention and careful implementation',
    'Performance optimization needed for better user experience',
    'Security review and vulnerability assessment required',
    'Documentation update to reflect recent API changes',
    'Infrastructure improvements for better reliability',
    'Code refactoring to improve maintainability',
    'Testing automation and quality assurance improvements',
    'Monitoring and observability enhancements needed',
    'Database optimization and indexing improvements',
    'CI/CD pipeline enhancements and automation'
  ];

  context.vars.randomPriority = () => priorities[Math.floor(Math.random() * priorities.length)];
  context.vars.randomStatus = () => statuses[Math.floor(Math.random() * statuses.length)];
  context.vars.randomTitle = () => titles[Math.floor(Math.random() * titles.length)];
  context.vars.randomDescription = () => descriptions[Math.floor(Math.random() * descriptions.length)];

  return done();
}

/**
 * Cleanup test data after performance test
 */
function cleanupTestData(context, events, done) {
  // This would typically clean up any test data
  // For now, just log the cleanup action
  console.log('Performance test cleanup completed');
  return done();
}

/**
 * Setup function called before test scenarios
 */
function setup(context, events, done) {
  // Initialize random data generators
  generateRandomString(context, events, () => {
    generateTaskData(context, events, done);
  });
}

/**
 * Teardown function called after test scenarios
 */
function teardown(context, events, done) {
  cleanupTestData(context, events, done);
}

// Export setup and teardown functions
module.exports.setup = setup;
module.exports.teardown = teardown;
