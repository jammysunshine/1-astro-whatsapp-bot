const logger = require('../../../../utils/logger');
const sweph = require('sweph');

/**
 * Solar Arc Directions Calculator
 * Calculates predictive astrology using the "Day for a Year" method where one day of arc equals one year of time
 */
class SolarArcDirectionsCalculator {
  constructor(astrologer, geocodingService) {
    this.astrologer = astrologer;
    this.geocodingService = geocodingService;
    this._initializeEphemeris();
  }

  /**
   * Set services for the calculator
   * @param {Object} services - Service object containing other calculators
   */
  setServices(services) {
    this.services = services;
  }

  /**
   * Calculate solar arc directions for a given time period
   * @param {Object} birthData - Birth data object
   * @param {Date} targetDate - Date for which to calculate directions
   * @returns {Object} Solar arc analysis
   */
  async calculateSolarArcDirections(birthData, targetDate = null) {
    try {
      const { birthDate, birthTime, birthPlace, name } = birthData;

      if (!birthDate || !birthTime || !birthPlace) {
        return { error: 'Complete birth details required for Solar Arc calculations' };
      }

      // Parse birth date and time
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);

      // Get coordinates and timezone
      const [latitude, longitude] = await this._getCoordinatesForPlace(birthPlace);
      const birthDateTime = new Date(year, month - 1, day, hour, minute);
      const timestamp = birthDateTime.getTime();
      const timezone = await this._getTimezoneForPlace(latitude, longitude, timestamp);

      // If no target date provided, use current date
      const calculationDate = targetDate || new Date();

      // Calculate solar arc for the period from birth to target date
      const solarArc = this._calculateSolarArcPeriod(birthDateTime, calculationDate);

      // Calculate natal chart
      const natalChart = await this._calculateNatalChart(year, month, day, hour, minute, latitude, longitude, timezone);

      // Apply solar arc directions to natal planets
      const directedChart = await this._applySolarArcDirections(natalChart, solarArc);

      // Analyze the directed positions
      const analysis = this._analyzeSolarArcPositions(directedChart, natalChart, solarArc);

      // Calculate directed aspects
      const aspects = this._calculateDirectedAspects(directedChart);

      // Generate predictions based on solar arc
      const predictions = this._generateSolarArcPredictions(directedChart, natalChart, analysis, solarArc);

      return {
        name,
        birthDetails: {
          date: birthDate,
          time: birthTime,
          place: birthPlace,
          coordinates: { latitude, longitude },
          timezone
        },
        targetDate: calculationDate,
        solarArc: {
          days: solarArc.days,
          years: solarArc.years,
          arcDegrees: solarArc.arc,
          arcSpeed: solarArc.speed
        },
        natalChart,
        directedChart,
        aspects,
        analysis,
        predictions: {
          summary: this._generatePredictionsSummary(predictions),
          detailed: predictions
        }
      };
    } catch (error) {
      logger.error('❌ Error in Solar Arc calculation:', error);
      throw new Error(`Solar Arc calculation failed: ${error.message}`);
    }
  }

  /**
   * Calculate the solar arc period in days and arc degrees
   * @private
   */
  _calculateSolarArcPeriod(birthDate, targetDate) {
    const timeDifference = Math.abs(targetDate.getTime() - birthDate.getTime());
    const daysSinceBirth = timeDifference / (1000 * 60 * 60 * 24);

    // Solar arc: approximately 0.9856 degrees per day
    // (This matches the Sun's apparent motion relative to fixed stars)
    const arcPerDay = 360 / 365.2425; // ~0.9856 degrees per day
    const totalArc = daysSinceBirth * arcPerDay;

    return {
      days: daysSinceBirth,
      years: daysSinceBirth / 365.25,
      arc: totalArc,
      speed: arcPerDay
    };
  }

  /**
   * Calculate natal chart positions using Swiss Ephemeris
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
      saturn: sweph.SE_SATURN,
      uranus: sweph.SE_URANUS,
      neptune: sweph.SE_NEPTUNE,
      pluto: sweph.SE_PLUTO,
      rahu: sweph.SE_TRUE_NODE,
      ketu: sweph.SE_MEAN_APOG // Use mean apogee for Ketu
    };

    for (const [planetName, planetId] of Object.entries(planetIds)) {
      try {
        let position;

        if (planetName === 'ketu') {
          // Calculate Ketu as opposite of Rahu
          const rahuPos = sweph.calc(jd, sweph.SE_TRUE_NODE);
          position = {
            longitude: (Array.isArray(rahuPos.longitude) ? rahuPos.longitude[0] : rahuPos.longitude) + 180 % 360,
            latitude: 0,
            speed: { longitude: 0 }
          };
        } else {
          position = sweph.calc(jd, planetId, sweph.SEFLG_SIDEREAL | sweph.SEFLG_SPEED);
        }

        if (position && position.longitude !== undefined && position.latitude !== undefined) {
          const longitude = Array.isArray(position.longitude) ? position.longitude[0] : position.longitude;
          const latitude = Array.isArray(position.latitude) ? position.latitude[0] : position.latitude;
          const speed = Array.isArray(position.longitude) ? position.longitude[3] || 0 : 0;

          natalPlanets[planetName] = {
            name: planetName.charAt(0).toUpperCase() + planetName.slice(1),
            longitude,
            latitude,
            speed,
            sign: Math.floor(longitude / 30) + 1,
            degree: longitude % 30,
            retrograde: speed < 0,
            direction: this._getDirection(longitude, speed)
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

    return natalPlanets;
  }

  /**
   * Apply solar arc directions to natal positions
   * @private
   */
  async _applySolarArcDirections(natalChart, solarArc) {
    const directedChart = {};

    for (const [planet, data] of Object.entries(natalChart)) {
      if (planet === 'ascendant') {
        // Ascendant moves at the solar arc rate (direct method)
        directedChart[planet] = {
          ...data,
          directedLongitude: (data.longitude + solarArc.arc) % 360,
          directedSign: Math.floor(((data.longitude + solarArc.arc) % 360) / 30) + 1,
          directedDegree: (data.longitude + solarArc.arc) % 30,
          arcMovement: solarArc.arc
        };
      } else {
        // Planets move at their own rate (secondary progression method)
        // or can use direct solar arc method
        const directedLongitude = (data.longitude + solarArc.arc) % 360;

        directedChart[planet] = {
          ...data,
          natalLongitude: data.longitude,
          directedLongitude: directedLongitude,
          directedSign: Math.floor(directedLongitude / 30) + 1,
          directedDegree: directedLongitude % 30,
          arcMovement: solarArc.arc,
          signChange: Math.floor(directedLongitude / 30) !== data.sign,
          aspectChanges: this._calculateAspectChanges(data.longitude, directedLongitude)
        };
      }
    }

    return directedChart;
  }

  /**
   * Analyze solar arc positions
   * @private
   */
  _analyzeSolarArcPositions(directedChart, natalChart, solarArc) {
    const analysis = {
      significantMovingBodies: [],
      aspectChanges: [],
      criticalDegrees: [],
      stationPoints: [],
      ageIndications: []
    };

    // Identify planets that have changed signs
    Object.entries(directedChart).forEach(([planet, data]) => {
      if (data.signChange) {
        analysis.significantMovingBodies.push({
          planet: data.name,
          fromSign: this._getZodiacSignName(natalChart[planet].sign),
          toSign: this._getZodiacSignName(data.directedSign),
          significance: this._analyzeSignChange(planet, natalChart[planet].sign, data.directedSign)
        });
      }
    });

    // Identify planets approaching critical degrees
    Object.entries(directedChart).forEach(([planet, data]) => {
      const criticalDegrees = [0, 13, 16, 20, 26, 29]; // Critical degrees in astrology
      const currentDegree = data.directedDegree;

      // Check if within 2 degrees of critical points
      criticalDegrees.forEach(critical => {
        const distance = Math.abs(currentDegree - critical);
        if (distance <= 2) {
          analysis.criticalDegrees.push({
            planet: data.name,
            currentDegree: currentDegree.toFixed(1),
            criticalDegree: critical,
            distance: distance.toFixed(1),
            significance: distance <= 0.5 ? 'Very Critical' : distance <= 1 ? 'Critical' : 'Approaching'
          });
        }
      });
    });

    // Analyze age-related significances
    const age = solarArc.years;
    analysis.ageIndications = this._analyzeAgeSignificances(age);

    return analysis;
  }

  /**
   * Calculate directed aspects
   * @private
   */
  _calculateDirectedAspects(directedChart) {
    const aspects = [];
    const planets = Object.keys(directedChart).filter(p => p !== 'ascendant');

    // Calculate aspects between directed planets
    for (let i = 0; i < planets.length; i++) {
      for (let j = i + 1; j < planets.length; j++) {
        const planet1 = planets[i];
        const planet2 = planets[j];

        const longitude1 = directedChart[planet1].directedLongitude;
        const longitude2 = directedChart[planet2].directedLongitude;

        const angularDistance = Math.abs(longitude1 - longitude2) % 360;
        const actualDistance = angularDistance > 180 ? 360 - angularDistance : angularDistance;

        // Check for major aspects
        const aspectTypes = {
          0: { name: 'Conjunction', orb: 8 },
          60: { name: 'Sextile', orb: 6 },
          90: { name: 'Square', orb: 8 },
          120: { name: 'Trine', orb: 8 },
          180: { name: 'Opposition', orb: 8 }
        };

        Object.entries(aspectTypes).forEach(([degree, config]) => {
          if (Math.abs(actualDistance - degree) <= config.orb) {
            aspects.push({
              planet1: directedChart[planet1].name,
              planet2: directedChart[planet2].name,
              aspect: config.name,
              exactDegree: degree,
              actualSeparation: actualDistance.toFixed(1),
              orb: Math.abs(actualDistance - degree).toFixed(1),
              aspectType: actualDistance < degree ? 'Waxing' : 'Waning'
            });
          }
        });
      }
    }

    return aspects;
  }

  /**
   * Generate solar arc predictions
   * @private
   */
  _generateSolarArcPredictions(directedChart, natalChart, analysis, solarArc) {
    const predictions = {
      personal: [],
      career: [],
      relationships: [],
      health: [],
      financial: [],
      spiritual: []
    };

    const age = solarArc.years;

    // Analyze directed Sun position
    const directedSun = directedChart.sun;
    if (directedSun) {
      const sunSignificance = this._analyzeDirectedSun(directedSun, natalChart.sun);
      predictions.personal.push(...sunSignificance);

      // Sun sign changes indicate major life phases
      if (directedSun.signChange) {
        predictions.personal.push(`Major life transition occurring around age ${Math.round(age)}`);
      }
    }

    // Analyze directed Moon
    const directedMoon = directedChart.moon;
    if (directedMoon) {
      const moonPredictions = this._analyzeDirectedMoon(directedMoon, analysis.criticalDegrees, age);
      predictions.emotional = moonPredictions;
    }

    // Career indications from directed MC (10th house cusp)
    const directedAscendant = directedChart.ascendant;
    if (directedAscendant) {
      predictions.career.push(...this._analyzeDirectedMC(directedAscendant, age));
    }

    // Relationship indications from directed Venus and 7th house axis
    const directedVenus = directedChart.venus;
    if (directedVenus) {
      predictions.relationships.push(...this._analyzeDirectedVenus(directedVenus, age));
    }

    // Health indications from directed 6th house and Mars
    const directedMars = directedChart.mars;
    if (directedMars) {
      predictions.health.push(...this._analyzeDirectedMars(directedMars, age));
    }

    // Add critical degree predictions
    analysis.criticalDegrees.forEach(critical => {
      const prediction = this._getCriticalDegreePrediction(critical.planet, critical.criticalDegree);
      predictions.personal.push(prediction);
    });

    return predictions;
  }

  /**
   * Generate predictions summary
   * @private
   */
  _generatePredictionsSummary(predictions) {
    let summary = '🔮 *Solar Arc Directions*\n\n';

    summary += '*Key Themes:*\n';
    const personalThemes = predictions.personal.slice(0, 3);
    personalThemes.forEach(theme => {
      summary += `• ${theme}\n`;
    });

    if (predictions.career.length > 0) {
      summary += '\n*Career Focus:*\n';
      summary += `• ${predictions.career[0]}\n`;
    }

    if (predictions.relationships.length > 0) {
      summary += '\n*Relationships:*\n';
      summary += `• ${predictions.relationships[0]}\n`;
    }

    summary += '\n*Timing:* These directions are strongest around the target date and indicate major life themes for that period.';

    return summary;
  }

  // Helper methods
  _dateToJulianDay(year, month, day, hour) {
    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;

    const jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
    return jd + (hour - 12) / 24;
  }

  _initializeEphemeris() {
    try {
      // Ephemeris paths would be set here if needed
    } catch (error) {
      logger.warn('Ephemeris initialization warning:', error.message);
    }
  }

  _getDirection(longitude, speed) {
    return speed > 0 ? 'Direct' : 'Retrograde';
  }

  _calculateAspectChanges(natalLongitude, directedLongitude) {
    // Calculate how aspects change with solar arc
    const aspectsChanged = {
      conjunctions: [],
      squares: [],
      trines: []
    };
    // Complex aspect analysis would go here
    return aspectsChanged;
  }

  _getZodiacSignName(signNumber) {
    const signs = [
      '', 'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    return signs[signNumber] || 'Unknown';
  }

  _analyzeSignChange(planet, fromSign, toSign) {
    const fromSignName = this._getZodiacSignName(fromSign);
    const toSignName = this._getZodiacSignName(toSign);

    const significances = {
      Sun: `Major life transition from ${fromSignName} to ${toSignName} energy`,
      Moon: `Emotional shift from ${fromSignName} to ${toSignName} demeanor`,
      Mercury: `Communication style changes from ${fromSignName} to ${toSignName} approach`,
      Venus: `Relationship preferences shift from ${fromSignName} to ${toSignName} qualities`,
      Mars: `Action and energy transition from ${fromSignName} to ${toSignName} drive`,
      Jupiter: `Wisdom and expansion move from ${fromSignName} to ${toSignName} perspective`,
      Saturn: `Life lessons evolve from ${fromSignName} to ${toSignName} discipline`
    };

    return significances[planet] || `${planet} changes from ${fromSignName} to ${toSignName}`;
  }

  _analyzeAgeSignificances(age) {
    const significances = [];

    if (age >= 7 && age <= 9) {
      significances.push('Childhood development and learning (Saturn cycle)');
    }
    if (age >= 18 && age <= 22) {
      significances.push('Coming of age and independence (Jupiter return)');
    }
    if (age >= 28 && age <= 32) {
      significances.push('Career establishment (Saturn return)');
    }
    if (age >= 35 && age <= 40) {
      significances.push('Life reevaluation period');
    }
    if (age >= 40 && age <= 45) {
      significances.push('Mid-life transition (Uranus opposition)');
    }
    if (age >= 58 && age <= 62) {
      significances.push('Chiron return and wisdom phase');
    }

    return significances;
  }

  _analyzeDirectedSun(directedSun, natalSun) {
    const predictions = [];

    // Sun enters different houses of life
    const sunHouse = this._getDirectedSolarHouse(directedSun.directedSign);

    predictions.push(`Self-expression and vitality focus on ${sunHouse.area} matters`);
    predictions.push(`${sunHouse.qualities} energies become prominent`);

    return predictions;
  }

  _analyzeDirectedMoon(directedMoon, criticalDegrees, age) {
    const predictions = [];
    const moonSign = this._getZodiacSignName(directedMoon.directedSign);

    predictions.push(`Emotional security and instincts align with ${moonSign} characteristics`);

    // Check for emotional crisis points
    criticalDegrees.forEach(critical => {
      if (critical.planet === 'Moon') {
        predictions.push(`Emotional turning point around age ${Math.round(age)}`);
      }
    });

    return predictions;
  }

  _analyzeDirectedMC(directedAscendant, age) {
    const predictions = [];

    // MC represents career and reputation
    const mcSign = this._getZodiacSignName(directedAscendant.directedSign);
    predictions.push(`Career path emphasizes ${mcSign} professional qualities`);

    return predictions;
  }

  _analyzeDirectedVenus(directedVenus, age) {
    const predictions = [];

    // Venus represents love and relationships
    const venusSign = this._getZodiacSignName(directedVenus.directedSign);
    predictions.push(`Romantic and social connections develop ${venusSign} qualities`);

    // Check for relationship milestones
    if (directedVenus.signChange) {
      predictions.push(`Significant relationship changes around age ${Math.round(age)}`);
    }

    return predictions;
  }

  _analyzeDirectedMars(directedMars, age) {
    const predictions = [];

    // Mars represents energy, health, and conflict
    predictions.push(`Physical energy and willpower develop new patterns`);

    // Health crises or energy changes
    if (directedMars.signChange) {
      predictions.push(`Health and energy significant shift around age ${Math.round(age)}`);
    }

    return predictions;
  }

  _getCriticalDegreePrediction(planet, criticalDegree) {
    const predictions = {
      Sun: 'Personal identity or self-expression reaches critical development',
      Moon: 'Emotional crisis or transformation in family/home matters',
      Mercury: 'Communication or learning hits critical crossroads',
      Venus: 'Relationships or values reach pivotal decision point',
      Mars: 'Action, conflict, or physical health involves crisis',
      Jupiter: 'Expansion, travel, or philosophical growth reaches climax',
      Saturn: 'Discipline, limitation, or authority faces critical challenge'
    };

    return predictions[planet] || `${planet} experiences critical turning point`;
  }

  _getDirectedSolarHouse(sign) {
    // Simplified house ruling for illustrative purposes
    const houseAreas = {
      1: { area: 'self and personality', qualities: 'Independent and self-motivated' },
      2: { area: 'wealth and possessions', qualities: 'Practical and value-oriented' },
      3: { area: 'communication and siblings', qualities: 'Communicative and adaptive' },
      4: { area: 'home and family', qualities: 'Emotional and nurturing' },
      5: { area: 'creativity and children', qualities: 'Creative and playful' },
      6: { area: 'service and health', qualities: 'Dedicated and analytical' },
      7: { area: 'partnerships and marriage', qualities: 'Relationship-focused' },
      8: { area: 'transformation and secrets', qualities: 'Intense and insightul' },
      9: { area: 'philosophy and travel', qualities: 'Expansive and adventurous' },
      10: { area: 'career and reputation', qualities: 'Ambitious and responsible' },
      11: { area: 'friends and goals', qualities: 'Progressive and community-minded' },
      12: { area: 'spirituality and endings', qualities: 'Introspective and compassionate' }
    };

    return houseAreas[sign] || houseAreas[1];
  }

  async _getCoordinatesForPlace(place) {
    try {
      const coords = await this.geocodingService.getCoordinates(place);
      return [coords.latitude, coords.longitude];
    } catch (error) {
      logger.warn('Error getting coordinates, using default:', error.message);
      return [28.6139, 77.2090]; // Delhi coordinates as fallback
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

module.exports = SolarArcDirectionsCalculator;