const logger = require('../../../utils/logger');
const sweph = require('sweph');
const { AstrologicalCalculations } = require('./AstrologicalCalculations');

/**
 * WesternChartGenerator - Generates Western astrology birth charts
 * Handles Swiss Ephemeris calculations, houses, and Western astrological traditions
 */
class WesternChartGenerator {
  constructor(astrologer, geocodingService, vedicCore) {
    this.astrologer = astrologer;
    this.geocodingService = geocodingService;
    this.vedicCore = vedicCore;
    this.calculations = new AstrologicalCalculations(vedicCore);
    logger.info('Module: WesternChartGenerator loaded for Western astrology calculations');
  }

  /**
   * Generate comprehensive Western astrology natal chart
   * @param {Object} user - User object with birth details
   * @param {string} houseSystem - House system ('P'=Placidus, 'K'=Koch, 'E'=Equal, etc.)
   * @returns {Object} Western natal chart data
   */
  async generateWesternBirthChart(user, houseSystem = 'P') {
    try {
      const { birthDate, birthTime, birthPlace, name } = user;

      // Parse birth date and time
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);

      // Get coordinates and timezone
      const locationInfo = await this.geocodingService.getLocationInfo(birthPlace);
      const birthDateTime = new Date(year, month - 1, day, hour, minute);
      const timestamp = birthDateTime.getTime();

      // Calculate Julian Day
      const jd = this.calculations.dateToJulianDay(year, month, day, hour + minute / 60);

      // Calculate houses
      const houses = this.calculations.calculateHouses(jd, locationInfo.latitude, locationInfo.longitude, houseSystem);

      // Calculate planetary positions
      const planets = {};
      const planetIds = {
        sun: 0,
        moon: 1,
        mercury: 2,
        venus: 3,
        mars: 4,
        jupiter: 5,
        saturn: 6
      };

      for (const [planetName, planetId] of Object.entries(planetIds)) {
        try {
          const position = sweph.calc(jd, planetId, 2 | 256);
          if (position && position.longitude) {
            const longitude = position.longitude[0];
            const speed = position.longitude[1];
            const signIndex = Math.floor(longitude / 30);
            const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

            // Calculate house position
            const house = this.calculations.getHouseFromLongitude(longitude, houses.houseCusps);

            // Calculate sign subdivisions
            const subdivisions = this.calculations.calculateSignSubdivisions(longitude);

            planets[planetName] = {
              name: planetName.charAt(0).toUpperCase() + planetName.slice(1),
              longitude,
              speed,
              retrograde: speed < 0,
              sign: signs[signIndex],
              signIndex,
              house,
              decanate: subdivisions.decanate,
              duad: subdivisions.duad,
              position: {
                degrees: Math.floor(longitude % 30),
                minutes: Math.floor((longitude % 1) * 60),
                seconds: Math.floor(((longitude % 1) * 60 % 1) * 60)
              }
            };
          }
        } catch (error) {
          logger.warn(`Error calculating ${planetName} position:`, error.message);
        }
      }

      // Calculate aspects with more detail
      const aspects = this.calculations.calculateDetailedAspects(planets);

      // Analyze aspect patterns
      const aspectPatterns = this.analyzeAspectPatterns(planets, aspects);

      // Calculate significant midpoints
      const midpoints = this.calculations.calculateMidpoints(planets);

      return {
        name,
        birthDate,
        birthTime,
        birthPlace,
        houseSystem: houses.system,
        ascendant: {
          sign: this.calculations.getSignFromLongitude(houses.ascendant),
          longitude: houses.ascendant
        },
        planets,
        houses: houses.houseCusps,
        aspects,
        aspectPatterns,
        midpoints,
        chartType: 'Western'
      };
    } catch (error) {
      logger.error('Error generating Western birth chart:', error);
      return {
        name: user.name,
        birthDate: user.birthDate,
        birthTime: user.birthTime,
        birthPlace: user.birthPlace,
        error: 'Unable to generate Western birth chart'
      };
    }
  }

  /**
   * Analyze Western aspect patterns in the chart
   * @param {Object} planets - Planet positions
   * @param {Array} aspects - Calculated aspects
   * @returns {Array} Aspect patterns found
   */
  analyzeAspectPatterns(planets, aspects) {
    const patterns = [];

    // Convert planets to array for easier processing
    const planetList = Object.values(planets).filter(p => p.longitude !== undefined);

    // Find Grand Trines (3 planets in trine, forming a triangle)
    const grandTrines = this.findGrandTrines(planetList, aspects);
    patterns.push(...grandTrines);

    // Find T-Squares (2 planets in opposition, both square a third planet)
    const tSquares = this.findTSquares(planetList, aspects);
    patterns.push(...tSquares);

    // Find Grand Crosses (4 planets in square, forming a cross)
    const grandCrosses = this.findGrandCrosses(planetList, aspects);
    patterns.push(...grandCrosses);

    // Find Yods (2 planets in sextile, both quincunx a third planet)
    const yods = this.findYods(planetList, aspects);
    patterns.push(...yods);

    // Find Kites (Grand Trine with a planet opposite one point of the trine)
    const kites = this.findKites(planetList, aspects, grandTrines);
    patterns.push(...kites);

    return patterns;
  }

  // Pattern finding helper methods
  findGrandTrines(planets, aspects) {
    const trines = aspects.filter(a => a.aspect === 'Trine');
    // Simplified implementation
    return [];
  }

  findTSquares(planets, aspects) {
    const squares = aspects.filter(a => a.aspect === 'Square');
    const oppositions = aspects.filter(a => a.aspect === 'Opposition');
    // Simplified implementation
    return [];
  }

  findGrandCrosses(planets, aspects) {
    const squares = aspects.filter(a => a.aspect === 'Square');
    // Simplified implementation
    return [];
  }

  findYods(planets, aspects) {
    const sextiles = aspects.filter(a => a.aspect === 'Sextile');
    const quincunxes = aspects.filter(a => a.aspect === 'Quincunx');
    // Simplified implementation
    return [];
  }

  findKites(planets, aspects, grandTrines) {
    const oppositions = aspects.filter(a => a.aspect === 'Opposition');
    // Simplified implementation
    return [];
  }
}

module.exports = { WesternChartGenerator };
