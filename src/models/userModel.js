const logger = require('../utils/logger');
// In a real implementation, this would connect to a database
// For now, using in-memory storage for development
let users = new Map();

/**
 * Create a new user
 * @param {string} phoneNumber - User's WhatsApp phone number
 * @param {Object} profileData - Additional profile information
 * @returns {Promise<Object>} Created user object
 */
const createUser = async (phoneNumber, profileData = {}) => {
  try {
    const now = new Date();
    const user = {
      id: generateUserId(),
      phoneNumber,
      createdAt: now,
      lastInteraction: now,
      birthDate: null,
      birthTime: null,
      birthPlace: null,
      name: null,
      gender: null,
      preferredLanguage: 'en',
      timezone: null,
      subscriptionTier: 'free', // free, essential, premium, vip
      subscriptionExpiry: null,
      preferences: {
        dailyNotifications: true,
        weeklyNotifications: true,
        compatibilityNotifications: true
      },
      profileComplete: false,
      lastHoroscopeSent: null,
      kundliGenerated: false,
      ...profileData
    };

    users.set(phoneNumber, user);
    logger.info(`Created new user: ${phoneNumber}`);
    return user;

  } catch (error) {
    logger.error(`Error creating user ${phoneNumber}:`, error);
    throw error;
  }
};

/**
 * Get user by phone number
 * @param {string} phoneNumber - User's WhatsApp phone number
 * @returns {Promise<Object|null>} User object or null if not found
 */
const getUserByPhone = async (phoneNumber) => {
  try {
    const user = users.get(phoneNumber);
    if (user) {
      logger.debug(`Found user: ${phoneNumber}`);
    } else {
      logger.debug(`User not found: ${phoneNumber}`);
    }
    return user;
  } catch (error) {
    logger.error(`Error getting user ${phoneNumber}:`, error);
    throw error;
  }
};

/**
 * Update user profile
 * @param {string} phoneNumber - User's WhatsApp phone number
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated user object
 */
const updateUserProfile = async (phoneNumber, updateData) => {
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
    logger.info(`Updated user profile: ${phoneNumber}`);
    
    return user;

  } catch (error) {
    logger.error(`Error updating user ${phoneNumber}:`, error);
    throw error;
  }
};

/**
 * Add birth details to user profile
 * @param {string} phoneNumber - User's WhatsApp phone number
 * @param {string} birthDate - Birth date in DD/MM/YYYY format
 * @param {string} birthTime - Birth time in HH:MM format (optional)
 * @param {string} birthPlace - Birth place (City, Country)
 * @returns {Promise<Object>} Updated user object
 */
const addBirthDetails = async (phoneNumber, birthDate, birthTime = null, birthPlace = null) => {
  try {
    const user = users.get(phoneNumber);
    if (!user) {
      throw new Error(`User not found: ${phoneNumber}`);
    }

    user.birthDate = birthDate;
    user.birthTime = birthTime;
    user.birthPlace = birthPlace;
    user.profileComplete = true;
    user.updatedAt = new Date();

    // Check if all required birth details are provided
    if (birthDate && birthPlace) {
      user.profileComplete = true;
    }

    users.set(phoneNumber, user);
    logger.info(`Added birth details for user: ${phoneNumber}`);
    
    return user;

  } catch (error) {
    logger.error(`Error adding birth details for ${phoneNumber}:`, error);
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
const updateSubscription = async (phoneNumber, tier, expiryDate = null) => {
  try {
    const user = users.get(phoneNumber);
    if (!user) {
      throw new Error(`User not found: ${phoneNumber}`);
    }

    user.subscriptionTier = tier;
    user.subscriptionExpiry = expiryDate;
    user.updatedAt = new Date();

    users.set(phoneNumber, user);
    logger.info(`Updated subscription for user ${phoneNumber}: ${tier}`);
    
    return user;

  } catch (error) {
    logger.error(`Error updating subscription for ${phoneNumber}:`, error);
    throw error;
  }
};

/**
 * Generate a unique user ID
 * @returns {string} Unique user ID
 */
const generateUserId = () => {
  return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

/**
 * Get all users (for admin purposes)
 * @returns {Array} Array of all users
 */
const getAllUsers = async () => {
  return Array.from(users.values());
};

/**
 * Delete user
 * @param {string} phoneNumber - User's phone number to delete
 * @returns {Promise<boolean>} True if deleted, false if not found
 */
const deleteUser = async (phoneNumber) => {
  const exists = users.has(phoneNumber);
  if (exists) {
    users.delete(phoneNumber);
    logger.info(`Deleted user: ${phoneNumber}`);
  }
  return exists;
};

module.exports = {
  createUser,
  getUserByPhone,
  updateUserProfile,
  addBirthDetails,
  updateSubscription,
  getAllUsers,
  deleteUser
};