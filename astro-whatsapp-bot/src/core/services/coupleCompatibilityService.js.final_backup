const ServiceTemplate = require('./ServiceTemplate');
const logger = require('../../utils/logger');

class CoupleCompatibilityService extends ServiceTemplate {
  constructor() {
    super('CoupleCompatibilityService');
    this.calculatorPath = '../../../services/astrology/compatibility/SynastryEngine';
  }

  async initialize() {
    try {
      await super.initialize();
      logger.info('✅ CoupleCompatibilityService initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize CoupleCompatibilityService:', error);
      throw error;
    }
  }

  async analyzeCoupleCompatibility(params) {
    try {
      this.validateParams(params, ['userChart', 'partnerChart']);

      const { userChart, partnerChart, options = {} } = params;

      // Perform complete synastry analysis
      const synastryResult = await this.calculator.performSynastryAnalysis(userChart, partnerChart);

      // Calculate overall compatibility score
      const compatibilityScore = this.calculateCompatibilityScore(synastryResult);

      // Generate relationship insights
      const insights = this.generateRelationshipInsights(synastryResult, compatibilityScore);

      return {
        success: true,
        data: {
          synastryAnalysis: synastryResult,
          compatibilityScore,
          insights,
          recommendations: this.generateRecommendations(synastryResult, compatibilityScore)
        },
        metadata: {
          calculationType: 'couple_compatibility',
          timestamp: new Date().toISOString(),
          analysisDepth: options.deepAnalysis ? 'comprehensive' : 'standard'
        }
      };
    } catch (error) {
      logger.error('❌ Error in analyzeCoupleCompatibility:', error);
      return {
        success: false,
        error: error.message,
        metadata: {
          calculationType: 'couple_compatibility',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Calculate overall compatibility score
   * @param {Object} synastryResult - Synastry analysis result
   * @returns {Object} Compatibility score breakdown
   */
  calculateCompatibilityScore(synastryResult) {
    try {
      const { interchartAspects, houseOverlays, compositeChart } = synastryResult;
      
      // Score different aspects of compatibility
      const aspectScore = this.scoreAspects(interchartAspects);
      const houseScore = this.scoreHouseOverlays(houseOverlays);
      const compositeScore = this.scoreCompositeChart(compositeChart);
      
      // Calculate weighted overall score
      const overallScore = Math.round(
        (aspectScore * 0.4 + houseScore * 0.3 + compositeScore * 0.3) * 100
      ) / 100;
      
      return {
        overall: overallScore,
        aspects: aspectScore,
        houses: houseScore,
        composite: compositeScore,
        category: this.getCompatibilityCategory(overallScore)
      };
    } catch (error) {
      logger.error('Error calculating compatibility score:', error);
      throw error;
    }
  }

  /**
   * Score interchart aspects
   * @param {Array} aspects - Array of interchart aspects
   * @returns {number} Aspect compatibility score (0-100)
   */
  scoreAspects(aspects) {
    if (!aspects || aspects.length === 0) return 50;
    
    let totalScore = 0;
    let aspectCount = 0;
    
    aspects.forEach(aspect => {
      let score = 50; // Base score
      
      // Positive aspects get higher scores
      if (['trine', 'sextile'].includes(aspect.type)) {
        score = 85 + (aspect.orb < 3 ? 10 : 0);
      } else if (aspect.type === 'conjunction') {
        score = aspect.planets.includes('Venus') || aspect.planets.includes('Jupiter') ? 80 : 60;
      } else if (['square', 'opposition'].includes(aspect.type)) {
        score = aspect.planets.includes('Saturn') || aspect.planets.includes('Mars') ? 30 : 45;
      }
      
      totalScore += score;
      aspectCount++;
    });
    
    return Math.round((totalScore / aspectCount) * 100) / 100;
  }

  /**
   * Score house overlays
   * @param {Array} overlays - Array of house overlays
   * @returns {number} House overlay score (0-100)
   */
  scoreHouseOverlays(overlays) {
    if (!overlays || overlays.length === 0) return 50;
    
    let totalScore = 0;
    let overlayCount = 0;
    
    overlays.forEach(overlay => {
      let score = 50;
      
      // Favorable house overlays
      if ([1, 4, 5, 7, 9, 11].includes(overlay.house)) {
        score = 75;
      } else if ([2, 3, 6, 8, 10, 12].includes(overlay.house)) {
        score = 40;
      }
      
      // Bonus for relationship planets in relationship houses
      if (['Venus', 'Jupiter', 'Moon'].includes(overlay.planet) && [5, 7, 11].includes(overlay.house)) {
        score += 15;
      }
      
      totalScore += Math.min(score, 100);
      overlayCount++;
    });
    
    return Math.round((totalScore / overlayCount) * 100) / 100;
  }

  /**
   * Score composite chart
   * @param {Object} compositeChart - Composite chart data
   * @returns {number} Composite chart score (0-100)
   */
  scoreCompositeChart(compositeChart) {
    if (!compositeChart || !compositeChart.planets) return 50;
    
    let score = 60; // Base score
    
    // Check for favorable composite placements
    const planets = compositeChart.planets;
    
    // Venus in good signs
    if (planets.Venus && ['Taurus', 'Libra', 'Pisces', 'Cancer'].includes(planets.Venus.sign)) {
      score += 10;
    }
    
    // Jupiter in good signs
    if (planets.Jupiter && ['Cancer', 'Sagittarius', 'Pisces'].includes(planets.Jupiter.sign)) {
      score += 10;
    }
    
    // Avoid challenging Saturn placements
    if (planets.Saturn && ['Aries', 'Cancer', 'Libra', 'Capricorn'].includes(planets.Saturn.sign)) {
      score -= 10;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Get compatibility category based on score
   * @param {number} score - Compatibility score
   * @returns {string} Compatibility category
   */
  getCompatibilityCategory(score) {
    if (score >= 85) return 'Excellent';
    if (score >= 75) return 'Very Good';
    if (score >= 65) return 'Good';
    if (score >= 55) return 'Moderate';
    if (score >= 45) return 'Challenging';
    return 'Difficult';
  }

  /**
   * Generate relationship insights
   * @param {Object} synastryResult - Synastry analysis
   * @param {Object} compatibilityScore - Compatibility scores
   * @returns {Array} Array of insights
   */
  generateRelationshipInsights(synastryResult, compatibilityScore) {
    const insights = [];
    
    // Aspect-based insights
    if (synastryResult.interchartAspects) {
      const venusAspects = synastryResult.interchartAspects.filter(a => 
        a.planets.includes('Venus') && ['trine', 'sextile'].includes(a.type)
      );
      if (venusAspects.length > 0) {
        insights.push({
          type: 'harmony',
          message: `Strong romantic harmony indicated by ${venusAspects.length} favorable Venus aspects`,
          strength: 'high'
        });
      }
    }
    
    // House overlay insights
    if (synastryResult.houseOverlays) {
      const seventhHouseOverlays = synastryResult.houseOverlays.filter(o => o.house === 7);
      if (seventhHouseOverlays.length > 0) {
        insights.push({
          type: 'commitment',
          message: `Strong partnership potential with ${seventhHouseOverlays.length} planets in 7th house`,
          strength: 'high'
        });
      }
    }
    
    // Overall compatibility insight
    insights.push({
      type: 'overall',
      message: `Overall compatibility is ${compatibilityScore.category.toLowerCase()} with a score of ${compatibilityScore.overall}/100`,
      strength: compatibilityScore.overall >= 65 ? 'positive' : 'cautionary'
    });
    
    return insights;
  }

  /**
   * Generate recommendations for the couple
   * @param {Object} synastryResult - Synastry analysis
   * @param {Object} compatibilityScore - Compatibility scores
   * @returns {Array} Array of recommendations
   */
  generateRecommendations(synastryResult, compatibilityScore) {
    const recommendations = [];
    
    if (compatibilityScore.overall < 60) {
      recommendations.push({
        category: 'communication',
        advice: 'Focus on open communication and understanding differences',
        priority: 'high'
      });
    }
    
    if (compatibilityScore.aspects < 50) {
      recommendations.push({
        category: 'harmony',
        advice: 'Work on finding common ground and shared interests',
        priority: 'medium'
      });
    }
    
    if (compatibilityScore.houses < 50) {
      recommendations.push({
        category: 'shared_goals',
        advice: 'Align on long-term goals and life directions',
        priority: 'medium'
      });
    }
    
    // Always add positive recommendation
    recommendations.push({
      category: 'growth',
      advice: 'Use relationship challenges as opportunities for personal growth',
      priority: 'low'
    });
    
    return recommendations;
  }

  /**
   * Get quick compatibility assessment
   * @param {Object} params - Analysis parameters
   * @returns {Object} Quick compatibility result
   */
  async getQuickCompatibility(params) {
    try {
      this.validateParams(params, ['userChart', 'partnerChart']);
      
      const fullAnalysis = await this.analyzeCoupleCompatibility(params);
      
      return {
        success: true,
        data: {
          score: fullAnalysis.data.compatibilityScore.overall,
          category: fullAnalysis.data.compatibilityScore.category,
          keyInsights: fullAnalysis.data.insights.slice(0, 3),
          summary: this.generateCompatibilitySummary(fullAnalysis.data)
        },
        metadata: {
          calculationType: 'quick_compatibility',
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      logger.error('❌ Error in getQuickCompatibility:', error);
      return {
        success: false,
        error: error.message,
        metadata: {
          calculationType: 'quick_compatibility',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Generate compatibility summary
   * @param {Object} analysisData - Full analysis data
   * @returns {string} Compatibility summary
   */
  generateCompatibilitySummary(analysisData) {
    const { compatibilityScore, insights } = analysisData;
    
    let summary = `Your compatibility score is ${compatibilityScore.overall}/100 (${compatibilityScore.category}). `;
    
    if (compatibilityScore.overall >= 75) {
      summary += 'You share strong harmonious connections and have excellent potential for a lasting relationship.';
    } else if (compatibilityScore.overall >= 60) {
      summary += 'You have good compatibility with some areas that may require attention and understanding.';
    } else {
      summary += 'Your relationship may face challenges, but with awareness and effort, growth is possible.';
    }
    
    return summary;
  }

  async getHealthStatus() {
    try {
      const baseHealth = await super.getHealthStatus();
      return {
        ...baseHealth,
        features: {
          coupleCompatibility: true,
          synastryAnalysis: true,
          compatibilityScoring: true,
          relationshipInsights: true,
          quickCompatibility: true
        },
        supportedAnalyses: [
          'couple_compatibility_analysis',
          'synastry_analysis',
          'compatibility_scoring',
          'relationship_insights',
          'quick_compatibility'
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

module.exports = CoupleCompatibilityService;