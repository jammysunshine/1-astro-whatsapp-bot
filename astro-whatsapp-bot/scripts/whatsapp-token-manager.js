#!/usr/bin/env node

/**
 * WhatsApp Token Manager
 * Monitors, validates, and manages WhatsApp Business API access tokens
 * Handles token expiry detection and automated updates
 */

const axios = require('axios');
const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class WhatsAppTokenManager {
  constructor() {
    this.phoneNumberId = process.env.W1_WHATSAPP_PHONE_NUMBER_ID;
    this.currentToken = process.env.W1_WHATSAPP_ACCESS_TOKEN;
    this.appSecret = process.env.W1_WHATSAPP_APP_SECRET;
    this.railwayToken = process.env.RAILWAY_TOKEN; // Project-scoped token
    this.environment = process.env.NODE_ENV || 'development';

    // WhatsApp API endpoints
    this.baseUrl = 'https://graph.facebook.com/v20.0';
    this.testEndpoint = `${this.baseUrl}/${this.phoneNumberId}/messages`;

    // Configuration
    this.checkInterval = 30 * 60 * 1000; // 30 minutes
    this.alertThreshold = 15 * 60 * 1000; // Alert 15 minutes before expiry
    this.maxRetries = 3;

    // Notification configuration
    this.notificationConfig = {
      email: {
        enabled: !!process.env.EMAIL_USER,
        service: process.env.EMAIL_SERVICE_PROVIDER || 'gmail',
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        from: process.env.EMAIL_USER,
        to: process.env.ALERT_EMAIL || process.env.EMAIL_USER // Default to sender if no alert email
      },
      sms: {
        enabled: !!process.env.TWILIO_ACCOUNT_SID,
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: process.env.ALERT_PHONE_NUMBER
      }
    };

    // Log file for tracking
    this.logFile = path.join(__dirname, '..', 'logs', 'token-manager.log');
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}\n`;

    console.log(logMessage.trim());

    try {
      fs.appendFileSync(this.logFile, logMessage);
    } catch (error) {
      console.error('Failed to write to log file:', error.message);
    }
  }

  /**
   * Test if the current token is valid and get expiry info
   */
  async validateToken(token = this.currentToken) {
    try {
      if (!token || !this.phoneNumberId) {
        throw new Error('Token or Phone Number ID not configured');
      }

      // Method 1: Try Facebook token introspection (for expiry info)
      let expiryInfo = null;
      try {
        expiryInfo = await this.getTokenExpiryFromFacebook(token);
      } catch (introspectError) {
        this.log(`Facebook token introspection failed: ${introspectError.message}`, 'DEBUG');
      }

      // Method 2: Test token by making WhatsApp API call
      const response = await axios.get(
        `${this.baseUrl}/${this.phoneNumberId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      return {
        valid: true,
        data: response.data,
        expires_at: expiryInfo?.expires_at || this.parseTokenExpiry(response.data),
        introspection_data: expiryInfo
      };

    } catch (error) {
      this.log(`Token validation failed: ${error.message}`, 'ERROR');

      // Check if it's an authentication error
      if (error.response?.status === 401 || error.response?.status === 403) {
        return {
          valid: false,
          error: 'TOKEN_EXPIRED',
          details: error.response?.data
        };
      }

      return {
        valid: false,
        error: 'VALIDATION_FAILED',
        details: error.message
      };
    }
  }

  /**
   * Get token expiry information from Facebook's debug_token endpoint
   */
  async getTokenExpiryFromFacebook(token) {
    try {
      const debugUrl = `https://graph.facebook.com/debug_token`;
      const response = await axios.get(debugUrl, {
        params: {
          input_token: token,
          access_token: token // Using same token for both (may not work for all token types)
        },
        timeout: 5000
      });

      if (response.data?.data) {
        const tokenData = response.data.data;
        return {
          app_id: tokenData.app_id,
          application: tokenData.application,
          expires_at: tokenData.expires_at,
          is_valid: tokenData.is_valid,
          issued_at: tokenData.issued_at,
          scopes: tokenData.scopes,
          user_id: tokenData.user_id
        };
      }

      return null;
    } catch (error) {
      // Try alternative approach with app access token if available
      if (this.appSecret) {
        try {
          const appAccessToken = `${this.phoneNumberId}|${this.appSecret}`;
          const response = await axios.get(`https://graph.facebook.com/debug_token`, {
            params: {
              input_token: token,
              access_token: appAccessToken
            },
            timeout: 5000
          });

          if (response.data?.data) {
            const tokenData = response.data.data;
            return {
              app_id: tokenData.app_id,
              application: tokenData.application,
              expires_at: tokenData.expires_at,
              is_valid: tokenData.is_valid,
              issued_at: tokenData.issued_at,
              scopes: tokenData.scopes,
              user_id: tokenData.user_id,
              method: 'app_token'
            };
          }
        } catch (appTokenError) {
          this.log(`App token introspection also failed: ${appTokenError.message}`, 'DEBUG');
        }
      }

      throw error;
    }
  }

  /**
   * Parse token expiry information from API response
   */
  parseTokenExpiry(data) {
    // WhatsApp API doesn't provide explicit expiry in standard responses
    // For free tier, tokens expire hourly
    // We can estimate based on last successful validation time
    return null; // Free tier tokens expire hourly
  }

  /**
   * Get comprehensive token health report
   */
  async getTokenHealthReport(token = this.currentToken) {
    const report = {
      timestamp: new Date().toISOString(),
      token_masked: token ? `${token.substring(0, 10)}...${token.substring(token.length - 10)}` : null,
      checks: {}
    };

    // Check 1: Basic WhatsApp API validation
    try {
      const whatsappCheck = await this.validateTokenViaWhatsApp(token);
      report.checks.whatsapp_api = whatsappCheck;
    } catch (error) {
      report.checks.whatsapp_api = { valid: false, error: error.message };
    }

    // Check 2: Facebook token introspection
    try {
      const facebookCheck = await this.getTokenExpiryFromFacebook(token);
      report.checks.facebook_introspection = facebookCheck;
    } catch (error) {
      report.checks.facebook_introspection = { error: error.message };
    }

    // Check 3: Test various WhatsApp endpoints
    const endpoints = [
      `${this.baseUrl}/${this.phoneNumberId}`,
      `${this.baseUrl}/${this.phoneNumberId}/messages`,
      `${this.baseUrl}/v20.0/${this.phoneNumberId}`
    ];

    report.checks.endpoint_tests = {};
    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(endpoint, {
          headers: { 'Authorization': `Bearer ${token}` },
          timeout: 5000
        });
        report.checks.endpoint_tests[endpoint] = {
          status: response.status,
          success: true
        };
      } catch (error) {
        report.checks.endpoint_tests[endpoint] = {
          status: error.response?.status || 'TIMEOUT',
          success: false,
          error: error.message
        };
      }
    }

    // Calculate overall health score
    report.overall_health = this.calculateHealthScore(report.checks);

    return report;
  }

  /**
   * Validate token using WhatsApp API directly
   */
  async validateTokenViaWhatsApp(token) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/${this.phoneNumberId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      return {
        valid: true,
        status: response.status,
        data: response.data,
        response_time: response.duration || 'unknown'
      };
    } catch (error) {
      return {
        valid: false,
        status: error.response?.status,
        error: error.message,
        details: error.response?.data
      };
    }
  }

  /**
   * Calculate overall health score from 0-100
   */
  calculateHealthScore(checks) {
    let score = 0;
    let totalChecks = 0;

    // WhatsApp API check (most important)
    if (checks.whatsapp_api) {
      totalChecks += 40;
      if (checks.whatsapp_api.valid) score += 40;
    }

    // Facebook introspection (helpful but not critical)
    if (checks.facebook_introspection && !checks.facebook_introspection.error) {
      totalChecks += 20;
      score += 20;
    }

    // Endpoint tests
    if (checks.endpoint_tests) {
      const endpointCount = Object.keys(checks.endpoint_tests).length;
      totalChecks += 40;

      let endpointScore = 0;
      Object.values(checks.endpoint_tests).forEach(test => {
        if (test.success) endpointScore += 1;
      });

      score += Math.round((endpointScore / endpointCount) * 40);
    }

    return totalChecks > 0 ? Math.round((score / totalChecks) * 100) : 0;
  }

  /**
   * Check Railway logs for token expiry errors
   */
  async checkRailwayLogs() {
    try {
      // Get recent logs from Railway
      const logs = execSync('railway logs --tail 50', {
        encoding: 'utf8',
        timeout: 30000
      });

      // Check for token expiry patterns
      const expiryPatterns = [
        /token.*expir/i,
        /invalid.*token/i,
        /unauthorized/i,
        /authentication.*fail/i,
        /403.*forbidden/i,
        /401.*unauthorized/i
      ];

      const lines = logs.split('\n');
      const expiryErrors = [];

      for (const line of lines) {
        for (const pattern of expiryPatterns) {
          if (pattern.test(line)) {
            expiryErrors.push({
              line,
              timestamp: new Date().toISOString(),
              pattern: pattern.toString()
            });
            break;
          }
        }
      }

      return {
        hasErrors: expiryErrors.length > 0,
        errors: expiryErrors,
        totalLines: lines.length
      };

    } catch (error) {
      this.log(`Failed to check Railway logs: ${error.message}`, 'ERROR');
      return { hasErrors: false, errors: [], error: error.message };
    }
  }

  /**
   * Update token in Railway environment variables
   */
  async updateRailwayToken(newToken) {
    try {
      if (!this.railwayToken) {
        throw new Error('RAILWAY_TOKEN not configured for automated updates');
      }

      // Validate new token first
      const validation = await this.validateToken(newToken);
      if (!validation.valid) {
        throw new Error(`New token is invalid: ${validation.error}`);
      }

      // Update Railway variable
      const command = `railway variables --set "W1_WHATSAPP_ACCESS_TOKEN=${newToken}"`;
      execSync(command, { stdio: 'inherit' });

      this.log('Successfully updated WhatsApp token in Railway', 'SUCCESS');
      return true;

    } catch (error) {
      this.log(`Failed to update Railway token: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  /**
    * Send notification about token status
    */
  async sendNotification(message, level = 'INFO') {
    this.log(`NOTIFICATION [${level}]: ${message}`, level);

    const subject = `WhatsApp Token ${level}: ${this.environment}`;

    try {
      // Send email notification
      if (this.notificationConfig.email.enabled) {
        await this.sendEmailNotification(subject, message, level);
      }

      // Send SMS notification for critical alerts
      if (level === 'CRITICAL' && this.notificationConfig.sms.enabled) {
        await this.sendSMSNotification(message);
      }
    } catch (error) {
      this.log(`Failed to send notification: ${error.message}`, 'ERROR');
    }
  }

  /**
    * Send email notification
    */
  async sendEmailNotification(subject, message, level) {
    try {
      // Use nodemailer for email sending
      const nodemailer = require('nodemailer');

      const transporter = nodemailer.createTransporter({
        service: this.notificationConfig.email.service,
        host: this.notificationConfig.email.host,
        port: this.notificationConfig.email.port,
        secure: this.notificationConfig.email.secure,
        auth: this.notificationConfig.email.auth
      });

      const mailOptions = {
        from: this.notificationConfig.email.from,
        to: this.notificationConfig.email.to,
        subject: subject,
        text: message,
        html: this.formatEmailMessage(message, level)
      };

      const info = await transporter.sendMail(mailOptions);
      this.log(`Email notification sent: ${info.messageId}`, 'INFO');
    } catch (error) {
      this.log(`Email notification failed: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  /**
    * Send SMS notification
    */
  async sendSMSNotification(message) {
    try {
      const twilio = require('twilio');

      const client = twilio(
        this.notificationConfig.sms.accountSid,
        this.notificationConfig.sms.authToken
      );

      const smsMessage = await client.messages.create({
        body: `🚨 WhatsApp Token Alert: ${message}`,
        from: this.notificationConfig.sms.from,
        to: this.notificationConfig.sms.to
      });

      this.log(`SMS notification sent: ${smsMessage.sid}`, 'INFO');
    } catch (error) {
      this.log(`SMS notification failed: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  /**
    * Format email message with HTML
    */
  formatEmailMessage(message, level) {
    const colors = {
      INFO: '#17a2b8',
      WARNING: '#ffc107',
      ERROR: '#dc3545',
      CRITICAL: '#dc3545',
      SUCCESS: '#28a745'
    };

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: ${colors[level] || '#6c757d'}; color: white; padding: 20px; border-radius: 5px 5px 0 0;">
          <h2 style="margin: 0;">WhatsApp Token ${level}</h2>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Environment: ${this.environment}</p>
        </div>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 0 0 5px 5px;">
          <pre style="white-space: pre-wrap; font-family: monospace; background: white; padding: 15px; border-radius: 3px; border: 1px solid #dee2e6;">${message}</pre>
          <p style="margin: 15px 0 0 0; color: #6c757d; font-size: 12px;">
            This is an automated notification from the WhatsApp Token Manager.
            Time: ${new Date().toISOString()}
          </p>
        </div>
      </div>
    `;
  }

  /**
    * Attempt to refresh token using available methods
    */
  async attemptTokenRefresh() {
    try {
      this.log('Attempting token refresh', 'INFO');

      // Method 1: Try Facebook token exchange (for paid accounts)
      const exchangeResult = await this.attemptFacebookTokenExchange();
      if (exchangeResult.success) {
        this.log('Token successfully refreshed via Facebook exchange', 'SUCCESS');
        await this.sendNotification('WhatsApp token automatically refreshed', 'SUCCESS');
        return exchangeResult.newToken;
      }

      // Method 2: Try long-lived token generation (if app secret available)
      const longLivedResult = await this.attemptLongLivedToken();
      if (longLivedResult.success) {
        this.log('Long-lived token generated', 'SUCCESS');
        await this.sendNotification('WhatsApp long-lived token generated', 'SUCCESS');
        return longLivedResult.newToken;
      }

      // Fallback: Manual intervention required
      this.log('Automatic refresh not available - manual intervention required', 'WARNING');
      await this.sendNotification(
        'WhatsApp token has expired and could not be automatically refreshed. Please regenerate from Facebook Developer Console.',
        'CRITICAL'
      );

      return false;

    } catch (error) {
      this.log(`Token refresh failed: ${error.message}`, 'ERROR');
      await this.sendNotification(`Token refresh failed: ${error.message}`, 'ERROR');
      return false;
    }
  }

  /**
    * Attempt Facebook token exchange for paid accounts
    */
  async attemptFacebookTokenExchange() {
    try {
      // This requires a long-lived user access token or page access token
      // For WhatsApp Business API paid accounts with system users

      const exchangeUrl = 'https://graph.facebook.com/oauth/access_token';
      const response = await axios.get(exchangeUrl, {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: this.phoneNumberId, // App ID
          client_secret: this.appSecret,
          fb_exchange_token: this.currentToken
        },
        timeout: 10000
      });

      if (response.data?.access_token) {
        return {
          success: true,
          newToken: response.data.access_token,
          expires_in: response.data.expires_in
        };
      }

      return { success: false };
    } catch (error) {
      this.log(`Facebook token exchange failed: ${error.message}`, 'DEBUG');
      return { success: false, error: error.message };
    }
  }

  /**
    * Attempt to generate long-lived token
    */
  async attemptLongLivedToken() {
    try {
      // Use app access token to potentially extend token life
      if (!this.appSecret) {
        return { success: false, error: 'App secret not available' };
      }

      const appAccessToken = `${this.phoneNumberId}|${this.appSecret}`;

      // Try to get app token details
      const debugUrl = 'https://graph.facebook.com/debug_token';
      const response = await axios.get(debugUrl, {
        params: {
          input_token: this.currentToken,
          access_token: appAccessToken
        },
        timeout: 5000
      });

      if (response.data?.data?.is_valid) {
        // Token is still valid according to app, might be a temporary API issue
        return { success: false, error: 'Token appears valid to app but failed API test' };
      }

      return { success: false, error: 'Token validation failed' };
    } catch (error) {
      this.log(`Long-lived token attempt failed: ${error.message}`, 'DEBUG');
      return { success: false, error: error.message };
    }
  }

  /**
   * Main monitoring loop
   */
  async startMonitoring() {
    this.log('Starting WhatsApp Token Manager', 'INFO');

    // Initial token validation
    const initialCheck = await this.validateToken();
    if (!initialCheck.valid) {
      this.log('Initial token validation failed - token may already be expired', 'WARNING');
      await this.handleTokenExpiry();
    } else {
      this.log('Initial token validation passed', 'SUCCESS');
    }

    // Set up periodic checks
    setInterval(async () => {
      try {
        await this.performHealthCheck();
      } catch (error) {
        this.log(`Health check failed: ${error.message}`, 'ERROR');
      }
    }, this.checkInterval);

    // Keep the process running
    process.on('SIGINT', () => {
      this.log('Token Manager shutting down gracefully', 'INFO');
      process.exit(0);
    });

    this.log(`Token monitoring active - checking every ${this.checkInterval / 1000 / 60} minutes`);
  }

  /**
   * Perform comprehensive health check
   */
  async performHealthCheck() {
    this.log('Performing token health check', 'INFO');

    // Check token validity
    const tokenCheck = await this.validateToken();

    // Check logs for errors
    const logCheck = await this.checkRailwayLogs();

    if (!tokenCheck.valid || logCheck.hasErrors) {
      this.log('Token health check failed - initiating expiry handling', 'WARNING');
      await this.handleTokenExpiry(tokenCheck, logCheck);
    } else {
      this.log('Token health check passed', 'SUCCESS');
    }
  }

  /**
    * Handle token expiry detection and recovery
    */
  async handleTokenExpiry(tokenCheck = null, logCheck = null) {
    this.log('Handling token expiry', 'WARNING');

    // Log details
    if (tokenCheck) {
      this.log(`Token validation result: ${JSON.stringify(tokenCheck)}`, 'DEBUG');
    }

    if (logCheck && logCheck.errors.length > 0) {
      this.log(`Log errors found: ${logCheck.errors.length}`, 'WARNING');
      logCheck.errors.forEach((error, index) => {
        this.log(`Error ${index + 1}: ${error.line}`, 'WARNING');
      });
    }

    // Attempt automatic refresh first
    const refreshedToken = await this.attemptTokenRefresh();

    if (refreshedToken) {
      // Automatic refresh succeeded
      this.log('Token automatically refreshed', 'SUCCESS');

      // Update the current token
      this.currentToken = refreshedToken;

      // Update in Railway if possible
      try {
        await this.updateRailwayToken(refreshedToken);
        this.log('Token updated in Railway environment', 'SUCCESS');
      } catch (updateError) {
        this.log(`Failed to update Railway token: ${updateError.message}`, 'ERROR');
        await this.sendNotification(
          `Token refreshed but Railway update failed. Please manually update: ${refreshedToken}`,
          'WARNING'
        );
      }

      return true;
    } else {
      // Automatic refresh failed - manual intervention required
      this.log('Automatic refresh failed - manual intervention required', 'WARNING');

      // Send critical alert
      await this.sendNotification(
        'WhatsApp access token has expired and could not be automatically refreshed. Manual regeneration required.',
        'CRITICAL'
      );

      // Provide instructions for manual update
      this.provideManualUpdateInstructions();

      return false;
    }
  }

  /**
   * Provide instructions for manual token update
   */
  provideManualUpdateInstructions() {
    const instructions = `
🚨 WHATSAPP TOKEN EXPIRED - MANUAL UPDATE REQUIRED 🚨

Follow these steps to regenerate your WhatsApp access token:

1. Go to: https://developers.facebook.com/apps/
2. Select your WhatsApp Business app
3. Navigate to WhatsApp > API Setup
4. Click "Add or Remove Products" if needed
5. Under "Access Tokens", click "Add Access Token"
6. Select your WhatsApp Business Account
7. Copy the new access token

Then run this command to update Railway:
railway variables --set "W1_WHATSAPP_ACCESS_TOKEN=YOUR_NEW_TOKEN_HERE"

Or use the token update script:
npm run update-token YOUR_NEW_TOKEN_HERE

The bot will automatically restart with the new token.
    `;

    this.log(instructions, 'CRITICAL');
    console.log('\n' + '='.repeat(80));
    console.log(instructions);
    console.log('='.repeat(80) + '\n');
  }

  /**
   * Manual token update method
   */
  async updateTokenManually(newToken) {
    try {
      this.log('Manual token update initiated', 'INFO');

      // Validate new token
      const validation = await this.validateToken(newToken);
      if (!validation.valid) {
        throw new Error(`Invalid token provided: ${validation.error}`);
      }

      // Update Railway
      await this.updateRailwayToken(newToken);

      // Verify update
      const verifyCheck = await this.validateToken(newToken);
      if (verifyCheck.valid) {
        this.log('Token successfully updated and verified', 'SUCCESS');
        await this.sendNotification('WhatsApp token successfully updated', 'SUCCESS');
        return true;
      } else {
        throw new Error('Token update verification failed');
      }

    } catch (error) {
      this.log(`Manual token update failed: ${error.message}`, 'ERROR');
      await this.sendNotification(`Token update failed: ${error.message}`, 'ERROR');
      throw error;
    }
  }
}

// CLI interface
async function main() {
  const manager = new WhatsAppTokenManager();
  const command = process.argv[2];

  switch (command) {
    case 'check':
      console.log('🔍 Checking token validity...');
      const result = await manager.validateToken();
      console.log(result.valid ? '✅ Token is valid' : '❌ Token is invalid');
      console.log('Details:', result);
      break;

    case 'monitor':
      console.log('🚀 Starting token monitoring...');
      await manager.startMonitoring();
      break;

    case 'logs':
      console.log('📋 Checking Railway logs for errors...');
      const logResult = await manager.checkRailwayLogs();
      console.log(`Found ${logResult.errors.length} potential token errors`);
      if (logResult.errors.length > 0) {
        logResult.errors.forEach((error, i) => {
          console.log(`${i + 1}. ${error.line}`);
        });
      }
      break;

    case 'update':
      const newToken = process.argv[3];
      if (!newToken) {
        console.error('❌ Please provide the new token: npm run update-token YOUR_NEW_TOKEN');
        process.exit(1);
      }
      console.log('🔄 Updating token...');
      await manager.updateTokenManually(newToken);
      console.log('✅ Token updated successfully');
      break;

    case 'health':
      console.log('🏥 Generating token health report...');
      const healthReport = await manager.getTokenHealthReport();
      console.log('\n📊 Token Health Report:');
      console.log('='.repeat(50));
      console.log(`Overall Health: ${healthReport.overall_health}%`);
      console.log(`Timestamp: ${healthReport.timestamp}`);
      console.log(`Token: ${healthReport.token_masked}`);

      console.log('\n🔍 Checks:');
      Object.entries(healthReport.checks).forEach(([check, result]) => {
        const status = result.valid !== undefined ? (result.valid ? '✅' : '❌') : '⚠️';
        console.log(`  ${status} ${check}: ${result.error || 'OK'}`);
      });
      break;

    default:
      console.log(`
WhatsApp Token Manager

Usage:
  npm run token-manager check          # Validate current token
  npm run token-manager monitor        # Start monitoring service
  npm run token-manager logs           # Check logs for errors
  npm run token-manager update TOKEN   # Update token manually

Environment Variables Required:
  W1_WHATSAPP_PHONE_NUMBER_ID
  W1_WHATSAPP_ACCESS_TOKEN
  RAILWAY_TOKEN (for automated updates)
      `);
  }
}

// Export for use as module
module.exports = WhatsAppTokenManager;

// Run CLI if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Token Manager Error:', error.message);
    process.exit(1);
  });
}