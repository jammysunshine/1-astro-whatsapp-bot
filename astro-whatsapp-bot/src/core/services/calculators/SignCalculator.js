const logger = require('../../../utils/logger');
const sweph = require('sweph');
const { Astrologer } = require('astrologer');

/**
 * Sign Calculator
 * Advanced astrological sign calculations using Swiss Ephemeris
 */
class SignCalculator {
  constructor() {
    this.astrologer = new Astrologer();
    this._initializeEphemeris();
  }

  /**
   * Initialize Swiss Ephemeris
   * @private
   */
  _initializeEphemeris() {
    try {
      const ephePath = require('path').join(process.cwd(), 'ephe');
      sweph.swe_set_ephe_path(ephePath);
      logger.info('Swiss Ephemeris path set for SignCalculator');
    } catch (error) {
      logger.warn('Could not set ephemeris path for SignCalculator:', error.message);
    }
  }

  /**
   * Set services for the calculator
   * @param {Object} services - Service object
   */
  setServices(services) {
    this.services = services;
  }

  /**
   * Calculate sun sign based on birth date using Swiss Ephemeris
   * @param {string} birthDate - Birth date in DD/MM/YYYY format
   * @param {string} birthTime - Birth time in HH:MM format
   * @param {string} birthPlace - Birth place
   * @param {string} chartType - Chart type (sidereal/tropical)
   * @returns {Object} Sun sign details
   */
  async calculateSunSign(
    birthDate,
    birthTime = '12:00',
    birthPlace = 'Delhi, India',
    chartType = 'sidereal'
  ) {
    try {
      // Parse birth date and time
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);

      // Get coordinates for birth place
      const [latitude, longitude] = await this._getCoordinatesForPlace(birthPlace);
      const timezone = await this._getTimezoneForPlace(latitude, longitude);

      // Calculate Julian Day
      const ut = hour + minute / 60 - timezone; // Universal Time
      const julianDay = sweph.swe_julday(year, month, day, ut, sweph.SE_GREG_CAL);

      // Calculate sun position using Swiss Ephemeris
      const flags = chartType === 'sidereal' ? 0x10000 : 0x2; // Using numeric flags
      const sunResult = sweph.calc_ut(julianDay, 0, flags); // 0 = Sun

      if (!sunResult || sunResult.flag < 0) {
        throw new Error('Failed to calculate sun position');
      }

      const sunLongitude = sunResult.data[0];
      const signIndex = Math.floor(sunLongitude / 30);
      const signDegree = sunLongitude % 30;

      // Zodiac signs
      const zodiacSigns = [
        'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
        'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
      ];

      const sign = zodiacSigns[signIndex];

      // Sign details
      const signDetails = {
        Aries: { element: 'Fire', quality: 'Cardinal', planet: 'Mars', symbol: '🐏' },
        Taurus: { element: 'Earth', quality: 'Fixed', planet: 'Venus', symbol: '🐂' },
        Gemini: { element: 'Air', quality: 'Mutable', planet: 'Mercury', symbol: '👯' },
        Cancer: { element: 'Water', quality: 'Cardinal', planet: 'Moon', symbol: '🦀' },
        Leo: { element: 'Fire', quality: 'Fixed', planet: 'Sun', symbol: '🦁' },
        Virgo: { element: 'Earth', quality: 'Mutable', planet: 'Mercury', symbol: '👩' },
        Libra: { element: 'Air', quality: 'Cardinal', planet: 'Venus', symbol: '⚖️' },
        Scorpio: { element: 'Water', quality: 'Fixed', planet: 'Pluto', symbol: '🦂' },
        Sagittarius: { element: 'Fire', quality: 'Mutable', planet: 'Jupiter', symbol: '🏹' },
        Capricorn: { element: 'Earth', quality: 'Cardinal', planet: 'Saturn', symbol: '🐐' },
        Aquarius: { element: 'Air', quality: 'Fixed', planet: 'Uranus', symbol: '🏺' },
        Pisces: { element: 'Water', quality: 'Mutable', planet: 'Neptune', symbol: '🐟' }
      };

      const details = signDetails[sign];

      return {
        sign,
        element: details.element,
        quality: details.quality,
        rulingPlanet: details.planet,
        symbol: details.symbol,
        longitude: sunLongitude,
        degree: Math.floor(signDegree),
        minute: Math.floor((signDegree % 1) * 60),
        chartType,
        traits: this._getSignTraits(sign),
        astronomicalData: {
          julianDay,
          latitude,
          longitude,
          timezone
        }
      };
    } catch (error) {
      logger.error('❌ Error in sun sign calculation:', error);
      throw new Error(`Sun sign calculation failed: ${error.message}`);
    }
  }

  /**
   * Calculate moon sign based on birth date and time using Swiss Ephemeris
   * @param {Object|string} birthData - Birth data object or birth date string
   * @param {string} birthTime - Birth time in HH:MM format
   * @param {string} birthPlace - Birth place
   * @param {string} chartType - Chart type (sidereal/tropical)
   * @returns {Object} Moon sign details
   */
  async calculateMoonSign(
    birthData,
    birthTime = '12:00',
    birthPlace = 'Delhi, India',
    chartType = 'sidereal'
  ) {
    try {
      // Handle both object and string inputs
      let birthDate;
      if (typeof birthData === 'object' && birthData.birthDate) {
        birthDate = birthData.birthDate;
        birthTime = birthData.birthTime || birthTime;
        birthPlace = birthData.birthPlace || birthPlace;
      } else if (typeof birthData === 'string') {
        birthDate = birthData;
      } else {
        throw new Error('Invalid birth data format');
      }

      // Parse birth date and time
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);

      // Get coordinates for birth place
      const [latitude, longitude] = await this._getCoordinatesForPlace(birthPlace);
      const timezone = await this._getTimezoneForPlace(latitude, longitude);

      // Calculate Julian Day
      const ut = hour + minute / 60 - timezone; // Universal Time
      const julianDay = sweph.julday(year, month, day, ut, 1); // 1 for Gregorian calendar

      // Calculate moon position using Swiss Ephemeris
      const flags = chartType === 'sidereal' ? 0x10000 : 0x2; // Using numeric flags
      const moonResult = sweph.calc_ut(julianDay, 1, flags); // 1 = Moon

      if (!moonResult || moonResult.flag < 0) {
        throw new Error('Failed to calculate moon position');
      }

      const moonLongitude = moonResult.data[0];
      const signIndex = Math.floor(moonLongitude / 30);
      const signDegree = moonLongitude % 30;

      // Zodiac signs
      const zodiacSigns = [
        'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
        'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
      ];

      const sign = zodiacSigns[signIndex];

      // Moon sign details
      const signDetails = {
        Aries: { element: 'Fire', quality: 'Cardinal', rulingPlanet: 'Mars', symbol: '🌙' },
        Taurus: { element: 'Earth', quality: 'Fixed', rulingPlanet: 'Venus', symbol: '🌙' },
        Gemini: { element: 'Air', quality: 'Mutable', rulingPlanet: 'Mercury', symbol: '🌙' },
        Cancer: { element: 'Water', quality: 'Cardinal', rulingPlanet: 'Moon', symbol: '🌙' },
        Leo: { element: 'Fire', quality: 'Fixed', rulingPlanet: 'Sun', symbol: '🌙' },
        Virgo: { element: 'Earth', quality: 'Mutable', rulingPlanet: 'Mercury', symbol: '🌙' },
        Libra: { element: 'Air', quality: 'Cardinal', rulingPlanet: 'Venus', symbol: '🌙' },
        Scorpio: { element: 'Water', quality: 'Fixed', rulingPlanet: 'Pluto', symbol: '🌙' },
        Sagittarius: { element: 'Fire', quality: 'Mutable', rulingPlanet: 'Jupiter', symbol: '🌙' },
        Capricorn: { element: 'Earth', quality: 'Cardinal', rulingPlanet: 'Saturn', symbol: '🌙' },
        Aquarius: { element: 'Air', quality: 'Fixed', rulingPlanet: 'Uranus', symbol: '🌙' },
        Pisces: { element: 'Water', quality: 'Mutable', rulingPlanet: 'Neptune', symbol: '🌙' }
      };

      const details = signDetails[sign];

      return {
        sign,
        element: details.element,
        quality: details.quality,
        rulingPlanet: details.rulingPlanet,
        symbol: details.symbol,
        longitude: moonLongitude,
        degree: Math.floor(signDegree),
        minute: Math.floor((signDegree % 1) * 60),
        chartType,
        detailedTraits: this._getMoonSignTraits(sign),
        astronomicalData: {
          julianDay,
          latitude,
          longitude,
          timezone
        }
      };
    } catch (error) {
      logger.error('❌ Error in moon sign calculation:', error);
      throw new Error(`Moon sign calculation failed: ${error.message}`);
    }
  }

  /**
   * Get coordinates for a place (simplified implementation)
   * @private
   * @param {string} place - Place name
   * @returns {Array} [latitude, longitude]
   */
  async _getCoordinatesForPlace(place) {
    // Simplified geocoding - in production use proper geocoding service
    const placeCoords = {
      'Delhi, India': [28.6139, 77.2090],
      'Mumbai, India': [19.0760, 72.8777],
      'New York, USA': [40.7128, -74.0060],
      'London, UK': [51.5074, -0.1278]
    };

    return placeCoords[place] || [28.6139, 77.2090]; // Default to Delhi
  }

  /**
   * Get timezone for coordinates (simplified implementation)
   * @private
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {number} Timezone offset in hours
   */
  async _getTimezoneForPlace(lat, lng) {
    // Simplified timezone calculation
    if (lng >= -30 && lng <= 30) { return 0; } // GMT
    if (lng > 30 && lng <= 90) { return 3; } // IST
    if (lng > 90) { return 5.5; } // IST
    if (lng < -30) { return -5; } // EST
    return 0;
  }

  /**
   * Get moon sign specific traits
   * @private
   * @param {string} sign - Moon's zodiac sign
   * @returns {Array} Array of emotional traits
   */
  _getMoonSignTraits(sign) {
    const moonTraits = {
      Aries: [
        'Impulsive',
        'Passionate emotions',
        'Quick to anger',
        'Energetic feelings'
      ],
      Taurus: ['Sturdy emotions', 'Loving', 'Patient', 'Comfort-seeking'],
      Gemini: [
        'Versatile feelings',
        'Intellectual',
        'Communicative',
        'Restless'
      ],
      Cancer: ['Deeply emotional', 'Nurturing', 'Intuitive', 'Protective'],
      Leo: ['Dramatic feelings', 'Warm-hearted', 'Proud', 'Creative'],
      Virgo: ['Analytical emotions', 'Practical', 'Critical', 'Helpful'],
      Libra: ['Harmonious', 'Diplomatic', 'Fair', 'Partnership-oriented'],
      Scorpio: ['Intense emotions', 'Deep', 'Possessive', 'Transformative'],
      Sagittarius: [
        'Optimistic feelings',
        'Adventurous',
        'Honest',
        'Freedom-loving'
      ],
      Capricorn: ['Reserved emotions', 'Responsible', 'Ambitious', 'Stable'],
      Aquarius: [
        'Independent feelings',
        'Unconventional',
        'Humanitarian',
        'Detached'
      ],
      Pisces: ['Sensitive', 'Compassionate', 'Imaginative', 'Spiritual']
    };

    return moonTraits[sign] || [];
  }

  /**
   * Get sign traits
   * @private
   * @param {string} sign - Zodiac sign name
   * @returns {Array} Array of traits
   */
  _getSignTraits(sign) {
    const traits = {
      Aries: ['Energetic', 'Courageous', 'Competitive', 'Optimistic'],
      Taurus: ['Reliable', 'Patient', 'Practical', 'Devoted'],
      Gemini: ['Adaptable', 'Communicative', 'Witty', 'Intelligent'],
      Cancer: ['Emotional', 'Intuitive', 'Protective', 'Sympathetic'],
      Leo: ['Creative', 'Passionate', 'Generous', 'Warm-hearted'],
      Virgo: ['Analytical', 'Practical', 'Hardworking', 'Kind'],
      Libra: ['Diplomatic', 'Fair-minded', 'Social', 'Idealistic'],
      Scorpio: ['Resourceful', 'Brave', 'Passionate', 'Stubborn'],
      Sagittarius: [
        'Generous',
        'Idealistic',
        'Sense of humor',
        'Freedom-loving'
      ],
      Capricorn: ['Responsible', 'Disciplined', 'Self-controlled', 'Ambitious'],
      Aquarius: ['Independent', 'Original', 'Humanitarian', 'Intellectual'],
      Pisces: ['Compassionate', 'Artistic', 'Intuitive', 'Gentle']
    };

    return traits[sign] || [];
  }
}

module.exports = { SignCalculator };
