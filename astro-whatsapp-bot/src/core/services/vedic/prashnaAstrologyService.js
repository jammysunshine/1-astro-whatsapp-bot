const ServiceTemplate = require('../ServiceTemplate');
const logger = require('../../utils/logger');

// Import calculator from legacy structure (for now)

/**
 * PrashnaAstrologyService - Service for horary astrology (Prashna) analysis
 * Provides answers to questions using the astrological chart cast at the moment the question is asked
 * using Swiss Ephemeris integration for precise horary chart calculations.
 */
class PrashnaAstrologyService extends ServiceTemplate {
  constructor() {
    super('uprashnaAstrologyService'));
    this.serviceName = 'PrashnaAstrologyService';
    logger.info('PrashnaAstrologyService initialized');
  }

  async lprashnaAstrologyCalculation(questionData) {
    try {
      // Analyze horary question using calculator
      const result = await this.calculator.analyzeHoraryQuestion(questionData);
      return result;
    } catch (error) {
      logger.error('PrashnaAstrologyService calculation error:', error);
      throw new Error(`Horary analysis failed: ${error.message}`);
    }
  }

  formatResult(result) {
    if (result.error) {
      return {
        success: false,
        error: result.error,
        message: 'Horary analysis failed'
      };
    }

    return {
      success: true,
      service: 'Prashna Astrology Analysis',
      timestamp: new Date().toISOString(),
      data: {
        question: result.question || 'Unknown',
        questionTime: result.questionTime || 'Unknown',
        location: result.location || 'Unknown',
        answer: result.answer || 'Analysis complete',
        confidence: result.confidence || 'medium',
        significators: result.significators || {},
        chartAnalysis: result.chartAnalysis || {},
        timing: result.timing || {},
        considerations: result.considerations || [],
        recommendations: result.recommendations || []
      },
      disclaimer: 'Horary astrology provides insights based on the astrological chart cast at the moment of questioning. Results are most reliable when the question is clearly formulated and sincerely asked. Consider horary analysis as one factor among many in decision making.'
    };
  }

  validate(questionData) {
    if (!questionData) {
      throw new Error('Question data is required');
    }

    const { question, questionTime, location } = questionData;

    if (!question || typeof question !== 'string') {
      throw new Error('Valid question text is required');
    }

    if (!questionTime || typeof questionTime !== 'string') {
      throw new Error('Valid question time is required');
    }

    if (!location || typeof location !== 'string') {
      throw new Error('Valid location is required');
    }

    // Validate question time format
    const timeRegex = /^\d{1,2}\/\d{1,2}\/\d{4}\s+\d{1,2}:\d{1,2}$/;
    if (!timeRegex.test(questionTime)) {
      throw new Error('Question time must be in DD/MM/YYYY HH:MM format');
    }

    return true;
  }

  /**
   * Find auspicious timing for asking important questions
   * @param {Object} birthData - Birth data for personalized timing
   * @param {string} questionType - Type of question (love, career, health, etc.)
   * @param {number} dateRange - Number of days to search (default 7)
   * @returns {Promise<Object>} Auspicious question timing
   */
  async findQuestionTiming(birthData, questionType, dateRange = 7) {
    try {
      this._validateBirthData(birthData);

      if (!questionType) {
        throw new Error('Question type is required');
      }

      const timingResult = await this.calculator.findQuestionTiming(birthData, questionType, dateRange);

      return {
        questionType,
        dateRange,
        auspiciousTimings: timingResult,
        recommendations: this._generateTimingRecommendations(timingResult),
        error: false
      };
    } catch (error) {
      logger.error('PrashnaAstrologyService findQuestionTiming error:', error);
      return {
        error: true,
        message: 'Error finding auspicious question timing'
      };
    }
  }

  /**
   * Analyze question category and provide guidance
   * @param {string} question - The question text
   * @param {string} questionTime - Time when question was asked
   * @param {string} location - Location where question was asked
   * @returns {Promise<Object>} Question category analysis
   */
  async analyzeQuestionCategory(question, questionTime, location) {
    try {
      if (!question || !questionTime || !location) {
        throw new Error('Question, question time, and location are required');
      }

      const category = this._categorizeQuestion(question);
      const analysis = await this.execute({
        question,
        questionTime,
        location
      });

      return {
        question,
        category,
        categoryGuidance: this._getCategoryGuidance(category),
        horaryAnalysis: analysis.prashna,
        combinedInsights: this._combineCategoryAndHorary(category, analysis.prashna),
        error: false
      };
    } catch (error) {
      logger.error('PrashnaAstrologyService analyzeQuestionCategory error:', error);
      return {
        error: true,
        message: 'Error analyzing question category'
      };
    }
  }

  /**
   * Get detailed horary interpretation
   * @param {Object} questionData - Question data
   * @returns {Promise<Object>} Detailed horary interpretation
   */
  async getDetailedInterpretation(questionData) {
    try {
      const basicAnalysis = await this.execute(questionData);

      if (basicAnalysis.error) {
        return basicAnalysis;
      }

      const detailedInterpretation = this._generateDetailedInterpretation(basicAnalysis.prashna);
      const alternativeViews = this._generateAlternativeViews(basicAnalysis.prashna);
      const timingConsiderations = this._analyzeTimingConsiderations(basicAnalysis.prashna);

      return {
        ...basicAnalysis,
        detailedInterpretation,
        alternativeViews,
        timingConsiderations,
        confidence: this._assessInterpretationConfidence(basicAnalysis.prashna)
      };
    } catch (error) {
      logger.error('PrashnaAstrologyService getDetailedInterpretation error:', error);
      return {
        error: true,
        message: 'Error generating detailed interpretation'
      };
    }
  }

  /**
   * Compare multiple questions asked at different times
   * @param {Array} questions - Array of question data objects
   * @returns {Promise<Object>} Comparative analysis
   */
  async compareQuestions(questions) {
    try {
      if (!Array.isArray(questions) || questions.length < 2) {
        throw new Error('At least 2 questions are required for comparison');
      }

      const analyses = [];

      for (const questionData of questions) {
        const analysis = await this.execute(questionData);
        if (!analysis.error) {
          analyses.push({
            question: questionData.question,
            time: questionData.questionTime,
            answer: analysis.prashna.answer,
            confidence: analysis.prashna.confidence
          });
        }
      }

      return {
        questionsCompared: analyses.length,
        comparativeAnalysis: this._analyzeQuestionComparisons(analyses),
        patterns: this._identifyQuestionPatterns(analyses),
        recommendations: this._generateComparativeRecommendations(analyses),
        error: false
      };
    } catch (error) {
      logger.error('PrashnaAstrologyService compareQuestions error:', error);
      return {
        error: true,
        message: 'Error comparing questions'
      };
    }
  }

  /**
   * Get horary astrology guidance for decision making
   * @param {string} decisionType - Type of decision (career, relationship, financial, etc.)
   * @param {string} questionTime - Time when decision question was asked
   * @param {string} location - Location
   * @returns {Promise<Object>} Decision guidance
   */
  async getDecisionGuidance(decisionType, questionTime, location) {
    try {
      if (!decisionType || !questionTime || !location) {
        throw new Error('Decision type, question time, and location are required');
      }

      const question = `Should I proceed with this ${decisionType} decision?`;
      const analysis = await this.execute({
        question,
        questionTime,
        location
      });

      const decisionGuidance = this._generateDecisionGuidance(decisionType, analysis.prashna);
      const riskAssessment = this._assessDecisionRisks(analysis.prashna);
      const alternatives = this._suggestDecisionAlternatives(decisionType, analysis.prashna);

      return {
        decisionType,
        question,
        horaryAnalysis: analysis.prashna,
        decisionGuidance,
        riskAssessment,
        alternatives,
        finalRecommendation: this._generateFinalRecommendation(analysis.prashna),
        error: false
      };
    } catch (error) {
      logger.error('PrashnaAstrologyService getDecisionGuidance error:', error);
      return {
        error: true,
        message: 'Error generating decision guidance'
      };
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Validate input data
   * @param {Object} input - Input data to validate
   * @private
   */
  _validateInput(input) {
    if (!input) {
      throw new Error('Question data is required');
    }

    const { question, questionTime, location } = input;

    if (!question || typeof question !== 'string') {
      throw new Error('Valid question text is required');
    }

    if (!questionTime || typeof questionTime !== 'string') {
      throw new Error('Valid question time is required');
    }

    if (!location || typeof location !== 'string') {
      throw new Error('Valid location is required');
    }

    // Validate question time format
    const timeRegex = /^\d{1,2}\/\d{1,2}\/\d{4}\s+\d{1,2}:\d{1,2}$/;
    if (!timeRegex.test(questionTime)) {
      throw new Error('Question time must be in DD/MM/YYYY HH:MM format');
    }
  }

  /**
   * Validate birth data
   * @param {Object} birthData - Birth data to validate
   * @private
   */
  _validateBirthData(birthData) {
    if (!birthData) {
      throw new Error('Birth data is required');
    }

    const { birthDate, birthTime, birthPlace } = birthData;

    if (!birthDate || !birthTime || !birthPlace) {
      throw new Error('Complete birth data (date, time, place) is required');
    }
  }

  /**
   * Categorize question based on content
   * @param {string} question - Question text
   * @returns {string} Question category
   * @private
   */
  _categorizeQuestion(question) {
    const lowerQuestion = question.toLowerCase();

    if (lowerQuestion.includes('love') || lowerQuestion.includes('relationship') || lowerQuestion.includes('marriage')) {
      return 'love_relationship';
    }
    if (lowerQuestion.includes('career') || lowerQuestion.includes('job') || lowerQuestion.includes('work')) {
      return 'career_profession';
    }
    if (lowerQuestion.includes('money') || lowerQuestion.includes('finance') || lowerQuestion.includes('financial')) {
      return 'finance_wealth';
    }
    if (lowerQuestion.includes('health') || lowerQuestion.includes('illness') || lowerQuestion.includes('medical')) {
      return 'health_wellness';
    }
    if (lowerQuestion.includes('travel') || lowerQuestion.includes('journey') || lowerQuestion.includes('trip')) {
      return 'travel_journey';
    }
    if (lowerQuestion.includes('education') || lowerQuestion.includes('study') || lowerQuestion.includes('exam')) {
      return 'education_learning';
    }
    if (lowerQuestion.includes('spiritual') || lowerQuestion.includes('spiritual') || lowerQuestion.includes('meditation')) {
      return 'spiritual_growth';
    }

    return 'general';
  }

  /**
   * Get guidance for question category
   * @param {string} category - Question category
   * @returns {Object} Category guidance
   * @private
   */
  _getCategoryGuidance(category) {
    const guidance = {
      love_relationship: {
        focus: 'Venus, Moon, and 7th house significators',
        considerations: 'Emotional readiness, timing, and mutual compatibility',
        bestTiming: 'Venusian periods and waxing Moon phases'
      },
      career_profession: {
        focus: 'Sun, Saturn, Mars, and 10th house significators',
        considerations: 'Professional growth, authority, and long-term stability',
        bestTiming: 'Solar periods and Saturn return considerations'
      },
      finance_wealth: {
        focus: 'Jupiter, Venus, and 2nd/11th house significators',
        considerations: 'Wealth accumulation, investment timing, and financial stability',
        bestTiming: 'Jupiter periods and favorable Venus transits'
      },
      health_wellness: {
        focus: 'Sun, Mars, and 6th house significators',
        considerations: 'Vitality, recovery, and preventive care',
        bestTiming: 'Solar periods and Mars recovery cycles'
      },
      travel_journey: {
        focus: 'Moon, Jupiter, and 9th/12th house significators',
        considerations: 'Journey purpose, safety, and life lessons',
        bestTiming: 'Jupiter periods and Moon void-of-course avoidance'
      },
      education_learning: {
        focus: 'Mercury, Jupiter, and 4th/9th house significators',
        considerations: 'Learning capacity, concentration, and knowledge acquisition',
        bestTiming: 'Mercury periods and Jupiter expansion phases'
      },
      spiritual_growth: {
        focus: 'Jupiter, Neptune, and 9th/12th house significators',
        considerations: 'Inner development, spiritual seeking, and higher understanding',
        bestTiming: 'Jupiter and Neptune favorable periods'
      },
      general: {
        focus: 'Question ruler and chart significators',
        considerations: 'Overall chart harmony and planetary strength',
        bestTiming: 'Strong planetary periods and auspicious alignments'
      }
    };

    return guidance[category] || guidance.general;
  }

  /**
   * Combine category guidance with horary analysis
   * @param {string} category - Question category
   * @param {Object} horaryAnalysis - Horary analysis result
   * @returns {Object} Combined insights
   * @private
   */
  _combineCategoryAndHorary(category, horaryAnalysis) {
    const categoryGuidance = this._getCategoryGuidance(category);

    return {
      categorySpecificInsights: `This ${category.replace('_', ' ')} question shows ${horaryAnalysis.answer} with focus on ${categoryGuidance.focus.split(',')[0]}`,
      timingConsiderations: categoryGuidance.bestTiming,
      categoryFactors: categoryGuidance.considerations,
      integratedAnswer: this._integrateCategoryWithAnswer(category, horaryAnalysis)
    };
  }

  /**
   * Generate timing recommendations
   * @param {Object} timingResult - Timing result from calculator
   * @returns {Array} Recommendations
   * @private
   */
  _generateTimingRecommendations(timingResult) {
    const recommendations = [];

    if (timingResult?.auspiciousTimes) {
      recommendations.push(`Auspicious times for asking: ${timingResult.auspiciousTimes.join(', ')}`);
    }

    if (timingResult?.planetaryHours) {
      recommendations.push(`Best planetary hours: ${timingResult.planetaryHours.join(', ')}`);
    }

    return recommendations;
  }

  /**
   * Generate detailed interpretation
   * @param {Object} horaryAnalysis - Horary analysis
   * @returns {Object} Detailed interpretation
   * @private
  _generateDetailedInterpretation(horaryAnalysis) {
    return {
      questionRuler: horaryAnalysis.questionRuler || 'Unknown',
      chartStrength: horaryAnalysis.chartStrength || 'Moderate',
      planetaryTestimony: horaryAnalysis.planetaryTestimony || [],
      houseTestimony: horaryAnalysis.houseTestimony || [],
      aspectTestimony: horaryAnalysis.aspectTestimony || [],
      finalJudgment: horaryAnalysis.finalJudgment || 'Analysis complete'
    };
  }

  /**
   * Generate alternative views of the horary analysis
   * @param {Object} horaryAnalysis - Horary analysis
   * @returns {Array} Alternative interpretations
   * @private
   */
  _generateAlternativeViews(horaryAnalysis) {
    const alternatives = [];

    // Generate alternative perspectives based on different significators
    if (horaryAnalysis.alternativeSignificators) {
      alternatives.push({
        perspective: 'Alternative significator',
        interpretation: `Using ${horaryAnalysis.alternativeSignificators[0]} as ruler gives different emphasis`,
        reliability: 'Secondary consideration'
      });
    }

    alternatives.push({
      perspective: 'Long-term vs immediate',
      interpretation: 'Question may show immediate situation vs long-term development',
      reliability: 'Contextual factor'
    });

    return alternatives;
  }

  /**
   * Analyze timing considerations
   * @param {Object} horaryAnalysis - Horary analysis
   * @returns {Object} Timing analysis
   * @private
   */
  _analyzeTimingConsiderations(horaryAnalysis) {
    return {
      questionTiming: horaryAnalysis.questionTiming || 'Standard timing',
      moonPhase: horaryAnalysis.moonPhase || 'Unknown phase',
      planetaryHour: horaryAnalysis.planetaryHour || 'Unknown hour',
      voidOfCourse: horaryAnalysis.voidOfCourse || false,
      timingQuality: horaryAnalysis.timingQuality || 'Neutral'
    };
  }

  /**
   * Assess interpretation confidence
   * @param {Object} horaryAnalysis - Horary analysis
   * @returns {string} Confidence level
   * @private
   */
  _assessInterpretationConfidence(horaryAnalysis) {
    const confidence = horaryAnalysis.confidence || 'medium';

    switch (confidence.toLowerCase()) {
      case 'high': return 'Strong testimony from multiple sources';
      case 'medium': return 'Moderate testimony with some clarity';
      case 'low': return 'Weak testimony, consider asking again';
      default: return 'Analysis completed with standard reliability';
    }
  }

  /**
   * Analyze question comparisons
   * @param {Array} analyses - Array of question analyses
   * @returns {Object} Comparative analysis
   * @private
   */
  _analyzeQuestionComparisons(analyses) {
    const positiveAnswers = analyses.filter(a => a.answer?.toLowerCase().includes('yes') || a.answer?.toLowerCase().includes('favorable')).length;
    const negativeAnswers = analyses.filter(a => a.answer?.toLowerCase().includes('no') || a.answer?.toLowerCase().includes('unfavorable')).length;

    return {
      consistency: positiveAnswers === analyses.length ? 'All positive' :
                   negativeAnswers === analyses.length ? 'All negative' : 'Mixed results',
      pattern: this._identifyAnswerPattern(analyses),
      evolution: this._analyzeAnswerEvolution(analyses)
    };
  }

  /**
   * Identify question patterns
   * @param {Array} analyses - Array of analyses
   * @returns {Array} Patterns identified
   * @private
   */
  _identifyQuestionPatterns(analyses) {
    const patterns = [];

    // Check for timing-based patterns
    const timeDifferences = analyses.slice(1).map((analysis, index) => {
      const prevTime = new Date(analyses[index].time);
      const currTime = new Date(analysis.time);
      return (currTime - prevTime) / (1000 * 60 * 60); // Hours difference
    });

    if (timeDifferences.every(diff => diff < 24)) {
      patterns.push('Questions asked within 24 hours show related themes');
    }

    return patterns;
  }

  /**
   * Generate comparative recommendations
   * @param {Array} analyses - Array of analyses
   * @returns {Array} Recommendations
   * @private
   */
  _generateComparativeRecommendations(analyses) {
    const recommendations = [];

    const consistency = this._analyzeQuestionComparisons(analyses).consistency;

    if (consistency === 'All positive') {
      recommendations.push('Strong positive indications across all questions');
    } else if (consistency === 'All negative') {
      recommendations.push('Consider different timing or approach');
    } else {
      recommendations.push('Mixed results suggest situational factors at play');
    }

    return recommendations;
  }

  /**
   * Generate decision guidance
   * @param {string} decisionType - Decision type
   * @param {Object} horaryAnalysis - Horary analysis
   * @returns {Object} Decision guidance
   * @private
   */
  _generateDecisionGuidance(decisionType, horaryAnalysis) {
    const guidance = {
      proceed: horaryAnalysis.answer?.toLowerCase().includes('yes') ||
               horaryAnalysis.answer?.toLowerCase().includes('favorable'),
      confidence: horaryAnalysis.confidence || 'medium',
      timing: this._getDecisionTiming(decisionType, horaryAnalysis),
      considerations: this._getDecisionConsiderations(decisionType, horaryAnalysis)
    };

    return guidance;
  }

  /**
   * Assess decision risks
   * @param {Object} horaryAnalysis - Horary analysis
   * @returns {Object} Risk assessment
   * @private
   */
  _assessDecisionRisks(horaryAnalysis) {
    return {
      riskLevel: horaryAnalysis.confidence === 'low' ? 'high' : 'moderate',
      riskFactors: horaryAnalysis.challengingFactors || [],
      mitigatingFactors: horaryAnalysis.supportingFactors || [],
      overallAssessment: horaryAnalysis.confidence === 'high' ? 'Low risk decision' : 'Moderate risk, consider additional factors'
    };
  }

  /**
   * Suggest decision alternatives
   * @param {string} decisionType - Decision type
   * @param {Object} horaryAnalysis - Horary analysis
   * @returns {Array} Alternative suggestions
   * @private
   */
  _suggestDecisionAlternatives(decisionType, horaryAnalysis) {
    const alternatives = [];

    if (horaryAnalysis.confidence === 'low') {
      alternatives.push('Consider asking the question again at a more auspicious time');
      alternatives.push('Seek additional information or professional advice');
    }

    alternatives.push(`Explore ${decisionType} options that align with favorable planetary indications`);

    return alternatives;
  }

  /**
   * Generate final recommendation
   * @param {Object} horaryAnalysis - Horary analysis
   * @returns {string} Final recommendation
   * @private
   */
  _generateFinalRecommendation(horaryAnalysis) {
    if (horaryAnalysis.confidence === 'high' &&
        (horaryAnalysis.answer?.toLowerCase().includes('yes') ||
         horaryAnalysis.answer?.toLowerCase().includes('favorable'))) {
      return 'Proceed with confidence based on strong horary indications';
    } else if (horaryAnalysis.confidence === 'low') {
      return 'Exercise caution and consider additional factors before deciding';
    } else {
      return 'Proceed with awareness of current astrological influences';
    }
  }

  /**
   * Integrate category with answer
   * @param {string} category - Question category
   * @param {Object} horaryAnalysis - Horary analysis
   * @returns {string} Integrated answer
   * @private
   */
  _integrateCategoryWithAnswer(category, horaryAnalysis) {
    const categoryName = category.replace('_', ' ');
    return `For this ${categoryName} question, the horary chart indicates: ${horaryAnalysis.answer}`;
  }

  /**
   * Get decision timing
   * @param {string} decisionType - Decision type
   * @param {Object} horaryAnalysis - Horary analysis
   * @returns {string} Timing guidance
   * @private
   */
  _getDecisionTiming(decisionType, horaryAnalysis) {
    return horaryAnalysis.timing || 'Consider immediate action based on current indications';
  }

  /**
   * Get decision considerations
   * @param {string} decisionType - Decision type
   * @param {Object} horaryAnalysis - Horary analysis
   * @returns {Array} Considerations
   * @private
   */
  _getDecisionConsiderations(decisionType, horaryAnalysis) {
    return horaryAnalysis.considerations || ['Evaluate practical factors alongside astrological guidance'];
  }

  /**
   * Identify answer pattern
   * @param {Array} analyses - Array of analyses
   * @returns {string} Pattern description
   * @private
   */
  _identifyAnswerPattern(analyses) {
    const answers = analyses.map(a => a.answer?.toLowerCase() || '');
    const positiveCount = answers.filter(a => a.includes('yes') || a.includes('favorable')).length;
    const negativeCount = answers.filter(a => a.includes('no') || a.includes('unfavorable')).length;

    if (positiveCount > negativeCount) return 'Generally positive pattern';
    if (negativeCount > positiveCount) return 'Generally negative pattern';
    return 'Balanced or unclear pattern';
  }

  /**
   * Analyze answer evolution
   * @param {Array} analyses - Array of analyses
   * @returns {string} Evolution description
   * @private
   */
  _analyzeAnswerEvolution(analyses) {
    if (analyses.length < 2) return 'Single question analysis';

    const firstAnswer = analyses[0].answer?.toLowerCase() || '';
    const lastAnswer = analyses[analyses.length - 1].answer?.toLowerCase() || '';

    if (firstAnswer.includes('yes') && lastAnswer.includes('no')) {
      return 'Answers evolved from positive to negative';
    } else if (firstAnswer.includes('no') && lastAnswer.includes('yes')) {
      return 'Answers evolved from negative to positive';
    } else {
      return 'Consistent answer pattern over time';
    }
  }

  getMetadata() {
    return {
      name: this.serviceName,
      version: '1.0.0',
      category: 'vedic',
      methods: ['execute', 'findQuestionTiming', 'analyzeQuestionCategory', 'getDetailedInterpretation', 'compareQuestions', 'getDecisionGuidance'],
      dependencies: ['PrashnaCalculator']
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

module.exports = PrashnaAstrologyService;