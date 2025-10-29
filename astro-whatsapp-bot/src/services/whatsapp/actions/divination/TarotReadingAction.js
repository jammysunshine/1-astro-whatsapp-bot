const BaseAction = require('../BaseAction');
const { ResponseBuilder } = require('../../utils/ResponseBuilder');

/**
 * TarotReadingAction - Performs tarot card readings with professional interpretations.
 * Supports various spread types and provides spiritual guidance.
 */
class TarotReadingAction extends BaseAction {
  /**
   * Unique action identifier
   */
  static get actionId() {
    return 'get_tarot_reading';
  }

  /**
   * Execute the tarot reading action
   * @returns {Promise<Object|null>} Action result
   */
  async execute() {
    try {
      this.logExecution('start', 'Performing tarot reading');

      // Check if user has completed profile for personalized reading
      if (!(await this.validateProfileForReading())) {
        await this.sendGenericTarotReading();
        return { success: true, type: 'generic_tarot' };
      }

      // Perform personalized tarot reading
      const reading = await this.performTarotReading();

      if (!reading) {
        await this.handleReadingError();
        return { success: false, reason: 'reading_failed' };
      }

      // Send the tarot reading result
      await this.sendTarotReading(reading);

      this.logExecution('complete', 'Tarot reading completed successfully');
      return {
        success: true,
        cards: reading.cards?.length || 0,
        spread: reading.type
      };

    } catch (error) {
      this.logger.error('Error in TarotReadingAction:', error);
      await this.handleExecutionError(error);
      return { success: false, reason: 'execution_error', error: error.message };
    }
  }

  /**
   * Validate if user profile allows for personalized reading
   * @returns {Promise<boolean>} True if profile is sufficient
   */
  async validateProfileForReading() {
    // Tarot readings can be generic even without profile,
    // but personalized ones are better with context
    return true; // Allow generic readings always
  }

  /**
   * Perform the actual tarot reading
   * @returns {Promise<Object|null>} Reading result or null on failure
   */
  async performTarotReading() {
    try {
      try {
        const tarotReader = require('../../../../services/astrology/tarotReader');
        const spreadType = 'single';
        return await tarotReader.generateTarotReading(this.user, spreadType);
      } catch (moduleError) {
        this.logger.warn('tarotReader module not found, using fallback:', moduleError.message);
        return null; // This will trigger generic tarot reading
      }

      // For now, always return null to trigger generic reading
      return null; // Triggers sendGenericTarotReading() instead

    } catch (error) {
      this.logger.error('Error generating tarot reading:', error);
      return null;
    }
  }

  /**
   * Send generic tarot reading when no profile context
   */
  async sendGenericTarotReading() {
    const genericCards = [
      { name: 'The Fool', meaning: 'New beginnings, innocence, spontaneity' },
      { name: 'The Magician', meaning: 'Manifestation, resourcefulness, power' },
      { name: 'The High Priestess', meaning: 'Intuition, unconscious, divine feminine' }
    ];

    const randomCard = genericCards[Math.floor(Math.random() * genericCards.length)];

    const message = `🃏 *Tarot Reading: ${randomCard.name}*\n\n${randomCard.meaning}\n\nThis is a general reading. For a more personalized reading, please complete your birth profile.`;

    await this.sendMessage(message, 'text');
  }

  /**
   * Send the tarot reading result to the user
   * @param {Object} reading - Tarot reading data
   */
  async sendTarotReading(reading) {
    try {
      // Format the reading message
      const message = this.formatTarotReadingMessage(reading);

      // Get action buttons for follow-up
      const buttons = this.getTarotActionButtons();

      // Send as interactive message with buttons
      const interactiveMessage = ResponseBuilder.buildInteractiveMessage(
        this.phoneNumber,
        'button',
        message,
        { buttons }
      );

      await this.sendMessage(interactiveMessage, 'interactive');

    } catch (error) {
      this.logger.error('Error sending tarot reading:', error);
      // Fallback to text message
      const simpleMessage = this.formatTarotReadingMessage(reading);
      await this.sendMessage(simpleMessage, 'text');
    }
  }

  /**
   * Format tarot reading data into user-friendly message
   * @param {Object} reading - Tarot reading data
   * @returns {string} Formatted message
   */
  formatTarotReadingMessage(reading) {
    let message = `🔮 *Tarot Reading - ${reading.type || 'Single Card'}*\n\n`;

    if (reading.cards && reading.cards.length > 0) {
      reading.cards.forEach((card, index) => {
        message += `*Card ${index + 1}:* ${card.name}\n`;
        if (card.upright !== undefined) {
          message += `*Upright:* ${card.upright}\n`;
        }
        if (card.position) {
          message += `*Position:* ${card.position}\n`;
        }
        message += '\n';
      });
    }

    if (reading.interpretation) {
      message += `*Interpretation:*\n${reading.interpretation}\n\n`;
    }

    if (reading.advice) {
      message += `*Advice:* ${reading.advice}\n\n`;
    }

    message += 'Remember: Tarot provides guidance, not definitive answers. Trust your intuition in making decisions.';

    return message;
  }

  /**
   * Get action buttons for tarot reading response
   * @returns {Array} Button configuration array
   */
  getTarotActionButtons() {
    return [
      {
        id: 'get_tarot_reading',
        titleKey: 'buttons.another_reading',
        title: '🔄 New Reading'
      },
      {
        id: 'get_iching_reading',
        titleKey: 'buttons.iching',
        title: '🪙 I Ching'
      },
      {
        id: 'show_main_menu',
        titleKey: 'buttons.main_menu',
        title: '🏠 Main Menu'
      }
    ];
  }

  /**
   * Handle reading generation errors
   */
  async handleReadingError() {
    const errorMessage = 'I\'m sorry, I couldn\'t generate a tarot reading right now. The mystical energies might be misaligned. Please try again in a moment.';
    await this.sendMessage(errorMessage, 'text');
  }

  /**
   * Handle execution errors
   * @param {Error} error - Execution error
   */
  async handleExecutionError(error) {
    const errorMessage = 'An unexpected error occurred while consulting the cards. Please try your reading again.';
    await this.sendMessage(errorMessage, 'text');
  }

  /**
   * Get action metadata for registration
   * @returns {Object} Action metadata
   */
  static getMetadata() {
    return {
      id: this.actionId,
      description: 'Generate and send tarot card readings',
      keywords: ['tarot', 'cards', 'reading', 'divination'],
      category: 'divination',
      subscriptionRequired: false,
      cooldown: 180000 // 3 minutes between readings
    };
  }
}

module.exports = TarotReadingAction;