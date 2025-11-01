const logger = require('../../../utils/logger');

/**
 * VedicCalculator - Main Vedic Astrology Calculator
 * Aggregates functionality from various specialized calculators
 */
class VedicCalculator {
  constructor() {
    this.initialized = false;
    logger.info('VedicCalculator initialized');
  }

  /**
   * Initialize the calculator with required modules
   */
  async initialize() {
    if (this.initialized) {
      return;
    }

    try {
      // Import specialized calculators dynamically to avoid circular dependencies
      this.birthChart = require('./ChartGenerator');
      this.dasha = require('./DashaAnalysisCalculator');
      this.transits = require('./TransitCalculator');
      this.yogas = require('./VedicYogasCalculator');
      this.retrogrades = require('./RetrogradeCalculator') || {};
      this.cosmic = require('./CosmicEventsCalculator');

      this.initialized = true;
      logger.info('VedicCalculator modules loaded successfully');
    } catch (error) {
      logger.error('Error initializing VedicCalculator:', error);
      throw error;
    }
  }

  /**
   * Calculate birth chart with all components
   */
  async calculateBirthChart(birthData) {
    await this.initialize();
    return await this.birthChart.calculate(birthData);
  }

  /**
   * Calculate current dasha periods
   */
  async calculateCurrentDasha(birthData) {
    await this.initialize();
    return await this.dasha.calculateCurrentDasha(birthData);
  }

  /**
   * Calculate current transits
   */
  async calculateCurrentTransits(birthData) {
    await this.initialize();
    return await this.transits.calculate(birthData);
  }

  /**
   * Calculate Vedic yogas
   */
  async calculateVedicYogas(birthData) {
    await this.initialize();
    return await this.yogas.calculate(birthData);
  }

  /**
   * Calculate cosmic events
   */
  async calculateCosmicEvents(birthData, daysAhead = 30) {
    await this.initialize();
    return await this.cosmic.calculateCosmicEvents(birthData, daysAhead);
  }

  /**
   * Calculate Gochar (transits) - main method for transit analysis
   */
  async calculateGochar(birthData, options = {}) {
    try {
      await this.initialize();

      const { currentDate = new Date(), aspects = true, houses = true } = options;

      // Get current planetary positions
      const currentTransits = await this.calculateCurrentTransits({
        ...birthData,
        currentDate
      });

      // Calculate aspects if requested
      let transitAspects = null;
      if (aspects) {
        transitAspects = await this._calculateTransitAspects(birthData, currentTransits);
      }

      // Calculate house transits if requested
      let houseTransits = null;
      if (houses) {
        houseTransits = await this._calculateHouseTransits(birthData, currentTransits);
      }

      return {
        currentDate: currentDate.toISOString(),
        planetaryPositions: currentTransits,
        aspects: transitAspects,
        houseTransits: houseTransits,
        analysis: this._analyzeTransits(currentTransits, transitAspects, houseTransits)
      };
    } catch (error) {
      logger.error('Error calculating Gochar:', error);
      throw new Error(`Gochar calculation failed: ${error.message}`);
    }
  }

  /**
   * Calculate transit aspects
   * @private
   */
  async _calculateTransitAspects(birthData, currentTransits) {
    // Simplified aspect calculation
    const aspects = [];
    const planets = Object.keys(currentTransits);

    for (let i = 0; i < planets.length; i++) {
      for (let j = i + 1; j < planets.length; j++) {
        const planet1 = planets[i];
        const planet2 = planets[j];

        const angle = Math.abs(currentTransits[planet1].longitude - currentTransits[planet2].longitude);
        const normalizedAngle = Math.min(angle, 360 - angle);

        // Check for major aspects
        if (normalizedAngle <= 10) { // Conjunction
          aspects.push({
            planets: [planet1, planet2],
            aspect: 'Conjunction',
            orb: normalizedAngle,
            influence: 'Intensified energy and combined effects'
          });
        } else if (Math.abs(normalizedAngle - 60) <= 8) { // Sextile
          aspects.push({
            planets: [planet1, planet2],
            aspect: 'Sextile',
            orb: Math.abs(normalizedAngle - 60),
            influence: 'Harmonious opportunities and cooperation'
          });
        } else if (Math.abs(normalizedAngle - 90) <= 8) { // Square
          aspects.push({
            planets: [planet1, planet2],
            aspect: 'Square',
            orb: Math.abs(normalizedAngle - 90),
            influence: 'Tension and challenges requiring action'
          });
        } else if (Math.abs(normalizedAngle - 120) <= 8) { // Trine
          aspects.push({
            planets: [planet1, planet2],
            aspect: 'Trine',
            orb: Math.abs(normalizedAngle - 120),
            influence: 'Natural flow and beneficial circumstances'
          });
        } else if (Math.abs(normalizedAngle - 180) <= 8) { // Opposition
          aspects.push({
            planets: [planet1, planet2],
            aspect: 'Opposition',
            orb: Math.abs(normalizedAngle - 180),
            influence: 'Balance and integration of opposing forces'
          });
        }
      }
    }

    return aspects;
  }

  /**
   * Calculate house transits
   * @private
   */
  async _calculateHouseTransits(birthData, currentTransits) {
    // This would require birth chart house cusps
    // Simplified implementation
    const houseTransits = [];

    Object.entries(currentTransits).forEach(([planet, data]) => {
      // Determine which house the planet is transiting
      const house = Math.floor(data.longitude / 30) + 1;
      houseTransits.push({
        planet,
        house,
        sign: this._getSignFromLongitude(data.longitude),
        influence: this._getHouseTransitInfluence(planet, house)
      });
    });

    return houseTransits;
  }

  /**
   * Analyze transits comprehensively
   * @private
   */
  _analyzeTransits(planetaryPositions, aspects, houseTransits) {
    const analysis = {
      summary: '',
      keyInfluences: [],
      recommendations: [],
      intensity: 'moderate'
    };

    // Analyze planetary positions
    const activePlanets = Object.entries(planetaryPositions)
      .filter(([planet, data]) => data.speed < 0) // Retrograde planets
      .map(([planet]) => planet);

    if (activePlanets.length > 0) {
      analysis.keyInfluences.push(`Retrograde planets: ${activePlanets.join(', ')} - Review and reassess`);
    }

    // Analyze aspects
    if (aspects && aspects.length > 0) {
      const challengingAspects = aspects.filter(a => ['Square', 'Opposition'].includes(a.aspect));
      const harmoniousAspects = aspects.filter(a => ['Trine', 'Sextile'].includes(a.aspect));

      if (challengingAspects.length > 0) {
        analysis.intensity = 'high';
        analysis.keyInfluences.push(`${challengingAspects.length} challenging aspects - Growth opportunities`);
      }

      if (harmoniousAspects.length > 0) {
        analysis.keyInfluences.push(`${harmoniousAspects.length} harmonious aspects - Favorable conditions`);
      }
    }

    // Generate summary
    analysis.summary = `Current transits show ${analysis.intensity} activity. ${analysis.keyInfluences.length > 0 ? analysis.keyInfluences[0] : 'Planetary movements are in a transitional phase.'}`;

    // Generate recommendations
    analysis.recommendations = [
      'Monitor planetary movements and their effects on your life',
      'Pay attention to areas of life ruled by transiting planets',
      'Use harmonious transits to advance important goals',
      'Be patient during challenging transits - they bring growth'
    ];

    return analysis;
  }

  /**
   * Get zodiac sign from longitude
   * @private
   */
  _getSignFromLongitude(longitude) {
    const signs = [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    return signs[Math.floor(longitude / 30)];
  }

  /**
   * Get house transit influence
   * @private
   */
  _getHouseTransitInfluence(planet, house) {
    const influences = {
      1: 'Self, personality, new beginnings',
      2: 'Finances, values, self-worth',
      3: 'Communication, siblings, short journeys',
      4: 'Home, family, emotional foundation',
      5: 'Creativity, children, romance',
      6: 'Health, service, daily routine',
      7: 'Partnerships, marriage, relationships',
      8: 'Transformation, shared resources, intimacy',
      9: 'Higher learning, travel, philosophy',
      10: 'Career, reputation, public life',
      11: 'Friends, groups, hopes and wishes',
      12: 'Spirituality, endings, subconscious'
    };

    return `${planet} transiting house ${house}: ${influences[house] || 'General life areas'}`;
  }

  /**
   * Health check for VedicCalculator
   * @returns {Object} Health status
   */
  healthCheck() {
    return {
      healthy: true,
      version: '1.0.0',
      name: 'VedicCalculator',
      calculations: [
        'Birth Chart Analysis',
        'Dasha Periods',
        'Current Transits',
        'Vedic Yogas',
        'Cosmic Events',
        'Gochar Analysis'
      ],
      status: 'Operational'
    };
  }
}

module.exports = VedicCalculator;