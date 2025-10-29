const BaseAction = require('../BaseAction');
const { TraditionalHorary } = require('../../../astrology/traditionalHorary');
const { ResponseBuilder } = require('../../utils/ResponseBuilder');
const { sendMessage } = require('../../messageSender');

class TraditionalHoraryAction extends BaseAction {
  constructor(user, phoneNumber, data = {}) {
    super(user, phoneNumber, data);
    this.horaryService = new TraditionalHorary();
  }

  static get actionId() { return 'get_traditional_horary'; }

  async execute() {
    try {
      this.logExecution('start', 'Processing horary question');

      // Validate user profile
      if (!(await this.validateUserProfile('Traditional Horary'))) {
        this.sendIncompleteProfileNotification();
        return { success: false, reason: 'incomplete_profile' };
      }

      // Check subscription limits
      const limitsCheck = this.checkSubscriptionLimits('traditional_horary');
      if (!limitsCheck.isAllowed) {
        await this.sendUpgradePrompt(limitsCheck);
        return { success: false, reason: 'subscription_limit' };
      }

      // Get question from message context or ask for one
      const question = await this.extractHoraryQuestion();
      if (!question) {
        await this.sendQuestionRequiredPrompt();
        return { success: false, reason: 'no_question' };
      }

      // Cast horary chart
      const horaryData = await this.castHoraryChart(question);

      // Send horary analysis
      await this.sendHoraryAnalysis(horaryData);

      this.logExecution('complete', 'Horary analysis sent successfully');
      return {
        success: true,
        type: 'traditional_horary',
        question,
        answer: horaryData.summary ? 'Chart cast and analyzed' : 'Analysis prepared'
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
   * Send formatted horary analysis response
   * @param {Object} horaryData - Horary analysis data
   */
  async sendHoraryAnalysis(horaryData) {
    try {
      if (horaryData.error) {
        const errorMessage = `⏰ *Traditional Horary Astrology*\n\n${horaryData.fallback || 'Unable to cast horary chart at this time.'}\n\nHorary astrology requires:\n• A genuine question you care about\n• Precise timing from when you ask\n• Traditional astrological wisdom\n\nFor detailed analysis with classical methods, ensure your question meets traditional criteria.`;

        await sendMessage(this.phoneNumber, errorMessage, 'text');
        return;
      }

      const formattedAnalysis = this.formatHoraryAnalysis(horaryData);
      const userLanguage = this.getUserLanguage();

      // Build interactive message with follow-up actions
      const message = ResponseBuilder.buildInteractiveButtonMessage(
        this.phoneNumber,
        formattedAnalysis,
        this.getHoraryActionButtons(),
        userLanguage
      );

      await sendMessage(
        message.to,
        message.interactive,
        'interactive'
      );
    } catch (error) {
      this.logger.error('Error sending horary response:', error);
      const simpleAnalysis = this.formatSimpleHoraryAnalysis(horaryData);
      await sendMessage(this.phoneNumber, simpleAnalysis, 'text');
    }
  }

  /**
   * Send prompt when question is required
   */
  async sendQuestionRequiredPrompt() {
    const prompt = '❓ *Traditional Horary Astrology*\n\nTo cast a horary chart, I need you to ask a specific question at the exact moment you ask it.\n\nPlease reply with your question, such as:\n• "Will I get this job?"\n• "Should I invest in property now?"\n• "When will my relationship improve?"\n\nThe chart will be cast at the precise moment you send your question! ✨';

    await sendMessage(this.phoneNumber, prompt, 'text');
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

  /**
   * Format simple horary analysis for fallback
   * @param {Object} horaryData - Horary data
   * @returns {string} Simple analysis
   */
  formatSimpleHoraryAnalysis(horaryData) {
    const name = this.sanitizeName(this.user.name || 'User');
    let response = `⏰ Horary Chart for ${name}\n\n`;

    if (horaryData.question) {
      response += `Question: "${horaryData.question}"\n\n`;
    }

    response += 'Traditional horary astrology uses the exact timing of your question to provide divine guidance.\n\n';
    response += 'For detailed horary analysis, please send your specific question directly.';

    return response;
  }

  async sendTraditionalHoraryGuide() {
    const guide = '⏰ *Traditional Horary Astrology - Divine Question Timing*\n\n' +
      'Horary astrology answers specific questions by casting a chart at the exact moment the question is received. This ancient technique provides definite yes/no answers and reveals hidden circumstances surrounding life\'s uncertainties.\n\n' +
      '*📜 TRADITIONAL HORARY PRINCIPLES:*\n' +
      '• Cast chart at precise question-received time\n' +
      '• Question ruler = Planet ruling the matter\n' +
      '• House system reveals life\'s departments\n' +
      '• Planetary aspects show the flow of events\n' +
      '• Moon\'s condition indicates outcome timing\n\n' +
      '*🎯 HORARY APPLICATIONS:*\n' +
      '• Will I get this job/investment/business?\n' +
      '• Should I move/have surgery/travel now?\n' +
      '• What is the outcome of legal matter?\n' +
      '• Will relationship develop into marriage?\n' +
      '• When will I receive money/find missing item?\n' +
      '• Is this partnership/buy trustworthy?\n\n' +
      '*🏛️ HOUSE MEANINGS IN HORARY:*\n' +
      '• **1st House:** Questioner, their appearance/attitude\n' +
      '• **2nd House:** Money, resources, possessions\n' +
      '• **3rd House:** Communication, siblings, neighbors\n' +
      '• **4th House:** Home, family, property, end of matter\n' +
      '• **7th House:** Partner, opponent, legal affairs\n' +
      '• **10th House:** Career, reputation, authority figures\n' +
      '• **12th House:** Hidden things, hospitalization, secrets\n\n' +
      '*⚡ HORARY INDICATIONS:*\n' +
      '• Moon applying to question ruler = YES/positive\n' +
      '• Benefics strong = Success likely\n' +
      '• House lord in angular houses = Quick resolution\n' +
      '• Combustion aspects = Situation unclear\n' +
      '• Retrograde planets = Delays/delays\n\n' +
      '*🎭 TRADITIONAL DIFFERENCES:*\n' +
      '*Unlike modern astrology, horary has strict rules:*\n' +
      '• Must cast at exact query moment\n' +
      '• Never answer trivial/questions you don\'t care about\n' +
      '• Question not purely astrological\n' +
      '• Casting forbidden in certain situations\n\n' +
      '*🔮 THE SCIENCE OF TIMING:*\n' +
      'Horary astrology proves that time itself carries answers. When the universe asks you to wait for the chart, your question receives a meaningful reply at the perfect moment.\n\n' +
      '*Perfect questions deserve perfect timing.* ✨';

    const userLanguage = this.getUserLanguage();
    const buttons = [{
      id: 'show_main_menu',
      titleKey: 'buttons.main_menu',
      title: '🏠 Main Menu'
    }];

    const message = ResponseBuilder.buildInteractiveButtonMessage(
      this.phoneNumber, guide, buttons, userLanguage
    );

    await sendMessage(message.to, message.interactive, 'interactive');
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
