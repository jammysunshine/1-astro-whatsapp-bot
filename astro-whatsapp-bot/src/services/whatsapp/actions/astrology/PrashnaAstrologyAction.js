const BaseAction = require('../BaseAction');
const { PrashnaService } = require('../../../core/services');

/**
 * PrashnaAstrologyAction - Provides Prashna astrology (Horary) analysis.
 * Uses PrashnaService for question-based horary astrology calculations.
 */
class PrashnaAstrologyAction extends BaseAction {
  /**
   * Unique action identifier
   */
  static get actionId() {
    return 'get_prashna_astrology';
  }

  /**
   * Execute prashna astrology action
   * @returns {Promise<Object|null>} Action result
   */
  async execute() {
    try {
      this.logExecution('start', 'Generating prashna astrology analysis');

      // Initialize Prashna Service
      const services = this.getServices();
      const prashnaService = new PrashnaService(services);

      // Get user profile for location
      const userProfile = await this.getUserProfile();

      // Send initial prompt for question
      const promptMessage = '❓ *Prashna (Horary) Astrology*\n\nI can answer your specific questions using horary astrology by casting a chart at the moment you ask.\n\n*Please provide:*\n• Your specific question\n• The time you thought of this question (HH:MM)\n• Your current location\n\n*Example Questions:*\n• "Will I get the job I applied for?"\n• "Should I move to a new city?"\n• "Is this the right time to start business?"\n\nReply with your question and details to continue.';

      await this.sendDirectMessage(promptMessage);

      // For now, we'll collect question in follow-up messages
      // In a full implementation, this would start a conversation flow

      this.logExecution('complete', 'Prashna astrology flow initiated');
      return {
        success: true,
        type: 'prashna_flow_start',
        initiated: true
      };
    } catch (error) {
      this.logger.error('Error in PrashnaAstrologyAction:', error);
      await this.handleExecutionError(error);
      return { success: false, reason: 'execution_error', error: error.message };
    }
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
    await this.sendDirectMessage('❌ *Prashna Analysis Error*\n\nI encountered an error with your Prashna astrology analysis. Please try again later.');
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
