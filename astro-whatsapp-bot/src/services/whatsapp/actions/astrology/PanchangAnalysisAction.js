const BaseAction = require('../BaseAction');
const { EnhancedPanchangService } = require('../../../core/services');

/**
 * PanchangAnalysisAction - Provides Hindu calendar and panchang analysis.
 * Uses EnhancedPanchangService for comprehensive daily almanac calculations.
 */
class PanchangAnalysisAction extends BaseAction {
  /**
   * Unique action identifier
   */
  static get actionId() {
    return 'get_panchang_analysis';
  }

  /**
   * Execute panchang analysis action
   * @returns {Promise<Object|null>} Action result
   */
  async execute() {
    try {
      this.logExecution('start', 'Generating panchang analysis');

      // Initialize Enhanced Panchang Service
      const services = this.getServices();
      const panchangService = new EnhancedPanchangService(services);

      // Get user profile for location
      const userProfile = await this.getUserProfile();

      // Prepare panchang data
      const panchangData = {
        date: new Date().toISOString().split('T')[0], // Today's date
        location: userProfile?.birthPlace || 'Delhi, India',
        birthData: userProfile ? {
          birthDate: userProfile.birthDate,
          birthTime: userProfile.birthTime,
          birthPlace: userProfile.birthPlace
        } : null,
        options: {
          includeFestivals: true,
          includeMuhurta: true,
          includePersonalized: true
        }
      };

      // Calculate panchang using service
      const panchangResult = await panchangService.processCalculation({ panchangData });

      // Format result for WhatsApp
      const formattedResult = panchangService.formatResult(panchangResult);

      // Send result to user
      await this.sendDirectMessage(formattedResult);

      this.logExecution('complete', 'Panchang analysis generated successfully');
      return {
        success: true,
        type: 'panchang_analysis',
        data: panchangResult
      };
    } catch (error) {
      this.logger.error('Error in PanchangAnalysisAction:', error);
      await this.handleExecutionError(error);
      return { success: false, reason: 'execution_error', error: error.message };
    }
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
    await this.sendDirectMessage('❌ *Panchang Analysis Error*\n\nI encountered an error generating your panchang analysis. Please try again later.');
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
