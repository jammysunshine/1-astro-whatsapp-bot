const ServiceTemplate = require('../serviceTemplate');
const { PrashnaCalculator } = require('../../services/astrology/vedic/calculators/PrashnaCalculator');
const logger = require('../../../utils/logger');

/**
 * Prashna Service (Horary Astrology)
 * Provides question-based astrology analysis using horary chart casting
 * Extends ServiceTemplate for standardized service architecture
 */
class PrashnaService extends ServiceTemplate {
  constructor(services) {
    super('PrashnaService', services);
    
    // Initialize Prashna Calculator with required dependencies
    this.calculator = new PrashnaCalculator();
    
    // Set services in calculator
    this.calculator.setServices(services);
    
    // Service-specific configuration
    this.serviceConfig = {
      supportedInputs: ['questionData', 'birthData'],
      requiredInputs: ['questionData'],
      outputFormats: ['detailed', 'summary', 'timing-analysis'],
      questionCategories: {
        relationship: 'Questions about love, marriage, partnerships',
        career: 'Questions about job, business, professional matters',
        financial: 'Questions about money, investments, gains',
        health: 'Questions about wellness, medical matters',
        legal: 'Questions about legal issues, court cases',
        lost_items: 'Questions about finding lost objects or people',
        general: 'General life questions and guidance'
      },
      confidenceThresholds: {
        high: 75,
        moderate: 60,
        low: 40
      }
    };
  }

  /**
   * Process Prashna calculation using ServiceTemplate pattern
   * @param {Object} params - Calculation parameters
   * @returns {Promise<Object>} Formatted Prashna analysis
   */
  async processCalculation(params) {
    const { questionData, options = {} } = params;
    
    try {
      // Validate inputs
      this._validateInputs(questionData);
      
      // Analyze horary question using calculator
      const prashnaResult = await this.calculator.analyzeHoraryQuestion(questionData);
      
      // Add service metadata
      prashnaResult.serviceMetadata = {
        serviceName: this.serviceName,
        calculationType: 'Prashna (Horary Astrology)',
        timestamp: new Date().toISOString(),
        method: 'Question-based horary chart analysis',
        questionCategory: prashnaResult.significators?.questionCategory || 'general',
        chartType: 'Horary (Question Time)'
      };
      
      // Add enhanced analysis
      prashnaResult.enhancedAnalysis = this._performEnhancedPrashnaAnalysis(prashnaResult);
      
      return prashnaResult;
      
    } catch (error) {
      logger.error(`❌ Error in ${this.serviceName} calculation:`, error);
      throw new Error(`Prashna calculation failed: ${error.message}`);
    }
  }

  /**
   * Format Prashna result for WhatsApp output
   * @param {Object} result - Calculation result
   * @returns {string} Formatted WhatsApp message
   */
  formatResult(result) {
    if (!result || !result.significators) {
      return '❌ *Prashna Analysis Error*\n\nUnable to generate horary analysis. Please check your question details and try again.';
    }

    let formatted = `❓ *Prashna (Horary) Analysis*\n\n`;
    
    // Add question details
    formatted += `*Question:* ${result.question}\n`;
    formatted += `*Time Asked:* ${result.questionTime}\n`;
    formatted += `*Location:* ${result.location}\n\n`;
    
    // Add overall indication
    if (result.interpretation?.overallIndication) {
      formatted += `*🔮 Overall Indication:*\n${result.interpretation.overallIndication}\n\n`;
    }
    
    // Add probability assessment
    if (result.probabilityAssessment) {
      formatted += '*📊 Answer Probability:*\n';
      formatted += `• **Overall:** ${result.probabilityAssessment.overall}%\n`;
      formatted += `• **Confidence:** ${result.probabilityAssessment.confidence}\n`;
      formatted += `• **Reliability:** ${result.probabilityAssessment.reliability}\n\n`;
    }
    
    // Add timing analysis
    if (result.timingAnalysis) {
      formatted += '*⏰ Timing Analysis:*\n';
      formatted += `• **Indication:** ${result.timingAnalysis.immediateIndication}\n`;
      formatted += `• **Timeline:** ${result.timingAnalysis.estimatedTimeline}\n`;
      formatted += `• **Clarity:** ${result.timingAnalysis.answerClarity}\n\n`;
    }
    
    // Add answer trends
    if (result.interpretation?.answerTrends && result.interpretation.answerTrends.length > 0) {
      formatted += '*📈 Answer Trends:*\n';
      result.interpretation.answerTrends.forEach(trend => {
        formatted += `• ${trend}\n`;
      });
      formatted += '\n';
    }
    
    // Add significator analysis
    if (result.significators) {
      formatted += '*🌟 Chart Significators:*\n';
      formatted += `• **Question Ruler:** ${result.significators.questionRuler}\n`;
      formatted += `• **Querent:** ${result.significators.querent}\n`;
      formatted += `• **Quesited:** ${result.significators.quesited}\n`;
      formatted += `• **Timing:** ${result.significators.timingRuler}\n\n`;
    }
    
    // Add question ruler analysis
    if (result.questionRulerAnalysis?.analysis) {
      formatted += '*👑 Question Ruler Analysis:*\n';
      const analysis = result.questionRulerAnalysis.analysis;
      if (analysis.houseStrength) {
        formatted += `• **Placement:** ${analysis.houseStrength}\n`;
      }
      if (analysis.dignityStatus) {
        formatted += `• **Dignity:** ${analysis.dignityStatus}\n`;
      }
      if (analysis.aspectStrength) {
        formatted += `• **Aspects:** ${analysis.aspectStrength}\n`;
      }
      formatted += '\n';
    }
    
    // Add enhanced analysis if available
    if (result.enhancedAnalysis) {
      formatted += '*🎯 Enhanced Analysis:*\n';
      
      if (result.enhancedAnalysis.questionSuitability) {
        formatted += `• **Question Type:** ${result.enhancedAnalysis.questionSuitability}\n`;
      }
      
      if (result.enhancedAnalysis.chartQuality) {
        formatted += `• **Chart Quality:** ${result.enhancedAnalysis.chartQuality}\n`;
      }
      
      if (result.enhancedAnalysis.recommendations) {
        formatted += `• **Recommendations:** ${result.enhancedAnalysis.recommendations}\n`;
      }
      
      if (result.enhancedAnalysis.warnings) {
        formatted += `• **Caveats:** ${result.enhancedAnalysis.warnings}\n`;
      }
      
      formatted += '\n';
    }
    
    // Add additional guidance
    if (result.additionalGuidance?.recommendedActions && result.additionalGuidance.recommendedActions.length > 0) {
      formatted += '*💡 Recommended Actions:*\n';
      result.additionalGuidance.recommendedActions.slice(0, 3).forEach(action => {
        formatted += `• ${action}\n`;
      });
      formatted += '\n';
    }
    
    // Add important caveats
    if (result.interpretation?.caveats && result.interpretation.caveats.length > 0) {
      formatted += '*⚠️ Important Considerations:*\n';
      result.interpretation.caveats.slice(0, 2).forEach(caveat => {
        formatted += `• ${caveat}\n`;
      });
      formatted += '\n';
    }
    
    // Add service footer
    formatted += '---\n*Prashna - Horary Astrology for Question-based Guidance*';
    
    return formatted;
  }

  /**
   * Validate input parameters for Prashna calculation
   * @param {Object} questionData - Question data object
   * @private
   */
  _validateInputs(questionData) {
    if (!questionData) {
      throw new Error('Question data is required for Prashna analysis');
    }
    
    if (!questionData.question || questionData.question.trim().length === 0) {
      throw new Error('A valid question is required for horary analysis');
    }
    
    if (!questionData.questionTime) {
      throw new Error('Question time is required for horary chart casting');
    }
    
    if (!questionData.location) {
      throw new Error('Location is required for accurate horary analysis');
    }
  }

  /**
   * Perform enhanced analysis on Prashna results
   * @param {Object} result - Prashna calculation result
   * @returns {Object} Enhanced analysis
   * @private
   */
  _performEnhancedPrashnaAnalysis(result) {
    const analysis = {
      questionSuitability: '',
      chartQuality: '',
      recommendations: '',
      warnings: '',
      timingAdvice: '',
      confidenceFactors: []
    };
    
    // Assess question suitability
    if (result.significators?.questionCategory) {
      const category = result.significators.questionCategory;
      const suitability = this.serviceConfig.questionCategories[category];
      analysis.questionSuitability = suitability || 'General question analysis';
    }
    
    // Assess chart quality
    if (result.probabilityAssessment) {
      const confidence = result.probabilityAssessment.confidence;
      if (confidence === 'High') {
        analysis.chartQuality = 'Excellent chart with clear indications';
        analysis.recommendations = 'Proceed with confidence based on chart indications';
      } else if (confidence === 'Moderate') {
        analysis.chartQuality = 'Good chart with reasonable clarity';
        analysis.recommendations = 'Proceed with caution and monitor developments';
      } else {
        analysis.chartQuality = 'Challenging chart with mixed signals';
        analysis.recommendations = 'Consider rephrasing question or waiting for better timing';
      }
    }
    
    // Add timing advice
    if (result.timingAnalysis) {
      if (result.timingAnalysis.estimatedTimeline.includes('Days')) {
        analysis.timingAdvice = 'Quick developments expected - stay alert';
      } else if (result.timingAnalysis.estimatedTimeline.includes('Weeks')) {
        analysis.timingAdvice = 'Moderate timeframe - patience required';
      } else {
        analysis.timingAdvice = 'Longer timeframe indicated - persistent effort needed';
      }
    }
    
    // Add warnings based on probability
    if (result.probabilityAssessment?.overall < 40) {
      analysis.warnings = 'Low probability indicates challenging conditions - consider alternative approaches';
    } else if (result.probabilityAssessment?.overall < 60) {
      analysis.warnings = 'Moderate probability suggests mixed outcomes - careful planning advised';
    }
    
    // Identify confidence factors
    if (result.probabilityAssessment?.breakdown) {
      const breakdown = result.probabilityAssessment.breakdown;
      if (breakdown.questionRuler > 70) {
        analysis.confidenceFactors.push('Strong question ruler placement');
      }
      if (breakdown.chartReliability > 70) {
        analysis.confidenceFactors.push('Reliable horary chart');
      }
      if (breakdown.significatorHarmony > 60) {
        analysis.confidenceFactors.push('Harmonious significator relationships');
      }
    }
    
    return analysis;
  }

  /**
   * Calculate confidence score for Prashna analysis
   * @param {Object} result - Calculation result
   * @returns {number} Confidence score (0-100)
   */
  calculateConfidence(result) {
    let confidence = 70; // Base confidence for Prashna
    
    // Increase confidence based on probability assessment
    if (result.probabilityAssessment?.overall) {
      confidence += (result.probabilityAssessment.overall - 50) * 0.3;
    }
    
    // Increase confidence for clear question categories
    if (result.significators?.questionCategory && result.significators.questionCategory !== 'general') {
      confidence += 10;
    }
    
    // Increase confidence for complete analysis
    if (result.timingAnalysis && result.questionRulerAnalysis && result.interpretation) {
      confidence += 10;
    }
    
    // Increase confidence for strong significators
    if (result.significators?.significatorPlanets && result.significators.significatorPlanets.length >= 3) {
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
      result.significators &&
      result.question &&
      result.probabilityAssessment
    );
  }

  /**
   * Get service-specific help
   * @returns {string} Help information
   */
  getHelp() {
    return `
 ❓ **Prashna Service - Horary Astrology for Questions**

**Purpose:** Provides answers to specific questions by casting a horary chart at the moment the question is asked

**Required Inputs:**
• Your specific question (clear and focused)
• Question time (when you thought of/asked the question)
• Location (where you are when asking)

**Question Categories Supported:**

**💕 Relationship Questions:**
• Marriage and partnership matters
• Love and relationship compatibility
• Family and friendship issues

**💼 Career Questions:**
• Job changes and opportunities
• Business decisions
• Professional growth

**💰 Financial Questions:**
• Investment decisions
• Money matters
• Financial opportunities

**🏥 Health Questions:**
• Wellness concerns
• Medical decisions
• Health matters

**⚖️ Legal Questions:**
• Court cases and legal matters
• Disputes and conflicts

**🔍 Lost Items:**
• Finding lost objects
• Missing people or pets

**🌟 General Questions:**
• Life guidance
• Decision making
• Personal matters

**How Prashna Works:**
• **Horary Chart:** Cast at the exact moment of question
• **Significators:** Planets representing question and answer
• **Timing:** Moon position indicates answer timeframe
• **Probability:** Chart quality determines answer reliability

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
• Overall indication for your question
• Answer probability and confidence level
• Timing analysis and expected timeframe
• Chart significators and their strength
• Recommended actions and considerations
• Important caveats and guidance

**Timing Indications:**
• **Days to Weeks:** Moon in angular houses
• **Weeks to Months:** Moon in succedent houses  
• **Months or Longer:** Moon in cadent houses

**Confidence Levels:**
• **High (75%+):** Clear chart with strong indications
• **Moderate (60-74%):** Good chart with reasonable clarity
• **Low (Below 60%):** Challenging chart with mixed signals

**Important Notes:**
• Prashna provides guidance, not absolute predictions
• Free will and personal effort influence outcomes
• Charts represent momentary states - circumstances can change
• For serious matters, seek professional astrological consultation

**Example Usage:**
"Prashna question: Will I get the promotion?"
"Ask horary: Should I relocate to Mumbai?"
"Question analysis: Is this the right time to start business?"
    `.trim();
  }
}

module.exports = PrashnaService;