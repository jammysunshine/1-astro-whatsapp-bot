const AstrologyAction = require('../base/AstrologyAction');
const generateAstrologyResponse = require('../../../services/astrology/astrologyEngine');
const {
  AstrologyFormatterFactory
} = require('../factories/AstrologyFormatterFactory');

/**
 * DailyHoroscopeAction - Generates and sends daily horoscope readings.
 * Uses AstrologyAction base class for unified validation, error handling, and response building.
 */
class DailyHoroscopeAction extends AstrologyAction {
  /**
   * Unique action identifier
   */
  static get actionId() {
    return 'get_daily_horoscope';
  }

  /**
   * Execute the daily horoscope action using base class unified methods
   * @returns {Promise<Object|null>} Action result
   */
  async execute() {
    try {
      this.logAstrologyExecution('start', 'Generating daily horoscope');

      // Unified profile and limits validation from base class
      const validation = await this.validateProfileAndLimits(
        'Daily Horoscope',
        'horoscope_daily'
      );
      if (!validation.success) {
        return validation;
      }

      // Generate horoscope content
      const horoscopeData = await this.generateHoroscope();
      if (!horoscopeData) {
        throw new Error('Failed to generate horoscope data');
      }

      // Format and send using centralized factory and base class methods
      const formattedContent =
        AstrologyFormatterFactory.formatHoroscope(horoscopeData);
      await this.buildAstrologyResponse(
        formattedContent,
        this.getHoroscopeActionButtons()
      );

      this.logAstrologyExecution(
        'complete',
        'Daily horoscope delivered successfully'
      );
      return {
        success: true,
        type: 'horoscope',
        contentLength: formattedContent.length
      };
    } catch (error) {
      this.logger.error('Error in DailyHoroscopeAction:', error);
      await this.handleExecutionError(error);
      return {
        success: false,
        reason: 'execution_error',
        error: error.message
      };
    }
  }

  /**
   * Generate personalized horoscope content using astrology engine
   * @returns {Promise<Object>} Horoscope data object for formatting
   */
  async generateHoroscope() {
    try {
      // Use the astrology engine to generate personalized daily horoscope
      const rawResponse = await generateAstrologyResponse(
        'daily horoscope',
        this.user
      );

      if (typeof rawResponse === 'string' && rawResponse.length > 0) {
        return this.buildHoroscopeData(rawResponse);
      }

      // Fallback if astrology engine fails
      return this.generateFallbackData();
    } catch (error) {
      this.logger.warn(
        'Astrology engine failed, using fallback:',
        error.message
      );
      return this.generateFallbackData();
    }
  }

  /**
   * Build horoscope data object for formatter
   * @param {string} content - Raw horoscope content
   * @returns {Object} Structured horoscope data
   */
  buildHoroscopeData(content) {
    return {
      name: this.user?.name,
      date: new Date().toISOString(),
      content: this.enhanceHoroscopeText(content),
      guidance: this.generateRandomGuidance()
    };
  }

  /**
   * Generate fallback horoscope data
   * @returns {Object} Fallback horoscope data
   */
  generateFallbackData() {
    return {
      name: this.user?.name,
      date: new Date().toISOString(),
      content:
        'Today brings opportunities for growth and new experiences. Trust your instincts and stay open to the possibilities around you.',
      guidance: 'Trust your intuition today and embrace change as growth.'
    };
  }

  /**
   * Enhance horoscope text with formatting (moved from formatter for customization)
   * @param {string} text - Raw horoscope text
   * @returns {string} Enhanced text
   */
  enhanceHoroscopeText(text) {
    // Add relevant emojis based on content
    let enhanced = text;

    const emojiMap = {
      lucky: '🍀',
      fortunate: '🍀',
      blessed: '🍀',
      challenges: '⚠️',
      difficulties: '⚠️',
      love: '💕',
      romance: '💕',
      relationship: '💕',
      career: '💼',
      work: '💼',
      job: '💼',
      money: '💰',
      wealth: '💰',
      finance: '💰',
      health: '🏥',
      wellness: '🏥'
    };

    Object.entries(emojiMap).forEach(([keyword, emoji]) => {
      enhanced = enhanced.replace(
        new RegExp(`\\b${keyword}\\b`, 'gi'),
        `${emoji} $&`
      );
    });

    return enhanced;
  }

  /**
   * Generate random daily guidance
   * @returns {string} Daily guidance text
   */
  generateRandomGuidance() {
    const guidance = [
      'Trust your intuition today',
      'Stay open to unexpected opportunities',
      'Focus on what brings you joy',
      'Be patient with yourself and others',
      'Take time for self-reflection',
      'Express gratitude for what you have',
      'Embrace change as growth'
    ];
    return guidance[Math.floor(Math.random() * guidance.length)];
  }

  /**
   * Get action buttons for horoscope response
   * @returns {Array} Button configuration array
   */
  getHoroscopeActionButtons() {
    return [
      {
        id: 'horoscope_again',
        titleKey: 'buttons.another_horoscope',
        title: '🔄 Another Reading'
      },
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
   * Get action metadata for registration
   * @returns {Object} Action metadata
   */
  static getMetadata() {
    return {
      id: this.actionId,
      description: 'Generate and send daily horoscope readings',
      keywords: ['horoscope', 'daily', 'stars', 'prediction'],
      category: 'astrology',
      subscriptionRequired: false,
      cooldown: 300000 // 5 minutes between requests
    };
  }
}

module.exports = DailyHoroscopeAction;
