const { DailyHoroscopeCalculator } = require('../../../services/astrology/vedic/calculators/DailyHoroscopeCalculator');
const logger = require('../../../utils/logger');

/**
 * DailyHoroscopeService - Service for generating daily horoscope predictions
 * Provides daily astrological insights based on current transits and natal chart analysis
 * using Swiss Ephemeris integration for precise planetary calculations.
 */
class DailyHoroscopeService {
  constructor(astrologer, geocodingService) {
    this.calculator = new DailyHoroscopeCalculator(astrologer, geocodingService);
    logger.info('DailyHoroscopeService initialized');
  }

  /**
   * Execute daily horoscope generation
   * @param {Object} birthData - Birth data for horoscope calculation
   * @param {string} birthData.birthDate - Birth date (DD/MM/YYYY)
   * @param {string} birthData.birthTime - Birth time (HH:MM)
   * @param {string} birthData.birthPlace - Birth place
   * @param {string} birthData.name - Person's name (optional)
   * @returns {Promise<Object>} Daily horoscope analysis result
   */
  async execute(birthData) {
    try {
      // Input validation
      this._validateInput(birthData);

      // Generate daily horoscope
      const result = await this.calculator.generateDailyHoroscope(birthData);

      // Format and return result
      return this._formatResult(result);
    } catch (error) {
      logger.error('DailyHoroscopeService error:', error);
      throw new Error(`Daily horoscope generation failed: ${error.message}`);
    }
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
   * Validate input data
   * @param {Object} input - Input data to validate
   * @private
   */
  _validateInput(input) {
    if (!input) {
      throw new Error('Birth data is required');
    }

    const { birthDate, birthTime, birthPlace } = input;

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
  }

  /**
   * Format result for service consumption
   * @param {Object} result - Raw calculator result
   * @returns {Object} Formatted result
   * @private
   */
  _formatResult(result) {
    return {
      service: 'Daily Horoscope Analysis',
      timestamp: new Date().toISOString(),
      horoscope: {
        predictions: result.predictions || [],
        planetaryInfluences: result.planetaryInfluences || {},
        moonSign: result.moonSign || 'Unknown',
        sunSign: result.sunSign || 'Unknown',
        nakshatra: result.nakshatra || 'Unknown',
        favorableActivities: result.favorableActivities || [],
        challengingAreas: result.challengingAreas || [],
        luckyNumbers: result.luckyNumbers || [],
        luckyColors: result.luckyColors || [],
        health: result.health || 'General health focus',
        career: result.career || 'Career development',
        relationships: result.relationships || 'Relationship harmony',
        finance: result.finance || 'Financial stability'
      },
      disclaimer: 'Daily horoscopes provide general astrological guidance based on planetary positions. Individual results may vary based on complete birth chart analysis.'
    };
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
}

module.exports = DailyHoroscopeService;