const ServiceTemplate = require('./ServiceTemplate');
const logger = require('../../utils/logger');

// Import calculator from legacy structure

class FixedStarsService extends ServiceTemplate {
  constructor() {
    super('ufixedStarsService'));
    this.serviceName = 'FixedStarsService';
    logger.info('FixedStarsService initialized');
  }

  async lfixedStarsCalculation(birthData) {
    try {
      // Validate input
      this.validate(birthData);

      // Perform fixed stars analysis
      const fixedStarsAnalysis = await this.calculator.calculateFixedStarsAnalysis(birthData);

      // Generate detailed interpretations
      const detailedInterpretations = this.generateDetailedInterpretations(fixedStarsAnalysis);

      // Assess star influences
      const starInfluences = this.assessStarInfluences(fixedStarsAnalysis);

      // Generate life themes
      const lifeThemes = this.identifyLifeThemes(fixedStarsAnalysis);

      return {
        fixedStarsAnalysis,
        detailedInterpretations,
        starInfluences,
        lifeThemes,
        summary: this.generateFixedStarsSummary(fixedStarsAnalysis)
      };
    } catch (error) {
      logger.error('FixedStarsService calculation error:', error);
      throw new Error(`Fixed stars analysis failed: ${error.message}`);
    }
  }

  /**
   * Get specific fixed star interpretation
   * @param {Object} params - Interpretation parameters
   * @param {string} params.starName - Name of the fixed star
   * @param {Object} params.birthData - Birth data
   * @returns {Object} Star interpretation result
   */
  async getStarInterpretation(params) {
    try {
      this.validateParams(params, ['starName', 'birthData']);
      
      const { starName, birthData, options = {} } = params;
      
      // Get full fixed stars analysis
      const fullAnalysis = await this.calculator.calculateFixedStarsAnalysis(birthData);
      
      // Find specific star conjunctions
      const starConjunctions = fullAnalysis.conjunctions.filter(
        conjunction => conjunction.star.toLowerCase() === starName.toLowerCase()
      );
      
      // Get star information
      const starInfo = fullAnalysis.majorStars.find(
        star => star.name.toLowerCase() === starName.toLowerCase()
      );
      
      if (!starInfo && starConjunctions.length === 0) {
        return {
          success: true,
          data: {
            starName,
            found: false,
            message: `No significant connections to ${starName} found in this birth chart`
          },
          metadata: {
            calculationType: 'star_interpretation',
            timestamp: new Date().toISOString()
          }
        };
      }
      
      // Generate detailed interpretation
      const detailedInterpretation = this.generateSpecificStarInterpretation(
        starName, 
        starConjunctions, 
        starInfo
      );
      
      return {
        success: true,
        data: {
          starName,
          found: true,
          starInfo,
          conjunctions: starConjunctions,
          detailedInterpretation,
          influenceLevel: this.assessStarInfluenceLevel(starConjunctions)
        },
        metadata: {
          calculationType: 'star_interpretation',
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      logger.error('❌ Error in getStarInterpretation:', error);
      return {
        success: false,
        error: error.message,
        metadata: {
          calculationType: 'star_interpretation',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Analyze paranatellonta (stars rising/setting with planets)
   * @param {Object} params - Analysis parameters
   * @param {Object} params.birthData - Birth data
   * @param {Object} params.location - Birth location
   * @returns {Object} Paranatellonta analysis
   */
  async analyzeParanatellonta(params) {
    try {
      this.validateParams(params, ['birthData', 'location']);
      
      const { birthData, location, options = {} } = params;
      
      // Get basic fixed stars analysis
      const fixedStarsAnalysis = await this.calculator.calculateFixedStarsAnalysis(birthData);
      
      // Calculate paranatellonta (simplified implementation)
      const paranatellonta = this.calculateParanatellonta(fixedStarsAnalysis, location);
      
      // Generate interpretations
      const interpretations = paranatellonta.map(para => ({
        ...para,
        interpretation: this.generateParanatellontaInterpretation(para)
      }));
      
      return {
        success: true,
        data: {
          paranatellonta: interpretations,
          significance: this.assessParanatellontaSignificance(paranatellonta),
          recommendations: this.generateParanatellontaRecommendations(paranatellonta)
        },
        metadata: {
          calculationType: 'paranatellonta_analysis',
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      logger.error('❌ Error in analyzeParanatellonta:', error);
      return {
        success: false,
        error: error.message,
        metadata: {
          calculationType: 'paranatellonta_analysis',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Generate detailed interpretations
   * @param {Object} fixedStarsAnalysis - Fixed stars analysis
   * @returns {Array} Detailed interpretations
   */
  generateDetailedInterpretations(fixedStarsAnalysis) {
    const interpretations = [];
    
    if (fixedStarsAnalysis.conjunctions && fixedStarsAnalysis.conjunctions.length > 0) {
      fixedStarsAnalysis.conjunctions.forEach(conjunction => {
        interpretations.push({
          type: 'conjunction',
          star: conjunction.star,
          planet: conjunction.planet,
          orb: conjunction.orb,
          interpretation: conjunction.interpretation,
          strength: this.assessConjunctionStrength(conjunction.orb),
          lifeArea: this.getLifeAreaForPlanet(conjunction.planet)
        });
      });
    }
    
    return interpretations;
  }

  /**
   * Assess star influences
   * @param {Object} fixedStarsAnalysis - Fixed stars analysis
   * @returns {Object} Star influences assessment
   */
  assessStarInfluences(fixedStarsAnalysis) {
    const influences = {
      dominant: [],
      supportive: [],
      challenging: [],
      overall: 'balanced'
    };
    
    if (fixedStarsAnalysis.conjunctions) {
      fixedStarsAnalysis.conjunctions.forEach(conjunction => {
        const influence = this.categorizeStarInfluence(conjunction.star, conjunction.planet);
        
        if (influence.type === 'dominant') {
          influences.dominant.push(conjunction);
        } else if (influence.type === 'supportive') {
          influences.supportive.push(conjunction);
        } else if (influence.type === 'challenging') {
          influences.challenging.push(conjunction);
        }
      });
    }
    
    // Determine overall influence
    if (influences.dominant.length > influences.supportive.length + influences.challenging.length) {
      influences.overall = 'dominant';
    } else if (influences.challenging.length > influences.dominant.length + influences.supportive.length) {
      influences.overall = 'challenging';
    } else if (influences.supportive.length > influences.dominant.length + influences.challenging.length) {
      influences.overall = 'supportive';
    }
    
    return influences;
  }

  /**
   * Identify life themes
   * @param {Object} fixedStarsAnalysis - Fixed stars analysis
   * @returns {Array} Life themes
   */
  identifyLifeThemes(fixedStarsAnalysis) {
    const themes = [];
    
    if (fixedStarsAnalysis.conjunctions) {
      const themeMap = {};
      
      fixedStarsAnalysis.conjunctions.forEach(conjunction => {
        const theme = this.getThemeForStar(conjunction.star);
        if (theme) {
          themeMap[theme] = (themeMap[theme] || 0) + 1;
        }
      });
      
      // Sort themes by frequency
      const sortedThemes = Object.entries(themeMap)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([theme, count]) => ({
          theme,
          strength: count > 1 ? 'strong' : 'moderate',
          relatedStars: fixedStarsAnalysis.conjunctions
            .filter(c => this.getThemeForStar(c.star) === theme)
            .map(c => c.star)
        }));
      
      themes.push(...sortedThemes);
    }
    
    return themes;
  }

  /**
   * Generate fixed stars summary
   * @param {Object} fixedStarsAnalysis - Fixed stars analysis
   * @returns {string} Summary
   */
  generateFixedStarsSummary(fixedStarsAnalysis) {
    let summary = fixedStarsAnalysis.introduction + '\n\n';
    
    if (fixedStarsAnalysis.conjunctions && fixedStarsAnalysis.conjunctions.length > 0) {
      summary += `Key connections:\n`;
      fixedStarsAnalysis.conjunctions.slice(0, 3).forEach((conjunction, index) => {
        summary += `${index + 1}. ${conjunction.star} with ${conjunction.planet}\n`;
      });
    } else {
      summary += 'No major fixed star conjunctions present in this chart.\n';
    }
    
    return summary;
  }

  /**
   * Generate specific star interpretation
   * @param {string} starName - Star name
   * @param {Array} conjunctions - Star conjunctions
   * @param {Object} starInfo - Star information
   * @returns {Object} Detailed interpretation
   */
  generateSpecificStarInterpretation(starName, conjunctions, starInfo) {
    const interpretation = {
      overview: '',
      influence: '',
      manifestation: '',
      advice: ''
    };
    
    if (starInfo) {
      interpretation.overview = `${starName} in ${starInfo.constellation}: ${starInfo.influence}`;
    }
    
    if (conjunctions.length > 0) {
      const planets = conjunctions.map(c => c.planet).join(', ');
      interpretation.influence = `${starName} influences your ${planets} energies, bringing ${starName.toLowerCase()}'s qualities into these life areas.`;
      interpretation.manifestation = this.generateManifestationDescription(starName, conjunctions);
      interpretation.advice = this.generateStarAdvice(starName, conjunctions);
    } else {
      interpretation.influence = `${starName} does not form major conjunctions in your chart, but its archetypal energy remains available for conscious connection.`;
    }
    
    return interpretation;
  }

  /**
   * Calculate paranatellonta
   * @param {Object} fixedStarsAnalysis - Fixed stars analysis
   * @param {Object} location - Birth location
   * @returns {Array} Paranatellonta
   */
  calculateParanatellonta(fixedStarsAnalysis, location) {
    // Simplified paranatellonta calculation
    const paranatellonta = [];
    
    // This would normally calculate actual rising/setting relationships
    // For now, return mock data based on conjunctions
    if (fixedStarsAnalysis.conjunctions) {
      fixedStarsAnalysis.conjunctions.forEach(conjunction => {
        if (Math.random() > 0.5) { // Random selection for demo
          paranatellonta.push({
            star: conjunction.star,
            planet: conjunction.planet,
            type: 'rising', // or 'setting', 'culminating', etc.
            strength: Math.random() * 3 + 1, // 1-4 scale
            significance: this.getParanatellontaSignificance(conjunction.star)
          });
        }
      });
    }
    
    return paranatellonta;
  }

  /**
   * Generate paranatellonta interpretation
   * @param {Object} para - Paranatellonta data
   * @returns {string} Interpretation
   */
  generateParanatellontaInterpretation(para) {
    return `${para.star} ${para.type} with ${para.planet} amplifies ${para.star.toLowerCase()}'s influence through ${para.planet.toLowerCase()}'s expression, creating a powerful focal point for ${para.significance}.`;
  }

  /**
   * Assess paranatellonta significance
   * @param {Array} paranatellonta - Paranatellonta array
   * @returns {Object} Significance assessment
   */
  assessParanatellontaSignificance(paranatellonta) {
    if (paranatellonta.length === 0) {
      return { level: 'minimal', description: 'No significant paranatellonta found' };
    }
    
    const totalStrength = paranatellonta.reduce((sum, para) => sum + para.strength, 0);
    const averageStrength = totalStrength / paranatellonta.length;
    
    if (averageStrength >= 3) {
      return { level: 'high', description: 'Strong paranatellonta influences present' };
    } else if (averageStrength >= 2) {
      return { level: 'moderate', description: 'Moderate paranatellonta influences' };
    } else {
      return { level: 'mild', description: 'Mild paranatellonta influences' };
    }
  }

  /**
   * Generate paranatellonta recommendations
   * @param {Array} paranatellonta - Paranatellonta array
   * @returns {Array} Recommendations
   */
  generateParanatellontaRecommendations(paranatellonta) {
    const recommendations = [];
    
    if (paranatellonta.length > 0) {
      recommendations.push({
        category: 'awareness',
        advice: 'Pay attention to timing and location when making important decisions',
        priority: 'medium'
      });
      
      recommendations.push({
        category: 'development',
        advice: 'Work consciously with the amplified energies of your paranatellonta',
        priority: 'low'
      });
    }
    
    return recommendations;
  }

  // Helper methods
  assessConjunctionStrength(orb) {
    const orbNum = parseFloat(orb);
    if (orbNum <= 0.5) return 'very strong';
    if (orbNum <= 1.0) return 'strong';
    if (orbNum <= 1.5) return 'moderate';
    return 'weak';
  }

  getLifeAreaForPlanet(planet) {
    const lifeAreas = {
      'Sun': 'identity and vitality',
      'Moon': 'emotions and intuition',
      'Mercury': 'communication and intellect',
      'Venus': 'love and values',
      'Mars': 'action and desire',
      'Jupiter': 'growth and wisdom',
      'Saturn': 'structure and discipline'
    };
    return lifeAreas[planet] || 'general life areas';
  }

  categorizeStarInfluence(starName, planet) {
    const dominantStars = ['Regulus', 'Sirius'];
    const supportiveStars = ['Spica', 'Vega', 'Fomalhaut'];
    const challengingStars = ['Antares', 'Aldebaran'];
    
    if (dominantStars.includes(starName)) {
      return { type: 'dominant', description: 'Powerful influence' };
    } else if (supportiveStars.includes(starName)) {
      return { type: 'supportive', description: 'Beneficial influence' };
    } else if (challengingStars.includes(starName)) {
      return { type: 'challenging', description: 'Intense influence requiring awareness' };
    }
    
    return { type: 'neutral', description: 'Moderate influence' };
  }

  getThemeForStar(starName) {
    const themes = {
      'Regulus': 'leadership',
      'Aldebaran': 'success',
      'Antares': 'transformation',
      'Fomalhaut': 'spirituality',
      'Spica': 'service',
      'Sirius': 'honor',
      'Vega': 'creativity'
    };
    return themes[starName];
  }

  generateManifestationDescription(starName, conjunctions) {
    const manifestations = {
      'Regulus': 'leadership opportunities and positions of authority',
      'Aldebaran': 'material success and public recognition',
      'Antares': 'intense transformations and power struggles',
      'Fomalhaut': 'spiritual insights and service-oriented success',
      'Spica': 'helpful relationships and harvest of efforts',
      'Sirius': 'honor, wealth and divine favor',
      'Vega': 'artistic success and creative expression'
    };
    
    return manifestations[starName] || 'unique manifestations of stellar energy';
  }

  generateStarAdvice(starName, conjunctions) {
    const advice = {
      'Regulus': 'Use leadership power wisely and with integrity',
      'Aldebaran': 'Channel success energy constructively and avoid conflicts',
      'Antares': 'Embrace transformation while maintaining balance',
      'Fomalhaut': 'Combine spiritual wisdom with practical action',
      'Spica': 'Serve others while maintaining healthy boundaries',
      'Sirius': 'Accept honor with humility and use it for good',
      'Vega': 'Express creativity authentically and share with others'
    };
    
    return advice[starName] || 'Work consciously with stellar energies';
  }

  assessStarInfluenceLevel(conjunctions) {
    if (conjunctions.length === 0) return 'none';
    if (conjunctions.length === 1) return 'moderate';
    if (conjunctions.length === 2) return 'strong';
    return 'very strong';
  }

  getParanatellontaSignificance(starName) {
    const significance = {
      'Regulus': 'leadership and authority',
      'Aldebaran': 'success and achievement',
      'Antares': 'transformation and power',
      'Fomalhaut': 'spiritual wisdom',
      'Spica': 'service and harvest',
      'Sirius': 'honor and recognition',
      'Vega': 'creative expression'
    };
    
    return significance[starName] || 'stellar influence';
  }

  formatResult(result) {
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
      service: this.serviceName
    };
  }

  validate(birthData) {
    if (!birthData) {
      throw new Error('Birth data is required');
    }

    const required = ['birthDate', 'birthTime', 'birthPlace'];
    for (const field of required) {
      if (!birthData[field]) {
        throw new Error(`${field} is required for fixed stars analysis`);
      }
    }

    return true;
  }

  getMetadata() {
    return {
      name: this.serviceName,
      version: '1.0.0',
      category: 'vedic',
      methods: ['analyzeFixedStars', 'getStarInterpretation', 'analyzeParanatellonta'],
      dependencies: ['FixedStarsCalculator']
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

module.exports = FixedStarsService;