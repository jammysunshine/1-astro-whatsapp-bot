const ServiceTemplate = require('./ServiceTemplate');
const logger = require('../../utils/logger');

// Import calculator from legacy structure

class SynastryAnalysisService extends ServiceTemplate {
  constructor() {
    super('SynastryEngine');
    this.serviceName = 'SynastryAnalysisService';
    this.calculatorPath = '../calculators/SynastryEngine';
    logger.info('SynastryAnalysisService initialized');
  }

  async performSynastryAnalysis(chartData) {
    try {
      // Validate input
      this.validate(chartData);

      const { chart1, chart2 } = chartData;

      // Use SynastryEngine for complete analysis
      const synastryResult = await this.calculator.performSynastryAnalysis(
        chart1,
        chart2
      );

      // Add additional analysis layers
      const enhancedAnalysis = {
        ...synastryResult,
        compatibilityFactors: this.analyzeCompatibilityFactors(synastryResult),
        relationshipThemes: this.identifyRelationshipThemes(synastryResult),
        timingInsights: this.generateTimingInsights(synastryResult),
        recommendations:
          this.generateRelationshipRecommendations(synastryResult)
      };

      return enhancedAnalysis;
    } catch (error) {
      logger.error('SynastryAnalysisService calculation error:', error);
      throw new Error(`Synastry analysis failed: ${error.message}`);
    }
  }

  /**
   * Analyze compatibility factors from synastry results
   * @param {Object} synastryResult - Synastry analysis result
   * @returns {Object} Compatibility factors analysis
   */
  analyzeCompatibilityFactors(synastryResult) {
    try {
      const { interchartAspects, houseOverlays, compositeChart } =
        synastryResult;

      const factors = {
        emotional: this.analyzeEmotionalCompatibility(interchartAspects),
        intellectual: this.analyzeIntellectualCompatibility(interchartAspects),
        physical: this.analyzePhysicalCompatibility(
          interchartAspects,
          houseOverlays
        ),
        spiritual: this.analyzeSpiritualCompatibility(
          interchartAspects,
          compositeChart
        ),
        communication:
          this.analyzeCommunicationCompatibility(interchartAspects)
      };

      // Calculate overall compatibility score
      const scores = Object.values(factors).map(f => f.score);
      const overallScore = scores.reduce((a, b) => a + b, 0) / scores.length;

      return {
        ...factors,
        overall: {
          score: Math.round(overallScore * 100) / 100,
          category: this.getCompatibilityCategory(overallScore),
          description: this.getCompatibilityDescription(overallScore)
        }
      };
    } catch (error) {
      logger.error('Error analyzing compatibility factors:', error);
      throw error;
    }
  }

  /**
   * Analyze emotional compatibility
   * @param {Array} aspects - Interchart aspects
   * @returns {Object} Emotional compatibility analysis
   */
  analyzeEmotionalCompatibility(aspects) {
    const emotionalAspects = aspects.filter(aspect =>
      ['Moon', 'Venus', 'Neptune'].some(planet =>
        aspect.planets.includes(planet)
      )
    );

    let score = 50; // Base score

    emotionalAspects.forEach(aspect => {
      if (['trine', 'sextile'].includes(aspect.type)) {
        score += 15;
      } else if (aspect.type === 'conjunction') {
        score += 10;
      } else if (['square', 'opposition'].includes(aspect.type)) {
        score -= 10;
      }
    });

    return {
      score: Math.max(0, Math.min(100, score)),
      aspects: emotionalAspects,
      description: this.getEmotionalCompatibilityDescription(score)
    };
  }

  /**
   * Analyze intellectual compatibility
   * @param {Array} aspects - Interchart aspects
   * @returns {Object} Intellectual compatibility analysis
   */
  analyzeIntellectualCompatibility(aspects) {
    const intellectualAspects = aspects.filter(aspect =>
      ['Mercury', 'Uranus'].some(planet => aspect.planets.includes(planet))
    );

    let score = 50;

    intellectualAspects.forEach(aspect => {
      if (['trine', 'sextile'].includes(aspect.type)) {
        score += 12;
      } else if (aspect.type === 'conjunction') {
        score += 8;
      } else if (['square', 'opposition'].includes(aspect.type)) {
        score -= 8;
      }
    });

    return {
      score: Math.max(0, Math.min(100, score)),
      aspects: intellectualAspects,
      description: this.getIntellectualCompatibilityDescription(score)
    };
  }

  /**
   * Analyze physical compatibility
   * @param {Array} aspects - Interchart aspects
   * @param {Array} houseOverlays - House overlays
   * @returns {Object} Physical compatibility analysis
   */
  analyzePhysicalCompatibility(aspects, houseOverlays) {
    const physicalAspects = aspects.filter(aspect =>
      ['Mars', 'Venus'].some(planet => aspect.planets.includes(planet))
    );

    const fifthHouseOverlays = houseOverlays.filter(
      overlay => overlay.house === 5
    );
    const eighthHouseOverlays = houseOverlays.filter(
      overlay => overlay.house === 8
    );

    let score = 50;

    physicalAspects.forEach(aspect => {
      if (['trine', 'sextile'].includes(aspect.type)) {
        score += 15;
      } else if (aspect.type === 'conjunction') {
        score += 12;
      }
    });

    // Bonus for planets in 5th or 8th house
    score += fifthHouseOverlays.length * 5 + eighthHouseOverlays.length * 3;

    return {
      score: Math.max(0, Math.min(100, score)),
      aspects: physicalAspects,
      houseOverlays: [...fifthHouseOverlays, ...eighthHouseOverlays],
      description: this.getPhysicalCompatibilityDescription(score)
    };
  }

  /**
   * Analyze spiritual compatibility
   * @param {Array} aspects - Interchart aspects
   * @param {Object} compositeChart - Composite chart
   * @returns {Object} Spiritual compatibility analysis
   */
  analyzeSpiritualCompatibility(aspects, compositeChart) {
    const spiritualAspects = aspects.filter(aspect =>
      ['Neptune', 'Jupiter', 'Pluto'].some(planet =>
        aspect.planets.includes(planet)
      )
    );

    let score = 50;

    spiritualAspects.forEach(aspect => {
      if (['trine', 'sextile'].includes(aspect.type)) {
        score += 18;
      } else if (aspect.type === 'conjunction') {
        score += 15;
      }
    });

    // Check composite chart for spiritual indicators
    if (compositeChart && compositeChart.planets) {
      if (
        compositeChart.planets.Neptune &&
        ['Pisces', 'Cancer', 'Scorpio'].includes(
          compositeChart.planets.Neptune.sign
        )
      ) {
        score += 10;
      }
    }

    return {
      score: Math.max(0, Math.min(100, score)),
      aspects: spiritualAspects,
      description: this.getSpiritualCompatibilityDescription(score)
    };
  }

  /**
   * Analyze communication compatibility
   * @param {Array} aspects - Interchart aspects
   * @returns {Object} Communication compatibility analysis
   */
  analyzeCommunicationCompatibility(aspects) {
    const communicationAspects = aspects.filter(aspect =>
      ['Mercury'].some(planet => aspect.planets.includes(planet))
    );

    let score = 50;

    communicationAspects.forEach(aspect => {
      if (['trine', 'sextile'].includes(aspect.type)) {
        score += 20;
      } else if (aspect.type === 'conjunction') {
        score += 15;
      } else if (['square', 'opposition'].includes(aspect.type)) {
        score -= 15;
      }
    });

    return {
      score: Math.max(0, Math.min(100, score)),
      aspects: communicationAspects,
      description: this.getCommunicationCompatibilityDescription(score)
    };
  }

  /**
   * Identify relationship themes from synastry
   * @param {Object} synastryResult - Synastry analysis result
   * @returns {Array} Array of relationship themes
   */
  identifyRelationshipThemes(synastryResult) {
    const themes = [];
    const { interchartAspects, houseOverlays, compositeChart } = synastryResult;

    // Analyze major themes
    if (this.hasStrongVenusMarsAspects(interchartAspects)) {
      themes.push({
        theme: 'Passionate Romance',
        description:
          'Strong romantic and physical attraction indicated by Venus-Mars aspects',
        strength: 'high'
      });
    }

    if (this.hasStrongSaturnAspects(interchartAspects)) {
      themes.push({
        theme: 'Commitment & Stability',
        description:
          'Serious relationship potential with Saturn aspects indicating longevity',
        strength: 'high'
      });
    }

    if (this.hasJupiterExpansion(interchartAspects)) {
      themes.push({
        theme: 'Growth & Expansion',
        description:
          'Relationship encourages mutual growth and expansion of horizons',
        strength: 'medium'
      });
    }

    if (this.hasUranusInnovation(interchartAspects)) {
      themes.push({
        theme: 'Innovation & Freedom',
        description:
          'Unconventional relationship that breaks traditional patterns',
        strength: 'medium'
      });
    }

    if (this.hasNeptuneRomance(interchartAspects)) {
      themes.push({
        theme: 'Spiritual Connection',
        description: 'Deep spiritual and intuitive bond between partners',
        strength: 'high'
      });
    }

    return themes;
  }

  /**
   * Generate timing insights for the relationship
   * @param {Object} synastryResult - Synastry analysis result
   * @returns {Object} Timing insights
   */
  generateTimingInsights(synastryResult) {
    return {
      currentPhase: this.determineRelationshipPhase(synastryResult),
      upcomingChallenges: this.identifyUpcomingChallenges(synastryResult),
      favorablePeriods: this.identifyFavorablePeriods(synastryResult),
      longTermProspects: this.assessLongTermProspects(synastryResult)
    };
  }

  /**
   * Generate relationship recommendations
   * @param {Object} synastryResult - Synastry analysis result
   * @returns {Array} Array of recommendations
   */
  generateRelationshipRecommendations(synastryResult) {
    const recommendations = [];
    const { interchartAspects, houseOverlays } = synastryResult;

    // Communication recommendations
    if (this.hasChallengingMercuryAspects(interchartAspects)) {
      recommendations.push({
        category: 'communication',
        advice:
          'Practice active listening and clear communication to overcome misunderstandings',
        priority: 'high'
      });
    }

    // Emotional recommendations
    if (this.hasChallengingMoonAspects(interchartAspects)) {
      recommendations.push({
        category: 'emotional',
        advice:
          'Work on emotional understanding and provide mutual emotional support',
        priority: 'high'
      });
    }

    // Growth recommendations
    recommendations.push({
      category: 'growth',
      advice:
        'Use relationship challenges as opportunities for personal and mutual growth',
      priority: 'medium'
    });

    // Shared activities
    if (this.hasCreativeAspects(interchartAspects)) {
      recommendations.push({
        category: 'activities',
        advice:
          'Engage in creative and artistic activities together to strengthen your bond',
        priority: 'low'
      });
    }

    return recommendations;
  }

  // Helper methods for aspect analysis
  hasStrongVenusMarsAspects(aspects) {
    return aspects.some(
      aspect =>
        aspect.planets.includes('Venus') &&
        aspect.planets.includes('Mars') &&
        ['trine', 'sextile', 'conjunction'].includes(aspect.type) &&
        aspect.orb < 8
    );
  }

  hasStrongSaturnAspects(aspects) {
    return aspects.some(
      aspect =>
        aspect.planets.includes('Saturn') &&
        ['trine', 'sextile', 'conjunction'].includes(aspect.type)
    );
  }

  hasJupiterExpansion(aspects) {
    return aspects.some(
      aspect =>
        aspect.planets.includes('Jupiter') &&
        ['trine', 'sextile'].includes(aspect.type)
    );
  }

  hasUranusInnovation(aspects) {
    return aspects.some(
      aspect =>
        aspect.planets.includes('Uranus') &&
        ['trine', 'sextile', 'conjunction'].includes(aspect.type)
    );
  }

  hasNeptuneRomance(aspects) {
    return aspects.some(
      aspect =>
        aspect.planets.includes('Neptune') &&
        ['trine', 'sextile', 'conjunction'].includes(aspect.type)
    );
  }

  hasChallengingMercuryAspects(aspects) {
    return aspects.some(
      aspect =>
        aspect.planets.includes('Mercury') &&
        ['square', 'opposition'].includes(aspect.type)
    );
  }

  hasChallengingMoonAspects(aspects) {
    return aspects.some(
      aspect =>
        aspect.planets.includes('Moon') &&
        ['square', 'opposition'].includes(aspect.type)
    );
  }

  hasCreativeAspects(aspects) {
    return aspects.some(
      aspect =>
        ['Venus', 'Neptune'].some(planet => aspect.planets.includes(planet)) &&
        ['trine', 'sextile'].includes(aspect.type)
    );
  }

  // Helper methods for descriptions and categories
  getCompatibilityCategory(score) {
    if (score >= 85) {
      return 'Excellent';
    }
    if (score >= 75) {
      return 'Very Good';
    }
    if (score >= 65) {
      return 'Good';
    }
    if (score >= 55) {
      return 'Moderate';
    }
    if (score >= 45) {
      return 'Challenging';
    }
    return 'Difficult';
  }

  getCompatibilityDescription(score) {
    const category = this.getCompatibilityCategory(score);
    const descriptions = {
      Excellent: 'Outstanding compatibility with strong harmonious connections',
      'Very Good': 'Strong compatibility with minor areas for growth',
      Good: 'Solid compatibility with some differences that complement each other',
      Moderate:
        'Average compatibility requiring conscious effort and understanding',
      Challenging: 'Significant differences that require work and compromise',
      Difficult: 'Major challenges requiring substantial effort and commitment'
    };
    return descriptions[category] || 'Compatibility requires further analysis';
  }

  getEmotionalCompatibilityDescription(score) {
    if (score >= 75) {
      return 'Deep emotional understanding and connection';
    }
    if (score >= 60) {
      return 'Good emotional compatibility with room for growth';
    }
    if (score >= 45) {
      return 'Moderate emotional connection requiring effort';
    }
    return 'Emotional differences may require conscious work';
  }

  getIntellectualCompatibilityDescription(score) {
    if (score >= 75) {
      return 'Excellent mental rapport and shared interests';
    }
    if (score >= 60) {
      return 'Good intellectual compatibility with some differences';
    }
    if (score >= 45) {
      return 'Moderate mental connection requiring communication';
    }
    return 'Intellectual differences may challenge understanding';
  }

  getPhysicalCompatibilityDescription(score) {
    if (score >= 75) {
      return 'Strong physical attraction and chemistry';
    }
    if (score >= 60) {
      return 'Good physical compatibility with natural attraction';
    }
    if (score >= 45) {
      return 'Moderate physical connection requiring effort';
    }
    return 'Physical differences may require understanding and patience';
  }

  getSpiritualCompatibilityDescription(score) {
    if (score >= 75) {
      return 'Deep spiritual connection and shared values';
    }
    if (score >= 60) {
      return 'Good spiritual compatibility with room for growth';
    }
    if (score >= 45) {
      return 'Moderate spiritual connection requiring exploration';
    }
    return 'Spiritual differences may require mutual respect';
  }

  getCommunicationCompatibilityDescription(score) {
    if (score >= 75) {
      return 'Excellent communication and understanding';
    }
    if (score >= 60) {
      return 'Good communication with occasional misunderstandings';
    }
    if (score >= 45) {
      return 'Moderate communication requiring conscious effort';
    }
    return 'Communication challenges may require professional help';
  }

  determineRelationshipPhase(synastryResult) {
    // Implementation would analyze current transits and progressions
    return {
      phase: 'growth',
      description:
        'Relationship is in a growth phase with opportunities for development',
      duration: '6-12 months'
    };
  }

  identifyUpcomingChallenges(synastryResult) {
    // Implementation would analyze challenging upcoming transits
    return [
      {
        challenge: 'Communication misunderstandings',
        timeframe: 'Next 3 months',
        mitigation: 'Practice active listening and clear expression'
      }
    ];
  }

  identifyFavorablePeriods(synastryResult) {
    // Implementation would analyze favorable upcoming transits
    return [
      {
        period: 'Romantic harmony',
        timeframe: '2-4 months',
        activities: 'Deepen emotional connection, plan romantic activities'
      }
    ];
  }

  assessLongTermProspects(synastryResult) {
    const compatibilityFactors =
      this.analyzeCompatibilityFactors(synastryResult);
    const overallScore = compatibilityFactors.overall.score;

    return {
      viability:
        overallScore >= 60 ?
          'high' :
          overallScore >= 45 ?
            'moderate' :
            'challenging',
      keyStrengths: this.identifyKeyStrengths(synastryResult),
      potentialChallenges: this.identifyPotentialChallenges(synastryResult),
      recommendations: this.getLongTermRecommendations(overallScore)
    };
  }

  identifyKeyStrengths(synastryResult) {
    const strengths = [];
    const compatibilityFactors =
      this.analyzeCompatibilityFactors(synastryResult);

    Object.entries(compatibilityFactors).forEach(([area, analysis]) => {
      if (analysis.score >= 70) {
        strengths.push(area);
      }
    });

    return strengths;
  }

  identifyPotentialChallenges(synastryResult) {
    const challenges = [];
    const compatibilityFactors =
      this.analyzeCompatibilityFactors(synastryResult);

    Object.entries(compatibilityFactors).forEach(([area, analysis]) => {
      if (analysis.score < 50) {
        challenges.push(area);
      }
    });

    return challenges;
  }

  getLongTermRecommendations(overallScore) {
    if (overallScore >= 75) {
      return 'Focus on maintaining harmony and continuing to grow together';
    } else if (overallScore >= 60) {
      return 'Work on communication and understanding to strengthen the bond';
    } else if (overallScore >= 45) {
      return 'Consider professional guidance and commit to working through differences';
    } else {
      return 'Evaluate compatibility honestly and consider if both partners are willing to do the work required';
    }
  }

  /**
   * Get quick synastry overview
   * @param {Object} params - Analysis parameters
   * @returns {Object} Quick synastry overview
   */
  async getQuickSynastryOverview(params) {
    try {
      this.validateParams(params, ['chart1', 'chart2']);

      const fullAnalysis = await this.performSynastryAnalysis(params);

      return {
        success: true,
        data: {
          overallCompatibility: fullAnalysis.data.compatibilityFactors.overall,
          keyThemes: fullAnalysis.data.relationshipThemes.slice(0, 3),
          mainRecommendations: fullAnalysis.data.recommendations.slice(0, 2),
          summary: this.generateSynastrySummary(fullAnalysis.data)
        },
        metadata: {
          calculationType: 'quick_synastry',
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      logger.error('❌ Error in getQuickSynastryOverview:', error);
      return {
        success: false,
        error: error.message,
        metadata: {
          calculationType: 'quick_synastry',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Generate synastry summary
   * @param {Object} analysisData - Full analysis data
   * @returns {string} Synastry summary
   */
  generateSynastrySummary(analysisData) {
    const { compatibilityFactors, relationshipThemes } = analysisData;

    let summary = `Your overall compatibility is ${compatibilityFactors.overall.score}/100 (${compatibilityFactors.overall.category}). `;

    if (relationshipThemes.length > 0) {
      summary += `Key relationship themes include ${relationshipThemes.map(t => t.theme).join(', ')}. `;
    }

    if (compatibilityFactors.overall.score >= 70) {
      summary +=
        'This relationship has strong potential for lasting harmony and mutual growth.';
    } else if (compatibilityFactors.overall.score >= 55) {
      summary +=
        'This relationship has good potential with some areas that may require attention and understanding.';
    } else {
      summary +=
        'This relationship may face challenges, but with awareness and commitment, growth is possible.';
    }

    return summary;
  }

  formatResult(result) {
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
      service: this.serviceName
    };
  }

  validate(chartData) {
    if (!chartData) {
      throw new Error('Chart data is required');
    }

    const required = ['chart1', 'chart2'];
    for (const field of required) {
      if (!chartData[field]) {
        throw new Error(`${field} is required for synastry analysis`);
      }
    }

    return true;
  }

  getMetadata() {
    return {
      name: this.serviceName,
      version: '1.0.0',
      category: 'vedic',
      methods: ['performSynastryAnalysis', 'getQuickSynastryOverview'],
      dependencies: ['SynastryEngine']
    };
  }

  async processCalculation(data) {
    return await this.performSynastryAnalysis(data);
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

module.exports = SynastryAnalysisService;
