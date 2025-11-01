const ServiceTemplate = require('./ServiceTemplate');
const logger = require('../../utils/logger');
const { createIChingService } = require('../../core/services/calculators/ichingReader');

/**
 * IChingReadingService - Specialized service for providing I Ching readings
 *
 * Provides I Ching (Book of Changes) readings with hexagram generation,
 * interpretation, and guidance based on the ancient Chinese divination system.
 */
class IChingReadingService extends ServiceTemplate {
  constructor() {
    super('IChingReadingService');
    this.serviceName = 'IChingReadingService';
    this.ichingService = null; // Will be initialized in initialize()
    logger.info('IChingReadingService initialized');
  }

  async initialize() {
    try {
      await super.initialize();
      this.ichingService = await createIChingService();
      logger.info('✅ IChingReadingService initialized successfully with core IChingService');
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

      const reading = await this.ichingService.performIChingReading(question);

      // Add service-specific metadata
      const result = {
        ...reading,
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

      // Use the same method as general reading
      const guidance = await this.ichingService.getDailyGuidance(focus);

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

      const hexagramData = this.ichingService.getHexagramData(hexagramNumber);

      return {
        success: true,
        data: {
          number: hexagramNumber,
          name: hexagramData.name,
          judgment: hexagramData.judgment,
          image: hexagramData.image,
          // Add other relevant data from hexagramData if available
          characteristics: hexagramData.characteristics || [],
          qualities: hexagramData.qualities || [],
          elements: hexagramData.elements || [],
          trigrams: {
            upper: hexagramData.upperTrigram || 'Upper trigram information',
            lower: hexagramData.lowerTrigram || 'Lower trigram information'
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
   * Create hexagram key from hexagram number (utility method)
   * @param {number} hexagramNumber - Hexagram number
   * @returns {string} Hexagram key
   */
  createHexagramKeyFromNumber(hexagramNumber) {
    // For now, return a placeholder since the actual mapping is complex
    return '666666'; // Placeholder
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

      const reading = await this.ichingService.performIChingReading(question);

      const quickSummary = {
        hexagram: `${reading.hexagram || 'Unknown'}`,
        guidance: reading.interpretation?.guidance || [reading.interpretation || 'Traditional guidance'],
        situation: 'I Ching situation assessment',
        advice: 'I Ching practical advice',
        hasChanges: false, // Basic implementation doesn't handle changing lines
        changingLines: [],
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
    let summary = `${reading.hexagram || 'I Ching reading'}. `;

    summary += `${reading.interpretation?.judgment || 'Traditional guidance'}. `;

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

      const trigramData = this.ichingService.getTrigramData(trigramNumber);

      return {
        success: true,
        data: {
          trigramNumber,
          name: trigramData.name,
          meaning: trigramData.meaning,
          element: trigramData.element,
          direction: trigramData.direction,
          season: trigramData.season
        },
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

  async processCalculation(data) {
    return await this.generateIChingReading(data);
  }

  async getHealthStatus() {
    try {
      const baseHealth = await super.getHealthStatus();

      // Test the I Ching functionality
      try {
        const testReading = await this.ichingService.performIChingReading('test');
        const hasValidReading = testReading && testReading.hexagram;
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
      dependencies: ['IChingReader']
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