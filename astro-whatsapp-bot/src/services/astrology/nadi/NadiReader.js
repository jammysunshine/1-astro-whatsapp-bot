const logger = require('../../../utils/logger');
const { NadiDataRepository } = require('./NadiDataRepository');
const { NadiCalculator } = require('./NadiCalculator');
const { NadiRemedies } = require('./NadiRemedies');
const { NadiCompatibility } = require('./NadiCompatibility');
const { NadiFormatter } = require('./NadiFormatter');

/**
 * NadiReader - Ultra-Lean Orchestrator
 * Pure coordination between specialized astrology modules
 */
class NadiReader {
  constructor() {
    this.logger = logger;
    // Initialize all expert modules
    this.dataRepo = new NadiDataRepository();
    this.calculator = new NadiCalculator();
    this.remedies = new NadiRemedies();
    this.compatibility = new NadiCompatibility();
    this.formatter = new NadiFormatter();
  }

  /**
   * Orchestrate complete Nadi astrology analysis
   * @param {string} birthDate
   * @param {string} birthTime
   * @param {string} birthPlace
   * @returns {Object} Complete coordinated analysis
   */
  calculateNadiReading(birthDate, birthTime, birthPlace) {
    try {
      // 1. Delegate calculations to math specialist
      const reading = this.calculator.calculateNadiReading({ birthDate, birthTime, birthPlace });

      // 2. Add healing recommendations from remedy specialist
      reading.remedies = this.remedies.generateCompleteRemedies(reading.birthNakshatra, reading.nadiSystem);

      // 3. Add relationship insights from compatibility expert
      reading.compatibility = this.compatibility.generateCompatibilityInsights(reading.birthNakshatra);

      return reading;
    } catch (error) {
      this.logger.error('Nadi coordination error:', error);
      return { error: 'Coordinator unable to assemble reading' };
    }
  }

  /**
   * Assemble user-ready Nadi astrology response
   * @param {Object} user
   * @returns {Object} Formatted final response
   */
  generateNadiReading(user) {
    try {
      if (!user.birthDate) {
        return this.formatter.formatBirthDataRequiredError();
      }

      const reading = this.calculateNadiReading(
        user.birthDate,
        user.birthTime || '12:00',
        user.birthPlace || 'Unknown'
      );

      return this.formatter.formatNadiReadingResponse(user, reading);
    } catch (error) {
      this.logger.error('Nadi assembly error:', error);
      return this.formatter.formatErrorResponse('Assembly failed');
    }
  }
}

// Export singleton instance for legacy compatibility
module.exports = new NadiReader();
module.exports.generateNadiReading = user => module.exports.generateNadiReading(user);
