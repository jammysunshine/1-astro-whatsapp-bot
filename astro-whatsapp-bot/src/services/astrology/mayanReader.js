const { MayanDataProvider } = require('./MayanDataProvider');
const { MayanCalculator } = require('./MayanCalculator');
const { MayanAnalyzer } = require('./MayanAnalyzer');

class MayanReader {
  constructor() {
    this.dataProvider = new MayanDataProvider();
    this.calculator = new MayanCalculator(this.dataProvider);
    this.analyzer = new MayanAnalyzer();
  }

  /**
   * Generate Mayan birth chart analysis
   * @param {Object} birthData - Birth data object
   * @returns {Object} Mayan analysis
   */
  generateMayanChart(birthData) {
    try {
      const { birthDate, birthTime, name } = birthData;

      // Calculate Tzolk'in date
      const tzolkin = this.calculator.calculateTzolkIn(birthDate);

      // Calculate Haab date
      const haab = this.calculator.calculateHaab(birthDate);

      // Calculate year bearer
      const yearBearer = this.calculator.calculateYearBearer(birthDate);

      // Generate personality analysis
      const personality = this.analyzer.analyzePersonality(tzolkin, haab);

      // Calculate life path
      const lifePath = this.analyzer.calculateLifePath(tzolkin);

      // Generate daily guidance
      const dailyGuidance = this.analyzer.generateDailyGuidance(tzolkin);

      return {
        name,
        tzolkin,
        haab,
        yearBearer,
        personality,
        lifePath,
        dailyGuidance,
        mayanDescription: this.analyzer.generateMayanDescription(
          tzolkin,
          haab,
          yearBearer
        )
      };
    } catch (error) {
      return {
        error: 'Unable to generate Mayan analysis at this time',
        fallback: 'The Mayan calendar holds ancient wisdom for your journey'
      };
    }
  }
}

module.exports = new MayanReader();