const logger = require('../../../utils/logger');
const { VedicChartGenerator } = require('./VedicChartGenerator');
const { WesternChartGenerator } = require('./WesternChartGenerator');

class ChartGenerator {
  constructor(astrologer, geocodingService, vedicCore, signCalculations) {
    this.vedicGenerator = new VedicChartGenerator(astrologer, geocodingService, vedicCore, signCalculations);
    this.westernGenerator = new WesternChartGenerator(astrologer, geocodingService, vedicCore);
    logger.info('ChartGenerator: Clean modular architecture');
  }

  /**
   * Generate basic birth chart (defaults to Vedic)
   * @param {Object} user - User object
   * @returns {Promise<Object>} Birth chart
   */
  async generateBasicBirthChart(user) {
    return this.vedicGenerator.generateVedicBirthChart(user);
  }

  /**
   * Generate Western astrology birth chart
   * @param {Object} user - User object
   * @param {string} houseSystem - House system
   * @returns {Promise<Object>} Western chart
   */
  async generateWesternBirthChart(user, houseSystem = 'P') {
    return this.westernGenerator.generateWesternBirthChart(user, houseSystem);
  }

  /**
   * Generate detailed chart analysis (defaults to Vedic)
   * @param {Object} user - User object
   * @returns {Promise<Object>} Detailed analysis
   */
  async generateDetailedChartAnalysis(user) {
    return this.vedicGenerator.generateVedicDetailedAnalysis(user);
  }
}

module.exports = ChartGenerator;
