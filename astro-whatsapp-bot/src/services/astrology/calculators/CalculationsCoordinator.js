const logger = require('../../../utils/logger');
const { JaiminiKarakaCalculator } = require('./JaiminiKarakaCalculator');
const { AshtakavargaCalculator } = require('./AshtakavargaCalculator');
const { FixedStarsCalculator } = require('./FixedStarsCalculator');
const {
  FinancialAstrologyCalculator
} = require('./FinancialAstrologyCalculator');
const { MedicalAstrologyCalculator } = require('./MedicalAstrologyCalculator');
const { CareerAstrologyCalculator } = require('./CareerAstrologyCalculator');

/**
 * CalculationsCoordinator - Main orchestrator for all Vedic calculation modules
 * Delegates to specialized calculators based on type of calculation needed
 * Replaces the monolithic calculations.js file with modular architecture
 */
class CalculationsCoordinator {
  constructor() {
    logger.info(
      'Module: CalculationsCoordinator loaded - Modular calculation orchestration'
    );

    // Initialize specialized calculator modules
    this.jaiminiKarakaCalculator = new JaiminiKarakaCalculator();
    this.ashtakavargaCalculator = new AshtakavargaCalculator();
    this.fixedStarsCalculator = new FixedStarsCalculator();
    this.financialAstrologyCalculator = new FinancialAstrologyCalculator();
    this.medicalAstrologyCalculator = new MedicalAstrologyCalculator();
    this.careerAstrologyCalculator = new CareerAstrologyCalculator();
  }

  setServices(calendricalService, geocodingService) {
    // Pass services down to specialized calculators
    this.jaiminiKarakaCalculator.setServices(
      calendricalService,
      geocodingService
    );
    this.ashtakavargaCalculator.setServices(
      calendricalService,
      geocodingService
    );
    this.fixedStarsCalculator.setServices(calendricalService, geocodingService);
    this.financialAstrologyCalculator.setServices(
      calendricalService,
      geocodingService
    );
    this.medicalAstrologyCalculator.setServices(
      calendricalService,
      geocodingService
    );
    this.careerAstrologyCalculator.setServices(
      calendricalService,
      geocodingService
    );
  }

  /**
   * Calculate Jaimini Karaka analysis - delegated to JaiminiKarakaCalculator
   * @param {Object} user - Birth data and user info
   * @returns {Object} Jaimini Karaka analysis
   */
  async calculateJaiminiKarakaAnalysis(user) {
    logger.info(
      'Delegating Jaimini Karaka calculation to JaiminiKarakaCalculator'
    );

    // Convert user data to birthData format
    const birthData = {
      birthDate: user.birthDate,
      birthTime: user.birthTime,
      birthPlace: user.birthPlace,
      timezone: user.timezone,
      name: user.name
    };

    return await this.jaiminiKarakaCalculator.calculateJaiminiKarakaAnalysis(
      birthData
    );
  }

  /**
   * Calculate Ashtakavarga - delegated to AshtakavargaCalculator
   * @param {Object} user - Birth data and user info
   * @returns {Object} Ashtakavarga analysis
   */
  async calculateAshtakavarga(user) {
    logger.info(
      'Delegating Ashtakavarga calculation to AshtakavargaCalculator'
    );

    const birthData = {
      birthDate: user.birthDate,
      birthTime: user.birthTime,
      birthPlace: user.birthPlace,
      timezone: user.timezone,
      name: user.name
    };

    return await this.ashtakavargaCalculator.calculateAshtakavarga(birthData);
  }

  /**
   * Calculate Fixed Stars analysis - delegated to FixedStarsCalculator
   * @param {Object} user - Birth data and user info
   * @returns {Object} Fixed Stars analysis
   */
  async calculateFixedStarsAnalysis(user) {
    logger.info('Delegating Fixed Stars calculation to FixedStarsCalculator');

    const birthData = {
      birthDate: user.birthDate,
      birthTime: user.birthTime,
      birthPlace: user.birthPlace,
      timezone: user.timezone,
      name: user.name
    };

    return await this.fixedStarsCalculator.calculateFixedStarsAnalysis(
      birthData
    );
  }

  /**
   * Calculate financial astrology analysis - delegated to FinancialAstrologyCalculator
   * @param {Object} user - Birth data and user info
   * @returns {Object} Financial astrology analysis
   */
  async calculateFinancialAstrologyAnalysis(user) {
    logger.info(
      'Delegating Financial Astrology calculation to FinancialAstrologyCalculator'
    );

    const birthData = {
      birthDate: user.birthDate,
      birthTime: user.birthTime,
      birthPlace: user.birthPlace,
      timezone: user.timezone,
      name: user.name,
      latitude: user.latitude,
      longitude: user.longitude
    };

    return await this.financialAstrologyCalculator.calculateFinancialAstrologyAnalysis(
      birthData
    );
  }

  /**
   * Calculate medical astrology analysis - delegated to MedicalAstrologyCalculator
   * @param {Object} user - Birth data and user info
   * @returns {Object} Medical astrology analysis
   */
  async calculateMedicalAstrologyAnalysis(user) {
    logger.info(
      'Delegating Medical Astrology calculation to MedicalAstrologyCalculator'
    );

    const birthData = {
      birthDate: user.birthDate,
      birthTime: user.birthTime,
      birthPlace: user.birthPlace,
      timezone: user.timezone,
      name: user.name,
      latitude: user.latitude,
      longitude: user.longitude
    };

    return await this.medicalAstrologyCalculator.calculateMedicalAstrologyAnalysis(
      birthData
    );
  }

  /**
   * Calculate career astrology analysis - delegated to CareerAstrologyCalculator
   * @param {Object} user - Birth data and user info
   * @returns {Object} Career astrology analysis
   */
  async calculateCareerAstrologyAnalysis(user) {
    logger.info(
      'Delegating Career Astrology calculation to CareerAstrologyCalculator'
    );

    const birthData = {
      birthDate: user.birthDate,
      birthTime: user.birthTime,
      birthPlace: user.birthPlace,
      timezone: user.timezone,
      name: user.name,
      latitude: user.latitude,
      longitude: user.longitude
    };

    return await this.careerAstrologyCalculator.calculateCareerAstrologyAnalysis(
      birthData
    );
  }

  /**
   * Get Age Harmonic Astrology Reader instance
   * @returns {Object} AgeHarmonicAstrologyReader instance
   */
  getAgeHarmonicAstrologyReader() {
    // Return a new instance for backward compatibility
    return new (class AgeHarmonicAstrologyReader {
      constructor() {}

      async generateAgeHarmonicAnalysis(birthData) {
        // Mock implementation for backward compatibility
        const age = this.calculateAge(birthData.birthDate || '01/01/1990');
        const currentHarmonics = this.getHarmonicsForAge(age);

        return {
          interpretation: `Age ${age}: ${currentHarmonics[0]?.themes.join(', ') || 'development and growth'}.`,
          currentHarmonics,
          techniques: [
            'Meditation',
            'Journaling',
            'Creative expression',
            'Nature immersion'
          ],
          nextHarmonic: {
            name: `Harmonic ${currentHarmonics[0]?.harmonic + 1 || 8}`,
            ageRange: `${age + 2}-${age + 4}`,
            themes: ['Integration', 'Mastery']
          },
          error: false
        };
      }

      calculateAge(birthDate) {
        return 32; // Mock age
      }

      getHarmonicsForAge(age) {
        return [
          {
            name: `Harmonic ${Math.floor(age / 4) + 1}`,
            harmonic: Math.floor(age / 4) + 1,
            themes: ['Growth', 'Learning', 'Transformation']
          }
        ];
      }
    })();
  }

  /**
   * Get zodiac sign from longitude (utility function)
   * @param {number} longitude - Longitude in degrees
   * @returns {string} Zodiac sign name
   */
  getSignFromLongitude(longitude) {
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
    const angle = (longitude - ascendant + 360) % 360;
    return Math.floor(angle / 30) + 1;
  }

  /**
   * Health check for all calculation modules
   * @returns {Object} Comprehensive health status
   */
  healthCheck() {
    try {
      const jaiminiHealth = this.jaiminiKarakaCalculator.healthCheck();
      const ashtakavargaHealth = this.ashtakavargaCalculator.healthCheck();
      const fixedStarsHealth = this.fixedStarsCalculator.healthCheck();
      const financialHealth = this.financialAstrologyCalculator.healthCheck();
      const medicalHealth = this.medicalAstrologyCalculator.healthCheck();
      const careerHealth = this.careerAstrologyCalculator.healthCheck();

      return {
        coordinator: {
          healthy: true,
          version: '2.0.0',
          modules: 6
        },
        calculators: {
          jaiminiKarakaCalculator: jaiminiHealth,
          ashtakavargaCalculator: ashtakavargaHealth,
          fixedStarsCalculator: fixedStarsHealth,
          financialAstrologyCalculator: financialHealth,
          medicalAstrologyCalculator: medicalHealth,
          careerAstrologyCalculator: careerHealth
        },
        overall: {
          healthy:
            jaiminiHealth.healthy &&
            ashtakavargaHealth.healthy &&
            fixedStarsHealth.healthy &&
            financialHealth.healthy &&
            medicalHealth.healthy &&
            careerHealth.healthy,
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
      calculator_modules: {
        JaiminiKarakaCalculator: ['Jaimini Karaka Analysis'],
        AshtakavargaCalculator: ['Ashtakavarga Analysis'],
        FixedStarsCalculator: ['Fixed Stars Analysis'],
        FinancialAstrologyCalculator: ['Financial Astrology Analysis'],
        MedicalAstrologyCalculator: ['Medical Astrology Analysis'],
        CareerAstrologyCalculator: ['Career Astrology Analysis']
      },
      utility_functions: [
        'Age Harmonic Astrology',
        'Sign/Longitude Conversions'
      ],
      total_modules: 6,
      total_calculations: 6 + 2, // Calculators + utility
      coordinator: 'CalculationsCoordinator (v2.0.0)',
      architecture: 'Single Calculator Per File (SCPF) - Modular Architecture'
    };
  }
}

// Export both class and factory function pattern
let calculationsCoordinatorInstance = null;

async function createCalculationsCoordinator(
  calendricalService = null,
  geocodingService = null
) {
  if (!calculationsCoordinatorInstance) {
    calculationsCoordinatorInstance = new CalculationsCoordinator();
    if (calendricalService && geocodingService) {
      calculationsCoordinatorInstance.setServices(
        calendricalService,
        geocodingService
      );
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
