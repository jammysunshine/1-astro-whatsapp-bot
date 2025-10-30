const BaseAction = require('../BaseAction');

/**
 * MuhurtaAction - Provides auspicious timing for important activities using Vedic electional astrology.
 * Reuses the existing implementation from the legacy messageProcessor.
 */
class MuhurtaAction extends BaseAction {
  /**
   * Unique action identifier
   */
  static get actionId() {
    return 'get_muhurta_analysis';
  }

  /**
   * Execute the muhurta analysis action
   * @returns {Promise<Object|null>} Action result
   */
  async execute() {
    try {
      this.logExecution('start', 'Generating muhurta timing analysis');

      // Import the legacy executeMenuAction function
      const { executeMenuAction } = require('../../../__LEGACY__messageProcessor.js.ARCHIVED');

      // Call the legacy implementation
      return await executeMenuAction(this.phoneNumber, this.user, 'get_muhurta_analysis');
    } catch (error) {
      this.logger.error('Error in MuhurtaAction:', error);
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
    await sendMessage(this.phoneNumber, 'I encountered an error generating your muhurta analysis. Please try again.', 'text');
  }

  /**
   * Get action metadata for registration
   * @returns {Object} Action metadata
   */
  static getMetadata() {
    return {
      id: this.actionId,
      description: 'Provide auspicious timing analysis for important activities using Vedic electional astrology',
      keywords: ['muhurta', 'auspicious time', 'electional astrology', 'vedic timing'],
      category: 'astrology',
      subscriptionRequired: true,
      cooldown: 3600000 // 1 hour cooldown
    };
  }
}

module.exports = MuhurtaAction;
