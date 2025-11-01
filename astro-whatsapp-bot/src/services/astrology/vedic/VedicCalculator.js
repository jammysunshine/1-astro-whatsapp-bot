const logger = require('../../../utils/logger');

// Import all specialized calculator modules
const {
  // Chart & Analysis Calculators
  ChartGenerator,
  DetailedChartAnalysisCalculator,
  ComprehensiveAnalysisCalculator,
  CompatibilityCalculator,

  // Specialty Vedic Calculators
  AshtakavargaCalculator,
  DashaAnalysisCalculator,
  VargaChartCalculator,
  ShadbalaCalculator,
  KaalSarpDoshaCalculator,
  SadeSatiCalculator,
  VarshaphalCalculator,

  // Predictive Calculators
  SolarArcDirectionsCalculator,
  SecondaryProgressionsCalculator,
  SignificantTransitsCalculator,
  FutureSelfSimulatorCalculator,

  // Timing & Auspicious Calculators
  MuhurtaCalculator,
  PanchangCalculator,
  CosmicEventsCalculator,
  LunarReturnCalculator,

  // Compatibility & Relationship
  GroupAstrologyCalculator,

  // Sign & Basic Calculators
  SignCalculator,

  // Specialized Analysis
  JaiminiAstrologyCalculator,
  JaiminiCalculator,
  MarriageTimingCalculator,

  // Modern & Advanced
  PrashnaCalculator,
  AsteroidCalculator,
  DailyHoroscopeCalculator,
  GocharCalculator,

  // Remedies & Spiritual
  RemedialMeasuresCalculator,
  VedicYogasCalculator,

  TransitCalculator
} = require('./calculators');

/**
 * Vedic Astrology Calculator
 * Pure orchestrator that coordinates specialized calculator modules
 * No calculation logic - only delegation and service management
 */
class VedicCalculator {
  constructor(astrologer, geocodingService, vedicCore) {
    this.astrologer = astrologer;
    this.geocodingService = geocodingService;
    this.vedicCore = vedicCore;

    // Initialize all calculator modules
    this._initializeCalculators();

    // Initialize services
    this._initializeServices();

    logger.info('✅ VedicCalculator orchestrator initialized with all calculator modules');
  }

  /**
   * Initialize all calculator module instances
   * @private
   */
  _initializeCalculators() {
    // Chart & Analysis Calculators
    this.chartGenerator = new ChartGenerator(this.vedicCore, this.geocodingService);
    this.detailedChartCalculator = new DetailedChartAnalysisCalculator();
    this.comprehensiveAnalysisCalculator = new ComprehensiveAnalysisCalculator();
    this.compatibilityCalculator = new CompatibilityCalculator(this.astrologer, this.geocodingService);

    // Specialty Vedic Calculators
    this.ashtakavargaCalculator = new AshtakavargaCalculator();
    this.dashaCalculator = new DashaAnalysisCalculator();
    this.vargaChartCalculator = new VargaChartCalculator();
    this.shadbalaCalculator = new ShadbalaCalculator();
    this.kaalSarpCalculator = new KaalSarpDoshaCalculator();

    // Predictive Calculators
    this.solarArcCalculator = new SolarArcDirectionsCalculator();
    this.secondaryProgressionsCalculator = new SecondaryProgressionsCalculator();
    this.significantTransitsCalculator = new SignificantTransitsCalculator();
    this.futureSelfSimulator = new FutureSelfSimulatorCalculator();
    this.varshaphalCalculator = new VarshaphalCalculator();

    // Timing & Auspicious Calculators
    this.muhurtaCalculator = new MuhurtaCalculator();
    this.panchangCalculator = new PanchangCalculator();
    this.cosmicEventsCalculator = new CosmicEventsCalculator();
    this.lunarReturnCalculator = new LunarReturnCalculator();

    // Compatibility & Relationship
    this.groupAstrologyCalculator = new GroupAstrologyCalculator();

    // Sign & Basic Calculators
    this.signCalculator = new SignCalculator();

    // Specialized Analysis
    this.jaiminiCalculator = new JaiminiCalculator();
    this.sadeSatiCalculator = new SadeSatiCalculator();
    this.marriageTimingCalculator = new MarriageTimingCalculator();

    // Modern & Advanced
    this.prashnaCalculator = new PrashnaCalculator();
    this.asteroidCalculator = new AsteroidCalculator();
    this.dailyHoroscopeCalculator = new DailyHoroscopeCalculator();
    this.gocharCalculator = new GocharCalculator();

    // Remedies & Spiritual
    this.remedyCalculator = new RemedialMeasuresCalculator();
    this.vedicYogasCalculator = new VedicYogasCalculator();

    // Transit Calculator
    this.transitCalculator = new TransitCalculator();
  }

  /**
   * Initialize services for all calculator modules
   * @private
   */
  _initializeServices() {
    const calculatorsWithServices = [
      // List all calculator instances that need services
      this.chartGenerator,
      this.detailedChartCalculator,
      this.comprehensiveAnalysisCalculator,
      this.ashtakavargaCalculator,
      this.dashaCalculator,
      this.vargaChartCalculator,
      this.shadbalaCalculator,
      this.kaalSarpCalculator,
      this.solarArcCalculator,
      this.secondaryProgressionsCalculator,
      this.significantTransitsCalculator,
      this.futureSelfSimulator,
      this.varshaphalCalculator,
      this.muhurtaCalculator,
      this.panchangCalculator,
      this.cosmicEventsCalculator,
      this.lunarReturnCalculator,
      this.groupAstrologyCalculator,
      this.signCalculator,
      this.jaiminiCalculator,
      this.sadeSatiCalculator,
      this.marriageTimingCalculator,
      this.prashnaCalculator,
      this.asteroidCalculator,
      this.dailyHoroscopeCalculator,
      this.gocharCalculator,
      this.remedyCalculator,
      this.vedicYogasCalculator,
      this.transitCalculator
    ];

    calculatorsWithServices.forEach(calculator => {
      if (calculator && typeof calculator.setServices === 'function') {
        calculator.setServices({
          astrologer: this.astrologer,
          geocodingService: this.geocodingService,
          vedicCore: this.vedicCore,
          vedicCalculator: this
        });
      }
    });

    logger.info('✅ Calculator services initialized successfully');
  }

  /**
   * Validate that required services are available
   * @private
   * @throws {Error} If required services are missing
   */
  _validateRequiredServices() {
    const requiredServices = [
      { name: 'geocodingService', service: this.geocodingService },
      { name: 'vedicCore', service: this.vedicCore },
      { name: 'astrologer', service: this.astrologer }
    ];

    const missingServices = requiredServices
      .filter(({ service }) => !service)
      .map(({ name }) => name);

    if (missingServices.length > 0) {
      throw new Error(`Missing required services: ${missingServices.join(', ')}`);
    }
  }

  /**
   * Delegate method call to appropriate calculator
   * @private
   * @param {string} calculatorName - Name of calculator property
   * @param {string} methodName - Method to call
   * @param {Array} args - Arguments to pass
   * @returns {*} Result from calculator method
   */
  async _delegateToCalculator(calculatorName, methodName, ...args) {
    try {
      this._validateRequiredServices();

      const calculator = this[calculatorName];
      if (!calculator) {
        throw new Error(`Calculator '${calculatorName}' not found`);
      }

      if (!calculator[methodName]) {
        throw new Error(`Method '${methodName}' not found on calculator '${calculatorName}'`);
      }

      return await calculator[methodName](...args);
    } catch (error) {
      logger.error(`❌ Error delegating to ${calculatorName}.${methodName}:`, error);
      throw error;
    }
  }

  // ============================================================================
  // CHART GENERATION METHODS
  // ============================================================================

  /**
   * Generate complete Vedic birth chart (kundli)
   * @param {Object} birthData - Birth data object
   * @returns {Object} Complete Vedic kundli
   */
  async generateVedicKundli(birthData) {
    return this._delegateToCalculator('chartGenerator', 'generateVedicKundli', birthData);
  }

  /**
   * Generate Western birth chart
   * @param {Object} birthData - Birth data object
   * @param {string} houseSystem - House system to use
   * @returns {Object} Western birth chart
   */
  async generateWesternBirthChart(birthData, houseSystem = 'P') {
    return this._delegateToCalculator('chartGenerator', 'generateWesternBirthChart', birthData, houseSystem);
  }

  /**
   * Generate detailed Vedic chart analysis
   * @param {Object} birthData - Birth data object
   * @returns {Object} Detailed chart analysis
   */
  async generateDetailedChart(birthData) {
    return this._delegateToCalculator('detailedChartCalculator', 'generateDetailedChart', birthData);
  }

  // ============================================================================
  // SPECIALTY VEDIC CALCULATIONS
  // ============================================================================

  /**
   * Calculate Ashtakavarga (8-point strength system)
   * @param {Object} birthData - Birth data object
   * @returns {Object} Ashtakavarga analysis
   */
  async calculateAshtakavarga(birthData) {
    return this._delegateToCalculator('ashtakavargaCalculator', 'calculateAshtakavarga', birthData);
  }

  /**
   * Calculate Vimshottari Dasha (planetary periods)
   * @param {Object} birthData - Birth data object
   * @returns {Object} Dasha analysis
   */
  async calculateVimshottariDasha(birthData) {
    return this._delegateToCalculator('dashaCalculator', 'calculateVimshottariDasha', birthData);
  }

  /**
   * Calculate Varga charts (divisional charts)
   * @param {Object} birthData - Birth data object
   * @param {string} varga - Varga type (D1, D9, D10, etc.)
   * @returns {Object} Varga chart analysis
   */
  async calculateVargaChart(birthData, varga = 'D9') {
    return this._delegateToCalculator('vargaChartCalculator', 'calculateVargaChart', birthData, varga);
  }

  /**
   * Calculate Shadbala (6-fold strength)
   * @param {Object} birthData - Birth data object
   * @returns {Object} Shadbala analysis
   */
  async generateShadbala(birthData) {
    return this._delegateToCalculator('shadbalaCalculator', 'generateShadbala', birthData);
  }

  /**
   * Analyze Kaal Sarp Dosha
   * @param {string} birthDate - Birth date
   * @param {string} birthTime - Birth time
   * @param {string} birthPlace - Birth place
   * @returns {Object} Kaal Sarp Dosha analysis
   */
  async analyzeKaalSarpDosha(birthDate, birthTime, birthPlace) {
    return this._delegateToCalculator('kaalSarpCalculator', 'analyzeKaalSarpDosha', birthDate, birthTime, birthPlace);
  }

  // ============================================================================
  // PREDICTIVE METHODS
  // ============================================================================

  /**
   * Calculate Solar Arc Directions
   * @param {Object} birthData - Birth data object
   * @param {Date} targetDate - Target date for directions
   * @returns {Object} Solar arc analysis
   */
  async calculateSolarArcDirections(birthData, targetDate) {
    return this._delegateToCalculator('solarArcCalculator', 'calculateSolarArcDirections', birthData, targetDate);
  }

  /**
   * Calculate Secondary Progressions
   * @param {Object} birthData - Birth data object
   * @returns {Object} Secondary progression analysis
   */
  async calculateSecondaryProgressions(birthData) {
    return this._delegateToCalculator('secondaryProgressionsCalculator', 'calculateSecondaryProgressions', birthData);
  }

  /**
   * Calculate significant transits
   * @param {Object} birthData - Birth data
   * @param {number} monthsAhead - Months to look ahead
   * @returns {Object} Significant transits analysis
   */
  async calculateNextSignificantTransits(birthData, monthsAhead = 12) {
    return this._delegateToCalculator('significantTransitsCalculator', 'calculateNextSignificantTransits', birthData, monthsAhead);
  }

  /**
   * Generate future self simulation
   * @param {Object} birthData - Birth data object
   * @param {number} yearsAhead - Years to simulate
   * @returns {Object} Future self analysis
   */
  async generateFutureSelfSimulator(birthData, yearsAhead = 10) {
    return this._delegateToCalculator('futureSelfSimulator', 'generateFutureSelfSimulator', birthData, yearsAhead);
  }

  /**
   * Calculate Varshaphal (solar return)
   * @param {Object} birthData - Birth data object
   * @param {number} year - Year for calculation
   * @returns {Object} Varshaphal analysis
   */
  async calculateVarshaphal(birthData, year) {
    return this._delegateToCalculator('varshaphalCalculator', 'calculateVarshaphal', birthData, year);
  }

  // ============================================================================
  // TIMING & AUSPICIOUS CALCULATIONS
  // ============================================================================

  /**
   * Calculate Muhurta (auspicious timing)
   * @param {Object} requestData - Request parameters
   * @returns {Object} Muhurta recommendations
   */
  async generateMuhurta(requestData) {
    return this._delegateToCalculator('muhurtaCalculator', 'generateMuhurta', requestData);
  }

  /**
   * Generate Panchang (Hindu calendar)
   * @param {Object} dateData - Date for panchang
   * @returns {Object} Panchang details
   */
  async generatePanchang(dateData) {
    return this._delegateToCalculator('panchangCalculator', 'generatePanchang', dateData);
  }

  /**
   * Calculate cosmic events
   * @param {Object} timeRange - Time range for events
   * @returns {Object} Cosmic events analysis
   */
  async calculateCosmicEvents(timeRange) {
    return this._delegateToCalculator('cosmicEventsCalculator', 'calculateCosmicEvents', timeRange);
  }

  /**
   * Calculate lunar return
   * @param {Object} birthData - Birth data object
   * @param {Date} targetDate - Target date
   * @returns {Object} Lunar return analysis
   */
  async calculateLunarReturn(birthData, targetDate) {
    return this._delegateToCalculator('lunarReturnCalculator', 'calculateLunarReturn', birthData, targetDate);
  }

  // ============================================================================
  // COMPATIBILITY ANALYSIS
  // ============================================================================

  /**
   * Check compatibility between two people using Vedic astrology
   * @param {Object} person1 - First person's birth data
   * @param {Object} person2 - Second person's birth data
   * @returns {Object} Comprehensive compatibility analysis
   */
  async checkCompatibility(person1, person2) {
    return this._delegateToCalculator('compatibilityCalculator', 'checkCompatibility', person1, person2);
  }

  /**
   * Analyze group astrology
   * @param {Object} groupData - Group data object
   * @returns {Object} Group astrology analysis
   */
  async generateGroupAstrology(groupData) {
    return this._delegateToCalculator('groupAstrologyCalculator', 'generateGroupAstrology', groupData);
  }

  // ============================================================================
  // SIGN & BASIC CALCULATIONS
  // ============================================================================

  /**
   * Calculate sun sign
   * @param {Object} birthData - Birth data object
   * @returns {Object} Sun sign analysis
   */
  async calculateSunSign(birthData) {
    return this._delegateToCalculator('signCalculator', 'calculateSunSign', birthData);
  }

  /**
   * Calculate moon sign
   * @param {Object} birthData - Birth data object
   * @returns {Object} Moon sign analysis
   */
  async calculateMoonSign(birthData) {
    return this._delegateToCalculator('signCalculator', 'calculateMoonSign', birthData);
  }

  // ============================================================================
  // SPECIALIZED ANALYSIS
  // ============================================================================

  /**
   * Analyze karmic lessons
   * @param {Object} birthData - Birth data object
   * @returns {Object} Karmic lessons analysis
   * NOTE: KarmicLessonsCalculator is missing - flagged for implementation
   */
  async analyzeKarmicLessons(birthData) {
    throw new Error('KarmicLessonsCalculator not implemented - missing calculator file');
    // return this._delegateToCalculator('karmicLessonsCalculator', 'analyzeKarmicLessons', birthData);
  }

  /**
   * Calculate Jaimini astrology
   * @param {Object} birthData - Birth data object
   * @returns {Object} Jaimini analysis
   */
  async calculateJaiminiAstrology(birthData) {
    return this._delegateToCalculator('jaiminiCalculator', 'calculateJaiminiAstrology', birthData);
  }

  /**
   * Generate Sade Sati analysis
   * @param {Object} birthData - Birth data object
   * @returns {Object} Sade Sati analysis
   */
  async generateSadeSatiAnalysis(birthData) {
    return this._delegateToCalculator('sadeSatiCalculator', 'generateSadeSatiAnalysis', birthData);
  }

  /**
   * Calculate marriage timing
   * @param {Object} birthData - Birth data object
   * @returns {Object} Marriage timing analysis
   */
  async calculateMarriageTiming(birthData) {
    return this._delegateToCalculator('marriageTimingCalculator', 'calculateMarriageTiming', birthData);
  }

  // ============================================================================
  // MODERN & ADVANCED METHODS
  // ============================================================================

  /**
   * Calculate Prashna (horary astrology)
   * @param {Object} questionData - Question data object
   * @returns {Object} Prashna analysis
   */
  async calculatePrashna(questionData) {
    return this._delegateToCalculator('prashnaCalculator', 'calculatePrashna', questionData);
  }

  /**
   * Calculate asteroids
   * @param {Object} birthData - Birth data object
   * @returns {Object} Asteroid analysis
   */
  async calculateAsteroids(birthData) {
    return this._delegateToCalculator('asteroidCalculator', 'calculateAsteroids', birthData);
  }

  /**
   * Generate daily horoscope
   * @param {Object} birthData - Birth data object
   * @returns {Object} Daily horoscope
   */
  async generateDailyHoroscope(birthData) {
    return this._delegateToCalculator('dailyHoroscopeCalculator', 'generateDailyHoroscope', birthData);
  }

  /**
   * Calculate Gochar (transits)
   * @param {Object} birthData - Birth data object
   * @param {Date} targetDate - Target date
   * @returns {Object} Gochar analysis
   */
  async calculateGochar(birthData, targetDate) {
    return this._delegateToCalculator('gocharCalculator', 'calculateGochar', birthData, targetDate);
  }

  // ============================================================================
  // REMEDIES & SPIRITUAL ANALYSIS
  // ============================================================================

  /**
   * Calculate remedial measures
   * @param {Object} birthData - Birth data object
   * @param {Object} planetaryPositions - Current planetary positions
   * @returns {Object} Remedial measures
   */
  async calculateRemedialMeasures(birthData, planetaryPositions) {
    return this._delegateToCalculator('remedyCalculator', 'calculateRemedialMeasures', birthData, planetaryPositions);
  }

  /**
   * Analyze Vedic yogas
   * @param {Object} birthData - Birth data object
   * @returns {Object} Vedic yogas analysis
   */
  async analyzeVedicYogas(birthData) {
    return this._delegateToCalculator('vedicYogasCalculator', 'analyzeVedicYogas', birthData);
  }

  // ============================================================================
  // COMPREHENSIVE ANALYSIS
  // ============================================================================

  /**
   * Generate comprehensive Vedic analysis
   * @param {Object} birthData - Birth data object
   * @returns {Object} Comprehensive analysis
   */
  async generateComprehensiveVedicAnalysis(birthData) {
    return this._delegateToCalculator('comprehensiveAnalysisCalculator', 'generateComprehensiveVedicAnalysis', birthData);
  }

  // ============================================================================
  // TRANSIT ANALYSIS
  // ============================================================================

  /**
   * Generate transit preview
   * @param {Object} birthData - Birth data
   * @param {number} days - Number of days
   * @returns {Object} Transit preview
   */
  async generateTransitPreview(birthData, days = 3) {
    return this._delegateToCalculator('transitCalculator', 'generateTransitPreview', birthData, days);
  }
}

module.exports = VedicCalculator;