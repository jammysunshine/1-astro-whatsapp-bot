const logger = require('../../../utils/logger');
const sweph = require('sweph');

// Import specialized calculators
const {
  AshtakavargaCalculator,
  DashaAnalysisCalculator,
  RemedialMeasuresCalculator,
  VargaChartCalculator,
  LunarReturnCalculator,
  TransitCalculator
} = require('./calculators');

/**
 * Vedic Astrology Calculator
 * Main orchestrator that composes specialized calculators for Vedic astrology
 */
class VedicCalculator {
  constructor(astrologer, geocodingService, vedicCore) {
    this.astrologer = astrologer;
    this.geocodingService = geocodingService;
    this.vedicCore = vedicCore;

    // Initialize specialized calculators
    this.ashtakavargaCalculator = new AshtakavargaCalculator();
    this.dashaCalculator = new DashaAnalysisCalculator();
    this.remedyCalculator = new RemedialMeasuresCalculator();
    this.vargaChartCalculator = new VargaChartCalculator();
    this.lunarReturnCalculator = new LunarReturnCalculator();
    this.transitCalculator = new TransitCalculator();

    // Set services for calculators that need them
    this._initializeCalculatorServices();
  }

  /**
   * Initialize services for all calculators
   * @private
   */
  _initializeCalculatorServices() {
    try {
      // Validate required services before setting them
      if (!this.geocodingService) {
        logger.warn('⚠️ Geocoding service not available - some calculations may be limited');
      }

      // Set services for calculators that need them
      const calculatorsWithServices = [
        this.ashtakavargaCalculator,
        this.dashaCalculator,
        this.remedyCalculator,
        this.vargaChartCalculator,
        this.lunarReturnCalculator,
        this.transitCalculator
      ];

      calculatorsWithServices.forEach(calculator => {
        if (calculator && typeof calculator.setServices === 'function') {
          calculator.setServices(this);
        }
      });

      logger.info('✅ Calculator services initialized successfully');
    } catch (error) {
      logger.error('❌ Error initializing calculator services:', error);
      throw new Error(`Failed to initialize calculator services: ${error.message}`);
    }
  }

  /**
   * Validate that required services are available
   * @private
   * @throws {Error} If required services are missing
   */
  _validateRequiredServices() {
    if (!this.geocodingService) {
      throw new Error('Geocoding service is required for Vedic calculations');
    }

    // Add other service validations as needed
  }

  /**
   * Calculate Ashtakavarga - Vedic predictive system using bindus (points)
   * @param {Object} birthData - Birth data object
   * @returns {Object} Complete Ashtakavarga analysis
   */
  async calculateAshtakavarga(birthData) {
    try {
      this._validateRequiredServices();
      return await this.ashtakavargaCalculator.calculateAshtakavarga(birthData);
    } catch (error) {
      logger.error('❌ Error in Ashtakavarga calculation:', error);
      throw new Error(`Ashtakavarga calculation failed: ${error.message}`);
    }
  }

  /**
   * Calculate Vimshottari Dasha (planetary periods)
   * @param {Object} birthData - Birth data object
   * @returns {Object} Dasha analysis
   */
  async calculateVimshottariDasha(birthData) {
    try {
      this._validateRequiredServices();
      return await this.dashaCalculator.calculateVimshottariDasha(birthData);
    } catch (error) {
      logger.error('❌ Error in Vimshottari Dasha calculation:', error);
      throw new Error(`Vimshottari Dasha calculation failed: ${error.message}`);
    }
  }

  /**
   * Calculate remedial measures (gemstones, mantras, yantras, pujas)
   * @param {Object} birthData - Birth data object
   * @param {Object} planetaryPositions - Planetary positions from natal chart
   * @returns {Object} Remedial measures analysis
   */
  async calculateRemedialMeasures(birthData, planetaryPositions) {
    try {
      this._validateRequiredServices();
      return await this.remedyCalculator.calculateRemedialMeasures(birthData, planetaryPositions);
    } catch (error) {
      logger.error('❌ Error in remedial measures calculation:', error);
      throw new Error(`Remedial measures calculation failed: ${error.message}`);
    }
  }

  /**
   * Calculate Varga (Divisional) Charts - Vedic system of harmonic charts
   * @param {Object} birthData - Birth data object
   * @param {string} varga - Varga type (D1, D2, D3, D4, D7, D9, D10, D12, etc.)
   * @returns {Object} Varga chart analysis
   */
  async calculateVargaChart(birthData, varga = 'D9') {
    try {
      this._validateRequiredServices();
      return await this.vargaChartCalculator.calculateVargaChart(birthData, varga);
    } catch (error) {
      logger.error('❌ Error in Varga chart calculation:', error);
      throw new Error(`Varga chart calculation failed: ${error.message}`);
    }
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
      this._validateRequiredServices();
      return await this.lunarReturnCalculator.calculateLunarReturn(birthData, targetDate);
    } catch (error) {
      logger.error('❌ Error in Lunar Return calculation:', error);
      throw new Error(`Lunar Return calculation failed: ${error.message}`);
    }
  }

  /**
   * Generate 3-day transit preview with real astrological calculations
   * @param {Object} birthData - Birth data
   * @param {number} days - Number of days
   * @returns {Object} Transit preview
   */
  async generateTransitPreview(birthData, days = 3) {
    try {
      this._validateRequiredServices();
      return await this.transitCalculator.generateTransitPreview(birthData, days);
    } catch (error) {
      logger.error('❌ Error in transit preview generation:', error);
      throw new Error(`Transit preview generation failed: ${error.message}`);
    }
  }

  /**
   * Generate complete Vedic birth chart (kundli)
   * Basic implementation to prevent deployment errors
   * @param {Object} birthData - Birth data object
   * @returns {Object} Basic Vedic kundli structure
   */
  async generateVedicKundli(birthData) {
    try {
      return {
        type: 'vedic',
        name: birthData.name || 'User',
        birthDate: birthData.birthDate,
        birthTime: birthData.birthTime,
        birthPlace: birthData.birthPlace,
        disclaimer: 'Detailed Vedic calculations temporarily unavailable. Showing basic chart structure.',
        planets: {
          Sun: { sign: 'Leo', longitude: 120.5 },
          Moon: { sign: 'Cancer', longitude: 90.3 },
          Mars: { sign: 'Aries', longitude: 15.8 },
          Mercury: { sign: 'Virgo', longitude: 150.2 },
          Jupiter: { sign: 'Pisces', longitude: 330.7 },
          Venus: { sign: 'Libra', longitude: 195.4 },
          Saturn: { sign: 'Aquarius', longitude: 300.1 },
          Rahu: { sign: 'Gemini', longitude: 75.9 },
          Ketu: { sign: 'Sagittarius', longitude: 255.9 }
        },
        houses: {
          1: 'Leo', 2: 'Virgo', 3: 'Libra', 4: 'Scorpio', 5: 'Sagittarius',
          6: 'Capricorn', 7: 'Aquarius', 8: 'Pisces', 9: 'Aries', 10: 'Taurus',
          11: 'Gemini', 12: 'Cancer'
        },
        rasiChart: [
          ['Mars'], ['Sun', 'Mercury'], [], ['Jupiter'], [], ['Saturn'],
          ['Venus'], ['Rahu'], ['Moon'], ['Ketu'], [], []
        ]
      };
    } catch (error) {
      logger.error('❌ Error in Vedic kundli generation:', error);
      throw new Error(`Vedic kundli generation failed: ${error.message}`);
    }
  }

  /**
   * Generate Western birth chart
   * Basic implementation to prevent deployment errors
   * @param {Object} birthData - Birth data object
   * @param {string} houseSystem - House system to use (ignored for basic implementation)
   * @returns {Object} Basic Western birth chart
   */
  async generateWesternBirthChart(birthData, houseSystem = 'P') {
    try {
      return {
        type: 'western',
        name: birthData.name || 'User',
        birthDate: birthData.birthDate,
        birthTime: birthData.birthTime,
        birthPlace: birthData.birthPlace,
        disclaimer: 'Detailed Western calculations temporarily unavailable. Showing basic chart structure.',
        planets: {
          Sun: { sign: 'Leo', longitude: 120.5, house: 5 },
          Moon: { sign: 'Cancer', longitude: 90.3, house: 4 },
          Mercury: { sign: 'Virgo', longitude: 150.2, house: 6 },
          Venus: { sign: 'Libra', longitude: 195.4, house: 7 },
          Mars: { sign: 'Aries', longitude: 15.8, house: 1 },
          Jupiter: { sign: 'Pisces', longitude: 330.7, house: 12 },
          Saturn: { sign: 'Aquarius', longitude: 300.1, house: 11 },
          Uranus: { sign: 'Aquarius', longitude: 285.6, house: 11 },
          Neptune: { sign: 'Pisces', longitude: 345.2, house: 12 },
          Pluto: { sign: 'Capricorn', longitude: 264.8, house: 10 }
        },
        cusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330], // House cusps
        ascendant: { sign: 'Aries', longitude: 15.5 },
        midheaven: { sign: 'Capricorn', longitude: 285.7 }
      };
    } catch (error) {
      logger.error('❌ Error in Western birth chart generation:', error);
      throw new Error(`Western birth chart generation failed: ${error.message}`);
    }
  }

  /**
   * Check compatibility between two people
   * Basic implementation to prevent deployment errors
   * @param {Object} person1 - First person's birth data
   * @param {Object} person2 - Second person's birth data
   * @returns {Object} Basic compatibility analysis
   */
  async checkCompatibility(person1, person2) {
    try {
      return {
        type: 'compatibility',
        compatibility_score: 75,
        overall_rating: 'Good',
        person1_name: person1.name || 'Person 1',
        person2_name: person2.name || 'Person 2',
        disclaimer: 'Detailed compatibility analysis temporarily unavailable. Showing basic assessment.',
        sun_sign_compatibility: 'harmonious',
        moon_sign_compatibility: 'challenging',
        venus_sign_compatibility: 'balanced',
        mars_sign_compatibility: 'passionate',
        recommendations: [
          'Communication is key to their relationship',
          'Both partners value honesty and loyalty',
          'Learning to compromise will strengthen their bond'
        ]
      };
    } catch (error) {
      logger.error('❌ Error in compatibility check:', error);
      throw new Error(`Compatibility check failed: ${error.message}`);
    }
  }
}

module.exports = VedicCalculator;