/**
 * CompatibilityRepository Interface
 * Abstracts data access operations for compatibility-related functionality
 */
class CompatibilityRepository {
  /**
   * Increment compatibility checks counter for a user
   * @param {string} phoneNumber - User's phone number
   * @returns {Promise<boolean>} True if incremented successfully
   */
  async incrementCompatibilityChecks(phoneNumber) {
    throw new Error('Method incrementCompatibilityChecks must be implemented');
  }

  /**
   * Get compatibility check count for a user
   * @param {string} phoneNumber - User's phone number
   * @returns {Promise<number>} Compatibility check count
   */
  async getCompatibilityCheckCount(phoneNumber) {
    throw new Error('Method getCompatibilityCheckCount must be implemented');
  }
}

module.exports = CompatibilityRepository;