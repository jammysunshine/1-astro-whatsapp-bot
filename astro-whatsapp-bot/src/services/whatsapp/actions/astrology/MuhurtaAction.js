const BaseAction = require('../BaseAction');
const { MuhurtaService } = require('../../../core/services');

/**
 * MuhurtaAction - Provides auspicious timing for important activities using Vedic electional astrology.
 * Uses MuhurtaService for comprehensive auspicious timing calculations.
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

      // Initialize Muhurta Service
      const services = this.getServices();
      const muhurtaService = new MuhurtaService(services);

      // Get user profile for location
      const userProfile = await this.getUserProfile();

      // Send initial prompt for muhurta details
      const promptMessage = '⏰ *Muhurta (Auspicious Timing) Analysis*\n\nI can find the most auspicious timing for your important activities using Vedic electional astrology.\n\n*Please provide:*\n• Activity type (marriage, business, travel, etc.)\n• Preferred date (DD/MM/YYYY)\n• Your location\n• Optional: Time window (preferred hours)\n\n*Supported Activities:*\n• 💒 Marriage & Relationships\n• 💼 Business & Career\n• 🙏 Spiritual & Religious\n• 🏥 Health & Medical\n• ✈️ Travel & Relocation\n• 🏠 Home & Property\n\nReply with your activity and details to continue.';

      await this.sendDirectMessage(promptMessage);

      // For now, we'll collect details in follow-up messages
      // In a full implementation, this would start a conversation flow

      this.logExecution('complete', 'Muhurta analysis flow initiated');
      return {
        success: true,
        type: 'muhurta_flow_start',
        initiated: true
      };
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
    await this.sendDirectMessage('❌ *Muhurta Analysis Error*\n\nI encountered an error with your Muhurta analysis. Please try again later.');
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
