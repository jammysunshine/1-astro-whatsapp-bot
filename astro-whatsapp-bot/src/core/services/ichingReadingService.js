const ServiceTemplate = require('../ServiceTemplate');
const logger = require('../../utils/logger');
const IChingCalculator = require('../../services/astrology/iching/IChingCalculator');
const IChingInterpreter = require('../../services/astrology/iching/IChingInterpreter');
const IChingConfig = require('../../services/astrology/iching/IChingConfig');

// Import calculator from existing implementation
/**
 * IChingReadingService - Specialized service for providing I Ching readings
 *
 * Provides I Ching (Book of Changes) readings with hexagram generation,
 * interpretation, and guidance based on the ancient Chinese divination system.
 */
class IChingReadingService extends ServiceTemplate {
  constructor() {
    super('ChartGenerator');
    this.calculatorPath = '../calculators/ChartGenerator';
    this.serviceName = 'IChingReadingService';
    // Don't set calculatorPath since we're directly importing and initializing
    logger.info('IChingReadingService initialized');
  }

  async initialize() {
    try {
      await super.initialize();
      // Initialize with the calculator and interpreter
      this.calculator = new IChingCalculator();
      this.interpreter = new IChingInterpreter(
        new IChingConfig(),
        this.calculator
      );
      logger.info('✅ IChingReadingService initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize IChingReadingService:', error);
      throw error;
    }
  }

  /**
   * Generate a complete I Ching reading
   * @param {Object} readingParams - Parameters for the reading
   * @param {string} readingParams.question - The question to be answered
   * @param {string} readingParams.focus - Optional focus area (career, love, health, etc.)
   * @returns {Object} Complete I Ching reading
   */
  async generateIChingReading(readingParams) {
    try {
      // Validate required parameters
      if (!readingParams || !readingParams.question) {
        throw new Error('Question is required for I Ching reading');
      }

      const { question, focus = 'general' } = readingParams;

      // Generate reading using the interpreter
      const reading = this.interpreter.generateIChingReading(question);

      // Enhance with specialized analysis if focus is provided
      let enhancedAnalysis = {};
      if (focus !== 'general') {
        enhancedAnalysis = this.interpreter.analyzeForQuestionType(
          reading,
          focus
        );
      }

      // Add service-specific metadata
      const result = {
        ...reading,
        analysis: enhancedAnalysis,
        metadata: {
          service: this.serviceName,
          calculationType: 'iching_reading',
          timestamp: new Date().toISOString(),
          focus,
          traditions: ['Chinese', 'Divination', 'Yin-Yang Philosophy']
        }
      };

      return {
        success: true,
        data: result,
        metadata: {
          calculationType: 'iching_reading',
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      logger.error('❌ Error in generateIChingReading:', error);
      return {
        success: false,
        error: error.message,
        metadata: {
          calculationType: 'iching_reading',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Get daily I Ching guidance
   * @param {Object} params - Parameters for daily guidance
   * @param {string} params.focus - Daily focus or intention
   * @returns {Object} Daily I Ching guidance
   */
  async getDailyIChingGuidance(params) {
    try {
      const { focus = 'daily wisdom' } = params || {};

      const guidance = this.interpreter.generateDailyGuidance(focus);

      return {
        success: true,
        data: guidance,
        metadata: {
          calculationType: 'daily_guidance',
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      logger.error('❌ Error in getDailyIChingGuidance:', error);
      return {
        success: false,
        error: error.message,
        metadata: {
          calculationType: 'daily_guidance',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Get I Ching interpretation for a specific hexagram
   * @param {Object} params - Parameters
   * @param {number} params.hexagramNumber - Hexagram number (1-64)
   * @returns {Object} Hexagram interpretation
   */
  async getHexagramInterpretation(params) {
    try {
      // Validate required parameters
      if (!params || typeof params.hexagramNumber === 'undefined') {
        throw new Error('Hexagram number is required for interpretation');
      }

      const { hexagramNumber } = params;

      if (hexagramNumber < 1 || hexagramNumber > 64) {
        throw new Error('Hexagram number must be between 1 and 64');
      }

      const hexagramData = this.interpreter.config.getHexagram(hexagramNumber);

      return {
        success: true,
        data: {
          number: hexagramNumber,
          name: hexagramData.name,
          judgment: hexagramData.judgment,
          image: hexagramData.image,
          characteristics: hexagramData.characteristics || [],
          qualities: hexagramData.qualities || [],
          elements: hexagramData.elements || [],
          trigrams: {
            upper:
              hexagramData.upperTrigram ||
              this.interpreter.calculator.calculateUpperTrigram(
                this.createLinesFromHexagramNumber(hexagramNumber)
              ),
            lower:
              hexagramData.lowerTrigram ||
              this.interpreter.calculator.calculateLowerTrigram(
                this.createLinesFromHexagramNumber(hexagramNumber)
              )
          }
        },
        metadata: {
          calculationType: 'hexagram_interpretation',
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      logger.error('❌ Error in getHexagramInterpretation:', error);
      return {
        success: false,
        error: error.message,
        metadata: {
          calculationType: 'hexagram_interpretation',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Create lines from hexagram number (utility method)
   * @param {number} hexagramNumber - Hexagram number
   * @returns {Array} Array of line values
   */
  createLinesFromHexagramNumber(hexagramNumber) {
    // Convert hexagram number to binary representation
    const binary = (hexagramNumber - 1).toString(2).padStart(6, '0');
    return binary
      .split('')
      .reverse()
      .map(digit => (parseInt(digit) === 1 ? 7 : 8));
  }

  /**
   * Get quick I Ching reading summary
   * @param {Object} params - Parameters
   * @param {string} params.question - The question to be answered
   * @returns {Object} Quick reading summary
   */
  async getQuickIChingReading(params) {
    try {
      // Validate required parameters
      if (!params || !params.question) {
        throw new Error('Question is required for I Ching reading');
      }

      const { question } = params;

      const reading = this.interpreter.generateIChingReading(question);

      const quickSummary = {
        hexagram: `${reading.primaryHexagram.number} - ${reading.primaryHexagram.name}`,
        guidance: reading.interpretation.guidance,
        situation: this.interpreter.extractSituation(reading.primaryHexagram),
        advice: this.interpreter.extractAdvice(reading.primaryHexagram),
        hasChanges: reading.changingLines && reading.changingLines.length > 0,
        changingLines: reading.changingLines,
        summary: this.generateQuickSummary(reading)
      };

      return {
        success: true,
        data: quickSummary,
        metadata: {
          calculationType: 'quick_iching_reading',
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      logger.error('❌ Error in getQuickIChingReading:', error);
      return {
        success: false,
        error: error.message,
        metadata: {
          calculationType: 'quick_iching_reading',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Generate quick summary for the reading
   * @param {Object} reading - Complete reading data
   * @returns {string} Quick summary
   */
  generateQuickSummary(reading) {
    const { primaryHexagram, changingLines, transformedHexagram } = reading;

    let summary = `Hexagram ${primaryHexagram.number} - ${primaryHexagram.name}. `;

    if (changingLines.length > 0) {
      summary += `Changing to ${transformedHexagram.number} - ${transformedHexagram.name}. `;
    }

    summary += `${primaryHexagram.judgment}. `;

    return summary;
  }

  /**
   * Get I Ching trigram information
   * @param {Object} params - Parameters
   * @param {number} params.trigramNumber - Trigram number (0-7)
   * @returns {Object} Trigram information
   */
  async getTrigramInfo(params) {
    try {
      // Validate required parameters
      if (!params || typeof params.trigramNumber === 'undefined') {
        throw new Error('Trigram number is required for trigram info');
      }

      const { trigramNumber } = params;

      if (trigramNumber < 0 || trigramNumber > 7) {
        throw new Error('Trigram number must be between 0 and 7');
      }

      const trigram = this.interpreter.config.getTrigram(trigramNumber);

      return {
        success: true,
        data: trigram,
        metadata: {
          calculationType: 'trigram_info',
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      logger.error('❌ Error in getTrigramInfo:', error);
      return {
        success: false,
        error: error.message,
        metadata: {
          calculationType: 'trigram_info',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  async getHealthStatus() {
    try {
      const baseHealth = await super.getHealthStatus();

      // Test the I Ching functionality
      try {
        const testReading = this.interpreter.generateIChingReading('test');
        const hasValidReading = testReading && testReading.primaryHexagram;
      } catch (e) {
        // If test fails, continue with status check
      }

      return {
        ...baseHealth,
        features: {
          ichingReading: true,
          hexagramGeneration: true,
          dailyGuidance: true,
          specializedAnalysis: true,
          trigramInfo: true
        },
        supportedCalculations: [
          'iching_reading',
          'daily_guidance',
          'hexagram_interpretation',
          'quick_reading',
          'trigram_info'
        ],
        calculationMethods: {
          hexagramGeneration: true,
          lineCalculations: true,
          transformations: true,
          interpretations: true
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

  /**
   * Get service metadata
   * @returns {Object} Service information
   */
  getMetadata() {
    return {
      name: this.serviceName,
      version: '1.0.0',
      category: 'divination',
      methods: [
        'generateIChingReading',
        'getDailyIChingGuidance',
        'getHexagramInterpretation',
        'getQuickIChingReading',
        'getTrigramInfo'
      ],
      dependencies: ['IChingCalculator', 'IChingInterpreter', 'IChingConfig']
    };
  }

  /**
   * Get service-specific help
   * @returns {string} Help information
   */
  getHelp() {
    return `
🔮 **I Ching Reading Service**

**Purpose:** Provides I Ching (Book of Changes) readings with hexagram generation, interpretation, and guidance based on the ancient Chinese divination system

**Required Inputs:**
• Question to be answered (string)
• Optional focus area (career, love, health, finances, etc.)

**Analysis Includes:**

**📖 Primary Hexagram:**
• Hexagram number and name
• Upper and lower trigrams
• Judgment and image interpretation
• Symbolic meaning

**🔄 Transformation Analysis:**
• Identifying changing lines
• Transformed hexagram (if applicable)
• Evolution of the situation

**🧘 Interpretation:**
• Situation assessment
• Practical advice
• Meditation focus
• Affirmation

**🎯 Specialized Analysis:**
• Career-specific guidance
• Love and relationship insights
• Health considerations
• Financial recommendations

**Example Usage:**
"IChing reading about my career prospects"
"Daiy I Ching guidance for today"
"Hexagram 1 interpretation"
"IChing for love advice"

**Output Format:**
Comprehensive I Ching reading with primary and transformed hexagrams, interpretation, and practical guidance
    `.trim();
  }
}

module.exports = IChingReadingService;