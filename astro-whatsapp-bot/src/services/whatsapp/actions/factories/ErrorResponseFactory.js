/**
 * ErrorResponseFactory - Centralized error message factory
 * Handles all error response formatting that was duplicated across action classes
 * Provides consistent error messaging and notifications
 */

class ErrorResponseFactory {
  /**
   * Create profile completion error message
   * @param {string} serviceName - Name of the requested service
   * @param {Object} config - Action configuration
   * @returns {string} Formatted error message
   */
  static createProfileError(serviceName, config = {}) {
    const customMessage = config?.errorMessages?.incomplete;
    if (customMessage) return customMessage;

    return `👤 *Complete Your Profile First*\n\nTo access ${serviceName}, please complete your birth profile with date, time, and place.\n\nUse the Settings menu to update your information.`;
  }

  /**
   * Create subscription limit exceeded error message
   * @param {Object} limitsCheck - Subscription limits check result
   * @param {Object} config - Action configuration
   * @returns {string} Formatted error message
   */
  static createSubscriptionError(limitsCheck = {}, config = {}) {
    const customMessage = config?.errorMessages?.limitReached;
    if (customMessage) return customMessage;

    const plan = limitsCheck.plan || 'current';
    const feature = config?.subscriptionFeature || 'this feature';

    return `⭐ *Premium Astrology Available*\n\nYou've reached your limit for astrology insights in the ${plan} plan.\n\nUpgrade to Premium for unlimited personalized readings!`;
  }

  /**
   * Create execution error message for failed operations
   * @param {string} featureName - Name of the feature that failed
   * @param {Error} error - Optional error object for more details
   * @returns {string} Formatted error message
   */
  static createExecutionError(featureName = 'astrology reading', error = null) {
    let message = `Sorry, I encountered an issue generating your ${featureName}. Please try again in a moment.`;

    if (error && error.message && process.env.NODE_ENV === 'development') {
      message += `\n\n*Debug:* ${error.message}`;
    }

    return message;
  }

  /**
   * Create service unavailable error message
   * @param {string} serviceName - Name of the unavailable service
   * @returns {string} Formatted error message
   */
  static createServiceUnavailableError(serviceName) {
    return `⚠️ *Service Temporarily Unavailable*\n\n${serviceName} is currently experiencing technical difficulties. Please try again later or contact support if the issue persists.`;
  }

  /**
   * Create rate limit error message
   * @param {Object} rateLimitData - Rate limit information
   * @returns {string} Formatted error message
   */
  static createRateLimitError(rateLimitData = {}) {
    const resetTime = rateLimitData.resetTime ? new Date(rateLimitData.resetTime).toLocaleTimeString() : 'later';
    const limit = rateLimitData.limit || 10;

    return `⏰ *Rate Limit Exceeded*\n\nYou've reached the maximum of ${limit} requests for this service. Please try again ${resetTime}.`;
  }

  /**
   * Create general validation error message
   * @param {Array} validationErrors - List of validation error messages
   * @returns {string} Formatted error message
   */
  static createValidationError(validationErrors = []) {
    const errorText = validationErrors.length > 0
      ? validationErrors.join('\n• ')
      : 'Please check your input and try again.';

    return `❌ *Validation Error*\n\n• ${errorText}\n\nPlease correct these issues and try again.`;
  }

  /**
   * Create input format error message
   * @param {string} fieldName - Name of the field with invalid format
   * @param {string} expectedFormat - Description of expected format
   * @returns {string} Formatted error message
   */
  static createInputFormatError(fieldName, expectedFormat) {
    return `📝 *Invalid Format*\n\nThe ${fieldName} you provided is not in the correct format.\n\nExpected: ${expectedFormat}\n\nPlease check and try again.`;
  }

  /**
   * Create unsupported operation error message
   * @param {string} operationName - Name of the unsupported operation
   * @returns {string} Formatted error message
   */
  static createUnsupportedOperationError(operationName) {
    return `🚫 *Unsupported Operation*\n\n${operationName} is not currently supported. Please choose from the available menu options.`;
  }

  /**
   * Create authentication required error message
   * @param {string} serviceName - Name of the service requiring authentication
   * @returns {string} Formatted error message
   */
  static createAuthRequiredError(serviceName) {
    return `🔐 *Authentication Required*\n\nTo access ${serviceName}, you need to be logged in with a valid account. Please contact support for assistance.`;
  }

  /**
   * Create location services error message
   * @param {string} serviceName - Name of service requiring location
   * @returns {string} Formatted error message
   */
  static createLocationError(serviceName) {
    return `📍 *Location Required*\n\n${serviceName} requires your birth location to calculate accurate results.\n\nPlease update your profile with your birthplace and try again.`;
  }

  /**
   * Create data processing error message
   * @param {string} dataType - Type of data that failed to process
   * @returns {string} Formatted error message
   */
  static createDataProcessingError(dataType) {
    return `🔄 *Data Processing Error*\n\nUnable to process your ${dataType} information. This might be due to invalid format or temporary system issues.\n\nPlease try again or contact support if the problem persists.`;
  }

  /**
   * Create external API error message
   * @param {string} apiName - Name of the external API that failed
   * @returns {string} Formatted error message
   */
  static createExternalApiError(apiName) {
    return `🌐 *External Service Error*\n\n${apiName} is currently experiencing issues. Your request has been logged and we'll process it as soon as the service is available again.\n\nPlease try again in a few minutes.`;
  }

  /**
   * Create database connection error message
   * @returns {string} Formatted error message
   */
  static createDatabaseError() {
    return `💾 *Database Connection Issue*\n\nWe're experiencing temporary database connectivity issues. Your request has been queued and will be processed once the connection is restored.\n\nPlease try again in a few minutes.`;
  }

  /**
   * Create payment required error message
   * @param {Object} paymentData - Payment requirement details
   * @returns {string} Formatted error message
   */
  static createPaymentRequiredError(paymentData = {}) {
    const amount = paymentData.amount || 'premium';
    const service = paymentData.service || 'this service';

    return `💳 *Payment Required*\n\n${service} requires a ${amount} subscription.\n\nUpgrade your plan to access this feature and unlock unlimited astrology insights!`;
  }

  /**
   * Create session expired error message
   * @returns {string} Formatted error message
   */
  static createSessionExpiredError() {
    return `⏰ *Session Expired*\n\nYour session has expired for security reasons. Please restart your conversation by sending "hello" or using the main menu.`;
  }

  /**
   * Create feature coming soon error message
   * @param {string} featureName - Name of the upcoming feature
   * @returns {string} Formatted error message
   */
  static createComingSoonError(featureName) {
    return `🚀 *Coming Soon*\n\n${featureName} is currently in development and will be available soon. Stay tuned for updates!\n\nIn the meantime, explore our other astrology services.`;
  }

  /**
   * Create terms of service acceptance required error message
   * @param {string} serviceName - Name of service requiring ToS acceptance
   * @returns {string} Formatted error message
   */
  static createTermsAcceptanceError(serviceName) {
    return `📋 *Terms of Service Required*\n\nTo use ${serviceName}, you must accept our terms of service. Please review and accept the terms before proceeding.`;
  }

  // Helper methods for common error patterns

  /**
   * Get standard retry message
   * @returns {string} Standard retry instruction
   */
  static getRetryMessage() {
    return '\n\n🔄 Please try again in a few minutes.';
  }

  /**
   * Get standard support contact message
   * @returns {string} Support contact instruction
   */
  static getSupportMessage() {
    return '\n\n🆘 Contact support if the problem persists.';
  }

  /**
   * Format error with additional context
   * @param {string} baseMessage - Base error message
   * @param {Object} context - Additional context information
   * @returns {string} Enhanced error message
   */
  static formatErrorWithContext(baseMessage, context = {}) {
    let enhanced = baseMessage;

    if (context.requestId) {
      enhanced += `\n\n*Request ID:* ${context.requestId}`;
    }

    if (context.timestamp) {
      enhanced += `\n*Time:* ${new Date(context.timestamp).toLocaleString()}`;
    }

    if (context.suggestedAction) {
      enhanced += `\n\n💡 *Suggested Action:* ${context.suggestedAction}`;
    }

    return enhanced;
  }

  /**
   * Create a generic error wrapper for consistency
   * @param {string} title - Error title
   * @param {string} message - Error message
   * @param {Object} actions - Available actions
   * @returns {string} Formatted error message
   */
  static createGenericError(title, message, actions = {}) {
    let fullMessage = `❌ *${title}*\n\n${message}`;

    if (actions.retry) {
      fullMessage += '\n\n🔄 You can try again.';
    }

    if (actions.contactSupport) {
      fullMessage += '\n\n🆘 Contact support for help.';
    }

    if (actions.upgrade) {
      fullMessage += '\n\n⭐ Consider upgrading your plan.';
    }

    return fullMessage;
  }
}

module.exports = { ErrorResponseFactory };