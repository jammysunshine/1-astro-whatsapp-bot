const logger = require('../../../../utils/logger');

/**
 * VargaChartCalculator - Vedic Divisional Charts (D1, D2, D3, etc.)
 * Handles calculation and analysis of harmonic divisional charts
 */
class VargaChartCalculator {
  constructor() {
    logger.info('Module: VargaChartCalculator loaded - Vedic Divisional Charts');
  }

  setServices(vedicCalculator) {
    this.vedicCalculator = vedicCalculator;
    this.astrologer = vedicCalculator.astrologer;
    this.geocodingService = vedicCalculator.geocodingService;
    this.vedicCore = vedicCalculator.vedicCore;
  }

  /**
   * Calculate Varga (Divisional) Charts - Vedic system of harmonic charts
   * @param {Object} birthData - Birth data object
   * @param {string} varga - Varga type (D1, D2, D3, D4, D7, D9, D10, D12, etc.)
   * @returns {Object} Varga chart analysis
   */
  async calculateVargaChart(birthData, varga = 'D9') {
    try {
      const { birthDate, birthTime, birthPlace } = birthData;

      if (!birthDate || !birthTime || !birthPlace) {
        return { error: 'Complete birth details required for Varga chart analysis' };
      }

      // Parse birth date and time
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);

      // Get coordinates and timezone
      const locationInfo = await this.geocodingService.getLocationInfo(birthPlace);
      const birthDateTime = new Date(year, month - 1, day, hour, minute);
      const timestamp = birthDateTime.getTime();

      // Calculate Julian Day
      const jd = this._dateToJulianDay(year, month, day, hour + minute / 60);

      // Get D1 (Rashi) chart first
      const d1Chart = await this._generateBasicBirthChart(birthData);

      // Calculate Varga chart
      const vargaChart = await this._calculateVargaPositions(d1Chart.planets, varga);

      // Analyze the Varga chart
      const analysis = this._analyzeVargaChart(vargaChart, varga);

      return {
        varga,
        chart: vargaChart,
        analysis,
        significance: this._getVargaSignificance(varga),
        summary: this._generateVargaSummary(vargaChart, varga, analysis)
      };
    } catch (error) {
      logger.error('Error calculating Varga chart:', error);
      return { error: 'Unable to calculate Varga chart at this time' };
    }
  }

  /**
   * Generate basic birth chart (extracted method)
   * @private
   * @param {Object} birthData - Birth data
   * @returns {Object} Basic birth chart
   */
  async _generateBasicBirthChart(birthData) {
    try {
      const { birthDate, birthTime, birthPlace } = birthData;
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);

      const locationInfo = await this.geocodingService.getLocationInfo(birthPlace);

      const astroData = {
        year, month, date: day, hours: hour, minutes: minute, seconds: 0,
        latitude: locationInfo.latitude, longitude: locationInfo.longitude,
        timezone: locationInfo.timezone, chartType: 'sidereal'
      };

      return this.astrologer.generateNatalChartData(astroData);
    } catch (error) {
      logger.error('Error generating basic birth chart:', error);
      return { planets: {} };
    }
  }

  /**
   * Calculate planetary positions in Varga chart
   * @private
   * @param {Object} d1Planets - D1 chart planets
   * @param {string} varga - Varga type
   * @returns {Object} Varga chart planets
   */
  async _calculateVargaPositions(d1Planets, varga) {
    const vargaChart = {};
    const divisor = this._getVargaDivisor(varga);

    Object.entries(d1Planets).forEach(([planetName, d1Data]) => {
      if (d1Data && d1Data.longitude !== undefined) {
        // Calculate Varga position using Vedic division method
        const vargaLongitude = this._calculateVargaLongitude(d1Data.longitude, divisor, varga);

        // Calculate sign and house in Varga chart
        const vargaSign = Math.floor(vargaLongitude / 30) + 1;
        const vargaHouse = vargaSign; // In Varga charts, signs and houses are the same

        vargaChart[planetName] = {
          name: d1Data.name,
          longitude: vargaLongitude,
          sign: vargaSign,
          house: vargaHouse,
          signName: this._getVedicSignName(vargaSign),
          aspects: this._calculateVargaAspects(vargaLongitude, vargaChart, varga)
        };
      }
    });

    return vargaChart;
  }

  /**
   * Get Varga divisor
   * @private
   * @param {string} varga - Varga type
   * @returns {number} Divisor for the Varga
   */
  _getVargaDivisor(varga) {
    const divisors = {
      D1: 1,   // Rashi
      D2: 2,   // Hora
      D3: 3,   // Dreshkana
      D4: 4,   // Chaturthamsa
      D7: 7,   // Saptamsa
      D9: 9,   // Navamsa
      D10: 10, // Dashamsa
      D12: 12, // Dwadashamsa
      D16: 16, // Shodashamsa
      D20: 20, // Vimshamsha
      D24: 24, // Chaturvimshamsha
      D27: 27, // Saptavimshamsha (Nakshatras)
      D30: 30, // Trimshamsha
      D40: 40, // Khavedamsha
      D45: 45, // Akshavedamsha
      D60: 60  // Shashtiamsha
    };
    return divisors[varga] || 9; // Default to Navamsa
  }

  /**
   * Calculate longitude in Varga chart
   * @private
   * @param {number} d1Longitude - D1 longitude
   * @param {number} divisor - Varga divisor
   * @param {string} varga - Varga type
   * @returns {number} Varga longitude
   */
  _calculateVargaLongitude(d1Longitude, divisor, varga) {
    // Vedic Varga calculation method
    const signLongitude = d1Longitude % 30; // Position within sign (0-29.99)
    const vargaPortion = signLongitude * divisor / 30; // Divide sign into portions
    const vargaSignIndex = Math.floor(vargaPortion); // Which portion (0 to divisor-1)
    const vargaPositionInPortion = (vargaPortion - vargaSignIndex) * 30; // Position within portion

    // Convert back to full zodiac longitude
    return vargaSignIndex * 30 + vargaPositionInPortion;
  }

  /**
   * Get Vedic sign name
   * @private
   * @param {number} signNumber - Sign number (1-12)
   * @returns {string} Sign name
   */
  _getVedicSignName(signNumber) {
    const signNames = this.vedicCore.getZodiacSigns();
    return signNames[signNumber - 1] || 'Unknown';
  }

  /**
   * Calculate aspects in Varga chart
   * @private
   * @param {number} planetLongitude - Planet's longitude in Varga
   * @param {Object} vargaChart - Current Varga chart
   * @param {string} varga - Varga type
   * @returns {Array} Aspects
   */
  _calculateVargaAspects(planetLongitude, vargaChart, varga) {
    const aspects = [];

    // In Varga charts, aspects are similar to D1 but may have different rules
    Object.entries(vargaChart).forEach(([otherPlanet, data]) => {
      if (data.longitude !== undefined && data.longitude !== planetLongitude) {
        const angle = Math.abs(data.longitude - planetLongitude);
        const minAngle = Math.min(angle, 360 - angle);

        // Check for major aspects
        if (minAngle <= 10) { // Conjunction
          aspects.push({ planet: otherPlanet, aspect: 'Conjunction', orb: minAngle });
        } else if (Math.abs(minAngle - 90) <= 8) { // Square
          aspects.push({ planet: otherPlanet, aspect: 'Square', orb: Math.abs(minAngle - 90) });
        } else if (Math.abs(minAngle - 120) <= 8) { // Trine
          aspects.push({ planet: otherPlanet, aspect: 'Trine', orb: Math.abs(minAngle - 120) });
        } else if (Math.abs(minAngle - 180) <= 8) { // Opposition
          aspects.push({ planet: otherPlanet, aspect: 'Opposition', orb: Math.abs(minAngle - 180) });
        }
      }
    });

    return aspects;
  }

  /**
   * Analyze Varga chart
   * @private
   * @param {Object} vargaChart - Varga chart data
   * @param {string} varga - Varga type
   * @returns {Object} Analysis results
   */
  _analyzeVargaChart(vargaChart, varga) {
    const analysis = {
      strongPlanets: [],
      weakPlanets: [],
      yogas: [],
      beneficialPositions: [],
      challengingPositions: []
    };

    // Analyze planetary positions in Varga chart
    Object.entries(vargaChart).forEach(([planetName, data]) => {
      const { sign } = data;
      const strength = this._evaluateVargaPosition(planetName, sign, varga);

      if (strength > 7) {
        analysis.strongPlanets.push(planetName);
        analysis.beneficialPositions.push(`${planetName} in ${data.signName}`);
      } else if (strength < 4) {
        analysis.weakPlanets.push(planetName);
        analysis.challengingPositions.push(`${planetName} in ${data.signName}`);
      }

      // Check for Varga-specific yogas
      const yogas = this._checkVargaYogas(vargaChart, varga);
      analysis.yogas.push(...yogas);
    });

    // Remove duplicate yogas
    analysis.yogas = [...new Set(analysis.yogas)];

    return analysis;
  }

  /**
   * Evaluate planetary strength in Varga position
   * @private
   * @param {string} planet - Planet name
   * @param {number} sign - Sign number (1-12)
   * @param {string} varga - Varga type
   * @returns {number} Strength score (0-10)
   */
  _evaluateVargaPosition(planet, sign, varga) {
    let strength = 5; // Base strength

    // Varga-specific exaltation and debilitation
    const exaltationSigns = {
      D9: { sun: 1, moon: 2, mars: 10, mercury: 6, jupiter: 4, venus: 12, saturn: 7 }, // Navamsa
      D10: { sun: 1, moon: 4, mars: 10, mercury: 1, jupiter: 7, venus: 4, saturn: 7 }, // Dashamsa
      D7: { sun: 1, moon: 1, mars: 1, mercury: 4, jupiter: 7, venus: 12, saturn: 7 }   // Saptamsa
    };

    const debilitationSigns = {
      D9: { sun: 7, moon: 8, mars: 4, mercury: 12, jupiter: 10, venus: 6, saturn: 1 },
      D10: { sun: 7, moon: 10, mars: 4, mercury: 7, jupiter: 1, venus: 10, saturn: 1 },
      D7: { sun: 7, moon: 7, mars: 7, mercury: 10, jupiter: 1, venus: 6, saturn: 1 }
    };

    if (exaltationSigns[varga] && exaltationSigns[varga][planet] === sign) {
      strength += 3;
    } else if (debilitationSigns[varga] && debilitationSigns[varga][planet] === sign) {
      strength -= 3;
    }

    // Own sign strength
    const ownSigns = {
      sun: [5], moon: [4], mars: [1, 8], mercury: [3, 6], jupiter: [5, 9], venus: [2, 7], saturn: [10, 11]
    };

    if (ownSigns[planet] && ownSigns[planet].includes(sign)) {
      strength += 2;
    }

    // Friendly sign strength
    const friendlySigns = {
      sun: [1, 5, 9], moon: [2, 7, 11], mars: [1, 4, 7, 8, 11], mercury: [3, 6, 9, 12], jupiter: [1, 4, 5, 7, 9, 10], venus: [2, 3, 4, 5, 7, 9, 11, 12], saturn: [3, 6, 7, 10, 11]
    };

    if (friendlySigns[planet] && friendlySigns[planet].includes(sign)) {
      strength += 1;
    }

    return Math.max(0, Math.min(10, strength));
  }

  /**
   * Check for Varga-specific yogas
   * @private
   * @param {Object} vargaChart - Varga chart
   * @param {string} varga - Varga type
   * @returns {Array} Yogas found
   */
  _checkVargaYogas(vargaChart, varga) {
    const yogas = [];

    if (varga === 'D9') { // Navamsa yogas
      // Check for beneficial planetary combinations in Navamsa
      const planets = Object.keys(vargaChart);

      // Raja Yoga in Navamsa
      if (this._hasBeneficYoga(vargaChart, ['jupiter', 'venus']) ||
          this._hasBeneficYoga(vargaChart, ['jupiter', 'mercury'])) {
        yogas.push('Raja Yoga in Navamsa');
      }

      // Check for exalted planets
      Object.entries(vargaChart).forEach(([planet, data]) => {
        if (this._isExaltedInVarga(planet, data.sign, varga)) {
          yogas.push(`${planet} exalted in Navamsa`);
        }
      });
    }

    if (varga === 'D10') { // Dashamsa yogas
      // Career-related yogas
      if (vargaChart.sun && vargaChart.moon && vargaChart.sun.sign === vargaChart.moon.sign) {
        yogas.push('Sun-Moon conjunction in Dashamsa (leadership)');
      }

      if (vargaChart.jupiter && vargaChart.saturn &&
          Math.abs(vargaChart.jupiter.sign - vargaChart.saturn.sign) <= 1) {
        yogas.push('Jupiter-Saturn combination in Dashamsa (career stability)');
      }
    }

    return yogas;
  }

  /**
   * Check if planets form a beneficial yoga
   * @private
   * @param {Object} chart - Chart data
   * @param {Array} planets - Planet names to check
   * @returns {boolean} Whether yoga is formed
   */
  _hasBeneficYoga(chart, planets) {
    return planets.every(planet =>
      chart[planet] && chart[planet].sign &&
      this._isBeneficSign(chart[planet].sign)
    );
  }

  /**
   * Check if sign is benefic
   * @private
   * @param {number} sign - Sign number
   * @returns {boolean} Whether sign is benefic
   */
  _isBeneficSign(sign) {
    // Signs 1, 3, 5, 6, 7, 9, 10, 11 are generally benefic
    return [1, 3, 5, 6, 7, 9, 10, 11].includes(sign);
  }

  /**
   * Check if planet is exalted in Varga
   * @private
   * @param {string} planet - Planet name
   * @param {number} sign - Sign number
   * @param {string} varga - Varga type
   * @returns {boolean} Whether planet is exalted
   */
  _isExaltedInVarga(planet, sign, varga) {
    const exaltationSigns = {
      D9: { sun: 1, moon: 2, mars: 10, mercury: 6, jupiter: 4, venus: 12, saturn: 7 },
      D10: { sun: 1, moon: 4, mars: 10, mercury: 1, jupiter: 7, venus: 4, saturn: 7 }
    };

    return exaltationSigns[varga] && exaltationSigns[varga][planet] === sign;
  }

  /**
   * Get Varga significance
   * @private
   * @param {string} varga - Varga type
   * @returns {string} Significance description
   */
  _getVargaSignificance(varga) {
    const significances = {
      D1: 'Physical body, personality, and general life events',
      D2: 'Wealth, family, speech, and material possessions',
      D3: 'Siblings, communication, short journeys, and courage',
      D4: 'Property, home, mother, emotions, and happiness',
      D7: 'Children, creativity, intelligence, and education',
      D9: 'Marriage, partnerships, spouse, and life purpose',
      D10: 'Career, reputation, authority, and public image',
      D12: 'Spirituality, foreign lands, expenses, and losses',
      D16: 'Vehicles, happiness, and material comforts',
      D20: 'Spiritual practices and worship',
      D24: 'Education, knowledge, and learning',
      D27: 'Strengths, weaknesses, and overall fortune',
      D30: 'Misfortunes, enemies, and obstacles',
      D40: 'Auspicious and inauspicious events',
      D45: 'All areas of life (comprehensive)',
      D60: 'Karma and past life influences'
    };

    return significances[varga] || 'Specific life areas and influences';
  }

  /**
   * Generate Varga chart summary
   * @private
   * @param {Object} vargaChart - Varga chart
   * @param {string} varga - Varga type
   * @param {Object} analysis - Analysis results
   * @returns {string} Summary text
   */
  _generateVargaSummary(vargaChart, varga, analysis) {
    let summary = `🔢 *${varga} Chart Analysis*\n\n`;
    summary += `*Significance:* ${this._getVargaSignificance(varga)}\n\n`;

    summary += '*Planetary Positions:*\n';
    Object.entries(vargaChart).forEach(([planet, data]) => {
      summary += `• ${data.name}: ${data.signName}\n`;
    });

    if (analysis.strongPlanets.length > 0) {
      summary += '\n*Strong Planets:*\n';
      analysis.strongPlanets.forEach(planet => {
        summary += `• ${planet}\n`;
      });
    }

    if (analysis.yogas.length > 0) {
      summary += '\n*Yogas Formed:*\n';
      analysis.yogas.forEach(yoga => {
        summary += `• ${yoga}\n`;
      });
    }

    if (analysis.beneficialPositions.length > 0) {
      summary += '\n*Beneficial Positions:*\n';
      analysis.beneficialPositions.slice(0, 3).forEach(pos => {
        summary += `• ${pos}\n`;
      });
    }

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

module.exports = { VargaChartCalculator };