const ServiceTemplate = require('../ServiceTemplate');
const logger = require('../../../utils/logger');
const { BirthData } = require('../../models');

/**
 * SolarReturnService - Service for solar return chart analysis
 *
 * Provides annual birthday astrology analysis showing themes and influences for the coming year
 * using Swiss Ephemeris integration for precise solar return calculations.
 */
class SolarReturnService extends ServiceTemplate {
  constructor() {
    super('SolarReturnCalculator'); // Primary calculator for this service
    this.serviceName = 'SolarReturnService';
    this.calculatorPath =
      '../../../services/astrology/vedic/calculators/SolarReturnCalculator';
    logger.info('SolarReturnService initialized');
  }

  /**
   * Main calculation method for Solar Return analysis.
   * @param {Object} data - Input data containing birthData, targetYear, and location.
   * @returns {Promise<Object>} Raw solar return result.
   */
  async processCalculation(data) {
    try {
      // Ensure calculator is loaded
      if (!this.calculator) {
        await this.initialize();
      }

      this._validateInput(data);

      const { birthData, targetYear, location } = data;

      // Use current year if not specified
      const year = targetYear || new Date().getFullYear();

      // Calculate solar return using calculator
      const result = await this.calculator.calculateSolarReturn(
        birthData,
        year,
        location
      );
      return { ...result, year };
    } catch (error) {
      logger.error('SolarReturnService processCalculation error:', error);
      throw new Error(`Solar return analysis failed: ${error.message}`);
    }
  }

  /**
   * Formats the solar return result for consistent output.
   * @param {Object} result - Raw calculator result.
   * @returns {Object} Formatted solar return result.
   */
  formatResult(result) {
    const { year, ...analysisData } = result;
    return {
      success: true,
      data: analysisData,
      summary: analysisData.summary || 'Solar return analysis completed',
      metadata: {
        serviceName: this.serviceName,
        calculationType: 'Solar Return Analysis',
        timestamp: new Date().toISOString(),
        analysisYear: year
      },
      disclaimer:
        'Solar return charts show the astrological influences for the year ahead from birthday to birthday. The solar return Sun represents the individual\'s life direction for that year. Results should be considered alongside other astrological techniques.'
    };
  }

  /**
   * Validates input data for solar return calculation.
   * @param {Object} input - Input data to validate.
   * @private
   */
  _validateInput(input) {
    if (!input || !input.birthData) {
      throw new Error('Birth data is required for Solar Return analysis.');
    }
    const validatedData = new BirthData(input.birthData);
    validatedData.validate();
  }

  /**
   * Gets current year solar return (convenience method).
   * @param {Object} birthData - Birth data.
   * @param {string} location - Location for calculation (optional).
   * @returns {Promise<Object>} Current year solar return.
   */
  async getCurrentYearSolarReturn(birthData, location = null) {
    try {
      const currentYear = new Date().getFullYear();
      return await this.execute({
        birthData,
        targetYear: currentYear,
        location
      });
    } catch (error) {
      logger.error(
        'SolarReturnService getCurrentYearSolarReturn error:',
        error
      );
      return {
        error: true,
        message: 'Error calculating current year solar return'
      };
    }
  }

  /**
   * Gets next year solar return (preview).
   * @param {Object} birthData - Birth data.
   * @param {string} location - Location for calculation (optional).
   * @returns {Promise<Object>} Next year solar return preview.
   */
  async getNextYearSolarReturn(birthData, location = null) {
    try {
      const nextYear = new Date().getFullYear() + 1;
      return await this.execute({ birthData, targetYear: nextYear, location });
    } catch (error) {
      logger.error('SolarReturnService getNextYearSolarReturn error:', error);
      return {
        error: true,
        message: 'Error calculating next year solar return'
      };
    }
  }

  /**
   * Compares solar returns between years.
   * @param {Object} birthData - Birth data.
   * @param {number} year1 - First year.
   * @param {number} year2 - Second year.
   * @param {string} location - Location for calculation (optional).
   * @returns {Promise<Object>} Solar return comparison.
   */
  async compareSolarReturns(birthData, year1, year2, location = null) {
    try {
      this._validateInput({ birthData });

      const return1 = await this.calculator.calculateSolarReturn(
        birthData,
        year1,
        location
      );
      const return2 = await this.calculator.calculateSolarReturn(
        birthData,
        year2,
        location
      );

      const comparison = this._compareSolarReturnCharts(
        return1,
        return2,
        year1,
        year2
      );

      return {
        comparison,
        year1: { year: year1, analysis: return1 },
        year2: { year: year2, analysis: return2 },
        error: false
      };
    } catch (error) {
      logger.error('SolarReturnService compareSolarReturns error:', error);
      return {
        error: true,
        message: 'Error comparing solar returns'
      };
    }
  }

  /**
   * Gets solar return themes and predictions.
   * @param {Object} birthData - Birth data.
   * @param {number} targetYear - Year for analysis.
   * @param {string} location - Location for calculation (optional).
   * @returns {Promise<Object>} Solar return themes and predictions.
   */
  async getSolarReturnThemes(birthData, targetYear = null, location = null) {
    try {
      const year = targetYear || new Date().getFullYear();
      const solarReturn = await this.calculator.calculateSolarReturn(
        birthData,
        year,
        location
      );

      const themes = this._extractThemes(solarReturn);
      const predictions = this._generatePredictions(solarReturn, year);

      return {
        themes,
        predictions,
        year,
        error: false
      };
    } catch (error) {
      logger.error('SolarReturnService getSolarReturnThemes error:', error);
      return {
        error: true,
        message: 'Error extracting solar return themes'
      };
    }
  }

  /**
   * Compares two solar return charts.
   * @param {Object} return1 - First solar return.
   * @param {Object} return2 - Second solar return.
   * @param {number} year1 - Year of first return.
   * @param {number} year2 - Year of second return.
   * @returns {Object} Comparison analysis.
   * @private
   */
  _compareSolarReturnCharts(return1, return2, year1, year2) {
    const comparison = {
      planetaryChanges: {},
      houseChanges: {},
      aspectChanges: [],
      themeEvolution: []
    };

    if (return1.planetaryPositions && return2.planetaryPositions) {
      Object.keys(return1.planetaryPositions).forEach(planet => {
        const pos1 = return1.planetaryPositions[planet];
        const pos2 = return2.planetaryPositions[planet];

        if (pos1 && pos2 && pos1.sign !== pos2.sign) {
          comparison.planetaryChanges[planet] = {
            from: `${pos1.sign} (${year1})`,
            to: `${pos2.sign} (${year2})`,
            change: 'Sign change'
          };
        }
      });
    }

    if (return1.houses && return2.houses) {
      for (let i = 1; i <= 12; i++) {
        const house1 = return1.houses[i];
        const house2 = return2.houses[i];

        if (house1 && house2 && house1.sign !== house2.sign) {
          comparison.houseChanges[i] = {
            from: `${house1.sign} (${year1})`,
            to: `${house2.sign} (${year2})`,
            significance: this._getHouseSignificance(i)
          };
        }
      }
    }
    return comparison;
  }

  /**
   * Extracts themes from solar return chart.
   * @param {Object} solarReturn - Solar return analysis.
   * @returns {Array} Key themes.
   * @private
   */
  _extractThemes(solarReturn) {
    const themes = [];

    if (solarReturn.planetaryPositions) {
      Object.entries(solarReturn.planetaryPositions).forEach(
        ([planet, position]) => {
          if (position && position.house) {
            themes.push({
              planet,
              house: position.house,
              theme: this._getHouseTheme(position.house),
              emphasis: this._getPlanetaryEmphasis(planet)
            });
          }
        }
      );
    }

    const angularHouses = [1, 4, 7, 10];
    const angularPlanets = themes.filter(t => angularHouses.includes(t.house));

    if (angularPlanets.length > 0) {
      themes.push({
        type: 'angular',
        planets: angularPlanets.map(p => p.planet),
        theme: 'Major life focus and external circumstances'
      });
    }
    return themes.slice(0, 8);
  }

  /**
   * Generates predictions from solar return.
   * @param {Object} solarReturn - Solar return analysis.
   * @param {number} year - Year of solar return.
   * @returns {Object} Predictions by life area.
   * @private
   */
  _generatePredictions(solarReturn, year) {
    return {
      career: this._predictCareer(solarReturn),
      relationships: this._predictRelationships(solarReturn),
      finance: this._predictFinance(solarReturn),
      health: this._predictHealth(solarReturn),
      personal: this._predictPersonal(solarReturn),
      year,
      summary: `Solar return for ${year} indicates ${this._getOverallTone(solarReturn)} period with focus on ${this._getMainFocus(solarReturn)}.`
    };
  }

  // Helper methods
  _getHouseSignificance(house) {
    const significances = {
      1: 'Personal identity and self-presentation',
      2: 'Financial resources and self-worth',
      4: 'Home and family foundations',
      5: 'Creativity and children',
      6: 'Health and daily routines',
      7: 'Partnerships and relationships',
      8: 'Transformation and shared resources',
      9: 'Higher learning and travel',
      10: 'Career and public reputation',
      11: 'Friends and community',
      12: 'Spirituality and inner life'
    };
    return significances[house] || 'General life area';
  }

  _getHouseTheme(house) {
    const themes = {
      1: 'Personal growth and new beginnings',
      2: 'Financial stability and material security',
      4: 'Family matters and home life',
      5: 'Creativity and self-expression',
      6: 'Health and service to others',
      7: 'Partnerships and relationships',
      8: 'Transformation and deep change',
      9: 'Learning and expansion',
      10: 'Career and achievement',
      11: 'Community and friendships',
      12: 'Spirituality and inner work'
    };
    return themes[house] || 'General development';
  }

  _getPlanetaryEmphasis(planet) {
    const emphases = {
      Sun: 'Identity and life force',
      Moon: 'Emotions and nurturing',
      Mars: 'Action and energy',
      Mercury: 'Communication and learning',
      Jupiter: 'Growth and opportunity',
      Venus: 'Love and harmony',
      Saturn: 'Structure and responsibility',
      Uranus: 'Innovation and change',
      Neptune: 'Spirituality and dreams',
      Pluto: 'Transformation and power'
    };
    return emphases[planet] || 'General influence';
  }

  _getOverallTone(solarReturn) {
    const planetCount = Object.keys(
      solarReturn.planetaryPositions || {}
    ).length;
    if (planetCount > 5) {
      return 'active and dynamic';
    }
    return 'stable and developmental';
  }

  _getMainFocus(solarReturn) {
    const houseCounts = {};
    if (solarReturn.planetaryPositions) {
      Object.values(solarReturn.planetaryPositions).forEach(pos => {
        if (pos && pos.house) {
          houseCounts[pos.house] = (houseCounts[pos.house] || 0) + 1;
        }
      });
    }
    const maxHouse = Object.entries(houseCounts).sort((a, b) => b[1] - a[1])[0];
    return maxHouse ?
      this._getHouseTheme(parseInt(maxHouse[0])) :
      'personal development';
  }

  _predictCareer(solarReturn) {
    return 'Career development with opportunities for advancement and recognition';
  }
  _predictRelationships(solarReturn) {
    return 'Relationship growth and meaningful connections';
  }
  _predictFinance(solarReturn) {
    return 'Financial stability with potential for growth';
  }
  _predictHealth(solarReturn) {
    return 'Focus on well-being and healthy lifestyle choices';
  }
  _predictPersonal(solarReturn) {
    return 'Personal growth and self-discovery';
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
        'getCurrentYearSolarReturn',
        'getNextYearSolarReturn',
        'compareSolarReturns',
        'getSolarReturnThemes'
      ],
      dependencies: [], // Managed by ServiceTemplate
      description:
        'Service for solar return chart analysis and yearly predictions.'
    };
  }

  /**
   * Returns help information for the service.
   * @returns {string} Help text.
   */
  getHelp() {
    return `
☀️ **Solar Return Service - Your Annual Astrological Forecast**

**Purpose:** Provides annual birthday astrology analysis showing themes and influences for the coming year, using Swiss Ephemeris integration for precise solar return calculations.

**Required Inputs:**
• Birth data (Object with birthDate, birthTime, birthPlace)
• Optional: Target year (number, defaults to current year)
• Optional: Location (Object with latitude, longitude, timezone, for relocation analysis)

**Analysis Includes:**
• **Solar Return Chart:** A chart cast for the exact moment the Sun returns to its natal position each year.
• **Yearly Themes:** Insights into the dominant energies and focus areas for the year ahead.
• **Planetary Influences:** How planets in the Solar Return chart impact different life areas.
• **Predictions:** Forecasts for career, relationships, finance, health, and personal growth.
• **Comparison:** Ability to compare Solar Returns between different years.

**Example Usage:**
"Get my Solar Return analysis for the current year."
"What are the themes for my next year's Solar Return?"
"Compare my Solar Returns for 2024 and 2025."

**Output Format:**
Comprehensive report with Solar Return chart details, yearly themes, predictions, and guidance.
    `.trim();
  }
}

module.exports = SolarReturnService;
