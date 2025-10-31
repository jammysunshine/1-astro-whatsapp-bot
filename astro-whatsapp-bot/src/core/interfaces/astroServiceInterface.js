class AstroServiceInterface {
  /**
   * Execute the astrological service
   * @param {Object} data - Input data for the service
   * @returns {Promise<Object>} - Service result
   */
  async execute(data) {
    throw new Error('execute method must be implemented');
  }

  /**
   * Validate input data
   * @param {Object} data - Input data to validate
   * @returns {boolean} - True if valid
   */
  validate(data) {
    throw new Error('validate method must be implemented');
  }

  /**
   * Get service metadata
   * @returns {Object} - Service information
   */
  getMetadata() {
    throw new Error('getMetadata method must be implemented');
  }
}

module.exports = AstroServiceInterface;