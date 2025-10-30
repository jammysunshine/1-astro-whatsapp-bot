const logger = require('../../../../utils/logger');
const sweph = require('sweph');

/**
 * Shadbala Calculator
 * Calculates the 6-fold (Shad-bala) strength assessment for Vedic astrology
 * Shadbala evaluates planetary strength through 6 different methods:
 * 1. Sthana Bala (Positional strength)
 * 2. Dig Bala (Directional strength)
 * 3. Kala Bala (Temporal strength)
 * 4. Chesta Bala (Motional strength)
 * 5. Naisargika Bala (Natural strength)
 * 6. Drig Bala (Aspectual strength)
 */
class ShadbalaCalculator {
  constructor(astrologer, geocodingService) {
    this.astrologer = astrologer;
    this.geocodingService = geocodingService;
  }

  /**
   * Set services for the calculator
   * @param {Object} services - Service object containing other calculators
   */
  setServices(services) {
    this.services = services;
  }

  /**
   * Generate complete Shadbala analysis for all planets
   * @param {Object} birthData - Birth data object
   * @returns {Object} Comprehensive Shadbala analysis
   */
  async generateShadbala(birthData) {
    try {
      const { birthDate, birthTime, birthPlace, name } = birthData;

      if (!birthDate || !birthTime || !birthPlace) {
        return { error: 'Complete birth details required for Shadbala analysis' };
      }

      // Parse birth date and time
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);

      // Get coordinates and timezone
      const [latitude, longitude] = await this._getCoordinatesForPlace(birthPlace);
      const birthDateTime = new Date(year, month - 1, day, hour, minute);
      const timestamp = birthDateTime.getTime();
      const timezone = await this._getTimezoneForPlace(latitude, longitude, timestamp);

      // Calculate natal chart
      const natalChart = await this._calculateNatalChart(year, month, day, hour, minute, latitude, longitude, timezone);

      // Calculate all 6 types of Bala for each planet
      const shadbalaResults = {};
      const planets = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];

      // Calculate each type of bala
      const sthanaBala = this._calculateSthanaBala(natalChart);
      const digBala = this._calculateDigBala(natalChart);
      const kalaBala = this._calculateKalaBala(natalChart, birthDateTime, year, month, day, hour, minute);
      const chestaBala = this._calculateChestaBala(natalChart);
      const naisargikaBala = this._calculateNaisargikaBala();
      const drigBala = this._calculateDrigBala(natalChart);

      // Calculate total shadbala for each planet
      for (const planet of planets) {
        const totalBala = sthanaBala[planet] + digBala[planet] + kalaBala[planet] +
                         chestaBala[planet] + naisargikaBala[planet] + drigBala[planet];

        shadbalaResults[planet] = {
          totalBala,
          totalRP: Math.round(totalBala / 60), // Convert to rupas (60 shashtiamsa = 1 rupa)
          components: {
            sthanaBala: sthanaBala[planet],
            digBala: digBala[planet],
            kalaBala: kalaBala[planet],
            chestaBala: chestaBala[planet],
            naisargikaBala: naisargikaBala[planet],
            drigBala: drigBala[planet]
          },
          strength: this._evaluateShadbalaStrength(totalBala),
          influence: this._calculatePlanetaryInfluence(planet, totalBala, natalChart.planets[planet])
        };
      }

      // Calculate overall chart strength
      const chartStrength = this._evaluateChartStrength(shadbalaResults);

      // Generate detailed analysis
      const analysis = this._analyzeShadbalaResults(shadbalaResults, natalChart);

      return {
        name,
        shadbalaResults,
        chartStrength,
        analysis,
        summary: this._generateShadbalaSummary(shadbalaResults, analysis),
        recommendations: this._generateShadbalaRecommendations(shadbalaResults, analysis)
      };
    } catch (error) {
      logger.error('❌ Error in Shadbala calculation:', error);
      throw new Error(`Shadbala calculation failed: ${error.message}`);
    }
  }

  /**
   * Calculate Sthana Bala (Positional strength)
   * Based on dignity: own sign, exalted, friendly, moolatrikona, etc.
   * @private
   */
  _calculateSthanaBala(natalChart) {
    const sthanaBala = {};

    // Maximum sthana bala values (in shashtiamsas)
    const maxSthana = 60; // Full strength

    Object.entries(natalChart.planets).forEach(([planetName, planet]) => {
      if (planetName === 'ascendant') return;

      const sign = planet.sign;
      let strength = 0;

      // Exalted signs
      const exaltations = {
        sun: 1, moon: 2, mars: 10, mercury: 6, jupiter: 4, venus: 12, saturn: 7
      };

      // Moolatrikona signs
      const moolatrikona = {
        sun: [1], moon: [2], mars: [1], mercury: [6], jupiter: [5], venus: [2], saturn: [10]
      };

      // Own signs
      const ownSigns = {
        sun: [5], moon: [4], mars: [1, 8], mercury: [3, 6], jupiter: [9, 12], venus: [2, 7], saturn: [10, 11]
      };

      // Friendly signs (neutral can be considered friendly for calculation)
      const friendlySigns = {
        sun: [2, 9, 10, 11],
        moon: [1, 6, 7, 8, 11],
        mars: [5, 7, 11, 12],
        mercury: [1, 7, 9, 12],
        jupiter: [1, 5, 7, 8],
        venus: [3, 4, 5, 6, 9],
        saturn: [2, 4, 6, 8, 9]
      };

      if (exaltations[planetName] === sign) {
        strength = maxSthana; // Exalted = full strength
      } else if (moolatrikona[planetName] && moolatrikona[planetName].includes(sign)) {
        strength = 45; // Moolatrikona = 75% strength
      } else if (ownSigns[planetName] && ownSigns[planetName].includes(sign)) {
        strength = 30; // Own sign = 50% strength
      } else if (friendlySigns[planetName] && friendlySigns[planetName].includes(sign)) {
        strength = 22.5; // Friendly = 37.5% strength
      } else {
        strength = 15; // Debilitated/debilitated = 25% strength
      }

      sthanaBala[planetName] = strength;
    });

    return sthanaBala;
  }

  /**
   * Calculate Dig Bala (Directional strength)
   * Based on planetary lordship of directions
   * @private
   */
  _calculateDigBala(natalChart) {
    const digBala = {};

    // Directional lords: East (1), South(2), West(3), North(4)
    const directionalLords = {
      east: ['sun', 30], // Full strength 30 shashtiamsas
      south: ['mars', 15], // Half strength
      west: ['saturn', 15],
      north: ['mercury', 15]
    };

    Object.entries(natalChart.planets).forEach(([planetName, planet]) => {
      if (planetName === 'ascendant') return;

      let strength = 0;

      // Check if planet is a directional lord
      Object.values(directionalLords).forEach(([lord, maxStrength]) => {
        if (lord === planetName) {
          strength = maxStrength;
        }
      });

      digBala[planetName] = strength || 7.5; // Minimum 7.5 for non-directional lords
    });

    return digBala;
  }

  /**
   * Calculate Kala Bala (Temporal strength)
   * Based on weekday, lunar phase, year, etc.
   * @private
   */
  _calculateKalaBala(natalChart, birthDateTime, year, month, day, hour, minute) {
    const kalaBala = {};

    // Get weekday
    const weekday = birthDateTime.getDay(); // 0=Sunday, 1=Monday, etc.

    // Get lunar phase (tithi)
    const lunarLongitude = natalChart.planets.moon.longitude;
    const sunLongitude = natalChart.planets.sun.longitude;
    const lunarPhase = Math.abs(lunarLongitude - sunLongitude);
    const tithi = Math.floor(lunarPhase / 12) + 1; // Rough tithi calculation

    // Kala Bala components
    Object.entries(natalChart.planets).forEach(([planetName, planet]) => {
      if (planetName === 'ascendant') return;

      let strength = 0;

      // Weekday strength (Scorpio rising = Sunday lord)
      const weekdayStrength = this._getWeekdayStrength(planetName, weekday);
      strength += weekdayStrength;

      // Tithi strength (some planets stronger in certain lunar phases)
      const tithiStrength = this._getTithiStrength(planetName, tithi);
      strength += tithiStrength;

      // Yoga Bala (sun-moon combination)
      const yogaStrength = this._getYogaStrength(planetName, lunarPhase);
      strength += yogaStrength;

      // Karana Bala (half-tithi)
      const karana = Math.floor(lunarPhase / 6) + 1;
      const karanaStrength = this._getKaranaStrength(planetName, karana);
      strength += karanaStrength;

      kalaBala[planetName] = Math.min(strength, 60); // Max 60 shashtiamsas
    });

    return kalaBala;
  }

  /**
   * Calculate Chesta Bala (Motional strength)
   * Based on planetary speed and retrograde status
   * @private
   */
  _calculateChestaBala(natalChart) {
    const chestaBala = {};

    Object.entries(natalChart.planets).forEach(([planetName, planet]) => {
      if (planetName === 'ascendant') return;

      const speed = Math.abs(planet.speed);
      let strength = 60; // Base strength

      // Retrograde factors
      if (planet.retrograde) {
        if (planetName === 'mercury' || planetName === 'venus') {
          // Mercury and Venus retrograde are powerful events
          strength = 60;
        } else {
          // Other planets retrograde reduce strength
          strength *= 0.5;
        }
      }

      // Speed factors (based on mean motions)
      const planetSpeeds = {
        sun: 0.9856,
        moon: 13.18,
        mars: 0.524,
        mercury: 1.383,
        jupiter: 0.083,
        venus: 1.2,
        saturn: 0.0339
      };

      const meanSpeed = planetSpeeds[planetName] || 1;
      const speedRatio = speed / meanSpeed;

      // Adjust strength based on speed
      strength *= Math.min(speedRatio, 1.5); // Cap at 150% of base

      chestaBala[planetName] = Math.min(strength, 60);
    });

    return chestaBala;
  }

  /**
   * Calculate Naisargika Bala (Natural strength)
   * Based on innate planetary characteristics
   * @private
   */
  _calculateNaisargikaBala() {
    // Fixed natural strengths in shashtiamsas
    return {
      sun: 30,
      moon: 51.4,    // Moon has highest natural strength
      mars: 39.4,
      mercury: 25.7,
      jupiter: 34.3,
      venus: 42.9,
      saturn: 8.6     // Saturn has lowest natural strength
    };
  }

  /**
   * Calculate Drig Bala (Aspectual strength)
   * Based on aspects from other planets
   * @private
   */
  _calculateDrigBala(natalChart) {
    const drigBala = {};

    // Vedic aspects (Rashis Drishti): 7th, 9th, 4th, 10th, 5th, 11th, 3rd, 12th
    const aspects = [7, 9, 4, 10, 5, 11, 3, 12];

    Object.entries(natalChart.planets).forEach(([planetName, planet]) => {
      if (planetName === 'ascendant') return;

      let strength = 0;

      // Check aspects from other planets
      Object.entries(natalChart.planets).forEach(([otherPlanet, otherData]) => {
        if (otherPlanet === planetName || otherPlanet === 'ascendant') return;

        const signDifference = Math.abs(planet.sign - otherData.sign);
        const normalizedDifference = Math.min(signDifference, 12 - signDifference);

        // If planet aspects this one, add strength
        if (aspects.includes(normalizedDifference)) {
          // Different planets give different aspect strength
          const aspectStrength = this._getAspectStrength(otherPlanet, planetName);
          strength += aspectStrength;
        }
      });

      // Multiply by aspect strength factors
      const planetMultiplier = {
        sun: 1.0,
        moon: 1.0,
        mars: 0.75,
        mercury: 0.5,
        jupiter: 1.0,
        venus: 0.75,
        saturn: 0.5
      };

      drigBala[planetName] = strength * (planetMultiplier[planetName] || 1.0);
    });

    return drigBala;
  }

  /**
   * Calculate natal chart with planetary positions
   * @private
   */
  async _calculateNatalChart(year, month, day, hour, minute, latitude, longitude, timezone) {
    const natalPlanets = {};

    // Calculate Julian Day
    const jd = this._dateToJulianDay(year, month, day, hour + minute / 60 - timezone);

    // Planet IDs for Swiss Ephemeris
    const planetIds = {
      sun: sweph.SE_SUN,
      moon: sweph.SE_MOON,
      mars: sweph.SE_MARS,
      mercury: sweph.SE_MERCURY,
      jupiter: sweph.SE_JUPITER,
      venus: sweph.SE_VENUS,
      saturn: sweph.SE_SATURN
    };

    for (const [planetName, planetId] of Object.entries(planetIds)) {
      try {
        const position = sweph.calc(jd, planetId, sweph.SEFLG_SIDEREAL | sweph.SEFLG_SPEED);

        if (position && position.longitude !== undefined) {
          const longitude = Array.isArray(position.longitude) ? position.longitude[0] : position.longitude;
          const latitude = Array.isArray(position.latitude) ? position.latitude[0] : position.latitude || 0;
          const speed = Array.isArray(position.longitude) ? position.longitude[3] || 0 : 0;

          natalPlanets[planetName] = {
            name: planetName.charAt(0).toUpperCase() + planetName.slice(1),
            longitude,
            latitude,
            speed,
            sign: Math.floor(longitude / 30) + 1,
            degree: longitude % 30,
            retrograde: speed < 0
          };
        }
      } catch (error) {
        logger.warn(`Error calculating natal ${planetName} position:`, error.message);
      }
    }

    // Calculate ascendant
    try {
      const houses = sweph.houses(jd, latitude, longitude, 'E');
      natalPlanets.ascendant = {
        longitude: houses.ascendant || 0,
        sign: Math.floor((houses.ascendant || 0) / 30) + 1,
        degree: (houses.ascendant || 0) % 30
      };
    } catch (error) {
      natalPlanets.ascendant = { longitude: 0, sign: 1, degree: 0 };
    }

    return { planets: natalPlanets };
  }

  /**
   * Analyze Shadbala results
   * @private
   */
  _analyzeShadbalaResults(shadbalaResults, natalChart) {
    const analysis = {
      strongestPlanets: [],
      weakestPlanets: [],
      functionalBenefics: [],
      functionalMalefics: [],
      overallBalance: '',
      auspiciousPeriod: []
    };

    // Sort planets by total bala
    const sortedPlanets = Object.entries(shadbalaResults)
      .sort(([,a], [,b]) => b.totalBala - a.totalBala)
      .map(([planet]) => planet);

    // Identify strongest and weakest planets
    analysis.strongestPlanets = sortedPlanets.slice(0, 3);
    analysis.weakestPlanets = sortedPlanets.slice(-3);

    // Classify as functional benefics/malefics based on strength
    const lagnaLord = this._getLagnaLord(natalChart.planets.ascendant.sign);
    const powerfulPlanets = sortedPlanets.slice(0, 5);

    // Planets stronger than lagna lord are functional benefics
    const lagnaStrength = shadbalaResults[lagnaLord]?.totalRP || 0;
    powerfulPlanets.forEach(planet => {
      if (shadbalaResults[planet].totalRP > lagnaStrength) {
        analysis.functionalBenefics.push(planet);
      } else {
        analysis.functionalMalefics.push(planet);
      }
    });

    // Determine overall chart balance
    const totalStrength = Object.values(shadbalaResults).reduce((sum, planet) => sum + planet.totalRP, 0);
    if (totalStrength >= 400) {
      analysis.overallBalance = 'Very Strong - Excellent vitality and planetary influence';
    } else if (totalStrength >= 350) {
      analysis.overallBalance = 'Strong - Good planetary support and vitality';
    } else if (totalStrength >= 280) {
      analysis.overallBalance = 'Moderate - Average strength with some supporting planets';
    } else if (totalStrength >= 200) {
      analysis.overallBalance = 'Weak - Planetary weakness may cause challenges';
    } else {
      analysis.overallBalance = 'Very Weak - Significant planetary debilitation requiring remedies';
    }

    return analysis;
  }

  /**
   * Evaluate individual planet's shadbala strength
   * @private
   */
  _evaluateShadbalaStrength(totalBala) {
    const rupas = totalBala / 60; // Convert to rupas

    if (rupas >= 8) return 'Very Strong';
    if (rupas >= 6) return 'Strong';
    if (rupas >= 5) return 'Moderate';
    if (rupas >= 3) return 'Weak';
    return 'Very Weak';
  }

  /**
   * Evaluate overall chart strength
   * @private
   */
  _evaluateChartStrength(shadbalaResults) {
    const totalRupas = Object.values(shadbalaResults).reduce((sum, planet) => sum + planet.totalRP, 0);

    if (totalRupas >= 400) return 'Exceptionally Strong';
    if (totalRupas >= 350) return 'Very Strong';
    if (totalRupas >= 300) return 'Strong';
    if (totalRupas >= 250) return 'Moderate';
    if (totalRupas >= 200) return 'Weak';
    return 'Very Weak';
  }

  /**
   * Generate Shadbala summary
   * @private
   */
  _generateShadbalaSummary(shadbalaResults, analysis) {
    let summary = '⚖️ *Shadbala Analysis*\n\n';

    summary += `*Overall Strength:* ${analysis.overallBalance}\n\n`;

    summary += '*Strongest Planets:*\n';
    analysis.strongestPlanets.forEach(planet => {
      const result = shadbalaResults[planet];
      summary += `• ${planet.charAt(0).toUpperCase() + planet.slice(1)}: ${result.totalRP} rupas (${result.strength})\n`;
    });

    summary += '\n*Weakest Planets:*\n';
    analysis.weakestPlanets.forEach(planet => {
      const result = shadbalaResults[planet];
      summary += `• ${planet.charAt(0).toUpperCase() + planet.slice(1)}: ${result.totalRP} rupas (${result.strength})\n`;
    });

    if (analysis.functionalBenefics.length > 0) {
      summary += '\n*Functional Benefics:*\n';
      summary += `Strong planetary influences: ${analysis.functionalBenefics.join(', ')}\n`;
    }

    return summary;
  }

  /**
   * Generate recommendations based on Shadbala
   * @private
   */
  _generateShadbalaRecommendations(shadbalaResults, analysis) {
    const recommendations = [];

    // Recommendations based on weak planets
    analysis.weakestPlanets.forEach(planet => {
      recommendations.push(this._getPlanetRemedies(planet));
    });

    // General recommendations
    if (analysis.functionalBenefics.length > analysis.functionalMalefics.length) {
      recommendations.push('Strong planetary support - focus on leveraging beneficial influences');
    } else {
      recommendations.push('Balance weak planetary influences through appropriate remedies and timing');
    }

    return recommendations;
  }

  /**
   * Calculate planetary influence based on strength
   * @private
   */
  _calculatePlanetaryInfluence(planet, totalBala, planetData) {
    const rupas = totalBala / 60;

    const baseInfluences = {
      sun: 'Identity, vitality, leadership, father',
      moon: 'Emotions, mother, mind, public, water',
      mars: 'Energy, courage, siblings, land, accidents',
      mercury: 'Communication, intelligence, business, maternal relatives',
      jupiter: 'Wisdom, teaching, wealth, spirituality, children',
      venus: 'Love, marriage, beauty, luxury, arts',
      saturn: 'Discipline, career, longevity, servants, delays'
    };

    let influenceStrength = '';
    if (rupas >= 6) {
      influenceStrength = 'Will manifest strongly in';
    } else if (rupas >= 4) {
      influenceStrength = 'Will manifest moderately in';
    } else {
      influenceStrength = 'May be challenged but can improve in';
    }

    return `${influenceStrength} ${baseInfluences[planet]}`;
  }

  // Helper methods for Kala Bala calculations
  _getWeekdayStrength(planet, weekday) {
    const dayLords = {
      0: 'sun', 1: 'moon', 2: 'mars', 3: 'mercury', 4: 'jupiter', 5: 'venus', 6: 'saturn'
    };

    return dayLords[weekday] === planet ? 15 : 7.5;
  }

  _getTithiStrength(planet, tithi) {
    // Simplified - each planet stronger in certain tithis
    const favorableTithis = {
      sun: [1, 6, 11, 16, 21, 26],
      moon: [2, 7, 12, 17, 22, 27],
      mars: [3, 8, 13, 18, 23, 28],
      mercury: [4, 9, 14, 19, 24, 29],
      jupiter: [5, 10, 15, 20, 25, 30],
      venus: [1, 6, 11, 16, 21],
      saturn: [3, 8, 13, 18, 23, 28]
    };

    return favorableTithis[planet]?.includes(tithi) ? 10 : 5;
  }

  _getYogaStrength(planet, lunarPhase) {
    const yoga = lunarPhase / 13.333; // Rough yoga calculation
    return yoga % 27 < 13 ? 5 : 7.5; // Alternating strength
  }

  _getKaranaStrength(planet, karana) {
    return karana % 2 === 0 ? 7.5 : 5; // Alternate even/odd karanas
  }

  _getAspectStrength(aspectingPlanet, aspectedPlanet) {
    // Different planets give different aspect strength
    const aspectStrengthMap = {
      sun: 15, moon: 12, mars: 8, mercury: 6, jupiter: 15, venus: 10, saturn: 8
    };

    return aspectStrengthMap[aspectingPlanet] || 7.5;
  }

  _getLagnaLord(sign) {
    const lords = ['mars', 'venus', 'mercury', 'moon', 'sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'saturn', 'jupiter'];
    return lords[sign - 1];
  }

  _getPlanetRemedies(planet) {
    const remedies = {
      sun: 'Ruby gemstone, gayatri mantra, vitamin D supplements',
      moon: 'Pearl gemstone, positive affirmations, avoid salt for purification',
      mars: 'Red coral, strength exercises, avoid sour foods if weak',
      mercury: 'Emerald, communication practice, green vegetables',
      jupiter: 'Yellow sapphire, temple visits, saffron in diet',
      venus: 'Diamond, art and beauty activities, white foods',
      saturn: 'Blue sapphire, service activities, sesame seeds'
    };

    return `For ${planet.charAt(0).toUpperCase() + planet.slice(1)}: ${remedies[planet] || 'Strengthen through meditation and planetary mantras'}`;
  }

  // Utility methods
  _dateToJulianDay(year, month, day, hour) {
    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;
    const jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
    return jd + (hour - 12) / 24;
  }

  async _getCoordinatesForPlace(place) {
    try {
      const coords = await this.geocodingService.getCoordinates(place);
      return [coords.latitude, coords.longitude];
    } catch (error) {
      logger.warn('Error getting coordinates, using default:', error.message);
      return [28.6139, 77.2090]; // Delhi coordinates
    }
  }

  async _getTimezoneForPlace(latitude, longitude, timestamp) {
    try {
      return 5.5; // IST
    } catch (error) {
      logger.warn('Error getting timezone, using default IST:', error.message);
      return 5.5;
    }
  }
}

module.exports = ShadbalaCalculator;