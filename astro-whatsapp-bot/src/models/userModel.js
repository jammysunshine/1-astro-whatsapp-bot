const logger = require('../utils/logger');
const User = require('./User');
const Session = require('./Session');

/**
 * User data model for WhatsApp astrology bot
 * Uses MongoDB with Mongoose for production-ready persistence
 */

/**
 * Create a new user
 * @param {string} phoneNumber - User's WhatsApp phone number
 * @param {Object} profileData - Additional profile information
 * @returns {Promise<Object>} Created user object
 */
const createUser = async(phoneNumber, profileData = {}) => {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) {
      logger.warn(`⚠️ User already exists: ${phoneNumber}`);
      return existingUser;
    }

    const userId = User.generateUserId();
    const referralCode = User.generateReferralCode();

    const userData = {
      id: userId,
      phoneNumber,
      referralCode,
      ...profileData
    };

    const user = new User(userData);
    await user.save();

    logger.info(`🆕 Created new user: ${phoneNumber}`);
    return user.toObject();
  } catch (error) {
    logger.error(`❌ Error creating user ${phoneNumber}:`, error);
    throw error;
  }
};

/**
 * Get user by phone number
 * @param {string} phoneNumber - User's WhatsApp phone number
 * @returns {Promise<Object|null>} User object or null if not found
 */
const getUserByPhone = async phoneNumber => {
  try {
    const user = await User.findOne({ phoneNumber });
    if (user) {
      logger.debug(`🔍 Found user: ${phoneNumber}`);
      return user.toObject();
    } else {
      logger.debug(`🔍 User not found: ${phoneNumber}`);
      return null;
    }
  } catch (error) {
    logger.error(`❌ Error getting user ${phoneNumber}:`, error);
    throw error;
  }
};

/**
 * Update user profile
 * @param {string} phoneNumber - User's WhatsApp phone number
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated user object
 */
const updateUserProfile = async(phoneNumber, updateData) => {
  try {
    const user = await User.findOneAndUpdate(
      { phoneNumber },
      {
        ...updateData,
        lastInteraction: new Date()
      },
      {
        new: true, // Return updated document
        runValidators: true
      }
    );

    if (!user) {
      throw new Error(`User not found: ${phoneNumber}`);
    }

    logger.info(`🔄 Updated user profile: ${phoneNumber}`);
    return user.toObject();
  } catch (error) {
    logger.error(`❌ Error updating user ${phoneNumber}:`, error);
    throw error;
  }
};

/**
 * Add birth details to user profile
 * @param {string} phoneNumber - User's WhatsApp phone number
 * @param {string} birthDate - Birth date in DD/MM/YYYY format
 * @param {string} birthTime - Birth time in HH:MM format (optional but recommended)
 * @param {string} birthPlace - Birth place (City, Country)
 * @returns {Promise<Object>} Updated user object
 */
const addBirthDetails = async(phoneNumber, birthDate, birthTime = null, birthPlace = null) => {
  try {
    const updateData = {
      birthDate,
      birthTime,
      birthPlace,
      profileComplete: !!(birthDate && birthPlace)
    };

    const user = await User.findOneAndUpdate(
      { phoneNumber },
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    if (!user) {
      throw new Error(`User not found: ${phoneNumber}`);
    }

    logger.info(`🎂 Added birth details for user: ${phoneNumber}`);
    return user.toObject();
  } catch (error) {
    logger.error(`❌ Error adding birth details for ${phoneNumber}:`, error);
    throw error;
  }
};

/**
 * Update subscription tier
 * @param {string} phoneNumber - User's WhatsApp phone number
 * @param {string} tier - New subscription tier
 * @param {Date} expiryDate - Subscription expiry date
 * @returns {Promise<Object>} Updated user object
 */
const updateSubscription = async(phoneNumber, tier, expiryDate = null) => {
  try {
    const user = await User.findOneAndUpdate(
      { phoneNumber },
      {
        subscriptionTier: tier,
        subscriptionExpiry: expiryDate
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!user) {
      throw new Error(`User not found: ${phoneNumber}`);
    }

    logger.info(`💳 Updated subscription for user ${phoneNumber}: ${tier}`);
    return user.toObject();
  } catch (error) {
    logger.error(`❌ Error updating subscription for ${phoneNumber}:`, error);
    throw error;
  }
};

/**
 * Increment compatibility checks counter
 * @param {string} phoneNumber - User's WhatsApp phone number
 * @returns {Promise<Object>} Updated user object
 */
const incrementCompatibilityChecks = async phoneNumber => {
  try {
    const user = await User.findOneAndUpdate(
      { phoneNumber },
      { $inc: { compatibilityChecks: 1 } },
      {
        new: true,
        runValidators: true
      }
    );

    if (!user) {
      throw new Error(`User not found: ${phoneNumber}`);
    }

    logger.info(`💞 Incremented compatibility checks for user ${phoneNumber}: ${user.compatibilityChecks}`);
    return user.toObject();
  } catch (error) {
    logger.error(`❌ Error incrementing compatibility checks for ${phoneNumber}:`, error);
    throw error;
  }
};

/**
 * Add loyalty points to user
 * @param {string} phoneNumber - User's WhatsApp phone number
 * @param {number} points - Points to add
 * @returns {Promise<Object>} Updated user object
 */
const addLoyaltyPoints = async(phoneNumber, points) => {
  try {
    const user = await User.findOneAndUpdate(
      { phoneNumber },
      { $inc: { loyaltyPoints: points } },
      {
        new: true,
        runValidators: true
      }
    );

    if (!user) {
      throw new Error(`User not found: ${phoneNumber}`);
    }

    logger.info(`⭐ Added ${points} loyalty points to user ${phoneNumber}: ${user.loyaltyPoints} total`);
    return user.toObject();
  } catch (error) {
    logger.error(`❌ Error adding loyalty points for ${phoneNumber}:`, error);
    throw error;
  }
};

/**
 * Add referred user to referrer
 * @param {string} referrerPhone - Referrer's phone number
 * @param {string} referredPhone - Referred user's phone number
 * @returns {Promise<Object>} Updated referrer user object
 */
const addReferredUser = async(referrerPhone, referredPhone) => {
  try {
    const referrer = await User.findOneAndUpdate(
      { phoneNumber: referrerPhone },
      { $addToSet: { referredUsers: referredPhone } },
      {
        new: true,
        runValidators: true
      }
    );

    if (!referrer) {
      throw new Error(`Referrer not found: ${referrerPhone}`);
    }

    logger.info(`👥 Added referred user ${referredPhone} to referrer ${referrerPhone}`);
    return referrer.toObject();
  } catch (error) {
    logger.error(`❌ Error adding referred user ${referredPhone} to referrer ${referrerPhone}:`, error);
    throw error;
  }
};

/**
 * Get all users (for admin purposes)
 * @returns {Promise<Array>} Array of all users
 */
const getAllUsers = async() => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    return users.map(user => user.toObject());
  } catch (error) {
    logger.error('❌ Error getting all users:', error);
    throw error;
  }
};

/**
 * Delete user
 * @param {string} phoneNumber - User's phone number to delete
 * @returns {Promise<boolean>} True if deleted, false if not found
 */
const deleteUser = async phoneNumber => {
  try {
    const result = await User.deleteOne({ phoneNumber });
    const deleted = result.deletedCount > 0;

    if (deleted) {
      logger.info(`🗑️ Deleted user: ${phoneNumber}`);
    }

    return deleted;
  } catch (error) {
    logger.error(`❌ Error deleting user ${phoneNumber}:`, error);
    throw error;
  }
};

/**
 * Generate a unique user ID
 * @returns {string} Unique user ID
 */
const generateUserId = () => `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

/**
 * Generate referral code
 * @returns {string} Unique referral code
 */
const generateReferralCode = () => `REF${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

/**
 * Get user session
 * @param {string} sessionId - Session ID
 * @returns {Promise<Object>} Session data
 */
const getUserSession = async sessionId => {
  try {
    const session = await Session.findOne({ sessionId });
    return session ? session.toObject() : null;
  } catch (error) {
    logger.error(`❌ Error getting session ${sessionId}:`, error);
    throw error;
  }
};

/**
 * Set user session
 * @param {string} sessionId - Session ID
 * @param {Object} sessionData - Session data
 * @returns {Promise<void>}
 */
const setUserSession = async(sessionId, sessionData) => {
  try {
    await Session.findOneAndUpdate(
      { sessionId },
      {
        ...sessionData,
        phoneNumber: sessionId // Ensure phoneNumber is set
      },
      {
        upsert: true, // Create if doesn't exist
        new: true,
        runValidators: true
      }
    );
  } catch (error) {
    logger.error(`❌ Error setting session ${sessionId}:`, error);
    throw error;
  }
};

/**
 * Delete user session
 * @param {string} sessionId - Session ID
 * @returns {Promise<boolean>} True if deleted
 */
const deleteUserSession = async sessionId => {
  try {
    const result = await Session.deleteOne({ sessionId });
    return result.deletedCount > 0;
  } catch (error) {
    logger.error(`❌ Error deleting session ${sessionId}:`, error);
    throw error;
  }
};

/**
 * Check if user has active subscription
 * @param {Object} user - User object
 * @returns {boolean} True if user has active subscription
 */
const hasActiveSubscription = user => {
  if (!user || !user.subscriptionTier || user.subscriptionTier === 'free') {
    return false;
  }

  if (!user.subscriptionExpiry) {
    return true; // Lifetime subscription
  }

  const expiryDate = new Date(user.subscriptionExpiry);
  const currentDate = new Date();

  return expiryDate > currentDate;
};

/**
 * Get user's subscription tier benefits
 * @param {Object} user - User object
 * @returns {Object} Subscription benefits object
 */
const getSubscriptionBenefits = user => {
  const tier = user?.subscriptionTier || 'free';

  const benefits = {
    free: {
      dailyMicroPrediction: true,
      birthChartVisualization: true,
      weeklyTransitSummary: true,
      communityForum: true,
      compatibilityChecks: 1,
      maxCompatibilityChecks: 1
    },
    essential: {
      dailyPersonalizedHoroscope: true,
      weeklyVideoPredictions: true,
      monthlyGroupQnA: true,
      basicCompatibilityMatching: true,
      compatibilityChecks: 5,
      maxCompatibilityChecks: 5,
      dailyCosmicTips: true,
      luckyNumberOfDay: true
    },
    premium: {
      unlimitedQuestions: true,
      priorityHumanAstrologer: true,
      priorityResponseTime: '24h',
      monthlyReports: true,
      exclusiveRemedialSolutions: true,
      unlimitedCompatibility: true,
      maxCompatibilityChecks: Infinity,
      priorityReplies: true
    },
    vip: {
      dedicatedHumanAstrologer: true,
      quarterlyLifePlanning: true,
      personalizedMeditation: true,
      rarePlanetaryEventReadings: true,
      exclusiveCommunity: true,
      maxCompatibilityChecks: Infinity
    }
  };

  return benefits[tier] || benefits.free;
};

module.exports = {
  createUser,
  getUserByPhone,
  updateUserProfile,
  addBirthDetails,
  updateSubscription,
  incrementCompatibilityChecks,
  addLoyaltyPoints,
  addReferredUser,
  getAllUsers,
  deleteUser,
  generateUserId,
  generateReferralCode,
  getUserSession,
  setUserSession,
  deleteUserSession,
  hasActiveSubscription,
  getSubscriptionBenefits
};
