const ServiceTemplate = require('../ServiceTemplate');
const logger = require('../../utils/logger');

// Import calculator from legacy structure (for now)

/**
 * SolarArcDirectionsService - Service for solar arc directions analysis
 * Provides day-for-year predictive astrology showing lifetime progression and timing
 * using Swiss Ephemeris integration for precise solar arc calculations.
 */
class SolarArcDirectionsService extends ServiceTemplate {
  constructor() {
    super('SolarArcDirectionsCalculator');
    this.calculatorPath = '../calculators/SolarArcDirectionsCalculator';
    this.serviceName = 'SolarArcDirectionsService';
    logger.info('SolarArcDirectionsService initialized');
  }

  async processCalculation(data) {
    try {
      const { birthData, targetDate } = data;
      // Calculate solar arc directions using calculator
      const result = await this.calculator.calculateSolarArcDirections(
        birthData,
        targetDate
      );
      return result;
    } catch (error) {
      logger.error('SolarArcDirectionsService calculation error:', error);
      throw new Error(`Solar arc directions analysis failed: ${error.message}`);
    }
  }

  formatResult(result) {
    return {
      success: true,
      service: 'Solar Arc Directions Analysis',
      timestamp: new Date().toISOString(),
      data: result,
      disclaimer:
        'Solar arc directions provide predictive insights based on day-for-year progression. Results should be considered alongside other astrological techniques and personal circumstances.'
    };
  }

  validate(data) {
    if (!data || !data.birthData) {
      throw new Error('Birth data is required');
    }
    const validatedData = new BirthData(data.birthData);
    validatedData.validate();
  }

  /**
   * Get current age solar arcs (convenience method)
   * @param {Object} birthData - Birth data
   * @returns {Promise<Object>} Current age solar arcs
   */
  async getCurrentAgeSolarArcs(birthData) {
    try {
      const today = new Date();
      return await this.execute(birthData, today);
    } catch (error) {
      logger.error(
        'SolarArcDirectionsService getCurrentAgeSolarArcs error:',
        error
      );
      return {
        error: true,
        message: 'Error calculating current age solar arcs'
      };
    }
  }

  /**
   * Get solar arcs for specific age
   * @param {Object} birthData - Birth data
   * @param {number} targetAge - Target age for solar arc analysis
   * @returns {Promise<Object>} Solar arcs for specific age
   */
  async getSolarArcsForAge(birthData, targetAge) {
    try {
      this._validateInput(birthData);

      if (!targetAge || targetAge < 0 || targetAge > 120) {
        throw new Error('Valid target age (0-120) is required');
      }

      // Calculate birth date plus target age
      const [birthDay, birthMonth, birthYear] = birthData.birthDate
        .split('/')
        .map(Number);
      const targetYear = birthYear + targetAge;
      const targetDate = new Date(targetYear, birthMonth - 1, birthDay);

      return await this.execute(birthData, targetDate);
    } catch (error) {
      logger.error(
        'SolarArcDirectionsService getSolarArcsForAge error:',
        error
      );
      return {
        error: true,
        message: `Error calculating solar arcs for age ${targetAge}`
      };
    }
  }

  /**
   * Get lifetime progression themes
   * @param {Object} birthData - Birth data
   * @param {Date|string} targetDate - Target date for analysis
   * @returns {Promise<Object>} Lifetime progression themes
   */
  async getLifetimeProgression(birthData, targetDate = null) {
    try {
      const solarArcs = await this.execute(birthData, targetDate);

      if (solarArcs.error) {
        return solarArcs;
      }

      const progression = this._analyzeProgression(solarArcs.solarArcs);
      const themes = this._extractLifetimeThemes(solarArcs.solarArcs);
      const criticalPeriods = this._identifyCriticalPeriods(
        solarArcs.solarArcs
      );

      return {
        progression,
        themes,
        criticalPeriods,
        currentAge: solarArcs.currentAge || 'Unknown',
        error: false
      };
    } catch (error) {
      logger.error(
        'SolarArcDirectionsService getLifetimeProgression error:',
        error
      );
      return {
        error: true,
        message: 'Error analyzing lifetime progression'
      };
    }
  }

  /**
   * Compare solar arcs between ages
   * @param {Object} birthData - Birth data
   * @param {number} age1 - First age
   * @param {number} age2 - Second age
   * @returns {Promise<Object>} Solar arc comparison
   */
  async compareSolarArcs(birthData, age1, age2) {
    try {
      this._validateInput(birthData);

      const arcs1 = await this.getSolarArcsForAge(birthData, age1);
      const arcs2 = await this.getSolarArcsForAge(birthData, age2);

      if (arcs1.error || arcs2.error) {
        return {
          error: true,
          message: 'Error calculating solar arcs for comparison'
        };
      }

      const comparison = this._compareSolarArcCharts(
        arcs1.solarArcs,
        arcs2.solarArcs,
        age1,
        age2
      );

      return {
        comparison,
        age1: { age: age1, solarArcs: arcs1.solarArcs },
        age2: { age: age2, solarArcs: arcs2.solarArcs },
        error: false
      };
    } catch (error) {
      logger.error('SolarArcDirectionsService compareSolarArcs error:', error);
      return {
        error: true,
        message: 'Error comparing solar arcs'
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

  getMetadata() {
    return {
      name: this.serviceName,
      version: '1.0.0',
      category: 'vedic',
      methods: [
        'execute',
        'getCurrentAgeSolarArcs',
        'getSolarArcProgression',
        'compareSolarArcAges'
      ],
      dependencies: ['SolarArcDirectionsCalculator']
    };
  }

  /**
   * Analyze progression from solar arcs
   * @param {Object} solarArcs - Solar arcs data
   * @returns {Object} Progression analysis
   * @private
   */
  _analyzeProgression(solarArcs) {
    const progression = {
      currentPhase: 'Developmental',
      directionalMovement: 'Forward',
      lifeAreas: [],
      intensity: 'Moderate'
    };

    // Analyze directed planetary positions
    if (solarArcs.directedPlanets) {
      Object.entries(solarArcs.directedPlanets).forEach(
        ([planet, position]) => {
          if (position && position.house) {
            progression.lifeAreas.push({
              planet,
              house: position.house,
              area: this._getHouseLifeArea(position.house)
            });
          }
        }
      );
    }

    // Determine current life phase
    if (solarArcs.currentAge) {
      const age = solarArcs.currentAge;
      progression.currentPhase = this._getLifePhase(age);
    }

    // Analyze aspect intensity
    if (solarArcs.aspects) {
      const aspectCount = solarArcs.aspects.length;
      if (aspectCount > 5) {
        progression.intensity = 'High';
      } else if (aspectCount < 2) {
        progression.intensity = 'Low';
      }
    }

    return progression;
  }

  /**
   * Extract lifetime themes from solar arcs
   * @param {Object} solarArcs - Solar arcs data
   * @returns {Array} Key lifetime themes
   * @private
   */
  _extractLifetimeThemes(solarArcs) {
    const themes = [];

    // Analyze directed planetary positions
    if (solarArcs.directedPlanets) {
      Object.entries(solarArcs.directedPlanets).forEach(
        ([planet, position]) => {
          if (position && position.sign) {
            themes.push({
              planet,
              sign: position.sign,
              theme: this._getDirectedPlanetTheme(planet, position.sign)
            });
          }
        }
      );
    }

    // Analyze major aspects
    if (solarArcs.aspects) {
      const majorAspects = solarArcs.aspects.filter(
        aspect =>
          aspect.aspect === 'Conjunction' ||
          aspect.aspect === 'Opposition' ||
          aspect.aspect === 'Square' ||
          aspect.aspect === 'Trine'
      );

      majorAspects.forEach(aspect => {
        themes.push({
          type: 'aspect',
          aspect: `${aspect.planet1} ${aspect.aspect} ${aspect.planet2}`,
          theme: this._getDirectedAspectTheme(aspect),
          significance: this._getAspectSignificance(aspect.aspect)
        });
      });
    }

    return themes.slice(0, 8); // Limit to most significant themes
  }

  /**
   * Identify critical periods from solar arcs
   * @param {Object} solarArcs - Solar arcs data
   * @returns {Array} Critical periods
   * @private
   */
  _identifyCriticalPeriods(solarArcs) {
    const criticalPeriods = [];

    // Identify directed planets changing signs
    if (solarArcs.directedPlanets) {
      Object.entries(solarArcs.directedPlanets).forEach(
        ([planet, position]) => {
          if (position && position.signChange) {
            criticalPeriods.push({
              type: 'sign_change',
              planet,
              newSign: position.sign,
              significance: 'Major life transition',
              timing: `Age ${solarArcs.currentAge || 'Unknown'}`
            });
          }
        }
      );
    }

    // Identify challenging aspects
    if (solarArcs.aspects) {
      const challengingAspects = solarArcs.aspects.filter(
        aspect => aspect.aspect === 'Square' || aspect.aspect === 'Opposition'
      );

      challengingAspects.forEach(aspect => {
        criticalPeriods.push({
          type: 'challenging_aspect',
          aspect: `${aspect.planet1} ${aspect.aspect} ${aspect.planet2}`,
          significance: 'Growth opportunity',
          theme: 'Challenge and transformation'
        });
      });
    }

    return criticalPeriods.slice(0, 5);
  }

  /**
   * Compare two solar arc charts
   * @param {Object} arcs1 - First solar arcs
   * @param {Object} arcs2 - Second solar arcs
   * @param {number} age1 - Age for first arcs
   * @param {number} age2 - Age for second arcs
   * @returns {Object} Comparison analysis
   * @private
   */
  _compareSolarArcCharts(arcs1, arcs2, age1, age2) {
    const comparison = {
      planetaryMovements: {},
      themeEvolution: [],
      lifePhaseTransition: []
    };

    // Compare directed planetary positions
    if (arcs1.directedPlanets && arcs2.directedPlanets) {
      Object.keys(arcs1.directedPlanets).forEach(planet => {
        const pos1 = arcs1.directedPlanets[planet];
        const pos2 = arcs2.directedPlanets[planet];

        if (pos1 && pos2 && pos1.sign !== pos2.sign) {
          comparison.planetaryMovements[planet] = {
            from: `${pos1.sign} (age ${age1})`,
            to: `${pos2.sign} (age ${age2})`,
            change: 'Directed sign change indicating life evolution'
          };
        }
      });
    }

    // Analyze theme evolution
    const themes1 = this._extractLifetimeThemes(arcs1);
    const themes2 = this._extractLifetimeThemes(arcs2);

    comparison.themeEvolution = [
      { age: age1, themes: themes1.slice(0, 3) },
      { age: age2, themes: themes2.slice(0, 3) }
    ];

    // Life phase transitions
    comparison.lifePhaseTransition = [
      { age: age1, phase: this._getLifePhase(age1) },
      { age: age2, phase: this._getLifePhase(age2) }
    ];

    return comparison;
  }

  // Helper methods
  _getHouseLifeArea(house) {
    const areas = {
      1: 'Personal identity and self-presentation',
      2: 'Financial resources and material security',
      4: 'Home and family foundations',
      5: 'Creativity and self-expression',
      6: 'Health and daily routines',
      7: 'Partnerships and relationships',
      8: 'Transformation and shared resources',
      9: 'Higher learning and expansion',
      10: 'Career and public reputation',
      11: 'Community and social connections',
      12: 'Spirituality and inner development'
    };
    return areas[house] || 'General life area';
  }

  _getLifePhase(age) {
    if (age >= 0 && age < 21) {
      return 'Foundation and learning';
    }
    if (age >= 21 && age < 35) {
      return 'Establishment and growth';
    }
    if (age >= 35 && age < 50) {
      return 'Mastery and contribution';
    }
    if (age >= 50 && age < 70) {
      return 'Wisdom and reflection';
    }
    return 'Legacy and completion';
  }

  _getDirectedPlanetTheme(planet, sign) {
    const themes = {
      Sun: `Life direction and purpose through ${sign} energy`,
      Moon: `Emotional development in ${sign} style`,
      Mars: `Action and drive directed toward ${sign} goals`,
      Mercury: `Communication and learning focused on ${sign} topics`,
      Jupiter: `Growth and expansion through ${sign} philosophy`,
      Venus: `Love and values directed toward ${sign} harmony`,
      Saturn: `Responsibility and achievement in ${sign} discipline`,
      Uranus: `Innovation and change through ${sign} revolution`,
      Neptune: `Spirituality and imagination in ${sign} dreams`,
      Pluto: `Transformation and power through ${sign} intensity`
    };
    return themes[planet] || `${planet} directed through ${sign}`;
  }

  _getDirectedAspectTheme(aspect) {
    const themes = {
      Conjunction: 'Focused energy and new beginnings',
      Opposition: 'Balance and integration of opposites',
      Trine: 'Harmonious flow and natural talents',
      Square: 'Challenge and growth through effort',
      Sextile: 'Opportunity and supportive circumstances'
    };
    return themes[aspect.aspect] || 'Directed planetary relationship';
  }

  _getAspectSignificance(aspect) {
    const significance = {
      Conjunction: 'High - Major life focus',
      Opposition: 'High - Integration required',
      Trine: 'Medium - Natural harmony',
      Square: 'High - Growth catalyst',
      Sextile: 'Medium - Support available'
    };
    return significance[aspect.aspect] || 'Moderate significance';
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

module.exports = SolarArcDirectionsService;
