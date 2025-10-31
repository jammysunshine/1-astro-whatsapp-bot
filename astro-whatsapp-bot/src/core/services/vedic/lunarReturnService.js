const ServiceTemplate = require('../ServiceTemplate');
const logger = require('../../utils/logger');
const { BirthData } = require('../../models');

// Import calculator from legacy structure (for now)

/**
 * LunarReturnService - Service for lunar return chart analysis
 * Provides monthly astrological themes and emotional cycles based on lunar return charts
 * using Swiss Ephemeris integration for precise lunar return calculations.
 */
class LunarReturnService extends ServiceTemplate {
  constructor() {
    super('ulunarReturnService'));
    this.serviceName = 'LunarReturnService';
    logger.info('LunarReturnService initialized');
  }

  /**
   * Validate input data for lunar return calculation
   * @param {Object} data - Input data containing birthData and optional targetDate
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
   * Process lunar return calculation using the calculator
   * @param {Object} data - Input data with birthData and optional targetDate
   * @returns {Promise<Object>} Raw lunar return result
   */
  async processCalculation(data) {
    const { birthData, targetDate = null } = data;
    
    // Get lunar return data from calculator
    const result = await this.calculator.calculateLunarReturn(birthData, targetDate);
    
    // Add metadata
    result.type = 'lunar_return';
    result.generatedAt = new Date().toISOString();
    result.service = this.serviceName;
    
    return result;
  }

  /**
   * Format the lunar return result for consistent output
   * @param {Object} result - Raw calculator result
   * @returns {Object} Formatted lunar return result
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
      timestamp: new Date().toISOString(),
      service: this.serviceName
    };
  }

  /**
   * Get next lunar return (convenience method)
   * @param {Object} birthData - Birth data
   * @returns {Promise<Object>} Next lunar return analysis
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
   * Get current month lunar return
   * @param {Object} birthData - Birth data
   * @returns {Promise<Object>} Current month lunar return
   */
  async getCurrentMonthLunarReturn(birthData) {
    try {
      // Calculate lunar return for the current month
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
   * Get lunar return for specific month
   * @param {Object} birthData - Birth data
   * @param {number} year - Year
   * @param {number} month - Month (1-12)
   * @returns {Promise<Object>} Lunar return for specific month
   */
  async getLunarReturnForMonth(birthData, year, month) {
    try {
      if (!year || !month || month < 1 || month > 12) {
        throw new Error('Valid year and month (1-12) are required');
      }

      // Create date for the specified month
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
   * Get lunar cycle themes and emotional patterns
   * @param {Object} birthData - Birth data
   * @param {Date|string} targetDate - Target date
   * @returns {Promise<Object>} Lunar cycle themes and patterns
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
   * Compare lunar returns between months
   * @param {Object} birthData - Birth data
   * @param {Date} date1 - First date
   * @param {Date} date2 - Second date
   * @returns {Promise<Object>} Lunar return comparison
   */
  async compareLunarReturns(birthData, date1, date2) {
    try {
      const result1 = await this.execute({ birthData, targetDate: date1 });
      const result2 = await this.execute({ birthData, targetDate: date2 });

      if (!result1.success || !result2.success) {
        return {
          success: false,
          error: 'Failed to calculate one or both lunar returns'
        };
      }

      const comparison = this._compareLunarReturns(result1.data, result2.data, date1, date2);

      return {
        success: true,
        comparison,
        lunarReturn1: { date: date1, analysis: result1.data },
        lunarReturn2: { date: date2, analysis: result2.data }
      };
    } catch (error) {
      logger.error('LunarReturnService compareLunarReturns error:', error);
      return {
        success: false,
        error: 'Error comparing lunar returns'
      };
    }
  }

  /**
   * Get service metadata
   * @returns {Object} Service metadata
   */
  getMetadata() {
    return {
      ...super.getMetadata(),
      name: 'LunarReturnService',
      category: 'vedic',
      description: 'Service for lunar return chart analysis and monthly emotional cycles',
      version: '1.0.0',
      status: 'active'
    };
  }

  /**
   * Extract lunar themes from lunar return
   * @param {Object} lunarReturn - Lunar return analysis
   * @returns {Array} Key lunar themes
   * @private
   */
  _extractLunarThemes(lunarReturn) {
    const themes = [];

    // Analyze moon phase and sign
    if (lunarReturn.lunarPhase) {
      themes.push({
        type: 'lunar_phase',
        phase: lunarReturn.lunarPhase,
        theme: this._getLunarPhaseTheme(lunarReturn.lunarPhase)
      });
    }

    // Analyze planetary placements
    if (lunarReturn.planetaryPositions) {
      Object.entries(lunarReturn.planetaryPositions).forEach(([planet, position]) => {
        if (planet === 'Moon' && position) {
          themes.push({
            type: 'moon_sign',
            sign: position.sign,
            theme: this._getMoonSignTheme(position.sign)
          });
        }
      });
    }

    // Analyze house placements
    if (lunarReturn.planetaryPositions) {
      Object.entries(lunarReturn.planetaryPositions).forEach(([planet, position]) => {
        if (position && position.house) {
          themes.push({
            type: 'planetary_house',
            planet,
            house: position.house,
            theme: `${planet} in ${this._getHouseArea(position.house)}`
          });
        }
      });
    }

    return themes.slice(0, 6); // Limit to most significant themes
  }

  /**
   * Analyze emotional patterns
   * @param {Object} lunarReturn - Lunar return analysis
   * @returns {Object} Emotional patterns
   * @private
   */
  _analyzeEmotionalPatterns(lunarReturn) {
    const patterns = {
      emotionalTone: 'Balanced',
      sensitivity: 'Moderate',
      intuition: 'Present',
      mood: 'Stable',
      relationships: 'Harmonious'
    };

    // Analyze based on moon sign and aspects
    if (lunarReturn.planetaryPositions?.Moon?.sign) {
      const moonSign = lunarReturn.planetaryPositions.Moon.sign;
      patterns.emotionalTone = this._getEmotionalTone(moonSign);
      patterns.sensitivity = this._getSensitivityLevel(moonSign);
    }

    // Analyze aspects to moon
    if (lunarReturn.aspects) {
      const moonAspects = lunarReturn.aspects.filter(aspect =>
        aspect.transitingPlanet === 'Moon' || aspect.natalPlanet === 'Moon'
      );

      if (moonAspects.length > 0) {
        patterns.intuition = 'Heightened';
        patterns.mood = 'Dynamic';
      }
    }

    return patterns;
  }

  /**
   * Determine monthly focus
   * @param {Object} lunarReturn - Lunar return analysis
   * @returns {Object} Monthly focus areas
   * @private
   */
  _determineMonthlyFocus(lunarReturn) {
    const focus = {
      primary: 'Personal growth',
      secondary: 'Relationships',
      areas: []
    };

    // Determine based on house emphasis
    const houseCounts = {};
    if (lunarReturn.planetaryPositions) {
      Object.values(lunarReturn.planetaryPositions).forEach(pos => {
        if (pos && pos.house) {
          houseCounts[pos.house] = (houseCounts[pos.house] || 0) + 1;
        }
      });
    }

    const maxHouse = Object.entries(houseCounts).sort((a, b) => b[1] - a[1])[0];
    if (maxHouse) {
      focus.primary = this._getHouseFocus(parseInt(maxHouse[0]));
      focus.areas.push(focus.primary);
    }

    // Add secondary focus
    const secondMaxHouse = Object.entries(houseCounts).sort((a, b) => b[1] - a[1])[1];
    if (secondMaxHouse) {
      focus.secondary = this._getHouseFocus(parseInt(secondMaxHouse[0]));
      focus.areas.push(focus.secondary);
    }

    return focus;
  }

  /**
   * Compare two lunar returns
   * @param {Object} return1 - First lunar return
   * @param {Object} return2 - Second lunar return
   * @param {Date} date1 - Date of first return
   * @param {Date} date2 - Date of second return
   * @returns {Object} Comparison analysis
   * @private
   */
  _compareLunarReturns(return1, return2, date1, date2) {
    const comparison = {
      emotionalShift: 'Similar',
      focusChange: 'Consistent',
      planetaryChanges: {},
      themeEvolution: []
    };

    // Compare moon signs
    const moon1 = return1.planetaryPositions?.Moon?.sign;
    const moon2 = return2.planetaryPositions?.Moon?.sign;

    if (moon1 && moon2 && moon1 !== moon2) {
      comparison.emotionalShift = `From ${this._getEmotionalTone(moon1)} to ${this._getEmotionalTone(moon2)}`;
    }

    // Compare house placements
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

  // Helper methods
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
      1: 'personal identity',
      2: 'financial security',
      4: 'home and family',
      5: 'creativity and children',
      6: 'health and service',
      7: 'partnerships',
      8: 'transformation',
      9: 'learning and travel',
      10: 'career and reputation',
      11: 'community and friends',
      12: 'spirituality and inner life'
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
      1: 'Self-development and personal goals',
      2: 'Financial planning and material security',
      4: 'Family and home life',
      5: 'Creativity and self-expression',
      6: 'Health and daily routines',
      7: 'Relationships and partnerships',
      8: 'Personal transformation and growth',
      9: 'Learning and expansion',
      10: 'Career and professional life',
      11: 'Community and social connections',
      12: 'Spiritual development and inner work'
    };
    return focuses[house] || 'Personal development';
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

module.exports = LunarReturnService;