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
    
    logger.info(`🆕 Creating new user with data:`, userData);

    const user = new User(userData);
    await user.save();

    logger.info(`🆕 Created new user: ${phoneNumber} with name: ${user.name}`);
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
      logger.debug(
        `DEBUG: getUserByPhone returning user with profileComplete: ${user.profileComplete}`
      );
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
    logger.info(
      `Attempting to update user profile for ${phoneNumber} with data:`,
      updateData
    );
    
    // Use findOneAndUpdate for atomic update
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

    logger.info(
      `🔄 Updated user profile: ${phoneNumber}. New profileComplete status: ${user.profileComplete}`
    );

    logger.info(
      `🔄 Confirmed user profile after update: ${phoneNumber}. Confirmed profileComplete status: ${user.profileComplete}`
    );

    return user.toObject();
  } catch (error) {
    logger.error(`❌ Error updating user ${phoneNumber}:`, error);
    throw error;
  }
};

/**
 * Add birth details to user profile
 * @param {string} phoneNumber - User's WhatsApp phone number
 * @param {string} birthDate - Birth date in DDMMYY or DDMMYYYY format
 * @param {string} birthTime - Birth time in HHMM format (optional but recommended)
 * @param {string} birthPlace - Birth place (City, Country)
 * @returns {Promise<Object>} Updated user object
 */
const addBirthDetails = async(
  phoneNumber,
  birthDate,
  birthTime = null,
  birthPlace = null
) => {
  try {
    // Ensure all required fields are present for profile completion
    const updateData = {
      birthDate,
      birthTime,
      birthPlace,
      profileComplete: !!(birthDate && birthDate.trim() && birthPlace && birthPlace.trim())
    };

    logger.info(`🎂 Setting profileComplete to ${updateData.profileComplete} for user: ${phoneNumber}`);
    logger.info(`🎂 Birth data: date=${birthDate}, time=${birthTime}, place=${birthPlace}`);

    const user = await User.findOneAndUpdate({ phoneNumber }, updateData, {
      new: true,
      runValidators: true
    });

    if (!user) {
      throw new Error(`User not found: ${phoneNumber}`);
    }

    logger.info(`🎂 Added birth details for user: ${phoneNumber}`);
    logger.info(`📊 Profile completion status: ${user.profileComplete}`);
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

    logger.info(
      `💞 Incremented compatibility checks for user ${phoneNumber}: ${user.compatibilityChecks}`
    );
    return user.toObject();
  } catch (error) {
    logger.error(
      `❌ Error incrementing compatibility checks for ${phoneNumber}:`,
      error
    );
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

    logger.info(
      `⭐ Added ${points} loyalty points to user ${phoneNumber}: ${user.loyaltyPoints} total`
    );
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

    logger.info(
      `👥 Added referred user ${referredPhone} to referrer ${referrerPhone}`
    );
    return referrer.toObject();
  } catch (error) {
    logger.error(
      `❌ Error adding referred user ${referredPhone} to referrer ${referrerPhone}:`,
      error
    );
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
 * Get user session
 * @param {string} phoneNumber - User's phone number
 * @returns {Promise<Object>} Session data
 */
const getUserSession = async phoneNumber => {
  try {
    const session = await Session.findOne({ phoneNumber });
    return session ? session.toObject() : null;
  } catch (error) {
    logger.error(`❌ Error getting session for ${phoneNumber}:`, error);
    throw error;
  }
};

/**
 * Set user session
 * @param {string} phoneNumber - User's phone number
 * @param {Object} sessionData - Session data
 * @returns {Promise<void>}
 */
const setUserSession = async(phoneNumber, sessionData) => {
  try {
    // Generate sessionId if not provided and it's a new session (upsert)
    const update = {
      ...sessionData,
      phoneNumber // Ensure phoneNumber is set
    };

    // Only generate sessionId if it's a new session being created (upsert: true)
    // and sessionData doesn't already contain one.
    // This logic assumes that if a sessionData.sessionId is provided, it's for an existing session.
    // If upsert creates a new document, sessionData.sessionId would be undefined.
    if (!sessionData.sessionId) {
      // Check if a session already exists for this phoneNumber
      const existingSession = await Session.findOne({ phoneNumber });
      if (!existingSession) {
        update.sessionId = Session.generateSessionId();
      }
    }

    await Session.findOneAndUpdate(
      { phoneNumber },
      update,
      {
        upsert: true, // Create if doesn't exist
        new: true,
        runValidators: true
      }
    );
  } catch (error) {
    logger.error(`❌ Error setting session for ${phoneNumber}:`, error);
    throw error;
  }
};

/**
 * Delete user session
 * @param {string} phoneNumber - User's phone number
 * @returns {Promise<boolean>} True if deleted
 */
const deleteUserSession = async phoneNumber => {
  try {
    const result = await Session.deleteOne({ phoneNumber });
    return result.deletedCount > 0;
  } catch (error) {
    logger.error(`❌ Error deleting session for ${phoneNumber}:`, error);
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
  getUserSession,
  setUserSession,
  deleteUserSession,
  hasActiveSubscription,
  getSubscriptionBenefits
};
