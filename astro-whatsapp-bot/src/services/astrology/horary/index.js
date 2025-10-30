const logger = require('../../../utils/logger');
const { HoraryConfig } = require('./HoraryConfig');
const { HoraryCalculator } = require('./HoraryCalculator');

/**
 * HoraryService - Main orchestrator for all horary astrology functionality
 * Provides unified interface for traditional question-based astrology
 */
class HoraryService {
  constructor() {
    // Initialize core components
    this.config = new HoraryConfig();
    // NOTE: HoraryInterpreter circular dependency - we'll create it inline for now
    // TODO: Implement proper module structure to avoid circular imports

    logger.info('Module: HoraryService initialized - Complete horary astrology system');
  }

  /**
   * Generate complete horary reading with chart and interpretation
   * @param {string} question - User's question
   * @param {string} questionTime - Time when question was asked
   * @param {Object} location - Location data for chart casting
   * @returns {Object} Complete horary reading
   */
  async performHoraryReading(question, questionTime, location = {}) {
    try {
      // Validate the question
      const validation = this.validateQuestion(question);
      if (!validation.isValid) {
        return {
          question,
          valid: false,
          reason: validation.reason,
          advice: 'Please ask a clear, specific question about a matter of genuine concern.'
        };
      }

      // Cast the horary chart
      const calculator = new HoraryCalculator(this.config);
      const chart = calculator.castHoraryChart(questionTime, location);

      // Assign houses to planets
      const refinedChart = calculator.assignHousesToPlanets(chart);

      // Determine the judge
      const judge = calculator.determineJudge(refinedChart, question);

      // Analyze the question
      const questionAnalysis = this.analyzeQuestion(question, refinedChart);

      // Generate the answer
      const answer = this.generateAnswer(refinedChart, judge, questionAnalysis);

      return {
        question,
        valid: true,
        chart: refinedChart,
        judge,
        questionAnalysis,
        answer,
        timing: this.determineTiming(refinedChart),
        disclaimer: '⚠️ *Important Disclaimer:* This horary reading uses simplified calculations for educational purposes. Real horary astrology requires precise astronomical data and should be interpreted by a professional astrologer. Results should not be used for major life decisions.',
        horaryDescription: this.generateHoraryDescription(refinedChart, judge, answer)
      };
    } catch (error) {
      logger.error('Error generating horary reading:', error);
      return {
        question,
        valid: false,
        error: 'Unable to generate horary reading at this time',
        fallback: 'Horary astrology reveals the answer hidden in the stars at the moment of your question'
      };
    }
  }

  /**
   * Validate if a question is appropriate for horary astrology
   * @param {string} question - The question
   * @returns {Object} Validation result
   */
  validateQuestion(question) {
    const lowerQuestion = question.toLowerCase();

    // Check for inappropriate questions
    const inappropriate = [
      'death',
      'suicide',
      'murder',
      'crime',
      'illegal',
      'gambling',
      'lottery',
      'speculation',
      'betting'
    ];

    for (const word of inappropriate) {
      if (lowerQuestion.includes(word)) {
        return {
          isValid: false,
          reason: 'This type of question is not appropriate for horary astrology as it deals with harmful or speculative matters.'
        };
      }
    }

    // Check if it's a yes/no question or specific inquiry
    const isQuestion =
      lowerQuestion.includes('?') ||
      lowerQuestion.startsWith('will') ||
      lowerQuestion.startsWith('should') ||
      lowerQuestion.startsWith('can') ||
      lowerQuestion.startsWith('is') ||
      lowerQuestion.startsWith('are') ||
      lowerQuestion.startsWith('do') ||
      lowerQuestion.startsWith('does');

    if (!isQuestion) {
      return {
        isValid: false,
        reason: 'Please ask a clear question. Horary astrology works best with specific inquiries.'
      };
    }

    // Check for clarity
    if (question.length < 10) {
      return {
        isValid: false,
        reason: 'Please provide more detail in your question for a meaningful horary reading.'
      };
    }

    return { isValid: true };
  }

  /**
   * Analyze the question in the context of the chart
   * @param {string} question - The question
   * @param {Object} chart - Horary chart
   * @returns {Object} Question analysis
   */
  analyzeQuestion(question, chart) {
    const category = this.categorizeQuestion(question);
    const relevantHouses = this.getRelevantHouses(category);

    const houseAnalysis = relevantHouses.map(house => ({
      house,
      meaning: this.config.getHouseMeaning(house),
      planets: this.getPlanetsInHouse(chart, house)
    }));

    return {
      category,
      relevantHouses: houseAnalysis,
      keyIndicators: this.identifyKeyIndicators(chart, category)
    };
  }

  /**
   * Categorize question for horary analysis
   * @param {string} question - Question text
   * @returns {string} Question category
   */
  categorizeQuestion(question) {
    const lowerQuestion = question.toLowerCase();

    // Define category patterns
    const patterns = {
      love: /(love|relationship|marriage|partner|boyfriend|girlfriend|romance|affection)/,
      career: /(career|job|work|profession|business|promotion|boss|colleague)/,
      health: /(health|illness|doctor|medical|body|pain|disease|sick|recovery)/,
      money: /(money|finance|financial|rich|poor|debt|investment|salary|income)/,
      travel: /(travel|journey|trip|visit|location|place|distance|abroad|vacation)/,
      family: /(family|parent|father|mother|child|children|sibling|brother|sister|home|house)/,
      legal: /(legal|law|court|contract|agreement|police|justice|lawsuit|divorce)/,
      spiritual: /(spiritual|spirit|god|soul|divine|sacred|religion|meditation|karma)/
    };

    // Check patterns
    for (const [category, pattern] of Object.entries(patterns)) {
      if (pattern.test(lowerQuestion)) {
        return category;
      }
    }

    return 'general';
  }

  /**
   * Get relevant houses for question category
   * @param {string} category - Question category
   * @returns {Array} House numbers
   */
  getRelevantHouses(category) {
    const categoryData = this.config.getQuestionCategory(category);
    return categoryData.houses || [1, 7]; // Default to 1st and 7th houses
  }

  /**
   * Get planets in a specific house
   * @param {Object} chart - Horary chart
   * @param {number} house - House number
   * @returns {Array} Planets in the house
   */
  getPlanetsInHouse(chart, house) {
    const planets = [];
    Object.entries(chart.planetaryPositions).forEach(([planet, position]) => {
      if (position.house === house) {
        planets.push(planet);
      }
    });
    return planets;
  }

  /**
   * Identify key indicators for the question
   * @param {Object} chart - Horary chart
   * @param {string} category - Question category
   * @returns {Array} Key indicators
   */
  identifyKeyIndicators(chart, category) {
    const indicators = [];

    // Check moon position (moon is co-significator)
    const moonPosition = chart.planetaryPositions.moon;
    if (moonPosition) {
      indicators.push(`Moon in ${moonPosition.sign} (house ${moonPosition.house})`);
    }

    // Check judge position
    const calculator = new HoraryCalculator(this.config);
    const judge = calculator.determineJudge(chart, '');
    const judgePosition = chart.planetaryPositions[judge.planet];
    if (judgePosition) {
      indicators.push(`${judge.name} in ${judgePosition.sign} (house ${judgePosition.house})`);
    }

    // Add category-specific indicators
    if (category === 'love') {
      indicators.push('Venus and Mars positions indicate relationship dynamics');
    } else if (category === 'career') {
      indicators.push('Saturn and Jupiter show career development');
    }

    return indicators.slice(0, 5); // Limit to top indicators
  }

  /**
   * Generate answer based on chart analysis
   * @param {Object} chart - Horary chart
   * @param {Object} judge - Judge information
   * @param {Object} questionAnalysis - Question analysis
   * @returns {Object} Answer data
   */
  generateAnswer(chart, judge, questionAnalysis) {
    // Determine yes/no answer
    const yesNo = this.determineYesNo(chart, judge);

    // Assess confidence
    const confidence = this.assessConfidence(chart, judge);

    // Determine timing
    const timing = this.determineTiming(chart);

    // Generate advice
    const advice = this.generateAdvice(chart, judge, questionAnalysis);

    // Identify warnings
    const warnings = this.identifyWarnings(chart);

    return {
      yesNo,
      confidence,
      timing,
      advice,
      warnings
    };
  }

  /**
   * Determine yes/no answer based on horary rules
   * @param {Object} chart - Horary chart
   * @param {Object} judge - Judge information
   * @returns {string} Yes/no answer
   */
  determineYesNo(chart, judge) {
    const judgeHouse = chart.planetaryPositions[judge.planet]?.house || 1;

    // Angular houses generally indicate positive outcomes
    if ([1, 4, 7, 10].includes(judgeHouse)) {
      return judge.planet === 'mars' ? 'No (Mars denies in angular house)' :
        judge.planet === 'saturn' ? 'Delayed, but eventually yes' : 'Yes';
    }

    // Cadent houses may indicate no or delay
    if ([3, 6, 9, 12].includes(judgeHouse)) {
      return 'No, or significant delays';
    }

    // Succedent houses are neutral
    return 'Maybe/Neutral - question needs clarification';
  }

  /**
   * Assess confidence in the answer
   * @param {Object} chart - Horary chart
   * @param {Object} judge - Judge information
   * @returns {string} Confidence level
   */
  assessConfidence(chart, judge) {
    if (judge.strength.includes('Very Strong')) {
      return 'High confidence - very clear chart';
    } else if (judge.strength.includes('Strong')) {
      return 'Moderate confidence - somewhat clear';
    } else if (judge.strength.includes('Moderate')) {
      return 'Low confidence - chart unclear';
    }
    return 'Uncertain - question may need clarification';
  }

  /**
   * Determine timing of the answer
   * @param {Object} chart - Horary chart
   * @returns {string} Timing information
   */
  determineTiming(chart) {
    const moonHouse = chart.planetaryPositions.moon?.house || 1;

    if (moonHouse <= 3) {
      return 'Soon (within days/weeks)';
    } else if (moonHouse <= 6) {
      return 'Moderate time (weeks/months)';
    } else if (moonHouse <= 9) {
      return 'Extended time (months/year)';
    } else {
      return 'Long-term (year or more)';
    }
  }

  /**
   * Generate advice based on the chart
   * @param {Object} chart - Horary chart
   * @param {Object} judge - Judge information
   * @param {Object} questionAnalysis - Question analysis
   * @returns {string} Advice
   */
  generateAdvice(chart, judge, questionAnalysis) {
    const advice = [];

    // Basic advice based on judge
    advice.push(`Trust ${judge.name}'s guidance in this matter.`);

    // House-based advice
    const relevantHouse = questionAnalysis.relevantHouses[0];
    if (relevantHouse) {
      advice.push(`Focus attention on matters of ${relevantHouse.meaning.toLowerCase()}.`);
    }

    // Planetary hour advice
    advice.push(`The planetary hour of ${chart.planetaryHour} suggests ${this.getHourAdvice(chart.planetaryHour)}.`);

    // Add specific advice based on question category
    if (questionAnalysis.category === 'love') {
      advice.push('Open your heart and communicate your true feelings.');
    } else if (questionAnalysis.category === 'career') {
      advice.push('Be patient and persistent in your professional pursuits.');
    }

    return advice.join(' ');
  }

  /**
   * Get advice based on planetary hour
   * @param {string} hour - Planetary hour
   * @returns {string} Hour-based advice
   */
  getHourAdvice(hour) {
    const advice = {
      sun: 'leadership and confidence in taking action',
      moon: 'intuition and emotional wisdom',
      mercury: 'communication and gathering information',
      venus: 'harmony and relationship building',
      mars: 'courage and direct confrontation of challenges',
      jupiter: 'expansion and seeking broader understanding',
      saturn: 'discipline and careful planning'
    };

    return advice[hour.toLowerCase()] || 'mindful consideration and patience';
  }

  /**
   * Identify warnings from the chart
   * @param {Object} chart - Horary chart
   * @returns {Array} Warnings
   */
  identifyWarnings(chart) {
    const warnings = [];

    // Check for challenging planetary positions
    Object.entries(chart.planetaryPositions).forEach(([planet, position]) => {
      if ([6, 8, 12].includes(position.house)) {
        warnings.push(`${planet} in challenging house ${position.house} suggests obstacles or delays.`);
      }
    });

    // Check retrograde status (simplified - full implementation would need speed)
    const moonSpeed = chart.planetaryPositions.moon?.speed || 0;
    if (moonSpeed < 0) {
      warnings.push('Moon is in apparent retrograde motion - internal reflection needed.');
    }

    return warnings.slice(0, 3); // Limit to most important warnings
  }

  /**
   * Generate complete horary description for display
   * @param {Object} chart - Horary chart
   * @param {Object} judge - Judge information
   * @param {Object} answer - Answer data
   * @returns {string} Formatted horary reading
   */
  generateHoraryDescription(chart, judge, answer) {
    let description = '🔮 *Traditional Horary Astrology Reading*\n\n';
    description += '⚠️ *Educational Disclaimer:* This horary reading uses calculations for demonstration. Traditional horary requires precise astronomical data and professional astrological expertise.\n\n';

    // Chart casting info
    description += `⏰ *Chart Cast:* ${chart.questionTime.day}/${chart.questionTime.month}/${chart.questionTime.year} ${String(chart.questionTime.hour).padStart(2, '0')}:${String(chart.questionTime.minute).padStart(2, '0')}\n`;
    description += `🌍 *Ascendant:* ${chart.ascendant.sign} ${chart.ascendant.symbol} (${chart.ascendant.degree.toFixed(1)}°)\n`;
    description += `🌙 *Planetary Hour:* ${chart.planetaryHour.toLowerCase()}\n\n`;

    // Judge information
    description += '👑 *Judge (Primary Significator):*\n';
    description += `• Planet: ${judge.name} ${judge.symbol}\n`;
    description += `• Dignity: ${judge.dignity}\n`;
    description += `• Strength: ${judge.strength}\n`;
    description += `• Questions: ${judge.questions}\n\n`;

    // Answer
    description += '❓ *Horary Answer:*\n';
    description += `• Yes/No: ${answer.yesNo}\n`;
    description += `• Confidence: ${answer.confidence}\n`;
    description += `• Timing: ${answer.timing}\n\n`;

    // Planetary positions
    description += '🪐 *Key Planetary Positions:*\n';
    const keyPlanets = ['sun', 'moon', 'judge.planet'];
    keyPlanets.forEach(planetKey => {
      if (chart.planetaryPositions[planetKey]) {
        const position = chart.planetaryPositions[planetKey];
        description += `• ${planetKey.charAt(0).toUpperCase() + planetKey.slice(1)}: ${position.sign} (house ${position.house})\n`;
      }
    });
    description += '\n';

    // Advice
    if (answer.advice) {
      description += `💫 *Astrological Guidance:*\n${answer.advice}\n\n`;
    }

    // Warnings
    if (answer.warnings && answer.warnings.length > 0) {
      description += '⚠️ *Important Considerations:\n';
      answer.warnings.forEach(warning => {
        description += `• ${warning}\n`;
      });
      description += '\n';
    }

    // Traditional wisdom
    description += '📚 *Traditional Horary Principles:*\n';
    description += '• The ascendant represents the querent (questioner)\n';
    description += '• The judge shows the outcome and final answer\n';
    description += '• Angular houses (1,4,7,10) indicate strength and success\n';
    description += '• The Moon reveals the emotional truth of the matter\n';
    description += '• Early degrees suggest early timing, late degrees delayed\n\n';

    description += '*🔮 Remember: Horary astrology reveals the "truth of the hour" when your question was asked. This reading reflects the astrological wisdom of that moment. Consult professional astrologers for complex life matters.*';

    return description;
  }

  /**
   * Get horary knowledge base statistics
   * @returns {Object} Horary system statistics
   */
  getHoraryCatalog() {
    return {
      planetaryRulers: Object.keys(this.config.getAllPlanetaryRulers()).length,
      houseMeanings: Object.keys(this.config.getAllHouseMeanings()).length,
      questionCategories: Object.keys(this.config.getAllQuestionCategories()).length,
      planetaryHours: 24, // Fixed 24 planetary hours
      capabilities: [
        'Question Validation',
        'Chart Casting',
        'Judge Determination',
        'Answer Generation',
        'Timing Analysis',
        'Traditional Interpretation'
      ],
      description: 'Complete traditional horary astrology system with question-based divination, planetary rulers, house meanings, and authentic astrological wisdom'
    };
  }

  /**
   * Comprehensive health check for entire horary system
   * @returns {Object} Health status
   */
  healthCheck() {
    try {
      const configHealth = this.config.healthCheck();

      // Test question validation
      const validQuestion = this.validateQuestion('Will I get married?');
      const invalidQuestion = this.validateQuestion('');

      // Test question categorization
      const testCategory = this.categorizeQuestion('Will my relationship improve?');

      // Test reading generation (basic test)
      const mockChart = {
        ascendant: { degree: 90, sign: 'Cancer', symbol: '♋' },
        planetaryPositions: {
          moon: { house: 5, sign: 'Leo', longitude: 135 }
        },
        planetaryHour: 'venus'
      };

      const mockJudge = {
        planet: 'moon',
        name: 'Moon',
        symbol: '☽',
        strength: 'Strong',
        dignity: 'Emotions, home, women'
      };

      const mockAnalysis = { category: 'love', relevantHouses: [] };

      const testAnswer = this.generateAnswer(mockChart, mockJudge, mockAnalysis);
      const testDescription = this.generateHoraryDescription(mockChart, mockJudge, { yesNo: 'Yes', confidence: 'High', timing: 'Soon', advice: 'Trust your instincts', warnings: [] });

      const catalog = this.getHoraryCatalog();

      return {
        system: {
          healthy: configHealth.healthy && validQuestion.isValid && !invalidQuestion.isValid && testCategory && testAnswer && testDescription,
          version: '1.0.0',
          name: 'Complete Traditional Horary Astrology System',
          databaseComplete: catalog.planetaryRulers === 7 && catalog.houseMeanings === 12,
          capabilities: catalog.capabilities.length
        },
        config: configHealth,
        validationTests: validQuestion.isValid && !invalidQuestion.isValid,
        generationTest: testDescription && testDescription.length > 0,
        status: configHealth.healthy ? 'Fully Operational' : 'Configuration Issues',
        knowledgeBase: catalog
      };
    } catch (error) {
      logger.error('HoraryService health check failed:', error);
      return {
        healthy: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Create singleton instance
let horaryServiceInstance = null;

async function createHoraryService() {
  if (!horaryServiceInstance) {
    horaryServiceInstance = new HoraryService();
  }
  return horaryServiceInstance;
}

// Export both class and convenience functions
module.exports = {
  HoraryService,
  createHoraryService,
  // Convenience functions for direct access
  async performHoraryReading(question, questionTime, location) {
    const service = await createHoraryService();
    return await service.performHoraryReading(question, questionTime, location);
  }
};
