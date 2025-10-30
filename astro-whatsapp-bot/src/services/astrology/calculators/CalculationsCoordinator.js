const logger = require('../../../utils/logger');
const { AdvancedCalculator } = require('./AdvancedCalculator');
const { AstrologicalCalculators } = require('./AstrologicalCalculators');

/**
 * CalculationsCoordinator - Main orchestrator for all Vedic calculation modules
 * Delegates to specialized calculators based on type of calculation needed
 * Replaces the monolithic calculations.js file with modular architecture
 */
class CalculationsCoordinator {
  constructor() {
    logger.info('Module: CalculationsCoordinator loaded - Modular calculation orchestration');

    // Initialize specialized calculator modules
    this.advancedCalculator = new AdvancedCalculator();
    this.astrologicalCalculators = new AstrologicalCalculators();
  }

  setServices(calendricalService, geocodingService) {
    // Pass services down to specialized calculators
    this.advancedCalculator.setServices(calendricalService, geocodingService);
    this.astrologicalCalculators.setServices(calendricalService, geocodingService);
  }

  /**
   * Calculate Jaimini Karaka analysis - delegated to AdvancedCalculator
   * @param {Object} user - Birth data and user info
   * @returns {Object} Jaimini Karaka analysis
   */
  async calculateJaiminiKarakaAnalysis(user) {
    logger.info('Delegating Jaimini Karaka calculation to AdvancedCalculator');

    // Convert user data to birthData format
    const birthData = {
      birthDate: user.birthDate,
      birthTime: user.birthTime,
      birthPlace: user.birthPlace,
      timezone: user.timezone,
      name: user.name
    };

    return await this.advancedCalculator.calculateJaiminiKarakaAnalysis(birthData);
  }

  /**
   * Calculate Ashtakavarga - delegated to AdvancedCalculator
   * @param {Object} user - Birth data and user info
   * @returns {Object} Ashtakavarga analysis
   */
  async calculateAshtakavarga(user) {
    logger.info('Delegating Ashtakavarga calculation to AdvancedCalculator');

    const birthData = {
      birthDate: user.birthDate,
      birthTime: user.birthTime,
      birthPlace: user.birthPlace,
      timezone: user.timezone,
      name: user.name
    };

    return await this.advancedCalculator.calculateAshtakavarga(birthData);
  }

  /**
   * Calculate Fixed Stars analysis - delegated to AdvancedCalculator
   * @param {Object} user - Birth data and user info
   * @returns {Object} Fixed Stars analysis
   */
  async calculateFixedStarsAnalysis(user) {
    logger.info('Delegating Fixed Stars calculation to AdvancedCalculator');

    const birthData = {
      birthDate: user.birthDate,
      birthTime: user.birthTime,
      birthPlace: user.birthPlace,
      timezone: user.timezone,
      name: user.name
    };

    return await this.advancedCalculator.calculateFixedStarsAnalysis(birthData);
  }

  /**
   * Calculate financial astrology analysis - delegated to AstrologicalCalculators
   * @param {Object} user - Birth data and user info
   * @returns {Object} Financial astrology analysis
   */
  async calculateFinancialAstrologyAnalysis(user) {
    logger.info('Delegating Financial Astrology calculation to AstrologicalCalculators');

    const birthData = {
      birthDate: user.birthDate,
      birthTime: user.birthTime,
      birthPlace: user.birthPlace,
      timezone: user.timezone,
      name: user.name,
      latitude: user.latitude,
      longitude: user.longitude
    };

    return await this.astrologicalCalculators.calculateFinancialAstrologyAnalysis(birthData);
  }

  /**
   * Calculate medical astrology analysis - delegated to AstrologicalCalculators
   * @param {Object} user - Birth data and user info
   * @returns {Object} Medical astrology analysis
   */
  async calculateMedicalAstrologyAnalysis(user) {
    logger.info('Delegating Medical Astrology calculation to AstrologicalCalculators');

    const birthData = {
      birthDate: user.birthDate,
      birthTime: user.birthTime,
      birthPlace: user.birthPlace,
      timezone: user.timezone,
      name: user.name,
      latitude: user.latitude,
      longitude: user.longitude
    };

    return await this.astrologicalCalculators.calculateMedicalAstrologyAnalysis(birthData);
  }

  /**
   * Calculate career astrology analysis - delegated to AstrologicalCalculators
   * @param {Object} user - Birth data and user info
   * @returns {Object} Career astrology analysis
   */
  async calculateCareerAstrologyAnalysis(user) {
    logger.info('Delegating Career Astrology calculation to AstrologicalCalculators');

    const birthData = {
      birthDate: user.birthDate,
      birthTime: user.birthTime,
      birthPlace: user.birthPlace,
      timezone: user.timezone,
      name: user.name,
      latitude: user.latitude,
      longitude: user.longitude
    };

    return await this.astrologicalCalculators.calculateCareerAstrologyAnalysis(birthData);
  }

  /**
   * Get Age Harmonic Astrology Reader instance
   * @returns {Object} AgeHarmonicAstrologyReader instance
   */
  getAgeHarmonicAstrologyReader() {
    // Return a new instance for backward compatibility
    return new class AgeHarmonicAstrologyReader {
      constructor() {
      }

      async generateAgeHarmonicAnalysis(birthData) {
        // Mock implementation for backward compatibility
        const age = this.calculateAge(birthData.birthDate || '01/01/1990');
        const currentHarmonics = this.getHarmonicsForAge(age);

        return {
          interpretation: `Age ${age}: ${currentHarmonics[0]?.themes.join(', ') || 'development and growth'}.`,
          currentHarmonics: currentHarmonics,
          techniques: ['Meditation', 'Journaling', 'Creative expression', 'Nature immersion'],
          nextHarmonic: { name: `Harmonic ${currentHarmonics[0]?.harmonic + 1 || 8}`, ageRange: `${age + 2}-${age + 4}`, themes: ['Integration', 'Mastery'] },
          error: false
        };
      }

      calculateAge(birthDate) {
        return 32; // Mock age
      }

      getHarmonicsForAge(age) {
        return [{
          name: `Harmonic ${Math.floor(age/4) + 1}`,
          harmonic: Math.floor(age/4) + 1,
          themes: ['Growth', 'Learning', 'Transformation']
        }];
      }
    }();
  }

  /**
   * Get zodiac sign from longitude (utility function)
   * @param {number} longitude - Longitude in degrees
   * @returns {string} Zodiac sign name
   */
  getSignFromLongitude(longitude) {
    const signs = [
      'Aries', 'Taurus', 'Gemini', 'Cancer',
      'Leo', 'Virgo', 'Libra', 'Scorpio',
      'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    const normalized = ((longitude % 360) + 360) % 360;
    const signIndex = Math.floor(normalized / 30);
    return signs[signIndex];
  }

  /**
   * Get house number from longitude and ascendant (utility function)
   * @param {number} longitude - Planet longitude
   * @param {number} ascendant - Ascendant longitude
   * @returns {number} House number (1-12)
   */
  getHouseNumberFromLongitude(longitude, ascendant) {
    const angle = ((longitude - ascendant + 360) % 360);
    return Math.floor(angle / 30) + 1;
  }

  /**
   * Health check for all calculation modules
   * @returns {Object} Comprehensive health status
   */
  healthCheck() {
    try {
      const advancedHealth = this.advancedCalculator.healthCheck();
      const astrologicalHealth = this.astrologicalCalculators.healthCheck();

      return {
        coordinator: {
          healthy: true,
          version: '1.0.0',
          modules: 2
        },
        advancedCalculator: advancedHealth,
        astrologicalCalculators: astrologicalHealth,
        overall: {
          healthy: advancedHealth.healthy && astrologicalHealth.healthy,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      logger.error('CalculationsCoordinator health check failed:', error);
      return {
        healthy: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get calculation statistics
   * @returns {Object} Statistics about available calculations
   */
  getCalculationStats() {
    return {
      advanced_calculations: [
        'Jaimini Karaka Analysis',
        'Ashtakavarga',
        'Fixed Stars Analysis'
      ],
      astrological_calculations: [
        'Financial Astrology',
        'Medical Astrology',
        'Career Astrology'
      ],
      utility_functions: [
        'Age Harmonic Astrology',
        'Sign/Longitude Conversions'
      ],
      total_calculations: 7 + 3, // Main + utility
      modules: 3, // Coordinator + 2 specialized
      architecture: 'Modular with delegation pattern'
    };
  }
}

// Export both class and factory function pattern
let calculationsCoordinatorInstance = null;

async function createCalculationsCoordinator(calendricalService = null, geocodingService = null) {
  if (!calculationsCoordinatorInstance) {
    calculationsCoordinatorInstance = new CalculationsCoordinator();
    if (calendricalService && geocodingService) {
      calculationsCoordinatorInstance.setServices(calendricalService, geocodingService);
    }
  }
  return calculationsCoordinatorInstance;
}

module.exports = {
  CalculationsCoordinator,
  createCalculationsCoordinator,
  // Legacy support
  initialize: createCalculationsCoordinator
};