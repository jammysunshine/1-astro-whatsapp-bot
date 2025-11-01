const ServiceTemplate = require('./ServiceTemplate');
const logger = require('../../utils/logger');
const { BirthData } = require('../../models/BirthData');

/**
 * CelticAstrologyService - Service for Celtic tree astrology analysis
 *
 * Provides insights into personality traits, life path, and spiritual connections
 * based on the Celtic tree calendar and associated animal totems.
 */
class CelticAstrologyService extends ServiceTemplate {
  constructor() {
    super('CelticReader'); // Primary calculator for this service
    this.serviceName = 'CelticAstrologyService';
    this.calculatorPath = './calculators/celticReader';
    logger.info('CelticAstrologyService initialized');
  }

  /**
   * Main calculation method for Celtic Astrology analysis.
   * @param {Object} birthData - User's birth data.
   * @returns {Promise<Object>} Comprehensive Celtic Astrology analysis.
   */
  async processCalculation(birthData) {
    try {
      // Ensure calculator is loaded
      if (!this.calculator) {
        await this.initialize();
      }

      this._validateInput(birthData);

      // Perform Celtic astrology analysis using the dynamically loaded calculator
      const celticAnalysis = await this.calculator.analyzeBirthData(birthData);

      // Generate additional insights
      const treeSignTraits = this._getTreeSignTraits(celticAnalysis.treeSign);
      const animalTotemInsights = this._getAnimalTotemInsights(
        celticAnalysis.animalTotem
      );
      const spiritualConnections = this._getSpiritualConnections(
        celticAnalysis.treeSign,
        celticAnalysis.animalTotem
      );

      return {
        celticAnalysis,
        treeSignTraits,
        animalTotemInsights,
        spiritualConnections,
        summary: this._createComprehensiveSummary(
          celticAnalysis,
          treeSignTraits
        )
      };
    } catch (error) {
      logger.error('CelticAstrologyService processCalculation error:', error);
      throw new Error(`Celtic Astrology analysis failed: ${error.message}`);
    }
  }

  /**
   * Validates input data for Celtic Astrology analysis.
   * @param {Object} birthData - Birth data to validate.
   * @private
   */
  _validateInput(birthData) {
    if (!birthData) {
      throw new Error('Birth data is required for Celtic Astrology analysis.');
    }
    const validatedData = new BirthData(birthData);
    validatedData.validate();
  }

  /**
   * Formats the Celtic Astrology analysis result for consistent output.
   * @param {Object} result - Raw Celtic Astrology analysis result.
   * @returns {Object} Formatted result.
   */
  formatResult(result) {
    if (result.error) {
      return {
        success: false,
        error: result.error,
        message: 'Celtic Astrology analysis failed',
        service: this.serviceName
      };
    }

    return {
      success: true,
      data: result,
      summary: result.summary || 'Celtic Astrology analysis completed',
      metadata: {
        serviceName: this.serviceName,
        calculationType: 'Celtic Astrology Analysis',
        timestamp: new Date().toISOString()
      },
      disclaimer:
        'Celtic Astrology offers insights into personality and spiritual connections based on ancient Celtic traditions. It is a tool for self-discovery and understanding your natural inclinations. Interpretations should be used for personal reflection and guidance.'
    };
  }

  /**
   * Gets traits associated with the Celtic tree sign.
   * @param {string} treeSign - Celtic tree sign.
   * @returns {Object} Tree sign traits.
   * @private
   */
  _getTreeSignTraits(treeSign) {
    const traits = {
      Apple: 'Love, generosity, charm, and a joyful spirit.',
      Fir: 'Dignity, mystery, artistic taste, and a love for beauty.',
      Elm: 'Noble-minded, good taste, leadership, and a protective nature.',
      Cypress:
        'Strength, adaptability, loyalty, and a deep connection to nature.',
      Poplar: 'Uncertainty, courage, resilience, and a need for security.',
      Cedar: 'Confidence, strength, protection, and a love for luxury.',
      Pine: 'Discipline, organization, aesthetic appreciation, and a love for peace.',
      Willow:
        'Melancholy, intuition, creativity, and a deep understanding of cycles.',
      Oak: 'Courage, strength, independence, and a protective nature.',
      Hazel: 'Intelligence, charm, organization, and a love for knowledge.',
      Rowan:
        'Sensitivity, intuition, protection, and a strong spiritual connection.',
      Maple:
        'Independence, creativity, originality, and a love for new experiences.',
      Walnut: 'Passion, intensity, strategy, and a strong sense of justice.',
      Chestnut: 'Honesty, courage, justice, and a strong sense of family.',
      Ash: 'Ambition, intelligence, generosity, and a love for freedom.',
      Hornbeam:
        'Good taste, discipline, responsibility, and a strong sense of duty.',
      Fig: 'Sensitivity, intuition, creativity, and a love for family.',
      Birch: 'Inspiration, new beginnings, purity, and a love for nature.',
      Olive: 'Peace, wisdom, balance, and a love for justice.',
      Beech: 'Creativity, independence, originality, and a love for knowledge.'
    };
    return traits[treeSign] || 'Unique personality traits';
  }

  /**
   * Gets insights associated with the animal totem.
   * @param {string} animalTotem - Animal totem.
   * @returns {Object} Animal totem insights.
   * @private
   */
  _getAnimalTotemInsights(animalTotem) {
    const insights = {
      Hawk: 'Focus, clarity, vision, and a strong sense of purpose.',
      Salmon:
        'Wisdom, inspiration, rebirth, and a deep connection to ancient knowledge.',
      Otter: 'Playfulness, curiosity, joy, and a strong sense of community.',
      Bear: 'Strength, introspection, healing, and a deep connection to the earth.',
      Snake:
        'Transformation, healing, wisdom, and a deep connection to the spiritual realm.',
      Owl: 'Wisdom, intuition, mystery, and a deep understanding of the unseen.',
      Wolf: 'Loyalty, intuition, freedom, and a strong sense of family.',
      Deer: 'Gentleness, grace, intuition, and a deep connection to nature.',
      Cat: 'Independence, mystery, intuition, and a strong sense of self.',
      Horse: 'Freedom, power, movement, and a strong sense of adventure.',
      Eagle:
        'Vision, courage, spiritual connection, and a strong sense of purpose.',
      Raven:
        'Mystery, magic, transformation, and a deep connection to the spiritual realm.'
    };
    return insights[animalTotem] || 'Unique animal totem insights';
  }

  /**
   * Gets spiritual connections based on tree sign and animal totem.
   * @param {string} treeSign - Celtic tree sign.
   * @param {string} animalTotem - Animal totem.
   * @returns {Array} Spiritual connections.
   * @private
   */
  _getSpiritualConnections(treeSign, animalTotem) {
    const connections = [
      `Deep connection to the wisdom of ${treeSign} and its associated energies.`,
      `Guidance and protection from the spirit of the ${animalTotem}.`,
      'Strong intuition and connection to nature spirits.',
      'A path of spiritual growth through self-discovery and ancient wisdom.'
    ];
    return connections;
  }

  /**
   * Creates a comprehensive summary of the Celtic Astrology analysis.
   * @param {Object} celticAnalysis - Raw analysis from calculator.
   * @param {Object} treeSignTraits - Tree sign traits.
   * @returns {string} Comprehensive summary text.
   * @private
   */
  _createComprehensiveSummary(celticAnalysis, treeSignTraits) {
    let summary = `Your Celtic Tree Sign is ${celticAnalysis.treeSign}, which suggests ${treeSignTraits.toLowerCase()}. `;
    summary += `Your Animal Totem is the ${celticAnalysis.animalTotem}, guiding you with its unique energies. `;
    summary +=
      'This analysis provides a deeper understanding of your innate strengths, challenges, and spiritual path according to ancient Celtic wisdom.';
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
      category: 'celtic',
      methods: [
        'processCalculation',
        'getTreeSignAnalysis',
        'getAnimalTotemAnalysis',
        'getSpiritualConnections'
      ],
      dependencies: [], // Managed by ServiceTemplate
      description:
        'Service for Celtic tree astrology analysis and spiritual insights.'
    };
  }

  /**
   * Returns help information for the service.
   * @returns {string} Help text.
   */
  getHelp() {
    return `
🌳 **Celtic Astrology Service - Ancient Wisdom for Modern Souls**

**Purpose:** Provides insights into personality traits, life path, and spiritual connections based on the Celtic tree calendar and associated animal totems.

**Required Inputs:**
• Birth data (Object with birthDate, birthTime, birthPlace)

**Analysis Includes:**
• **Celtic Tree Sign:** Your primary tree sign based on your birth date.
• **Animal Totem:** Your guiding animal spirit.
• **Personality Traits:** Detailed interpretations of your tree sign's influence on your character.
• **Life Path Insights:** Understanding your natural inclinations and destiny.
• **Spiritual Connections:** Insights into your spiritual gifts and connection to nature.
• **Comprehensive Summary:** An overall interpretation of your Celtic astrological profile.

**Example Usage:**
"Analyze my Celtic astrology for birth date 1990-06-15T06:45:00.000Z in New Delhi."
"What is my Celtic tree sign and animal totem?"

**Output Format:**
Detailed report with Celtic astrological insights, tree sign traits, animal totem analysis, and spiritual guidance.
    `.trim();
  }
}

module.exports = CelticAstrologyService;
