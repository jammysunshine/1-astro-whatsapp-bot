const logger = require('../../../utils/logger');

/**
 * HoraryConfig - Configuration and foundational data for Horary Astrology
 * Contains planetary rulers, house meanings, planetary hours, and question categories
 */
class HoraryConfig {
  constructor() {
    logger.info('Module: HoraryConfig loaded with complete horary astrology database');

    // Initialize core horary data structures
    this.planetaryRulers = this.initializePlanetaryRulers();
    this.houseMeanings = this.initializeHouseMeanings();
    this.planetaryHours = this.initializePlanetaryHours();
    this.questionCategories = this.initializeQuestionCategories();
  }

  /**
   * Initialize planetary rulers with their dignities and meanings
   * @returns {Object} Planetary rulers data
   */
  initializePlanetaryRulers() {
    return {
      sun: {
        name: 'Sun',
        symbol: '☉',
        dignity: 'Leadership, authority, father, husband, government',
        meaning: 'Success, honor, vitality, but also pride and arrogance',
        questions: 'Career, leadership, father, authority figures'
      },
      moon: {
        name: 'Moon',
        symbol: '☽',
        dignity: 'Mother, emotions, home, public, women',
        meaning: 'Change, fluctuation, intuition, but also moodiness',
        questions: 'Home, family, emotions, mother, public matters'
      },
      mercury: {
        name: 'Mercury',
        symbol: '☿',
        dignity: 'Communication, siblings, short journeys, intellect',
        meaning: 'Adaptability, communication, but also deceit and nervousness',
        questions: 'Communication, education, siblings, short trips, business'
      },
      venus: {
        name: 'Venus',
        symbol: '♀',
        dignity: 'Love, beauty, pleasure, harmony, women',
        meaning: 'Harmony, love, beauty, but also laziness and indulgence',
        questions: 'Love, marriage, beauty, arts, pleasure, female friends'
      },
      mars: {
        name: 'Mars',
        symbol: '♂',
        dignity: 'Action, conflict, courage, men, energy',
        meaning: 'Action, courage, passion, but also anger and violence',
        questions: 'Conflicts, action, courage, enemies, male friends, surgery'
      },
      jupiter: {
        name: 'Jupiter',
        symbol: '♃',
        dignity: 'Expansion, wisdom, religion, prosperity, teachers',
        meaning: 'Growth, optimism, wisdom, but also excess and exaggeration',
        questions: 'Wealth, religion, philosophy, long journeys, teachers, law'
      },
      saturn: {
        name: 'Saturn',
        symbol: '♄',
        dignity: 'Structure, discipline, elders, karma, limitations',
        meaning: 'Discipline, structure, wisdom, but also depression and restriction',
        questions: 'Career, elders, property, agriculture, chronic illness, karma'
      }
    };
  }

  /**
   * Initialize house meanings in horary astrology
   * @returns {Object} House meanings data
   */
  initializeHouseMeanings() {
    return {
      1: 'Querent (questioner), appearance, first impressions, personality',
      2: 'Wealth, possessions, resources, self-worth, family inheritance',
      3: 'Siblings, communication, short journeys, education, neighbors',
      4: 'Home, family, parents, property, end of matters, hidden things',
      5: 'Children, creativity, romance, speculation, entertainment, pleasure',
      6: 'Health, service, employees, daily routine, small animals, enemies',
      7: 'Partnership, marriage, business partners, open enemies, spouse',
      8: 'Death, transformation, secrets, other people\'s money, occult',
      9: 'Long journeys, higher education, religion, philosophy, law, dreams',
      10: 'Career, reputation, authority, father, public image, ambition',
      11: 'Friends, hopes, wishes, groups, step-children, gains',
      12: 'Spirituality, hidden enemies, isolation, hospitals, foreign lands, sacrifice'
    };
  }

  /**
   * Initialize planetary hours sequence
   * @returns {Array} Planetary hours sequence
   */
  initializePlanetaryHours() {
    return [
      'Saturn',
      'Jupiter',
      'Mars',
      'Sun',
      'Venus',
      'Mercury',
      'Moon', // Day hours
      'Saturn',
      'Jupiter',
      'Mars',
      'Sun',
      'Venus',
      'Mercury',
      'Moon', // Night hours
      'Mars',
      'Sun',
      'Venus',
      'Mercury',
      'Moon',
      'Saturn',
      'Jupiter' // Remaining hours
    ];
  }

  /**
   * Initialize question categories with their governing houses and rulers
   * @returns {Object} Question categories data
   */
  initializeQuestionCategories() {
    return {
      love: {
        houses: [5, 7],
        rulers: ['venus', 'moon'],
        description: 'Love, relationships, marriage, emotional connections'
      },
      career: {
        houses: [2, 6, 10],
        rulers: ['saturn', 'jupiter', 'sun'],
        description: 'Career, work, professional success, authority'
      },
      health: {
        houses: [6, 8, 12],
        rulers: ['mars', 'saturn'],
        description: 'Health, illness, medical conditions, wellness'
      },
      money: {
        houses: [2, 8, 11],
        rulers: ['venus', 'jupiter'],
        description: 'Finances, wealth, possessions, inheritance'
      },
      travel: {
        houses: [3, 9],
        rulers: ['mercury', 'jupiter'],
        description: 'Journeys, travel, relocation, abroad'
      },
      family: {
        houses: [3, 4, 5],
        rulers: ['moon', 'venus'],
        description: 'Family, parents, siblings, home matters'
      },
      legal: {
        houses: [7, 9],
        rulers: ['jupiter', 'venus'],
        description: 'Legal matters, contracts, courts, justice'
      },
      spiritual: {
        houses: [9, 12],
        rulers: ['jupiter', 'neptune'],
        description: 'Spiritual matters, religion, inner guidance'
      },
      general: {
        houses: [1, 7],
        rulers: ['sun', 'moon'],
        description: 'General inquiries, life situations'
      }
    };
  }

  /**
   * Get planetary ruler data by planet name
   * @param {string} planet - Planet name (lowercase)
   * @returns {Object} Planetary ruler data
   */
  getPlanetaryRuler(planet) {
    return this.planetaryRulers[planet];
  }

  /**
   * Get all planetary rulers
   * @returns {Object} All planetary rulers
   */
  getAllPlanetaryRulers() {
    return this.planetaryRulers;
  }

  /**
   * Get house meaning by house number
   * @param {number} houseNumber - House number (1-12)
   * @returns {string} House meaning
   */
  getHouseMeaning(houseNumber) {
    return this.houseMeanings[houseNumber];
  }

  /**
   * Get all house meanings
   * @returns {Object} All house meanings
   */
  getAllHouseMeanings() {
    return this.houseMeanings;
  }

  /**
   * Get planetary hour for given index
   * @param {number} hourIndex - Hour index (0-23)
   * @returns {string} Planetary hour ruler
   */
  getPlanetaryHour(hourIndex) {
    return this.planetaryHours[hourIndex % 24];
  }

  /**
   * Get question category data
   * @param {string} category - Category name
   * @returns {Object} Category data
   */
  getQuestionCategory(category) {
    return this.questionCategories[category] || this.questionCategories.general;
  }

  /**
   * Get all question categories
   * @returns {Object} All question categories
   */
  getAllQuestionCategories() {
    return this.questionCategories;
  }

  /**
   * Get zodiac sign from longitude
   * @param {number} longitude - Longitude in degrees
   * @returns {string} Zodiac sign name
   */
  getZodiacSign(longitude) {
    const signs = [
      'Aries', 'Taurus', 'Gemini', 'Cancer',
      'Leo', 'Virgo', 'Libra', 'Scorpio',
      'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    const signIndex = Math.floor(longitude / 30) % 12;
    return signs[signIndex];
  }

  /**
   * Get house number from longitude and ascendant
   * @param {number} longitude - Planet longitude in degrees
   * @param {number} ascendant - Ascendant degree
   * @returns {number} House number (1-12)
   */
  getHouseNumber(longitude, ascendant) {
    const position = (longitude - ascendant + 360) % 360;
    return Math.floor(position / 30) + 1;
  }

  /**
   * Get ascendant symbol
   * @param {number} degree - Ascendant degree
   * @returns {string} Symbol for the sign
   */
  getAscendantSymbol(degree) {
    const sign = this.getZodiacSign(degree);
    const symbols = {
      Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋',
      Leo: '♌', Virgo: '♍', Libra: '♎', Scorpio: '♏',
      Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓'
    };
    return symbols[sign] || '♈';
  }

  /**
   * Get ruler of a zodiac sign
   * @param {string} sign - Zodiac sign name
   * @returns {string} Ruling planet (lowercase)
   */
  getSignRuler(sign) {
    const rulers = {
      Aries: 'mars', Taurus: 'venus', Gemini: 'mercury',
      Cancer: 'moon', Leo: 'sun', Virgo: 'mercury',
      Libra: 'venus', Scorpio: 'mars', Sagittarius: 'jupiter',
      Capricorn: 'saturn', Aquarius: 'saturn', Pisces: 'jupiter'
    };
    return rulers[sign] || 'sun';
  }

  /**
   * Calculate day of year for seasonal adjustments
   * @param {number} day - Day of month
   * @param {number} month - Month (1-12)
   * @returns {number} Day of year
   */
  getDayOfYear(day, month) {
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let dayOfYear = day;
    for (let i = 0; i < month - 1; i++) {
      dayOfYear += daysInMonth[i];
    }
    return dayOfYear;
  }

  /**
   * Health check for HoraryConfig
   * @returns {Object} Health status
   */
  healthCheck() {
    try {
      const planetsLoaded = Object.keys(this.planetaryRulers).length;
      const housesLoaded = Object.keys(this.houseMeanings).length;
      const hoursLoaded = this.planetaryHours.length;
      const categoriesLoaded = Object.keys(this.questionCategories).length;

      return {
        healthy: planetsLoaded === 7 && housesLoaded === 12 && hoursLoaded === 24 && categoriesLoaded >= 8,
        planetsLoaded,
        housesLoaded,
        hoursLoaded,
        categoriesLoaded,
        version: '1.0.0',
        description: 'Complete horary astrology foundational database',
        status: planetsLoaded === 7 && housesLoaded === 12 ? 'Complete' : 'Incomplete'
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = { HoraryConfig };