/**
 * @interface AstroServiceInterface
 * Defines the standard interface for all astrological services.
 * All services must implement these methods to ensure compatibility with the ServiceGateway.
 */
class AstroServiceInterface {
  /**
   * Initializes the service with necessary configurations or dependencies.
   * @param {object} config - Configuration object for the service.
   */
  initialize(config) {
    throw new Error('Method \'initialize()\' must be implemented by the service.');
  }

  /**
   * Executes the core logic of the astrological service.
   * @param {object} data - Input data for the service execution.
   * @param {object} context - Contextual information (e.g., frontend, locale).
   * @returns {Promise<object>} - The result of the service execution.
   */
  async execute(data, context) {
    throw new Error('Method \'execute()\' must be implemented by the service.');
  }

  /**
   * Validates the input data for the service.
   * @param {object} data - Input data to validate.
   * @returns {object} - Validation result, typically { isValid: boolean, errors: array }.
   */
  validate(data) {
    throw new Error('Method \'validate()\' must be implemented by the service.');
  }

  /**
   * Retrieves metadata about the service.
   * @returns {object} - Service metadata (e.g., name, description, required fields).
   */
  getMetadata() {
    throw new Error('Method \'getMetadata()\' must be implemented by the service.');
  }

  /**
   * Performs a health check for the service.
   * @returns {Promise<object>} - Health status, typically { isHealthy: boolean, message: string }.
   */
  async getHealthStatus() {
    throw new Error('Method \'getHealthStatus()\' must be implemented by the service.');
  }
}

module.exports = AstroServiceInterface;