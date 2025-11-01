const logger = require('../../../../utils/logger');
const sweph = require('sweph');

/**
 * Solar Return Calculator
 * Calculates solar return charts - birthday astrology
 */
class SolarReturnCalculator {
  constructor(astrologer, geocodingService) {
    this.astrologer = astrologer;
    this.geocodingService = geocodingService;
  }

  /**
   * Set services
   * @param {Object} services
   */
  setServices(services) {
    this.services = services;
  }

  /**
   * Calculate solar return analysis
   * @param {Object} birthData - Birth data
   * @param {number} targetYear - Year for solar return
   * @param {string} location - Location for calculation
   * @returns {Object} Solar return chart analysis
   */
  async calculateSolarReturn(birthData, targetYear = new Date().getFullYear(), location = null) {
    try {
      const { birthDate, birthTime, birthPlace } = birthData;

      // Parse birth date
      const [birthDay, birthMonth, birthYear] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);

      // Get birth coordinates
      const [birthLat, birthLng] = await this._getCoordinates(birthPlace);
      const timezone = await this._getTimezone(birthLat, birthLng, new Date(birthYear, birthMonth - 1, birthDay).getTime());

      // Calculate solar return date and time
      const solarReturnInfo = this._calculateSolarReturnMoment(
        birthDay, birthMonth, targetYear,
        birthLat, birthLng, timezone
      );

      // Calculate planetary positions at solar return
      const jd = this._dateToJD(
        solarReturnInfo.year, solarReturnInfo.month, solarReturnInfo.day,
        solarReturnInfo.hour + solarReturnInfo.minute / 60
      );

      const planets = await this._calculateSolarReturnPlanets(jd);
      const houses = this._calculateSolarReturnHouses(jd, birthLat, birthLng);
      const aspects = this._analyzeSolarReturnAspects(planets, houses);

      // Compare with natal chart
      const natalBirthJd = this._dateToJD(birthYear, birthMonth, birthDay, hour + minute / 60);
      const natalPlanets = await this._calculateSolarReturnPlanets(natalBirthJd);
      const natalHouses = this._calculateSolarReturnHouses(natalBirthJd, birthLat, birthLng);

      return {
        birthData,
        targetYear,
        solarReturnDate: `${solarReturnInfo.day}/${solarReturnInfo.month}/${solarReturnInfo.year}`,
        solarReturnTime: `${solarReturnInfo.hour}:${solarReturnInfo.minute.toString().padStart(2, '0')}`,
        location: location || birthPlace,
        coordinates: [solarReturnInfo.lat, solarReturnInfo.lng],
        planets,
        houses,
        aspects,
        comparisons: this._compareCharts(natalPlanets, planets, natalHouses, houses),
        interpretation: this._interpretSolarReturn(planets, aspects)
      };
    } catch (error) {
      logger.error('❌ Error in solar return calculation:', error);
      throw new Error(`Solar return calculation failed: ${error.message}`);
    }
  }

  /**
   * Calculate exact moment of solar return using progressive techniques
   * @private
   */
  _calculateSolarReturnMoment(birthDay, birthMonth, targetYear, latitude, longitude, timezone) {
    // Find when Sun returns to exact birth degree
    // This requires iterative calculation - simplified version

    const birthJD = this._dateToJD(targetYear - 1, birthMonth, birthDay, 12); // Start searching previous year

    // Find approximate solar return
    const birthJd = this._dateToJD(targetYear - 1, birthMonth, birthDay, 12);
    let currentJD = birthJd;

    let sunPos = sweph.calc(currentJD, sweph.SE_SUN);
    const birthSunPos = sweph.calc(birthJd, sweph.SE_SUN);

    if (!sunPos.longitude || !birthSunPos.longitude) {
      throw new Error('Cannot calculate solar positions');
    }

    // Iterative search (simplified - in practice needs precise algorithm)
    const iterations = 10;
    for (let i = 0; i < iterations; i++) {
      sunPos = sweph.calc(currentJD, sweph.SE_SUN);

      const diff = (sunPos.longitude - birthSunPos.longitude + 180) % 360 - 180; // Normalize difference

      if (Math.abs(diff) < 0.0001) { break; } // Close enough

      // Adjust JD based on difference (1 degree ≈ 1 day for Sun)
      currentJD += diff / 360; // Degrees to days adjustment
    }

    // Convert JD back to date/time
    const dateComponents = this._jdToDate(currentJD);
    const localTime = dateComponents.hour + (dateComponents.minute / 60) + timezone;

    return {
      year: dateComponents.year,
      month: dateComponents.month,
      day: dateComponents.day,
      hour: Math.floor(localTime),
      minute: Math.floor((localTime % 1) * 60),
      lat: latitude,
      lng: longitude
    };
  }

  /**
   * Calculate planets at solar return moment
   * @private
   */
  async _calculateSolarReturnPlanets(jd) {
    const planets = {};
    const planetNames = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];

    for (const planet of planetNames) {
      try {
        const pos = sweph.calc(jd, this._getPlanetId(planet));
        if (pos.longitude !== undefined) {
          const signIndex = Math.floor(pos.longitude / 30);
          const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

          planets[planet.toLowerCase()] = {
            name: planet,
            longitude: pos.longitude,
            sign: signs[signIndex],
            house: 1, // Would be calculated based on houses
            retrograde: pos.speedLongitude < 0,
            degrees: Math.floor(pos.longitude % 30),
            minutes: Math.floor((pos.longitude % 1) * 60)
          };
        }
      } catch (error) {
        logger.warn(`Error calculating solar return ${planet}:`, error.message);
      }
    }

    return planets;
  }

  /**
   * Calculate houses for solar return chart
   * @private
   */
  _calculateSolarReturnHouses(jd, latitude, longitude) {
    try {
      // Calculate house cusps - this requires more complex swe-house calculation
      // Simplified placeholder
      return {
        system: 'Placidus',
        cusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
        ascendant: 15.5, // Aries rising example
        mc: 285.7
      };
    } catch (error) {
      logger.error('Error calculating solar return houses:', error);
      return { system: 'Unknown', cusps: [], ascendant: 0, mc: 0 };
    }
  }

  /**
   * Analyze aspects in solar return chart
   * @private
   */
  _analyzeSolarReturnAspects(planets, houses) {
    const aspects = [];

    // Major aspects between planets
    const planetPositions = Object.values(planets);

    for (let i = 0; i < planetPositions.length; i++) {
      for (let j = i + 1; j < planetPositions.length; j++) {
        const p1 = planetPositions[i];
        const p2 = planetPositions[j];

        if (p1.longitude !== undefined && p2.longitude !== undefined) {
          const angle = Math.abs(this._normalizeAngle(p1.longitude - p2.longitude));

          // Check for conjunction, opposition, trine, square, sextile
          const aspectTypes = [
            { name: 'conjunction', angle: 0, orb: 8 },
            { name: 'opposition', angle: 180, orb: 8 },
            { name: 'trine', angle: 120, orb: 7 },
            { name: 'square', angle: 90, orb: 6 },
            { name: 'sextile', angle: 60, orb: 6 }
          ];

          for (const aspect of aspectTypes) {
            if (Math.abs(angle - aspect.angle) <= aspect.orb) {
              aspects.push({
                planets: [p1.name, p2.name],
                type: aspect.name,
                orb: Math.abs(angle - aspect.angle),
                significance: this._getSolarReturnAspectSignificance(aspect.name, p1.name, p2.name)
              });
            }
          }
        }
      }
    }

    return aspects;
  }

  /**
   * Compare solar return chart with natal chart
   * @private
   */
  _compareCharts(natalPlanets, srPlanets, natalHouses, srHouses) {
    const comparisons = {};

    // Compare planetary positions
    Object.keys(srPlanets).forEach(planetKey => {
      const natal = natalPlanets[planetKey];
      const sr = srPlanets[planetKey];

      if (natal && sr) {
        const signChange = natal.sign !== sr.sign;

        comparisons[`${planetKey}_change`] = {
          natalSign: natal.sign,
          srSign: sr.sign,
          signChange,
          significance: signChange ?
            `Major shift: ${planetKey} moves from ${natal.sign} to ${sr.sign}` :
            `Consistent: ${planetKey} remains in ${sr.sign}`
        };
      }
    });

    // Compare house cusps
    if (natalHouses.ascendant !== undefined && srHouses.ascendant !== undefined) {
      const ascDiff = Math.abs(srHouses.ascendant - natalHouses.ascendant);

      comparisons.ascendant_shift = {
        natalAsc: natalHouses.ascendant,
        srAsc: srHouses.ascendant,
        difference: ascDiff,
        significance: ascDiff > 90 ?
          'Major personality shift indicated' :
          'Personality remains consistent but nuanced'
      };
    }

    return comparisons;
  }

  /**
   * Interpret solar return chart
   * @private
   */
  _interpretSolarReturn(planets, aspects) {
    const interpretation = [];

    // Check solar return Sun sign
    if (planets.sun) {
      interpretation.push(`Solar return Sun in ${planets.sun.sign} indicates the theme of the coming year: ${this._getSunSignMeaning(planets.sun.sign)}`);
    }

    // Check aspects to Sun (solar return Sun shows year's energy)
    const sunAspects = aspects.filter(a => a.planets.includes('Sun'));

    if (sunAspects.length > 0) {
      interpretation.push(`${sunAspects.length} aspects to the Sun show how your core energy will manifest throughout the year.`);
    }

    // Check Moon position (emotional tone)
    if (planets.moon) {
      interpretation.push(`Moon in ${planets.moon.sign} sets the emotional tone for the year ahead.`);
    }

    return {
      keyThemes: interpretation,
      guidance: [
        'The solar return chart shows the themes and energies for your birthday year',
        'Compare with your natal chart for personal significance',
        'Look at planetary placements and aspects for life areas activation'
      ],
      duration: 'The solar return influence lasts from birthday to next birthday'
    };
  }

  /**
   * Get aspect significance in solar return context
   * @private
   */
  _getSolarReturnAspectSignificance(aspect, p1, p2) {
    const significances = {
      conjunction: `${p1} and ${p2} energies unite this year`,
      opposition: `${p1} and ${p2} require balance and integration`,
      trine: `Harmonious flow between ${p1} and ${p2} areas`,
      square: `Challenges and growth opportunities through ${p1}-${p2} tension`,
      sextile: `Opportunities through ${p1} and ${p2} cooperation`
    };

    return significances[aspect] || `${aspect} aspect between ${p1} and ${p2}`;
  }

  /**
   * Get Sun sign meaning for solar return year
   * @private
   */
  _getSunSignMeaning(sign) {
    const meanings = {
      Aries: 'New beginnings and assertive action',
      Taurus: 'Stability, practicality, and sensual pleasures',
      Gemini: 'Communication, learning, and adaptability',
      Cancer: 'Emotional nurturing and home building',
      Leo: 'Creativity, leadership, and self-expression',
      Virgo: 'Service, organization, and health consciousness',
      Libra: 'Harmony, relationships, and balancing scales',
      Scorpio: 'Transformation, depth, and power',
      Sagittarius: 'Expansion, philosophy, and adventure',
      Capricorn: 'Ambition, responsibility, and achievement',
      Aquarius: 'Innovation, community, and humanitarian focus',
      Pisces: 'Creativity, compassion, and spiritual connection'
    };

    return meanings[sign] || 'Personal growth and development';
  }

  /**
   * Convert JD back to date
   * @private
   */
  _jdToDate(jd) {
    // Simplified JD to date conversion
    // In practice, this requires precise astronomical algorithms
    return {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      day: new Date().getDate(),
      hour: 12,
      minute: 0
    };
  }

  _getPlanetId(planet) {
    const ids = {
      Sun: sweph.SE_SUN,
      Moon: sweph.SE_MOON,
      Mercury: sweph.SE_MERCURY,
      Venus: sweph.SE_VENUS,
      Mars: sweph.SE_MARS,
      Jupiter: sweph.SE_JUPITER,
      Saturn: sweph.SE_SATURN
    };
    return ids[planet] || sweph.SE_SUN;
  }

  _normalizeAngle(angle) {
    angle %= 360;
    return angle < 0 ? angle + 360 : angle;
  }

  _dateToJD(year, month, day, hour) {
    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;
    const jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
    return jd + hour / 24;
  }

  async _getCoordinates(place) {
    return [0, 0];
  }

  async _getTimezone(lat, lng, timestamp) {
    return 0;
  }
}

module.exports = { SolarReturnCalculator };
