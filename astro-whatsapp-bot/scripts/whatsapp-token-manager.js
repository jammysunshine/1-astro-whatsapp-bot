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
   * Test if the current token is valid
   */
  async validateToken(token = this.currentToken) {
    try {
      if (!token || !this.phoneNumberId) {
        throw new Error('Token or Phone Number ID not configured');
      }

      // Test token by making a simple API call
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
        expires_at: this.parseTokenExpiry(response.data)
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
   * Parse token expiry information from API response
   */
  parseTokenExpiry(data) {
    // WhatsApp doesn't provide explicit expiry in response
    // For free tier, tokens expire hourly
    // We'll use a heuristic based on token creation time
    return null; // Free tier tokens expire hourly
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
    // For now, just log. In production, integrate with email/SMS/webhook
    this.log(`NOTIFICATION [${level}]: ${message}`, level);

    // TODO: Implement actual notification system
    // Options: Email, SMS, Slack webhook, Telegram bot, etc.
  }

  /**
   * Attempt to refresh token using available methods
   */
  async attemptTokenRefresh() {
    try {
      // For free tier, automatic refresh is not possible
      // This would work for paid accounts with system user tokens

      this.log('Attempting token refresh (limited support for free tier)', 'INFO');

      // For paid accounts, you could use:
      // POST /oauth/access_token with grant_type=fb_exchange_token

      // For now, just notify that manual intervention is needed
      await this.sendNotification(
        'WhatsApp token has expired. Please regenerate from Facebook Developer Console.',
        'CRITICAL'
      );

      return false; // Manual intervention required

    } catch (error) {
      this.log(`Token refresh failed: ${error.message}`, 'ERROR');
      return false;
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

    // Send alert
    await this.sendNotification(
      'WhatsApp access token has expired or is invalid. Manual regeneration required.',
      'CRITICAL'
    );

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

    // Attempt automatic refresh (limited for free tier)
    const refreshed = await this.attemptTokenRefresh();

    if (!refreshed) {
      this.log('Automatic refresh not available - manual intervention required', 'WARNING');

      // Provide instructions for manual update
      this.provideManualUpdateInstructions();
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