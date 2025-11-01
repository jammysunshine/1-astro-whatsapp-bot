const logger = require('../../../utils/logger');
const sweph = require('sweph');

/**
 * SwissEphemerisCalculator - Handles all astronomical calculations using Swiss Ephemeris
 * Responsible for planetary positions, house calculations, and astronomical math
 */
class SwissEphemerisCalculator {
  constructor() {
    this.logger = logger;
  }

  /**
   * Calculate complete chart positions using Swiss Ephemeris
   * @param {Object} person - Person's birth data (birthDate, birthTime, birthPlace, etc.)
   * @returns {Object} Complete chart with planets and houses
   */
  async calculateChartPositions(person) {
    try {
      const julianDay = this.calculateJulianDay(person);

      return {
        planets: this.calculatePlanetaryPositions(julianDay),
        houses: this.calculateHouseCusps(julianDay, person),
        ascendant: this.getAscendant(julianDay, person),
        ascendantSign: this.longitudeToSign(
          this.getAscendant(julianDay, person)
        ),
        julianDay,
        birthData: person
      };
    } catch (error) {
      this.logger.error('Swiss Ephemeris chart calculation error:', error);
      throw error;
    }
  }

  /**
   * Calculate Julian Day from birth data
   * @param {Object} person - Person's birth data
   * @returns {number} Julian Day number
   */
  calculateJulianDay(person) {
    // Parse birth date and time
    const birthYear =
      person.birthDate.length === 6 ?
        parseInt(`19${person.birthDate.substring(4)}`) :
        parseInt(person.birthDate.substring(4));
    const birthMonth = parseInt(person.birthDate.substring(2, 4)) - 1;
    const birthDay = parseInt(person.birthDate.substring(0, 2));
    const birthHour = person.birthTime ?
      parseInt(person.birthTime.substring(0, 2)) :
      12;
    const birthMinute = person.birthTime ?
      parseInt(person.birthTime.substring(2, 4)) :
      0;

    // Convert to Julian Day
    const utcTime = new Date(
      Date.UTC(birthYear, birthMonth, birthDay, birthHour, birthMinute)
    );
    return utcTime.getTime() / 86400000 + 2440587.5;
  }

  /**
   * Calculate planetary positions for given Julian Day
   * @param {number} julianDay - Julian Day number
   * @returns {Object} Planetary position data
   */
  calculatePlanetaryPositions(julianDay) {
    const planets = {};
    const planetIds = [
      { name: 'Sun', ephem: sweph.SE_SUN },
      { name: 'Moon', ephem: sweph.SE_MOON },
      { name: 'Mars', ephem: sweph.SE_MARS },
      { name: 'Mercury', ephem: sweph.SE_MERCURY },
      { name: 'Jupiter', ephem: sweph.SE_JUPITER },
      { name: 'Venus', ephem: sweph.SE_VENUS },
      { name: 'Saturn', ephem: sweph.SE_SATURN }
    ];

    for (const planet of planetIds) {
      try {
        const result = sweph.swe_calc_ut(
          julianDay,
          planet.ephem,
          sweph.SEFLG_SPEED | sweph.SEFLG_SWIEPH
        );
        if (result.rc >= 0) {
          planets[planet.name] = {
            longitude: result.longitude[0],
            latitude: result.latitude[0],
            distance: result.distance[0],
            speed: result.speed[0],
            sign: this.longitudeToSign(result.longitude[0]),
            degree: result.longitude[0] % 30
          };
        }
      } catch (error) {
        this.logger.warn(
          `Error calculating ${planet.name} position:`,
          error.message
        );
      }
    }

    return planets;
  }

  /**
   * Calculate house cusps using Placidus system
   * @param {number} julianDay - Julian Day number
   * @param {Object} person - Person data with location
   * @returns {Object} House cusp data
   */
  calculateHouseCusps(julianDay, person) {
    const defaultLat = 28.6139; // Default Delhi latitude
    const defaultLng = 77.209; // Default Delhi longitude
    const lat = person.latitude || defaultLat;
    const lng = person.longitude || defaultLng;

    const cusps = new Array(13);
    sweph.swe_houses(julianDay, lat, lng, 'P', cusps);

    const houses = {};
    for (let i = 1; i <= 12; i++) {
      houses[i] = {
        cusp: cusps[i],
        sign: this.longitudeToSign(cusps[i])
      };
    }

    return houses;
  }

  /**
   * Get ascendant position
   * @param {number} julianDay - Julian Day number
   * @param {Object} person - Person data with location
   * @returns {number} Ascendant longitude
   */
  getAscendant(julianDay, person) {
    const defaultLat = 28.6139;
    const defaultLng = 77.209;
    const lat = person.latitude || defaultLat;
    const lng = person.longitude || defaultLng;

    const cusps = new Array(13);
    sweph.swe_houses(julianDay, lat, lng, 'P', cusps);

    return cusps[0]; // Ascendant is at index 0
  }

  /**
   * Convert longitude to zodiac sign
   * @param {number} longitude - Degrees longitude
   * @returns {string} Zodiac sign
   */
  longitudeToSign(longitude) {
    const signs = [
      'Aries',
      'Taurus',
      'Gemini',
      'Cancer',
      'Leo',
      'Virgo',
      'Libra',
      'Scorpio',
      'Sagittarius',
      'Capricorn',
      'Aquarius',
      'Pisces'
    ];
    return signs[Math.floor(longitude / 30) % 12];
  }

  /**
   * Convert longitude to house number
   * @param {number} longitude - Degrees longitude
   * @param {number} ascendant - Chart ascendant
   * @returns {number} House number (1-12)
   */
  longitudeToHouse(longitude, ascendant) {
    const normalized = (longitude - ascendant + 360) % 360;
    return Math.floor(normalized / 30) + 1;
  }

  /**
   * Find aspect between two positions with specified orb
   * @param {number} pos1 - First position
   * @param {number} pos2 - Second position
   * @param {number} orb - Allowed orb in degrees (default 8)
   * @returns {Object|null} Aspect information or null
   */
  findAspect(pos1, pos2, orb = 8) {
    const diff = Math.min(
      Math.abs(pos1 - pos2),
      Math.abs(pos1 - pos2 + 360),
      Math.abs(pos1 - pos2 - 360)
    );

    const aspects = {
      0: 'conjunction',
      60: 'sextile',
      90: 'square',
      120: 'trine',
      150: 'quincunx',
      180: 'opposition'
    };

    for (const [angle, name] of Object.entries(aspects)) {
      const angleNum = parseInt(angle);
      if (Math.abs(diff - angleNum) <= orb) {
        return {
          aspect: angleNum,
          aspectName: name,
          orb: diff - angleNum,
          exactness: 100 - (Math.abs(diff - angleNum) / orb) * 100
        };
      }
    }

    return null;
  }
}

module.exports = { SwissEphemerisCalculator };
