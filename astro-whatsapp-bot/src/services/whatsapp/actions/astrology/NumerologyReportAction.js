const BaseAction = require('../BaseAction');
const numerologyService = require('../../../../services/astrology/numerologyService');
const { ResponseBuilder } = require('../../utils/ResponseBuilder');
const { sendMessage } = require('../../messageSender');
const translationService = require('../../../../services/i18n/TranslationService');

/**
 * NumerologyReportAction - Generates comprehensive numerology reports based on birth data.
 * Calculates life path, expression, soul urge, and personality numbers with interpretations.
 */
class NumerologyReportAction extends BaseAction {
  /**
   * Unique action identifier
   */
  static get actionId() {
    return 'get_numerology_analysis';
  }

  /**
   * Execute the numerology report action
   * @returns {Promise<Object|null>} Action result
   */
  async execute() {
    try {
      this.logExecution('start', 'Generating numerology report');

      // Validate user profile
      if (!(await this.validateUserProfile('Numerology Analysis'))) {
        await this.sendIncompleteProfileMessage();
        return { success: false, reason: 'incomplete_profile' };
      }

      // Generate numerology report
      const numerologyData = await this.generateNumerologyReport();

      // Send formatted report
      await this.sendNumerologyReport(numerologyData);

      this.logExecution('complete', 'Numerology report sent');
      return {
        success: true,
        type: 'numerology_report',
        numbersCalculated: Object.keys(numerologyData).length
      };
    } catch (error) {
      this.logger.error('Error in NumerologyReportAction:', error);
      await this.handleExecutionError(error);
      return { success: false, reason: 'execution_error', error: error.message };
    }
  }

  /**
   * Generate comprehensive numerology report
   * @returns {Promise<Object>} Numerology data with interpretations
   */
  async generateNumerologyReport() {
    try {
      if (!this.user.birthDate || !this.user.name) {
        throw new Error('Missing birth date or name for numerology calculations');
      }

      const report = numerologyService.getNumerologyReport(
        this.user.birthDate,
        this.user.name
      );

      if (report.error) {
        throw new Error(`Numerology calculation failed: ${report.error}`);
      }

      return report;
    } catch (error) {
      this.logger.error('Error generating numerology report:', error);
      // Return basic fallback calculations
      return this.generateBasicNumerology();
    }
  }

  /**
   * Generate basic numerology calculations as fallback
   * @returns {Object} Basic numerology data
   */
  generateBasicNumerology() {
    const birthDate = this.user.birthDate || '01012000';
    const name = this.user.name || 'User';

    // Simple numerology calculations
    const lifePath = this.calculateLifePathNumber(birthDate);
    const expression = this.calculateExpressionNumber(name);
    const personality = this.calculatePersonalityNumber(name);

    return {
      lifePath: {
        number: lifePath,
        interpretation: this.getLifePathMeaning(lifePath)
      },
      expression: {
        number: expression,
        interpretation: this.getExpressionMeaning(expression)
      },
      personality: {
        number: personality,
        interpretation: this.getPersonalityMeaning(personality)
      },
      soulUrge: {
        number: this.calculateSoulUrgeNumber(name),
        interpretation: 'Your inner motivations and desires'
      },
      isFallback: true
    };
  }

  /**
   * Calculate life path number from birth date
   * @param {string} birthDate - Birth date
   * @returns {number} Life path number
   */
  calculateLifePathNumber(birthDate) {
    const cleanDate = birthDate.replace(/\D/g, '');
    let sum = 0;

    for (const digit of cleanDate) {
      sum += parseInt(digit);
    }

    // Reduce to single digit (except master numbers 11, 22, 33)
    while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
      sum = this.sumDigits(sum);
    }

    return sum;
  }

  /**
   * Calculate expression number from name
   * @param {string} name - Full name
   * @returns {number} Expression number
   */
  calculateExpressionNumber(name) {
    const cleanName = name.toUpperCase().replace(/[^A-Z]/g, '');
    let sum = 0;

    for (const letter of cleanName) {
      sum += this.getLetterValue(letter);
    }

    return this.reduceToSingleDigit(sum);
  }

  /**
   * Calculate personality number (from consonants)
   * @param {string} name - Full name
   * @returns {number} Personality number
   */
  calculatePersonalityNumber(name) {
    const consonants = name.toUpperCase().replace(/[^BCDFGHJKLMNPQRSTVWXYZ]/g, '');
    let sum = 0;

    for (const letter of consonants) {
      sum += this.getLetterValue(letter);
    }

    return this.reduceToSingleDigit(sum);
  }

  /**
   * Calculate soul urge number (from vowels)
   * @param {string} name - Full name
   * @returns {number} Soul urge number
   */
  calculateSoulUrgeNumber(name) {
    const vowels = name.toUpperCase().replace(/[^AEIOU]/g, '');
    let sum = 0;

    for (const letter of vowels) {
      sum += this.getLetterValue(letter);
    }

    return this.reduceToSingleDigit(sum);
  }

  /**
   * Get Pythagorean numerology value for a letter
   * @param {string} letter - Letter
   * @returns {number} Numerical value
   */
  getLetterValue(letter) {
    const values = {
      A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
      J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
      S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8
    };
    return values[letter] || 0;
  }

  /**
   * Reduce number to single digit
   * @param {number} num - Number to reduce
   * @returns {number} Single digit number
   */
  reduceToSingleDigit(num) {
    while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
      num = this.sumDigits(num);
    }
    return num;
  }

  /**
   * Sum digits of a number
   * @param {number} num - Number
   * @returns {number} Sum of digits
   */
  sumDigits(num) {
    return num.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
  }

  /**
   * Get life path number meaning
   * @param {number} number - Life path number
   * @returns {string} Interpretation
   */
  getLifePathMeaning(number) {
    const meanings = {
      1: 'Independent, courageous pioneer who leads by example',
      2: 'Cooperative peacemaker who thrives in partnerships',
      3: 'Creative communicator who brings joy and optimism',
      4: 'Practical builder who values structure and organization',
      5: 'Adventurous freedom-lover who embraces change',
      6: 'Responsible caregiver who nurtures and supports others',
      7: 'Wise introspective seeker of truth and knowledge',
      8: 'Ambitious achiever who manifests wealth and power',
      9: 'Compassionate humanitarian who serves the greater good',
      11: 'Spiritually enlightened teacher with high intuition',
      22: 'Master builder who manifests grand visions',
      33: 'Selfless healer who serves mankind with love'
    };
    return meanings[number] || 'Unique path of self-discovery and growth';
  }

  /**
   * Get expression number meaning
   * @param {number} number - Expression number
   * @returns {string} Interpretation
   */
  getExpressionMeaning(number) {
    const meanings = {
      1: 'Natural leader and innovator with strong will',
      2: 'Diplomatic peacemaker with healing abilities',
      3: 'Artistic communicator who inspires and entertains',
      4: 'Reliable organizer who builds solid foundations',
      5: 'Dynamic adventurer who brings enthusiasm',
      6: 'Loving caretaker who creates harmony and beauty',
      7: 'Deep thinker and analyst with spiritual insight',
      8: 'Powerful executive who achieves material success',
      9: 'Wise humanitarian who serves the world'
    };
    return meanings[number] || 'Expressive communicator with unique talents';
  }

  /**
   * Get personality number meaning
   * @param {number} number - Personality number
   * @returns {string} Interpretation
   */
  getPersonalityMeaning(number) {
    const meanings = {
      1: 'Confident pioneer who takes the lead',
      2: 'Gentle diplomat who values cooperation',
      3: 'Outgoing communicator who brings joy',
      4: 'Dependable worker who is practical and organized',
      5: 'Exciting adventurer who loves freedom',
      6: 'Warm nurturer who cares for others',
      7: 'Private intellectual who seeks understanding',
      8: 'Ambitious achiever who leads with authority',
      9: 'Caring philanthropist who helps others'
    };
    return meanings[number] || 'Balanced and approachable personality';
  }

  /**
   * Send formatted numerology report
   * @param {Object} numerologyData - Numerology calculations and interpretations
   */
  async sendNumerologyReport(numerologyData) {
    try {
      const formattedReport = this.formatNumerologyReport(numerologyData);
      const userLanguage = this.getUserLanguage();

      const buttons = [
        {
          id: 'get_numerology_timeline',
          titleKey: 'buttons.timeline',
          title: '⏰ Life Timeline'
        },
        {
          id: 'get_name_analysis',
          titleKey: 'buttons.name_analysis',
          title: '📝 Name Analysis'
        },
        {
          id: 'show_main_menu',
          titleKey: 'buttons.main_menu',
          title: '🏠 Main Menu'
        }
      ];

      const message = ResponseBuilder.buildInteractiveButtonMessage(
        this.phoneNumber,
        formattedReport,
        buttons,
        userLanguage
      );

      await sendMessage(
        message.to,
        message.interactive,
        'interactive'
      );
    } catch (error) {
      this.logger.error('Error sending numerology report:', error);
      await this.handleExecutionError(error);
    }
  }

  /**
   * Format numerology data into comprehensive report
   * @param {Object} data - Numerology data
   * @returns {string} Formatted report
   */
  formatNumerologyReport(data) {
    let report = `🔢 *Complete Numerology Report*\n*For ${this.user.name}*\n\n`;

    if (data.lifePath) {
      report += `*🎯 Life Path Number:* ${data.lifePath.number}\n`;
      report += `${data.lifePath.interpretation}\n\n`;
    }

    if (data.expression) {
      report += `*🎭 Expression Number:* ${data.expression.number}\n`;
      report += `${data.expression.interpretation}\n\n`;
    }

    if (data.soulUrge) {
      report += `*❤️ Soul Urge Number:* ${data.soulUrge.number}\n`;
      report += `${data.soulUrge.interpretation}\n\n`;
    }

    if (data.personality) {
      report += `*🧑 Personality Number:* ${data.personality.number}\n`;
      report += `${data.personality.interpretation}\n\n`;
    }

    if (data.isFallback) {
      report += '*⚠️ Note:* This is a basic calculation. For detailed analysis, complete numerology charts are recommended.\n\n';
    }

    report += '*🔍 Your numerology reveals the patterns of your soul\'s journey. Numbers are the universal language through which the cosmos communicates with us.*';

    return report;
  }

  /**
   * Send message for incomplete profile
   */
  async sendIncompleteProfileMessage() {
    const message = '👤 *Profile Required for Numerology*\n\nNumerology analysis requires both your birth date and full name.\n\n📝 Please complete your profile to unlock your cosmic blueprint!';
    await sendMessage(this.phoneNumber, message, 'text');
  }

  /**
   * Handle execution errors
   * @param {Error} error - Execution error
   */
  async handleExecutionError(error) {
    const errorMessage = '❌ Sorry, there was an error calculating your numerology. The cosmic vibrations might be temporarily misaligned. Please try again.';
    await sendMessage(this.phoneNumber, errorMessage, 'text');
  }

  /**
   * Get action metadata for registration
   * @returns {Object} Action metadata
   */
  static getMetadata() {
    return {
      id: this.actionId,
      description: 'Generate comprehensive numerology reports and life path analysis',
      keywords: ['numerology', 'numbers', 'life path', 'expression', 'personality'],
      category: 'astrology',
      subscriptionRequired: false,
      cooldown: 1800000 // 30 minutes between numerology reports
    };
  }
}

module.exports = NumerologyReportAction;
