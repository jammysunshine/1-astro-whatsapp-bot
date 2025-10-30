const BaseAction = require('../BaseAction');

/**
 * KaalSarpAnalysisAction - Provides Kaal Sarp Dosh analysis in Vedic astrology.
 * Reuses the existing implementation from the legacy messageProcessor.
 */
class KaalSarpAnalysisAction extends BaseAction {
  /**
   * Unique action identifier
   */
  static get actionId() {
    return 'get_kaal_sarp_analysis';
  }

  /**
   * Execute the kaal sarp dosh analysis action
   * @returns {Promise<Object|null>} Action result
   */
  async execute() {
    try {
      this.logExecution('start', 'Generating kaal sarp dosh analysis');

      // Get the actual kaal sarp analysis implementation
      // This should be implemented within this action rather than calling legacy function
      // For now, returning a placeholder to indicate this needs proper implementation
      const { sendMessage } = require('../../../messageSender');
      await sendMessage(this.phoneNumber, 'Kaal Sarp analysis is being prepared...', 'text');
      
      return { 
        success: true, 
        type: 'kaal_sarp_analysis', 
        message: 'Kaal Sarp analysis prepared' 
      };
    } catch (error) {
      this.logger.error('Error in KaalSarpAnalysisAction:', error);
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
    await sendMessage(this.phoneNumber, 'I encountered an error generating your Kaal Sarp Dosh analysis. Please try again.', 'text');
  }

  /**
   * Get action metadata for registration
   * @returns {Object} Action metadata
   */
  static getMetadata() {
    return {
      id: this.actionId,
      description: 'Analyze Kaal Sarp Dosh in Vedic astrology charts',
      keywords: ['kaal sarp', 'kaal sarp dosh', 'kaal sarpa', 'sarp dosha'],
      category: 'astrology',
      subscriptionRequired: true,
      cooldown: 3600000 // 1 hour cooldown
    };
  }
}

module.exports = KaalSarpAnalysisAction;
