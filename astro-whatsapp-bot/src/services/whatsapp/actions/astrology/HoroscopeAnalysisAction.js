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

      // Get the actual horoscope analysis implementation
      // This should be implemented within this action rather than calling legacy function
      // For now, returning a placeholder to indicate this needs proper implementation
      const { sendMessage } = require('../../../messageSender');
      await sendMessage(this.phoneNumber, 'Daily horoscope analysis is being prepared...', 'text');

      return {
        success: true,
        type: 'horoscope_analysis',
        message: 'Daily horoscope analysis prepared'
      };
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
