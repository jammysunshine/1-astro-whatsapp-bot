const ServiceTemplate = require('../ServiceTemplate');
const logger = require('../../../utils/logger');
const { validateCoordinates, validateDateTime } = require('../../../utils/validation');

/**
 * GocharService - Service for planetary transit analysis (Gochar)
 *
 * Implements planetary transit analysis for predictive astrology, examining current planetary
 * positions relative to natal charts and their effects on different life areas.
 */
class GocharService extends ServiceTemplate {
  constructor() {
    super('VedicCalculator'); // Primary calculator for this service
    this.serviceName = 'GocharService';
    this.calculatorPath = '../../../services/astrology/vedic/calculators/VedicCalculator';
    logger.info('GocharService initialized');
  }

  /**
   * Main calculation method for Gochar (planetary transit) analysis.
   * @param {Object} userData - User's birth data and current transit parameters.
   * @param {string} userData.datetime - Current datetime for transit chart (ISO string).
   * @param {number} userData.latitude - Current latitude.
   * @param {number} userData.longitude - Current longitude.
   * @param {string} userData.birthDatetime - User's birth datetime (ISO string).
   * @param {number} userData.birthLatitude - User's birth latitude.
   * @param {number} userData.birthLongitude - User's birth longitude.
   * @param {Object} [options] - Additional options for calculation.
   * @returns {Promise<Object>} Comprehensive Gochar analysis.
   */
  async processCalculation(userData, options = {}) {
    try {
      // Ensure calculator is loaded
      if (!this.calculator) {
        await this.initialize();
      }

      this._validateInput(userData);

      const { datetime, latitude, longitude, birthDatetime, birthLatitude, birthLongitude } = userData;

      const transitChart = await this._getCurrentTransits(datetime, latitude, longitude);
      const natalChart = await this._getNatalChart(birthDatetime, birthLatitude, birthLongitude);

      const transitAspects = this._calculateTransitAspects(transitChart, natalChart);
      const houseTransits = this._calculateHouseTransits(transitChart, natalChart);
      const retrogradeEffects = this._calculateRetrogradeEffects(transitChart);
      const majorPeriods = this._calculateMajorTransitPeriods(transitChart, natalChart);

      const analysis = {
        transitAspects,
        houseTransits,
        retrogradeEffects,
        majorPeriods,
        interpretations: this._generateInterpretations({
          transitAspects,
          houseTransits,
          retrogradeEffects,
          majorPeriods
        })
      };

      return analysis;

    } catch (error) {
      logger.error('GocharService processCalculation error:', error);
      throw new Error(`Gochar calculation failed: ${error.message}`);
    }
  }

  /**
   * Validates input data for Gochar analysis.
   * @param {Object} userData - User data to validate.
   * @private
   */
  _validateInput(userData) {
    if (!userData) {
      throw new Error('User data is required for Gochar analysis.');
    }
    const { datetime, latitude, longitude, birthDatetime, birthLatitude, birthLongitude } = userData;
    validateDateTime(datetime);
    validateCoordinates(latitude, longitude);
    validateDateTime(birthDatetime);
    validateCoordinates(birthLatitude, birthLongitude);
  }

  /**
   * Calculates current planetary positions.
   * @param {string} datetime - Current datetime.
   * @param {number} latitude - Current latitude.
   * @param {number} longitude - Current longitude.
   * @returns {Promise<Object>} Current transit chart.
   * @private
   */
  async _getCurrentTransits(datetime, latitude, longitude) {
    return await this.calculator.calculateChart(datetime, latitude, longitude);
  }

  /**
   * Calculates natal chart positions.
   * @param {string} birthDatetime - Birth datetime.
   * @param {number} birthLatitude - Birth latitude.
   * @param {number} birthLongitude - Birth longitude.
   * @returns {Promise<Object>} Natal chart.
   * @private
   */
  async _getNatalChart(birthDatetime, birthLatitude, birthLongitude) {
    return await this.calculator.calculateChart(birthDatetime, birthLatitude, birthLongitude);
  }

  /**
   * Calculates transit aspects to natal positions.
   * @param {Object} transitChart - Current transit chart.
   * @param {Object} natalChart - Natal chart.
   * @returns {Array<Object>} List of transit aspects.
   * @private
   */
  _calculateTransitAspects(transitChart, natalChart) {
    const aspects = [];
    const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

    for (const transitPlanet of planets) {
      const transitLong = transitChart[transitPlanet.toLowerCase()];

      for (const natalPlanet of planets) {
        const natalLong = natalChart[natalPlanet.toLowerCase()];
        const aspect = this._calculateAspect(transitLong, natalLong);

        if (aspect.aspect !== 'none') {
          aspects.push({
            transitPlanet,
            natalPlanet,
            aspect: aspect.aspect,
            orb: aspect.orb,
            strength: aspect.strength,
            type: this._getAspectType(transitPlanet, natalPlanet, aspect.aspect)
          });
        }
      }
    }
    return aspects;
  }

  /**
   * Calculates aspect between two longitudes.
   * @param {number} long1 - Longitude of first planet.
   * @param {number} long2 - Longitude of second planet.
   * @returns {Object} Aspect details.
   * @private
   */
  _calculateAspect(long1, long2) {
    const diff = Math.abs(long1 - long2);
    const normalizedDiff = diff > 180 ? 360 - diff : diff;

    const aspects = [
      { type: 'conjunction', angle: 0, orb: 8 },
      { type: 'opposition', angle: 180, orb: 8 },
      { type: 'trine', angle: 120, orb: 8 },
      { type: 'square', angle: 90, orb: 8 },
      { type: 'sextile', angle: 60, orb: 6 }
    ];

    for (const aspect of aspects) {
      const angleDiff = Math.abs(normalizedDiff - aspect.angle);
      if (angleDiff <= aspect.orb) {
        return {
          aspect: aspect.type,
          orb: angleDiff,
          strength: Math.max(0, 100 - (angleDiff / aspect.orb) * 100)
        };
      }
    }
    return { aspect: 'none', orb: 0, strength: 0 };
  }

  /**
   * Gets aspect type interpretation.
   * @param {string} transitPlanet - Transiting planet.
   * @param {string} natalPlanet - Natal planet.
   * @param {string} aspect - Aspect type.
   * @returns {string} Interpretation.
   * @private
   */
  _getAspectType(transitPlanet, natalPlanet, aspect) {
    const benefic = ['Jupiter', 'Venus', 'Mercury'];
    // const malefic = ['Mars', 'Saturn', 'Rahu', 'Ketu']; // Not used in current logic

    const isTransitBenefic = benefic.includes(transitPlanet);
    // const isNatalBenefic = benefic.includes(natalPlanet); // Not used in current logic

    const aspectTypes = {
      conjunction: isTransitBenefic ? 'benefic' : 'malefic',
      trine: 'benefic',
      sextile: 'benefic',
      square: 'malefic',
      opposition: 'challenging'
    };
    return aspectTypes[aspect] || 'neutral';
  }

  /**
   * Calculates house transits.
   * @param {Object} transitChart - Current transit chart.
   * @param {Object} natalChart - Natal chart.
   * @returns {Array<Object>} List of house transits.
   * @private
   */
  _calculateHouseTransits(transitChart, natalChart) {
    const houseTransits = [];
    const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
    const natalAscendant = natalChart.ascendant;

    for (const planet of planets) {
      const transitLong = transitChart[planet.toLowerCase()];
      const transitHouse = this._getLongitudeHouse(transitLong, natalAscendant);

      houseTransits.push({
        planet,
        house: transitHouse,
        sign: this._getLongitudeSign(transitLong),
        effects: this._getHouseTransitEffects(planet, transitHouse)
      });
    }
    return houseTransits;
  }

  /**
   * Gets house from longitude based on natal ascendant.
   * @param {number} longitude - Planet longitude.
   * @param {number} ascendant - Natal ascendant longitude.
   * @returns {number} House number.
   * @private
   */
  _getLongitudeHouse(longitude, ascendant) {
    const normalizedLong = longitude >= ascendant ? longitude - ascendant : longitude + 360 - ascendant;
    return Math.floor(normalizedLong / 30) + 1;
  }

  /**
   * Gets sign from longitude.
   * @param {number} longitude - Planet longitude.
   * @returns {string} Zodiac sign.
   * @private
   */
  _getLongitudeSign(longitude) {
    const signs = [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    return signs[Math.floor(longitude / 30) % 12];
  }

  /**
   * Gets house transit effects.
   * @param {string} planet - Planet name.
   * @param {number} house - House number.
   * @returns {string} Effects description.
   * @private
   */
  _getHouseTransitEffects(planet, house) {
    const effects = {
      1: {
        Sun: 'New beginnings, self-focus, leadership opportunities',
        Moon: 'Emotional changes, domestic focus, intuition heightened',
        Mars: 'Energy boost, initiative, potential conflicts',
        Mercury: 'Communication focus, learning, mental activity',
        Jupiter: 'Growth opportunities, optimism, expansion',
        Venus: 'Pleasure, relationships, aesthetic enjoyment',
        Saturn: 'Responsibilities, discipline, life lessons',
        Rahu: 'Unconventional approaches, desires, obsession',
        Ketu: 'Spiritual focus, detachment, past connections'
      },
      2: {
        Sun: 'Financial focus, values clarification, self-worth',
        Moon: 'Emotional security, family finances, comfort needs',
        Mars: 'Financial action, impulsive spending, conflicts over values',
        Mercury: 'Financial planning, communication about money',
        Jupiter: 'Financial growth, opportunities, abundance',
        Venus: 'Financial pleasure, luxury acquisition, relationship values',
        Saturn: 'Financial discipline, long-term planning, restrictions',
        Rahu: 'Unusual financial opportunities, speculation',
        Ketu: 'Financial detachment, spiritual values, loss and gain'
      },
      3: {
        Sun: 'Communication focus, learning, sibling interactions',
        Moon: 'Emotional communication, short trips, mental activity',
        Mars: 'Assertive communication, debates, travel',
        Mercury: 'Mental stimulation, writing, teaching',
        Jupiter: 'Learning expansion, optimistic communication',
        Venus: 'Harmonious communication, social connections',
        Saturn: 'Serious communication, learning challenges',
        Rahu: 'Unusual communication, technology, networking',
        Ketu: 'Spiritual communication, intuitive insights'
      },
      4: {
        Sun: 'Home focus, family matters, property',
        Moon: 'Emotional security, domestic harmony, nurturing',
        Mars: 'Home renovations, family conflicts, energy at home',
        Mercury: 'Home communication, property matters',
        Jupiter: 'Home expansion, family growth, property opportunities',
        Venus: 'Home beautification, family harmony',
        Saturn: 'Home responsibilities, property restrictions',
        Rahu: 'Unusual home situations, relocation',
        Ketu: 'Spiritual home life, ancestral connections'
      },
      5: {
        Sun: 'Creative expression, romance, children',
        Moon: 'Emotional creativity, romantic feelings',
        Mars: 'Creative energy, romantic passion, competitive activities',
        Mercury: 'Creative communication, intellectual pursuits',
        Jupiter: 'Creative expansion, romance, children's growth',
        Venus: 'Romance, artistic expression, pleasure',
        Saturn: 'Creative discipline, romantic challenges',
        Rahu: 'Unusual romance, unconventional creativity',
        Ketu: 'Spiritual creativity, detachment from romance'
      },
      6: {
        Sun: 'Health focus, work routines, service',
        Moon: 'Emotional health, daily routines, service to others',
        Mars: 'Physical energy, work conflicts, health issues',
        Mercury: 'Work communication, health analysis',
        Jupiter: 'Work expansion, health improvement, service opportunities',
        Venus: 'Work harmony, pleasant routines',
        Saturn: 'Work discipline, health challenges, responsibility',
        Rahu: 'Unusual work situations, health concerns',
        Ketu: 'Spiritual service, health detachment'
      },
      7: {
        Sun: 'Relationship focus, partnerships, public interactions',
        Moon: 'Emotional relationships, partnership harmony',
        Mars: 'Relationship conflicts, assertiveness in partnerships',
        Mercury: 'Partnership communication, negotiations',
        Jupiter: 'Relationship growth, partnership opportunities',
        Venus: 'Harmonious relationships, partnership pleasure',
        Saturn: 'Relationship responsibilities, commitment challenges',
        Rahu: 'Unusual relationships, partnership obsession',
        Ketu: 'Spiritual partnerships, relationship detachment'
      },
      8: {
        Sun: 'Transformation, shared resources, intimacy',
        Moon: 'Emotional transformation, deep connections',
        Mars: 'Intense transformation, conflicts over resources',
        Mercury: 'Deep communication, research, investigation',
        Jupiter: 'Resource expansion, transformation opportunities',
        Venus: 'Pleasurable intimacy, shared resources',
        Saturn: 'Transformation challenges, resource restrictions',
        Rahu: 'Intense transformation, obsession',
        Ketu: 'Spiritual transformation, detachment'
      },
      9: {
        Sun: 'Higher learning, philosophy, travel',
        Moon: 'Emotional growth, spiritual seeking',
        Mars: 'Assertive beliefs, adventurous travel',
        Mercury: 'Higher education, philosophical communication',
        Jupiter: 'Wisdom expansion, long-distance travel',
        Venus: 'Pleasurable travel, aesthetic philosophy',
        Saturn: 'Disciplined learning, travel restrictions',
        Rahu: 'Unusual beliefs, foreign connections',
        Ketu: 'Spiritual wisdom, philosophical detachment'
      },
      10: {
        Sun: 'Career focus, public image, achievement',
        Moon: 'Emotional career needs, public recognition',
        Mars: 'Career action, professional conflicts',
        Mercury: 'Career communication, professional networking',
        Jupiter: 'Career growth, professional opportunities',
        Venus: 'Career harmony, professional relationships',
        Saturn: 'Career responsibility, professional challenges',
        Rahu: 'Unusual career path, public recognition',
        Ketu: 'Spiritual career, professional detachment'
      },
      11: {
        Sun: 'Social focus, friendships, goals',
        Moon: 'Emotional friendships, social harmony',
        Mars: 'Social action, friendship conflicts',
        Mercury: 'Social communication, networking',
        Jupiter: 'Social expansion, friendship growth',
        Venus: 'Harmonious friendships, social pleasure',
        Saturn: 'Social responsibility, friendship challenges',
        Rahu: 'Unusual friendships, social networking',
        Ketu: 'Spiritual friendships, social detachment'
      },
      12: {
        Sun: 'Spiritual focus, solitude, endings',
        Moon: 'Emotional solitude, spiritual seeking',
        Mars: 'Spiritual action, hidden conflicts',
        Mercury: 'Spiritual communication, subconscious analysis',
        Jupiter: 'Spiritual growth, expansion of consciousness',
        Venus: 'Spiritual relationships and hidden pleasures',
        Saturn: 'Spiritual discipline, isolation, endings',
        Rahu: 'Spiritual obsession, hidden matters',
        Ketu: 'Spiritual liberation, detachment, enlightenment'
      }
    };
    return effects[house]?.[planet] || 'Transit influence in this house';
  }

  /**
   * Calculates retrograde effects.
   * @param {Object} transitChart - Current transit chart.
   * @returns {Array<Object>} List of retrograde planets and their effects.
   * @private
   */
  _calculateRetrogradeEffects(transitChart) {
    const retrogradePlanets = [];
    const planets = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];

    for (const planet of planets) {
      // This would need actual retrograde calculation from ephemeris
      // For now, using placeholder logic
      const isRetrograde = this._isPlanetRetrograde(planet, transitChart);

      if (isRetrograde) {
        retrogradePlanets.push({
          planet,
          effects: this._getRetrogradeEffects(planet)
        });
      }
    }
    return retrogradePlanets;
  }

  /**
   * Checks if a planet is retrograde (simplified).
   * @param {string} planet - Planet name.
   * @param {Object} chart - Chart data.
   * @returns {boolean} True if retrograde (simplified).
   * @private
   */
  _isPlanetRetrograde(planet, chart) {
    // This would need actual ephemeris data
    // Placeholder implementation
    const retrogradePlanets = ['Mercury']; // Example
    return retrogradePlanets.includes(planet);
  }

  /**
   * Calculates major transit periods (e.g., Saturn/Jupiter returns).
   * @param {Object} transitChart - Current transit chart.
   * @param {Object} natalChart - Natal chart.
   * @returns {Array<Object>} List of major transit periods.
   * @private
   */
  _calculateMajorTransitPeriods(transitChart, natalChart) {
    const periods = [];

    const saturnReturn = this._calculateSaturnReturn(transitChart, natalChart);
    if (saturnReturn.approaching) {
      periods.push(saturnReturn);
    }

    const jupiterReturn = this._calculateJupiterReturn(transitChart, natalChart);
    if (jupiterReturn.approaching) {
      periods.push(jupiterReturn);
    }
    return periods;
  }

  /**
   * Calculates Saturn return status.
   * @param {Object} transitChart - Current transit chart.
   * @param {Object} natalChart - Natal chart.
   * @returns {Object} Saturn return status.
   * @private
   */
  _calculateSaturnReturn(transitChart, natalChart) {
    const natalSaturn = natalChart.saturn;
    const transitSaturn = transitChart.saturn;
    const diff = Math.abs(transitSaturn - natalSaturn);

    const approaching = diff < 15 || diff > 345;

    return {
      type: 'Saturn Return',
      approaching,
      orb: diff < 180 ? diff : 360 - diff,
      significance: 'Major life restructuring, responsibility, maturity'
    };
  }

  /**
   * Calculates Jupiter return status.
   * @param {Object} transitChart - Current transit chart.
   * @param {Object} natalChart - Natal chart.
   * @returns {Object} Jupiter return status.
   * @private
   */
  _calculateJupiterReturn(transitChart, natalChart) {
    const natalJupiter = natalChart.jupiter;
    const transitJupiter = transitChart.jupiter;
    const diff = Math.abs(transitJupiter - natalJupiter);

    const approaching = diff < 15 || diff > 345;

    return {
      type: 'Jupiter Return',
      approaching,
      orb: diff < 180 ? diff : 360 - diff,
      significance: 'Growth opportunities, expansion, wisdom'
    };
  }

  /**
   * Generates interpretations based on all calculated data.
   * @param {Object} data - All transit data.
   * @returns {Object} Interpretations.
   * @private
   */
  _generateInterpretations(data) {
    const { significantTransits, retrogradeEffects, planetaryReturns } = data;

    const interpretations = {
      majorInfluences: this._identifyMajorInfluences(data),
      timing: this._analyzeTiming(data),
      challenges: this._identifyChallenges(data),
      opportunities: this._identifyOpportunities(data),
      overall: this._generateOverallAnalysis(data)
    };
    return interpretations;
  }

  /**
   * Identifies major influences from transit data.
   * @param {Object} data - All transit data.
   * @returns {Array<string>} List of major influences.
   * @private
   */
  _identifyMajorInfluences(data) {
    const influences = [];
    const { significantTransits, retrogradeEffects } = data;

    const strongTransits = significantTransits.filter(t => t.significance >= 20);
    strongTransits.forEach(transit => {
      influences.push(`${transit.transitPlanet} ${transit.aspect} ${transit.natalPlanet}`);
    });

    retrogradeEffects.forEach(retrograde => {
      if (retrograde.currentStatus) {
        influences.push(`${retrograde.planet} retrograde`);
      }
    });
    return influences;
  }

  /**
   * Analyzes timing aspects from transit data.
   * @param {Object} data - All transit data.
   * @returns {Object} Timing analysis.
   * @private
   */
  _analyzeTiming(data) {
    const { significantTransits, planetaryReturns } = data;

    const activatingTransits = significantTransits.filter(t =>
      t.aspect === 'square' || t.aspect === 'opposition'
    );
    const harmoniousTransits = significantTransits.filter(t =>
      t.aspect === 'trine' || t.aspect === 'sextile'
    );
    const upcomingReturns = planetaryReturns.filter(r =>
      new Date(r.nextReturn) <= new Date()
    );

    return {
      phase: activatingTransits.length > harmoniousTransits.length ? 'challenging' : 'growth',
      intensity: significantTransits.length > 5 ? 'high' : 'moderate',
      returns: upcomingReturns.length > 0 ? 'return period' : 'normal transit'
    };
  }

  /**
   * Identifies challenges from transit data.
   * @param {Object} data - All transit data.
   * @returns {Array<string>} List of challenges.
   * @private
   */
  _identifyChallenges(data) {
    const challenges = [];
    const { significantTransits, retrogradeEffects } = data;

    const challengingTransits = significantTransits.filter(t =>
      (t.aspect === 'square' || t.aspect === 'opposition') && t.significance >= 20
    );
    challengingTransits.forEach(transit => {
      challenges.push(`${transit.transitPlanet} ${transit.aspect} ${transit.natalPlanet} - requires awareness`);
    });

    retrogradeEffects.forEach(retrograde => {
      if (retrograde.currentStatus) {
        challenges.push(`${retrograde.planet} retrograde - ${retrograde.effects}`);
      }
    });
    return challenges;
  }

  /**
   * Identifies opportunities from transit data.
   * @param {Object} data - All transit data.
   * @returns {Array<string>} List of opportunities.
   * @private
   */
  _identifyOpportunities(data) {
    const opportunities = [];
    const { significantTransits, planetaryReturns } = data;

    const harmoniousTransits = significantTransits.filter(t =>
      (t.aspect === 'trine' || t.aspect === 'sextile') && t.significance >= 15
    );
    harmoniousTransits.forEach(transit => {
      opportunities.push(`${transit.transitPlanet} ${transit.aspect} ${transit.natalPlanet} - favorable timing`);
    });

    planetaryReturns.forEach(returnInfo => {
      if (new Date(returnInfo.nextReturn) <= new Date()) {
        opportunities.push(`${returnInfo.planet} return - ${returnInfo.interpretation}`);
      }
    });
    return opportunities;
  }

  /**
   * Generates an overall analysis summary.
   * @param {Object} data - All transit data.
   * @returns {Object} Overall analysis.
   * @private
   */
  _generateOverallAnalysis(data) {
    const { significantTransits } = data;

    return {
      summary: `Significant transit period with ${significantTransits.length} major influences`,
      intensity: this._calculateTransitIntensity(data),
      focus: this._identifyTransitFocus(data),
      recommendations: this._generateTransitRecommendations(data)
    };
  }

  /**
   * Calculates the intensity of transits.
   * @param {Object} data - All transit data.
   * @returns {string} Intensity level.
   * @private
   */
  _calculateTransitIntensity(data) {
    const { significantTransits } = data;
    if (significantTransits.length === 0) return 'Low';

    const totalSignificance = significantTransits.reduce((sum, t) => sum + t.significance, 0);
    const averageSignificance = totalSignificance / significantTransits.length;

    if (averageSignificance > 25) return 'High';
    if (averageSignificance > 18) return 'Medium';
    return 'Low';
  }

  /**
   * Identifies the focus areas of transits.
   * @param {Object} data - All transit data.
   * @returns {Array<string>} List of focus areas.
   * @private
   */
  _identifyTransitFocus(data) {
    const { significantTransits } = data;
    const planetCounts = {};
    significantTransits.forEach(transit => {
      planetCounts[transit.transitPlanet] = (planetCounts[transit.transitPlanet] || 0) + 1;
    });

    const sortedPlanets = Object.entries(planetCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);
    return sortedPlanets.map(([planet, count]) => `${planet} (${count} transits)`);
  }

  /**
   * Generates recommendations based on transit data.
   * @param {Object} data - All transit data.
   * @returns {Array<string>} List of recommendations.
   * @private
   */
  _generateTransitRecommendations(data) {
    const recommendations = [];
    const { significantTransits, retrogradeEffects } = data;

    const challengingTransits = significantTransits.filter(t =>
      t.aspect === 'square' || t.aspect === 'opposition'
    );
    if (challengingTransits.length > 0) {
      recommendations.push('Navigate challenges with patience and awareness');
    }

    const activeRetrogrades = retrogradeEffects.filter(r => r.currentStatus);
    if (activeRetrogrades.length > 0) {
      recommendations.push('Review and reconsider decisions before taking action');
    }

    const harmoniousTransits = significantTransits.filter(t =>
      t.aspect === 'trine' || t.aspect === 'sextile'
    );
    if (harmoniousTransits.length > 0) {
      recommendations.push('Take advantage of favorable timing for new initiatives');
    }
    return recommendations;
  }

  /**
   * Formats the output for display.
   * @param {Object} analysis - The complete transit analysis.
   * @param {string} [language='en'] - The language for output.
   * @returns {Object} Formatted output.
   * @private
   */
  formatResult(analysis, language = 'en') {
    const translations = {
      en: {
        title: 'Significant Transits Analysis',
        startDate: 'Start Date',
        endDate: 'End Date',
        significantTransits: 'Significant Transits',
        retrogradeEffects: 'Retrograde Effects',
        planetaryReturns: 'Planetary Returns',
        eclipseTransits: 'Eclipse Transits',
        interpretations: 'Interpretations',
        majorInfluences: 'Major Influences',
        timing: 'Timing Analysis',
        challenges: 'Challenges',
        opportunities: 'Opportunities',
        overallAnalysis: 'Overall Analysis'
      },
      hi: {
        title: 'महत्वपूर्ण गोचर विश्लेषण',
        startDate: 'प्रारंभ तिथि',
        endDate: 'समाप्ति तिथि',
        significantTransits: 'महत्वपूर्ण गोचर',
        retrogradeEffects: 'वक्री प्रभाव',
        planetaryReturns: 'ग्रहीय वापसी',
        eclipseTransits: 'ग्रहण गोचर',
        interpretations: 'व्याख्या',
        majorInfluences: 'प्रमुख प्रभाव',
        timing: 'समय विश्लेषण',
        challenges: 'चुनौतियां',
        opportunities: 'अवसरों',
        overallAnalysis: 'समग्र विश्लेषण'
      }
    };

    const t = translations[language] || translations.en;

    return {
      success: true,
      data: analysis,
      summary: analysis.interpretations.overall.summary,
      metadata: {
        serviceName: this.serviceName,
        calculationType: 'Significant Transits',
        timestamp: new Date().toISOString(),
        language: language
      }
    };
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
      methods: ['processCalculation', '_calculateSignificantTransits', '_calculateRetrogradeEffects', '_calculatePlanetaryReturns', '_calculateEclipseTransits'],
      dependencies: [], // Managed by ServiceTemplate
      description: 'Identifies and analyzes major planetary transits and their impacts.'
    };
  }

  /**
   * Returns help information for the service.
   * @returns {string} Help text.
   */
  getHelp() {
    return `
🌟 **Significant Transits Service**

**Purpose:** Provides analysis of major planetary transits, retrograde effects, planetary returns, and eclipse transits, offering insights into their impacts and timing.

**Required Inputs:**
• Birth datetime (ISO string, e.g., '1990-06-15T06:45:00.000Z')
• Birth latitude (number, e.g., 28.6139)
• Birth longitude (number, e.g., 77.2090)
• Optional: Start date for analysis (ISO string, defaults to now)
• Optional: End date for analysis (ISO string, defaults to 1 year from startDate)

**Analysis Includes:**
• **Significant Transits:** Key planetary aspects to your natal chart.
• **Retrograde Effects:** Periods when planets appear to move backward, influencing reconsideration and delays.
• **Planetary Returns:** Cycles when planets return to their natal positions, marking new phases.
• **Eclipse Transits:** Impacts of solar and lunar eclipses.
• **Interpretations:** Detailed insights into major influences, timing, challenges, and opportunities.

**Example Usage:**
"Analyze significant transits for my birth data from today for the next 6 months."
"What are the major planetary returns for someone born on 1985-03-22T14:30:00.000Z at 19.0760 latitude, 72.8777 longitude?"

**Output Format:**
Comprehensive report with detailed transit data, interpretations, and recommendations.
    `.trim();
  }
}

module.exports = SignificantTransitsService;
