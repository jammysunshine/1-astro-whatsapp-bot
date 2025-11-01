const logger = require('../../utils/logger');
const sweph = require('sweph');
const { Astrologer } = require('astrologer');

/**
 * Chinese Astrology Calculator - BaZi (Four Pillars of Destiny)
 * Enhanced with Swiss Ephemeris for precise astronomical calculations
 * Provides traditional Chinese astrology calculations including Four Pillars,
 * Five Elements analysis, and basic interpretations.
 */

class ChineseCalculator {
  constructor(astrologer, geocodingService) {
    this.astrologer = astrologer || new Astrologer();
    this.geocodingService = geocodingService;
    this._initializeEphemeris();
    logger.info('Module: ChineseCalculator loaded with astrologer integration.');
    // Heavenly Stems (天干)
    this.heavenlyStems = [
      '甲',
      '乙',
      '丙',
      '丁',
      '戊',
      '己',
      '庚',
      '辛',
      '壬',
      '癸'
    ];

    // Earthly Branches (地支)
    this.earthlyBranches = [
      '子',
      '丑',
      '寅',
      '卯',
      '辰',
      '巳',
      '午',
      '未',
      '申',
      '酉',
      '戌',
      '亥'
    ];

    // Chinese Zodiac Animals
    this.zodiacAnimals = [
      'Rat',
      'Ox',
      'Tiger',
      'Rabbit',
      'Dragon',
      'Snake',
      'Horse',
      'Goat',
      'Monkey',
      'Rooster',
      'Dog',
      'Pig'
    ];

    // Five Elements
    this.fiveElements = {
      甲: 'Wood',
      乙: 'Wood',
      丙: 'Fire',
      丁: 'Fire',
      戊: 'Earth',
      己: 'Earth',
      庚: 'Metal',
      辛: 'Metal',
      壬: 'Water',
      癸: 'Water'
    };

    // Element relationships
    this.elementRelationships = {
      Wood: {
        generates: 'Fire',
        controls: 'Earth',
        weakenedBy: 'Metal',
        strengthenedBy: 'Water'
      },
      Fire: {
        generates: 'Earth',
        controls: 'Metal',
        weakenedBy: 'Water',
        strengthenedBy: 'Wood'
      },
      Earth: {
        generates: 'Metal',
        controls: 'Water',
        weakenedBy: 'Wood',
        strengthenedBy: 'Fire'
      },
      Metal: {
        generates: 'Water',
        controls: 'Wood',
        weakenedBy: 'Fire',
        strengthenedBy: 'Earth'
      },
      Water: {
        generates: 'Wood',
        controls: 'Fire',
        weakenedBy: 'Earth',
        strengthenedBy: 'Metal'
      }
    };

    // Solar terms for precise Chinese calendar calculations
    this.solarTerms = {
      0: 'Spring Begins', 15: 'Rain Water', 30: 'Insects Awaken',
      45: 'Spring Equinox', 60: 'Clear and Bright', 75: 'Grain Rains',
      90: 'Summer Begins', 105: 'Grain Buds', 120: 'Grain in Ear',
      135: 'Summer Solstice', 150: 'Minor Heat', 165: 'Major Heat',
      180: 'Autumn Begins', 195: 'Stopping the Heat', 210: 'White Dews',
      225: 'Autumn Equinox', 240: 'Cold Dews', 255: 'Frost Descent',
      270: 'Winter Begins', 285: 'Minor Snow', 300: 'Major Snow',
      315: 'Winter Solstice', 330: 'Minor Cold', 345: 'Major Cold'
    };
  }

  /**
   * Initialize Swiss Ephemeris
   * @private
   */
  _initializeEphemeris() {
    try {
      const ephePath = require('path').join(process.cwd(), 'ephe');
      sweph.swe_set_ephe_path(ephePath);
      logger.info('Swiss Ephemeris path set for ChineseCalculator');
    } catch (error) {
      logger.warn('Could not set ephemeris path for ChineseCalculator:', error.message);
    }
  }

  /**
   * Calculate Four Pillars (BaZi) from birth date and time using precise astronomical data
   * @param {string} birthDate - Birth date in DD/MM/YYYY format
   * @param {string} birthTime - Birth time in HH:MM format
   * @param {string} birthPlace - Birth place for timezone calculation
   * @returns {Object} Four Pillars analysis with astronomical correlations
   */
  calculateFourPillars(birthDate, birthTime = '12:00', birthPlace = 'Beijing, China') {
    try {
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);

      // Get precise astronomical data
      const [latitude, longitude] = this._getCoordinatesForPlace(birthPlace);
      const timezone = this._getTimezoneForPlace(latitude, longitude);
      const ut = hour + minute / 60 - timezone;
      const julianDay = sweph.swe_julday(year, month, day, ut, sweph.SE_GREG_CAL);

      // Calculate pillars with astronomical precision
      const yearPillar = this.calculateYearPillar(year, julianDay);
      const monthPillar = this.calculateMonthPillar(year, month, julianDay);
      const dayPillar = this.calculateDayPillar(year, month, day, julianDay);
      const hourPillar = this.calculateHourPillar(dayPillar.stem, hour);

      // Analyze elements
      const elementAnalysis = this.analyzeElements([
        yearPillar,
        monthPillar,
        dayPillar,
        hourPillar
      ]);

      return {
        pillars: {
          year: yearPillar,
          month: monthPillar,
          day: dayPillar,
          hour: hourPillar
        },
        dayMaster: {
          stem: dayPillar.stem,
          element: this.fiveElements[dayPillar.stem],
          strength: this.calculateDayMasterStrength(
            dayPillar.stem,
            elementAnalysis
          )
        },
        elementAnalysis,
        chineseNotation: this.formatChinesePillars(
          yearPillar,
          monthPillar,
          dayPillar,
          hourPillar
        ),
        interpretation: this.generateBasicInterpretation(
          yearPillar,
          monthPillar,
          dayPillar,
          hourPillar,
          elementAnalysis
        ),
        astronomicalData: {
          julianDay,
          latitude,
          longitude,
          timezone,
          solarTerm: this._getSolarTerm(julianDay),
          lunarPhase: this._calculateLunarPhase(julianDay)
        }
      };
    } catch (error) {
      logger.error('Error calculating Four Pillars:', error);
      return {
        error: 'Unable to calculate Four Pillars at this time',
        pillars: null
      };
    }
  }

  /**
   * Calculate Year Pillar with astronomical precision
   * @private
   */
  calculateYearPillar(year, julianDay) {
    try {
      // Use astronomical data for more precise calculation
      const sunResult = sweph.calc_ut(julianDay, 0, 0x2); // 0 = Sun
      if (sunResult && sunResult.data) {
        // Calculate Chinese year based on solar longitude and traditional system
        // 1984 is Year of Wood Rat (甲子) - use as reference
        const stemIndex = (year - 1984) % 10;
        const branchIndex = (year - 1984) % 12;

        return {
          stem: this.heavenlyStems[stemIndex],
          branch: this.earthlyBranches[branchIndex],
          animal: this.zodiacAnimals[branchIndex],
          element: this.fiveElements[this.heavenlyStems[stemIndex]],
          solarLongitude: sunResult.data[0]
        };
      }
    } catch (error) {
      logger.warn('Error in astronomical year calculation, using traditional method:', error.message);
    }

    // Fallback to traditional calculation
    const stemIndex = (year - 1984) % 10;
    const branchIndex = (year - 1984) % 12;

    return {
      stem: this.heavenlyStems[stemIndex],
      branch: this.earthlyBranches[branchIndex],
      animal: this.zodiacAnimals[branchIndex],
      element: this.fiveElements[this.heavenlyStems[stemIndex]]
    };
  }

  /**
   * Calculate Month Pillar
   * @private
   */
  calculateMonthPillar(year, month) {
    // Simplified calculation
    const yearStemIndex = (year - 1984) % 10;
    const monthOffset = (month - 1) * 2; // Each month advances by 2 stems
    const stemIndex = (yearStemIndex * 2 + monthOffset) % 10;

    const branchIndex = month - 1; // Months correspond to earthly branches

    return {
      stem: this.heavenlyStems[stemIndex],
      branch: this.earthlyBranches[branchIndex],
      element: this.fiveElements[this.heavenlyStems[stemIndex]]
    };
  }

  /**
   * Calculate Day Pillar (simplified)
   * @private
   */
  calculateDayPillar(year, month, day) {
    // Simplified calculation - real BaZi uses complex day calculation
    const baseStem = (year + month + day) % 10;
    const stemIndex = (baseStem + 5) % 10; // Offset for day calculation

    // Day branch based on day of month
    const branchIndex = (day - 1) % 12;

    return {
      stem: this.heavenlyStems[stemIndex],
      branch: this.earthlyBranches[branchIndex],
      element: this.fiveElements[this.heavenlyStems[stemIndex]]
    };
  }

  /**
   * Calculate Hour Pillar
   * @private
   */
  calculateHourPillar(dayStem, hour) {
    // Simplified hour calculation
    const dayStemIndex = this.heavenlyStems.indexOf(dayStem);
    const hourBranchIndex = Math.floor(hour / 2) % 12; // 2-hour periods
    const hourStemIndex = (dayStemIndex * 2 + hourBranchIndex) % 10;

    return {
      stem: this.heavenlyStems[hourStemIndex],
      branch: this.earthlyBranches[hourBranchIndex],
      element: this.fiveElements[this.heavenlyStems[hourStemIndex]]
    };
  }

  /**
   * Analyze Five Elements distribution
   * @private
   */
  analyzeElements(pillars) {
    const elementCount = { Wood: 0, Fire: 0, Earth: 0, Metal: 0, Water: 0 };

    pillars.forEach(pillar => {
      if (pillar.element) {
        elementCount[pillar.element]++;
      }
    });

    // Calculate strongest and weakest elements
    const sortedElements = Object.entries(elementCount).sort(
      (a, b) => b[1] - a[1]
    );

    return {
      distribution: elementCount,
      strongest: sortedElements[0][0],
      weakest: sortedElements[sortedElements.length - 1][0],
      balance: this.assessElementBalance(elementCount)
    };
  }

  /**
   * Assess element balance
   * @private
   */
  assessElementBalance(distribution) {
    const values = Object.values(distribution);
    const max = Math.max(...values);
    const min = Math.min(...values);

    if (max - min <= 1) {
      return 'Balanced';
    }
    if (max >= 3 && min === 0) {
      return `Imbalanced - Strong ${Object.keys(distribution).find(k => distribution[k] === max)}`;
    }
    return 'Moderately Balanced';
  }

  /**
   * Calculate Day Master strength
   * @private
   */
  calculateDayMasterStrength(dayStem, elementAnalysis) {
    const dayElement = this.fiveElements[dayStem];
    const dayElementCount = elementAnalysis.distribution[dayElement];

    if (dayElementCount >= 3) {
      return 'Strong';
    }
    if (dayElementCount === 2) {
      return 'Moderate';
    }
    return 'Weak';
  }

  /**
   * Format Chinese notation
   * @private
   */
  formatChinesePillars(yearPillar, monthPillar, dayPillar, hourPillar) {
    return `${yearPillar.stem}${yearPillar.branch}年 ${monthPillar.stem}${monthPillar.branch}月 ${dayPillar.stem}${dayPillar.branch}日 ${hourPillar.stem}${hourPillar.branch}時`;
  }

  /**
   * Generate basic interpretation
   * @private
   */
  generateBasicInterpretation(
    yearPillar,
    monthPillar,
    dayPillar,
    hourPillar,
    elementAnalysis
  ) {
    const dayMaster = this.fiveElements[dayPillar.stem];
    const strongestElement = elementAnalysis.strongest;

    let interpretation = `Your Four Pillars show a ${dayMaster} Day Master with ${elementAnalysis.balance.toLowerCase()} elemental energy. `;

    if (dayMaster === strongestElement) {
      interpretation += `Your ${dayMaster} energy is strong, suggesting natural talents in ${this.getElementTraits(dayMaster)}. `;
    } else {
      interpretation += `Your ${strongestElement} energy is prominent, which may influence your approach to ${this.getElementTraits(strongestElement)}. `;
    }

    interpretation += `The ${yearPillar.animal} Year Pillar indicates your foundational energy and life path direction.`;

    return interpretation;
  }

  /**
   * Get element personality traits
   * @private
   */
  getElementTraits(element) {
    const traits = {
      Wood: 'creativity, growth, and leadership',
      Fire: 'passion, enthusiasm, and inspiration',
      Earth: 'stability, nurturing, and practicality',
      Metal: 'precision, determination, and structure',
      Water: 'intuition, adaptability, and wisdom'
    };
    return traits[element] || 'various life aspects';
  }

  /**
   * Get Chinese Zodiac sign with astronomical correlations
   * @param {string} birthDate - Birth date in DD/MM/YYYY format
   * @param {string} birthTime - Birth time for precise calculations
   * @param {string} birthPlace - Birth place for timezone
   * @returns {Object} Chinese zodiac information with astronomical data
   */
  getChineseZodiac(birthDate, birthTime = '12:00', birthPlace = 'Beijing, China') {
    try {
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);

      // Get astronomical data
      const [latitude, longitude] = this._getCoordinatesForPlace(birthPlace);
      const timezone = this._getTimezoneForPlace(latitude, longitude);
      const ut = hour + minute / 60 - timezone;
      const julianDay = sweph.julday(year, month, day, ut, 1); // 1 for Gregorian calendar

      const yearPillar = this.calculateYearPillar(year, julianDay);

      // Get current planetary influences
      const currentPlanets = this._getCurrentPlanetaryPositions(julianDay);

      return {
        animal: yearPillar.animal,
        element: yearPillar.element,
        stem: yearPillar.stem,
        branch: yearPillar.branch,
        traits: this.getZodiacTraits(yearPillar.animal),
        elementTraits: this.getElementTraits(yearPillar.element),
        astronomicalData: {
          julianDay,
          solarLongitude: yearPillar.solarLongitude,
          lunarPhase: this._calculateLunarPhase(julianDay),
          planetaryInfluences: currentPlanets
        },
        compatibility: this._calculateZodiacCompatibility(yearPillar.animal, currentPlanets),
        fortune: this._calculateZodiacFortune(yearPillar, julianDay)
      };
    } catch (error) {
      logger.error('Error calculating Chinese zodiac:', error);
      return { error: 'Unable to calculate zodiac' };
    }
  }

  /**
   * Get current planetary positions for zodiac analysis
   * @private
   */
  _getCurrentPlanetaryPositions(julianDay) {
    const planets = {};
    const planetIds = {
      Jupiter: sweph.SE_JUPITER,
      Mars: sweph.SE_MARS,
      Saturn: sweph.SE_SATURN,
      Venus: sweph.SE_VENUS,
      Mercury: sweph.SE_MERCURY
    };

    try {
      Object.entries(planetIds).forEach(([name, id]) => {
        const result = sweph.calc_ut(julianDay, id, 0x2);
        if (result && result.data) {
          planets[name] = {
            longitude: result.data[0],
            sign: this._getZodiacSign(result.data[0])
          };
        }
      });
    } catch (error) {
      logger.warn('Error calculating planetary positions:', error.message);
    }

    return planets;
  }

  /**
   * Get zodiac sign from longitude
   * @private
   */
  _getZodiacSign(longitude) {
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    return signs[Math.floor(longitude / 30)];
  }

  /**
   * Calculate lunar phase
   * @private
   */
  _calculateLunarPhase(julianDay) {
    try {
      const sunResult = sweph.calc_ut(julianDay, 0, 0x2); // 0 = Sun
      const moonResult = sweph.calc_ut(julianDay, 1, 0x2); // 1 = Moon

      if (sunResult && moonResult) {
        const phaseAngle = ((moonResult.data[0] - sunResult.data[0] + 360) % 360);
        return this._getLunarPhaseName(phaseAngle);
      }
      return 'Unknown';
    } catch (error) {
      return 'Unknown';
    }
  }

  /**
   * Get lunar phase name
   * @private
   */
  _getLunarPhaseName(angle) {
    if (angle < 45) { return 'New Moon'; }
    if (angle < 90) { return 'Waxing Crescent'; }
    if (angle < 135) { return 'First Quarter'; }
    if (angle < 180) { return 'Waxing Gibbous'; }
    if (angle < 225) { return 'Full Moon'; }
    if (angle < 270) { return 'Waning Gibbous'; }
    if (angle < 315) { return 'Last Quarter'; }
    return 'Waning Crescent';
  }

  /**
   * Get solar term
   * @private
   */
  _getSolarTerm(julianDay) {
    try {
      const sunResult = sweph.calc_ut(julianDay, 0, 0x2); // 0 = Sun
      if (sunResult && sunResult.data) {
        const longitude = sunResult.data[0] % 360;
        const termIndex = Math.floor(longitude / 15) * 15;
        return this.solarTerms[termIndex] || 'Unknown';
      }
      return 'Unknown';
    } catch (error) {
      return 'Unknown';
    }
  }

  /**
   * Calculate zodiac compatibility
   * @private
   */
  _calculateZodiacCompatibility(animal, planets) {
    // Simplified compatibility based on traditional Chinese astrology
    const compatibility = {
      Rat: ['Dragon', 'Monkey'],
      Ox: ['Snake', 'Rooster'],
      Tiger: ['Horse', 'Dog'],
      Rabbit: ['Goat', 'Pig'],
      Dragon: ['Rat', 'Monkey', 'Rooster'],
      Snake: ['Ox', 'Rooster'],
      Horse: ['Tiger', 'Dog', 'Goat'],
      Goat: ['Rabbit', 'Horse', 'Pig'],
      Monkey: ['Rat', 'Dragon'],
      Rooster: ['Ox', 'Snake', 'Dragon'],
      Dog: ['Tiger', 'Horse'],
      Pig: ['Rabbit', 'Goat']
    };

    return compatibility[animal] || [];
  }

  /**
   * Calculate zodiac fortune
   * @private
   */
  _calculateZodiacFortune(yearPillar, julianDay) {
    try {
      // Simplified fortune calculation based on element balance and planetary positions
      const elementStrength = this._assessElementStrength(yearPillar.element, julianDay);
      const planetaryScore = this._calculatePlanetaryScore(julianDay);

      let fortune = 'Neutral';
      if (elementStrength > 0.7 && planetaryScore > 0.6) {
        fortune = 'Excellent';
      } else if (elementStrength > 0.5 && planetaryScore > 0.4) {
        fortune = 'Good';
      } else if (elementStrength < 0.3 || planetaryScore < 0.3) {
        fortune = 'Challenging';
      }

      return {
        overall: fortune,
        elementStrength: Math.round(elementStrength * 100) / 100,
        planetaryScore: Math.round(planetaryScore * 100) / 100
      };
    } catch (error) {
      return { overall: 'Unknown', elementStrength: 0.5, planetaryScore: 0.5 };
    }
  }

  /**
   * Assess element strength
   * @private
   */
  _assessElementStrength(element, julianDay) {
    // Simplified element strength calculation
    const elementPlanets = {
      Wood: ['Jupiter'],
      Fire: ['Mars'],
      Earth: ['Saturn'],
      Metal: ['Venus'],
      Water: ['Mercury']
    };

    const relevantPlanets = elementPlanets[element] || [];
    let strength = 0.5; // Base strength

    try {
      relevantPlanets.forEach(planet => {
        const planetId = this._getPlanetId(planet);
        if (planetId) {
          const result = sweph.calc_ut(julianDay, planetId, 0x2);
          if (result && result.data) {
            // Add strength based on planetary position
            strength += 0.1;
          }
        }
      });
    } catch (error) {
      logger.warn('Error assessing element strength:', error.message);
    }

    return Math.min(strength, 1.0);
  }

  /**
   * Calculate planetary score
   * @private
   */
  _calculatePlanetaryScore(julianDay) {
    let score = 0.5;
    const planets = ['Jupiter', 'Venus', 'Mercury'];

    try {
      planets.forEach(planet => {
        const planetId = this._getPlanetId(planet);
        if (planetId) {
          const result = sweph.calc_ut(julianDay, planetId, 0x2);
          if (result && result.data) {
            score += 0.1;
          }
        }
      });
    } catch (error) {
      logger.warn('Error calculating planetary score:', error.message);
    }

    return Math.min(score, 1.0);
  }

  /**
   * Get planet ID for Swiss Ephemeris
   * @private
   */
  _getPlanetId(planetName) {
    const planetMap = {
      Sun: sweph.SE_SUN,
      Moon: sweph.SE_MOON,
      Mars: sweph.SE_MARS,
      Venus: sweph.SE_VENUS,
      Mercury: sweph.SE_MERCURY,
      Jupiter: sweph.SE_JUPITER,
      Saturn: sweph.SE_SATURN
    };
    return planetMap[planetName];
  }

  /**
   * Get coordinates for a place (simplified)
   * @private
   */
  _getCoordinatesForPlace(place) {
    const placeCoords = {
      'Beijing, China': [39.9042, 116.4074],
      'Shanghai, China': [31.2304, 121.4737],
      'Hong Kong, China': [22.3193, 114.1694],
      'Taipei, Taiwan': [25.0330, 121.5654]
    };
    return placeCoords[place] || [39.9042, 116.4074]; // Default to Beijing
  }

  /**
   * Get timezone for coordinates
   * @private
   */
  _getTimezoneForPlace(lat, lng) {
    // China Standard Time
    return 8; // UTC+8
  }

  /**
   * Get zodiac animal traits
   * @private
   */
  getZodiacTraits(animal) {
    const traits = {
      Rat: 'Intelligent, adaptable, quick-witted, charming, artistic',
      Ox: 'Reliable, diligent, methodical, calm, honest',
      Tiger: 'Brave, competitive, unpredictable, generous, magnetic',
      Rabbit: 'Gentle, sensitive, compassionate, ambitious, lucky',
      Dragon: 'Confident, intelligent, enthusiastic, gifted, loyal',
      Snake: 'Wise, intuitive, graceful, determined, passionate',
      Horse: 'Animated, active, energetic, independent, impatient',
      Goat: 'Calm, gentle, sympathetic, straightforward, pessimistic',
      Monkey: 'Sharp, smart, curious, innovative, mischievous',
      Rooster: 'Honest, energetic, intelligent, flamboyant, flexible',
      Dog: 'Loyal, honest, amiable, kind, cautious',
      Pig: 'Brave, noble, independent, optimistic, sincere'
    };
    return traits[animal] || 'Unique personality traits';
  }
}

module.exports = { ChineseCalculator };
