const ServiceTemplate = require('../ServiceTemplate');
const logger = require('../../../utils/logger');
const { validateCoordinates, validateDateTime } = require('../../../utils/validation');

/**
 * SignificantTransitsService - Service for identifying and analyzing major planetary transits
 *
 * Provides analysis of major planetary transits, retrograde effects, planetary returns,
 * and eclipse transits, offering insights into their impacts and timing.
 */
class SignificantTransitsService extends ServiceTemplate {
  constructor() {
    super('VedicCalculator'); // Primary calculator for this service
    this.serviceName = 'SignificantTransitsService';
    this.calculatorPath = '../../../services/astrology/vedic/calculators/VedicCalculator';
    logger.info('SignificantTransitsService initialized');
  }

  /**
   * Main calculation method for Significant Transits.
   * Orchestrates the calculation of various transit-related analyses.
   * @param {Object} userData - User's birth data and analysis parameters.
   * @param {string} userData.datetime - Birth datetime (ISO string).
   * @param {number} userData.latitude - Birth latitude.
   * @param {number} userData.longitude - Birth longitude.
   * @param {string} [userData.startDate] - Start date for transit analysis (ISO string, defaults to now).
   * @param {string} [userData.endDate] - End date for transit analysis (ISO string, defaults to 1 year from startDate).
   * @param {Object} [options] - Additional options for calculation.
   * @returns {Promise<Object>} Comprehensive transit analysis.
   */
  async processCalculation(userData, options = {}) {
    try {
      // Ensure calculator is loaded
      if (!this.calculator) {
        await this.initialize();
      }

      this._validateInput(userData);

      let {
        datetime,
        latitude,
        longitude,
        startDate,
        endDate
      } = userData;

      if (!startDate) {
        startDate = new Date().toISOString();
      }
      if (!endDate) {
        const end = new Date(startDate);
        end.setMonth(end.getMonth() + 12); // Default 1 year
        endDate = end.toISOString();
      }

      const significantTransits = await this._calculateSignificantTransits(
        datetime,
        latitude,
        longitude,
        startDate,
        endDate
      );

      const retrogradeEffects = this._calculateRetrogradeEffects(
        startDate,
        endDate,
        latitude,
        longitude
      );

      const planetaryReturns = await this._calculatePlanetaryReturns(
        datetime,
        latitude,
        longitude,
        startDate,
        endDate
      );

      const eclipseTransits = this._calculateEclipseTransits(
        startDate,
        endDate,
        latitude,
        longitude
      );

      const analysis = {
        startDate,
        endDate,
        significantTransits,
        retrogradeEffects,
        planetaryReturns,
        eclipseTransits,
        interpretations: this._generateInterpretations({
          significantTransits,
          retrogradeEffects,
          planetaryReturns,
          eclipseTransits
        })
      };

      return analysis;

    } catch (error) {
      logger.error('SignificantTransitsService processCalculation error:', error);
      throw new Error(`Significant transits calculation failed: ${error.message}`);
    }
  }

  /**
   * Validates input data for transit analysis.
   * @param {Object} userData - User data to validate.
   * @private
   */
  _validateInput(userData) {
    if (!userData) {
      throw new Error('User data is required for Significant Transits analysis.');
    }
    const { datetime, latitude, longitude } = userData;
    validateDateTime(datetime);
    validateCoordinates(latitude, longitude);
  }

  /**
   * Calculates significant transits for a given date range.
   * @param {string} birthDatetime - User's birth datetime.
   * @param {number} birthLatitude - User's birth latitude.
   * @param {number} birthLongitude - User's birth longitude.
   * @param {string} startDate - Start date for analysis.
   * @param {string} endDate - End date for analysis.
   * @returns {Promise<Object>} Object containing birth chart and transits.
   * @private
   */
  async _calculateSignificantTransits(birthDatetime, birthLatitude, birthLongitude, startDate, endDate) {
    const birthChart = await this.calculator.calculateChart(birthDatetime, birthLatitude, birthLongitude);

    const transits = [];
    const currentDate = new Date(startDate);
    const end = new Date(endDate);

    while (currentDate <= end) {
      const currentChart = await this.calculator.calculateChart(
        currentDate.toISOString(),
        birthLatitude,
        birthLongitude
      );

      const dayTransits = this._calculateDailyTransits(currentChart, birthChart, currentDate);
      transits.push(...dayTransits);

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return {
      birthChart,
      transits: this._filterSignificantTransits(transits),
      startDate,
      endDate
    };
  }

  /**
   * Calculates daily transits between current and natal charts.
   * @param {Object} currentChart - Chart for the current date.
   * @param {Object} birthChart - User's natal chart.
   * @param {Date} date - Current date.
   * @returns {Array<Object>} List of daily transits.
   * @private
   */
  _calculateDailyTransits(currentChart, birthChart, date) {
    const transits = [];
    const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

    for (const transitPlanet of planets) {
      const transitLong = currentChart[transitPlanet.toLowerCase()];

      for (const natalPlanet of planets) {
        const natalLong = birthChart[natalPlanet.toLowerCase()];
        const aspect = this._calculateAspect(transitLong, natalLong);

        if (aspect.aspect !== 'none' && aspect.orb <= 3) {
          transits.push({
            date: date.toISOString(),
            transitPlanet,
            natalPlanet,
            aspect: aspect.aspect,
            orb: aspect.orb,
            strength: aspect.strength,
            type: this._getTransitType(transitPlanet, natalPlanet, aspect.aspect),
            significance: this._calculateTransitSignificance(transitPlanet, natalPlanet, aspect)
          });
        }
      }
    }
    return transits;
  }

  /**
   * Calculates the aspect between two longitudes.
   * @param {number} long1 - Longitude of the first planet.
   * @param {number} long2 - Longitude of the second planet.
   * @returns {Object} Aspect details.
   * @private
   */
  _calculateAspect(long1, long2) {
    const diff = Math.abs(long1 - long2);
    const normalizedDiff = diff > 180 ? 360 - diff : diff;

    const aspects = [
      { type: 'conjunction', angle: 0, orb: 3 },
      { type: 'opposition', angle: 180, orb: 3 },
      { type: 'trine', angle: 120, orb: 3 },
      { type: 'square', angle: 90, orb: 3 },
      { type: 'sextile', angle: 60, orb: 2 }
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
   * Determines the type of transit (e.g., opportunity, challenge).
   * @param {string} transitPlanet - Name of the transiting planet.
   * @param {string} natalPlanet - Name of the natal planet.
   * @param {string} aspect - Type of aspect.
   * @returns {string} Transit type.
   * @private
   */
  _getTransitType(transitPlanet, natalPlanet, aspect) {
    const benefic = ['Jupiter', 'Venus', 'Mercury'];
    const malefic = ['Mars', 'Saturn', 'Rahu', 'Ketu'];

    const isTransitBenefic = benefic.includes(transitPlanet);
    // const isNatalBenefic = benefic.includes(natalPlanet); // Not used in current logic

    const aspectTypes = {
      conjunction: isTransitBenefic ? 'opportunity' : 'challenge',
      trine: 'support',
      sextile: 'assistance',
      square: 'activation',
      opposition: 'awareness'
    };
    return aspectTypes[aspect] || 'neutral';
  }

  /**
   * Calculates the significance of a transit.
   * @param {string} transitPlanet - Name of the transiting planet.
   * @param {string} natalPlanet - Name of the natal planet.
   * @param {Object} aspect - Aspect details.
   * @returns {number} Significance score.
   * @private
   */
  _calculateTransitSignificance(transitPlanet, natalPlanet, aspect) {
    let significance = 0;

    const planetWeights = {
      Sun: 10, Moon: 9, Mars: 8, Mercury: 7, Jupiter: 10, Venus: 8, Saturn: 10
    };
    const aspectWeights = {
      conjunction: 10, opposition: 9, trine: 7, square: 8, sextile: 5
    };

    significance = (planetWeights[transitPlanet] || 5) +
                   (planetWeights[natalPlanet] || 5) +
                   (aspectWeights[aspect.aspect] || 3);

    if (['Jupiter', 'Saturn'].includes(transitPlanet)) {
      significance += 5;
    }
    if (['Sun', 'Moon', 'Mercury', 'Venus', 'Mars'].includes(transitPlanet) &&
        ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars'].includes(natalPlanet)) {
      significance += 3;
    }
    return significance;
  }

  /**
   * Filters and groups significant transits.
   * @param {Array<Object>} transits - List of raw transits.
   * @returns {Array<Object>} Filtered and grouped transits.
   * @private
   */
  _filterSignificantTransits(transits) {
    const sortedTransits = transits.sort((a, b) => {
      if (b.significance !== a.significance) {
        return b.significance - a.significance;
      }
      return new Date(a.date) - new Date(b.date);
    });

    const significantTransits = sortedTransits.filter(t => t.significance >= 15);
    return this._groupSimilarTransits(significantTransits);
  }

  /**
   * Groups similar transits together.
   * @param {Array<Object>} transits - List of significant transits.
   * @returns {Array<Object>} Grouped transits.
   * @private
   */
  _groupSimilarTransits(transits) {
    const groups = {};
    transits.forEach(transit => {
      const key = `${transit.transitPlanet}-${transit.natalPlanet}-${transit.aspect}`;
      if (!groups[key]) {
        groups[key] = {
          ...transit,
          startDate: transit.date,
          endDate: transit.date,
          peakDate: transit.date,
          maxStrength: transit.strength,
          occurrences: 1
        };
      } else {
        const group = groups[key];
        group.endDate = transit.date;
        group.occurrences++;
        if (transit.strength > group.maxStrength) {
          group.maxStrength = transit.strength;
          group.peakDate = transit.date;
        }
      }
    });
    return Object.values(groups);
  }

  /**
   * Calculates retrograde effects for a period.
   * @param {string} startDate - Start date.
   * @param {string} endDate - End date.
   * @param {number} latitude - Latitude.
   * @param {number} longitude - Longitude.
   * @returns {Array<Object>} List of retrograde periods.
   * @private
   */
  _calculateRetrogradeEffects(startDate, endDate, latitude, longitude) {
    const retrogradePeriods = [];
    const planets = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];

    for (const planet of planets) {
      const retrogradeInfo = this._calculatePlanetRetrograde(
        planet,
        startDate,
        endDate,
        latitude,
        longitude
      );
      if (retrogradeInfo) {
        retrogradePeriods.push(retrogradeInfo);
      }
    }
    return retrogradePeriods;
  }

  /**
   * Calculates retrograde periods for a single planet.
   * @param {string} planet - Planet name.
   * @param {string} startDate - Start date.
   * @param {string} endDate - End date.
   * @param {number} latitude - Latitude.
   * @param {number} longitude - Longitude.
   * @returns {Object|null} Retrograde info or null.
   * @private
   */
  _calculatePlanetRetrograde(planet, startDate, endDate, latitude, longitude) {
    // Simplified retrograde calculation - in production, would use ephemeris data
    const retrogradePeriods = {
      Mercury: { frequency: '3-4 times per year', duration: '3 weeks' },
      Venus: { frequency: 'every 18 months', duration: '6 weeks' },
      Mars: { frequency: 'every 26 months', duration: '2-3 months' },
      Jupiter: { frequency: 'every 13 months', duration: '4 months' },
      Saturn: { frequency: 'every 12.5 months', duration: '4.5 months' }
    };
    const info = retrogradePeriods[planet];
    if (!info) return null;

    return {
      planet,
      frequency: info.frequency,
      duration: info.duration,
      effects: this._getRetrogradeEffects(planet),
      currentStatus: this._checkCurrentRetrogradeStatus(planet)
    };
  }

  /**
   * Gets the effects of a planet being retrograde.
   * @param {string} planet - Planet name.
   * @returns {string} Retrograde effects description.
   * @private
   */
  _getRetrogradeEffects(planet) {
    const effects = {
      Mercury: 'Communication delays, technology issues, reconsideration of decisions',
      Venus: 'Relationship reassessment, financial reconsideration, aesthetic reevaluation',
      Mars: 'Energy redirection, action delays, conflict reconsideration',
      Jupiter: 'Growth reconsideration, belief system review, opportunity reassessment',
      Saturn: 'Responsibility review, discipline reevaluation, structure reconsideration'
    };
    return effects[planet] || 'Retrograde influence requiring reflection';
  }

  /**
   * Checks the current retrograde status of a planet.
   * @param {string} planet - Planet name.
   * @returns {boolean} True if currently retrograde (simplified).
   * @private
   */
  _checkCurrentRetrogradeStatus(planet) {
    // Simplified - would use actual ephemeris
    const retrogradePlanets = ['Mercury']; // Example
    return retrogradePlanets.includes(planet);
  }

  /**
   * Calculates planetary returns for a period.
   * @param {string} birthDatetime - User's birth datetime.
   * @param {number} birthLatitude - User's birth latitude.
   * @param {number} birthLongitude - User's birth longitude.
   * @param {string} startDate - Start date.
   * @param {string} endDate - End date.
   * @returns {Array<Object>} List of planetary returns.
   * @private
   */
  async _calculatePlanetaryReturns(birthDatetime, birthLatitude, birthLongitude, startDate, endDate) {
    const returns = [];
    const planets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];

    for (const planet of planets) {
      const returnInfo = await this._calculatePlanetReturn(
        planet,
        birthDatetime,
        birthLatitude,
        birthLongitude,
        startDate,
        endDate
      );
      if (returnInfo) {
        returns.push(returnInfo);
      }
    }
    return returns;
  }

  /**
   * Calculates the return of a single planet.
   * @param {string} planet - Planet name.
   * @param {string} birthDatetime - User's birth datetime.
   * @param {number} birthLatitude - User's birth latitude.
   * @param {number} birthLongitude - User's birth longitude.
   * @param {string} startDate - Start date.
   * @param {string} endDate - End date.
   * @returns {Promise<Object|null>} Planet return info or null.
   * @private
   */
  async _calculatePlanetReturn(planet, birthDatetime, birthLatitude, birthLongitude, startDate, endDate) {
    const birthChart = await this.calculator.calculateChart(birthDatetime, birthLatitude, birthLongitude);
    const birthPosition = birthChart[planet.toLowerCase()];

    // Simplified return calculation - in production, would use ephemeris to find exact return dates
    const returnPeriods = {
      Sun: { frequency: 'annually', significance: 'Solar Return - Personal New Year' },
      Moon: { frequency: 'monthly', significance: 'Lunar Return - Emotional Reset' },
      Mercury: { frequency: '4 times per year', significance: 'Mercury Return - Communication Cycle' },
      Venus: { frequency: 'annually', significance: 'Venus Return - Relationship Cycle' },
      Mars: { frequency: 'every 2 years', significance: 'Mars Return - Energy Cycle' },
      Jupiter: { frequency: 'every 12 years', significance: 'Jupiter Return - Growth Cycle' },
      Saturn: { frequency: 'every 29 years', significance: 'Saturn Return - Life Cycle' }
    };
    const info = returnPeriods[planet];
    if (!info) return null;

    return {
      planet,
      frequency: info.frequency,
      significance: info.significance,
      nextReturn: this._estimateNextReturn(planet, birthDatetime, startDate),
      interpretation: this._getReturnInterpretation(planet)
    };
  }

  /**
   * Estimates the next return date for a planet.
   * @param {string} planet - Planet name.
   * @param {string} birthDatetime - User's birth datetime.
   * @param {string} startDate - Start date for estimation.
   * @returns {string} Estimated next return date (ISO string).
   * @private
   */
  _estimateNextReturn(planet, birthDatetime, startDate) {
    const birthDate = new Date(birthDatetime);
    const start = new Date(startDate);

    const returnPeriods = {
      Sun: 365.25, Moon: 27.32, Mercury: 88, Venus: 224.7, Mars: 687, Jupiter: 4333, Saturn: 10759
    };
    const period = returnPeriods[planet];
    if (!period) return null;

    const ageInDays = (start - birthDate) / (1000 * 60 * 60 * 24);
    const cyclesCompleted = Math.floor(ageInDays / period);
    const nextReturnInDays = (cyclesCompleted + 1) * period - ageInDays;

    const nextReturnDate = new Date(start);
    nextReturnDate.setDate(nextReturnDate.getDate() + Math.floor(nextReturnInDays));
    return nextReturnDate.toISOString();
  }

  /**
   * Gets the interpretation for a planet's return.
   * @param {string} planet - Planet name.
   * @returns {string} Interpretation.
   * @private
   */
  _getReturnInterpretation(planet) {
    const interpretations = {
      Sun: 'Personal renewal, new beginnings, birthday themes',
      Moon: 'Emotional reset, intuitive insights, domestic focus',
      Mercury: 'Communication cycle, learning phase, mental reset',
      Venus: 'Relationship cycle, values reassessment, pleasure focus',
      Mars: 'Energy cycle, initiative phase, action reset',
      Jupiter: 'Growth cycle, opportunity phase, expansion reset',
      Saturn: 'Life cycle, responsibility phase, structure reset'
    };
    return interpretations[planet] || 'Planetary cycle influence';
  }

  /**
   * Calculates eclipse transits for a period.
   * @param {string} startDate - Start date.
   * @param {string} endDate - End date.
   * @param {number} latitude - Latitude.
   * @param {number} longitude - Longitude.
   * @returns {Array<Object>} List of eclipse transits.
   * @private
   */
  _calculateEclipseTransits(startDate, endDate, latitude, longitude) {
    const eclipses = [];
    // Simplified eclipse calculation - in production, would use ephemeris for exact eclipse data
    const eclipseTypes = [
      { type: 'Solar Eclipse', frequency: '2-5 times per year', effect: 'New beginnings, major life changes' },
      { type: 'Lunar Eclipse', frequency: '2-5 times per year', effect: 'Emotional culmination, relationship changes' }
    ];
    eclipseTypes.forEach(eclipse => {
      eclipses.push({
        type: eclipse.type,
        frequency: eclipse.frequency,
        effect: eclipse.effect,
        nextEclipse: this._estimateNextEclipse(eclipse.type, startDate)
      });
    });
    return eclipses;
  }

  /**
   * Estimates the next eclipse date.
   * @param {string} eclipseType - Type of eclipse.
   * @param {string} startDate - Start date for estimation.
   * @returns {string} Estimated next eclipse date (ISO string).
   * @private
   */
  _estimateNextEclipse(eclipseType, startDate) {
    const start = new Date(startDate);
    const nextEclipse = new Date(start);
    if (eclipseType === 'Solar Eclipse') {
      nextEclipse.setMonth(nextEclipse.getMonth() + 2);
    } else {
      nextEclipse.setMonth(nextEclipse.getMonth() + 1);
    }
    return nextEclipse.toISOString();
  }

  /**
   * Generates interpretations based on all calculated transit data.
   * @param {Object} data - All transit data.
   * @returns {Object} Interpretations.
   * @private
   */
  _generateInterpretations(data) {
    const { significantTransits, retrogradeEffects, planetaryReturns, eclipseTransits } = data;

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
• Optional: End date for analysis (ISO string, defaults to 1 year from start date)

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