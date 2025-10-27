const logger = require('../../../utils/logger');

/**
 * Core Vedic Astrology Calculator
 * Handles initialization, caching, and core constants
 */
class VedicCore {
  constructor() {
    logger.info('Module: VedicCore loaded.');
    this._astrologer = null;

    // Performance optimization: Add calculation cache
    this._calculationCache = new Map();
    this._cacheMaxSize = 100; // Maximum cache entries
    this._cacheExpirationMs = 30 * 60 * 1000; // 30 minutes

    // Initialize calculation constants
    this._calculationConstants = {
      // Swiss Ephemeris calculation flags for maximum precision
      highPrecisionFlags: 2 | 256 | 2048 | 4096,
      siderealFlags: 2 | 256 | 65536,
      heliocentricFlags: 2 | 256 | 8,

      // Planet IDs for comprehensive calculations
      planetIds: {
        sun: 0,
        moon: 1,
        mercury: 2,
        venus: 3,
        mars: 4,
        jupiter: 5,
        saturn: 6,
        uranus: 7,
        neptune: 8,
        pluto: 9,
        meanNode: 10,
        trueNode: 11,
        meanApogee: 12,
        oscuApogee: 13,
        chiron: 15
      },

      // Ayanamsa systems for Vedic calculations
      ayanamsas: {
        lahiri: 1,
        raman: 3,
        krishnamurti: 5,
        fagan: 2
      }
    };

    // Zodiac signs (for backward compatibility and internal use)
    this.zodiacSigns = [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];

    // Performance optimization: Clean cache periodically
    setInterval(() => this._cleanExpiredCache(), 10 * 60 * 1000); // Clean every 10 minutes
  }

  /**
   * Get cached result
   * @param {string} cacheKey - Unique cache key
   * @returns {Object|null} Cached data or null
   */
  getCachedResult(cacheKey) {
    const cached = this._calculationCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this._cacheExpirationMs) {
      return cached.data;
    }
    if (cached) {
      this._calculationCache.delete(cacheKey); // Remove expired entry
    }
    return null;
  }

  /**
   * Set cached result
   * @param {string} cacheKey - Unique cache key
   * @param {Object} data - Data to cache
   */
  setCachedResult(cacheKey, data) {
    if (this._calculationCache.size >= this._cacheMaxSize) {
      // Remove oldest entry (simple FIFO)
      const firstKey = this._calculationCache.keys().next().value;
      this._calculationCache.delete(firstKey);
    }
    this._calculationCache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Clean expired cache entries
   * @private
   */
  _cleanExpiredCache() {
    const now = Date.now();
    for (const [key, cached] of this._calculationCache.entries()) {
      if (now - cached.timestamp > this._cacheExpirationMs) {
        this._calculationCache.delete(key);
      }
    }
  }

  /**
   * Get calculation constants
   * @returns {Object} Calculation constants
   */
  getCalculationConstants() {
    return this._calculationConstants;
  }

  /**
   * Get zodiac signs array
   * @returns {Array} Zodiac signs
   */
  getZodiacSigns() {
    return this.zodiacSigns;
  }

  /**
   * Get sign name from index
   * @param {number} index - Sign index (0-11)
   * @returns {string} Sign name
   */
  getSignName(index) {
    return this.zodiacSigns[index] || 'Unknown';
  }

  /**
   * Get sign index from name
   * @param {string} signName - Sign name
   * @returns {number} Sign index (0-11) or -1 if not found
   */
  getSignIndex(signName) {
    return this.zodiacSigns.indexOf(signName);
  }
}

module.exports = VedicCore;
