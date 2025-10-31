const ServiceTemplate = require('../ServiceTemplate');
const logger = require('../../utils/logger');

// Import calculator from legacy structure

/**
 * ComprehensiveVedicAnalysisService - Comprehensive multi-level Vedic analysis service
 *
 * Provides multi-level chart analysis combining multiple Vedic techniques including:
 * - D1, D9, D10, D12 and other divisional charts
 * - Yogas and planetary combinations
 * - Dasha (planetary period) analysis
 * - Current transits and influences
 * - Holistic life assessment and predictions
 */
class ComprehensiveVedicAnalysisService extends ServiceTemplate {
  constructor(services) {
    super('ucomprehensiveVedicAnalysisService'));
    
    // Initialize calculator with services if provided
    if (services) {
      this.calculator.setServices(services);
    }
    
    this.serviceName = 'ComprehensiveVedicAnalysisService';
    logger.info('ComprehensiveVedicAnalysisService initialized');
  }

  async lcomprehensiveVedicAnalysisCalculation(birthData) {
    try {
      // Get comprehensive analysis using calculator
      const result = await this.calculator.generateComprehensiveVedicAnalysis(birthData);

      // Add service metadata
      result.serviceMetadata = {
        serviceName: this.serviceName,
        calculationType: 'Comprehensive Vedic Analysis',
        timestamp: new Date().toISOString(),
        analysisLevels: 5, // Rasi, Navamsa, Dashamsa, Dwadasamsa, Divisional
        analysisComponents: ['charts', 'yogas', 'dasha', 'transits', 'holistic', 'predictions']
      };

      return result;
    } catch (error) {
      logger.error('ComprehensiveVedicAnalysisService calculation error:', error);
      throw new Error(`Comprehensive Vedic analysis failed: ${error.message}`);
    }
  }

  /**
   * Format result for service consumption
   * @param {Object} result - Raw calculator result
   * @returns {Object} Formatted result
   */
  formatResult(result) {
    if (result.error) {
      return {
        success: false,
        error: result.error,
        message: 'Comprehensive Vedic analysis failed'
      };
    }

    return {
      success: true,
      data: result,
      summary: result.summary || 'Comprehensive analysis completed',
      metadata: {
        system: 'Comprehensive Vedic Analysis',
        calculationMethod: 'Multi-level Vedic analysis combining D1, D9, D10, D12 and other divisional charts',
        elements: ['Rasi', 'Navamsa', 'Dashamsa', 'Dwadasamsa', 'Yogas', 'Dashas', 'Transits'],
        tradition: 'Vedic Hindu astrology with multi-technique integration'
      }
    };
  }

  /**
   * Validate input parameters
   * @param {Object} input - Input data to validate
   * @private
   */
  validate(birthData) {
    if (!birthData) {
      throw new Error('Birth data is required for comprehensive Vedic analysis');
    }

    if (!birthData.birthDate || !birthData.birthTime || !birthData.birthPlace) {
      throw new Error('Complete birth details (date, time, place) are required for comprehensive Vedic analysis');
    }

    // Validate date format
    const dateRegex = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
    if (!dateRegex.test(birthData.birthDate)) {
      throw new Error('Birth date must be in DD/MM/YYYY format');
    }

    // Validate time format
    const timeRegex = /^\d{1,2}:\d{1,2}$/;
    if (!timeRegex.test(birthData.birthTime)) {
      throw new Error('Birth time must be in HH:MM format');
    }

    if (typeof birthData.birthPlace !== 'string' || birthData.birthPlace.trim() === '') {
      throw new Error('Birth place is required');
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
      category: 'vedic',
      methods: ['execute', 'lcomprehensiveVedicAnalysisCalculation', 'formatResult'],
      dependencies: ['ComprehensiveAnalysisCalculator']
    };
  }

  /**
   * Get service-specific help
   * @returns {string} Help information
   */
  getHelp() {
    return `
🔮 **Comprehensive Vedic Analysis Service**

**Purpose:** Provides multi-level Vedic analysis combining multiple techniques for holistic life understanding

**Required Inputs:**
• Birth date (DD/MM/YYYY)
• Birth time (HH:MM) 
• Birth place (city, state/country)

**Analysis Includes:**

**📊 Chart Analysis:**
• **Rasi (D1):** Physical life, personality, general chart
• **Navamsa (D9):** Marriage, relationships, spiritual development
• **Dashamsa (D10):** Career, profession, authority
• **Dwadasamsa (D12):** Parents, spirituality, foreign connections
• **Divisional Charts:** D2, D3, D4, D7, D16, D20, D24, D27, D30, D40, D45, D60

**🔮 Yogas & Combinations:**
• Raja Yogas (leadership & authority)
• Dhan Yogas (wealth & prosperity)
• Spiritual Yogas (spiritual inclination)
• Obstacle Yogas (challenges & obstacles)
• Comprehensive yoga analysis

**⏰ Dasha Analysis:**
• Current planetary periods (Mahadasha & Antardasha)
• Upcoming dasha changes
• Influential life periods
• Challenging & beneficial phases

**🔄 Transit Analysis:**
• Current planetary influences
• Upcoming transits (6-12 months)
• Supportive & challenging transits
• Auspicious & challenging periods

**🔮 Holistic Assessment:**
• Overall life potential (0-100%)
• Life balance evaluation
• Dominant life themes
• Key strengths & principal challenges
• Relationship harmony
• Career & material path
• Health vigor & financial prospects
• Spiritual path
• Detailed recommendations

**🔮 Life Predictions:**
• Early life (birth to 25)
• Young adult (26 to 40)
• Middle age (41 to 60)
• Later years (61+)
• Key milestones & turning points

**Example Usage:**
"Comprehensive analysis for birth date 15/06/1990, time 06:45, place New Delhi"
"Multi-level Vedic analysis"
"Detailed chart analysis with yogas and dashas"
"Complete life assessment"

**Output Format:**
Comprehensive report with multi-level analysis, life predictions, and recommendations
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

module.exports = ComprehensiveVedicAnalysisService;