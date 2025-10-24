const logger = require('../utils/logger');

/**
 * User data model for WhatsApp astrology bot
 * In a production environment, this would connect to a database
 * For development, using in-memory storage with file persistence
 */

// In-memory user storage (would be replaced with database in production)
const users = new Map();
const userSessions = new Map();

/**
 * Create a new user
 * @param {string} phoneNumber - User's WhatsApp phone number
 * @param {Object} profileData - Additional profile information
 * @returns {Promise<Object>} Created user object
 */
const createUser = async(phoneNumber, profileData = {}) => {
  try {
    const now = new Date();
    const userId = generateUserId();

    const user = {
      id: userId,
      phoneNumber,
      createdAt: now,
      lastInteraction: now,
      birthDate: null,
      birthTime: null,
      birthPlace: null,
      name: null,
      gender: null,
      preferredLanguage: 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      subscriptionTier: 'free', // free, essential, premium, vip
      subscriptionExpiry: null,
      preferences: {
        dailyNotifications: true,
        weeklyNotifications: true,
        compatibilityNotifications: true,
        morningHoroscopeTime: '08:00',
        eveningReflectionTime: '20:00'
      },
      profileComplete: false,
      lastHoroscopeSent: null,
      kundliGenerated: false,
      compatibilityChecks: 0,
      totalMessages: 0,
      aiTwinPersonality: null,
      aiTwinMemory: [],
      predictionHistory: [],
      loyaltyPoints: 0,
      referralCode: generateReferralCode(),
      referredBy: null,
      referredUsers: [],
      ...profileData
    };

    users.set(phoneNumber, user);
    logger.info(`👤 Created new user: ${phoneNumber} (${userId})`);
    return user;
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
    const user = users.get(phoneNumber);
    if (user) {
      logger.debug(`🔍 Found user: ${phoneNumber}`);
    } else {
      logger.debug(`🔍 User not found: ${phoneNumber}`);
    }
    return user || null;
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
    const user = users.get(phoneNumber);
    if (!user) {
      throw new Error(`User not found: ${phoneNumber}`);
    }

    // Update user properties
    Object.assign(user, updateData);

    // Update last modified time
    user.updatedAt = new Date();

    users.set(phoneNumber, user);
    logger.info(`🔄 Updated user profile: ${phoneNumber}`);

    return user;
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
    const user = users.get(phoneNumber);
    if (!user) {
      throw new Error(`User not found: ${phoneNumber}`);
    }

    user.birthDate = birthDate;
    user.birthTime = birthTime;
    user.birthPlace = birthPlace;

    // Mark profile as complete if all required details are provided
    if (birthDate && birthPlace) {
      user.profileComplete = true;
    }

    user.updatedAt = new Date();
    users.set(phoneNumber, user);
    logger.info(`🎂 Added birth details for user: ${phoneNumber}`);

    return user;
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
    const user = users.get(phoneNumber);
    if (!user) {
      throw new Error(`User not found: ${phoneNumber}`);
    }

    user.subscriptionTier = tier;
    user.subscriptionExpiry = expiryDate;
    user.updatedAt = new Date();

    users.set(phoneNumber, user);
    logger.info(`💳 Updated subscription for user ${phoneNumber}: ${tier}`);

    return user;
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
    const user = users.get(phoneNumber);
    if (!user) {
      throw new Error(`User not found: ${phoneNumber}`);
    }

    user.compatibilityChecks = (user.compatibilityChecks || 0) + 1;
    user.updatedAt = new Date();

    users.set(phoneNumber, user);
    logger.info(`💞 Incremented compatibility checks for user ${phoneNumber}: ${user.compatibilityChecks}`);

    return user;
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
    const user = users.get(phoneNumber);
    if (!user) {
      throw new Error(`User not found: ${phoneNumber}`);
    }

    user.loyaltyPoints = (user.loyaltyPoints || 0) + points;
    user.updatedAt = new Date();

    users.set(phoneNumber, user);
    logger.info(`⭐ Added ${points} loyalty points to user ${phoneNumber}: ${user.loyaltyPoints} total`);

    return user;
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
    const referrer = users.get(referrerPhone);
    if (!referrer) {
      throw new Error(`Referrer not found: ${referrerPhone}`);
    }

    // Add referred user to referrer's list
    if (!referrer.referredUsers) {
      referrer.referredUsers = [];
    }

    if (!referrer.referredUsers.includes(referredPhone)) {
      referrer.referredUsers.push(referredPhone);
      referrer.updatedAt = new Date();
      users.set(referrerPhone, referrer);
      logger.info(`👥 Added referred user ${referredPhone} to referrer ${referrerPhone}`);
    }

    return referrer;
  } catch (error) {
    logger.error(`❌ Error adding referred user ${referredPhone} to referrer ${referrerPhone}:`, error);
    throw error;
  }
};

/**
 * Get all users (for admin purposes)
 * @returns {Promise<Array>} Array of all users
 */
const getAllUsers = async() => Array.from(users.values());

/**
 * Delete user
 * @param {string} phoneNumber - User's phone number to delete
 * @returns {Promise<boolean>} True if deleted, false if not found
 */
const deleteUser = async phoneNumber => {
  const exists = users.has(phoneNumber);
  if (exists) {
    users.delete(phoneNumber);
    logger.info(`🗑️ Deleted user: ${phoneNumber}`);
  }
  return exists;
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
const getUserSession = async sessionId => userSessions.get(sessionId) || null;

/**
 * Set user session
 * @param {string} sessionId - Session ID
 * @param {Object} sessionData - Session data
 * @returns {Promise<void>}
 */
const setUserSession = async(sessionId, sessionData) => {
  userSessions.set(sessionId, sessionData);
};

/**
 * Delete user session
 * @param {string} sessionId - Session ID
 * @returns {Promise<boolean>} True if deleted
 */
const deleteUserSession = async sessionId => userSessions.delete(sessionId);

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
