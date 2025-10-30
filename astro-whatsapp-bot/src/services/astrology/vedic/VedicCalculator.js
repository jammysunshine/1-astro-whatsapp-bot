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
   * @param {Object} birthData - Birth data object
   * @returns {Object} Complete Vedic kundli
   */
  async generateVedicKundli(birthData) {
    // TODO: Extract this into specialized BirthChartGenerator calculator
    // For now, delegate to old monolithic calculator
    const { VedicCalculator: OldCalculator } = require('../vedicCalculator');
    const oldCalculator = new OldCalculator(this.astrologer, this.geocodingService, this.vedicCore);
    return oldCalculator.generateVedicKundli(birthData);
  }

  /**
   * Generate Western birth chart
   * @param {Object} birthData - Birth data object
   * @param {string} houseSystem - House system to use
   * @returns {Object} Western birth chart
   */
  async generateWesternBirthChart(birthData, houseSystem = 'P') {
    // TODO: Extract this into specialized BirthChartGenerator calculator
    // For now, delegate to old monolithic calculator
    const { VedicCalculator: OldCalculator } = require('../vedicCalculator');
    const oldCalculator = new OldCalculator(this.astrologer, this.geocodingService, this.vedicCore);
    return oldCalculator.generateWesternBirthChart(birthData, houseSystem);
  }

  /**
   * Check compatibility between two people
   * @param {Object} person1 - First person's birth data
   * @param {Object} person2 - Second person's birth data
   * @returns {Object} Compatibility analysis
   */
  async checkCompatibility(person1, person2) {
    // TODO: Extract this into specialized CompatibilityCalculator
    // For now, delegate to old monolithic calculator
    const { VedicCalculator: OldCalculator } = require('../vedicCalculator');
    const oldCalculator = new OldCalculator(this.astrologer, this.geocodingService, this.vedicCore);
    return oldCalculator.checkCompatibility(person1, person2);
  }
}

module.exports = VedicCalculator;