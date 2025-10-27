const logger = require('../../../utils/logger');
const sweph = require('sweph');

/**
 * Vedic Astrology Calculator
 * Handles Vedic-specific calculations like Ashtakavarga, Varga charts, and Yogas
 */
class VedicCalculator {
  constructor(astrologer, geocodingService, vedicCore) {
    this.astrologer = astrologer;
    this.geocodingService = geocodingService;
    this.vedicCore = vedicCore;
  }

  /**
   * Calculate Ashtakavarga - Vedic predictive system using bindus (points)
   * @param {Object} birthData - Birth data object
   * @returns {Object} Complete Ashtakavarga analysis
   */
  async calculateAshtakavarga(birthData) {
    try {
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
        summary: this._generateAshtakavargaSummary(analysis),
        predictions: this._generateAshtakavargaPredictions(sarvaAshtakavarga)
      };
    } catch (error) {
      logger.error('Error calculating Ashtakavarga:', error);
      return { error: 'Unable to calculate Ashtakavarga at this time' };
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

  /**
   * Generate Ashtakavarga summary
   * @private
   * @param {Object} analysis - Ashtakavarga analysis
   * @returns {string} Summary text
   */
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
      const d1Chart = await this.generateBasicBirthChart(birthData);

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
        return { error: 'Complete birth details required for lunar return analysis' };
      }

      // Parse birth date and time
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);

      // Get birth location coordinates
      const locationInfo = await this.geocodingService.getLocationInfo(birthPlace);
      const birthDateTime = new Date(year, month - 1, day, hour, minute);
      const birthTimestamp = birthDateTime.getTime();

      // Calculate birth moon position
      const birthJD = this._dateToJulianDay(year, month, day, hour + minute / 60);
      const birthMoonPos = sweph.calc(birthJD, 1, 2);
      const birthMoonLongitude = birthMoonPos.longitude ? birthMoonPos.longitude[0] : 0;

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
        if (Math.abs(diff) < 1) { // Within 1 degree
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
      const analysis = this._analyzeLunarReturnChart(lunarReturnChart, birthData);

      return {
        lunarReturnDate: lunarReturnDate.toLocaleDateString(),
        lunarReturnTime: lunarReturnDate.toLocaleTimeString(),
        monthAhead: new Date(lunarReturnDate.getFullYear(), lunarReturnDate.getMonth() + 1, 0).toLocaleDateString(),
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
  async _generateLunarReturnChart(birthData, lunarReturnDate, birthMoonLongitude) {
    try {
      const { birthPlace } = birthData;

      // Get coordinates
      const locationInfo = await this.geocodingService.getLocationInfo(birthPlace);
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
        chart.planets.moon.signName = this._getSignFromLongitude(birthMoonLongitude);
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
      lunarReturnMoonSign: lunarReturnChart.interpretations?.moonSign || 'Unknown',
      lunarReturnSunSign: lunarReturnChart.interpretations?.sunSign || 'Unknown',
      lunarReturnRisingSign: lunarReturnChart.interpretations?.risingSign || 'Unknown'
    };

    // Analyze Moon's house in lunar return (emotional focus for the month)
    const moonHouse = lunarReturnChart.planets.moon?.house || 'Unknown';
    if (moonHouse !== 'Unknown') {
      analysis.themes.push(`Emotional focus in ${this._getHouseArea(moonHouse)}`);
    }

    // Analyze Sun's house in lunar return (conscious focus for the month)
    const sunHouse = lunarReturnChart.planets.sun?.house || 'Unknown';
    if (sunHouse !== 'Unknown') {
      analysis.themes.push(`Conscious attention to ${this._getHouseArea(sunHouse)}`);
    }

    // Analyze angular planets (powerful influences for the month)
    const angularHouses = [1, 4, 7, 10];
    Object.entries(lunarReturnChart.planets).forEach(([planet, data]) => {
      if (angularHouses.includes(data.house)) {
        analysis.themes.push(`${planet} strongly activated in ${this._getHouseArea(data.house)}`);
      }
    });

    // Generate opportunities and challenges based on aspects
    if (lunarReturnChart.aspects) {
      lunarReturnChart.aspects.forEach(aspect => {
        if (aspect.aspect === 'Trine' || aspect.aspect === 'Sextile') {
          analysis.opportunities.push(`${aspect.planets} harmony supports ${this._getAspectOpportunity(aspect)}`);
        } else if (aspect.aspect === 'Square' || aspect.aspect === 'Opposition') {
          analysis.challenges.push(`${aspect.planets} tension requires ${this._getAspectChallenge(aspect)}`);
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
    if (angle > 180) { angle -= 360; }
    if (angle <= -180) { angle += 360; }
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
    const f = (jd + 0.5) - z;

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
   * Calculate Nakshatra for a given longitude
   * @param {number} longitude - Longitude in degrees
   * @returns {Object} Nakshatra details
   */
  calculateNakshatra(longitude) {
    // Normalize longitude to 0-360
    longitude = ((longitude % 360) + 360) % 360;

    // Each Nakshatra is 13°20' = 13.333°
    const nakshatraSize = 13.333333;
    const padaSize = nakshatraSize / 4; // 3°20' per Pada

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

    // Calculate Pada (1-4)
    const positionInNakshatra = longitude - (index * nakshatraSize);
    const pada = Math.floor(positionInNakshatra / padaSize) + 1;

    return {
      nakshatra,
      lord,
      pada,
      degree: longitude
    };
  }

  /**
   * Calculate Nakshatra Porutham (compatibility) for marriage
   * @param {Object} person1 - First person's birth data
   * @param {Object} person2 - Second person's birth data
   * @returns {Object} Compatibility analysis
   */
  calculateNakshatraPorutham(person1, person2) {
    try {
      // Get Moon longitudes (Nakshatra is based on Moon)
      const moon1 = person1.moonLongitude || 0;
      const moon2 = person2.moonLongitude || 0;

      const nakshatra1 = this.calculateNakshatra(moon1);
      const nakshatra2 = this.calculateNakshatra(moon2);

      // Simplified compatibility matrix (traditional rules)
      const compatibility = this._checkNakshatraCompatibility(nakshatra1.nakshatra, nakshatra2.nakshatra);

      return {
        person1: {
          nakshatra: nakshatra1.nakshatra,
          lord: nakshatra1.lord,
          pada: nakshatra1.pada
        },
        person2: {
          nakshatra: nakshatra2.nakshatra,
          lord: nakshatra2.lord,
          pada: nakshatra2.pada
        },
        compatibility: compatibility.rating,
        description: compatibility.description
      };
    } catch (error) {
      return {
        error: 'Unable to calculate Nakshatra Porutham',
        compatibility: 'Unknown'
      };
    }
  }

  /**
   * Check Nakshatra compatibility based on traditional rules
   * @private
   * @param {string} nak1 - First Nakshatra
   * @param {string} nak2 - Second Nakshatra
   * @returns {Object} Rating and description
   */
  _checkNakshatraCompatibility(nak1, nak2) {
    // Simplified compatibility (in reality, this is complex with 27x27 matrix)
    // For demo, use basic rules
    const compatiblePairs = [
      ['Rohini', 'Hasta'], ['Mrigashira', 'Chitra'], ['Ardra', 'Swati'],
      ['Punarvasu', 'Vishakha'], ['Pushya', 'Anuradha'], ['Ashlesha', 'Jyeshtha'],
      ['Magha', 'Mula'], ['Purva Phalguni', 'Purva Ashadha'], ['Uttara Phalguni', 'Uttara Ashadha']
    ];

    const isCompatible = compatiblePairs.some(([a, b]) =>
      (nak1 === a && nak2 === b) || (nak1 === b && nak2 === a)
    );

    if (isCompatible) {
      return {
        rating: 'Excellent',
        description: `${nak1} and ${nak2} have excellent Nakshatra compatibility for marriage.`
      };
    }

    // Default neutral
    return {
      rating: 'Neutral',
      description: `${nak1} and ${nak2} have neutral Nakshatra compatibility. Consult a priest for detailed analysis.`
    };
  }

  /**
   * Generate 3-day transit preview with real astrological calculations
   * @param {Object} birthData - Birth data
   * @param {number} days - Number of days
   * @returns {Object} Transit preview
   */
  async generateTransitPreview(birthData, days = 3) {
    try {
      const { birthDate, birthTime = '12:00', birthPlace = 'Delhi, India' } = birthData;

      // Parse birth date
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);

      // Get birth coordinates and timezone
      const locationInfo = await this.geocodingService.getLocationInfo(birthPlace);
      const birthDateTime = new Date(year, month - 1, day, hour, minute);
      const birthTimestamp = birthDateTime.getTime();

      // Prepare natal data
      const natalData = {
        year, month, date: day, hours: hour, minutes: minute, seconds: 0,
        latitude: locationInfo.latitude, longitude: locationInfo.longitude, timezone: locationInfo.timezone,
        chartType: 'sidereal'
      };

      const transits = {};

      // Generate transit preview for each day
      for (let i = 0; i < days; i++) {
        const transitDate = new Date();
        transitDate.setDate(transitDate.getDate() + i);

        const transitData = {
          year: transitDate.getFullYear(),
          month: transitDate.getMonth() + 1,
          date: transitDate.getDate(),
          hours: 12, minutes: 0, seconds: 0, // Noon for daily transits
          latitude: locationInfo.latitude, longitude: locationInfo.longitude, timezone: locationInfo.timezone,
          chartType: 'sidereal'
        };

        // Generate transit chart
        const transitChart = this.astrologer.generateTransitChartData(natalData, transitData);

        // Analyze major transits and aspects
        const dayName = i === 0 ? 'today' : i === 1 ? 'tomorrow' : `day${i + 1}`;
        transits[dayName] = this._interpretDailyTransits(transitChart, i);
      }

      return transits;
    } catch (error) {
      logger.error('Error generating transit preview:', error);
      // Fallback to basic preview
      return {
        today: '🌅 *Today:* Planetary energies support new beginnings and communication. Perfect for starting conversations or initiating projects.',
        tomorrow: '🌞 *Tomorrow:* Focus on relationships and partnerships. Harmonious energies make this a good day for collaboration.',
        day3: '🌙 *Day 3:* Creative inspiration flows strongly. Use this energy for artistic pursuits or innovative thinking.'
      };
    }
  }

  /**
   * Interpret daily transits for transit preview
   * @private
   * @param {Object} transitChart - Transit chart data
   * @param {number} dayOffset - Days from today (0 = today, 1 = tomorrow, etc.)
   * @returns {string} Daily transit interpretation
   */
  _interpretDailyTransits(transitChart, dayOffset) {
    const dayNames = ['Today', 'Tomorrow', 'Day 3'];
    const dayName = dayNames[dayOffset] || `Day ${dayOffset + 1}`;

    let interpretation = `🌟 *${dayName}:* `;

    const aspects = transitChart.aspects || [];
    const planets = transitChart.planets || [];

    // Analyze major planetary aspects
    const majorAspects = aspects.filter(aspect =>
      ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'].includes(aspect.planet1) ||
      ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'].includes(aspect.planet2)
    );

    // Check for significant transits
    const sunAspects = majorAspects.filter(a => a.planet1 === 'Sun' || a.planet2 === 'Sun');
    const moonAspects = majorAspects.filter(a => a.planet1 === 'Moon' || a.planet2 === 'Moon');
    const venusAspects = majorAspects.filter(a => a.planet1 === 'Venus' || a.planet2 === 'Venus');
    const marsAspects = majorAspects.filter(a => a.planet1 === 'Mars' || a.planet2 === 'Mars');

    const insights = [];

    // Sun transits (consciousness, vitality)
    if (sunAspects.length > 0) {
      const sunAspect = sunAspects[0];
      if (sunAspect.aspect === 'Trine' || sunAspect.aspect === 'Sextile') {
        insights.push('Solar energy brings confidence and vitality');
      } else if (sunAspect.aspect === 'Square' || sunAspect.aspect === 'Opposition') {
        insights.push('Solar challenges encourage self-awareness and growth');
      }
    }

    // Moon transits (emotions, intuition)
    if (moonAspects.length > 0) {
      const moonAspect = moonAspects[0];
      if (moonAspect.aspect === 'Trine' || moonAspect.aspect === 'Sextile') {
        insights.push('Emotional awareness and intuition are heightened');
      } else if (moonAspect.aspect === 'Square' || moonAspect.aspect === 'Opposition') {
        insights.push('Emotional challenges invite inner reflection');
      }
    }

    // Venus transits (relationships, harmony)
    if (venusAspects.length > 0) {
      insights.push('Harmonious energies favor relationships and creative pursuits');
    }

    // Mars transits (action, energy)
    if (marsAspects.length > 0) {
      insights.push('Dynamic energy supports action and new beginnings');
    }

    // Mercury transits (communication, thinking)
    const mercuryAspects = majorAspects.filter(a => a.planet1 === 'Mercury' || a.planet2 === 'Mercury');
    if (mercuryAspects.length > 0) {
      insights.push('Communication and mental clarity are emphasized');
    }

    // Jupiter transits (expansion, wisdom)
    const jupiterAspects = majorAspects.filter(a => a.planet1 === 'Jupiter' || a.planet2 === 'Jupiter');
    if (jupiterAspects.length > 0) {
      insights.push('Opportunities for growth and learning present themselves');
    }

    // Saturn transits (structure, responsibility)
    const saturnAspects = majorAspects.filter(a => a.planet1 === 'Saturn' || a.planet2 === 'Saturn');
    if (saturnAspects.length > 0) {
      insights.push('Focus on structure, discipline, and long-term goals');
    }

    if (insights.length === 0) {
      // Default interpretation based on day
      const defaults = [
        'Planetary energies support new beginnings and communication',
        'Focus on relationships and partnerships with harmonious energies',
        'Creative inspiration flows strongly for artistic pursuits'
      ];
      interpretation += defaults[dayOffset] || 'A balanced day for personal growth and reflection';
    } else {
      interpretation += `${insights.slice(0, 2).join('. ')}.`;
    }

    return interpretation;
  }
}

module.exports = VedicCalculator;
