const logger = require('../../../utils/logger');
const sweph = require('sweph');

/**
 * LunarReturnCalculator - Monthly astrological themes and cycles
 * Handles lunar return calculations, monthly themes, and lunar cycle analysis
 */
class LunarReturnCalculator {
  constructor() {
    logger.info('Module: LunarReturnCalculator loaded - Lunar Return Analysis');
  }

  setServices(vedicCalculator) {
    this.vedicCalculator = vedicCalculator;
    this.astrologer = vedicCalculator.astrologer;
    this.geocodingService = vedicCalculator.geocodingService;
    this.vedicCore = vedicCalculator.vedicCore;
  }

  /**
   * Calculate Lunar Return analysis for monthly themes
   * @param {Object} birthData - Birth data object with birthDate, birthTime, birthPlace
   * @param {Date} targetDate - Date for lunar return (defaults to next lunar return)
   * @returns {Object} Lunar return analysis
   */
  async calculateLunarReturn(birthData, targetDate = null) {
    try {
      const { birthDate, birthTime, birthPlace } = birthData;

      if (!birthDate || !birthTime || !birthPlace) {
        return {
          error: 'Complete birth details required for lunar return analysis'
        };
      }

      // Parse birth date and time
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);

      // Get birth location coordinates
      const locationInfo =
        await this.geocodingService.getLocationInfo(birthPlace);
      const birthDateTime = new Date(year, month - 1, day, hour, minute);
      const birthTimestamp = birthDateTime.getTime();

      // Calculate birth moon position
      const birthJD = this._dateToJulianDay(
        year,
        month,
        day,
        hour + minute / 60
      );
      const birthMoonPos = sweph.calc(birthJD, 1, 2);
      const birthMoonLongitude = birthMoonPos.longitude ?
        birthMoonPos.longitude[0] :
        0;

      // Determine target date (next lunar return if not specified)
      const now = targetDate || new Date();
      const targetJD = this._dateToJulianDay(
        now.getFullYear(),
        now.getMonth() + 1,
        now.getDate(),
        now.getHours() + now.getMinutes() / 60
      );

      // Find the lunar return time (when Moon returns to birth position)
      let lunarReturnJD = targetJD;
      let iterations = 0;
      const maxIterations = 30; // Max 30 days search

      while (iterations < maxIterations) {
        const moonPos = sweph.calc(lunarReturnJD, 1, 2);
        const currentMoonLong = moonPos.longitude ? moonPos.longitude[0] : 0;

        const diff = this._normalizeAngle(currentMoonLong - birthMoonLongitude);
        if (Math.abs(diff) < 1) {
          // Within 1 degree
          break;
        }

        // Move forward by approximately 1 day (Moon moves ~12-15 degrees per day)
        lunarReturnJD += 1;
        iterations++;
      }

      if (iterations >= maxIterations) {
        return { error: 'Unable to calculate lunar return timing' };
      }

      // Convert JD back to date
      const lunarReturnDate = this._jdToDate(lunarReturnJD);

      // Generate lunar return chart
      const lunarReturnChart = await this._generateLunarReturnChart(
        birthData,
        lunarReturnDate,
        birthMoonLongitude
      );

      // Analyze the lunar return chart
      const analysis = this._analyzeLunarReturnChart(
        lunarReturnChart,
        birthData
      );

      return {
        lunarReturnDate: lunarReturnDate.toLocaleDateString(),
        lunarReturnTime: lunarReturnDate.toLocaleTimeString(),
        monthAhead: new Date(
          lunarReturnDate.getFullYear(),
          lunarReturnDate.getMonth() + 1,
          0
        ).toLocaleDateString(),
        lunarReturnChart,
        analysis,
        themes: analysis.themes,
        opportunities: analysis.opportunities,
        challenges: analysis.challenges,
        summary: this._generateLunarReturnSummary(analysis)
      };
    } catch (error) {
      logger.error('Error calculating lunar return:', error);
      return { error: 'Unable to calculate lunar return at this time' };
    }
  }

  /**
   * Generate lunar return chart
   * @private
   * @param {Object} birthData - Birth data
   * @param {Date} lunarReturnDate - Lunar return date
   * @param {number} birthMoonLongitude - Birth Moon longitude
   * @returns {Object} Lunar return chart
   */
  async _generateLunarReturnChart(
    birthData,
    lunarReturnDate,
    birthMoonLongitude
  ) {
    try {
      const { birthPlace } = birthData;

      // Get coordinates
      const locationInfo =
        await this.geocodingService.getLocationInfo(birthPlace);
      const timestamp = lunarReturnDate.getTime();

      // Generate chart for lunar return moment
      const astroData = {
        year: lunarReturnDate.getFullYear(),
        month: lunarReturnDate.getMonth() + 1,
        date: lunarReturnDate.getDate(),
        hours: lunarReturnDate.getHours(),
        minutes: lunarReturnDate.getMinutes(),
        seconds: 0,
        latitude: locationInfo.latitude,
        longitude: locationInfo.longitude,
        timezone: locationInfo.timezone,
        chartType: 'sidereal'
      };

      const chart = this.astrologer.generateNatalChartData(astroData);

      // Ensure Moon is at birth position
      if (chart.planets.moon) {
        chart.planets.moon.longitude = birthMoonLongitude;
        chart.planets.moon.signName =
          this._getSignFromLongitude(birthMoonLongitude);
      }

      return chart;
    } catch (error) {
      logger.error('Error generating lunar return chart:', error);
      return {
        planets: {},
        houses: {},
        aspects: [],
        interpretations: {
          sunSign: 'Unknown',
          moonSign: 'Unknown',
          risingSign: 'Unknown'
        }
      };
    }
  }

  /**
   * Analyze lunar return chart
   * @private
   * @param {Object} lunarReturnChart - Lunar return chart
   * @param {Object} birthData - Birth data
   * @returns {Object} Analysis of lunar return
   */
  _analyzeLunarReturnChart(lunarReturnChart, birthData) {
    const analysis = {
      themes: [],
      opportunities: [],
      challenges: [],
      lunarReturnMoonSign:
        lunarReturnChart.interpretations?.moonSign || 'Unknown',
      lunarReturnSunSign:
        lunarReturnChart.interpretations?.sunSign || 'Unknown',
      lunarReturnRisingSign:
        lunarReturnChart.interpretations?.risingSign || 'Unknown'
    };

    // Analyze Moon's house in lunar return (emotional focus for the month)
    const moonHouse = lunarReturnChart.planets.moon?.house || 'Unknown';
    if (moonHouse !== 'Unknown') {
      analysis.themes.push(
        `Emotional focus in ${this._getHouseArea(moonHouse)}`
      );
    }

    // Analyze Sun's house in lunar return (conscious focus for the month)
    const sunHouse = lunarReturnChart.planets.sun?.house || 'Unknown';
    if (sunHouse !== 'Unknown') {
      analysis.themes.push(
        `Conscious attention to ${this._getHouseArea(sunHouse)}`
      );
    }

    // Analyze angular planets (powerful influences for the month)
    const angularHouses = [1, 4, 7, 10];
    Object.entries(lunarReturnChart.planets).forEach(([planet, data]) => {
      if (angularHouses.includes(data.house)) {
        analysis.themes.push(
          `${planet} strongly activated in ${this._getHouseArea(data.house)}`
        );
      }
    });

    // Generate opportunities and challenges based on aspects
    if (lunarReturnChart.aspects) {
      lunarReturnChart.aspects.forEach(aspect => {
        if (aspect.aspect === 'Trine' || aspect.aspect === 'Sextile') {
          analysis.opportunities.push(
            `${aspect.planets} harmony supports ${this._getAspectOpportunity(aspect)}`
          );
        } else if (
          aspect.aspect === 'Square' ||
          aspect.aspect === 'Opposition'
        ) {
          analysis.challenges.push(
            `${aspect.planets} tension requires ${this._getAspectChallenge(aspect)}`
          );
        }
      });
    }

    return analysis;
  }

  /**
   * Get aspect opportunity
   * @private
   * @param {Object} aspect - Aspect data
   * @returns {string} Opportunity description
   */
  _getAspectOpportunity(aspect) {
    const opportunities = {
      'Sun-Moon': 'emotional balance and self-expression',
      'Sun-Mercury': 'clear communication and learning',
      'Sun-Venus': 'creative expression and relationships',
      'Moon-Venus': 'emotional harmony and nurturing',
      'Mercury-Venus': 'artistic communication and social ease'
    };

    const key = aspect.planets;
    return opportunities[key] || 'smooth progress and natural flow';
  }

  /**
   * Get aspect challenge
   * @private
   * @param {Object} aspect - Aspect data
   * @returns {string} Challenge description
   */
  _getAspectChallenge(aspect) {
    const challenges = {
      'Sun-Moon': 'balancing inner and outer needs',
      'Sun-Mercury': 'clear thinking amidst emotional complexity',
      'Sun-Venus': 'balancing self-expression with relationship needs',
      'Moon-Venus': 'navigating emotional attachments',
      'Mercury-Venus': 'communicating feelings effectively'
    };

    const key = aspect.planets;
    return challenges[key] || 'growth through tension and adaptation';
  }

  /**
   * Generate lunar return summary
   * @private
   * @param {Object} analysis - Lunar return analysis
   * @returns {string} Summary text
   */
  _generateLunarReturnSummary(analysis) {
    let summary = '🌙 *Lunar Return Analysis*\n\n';

    summary += '*Monthly Themes:*\n';
    analysis.themes.forEach(theme => {
      summary += `• ${theme}\n`;
    });

    if (analysis.opportunities.length > 0) {
      summary += '\n*Opportunities:*\n';
      analysis.opportunities.slice(0, 3).forEach(opp => {
        summary += `• ${opp}\n`;
      });
    }

    if (analysis.challenges.length > 0) {
      summary += '\n*Challenges & Growth:*\n';
      analysis.challenges.slice(0, 3).forEach(challenge => {
        summary += `• ${challenge}\n`;
      });
    }

    summary += `\n*Moon in ${analysis.lunarReturnMoonSign}* - Emotional atmosphere and inner life focus`;
    summary += `\n*Sun in ${analysis.lunarReturnSunSign}* - Conscious direction and outer activities`;

    return summary;
  }

  /**
   * Normalize angle to -180 to 180 range
   * @private
   * @param {number} angle - Angle in degrees
   * @returns {number} Normalized angle
   */
  _normalizeAngle(angle) {
    angle %= 360;
    if (angle > 180) {
      angle -= 360;
    }
    if (angle <= -180) {
      angle += 360;
    }
    return angle;
  }

  /**
   * Convert Julian Day to Date
   * @private
   * @param {number} jd - Julian Day
   * @returns {Date} Date object
   */
  _jdToDate(jd) {
    // Simplified JD to date conversion
    const z = Math.floor(jd + 0.5);
    const f = jd + 0.5 - z;

    let a = z;
    if (z >= 2299161) {
      const alpha = Math.floor((z - 1867216.25) / 36524.25);
      a = z + 1 + alpha - Math.floor(alpha / 4);
    }

    const b = a + 1524;
    const c = Math.floor((b - 122.1) / 365.25);
    const d = Math.floor(365.25 * c);
    const e = Math.floor((b - d) / 30.6001);

    const day = b - d - Math.floor(30.6001 * e) + f;
    const month = e < 14 ? e - 1 : e - 13;
    const year = c < 0 ? c - 4715 : c - 4716;

    return new Date(year, month - 1, Math.floor(day));
  }

  /**
   * Get house area description
   * @private
   * @param {number} house - House number (1-12)
   * @returns {string} House area description
   */
  _getHouseArea(house) {
    const areas = {
      1: 'self and personal identity',
      2: 'wealth and material possessions',
      3: 'communication and siblings',
      4: 'home and family',
      5: 'creativity and children',
      6: 'health and service',
      7: 'partnerships and relationships',
      8: 'transformation and shared resources',
      9: 'philosophy and higher learning',
      10: 'career and public image',
      11: 'friends and hopes',
      12: 'spirituality and endings'
    };
    return areas[house] || 'life matters';
  }

  /**
   * Get sign from longitude
   * @private
   * @param {number} longitude - Longitude in degrees
   * @returns {string} Sign name
   */
  _getSignFromLongitude(longitude) {
    const signs = this.vedicCore.getZodiacSigns();
    const signIndex = Math.floor(longitude / 30) % 12;
    return signs[signIndex];
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

    const jd =
      day +
      Math.floor((153 * m + 2) / 5) +
      365 * y +
      Math.floor(y / 4) -
      Math.floor(y / 100) +
      Math.floor(y / 400) -
      32045;
    return jd + hour / 24;
  }
}

module.exports = { LunarReturnCalculator };
