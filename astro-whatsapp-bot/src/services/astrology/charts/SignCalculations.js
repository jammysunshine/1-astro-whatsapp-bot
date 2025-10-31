const logger = require('../../../utils/logger');

/**
 * SignCalculations - Handles astrological sign calculations and fallbacks
 * Provides Vedic astrology sign calculations with fallback mechanisms
 */
class SignCalculations {
  constructor(vedicCore, geocodingService, signCalculations) {
    this.vedicCore = vedicCore;
    this.geocodingService = geocodingService;
    this.signCalculations = signCalculations; // The original sign calculations service
    logger.info('Module: SignCalculations loaded for Vedic sign calculations with fallbacks');
  }

  /**
   * Calculate sun sign with Vedic astrology and fallbacks
   * @param {string} birthDate - Birth date
   * @param {string} birthTime - Birth time
   * @param {string} birthPlace - Birth place
   * @returns {Promise<string>} Sun sign
   */
  async calculateSunSign(birthDate, birthTime, birthPlace) {
    try {
      // Try Vedic astrology calculation first
      return await this.signCalculations.calculateSunSign(birthDate, birthTime, birthPlace);
    } catch (error) {
      logger.warn('Vedic sun sign calculation failed, using fallback:', error.message);
      // Fallback to simplified date-based calculation
      return this.calculateSunSignFallback(birthDate);
    }
  }

  /**
   * Calculate moon sign with Vedic astrology and fallbacks
   * @param {string} birthDate - Birth date
   * @param {string} birthTime - Birth time
   * @param {string} birthPlace - Birth place
   * @returns {Promise<string>} Moon sign
   */
  async calculateMoonSign(birthDate, birthTime, birthPlace) {
    try {
      // Try Vedic astrology calculation first
      return await this.signCalculations.calculateMoonSign(birthDate, birthTime, birthPlace);
    } catch (error) {
      logger.warn('Vedic moon sign calculation failed, using fallback');
      return 'Unknown';
    }
  }

  /**
   * Calculate rising sign with Vedic astrology and fallbacks
   * @param {string} birthDate - Birth date
   * @param {string} birthTime - Birth time
   * @param {string} birthPlace - Birth place
   * @returns {Promise<string>} Rising sign
   */
  async calculateRisingSign(birthDate, birthTime, birthPlace) {
    try {
      // Try Vedic astrology calculation first
      return await this.signCalculations.calculateRisingSign(birthDate, birthTime, birthPlace);
    } catch (error) {
      logger.warn('Vedic rising sign calculation failed, using fallback');
      return 'Unknown';
    }
  }

  /**
   * Calculate Nakshatra position
   * @param {number} moonLongitude - Moon's longitude
   * @returns {Object} Nakshatra information
   */
  calculateNakshatra(moonLongitude) {
    // Normalize longitude to 0-360
    moonLongitude = ((moonLongitude % 360) + 360) % 360;

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

    const index = Math.floor(moonLongitude / nakshatraSize);
    const nakshatra = nakshatras[index];
    const lord = lords[index];

    // Calculate Pada (1-4)
    const positionInNakshatra = moonLongitude - (index * nakshatraSize);
    const pada = Math.floor(positionInNakshatra / padaSize) + 1;

    return {
      nakshatra,
      lord,
      pada,
      degree: moonLongitude
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
}

module.exports = { SignCalculations };
