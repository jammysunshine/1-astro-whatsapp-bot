const ServiceTemplate = require('../ServiceTemplate');
const logger = require('../../utils/logger');

// Import calculators from legacy structure (for now)

/**
 * CompatibilityService - Vedic relationship compatibility analysis service
 *
 * Provides comprehensive Vedic compatibility analysis including couple compatibility,
 * synastry analysis, composite charts, and relationship astrology insights
 * using Swiss Ephemeris and astrologer library integration.
 */
class CompatibilityService extends ServiceTemplate {
  constructor() {
    super({
      compatibilityAction: new CompatibilityAction(),
      synastryEngine: new SynastryEngine(),
      compatibilityScorer: new CompatibilityScorer()
    });
    this.serviceName = 'CompatibilityService';
    logger.info('CompatibilityService initialized');
  }

  async processCalculation(compatibilityData) {
    try {
      // Get comprehensive compatibility analysis
      const result = await this.getCompatibilityAnalysis(compatibilityData);
      return result;
    } catch (error) {
      logger.error('CompatibilityService calculation error:', error);
      throw new Error(`Compatibility analysis failed: ${error.message}`);
    }
  }

  formatResult(result) {
    return {
      success: true,
      service: 'Vedic Compatibility Analysis',
      timestamp: new Date().toISOString(),
      data: result,
      disclaimer: '⚠️ *Compatibility Disclaimer:* This analysis provides astrological insights into relationship dynamics. Real relationships involve many factors beyond astrology. Professional counseling is recommended for serious relationship decisions.'
    };
  }

  validate(compatibilityData) {
    if (!compatibilityData) {
      throw new Error('Compatibility data is required');
    }

    if (!compatibilityData.person1 || !compatibilityData.person2) {
      throw new Error('Birth data for both persons is required');
    }

    // Validate person1 data
    this._validatePersonData(compatibilityData.person1, 'person1');

    // Validate person2 data
    this._validatePersonData(compatibilityData.person2, 'person2');

    return true;
  }

  /**
   * Get comprehensive compatibility analysis
   * @param {Object} compatibilityData - Compatibility data for two individuals
   * @returns {Promise<Object>} Compatibility analysis
   */
  async getCompatibilityAnalysis(compatibilityData) {
    try {
      const { person1, person2, analysisType } = compatibilityData;

      // Perform synastry analysis (interchart aspects)
      const synastryAnalysis = await this.calculator.synastryEngine.performSynastryAnalysis(person1, person2);

      // Calculate compatibility score
      const compatibilityScore = await this.calculator.compatibilityScorer.calculateCompatibilityScore(person1, person2);

      // Generate composite chart if requested
      let compositeChart = null;
      if (analysisType === 'full' || analysisType === 'composite') {
        compositeChart = await this._calculateCompositeChart(person1, person2);
      }

      // Get detailed compatibility breakdown
      const detailedBreakdown = await this._getDetailedCompatibilityBreakdown(person1, person2, synastryAnalysis);

      // Generate overall interpretation
      const interpretation = this._generateCompatibilityInterpretation(synastryAnalysis, compatibilityScore, detailedBreakdown);

      return {
        person1: { name: person1.name, birthData: this._sanitizeBirthData(person1) },
        person2: { name: person2.name, birthData: this._sanitizeBirthData(person2) },
        analysisType,
        synastryAnalysis,
        compatibilityScore,
        compositeChart,
        detailedBreakdown,
        interpretation,
        recommendations: this._generateCompatibilityRecommendations(compatibilityScore, detailedBreakdown)
      };
    } catch (error) {
      logger.error('Error getting compatibility analysis:', error);
      throw error;
    }
  }

  /**
   * Calculate composite chart for relationship analysis
   * @param {Object} person1 - First person's birth data
   * @param {Object} person2 - Second person's birth data
   * @returns {Promise<Object>} Composite chart data
   * @private
   */
  async _calculateCompositeChart(person1, person2) {
    try {
      // Use midpoint calculations for composite chart
      const compositePositions = {};

      // Calculate composite planetary positions (midpoints)
      const planets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];

      planets.forEach(planet => {
        if (person1[planet] && person2[planet]) {
          const pos1 = person1[planet].longitude;
          const pos2 = person2[planet].longitude;

          // Calculate midpoint
          let midpoint = (pos1 + pos2) / 2;
          if (Math.abs(pos1 - pos2) > 180) {
            // Handle 0/360 degree crossover
            midpoint = (pos1 + pos2 + 360) / 2;
            if (midpoint >= 360) { midpoint -= 360; }
          }

          compositePositions[planet] = {
            longitude: midpoint,
            sign: this._getZodiacSign(midpoint),
            house: this._getHouseFromLongitude(midpoint, 0) // Ascendant at 0 for composite
          };
        }
      });

      return {
        compositePositions,
        ascendant: this._calculateCompositeAscendant(person1, person2),
        interpretation: 'Composite chart represents the relationship as a third entity with its own planetary influences'
      };
    } catch (error) {
      logger.warn('Could not calculate composite chart:', error.message);
      return null;
    }
  }

  /**
   * Calculate composite ascendant
   * @param {Object} person1 - First person's data
   * @param {Object} person2 - Second person's data
   * @returns {Object} Composite ascendant
   * @private
   */
  _calculateCompositeAscendant(person1, person2) {
    // Simplified composite ascendant calculation
    const asc1 = person1.ascendant?.longitude || 0;
    const asc2 = person2.ascendant?.longitude || 0;

    let compositeAsc = (asc1 + asc2) / 2;
    if (Math.abs(asc1 - asc2) > 180) {
      compositeAsc = (asc1 + asc2 + 360) / 2;
      if (compositeAsc >= 360) { compositeAsc -= 360; }
    }

    return {
      longitude: compositeAsc,
      sign: this._getZodiacSign(compositeAsc)
    };
  }

  /**
   * Get detailed compatibility breakdown
   * @param {Object} person1 - First person's data
   * @param {Object} person2 - Second person's data
   * @param {Object} synastryAnalysis - Synastry analysis results
   * @returns {Promise<Object>} Detailed breakdown
   * @private
   */
  async _getDetailedCompatibilityBreakdown(person1, person2, synastryAnalysis) {
    try {
      // Analyze different compatibility factors
      const breakdown = {
        emotional: this._analyzeEmotionalCompatibility(person1, person2, synastryAnalysis),
        intellectual: this._analyzeIntellectualCompatibility(person1, person2, synastryAnalysis),
        physical: this._analyzePhysicalCompatibility(person1, person2, synastryAnalysis),
        spiritual: this._analyzeSpiritualCompatibility(person1, person2, synastryAnalysis),
        overallHarmony: this._calculateOverallHarmony(synastryAnalysis)
      };

      return breakdown;
    } catch (error) {
      logger.warn('Could not get detailed compatibility breakdown:', error.message);
      return {};
    }
  }

  /**
   * Analyze emotional compatibility
   * @param {Object} person1 - First person's data
   * @param {Object} person2 - Second person's data
   * @param {Object} synastry - Synastry analysis
   * @returns {Object} Emotional compatibility analysis
   * @private
   */
  _analyzeEmotionalCompatibility(person1, person2, synastry) {
    // Analyze Moon aspects and Venus connections
    const moonAspects = synastry.aspects?.filter(aspect =>
      aspect.planets.includes('moon') ||
      (aspect.planets.includes('venus') && aspect.aspect === 'trine')
    ) || [];

    const score = moonAspects.length > 0 ? Math.min(moonAspects.length * 20, 100) : 40;

    return {
      score,
      factors: moonAspects,
      interpretation: score > 70 ? 'Strong emotional connection' :
        score > 50 ? 'Moderate emotional harmony' : 'Emotional challenges to work through'
    };
  }

  /**
   * Analyze intellectual compatibility
   * @param {Object} person1 - First person's data
   * @param {Object} person2 - Second person's data
   * @param {Object} synastry - Synastry analysis
   * @returns {Object} Intellectual compatibility analysis
   * @private
   */
  _analyzeIntellectualCompatibility(person1, person2, synastry) {
    // Analyze Mercury aspects and 3rd/9th house connections
    const mercuryAspects = synastry.aspects?.filter(aspect =>
      aspect.planets.includes('mercury') ||
      aspect.planets.includes('jupiter')
    ) || [];

    const score = mercuryAspects.length > 0 ? Math.min(mercuryAspects.length * 15, 100) : 50;

    return {
      score,
      factors: mercuryAspects,
      interpretation: score > 70 ? 'Excellent intellectual synergy' :
        score > 50 ? 'Good communication and shared interests' : 'Different thinking styles to bridge'
    };
  }

  /**
   * Analyze physical compatibility
   * @param {Object} person1 - First person's data
   * @param {Object} person2 - Second person's data
   * @param {Object} synastry - Synastry analysis
   * @returns {Object} Physical compatibility analysis
   * @private
   */
  _analyzePhysicalCompatibility(person1, person2, synastry) {
    // Analyze Mars-Venus aspects and 5th/7th house connections
    const physicalAspects = synastry.aspects?.filter(aspect =>
      (aspect.planets.includes('mars') && aspect.planets.includes('venus')) ||
      aspect.planets.includes('mars') ||
      aspect.planets.includes('venus')
    ) || [];

    const score = physicalAspects.length > 0 ? Math.min(physicalAspects.length * 25, 100) : 45;

    return {
      score,
      factors: physicalAspects,
      interpretation: score > 70 ? 'Strong physical attraction and harmony' :
        score > 50 ? 'Good physical chemistry' : 'Physical connection may need nurturing'
    };
  }

  /**
   * Analyze spiritual compatibility
   * @param {Object} person1 - First person's data
   * @param {Object} person2 - Second person's data
   * @param {Object} synastry - Synastry analysis
   * @returns {Object} Spiritual compatibility analysis
   * @private
   */
  _analyzeSpiritualCompatibility(person1, person2, synastry) {
    // Analyze Jupiter, Saturn, and Neptune aspects
    const spiritualAspects = synastry.aspects?.filter(aspect =>
      aspect.planets.includes('jupiter') ||
      aspect.planets.includes('saturn') ||
      aspect.planets.includes('neptune')
    ) || [];

    const score = spiritualAspects.length > 0 ? Math.min(spiritualAspects.length * 20, 100) : 55;

    return {
      score,
      factors: spiritualAspects,
      interpretation: score > 70 ? 'Deep spiritual connection and shared values' :
        score > 50 ? 'Compatible life philosophies' : 'Different spiritual paths to respect'
    };
  }

  /**
   * Calculate overall harmony score
   * @param {Object} synastry - Synastry analysis
   * @returns {number} Overall harmony score
   * @private
   */
  _calculateOverallHarmony(synastry) {
    const aspects = synastry.aspects || [];
    const harmoniousAspects = aspects.filter(aspect =>
      ['trine', 'sextile', 'conjunction'].includes(aspect.aspect)
    );
    const challengingAspects = aspects.filter(aspect =>
      ['square', 'opposition'].includes(aspect.aspect)
    );

    const harmonyScore = harmoniousAspects.length * 10 - challengingAspects.length * 5;
    return Math.max(0, Math.min(100, 50 + harmonyScore));
  }

  /**
   * Generate overall compatibility interpretation
   * @param {Object} synastry - Synastry analysis
   * @param {Object} score - Compatibility score
   * @param {Object} breakdown - Detailed breakdown
   * @returns {string} Interpretation
   * @private
   */
  _generateCompatibilityInterpretation(synastry, score, breakdown) {
    let interpretation = '';

    const overallScore = score.overall || 50;

    if (overallScore >= 80) {
      interpretation = 'Excellent compatibility with strong potential for a harmonious and fulfilling relationship. ';
    } else if (overallScore >= 70) {
      interpretation = 'Good compatibility with positive indicators for a successful partnership. ';
    } else if (overallScore >= 60) {
      interpretation = 'Moderate compatibility requiring conscious effort and understanding. ';
    } else if (overallScore >= 50) {
      interpretation = 'Challenging compatibility that may require significant work and compromise. ';
    } else {
      interpretation = 'Difficult compatibility suggesting fundamental differences that may be hard to overcome. ';
    }

    // Add specific insights
    const strongAreas = Object.entries(breakdown)
      .filter(([key, value]) => value.score >= 70)
      .map(([key]) => key);

    const weakAreas = Object.entries(breakdown)
      .filter(([key, value]) => value.score < 50)
      .map(([key]) => key);

    if (strongAreas.length > 0) {
      interpretation += `Strong areas: ${strongAreas.join(', ')}. `;
    }

    if (weakAreas.length > 0) {
      interpretation += `Areas needing attention: ${weakAreas.join(', ')}. `;
    }

    return interpretation;
  }

  /**
   * Generate compatibility recommendations
   * @param {Object} score - Compatibility score
   * @param {Object} breakdown - Detailed breakdown
   * @returns {Object} Recommendations
   * @private
   */
  _generateCompatibilityRecommendations(score, breakdown) {
    const recommendations = {
      overall: '',
      strengths: [],
      challenges: [],
      advice: []
    };

    const overallScore = score.overall || 50;

    if (overallScore >= 70) {
      recommendations.overall = 'This relationship shows strong compatibility potential.';
      recommendations.advice.push('Focus on maintaining open communication and nurturing the natural harmony.');
    } else if (overallScore >= 50) {
      recommendations.overall = 'This relationship has moderate compatibility with room for growth.';
      recommendations.advice.push('Work on understanding and accepting differences while building on common ground.');
    } else {
      recommendations.overall = 'This relationship may face significant challenges.';
      recommendations.advice.push('Consider whether the challenges are worth the effort, or if this relationship serves a different purpose in your life.');
    }

    // Add specific recommendations based on breakdown
    Object.entries(breakdown).forEach(([area, analysis]) => {
      if (analysis.score >= 70) {
        recommendations.strengths.push(`${area}: ${analysis.interpretation}`);
      } else if (analysis.score < 50) {
        recommendations.challenges.push(`${area}: ${analysis.interpretation}`);
        recommendations.advice.push(`For ${area} compatibility: Focus on understanding each other's needs and finding common ground.`);
      }
    });

    return recommendations;
  }

  /**
   * Sanitize birth data for response (remove sensitive info)
   * @param {Object} person - Person's data
   * @returns {Object} Sanitized birth data
   * @private
   */
  _sanitizeBirthData(person) {
    return {
      sunSign: person.sun?.sign,
      moonSign: person.moon?.sign,
      risingSign: person.ascendant?.sign
      // Include other non-sensitive birth info as needed
    };
  }

  /**
   * Get zodiac sign from longitude
   * @param {number} longitude - Longitude in degrees
   * @returns {string} Zodiac sign
   * @private
   */
  _getZodiacSign(longitude) {
    const signs = [
      'Aries', 'Taurus', 'Gemini', 'Cancer',
      'Leo', 'Virgo', 'Libra', 'Scorpio',
      'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    const signIndex = Math.floor(longitude / 30) % 12;
    return signs[signIndex];
  }

  /**
   * Get house from longitude and ascendant
   * @param {number} longitude - Point longitude
   * @param {number} ascendant - Ascendant longitude
   * @returns {number} House number
   * @private
   */
  _getHouseFromLongitude(longitude, ascendant) {
    let relativePosition = longitude - ascendant;
    if (relativePosition < 0) { relativePosition += 360; }
    return Math.floor(relativePosition / 30) + 1;
  }



  /**
   * Validate individual person data
   * @param {Object} person - Person data
   * @param {string} label - Person label for error messages
   * @private
   */
  _validatePersonData(person, label) {
    if (!person.name) {
      throw new Error(`${label} name is required`);
    }

    if (!person.birthDate) {
      throw new Error(`${label} birth date is required`);
    }

    if (!person.birthTime) {
      throw new Error(`${label} birth time is required`);
    }

    if (!person.birthPlace) {
      throw new Error(`${label} birth place is required`);
    }

    // Validate date format
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateRegex.test(person.birthDate)) {
      throw new Error(`${label} birth date must be in DD/MM/YYYY format`);
    }

    // Validate time format
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(person.birthTime)) {
      throw new Error(`${label} birth time must be in HH:MM format`);
    }
  }



  /**
   * Create compatibility summary for quick reference
   * @param {Object} result - Full compatibility analysis
   * @returns {Object} Summary
   * @private
   */
  _createCompatibilitySummary(result) {
    return {
      couple: `${result.person1.name} & ${result.person2.name}`,
      overallScore: result.compatibilityScore.overall || 0,
      compatibility: result.compatibilityScore.overall >= 70 ? 'High' :
        result.compatibilityScore.overall >= 50 ? 'Moderate' : 'Challenging',
      keyStrengths: result.recommendations.strengths.slice(0, 2),
      keyChallenges: result.recommendations.challenges.slice(0, 2),
      overallAdvice: result.recommendations.overall
    };
  }

  getMetadata() {
    return {
      name: this.serviceName,
      version: '1.0.0',
      category: 'vedic',
      methods: ['execute', 'getCompatibilityAnalysis'],
      dependencies: ['CompatibilityAction', 'SynastryEngine', 'CompatibilityScorer']
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

module.exports = CompatibilityService;
