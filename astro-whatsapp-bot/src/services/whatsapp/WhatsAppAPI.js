const axios = require('axios');
const logger = require('../../utils/logger');

/**
 * WhatsAppAPI - Core WhatsApp Business API interactions
 * Handles credentials, authentication, error handling, and base API calls
 */
class WhatsAppAPI {
  constructor() {
    this.apiUrl = 'https://graph.facebook.com/v24.0';
  }

  /**
   * Get WhatsApp credentials from environment
   * @returns {Object} credentials
   */
  getCredentials() {
    // Reconstruct token from two parts to bypass Render's env var size limit
    const tokenPart1 = process.env.W1_WHATSAPP_ACCESS_TOKEN_PART1;
    const tokenPart2 = process.env.W1_WHATSAPP_ACCESS_TOKEN_PART2;
    const accessToken =
      tokenPart1 && tokenPart2 ?
        tokenPart1 + tokenPart2 :
        process.env.W1_WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.W1_WHATSAPP_PHONE_NUMBER_ID;

    logger.debug(
      `WhatsApp Access Token (masked): ${accessToken ? `${accessToken.substring(0, 5)}...${accessToken.substring(accessToken.length - 5)}` : 'Not Set'}`
    );
    logger.debug(
      `WhatsApp Token Length: ${accessToken ? accessToken.length : 0}`
    );
    logger.debug(`WhatsApp Phone Number ID: ${phoneNumberId || 'Not Set'}`);

    return { accessToken, phoneNumberId };
  }

  /**
   * Validate that required credentials are available
   * @returns {boolean} true if all credentials are present
   */
  validateCredentials() {
    const { accessToken, phoneNumberId } = this.getCredentials();
    return !!(accessToken && phoneNumberId);
  }

  /**
   * Make a POST request to WhatsApp API
   * @param {string} endpoint - API endpoint (e.g., '/messages')
   * @param {Object} payload - Request payload
   * @param {number} timeout - Request timeout in milliseconds
   * @returns {Promise<Object>} API response
   */
  async makeRequest(endpoint, payload, timeout = 30000) {
    const { accessToken, phoneNumberId } = this.getCredentials();

    if (!this.validateCredentials()) {
      throw new Error('WhatsApp API credentials not configured');
    }

    const url = `${this.apiUrl}/${phoneNumberId}${endpoint}`;

    try {
      const response = await axios.post(url, payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        timeout
      });

      return response.data;
    } catch (error) {
      throw this.handleApiError(error, 'API request');
    }
  }

  /**
   * Handle WhatsApp API errors with specific error codes
   * @param {Error} error - Axios error object
   * @param {string} context - Error context for logging
   * @returns {Error} Formatted error
   */
  handleApiError(error, context) {
    const status = error.response?.status;
    const errorData = error.response?.data;

    let message =
      errorData?.error?.message || errorData?.message || error.message;

    if (status === 400) {
      message = `Bad request: ${message}`;
    } else if (status === 401) {
      message = `Invalid access token: ${message}`;
    } else if (status === 403) {
      message = `Access denied: ${message}`;
    } else if (status === 404) {
      message = `Resource not found: ${message}`;
    } else if (status === 410) {
      message = `Resource expired: ${message}`;
    } else if (status === 413) {
      message = `Request too large: ${message}`;
    } else if (status === 415) {
      message = `Unsupported media type: ${message}`;
    } else if (status === 429) {
      message = `Rate limit exceeded: ${message}`;
    }

    logger.error(`❌ WhatsApp API ${context} failed: ${message}`);

    return new Error(message);
  }

  /**
   * Mark message as read
   * @param {string} messageId - WhatsApp message ID to mark as read
   * @returns {Promise<Object>} API response
   */
  async markMessageAsRead(messageId) {
    const payload = {
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId
    };

    try {
      const response = await this.makeRequest('/messages', payload);
      logger.info(`👁️ Message marked as read: ${messageId}`);
      return response;
    } catch (error) {
      logger.error(
        `❌ Failed to mark message ${messageId} as read:`,
        error.message
      );
      throw error;
    }
  }

  /**
   * Health check for WhatsApp API
   * @returns {Object} Health status
   */
  healthCheck() {
    try {
      const credentialsValid = this.validateCredentials();
      const apiUrlAccessible = !!this.apiUrl;

      return {
        healthy: credentialsValid && apiUrlAccessible,
        credentials: credentialsValid,
        apiUrl: apiUrlAccessible,
        version: 'v24.0',
        status: credentialsValid ? 'Ready' : 'Credentials missing'
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Export singleton instance
const whatsappAPI = new WhatsAppAPI();

module.exports = { WhatsAppAPI, whatsappAPI };
