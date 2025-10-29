const logger = require('../../../../utils/logger');

class DashaAnalysisCalculator {
  constructor() {
    logger.info('Module: DashaAnalysisCalculator loaded - Vimshottari Dasha Analysis');
    this.initializeDashaSystem();
  }

  initializeDashaSystem() {
    // Initialize dasha periods, planetary timings, etc.
    this.dashaOrder = ['sun', 'moon', 'mars', 'rahu', 'jupiter', 'saturn', 'mercury', 'ketu', 'venus'];
    this.dashaPeriods = {
      sun: 6, moon: 10, mars: 7, rahu: 18, jupiter: 16, saturn: 19, mercury: 17, ketu: 7, venus: 20
    };
  }

  async calculateVimshottariDasha(birthData) {
    try {
      const { birthDate, birthTime, birthPlace } = birthData;

      if (!birthDate || !birthTime || !birthPlace) {
        return { error: 'Complete birth details required for Dasha analysis' };
      }

      // Parse birth date and time
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);

      // Get birth location
      const locationInfo = await this.geocodingService.getLocationInfo(birthPlace);
      const birthDateTime = new Date(year, month - 1, day, hour, minute);

      // Calculate Julian Day for birth
      const jd = this._dateToJulianDay(year, month, day, hour + minute / 60);

      // Calculate Moon's longitude at birth
      const moonPos = await this._getMoonLongitude(jd, locationInfo);
      const birthNakshatra = this._getNakshatraFromLongitude(moonPos);

      // Determine starting Dasha based on Moon's Nakshatra
      const startingDasha = this._getStartingDasha(birthNakshatra);
      const startingDashaPeriod = this.dashaPeriods[startingDasha];

      // Calculate current Dasha periods
      const now = new Date();
      const currentPeriods = this._calculateCurrentDashaPeriods(
        birthDateTime,
        startingDasha,
        startingDashaPeriod,
        moonPos,
        now
      );

      // Analyze current Mahadasha
      const currentMahadasha = currentPeriods.currentMahadasha;
      const mahadashaAnalysis = this._analyzeMahadasha(currentMahadasha.planet);

      return {
        birthNakshatra,
        startingDasha: currentMahadasha.planet,
        currentMahadasha: {
          planet: currentMahadasha.planet,
          startDate: currentMahadasha.startDate,
          endDate: currentMahadasha.endDate,
          remainingYears: currentMahadasha.remainingYears
        },
        nextMahadasha: currentPeriods.nextMahadasha,
        bhuktiPeriod: currentPeriods.bhuktiPeriod,
        analysis: mahadashaAnalysis,
        summary: this._generateDashaSummary(currentMahadasha, mahadashaAnalysis, birthData)
      };
    } catch (error) {
      logger.error('Error calculating Vimshottari Dasha:', error);
      return { error: 'Unable to calculate Vimshottari Dasha at this time' };
    }
  }

  setServices(vedicCalculator) {
    this.vedicCalculator = vedicCalculator;
    this.geocodingService = vedicCalculator.geocodingService;
  }

  /**
   * Get Moon's longitude at birth
   * @private
   * @param {number} jd - Julian Day
   * @param {Object} locationInfo - Location coordinates
   * @returns {number} Moon longitude in degrees
   */
  async _getMoonLongitude(jd, locationInfo) {
    try {
      const sweph = require('sweph');
      const position = sweph.calc(jd, 1, 2 | 65536); // Moon calculation
      return position.longitude ? position.longitude[0] : 0;
    } catch (error) {
      logger.warn('Error calculating Moon position:', error.message);
      // Fallback: simple calculation
      return (jd * 13.176396) % 360; // Moon moves ~13.2 degrees per day
    }
  }

  /**
   * Get Nakshatra from longitude
   * @private
   * @param {number} longitude - Moon longitude
   * @returns {Object} Nakshatra details
   */
  _getNakshatraFromLongitude(longitude) {
    // Normalized longitude to 0-360
    longitude = ((longitude % 360) + 360) % 360;

    // Each Nakshatra is 13°20' = 13.333°
    const nakshatraSize = 13.333333;

    const nakshatras = [
      'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
      'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
      'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
      'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
      'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
    ];

    const lords = [
      'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu',
      'Jupiter', 'Saturn', 'Mercury', 'Ketu', 'Venus', 'Sun',
      'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury',
      'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu',
      'Jupiter', 'Saturn', 'Mercury'
    ];

    const index = Math.floor(longitude / nakshatraSize);
    const nakshatra = nakshatras[index];
    const lord = lords[index];

    return { nakshatra, lord, index };
  }

  /**
   * Get starting Dasha based on Moon's Nakshatra
   * @private
   * @param {Object} nakshatraInfo - Nakshatra details
   * @returns {string} Starting Dasha planet
   */
  _getStartingDasha(nakshatraInfo) {
    return nakshatraInfo.lord.toLowerCase();
  }

  /**
   * Calculate current Dasha periods
   * @private
   * @param {Date} birthDate - Birth date
   * @param {string} startingDasha - Starting Dasha planet
   * @param {number} startingPeriod - Starting period in years
   * @param {number} moonLongitude - Moon longitude at birth
   * @param {Date} currentDate - Current date
   * @returns {Object} Current Dasha periods
   */
  _calculateCurrentDashaPeriods(birthDate, startingDasha, startingPeriod, moonLongitude, currentDate) {
    // Calculate elapsed time since birth
    const elapsedMs = currentDate.getTime() - birthDate.getTime();
    const elapsedYears = elapsedMs / (1000 * 60 * 60 * 24 * 365.25);

    // Find current Mahadasha
    let remainingYears = elapsedYears;
    let currentMahadasha = null;
    let nextMahadasha = null;
    let dashaIndex = 0;

    // Find the starting Dasha planet in the sequence
    const startIndex = this.dashaOrder.indexOf(startingDasha);
    if (startIndex === -1) {
      return { error: 'Invalid starting Dasha' };
    }

    // Calculate through the Dasha sequence
    for (let i = 0; i < this.dashaOrder.length * 2; i++) {
      const planetIndex = (startIndex + i) % this.dashaOrder.length;
      const planet = this.dashaOrder[planetIndex];
      const period = this.dashaPeriods[planet];

      if (remainingYears < period) {
        // This is the current Mahadasha
        currentMahadasha = {
          planet,
          startDate: new Date(currentDate.getTime() - (remainingYears * 365.25 * 24 * 60 * 60 * 1000)),
          endDate: new Date(currentDate.getTime() + ((period - remainingYears) * 365.25 * 24 * 60 * 60 * 1000)),
          remainingYears: period - remainingYears
        };

        // Calculate next Mahadasha
        const nextPlanetIndex = (planetIndex + 1) % this.dashaOrder.length;
        const nextPlanet = this.dashaOrder[nextPlanetIndex];
        nextMahadasha = {
          planet: nextPlanet,
          period: this.dashaPeriods[nextPlanet],
          startDate: currentMahadasha.endDate
        };
        break;
      }
      remainingYears -= period;
    }

    // Calculate Bhukti (sub-period) within current Mahadasha
    const bhuktiPeriod = this._calculateBhuktiPeriod(currentMahadasha, currentDate);

    return {
      currentMahadasha,
      nextMahadasha,
      bhuktiPeriod,
      elapsedYears
    };
  }

  /**
   * Calculate Bhukti period within Mahadasha
   * @private
   * @param {Object} mahadasha - Current Mahadasha
   * @param {Date} currentDate - Current date
   * @returns {Object} Bhukti period details
   */
  _calculateBhuktiPeriod(mahadasha, currentDate) {
    const mahadashaElapsed = (currentDate.getTime() - mahadasha.startDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    const mahadashaProgress = mahadashaElapsed / mahadasha.remainingYears; // Percentage completed

    // Simplified Bhukti calculation (in practice, this is complex)
    return {
      progress: Math.round(mahadashaProgress * 100),
      phase: mahadashaProgress < 0.33 ? 'Early' : mahadashaProgress < 0.67 ? 'Middle' : 'Late'
    };
  }

  /**
   * Analyze Mahadasha characteristics
   * @private
   * @param {string} planet - Mahadasha planet
   * @returns {Object} Analysis of the planet's influence
   */
  _analyzeMahadasha(planet) {
    const planetCharacteristics = {
      sun: {
        themes: ['leadership', 'confidence', 'authority', 'health', 'father'],
        positive: ['new beginnings', 'career advancement', 'increased vitality'],
        challenges: ['ego conflicts', 'health issues', 'authority struggles'],
        areas: ['career', 'health', 'leadership roles']
      },
      moon: {
        themes: ['emotions', 'mind', 'mother', 'home', 'comfort'],
        positive: ['emotional stability', 'domestic harmony', 'intuitive insights'],
        challenges: ['mood swings', 'attachment issues', 'uncertainty'],
        areas: ['relationships', 'home', 'mental health']
      },
      mars: {
        themes: ['energy', 'action', 'conflict', 'passion', 'strength'],
        positive: ['increased energy', 'new projects', 'physical strength'],
        challenges: ['aggression', 'accidents', 'impulsive decisions'],
        areas: ['career', 'health', 'relationships']
      },
      mercury: {
        themes: ['communication', 'learning', 'intellect', 'adaptability', 'skills'],
        positive: ['learning opportunities', 'communication skills', 'mental clarity'],
        challenges: ['anxiety', 'overthinking', 'health issues'],
        areas: ['education', 'communication', 'business']
      },
      jupiter: {
        themes: ['growth', 'wisdom', 'abundance', 'spirituality', 'luck'],
        positive: ['expansion', 'success', 'spiritual growth', 'good fortune'],
        challenges: ['complacency', 'over-confidence', 'weight gain'],
        areas: ['career', 'wealth', 'spirituality']
      },
      venus: {
        themes: ['love', 'beauty', 'harmony', 'art', 'relationships'],
        positive: ['relationships', 'artistic expression', 'material comfort'],
        challenges: ['indulgences', 'attachment', 'financial issues'],
        areas: ['relationships', 'art', 'finances']
      },
      saturn: {
        themes: ['discipline', 'responsibility', 'karma', 'structure', 'reality'],
        positive: ['maturity', 'achievement', 'spiritual understanding'],
        challenges: ['delays', 'restrictions', 'depression', 'hardships'],
        areas: ['career', 'responsibility', 'spiritual growth']
      },
      rahu: {
        themes: ['ambition', 'change', 'transformation', 'foreign matters', 'illusion'],
        positive: ['new opportunities', 'spiritual awakening', 'worldly success'],
        challenges: ['confusion', 'addictions', 'unethical behavior'],
        areas: ['career', 'foreign travel', 'spiritual practices']
      },
      ketu: {
        themes: ['spirituality', 'detachment', 'past life', 'wisdom', 'liberation'],
        positive: ['spiritual insight', 'letting go', 'inner peace'],
        challenges: ['detachment from loved ones', 'isolation', 'confusion'],
        areas: ['spirituality', 'past life issues', 'inner growth']
      }
    };

    return planetCharacteristics[planet] || {
      themes: ['unknown influences'],
      positive: ['general development'],
      challenges: ['various life lessons'],
      areas: ['personal growth']
    };
  }

  /**
   * Generate Dasha summary
   * @private
   * @param {Object} mahadasha - Current Mahadasha
   * @param {Object} analysis - Mahadasha analysis
   * @returns {string} Summary text
   */
  _generateDashaSummary(mahadasha, analysis, birthData) {
    let summary = `🕐 *${mahadasha.planet.charAt(0).toUpperCase() + mahadasha.planet.slice(1)} Mahadasha Analysis*\n\n`;

    summary += `*Period:* ${mahadasha.startDate.toLocaleDateString()} - ${mahadasha.endDate.toLocaleDateString()}\n`;
    summary += `*Remaining:* ${mahadasha.remainingYears.toFixed(1)} years\n\n`;

    summary += `*Themes:* ${analysis.themes.join(', ')}\n\n`;

    summary += '*Positive Influences:*\n';
    analysis.positive.forEach(item => {
      summary += `• ${item}\n`;
    });

    summary += '\n*Challenges & Growth Opportunities:*\n';
    analysis.challenges.forEach(item => {
      summary += `• ${item}\n`;
    });

    summary += '\n*Key Areas:* ' + analysis.areas.join(', ');

    return summary;
  }

  /**
   * Convert date to Julian Day
   * @private
   * @param {number} year - Year
   * @param {number} month - Month (1-12)
   * @param {number} day - Day
   * @param {number} hour - Hour (decimal)
   * @returns {number} Julian Day
   */
  _dateToJulianDay(year, month, day, hour) {
    // Simplified Julian Day calculation
    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;

    const jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
    return jd + hour / 24;
  }
}

module.exports = { DashaAnalysisCalculator };