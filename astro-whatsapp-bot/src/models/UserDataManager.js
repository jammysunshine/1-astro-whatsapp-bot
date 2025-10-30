const logger = require('../utils/logger');
const User = require('./User');

/**
 * UserDataManager - Handles core CRUD operations for user profiles
 * Manages user creation, retrieval, updates, and profile operations
 */
class UserDataManager {
  constructor() {
    this.logger = logger;
  }

  /**
   * Create a new user
   * @param {string} phoneNumber - User's WhatsApp phone number
   * @param {Object} profileData - Additional profile information
   * @returns {Promise<Object>} Created user object
   */
  async createUser(phoneNumber, profileData = {}) {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ phoneNumber });
      if (existingUser) {
        this.logger.warn(`⚠️ User already exists: ${phoneNumber}`);
        return existingUser.toObject();
      }

      const userId = User.generateUserId();
      const referralCode = User.generateReferralCode();

      // Ensure name is always set with proper default
      const userData = {
        id: userId,
        phoneNumber,
        referralCode,
        name: profileData.name || 'Cosmic Explorer', // Ensure default is set
        ...profileData // Spread other profile data
      };

      this.logger.info('🆕 Creating new user with data:', userData);
      const user = new User(userData);
      await user.save();

      this.logger.info(`🆕 Created new user: ${phoneNumber} with name: ${user.name}`);
      return user.toObject();
    } catch (error) {
      this.logger.error(`❌ Error creating user ${phoneNumber}:`, error);
      throw error;
    }
  }

  /**
   * Get user by phone number
   * @param {string} phoneNumber - User's WhatsApp phone number
   * @returns {Promise<Object|null>} User object or null if not found
   */
  async getUserByPhone(phoneNumber) {
    try {
      const user = await User.findOne({ phoneNumber });
      if (user) {
        this.logger.debug(`🔍 Found user: ${phoneNumber}`);
        return user.toObject();
      }
      this.logger.debug(`🔍 User not found: ${phoneNumber}`);
      return null;
    } catch (error) {
      this.logger.error(`❌ Error getting user ${phoneNumber}:`, error);
      throw error;
    }
  }

  /**
   * Update user profile
   * @param {string} phoneNumber - User's WhatsApp phone number
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated user object
   */
  async updateUserProfile(phoneNumber, updateData) {
    try {
      this.logger.info(`Attempting to update user profile for ${phoneNumber} with data:`, updateData);

      const user = await User.findOneAndUpdate(
        { phoneNumber },
        {
          ...updateData,
          lastInteraction: new Date(),
          updatedAt: new Date()
        },
        {
          new: true,
          runValidators: true
        }
      );

      if (!user) {
        throw new Error(`User not found: ${phoneNumber}`);
      }

      this.logger.info(`🔄 Updated user profile: ${phoneNumber}. New profileComplete status: ${user.profileComplete}`);
      return user.toObject();
    } catch (error) {
      this.logger.error(`❌ Error updating user ${phoneNumber}:`, error);
      throw error;
    }
  }

  /**
   * Add birth details to user profile
   * @param {string} phoneNumber - User's WhatsApp phone number
   * @param {string} birthDate - Birth date in DDMMYY or DDMMYYYY format
   * @param {string} birthTime - Birth time in HHMM format (optional but recommended)
   * @param {string} birthPlace - Birth place (City, Country)
   * @returns {Promise<Object>} Updated user object
   */
  async addBirthDetails(phoneNumber, birthDate, birthTime = null, birthPlace = null) {
    try {
      const updateData = {
        birthDate,
        birthTime,
        birthPlace,
        profileComplete: !!(birthDate && birthDate.trim() && birthPlace && birthPlace.trim())
      };

      this.logger.info(`🎂 Setting profileComplete to ${updateData.profileComplete} for user: ${phoneNumber}`);
      this.logger.info(`🎂 Birth data: date=${birthDate}, time=${birthTime}, place=${birthPlace}`);

      const user = await User.findOneAndUpdate({ phoneNumber }, updateData, {
        new: true,
        runValidators: true
      });

      if (!user) {
        throw new Error(`User not found: ${phoneNumber}`);
      }

      this.logger.info(`🎂 Added birth details for user: ${phoneNumber}`);
      this.logger.info(`📊 Profile completion status: ${user.profileComplete}`);
      return user.toObject();
    } catch (error) {
      this.logger.error(`❌ Error adding birth details for ${phoneNumber}:`, error);
      throw error;
    }
  }

  /**
   * Get all users (for admin purposes)
   * @returns {Promise<Array>} Array of all users
   */
  async getAllUsers() {
    try {
      const users = await User.find({}).sort({ createdAt: -1 });
      return users.map(user => user.toObject());
    } catch (error) {
      this.logger.error('❌ Error getting all users:', error);
      throw error;
    }
  }

  /**
   * Delete user
   * @param {string} phoneNumber - User's phone number to delete
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async deleteUser(phoneNumber) {
    try {
      const result = await User.deleteOne({ phoneNumber });
      const deleted = result.deletedCount > 0;

      if (deleted) {
        this.logger.info(`🗑️ Deleted user: ${phoneNumber}`);
      }

      return deleted;
    } catch (error) {
      this.logger.error(`❌ Error deleting user ${phoneNumber}:`, error);
      throw error;
    }
  }
}

module.exports = { UserDataManager };