const ServiceTemplate = require('../ServiceTemplate');
const logger = require('../../utils/logger');

// Import calculator from legacy structure (for now)

/**
 * DashaPredictiveService - Vedic dasha timing and predictive analysis service
 *
 * Provides comprehensive Vedic dasha analysis including Vimshottari Dasha periods,
 * planetary influences, timing predictions, and life event forecasting using
 * authentic nakshatra-based calculations with Swiss Ephemeris integration.
 */
class DashaPredictiveService extends ServiceTemplate {
  constructor() {
    super('ChartGenerator');
    this.calculatorPath = '../calculators/ChartGenerator';    this.serviceName = 'DashaPredictiveService';
    logger.info('DashaPredictiveService initialized');
  }

  async ldashaPredictiveCalculation(dashaData) {
    try {
      // Get comprehensive dasha analysis
      const result = await this.getDashaPredictiveAnalysis(dashaData);
      return result;
    } catch (error) {
      logger.error('DashaPredictiveService calculation error:', error);
      throw new Error(`Dasha predictive analysis failed: ${error.message}`);
    }
  }

  formatResult(result) {
    return {
      success: true,
      service: 'Vedic Dasha Predictive Analysis',
      timestamp: new Date().toISOString(),
      data: result,
      disclaimer: '⚠️ *Dasha Disclaimer:* This analysis provides astrological timing insights based on Vedic principles. Life events are influenced by multiple factors. Use this guidance alongside practical planning and professional advice.'
    };
  }

  validate(dashaData) {
    if (!dashaData) {
      throw new Error('Dasha data is required');
    }

    if (!dashaData.birthData) {
      throw new Error('Birth data is required for dasha analysis');
    }

    const { birthData } = dashaData;

    if (!birthData.birthDate) {
      throw new Error('Birth date is required');
    }

    if (!birthData.birthTime) {
      throw new Error('Birth time is required');
    }

    if (!birthData.birthPlace) {
      throw new Error('Birth place is required');
    }

    // Validate date format
    const dateRegex = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
    if (!dateRegex.test(birthData.birthDate)) {
      throw new Error('Birth date must be in DD/MM/YYYY format');
    }

    // Validate time format
    const timeRegex = /^\d{1,2}:\d{1,2}$/;
    if (!timeRegex.test(birthData.birthTime)) {
      throw new Error('Birth time must be in HH:MM format');
    }

    return true;
  }

  /**
   * Get comprehensive dasha predictive analysis
   * @param {Object} dashaData - Dasha data including birth information
   * @returns {Promise<Object>} Dasha predictive analysis
   */
  async getDashaPredictiveAnalysis(dashaData) {
    try {
      const { birthData, analysisType, currentDate } = dashaData;

      // Calculate current dasha period
      const currentDasha = await this.calculator.calculateCurrentDasha(birthData);

      // Calculate upcoming dasha periods
      const upcomingDashas = await this.calculator.calculateUpcomingDashas(birthData, 5); // Next 5 major periods

      // Calculate antardasha (sub-periods) for current mahadasha
      const antardashas = await this.calculator.calculateAntardasha(currentDasha.mahadasha, birthData);

      // Get dasha predictions and influences
      const predictions = await this._getDashaPredictions(currentDasha, upcomingDashas, antardashas);

      // Analyze planetary influences in current period
      const planetaryInfluences = await this._analyzePlanetaryInfluences(currentDasha, birthData);

      // Generate timing insights
      const timingInsights = this._generateTimingInsights(currentDasha, upcomingDashas);

      return {
        birthData: this._sanitizeBirthData(birthData),
        currentDasha,
        upcomingDashas,
        antardashas,
        predictions,
        planetaryInfluences,
        timingInsights,
        analysisType,
        analysisDate: currentDate || new Date().toISOString().split('T')[0]
      };
    } catch (error) {
      logger.error('Error getting dasha predictive analysis:', error);
      throw error;
    }
  }

  /**
   * Get dasha predictions and life insights
   * @param {Object} currentDasha - Current dasha period
   * @param {Array} upcomingDashas - Upcoming dasha periods
   * @param {Array} antardashas - Current antardashas
   * @returns {Promise<Object>} Predictions and insights
   * @private
   */
  async _getDashaPredictions(currentDasha, upcomingDashas, antardashas) {
    try {
      const predictions = {
        currentPeriod: {},
        upcomingPeriods: [],
        keyInsights: [],
        recommendations: []
      };

      // Analyze current mahadasha
      predictions.currentPeriod = {
        planet: currentDasha.mahadasha,
        period: `${currentDasha.startDate} to ${currentDasha.endDate}`,
        remaining: this._calculateRemainingTime(currentDasha.endDate),
        generalInfluence: this._getPlanetGeneralInfluence(currentDasha.mahadasha),
        lifeAreas: this._getPlanetLifeAreas(currentDasha.mahadasha)
      };

      // Analyze current antardasha
      const currentAntardasha = antardashas.find(ad => ad.isCurrent);
      if (currentAntardasha) {
        predictions.currentPeriod.antardasha = {
          planet: currentAntardasha.planet,
          period: `${currentAntardasha.startDate} to ${currentAntardasha.endDate}`,
          influence: this._getPlanetSpecificInfluence(currentAntardasha.planet, currentDasha.mahadasha)
        };
      }

      // Analyze upcoming periods
      upcomingDashas.forEach(dasha => {
        predictions.upcomingPeriods.push({
          planet: dasha.planet,
          period: `${dasha.startDate} to ${dasha.endDate}`,
          duration: this._calculatePeriodDuration(dasha.startDate, dasha.endDate),
          significance: this._getPeriodSignificance(dasha.planet),
          preparation: this._getPreparationAdvice(dasha.planet)
        });
      });

      // Generate key insights
      predictions.keyInsights = this._generateKeyInsights(currentDasha, upcomingDashas);

      // Generate recommendations
      predictions.recommendations = this._generateDashaRecommendations(currentDasha, upcomingDashas);

      return predictions;
    } catch (error) {
      logger.warn('Could not get dasha predictions:', error.message);
      return {};
    }
  }

  /**
   * Analyze planetary influences in current dasha
   * @param {Object} currentDasha - Current dasha data
   * @param {Object} birthData - Birth chart data
   * @returns {Promise<Object>} Planetary influence analysis
   * @private
   */
  async _analyzePlanetaryInfluences(currentDasha, birthData) {
    try {
      const influences = {
        primaryPlanet: {
          name: currentDasha.mahadasha,
          strength: this._calculatePlanetStrength(currentDasha.mahadasha, birthData),
          characteristics: this._getPlanetCharacteristics(currentDasha.mahadasha),
          currentPosition: birthData[currentDasha.mahadasha.toLowerCase()] || {}
        },
        supportingPlanets: [],
        challengingPlanets: [],
        overallEnergy: 'Balanced'
      };

      // Analyze relationships with other planets
      const planetRelationships = this._analyzePlanetRelationships(currentDasha.mahadasha, birthData);

      influences.supportingPlanets = planetRelationships.supporting;
      influences.challengingPlanets = planetRelationships.challenging;
      influences.overallEnergy = planetRelationships.energy;

      return influences;
    } catch (error) {
      logger.warn('Could not analyze planetary influences:', error.message);
      return {};
    }
  }

  /**
   * Generate timing insights from dasha periods
   * @param {Object} currentDasha - Current dasha
   * @param {Array} upcomingDashas - Upcoming dashas
   * @returns {Object} Timing insights
   * @private
   */
  _generateTimingInsights(currentDasha, upcomingDashas) {
    const insights = {
      favorablePeriods: [],
      challengingPeriods: [],
      transitionPeriods: [],
      longTermOutlook: ''
    };

    // Identify favorable periods (benefic planets)
    const beneficPlanets = ['Jupiter', 'Venus', 'Mercury'];
    upcomingDashas.forEach(dasha => {
      if (beneficPlanets.includes(dasha.planet)) {
        insights.favorablePeriods.push({
          planet: dasha.planet,
          period: `${dasha.startDate} to ${dasha.endDate}`,
          focus: this._getBeneficFocus(dasha.planet)
        });
      }
    });

    // Identify challenging periods (malefic planets)
    const maleficPlanets = ['Saturn', 'Mars', 'Rahu', 'Ketu'];
    upcomingDashas.forEach(dasha => {
      if (maleficPlanets.includes(dasha.planet)) {
        insights.challengingPeriods.push({
          planet: dasha.planet,
          period: `${dasha.startDate} to ${dasha.endDate}`,
          lessons: this._getMaleficLessons(dasha.planet)
        });
      }
    });

    // Identify transition periods
    insights.transitionPeriods = upcomingDashas.slice(0, 2).map(dasha => ({
      planet: dasha.planet,
      period: `${dasha.startDate} (transition)`,
      preparation: 'Focus on completion and new beginnings'
    }));

    // Generate long-term outlook
    insights.longTermOutlook = this._generateLongTermOutlook(upcomingDashas);

    return insights;
  }

  /**
   * Calculate remaining time in current period
   * @param {string} endDate - End date of period
   * @returns {string} Remaining time description
   * @private
   */
  _calculateRemainingTime(endDate) {
    try {
      const end = new Date(endDate);
      const now = new Date();
      const diffTime = end - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 30) {
        return `${diffDays} days remaining`;
      } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return `${months} months remaining`;
      } else {
        const years = Math.floor(diffDays / 365);
        const remainingMonths = Math.floor((diffDays % 365) / 30);
        return `${years} years, ${remainingMonths} months remaining`;
      }
    } catch (error) {
      return 'Unknown';
    }
  }

  /**
   * Calculate period duration
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   * @returns {string} Duration description
   * @private
   */
  _calculatePeriodDuration(startDate, endDate) {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = end - start;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 30) {
        return `${diffDays} days`;
      } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return `${months} months`;
      } else {
        const years = Math.floor(diffDays / 365);
        const remainingMonths = Math.floor((diffDays % 365) / 30);
        return `${years} years, ${remainingMonths} months`;
      }
    } catch (error) {
      return 'Unknown';
    }
  }

  /**
   * Get general influence of a planet
   * @param {string} planet - Planet name
   * @returns {string} General influence
   * @private
   */
  _getPlanetGeneralInfluence(planet) {
    const influences = {
      Sun: 'Self-expression, leadership, vitality, authority',
      Moon: 'Emotions, mind, mother, home, intuition',
      Mars: 'Energy, action, courage, conflict, passion',
      Mercury: 'Communication, intellect, learning, adaptability',
      Jupiter: 'Wisdom, expansion, spirituality, prosperity',
      Venus: 'Love, beauty, harmony, relationships, luxury',
      Saturn: 'Discipline, responsibility, karma, structure',
      Rahu: 'Ambition, innovation, foreign influences, materialism',
      Ketu: 'Spirituality, detachment, past life karma, liberation'
    };
    return influences[planet] || 'General planetary influence';
  }

  /**
   * Get life areas influenced by planet
   * @param {string} planet - Planet name
   * @returns {Array} Life areas
   * @private
   */
  _getPlanetLifeAreas(planet) {
    const areas = {
      Sun: ['Career', 'Leadership', 'Health', 'Father'],
      Moon: ['Emotions', 'Home', 'Mother', 'Mind'],
      Mars: ['Energy', 'Conflict', 'Siblings', 'Property'],
      Mercury: ['Communication', 'Education', 'Business', 'Travel'],
      Jupiter: ['Wisdom', 'Wealth', 'Children', 'Spirituality'],
      Venus: ['Relationships', 'Art', 'Luxury', 'Marriage'],
      Saturn: ['Career', 'Discipline', 'Elders', 'Karma'],
      Rahu: ['Ambition', 'Foreign', 'Technology', 'Unconventional'],
      Ketu: ['Spirituality', 'Detachment', 'Past Life', 'Mysticism']
    };
    return areas[planet] || [];
  }

  /**
   * Get specific influence of sub-planet in main planet period
   * @param {string} subPlanet - Sub-planet
   * @param {string} mainPlanet - Main planet
   * @returns {string} Specific influence
   * @private
   */
  _getPlanetSpecificInfluence(subPlanet, mainPlanet) {
    // Simplified combination analysis
    const combinations = {
      'Sun-Mercury': 'Intellectual leadership and communication skills',
      'Moon-Venus': 'Emotional harmony and loving relationships',
      'Mars-Jupiter': 'Courageous expansion and spiritual growth'
      // Add more combinations as needed
    };

    const key = `${mainPlanet}-${subPlanet}`;
    return combinations[key] || `${subPlanet} influence within ${mainPlanet} period`;
  }

  /**
   * Calculate planet strength in birth chart
   * @param {string} planet - Planet name
   * @param {Object} birthData - Birth chart data
   * @returns {string} Strength description
   * @private
   */
  _calculatePlanetStrength(planet, birthData) {
    // Simplified strength calculation
    const planetData = birthData[planet.toLowerCase()];
    if (!planetData) { return 'Unknown'; }

    // Check if planet is in own sign, exalted, etc.
    const { sign } = planetData;
    const strengthFactors = [];

    // Basic strength assessment
    if (this._isOwnSign(planet, sign)) { strengthFactors.push('Own Sign'); }
    if (this._isExalted(planet, sign)) { strengthFactors.push('Exalted'); }
    if (this._isDebilitated(planet, sign)) { strengthFactors.push('Debilitated'); }

    if (strengthFactors.length > 0) {
      return strengthFactors.join(', ');
    }

    return 'Neutral';
  }

  /**
   * Get planet characteristics
   * @param {string} planet - Planet name
   * @returns {Object} Characteristics
   * @private
   */
  _getPlanetCharacteristics(planet) {
    const characteristics = {
      Sun: { element: 'Fire', nature: 'Masculine', caste: 'Kshatriya' },
      Moon: { element: 'Water', nature: 'Feminine', caste: 'Brahmin' },
      Mars: { element: 'Fire', nature: 'Masculine', caste: 'Kshatriya' },
      Mercury: { element: 'Earth', nature: 'Neutral', caste: 'Vaishya' },
      Jupiter: { element: 'Ether', nature: 'Masculine', caste: 'Brahmin' },
      Venus: { element: 'Water', nature: 'Feminine', caste: 'Vaishya' },
      Saturn: { element: 'Air', nature: 'Neutral', caste: 'Shudra' },
      Rahu: { element: 'Air', nature: 'Masculine', caste: 'Outcaste' },
      Ketu: { element: 'Fire', nature: 'Feminine', caste: 'Outcaste' }
    };
    return characteristics[planet] || {};
  }

  /**
   * Analyze planet relationships
   * @param {string} planet - Main planet
   * @param {Object} birthData - Birth data
   * @returns {Object} Relationship analysis
   * @private
   */
  _analyzePlanetRelationships(planet, birthData) {
    // Simplified relationship analysis
    const relationships = {
      supporting: [],
      challenging: [],
      energy: 'Balanced'
    };

    // Basic planetary friendships (simplified)
    const friends = {
      Sun: ['Moon', 'Mars', 'Jupiter'],
      Moon: ['Sun', 'Mercury'],
      Mars: ['Sun', 'Moon', 'Jupiter'],
      Mercury: ['Sun', 'Venus'],
      Jupiter: ['Sun', 'Moon', 'Mars'],
      Venus: ['Mercury', 'Saturn'],
      Saturn: ['Mercury', 'Venus']
    };

    const planetFriends = friends[planet] || [];
    const planetEnemies = this._getPlanetEnemies(planet);

    // Analyze current planetary positions
    Object.keys(birthData).forEach(p => {
      if (p !== planet.toLowerCase() && birthData[p]) {
        const planetName = p.charAt(0).toUpperCase() + p.slice(1);
        if (planetFriends.includes(planetName)) {
          relationships.supporting.push(planetName);
        } else if (planetEnemies.includes(planetName)) {
          relationships.challenging.push(planetName);
        }
      }
    });

    // Determine overall energy
    if (relationships.supporting.length > relationships.challenging.length) {
      relationships.energy = 'Supportive';
    } else if (relationships.challenging.length > relationships.supporting.length) {
      relationships.energy = 'Challenging';
    }

    return relationships;
  }

  /**
   * Get planet enemies
   * @param {string} planet - Planet name
   * @returns {Array} Enemy planets
   * @private
   */
  _getPlanetEnemies(planet) {
    const enemies = {
      Sun: ['Saturn', 'Venus'],
      Moon: ['Rahu', 'Ketu'],
      Mars: ['Mercury'],
      Mercury: ['Moon'],
      Jupiter: ['Mercury', 'Venus'],
      Venus: ['Sun', 'Moon'],
      Saturn: ['Sun', 'Moon', 'Mars']
    };
    return enemies[planet] || [];
  }

  /**
   * Check if planet is in own sign
   * @param {string} planet - Planet name
   * @param {string} sign - Sign name
   * @returns {boolean} Is own sign
   * @private
   */
  _isOwnSign(planet, sign) {
    const ownSigns = {
      Sun: ['Leo'],
      Moon: ['Cancer'],
      Mars: ['Aries', 'Scorpio'],
      Mercury: ['Gemini', 'Virgo'],
      Jupiter: ['Sagittarius', 'Pisces'],
      Venus: ['Taurus', 'Libra'],
      Saturn: ['Capricorn', 'Aquarius']
    };
    return ownSigns[planet]?.includes(sign) || false;
  }

  /**
   * Check if planet is exalted
   * @param {string} planet - Planet name
   * @param {string} sign - Sign name
   * @returns {boolean} Is exalted
   * @private
   */
  _isExalted(planet, sign) {
    const exaltation = {
      Sun: 'Aries',
      Moon: 'Taurus',
      Mars: 'Capricorn',
      Mercury: 'Virgo',
      Jupiter: 'Cancer',
      Venus: 'Pisces',
      Saturn: 'Libra'
    };
    return exaltation[planet] === sign;
  }

  /**
   * Check if planet is debilitated
   * @param {string} planet - Planet name
   * @param {string} sign - Sign name
   * @returns {boolean} Is debilitated
   * @private
   */
  _isDebilitated(planet, sign) {
    const debilitation = {
      Sun: 'Libra',
      Moon: 'Scorpio',
      Mars: 'Cancer',
      Mercury: 'Pisces',
      Jupiter: 'Capricorn',
      Venus: 'Virgo',
      Saturn: 'Aries'
    };
    return debilitation[planet] === sign;
  }

  /**
   * Get period significance
   * @param {string} planet - Planet name
   * @returns {string} Significance
   * @private
   */
  _getPeriodSignificance(planet) {
    const significances = {
      Jupiter: 'Expansion, wisdom, and spiritual growth',
      Saturn: 'Discipline, responsibility, and life lessons',
      Mars: 'Action, energy, and overcoming obstacles',
      Venus: 'Love, harmony, and material comforts',
      Mercury: 'Communication, learning, and adaptability',
      Sun: 'Self-expression and leadership',
      Moon: 'Emotional development and intuition',
      Rahu: 'Ambition and unconventional experiences',
      Ketu: 'Spirituality and detachment'
    };
    return significances[planet] || 'General planetary influence';
  }

  /**
   * Get preparation advice for upcoming period
   * @param {string} planet - Planet name
   * @returns {string} Preparation advice
   * @private
   */
  _getPreparationAdvice(planet) {
    const advice = {
      Jupiter: 'Focus on learning, teaching, and spiritual practices',
      Saturn: 'Build discipline, patience, and long-term planning',
      Mars: 'Channel energy into productive activities and exercise',
      Venus: 'Nurture relationships and creative pursuits',
      Mercury: 'Enhance communication and learning skills',
      Sun: 'Develop leadership and self-confidence',
      Moon: 'Work on emotional balance and intuition',
      Rahu: 'Embrace change and new experiences',
      Ketu: 'Focus on spiritual growth and detachment'
    };
    return advice[planet] || 'Prepare mindfully for the coming influences';
  }

  /**
   * Get benefic focus areas
   * @param {string} planet - Planet name
   * @returns {string} Focus areas
   * @private
   */
  _getBeneficFocus(planet) {
    const focuses = {
      Jupiter: 'Education, travel, and spiritual development',
      Venus: 'Relationships, art, and material comforts',
      Mercury: 'Communication, business, and learning'
    };
    return focuses[planet] || 'Positive growth and opportunities';
  }

  /**
   * Get malefic lessons
   * @param {string} planet - Planet name
   * @returns {string} Lessons
   * @private
   */
  _getMaleficLessons(planet) {
    const lessons = {
      Saturn: 'Patience, responsibility, and karmic balance',
      Mars: 'Self-control, courage, and right action',
      Rahu: 'Discernment and spiritual awareness',
      Ketu: 'Detachment and inner wisdom'
    };
    return lessons[planet] || 'Personal growth through challenges';
  }

  /**
   * Generate key insights from dasha analysis
   * @param {Object} currentDasha - Current dasha
   * @param {Array} upcomingDashas - Upcoming dashas
   * @returns {Array} Key insights
   * @private
   */
  _generateKeyInsights(currentDasha, upcomingDashas) {
    const insights = [];

    // Current period insight
    insights.push(`Current ${currentDasha.mahadasha} Mahadasha focuses on ${this._getPlanetGeneralInfluence(currentDasha.mahadasha).toLowerCase()}`);

    // Next major transition
    if (upcomingDashas.length > 0) {
      const nextDasha = upcomingDashas[0];
      insights.push(`Next major transition to ${nextDasha.planet} period in ${nextDasha.startDate} will bring ${this._getPeriodSignificance(nextDasha.planet).toLowerCase()}`);
    }

    // Long-term pattern
    const nextThree = upcomingDashas.slice(0, 3);
    const pattern = nextThree.map(d => d.planet).join(' → ');
    insights.push(`Three-period pattern: ${pattern} suggests evolving life themes`);

    return insights;
  }

  /**
   * Generate dasha recommendations
   * @param {Object} currentDasha - Current dasha
   * @param {Array} upcomingDashas - Upcoming dashas
   * @returns {Array} Recommendations
   * @private
   */
  _generateDashaRecommendations(currentDasha, upcomingDashas) {
    const recommendations = [];

    // Current period recommendations
    recommendations.push(`During ${currentDasha.mahadasha} period: ${this._getPreparationAdvice(currentDasha.mahadasha)}`);

    // Upcoming period preparation
    if (upcomingDashas.length > 0) {
      const nextDasha = upcomingDashas[0];
      recommendations.push(`Prepare for ${nextDasha.planet} period: ${this._getPreparationAdvice(nextDasha.planet)}`);
    }

    // General advice
    recommendations.push('Track progress monthly and adjust activities based on planetary influences');
    recommendations.push('Use meditation and spiritual practices to align with planetary energies');

    return recommendations;
  }

  /**
   * Generate long-term outlook
   * @param {Array} upcomingDashas - Upcoming dashas
   * @returns {string} Long-term outlook
   * @private
   */
  _generateLongTermOutlook(upcomingDashas) {
    if (upcomingDashas.length < 3) { return 'Insufficient data for long-term outlook'; }

    const nextThree = upcomingDashas.slice(0, 3);
    const dominantEnergy = this._analyzeDominantEnergy(nextThree);

    return `The next three major periods suggest ${dominantEnergy} with opportunities for ${this._getGrowthAreas(nextThree)}`;
  }

  /**
   * Analyze dominant energy in periods
   * @param {Array} dashas - Dasha periods
   * @returns {string} Dominant energy
   * @private
   */
  _analyzeDominantEnergy(dashas) {
    const energies = dashas.map(d => this._getEnergyType(d.planet));
    const energyCount = energies.reduce((acc, energy) => {
      acc[energy] = (acc[energy] || 0) + 1;
      return acc;
    }, {});

    const dominant = Object.entries(energyCount).sort(([, a], [, b]) => b - a)[0][0];
    return dominant;
  }

  /**
   * Get energy type of planet
   * @param {string} planet - Planet name
   * @returns {string} Energy type
   * @private
   */
  _getEnergyType(planet) {
    const energies = {
      Sun: 'leadership and self-expression',
      Moon: 'emotional and nurturing',
      Mars: 'action and courage',
      Mercury: 'intellectual and communicative',
      Jupiter: 'expansive and wise',
      Venus: 'harmonious and creative',
      Saturn: 'disciplined and responsible',
      Rahu: 'ambitious and innovative',
      Ketu: 'spiritual and detached'
    };
    return energies[planet] || 'balanced';
  }

  /**
   * Get growth areas from dashas
   * @param {Array} dashas - Dasha periods
   * @returns {string} Growth areas
   * @private
   */
  _getGrowthAreas(dashas) {
    const areas = dashas.flatMap(d => this._getPlanetLifeAreas(d.planet));
    const uniqueAreas = [...new Set(areas)];
    return uniqueAreas.slice(0, 3).join(', ').toLowerCase();
  }

  /**
   * Sanitize birth data for response
   * @param {Object} birthData - Full birth data
   * @returns {Object} Sanitized birth data
   * @private
   */
  _sanitizeBirthData(birthData) {
    return {
      date: birthData.birthDate,
      time: birthData.birthTime,
      place: birthData.birthPlace,
      // Include calculated positions if available
      sunSign: birthData.sun?.sign,
      moonSign: birthData.moon?.sign
      // Add other relevant info
    };
  }


  /**
   * Create dasha summary for quick reference
   * @param {Object} result - Full dasha analysis
   * @returns {Object} Summary
   * @private
   */
  _createDashaSummary(result) {
    return {
      currentMahadasha: result.currentDasha.mahadasha,
      remainingTime: result.predictions.currentPeriod.remaining,
      nextMajorPeriod: result.upcomingDashas.length > 0 ? {
        planet: result.upcomingDashas[0].planet,
        startDate: result.upcomingDashas[0].startDate
      } : null,
      dominantTheme: this._getPlanetGeneralInfluence(result.currentDasha.mahadasha),
      keyTiming: result.timingInsights.favorablePeriods.length > 0 ?
        result.timingInsights.favorablePeriods[0] : null
    };
  }

  getMetadata() {
    return {
      name: this.serviceName,
      version: '1.0.0',
      category: 'vedic',
      methods: ['execute', 'getDashaPredictiveAnalysis'],
      dependencies: ['DashaAnalysisCalculator']
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

module.exports = DashaPredictiveService;
