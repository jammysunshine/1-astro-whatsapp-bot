const logger = require('../utils/logger');
const { UserDataManager } = require('./UserDataManager');
const { SessionManager } = require('./SessionManager');
const { SubscriptionManager } = require('./SubscriptionManager');

/**
 * User Model - Ultra-lean orchestrator for user and session management
 * Delegates all operations to specialized managers while maintaining backward compatibility
 */

// Initialize manager instances
const userDataManager = new UserDataManager();
const sessionManager = new SessionManager();
const subscriptionManager = new SubscriptionManager();

// Export function wrappers that delegate to managers
module.exports = {
  // User Data Management
  createUser: (phoneNumber, profileData) =>
    userDataManager.createUser(phoneNumber, profileData),
  getUserByPhone: phoneNumber => userDataManager.getUserByPhone(phoneNumber),
  updateUserProfile: (phoneNumber, updateData) =>
    userDataManager.updateUserProfile(phoneNumber, updateData),
  addBirthDetails: (phoneNumber, birthDate, birthTime, birthPlace) =>
    userDataManager.addBirthDetails(
      phoneNumber,
      birthDate,
      birthTime,
      birthPlace
    ),
  getAllUsers: () => userDataManager.getAllUsers(),
  deleteUser: phoneNumber => userDataManager.deleteUser(phoneNumber),

  // Subscription Management
  updateSubscription: (phoneNumber, tier, expiryDate) =>
    subscriptionManager.updateSubscription(
      userDataManager,
      phoneNumber,
      tier,
      expiryDate
    ),
  incrementCompatibilityChecks: phoneNumber =>
    subscriptionManager.incrementUsage(
      userDataManager,
      phoneNumber,
      'compatibility'
    ),
  addLoyaltyPoints: (phoneNumber, points) =>
    subscriptionManager.addLoyaltyPoints(userDataManager, phoneNumber, points),
  hasActiveSubscription: user =>
    subscriptionManager.hasActiveSubscription(user),
  getSubscriptionBenefits: user =>
    subscriptionManager.getSubscriptionBenefits(user),
  getDaysUntilExpiry: user => subscriptionManager.getDaysUntilExpiry(user),

  // Referral Management
  addReferredUser: async(referrerPhone, referredPhone) => {
    try {
      // Add referred user to referrer's profile (trusted operation requiring MongoDB operators)
      const referrer = await userDataManager.updateUserProfileWithOperators(referrerPhone, {
        $addToSet: { referredUsers: referredPhone }
      });

      logger.info(
        `👥 Added referred user ${referredPhone} to referrer ${referrerPhone}`
      );
      return referrer;
    } catch (error) {
      logger.error(
        `❌ Error adding referred user ${referredPhone} to referrer ${referrerPhone}:`,
        error
      );
      throw error;
    }
  },

  // Session Management
  getUserSession: phoneNumber => sessionManager.getUserSession(phoneNumber),
  setUserSession: (phoneNumber, sessionData) =>
    sessionManager.setUserSession(phoneNumber, sessionData),
  deleteUserSession: phoneNumber =>
    sessionManager.deleteUserSession(phoneNumber),
  getCurrentFlowInfo: phoneNumber =>
    sessionManager.getCurrentFlowInfo(phoneNumber),
  updateSessionFlow: (phoneNumber, flowName, step) =>
    sessionManager.updateSessionFlow(phoneNumber, flowName, step),
  clearSessionFlow: phoneNumber => sessionManager.clearSessionFlow(phoneNumber),
  isUserInFlow: phoneNumber => sessionManager.isUserInFlow(phoneNumber),
  updateSessionMenu: (phoneNumber, menuType) =>
    sessionManager.updateSessionMenu(phoneNumber, menuType),
  cleanupExpiredSessions: maxInactiveHours =>
    sessionManager.cleanupExpiredSessions(maxInactiveHours)
};