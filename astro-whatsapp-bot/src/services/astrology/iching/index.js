const logger = require('../../../utils/logger');
const { IChingConfig } = require('./IChingConfig');
const { IChingCalculator } = require('./IChingCalculator');
const { IChingInterpreter } = require('./IChingInterpreter');

/**
 * IChing Service - Main orchestrator for all I Ching functionality
 * Provides unified interface for traditional Chinese divination system
 */
class IChingService {
  constructor() {
    // Initialize core components
    this.config = new IChingConfig();
    this.calculator = new IChingCalculator(this.config);
    this.interpreter = new IChingInterpreter(this.config, this.calculator);

    logger.info(
      'Module: IChingService initialized - Complete I Ching divination system'
    );
  }

  /**
   * Generate complete I Ching reading with hexagram and interpretation
   * @param {string} question - User's question (optional)
   * @returns {Object} Complete I Ching reading
   */
  async performIChingReading(question = '') {
    return await this.interpreter.generateIChingReading(question);
  }

  /**
   * Generate daily I Ching guidance and wisdom
   * @param {string} focus - Daily focus or question
   * @returns {Object} Daily guidance
   */
  async getDailyGuidance(focus = 'daily wisdom') {
    return await this.interpreter.generateDailyGuidance(focus);
  }

  /**
   * Analyze hexagram for specific question types (career, love, health, finances)
   * @param {Object} reading - Complete I Ching reading
   * @param {string} questionType - Type of question
   * @returns {Object} Specialized interpretation
   */
  analyzeForQuestionType(reading, questionType) {
    return this.interpreter.analyzeForQuestionType(reading, questionType);
  }

  /**
   * Generate hexagram manually (for testing or specific cases)
   * @returns {Object} Generated hexagram
   */
  generateHexagram() {
    return this.calculator.generateHexagram();
  }

  /**
   * Create hexagram from specific line values
   * @param {Array} lineValues - Array of 6 line values
   * @returns {Object} Created hexagram
   */
  createHexagramFromLines(lineValues) {
    return this.calculator.createHexagramFromLines(lineValues);
  }

  /**
   * Get hexagram data by number
   * @param {number} hexagramNumber - Hexagram number (1-64)
   * @returns {Object} Hexagram data
   */
  getHexagramData(hexagramNumber) {
    return this.config.getHexagram(hexagramNumber);
  }

  /**
   * Get trigram data by number
   * @param {number} trigramNumber - Trigram number (0-7)
   * @returns {Object} Trigram data
   */
  getTrigramData(trigramNumber) {
    return this.config.getTrigram(trigramNumber);
  }

  /**
   * Calculate represented hexagram (inverse of primary)
   * @param {Object} hexagram - Primary hexagram data
   * @returns {Object} Relating hexagram data
   */
  calculateRelatingHexagram(hexagram) {
    return this.calculator.calculateRelatingHexagram(hexagram);
  }

  /**
   * Calculate nuclear hexagram (inner trigrams)
   * @param {Object} hexagram - Primary hexagram data
   * @returns {Object} Nuclear hexagram data
   */
  calculateNuclearHexagram(hexagram) {
    return this.calculator.calculateNuclearHexagram(hexagram);
  }

  /**
   * Transform hexagram based on changing lines
   * @param {Object} primaryHexagram - Primary hexagram
   * @param {Array} changingLines - Changing line positions
   * @returns {Object} Transformed hexagram
   */
  transformHexagram(primaryHexagram, changingLines) {
    return this.calculator.transformHexagram(primaryHexagram, changingLines);
  }

  /**
   * Get I Ching knowledge base statistics
   * @returns {Object} I Ching database information
   */
  getIChingCatalog() {
    return {
      trigramCount: Object.keys(this.config.getAllTrigrams()).length,
      hexagramCount: Object.keys(this.config.getAllHexagrams()).length,
      capabilities: [
        'Hexagram Generation',
        'Line Transformations',
        'Traditional Interpretations',
        'Question-Specific Analysis',
        'Daily Guidance',
        'Nuclear & Relating Hexagrams'
      ],
      description:
        'Complete traditional I Ching divination system with authentic Wilhelm/Baynes translations and modern interpretation capabilities'
    };
  }

  /**
   * Comprehensive health check for all I Ching modules
   * @returns {Object} Health status for entire I Ching system
   */
  healthCheck() {
    try {
      const configHealth = this.config.healthCheck();
      const calculatorHealth = this.calculator.healthCheck();
      const interpreterHealth = this.interpreter.healthCheck();

      // System-wide tests
      const catalog = this.getIChingCatalog();
      const validCatalog =
        catalog.trigramCount === 8 && catalog.hexagramCount === 64;

      return {
        system: {
          healthy:
            configHealth.healthy &&
            calculatorHealth.healthy &&
            interpreterHealth.healthy &&
            validCatalog,
          version: '1.0.0',
          name: 'Complete I Ching Divination System',
          modules: 3,
          databaseComplete: validCatalog
        },
        config: configHealth,
        calculator: calculatorHealth,
        interpreter: interpreterHealth,
        status:
          configHealth.healthy &&
          calculatorHealth.healthy &&
          interpreterHealth.healthy ?
            'Fully Operational' :
            'Issues Detected',
        capabilities: catalog.capabilities
      };
    } catch (error) {
      logger.error('IChingService health check failed:', error);
      return {
        healthy: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Create singleton instance
let ichingServiceInstance = null;

async function createIChingService() {
  if (!ichingServiceInstance) {
    ichingServiceInstance = new IChingService();
  }
  return ichingServiceInstance;
}

// Export both class and factory function
module.exports = {
  IChingService,
  createIChingService,
  // For backward compatibility and direct access
  async performIChingReading(question) {
    const service = await createIChingService();
    return await service.performIChingReading(question);
  },
  async getDailyGuidance(focus) {
    const service = await createIChingService();
    return await service.getDailyGuidance(focus);
  }
};
