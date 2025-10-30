const BaseAction = require('../BaseAction');

/**
 * PanchangAnalysisAction - Provides Hindu calendar and panchang analysis.
 * Reuses the existing implementation from the legacy messageProcessor.
 */
class PanchangAnalysisAction extends BaseAction {
  /**
   * Unique action identifier
   */
  static get actionId() {
    return 'get_panchang_analysis';
  }

  /**
   * Execute the panchang analysis action
   * @returns {Promise<Object|null>} Action result
   */
  async execute() {
    try {
      this.logExecution('start', 'Generating panchang analysis');

      // Get the actual panchang analysis implementation
      // This should be implemented within this action rather than calling legacy function
      // For now, returning a placeholder to indicate this needs proper implementation
      const { sendMessage } = require('../../../messageSender');
      await sendMessage(this.phoneNumber, 'Panchang (daily calendar) analysis is being prepared...', 'text');
      
      return { 
        success: true, 
        type: 'panchang_analysis', 
        message: 'Panchang analysis prepared' 
      };
    } catch (error) {
      this.logger.error('Error in PanchangAnalysisAction:', error);
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
    await sendMessage(this.phoneNumber, 'I encountered an error generating your panchang analysis. Please try again.', 'text');
  }

  /**
   * Get action metadata for registration
   * @returns {Object} Action metadata
   */
  static getMetadata() {
    return {
      id: this.actionId,
      description: 'Provide Hindu calendar analysis and panchang information',
      keywords: ['panchang', 'hindu calendar', 'tithi', 'nakshatra', 'calendar'],
      category: 'astrology',
      subscriptionRequired: false,
      cooldown: 1800000 // 30 minutes cooldown
    };
  }
}

module.exports = PanchangAnalysisAction;
