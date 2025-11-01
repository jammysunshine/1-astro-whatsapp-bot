const ServiceTemplate = require('../ServiceTemplate');
const logger = require('../../../utils/logger');

/**
 * Horary Astrology Service
 * Provides comprehensive horary astrology calculations for question-based readings
 * Extends ServiceTemplate for standardized service architecture
 */
class HoraryAstrologyService extends ServiceTemplate {
  constructor(services) {
    super('PrashnaCalculator');
    this.calculatorPath = '../calculators/PrashnaCalculator';
    // Initialize Horary Calculator
    this.calculator = new PrashnaCalculator();

    // Set services in calculator
    this.calculator.setServices(services);

    // Service-specific configuration
    this.serviceConfig = {
      supportedInputs: ['horaryData', 'birthData'],
      requiredInputs: ['horaryData'],
      outputFormats: ['detailed', 'summary', 'chart-analysis'],
      questionCategories: {
        relationship: 'Questions about love, marriage, partnerships',
        career: 'Questions about job, business, professional matters',
        financial: 'Questions about money, investments, gains',
        health: 'Questions about wellness, medical matters',
        legal: 'Questions about legal issues, court cases',
        lost_items: 'Questions about finding lost objects or people',
        general: 'General life questions and guidance'
      },
      chartFactors: {
        planetary: 'Planetary positions and aspects at question time',
        houses: 'House placements and rulerships',
        aspects: 'Planetary aspects and configurations',
        lunar: 'Moon position and aspects for timing',
        planetaryHour: 'Planetary hour ruler influences'
      }
    };
  }

  /**
   * Process Horary Astrology calculation using ServiceTemplate pattern
   * @param {Object} params - Calculation parameters
   * @returns {Promise<Object>} Formatted Horary Astrology analysis
   */
  async processCalculation(params) {
    const { horaryData, options = {} } = params;

    try {
      // Validate inputs
      this._validateInputs(horaryData);

      // Cast horary chart using calculator
      const horaryChart = this.calculator.castHoraryChart(
        horaryData.questionTime,
        horaryData.location
      );

      // Analyze horary question
      const horaryAnalysis = await this._analyzeHoraryQuestion(horaryData, horaryChart);

      // Add service metadata
      horaryAnalysis.serviceMetadata = {
        serviceName: this.serviceName,
        calculationType: 'Horary Astrology',
        timestamp: new Date().toISOString(),
        method: 'Traditional horary astrology with Swiss Ephemeris calculations',
        questionCategory: horaryData.category || 'general',
        chartType: 'Horary (Question Time)',
        calculationApproach: 'Chart casting at moment of question'
      };

      // Add enhanced analysis
      horaryAnalysis.enhancedAnalysis = this._performEnhancedHoraryAnalysis(horaryAnalysis, horaryData);

      return horaryAnalysis;
    } catch (error) {
      logger.error(`❌ Error in ${this.serviceName} calculation:`, error);
      throw new Error(`Horary Astrology calculation failed: ${error.message}`);
    }
  }

  /**
   * Format Horary Astrology result for WhatsApp output
   * @param {Object} result - Calculation result
   * @returns {string} Formatted WhatsApp message
   */
  formatResult(result) {
    if (!result || !result.horaryChart) {
      return '❌ *Horary Astrology Analysis Error*\n\nUnable to generate horary astrology analysis. Please check your question details and try again.';
    }

    let formatted = '❓ *Horary Astrology Analysis*\n\n';

    // Add question details
    formatted += `*Question:* ${result.question}\n`;
    formatted += `*Time Asked:* ${result.questionTime}\n`;
    formatted += `*Location:* ${result.location?.city || 'Unknown'}\n\n`;

    // Add chart overview
    if (result.horaryChart) {
      formatted += '*🌟 Horary Chart Overview:*\n';
      if (result.horaryChart.ascendant) {
        formatted += `• **Ascendant:** ${result.horaryChart.ascendant.sign} ${result.horaryChart.ascendant.degree}°\n`;
      }
      if (result.horaryChart.planetaryHour) {
        formatted += `• **Planetary Hour:** ${result.horaryChart.planetaryHour}\n`;
      }
      formatted += '\n';
    }

    // Add significators
    if (result.significators) {
      formatted += '*🎯 Question Significators:*\n';
      if (result.significators.querent) {
        formatted += `• **Querent (Questioner):** ${result.significators.querent}\n`;
      }
      if (result.significators.quesited) {
        formatted += `• **Quesited (Question Matter):** ${result.significators.quesited}\n`;
      }
      if (result.significators.moon) {
        formatted += `• **Moon (Timing):** ${result.significators.moon}\n`;
      }
      formatted += '\n';
    }

    // Add planetary positions
    if (result.horaryChart?.planetaryPositions) {
      formatted += '*🪐 Planetary Positions:*\n';
      Object.entries(result.horaryChart.planetaryPositions).forEach(([planet, position]) => {
        if (position.sign && position.house) {
          formatted += `• **${planet.charAt(0).toUpperCase() + planet.slice(1)}:** ${position.sign} in House ${position.house}\n`;
        }
      });
      formatted += '\n';
    }

    // Add answer analysis
    if (result.answerAnalysis) {
      formatted += '*💫 Answer Analysis:*\n';
      if (result.answerAnalysis.overallIndication) {
        formatted += `• **Overall:** ${result.answerAnalysis.overallIndication}\n`;
      }
      if (result.answerAnalysis.probability) {
        formatted += `• **Probability:** ${result.answerAnalysis.probability}\n`;
      }
      if (result.answerAnalysis.timing) {
        formatted += `• **Timing:** ${result.answerAnalysis.timing}\n`;
      }
      if (result.answerAnalysis.factors) {
        formatted += `• **Key Factors:** ${result.answerAnalysis.factors}\n`;
      }
      formatted += '\n';
    }

    // Add aspects analysis
    if (result.aspectsAnalysis) {
      formatted += '*⚡ Planetary Aspects:*\n';
      if (result.aspectsAnalysis.majorAspects && result.aspectsAnalysis.majorAspects.length > 0) {
        result.aspectsAnalysis.majorAspects.slice(0, 3).forEach(aspect => {
          formatted += `• **${aspect.planet1} ${aspect.type} ${aspect.planet2}:** ${aspect.interpretation}\n`;
        });
      }
      formatted += '\n';
    }

    // Add enhanced analysis if available
    if (result.enhancedAnalysis) {
      formatted += '*🎭 Enhanced Horary Analysis:*\n';

      if (result.enhancedAnalysis.chartQuality) {
        formatted += `• **Chart Quality:** ${result.enhancedAnalysis.chartQuality}\n`;
      }

      if (result.enhancedAnalysis.answerClarity) {
        formatted += `• **Answer Clarity:** ${result.enhancedAnalysis.answerClarity}\n`;
      }

      if (result.enhancedAnalysis.recommendations) {
        formatted += `• **Recommendations:** ${result.enhancedAnalysis.recommendations}\n`;
      }

      if (result.enhancedAnalysis.caveats) {
        formatted += `• **Important Notes:** ${result.enhancedAnalysis.caveats}\n`;
      }

      formatted += '\n';
    }

    // Add timing information
    if (result.timingAnalysis) {
      formatted += '*⏰ Timing Analysis:*\n';
      if (result.timingAnalysis.immediate) {
        formatted += `• **Immediate:** ${result.timingAnalysis.immediate}\n`;
      }
      if (result.timingAnalysis.shortTerm) {
        formatted += `• **Short Term:** ${result.timingAnalysis.shortTerm}\n`;
      }
      if (result.timingAnalysis.longTerm) {
        formatted += `• **Long Term:** ${result.timingAnalysis.longTerm}\n`;
      }
      formatted += '\n';
    }

    // Add summary
    if (result.summary) {
      formatted += `*📋 Summary:*\n${result.summary}\n\n`;
    }

    // Add service footer
    formatted += '---\n*Horary Astrology - Answering Questions Through Chart Casting*';

    return formatted;
  }

  /**
   * Validate input parameters for Horary Astrology calculation
   * @param {Object} horaryData - Horary data object
   * @private
   */
  _validateInputs(horaryData) {
    if (!horaryData) {
      throw new Error('Horary data is required for question analysis');
    }

    if (!horaryData.question || horaryData.question.trim().length === 0) {
      throw new Error('A valid question is required for horary astrology analysis');
    }

    if (!horaryData.questionTime) {
      throw new Error('Question time is required for horary chart casting');
    }

    if (!horaryData.location) {
      throw new Error('Location is required for accurate horary astrology calculation');
    }
  }

  /**
   * Analyze horary question using chart data
   * @param {Object} horaryData - Question data
   * @param {Object} horaryChart - Cast horary chart
   * @returns {Object} Question analysis
   * @private
   */
  async _analyzeHoraryQuestion(horaryData, horaryChart) {
    try {
      // Categorize question
      const category = this._categorizeQuestion(horaryData.question);

      // Identify significators
      const significators = this._identifySignificators(category, horaryChart);

      // Analyze aspects
      const aspectsAnalysis = this._analyzeAspects(horaryChart);

      // Determine answer
      const answerAnalysis = this._determineAnswer(significators, aspectsAnalysis, category);

      // Analyze timing
      const timingAnalysis = this._analyzeTiming(horaryChart, significators);

      return {
        question: horaryData.question,
        questionTime: horaryData.questionTime,
        location: horaryData.location,
        category,
        horaryChart,
        significators,
        aspectsAnalysis,
        answerAnalysis,
        timingAnalysis,
        summary: this._generateHorarySummary(answerAnalysis, timingAnalysis)
      };
    } catch (error) {
      logger.error('Error analyzing horary question:', error);
      throw new Error(`Horary question analysis failed: ${error.message}`);
    }
  }

  /**
   * Perform enhanced analysis on Horary Astrology results
   * @param {Object} result - Horary calculation result
   * @param {Object} horaryData - Original request data
   * @returns {Object} Enhanced analysis
   * @private
   */
  _performEnhancedHoraryAnalysis(result, horaryData) {
    const analysis = {
      chartQuality: '',
      answerClarity: '',
      recommendations: '',
      caveats: '',
      confidenceLevel: ''
    };

    // Assess chart quality
    if (result.horaryChart?.ascendant && result.significators) {
      const strongSignificators = Object.values(result.significators).filter(sig => sig && sig.strength > 70).length;
      const totalSignificators = Object.values(result.significators).filter(sig => sig).length;

      if (strongSignificators >= totalSignificators * 0.7) {
        analysis.chartQuality = 'Excellent chart with strong significators';
        analysis.answerClarity = 'High clarity - clear indications present';
        analysis.confidenceLevel = 'High';
      } else if (strongSignificators >= totalSignificators * 0.5) {
        analysis.chartQuality = 'Good chart with moderate significators';
        analysis.answerClarity = 'Moderate clarity - some ambiguity present';
        analysis.confidenceLevel = 'Moderate';
      } else {
        analysis.chartQuality = 'Challenging chart with weak significators';
        analysis.answerClarity = 'Low clarity - significant ambiguity';
        analysis.confidenceLevel = 'Low';
      }
    }

    // Generate recommendations
    if (result.answerAnalysis?.probability) {
      if (result.answerAnalysis.probability.includes('High')) {
        analysis.recommendations = 'Proceed with confidence - chart supports positive outcome';
      } else if (result.answerAnalysis.probability.includes('Moderate')) {
        analysis.recommendations = 'Proceed with caution - mixed indications present';
      } else {
        analysis.recommendations = 'Consider alternatives - chart suggests challenges';
      }
    }

    // Add caveats
    analysis.caveats = [
      'Horary charts represent momentary states - circumstances can change',
      'Free will and personal effort influence outcomes',
      'Chart provides guidance, not absolute predictions',
      'Consider practical factors alongside astrological indications'
    ].join('. ');

    return analysis;
  }

  /**
   * Categorize horary question
   * @param {string} question - User's question
   * @returns {string} Question category
   * @private
   */
  _categorizeQuestion(question) {
    const lowerQuestion = question.toLowerCase();

    if (lowerQuestion.includes('marry') || lowerQuestion.includes('marriage') || lowerQuestion.includes('relationship')) {
      return 'relationship';
    } else if (lowerQuestion.includes('job') || lowerQuestion.includes('career') || lowerQuestion.includes('business')) {
      return 'career';
    } else if (lowerQuestion.includes('money') || lowerQuestion.includes('financial') || lowerQuestion.includes('investment')) {
      return 'financial';
    } else if (lowerQuestion.includes('health') || lowerQuestion.includes('medical') || lowerQuestion.includes('illness')) {
      return 'health';
    } else if (lowerQuestion.includes('legal') || lowerQuestion.includes('court') || lowerQuestion.includes('lawsuit')) {
      return 'legal';
    } else if (lowerQuestion.includes('lost') || lowerQuestion.includes('missing') || lowerQuestion.includes('find')) {
      return 'lost_items';
    } else {
      return 'general';
    }
  }

  /**
   * Identify significators for the question
   * @param {string} category - Question category
   * @param {Object} chart - Horary chart
   * @returns {Object} Significators
   * @private
   */
  _identifySignificators(category, chart) {
    const significators = {};

    // Querent (person asking) - always ascendant ruler
    if (chart.ascendant) {
      significators.querent = this._getSignLord(chart.ascendant.sign);
    }

    // Quesited (matter asked about) - varies by category
    const categoryHouses = {
      relationship: [7, 5, 11],  // 7th (partnership), 5th (love), 11th (friendships)
      career: [10, 6, 2],        // 10th (career), 6th (work), 2nd (income)
      financial: [2, 11, 8],       // 2nd (money), 11th (gains), 8th (other's money)
      health: [1, 6, 8, 12],     // 1st (body), 6th/8th/12th (health)
      legal: [6, 9, 10],          // 6th (enemies), 9th (law), 10th (authority)
      lost_items: [2, 12],          // 2nd (possessions), 12th (loss/hidden)
      general: [1, 3, 9]           // 1st (general), 3rd (communication), 9th (guidance)
    };

    const houses = categoryHouses[category] || categoryHouses.general;
    significators.quesited = this._getHouseLord(houses[0], chart);

    // Moon for timing
    significators.moon = 'moon';

    return significators;
  }

  /**
   * Analyze planetary aspects in horary chart
   * @param {Object} chart - Horary chart
   * @returns {Object} Aspects analysis
   * @private
   */
  _analyzeAspects(chart) {
    const aspects = { majorAspects: [] };

    if (!chart.planetaryPositions) { return aspects; }

    const planets = Object.entries(chart.planetaryPositions);

    for (let i = 0; i < planets.length; i++) {
      for (let j = i + 1; j < planets.length; j++) {
        const [planet1, pos1] = planets[i];
        const [planet2, pos2] = planets[j];

        if (pos1.longitude && pos2.longitude) {
          const angle = Math.abs(pos1.longitude - pos2.longitude);
          const minAngle = Math.min(angle, 360 - angle);

          // Check for major aspects (conjunction, opposition, trine, square)
          if (minAngle <= 8) { // Conjunction
            aspects.majorAspects.push({
              planet1,
              planet2,
              type: 'conjunction',
              angle: minAngle,
              interpretation: this._interpretAspect('conjunction', planet1, planet2)
            });
          } else if (Math.abs(minAngle - 180) <= 8) { // Opposition
            aspects.majorAspects.push({
              planet1,
              planet2,
              type: 'opposition',
              angle: minAngle,
              interpretation: this._interpretAspect('opposition', planet1, planet2)
            });
          } else if (Math.abs(minAngle - 120) <= 8) { // Trine
            aspects.majorAspects.push({
              planet1,
              planet2,
              type: 'trine',
              angle: minAngle,
              interpretation: this._interpretAspect('trine', planet1, planet2)
            });
          } else if (Math.abs(minAngle - 90) <= 8) { // Square
            aspects.majorAspects.push({
              planet1,
              planet2,
              type: 'square',
              angle: minAngle,
              interpretation: this._interpretAspect('square', planet1, planet2)
            });
          }
        }
      }
    }

    return aspects;
  }

  /**
   * Determine answer based on significators and aspects
   * @param {Object} significators - Chart significators
   * @param {Object} aspects - Aspects analysis
   * @param {string} category - Question category
   * @returns {Object} Answer analysis
   * @private
   */
  _determineAnswer(significators, aspects, category) {
    const analysis = {
      overallIndication: '',
      probability: '',
      timing: '',
      factors: []
    };

    // Count positive and negative aspects
    const positiveAspects = aspects.majorAspects.filter(a =>
      a.type === 'trine' || a.type === 'conjunction'
    ).length;
    const negativeAspects = aspects.majorAspects.filter(a =>
      a.type === 'square' || a.type === 'opposition'
    ).length;

    // Determine overall indication
    if (positiveAspects > negativeAspects) {
      analysis.overallIndication = 'Positive indications for your question';
      analysis.probability = 'High probability of favorable outcome';
      analysis.timing = 'Relatively quick resolution indicated';
    } else if (negativeAspects > positiveAspects) {
      analysis.overallIndication = 'Challenging indications for your question';
      analysis.probability = 'Low probability of favorable outcome';
      analysis.timing = 'Delayed resolution likely';
    } else {
      analysis.overallIndication = 'Mixed indications for your question';
      analysis.probability = 'Moderate probability of outcome';
      analysis.timing = 'Uncertain timing - watch developments';
    }

    // Add key factors
    if (positiveAspects > 0) {
      analysis.factors.push('Supportive planetary aspects present');
    }
    if (negativeAspects > 0) {
      analysis.factors.push('Challenging planetary aspects present');
    }
    if (significators.querent && significators.quesited) {
      analysis.factors.push('Clear significators identified');
    }

    return analysis;
  }

  /**
   * Analyze timing indications
   * @param {Object} chart - Horary chart
   * @param {Object} significators - Chart significators
   * @returns {Object} Timing analysis
   * @private
   */
  _analyzeTiming(chart, significators) {
    const timing = {
      immediate: '',
      shortTerm: '',
      longTerm: ''
    };

    // Moon position indicates timing
    if (chart.planetaryPositions?.moon) {
      const moonHouse = chart.planetaryPositions.moon.house;

      if (moonHouse === 1 || moonHouse === 4 || moonHouse === 7 || moonHouse === 10) {
        timing.immediate = 'Quick resolution possible (Moon in angular house)';
        timing.shortTerm = 'Developments within days to weeks';
      } else if (moonHouse === 2 || moonHouse === 5 || moonHouse === 8 || moonHouse === 11) {
        timing.immediate = 'Moderate timing expected (Moon in succedent house)';
        timing.shortTerm = 'Developments within weeks to months';
      } else {
        timing.immediate = 'Delayed response indicated (Moon in cadent house)';
        timing.shortTerm = 'Developments may take months';
      }
    }

    // Planetary hour influences
    if (chart.planetaryHour) {
      timing.longTerm = `Planetary hour ruler: ${chart.planetaryHour} - influences overall outcome`;
    }

    return timing;
  }

  /**
   * Generate horary summary
   * @param {Object} answerAnalysis - Answer analysis
   * @param {Object} timingAnalysis - Timing analysis
   * @returns {string} Summary
   * @private
   */
  _generateHorarySummary(answerAnalysis, timingAnalysis) {
    let summary = 'Based on the horary chart cast at the time of your question:\n\n';
    summary += `**Overall Indication:** ${answerAnalysis.overallIndication}\n`;
    summary += `**Probability:** ${answerAnalysis.probability}\n`;
    summary += `**Timing:** ${timingAnalysis.immediate}\n\n`;
    summary += 'Horary astrology provides guidance based on planetary positions at the moment of questioning. Consider this analysis alongside practical factors and personal judgment.';

    return summary;
  }

  // Helper methods
  _getSignLord(sign) {
    const lords = ['mars', 'venus', 'mercury', 'moon', 'sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'saturn', 'jupiter'];
    return lords[sign - 1] || 'unknown';
  }

  _getHouseLord(house, chart) {
    if (!chart.houses || !chart.houses[house - 1]) { return 'unknown'; }
    return this._getSignLord(chart.houses[house - 1].sign);
  }

  _interpretAspect(type, planet1, planet2) {
    const interpretations = {
      conjunction: 'Strong connection between energies',
      opposition: 'Tension and conflict between energies',
      trine: 'Harmonious flow of energies',
      square: 'Challenge and growth opportunity'
    };
    return interpretations[type] || 'Aspect present';
  }

  /**
   * Calculate confidence score for Horary Astrology analysis
   * @param {Object} result - Calculation result
   * @returns {number} Confidence score (0-100)
   */
  calculateConfidence(result) {
    let confidence = 70; // Base confidence for Horary Astrology

    // Increase confidence based on chart quality
    if (result.enhancedAnalysis?.confidenceLevel === 'High') {
      confidence += 20;
    } else if (result.enhancedAnalysis?.confidenceLevel === 'Moderate') {
      confidence += 10;
    }

    // Increase confidence for complete analysis
    if (result.significators && result.aspectsAnalysis && result.answerAnalysis) {
      confidence += 10;
    }

    // Increase confidence for clear significators
    if (result.significators?.querent && result.significators?.quesited) {
      confidence += 5;
    }

    return Math.max(0, Math.min(100, Math.round(confidence)));
  }

  /**
   * Validate calculation result
   * @param {Object} result - Calculation result
   * @returns {boolean} True if valid
   */
  validateResult(result) {
    return (
      result &&
      typeof result === 'object' &&
      result.horaryChart &&
      result.question &&
      result.answerAnalysis
    );
  }

  /**
   * Get service-specific help
   * @returns {string} Help information
   */
  getHelp() {
    return `
 ❓ **Horary Astrology Service - Question-Based Astrological Guidance**

**Purpose:** Provides answers to specific questions by casting a horary chart at the exact moment the question is asked

**Required Inputs:**
• Your specific question (clear and focused)
• Question time (when you thought of/asked the question)
• Location (where you are when asking)

**Question Categories Supported:**

**💕 Relationship Questions:**
• Marriage and partnership matters
• Love and relationship compatibility
• Family and friendship issues
• Relationship outcomes

**💼 Career Questions:**
• Job changes and opportunities
• Business decisions
• Professional growth
• Work-related matters

**💰 Financial Questions:**
• Investment decisions
• Money matters
• Financial opportunities
• Income prospects

**🏥 Health Questions:**
• Wellness concerns
• Medical decisions
• Health matters
• Treatment outcomes

**⚖️ Legal Questions:**
• Legal issues and disputes
• Court case outcomes
• Contract matters
• Legal proceedings

**🔍 Lost Items:**
• Finding lost objects
• Missing people or pets
• Recovery of possessions

**🌟 General Questions:**
• Life guidance
• Decision making
• Personal matters
• General inquiries

**How Horary Astrology Works:**

**🌟 Chart Casting:**
• Chart is cast at the exact moment of question
• Planetary positions are frozen at that moment
• Chart represents the "birth" of the question

**🎯 Significators:**
• **Querent:** Person asking the question (Ascendant ruler)
• **Quesited:** Matter being asked about (varies by category)
• **Moon:** Timing and general indications
• **Planetary Hour:** Additional timing influences

**⚡ Aspect Analysis:**
• **Conjunctions:** Strong connections between planetary energies
• **Oppositions:** Tension and conflict between energies
• **Trines:** Harmonious flow and support
• **Squares:** Challenges and growth opportunities

**⏰ Timing Indications:**
• **Moon in Angular Houses (1,4,7,10):** Quick resolution
• **Moon in Succedent Houses (2,5,8,11):** Moderate timing
• **Moon in Cadent Houses (3,6,9,12):** Delayed resolution

**Answer Probability:**
• **High:** Strong positive indicators
• **Moderate:** Mixed or balanced indicators
• **Low:** Challenging indicators present

**Best Practices:**
• Ask clear, specific questions
• Note the exact time you thought of the question
• Be in a calm, focused state
• Ask important questions only once
• Avoid asking during emotional distress

**Question Examples:**
• "Will I get the job I applied for?"
• "Should I move to a new city?"
• "Will I find my lost keys?"
• "Is this relationship right for me?"
• "Should I invest in this opportunity?"

**Output Includes:**
• Horary chart overview with ascendant and planetary hour
• Question significators and their positions
• Planetary positions and house placements
• Major aspects and their interpretations
• Answer analysis with probability assessment
• Timing analysis for expected resolution
• Enhanced analysis with recommendations

**Important Notes:**
• Horary provides guidance, not absolute predictions
• Free will and personal effort influence outcomes
• Charts represent momentary states - circumstances can change
• For serious matters, seek professional astrological consultation
• Consider practical factors alongside astrological indications

**Chart Quality Factors:**
• Strength of significators
• Clarity of aspects
• Overall chart coherence
• Planetary hour ruler
• Moon position and aspects

**Timing Precision:**
• Horary calculations are location-specific
• Time zones affect planetary positions
• Question timing is crucial for accuracy
• Planetary movements change momentary patterns

**Limitations:**
• Not suitable for medical diagnosis or treatment
• Cannot predict lottery numbers or gambling outcomes
• Should not replace professional advice for legal, financial, or medical matters
• Multiple questions on same topic may give conflicting results
    `.trim();
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

module.exports = HoraryAstrologyService;
