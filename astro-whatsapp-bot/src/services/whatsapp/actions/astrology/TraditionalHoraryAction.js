const AstrologyAction = require('../base/AstrologyAction');
const { TraditionalHorary } = require('../../../astrology/traditionalHorary');
const { AstrologyFormatterFactory } = require('../factories/AstrologyFormatterFactory');

class TraditionalHoraryAction extends AstrologyAction {
  /**
   * Unique action identifier
   */
  static get actionId() {
    return 'get_traditional_horary';
  }

  async execute() {
    try {
      this.logAstrologyExecution('start', 'Processing horary question');

      // Unified validation using base class
      const validation = await this.validateProfileAndLimits('Traditional Horary', 'traditional_horary');
      if (!validation.success) {
        return validation;
      }

      // Extract question from context
      const question = await this.extractHoraryQuestion();
      if (!question) {
        await this.sendDirectMessage(this.getQuestionRequiredPrompt());
        return { success: false, reason: 'no_question' };
      }

      // Cast horary chart at moment of question
      const horaryData = await this.castHoraryChart(question);
      if (horaryData.error) {
        await this.sendDirectMessage(`⏰ *Traditional Horary Astrology*\n\n${horaryData.fallback || 'Unable to cast horary chart at this time.'}\n\nHorary astrology requires a genuine question you care about with precise timing.`);
        return { success: false, reason: 'chart_casting_error' };
      }

      // Format and send analysis using base class methods
      const formattedContent = this.formatHoraryAnalysis(horaryData);
      await this.buildAstrologyResponse(formattedContent, this.getHoraryActionButtons());

      this.logAstrologyExecution('complete', 'Horary chart cast and analysis delivered');
      return {
        success: true,
        type: 'traditional_horary',
        question: question.length > 100 ? `${question.substring(0, 100)}...` : question,
        chartCast: true
      };
    } catch (error) {
      this.logger.error('Error in TraditionalHoraryAction:', error);
      await this.handleExecutionError(error);
      return { success: false, reason: 'execution_error', error: error.message };
    }
  }

  /**
   * Extract horary question from user context or request
   * @returns {Promise<string|null>} Extracted question or null
   */
  async extractHoraryQuestion() {
    // For now, we'll expect questions to be asked directly
    // In future, we could extract from conversation context
    return this.data?.question || null;
  }

  /**
   * Cast horary chart for the question
   * @param {string} question - User's question
   * @returns {Promise<Object>} Horary analysis data
   */
  async castHoraryChart(question) {
    try {
      // Validate user exists
      if (!this.user) {
        throw new Error('User data not available for horary analysis');
      }

      const questionData = {
        question,
        questionTime: new Date().toISOString(),
        questionLocation: {
          latitude: this.user.latitude || 28.6139, // Default Delhi
          longitude: this.user.longitude || 77.2090,
          timezone: this.user.timezone || 5.5
        },
        user: this.user
      };

      const horaryAnalysis = await this.horaryService.castHoraryChart(questionData);
      return horaryAnalysis;
    } catch (error) {
      this.logger.error('Horary chart casting error:', error);
      return {
        error: error.message,
        fallback: 'Horary analysis requires precise timing and question formulation'
      };
    }
  }

  /**
   * Get prompt message for when question is required
   * @returns {string} Question prompt message
   */
  getQuestionRequiredPrompt() {
    return '❓ *Traditional Horary Astrology*\n\nTo cast a horary chart, I need you to ask a specific question at the exact moment you ask it.\n\nPlease reply with your question, such as:\n• "Will I get this job?"\n• "Should I invest in property now?"\n• "When will my relationship improve?"\n\nThe chart will be cast at the precise moment you send your question! ✨';
  }

  /**
   * Get action buttons for horary response
   * @returns {Array} Button configuration array
   */
  getHoraryActionButtons() {
    return [
      {
        id: 'get_current_transits',
        titleKey: 'buttons.current_transits',
        title: '🌌 Transits'
      },
      {
        id: 'show_main_menu',
        titleKey: 'buttons.main_menu',
        title: '🏠 Main Menu'
      }
    ];
  }

  /**
   * Format detailed horary analysis
   * @param {Object} horaryData - Horary data
   * @returns {string} Formatted analysis
   */
  formatHoraryAnalysis(horaryData) {
    // Use the summary from horary service if available
    if (horaryData.summary) {
      return horaryData.summary;
    }

    // Fallback formatting
    let response = '⏰ *Traditional Horary Analysis*\n\n';

    if (horaryData.question) {
      response += `Question: "${horaryData.question}"\n\n`;
    }

    if (horaryData.answer) {
      response += `${horaryData.answer.determination} (${horaryData.answer.confidence})\n\n`;
      response += 'Key Factors:\n';
      if (horaryData.answer.factors) {
        horaryData.answer.factors.forEach(factor => {
          response += `• ${factor}\n`;
        });
      }
    }

    if (horaryData.timing?.estimate) {
      response += `\nTiming: ${horaryData.timing.estimate}`;
    }

    return `${response}\n*Cast at moment of question using traditional horary astrology.*`;
  }


  static getMetadata() {
    return {
      id: this.actionId,
      description: 'Cast horary charts for specific questions at moment of asking',
      keywords: ['horary astrology', 'question charts', 'astrological questions', 'horary predictions'],
      category: 'astrology',
      subscriptionRequired: true,
      cooldown: 1800000
    };
  }
}

module.exports = TraditionalHoraryAction;
