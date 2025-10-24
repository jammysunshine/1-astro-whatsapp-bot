const logger = require('../../utils/logger');

/**
 * Chinese Astrology Calculator - BaZi (Four Pillars of Destiny)
 * Provides traditional Chinese astrology calculations including Four Pillars,
 * Five Elements analysis, and basic interpretations.
 */

class ChineseCalculator {
  constructor() {
    // Heavenly Stems (天干)
    this.heavenlyStems = [
      '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'
    ];

    // Earthly Branches (地支)
    this.earthlyBranches = [
      '子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'
    ];

    // Chinese Zodiac Animals
    this.zodiacAnimals = [
      'Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake',
      'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'
    ];

    // Five Elements
    this.fiveElements = {
      '甲': 'Wood', '乙': 'Wood',
      '丙': 'Fire', '丁': 'Fire',
      '戊': 'Earth', '己': 'Earth',
      '庚': 'Metal', '辛': 'Metal',
      '壬': 'Water', '癸': 'Water'
    };

    // Element relationships
    this.elementRelationships = {
      Wood: { generates: 'Fire', controls: 'Earth', weakenedBy: 'Metal', strengthenedBy: 'Water' },
      Fire: { generates: 'Earth', controls: 'Metal', weakenedBy: 'Water', strengthenedBy: 'Wood' },
      Earth: { generates: 'Metal', controls: 'Water', weakenedBy: 'Wood', strengthenedBy: 'Fire' },
      Metal: { generates: 'Water', controls: 'Wood', weakenedBy: 'Fire', strengthenedBy: 'Earth' },
      Water: { generates: 'Wood', controls: 'Fire', weakenedBy: 'Earth', strengthenedBy: 'Metal' }
    };
  }

  /**
   * Calculate Four Pillars (BaZi) from birth date and time
   * @param {string} birthDate - Birth date in DD/MM/YYYY format
   * @param {string} birthTime - Birth time in HH:MM format
   * @returns {Object} Four Pillars analysis
   */
  calculateFourPillars(birthDate, birthTime = '12:00') {
    try {
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);

      // Calculate pillars
      const yearPillar = this.calculateYearPillar(year);
      const monthPillar = this.calculateMonthPillar(year, month);
      const dayPillar = this.calculateDayPillar(year, month, day);
      const hourPillar = this.calculateHourPillar(dayPillar.stem, hour);

      // Analyze elements
      const elementAnalysis = this.analyzeElements([yearPillar, monthPillar, dayPillar, hourPillar]);

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
          strength: this.calculateDayMasterStrength(dayPillar.stem, elementAnalysis)
        },
        elementAnalysis,
        chineseNotation: this.formatChinesePillars(yearPillar, monthPillar, dayPillar, hourPillar),
        interpretation: this.generateBasicInterpretation(yearPillar, monthPillar, dayPillar, hourPillar, elementAnalysis)
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
   * Calculate Year Pillar
   * @private
   */
  calculateYearPillar(year) {
    // Simplified calculation - in reality this involves lunar calendar
    const stemIndex = (year - 1984) % 10; // 1984 is Year of Wood Rat (甲子)
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
    const sortedElements = Object.entries(elementCount)
      .sort((a, b) => b[1] - a[1]);

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

    if (max - min <= 1) return 'Balanced';
    if (max >= 3 && min === 0) return 'Imbalanced - Strong ' + Object.keys(distribution).find(k => distribution[k] === max);
    return 'Moderately Balanced';
  }

  /**
   * Calculate Day Master strength
   * @private
   */
  calculateDayMasterStrength(dayStem, elementAnalysis) {
    const dayElement = this.fiveElements[dayStem];
    const dayElementCount = elementAnalysis.distribution[dayElement];

    if (dayElementCount >= 3) return 'Strong';
    if (dayElementCount === 2) return 'Moderate';
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
  generateBasicInterpretation(yearPillar, monthPillar, dayPillar, hourPillar, elementAnalysis) {
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
   * Get Chinese Zodiac sign
   * @param {string} birthDate - Birth date in DD/MM/YYYY format
   * @returns {Object} Chinese zodiac information
   */
  getChineseZodiac(birthDate) {
    try {
      const [day, month, year] = birthDate.split('/').map(Number);
      const yearPillar = this.calculateYearPillar(year);

      return {
        animal: yearPillar.animal,
        element: yearPillar.element,
        stem: yearPillar.stem,
        branch: yearPillar.branch,
        traits: this.getZodiacTraits(yearPillar.animal),
        elementTraits: this.getElementTraits(yearPillar.element)
      };
    } catch (error) {
      logger.error('Error calculating Chinese zodiac:', error);
      return { error: 'Unable to calculate zodiac' };
    }
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

module.exports = new ChineseCalculator();