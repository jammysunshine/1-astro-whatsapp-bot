const logger = require('../../shared/utils/logger');

class ResponseFormatter {
  constructor() {
    this.logger = logger; // Use the singleton logger instance
  }

  /**
   * Formats the service response.
   * This can be extended to handle different frontend requirements (e.g., WhatsApp, Web, Mobile).
   * For now, it returns the raw data.
   * @param {string} serviceName - The name of the service that generated the response.
   * @param {object} data - The raw data returned by the service.
   * @param {object} context - The request context, including frontend and locale information.
   * @returns {object} The formatted response.
   */
  formatResponse(serviceName, data, context) {
    this.logger.log(`Formatting response for service: ${serviceName}, frontend: ${context.frontend}`);

    // In a real-world scenario, this would involve more complex logic
    // based on `context.frontend`, `context.locale`, and the service's metadata.
    // For example, it might transform data into a specific UI component format,
    // apply localization, or filter sensitive information.

    return {
      status: 'success',
      service: serviceName,
      data: data,
      metadata: {
        timestamp: new Date().toISOString(),
        frontend: context.frontend,
        locale: context.locale
      }
    };
  }

  /**
   * Formats an error response.
   * @param {string} serviceName - The name of the service that encountered an error.
   * @param {Error} error - The error object.
   * @param {object} context - The request context.
   * @returns {object} The formatted error response.
   */
  formatErrorResponse(serviceName, error, context) {
    this.logger.error(`Formatting error response for service ${serviceName}:`, error.message);

    return {
      status: 'error',
      service: serviceName,
      message: error.message,
      metadata: {
        timestamp: new Date().toISOString(),
        frontend: context.frontend,
        locale: context.locale
      }
    };
  }
}

module.exports = ResponseFormatter;