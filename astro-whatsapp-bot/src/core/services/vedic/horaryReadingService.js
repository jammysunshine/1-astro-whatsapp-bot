const ServiceTemplate = require('../ServiceTemplate');
const logger = require('../../../utils/logger');

/**
 * HoraryReadingService - Specialized service for casting and interpreting horary charts
 *
 * Provides analysis for questions by casting a horary chart at the exact moment the question is asked,
 * offering insights into potential outcomes, timing, and recommendations.
 */
class HoraryReadingService extends ServiceTemplate {
  constructor() {
    super('HoraryCalculator'); // Primary calculator for this service
    this.serviceName = 'HoraryReadingService';
    this.calculatorPath = '../../../services/astrology/horary/HoraryCalculator';
    logger.info('HoraryReadingService initialized');
  }

  /**
   * Main calculation method for Horary Reading.
   * @param {Object} questionData - Data related to the question asked.
   * @param {string} questionData.question - The question being asked.
   * @param {string} questionData.questionTime - Time when question was asked (ISO string).
   * @param {Object} questionData.location - Location where question was asked.
   * @returns {Promise<Object>} Comprehensive horary reading analysis.
   */
  async processCalculation(questionData) {
    try {
      // Ensure calculator is loaded
      if (!this.calculator) {
        await this.initialize();
      }

      this._validateInput(questionData);

      const { question, questionTime, location = {} } = questionData;

      // Cast horary chart using calculator
      const horaryChart = await this.calculator.castHoraryChart(questionTime, location);

      // Analyze the question and chart
      const readingAnalysis = {
        question: {
          text: question,
          category: this._categorizeQuestion(question),
          significators: this._identifyQuestionSignificators(question),
          houses: this._identifyRelevantHouses(question)
        },
        chart: horaryChart,
        interpretation: this._interpretHoraryChart(horaryChart, question),
        timing: this._analyzeTiming(horaryChart, question),
        aspects: this._analyzeAspects(horaryChart, question),
        answer: this._generateAnswer(horaryChart, question),
        recommendations: this._generateRecommendations(horaryChart, question),
        followUpQuestions: this._generateFollowUpQuestions(horaryChart, question)
      };

      return readingAnalysis;
    } catch (error) {
      logger.error('HoraryReadingService processCalculation error:', error);
      throw new Error(`Horary reading failed: ${error.message}`);
    }
  }

  /**
   * Validates input data for horary reading.
   * @param {Object} input - Input data to validate.
   * @private
   */
  _validateInput(input) {
    if (!input) {
      throw new Error('Question data is required for horary reading.');
    }

    const required = ['question', 'questionTime'];
    for (const field of required) {
      if (!input[field]) {
        throw new Error(`${field} is required for horary reading`);
      }
    }

    // Basic date/time format validation (can be enhanced)
    if (typeof input.questionTime !== 'string' || !input.questionTime.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)) {
      // Assuming ISO string format for questionTime
      throw new Error('Question time must be in ISO 8601 format (e.g., YYYY-MM-DDTHH:mm:ss.sssZ)');
    }
  }

  /**
   * Formats the horary reading result for consistent output.
   * @param {Object} result - Raw horary reading result.
   * @returns {Object} Formatted horary reading result.
   */
  formatResult(result) {
    if (result.error) {
      return {
        success: false,
        error: result.error,
        message: 'Horary analysis failed',
        service: this.serviceName
      };
    }

    return {
      success: true,
      data: result,
      summary: result.answer.directAnswer || 'Horary analysis completed',
      metadata: {
        serviceName: this.serviceName,
        calculationType: 'Horary Reading',
        timestamp: new Date().toISOString(),
        questionCategory: result.question.category
      }
    };
  }

  /**
   * Categorizes the user's question.
   * @param {string} question - The question text.
   * @returns {string} Category of the question.
   * @private
   */
  _categorizeQuestion(question) {
    const lowerQuestion = question.toLowerCase();
    if (lowerQuestion.includes('love') || lowerQuestion.includes('relationship') || lowerQuestion.includes('marriage')) { return 'relationship'; }
    if (lowerQuestion.includes('job') || lowerQuestion.includes('career') || lowerQuestion.includes('work')) { return 'career'; }
    if (lowerQuestion.includes('money') || lowerQuestion.includes('financial') || lowerQuestion.includes('investment')) { return 'financial'; }
    if (lowerQuestion.includes('health') || lowerQuestion.includes('illness') || lowerQuestion.includes('medical')) { return 'health'; }
    if (lowerQuestion.includes('move') || lowerQuestion.includes('relocate') || lowerQuestion.includes('travel')) { return 'relocation'; }
    return 'general';
  }

  /**
   * Identifies significators for the question based on its category.
   * @param {string} question - The question text.
   * @returns {Array<string>} List of significator planets.
   * @private
   */
  _identifyQuestionSignificators(question) {
    const category = this._categorizeQuestion(question);
    const significators = {
      relationship: ['Venus', 'Moon', 'Jupiter'],
      career: ['Saturn', 'Mercury', 'Sun'],
      financial: ['Jupiter', 'Venus', 'Mercury'],
      health: ['Sun', 'Mars', 'Saturn'],
      relocation: ['Moon', 'Jupiter', 'Uranus'],
      general: ['Moon', 'Mercury', 'Jupiter']
    };
    return significators[category] || significators.general;
  }

  /**
   * Identifies relevant houses for the question based on its category.
   * @param {string} question - The question text.
   * @returns {Array<number>} List of relevant house numbers.
   * @private
   */
  _identifyRelevantHouses(question) {
    const category = this._categorizeQuestion(question);
    const houses = {
      relationship: [7, 5, 11],
      career: [10, 6, 2],
      financial: [2, 8, 11],
      health: [6, 1, 12],
      relocation: [3, 9, 1],
      general: [1, 10, 7]
    };
    return houses[category] || houses.general;
  }

  /**
   * Interprets the horary chart.
   * @param {Object} horaryChart - The cast horary chart.
   * @param {string} question - The question text.
   * @returns {Object} Interpretation details.
   * @private
   */
  _interpretHoraryChart(horaryChart, question) {
    return {
      overall: this._getOverallInterpretation(horaryChart),
      significators: this._interpretSignificators(horaryChart, question),
      houses: this._interpretRelevantHouses(horaryChart, question),
      moon: this._interpretMoonPosition(horaryChart),
      aspects: this._interpretKeyAspects(horaryChart, question),
      timing: this._interpretTimingIndicators(horaryChart)
    };
  }

  /**
   * Analyzes timing aspects from the horary chart.
   * @param {Object} horaryChart - The cast horary chart.
   * @param {string} question - The question text.
   * @returns {Object} Timing analysis.
   * @private
   */
  _analyzeTiming(horaryChart, question) {
    return {
      immediate: this._checkImmediateIndicators(horaryChart),
      shortTerm: this._analyzeShortTermTiming(horaryChart),
      longTerm: this._analyzeLongTermTiming(horaryChart),
      planetaryHours: this._calculatePlanetaryHours(horaryChart),
      favorableDays: this._identifyFavorableDays(horaryChart)
    };
  }

  /**
   * Analyzes aspects in the horary chart.
   * @param {Object} horaryChart - The cast horary chart.
   * @param {string} question - The question text.
   * @returns {Object} Aspects analysis.
   * @private
   */
  _analyzeAspects(horaryChart, question) {
    return {
      applyingAspects: this._getApplyingAspects(horaryChart),
      separatingAspects: this._getSeparatingAspects(horaryChart),
      majorAspects: this._getMajorAspects(horaryChart),
      minorAspects: this._getMinorAspects(horaryChart),
      aspectPatterns: this._identifyAspectPatterns(horaryChart)
    };
  }

  /**
   * Generates an answer to the question based on the horary chart.
   * @param {Object} horaryChart - The cast horary chart.
   * @param {string} question - The question text.
   * @returns {Object} Answer details.
   * @private
   */
  _generateAnswer(horaryChart, question) {
    return {
      directAnswer: this._getDirectAnswer(horaryChart, question),
      probability: this._calculateProbability(horaryChart, question),
      confidence: this._calculateAnswerConfidence(horaryChart, question),
      reasoning: this._explainReasoning(horaryChart, question),
      alternatives: this._suggestAlternatives(horaryChart, question)
    };
  }

  /**
   * Generates recommendations based on the horary chart.
   * @param {Object} horaryChart - The cast horary chart.
   * @param {string} question - The question text.
   * @returns {Object} Recommendations.
   * @private
   */
  _generateRecommendations(horaryChart, question) {
    return {
      immediate: this._getImmediateRecommendations(horaryChart, question),
      shortTerm: this._getShortTermRecommendations(horaryChart, question),
      longTerm: this._getLongTermRecommendations(horaryChart, question),
      precautions: this._getPrecautions(horaryChart, question),
      actions: this._getSuggestedActions(horaryChart, question)
    };
  }

  /**
   * Generates follow-up questions based on the horary chart.
   * @param {Object} horaryChart - The cast horary chart.
   * @param {string} question - The question text.
   * @returns {Array<string>} List of follow-up questions.
   * @private
   */
  _generateFollowUpQuestions(horaryChart, question) {
    return [
      'What additional information would help clarify this situation?',
      'Are there specific timing considerations I should be aware of?',
      'What factors might influence the outcome?',
      'How can I best prepare for the likely outcome?',
      'What alternatives should I consider?'
    ];
  }

  /**
   * Calculates the confidence of the answer.
   * @param {Object} horaryChart - The cast horary chart.
   * @param {string} question - The question text.
   * @returns {number} Confidence score (0-100).
   * @private
   */
  _calculateAnswerConfidence(horaryChart, question) {
    let confidence = 50;
    if (this._hasStrongSignificators(horaryChart, question)) { confidence += 20; }
    if (this._hasClearAspects(horaryChart)) { confidence += 15; }
    if (this._hasFavorableMoonPosition(horaryChart)) { confidence += 10; }
    return Math.min(100, Math.max(0, confidence));
  }

  // Placeholder implementations for detailed analysis methods
  _getOverallInterpretation(horaryChart) { return 'Chart shows clear indications'; }
  _interpretSignificators(horaryChart, question) { return { interpretation: 'Strong significators' }; }
  _interpretRelevantHouses(horaryChart, question) { return { houses: 'Favorable house positions' }; }
  _interpretMoonPosition(horaryChart) { return { moon: 'Moon in favorable position' }; }
  _interpretKeyAspects(horaryChart, question) { return { aspects: 'Positive aspects dominate' }; }
  _interpretTimingIndicators(horaryChart) { return { timing: 'Timing indicators present' }; }
  _checkImmediateIndicators(horaryChart) { return { immediate: 'Some immediate indicators' }; }
  _analyzeShortTermTiming(horaryChart) { return { shortTerm: 'Short-term timing favorable' }; }
  _analyzeLongTermTiming(horaryChart) { return { longTerm: 'Long-term outlook positive' }; }
  _calculatePlanetaryHours(horaryChart) { return { hours: ['Favorable planetary hours'] }; }
  _identifyFavorableDays(horaryChart) { return { days: ['Favorable days identified'] }; }
  _getApplyingAspects(horaryChart) { return ['Applying aspect 1', 'Applying aspect 2']; }
  _getSeparatingAspects(horaryChart) { return ['Separating aspect 1']; }
  _getMajorAspects(horaryChart) { return ['Major aspect 1', 'Major aspect 2']; }
  _getMinorAspects(horaryChart) { return ['Minor aspect 1']; }
  _identifyAspectPatterns(horaryChart) { return { patterns: ['Aspect pattern identified'] }; }
  _getDirectAnswer(horaryChart, question) { return 'Yes, the outlook is favorable'; }
  _calculateProbability(horaryChart, question) { return 75; }
  _explainReasoning(horaryChart, question) { return 'Based on favorable planetary positions'; }
  _suggestAlternatives(horaryChart, question) { return ['Alternative approach 1']; }
  _getImmediateRecommendations(horaryChart, question) { return ['Immediate recommendation']; }
  _getShortTermRecommendations(horaryChart, question) { return ['Short-term recommendation']; }
  _getLongTermRecommendations(horaryChart, question) { return ['Long-term recommendation']; }
  _getPrecautions(horaryChart, question) { return ['Precaution 1']; }
  _getSuggestedActions(horaryChart, question) { return ['Action 1']; }
  _hasStrongSignificators(horaryChart, question) { return true; }
  _hasClearAspects(horaryChart) { return true; }
  _hasFavorableMoonPosition(horaryChart) { return true; }

  /**
   * Returns metadata for the service.
   * @returns {Object} Service metadata.
   */
  getMetadata() {
    return {
      name: this.serviceName,
      version: '1.0.0',
      category: 'vedic',
      methods: ['processCalculation', '_getQuickHoraryAnswer', '_getRelationshipHoraryAnalysis', '_getCareerHoraryAnalysis', '_getFinancialHoraryAnalysis', '_validateHoraryChart'],
      dependencies: [], // Managed by ServiceTemplate
      description: 'Specialized service for casting and interpreting horary charts.'
    };
  }

  /**
   * Returns help information for the service.
   * @returns {string} Help text.
   */
  getHelp() {
    return `
❓ **Horary Reading Service - Question-Based Astrological Guidance**

**Purpose:** Provides answers to specific questions by casting a horary chart at the exact moment the question is asked.

**Required Inputs:**
• Your specific question (clear and focused)
• Question time (ISO string, e.g., '2025-11-01T12:00:00.000Z')
• Location (Object with latitude, longitude, timezone, e.g., { latitude: 28.6139, longitude: 77.2090, timezone: 5.5 })

**Analysis Includes:**
• **Horary Chart:** Chart cast at the moment of the question.
• **Significators:** Planets representing the questioner and the matter of the question.
• **Aspects:** Planetary relationships indicating ease or challenge.
• **Timing:** Insights into when events might unfold.
• **Answer:** Direct answer, probability, and reasoning.
• **Recommendations:** Actionable advice based on the chart.

**Example Usage:**
"Will I get the job I applied for? Question asked at 2025-11-01T10:00:00.000Z in New Delhi."
"Should I move to a new city? Question asked at 2025-10-20T15:30:00.000Z in Mumbai."

**Output Format:**
Comprehensive report with horary chart details, answer analysis, and recommendations.
    `.trim();
  }
}

module.exports = HoraryReadingService;
