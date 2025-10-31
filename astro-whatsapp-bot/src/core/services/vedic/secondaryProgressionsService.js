const ServiceTemplate = require('../ServiceTemplate');
const logger = require('../../utils/logger');

// Import calculator from legacy structure (for now)

/**
 * SecondaryProgressionsService - Service for secondary progressions analysis
 * Provides age-based planetary progression analysis showing life themes and timing
 * using Swiss Ephemeris integration for precise secondary progression calculations.
 */
class SecondaryProgressionsService extends ServiceTemplate {
  constructor() {
    super('secondaryProgressionsService');
    this.serviceName = 'SecondaryProgressionsService';
    logger.info('SecondaryProgressionsService initialized');
  }

  async lsecondaryProgressionsCalculation(data) {
    try {
      const { birthData } = data;
      // Calculate secondary progressions using calculator
      const result = await this.calculator.calculateEnhancedSecondaryProgressions(birthData);
      return result;
    } catch (error) {
      logger.error('SecondaryProgressionsService calculation error:', error);
      throw new Error(`Secondary progressions analysis failed: ${error.message}`);
    }
  }

  formatResult(result) {
    return {
      success: true,
      service: 'Secondary Progressions Analysis',
      timestamp: new Date().toISOString(),
      data: result,
      disclaimer: 'Secondary progressions show day-for-year life progression. Each day after birth represents one year of life, revealing developmental themes and timing. Results should be considered alongside other astrological techniques.'
    };
  }

  validate(data) {
    if (!data || !data.birthData) {
      throw new Error('Birth data is required');
    }

    const { birthDate, birthTime, birthPlace } = data.birthData;

    if (!birthDate || typeof birthDate !== 'string') {
      throw new Error('Valid birth date is required');
    }

    if (!birthTime || typeof birthTime !== 'string') {
      throw new Error('Valid birth time is required');
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
   * Get current age progressions (convenience method)
   * @param {Object} birthData - Birth data
   * @returns {Promise<Object>} Current age progressions
   */
  async getCurrentAgeProgressions(birthData) {
    try {
      const today = new Date();
      const progressionDate = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;

      return await this.execute(birthData, progressionDate);
    } catch (error) {
      logger.error('SecondaryProgressionsService getCurrentAgeProgressions error:', error);
      return {
        error: true,
        message: 'Error calculating current age progressions'
      };
    }
  }

  /**
   * Get progressions for specific age
   * @param {Object} birthData - Birth data
   * @param {number} targetAge - Target age for progression analysis
   * @returns {Promise<Object>} Progressions for specific age
   */
  async getProgressionsForAge(birthData, targetAge) {
    try {
      this._validateInput(birthData);

      if (!targetAge || targetAge < 0 || targetAge > 120) {
        throw new Error('Valid target age (0-120) is required');
      }

      // Calculate birth date plus target age
      const [birthDay, birthMonth, birthYear] = birthData.birthDate.split('/').map(Number);
      const progressionYear = birthYear + targetAge;
      const progressionDate = `${birthDay}/${birthMonth}/${progressionYear}`;

      return await this.execute(birthData, progressionDate);
    } catch (error) {
      logger.error('SecondaryProgressionsService getProgressionsForAge error:', error);
      return {
        error: true,
        message: `Error calculating progressions for age ${targetAge}`
      };
    }
  }

  /**
   * Get life themes from progressions
   * @param {Object} birthData - Birth data
   * @param {string} progressionDate - Progression date
   * @returns {Promise<Object>} Life themes and patterns
   */
  async getLifeThemes(birthData, progressionDate = null) {
    try {
      const progressions = await this.execute(birthData, progressionDate);

      if (progressions.error) {
        return progressions;
      }

      const themes = this._extractLifeThemes(progressions.progressions);
      const patterns = this._identifyLifePatterns(progressions.progressions);
      const timing = this._analyzeTiming(progressions.progressions);

      return {
        themes,
        patterns,
        timing,
        currentAge: progressions.currentAge || 'Unknown',
        error: false
      };
    } catch (error) {
      logger.error('SecondaryProgressionsService getLifeThemes error:', error);
      return {
        error: true,
        message: 'Error extracting life themes from progressions'
      };
    }
  }

  /**
   * Compare progressions between ages
   * @param {Object} birthData - Birth data
   * @param {number} age1 - First age
   * @param {number} age2 - Second age
   * @returns {Promise<Object>} Progression comparison
   */
  async compareProgressions(birthData, age1, age2) {
    try {
      this._validateInput(birthData);

      const progressions1 = await this.getProgressionsForAge(birthData, age1);
      const progressions2 = await this.getProgressionsForAge(birthData, age2);

      if (progressions1.error || progressions2.error) {
        return {
          error: true,
          message: 'Error calculating progressions for comparison'
        };
      }

      const comparison = this._compareProgressionCharts(
        progressions1.progressions,
        progressions2.progressions,
        age1,
        age2
      );

      return {
        comparison,
        age1: { age: age1, progressions: progressions1.progressions },
        age2: { age: age2, progressions: progressions2.progressions },
        error: false
      };
    } catch (error) {
      logger.error('SecondaryProgressionsService compareProgressions error:', error);
      return {
        error: true,
        message: 'Error comparing progressions'
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
      methods: ['execute', 'getCurrentAgeProgressions', 'getProgressionTimeline', 'compareProgressionAges'],
      dependencies: ['SecondaryProgressionsCalculator']
    };
  }

  /**
   * Extract life themes from progressions
   * @param {Object} progressions - Progressions data
   * @returns {Array} Key life themes
   * @private
   */
  _extractLifeThemes(progressions) {
    const themes = [];

    // Analyze progressed planetary positions
    if (progressions.progressedPlanets) {
      Object.entries(progressions.progressedPlanets).forEach(([planet, position]) => {
        if (position && position.sign) {
          themes.push({
            planet,
            sign: position.sign,
            house: position.house,
            theme: this._getProgressedPlanetTheme(planet, position.sign)
          });
        }
      });
    }

    // Analyze major aspects
    if (progressions.aspects) {
      const majorAspects = progressions.aspects.filter(aspect =>
        aspect.aspect === 'Conjunction' || aspect.aspect === 'Opposition' ||
        aspect.aspect === 'Trine' || aspect.aspect === 'Square'
      );

      majorAspects.forEach(aspect => {
        themes.push({
          type: 'aspect',
          aspect: `${aspect.planet1} ${aspect.aspect} ${aspect.planet2}`,
          theme: this._getAspectTheme(aspect),
          significance: this._getAspectSignificance(aspect.aspect)
        });
      });
    }

    return themes.slice(0, 8); // Limit to most significant themes
  }

  /**
   * Identify life patterns from progressions
   * @param {Object} progressions - Progressions data
   * @returns {Object} Life patterns
   * @private
   */
  _identifyLifePatterns(progressions) {
    const patterns = {
      developmental: 'Gradual growth',
      challenges: [],
      opportunities: [],
      cycles: []
    };

    // Analyze planetary movements
    if (progressions.progressedPlanets) {
      const planetMovements = Object.entries(progressions.progressedPlanets);

      // Identify planets changing signs (major life shifts)
      planetMovements.forEach(([planet, position]) => {
        if (position && position.signChange) {
          patterns.challenges.push(`${planet} entering ${position.sign} - Major life transition`);
        }
      });

      // Identify planets in angular houses (active periods)
      planetMovements.forEach(([planet, position]) => {
        if (position && [1, 4, 7, 10].includes(position.house)) {
          patterns.opportunities.push(`${planet} in ${position.house}th house - Active life period`);
        }
      });
    }

    // Identify developmental cycles
    if (progressions.currentAge) {
      const age = progressions.currentAge;
      if (age >= 0 && age < 12) patterns.cycles.push('Foundation building (ages 0-12)');
      else if (age >= 12 && age < 30) patterns.cycles.push('Identity formation (ages 12-30)');
      else if (age >= 30 && age < 50) patterns.cycles.push('Career and family building (ages 30-50)');
      else if (age >= 50) patterns.cycles.push('Wisdom and legacy (ages 50+)');
    }

    return patterns;
  }

  /**
   * Analyze timing from progressions
   * @param {Object} progressions - Progressions data
   * @returns {Object} Timing analysis
   * @private
   */
  _analyzeTiming(progressions) {
    const timing = {
      currentPhase: 'Developmental',
      upcomingChanges: [],
      criticalPeriods: [],
      opportunities: []
    };

    // Analyze current age phase
    if (progressions.currentAge) {
      const age = progressions.currentAge;
      timing.currentPhase = this._getAgePhase(age);
    }

    // Identify upcoming planetary ingresses
    if (progressions.upcomingIngresses) {
      progressions.upcomingIngresses.forEach(ingress => {
        timing.upcomingChanges.push({
          event: `${ingress.planet} enters ${ingress.sign}`,
          timing: `Age ${ingress.age}`,
          significance: this._getIngressSignificance(ingress)
        });
      });
    }

    // Identify critical aspects
    if (progressions.aspects) {
      const criticalAspects = progressions.aspects.filter(aspect =>
        aspect.aspect === 'Square' || aspect.aspect === 'Opposition'
      );

      criticalAspects.forEach(aspect => {
        timing.criticalPeriods.push({
          aspect: `${aspect.planet1} ${aspect.aspect} ${aspect.planet2}`,
          theme: 'Challenge and growth opportunity'
        });
      });
    }

    return timing;
  }

  /**
   * Compare two progression charts
   * @param {Object} progressions1 - First progressions
   * @param {Object} progressions2 - Second progressions
   * @param {number} age1 - Age for first progressions
   * @param {number} age2 - Age for second progressions
   * @returns {Object} Comparison analysis
   * @private
   */
  _compareProgressionCharts(progressions1, progressions2, age1, age2) {
    const comparison = {
      planetaryMovements: {},
      themeEvolution: [],
      lifeStageChanges: []
    };

    // Compare planetary positions
    if (progressions1.progressedPlanets && progressions2.progressedPlanets) {
      Object.keys(progressions1.progressedPlanets).forEach(planet => {
        const pos1 = progressions1.progressedPlanets[planet];
        const pos2 = progressions2.progressedPlanets[planet];

        if (pos1 && pos2 && pos1.sign !== pos2.sign) {
          comparison.planetaryMovements[planet] = {
            from: `${pos1.sign} (age ${age1})`,
            to: `${pos2.sign} (age ${age2})`,
            change: 'Sign change indicating life shift'
          };
        }
      });
    }

    // Analyze theme evolution
    const themes1 = this._extractLifeThemes(progressions1);
    const themes2 = this._extractLifeThemes(progressions2);

    comparison.themeEvolution = [
      { age: age1, themes: themes1.slice(0, 3) },
      { age: age2, themes: themes2.slice(0, 3) }
    ];

    // Life stage changes
    comparison.lifeStageChanges = [
      { age: age1, stage: this._getAgePhase(age1) },
      { age: age2, stage: this._getAgePhase(age2) }
    ];

    return comparison;
  }

  // Helper methods
  _getProgressedPlanetTheme(planet, sign) {
    const themes = {
      Sun: `Identity and life purpose in ${sign} style`,
      Moon: `Emotional nature and home life in ${sign} manner`,
      Mars: `Energy and action in ${sign} approach`,
      Mercury: `Communication and thinking in ${sign} way`,
      Jupiter: `Growth and expansion through ${sign} philosophy`,
      Venus: `Love and values expressed in ${sign} fashion`,
      Saturn: `Responsibility and structure in ${sign} discipline`,
      Uranus: `Innovation and change through ${sign} revolution`,
      Neptune: `Spirituality and dreams in ${sign} imagination`,
      Pluto: `Transformation and power in ${sign} intensity`
    };
    return themes[planet] || `${planet} influence in ${sign}`;
  }

  _getAspectTheme(aspect) {
    const themes = {
      Conjunction: 'Unity and focus',
      Opposition: 'Balance and integration',
      Trine: 'Harmony and flow',
      Square: 'Challenge and growth',
      Sextile: 'Opportunity and support'
    };
    return themes[aspect.aspect] || 'Planetary relationship';
  }

  _getAspectSignificance(aspect) {
    const significance = {
      Conjunction: 'High - Major life focus',
      Opposition: 'High - Integration needed',
      Trine: 'Medium - Natural harmony',
      Square: 'High - Growth opportunity',
      Sextile: 'Medium - Support available'
    };
    return significance[aspect.aspect] || 'Moderate significance';
  }

  _getAgePhase(age) {
    if (age >= 0 && age < 12) return 'Foundation and learning';
    if (age >= 12 && age < 21) return 'Identity and exploration';
    if (age >= 21 && age < 35) return 'Establishment and building';
    if (age >= 35 && age < 50) return 'Mastery and contribution';
    if (age >= 50 && age < 65) return 'Wisdom and reflection';
    return 'Legacy and completion';
  }

  _getIngressSignificance(ingress) {
    const significances = {
      Sun: 'Major life direction change',
      Moon: 'Emotional life shift',
      Mars: 'Energy and action change',
      Mercury: 'Communication and learning shift',
      Jupiter: 'Growth and opportunity expansion',
      Venus: 'Love and values change',
      Saturn: 'Responsibility and structure shift',
      Uranus: 'Innovation and freedom change',
      Neptune: 'Spirituality and imagination shift',
      Pluto: 'Transformation and power change'
    };
    return significances[ingress.planet] || 'Life area change';
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

module.exports = SecondaryProgressionsService;