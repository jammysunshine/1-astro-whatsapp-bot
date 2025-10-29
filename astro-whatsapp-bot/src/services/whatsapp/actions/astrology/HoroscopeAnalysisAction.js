const BaseAction = require('../BaseAction');

/**
 * HoroscopeAnalysisAction - Provides daily horoscope readings.
 * Reuses the existing implementation from the legacy messageProcessor.
 */
class HoroscopeAnalysisAction extends BaseAction {
  /**
   * Unique action identifier
   */
  static get actionId() {
    return 'get_horoscope_analysis';
  }

  /**
   * Execute the horoscope analysis action
   * @returns {Promise<Object|null>} Action result
   */
  async execute() {
    try {
      this.logExecution('start', 'Generating horoscope analysis');

      // Import the legacy executeMenuAction function
      const { executeMenuAction } = require('../../../__LEGACY__messageProcessor.js.ARCHIVED');

      // Call the legacy implementation
      return await executeMenuAction(this.phoneNumber, this.user, 'get_horoscope');

    } catch (error) {
      this.logger.error('Error in HoroscopeAnalysisAction:', error);
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
    await sendMessage(this.phoneNumber, 'I encountered an error generating your horoscope. Please try again.', 'text');
  }

  /**
   * Get action metadata for registration
   * @returns {Object} Action metadata
   */
  static getMetadata() {
    return {
      id: this.actionId,
      description: 'Provide daily horoscope analysis and astrological guidance',
      keywords: ['horoscope', 'daily horoscope', 'daily reading', 'day guide'],
      category: 'astrology',
      subscriptionRequired: false,
      cooldown: 1800000 // 30 minutes cooldown
    };
  }
}

module.exports = HoroscopeAnalysisAction;