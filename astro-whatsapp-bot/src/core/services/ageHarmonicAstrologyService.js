const ServiceTemplate = require('./ServiceTemplate');
const logger = require('../../utils/logger');

// Import calculator from legacy structure
const { AgeHarmonicAstrologyCalculator } = require('./calculators/AgeHarmonicAstrologyCalculator');

/**
 * AgeHarmonicAstrologyService - Specialized service for age harmonic astrology analysis
 *
 * Age harmonic astrology analyzes life stages through harmonic divisions of lifespan,
 * revealing rhythmic cycles and developmental phases. This ancient technique
 * creates mathematical divisions of one's life to identify key periods of focus
 * and transformation based on harmonic resonance patterns.
 */
class AgeHarmonicAstrologyService extends ServiceTemplate {
  constructor() {
    super('AgeHarmonicAstrologyCalculator');
    this.serviceName = 'AgeHarmonicAstrologyService';
    this.calculatorPath = './calculators/AgeHarmonicAstrologyCalculator';
    logger.info('AgeHarmonicAstrologyService initialized');
  }

  async processCalculation(birthData) {
    try {
      // Validate input
      this.validate(birthData);

      // Generate age harmonic analysis using ServiceTemplate calculator
      const result = await this.calculator.generateAgeHarmonicAnalysis(birthData);

      return result;
    } catch (error) {
      logger.error('AgeHarmonicAstrologyService calculation error:', error);
      throw new Error(`Age harmonic astrology analysis failed: ${error.message}`);
    }
  }

  /**
   * Generate life stage analysis based on age harmonics
   * @param {Object} params - Analysis parameters
   * @param {Object} params.birthData - Birth data
   * @param {number} params.targetAge - Target age for analysis
   * @returns {Object} Life stage analysis
   */
  async analyzeLifeStage(params) {
    try {
      this.validateParams(params, ['birthData']);

      const { birthData, targetAge } = params;
      const age = targetAge || this.extractAgeFromBirthData(birthData);

      // Generate analysis for specific age using ServiceTemplate calculator
      const analysis = await this.calculator.generateAgeHarmonicAnalysis(birthData, age);

      return {
        success: true,
        data: {
          age: age,
          analysis: analysis,
          lifeStage: analysis.lifeStage,
          harmonicPeriods: analysis.currentHarmonics,
          planetaryInfluences: analysis.planetaryHarmonics
        },
        metadata: {
          calculationType: 'life_stage_analysis',
          timestamp: new Date().toISOString(),
          targetAge: age
        }
      };
    } catch (error) {
      logger.error('❌ Error in analyzeLifeStage:', error);
      return {
        success: false,
        error: error.message,
        metadata: {
          calculationType: 'life_stage_analysis',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Predict upcoming harmonic transitions
   * @param {Object} params - Prediction parameters
   * @param {Object} params.birthData - Birth data
   * @param {number} params.yearsToPredict - Number of years ahead to predict
   * @returns {Object} Transition predictions
   */
  async predictHarmonicTransitions(params) {
    try {
      this.validateParams(params, ['birthData', 'yearsToPredict']);

      const { birthData, yearsToPredict } = params;
      const currentAge = this.extractAgeFromBirthData(birthData);
      
      const transitions = [];
      const calculator = new AgeHarmonicAstrologyCalculator();

      // Check for upcoming harmonic transitions
      for (let i = 1; i <= yearsToPredict; i++) {
        const futureAge = currentAge + i;
        
        // Get harmonic periods for this future age
        const futureAnalysis = await calculator.generateAgeHarmonicAnalysis(
          birthData,
          futureAge
        );
        
        if (futureAnalysis.currentHarmonics && futureAnalysis.currentHarmonics.length > 0) {
          // Check if this represents a new harmonic period
          const currentHarmonics = await calculator.generateAgeHarmonicAnalysis(
            birthData,
            currentAge
          );
          
          const newHarmonics = futureAnalysis.currentHarmonics.filter(fh => 
            !currentHarmonics.currentHarmonics.some(ch => 
              ch.harmonic === fh.harmonic && ch.name === fh.name
            )
          );
          
          if (newHarmonics.length > 0) {
            transitions.push({
              age: futureAge,
              year: new Date().getFullYear() + i,
              newHarmonics: newHarmonics,
              description: `Transition to harmonic ${newHarmonics[0].harmonic} (${newHarmonics[0].name})`
            });
          }
        }
      }

      return {
        success: true,
        data: {
          currentAge,
          yearsPredicted: yearsToPredict,
          transitions,
          nextTransition: transitions.length > 0 ? transitions[0] : null
        },
        metadata: {
          calculationType: 'harmonic_transition_prediction',
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      logger.error('❌ Error in predictHarmonicTransitions:', error);
      return {
        success: false,
        error: error.message,
        metadata: {
          calculationType: 'harmonic_transition_prediction',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Generate harmonic compatibility analysis between two individuals
   * @param {Object} params - Compatibility parameters
   * @param {Object} params.birthData1 - First person's birth data
   * @param {Object} params.birthData2 - Second person's birth data
   * @returns {Object} Compatibility analysis
   */
  async analyzeHarmonicCompatibility(params) {
    try {
      this.validateParams(params, ['birthData1', 'birthData2']);

      const { birthData1, birthData2 } = params;
      const age1 = this.extractAgeFromBirthData(birthData1);
      const age2 = this.extractAgeFromBirthData(birthData2);

      const calculator = new AgeHarmonicAstrologyCalculator();
      
      // Get harmonic analyses for both individuals
      const analysis1 = await calculator.generateAgeHarmonicAnalysis(birthData1, age1);
      const analysis2 = await calculator.generateAgeHarmonicAnalysis(birthData2, age2);

      // Compare harmonic periods
      const compatibility = this.calculateHarmonicCompatibility(analysis1, analysis2);

      return {
        success: true,
        data: {
          person1: {
            name: birthData1.name,
            age: age1,
            harmonics: analysis1.currentHarmonics
          },
          person2: {
            name: birthData2.name,
            age: age2,
            harmonics: analysis2.currentHarmonics
          },
          compatibility: compatibility,
          analysis: this.generateCompatibilityInsights(analysis1, analysis2)
        },
        metadata: {
          calculationType: 'harmonic_compatibility',
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      logger.error('❌ Error in analyzeHarmonicCompatibility:', error);
      return {
        success: false,
        error: error.message,
        metadata: {
          calculationType: 'harmonic_compatibility',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Calculate harmonic compatibility between two analyses
   * @param {Object} analysis1 - First person's harmonic analysis
   * @param {Object} analysis2 - Second person's harmonic analysis
   * @returns {Object} Compatibility score
   */
  calculateHarmonicCompatibility(analysis1, analysis2) {
    // Calculate compatibility based on harmonic alignment
    const harmonics1 = analysis1.currentHarmonics || [];
    const harmonics2 = analysis2.currentHarmonics || [];

    // Look for shared harmonic periods or complementary harmonics
    let compatibilityScore = 50; // Base score
    let compatibilityFactors = [];

    // Check for matching harmonics
    for (const h1 of harmonics1) {
      for (const h2 of harmonics2) {
        if (h1.harmonic === h2.harmonic) {
          compatibilityScore += 15; // Significant alignment
          compatibilityFactors.push(`Shared harmonic ${h1.harmonic} (${h1.name})`);
        } else if (Math.abs(h1.harmonic - h2.harmonic) === 1) {
          compatibilityScore += 8; // Adjacent harmonics
          compatibilityFactors.push(`Adjacent harmonics ${h1.harmonic} and ${h2.harmonic}`);
        } else if (h1.harmonic % 2 === 0 && h2.harmonic % 2 === 0) {
          compatibilityScore += 5; // Even harmonics alignment
        } else if (h1.harmonic % 2 === 1 && h2.harmonic % 2 === 1) {
          compatibilityScore += 5; // Odd harmonics alignment
        }
      }
    }

    // Cap at 100
    compatibilityScore = Math.min(100, compatibilityScore);

    return {
      score: compatibilityScore,
      factors: compatibilityFactors,
      rating: this.getCompatibilityRating(compatibilityScore)
    };
  }

  /**
   * Generate compatibility insights
   * @param {Object} analysis1 - First person's analysis
   * @param {Object} analysis2 - Second person's analysis
   * @returns {Object} Insights
   */
  generateCompatibilityInsights(analysis1, analysis2) {
    const insights = [];

    // Life stage compatibility
    if (analysis1.lifeStage && analysis2.lifeStage) {
      if (analysis1.lifeStage.stage === analysis2.lifeStage.stage) {
        insights.push({
          type: 'alignment',
          description: `Both individuals are in the ${analysis1.lifeStage.stage.replace('_', ' ')} life stage, creating natural alignment in life focus and priorities.`
        });
      } else {
        insights.push({
          type: 'complementarity',
          description: `Different life stages (${analysis1.lifeStage.stage.replace('_', ' ')} vs ${analysis2.lifeStage.stage.replace('_', ' ')}) can create complementary dynamics where each supports the other's developmental needs.`
        });
      }
    }

    return insights;
  }

  /**
   * Get compatibility rating based on score
   * @param {number} score - Compatibility score
   * @returns {string} Rating
   */
  getCompatibilityRating(score) {
    if (score >= 80) return 'Excellent';
    if (score >= 65) return 'Very Good';
    if (score >= 50) return 'Good';
    if (score >= 35) return 'Fair';
    return 'Poor';
  }

  /**
   * Extract age from birth data
   * @param {Object} birthData - Birth data
   * @returns {number} Age
   */
  extractAgeFromBirthData(birthData) {
    if (birthData.currentAge !== undefined) {
      return birthData.currentAge;
    }

    if (birthData.birthDate) {
      const [day, month, year] = birthData.birthDate.split('/').map(Number);
      const birthYear = year < 100 ? 1900 + year : year;
      const birthDateObj = new Date(birthYear, month - 1, day);
      const today = new Date();
      return Math.floor((today - birthDateObj) / (365.25 * 24 * 60 * 60 * 1000));
    }

    // Default to 30 if unable to calculate
    return 30;
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
      throw new Error('Birth data is required for age harmonic astrology analysis');
    }

    // Birth data must have at least date information
    if (!birthData.birthDate) {
      throw new Error('Birth date is required for age harmonic astrology analysis');
    }

    return true;
  }

  getMetadata() {
    return {
      name: this.serviceName,
      version: '1.0.0',
      category: 'predictive',
      methods: [
        'analyzeLifeStage',
        'predictHarmonicTransitions', 
        'analyzeHarmonicCompatibility'
      ],
      dependencies: ['AgeHarmonicAstrologyCalculator']
    };
  }

  async getHealthStatus() {
    try {
      const baseHealth = await super.getHealthStatus();
      return {
        ...baseHealth,
        features: {
          harmonicPeriods: Object.keys(this.harmonicPeriods || {}).length || 18,
          supportedAnalyses: ['lifeStage', 'transitions', 'compatibility']
        }
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

module.exports = AgeHarmonicAstrologyService;