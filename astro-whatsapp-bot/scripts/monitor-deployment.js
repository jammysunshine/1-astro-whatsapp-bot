#!/usr/bin/env node

/**
 * Railway Deployment Monitor
 * Monitors the Astro WhatsApp Bot deployment for health, performance, and restart issues
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

class DeploymentMonitor {
  constructor() {
    this.baseUrl = process.env.RAILWAY_APP_URL || 'http://localhost:3000';
    this.checkInterval = parseInt(process.env.CHECK_INTERVAL) || 30000; // 30 seconds
    this.alertThreshold = parseInt(process.env.ALERT_THRESHOLD) || 3; // consecutive failures
    this.memoryThreshold = parseInt(process.env.MEMORY_THRESHOLD) || 300; // MB

    this.consecutiveFailures = 0;
    this.lastHealthStatus = null;
    this.restartCount = 0;
    this.startTime = Date.now();

    // Create logs directory if it doesn't exist
    const logsDir = path.join(__dirname, '..', 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    this.logFile = path.join(logsDir, 'deployment-monitor.log');
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;

    console.log(logEntry.trim());

    // Append to log file
    fs.appendFileSync(this.logFile, logEntry);
  }

  async checkHealth() {
    return new Promise((resolve) => {
      const url = new URL('/health', this.baseUrl);
      const client = url.protocol === 'https:' ? https : http;

      const req = client.get(url, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const health = JSON.parse(data);
            resolve({
              status: res.statusCode,
              data: health,
              success: res.statusCode === 200 && health.status === 'healthy'
            });
          } catch (error) {
            resolve({
              status: res.statusCode,
              error: error.message,
              success: false
            });
          }
        });
      });

      req.on('error', (error) => {
        resolve({
          error: error.message,
          success: false
        });
      });

      req.setTimeout(10000, () => {
        req.destroy();
        resolve({
          error: 'Request timeout',
          success: false
        });
      });
    });
  }

  async checkReadiness() {
    return new Promise((resolve) => {
      const url = new URL('/ready', this.baseUrl);
      const client = url.protocol === 'https:' ? https : http;

      const req = client.get(url, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const ready = JSON.parse(data);
            resolve({
              status: res.statusCode,
              data: ready,
              success: res.statusCode === 200 && ready.status === 'ready'
            });
          } catch (error) {
            resolve({
              status: res.statusCode,
              error: error.message,
              success: false
            });
          }
        });
      });

      req.on('error', (error) => {
        resolve({
          error: error.message,
          success: false
        });
      });

      req.setTimeout(5000, () => {
        req.destroy();
        resolve({
          error: 'Request timeout',
          success: false
        });
      });
    });
  }

  async performChecks() {
    const timestamp = new Date().toISOString();

    // Check health endpoint
    const healthResult = await this.checkHealth();

    // Check readiness endpoint
    const readyResult = await this.checkReadiness();

    // Analyze results
    const overallSuccess = healthResult.success && readyResult.success;

    if (overallSuccess) {
      this.consecutiveFailures = 0;
      this.log(`✅ Deployment healthy - Health: ${healthResult.status}, Ready: ${readyResult.status}`);

      // Check memory usage
      if (healthResult.data && healthResult.data.memory) {
        const mem = healthResult.data.memory;
        if (mem.heapUsed > this.memoryThreshold) {
          this.log(`⚠️ High memory usage detected: ${mem.heapUsed}MB heap used`, 'warn');
        }
      }
    } else {
      this.consecutiveFailures++;
      this.log(`❌ Deployment unhealthy - Failures: ${this.consecutiveFailures}/${this.alertThreshold}`, 'error');

      if (healthResult.error) {
        this.log(`Health check error: ${healthResult.error}`, 'error');
      }
      if (readyResult.error) {
        this.log(`Readiness check error: ${readyResult.error}`, 'error');
      }

      // Alert if threshold reached
      if (this.consecutiveFailures >= this.alertThreshold) {
        this.sendAlert(healthResult, readyResult);
      }
    }

    // Detect potential restarts (uptime reset)
    if (healthResult.data && healthResult.data.uptime) {
      const currentUptime = healthResult.data.uptime;
      if (this.lastHealthStatus && this.lastHealthStatus.uptime > currentUptime) {
        this.restartCount++;
        this.log(`🔄 Container restart detected (#${this.restartCount}) - Uptime reset from ${this.lastHealthStatus.uptime}s to ${currentUptime}s`, 'warn');
      }
      this.lastHealthStatus = healthResult.data;
    }

    return overallSuccess;
  }

  sendAlert(healthResult, readyResult) {
    const alertMessage = `
🚨 DEPLOYMENT ALERT 🚨

Time: ${new Date().toISOString()}
Consecutive Failures: ${this.consecutiveFailures}
Total Restarts Detected: ${this.restartCount}

Health Check: ${healthResult.success ? 'PASS' : 'FAIL'}
${healthResult.error ? `Error: ${healthResult.error}` : ''}

Readiness Check: ${readyResult.success ? 'PASS' : 'FAIL'}
${readyResult.error ? `Error: ${readyResult.error}` : ''}

Action Required: Check Railway logs and deployment status
    `.trim();

    this.log(alertMessage, 'error');

    // In a real implementation, you would send this to Slack, email, etc.
    // For now, just log it
  }

  generateReport() {
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);
    const report = {
      timestamp: new Date().toISOString(),
      monitorUptime: uptime,
      totalRestarts: this.restartCount,
      consecutiveFailures: this.consecutiveFailures,
      lastHealthStatus: this.lastHealthStatus,
      recommendations: []
    };

    if (this.restartCount > 0) {
      report.recommendations.push('Investigate container restart causes in Railway logs');
    }

    if (this.consecutiveFailures > 0) {
      report.recommendations.push('Check application health and environment variables');
    }

    if (this.lastHealthStatus && this.lastHealthStatus.memory) {
      const mem = this.lastHealthStatus.memory;
      if (mem.heapUsed > this.memoryThreshold) {
        report.recommendations.push(`Optimize memory usage (currently ${mem.heapUsed}MB)`);
      }
    }

    return report;
  }

  async start() {
    this.log('🚀 Starting Railway Deployment Monitor');
    this.log(`📊 Monitoring: ${this.baseUrl}`);
    this.log(`⏱️ Check interval: ${this.checkInterval}ms`);
    this.log(`🚨 Alert threshold: ${this.alertThreshold} consecutive failures`);

    // Initial check
    await this.performChecks();

    // Set up periodic checks
    setInterval(async () => {
      await this.performChecks();
    }, this.checkInterval);

    // Generate report every hour
    setInterval(() => {
      const report = this.generateReport();
      this.log(`📋 Hourly Report: ${JSON.stringify(report, null, 2)}`);
    }, 60 * 60 * 1000); // Every hour
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down monitor...');
  const monitor = new DeploymentMonitor();
  const report = monitor.generateReport();
  monitor.log(`📋 Final Report: ${JSON.stringify(report, null, 2)}`);
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down monitor...');
  process.exit(0);
});

// Start the monitor if this script is run directly
if (require.main === module) {
  const monitor = new DeploymentMonitor();
  monitor.start().catch((error) => {
    console.error('❌ Monitor startup failed:', error);
    process.exit(1);
  });
}

module.exports = DeploymentMonitor;