const CompatibilityRepository = require('./CompatibilityRepository');

/**
 * CompatibilityRepositoryImpl
 * Concrete implementation of CompatibilityRepository interface
 * Wraps the existing userModel to provide compatibility-specific data access
 */
class CompatibilityRepositoryImpl extends CompatibilityRepository {
  constructor(userModel) {
    super();
    this.userModel = userModel;
  }

  async incrementCompatibilityChecks(phoneNumber) {
    return await this.userModel.incrementCompatibilityChecks(phoneNumber);
  }

  async getCompatibilityCheckCount(phoneNumber) {
    // Assuming there's a method to get user and extract compatibility count
    // This might need adjustment based on actual implementation
    const user = await this.userModel.getUserByPhone(phoneNumber);
    return user?.compatibilityChecks || 0;
  }
}

module.exports = CompatibilityRepositoryImpl;