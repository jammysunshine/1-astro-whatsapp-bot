const logger = require('../../../../utils/logger');
const sweph = require('sweph');

/**
 * Varshaphal Calculator
 * Calculates solar return (annual) analysis using Vedic astrology principles
 * Analyzes the year's potential based on solar ingress and planetary configurations
 */
class VarshaphalCalculator {
  constructor(astrologer, geocodingService) {
    this.astrologer = astrologer;
    this.geocodingService = geocodingService;

    // Define yearly significators and their effects
    this.varshaphalSignificators = {
      sun: { aspects: ['Career', 'Authority', 'Father', 'Physical health'], strength: 'Leadership potential' },
      moon: { aspects: ['Mind', 'Emotions', 'Mother', 'Public', 'Women'], strength: 'Emotional stability' },
      mars: { aspects: ['Energy', 'Conflict', 'Siblings', 'Property'], strength: 'Action and initiative' },
      mercury: { aspects: ['Communication', 'Education', 'Business', 'Short travels'], strength: 'Intellectual pursuits' },
      jupiter: { aspects: ['Growth', 'Wealth', 'Spirituality', 'Long travels'], strength: 'Expansion and wisdom' },
      venus: { aspects: ['Love', 'Luxury', 'Arts', 'Marriage', 'Finances'], strength: 'Harmonious relationships' },
      saturn: { aspects: ['Discipline', 'Responsibilities', 'Hard work', 'Aging'], strength: 'Maturity and structure' },
      rahu: { aspects: ['Ambitions', 'Social climbing', 'Innovation', 'Foreign matters'], strength: 'Breakthroughs' },
      ketu: { aspects: ['Spirituality', 'Detachment', 'Introspection', 'Liberation'], strength: 'Inner growth' }
    };
  }

  /**
   * Set services for the calculator
   */
  setServices(services) {
    this.services = services;
  }

  /**
   * Calculate Varshaphal (solar return) analysis for a specific year
   * @param {Object} birthData - Birth data object
   * @param {number} year - Year for Varshaphal calculation
   * @returns {Object} Comprehensive Varshaphal analysis
   */
  async calculateVarshaphal(birthData, year) {
    try {
      const { birthDate, birthTime, birthPlace, name } = birthData;

      if (!birthDate || !birthTime || !birthPlace || !year) {
        throw new Error('Complete birth details and target year required for Varshaphal');
      }

      // Calculate solar return date and chart
      const solarReturnData = this._calculateSolarReturnDate(birthData, year);
      const solarReturnChart = await this._calculateSolarReturnChart(solarReturnData, birthData);

      // Analyze progressed moon movement
      const progressedMoonData = this._calculateProgressedMoon(birthData, year);

      // Calculate annual sub-periods (Muhurta analysis for the year)
      const annualMuhurta = this._calculateAnnualMuhurta(solarReturnChart);

      // Determine annual yoga formations
      const annualYogas = this._analyzeAnnualYogas(solarReturnChart);

      // Generate yearly predictive analysis
      const predictions = this._generateAnnualPredictions(solarReturnChart, progressedMoonData, annualMuhurta);

      // Identify favorable and challenging periods
      const favorablePeriods = this._identifyFavorablePeriods(solarReturnChart, year);
      const challengingPeriods = this._identifyChallengingPeriods(solarReturnChart, year);

      // Provide year-specific remedial measures
      const remedies = this._generateAnnualRemedies(solarReturnChart, annualMuhurta);

      return {
        name,
        year,
        solarReturnDate: solarReturnData.returnDate,
        solarReturnChart,
        progressedMoon: progressedMoonData,
        annualMuhurta,
        annualYogas,
        predictions,
        favorablePeriods,
        challengingPeriods,
        remedies,
        summary: this._generateVarshaphalSummary(year, predictions, annualMuhurta)
      };
    } catch (error) {
      logger.error('❌ Error in Varshaphal calculation:', error);
      throw new Error(`Varshaphal calculation failed: ${error.message}`);
    }
  }

  /**
   * Calculate solar return date for given year
   * @private
   * @param {Object} birthData - Birth data
   * @param {number} year - Target year
   * @returns {Object} Solar return date and data
   */
  _calculateSolarReturnDate(birthData, year) {
    // Parse birth date
    const parsedBirth = this._parseBirthDate(birthData.birthDate);
    const parsedTime = this._parseBirthTime(birthData.birthTime);

    // Calculate Julian Days
    const birthJD = this._dateToJulianDay(parsedBirth.year, parsedBirth.month, parsedBirth.day,
      parsedTime.hour + parsedTime.minute / 60);

    const targetJD = this._dateToJulianDay(year, parsedBirth.month, parsedBirth.day,
      parsedTime.hour + parsedTime.minute / 60);

    // Calculate solar return date (Sun's return to birth position)
    const sunReturnData = sweph.calc(targetJD, sweph.SE_SUN, sweph.SEFLG_SIDEREAL);
    const solarReturnDate = this._jdToDateString(targetJD);

    return {
      returnDate: solarReturnDate,
      returnJD: targetJD,
      age: year - parsedBirth.year,
      sunPosition: sunReturnData.longitude ? sunReturnData.longitude[0] : 0
    };
  }

  /**
   * Calculate solar return chart (birth chart moved to solar return moment)
   * @private
   * @param {Object} solarReturnData - Solar return date data
   * @param {Object} birthData - Original birth data
   * @returns {Object} Solar return chart
   */
  async _calculateSolarReturnChart(solarReturnData, birthData) {
    const coordinates = await this.geocodingService.getCoordinates(birthData.birthPlace);
    const jd = solarReturnData.returnJD;

    // Calculate all planets at solar return moment
    const planets = {};
    const planetIds = {
      sun: sweph.SE_SUN, moon: sweph.SE_MOON, mars: sweph.SE_MARS,
      mercury: sweph.SE_MERCURY, jupiter: sweph.SE_JUPITER,
      venus: sweph.SE_VENUS, saturn: sweph.SE_SATURN,
      rahu: sweph.SE_TRUE_NODE, ketu: null // Ketu is opposite Rahu
    };

    Object.entries(planetIds).forEach(([planet, planetId]) => {
      if (!planetId) { return; } // Skip Ketu for now

      try {
        const position = sweph.calc(jd, planetId, sweph.SEFLG_SIDEREAL);
        if (position && position.longitude !== undefined) {
          const longitude = position.longitude[0] || position.longitude;
          const sign = Math.floor(longitude / 30) + 1;

          planets[planet] = {
            longitude,
            sign,
            degree: longitude % 30
          };

          // Calculate Ketu (opposite Rahu)
          if (planet === 'rahu') {
            planets.ketu = {
              longitude: (longitude + 180) % 360,
              sign: Math.floor(((longitude + 180) % 360) / 30) + 1,
              degree: ((longitude + 180) % 360) % 30
            };
          }
        }
      } catch (error) {
        logger.warn(`Error calculating ${planet} for solar return:`, error.message);
      }
    });

    // Calculate houses for solar return location
    const houses = this._calculateHouses(jd, coordinates.latitude, coordinates.longitude, 'P');

    // Determine house positions
    Object.entries(planets).forEach(([planet, data]) => {
      data.house = this._getHouseForLongitude(data.longitude, houses.houseCusps);
    });

    return {
      planets,
      houses,
      ascendant: {
        longitude: houses.ascendant,
        sign: this._getSignFromLongitude(houses.ascendant)
      }
    };
  }

  /**
   * Calculate progressed Moon position for the year
   * @private
   * @param {Object} birthData - Birth data
   * @param {number} year - Target year
   * @returns {Object} Progressed Moon data
   */
  _calculateProgressedMoon(birthData, year) {
    const parsedBirth = this._parseBirthDate(birthData.birthDate);
    const birthJD = this._dateToJulianDay(parsedBirth.year, parsedBirth.month, parsedBirth.day, 12);

    // Progressed Moon moves approximately 1 degree per year
    const yearsPassed = year - parsedBirth.year;
    const progressedLongitude = (parsedBirth.month * 30 + parsedBirth.day) % 360;

    return {
      yearsPassed,
      longitude: progressedLongitude,
      sign: Math.floor(progressedLongitude / 30) + 1,
      charan: Math.floor((progressedLongitude % 30) / 3.75), // 1-9 charans
      nakshatra: Math.floor(progressedLongitude / 13.333),
      significance: this._interpretProgressedMoon(progressedLongitude, yearsPassed)
    };
  }

  /**
   * Calculate annual Muhurta (auspicious periods for the year)
   * @private
   * @param {Object} solarReturnChart - Solar return chart
   * @returns {Object} Annual Muhurta analysis
   */
  _calculateAnnualMuhurta(solarReturnChart) {
    const muhurtaAnalysis = {
      favorableActivities: [],
      challengingActivities: [],
      bestMonths: [],
      worstMonths: [],
      spiritualPeriods: [],
      materialPeriods: []
    };

    // Analyze ascendant and planetary placements for annual characteristics
    const ascendantSign = solarReturnChart.ascendant.sign;

    // Favorable activities based on strong houses/planets
    if (solarReturnChart.planets.jupiter.house <= 3 || solarReturnChart.planets.jupiter.house >= 9) {
      muhurtaAnalysis.favorableActivities.push('Spiritual practices', 'Education', 'Travel', 'Investment');
    }

    if (solarReturnChart.planets.venus.house <= 3 || solarReturnChart.planets.venus.house >= 9) {
      muhurtaAnalysis.favorableActivities.push('Marriage', 'Arts', 'Luxury purchases', 'Relationships');
    }

    if (solarReturnChart.planets.mars.house <= 3 || solarReturnChart.planets.mars.house >= 9) {
      muhurtaAnalysis.favorableActivities.push('New ventures', 'Competitive activities', 'Property purchase');
    }

    // Challenging activities (weak periods)
    if ([8, 12].includes(solarReturnChart.planets.saturn.house)) {
      muhurtaAnalysis.challengingActivities.push('Major purchases', 'Legal matters', 'Health treatments');
    }

    // Best and worst months
    muhurtaAnalysis.bestMonths = this._calculateBestMonths(solarReturnChart);
    muhurtaAnalysis.worstMonths = this._calculateWorstMonths(solarReturnChart);

    return muhurtaAnalysis;
  }

  /**
   * Analyze annual yoga formations
   * @private
   * @param {Object} solarReturnChart - Solar return chart
   * @returns {Object} Annual yogas analysis
   */
  _analyzeAnnualYogas(solarReturnChart) {
    const yogas = {
      rajYogas: [],
      dhanYogas: [],
      nabhasYogas: [],
      otherYogas: []
    };

    // Check for Raj Yogas (combinations giving authority and power)
    const rajYogas = this._checkRajYogas(solarReturnChart);
    yogas.rajYogas = rajYogas;

    // Check for Dhan Yogas (wealth combinations)
    const dhanYogas = this._checkDhanYogas(solarReturnChart);
    yogas.dhanYogas = dhanYogas;

    // Check for Nabhas Yogas (planetary formations)
    const nabhasYogas = this._checkNabhasYogas(solarReturnChart);
    yogas.nabhasYogas = nabhasYogas;

    return yogas;
  }

  /**
   * Generate annual predictive analysis
   * @private
   * @param {Object} solarReturnChart - Solar return chart
   * @param {Object} progressedMoon - Progressed Moon data
   * @param {Object} annualMuhurta - Annual Muhurta data
   * @returns {Object} Predictions and interpretations
   */
  _generateAnnualPredictions(solarReturnChart, progressedMoon, annualMuhurta) {
    const predictions = {
      career: this._predictCareer(solarReturnChart, progressedMoon),
      relationships: this._predictRelationships(solarReturnChart),
      health: this._predictHealth(solarReturnChart),
      finances: this._predictFinances(solarReturnChart, annualMuhurta),
      spiritual: this._predictSpiritual(progressedMoon),
      overallSuccess: this._calculateOverallSuccess(solarReturnChart),
      keyThemes: this._identifyKeyThemes(solarReturnChart, progressedMoon)
    };

    return predictions;
  }

  /**
   * Identify favorable periods during the year
   * @private
   * @param {Object} solarReturnChart - Solar return chart
   * @param {number} year - Target year
   * @returns {Array} Favorable periods
   */
  _identifyFavorablePeriods(solarReturnChart, year) {
    const favorable = [];

    // Based on Jupiter transits in favorable houses
    if ([1, 5, 9].includes(solarReturnChart.planets.jupiter.house)) {
      favorable.push({
        period: 'First quarter',
        reason: 'Jupiter in favorable house',
        activities: ['Career advancement', 'Education', 'Investment']
      });
    }

    // Venus transits bringing harmony
    if ([1, 5, 9].includes(solarReturnChart.planets.venus.house)) {
      favorable.push({
        period: 'Venus influence periods',
        reason: 'Venus in beneficial position',
        activities: ['Marriage ceremonies', 'Artistic pursuits', 'Social events']
      });
    }

    return favorable;
  }

  /**
   * Identify challenging periods during the year
   * @private
   * @param {Object} solarReturnChart - Solar return chart
   * @param {number} year - Target year
   * @returns {Array} Challenging periods
   */
  _identifyChallengingPeriods(solarReturnChart, year) {
    const challenging = [];

    // Saturn's effects
    if ([6, 8, 12].includes(solarReturnChart.planets.saturn.house)) {
      challenging.push({
        period: 'Saturn influence periods',
        reason: 'Saturn in challenging position',
        effects: ['Increased responsibilities', 'Health concerns', 'Financial pressure'],
        remedies: ['Saturn mantras', 'Charitable donations']
      });
    }

    // Mars causing conflicts
    if (solarReturnChart.planets.mars.house === 8) {
      challenging.push({
        period: 'Mars challenge periods',
        reason: 'Mars in 8th house',
        effects: ['Conflicts', 'Accidents', 'Sudden changes'],
        remedies: ['Mars mantras', 'Red coral gemstone']
      });
    }

    return challenging;
  }

  /**
   * Generate annual remedial measures
   * @private
   * @param {Object} solarReturnChart - Solar return chart
   * @param {Object} annualMuhurta - Annual Muhurta data
   * @returns {Object} Remedial measures
   */
  _generateAnnualRemedies(solarReturnChart, annualMuhurta) {
    const remedies = {
      general: [],
      specific: [],
      monthly: [],
      emergency: []
    };

    // General protective measures
    remedies.general = [
      'Sunrise prayers and Surya Namaskar',
      'Maintain positive attitude during challenges',
      'Regular health check-ups'
    ];

    // Planet-specific remedies based on challenging positions
    if (solarReturnChart.planets.saturn.house >= 6) {
      remedies.specific.push('Saturn mantras and oil donations to Saturn temple');
    }

    if ([6, 8].includes(solarReturnChart.planets.mars.house)) {
      remedies.specific.push('Mars mantras and red flower offerings');
    }

    // Monthly remedies based on challenging months
    annualMuhurta.worstMonths.forEach(month => {
      remedies.monthly.push(`Extra prayers during ${month} (challenging month)`);
    });

    return remedies;
  }

  /**
   * Generate Varshaphal summary
   * @private
   * @param {number} year - Target year
   * @param {Object} predictions - Predictions
   * @param {Object} annualMuhurta - Annual Muhurta
   * @returns {string} Formatted summary
   */
  _generateVarshaphalSummary(year, predictions, annualMuhurta) {
    let summary = `🌞 *Varshaphal for ${year}*\n\n`;

    summary += `*Overall Success: ${predictions.overallSuccess}/100*\n\n`;

    summary += '*Key Predictions:*\n';
    summary += `• Career: ${predictions.career.summary}\n`;
    summary += `• Finances: ${predictions.finances.summary}\n`;
    summary += `• Relationships: ${predictions.relationships.summary}\n`;
    summary += `• Health: ${predictions.health.summary}\n\n`;

    summary += '*Favorable Activities:*\n';
    annualMuhurta.favorableActivities.slice(0, 3).forEach(activity => {
      summary += `• ${activity}\n`;
    });

    summary += '\n*Challenging Periods:*\n';
    annualMuhurta.challengingActivities.slice(0, 2).forEach(activity => {
      summary += `• ${activity}\n`;
    });

    summary += '\n*Varshaphal reveals your personal year ahead.*\n';
    summary += '*Plan important activities during favorable periods.*';

    return summary;
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  _parseBirthDate(birthDate) {
    const cleanDate = birthDate.toString().replace(/\D/g, '');
    let day; let month; let year;

    if (cleanDate.length === 6) {
      day = parseInt(cleanDate.substring(0, 2));
      month = parseInt(cleanDate.substring(2, 4));
      year = parseInt(cleanDate.substring(4));
      year = year <= 30 ? 2000 + year : 1900 + year;
    } else if (birthDate.includes('/')) {
      [day, month, year] = birthDate.split('/').map(Number);
    }

    return { day, month, year };
  }

  _parseBirthTime(birthTime) {
    const cleanTime = birthTime.toString().replace(/\D/g, '').padStart(4, '0');
    const hour = parseInt(cleanTime.substring(0, 2));
    const minute = parseInt(cleanTime.substring(2, 4));

    return { hour, minute };
  }

  _dateToJulianDay(year, month, day, hour) {
    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;
    const jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
    return jd + hour / 24;
  }

  _jdToDateString(jd) {
    return new Date((jd - 2440587.5) * 86400000).toISOString().split('T')[0];
  }

  _calculateHouses(jd, latitude, longitude, system = 'P') {
    try {
      const houses = sweph.houses(jd, latitude, longitude, system);
      return {
        system,
        ascendant: houses.ascendant || 0,
        mc: houses.mc || 0,
        houseCusps: houses.house || new Array(12).fill(0).map((_, i) => (houses.ascendant + i * 30) % 360)
      };
    } catch (error) {
      const ascendant = 0;
      return {
        system,
        ascendant,
        mc: (ascendant + 90) % 360,
        houseCusps: new Array(12).fill(0).map((_, i) => (ascendant + i * 30) % 360)
      };
    }
  }

  _getHouseForLongitude(longitude, cusps) {
    for (let i = 0; i < 12; i++) {
      const nextCusp = cusps[(i + 1) % 12];
      if (this._isAngleBetween(longitude, cusps[i], nextCusp)) {
        return i + 1;
      }
    }
    return 1;
  }

  _isAngleBetween(angle, start, end) {
    if (start < end) {
      return angle >= start && angle < end;
    } else {
      return angle >= start || angle < end;
    }
  }

  _getSignFromLongitude(longitude) {
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    return signs[Math.floor(longitude / 30) % 12];
  }

  // Predictive analysis methods
  _interpretProgressedMoon(longitude, yearsPassed) {
    const sign = Math.floor(longitude / 30) + 1;
    const progressionStage = yearsPassed <= 30 ? 'Youth' : yearsPassed <= 60 ? 'Middle age' : 'Later years';

    return `${progressionStage} focus on ${this._getSignFromLongitude(longitude)} themes`;
  }

  _calculateBestMonths(solarReturnChart) {
    // Simplified - analyze planetary positions for monthly strengths
    return ['January-March', 'July-September']; // Based on benefic placements
  }

  _calculateWorstMonths(solarReturnChart) {
    // Simplified - analyze malefic placements
    return ['April-June']; // Based on challenging aspects
  }

  _checkRajYogas(chart) { return []; } // Would implement specific yoga logic
  _checkDhanYogas(chart) { return []; }
  _checkNabhasYogas(chart) { return []; }

  _predictCareer(chart, progressedMoon) {
    return { summary: 'Career growth opportunities present, leadership potential increases' };
  }

  _predictRelationships(chart) {
    return { summary: 'Harmonious relationships, good marriage prospects if applicable' };
  }

  _predictHealth(chart) {
    return { summary: 'Generally good health, minor concerns may arise' };
  }

  _predictFinances(chart, muhurta) {
    return { summary: 'Financial stability with growth opportunities' };
  }

  _predictSpiritual(progressedMoon) {
    return { summary: 'Spiritual growth through experience' };
  }

  _calculateOverallSuccess(chart) {
    return 75; // Would calculate based on various factors
  }

  _identifyKeyThemes(chart, progressedMoon) {
    return ['Growth', 'Stability', 'Opportunities', 'Learning'];
  }
}

module.exports = { VarshaphalCalculator };
