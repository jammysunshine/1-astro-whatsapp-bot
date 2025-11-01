const ServiceTemplate = require('./ServiceTemplate');
const logger = require('../../utils/logger');
const { BirthData } = require('../../models');

/**
 * ChineseAstrologyService - Service for Chinese astrology analysis
 *
 * Provides insights into an individual's personality, destiny, and compatibility
 * based on their Chinese zodiac animal, element, and associated principles.
 */
class ChineseAstrologyService extends ServiceTemplate {
  constructor() {
    super('ChineseCalculator'); // Primary calculator for this service
    this.serviceName = 'ChineseAstrologyService';
    this.calculatorPath = '../calculators/ChineseCalculator';
    logger.info('ChineseAstrologyService initialized');
  }

  /**
   * Main calculation method for Chinese Astrology analysis.
   * @param {Object} birthData - User's birth data.
   * @returns {Promise<Object>} Comprehensive Chinese Astrology analysis.
   */
  async processCalculation(birthData) {
    try {
      // Ensure calculator is loaded
      if (!this.calculator) {
        await this.initialize();
      }

      this._validateInput(birthData);

      // Perform Chinese astrology analysis using the dynamically loaded calculator
      const chineseAnalysis = await this.calculator.analyzeBirthData(birthData);

      // Generate additional insights
      const zodiacTraits = this._getZodiacTraits(chineseAnalysis.zodiacAnimal);
      const elementInfluence = this._getElementInfluence(
        chineseAnalysis.element
      );
      const compatibility = this._getCompatibilityInsights(
        chineseAnalysis.zodiacAnimal
      );

      return {
        chineseAnalysis,
        zodiacTraits,
        elementInfluence,
        compatibility,
        summary: this._createComprehensiveSummary(
          chineseAnalysis,
          zodiacTraits
        )
      };
    } catch (error) {
      logger.error('ChineseAstrologyService processCalculation error:', error);
      throw new Error(`Chinese Astrology analysis failed: ${error.message}`);
    }
  }

  /**
   * Validates input data for Chinese Astrology analysis.
   * @param {Object} birthData - Birth data to validate.
   * @private
   */
  _validateInput(birthData) {
    if (!birthData) {
      throw new Error('Birth data is required for Chinese Astrology analysis.');
    }
    const validatedData = new BirthData(birthData);
    validatedData.validate();
  }

  /**
   * Formats the Chinese Astrology analysis result for consistent output.
   * @param {Object} result - Raw Chinese Astrology analysis result.
   * @returns {Object} Formatted result.
   */
  formatResult(result) {
    if (result.error) {
      return {
        success: false,
        error: result.error,
        message: 'Chinese Astrology analysis failed',
        service: this.serviceName
      };
    }

    return {
      success: true,
      data: result,
      summary: result.summary || 'Chinese Astrology analysis completed',
      metadata: {
        serviceName: this.serviceName,
        calculationType: 'Chinese Astrology Analysis',
        timestamp: new Date().toISOString()
      },
      disclaimer:
        'Chinese Astrology provides insights into personality and destiny based on traditional Chinese zodiac and elemental cycles. It is a tool for self-understanding and understanding interpersonal dynamics, not a definitive prediction of the future. Interpretations should be used for personal reflection and guidance.'
    };
  }

  /**
   * Gets traits associated with the Chinese zodiac animal.
   * @param {string} zodiacAnimal - Chinese zodiac animal.
   * @returns {Object} Zodiac animal traits.
   * @private
   */
  _getZodiacTraits(zodiacAnimal) {
    const traits = {
      Rat: 'Quick-witted, resourceful, charming, and ambitious.',
      Ox: 'Diligent, dependable, strong, and determined.',
      Tiger: 'Brave, confident, competitive, and natural leaders.',
      Rabbit: 'Gentle, quiet, elegant, and compassionate.',
      Dragon: 'Charismatic, intelligent, confident, and powerful.',
      Snake: 'Intelligent, wise, mysterious, and elegant.',
      Horse: 'Energetic, active, intelligent, and independent.',
      Goat: 'Gentle, calm, sympathetic, and creative.',
      Monkey: 'Sharp, clever, curious, and playful.',
      Rooster: 'Observant, hardworking, courageous, and confident.',
      Dog: 'Loyal, honest, cautious, and kind.',
      Pig: 'Compassionate, generous, diligent, and honest.'
    };
    return traits[zodiacAnimal] || 'Unique personality traits';
  }

  /**
   * Gets influence of the birth element.
   * @param {string} element - Birth element (Wood, Fire, Earth, Metal, Water).
   * @returns {Object} Element influence.
   * @private
   */
  _getElementInfluence(element) {
    const influences = {
      Wood: 'Creative, adaptable, persistent, and generous.',
      Fire: 'Dynamic, passionate, innovative, and impulsive.',
      Earth: 'Practical, stable, patient, and reliable.',
      Metal: 'Strong, decisive, disciplined, and ambitious.',
      Water: 'Sensitive, intuitive, compassionate, and adaptable.'
    };
    return influences[element] || 'Unique elemental influence';
  }

  /**
   * Gets compatibility insights for the Chinese zodiac animal.
   * @param {string} zodiacAnimal - Chinese zodiac animal.
   * @returns {Object} Compatibility insights.
   * @private
   */
  _getCompatibilityInsights(zodiacAnimal) {
    const compatibility = {
      Rat: {
        bestMatch: ['Dragon', 'Monkey', 'Ox'],
        worstMatch: ['Horse', 'Rabbit', 'Rooster']
      },
      Ox: {
        bestMatch: ['Rat', 'Snake', 'Rooster'],
        worstMatch: ['Goat', 'Horse', 'Dog']
      },
      Tiger: {
        bestMatch: ['Horse', 'Dog', 'Dragon'],
        worstMatch: ['Monkey', 'Snake']
      },
      Rabbit: {
        bestMatch: ['Goat', 'Pig', 'Dog'],
        worstMatch: ['Rooster', 'Dragon', 'Rat']
      },
      Dragon: {
        bestMatch: ['Rat', 'Monkey', 'Rooster'],
        worstMatch: ['Ox', 'Rabbit', 'Dog']
      },
      Snake: {
        bestMatch: ['Ox', 'Rooster', 'Dragon'],
        worstMatch: ['Tiger', 'Pig']
      },
      Horse: {
        bestMatch: ['Tiger', 'Goat', 'Dog'],
        worstMatch: ['Rat', 'Ox', 'Rabbit']
      },
      Goat: {
        bestMatch: ['Rabbit', 'Pig', 'Horse'],
        worstMatch: ['Ox', 'Dog', 'Tiger']
      },
      Monkey: {
        bestMatch: ['Rat', 'Dragon', 'Snake'],
        worstMatch: ['Tiger', 'Pig']
      },
      Rooster: {
        bestMatch: ['Ox', 'Snake', 'Dragon'],
        worstMatch: ['Rabbit', 'Rat', 'Dog']
      },
      Dog: {
        bestMatch: ['Tiger', 'Rabbit', 'Horse'],
        worstMatch: ['Ox', 'Dragon', 'Rooster']
      },
      Pig: {
        bestMatch: ['Rabbit', 'Goat', 'Tiger'],
        worstMatch: ['Snake', 'Monkey']
      }
    };
    return compatibility[zodiacAnimal] || { bestMatch: [], worstMatch: [] };
  }

  /**
   * Creates a comprehensive summary of the Chinese Astrology analysis.
   * @param {Object} chineseAnalysis - Raw analysis from calculator.
   * @param {Object} zodiacTraits - Zodiac animal traits.
   * @returns {string} Comprehensive summary text.
   * @private
   */
  _createComprehensiveSummary(chineseAnalysis, zodiacTraits) {
    let summary = `Your Chinese Zodiac Animal is the ${chineseAnalysis.zodiacAnimal}, and your governing element is ${chineseAnalysis.element}. `;
    summary += `You are known for being ${zodiacTraits.toLowerCase().replace(/\.$/, '')} due to your animal sign. `;
    summary += `The influence of the ${chineseAnalysis.element} element further shapes your personality, making you more ${this._getElementInfluence(chineseAnalysis.element).toLowerCase().replace(/\.$/, '')}. `;
    summary +=
      'This analysis provides a deeper understanding of your innate strengths, challenges, and compatibility according to traditional Chinese wisdom.';
    return summary;
  }

  /**
   * Returns metadata for the service.
   * @returns {Object} Service metadata.
   */
  getMetadata() {
    return {
      name: this.serviceName,
      version: '1.0.0',
      category: 'chinese',
      methods: [
        'processCalculation',
        'getZodiacAnimalAnalysis',
        'getElementInfluenceAnalysis',
        'getCompatibilityAnalysis'
      ],
      dependencies: [], // Managed by ServiceTemplate
      description: 'Service for Chinese astrology analysis and insights.'
    };
  }

  /**
   * Returns help information for the service.
   * @returns {string} Help text.
   */
  getHelp() {
    return `
🐲 **Chinese Astrology Service - Your Zodiac & Elemental Blueprint**

**Purpose:** Provides insights into an individual's personality, destiny, and compatibility based on their Chinese zodiac animal, element, and associated principles.

**Required Inputs:**
• Birth data (Object with birthDate, birthTime, birthPlace)

**Analysis Includes:**
• **Chinese Zodiac Animal:** Your animal sign based on your birth year.
• **Governing Element:** The elemental influence on your personality (Wood, Fire, Earth, Metal, Water).
• **Personality Traits:** Detailed interpretations of your zodiac animal's influence on your character.
• **Elemental Influence:** How your element shapes your core characteristics.
• **Compatibility:** Insights into compatibility with other zodiac animals.
• **Comprehensive Summary:** An overall interpretation of your Chinese astrological profile.

**Example Usage:**
"Analyze my Chinese astrology for birth date 1990-06-15T06:45:00.000Z in New Delhi."
"What is my Chinese zodiac animal and element, and what do they mean?"

**Output Format:**
Detailed report with Chinese astrological insights, zodiac animal traits, elemental influence, and compatibility analysis.
    `.trim();
  }
}

module.exports = ChineseAstrologyService;
