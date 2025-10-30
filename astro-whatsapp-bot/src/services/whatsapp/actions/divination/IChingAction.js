const BaseAction = require('../BaseAction');
const { ResponseBuilder } = require('../../utils/ResponseBuilder');
const { sendMessage } = require('../../messageSender');
const translationService = require('../../../../services/i18n/TranslationService');
const { IChingService } = require('../../../../services/astrology/iching');

/**
 * IChingAction - Provides I Ching (Book of Changes) readings using ancient Chinese wisdom.
 * The I Ching is a 3000-year-old oracle system for guidance and insight.
 */
class IChingAction extends BaseAction {
  /**
   * Unique action identifier
   */
  static get actionId() {
    return 'get_iching_reading';
  }

  /**
   * Execute the I Ching reading action
   * @returns {Promise<Object|null>} Action result
   */
  async execute() {
    try {
      this.logExecution('start', 'Generating I Ching reading');

      // Generate the I Ching reading
      const reading = await this.generateIChingReading();

      if (!reading) {
        await this.handleReadingError();
        return { success: false, reason: 'reading_failed' };
      }

      // Send formatted reading
      await this.sendIChingReading(reading);

      this.logExecution('complete', 'I Ching reading sent');
      return {
        success: true,
        type: 'iching_reading',
        hexagram: reading.hexagramNumber
      };
    } catch (error) {
      this.logger.error('Error in IChingAction:', error);
      await this.handleExecutionError(error);
      return { success: false, reason: 'execution_error', error: error.message };
    }
  }

  /**
   * Generate I Ching hexagram and interpretation
   * @returns {Promise<Object|null>} Reading result or null on failure
   */
  async generateIChingReading() {
    try {
      // For now, generate a simple hexagram pattern
      // In a full implementation, this would use traditional yarrow stalk or coin methods
      const hexagramNumber = Math.floor(Math.random() * 64) + 1;
      const changingLines = this.generateChangingLines();

      return {
        hexagramNumber,
        changingLines,
        interpretation: this.getHexagramMeaning(hexagramNumber),
        advice: this.getHexagramAdvice(hexagramNumber),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error('Error generating I Ching reading:', error);
      return null;
    }
  }

  /**
   * Generate changing lines (0-6 lines can change in a hexagram)
   * @returns {Array} Array of line positions that change (0-5)
   */
  generateChangingLines() {
    const count = Math.floor(Math.random() * 4); // 0-3 changing lines typical
    const lines = [];

    for (let i = 0; i < count; i++) {
      lines.push(Math.floor(Math.random() * 6));
    }

    return [...new Set(lines)]; // Remove duplicates
  }

  /**
   * Get hexagram interpretation
   * @param {number} hexagramNumber - Hexagram number (1-64)
   * @returns {string} Interpretation text
   */
  getHexagramMeaning(hexagramNumber) {
    // Simplified interpretations - in full system would have all 64
    const interpretations = {
      1: 'The Creative - Pure yang energy. New beginnings, creativity, leadership.',
      2: 'The Receptive - Pure yin energy. Patience, receptivity, nurturing.',
      11: 'Peace - Harmony and balance in all relationships.',
      12: 'Standstill - Temporary stagnation requires patience and inner stability.',
      15: 'Modesty - True power comes from restraint and humility.',
      16: 'Enthusiasm - Joy and inspiration move heaven and earth.',
      24: 'Return - The light returns. Small beginnings bring great success.',
      50: 'The Cauldron - Sacred vessel of transformation and nourishment.'
    };

    return interpretations[hexagramNumber] ||
      `Hexagram ${hexagramNumber}: Ancient wisdom flows through subtle changes. ` +
      'Trust the timing of the universe and maintain inner harmony.';
  }

  /**
   * Get advice for the hexagram
   * @param {number} hexagramNumber - Hexagram number
   * @returns {string} Advice text
   */
  getHexagramAdvice(hexagramNumber) {
    const advice = {
      1: 'Embrace new beginnings with courage and clarity. The time is ripe for bold action.',
      2: 'Remain receptive and patient. True strength lies in gentle persistence.',
      11: 'Foster peace in all relationships. Small concessions lead to great harmony.',
      12: 'Stay centered during stagnation. This pause allows deeper understanding to emerge.'
    };

    return advice[hexagramNumber] ||
      'Flow with life\'s changes. What seems challenging today opens new paths tomorrow.';
  }

  /**
   * Send formatted I Ching reading to user
   * @param {Object} reading - I Ching reading data
   */
  async sendIChingReading(reading) {
    try {
      const formattedReading = this.formatIChingReading(reading);
      const userLanguage = this.getUserLanguage();

      const buttons = [
        {
          id: 'get_iching_reading',
          titleKey: 'buttons.another_iching',
          title: '🪙 New Reading'
        },
        {
          id: 'get_tarot_reading',
          titleKey: 'buttons.tarot',
          title: '🔮 Tarot'
        },
        {
          id: 'show_main_menu',
          titleKey: 'buttons.main_menu',
          title: '🏠 Main Menu'
        }
      ];

      const message = ResponseBuilder.buildInteractiveButtonMessage(
        this.phoneNumber,
        formattedReading,
        buttons,
        userLanguage
      );

      await sendMessage(
        message.to,
        message.interactive,
        'interactive'
      );
    } catch (error) {
      this.logger.error('Error sending I Ching reading:', error);
      await this.handleExecutionError(error);
    }
  }

  /**
   * Format I Ching reading into readable response
   * @param {Object} reading - Raw reading data
   * @returns {string} Formatted reading
   */
  formatIChingReading(reading) {
    let response = '🪙 *I Ching - The Book of Changes*\n\n';

    response += `*Hexagram #${reading.hexagramNumber}*\n\n`;

    response += `*📖 Wisdom:*\n${reading.interpretation}\n\n`;

    if (reading.changingLines && reading.changingLines.length > 0) {
      response += `*🔄 Changing Lines:* ${reading.changingLines.join(', ')}\n\n`;
    }

    response += `*💫 Guidance:*\n${reading.advice}\n\n`;

    response += '*"The Tao that can be told is not the eternal Tao. The name that can be named is not the eternal name."*\n\n';
    response += '*The I Ching reflects the fundamental principle that change is the only constant. How you navigate these changes determines your path.*';

    return response;
  }

  /**
   * Send error message when reading fails
   */
  async handleReadingError() {
    const errorMessage = 'I\'m sorry, I couldn\'t connect to the ancient wisdom of the I Ching at this moment. The energies may be asking us to wait. Please try again later.';
    await sendMessage(this.phoneNumber, errorMessage, 'text');
  }

  /**
   * Handle execution errors
   * @param {Error} error - Execution error
   */
  async handleExecutionError(error) {
    const errorMessage = '❌ There was an error consulting the I Ching oracle. Please try again, or the universe may be guiding us to find wisdom elsewhere.';
    await sendMessage(this.phoneNumber, errorMessage, 'text');
  }

  /**
   * Get action metadata for registration
   * @returns {Object} Action metadata
   */
  static getMetadata() {
    return {
      id: this.actionId,
      description: 'Generate I Ching hexagrams and ancient Chinese wisdom readings',
      keywords: ['iching', 'i ching', 'book of changes', 'yi jing', 'oracle', 'chinese'],
      category: 'divination',
      subscriptionRequired: false,
      cooldown: 300000 // 5 minutes between readings
    };
  }
}

module.exports = IChingAction;
