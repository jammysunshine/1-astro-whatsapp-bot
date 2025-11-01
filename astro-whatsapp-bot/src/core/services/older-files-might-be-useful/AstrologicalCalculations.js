const logger = require('../../../utils/logger');
const sweph = require('sweph');

/**
 * AstrologicalCalculations - Shared calculation utilities for astrology
 * Provides common astrological calculation functions used by various chart generators
 */
class AstrologicalCalculations {
  constructor(vedicCore) {
    this.vedicCore = vedicCore;
    logger.info(
      'Module: AstrologicalCalculations loaded for shared astrology calculations'
    );
  }

  /**
   * Calculate date to Julian Day
   * @param {number} year - Year
   * @param {number} month - Month (1-12)
   * @param {number} day - Day
   * @param {number} hour - Hour (decimal)
   * @returns {number} Julian Day
   */
  dateToJulianDay(year, month, day, hour) {
    // Simplified Julian Day calculation
    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;

    const jd =
      day +
      Math.floor((153 * m + 2) / 5) +
      365 * y +
      Math.floor(y / 4) -
      Math.floor(y / 100) +
      Math.floor(y / 400) -
      32045;
    return jd + hour / 24;
  }

  /**
   * Calculate houses using Swiss Ephemeris
   * @param {number} jd - Julian Day
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @param {string} houseSystem - House system
   * @returns {Object} House data
   */
  calculateHouses(jd, latitude, longitude, houseSystem) {
    try {
      const houses = sweph.houses(
        jd,
        latitude,
        longitude,
        houseSystem.charAt(0).toUpperCase()
      );
      return {
        system: houseSystem,
        ascendant: houses.ascendant[0],
        houseCusps: houses.house
      };
    } catch (error) {
      logger.warn('Error calculating houses:', error.message);
      // Return default equal houses
      return {
        system: 'Equal',
        ascendant: 0,
        houseCusps: Array.from({ length: 12 }, (_, i) => i * 30)
      };
    }
  }

  /**
   * Get house from longitude using house cusps
   * @param {number} longitude - Planet longitude
   * @param {Object} houseCusps - House cusp longitudes
   * @returns {number} House number (1-12)
   */
  getHouseFromLongitude(longitude, houseCusps) {
    // Normalize longitude to 0-360
    longitude = ((longitude % 360) + 360) % 360;

    for (let house = 1; house <= 12; house++) {
      const cusp = houseCusps[house] || 0;
      const nextCusp = houseCusps[house === 12 ? 1 : house + 1] || 0;

      // Handle case where cusps cross 0/360 degrees
      if (cusp > nextCusp) {
        if (longitude >= cusp || longitude < nextCusp) {
          return house;
        }
      } else if (longitude >= cusp && longitude < nextCusp) {
        return house;
      }
    }

    return 1; // Default to 1st house
  }

  /**
   * Get sign from longitude
   * @param {number} longitude - Longitude in degrees
   * @returns {string} Sign name
   */
  getSignFromLongitude(longitude) {
    const signs = this.vedicCore.getZodiacSigns();
    const signIndex = Math.floor(longitude / 30) % 12;
    return signs[signIndex];
  }

  /**
   * Calculate sign subdivisions (decanates and duads)
   * @param {number} longitude - Planet longitude
   * @returns {Object} Decanate and duad information
   */
  calculateSignSubdivisions(longitude) {
    // Normalize longitude to 0-360
    longitude = ((longitude % 360) + 360) % 360;

    // Calculate sign (0-11)
    const signIndex = Math.floor(longitude / 30);
    const signLongitude = longitude % 30; // Position within sign (0-29.99)

    // Decanates: Each sign divided into 3 parts of 10 degrees
    const decanate = Math.floor(signLongitude / 10) + 1; // 1, 2, or 3

    // Duads: Each sign divided into 2 parts of 15 degrees (alternative to decanates)
    const duad = signLongitude < 15 ? 1 : 2;

    return {
      sign: this.getSignFromLongitude(longitude),
      decanate: {
        number: decanate,
        interpretation: this.interpretDecanate(
          this.getSignFromLongitude(longitude),
          decanate
        )
      },
      duad: {
        number: duad,
        interpretation: this.interpretDuad(
          this.getSignFromLongitude(longitude),
          duad
        )
      }
    };
  }

  /**
   * Calculate detailed aspects for Western astrology
   * @param {Object} planets - Planet positions
   * @returns {Array} Detailed aspects
   */
  calculateDetailedAspects(planets) {
    const aspects = [];
    const planetKeys = Object.keys(planets);

    // Define aspect types with orbs
    const aspectTypes = {
      conjunction: { angle: 0, orb: 8, name: 'Conjunction' },
      sextile: { angle: 60, orb: 6, name: 'Sextile' },
      square: { angle: 90, orb: 8, name: 'Square' },
      trine: { angle: 120, orb: 8, name: 'Trine' },
      opposition: { angle: 180, orb: 8, name: 'Opposition' },
      quincunx: { angle: 150, orb: 5, name: 'Quincunx' },
      semisextile: { angle: 30, orb: 4, name: 'Semisextile' },
      semisquare: { angle: 45, orb: 4, name: 'Semisquare' },
      sesquisquare: { angle: 135, orb: 4, name: 'Sesquisquare' },
      quintile: { angle: 72, orb: 2, name: 'Quintile' },
      biquintile: { angle: 144, orb: 2, name: 'Biquintile' }
    };

    // Check for aspects between planets
    for (let i = 0; i < planetKeys.length; i++) {
      for (let j = i + 1; j < planetKeys.length; j++) {
        const planet1 = planets[planetKeys[i]];
        const planet2 = planets[planetKeys[j]];

        if (
          planet1.longitude !== undefined &&
          planet2.longitude !== undefined
        ) {
          const angle = Math.abs(planet1.longitude - planet2.longitude) % 360;
          const minAngle = Math.min(angle, 360 - angle);

          // Check each aspect type
          Object.entries(aspectTypes).forEach(([aspectKey, aspectData]) => {
            if (Math.abs(minAngle - aspectData.angle) <= aspectData.orb) {
              const exactness =
                1 - Math.abs(minAngle - aspectData.angle) / aspectData.orb;
              aspects.push({
                planets: `${planet1.name}-${planet2.name}`,
                aspect: aspectData.name,
                angle: Math.round(minAngle * 10) / 10,
                orb: Math.round((minAngle - aspectData.angle) * 10) / 10,
                exactness: Math.round(exactness * 100),
                applying: planet1.speed > planet2.speed, // Which planet is moving faster
                interpretation: this.getAspectInterpretation(
                  aspectKey,
                  planet1.name,
                  planet2.name
                )
              });
            }
          });
        }
      }
    }

    return aspects.slice(0, 15); // Return top 15 aspects
  }

  /**
   * Calculate and interpret midpoints in Western astrology
   * @param {Object} planets - Planet positions
   * @returns {Array} Significant midpoints
   */
  calculateMidpoints(planets) {
    const midpoints = [];
    const planetList = Object.values(planets).filter(
      p => p.longitude !== undefined
    );

    // Calculate midpoints between all planet pairs
    for (let i = 0; i < planetList.length; i++) {
      for (let j = i + 1; j < planetList.length; j++) {
        const planet1 = planetList[i];
        const planet2 = planetList[j];

        // Calculate midpoint
        let midpointLong = (planet1.longitude + planet2.longitude) / 2;

        // Handle 0/360 degree crossover
        if (Math.abs(planet1.longitude - planet2.longitude) > 180) {
          midpointLong += 180;
          midpointLong %= 360;
        }

        // Check if any planet is conjunct the midpoint (within 2 degrees)
        const conjunctPlanets = planetList.filter(p => {
          let diff = Math.abs(p.longitude - midpointLong);
          diff = Math.min(diff, 360 - diff); // Handle 0/360 crossover
          return diff <= 2 && p !== planet1 && p !== planet2;
        });

        if (conjunctPlanets.length > 0) {
          conjunctPlanets.forEach(conjunct => {
            midpoints.push({
              planets: [planet1.name, planet2.name],
              midpoint: midpointLong,
              conjunctPlanet: conjunct.name,
              sign: this.getSignFromLongitude(midpointLong),
              interpretation: this.interpretMidpoint(
                planet1.name,
                planet2.name,
                conjunct.name
              )
            });
          });
        }
      }
    }

    return midpoints.slice(0, 10); // Return top 10 significant midpoints
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
      'Ashwini',
      'Bharani',
      'Krittika',
      'Rohini',
      'Mrigashira',
      'Ardra',
      'Punarvasu',
      'Pushya',
      'Ashlesha',
      'Magha',
      'Purva Phalguni',
      'Uttara Phalguni',
      'Hasta',
      'Chitra',
      'Swati',
      'Vishakha',
      'Anuradha',
      'Jyeshtha',
      'Mula',
      'Purva Ashadha',
      'Uttara Ashadha',
      'Shravana',
      'Dhanishta',
      'Shatabhisha',
      'Purva Bhadrapada',
      'Uttara Bhadrapada',
      'Revati'
    ];

    const lords = [
      'Ketu',
      'Venus',
      'Sun',
      'Moon',
      'Mars',
      'Rahu',
      'Jupiter',
      'Saturn',
      'Mercury',
      'Ketu',
      'Venus',
      'Sun',
      'Moon',
      'Mars',
      'Rahu',
      'Jupiter',
      'Saturn',
      'Mercury',
      'Ketu',
      'Venus',
      'Sun',
      'Moon',
      'Mars',
      'Rahu',
      'Jupiter',
      'Saturn',
      'Mercury'
    ];

    const index = Math.floor(longitude / nakshatraSize);
    const nakshatra = nakshatras[index];
    const lord = lords[index];

    // Calculate Pada (1-4)
    const positionInNakshatra = longitude - index * nakshatraSize;
    const pada = Math.floor(positionInNakshatra / padaSize) + 1;

    return {
      nakshatra,
      lord,
      pada,
      degree: longitude
    };
  }

  /**
   * Fallback sun sign calculation using simplified dates
   * @param {string} birthDate - Birth date in DD/MM or DD/MM/YYYY format
   * @returns {string} Sun sign
   */
  calculateSunSignFallback(birthDate) {
    try {
      const [day, month] = birthDate.split('/').map(Number);

      // Simplified sun sign calculation
      const signDates = [
        { sign: 'Capricorn', start: [22, 12], end: [19, 1] },
        { sign: 'Aquarius', start: [20, 1], end: [18, 2] },
        { sign: 'Pisces', start: [19, 2], end: [20, 3] },
        { sign: 'Aries', start: [21, 3], end: [19, 4] },
        { sign: 'Taurus', start: [20, 4], end: [20, 5] },
        { sign: 'Gemini', start: [21, 5], end: [20, 6] },
        { sign: 'Cancer', start: [21, 6], end: [22, 7] },
        { sign: 'Leo', start: [23, 7], end: [22, 8] },
        { sign: 'Virgo', start: [23, 8], end: [22, 9] },
        { sign: 'Libra', start: [23, 9], end: [22, 10] },
        { sign: 'Scorpio', start: [23, 10], end: [21, 11] },
        { sign: 'Sagittarius', start: [22, 11], end: [21, 12] }
      ];

      for (const { sign, start, end } of signDates) {
        if (
          (month === start[1] && day >= start[0]) ||
          (month === end[1] && day <= end[0]) ||
          (month > start[1] && month < end[1])
        ) {
          return sign;
        }
      }

      return 'Unknown';
    } catch (error) {
      logger.error('Error in fallback sun sign calculation:', error);
      return 'Unknown';
    }
  }

  // Interpretation helper methods
  getAspectInterpretation(aspect, planet1, planet2) {
    const interpretations = {
      conjunction: `${planet1} and ${planet2} energies blend and intensify`,
      sextile: `${planet1} and ${planet2} work harmoniously with opportunities`,
      square: `${planet1} and ${planet2} create tension and challenges`,
      trine: `${planet1} and ${planet2} flow easily with natural talents`,
      opposition: `${planet1} and ${planet2} represent polarities to balance`,
      quincunx: `${planet1} and ${planet2} require adjustment and adaptation`,
      semisextile: `${planet1} and ${planet2} show subtle connections`,
      semisquare: `${planet1} and ${planet2} indicate minor tensions`,
      sesquisquare: `${planet1} and ${planet2} suggest persistent challenges`,
      quintile: `${planet1} and ${planet2} show creative and unique expression`,
      biquintile: `${planet1} and ${planet2} indicate specialized talents`
    };
    return (
      interpretations[aspect] ||
      `${planet1} and ${planet2} form a ${aspect} aspect`
    );
  }

  interpretDecanate(sign, decanate) {
    const decanateThemes = {
      1: 'initiating, pioneering, and foundational',
      2: 'balancing, harmonizing, and developmental',
      3: 'culminating, transformative, and integrative'
    };

    return `${decanateThemes[decanate]} expression of ${sign} energy`;
  }

  interpretDuad(sign, duad) {
    const duadThemes = {
      1: 'personal, subjective, and initiating qualities',
      2: 'interpersonal, objective, and culminating qualities'
    };

    return `Expresses the ${duadThemes[duad]} of ${sign}.`;
  }

  interpretMidpoint(planet1, planet2, conjunct) {
    const midpointThemes = {
      'Sun-Moon': 'conscious and unconscious integration',
      'Sun-Mercury': 'clear communication and self-expression',
      'Sun-Venus': 'creative self-love and artistic expression',
      'Sun-Mars': 'dynamic self-assertion and leadership',
      'Sun-Jupiter': 'expansive self-confidence and wisdom',
      'Sun-Saturn': 'responsible self-discipline and achievement',
      'Moon-Mercury': 'intuitive communication and emotional intelligence',
      'Moon-Venus': 'nurturing relationships and emotional harmony',
      'Moon-Mars': 'protective instincts and emotional drive',
      'Moon-Jupiter': 'optimistic emotional outlook and growth',
      'Moon-Saturn': 'emotional maturity and responsibility'
    };

    const key = `${planet1}-${planet2}`;
    const reverseKey = `${planet2}-${planet1}`;
    const theme =
      midpointThemes[key] ||
      midpointThemes[reverseKey] ||
      `${planet1} and ${planet2} synthesis`;

    return `${conjunct} conjunct ${planet1}/${planet2} midpoint: ${theme} activated and expressed.`;
  }
}

module.exports = { AstrologicalCalculations };
