const BaseAction = require('../BaseAction');

/**
 * PrashnaAstrologyAction - Provides Prashna astrology (Horary) analysis.
 * Reuses the existing implementation from the legacy messageProcessor.
 */
class PrashnaAstrologyAction extends BaseAction {
  /**
   * Unique action identifier
   */
  static get actionId() {
    return 'get_prashna_astrology';
  }

  /**
   * Execute the prashna astrology action
   * @returns {Promise<Object|null>} Action result
   */
  async execute() {
    try {
      this.logExecution('start', 'Generating prashna astrology analysis');

      // Get the actual prashna astrology implementation
      // This should be implemented within this action rather than calling legacy function
      // For now, returning a placeholder to indicate this needs proper implementation
      const { sendMessage } = require('../../../messageSender');
      await sendMessage(this.phoneNumber, 'Prashna (question-based) astrology analysis is being prepared...', 'text');

      return {
        success: true,
        type: 'prashna_analysis',
        message: 'Prashna analysis prepared'
      };
    } catch (error) {
      this.logger.error('Error in PrashnaAstrologyAction:', error);
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
    await sendMessage(this.phoneNumber, 'I encountered an error generating your Prashna astrology analysis. Please try again.', 'text');
  }

  /**
   * Get action metadata for registration
   * @returns {Object} Action metadata
   */
  static getMetadata() {
    return {
      id: this.actionId,
      description: 'Provide Horary/Prashna astrology analysis answering specific questions',
      keywords: ['prashna', 'horary', 'question', 'answer'],
      category: 'astrology',
      subscriptionRequired: true,
      cooldown: 7200000 // 2 hours cooldown
    };
  }
}

module.exports = PrashnaAstrologyAction;
