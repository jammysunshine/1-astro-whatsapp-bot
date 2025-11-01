const logger = require('../../../utils/logger');
const { NadiCompatibility } = require('../../../services/astrology/nadi/NadiCompatibility');

/**
 * NakshatraPoruthamService - Service for traditional Indian marriage compatibility
 * Calculates compatibility between partners based on lunar mansion (nakshatra) matching
 */
class NakshatraPoruthamService {
  constructor() {
    this.calculator = new NadiCompatibility();
    logger.info('NakshatraPoruthamService initialized');
  }

  /**
   * Execute nakshatra porutham analysis for two partners
   * @param {Object} partnerData - Partner birth data
   * @param {string} partnerData.partner1Nakshatra - First partner's nakshatra
   * @param {string} partnerData.partner2Nakshatra - Second partner's nakshatra
   * @returns {Object} Compatibility analysis result
   */
  async execute(partnerData) {
    try {
      // Input validation
      this._validateInput(partnerData);

      // Calculate compatibility analysis
      const result = await this.getNakshatraPoruthamAnalysis(partnerData);

      // Format and return result
      return this._formatResult(result);
    } catch (error) {
      logger.error('NakshatraPoruthamService error:', error);
      throw new Error(`Nakshatra porutham analysis failed: ${error.message}`);
    }
  }

  /**
   * Get comprehensive nakshatra porutham analysis
   * @param {Object} partnerData - Partner nakshatra data
   * @returns {Object} Detailed compatibility analysis
   */
  async getNakshatraPoruthamAnalysis(partnerData) {
    try {
      const { partner1Nakshatra, partner2Nakshatra } = partnerData;

      // Get compatibility analysis
      const compatibilityAnalysis = this.calculator.analyzeNakshatraCompatibility(
        partner1Nakshatra,
        partner2Nakshatra
      );

      // Get compatibility score
      const compatibilityScore = this.calculator.generateCompatibilityScore(
        partner1Nakshatra,
        partner2Nakshatra
      );

      // Get relationship dynamics
      const relationshipDynamics = this.calculator.generateRelationshipDynamics(
        partner1Nakshatra,
        partner2Nakshatra
      );

      // Get matching suggestions for both partners
      const partner1Suggestions = this.calculator.getMatchingSuggestions(partner1Nakshatra);
      const partner2Suggestions = this.calculator.getMatchingSuggestions(partner2Nakshatra);

      return {
        compatibilityAnalysis,
        compatibilityScore,
        relationshipDynamics,
        partner1Suggestions,
        partner2Suggestions,
        overallAssessment: this._generateOverallAssessment(compatibilityAnalysis, compatibilityScore)
      };
    } catch (error) {
      logger.error('Nakshatra porutham analysis error:', error);
      throw error;
    }
  }

  /**
   * Generate overall assessment of the compatibility
   * @param {Object} compatibilityAnalysis - Compatibility analysis result
   * @param {Object} compatibilityScore - Compatibility score result
   * @returns {Object} Overall assessment
   */
  _generateOverallAssessment(compatibilityAnalysis, compatibilityScore) {
    const assessment = {
      level: compatibilityScore.level,
      score: compatibilityScore.score,
      summary: '',
      recommendations: []
    };

    switch (compatibilityScore.level) {
    case 'excellent':
      assessment.summary = 'Exceptional cosmic harmony indicates a blessed union with strong potential for lasting happiness and mutual fulfillment.';
      assessment.recommendations = [
        'This is a highly auspicious match with excellent compatibility',
        'Focus on nurturing the natural harmony between your energies',
        'Celebrate the complementary qualities that make this partnership special'
      ];
      break;

    case 'good':
      assessment.summary = 'Strong supportive connection suggests a stable and harmonious relationship with good potential for growth together.';
      assessment.recommendations = [
        'Build upon the natural compatibility foundation',
        'Communicate openly about individual needs and expectations',
        'Work together to strengthen areas of mutual understanding'
      ];
      break;

    case 'neutral':
      assessment.summary = 'Balanced complementary energies indicate potential for a workable partnership through conscious effort and understanding.';
      assessment.recommendations = [
        'Focus on building mutual respect and understanding',
        'Learn from each other\'s different approaches to life',
        'Develop patience and acceptance of complementary qualities'
      ];
      break;

    case 'challenging':
      assessment.summary = 'Growth through understanding is needed for this combination, requiring conscious effort to harmonize different energies.';
      assessment.recommendations = [
        'Seek professional astrological guidance for relationship challenges',
        'Focus on personal growth and understanding of different energies',
        'Develop strong communication and conflict resolution skills'
      ];
      break;

    default:
      assessment.summary = 'Professional astrological consultation recommended to understand the unique dynamics of this combination.';
      assessment.recommendations = [
        'Consult with experienced astrologers for detailed analysis',
        'Focus on building strong foundations of trust and respect',
        'Consider individual spiritual growth alongside relationship development'
      ];
    }

    return assessment;
  }

  /**
   * Validate input data
   * @param {Object} input - Input data to validate
   */
  _validateInput(input) {
    if (!input) {
      throw new Error('Partner data is required');
    }

    const { partner1Nakshatra, partner2Nakshatra } = input;

    if (!partner1Nakshatra || typeof partner1Nakshatra !== 'string') {
      throw new Error('Valid partner1 nakshatra name is required');
    }

    if (!partner2Nakshatra || typeof partner2Nakshatra !== 'string') {
      throw new Error('Valid partner2 nakshatra name is required');
    }

    // Basic validation for nakshatra names (should be proper names)
    const validNakshatras = [
      'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
      'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
      'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
      'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
      'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
    ];

    if (!validNakshatras.includes(partner1Nakshatra)) {
      throw new Error(`Invalid nakshatra name: ${partner1Nakshatra}`);
    }

    if (!validNakshatras.includes(partner2Nakshatra)) {
      throw new Error(`Invalid nakshatra name: ${partner2Nakshatra}`);
    }
  }

  /**
   * Format result for presentation
   * @param {Object} result - Raw analysis result
   * @returns {Object} Formatted result
   */
  _formatResult(result) {
    return {
      service: 'Nakshatra Porutham Analysis',
      timestamp: new Date().toISOString(),
      analysis: {
        compatibility: {
          level: result.compatibilityAnalysis.compatibility,
          message: result.compatibilityAnalysis.message,
          strengths: result.compatibilityAnalysis.strengths,
          challenges: result.compatibilityAnalysis.challenges
        },
        score: {
          value: result.compatibilityScore.score,
          level: result.compatibilityScore.level,
          description: result.compatibilityScore.description
        },
        relationshipDynamics: result.relationshipDynamics,
        suggestions: {
          partner1: result.partner1Suggestions,
          partner2: result.partner2Suggestions
        },
        overallAssessment: result.overallAssessment
      },
      disclaimer: 'This analysis is for informational purposes only. Marriage and relationship decisions should consider multiple factors beyond astrological compatibility.'
    };
  }
  async getHealthStatus() {
    try {
      const baseHealth = await super.getHealthStatus();
      return {
        ...baseHealth,
        features: {
          // Add service-specific features here
        },
        supportedAnalyses: [
          // Add supported analyses here
        ]
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = NakshatraPoruthamService;
