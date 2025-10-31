const ServiceTemplate = require('../ServiceTemplate');
const logger = require('../../utils/logger');

// Import calculator from legacy structure (for now)

/**
 * DailyHoroscopeService - Vedic daily horoscope prediction service
 *
 * Provides daily astrological insights based on current transits and natal chart analysis
 * using Swiss Ephemeris integration for precise planetary calculations.
 */
class DailyHoroscopeService extends ServiceTemplate {
  constructor() {
    super('udailyHoroscopeService'));
    this.serviceName = 'DailyHoroscopeService';
    logger.info('DailyHoroscopeService initialized');
  }

  async processCalculation(birthData) {
    try {
      // Generate daily horoscope
      const result = await this.calculator.generateDailyHoroscope(birthData);
      return result;
    } catch (error) {
      logger.error('DailyHoroscopeService calculation error:', error);
      throw new Error(`Daily horoscope generation failed: ${error.message}`);
    }
  }

  formatResult(result) {
    return {
      success: true,
      service: 'Vedic Daily Horoscope',
      timestamp: new Date().toISOString(),
      data: result,
      disclaimer: 'Daily horoscopes provide general astrological guidance based on planetary positions. Individual results may vary based on complete birth chart analysis.'
    };
  }

  validate(birthData) {
    if (!birthData) {
      throw new Error('Birth data is required');
    }

    const { birthDate, birthTime, birthPlace } = birthData;

    if (!birthDate || typeof birthDate !== 'string') {
      throw new Error('Valid birth date (DD/MM/YYYY format) is required');
    }

    if (!birthTime || typeof birthTime !== 'string') {
      throw new Error('Valid birth time (HH:MM format) is required');
    }

    if (!birthPlace || typeof birthPlace !== 'string') {
      throw new Error('Valid birth place is required');
    }

    // Validate date format
    const dateRegex = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
    if (!dateRegex.test(birthDate)) {
      throw new Error('Birth date must be in DD/MM/YYYY format');
    }

    // Validate time format
    const timeRegex = /^\d{1,2}:\d{1,2}$/;
    if (!timeRegex.test(birthTime)) {
      throw new Error('Birth time must be in HH:MM format');
    }

    return true;
  }

  /**
   * Get daily horoscope for specific date
   * @param {Object} birthData - Birth data
   * @param {string} targetDate - Target date for horoscope (DD/MM/YYYY)
   * @returns {Promise<Object>} Daily horoscope for specific date
   */
  async getHoroscopeForDate(birthData, targetDate) {
    try {
      this._validateInput(birthData);

      if (!targetDate) {
        throw new Error('Target date is required');
      }

      // Create modified birth data with target date for transit calculations
      const horoscopeData = {
        ...birthData,
        targetDate
      };

      const result = await this.calculator.generateDailyHoroscope(horoscopeData);

      return {
        horoscope: result,
        date: targetDate,
        error: false
      };
    } catch (error) {
      logger.error('DailyHoroscopeService getHoroscopeForDate error:', error);
      return {
        error: true,
        message: `Error generating horoscope for ${targetDate}`
      };
    }
  }

  /**
   * Get today's horoscope (convenience method)
   * @param {Object} birthData - Birth data
   * @returns {Promise<Object>} Today's horoscope
   */
  async getTodaysHoroscope(birthData) {
    try {
      const today = new Date();
      const targetDate = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;

      return await this.getHoroscopeForDate(birthData, targetDate);
    } catch (error) {
      logger.error('DailyHoroscopeService getTodaysHoroscope error:', error);
      return {
        error: true,
        message: 'Error generating today\'s horoscope'
      };
    }
  }

  /**
   * Get weekly horoscope overview
   * @param {Object} birthData - Birth data
   * @returns {Promise<Object>} Weekly horoscope summary
   */
  async getWeeklyHoroscope(birthData) {
    try {
      this._validateInput(birthData);

      const weeklyHoroscopes = [];
      const today = new Date();

      // Generate horoscopes for next 7 days
      for (let i = 0; i < 7; i++) {
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + i);

        const dateStr = `${targetDate.getDate()}/${targetDate.getMonth() + 1}/${targetDate.getFullYear()}`;

        const dailyHoroscope = await this.getHoroscopeForDate(birthData, dateStr);
        if (!dailyHoroscope.error) {
          weeklyHoroscopes.push({
            date: dateStr,
            horoscope: dailyHoroscope.horoscope
          });
        }
      }

      return {
        weeklyOverview: weeklyHoroscopes,
        summary: this._generateWeeklySummary(weeklyHoroscopes),
        error: false
      };
    } catch (error) {
      logger.error('DailyHoroscopeService getWeeklyHoroscope error:', error);
      return {
        error: true,
        message: 'Error generating weekly horoscope'
      };
    }
  }



  /**
   * Generate weekly summary from daily horoscopes
   * @param {Array} weeklyHoroscopes - Array of daily horoscopes
   * @returns {Object} Weekly summary
   * @private
   */
  _generateWeeklySummary(weeklyHoroscopes) {
    if (!weeklyHoroscopes || weeklyHoroscopes.length === 0) {
      return { general: 'Unable to generate weekly summary' };
    }

    // Analyze patterns across the week
    const themes = {
      career: [],
      relationships: [],
      finance: [],
      health: []
    };

    weeklyHoroscopes.forEach(day => {
      if (day.horoscope) {
        themes.career.push(day.horoscope.career || '');
        themes.relationships.push(day.horoscope.relationships || '');
        themes.finance.push(day.horoscope.finance || '');
        themes.health.push(day.horoscope.health || '');
      }
    });

    return {
      general: 'Weekly horoscope overview shows mixed planetary influences with opportunities for growth and some challenges to navigate.',
      career: this._findCommonTheme(themes.career),
      relationships: this._findCommonTheme(themes.relationships),
      finance: this._findCommonTheme(themes.finance),
      health: this._findCommonTheme(themes.health),
      bestDay: this._findBestDay(weeklyHoroscopes),
      challengingDay: this._findChallengingDay(weeklyHoroscopes)
    };
  }

  /**
   * Find common theme in array of predictions
   * @param {Array} predictions - Array of prediction strings
   * @returns {string} Common theme
   * @private
   */
  _findCommonTheme(predictions) {
    if (!predictions || predictions.length === 0) return 'General developments';

    // Simple frequency analysis
    const words = predictions.join(' ').toLowerCase().split(/\s+/);
    const wordCount = {};

    words.forEach(word => {
      if (word.length > 3) { // Ignore short words
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    });

    const sortedWords = Object.entries(wordCount).sort((a, b) => b[1] - a[1]);
    return sortedWords.length > 0 ? `Focus on ${sortedWords[0][0]}` : 'General developments';
  }

  /**
   * Find the best day of the week
   * @param {Array} weeklyHoroscopes - Weekly horoscopes
   * @returns {string} Best day
   * @private
   */
  _findBestDay(weeklyHoroscopes) {
    // Simple heuristic: day with most favorable activities
    let bestDay = null;
    let maxFavorable = 0;

    weeklyHoroscopes.forEach(day => {
      const favorableCount = day.horoscope?.favorableActivities?.length || 0;
      if (favorableCount > maxFavorable) {
        maxFavorable = favorableCount;
        bestDay = day.date;
      }
    });

    return bestDay || weeklyHoroscopes[0]?.date || 'Unknown';
  }

  /**
   * Find the most challenging day of the week
   * @param {Array} weeklyHoroscopes - Weekly horoscopes
   * @returns {string} Challenging day
   * @private
   */
  _findChallengingDay(weeklyHoroscopes) {
    // Simple heuristic: day with most challenging areas
    let challengingDay = null;
    let maxChallenges = 0;

    weeklyHoroscopes.forEach(day => {
      const challengeCount = day.horoscope?.challengingAreas?.length || 0;
      if (challengeCount > maxChallenges) {
        maxChallenges = challengeCount;
        challengingDay = day.date;
      }
    });

    return challengingDay || weeklyHoroscopes[0]?.date || 'Unknown';
  }

  getMetadata() {
    return {
      name: this.serviceName,
      version: '1.0.0',
      category: 'vedic',
      methods: ['execute', 'getHoroscopeForDate', 'getTodaysHoroscope', 'getWeeklyHoroscope'],
      dependencies: ['DailyHoroscopeCalculator']
    };
  }
  async getHealthStatus() {
    try {
      const baseHealth = await super.getHealthStatus();
      return {
        ...baseHealth,
        features: {
          // Add service-specific features here
        },
        supportedAnalyses: [
          // Add supported analyses here
        ]
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = DailyHoroscopeService;