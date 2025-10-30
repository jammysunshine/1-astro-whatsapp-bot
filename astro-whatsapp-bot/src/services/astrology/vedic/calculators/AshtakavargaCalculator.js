const logger = require('../../../../utils/logger');
const sweph = require('sweph');

class AshtakavargaCalculator {
  constructor() {
    logger.info('Module: AshtakavargaCalculator loaded - Vedic 64-Point Benefic Analysis');
  }

  async calculateAshtakavarga(birthData) {
    try {
      // Validate required services before proceeding
      this._validateServices();

      const { birthDate, birthTime, birthPlace } = birthData;

      if (!birthDate || !birthTime || !birthPlace) {
        return { error: 'Complete birth details required for Ashtakavarga analysis' };
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

      // Get planetary positions
      const planets = await this._getVedicPlanetaryPositions(jd, locationInfo.latitude, locationInfo.longitude, locationInfo.timezone);

      // Calculate Ashtakavarga for each planet
      const ashtakavarga = {};
      const planetNames = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];

      planetNames.forEach(planet => {
        ashtakavarga[planet] = this._calculatePlanetAshtakavarga(planet, planets);
      });

      // Calculate Sarva Ashtakavarga (combined)
      const sarvaAshtakavarga = this._calculateSarvaAshtakavarga(ashtakavarga);

      // Analyze results
      const analysis = this._analyzeAshtakavarga(ashtakavarga, sarvaAshtakavarga);

      return {
        individualAshtakavarga: ashtakavarga,
        sarvaAshtakavarga,
        analysis,
        summary: this._analyzeAshtakavarga(ashtakavarga, sarvaAshtakavarga),
        predictions: this._generateAshtakavargaPredictions(sarvaAshtakavarga)
      };
    } catch (error) {
      logger.error('Error calculating Ashtakavarga:', error);
      return { error: 'Unable to calculate Ashtakavarga at this time' };
    }
  }

  /**
   * Set required services for this calculator
   * @param {Object} vedicCalculator - Parent VedicCalculator instance
   */
  setServices(vedicCalculator) {
    this.vedicCalculator = vedicCalculator;
    this.geocodingService = vedicCalculator.geocodingService;
  }

  /**
   * Validate that required services are available
   * @private
   * @throws {Error} If required services are missing
   */
  _validateServices() {
    if (!this.geocodingService) {
      throw new Error('Geocoding service is required for Ashtakavarga calculations');
    }
  }

  /**
   * Get Vedic planetary positions for Ashtakavarga
   * @private
   * @param {number} jd - Julian Day
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @param {number} timezone - Timezone
   * @returns {Object} Planetary positions
   */
  async _getVedicPlanetaryPositions(jd, latitude, longitude, timezone) {
    const planets = {};

    const planetIds = {
      sun: 0,
      moon: 1,
      mars: 4,
      mercury: 2,
      jupiter: 5,
      venus: 3,
      saturn: 6
    };

    for (const [planetName, planetId] of Object.entries(planetIds)) {
      try {
        const position = sweph.calc(jd, planetId, 2 | 65536);
        if (position && position.longitude) {
          const longitude = position.longitude[0];
          const house = this._getVedicHouse(longitude, jd, latitude, longitude, timezone);
          planets[planetName] = {
            longitude,
            house,
            sign: Math.floor(longitude / 30) + 1 // 1-12 Vedic signs
          };
        }
      } catch (error) {
        logger.warn(`Error calculating ${planetName} position:`, error.message);
      }
    }

    return planets;
  }

  /**
   * Get Vedic house position (1-12)
   * @private
   * @param {number} longitude - Planet longitude
   * @param {number} jd - Julian Day
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @param {number} timezone - Timezone
   * @returns {number} House number (1-12)
   */
  _getVedicHouse(planetLongitude, jd, latitude, longitude, timezone) {
    try {
      // Calculate ascendant
      const houses = sweph.houses(jd, latitude, longitude, 'E'); // Equal houses for Vedic
      const ascendant = houses.ascendant[0];

      // Calculate house position
      let relativePosition = planetLongitude - ascendant;
      if (relativePosition < 0) { relativePosition += 360; }

      return Math.floor(relativePosition / 30) + 1;
    } catch (error) {
      // Fallback: simple house calculation
      return Math.floor(planetLongitude / 30) + 1;
    }
  }

  /**
   * Calculate Ashtakavarga for a specific planet
   * @private
   * @param {string} planet - Planet name
   * @param {Object} allPlanets - All planetary positions
   * @returns {Array} Bindus for each house (1-12)
   */
  _calculatePlanetAshtakavarga(planet, allPlanets) {
    const bindus = new Array(12).fill(0); // Houses 1-12

    if (!allPlanets[planet]) { return bindus; }

    const planetHouse = allPlanets[planet].house;
    const planetSign = allPlanets[planet].sign;

    // Ashtakavarga rules for each planet
    const rules = this._getAshtakavargaRules(planet);

    // Check each house for bindus
    for (let house = 1; house <= 12; house++) {
      let points = 0;

      // 1. Own house
      if (house === planetHouse) { points += rules.ownHouse; }

      // 2. Own sign
      if (house === ((planetSign - 1) % 12) + 1) { points += rules.ownSign; }

      // 3. Exaltation sign
      const exaltationSigns = {
        sun: 1, moon: 2, mars: 10, mercury: 6, jupiter: 4, venus: 12, saturn: 7
      };
      if (house === exaltationSigns[planet]) { points += rules.exaltation; }

      // 4. Moolatrikona sign
      const moolatrikonaSigns = {
        sun: 1, moon: 2, mars: 1, mercury: 6, jupiter: 5, venus: 2, saturn: 10
      };
      if (house === moolatrikonaSigns[planet]) { points += rules.moolatrikona; }

      // 5. Own nakshatra
      const ownNakshatras = this._getOwnNakshatras(planet);
      if (ownNakshatras.includes(house)) { points += rules.ownNakshatra; }

      // 6. Friendly planets' positions
      const friendlyPlanets = this._getFriendlyPlanets(planet);
      Object.entries(allPlanets).forEach(([otherPlanet, data]) => {
        if (friendlyPlanets.includes(otherPlanet) && data.house === house) {
          points += rules.friendlyPlanet;
        }
      });

      // 7. Enemy planets' positions (negative)
      const enemyPlanets = this._getEnemyPlanets(planet);
      Object.entries(allPlanets).forEach(([otherPlanet, data]) => {
        if (enemyPlanets.includes(otherPlanet) && data.house === house) {
          points += rules.enemyPlanet;
        }
      });

      // 8. Aspect relationships
      points += this._calculateAshtakavargaAspects(planet, house, allPlanets, rules);

      // Ensure points don't exceed maximum
      bindus[house - 1] = Math.min(points, 8);
    }

    return bindus;
  }

  /**
   * Get Ashtakavarga rules for a planet
   * @private
   * @param {string} planet - Planet name
   * @returns {Object} Rules for bindu calculation
   */
  _getAshtakavargaRules(planet) {
    // Standard Ashtakavarga rules
    const baseRules = {
      ownHouse: 1,
      ownSign: 1,
      exaltation: 1,
      moolatrikona: 1,
      ownNakshatra: 1,
      friendlyPlanet: 1,
      enemyPlanet: -1,
      aspect7th: 1,
      aspect9th: 1,
      aspect4th: 1,
      aspect10th: 1,
      aspect5th: 1,
      aspect11th: 1,
      aspect3rd: 1,
      aspect12th: 1
    };

    // Planet-specific modifications
    const modifications = {
      sun: { aspect7th: 0, aspect9th: 0, aspect4th: 0 },
      moon: { aspect9th: 0, aspect4th: 0 },
      mars: { aspect7th: 0, aspect9th: 0 },
      mercury: { aspect4th: 0 },
      jupiter: {},
      venus: { aspect7th: 0 },
      saturn: { aspect7th: 0, aspect9th: 0, aspect4th: 0 }
    };

    return { ...baseRules, ...(modifications[planet] || {}) };
  }

  /**
   * Get own nakshatras for a planet
   * @private
   * @param {string} planet - Planet name
   * @returns {Array} House numbers of own nakshatras
   */
  _getOwnNakshatras(planet) {
    const nakshatraMap = {
      sun: [5, 6, 7],      // Leo
      moon: [4],           // Cancer
      mars: [1, 8],        // Aries, Scorpio
      mercury: [3, 6],     // Gemini, Virgo
      jupiter: [5, 9],     // Leo, Sagittarius
      venus: [2, 7],       // Taurus, Libra
      saturn: [10, 11]     // Capricorn, Aquarius
    };
    return nakshatraMap[planet] || [];
  }

  /**
   * Get friendly planets for a planet
   * @private
   * @param {string} planet - Planet name
   * @returns {Array} Friendly planet names
   */
  _getFriendlyPlanets(planet) {
    const friendships = {
      sun: ['moon', 'mars', 'jupiter'],
      moon: ['sun', 'mercury', 'venus', 'saturn'],
      mars: ['sun', 'moon', 'jupiter'],
      mercury: ['sun', 'venus'],
      jupiter: ['sun', 'moon', 'mars'],
      venus: ['mercury', 'saturn'],
      saturn: ['mercury', 'venus']
    };
    return friendships[planet] || [];
  }

  /**
   * Get enemy planets for a planet
   * @private
   * @param {string} planet - Planet name
   * @returns {Array} Enemy planet names
   */
  _getEnemyPlanets(planet) {
    const enemies = {
      sun: ['venus', 'saturn'],
      moon: ['mars'],
      mars: ['mercury'],
      mercury: ['moon'],
      jupiter: ['mercury', 'venus'],
      venus: ['sun', 'moon'],
      saturn: ['sun', 'moon', 'mars']
    };
    return enemies[planet] || [];
  }

  /**
   * Calculate aspect bindus for Ashtakavarga
   * @private
   * @param {string} planet - Planet name
   * @param {number} house - House number (1-12)
   * @param {Object} allPlanets - All planetary positions
   * @param {Object} rules - Ashtakavarga rules
   * @returns {number} Aspect bindus
   */
  _calculateAshtakavargaAspects(planet, house, allPlanets, rules) {
    let aspectPoints = 0;

    // Vedic aspects: 7th, 9th, 4th, 10th, 5th, 11th, 3rd, 12th
    const aspects = [7, 9, 4, 10, 5, 11, 3, 12];
    const aspectNames = ['aspect7th', 'aspect9th', 'aspect4th', 'aspect10th', 'aspect5th', 'aspect11th', 'aspect3rd', 'aspect12th'];

    aspects.forEach((aspect, index) => {
      const aspectHouse = ((house - 1 + aspect - 1) % 12) + 1;
      const aspectName = aspectNames[index];

      // Check if any planet is in the aspected house
      Object.entries(allPlanets).forEach(([otherPlanet, data]) => {
        if (data.house === aspectHouse) {
          aspectPoints += rules[aspectName] || 0;
        }
      });
    });

    return aspectPoints;
  }

  /**
   * Calculate Sarva Ashtakavarga (combined bindus)
   * @private
   * @param {Object} individualAshtakavargas - Individual planet Ashtakavargas
   * @returns {Array} Combined bindus for each house
   */
  _calculateSarvaAshtakavarga(individualAshtakavargas) {
    const sarvaBindus = new Array(12).fill(0);

    // Sum bindus from all planets for each house
    Object.values(individualAshtakavargas).forEach(planetBindus => {
      planetBindus.forEach((bindu, houseIndex) => {
        sarvaBindus[houseIndex] += bindu;
      });
    });

    return sarvaBindus;
  }

  /**
   * Analyze Ashtakavarga results
   * @private
   * @param {Object} individualAshtakavargas - Individual Ashtakavargas
   * @param {Array} sarvaAshtakavarga - Sarva Ashtakavarga bindus
   * @returns {Object} Analysis results
   */
  _analyzeAshtakavarga(individualAshtakavargas, sarvaAshtakavarga) {
    const analysis = {
      strongHouses: [],
      weakHouses: [],
      planetaryStrength: {},
      auspiciousHouses: [],
      inauspiciousHouses: []
    };

    // Analyze Sarva Ashtakavarga
    sarvaAshtakavarga.forEach((bindus, houseIndex) => {
      const house = houseIndex + 1;

      if (bindus >= 25) {
        analysis.strongHouses.push(house);
        analysis.auspiciousHouses.push(house);
      } else if (bindus <= 15) {
        analysis.weakHouses.push(house);
        analysis.inauspiciousHouses.push(house);
      }
    });

    // Analyze individual planetary strength
    Object.entries(individualAshtakavargas).forEach(([planet, bindus]) => {
      const totalBindus = bindus.reduce((sum, b) => sum + b, 0);
      analysis.planetaryStrength[planet] = {
        totalBindus,
        strength: totalBindus >= 30 ? 'Very Strong' : totalBindus >= 25 ? 'Strong' : totalBindus >= 20 ? 'Moderate' : 'Weak'
      };
    });

    return analysis;
  }

  _generateAshtakavargaSummary(analysis) {
    let summary = '🔢 *Ashtakavarga Analysis*\n\n';

    summary += '*Planetary Strength:*\n';
    Object.entries(analysis.planetaryStrength).forEach(([planet, data]) => {
      summary += `• ${planet.charAt(0).toUpperCase() + planet.slice(1)}: ${data.totalBindus} bindus (${data.strength})\n`;
    });

    summary += '\n*Strong Houses (Auspicious):*\n';
    if (analysis.strongHouses.length > 0) {
      summary += `Houses ${analysis.strongHouses.join(', ')} - Areas of success and positive outcomes\n`;
    } else {
      summary += 'No exceptionally strong houses found\n';
    }

    summary += '\n*Weak Houses (Challenging):*\n';
    if (analysis.weakHouses.length > 0) {
      summary += `Houses ${analysis.weakHouses.join(', ')} - Areas requiring attention and effort\n`;
    } else {
      summary += 'No exceptionally weak houses found\n';
    }

    return summary;
  }

  /**
   * Generate Ashtakavarga predictions
   * @private
   * @param {Array} sarvaAshtakavarga - Sarva Ashtakavarga bindus
   * @returns {Object} Predictions for different life areas
   */
  _generateAshtakavargaPredictions(sarvaAshtakavarga) {
    const predictions = {
      overall: '',
      career: '',
      wealth: '',
      health: '',
      relationships: '',
      spirituality: ''
    };

    // Overall assessment based on total bindus
    const totalBindus = sarvaAshtakavarga.reduce((sum, b) => sum + b, 0);
    if (totalBindus >= 220) {
      predictions.overall = 'Exceptionally favorable planetary influences. Success in most endeavors.';
    } else if (totalBindus >= 180) {
      predictions.overall = 'Generally favorable conditions with some challenges to overcome.';
    } else if (totalBindus >= 140) {
      predictions.overall = 'Mixed influences requiring conscious effort and positive actions.';
    } else {
      predictions.overall = 'Challenging planetary conditions. Focus on spiritual growth and perseverance.';
    }

    // House-specific predictions
    const houseAreas = {
      1: 'self, personality, physical appearance',
      2: 'wealth, family, speech',
      3: 'siblings, communication, short journeys',
      4: 'home, mother, emotions, property',
      5: 'children, education, creativity, intelligence',
      6: 'health, service, enemies, obstacles',
      7: 'marriage, partnerships, business',
      8: 'longevity, secrets, occult, transformation',
      9: 'fortune, father, spirituality, higher learning',
      10: 'career, reputation, authority, public image',
      11: 'gains, friends, hopes, wishes',
      12: 'expenses, foreign lands, spirituality, losses'
    };

    // Career (10th house)
    const careerBindus = sarvaAshtakavarga[9]; // 0-indexed
    if (careerBindus >= 25) {
      predictions.career = 'Excellent career prospects with success and recognition.';
    } else if (careerBindus >= 20) {
      predictions.career = 'Good career potential with steady progress.';
    } else {
      predictions.career = 'Career may require extra effort and perseverance.';
    }

    // Wealth (2nd house)
    const wealthBindus = sarvaAshtakavarga[1];
    if (wealthBindus >= 25) {
      predictions.wealth = 'Strong financial prospects and material success.';
    } else if (wealthBindus >= 20) {
      predictions.wealth = 'Moderate financial stability with growth potential.';
    } else {
      predictions.wealth = 'Financial challenges may require careful planning.';
    }

    // Health (6th house - ironically, strong 6th house shows good health)
    const healthBindus = sarvaAshtakavarga[5];
    if (healthBindus >= 25) {
      predictions.health = 'Generally good health with strong vitality.';
    } else if (healthBindus >= 20) {
      predictions.health = 'Reasonable health with occasional challenges.';
    } else {
      predictions.health = 'Health may require attention and lifestyle adjustments.';
    }

    // Relationships (7th house)
    const relationshipBindus = sarvaAshtakavarga[6];
    if (relationshipBindus >= 25) {
      predictions.relationships = 'Harmonious relationships and successful partnerships.';
    } else if (relationshipBindus >= 20) {
      predictions.relationships = 'Stable relationships with room for growth.';
    } else {
      predictions.relationships = 'Relationship challenges may require patience and understanding.';
    }

    // Spirituality (9th and 12th houses)
    const spiritualBindus = (sarvaAshtakavarga[8] + sarvaAshtakavarga[11]) / 2;
    if (spiritualBindus >= 25) {
      predictions.spirituality = 'Strong spiritual inclinations and wisdom.';
    } else if (spiritualBindus >= 20) {
      predictions.spirituality = 'Growing spiritual awareness and understanding.';
    } else {
      predictions.spirituality = 'Spiritual growth may come through life\'s challenges.';
    }

    return predictions;
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

module.exports = { AshtakavargaCalculator };
