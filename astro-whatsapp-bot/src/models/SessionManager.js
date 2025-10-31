const logger = require('../utils/logger');
const Session = require('./Session');

/**
 * SessionManager - Manages user session state and conversation flows
 * Handles session creation, retrieval, updates, and deletion
 */
class SessionManager {
  constructor() {
    this.logger = logger;
  }

  /**
   * Get user session
   * @param {string} phoneNumber - User's phone number
   * @returns {Promise<Object>} Session data
   */
  async getUserSession(phoneNumber) {
    try {
      const session = await Session.findOne({ phoneNumber });
      return session ? session.toObject() : null;
    } catch (error) {
      this.logger.error(`❌ Error getting session for ${phoneNumber}:`, error);
      throw error;
    }
  }

  /**
   * Set user session
   * @param {string} phoneNumber - User's phone number
   * @param {Object} sessionData - Session data
   * @returns {Promise<void>}
   */
  async setUserSession(phoneNumber, sessionData) {
    try {
      const update = {
        ...sessionData,
        phoneNumber // Ensure phoneNumber is set
      };

      if (!sessionData.sessionId) {
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
      this.logger.error(`❌ Error setting session for ${phoneNumber}:`, error);
      throw error;
    }
  }

  /**
   * Delete user session
   * @param {string} phoneNumber - User's phone number
   * @returns {Promise<boolean>} True if deleted
   */
  async deleteUserSession(phoneNumber) {
    try {
      const result = await Session.deleteOne({ phoneNumber });
      return result.deletedCount > 0;
    } catch (error) {
      this.logger.error(`❌ Error deleting session for ${phoneNumber}:`, error);
      throw error;
    }
  }

  /**
   * Update session flow status
   * @param {string} phoneNumber - User's phone number
   * @param {string} flowName - Current flow name
   * @param {number} step - Current step number
   * @returns {Promise<void>}
   */
  async updateSessionFlow(phoneNumber, flowName, step = 0) {
    try {
      const sessionData = {
        currentFlow: flowName,
        currentStep: step,
        lastActivity: new Date()
      };

      await this.setUserSession(phoneNumber, sessionData);
      this.logger.info(`🔄 Updated session flow for ${phoneNumber}: ${flowName} step ${step}`);
    } catch (error) {
      this.logger.error(`❌ Error updating session flow for ${phoneNumber}:`, error);
      throw error;
    }
  }

  /**
   * Clear current flow from session
   * @param {string} phoneNumber - User's phone number
   * @returns {Promise<void>}
   */
  async clearSessionFlow(phoneNumber) {
    try {
      await this.setUserSession(phoneNumber, {
        currentFlow: null,
        currentStep: 0,
        lastActivity: new Date()
      });
      this.logger.info(`🧹 Cleared session flow for ${phoneNumber}`);
    } catch (error) {
      this.logger.error(`❌ Error clearing session flow for ${phoneNumber}:`, error);
      throw error;
    }
  }

  /**
   * Check if user is in an active flow
   * @param {string} phoneNumber - User's phone number
   * @returns {Promise<boolean>} True if in active flow
   */
  async isUserInFlow(phoneNumber) {
    try {
      const session = await this.getUserSession(phoneNumber);
      return session &&
             session.currentFlow &&
             session.currentFlow !== 'undefined' &&
             session.currentFlow !== undefined;
    } catch (error) {
      this.logger.error(`❌ Error checking flow status for ${phoneNumber}:`, error);
      return false;
    }
  }

  /**
   * Get current flow information for user
   * @param {string} phoneNumber - User's phone number
   * @returns {Promise<Object>} Flow information {flowName, step}
   */
  async getCurrentFlowInfo(phoneNumber) {
    try {
      const session = await this.getUserSession(phoneNumber);
      if (!session) {
        return { flowName: null, step: 0 };
      }

      return {
        flowName: session.currentFlow || null,
        step: session.currentStep || 0
      };
    } catch (error) {
      this.logger.error(`❌ Error getting flow info for ${phoneNumber}:`, error);
      return { flowName: null, step: 0 };
    }
  }

  /**
   * Update session menu state
   * @param {string} phoneNumber - User's phone number
   * @param {string} menuType - Menu type that was displayed
   * @returns {Promise<void>}
   */
  async updateSessionMenu(phoneNumber, menuType) {
    try {
      const sessionData = {
        lastMenu: menuType,
        lastActivity: new Date()
      };

      await this.setUserSession(phoneNumber, sessionData);
      this.logger.info(`🔄 Updated session menu for ${phoneNumber}: ${menuType}`);
    } catch (error) {
      this.logger.error(`❌ Error updating session menu for ${phoneNumber}:`, error);
      throw error;
    }
  }

  /**
   * Check for expired sessions and clean up
   * @param {number} maxInactiveHours - Maximum hours of inactivity
   * @returns {Promise<number>} Number of expired sessions cleaned
   */
  async cleanupExpiredSessions(maxInactiveHours = 24) {
    try {
      const maxInactiveMs = maxInactiveHours * 60 * 60 * 1000;
      const cutoffDate = new Date(Date.now() - maxInactiveMs);

      const result = await Session.deleteMany({
        lastActivity: { $lt: cutoffDate }
      });

      this.logger.info(`🧹 Cleaned up ${result.deletedCount} expired sessions`);
      return result.deletedCount;
    } catch (error) {
      this.logger.error('❌ Error cleaning up expired sessions:', error);
      throw error;
    }
  }
}

module.exports = { SessionManager };
