const BaseAction = require('../BaseAction');

/**
 * VedicKundliAction - Provides Vedic birth chart analysis using Jyotish method.
 * Reuses the existing implementation from the legacy messageProcessor.
 */
class VedicKundliAction extends BaseAction {
  /**
   * Unique action identifier
   */
  static get actionId() {
    return 'get_vedic_kundli';
  }

  /**
   * Execute the vedic kundli action
   * @returns {Promise<Object|null>} Action result
   */
  async execute() {
    try {
      this.logExecution('start', 'Generating vedic kundli analysis');

      // Import the legacy executeMenuAction function
      const { executeMenuAction } = require('../../../__LEGACY__messageProcessor.js.ARCHIVED');

      // Call the legacy implementation
      return await executeMenuAction(this.phoneNumber, this.user, 'get_hindu_astrology_analysis');
    } catch (error) {
      this.logger.error('Error in VedicKundliAction:', error);
      await this.handleExecutionError(error);
      return { success: false, reason: 'execution_error', error: error.message };
    }
  }

  /**
   * Handle execution errors
   * @param {Error} error - Execution error
   */
  async handleExecutionError(error) {
    const { sendMessage } = require('../../messageSender');
    await sendMessage(this.phoneNumber, 'I encountered an error generating your Vedic Kundli. Please try again.', 'text');
  }

  /**
   * Get action metadata for registration
   * @returns {Object} Action metadata
   */
  static getMetadata() {
    return {
      id: this.actionId,
      description: 'Provide detailed Vedic birth chart analysis using Jyotish method',
      keywords: ['kundli', 'vedic kundli', 'hindu astrology', 'jyotish chart', 'birth chart'],
      category: 'astrology',
      subscriptionRequired: false,
      cooldown: 3600000 // 1 hour cooldown
    };
  }
}

module.exports = VedicKundliAction;
