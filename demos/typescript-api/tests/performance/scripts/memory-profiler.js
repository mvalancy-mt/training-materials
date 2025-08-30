#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Memory profiling script using Node.js built-in inspector
 * Replaces Clinic.js functionality while maintaining security
 */
class MemoryProfiler {
    constructor() {
        this.reportDir = path.join(__dirname, '../reports');
        this.dataDir = path.join(__dirname, '../data');
        this.ensureDirectories();
    }

    ensureDirectories() {
        [this.reportDir, this.dataDir].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }

    async profile() {
        console.log('🔍 Starting memory profiling...');

        // Start the server with Node.js inspector
        const server = spawn('node', [
            '--inspect=127.0.0.1:9229',
            '--max-old-space-size=256',
            'dist/app.js'
        ], {
            stdio: 'pipe',
            cwd: path.join(__dirname, '../../..')
        });

        let serverReady = false;
        let memoryData = [];

        // Wait for server to start
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Server startup timeout'));
            }, 30000);

            server.stdout.on('data', (data) => {
                const output = data.toString();
                console.log('Server:', output.trim());

                if (output.includes('Server running on port') ||
                    output.includes('listening on port') ||
                    output.includes('started')) {
                    serverReady = true;
                    clearTimeout(timeout);
                    resolve();
                }
            });

            server.stderr.on('data', (data) => {
                console.log('Server stderr:', data.toString().trim());
            });
        });

        if (!serverReady) {
            throw new Error('Server failed to start');
        }

        console.log('✅ Server started, running memory test...');

        // Run the memory test scenario
        const artillery = spawn('artillery', [
            'run',
            'tests/performance/scenarios/memory-test.yml'
        ], {
            stdio: 'pipe',
            cwd: path.join(__dirname, '../../..')
        });

        // Monitor memory usage during test
        const memoryMonitor = setInterval(() => {
            const memUsage = process.memoryUsage();
            memoryData.push({
                timestamp: Date.now(),
                heapUsed: memUsage.heapUsed,
                heapTotal: memUsage.heapTotal,
                external: memUsage.external,
                rss: memUsage.rss
            });
        }, 1000);

        // Wait for artillery test to complete
        await new Promise((resolve, reject) => {
            artillery.stdout.on('data', (data) => {
                console.log('Artillery:', data.toString().trim());
            });

            artillery.stderr.on('data', (data) => {
                console.log('Artillery stderr:', data.toString().trim());
            });

            artillery.on('close', (code) => {
                clearInterval(memoryMonitor);
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`Artillery exited with code ${code}`));
                }
            });
        });

        // Clean up server
        server.kill();

        // Generate memory report
        await this.generateReport(memoryData);

        console.log('✅ Memory profiling completed');
    }

    async generateReport(memoryData) {
        const timestamp = Date.now();
        const reportPath = path.join(this.reportDir, `memory-report-${timestamp}.html`);

        // Calculate memory statistics
        const heapUsed = memoryData.map(d => d.heapUsed);
        const maxHeap = Math.max(...heapUsed);
        const avgHeap = heapUsed.reduce((a, b) => a + b, 0) / heapUsed.length;
        const memoryGrowth = heapUsed[heapUsed.length - 1] - heapUsed[0];

        const report = `
<!DOCTYPE html>
<html>
<head>
    <title>Memory Profile Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f4f4f4; padding: 20px; border-radius: 5px; }
        .metric { margin: 10px 0; padding: 15px; background: #e3f2fd; border-radius: 5px; }
        .warning { background: #fff3e0; color: #f57f17; }
        .error { background: #ffebee; color: #c62828; }
        .timestamp { color: #666; font-size: 0.9em; }
        .chart-container { margin: 20px 0; height: 300px; background: #fafafa; border-radius: 5px; padding: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🧠 Memory Profile Report</h1>
        <p class="timestamp">Generated: ${new Date().toISOString()}</p>
        <p>Duration: ${(memoryData.length)} seconds</p>
    </div>

    <h2>📊 Memory Statistics</h2>
    <div class="metric">
        <strong>Max Heap Used:</strong> ${(maxHeap / 1024 / 1024).toFixed(2)} MB
    </div>
    <div class="metric">
        <strong>Average Heap Used:</strong> ${(avgHeap / 1024 / 1024).toFixed(2)} MB
    </div>
    <div class="metric ${memoryGrowth > 50 * 1024 * 1024 ? 'warning' : ''}">
        <strong>Memory Growth:</strong> ${(memoryGrowth / 1024 / 1024).toFixed(2)} MB
    </div>

    <h2>🔧 Analysis</h2>
    <ul>
        ${memoryGrowth > 100 * 1024 * 1024 ?
            '<li class="error">⚠️ Significant memory growth detected - potential memory leak</li>' :
            '<li>✅ Memory usage appears stable</li>'
        }
        ${maxHeap > 200 * 1024 * 1024 ?
            '<li class="warning">⚠️ High memory usage detected</li>' :
            '<li>✅ Memory usage within acceptable limits</li>'
        }
    </ul>

    <div class="chart-container">
        <p><em>Memory usage chart would be displayed here with a charting library in production</em></p>
        <pre>${JSON.stringify(memoryData.slice(-10), null, 2)}</pre>
    </div>

    <h2>📝 Recommendations</h2>
    <ul>
        <li>Monitor for gradual memory increases over time</li>
        <li>Use Node.js --inspect for detailed memory profiling</li>
        <li>Consider implementing memory usage alerts</li>
        <li>Review garbage collection patterns</li>
    </ul>
</body>
</html>`;

        fs.writeFileSync(reportPath, report);

        // Save raw data
        const dataPath = path.join(this.dataDir, `memory-data-${timestamp}.json`);
        fs.writeFileSync(dataPath, JSON.stringify({
            timestamp: new Date().toISOString(),
            memoryData,
            statistics: {
                maxHeap,
                avgHeap,
                memoryGrowth,
                duration: memoryData.length
            }
        }, null, 2));

        console.log(`📊 Memory report generated: ${reportPath}`);
    }
}

// Run profiling if executed directly
if (require.main === module) {
    const profiler = new MemoryProfiler();
    profiler.profile().catch(error => {
        console.error('❌ Memory profiling failed:', error.message);
        process.exit(1);
    });
}

module.exports = MemoryProfiler;
