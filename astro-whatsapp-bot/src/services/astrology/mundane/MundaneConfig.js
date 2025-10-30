const logger = require('../../../utils/logger');

/**
 * MundaneConfig - Configuration and foundational data for Mundane Astrology
 * Contains country rulerships, planetary significators, and electional factors
 * for world event analysis and timing selection
 */
class MundaneConfig {
  constructor() {
    logger.info('Module: MundaneConfig loaded with complete world astrology database');

    // Initialize core mundane astrology data structures
    this.countryRulerships = this.initializeCountryRulerships();
    this.mundaneSignificators = this.initializeMundaneSignificators();
    this.electionalFactors = this.initializeElectionalFactors();
    this.houseSignificances = this.initializeHouseSignificances();
    this.planetaryClustos = this.initializePlanetaryClusters();
  }

  /**
   * Initialize planetary rulerships for countries and world affairs
   * @returns {Object} Country rulership mappings
   */
  initializeCountryRulerships() {
    return {
      // Major world powers
      'United States': {
        planets: ['sun', 'saturn'],
        elements: ['fire', 'earth'],
        region: 'North America',
        significance: 'Global leadership and economic power'
      },
      Russia: {
        planets: ['mars', 'saturn'],
        elements: ['fire', 'earth'],
        region: 'Eastern Europe/Asia',
        significance: 'Military strength and territorial expansion'
      },
      China: {
        planets: ['venus', 'saturn'],
        elements: ['earth', 'earth'],
        region: 'East Asia',
        significance: 'Economic transformation and long-term planning'
      },
      'United Kingdom': {
        planets: ['moon', 'mercury'],
        elements: ['water', 'air'],
        region: 'Western Europe',
        significance: 'Historical legacy and diplomatic tradition'
      },
      Germany: {
        planets: ['venus', 'mercury'],
        elements: ['earth', 'air'],
        region: 'Central Europe',
        significance: 'Industrial and technological leadership'
      },
      France: {
        planets: ['sun', 'venus'],
        elements: ['fire', 'earth'],
        region: 'Western Europe',
        significance: 'Cultural influence and revolutionary spirit'
      },
      India: {
        planets: ['moon', 'jupiter'],
        elements: ['water', 'fire'],
        region: 'South Asia',
        significance: 'Spiritual heritage and demographic dynamics'
      },
      Japan: {
        planets: ['mercury', 'venus'],
        elements: ['air', 'earth'],
        region: 'East Asia',
        significance: 'Technological innovation and cultural harmony'
      },
      Brazil: {
        planets: ['venus', 'moon'],
        elements: ['earth', 'water'],
        region: 'South America',
        significance: 'Natural resources and cultural diversity'
      },
      Canada: {
        planets: ['moon', 'mercury'],
        elements: ['water', 'air'],
        region: 'North America',
        significance: 'Natural beauty and peacekeeping tradition'
      },
      Australia: {
        planets: ['sun', 'uranus'],
        elements: ['fire', 'air'],
        region: 'Oceania',
        significance: 'Innovation and environmental challenges'
      },

      // Key regions and continents
      Europe: {
        planets: ['mercury', 'venus'],
        elements: ['air', 'earth'],
        region: 'Europe',
        significance: 'Cultural diversity and economic integration'
      },
      Asia: {
        planets: ['saturn', 'jupiter'],
        elements: ['earth', 'fire'],
        region: 'Asia',
        significance: 'Population centers and economic growth'
      },
      Africa: {
        planets: ['mars', 'sun'],
        elements: ['fire', 'fire'],
        region: 'Africa',
        significance: 'Natural resources and youthful energy'
      },
      'North America': {
        planets: ['sun', 'saturn'],
        elements: ['fire', 'earth'],
        region: 'North America',
        significance: 'Economic powerhouse and technological innovation'
      },
      'South America': {
        planets: ['venus', 'mars'],
        elements: ['earth', 'fire'],
        region: 'South America',
        significance: 'Natural diversity and political transformation'
      },
      'Middle East': {
        planets: ['mars', 'saturn'],
        elements: ['fire', 'earth'],
        region: 'Middle East',
        significance: 'Strategic location and religious significance'
      }
    };
  }

  /**
   * Initialize mundane astrology significators for different world areas
   * @returns {Object} Mundane significators
   */
  initializeMundaneSignificators() {
    return {
      politics: {
        planets: ['sun', 'saturn', 'mars'],
        houses: [1, 4, 7, 10],
        aspects: ['conjunction', 'square', 'opposition'],
        description: 'Government actions, leadership changes, political conflicts'
      },
      economics: {
        planets: ['venus', 'mercury', 'jupiter'],
        houses: [2, 8, 11],
        aspects: ['trine', 'sextile', 'conjunction'],
        description: 'Market movements, economic policies, financial events'
      },
      natural_disasters: {
        planets: ['mars', 'uranus', 'neptune'],
        houses: [6, 8, 12],
        aspects: ['square', 'opposition', 'conjunction'],
        description: 'Earthquakes, storms, floods, climate events'
      },
      wars_conflicts: {
        planets: ['mars', 'saturn', 'uranus'],
        houses: [6, 8, 12],
        aspects: ['square', 'opposition', 'conjunction'],
        description: 'Military actions, political conflicts, international tensions'
      },
      technology: {
        planets: ['mercury', 'uranus'],
        houses: [3, 11],
        aspects: ['trine', 'sextile', 'conjunction'],
        description: 'Technological breakthroughs, communication advances'
      },
      health: {
        planets: ['moon', 'mercury', 'chiron'],
        houses: [6, 12],
        aspects: ['square', 'opposition', 'conjunction'],
        description: 'Global health crises, pandemics, medical discoveries'
      },
      environment: {
        planets: ['earth', 'neptune', 'uranus'],
        houses: [4, 12],
        aspects: ['square', 'opposition', 'conjunction'],
        description: 'Climate change, environmental disasters, ecological issues'
      },
      social_movements: {
        planets: ['uranus', 'saturn', 'pluto'],
        houses: [11, 12],
        aspects: ['square', 'opposition', 'conjunction'],
        description: 'Revolutions, social changes, cultural transformations'
      }
    };
  }

  /**
   * Initialize electional astrology factors
   * @returns {Object} Electional factors for auspicious timing
   */
  initializeElectionalFactors() {
    return {
      sun: {
        good_for: ['leadership', 'authority', 'public events', 'government decisions'],
        avoid: ['illness', 'concealment', 'private matters'],
        best_houses: [1, 4, 7, 10],
        strength_period: 'Rising to mid-day'
      },
      moon: {
        good_for: ['domestic', 'emotional', 'healing', 'family matters'],
        avoid: ['travel', 'legal matters', 'long-term commitments'],
        best_houses: [4, 5, 7, 11],
        strength_period: 'Waxing phases'
      },
      mercury: {
        good_for: ['communication', 'learning', 'business', 'writing'],
        avoid: ['emotional decisions', 'major commitments'],
        best_houses: [3, 6, 9, 11],
        strength_period: 'Morning hours'
      },
      venus: {
        good_for: ['relationships', 'art', 'finance', 'beauty'],
        avoid: ['confrontation', 'surgery', 'aggressive actions'],
        best_houses: [2, 5, 7, 11],
        strength_period: 'Afternoon to evening'
      },
      mars: {
        good_for: ['action', 'competition', 'surgery', 'physical work'],
        avoid: ['marriage', 'partnerships', 'legal agreements'],
        best_houses: [1, 3, 5, 9],
        strength_period: 'Tuesday, during Mars hour'
      },
      jupiter: {
        good_for: ['expansion', 'travel', 'education', 'philanthropy'],
        avoid: ['debt', 'restriction', 'over-expansion'],
        best_houses: [5, 9, 11, 12],
        strength_period: 'Thursday, Jupiter hours'
      },
      saturn: {
        good_for: ['structure', 'discipline', 'long-term projects'],
        avoid: ['new beginnings', 'risk-taking', 'short-term goals'],
        best_houses: [2, 6, 10, 11],
        strength_period: 'Saturday, Saturn hours'
      }
    };
  }

  /**
   * Initialize house significances for mundane astrology
   * @returns {Object} House significances
   */
  initializeHouseSignificances() {
    return {
      1: {
        mundane: 'National identity, leadership, first impressions of countries',
        events: ['Government changes', 'National image', 'Leadership crises']
      },
      2: {
        mundane: 'National wealth, resources, economy, national values',
        events: ['Economic policies', 'Financial crises', 'Resource conflicts']
      },
      3: {
        mundane: 'Communication, media, transportation, neighboring countries',
        events: ['Media events', 'Transportation issues', 'Local communications']
      },
      4: {
        mundane: 'National foundations, homeland, agriculture, real estate',
        events: ['Domestic policies', 'Agricultural issues', 'Housing markets']
      },
      5: {
        mundane: 'Creative expression, entertainment, speculation, youth',
        events: ['Cultural events', 'Entertainment industry', 'Stock markets']
      },
      6: {
        mundane: 'Service, health, labor, armed forces, daily work',
        events: ['Health crises', 'Labor disputes', 'Military actions']
      },
      7: {
        mundane: 'International relations, partnerships, foreign affairs',
        events: ['Diplomatic relations', 'Trade agreements', 'International treaties']
      },
      8: {
        mundane: 'Transformation, secrets, other people\'s money, death and taxes',
        events: ['Major transformations', 'Financial crises', 'Death rates']
      },
      9: {
        mundane: 'Religion, philosophy, higher education, long-distance travel',
        events: ['Religious events', 'Educational reforms', 'International travel']
      },
      10: {
        mundane: 'Government, authority, reputation, career of leaders',
        events: ['Government changes', 'Policy announcements', 'Leadership image']
      },
      11: {
        mundane: 'Community, technology, hopes, wishes, group activities',
        events: ['Technological breakthroughs', 'Social movements', 'Group activities']
      },
      12: {
        mundane: 'Spirituality, hidden enemies, institutions, foreign lands',
        events: ['Spiritual movements', 'Behind-the-scenes activities', 'Institutional changes']
      }
    };
  }

  /**
   * Initialize planetary cluster configurations
   * @returns {Object} Planetary cluster meanings
   */
  initializePlanetaryClusters() {
    return {
      stellium3: {
        min_planets: 3,
        significance: 'Intense focus in specific life area',
        impact: 'Major developments in related sphere'
      },
      stellium4: {
        min_planets: 4,
        significance: 'Extraordinary emphasis and transformation',
        impact: 'Revolutionary changes in planetary sector'
      },
      grand_cross: {
        planets: 4,
        aspects: ['squares', 'oppositions'],
        significance: 'Maximum tension and breakthrough potential',
        impact: 'Major global crises or breakthroughs'
      },
      t_square: {
        planets: 3,
        aspects: ['squares', 'opposition'],
        significance: 'Intense pressure requiring action',
        impact: 'Focused challenges needing resolution'
      }
    };
  }

  /**
   * Get country rulership data
   * @param {string} country - Country name
   * @returns {Object} Country rulership data
   */
  getCountryRulership(country) {
    return this.countryRulerships[country];
  }

  /**
   * Get all country rulerships
   * @returns {Object} All country rulerships
   */
  getAllCountryRulerships() {
    return this.countryRulerships;
  }

  /**
   * Get mundane significator data
   * @param {string} category - Mundane category
   * @returns {Object} Mundane significator data
   */
  getMundaneSignificator(category) {
    return this.mundaneSignificators[category];
  }

  /**
   * Get all mundane significators
   * @returns {Object} All mundane significators
   */
  getAllMundaneSignificators() {
    return this.mundaneSignificators;
  }

  /**
   * Get electional factor for planet
   * @param {string} planet - Planet name
   * @returns {Object} Electional factors
   */
  getElectionalFactor(planet) {
    return this.electionalFactors[planet];
  }

  /**
   * Get all electional factors
   * @returns {Object} All electional factors
   */
  getAllElectionalFactors() {
    return this.electionalFactors;
  }

  /**
   * Get house significance
   * @param {number} houseNumber - House number (1-12)
   * @returns {Object} House significance
   */
  getHouseSignificance(houseNumber) {
    return this.houseSignificances[houseNumber];
  }

  /**
   * Get all house significances
   * @returns {Object} All house significances
   */
  getAllHouseSignificances() {
    return this.houseSignificances;
  }

  /**
   * Get zodiac sign from longitude (for mundane charts)
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
   * Get house number from longitude (for horary/mundane charts)
   * @param {number} longitude - Planet longitude
   * @param {number} ascendant - Ascendant degree
   * @returns {number} House number (1-12)
   */
  getHouseNumber(longitude, ascendant) {
    const position = (longitude - ascendant + 360) % 360;
    return Math.floor(position / 30) + 1;
  }

  /**
   * Check if planet is powerful in mundane context
   * @param {string} planet - Planet name
   * @param {number} house - House position
   * @param {string} sign - Sign position
   * @returns {boolean} Whether planet is powerful
   */
  isPlanetPowerful(planet, house, sign) {
    // Angular houses (worldly power)
    if ([1, 4, 7, 10].includes(house)) {
      return true;
    }

    // Exalted signs
    const exaltations = {
      sun: 'Aries',
      moon: 'Taurus',
      mercury: 'Virgo',
      venus: 'Pisces',
      mars: 'Capricorn',
      jupiter: 'Cancer',
      saturn: 'Libra'
    };

    if (exaltations[planet] === sign) {
      return true;
    }

    return false;
  }

  /**
   * Get planetary cluster information
   * @param {number} planetCount - Number of planets in cluster
   * @returns {Object} Cluster information
   */
  getPlanetaryCluster(planetCount) {
    if (planetCount >= 4) {
      return this.planetaryClusters.stellium4;
    } else if (planetCount === 3) {
      return this.planetaryClusters.stellium3;
    }

    return null;
  }

  /**
   * Calculate influence score for countries based on planetary factors
   * @param {Object} rulership - Country rulership
   * @param {Array} planetFactors - Planetary factors present
   * @returns {number} Influence score
   */
  calculateInfluenceScore(rulership, planetFactors) {
    let score = 0;

    // Ruling planets receive higher weighting
    rulership.planets.forEach(planet => {
      const factors = planetFactors[planet] || [];
      factors.forEach(factor => {
        if (factor.type === 'house_angular') {
          score += 3;
        } else if (factor.type === 'exalted') {
          score += 2;
        } else if (factor.type === 'retrograde') {
          score += 1;
        }
      });
    });

    return score;
  }

  /**
   * Health check for MundaneConfig
   * @returns {Object} Health status
   */
  healthCheck() {
    try {
      const countries = Object.keys(this.countryRulerships).length;
      const significators = Object.keys(this.mundaneSignificators).length;
      const electionals = Object.keys(this.electionalFactors).length;
      const houses = Object.keys(this.houseSignificances).length;

      return {
        healthy: countries >= 10 && significators >= 5 && electionals >= 5 && houses === 12,
        countries,
        significators,
        electionals,
        houses,
        version: '1.0.0',
        description: 'Complete mundane astrology foundational database',
        database_status: countries >= 10 && significators >= 5 && electionals >= 5 && houses === 12 ? 'Complete' : 'Incomplete'
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

module.exports = { MundaneConfig };