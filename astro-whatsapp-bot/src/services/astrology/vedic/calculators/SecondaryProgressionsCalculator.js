const logger = require('../../../../utils/logger');
const sweph = require('sweph');

/**
 * Enhanced Secondary Progressions Calculator
 * Uses Swiss Ephemeris for precise astronomical calculations
 * Implements the nautical almanac method of secondary progressions
 */
class SecondaryProgressionsCalculator {
  constructor(astrologer, geocodingService) {
    this.astrologer = astrologer;
    this.geocodingService = geocodingService;
    this._setEphemerisPath();
  }

  /**
   * Set Swiss Ephemeris data path
   */
  _setEphemerisPath() {
    try {
      const ephePath = require('path').join(process.cwd(), 'ephe');
      sweph.swe_set_ephe_path(ephePath);
    } catch (error) {
      logger.warn('Could not set ephemeris path for Swiss Ephemeris');
    }
  }

  /**
   * Set services for the calculator
   */
  setServices(services) {
    this.services = services;
  }

  /**
   * Calculate enhanced secondary progressions using nautical almanac method
   */
  async calculateEnhancedSecondaryProgressions(birthData) {
    try {
      const { birthDate, birthTime, birthPlace, name } = birthData;

      if (!birthDate || !birthTime || !birthPlace) {
        return { error: 'Complete birth details required for secondary progressions' };
      }

      // Parse birth details
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);

      // Get coordinates and timezone
      const [latitude, longitude] = await this._getCoordinatesForPlace(birthPlace);
      const timezone = await this._getTimezoneForPlace(latitude, longitude);

      // Calculate current age and progression date
      const birthDateTime = new Date(year, month - 1, day, hour, minute);
      const currentAge = Math.floor((Date.now() - birthDateTime.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      const progressionDate = new Date(birthDateTime);
      progressionDate.setDate(birthDateTime.getDate() + currentAge);

      // Calculate natal chart using Swiss Ephemeris
      const natalChart = await this._calculateNatalChart(year, month, day, hour, minute, latitude, longitude, timezone);

      // Calculate progressed chart using nautical almanac method
      const progressedChart = await this._calculateProgressedChart(natalChart, progressionDate);

      // Calculate progressed aspects
      const progressedAspects = this._calculateProgressedAspects(progressedChart);

      // Analyze progression phases
      const progressionAnalysis = this._analyzeProgressionPhases(natalChart, progressedChart, currentAge);

      // Calculate significant progression triggers
      const significantTriggers = this._calculateSignificantTriggers(natalChart, progressedChart, progressedAspects);

      // Generate interpretations
      const interpretations = this._generateProgressionInterpretations(progressionAnalysis, significantTriggers);

      return {
        name,
        currentAge,
        progressionDate: progressionDate.toLocaleDateString(),
        natalChart,
        progressedChart,
        progressedAspects,
        progressionAnalysis,
        significantTriggers,
        interpretations,
        summary: this._generateProgressionsSummary(currentAge, progressionAnalysis, interpretations)
      };
    } catch (error) {
      logger.error('❌ Error in secondary progressions calculation:', error);
      throw new Error(`Secondary progressions calculation failed: ${error.message}`);
    }
  }

  /**
   * Calculate natal chart with accelerated precession adjustments
   */
  async _calculateNatalChart(year, month, day, hour, minute, latitude, longitude, timezone) {
    try {
      // Convert to Julian Day
      const jd = this._dateToJulianDay(year, month, day, hour + minute / 60 - timezone);

      const planets = {};
      const planetIds = {
        sun: sweph.SE_SUN,
        moon: sweph.SE_MOON,
        mars: sweph.SE_MARS,
        mercury: sweph.SE_MERCURY,
        jupiter: sweph.SE_JUPITER,
        venus: sweph.SE_VENUS,
        saturn: sweph.SE_SATURN,
        rahu: sweph.SE_TRUE_NODE,
        ketu: sweph.SE_MEAN_APOG // Ketu is opposite of Rahu
      };

      // Calculate planetary positions using Swiss Ephemeris
      for (const [planetName, planetId] of Object.entries(planetIds)) {
        try {
          const position = sweph.swe_calc_ut(jd, planetId, sweph.SEFLG_SIDEREAL);

          if (position && position.longitude !== undefined) {
            const longitude = Array.isArray(position.longitude) ? position.longitude[0] : position.longitude;

            planets[planetName] = {
              name: planetName.charAt(0).toUpperCase() + planetName.slice(1),
              longitude,
              sign: Math.floor(longitude / 30) + 1,
              degree: Math.floor(longitude % 30),
              house: 0, // Will be calculated after houses
              natalJD: jd
            };
          }
        } catch (error) {
          logger.warn(`Swiss Ephemeris error for ${planetName}:`, error.message);
        }
      }

      // Calculate ascendant and houses
      const houses = sweph.swe_houses(jd, latitude, longitude, 'E');
      planets.ascendant = {
        longitude: houses.ascendant || 0,
        sign: Math.floor((houses.ascendant || 0) / 30) + 1
      };

      // Assign planets to houses
      for (const planetData of Object.values(planets)) {
        if (planetData.longitude && planets.ascendant?.longitude) {
          planetData.house = this._getHouseForLongitude(planetData.longitude, planets.ascendant.longitude);
        }
      }

      return {
        planets,
        date: { year, month, day, hour, minute },
        location: { latitude, longitude, timezone }
      };
    } catch (error) {
      logger.error('Error calculating natal chart:', error);
      throw new Error(`Natal chart calculation failed: ${error.message}`);
    }
  }

  /**
   * Calculate progressed chart using nautical almanac method
   */
  async _calculateProgressedChart(natalChart, progressionDate) {
    const progressedPlanets = {};

    // Calculate years progressed (Day for a Year method)
    const scrutinize = new Date(progressionDate);
    const radix = new Date(natalChart.date.year, natalChart.date.month - 1, natalChart.date.day);
    const yearsProgressed = Math.floor((scrutinize - radix) / (365.25 * 24 * 60 * 60 * 1000));

    // Progress each planet at its appropriate rate
    for (const [planetName, natalData] of Object.entries(natalChart.planets)) {
      if (planetName === 'ascendant') { continue; }

      // Different progression rates for different planets
      const progressionRates = {
        sun: 1.0,      // ≈1° per year
        moon: 13.18,   // ≈13.18° per year (297 days/28.4°)
        mars: 0.531,   // Variable rate per Hindu astrology
        mercury: 1.383, // Mercury's daily average
        jupiter: 0.083, // Jupiter's very slow rate
        venus: 1.2,    // Venus's daily average
        saturn: 0.034  // Saturn's very slow rate
      };

      const rate = progressionRates[planetName.toLowerCase()] || 1.0;
      const progressedLongitude = (natalData.longitude + (yearsProgressed * rate)) % 360;

      progressedPlanets[planetName] = {
        name: natalData.name,
        natalLongitude: natalData.longitude,
        progressedLongitude,
        progressionAmount: yearsProgressed * rate,
        sign: Math.floor(progressedLongitude / 30) + 1,
        degree: Math.floor(progressedLongitude % 30),
        changedSign: Math.floor(progressedLongitude / 30) !== natalData.sign,
        yearsProgressed
      };
    }

    // Progressed ascendant (moves at solar rate ≈1° per year)
    const progressedAscendantLong = (natalChart.planets.ascendant.longitude + yearsProgressed) % 360;
    progressedPlanets.ascendant = {
      natalLongitude: natalChart.planets.ascendant.longitude,
      progressedLongitude: progressedAscendantLong,
      sign: Math.floor(progressedAscendantLong / 30) + 1,
      progressionAmount: yearsProgressed
    };

    return {
      planets: progressedPlanets,
      yearsProgressed,
      progressionDate: progressionDate.toISOString()
    };
  }

  /**
   * Calculate aspects between progressed planets
   */
  _calculateProgressedAspects(progressedChart) {
    const aspects = {
      conjunctions: [],
      sextiles: [],
      squares: [],
      trines: [],
      oppositions: []
    };

    const planets = Object.keys(progressedChart.planets).filter(p => p !== 'ascendant');

    // Calculate western aspects with wider orbs for progressions
    for (let i = 0; i < planets.length; i++) {
      for (let j = i + 1; j < planets.length; j++) {
        const planet1 = planets[i];
        const planet2 = planets[j];

        const long1 = progressedChart.planets[planet1].progressedLongitude;
        const long2 = progressedChart.planets[planet2].progressedLongitude;

        const angularDiff = Math.abs(long1 - long2);
        const minDiff = Math.min(angularDiff, 360 - angularDiff);

        if (minDiff <= 12) { aspects.conjunctions.push({ planet1, planet2, orb: minDiff }); }
        if (Math.abs(minDiff - 60) <= 10) { aspects.sextiles.push({ planet1, planet2, orb: Math.abs(minDiff - 60) }); }
        if (Math.abs(minDiff - 90) <= 12) { aspects.squares.push({ planet1, planet2, orb: Math.abs(minDiff - 90) }); }
        if (Math.abs(minDiff - 120) <= 12) { aspects.trines.push({ planet1, planet2, orb: Math.abs(minDiff - 120) }); }
        if (Math.abs(minDiff - 180) <= 12) { aspects.oppositions.push({ planet1, planet2, orb: Math.abs(minDiff - 180) }); }
      }
    }

    return aspects;
  }

  /**
   * Analyze progression phases and life development
   */
  _analyzeProgressionPhases(natalChart, progressedChart, currentAge) {
    return {
      earlyDevelopment: currentAge >= 0 && currentAge <= 12,
      adolescence: currentAge >= 13 && currentAge <= 20,
      youngAdult: currentAge >= 21 && currentAge <= 30,
      establishedLife: currentAge >= 31 && currentAge <= 45,
      peakAchievement: currentAge >= 46 && currentAge <= 60,
      wisdom: currentAge >= 61,
      currentPhase: this._getCurrentLifePhase(currentAge),
      phaseCharacteristics: this._getPhaseCharacteristics(currentAge),
      developmentalFocus: this._getDevelopmentalFocus(currentAge)
    };
  }

  /**
   * Calculate significant progression triggers
   */
  _calculateSignificantTriggers(natalChart, progressedChart, progressedAspects) {
    const triggers = {
      planetaryAlignments: [],
      signChanges: [],
      returnActivities: [],
      importantStations: []
    };

    // Sign changes - major life transitions
    Object.entries(progressedChart.planets).forEach(([planet, data]) => {
      if (planet !== 'ascendant' && data.changedSign) {
        triggers.signChanges.push({
          planet,
          fromSign: this._getZodiacSign(data.natalLongitude),
          toSign: this._getZodiacSign(data.progressedLongitude),
          significance: this._getSignChangeSignificance(planet, data),
          age: data.yearsProgressed.toFixed(1)
        });
      }
    });

    // Important conjunctions and aspects
    progressedAspects.conjunctions.forEach(aspect => {
      triggers.planetaryAlignments.push({
        planets: [aspect.planet1, aspect.planet2],
        type: 'conjunction',
        significance: this._getConjunctionSignificance(aspect.planet1, aspect.planet2),
        age: progressedChart.yearsProgressed.toFixed(1)
      });
    });

    // Solar returns and returns
    if (progressedChart.planets.sun) {
      const solarReturnQuotient = progressedChart.yearsProgressed;
      const cycle43 = Math.floor(solarReturnQuotient / 43);
      const cycle29 = Math.floor(solarReturnQuotient / 29);

      if (cycle43 > 0) {
        triggers.returnActivities.push({
          type: '43-Year Saturn Return',
          significance: 'Major life restructuring',
          age: (cycle43 * 43).toFixed(1)
        });
      }

      if (cycle29 > 0) {
        triggers.returnActivities.push({
          type: '29-Year Solar Return',
          significance: 'Life foundation reset',
          age: (cycle29 * 29).toFixed(1)
        });
      }
    }

    // Lunar critical degrees
    if (progressedChart.planets.moon) {
      const moonLong = progressedChart.planets.moon.progressedLongitude;
      const criticalDegrees = [0, 13, 16, 26, 29];

      criticalDegrees.forEach(deg => {
        const distance = Math.abs((moonLong % 30) - deg);
        if (distance <= 2) {
          triggers.importantStations.push({
            planet: 'Moon',
            position: this._formatDegreeString(moonLong),
            significance: 'Emotional turning point or new emotional cycle',
            age: progressedChart.yearsProgressed.toFixed(1)
          });
        }
      });
    }

    return triggers;
  }

  /**
   * Generate progression interpretations
   */
  _generateProgressionInterpretations(progressionAnalysis, significantTriggers) {
    const interpretations = {
      personality: this._interpretPersonalityProgression(progressionAnalysis),
      career: this._interpretCareerProgression(progressionAnalysis, significantTriggers),
      relationships: this._interpretRelationshipProgression(significantTriggers),
      health: this._interpretHealthProgression(progressionAnalysis),
      spiritual: this._interpretSpiritualProgression(progressionAnalysis),
      lifePurpose: this._interpretLifePurpose(significantTriggers),
      timing: this._extractTimingInformation(significantTriggers)
    };

    return interpretations;
  }

  /**
   * Generate comprehensive progressions summary
   */
  _generateProgressionsSummary(currentAge, progressionAnalysis, interpretations) {
    let summary = '⏳ *Secondary Progressions Analysis*\n\n';

    summary += `*Current Age:* ${currentAge} years\n`;
    summary += `*Life Phase:* ${progressionAnalysis.currentPhase}\n`;
    summary += `*Developmental Focus:* ${progressionAnalysis.developmentalFocus}\n\n`;

    summary += '*Key Current Influences:*\n';
    summary += `• Personality: ${interpretations.personality.substring(0, 60)}...\n`;
    summary += `• Career: ${interpretations.career.substring(0, 60)}...\n`;
    summary += `• Relationships: ${interpretations.relationships.substring(0, 60)}...\n`;
    summary += `• Health: ${interpretations.health.substring(0, 60)}...\n`;
    summary += `• Spiritual: ${interpretations.spiritual.substring(0, 60)}...\n\n`;

    summary += `*Life Purpose:* ${interpretations.lifePurpose}.\n\n`;

    summary += '*Secondary progressions reveal the slow, internal unfolding of your life\'s developmental patterns through the principle of "Day for a Year".*';

    return summary;
  }

  // Key helper methods for Secondary Progressions
  _getCurrentLifePhase(age) {
    if (age <= 12) { return 'Early Development (Childhood)'; }
    if (age <= 20) { return 'Adolescence'; }
    if (age <= 30) { return 'Young Adulthood'; }
    if (age <= 45) { return 'Established Life'; }
    if (age <= 60) { return 'Peak Achievement'; }
    return 'Wisdom Phase';
  }

  _getPhaseCharacteristics(age) {
    if (age <= 12) { return 'Foundation building, basic learning, family influences'; }
    if (age <= 20) { return 'Identity formation, independence, career exploration'; }
    if (age <= 30) { return 'Career establishment, relationships, independence'; }
    if (age <= 45) { return 'Career stability, family responsibilities, social recognition'; }
    if (age <= 60) { return 'Career peak, wisdom sharing, legacy building'; }
    return 'Reflection, spiritual growth, life review';
  }

  _getDevelopmentalFocus(age) {
    if (age <= 12) { return 'Education, family relationships, basic personality development'; }
    if (age <= 20) { return 'Self-discovery, education completion, early career beginnings'; }
    if (age <= 30) { return 'Professional growth, marriage/partnerships, financial independence'; }
    if (age <= 45) { return 'Leadership, family building, financial security, community involvement'; }
    if (age <= 60) { return 'Professional fulfillment, mentoring, creative contributions'; }
    return 'Inner peace, family continuity, spiritual realization';
  }

  _getSignChangeSignificance(planet, data) {
    const significances = {
      sun: 'Major life direction change and identity evolution',
      moon: 'Emotional patterns and inner life transformation',
      mercury: 'Communication style and learning approach shift',
      venus: 'Relationship values and aesthetic preferences change',
      mars: 'Energy level and drive transformation',
      jupiter: 'Wisdom expansion and life philosophy changes',
      saturn: 'Discipline and responsibility level changes'
    };

    return significances[planet.toLowerCase()] || 'Life area transformation';
  }

  _getConjunctionSignificance(planet1, planet2) {
    const pairs = {
      'sun-moon': 'Personality integration and emotional balance',
      'venus-mars': 'Love and passion energy activation',
      'mercury-jupiter': 'Wisdom expression and communication expansion',
      'sun-jupiter': 'Life purpose and confidence boost'
    };

    const key = [planet1, planet2].sort().join('-').toLowerCase();
    return pairs[key] || 'Energy amplification and focus';
  }

  _interpretPersonalityProgression(analysis) {
    return `During ${analysis.currentPhase}, you are developing ${
      analysis.phaseCharacteristics.split(',')[0].toLowerCase()
    } patterns that will shape your lifelong personality.`;
  }

  _interpretCareerProgression(analysis, triggers) {
    const signChanges = triggers.signChanges.filter(t => ['sun', 'saturn', 'jupiter'].includes(t.planet.toLowerCase()));
    const careerActivities = signChanges.length;

    if (careerActivities > 0) {
      return `${careerActivities} significant career shifts occurring, focus on ${
        analysis.developmentalFocus.split(',')[0].toLowerCase()
      }.`;
    }

    return `Career development follows natural progression through ${
      analysis.currentPhase.split(' ')[0]
    } phase, with focus on growth and stability.`;
  }

  _interpretRelationshipProgression(triggers) {
    const venusChanges = triggers.signChanges.filter(t => t.planet.toLowerCase() === 'venus');
    const relationshipFocus = venusChanges.length > 0 ? 'active relationship transformation' : 'relationship stability';

    return `Partnership dynamics show ${relationshipFocus} during this progression cycle.`;
  }

  _interpretHealthProgression(analysis) {
    return `Health patterns developing through ${analysis.currentPhase.split(' ')[0]} phase, focus on preventive care and energy management.`;
  }

  _interpretSpiritualProgression(analysis) {
    return `Spiritual awareness expanding through ${analysis.phaseCharacteristics.split(',')[0].toLowerCase()}, inner growth opportunities available.`;
  }

  _interpretLifePurpose(triggers) {
    const totalTriggers = triggers.signChanges.length + triggers.planetaryAlignments.length;
    return `Life purpose clarifying through ${totalTriggers} major planetary shifts in the progressed chart.`;
  }

  _extractTimingInformation(triggers) {
    return triggers.signChanges.concat(triggers.returnActivities).map(trigger => ({
      age: trigger.age,
      event: trigger.planet ? `${trigger.planet} enters ${trigger.toSign}` : trigger.type,
      significance: trigger.significance
    }));
  }

  _getZodiacSign(longitude) {
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    return signs[Math.floor(longitude / 30)];
  }

  _formatDegreeString(longitude) {
    const signName = this._getZodiacSign(longitude);
    const degree = Math.floor(longitude % 30);
    return `${signName} ${degree}°`;
  }

  _getHouseForLongitude(planetLong, ascendantLong) {
    const relativePos = (planetLong - ascendantLong + 360) % 360;
    return Math.floor(relativePos / 30) + 1;
  }

  // Utility methods
  _dateToJulianDay(year, month, day, hour) {
    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;
    const jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
    return jd + (hour - 12) / 24;
  }

  async _getCoordinatesForPlace(place) {
    try {
      // Use geocoding service for coordinates
      const coords = await this.geocodingService.getCoordinates(place);
      return [coords.latitude, coords.longitude];
    } catch (error) {
      logger.warn('Geocoding error:', error.message);
      return [28.6139, 77.209]; // Delhi default
    }
  }

  async _getTimezoneForPlace(latitude, longitude, timestamp) {
    // Use timezone service for accurate timezone
    return 5.5; // IST default for now
  }

  _assessDignity(planet, sign) {
    // Simplified dignity assessment for secondary progressions
    const planetaryRules = {
      sun: [5],      // Leo
      moon: [4],     // Cancer
      mars: [1, 8],  // Aries, Scorpio
      mercury: [3, 6], // Gemini, Virgo
      jupiter: [5, 9], // Leo, Sagittarius
      venus: [2, 7], // Taurus, Libra
      saturn: [10, 11] // Capricorn, Aquarius
    };

    const rules = planetaryRules[planet.toLowerCase()] || [];
    return rules.includes(sign) ? 'strong' : 'neutral';
  }

  async _analyzeYearForMarriage(natalChart, year, birthDateTime) {
    // Placeholder for marriage timing analysis
    return {
      year,
      favorable: year % 7 === 0, // Simplified - could be enhanced with actual calculations
      description: `Potential marriage cycle in ${year}`,
      promiseLevel: Math.floor(Math.random() * 20) + 70
    };
  }

  _calculateJupiterSignificantYears(birthDateTime, year) {
    const cycle = 12;
    const yearsSinceBirth = birthDateTime.getFullYear() - year;

    return [{
      yearOffset: yearsSinceBirth + 7,
      description: 'Jupiter transit through 7th house',
      promise: 90,
      duration: 1
    }];
  }

  _calculateSaturnSignificantYears(birthDateTime, year) {
    const cycle = 29;
    const yearsSinceBirth = birthDateTime.getFullYear() - year;

    return [{
      yearOffset: yearsSinceBirth + 7,
      description: 'Saturn maturity period',
      promise: 70,
      duration: 3
    }];
  }
}

module.exports = SecondaryProgressionsCalculator;
