const { CelticDataProvider } = require('./CelticDataProvider');
const { CelticCalculator } = require('./CelticCalculator');
const { CelticAnalyzer } = require('./CelticAnalyzer');

class CelticReader {
  constructor() {
    this.dataProvider = new CelticDataProvider();
    this.calculator = new CelticCalculator(this.dataProvider);
    this.analyzer = new CelticAnalyzer();
  }

  /**
   * Generate Celtic birth chart analysis
   * @param {Object} birthData - Birth data object
   * @returns {Object} Celtic analysis
   */
  generateCelticChart(birthData) {
    try {
      const { birthDate, birthTime, name } = birthData;

      // Calculate tree sign
      const treeSign = this.calculator.calculateTreeSign(birthDate);

      // Calculate animal totem
      const animalTotem = this.calculator.calculateAnimalTotem(birthDate);

      // Calculate seasonal influence
      const seasonalInfluence = this.calculator.calculateSeasonalInfluence(birthDate);

      // Generate druidic wisdom
      const druidicWisdom = this.analyzer.generateDruidicWisdom(treeSign, animalTotem);

      // Calculate life path
      const lifePath = this.analyzer.calculateLifePath(treeSign, animalTotem);

      // Generate personality traits
      const personalityTraits = this.analyzer.generatePersonalityTraits(
        treeSign,
        animalTotem
      );

      return {
        name,
        treeSign,
        animalTotem,
        seasonalInfluence,
        druidicWisdom,
        lifePath,
        personalityTraits,
        celticDescription: this.analyzer.generateCelticDescription(
          treeSign,
          animalTotem,
          seasonalInfluence
        )
      };
    } catch (error) {
      console.error('Error generating Celtic chart:', error);
      return {
        error: 'Unable to generate Celtic analysis at this time',
        fallback: 'The Celtic wisdom of trees and animals guides your path'
      };
    }
  }

  /**
   * Generate Celtic daily guidance
   * @param {string} birthDate - Birth date
   * @returns {Object} Daily guidance
   */
  generateCelticGuidance(birthDate) {
    try {
      const treeSign = this.calculator.calculateTreeSign(birthDate);
      const animalTotem = this.calculator.calculateAnimalTotem(birthDate);

      return this.analyzer.generateCelticGuidance(treeSign, animalTotem);
    } catch (error) {
      console.error('Error generating Celtic guidance:', error);
      return {
        treeGuidance: 'Connect with ancient tree wisdom',
        animalGuidance: 'Seek guidance from animal spirits',
        dailyRitual: 'Meditate in nature',
        seasonalWisdom: 'Flow with the wheel of the year',
        affirmation: 'I am connected to Celtic wisdom and natural magic'
      };
    }
  }
}

module.exports = new CelticReader();