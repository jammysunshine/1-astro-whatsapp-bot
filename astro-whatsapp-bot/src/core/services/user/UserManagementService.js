const logger = require('../../../utils/logger');

/**
 * UserManagementService
 * Handles all user-related business logic with proper separation of concerns
 */
class UserManagementService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  /**
   * Get or create user with business logic
   * @param {string} phoneNumber - User's phone number
   * @returns {Promise<Object>} User object
   */
  async getOrCreateUser(phoneNumber, initialProfileData = {}) {
    try {
      // First try to get existing user
      let user = await this.userRepository.getUserByPhone(phoneNumber);
      
      if (!user) {
        logger.info(`🆕 New user detected: ${phoneNumber}`);
        user = await this.userRepository.createUser(phoneNumber, initialProfileData);
      }
      
      return user;
    } catch (error) {
      logger.error(`Error getting/creating user ${phoneNumber}:`, error);
      throw error;
    }
  }

  /**
   * Update user interaction timestamp
   * @param {string} phoneNumber - User's phone number
   * @returns {Promise<Object>} Updated user object
   */
  async updateUserInteraction(phoneNumber) {
    try {
      const updateData = {
        lastInteraction: new Date()
      };
      
      return await this.userRepository.updateUserProfile(phoneNumber, updateData);
    } catch (error) {
      logger.error(`Error updating interaction timestamp for ${phoneNumber}:`, error);
      throw error;
    }
  }

  /**
   * Check if user needs onboarding
   * @param {Object} user - User object
   * @returns {boolean} True if user needs onboarding
   */
  needsOnboarding(user) {
    // Business logic for determining if user needs onboarding
    return !user || user.isNew || !user.profileComplete;
  }

  /**
   * Validate user for messaging
   * @param {Object} user - User object
   * @param {string} phoneNumber - User's phone number
   * @returns {boolean} True if user is valid for messaging
   */
  validateUser(user, phoneNumber) {
    if (!user) {
      logger.warn(`⚠️ No user found for phone number: ${phoneNumber}`);
      return false;
    }

    // Add more business validation rules as needed
    return true;
  }

  /**
   * Get user profile with business logic
   * @param {string} phoneNumber - User's phone number
   * @returns {Promise<Object|null>} User profile or null
   */
  async getUserProfile(phoneNumber) {
    try {
      const user = await this.userRepository.getUserByPhone(phoneNumber);
      return user;
    } catch (error) {
      logger.error(`Error getting user profile for ${phoneNumber}:`, error);
      return null;
    }
  }

  /**
   * Update user profile with validation
   * @param {string} phoneNumber - User's phone number
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated user object
   */
  async updateUserProfile(phoneNumber, updateData) {
    // Add business validation here if needed
    try {
      const updatedUser = await this.userRepository.updateUserProfile(phoneNumber, updateData);
      return updatedUser;
    } catch (error) {
      logger.error(`Error updating user profile for ${phoneNumber}:`, error);
      throw error;
    }
  }

  /**
   * Complete user onboarding
   * @param {string} phoneNumber - User's phone number
   * @param {Object} onboardingData - Onboarding completion data
   * @returns {Promise<Object>} Updated user object
   */
  async completeOnboarding(phoneNumber, onboardingData = {}) {
    try {
      const updateData = {
        ...onboardingData,
        profileComplete: true,
        onboardingCompletedAt: new Date()
      };

      const updatedUser = await this.userRepository.updateUserProfile(phoneNumber, updateData);
      logger.info(`✅ Onboarding completed for user: ${phoneNumber}`);
      return updatedUser;
    } catch (error) {
      logger.error(`Error completing onboarding for ${phoneNumber}:`, error);
      throw error;
    }
  }
}

module.exports = UserManagementService;