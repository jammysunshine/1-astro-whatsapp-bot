const ServiceTemplate = require('../ServiceTemplate');
const logger = require('../../utils/logger');

// Import calculator from legacy structure (for now)

/**
 * CompatibilityScoreService - Vedic compatibility scoring service
 *
 * Generates standardized numerical compatibility scores based on planetary positions,
 * interchart aspects, and house overlays using traditional Vedic astrology principles.
 */
class CompatibilityScoreService extends ServiceTemplate {
  constructor() {
    super('ucompatibilityScoreService'));
    this.serviceName = 'CompatibilityScoreService';
    logger.info('CompatibilityScoreService initialized');
  }

  async processCalculation(compatibilityData) {
    try {
      // Calculate compatibility score
      const result = await this.calculateCompatibilityScore(compatibilityData);
      return result;
    } catch (error) {
      logger.error('CompatibilityScoreService calculation error:', error);
      throw new Error(`Compatibility score calculation failed: ${error.message}`);
    }
  }

  /**
   * Calculate comprehensive compatibility score
   * @param {Object} compatibilityData - Aspects and overlays data
   * @returns {Object} Detailed compatibility scoring
   */
  async calculateCompatibilityScore(compatibilityData) {
    try {
      const { aspects, overlays } = compatibilityData;

      // Get comprehensive scoring from calculator
      const scoringResult = this.calculator.calculateCompatibilityScores(aspects, overlays);

      // Generate additional insights and recommendations
      const recommendations = this._generateRecommendations(scoringResult);
      const compatibilityProfile = this._createCompatibilityProfile(scoringResult);

      return {
        ...scoringResult,
        recommendations,
        compatibilityProfile,
        interpretation: this._interpretScore(scoringResult.overall)
      };
    } catch (error) {
      logger.error('Compatibility score calculation error:', error);
      throw error;
    }
  }

  /**
   * Generate recommendations based on scoring results
   * @param {Object} scoringResult - Scoring analysis result
   * @returns {Array} Personalized recommendations
   */
  _generateRecommendations(scoringResult) {
    const recommendations = [];
    const { overall, categories, level } = scoringResult;

    // Overall score-based recommendations
    if (overall >= 80) {
      recommendations.push('Celebrate the strong astrological foundation and focus on nurturing natural harmony');
      recommendations.push('Use the excellent compatibility as a platform for mutual growth and shared goals');
    } else if (overall >= 60) {
      recommendations.push('Build upon the solid compatibility foundation through open communication');
      recommendations.push('Focus on understanding and appreciating complementary energies');
    } else if (overall >= 40) {
      recommendations.push('Work consciously on areas of challenge while appreciating areas of strength');
      recommendations.push('Consider professional astrological guidance for navigating compatibility dynamics');
    } else {
      recommendations.push('Seek comprehensive astrological consultation to understand complex dynamics');
      recommendations.push('Focus on personal growth and spiritual development alongside relationship work');
    }

    // Category-specific recommendations
    if (categories.aspects?.dominantType === 'challenging') {
      recommendations.push('Pay special attention to communication during challenging aspect periods');
      recommendations.push('Use challenging aspects as opportunities for deeper understanding and growth');
    }

    if (categories.overlays?.strength === 'weak') {
      recommendations.push('Focus on building emotional intimacy and shared experiences');
      recommendations.push('Work on creating mutual understanding in relationship areas');
    }

    if (categories.composite?.harmony === 'developing') {
      recommendations.push('Practice patience and give the relationship time to develop its natural rhythm');
      recommendations.push('Focus on shared activities and goals to strengthen the partnership foundation');
    }

    return recommendations.slice(0, 5); // Limit to top 5 recommendations
  }

  /**
   * Create compatibility profile summary
   * @param {Object} scoringResult - Scoring analysis result
   * @returns {Object} Compatibility profile
   */
  _createCompatibilityProfile(scoringResult) {
    const { overall, categories, level } = scoringResult;

    const profile = {
      compatibilityLevel: level,
      overallScore: overall,
      dominantEnergies: this._analyzeDominantEnergies(categories),
      relationshipStyle: this._determineRelationshipStyle(categories),
      growthAreas: this._identifyGrowthAreas(categories),
      strengths: this._highlightStrengths(categories)
    };

    return profile;
  }

  /**
   * Analyze dominant energies in the compatibility
   * @param {Object} categories - Category scores
   * @returns {string} Dominant energy description
   */
  _analyzeDominantEnergies(categories) {
    const aspectType = categories.aspects?.dominantType;
    const overlayStrength = categories.overlays?.strength;
    const compositeHarmony = categories.composite?.harmony;

    if (aspectType === 'harmonious' && overlayStrength === 'strong' && compositeHarmony === 'very_high') {
      return 'Exceptionally harmonious with strong supportive energies flowing naturally';
    } else if (aspectType === 'harmonious' && overlayStrength !== 'weak') {
      return 'Primarily harmonious with good energetic support and understanding';
    } else if (compositeHarmony === 'moderate' || overlayStrength === 'moderate') {
      return 'Balanced energies requiring conscious effort to maintain harmony';
    } else {
      return 'Complex energies offering significant growth opportunities through understanding';
    }
  }

  /**
   * Determine relationship style based on compatibility
   * @param {Object} categories - Category scores
   * @returns {string} Relationship style description
   */
  _determineRelationshipStyle(categories) {
    const overlayStrength = categories.overlays?.strength;
    const compositeHarmony = categories.composite?.harmony;

    if (overlayStrength === 'strong' && compositeHarmony === 'very_high') {
      return 'Deeply committed and emotionally connected partnership';
    } else if (overlayStrength === 'moderate') {
      return 'Balanced partnership with room for individual expression';
    } else if (compositeHarmony === 'developing') {
      return 'Growing partnership focused on mutual learning and understanding';
    } else {
      return 'Dynamic partnership with opportunities for profound growth';
    }
  }

  /**
   * Identify areas for growth and development
   * @param {Object} categories - Category scores
   * @returns {Array} Growth area descriptions
   */
  _identifyGrowthAreas(categories) {
    const growthAreas = [];

    if (categories.aspects?.challenging > categories.aspects?.harmonious) {
      growthAreas.push('Developing patience and understanding during challenging periods');
    }

    if (categories.overlays?.strength === 'weak') {
      growthAreas.push('Building deeper emotional intimacy and shared experiences');
    }

    if (categories.composite?.harmony === 'developing') {
      growthAreas.push('Learning to balance individual needs with partnership goals');
    }

    if (growthAreas.length === 0) {
      growthAreas.push('Continuing to nurture and strengthen existing harmonious connections');
    }

    return growthAreas;
  }

  /**
   * Highlight compatibility strengths
   * @param {Object} categories - Category scores
   * @returns {Array} Strength descriptions
   */
  _highlightStrengths(categories) {
    const strengths = [];

    if (categories.aspects?.harmonious > 0) {
      strengths.push('Natural harmony in planetary interactions');
    }

    if (categories.overlays?.strength !== 'weak') {
      strengths.push('Supportive house placements for relationship stability');
    }

    if (categories.composite?.harmony !== 'developing') {
      strengths.push('Strong foundation for shared purpose and goals');
    }

    if (strengths.length === 0) {
      strengths.push('Unique astrological dynamic with individual learning opportunities');
    }

    return strengths;
  }

  /**
   * Interpret the overall compatibility score
   * @param {number} score - Overall score
   * @returns {string} Score interpretation
   */
  _interpretScore(score) {
    if (score >= 85) {
      return 'Exceptional compatibility with rare astrological harmony. This combination suggests a relationship blessed with natural ease and mutual understanding.';
    } else if (score >= 75) {
      return 'Excellent compatibility with strong harmonious foundations. The charts indicate a relationship with significant potential for lasting happiness.';
    } else if (score >= 65) {
      return 'Very good compatibility with supportive planetary connections. This pairing offers a solid foundation for a meaningful relationship.';
    } else if (score >= 55) {
      return 'Good compatibility with complementary energies. The relationship will benefit from conscious effort and mutual understanding.';
    } else if (score >= 45) {
      return 'Fair compatibility requiring work and understanding. This combination offers opportunities for growth through shared challenges.';
    } else if (score >= 35) {
      return 'Moderate compatibility with significant challenges. Professional astrological guidance is recommended for navigating this dynamic.';
    } else if (score >= 25) {
      return 'Challenging compatibility requiring substantial effort. This relationship offers profound lessons in acceptance and growth.';
    } else {
      return 'Difficult compatibility suggesting the need for careful consideration. Comprehensive astrological analysis is strongly recommended.';
    }
  }

  /**
   * Validate input data
   * @param {Object} input - Input data to validate
   */
  validate(compatibilityData) {
    if (!input) {
      throw new Error('Compatibility data is required');
    }

    const { aspects, overlays } = input;

    if (!Array.isArray(aspects)) {
      throw new Error('Aspects must be provided as an array');
    }

    if (!overlays || typeof overlays !== 'object') {
      throw new Error('Valid overlays object is required');
    }

    // Validate aspects structure
    for (const aspect of aspects) {
      if (!aspect.planet1 || !aspect.planet2 || typeof aspect.aspect !== 'number') {
        throw new Error('Invalid aspect structure: each aspect must have planet1, planet2, and aspect properties');
      }
    }

    // Validate overlays structure
    if (!overlays.userInPartnerHouses && !overlays.partnerInUserHouses) {
      throw new Error('Overlays must contain userInPartnerHouses or partnerInUserHouses data');
    }
  }

  /**
   * Format result for presentation
   * @param {Object} result - Raw scoring result
   * @returns {Object} Formatted result
   */
  formatResult(result) {
    return {
      service: 'Compatibility Score Analysis',
      timestamp: new Date().toISOString(),
      scoring: {
        overallScore: result.overall,
        compatibilityLevel: result.level,
        categories: result.categories,
        breakdown: result.breakdown,
        insights: result.insights
      },
      analysis: {
        recommendations: result.recommendations,
        compatibilityProfile: result.compatibilityProfile,
        interpretation: result.interpretation
      },
      disclaimer: 'Compatibility scores are interpretive tools. Real relationships involve many factors beyond astrological analysis. Professional counseling is recommended for important relationship decisions.'
    };
  }

  getMetadata() {
    return {
      name: this.serviceName,
      version: '1.0.0',
      category: 'vedic',
      methods: ['execute', 'calculateCompatibilityScore'],
      dependencies: ['CompatibilityScorer']
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

module.exports = CompatibilityScoreService;
