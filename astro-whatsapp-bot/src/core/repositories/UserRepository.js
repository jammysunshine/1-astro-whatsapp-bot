/**
 * UserRepository Interface
 * Abstracts data access operations for user management
 */
class UserRepository {
  /**
   * Get user by phone number
   * @param {string} phoneNumber - User's phone number
   * @returns {Promise<Object|null>} User object or null if not found
   */
  async getUserByPhone(phoneNumber) {
    throw new Error('Method getUserByPhone must be implemented');
  }

  /**
   * Create a new user
   * @param {string} phoneNumber - User's phone number
   * @param {Object} profileData - User profile data
   * @returns {Promise<Object>} Created user object
   */
  async createUser(phoneNumber, profileData = {}) {
    throw new Error('Method createUser must be implemented');
  }

  /**
   * Update user profile
   * @param {string} phoneNumber - User's phone number
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated user object
   */
  async updateUserProfile(phoneNumber, updateData) {
    throw new Error('Method updateUserProfile must be implemented');
  }

  /**
   * Add birth details to user profile
   * @param {string} phoneNumber - User's phone number
   * @param {string} birthDate - Birth date
   * @param {string} birthTime - Birth time
   * @param {string} birthPlace - Birth place
   * @returns {Promise<Object>} Updated user object
   */
  async addBirthDetails(phoneNumber, birthDate, birthTime, birthPlace) {
    throw new Error('Method addBirthDetails must be implemented');
  }

  /**
   * Get all users
   * @returns {Promise<Array>} Array of user objects
   */
  async getAllUsers() {
    throw new Error('Method getAllUsers must be implemented');
  }

  /**
   * Delete user
   * @param {string} phoneNumber - User's phone number
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async deleteUser(phoneNumber) {
    throw new Error('Method deleteUser must be implemented');
  }
}

module.exports = UserRepository;
