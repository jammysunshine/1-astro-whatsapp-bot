const ServiceTemplate = require('../ServiceTemplate');
const logger = require('../../../utils/logger');
const { BirthData } = require('../../models');

/**
 * LunarReturnService - Service for lunar return chart analysis
 *
 * Provides monthly astrological themes and emotional cycles based on lunar return charts
 * using Swiss Ephemeris integration for precise lunar return calculations.
 */
class LunarReturnService extends ServiceTemplate {
  constructor() {
    super('ChartGenerator'); // Primary calculator for this service
    this.calculatorPath = '../calculators/ChartGenerator';    this.serviceName = 'LunarReturnService';
    this.calculatorPath = '../../../services/astrology/vedic/calculators/LunarReturnCalculator';
    logger.info('LunarReturnService initialized');
  }

  /**
   * Validates input data for lunar return calculation.
   * @param {Object} data - Input data containing birthData and optional targetDate.
   */
  validate(data) {
    if (!data) {
      throw new Error('Input data is required for lunar return calculation');
    }

    if (!data.birthData) {
      throw new Error('Birth data is required');
    }

    // Validate birth data with model
    const validatedData = new BirthData(data.birthData);
    validatedData.validate();

    return true;
  }

  /**
   * Main calculation method for Lunar Return.
   * @param {Object} data - Input data with birthData and optional targetDate.
   * @returns {Promise<Object>} Raw lunar return result.
   */
  async processCalculation(data) {
    try {
      // Ensure calculator is loaded
      if (!this.calculator) {
        await this.initialize();
      }

      this.validate(data);

      const { birthData, targetDate = null } = data;

      // Get lunar return data from calculator
      const result = await this.calculator.calculateLunarReturn(birthData, targetDate);

      // Add metadata
      result.type = 'lunar_return';
      result.generatedAt = new Date().toISOString();
      result.service = this.serviceName;

      return result;
    } catch (error) {
      logger.error('LunarReturnService processCalculation error:', error);
      throw new Error(`Lunar return calculation failed: ${error.message}`);
    }
  }

  /**
   * Formats the lunar return result for consistent output.
   * @param {Object} result - Raw calculator result.
   * @returns {Object} Formatted lunar return result.
   */
  formatResult(result) {
    if (result.error) {
      return {
        success: false,
        error: result.error,
        type: 'lunar_return',
        service: this.serviceName
      };
    }

    return {
      success: true,
      data: result,
      summary: result.summary || 'Lunar return analysis completed',
      metadata: {
        serviceName: this.serviceName,
        calculationType: 'Lunar Return',
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Gets the next lunar return (convenience method).
   * @param {Object} birthData - Birth data.
   * @returns {Promise<Object>} Next lunar return analysis.
   */
  async getNextLunarReturn(birthData) {
    try {
      return await this.execute({ birthData, targetDate: null });
    } catch (error) {
      logger.error('LunarReturnService getNextLunarReturn error:', error);
      return {
        error: true,
        message: 'Error calculating next lunar return'
      };
    }
  }

  /**
   * Gets current month lunar return.
   * @param {Object} birthData - Birth data.
   * @returns {Promise<Object>} Current month lunar return.
   */
  async getCurrentMonthLunarReturn(birthData) {
    try {
      const now = new Date();
      return await this.execute({ birthData, targetDate: now });
    } catch (error) {
      logger.error('LunarReturnService getCurrentMonthLunarReturn error:', error);
      return {
        error: true,
        message: 'Error calculating current month lunar return'
      };
    }
  }

  /**
   * Gets lunar return for specific month.
   * @param {Object} birthData - Birth data.
   * @param {number} year - Year.
   * @param {number} month - Month (1-12).
   * @returns {Promise<Object>} Lunar return for specific month.
   */
  async getLunarReturnForMonth(birthData, year, month) {
    try {
      if (!year || !month || month < 1 || month > 12) {
        throw new Error('Valid year and month (1-12) are required');
      }
      const targetDate = new Date(year, month - 1, 15); // Mid-month for calculation
      return await this.execute({ birthData, targetDate });
    } catch (error) {
      logger.error('LunarReturnService getLunarReturnForMonth error:', error);
      return {
        error: true,
        message: `Error calculating lunar return for ${year}/${month}`
      };
    }
  }

  /**
   * Gets lunar cycle themes and emotional patterns.
   * @param {Object} birthData - Birth data.
   * @param {Date|string} targetDate - Target date.
   * @returns {Promise<Object>} Lunar cycle themes and patterns.
   */
  async getLunarCycleThemes(birthData, targetDate = null) {
    try {
      const result = await this.execute({ birthData, targetDate });
      if (!result.success) {
        return result;
      }
      const lunarReturn = result.data;
      const themes = this._extractLunarThemes(lunarReturn);
      const emotionalPatterns = this._analyzeEmotionalPatterns(lunarReturn);
      const monthlyFocus = this._determineMonthlyFocus(lunarReturn);

      return {
        success: true,
        themes,
        emotionalPatterns,
        monthlyFocus,
        lunarPhase: lunarReturn.lunarPhase || 'Unknown',
        date: lunarReturn.date || 'Unknown'
      };
    } catch (error) {
      logger.error('LunarReturnService getLunarCycleThemes error:', error);
      return {
        success: false,
        error: 'Error analyzing lunar cycle themes'
      };
    }
  }

  /**
   * Compares two lunar returns.
   * @param {Object} return1 - First lunar return.
   * @param {Object} return2 - Second lunar return.
   * @param {Date} date1 - Date of first return.
   * @param {Date} date2 - Date of second return.
   * @returns {Object} Comparison analysis.
   * @private
   */
  _compareLunarReturns(return1, return2, date1, date2) {
    const comparison = {
      emotionalShift: 'Similar',
      focusChange: 'Consistent',
      planetaryChanges: {},
      themeEvolution: []
    };
    const moon1 = return1.planetaryPositions?.Moon?.sign;
    const moon2 = return2.planetaryPositions?.Moon?.sign;

    if (moon1 && moon2 && moon1 !== moon2) {
      comparison.emotionalShift = `From ${this._getEmotionalTone(moon1)} to ${this._getEmotionalTone(moon2)}`;
    }
    const houseChanges = {};
    if (return1.planetaryPositions && return2.planetaryPositions) {
      Object.keys(return1.planetaryPositions).forEach(planet => {
        const pos1 = return1.planetaryPositions[planet];
        const pos2 = return2.planetaryPositions[planet];

        if (pos1 && pos2 && pos1.house !== pos2.house) {
          houseChanges[planet] = {
            from: pos1.house,
            to: pos2.house,
            change: `House ${pos1.house} to ${pos2.house}`
          };
        }
      });
    }
    comparison.planetaryChanges = houseChanges;
    return comparison;
  }

  // Helper methods for interpretations
  _getLunarPhaseTheme(phase) {
    const themes = {
      'New Moon': 'New beginnings and setting intentions',
      'Waxing Crescent': 'Growth and building momentum',
      'First Quarter': 'Action and decision making',
      'Waxing Gibbous': 'Refinement and preparation',
      'Full Moon': 'Culmination and illumination',
      'Waning Gibbous': 'Release and letting go',
      'Last Quarter': 'Reflection and adjustment',
      'Waning Crescent': 'Rest and renewal'
    };
    return themes[phase] || 'General lunar influence';
  }

  _getMoonSignTheme(sign) {
    const themes = {
      Aries: 'Bold emotions and quick reactions',
      Taurus: 'Stable feelings and sensual needs',
      Gemini: 'Communicative moods and mental processing',
      Cancer: 'Nurturing emotions and family focus',
      Leo: 'Dramatic feelings and creative expression',
      Virgo: 'Analytical emotions and practical concerns',
      Libra: 'Harmonious relationships and balance seeking',
      Scorpio: 'Intense emotions and deep transformations',
      Sagittarius: 'Adventurous spirit and philosophical outlook',
      Capricorn: 'Responsible feelings and goal orientation',
      Aquarius: 'Independent thinking and community focus',
      Pisces: 'Compassionate emotions and spiritual connection'
    };
    return themes[sign] || 'General emotional patterns';
  }

  _getHouseArea(house) {
    const areas = {
      1: 'personal identity', 2: 'financial security', 4: 'home and family', 5: 'creativity and children',
      6: 'health and service', 7: 'partnerships', 8: 'transformation', 9: 'learning and travel',
      10: 'career and reputation', 11: 'community and friends', 12: 'spirituality and inner life'
    };
    return areas[house] || 'general life area';
  }

  _getEmotionalTone(sign) {
    const tones = {
      Aries: 'Energetic', Taurus: 'Stable', Gemini: 'Communicative',
      Cancer: 'Nurturing', Leo: 'Dramatic', Virgo: 'Analytical',
      Libra: 'Harmonious', Scorpio: 'Intense', Sagittarius: 'Adventurous',
      Capricorn: 'Responsible', Aquarius: 'Independent', Pisces: 'Compassionate'
    };
    return tones[sign] || 'Balanced';
  }

  _getSensitivityLevel(sign) {
    const levels = {
      Aries: 'Low', Taurus: 'Moderate', Gemini: 'Moderate',
      Cancer: 'High', Leo: 'Moderate', Virgo: 'High',
      Libra: 'Moderate', Scorpio: 'Very High', Sagittarius: 'Low',
      Capricorn: 'Low', Aquarius: 'Moderate', Pisces: 'Very High'
    };
    return levels[sign] || 'Moderate';
  }

  _getHouseFocus(house) {
    const focuses = {
      1: 'Self-development and personal goals', 2: 'Financial planning and material security',
      4: 'Family and home life', 5: 'Creativity and self-expression', 6: 'Health and daily routines',
      7: 'Relationships and partnerships', 8: 'Personal transformation and growth', 9: 'Learning and expansion',
      10: 'Career and professional life', 11: 'Community and social connections', 12: 'Spiritual development and inner work'
    };
    return focuses[house] || 'Personal development';
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
      methods: ['processCalculation', 'getNextLunarReturn', 'getCurrentMonthLunarReturn', 'getLunarReturnForMonth', 'getLunarCycleThemes', 'compareLunarReturns'],
      dependencies: [], // Managed by ServiceTemplate
      description: 'Service for lunar return chart analysis and monthly emotional cycles.'
    };
  }

  /**
   * Returns help information for the service.
   * @returns {string} Help text.
   */
  getHelp() {
    return `
🌙 **Lunar Return Service - Monthly Astrological Themes**

**Purpose:** Provides monthly astrological themes and emotional cycles based on lunar return charts, using Swiss Ephemeris for precise calculations.

**Required Inputs:**
• Birth data (Object with birthDate, birthTime, birthPlace)
• Optional: Target date (Date object or ISO string, defaults to current month for some methods)

**Analysis Includes:**
• **Lunar Return Chart:** A chart cast for the moment the Moon returns to its natal position each month.
• **Emotional Themes:** Insights into your emotional state, needs, and patterns for the month.
• **Life Focus Areas:** Identification of key areas of life that will be emphasized.
• **Planetary Influences:** How other planets interact with the lunar return chart.
• **Recommendations:** Guidance for navigating the month's emotional and energetic landscape.

**Example Usage:**
"Get my next lunar return analysis."
"What are the lunar cycle themes for this month based on my birth data?"
"Compare my lunar returns for January and February."

**Output Format:**
Comprehensive report with lunar return chart details, emotional analysis, and monthly guidance.
    `.trim();
  }
}

module.exports = LunarReturnService;
