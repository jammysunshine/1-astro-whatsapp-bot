const ServiceTemplate = require('../ServiceTemplate');
const logger = require('../../../utils/logger');
const { BirthData } = require('../../models');

/**
 * DailyHoroscopeService - Vedic daily horoscope prediction service
 *
 * Provides daily astrological insights based on current transits and natal chart analysis
 * using Swiss Ephemeris integration for precise planetary calculations.
 */
class DailyHoroscopeService extends ServiceTemplate {
  constructor() {
    super('DailyHoroscopeCalculator'); // Primary calculator for this service
    this.serviceName = 'DailyHoroscopeService';
    this.calculatorPath =
      '../../../services/astrology/vedic/calculators/DailyHoroscopeCalculator';
    logger.info('DailyHoroscopeService initialized');
  }

  /**
   * Main calculation method for Daily Horoscope.
   * @param {Object} birthData - User's birth data.
   * @returns {Promise<Object>} Daily horoscope analysis.
   */
  async processCalculation(birthData) {
    try {
      this._validateInput(birthData);

      // Generate daily horoscope
      const result = await this.calculator.generateDailyHoroscope(birthData);
      return result;
    } catch (error) {
      logger.error('DailyHoroscopeService processCalculation error:', error);
      throw new Error(`Daily horoscope generation failed: ${error.message}`);
    }
  }

  /**
   * Validates input data for daily horoscope generation.
   * @param {Object} birthData - Birth data to validate.
   * @private
   */
  _validateInput(birthData) {
    if (!birthData) {
      throw new Error('Birth data is required for daily horoscope generation.');
    }
    const validatedData = new BirthData(birthData);
    validatedData.validate();
  }

  /**
   * Formats the daily horoscope result for consistent output.
   * @param {Object} result - Raw calculator result.
   * @returns {Object} Formatted result.
   */
  formatResult(result) {
    return {
      success: true,
      data: result,
      summary: result.summary || 'Daily horoscope generated',
      metadata: {
        serviceName: this.serviceName,
        calculationType: 'Vedic Daily Horoscope',
        timestamp: new Date().toISOString()
      },
      disclaimer:
        'Daily horoscopes provide general astrological guidance based on planetary positions. Individual results may vary based on complete birth chart analysis.'
    };
  }

  /**
   * Gets daily horoscope for specific date.
   * @param {Object} birthData - Birth data.
   * @param {string} targetDate - Target date for horoscope (DD/MM/YYYY).
   * @returns {Promise<Object>} Daily horoscope for specific date.
   */
  async getHoroscopeForDate(birthData, targetDate) {
    try {
      this._validateInput(birthData);

      if (!targetDate) {
        throw new Error('Target date is required');
      }

      const horoscopeData = {
        ...birthData,
        targetDate
      };

      const result =
        await this.calculator.generateDailyHoroscope(horoscopeData);

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
   * Gets today's horoscope (convenience method).
   * @param {Object} birthData - Birth data.
   * @returns {Promise<Object>} Today's horoscope.
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
   * Gets weekly horoscope overview.
   * @param {Object} birthData - Birth data.
   * @returns {Promise<Object>} Weekly horoscope summary.
   */
  async getWeeklyHoroscope(birthData) {
    try {
      this._validateInput(birthData);

      const weeklyHoroscopes = [];
      const today = new Date();

      for (let i = 0; i < 7; i++) {
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + i);

        const dateStr = `${targetDate.getDate()}/${targetDate.getMonth() + 1}/${targetDate.getFullYear()}`;

        const dailyHoroscope = await this.getHoroscopeForDate(
          birthData,
          dateStr
        );
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
   * Generates weekly summary from daily horoscopes.
   * @param {Array} weeklyHoroscopes - Array of daily horoscopes.
   * @returns {Object} Weekly summary.
   * @private
   */
  _generateWeeklySummary(weeklyHoroscopes) {
    if (!weeklyHoroscopes || weeklyHoroscopes.length === 0) {
      return { general: 'Unable to generate weekly summary' };
    }

    const themes = { career: [], relationships: [], finance: [], health: [] };

    weeklyHoroscopes.forEach(day => {
      if (day.horoscope) {
        themes.career.push(day.horoscope.career || '');
        themes.relationships.push(day.horoscope.relationships || '');
        themes.finance.push(day.horoscope.finance || '');
        themes.health.push(day.horoscope.health || '');
      }
    });

    return {
      general:
        'Weekly horoscope overview shows mixed planetary influences with opportunities for growth and some challenges to navigate.',
      career: this._findCommonTheme(themes.career),
      relationships: this._findCommonTheme(themes.relationships),
      finance: this._findCommonTheme(themes.finance),
      health: this._findCommonTheme(themes.health),
      bestDay: this._findBestDay(weeklyHoroscopes),
      challengingDay: this._findChallengingDay(weeklyHoroscopes)
    };
  }

  /**
   * Finds common theme in array of predictions.
   * @param {Array} predictions - Array of prediction strings.
   * @returns {string} Common theme.
   * @private
   */
  _findCommonTheme(predictions) {
    if (!predictions || predictions.length === 0) {
      return 'General developments';
    }
    const words = predictions.join(' ').toLowerCase().split(/\s+/);
    const wordCount = {};
    words.forEach(word => {
      if (word.length > 3) {
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    });
    const sortedWords = Object.entries(wordCount).sort((a, b) => b[1] - a[1]);
    return sortedWords.length > 0 ?
      `Focus on ${sortedWords[0][0]}` :
      'General developments';
  }

  /**
   * Finds the best day of the week.
   * @param {Array} weeklyHoroscopes - Weekly horoscopes.
   * @returns {string} Best day.
   * @private
   */
  _findBestDay(weeklyHoroscopes) {
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
   * Finds the most challenging day of the week.
   * @param {Array} weeklyHoroscopes - Weekly horoscopes.
   * @returns {string} Challenging day.
   * @private
   */
  _findChallengingDay(weeklyHoroscopes) {
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

  /**
   * Returns metadata for the service.
   * @returns {Object} Service metadata.
   */
  getMetadata() {
    return {
      name: this.serviceName,
      version: '1.0.0',
      category: 'vedic',
      methods: [
        'processCalculation',
        'getHoroscopeForDate',
        'getTodaysHoroscope',
        'getWeeklyHoroscope'
      ],
      dependencies: [], // Managed by ServiceTemplate
      description: 'Vedic daily horoscope prediction service.'
    };
  }

  /**
   * Returns help information for the service.
   * @returns {string} Help text.
   */
  getHelp() {
    return `
☀️ **Daily Horoscope Service - Your Vedic Daily Forecast**

**Purpose:** Provides daily astrological insights based on current transits and natal chart analysis, using Swiss Ephemeris integration for precise planetary calculations.

**Required Inputs:**
• Birth data (Object with birthDate, birthTime, birthPlace)

**Analysis Includes:**
• **Daily Horoscope:** Personalized predictions for the current day.
• **Weekly Horoscope:** An overview of the week's astrological influences.
• **Planetary Transits:** How current planetary positions affect your natal chart.
• **Life Area Focus:** Insights into career, relationships, finance, and health for the day.
• **Auspicious & Challenging Times:** Identification of favorable and less favorable periods.

**Example Usage:**
"Get my daily horoscope for today."
"What is my weekly horoscope?"
"Provide my horoscope for 2025-12-25."

**Output Format:**
Daily or weekly reports with astrological insights, predictions, and recommendations.
    `.trim();
  }
}

module.exports = DailyHoroscopeService;
