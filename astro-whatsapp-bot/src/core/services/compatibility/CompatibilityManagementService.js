const logger = require('../../utils/logger');

/**
 * CompatibilityManagementService
 * Handles compatibility-related business logic with proper separation of concerns
 */
class CompatibilityManagementService {
  constructor(compatibilityRepository) {
    this.compatibilityRepository = compatibilityRepository;
  }

  /**
   * Increment compatibility check count for user
   * @param {string} phoneNumber - User's phone number
   * @returns {Promise<boolean>} True if incremented successfully
   */
  async incrementCompatibilityCheck(phoneNumber) {
    try {
      await this.compatibilityRepository.incrementCompatibilityChecks(phoneNumber);
      logger.info(`Compatibility check incremented for user: ${phoneNumber}`);
      return true;
    } catch (error) {
      logger.error(`Error incrementing compatibility check for ${phoneNumber}:`, error);
      throw error;
    }
  }

  /**
   * Get compatibility check count for user
   * @param {string} phoneNumber - User's phone number
   * @returns {Promise<number>} Compatibility check count
   */
  async getCompatibilityCheckCount(phoneNumber) {
    try {
      return await this.compatibilityRepository.getCompatibilityCheckCount(phoneNumber);
    } catch (error) {
      logger.error(`Error getting compatibility check count for ${phoneNumber}:`, error);
      return 0;
    }
  }

  /**
   * Validate if user can perform compatibility check
   * @param {string} phoneNumber - User's phone number
   * @param {Object} user - User object (optional, if already loaded)
   * @returns {Promise<boolean>} True if user can perform compatibility check
   */
  async canPerformCompatibilityCheck(phoneNumber, user = null) {
    // Add business logic for validating compatibility checks
    // This might check subscription limits, daily limits, etc.
    try {
      // For now, just return true, but this could contain business rules
      return true;
    } catch (error) {
      logger.error(`Error validating compatibility check for ${phoneNumber}:`, error);
      return false;
    }
  }
}

module.exports = CompatibilityManagementService;