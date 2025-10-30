const logger = require('../../../utils/logger');
const { IChingConfig } = require('./IChingConfig');
const { IChingCalculator } = require('./IChingCalculator');

/**
 * IChingInterpreter - Reading generation and interpretation logic
 * Handles divination guidance, daily wisdom, and detailed analysis
 */
class IChingInterpreter {
  /**
   * @param {IChingConfig} config - IChing configuration instance
   * @param {IChingCalculator} calculator - IChing calculator instance
   */
  constructor(config = new IChingConfig(), calculator = new IChingCalculator()) {
    this.logger = logger;
    this.config = config;
    this.calculator = calculator;

    this.logger.info('Module: IChingInterpreter loaded with comprehensive reading capabilities');
  }

  /**
   * Generate I Ching reading with hexagram and interpretation
   * @param {string} question - User's question (optional)
   * @returns {Object} Complete I Ching reading
   */
  generateIChingReading(question = '') {
    try {
      // Generate primary hexagram
      const primaryHexagram = this.calculator.generateHexagram();

      // Generate changing lines
      const changingLines = this.calculator.generateChangingLines(primaryHexagram.lines);

      // Calculate related hexagrams
      const nuclearHexagram = this.calculator.calculateNuclearHexagram(primaryHexagram);
      const relatingHexagram = this.calculator.calculateRelatingHexagram(primaryHexagram);

      // Generate transformed hexagram if there are changing lines
      const transformedHexagram =
        changingLines.length > 0 ?
          this.calculator.transformHexagram(primaryHexagram, changingLines) :
          null;

      return {
        question: question || 'General guidance',
        primaryHexagram,
        changingLines,
        transformedHexagram,
        nuclearHexagram,
        relatingHexagram,
        interpretation: this.generateInterpretation(
          primaryHexagram,
          changingLines,
          transformedHexagram
        ),
        ichingDescription: this.generateIChingDescription(
          primaryHexagram,
          changingLines,
          transformedHexagram
        )
      };
    } catch (error) {
      logger.error('Error generating I Ching reading:', error);
      return {
        error: 'Unable to generate I Ching reading at this time',
        fallback: 'The I Ching offers wisdom through the flow of yin and yang'
      };
    }
  }

  /**
   * Generate interpretation of the reading
   * @param {Object} primaryHexagram - Primary hexagram
   * @param {Array} changingLines - Changing lines
   * @param {Object} transformedHexagram - Transformed hexagram
   * @returns {Object} Interpretation
   */
  generateInterpretation(primaryHexagram, changingLines, transformedHexagram) {
    const interpretation = {
      primary: `Hexagram ${primaryHexagram.number}: ${primaryHexagram.name}`,
      guidance: primaryHexagram.judgment,
      situation: this.extractSituation(primaryHexagram),
      advice: this.extractAdvice(primaryHexagram)
    };

    if (changingLines.length > 0) {
      interpretation.transformation = `The hexagram transforms to ${transformedHexagram.name} (${transformedHexagram.number})`;
      interpretation.transformedGuidance = transformedHexagram.judgment;
      interpretation.changingLines = changingLines.map(
        line => `Line ${line} is changing`
      );
    }

    return interpretation;
  }

  /**
   * Extract situation description from hexagram
   * @param {Object} hexagram - Hexagram data
   * @returns {string} Situation description
   */
  extractSituation(hexagram) {
    const situations = {
      1: 'A time of pure creative power and new beginnings',
      2: 'A period of receptivity and nurturing support',
      11: 'Harmony and peace prevail in your situation',
      12: 'Standstill and separation challenge your path',
      25: 'Innocence and natural action guide you',
      29: 'Dangerous waters require careful navigation',
      50: 'Sacred nourishment and self-care are needed',
      63: 'Completion and new beginnings are emerging'
    };

    return (
      situations[hexagram.number] ||
      'The situation requires careful consideration of the forces at play'
    );
  }

  /**
   * Extract advice from hexagram
   * @param {Object} hexagram - Hexagram data
   * @returns {string} Advice
   */
  extractAdvice(hexagram) {
    const advice = {
      1: 'Lead with creative power and maintain perseverance',
      2: 'Be receptive and supportive, like the nurturing earth',
      15: 'Practice modesty and balance in all actions',
      16: 'Express enthusiasm and inspire others through action',
      32: 'Maintain constancy and steady progress',
      58: 'Find joy in relationships and shared experiences',
      14: 'Embrace abundance with generosity and grace',
      53: 'Develop steadily and find your proper path',
      55: 'Lead with power tempered by wisdom'
    };

    return (
      advice[hexagram.number] ||
      'Follow the natural flow of the situation with wisdom and patience'
    );
  }

  /**
   * Generate comprehensive I Ching description for WhatsApp
   * @param {Object} primaryHexagram - Primary hexagram
   * @param {Array} changingLines - Changing lines
   * @param {Object} transformedHexagram - Transformed hexagram
   * @returns {string} I Ching description
   */
  generateIChingDescription(
    primaryHexagram,
    changingLines,
    transformedHexagram
  ) {
    let description = '🔮 *I Ching Reading*\n\n';

    description += `📖 *Primary Hexagram: ${primaryHexagram.number} - ${primaryHexagram.name}*\n`;
    description += `• Upper Trigram: ${primaryHexagram.upperTrigram.name} (${primaryHexagram.upperTrigram.symbol})\n`;
    description += `• Lower Trigram: ${primaryHexagram.lowerTrigram.name} (${primaryHexagram.lowerTrigram.symbol})\n\n`;

    description += `🎭 *Judgment:*\n${primaryHexagram.judgment}\n\n`;

    description += `🖼️ *Image:*\n${primaryHexagram.image}\n\n`;

    if (changingLines.length > 0) {
      description += '🔄 *Changing Lines:*\n';
      changingLines.forEach(line => {
        description += `• Line ${line} is transforming\n`;
      });
      description += `\n📈 *Transformed Hexagram: ${transformedHexagram.number} - ${transformedHexagram.name}*\n`;
      description += `• Judgment: ${transformedHexagram.judgment}\n\n`;
    }

    description += '🧘 *Meditation Focus:*\n';
    description += `• Reflect on the balance of ${primaryHexagram.upperTrigram.qualities[0]} and ${primaryHexagram.lowerTrigram.qualities[0]}\n`;
    description += `• Consider: ${this.extractSituation(primaryHexagram)}\n\n`;

    description += `💡 *Practical Advice:*\n${this.extractAdvice(primaryHexagram)}`;

    return description;
  }

  /**
   * Generate daily I Ching guidance
   * @param {string} focus - Daily focus or question
   * @returns {Object} Daily guidance
   */
  generateDailyGuidance(focus = 'daily wisdom') {
    try {
      const reading = this.generateIChingReading(focus);

      return {
        hexagram: `${reading.primaryHexagram.number} - ${reading.primaryHexagram.name}`,
        guidance: reading.interpretation.guidance,
        dailyFocus: reading.interpretation.advice,
        meditation: `Contemplate the ${reading.primaryHexagram.upperTrigram.name} above and ${reading.primaryHexagram.lowerTrigram.name} below`,
        affirmation: this.generateAffirmation(reading.primaryHexagram)
      };
    } catch (error) {
      logger.error('Error generating daily guidance:', error);
      return {
        hexagram: 'Unknown',
        guidance: 'Seek wisdom in the flow of life',
        dailyFocus: 'Practice mindfulness and balance',
        meditation: 'Meditate on the harmony of yin and yang',
        affirmation: 'I flow with the wisdom of the I Ching'
      };
    }
  }

  /**
   * Generate affirmation based on hexagram
   * @param {Object} hexagram - Hexagram data
   * @returns {string} Affirmation
   */
  generateAffirmation(hexagram) {
    const affirmations = {
      1: 'I create with pure power and divine will',
      2: 'I receive and nurture with perfect receptivity',
      11: 'I bring harmony and peace to all situations',
      15: 'I practice modesty and balance in all things',
      25: 'I act with natural innocence and wisdom',
      32: 'I maintain constancy through all changes',
      58: 'I find joy and connection in all relationships',
      29: 'I navigate dangerous waters with skill and courage',
      30: 'I shine with righteous clarity and truth'
    };

    return (
      affirmations[hexagram.number] ||
      'I align with the natural flow of the universe'
    );
  }

  /**
   * Analyze hexagram for specific question types
   * @param {Object} reading - Complete I Ching reading
   * @param {string} questionType - Type of question (career, love, health, etc.)
   * @returns {Object} Specialized interpretation
   */
  analyzeForQuestionType(reading, questionType) {
    const { primaryHexagram, transformedHexagram, changingLines } = reading;
    const firmness = (primaryHexagram.lines.filter(line => line === 7 || line === 9).length / 6) * 100;
    const changeIntensity = changingLines.length;

    const interpretations = {
      career: this.analyzeCareerHexagram(primaryHexagram, firmness, changeIntensity),
      love: this.analyzeLoveHexagram(primaryHexagram, firmness, changeIntensity),
      health: this.analyzeHealthHexagram(primaryHexagram, firmness, changeIntensity),
      finances: this.analyzeFinancialHexagram(primaryHexagram, firmness, changeIntensity)
    };

    return {
      questionType,
      analysis: interpretations[questionType] || this.getGeneralAnalysis(primaryHexagram),
      firmnessPercentile: Math.round(firmness),
      changeIntensity: changeIntensity > 0 ? 'High' : 'Low',
      recommendation: this.getQuestionTypeRecommendation(questionType, reading)
    };
  }

  /**
   * Career-specific hexagram analysis
   * @param {Object} hexagram - Hexagram data
   * @param {number} firmness - Firmness ratio (0-100)
   * @param {number} changeIntensity - Number of changing lines
   * @returns {string} Career analysis
   */
  analyzeCareerHexagram(hexagram, firmness, changeIntensity) {
    if (firmness > 70 && changeIntensity > 3) {
      return 'Change is coming - prepare for new opportunities in your career path';
    } else if (firmness < 30) {
      return 'Take action now to stabilize and strengthen your professional position';
    } else {
      return 'Your career is in a stable phase - focus on deepening current expertise';
    }
  }

  /**
   * Love-specific hexagram analysis
   * @param {Object} hexagram - Hexagram data
   * @param {number} firmness - Firmness ratio (0-100)
   * @param {number} changeIntensity - Number of changing lines
   * @returns {string} Love analysis
   */
  analyzeLoveHexagram(hexagram, firmness, changeIntensity) {
    if (hexagram.number === 31) {
      return 'Love flows naturally - embrace genuine connections';
    } else if (changeIntensity > 0) {
      return 'Relationships are evolving - communicate openly and with heart';
    } else {
      return 'Seek harmony and mutual understanding in current relationships';
    }
  }

  /**
   * Health-specific hexagram analysis
   * @param {Object} hexagram - Hexagram data
   * @param {number} firmness - Firmness ratio (0-100)
   * @param {number} changeIntensity - Number of changing lines
   * @returns {string} Health analysis
   */
  analyzeHealthHexagram(hexagram, firmness, changeIntensity) {
    if ([1, 11, 58].includes(hexagram.number)) {
      return 'Strong health period - maintain good habits';
    } else if ([29, 39, 47].includes(hexagram.number)) {
      return 'Take care during this challenging period - focus on rest and recovery';
    } else {
      return 'Balance activity with rest, listen to your body\'s wisdom';
    }
  }

  /**
   * Financial hexagram analysis
   * @param {Object} hexagram - Hexagram data
   * @param {number} firmness - Firmness ratio (0-100)
   * @param {number} changeIntensity - Number of changing lines
   * @returns {string} Financial analysis
   */
  analyzeFinancialHexagram(hexagram, firmness, changeIntensity) {
    if ([1, 14, 58].includes(hexagram.number)) {
      return 'Period of abundance and opportunity - invest wisely';
    } else if ([29, 39].includes(hexagram.number)) {
      return 'Caution advised - save rather than risk';
    } else if (changeIntensity > 3) {
      return 'Financial changes likely - plan carefully';
    } else {
      return 'Steady financial position - focus on building wealth gradually';
    }
  }

  /**
   * Get general hexagram analysis
   * @param {Object} hexagram - Hexagram data
   * @returns {string} General analysis
   */
  getGeneralAnalysis(hexagram) {
    if (hexagram.upperTrigram && hexagram.lowerTrigram) {
      const upperQuality = hexagram.upperTrigram.qualities[0];
      const lowerQuality = hexagram.lowerTrigram.qualities[0];
      return `Focus on the balance between ${lowerQuality} foundation and ${upperQuality} vision`;
    }

    return 'Seek wisdom in the natural flow of circumstances';
  }

  /**
   * Get recommendation for specific question type
   * @param {string} questionType - Type of question
   * @param {Object} reading - Complete reading
   * @returns {string} Recommendation
   */
  getQuestionTypeRecommendation(questionType, reading) {
    const recommendations = {
      career: 'Take decisive action toward professional goals while remaining flexible',
      love: 'Communicate your true feelings and listen with genuine understanding',
      health: 'Consult healthcare professionals and honor your body\'s wisdom',
      finances: 'Seek wise counsel and trust your inner guidance on financial matters'
    };

    return recommendations[questionType] || 'Proceed with mindfulness and integrity';
  }

  /**
   * Health check for IChingInterpreter
   * @returns {Object} Health status
   */
  healthCheck() {
    try {
      const configHealth = this.config.healthCheck();
      const calculatorHealth = this.calculator.healthCheck();

      // Test interpretation generation
      const testReading = this.generateIChingReading('test question');
      const validReading = testReading && testReading.primaryHexagram && testReading.interpretation;

      // Test daily guidance
      const testGuidance = this.generateDailyGuidance();
      const validGuidance = testGuidance && testGuidance.affirmation;

      return {
        healthy: configHealth.healthy && calculatorHealth.healthy && validReading && validGuidance,
        configStatus: configHealth,
        calculatorStatus: calculatorHealth,
        readingTest: validReading,
        guidanceTest: validGuidance,
        version: '1.0.0',
        capabilities: ['Reading Generation', 'Daily Guidance', 'Specialized Analysis', 'Affirmation Creation'],
        status: 'Operational'
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = { IChingInterpreter };
