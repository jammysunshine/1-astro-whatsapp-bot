const logger = require('../utils/logger');

/**
 * SubscriptionManager - Handles user subscription tiers and benefits
 * Manages subscription upgrades, limits, and feature access validation
 */
class SubscriptionManager {
  constructor() {
    this.logger = logger;

    // Define tier benefits
    this.benefits = {
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
  }

  /**
   * Check if user has active subscription
   * @param {Object} user - User object
   * @returns {boolean} True if user has active subscription
   */
  hasActiveSubscription(user) {
    if (!user || !user.subscriptionTier || user.subscriptionTier === 'free') {
      return false;
    }

    if (!user.subscriptionExpiry) {
      return true; // Lifetime subscription
    }

    const expiryDate = new Date(user.subscriptionExpiry);
    const currentDate = new Date();

    return expiryDate > currentDate;
  }

  /**
   * Get user's subscription tier benefits
   * @param {Object} user - User object
   * @returns {Object} Subscription benefits object
   */
  getSubscriptionBenefits(user) {
    const tier = user?.subscriptionTier || 'free';
    return this.benefits[tier] || this.benefits.free;
  }

  /**
   * Check if user can access a specific feature
   * @param {Object} user - User object
   * @param {string} feature - Feature name
   * @returns {boolean} True if access allowed
   */
  canAccessFeature(user, feature) {
    const benefits = this.getSubscriptionBenefits(user);
    return !!benefits[feature];
  }

  /**
   * Check if user has reached subscription limits for a feature
   * @param {Object} user - User object
   * @param {string} feature - Feature name
   * @returns {boolean} True if under limit, false if exceeded
   */
  isWithinLimits(user, feature) {
    const benefits = this.getSubscriptionBenefits(user);

    if (feature === 'compatibility') {
      return (
        benefits.maxCompatibilityChecks === -1 ||
        (user.compatibilityChecks || 0) < benefits.maxCompatibilityChecks
      );
    }

    return true; // Default allow for other features
  }

  /**
   * Update subscription tier
   * @param {Object} userDataManager - UserDataManager instance
   * @param {string} phoneNumber - User's phone number
   * @param {string} tier - New subscription tier
   * @param {Date} expiryDate - Subscription expiry date
   * @returns {Promise<Object>} Updated user object
   */
  async updateSubscription(
    userDataManager,
    phoneNumber,
    tier,
    expiryDate = null
  ) {
    try {
      const user = await userDataManager.updateUserProfile(phoneNumber, {
        subscriptionTier: tier,
        subscriptionExpiry: expiryDate
      });

      this.logger.info(
        `💳 Updated subscription for user ${phoneNumber}: ${tier}`
      );
      return user;
    } catch (error) {
      this.logger.error(
        `❌ Error updating subscription for ${phoneNumber}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Increment feature usage counter
   * @param {Object} userDataManager - UserDataManager instance
   * @param {string} phoneNumber - User's phone number
   * @param {string} feature - Feature name (e.g., 'compatibilityChecks')
   * @returns {Promise<Object>} Updated user object
   */
  async incrementUsage(userDataManager, phoneNumber, feature) {
    try {
      let updateData = {};

      if (feature === 'compatibility') {
        updateData = { $inc: { compatibilityChecks: 1 } };
      } else if (feature === 'loyaltyPoints') {
        updateData = { $inc: { loyaltyPoints: 1 } };
      } else {
        updateData = { $inc: { [feature]: 1 } };
      }

      // Use trusted method for MongoDB operators
      const user = await userDataManager.updateUserProfileWithOperators(
        phoneNumber,
        updateData
      );

      if (feature === 'compatibility') {
        this.logger.info(
          `💞 Incremented compatibility checks for user ${phoneNumber}: ${user.compatibilityChecks}`
        );
      }

      return user;
    } catch (error) {
      this.logger.error(
        `❌ Error incrementing usage for ${phoneNumber}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Upgrade subscription tier based on loyalty points
   * @param {Object} userDataManager - UserDataManager instance
   * @param {string} phoneNumber - User's phone number
   * @returns {Promise<Object>} Updated user object or null if no upgrade
   */
  async upgradeByLoyaltyPoints(userDataManager, phoneNumber) {
    try {
      const user = await userDataManager.getUserByPhone(phoneNumber);
      if (!user) {
        return null;
      }

      const points = user.loyaltyPoints || 0;

      // Define upgrade thresholds
      const upgradeThresholds = {
        free: { threshold: 100, nextTier: 'essential' },
        essential: { threshold: 500, nextTier: 'premium' },
        premium: { threshold: 1000, nextTier: 'vip' }
      };

      const currentTier = user.subscriptionTier || 'free';
      const upgrade = upgradeThresholds[currentTier];

      if (upgrade && points >= upgrade.threshold) {
        // Perform upgrade
        const updatedUser = await this.updateSubscription(
          userDataManager,
          phoneNumber,
          upgrade.nextTier,
          null // Lifetime subscription
        );

        this.logger.info(
          `⭐ Loyalty points upgrade for ${phoneNumber}: ${currentTier} -> ${upgrade.nextTier}`
        );
        return updatedUser;
      }

      return null; // No upgrade needed
    } catch (error) {
      this.logger.error(
        `❌ Error upgrading user by loyalty points ${phoneNumber}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Add loyalty points to user and check for upgrade
   * @param {Object} userDataManager - UserDataManager instance
   * @param {string} phoneNumber - User's phone number
   * @param {number} points - Points to add
   * @returns {Promise<Object>} Updated user object
   */
  async addLoyaltyPoints(userDataManager, phoneNumber, points) {
    try {
      // Use trusted method for MongoDB operators
      const user = await userDataManager.updateUserProfileWithOperators(phoneNumber, {
        $inc: { loyaltyPoints: points }
      });

      this.logger.info(
        `⭐ Added ${points} loyalty points to user ${phoneNumber}: ${user.loyaltyPoints} total`
      );

      // Check for automatic upgrade
      await this.upgradeByLoyaltyPoints(userDataManager, phoneNumber);

      return user;
    } catch (error) {
      this.logger.error(
        `❌ Error adding loyalty points for ${phoneNumber}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Calculate days until subscription expiry
   * @param {Object} user - User object
   * @returns {number} Days until expiry, Infinity for lifetime, 0 for expired/never had
   */
  getDaysUntilExpiry(user) {
    if (!user || !user.subscriptionTier || user.subscriptionTier === 'free') {
      return 0;
    }

    if (!user.subscriptionExpiry) {
      return Infinity; // Lifetime subscription
    }

    const expiryDate = new Date(user.subscriptionExpiry);
    const currentDate = new Date();
    const diffTime = expiryDate - currentDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays); // Never return negative
  }

  /**
   * Get tier information including cost and description
   * @param {string} tier - Subscription tier
   * @returns {Object} Tier details
   */
  getTierInfo(tier) {
    const tierDetails = {
      free: {
        name: 'Free',
        cost: 0,
        currency: 'USD',
        description:
          'Basic astrology features with limited compatibility checks'
      },
      essential: {
        name: 'Essential',
        cost: 9.99,
        currency: 'USD',
        description: 'Personalized daily horoscopes and enhanced features'
      },
      premium: {
        name: 'Premium',
        cost: 19.99,
        currency: 'USD',
        description:
          'Unlimited questions and priority human astrologer support'
      },
      vip: {
        name: 'VIP',
        cost: 49.99,
        currency: 'USD',
        description: 'Dedicated human astrologer with quarterly life planning'
      }
    };

    return tierDetails[tier] || tierDetails.free;
  }
}

module.exports = { SubscriptionManager };
