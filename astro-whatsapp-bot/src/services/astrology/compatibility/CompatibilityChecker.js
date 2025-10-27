const logger = require('../../../utils/logger');

/**
 * Compatibility Checker
 * Handles synastry and compatibility analysis between two charts
 */
class CompatibilityChecker {
  constructor(astrologer, geocodingService, vedicCore) {
    this.astrologer = astrologer;
    this.geocodingService = geocodingService;
    this.vedicCore = vedicCore;
  }

  /**
   * Check compatibility between two people using synastry calculations
   * @param {Object} person1 - First person's birth data
   * @param {Object} person2 - Second person's birth data
   * @returns {Object} Compatibility result
   */
  async checkCompatibility(person1, person2) {
    try {
      // If only signs are provided, fall back to basic compatibility
      if (typeof person1 === 'string' && typeof person2 === 'string') {
        return this._checkBasicCompatibility(person1, person2);
      }

      // Full synastry calculation
      const { birthDate: date1, birthTime: time1 = '12:00', birthPlace: place1 = 'Delhi, India' } = person1;
      const { birthDate: date2, birthTime: time2 = '12:00', birthPlace: place2 = 'Delhi, India' } = person2;

      // Parse birth data
      const [day1, month1, year1] = date1.split('/').map(Number);
      const [hour1, minute1] = time1.split(':').map(Number);
      const [day2, month2, year2] = date2.split('/').map(Number);
      const [hour2, minute2] = time2.split(':').map(Number);

      // Get coordinates and timezones
      const locationInfo1 = await this.geocodingService.getLocationInfo(place1);
      const locationInfo2 = await this.geocodingService.getLocationInfo(place2);

      const birthDateTime1 = new Date(year1, month1 - 1, day1, hour1, minute1);
      const birthDateTime2 = new Date(year2, month2 - 1, day2, hour2, minute2);

      // Prepare chart data
      const chart1Data = {
        year: year1, month: month1, date: day1, hours: hour1, minutes: minute1, seconds: 0,
        latitude: locationInfo1.latitude, longitude: locationInfo1.longitude, timezone: locationInfo1.timezone, chartType: 'sidereal'
      };

      const chart2Data = {
        year: year2, month: month2, date: day2, hours: hour2, minutes: minute2, seconds: 0,
        latitude: locationInfo2.latitude, longitude: locationInfo2.longitude, timezone: locationInfo2.timezone, chartType: 'sidereal'
      };

      // Generate natal charts
      const chart1 = this.astrologer.generateNatalChartData(chart1Data);
      const chart2 = this.astrologer.generateNatalChartData(chart2Data);

      // Generate synastry chart (composite aspects between charts)
      const synastryChart = this.astrologer.generateSynastryChartData(chart1Data, chart2Data);

      // Analyze compatibility
      const compatibility = this._analyzeSynastryCompatibility(synastryChart, chart1, chart2);

      return {
        person1: {
          sunSign: chart1.interpretations.sunSign,
          moonSign: chart1.interpretations.moonSign,
          risingSign: chart1.interpretations.risingSign
        },
        person2: {
          sunSign: chart2.interpretations.sunSign,
          moonSign: chart2.interpretations.moonSign,
          risingSign: chart2.interpretations.risingSign
        },
        compatibility: compatibility.rating,
        score: compatibility.score,
        description: compatibility.description,
        keyAspects: compatibility.keyAspects,
        strengths: compatibility.strengths,
        challenges: compatibility.challenges
      };
    } catch (error) {
      logger.error('Error in synastry compatibility calculation:', error);
      // Fallback to basic compatibility
      return this._checkBasicCompatibility(
        person1.birthDate ? await this.calculateSunSign(person1.birthDate, person1.birthTime, person1.birthPlace) : person1,
        person2.birthDate ? await this.calculateSunSign(person2.birthDate, person2.birthTime, person2.birthPlace) : person2
      );
    }
  }

  /**
   * Check basic compatibility between two signs (fallback)
   * @private
   * @param {string} sign1 - First sign
   * @param {string} sign2 - Second sign
   * @returns {Object} Compatibility result
   */
  _checkBasicCompatibility(sign1, sign2) {
    // Enhanced compatibility matrix based on traditional astrology
    const compatibility = {
      'Aries-Leo': 'Excellent',
      'Aries-Sagittarius': 'Excellent',
      'Aries-Gemini': 'Good',
      'Aries-Aquarius': 'Good',
      'Taurus-Virgo': 'Excellent',
      'Taurus-Capricorn': 'Excellent',
      'Taurus-Cancer': 'Good',
      'Taurus-Pisces': 'Good',
      'Gemini-Libra': 'Excellent',
      'Gemini-Aquarius': 'Excellent',
      'Gemini-Aries': 'Good',
      'Gemini-Leo': 'Good',
      'Cancer-Scorpio': 'Excellent',
      'Cancer-Pisces': 'Excellent',
      'Cancer-Taurus': 'Good',
      'Cancer-Virgo': 'Good',
      'Leo-Aries': 'Excellent',
      'Leo-Sagittarius': 'Excellent',
      'Leo-Gemini': 'Good',
      'Leo-Libra': 'Good',
      'Virgo-Taurus': 'Excellent',
      'Virgo-Capricorn': 'Excellent',
      'Virgo-Cancer': 'Good',
      'Virgo-Scorpio': 'Good',
      'Libra-Gemini': 'Excellent',
      'Libra-Aquarius': 'Excellent',
      'Libra-Leo': 'Good',
      'Libra-Sagittarius': 'Good',
      'Scorpio-Cancer': 'Excellent',
      'Scorpio-Pisces': 'Excellent',
      'Scorpio-Virgo': 'Good',
      'Scorpio-Capricorn': 'Good',
      'Sagittarius-Aries': 'Excellent',
      'Sagittarius-Leo': 'Excellent',
      'Sagittarius-Libra': 'Good',
      'Sagittarius-Aquarius': 'Good',
      'Capricorn-Taurus': 'Excellent',
      'Capricorn-Virgo': 'Excellent',
      'Capricorn-Scorpio': 'Good',
      'Capricorn-Pisces': 'Good',
      'Aquarius-Gemini': 'Excellent',
      'Aquarius-Libra': 'Excellent',
      'Aquarius-Sagittarius': 'Good',
      'Aquarius-Aries': 'Good',
      'Pisces-Cancer': 'Excellent',
      'Pisces-Scorpio': 'Excellent',
      'Pisces-Taurus': 'Good',
      'Pisces-Capricorn': 'Good'
    };

    const key = `${sign1}-${sign2}`;
    const reverseKey = `${sign2}-${sign1}`;

    const rating = compatibility[key] || compatibility[reverseKey] || 'Neutral';

    return {
      sign1,
      sign2,
      compatibility: rating,
      description: this.getCompatibilityDescription(sign1, sign2, rating)
    };
  }

  /**
   * Get compatibility description
   * @param {string} sign1 - First sign
   * @param {string} sign2 - Second sign
   * @param {string} rating - Compatibility rating
   * @returns {string} Description
   */
  getCompatibilityDescription(sign1, sign2, rating) {
    const descriptions = {
      Excellent: `The combination of ${sign1} and ${sign2} is highly compatible. You share similar values and communication styles, making your relationship harmonious and fulfilling.`,
      Good: `${sign1} and ${sign2} have good compatibility. With some effort, you can build a strong and balanced relationship.`,
      Neutral: `${sign1} and ${sign2} compatibility is neutral. It requires understanding and compromise to make the relationship work.`
    };
    return descriptions[rating] || 'Compatibility analysis not available.';
  }

  /**
   * Analyze synastry compatibility from charts
   * @private
   * @param {Object} synastryChart - Synastry chart data
   * @param {Object} chart1 - First person's chart
   * @param {Object} chart2 - Second person's chart
   * @returns {Object} Compatibility analysis
   */
  _analyzeSynastryCompatibility(synastryChart, chart1, chart2) {
    const aspects = synastryChart.aspects || [];
    let score = 50; // Base score
    const keyAspects = [];
    const strengths = [];
    const challenges = [];

    // Analyze major aspects between personal planets
    const personalPlanets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars'];
    const majorAspects = aspects.filter(aspect =>
      personalPlanets.includes(aspect.planet1) && personalPlanets.includes(aspect.planet2)
    );

    // Score based on aspect types
    majorAspects.forEach(aspect => {
      switch (aspect.aspect) {
      case 'Conjunction':
        score += 15;
        keyAspects.push(`${aspect.planet1} conjunct ${aspect.planet2}`);
        strengths.push(`Strong ${this._getPlanetDomain(aspect.planet1)} connection`);
        break;
      case 'Trine':
        score += 12;
        keyAspects.push(`${aspect.planet1} trine ${aspect.planet2}`);
        strengths.push(`Harmonious ${this._getPlanetDomain(aspect.planet1)} flow`);
        break;
      case 'Sextile':
        score += 8;
        keyAspects.push(`${aspect.planet1} sextile ${aspect.planet2}`);
        strengths.push(`Supportive ${this._getPlanetDomain(aspect.planet1)} energy`);
        break;
      case 'Square':
        score -= 10;
        keyAspects.push(`${aspect.planet1} square ${aspect.planet2}`);
        challenges.push(`${this._getPlanetDomain(aspect.planet1)} tension to resolve`);
        break;
      case 'Opposition':
        score -= 8;
        keyAspects.push(`${aspect.planet1} opposition ${aspect.planet2}`);
        challenges.push(`${this._getPlanetDomain(aspect.planet1)} polarity to balance`);
        break;
      }
    });

    // Analyze sun-moon aspects (very important for relationships)
    const sunMoonAspects = aspects.filter(aspect =>
      (aspect.planet1 === 'Sun' && aspect.planet2 === 'Moon') ||
      (aspect.planet1 === 'Moon' && aspect.planet2 === 'Sun')
    );

    if (sunMoonAspects.length > 0) {
      const aspect = sunMoonAspects[0];
      if (aspect.aspect === 'Conjunction' || aspect.aspect === 'Trine') {
        score += 20;
        strengths.push('Strong emotional and identity harmony');
      } else if (aspect.aspect === 'Square' || aspect.aspect === 'Opposition') {
        score -= 15;
        challenges.push('Emotional and identity differences to navigate');
      }
    }

    // Analyze venus-mars aspects (relationship dynamics)
    const venusMarsAspects = aspects.filter(aspect =>
      ((aspect.planet1 === 'Venus' && aspect.planet2 === 'Mars') ||
       (aspect.planet1 === 'Mars' && aspect.planet2 === 'Venus'))
    );

    if (venusMarsAspects.length > 0) {
      const aspect = venusMarsAspects[0];
      if (aspect.aspect === 'Conjunction' || aspect.aspect === 'Trine' || aspect.aspect === 'Sextile') {
        score += 18;
        strengths.push('Natural chemistry and attraction');
      } else if (aspect.aspect === 'Square' || aspect.aspect === 'Opposition') {
        score += 5; // Can create passion but also conflict
        challenges.push('Intense chemistry requiring balance');
      }
    }

    // Determine rating based on score
    let rating;
    if (score >= 80) { rating = 'Excellent'; } else if (score >= 65) { rating = 'Very Good'; } else if (score >= 50) { rating = 'Good'; } else if (score >= 35) { rating = 'Fair'; } else { rating = 'Challenging'; }

    // Generate description
    const description = this._generateCompatibilityDescription(rating, strengths, challenges, chart1, chart2);

    return {
      rating,
      score: Math.max(0, Math.min(100, score)),
      description,
      keyAspects: keyAspects.slice(0, 5), // Top 5 aspects
      strengths: strengths.slice(0, 3), // Top 3 strengths
      challenges: challenges.slice(0, 3) // Top 3 challenges
    };
  }

  /**
   * Get planet domain description
   * @private
   * @param {string} planet - Planet name
   * @returns {string} Domain description
   */
  _getPlanetDomain(planet) {
    const domains = {
      Sun: 'identity and purpose',
      Moon: 'emotional and nurturing',
      Mercury: 'communication and thinking',
      Venus: 'love and values',
      Mars: 'action and desire',
      Jupiter: 'growth and wisdom',
      Saturn: 'structure and responsibility',
      Uranus: 'innovation and freedom',
      Neptune: 'spirituality and dreams',
      Pluto: 'transformation and power'
    };
    return domains[planet] || planet.toLowerCase();
  }

  /**
   * Generate compatibility description
   * @private
   * @param {string} rating - Compatibility rating
   * @param {Array} strengths - Relationship strengths
   * @param {Array} challenges - Relationship challenges
   * @param {Object} chart1 - First person's chart
   * @param {Object} chart2 - Second person's chart
   * @returns {string} Description
   */
  _generateCompatibilityDescription(rating, strengths, challenges, chart1, chart2) {
    const sign1 = chart1.interpretations.sunSign;
    const sign2 = chart2.interpretations.sunSign;

    let description = `Based on the synastry between ${sign1} and ${sign2} charts, this relationship shows ${rating.toLowerCase()} compatibility. `;

    if (strengths.length > 0) {
      description += `Strengths include: ${strengths.join(', ')}. `;
    }

    if (challenges.length > 0) {
      description += `Areas for growth: ${challenges.join(', ')}. `;
    }

    description += 'Remember, astrology offers insights but relationships require mutual understanding and effort.';

    return description;
  }

  /**
   * Calculate sun sign for compatibility fallback
   * @private
   * @param {string} birthDate - Birth date
   * @param {string} birthTime - Birth time
   * @param {string} birthPlace - Birth place
   * @returns {string} Sun sign
   */
  async calculateSunSign(birthDate, birthTime, birthPlace) {
    try {
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);

      // Get coordinates and timezone
      const locationInfo = await this.geocodingService.getLocationInfo(birthPlace);
      const birthDateTime = new Date(year, month - 1, day, hour, minute);
      const timestamp = birthDateTime.getTime();

      // Prepare data for astrologer library
      const astroData = {
        year,
        month,
        date: day,
        hours: hour,
        minutes: minute,
        seconds: 0,
        latitude: locationInfo.latitude,
        longitude: locationInfo.longitude,
        timezone: locationInfo.timezone,
        chartType: 'sidereal'
      };

      // Generate natal chart
      const chart = this.astrologer.generateNatalChartData(astroData);

      // Return sun sign from interpretations
      const { sunSign } = chart.interpretations;
      if (!sunSign || sunSign === 'Unknown' || typeof sunSign !== 'string') {
        throw new Error('Invalid sun sign from astrologer');
      }
      return sunSign;
    } catch (error) {
      logger.error('Error calculating sun sign with astrologer:', error);
      // Fallback to simplified calculation
      return this._calculateSunSignFallback(birthDate);
    }
  }

  /**
   * Fallback sun sign calculation using simplified dates
   * @private
   */
  _calculateSunSignFallback(birthDate) {
    try {
      const [day, month] = birthDate.split('/').map(Number);

      // Simplified sun sign calculation
      const signDates = [
        { sign: 'Capricorn', start: [22, 12], end: [19, 1] },
        { sign: 'Aquarius', start: [20, 1], end: [18, 2] },
        { sign: 'Pisces', start: [19, 2], end: [20, 3] },
        { sign: 'Aries', start: [21, 3], end: [19, 4] },
        { sign: 'Taurus', start: [20, 4], end: [20, 5] },
        { sign: 'Gemini', start: [21, 5], end: [20, 6] },
        { sign: 'Cancer', start: [21, 6], end: [22, 7] },
        { sign: 'Leo', start: [23, 7], end: [22, 8] },
        { sign: 'Virgo', start: [23, 8], end: [22, 9] },
        { sign: 'Libra', start: [23, 9], end: [22, 10] },
        { sign: 'Scorpio', start: [23, 10], end: [21, 11] },
        { sign: 'Sagittarius', start: [22, 11], end: [21, 12] }
      ];

      for (const { sign, start, end } of signDates) {
        if (
          (month === start[1] && day >= start[0]) ||
          (month === end[1] && day <= end[0]) ||
          (month > start[1] && month < end[1])
        ) {
          return sign;
        }
      }

      return 'Unknown';
    } catch (error) {
      logger.error('Error in fallback sun sign calculation:', error);
      return 'Unknown';
    }
  }
}

module.exports = CompatibilityChecker;
