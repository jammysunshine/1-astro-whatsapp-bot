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

      this.logger.info(
        `🆕 Created new user: ${phoneNumber} with name: ${user.name}`
      );
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
      this.logger.info(
        `Attempting to update user profile for ${phoneNumber} with data:`,
        updateData
      );

      // CRITICAL: Sanitize updateData to prevent NoSQL injection
      // MongoDB operators starting with '$' can be dangerously injected
      const sanitizedData = this._sanitizeUpdateData(updateData);

      this.logger.debug(`Sanitized update data for ${phoneNumber}:`, sanitizedData);

      const user = await User.findOneAndUpdate(
        { phoneNumber },
        {
          ...sanitizedData,
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

      this.logger.info(
        `🔄 Updated user profile: ${phoneNumber}. New profileComplete status: ${user.profileComplete}`
      );
      return user.toObject();
    } catch (error) {
      this.logger.error(`❌ Error updating user ${phoneNumber}:`, error);
      throw error;
    }
  }

  /**
   * Sanitize update data to prevent NoSQL injection attacks
   * @private
   * @param {Object} updateData - Raw update data from user input
   * @returns {Object} Sanitized update data
   */
  _sanitizeUpdateData(updateData) {
    if (!updateData || typeof updateData !== 'object') {
      return updateData;
    }

    // List of MongoDB operators that should NEVER be allowed from user input
    const forbiddenOperators = [
      '$set', '$unset', '$inc', '$mul', '$rename', '$setOnInsert',
      '$pop', '$pull', '$push', '$pushAll', '$addToSet', '$each', '$slice', '$sort',
      '$position', '$isolated', '$atomic', '$and', '$or', '$nor', '$not',
      '$where', '$match', '$group', '$project', '$lookup', '$unionWith',
      '$facet', '$search', '$regex', '$text', '$searchMeta',
      '$gt', '$gte', '$lt', '$lte', '$ne', '$eq', '$in', '$nin', '$all',
      '$elemMatch', '$size', '$exists', '$type', '$mod', '$expr', '$jsonSchema'
    ];

    // Deep clone and sanitize the data
    const sanitized = {};

    for (const [key, value] of Object.entries(updateData)) {
      // Check if key is a MongoDB operator
      if (key.startsWith('$')) {
        if (forbiddenOperators.includes(key)) {
          this.logger.warn(`🚨 BLOCKED NoSQL Injection attempt - Forbidden operator: ${key}`);
          throw new Error(`Security violation: Forbidden MongoDB operator '${key}' in update data`);
        }
      }

      // Recursively sanitize nested objects
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        sanitized[key] = this._sanitizeUpdateData(value);
      } else {
        // Allow primitive values and arrays as they pose lower risk
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Add birth details to user profile
   * @param {string} phoneNumber - User's WhatsApp phone number
   * @param {string} birthDate - Birth date in DDMMYY or DDMMYYYY format
   * @param {string} birthTime - Birth time in HHMM format (optional but recommended)
   * @param {string} birthPlace - Birth place (City, Country)
   * @returns {Promise<Object>} Updated user object
   */
  async addBirthDetails(
    phoneNumber,
    birthDate,
    birthTime = null,
    birthPlace = null
  ) {
    try {
      const updateData = {
        birthDate,
        birthTime,
        birthPlace,
        profileComplete: !!(
          birthDate &&
          birthDate.trim() &&
          birthPlace &&
          birthPlace.trim()
        )
      };

      this.logger.info(
        `🎂 Setting profileComplete to ${updateData.profileComplete} for user: ${phoneNumber}`
      );
      this.logger.info(
        `🎂 Birth data: date=${birthDate}, time=${birthTime}, place=${birthPlace}`
      );

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
      this.logger.error(
        `❌ Error adding birth details for ${phoneNumber}:`,
        error
      );
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

  /**
   * Update user profile with MongoDB operators (trusted internal use only)
   * WARNING: This method bypasses NoSQL injection protection for trusted operations
   * @param {string} phoneNumber - User's WhatsApp phone number
   * @param {Object} updateData - Data to update (may include MongoDB operators)
   * @returns {Promise<Object>} Updated user object
   */
  async updateUserProfileWithOperators(phoneNumber, updateData) {
    try {
      this.logger.warn(
        `⚠️ Trusted MongoDB operator update for ${phoneNumber} - bypassing sanitization`
      );
      this.logger.debug(
        `Operator update data for ${phoneNumber}:`,
        updateData
      );

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

      this.logger.info(
        `🔄 Updated user profile with operators: ${phoneNumber}`
      );
      return user.toObject();
    } catch (error) {
      this.logger.error(`❌ Error updating user ${phoneNumber} with operators:`, error);
      throw error;
    }
  }
}

module.exports = { UserDataManager };