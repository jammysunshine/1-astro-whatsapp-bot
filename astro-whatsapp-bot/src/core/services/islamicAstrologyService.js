const ServiceTemplate = require('../ServiceTemplate');
const logger = require('../../utils/logger');

/**
 * IslamicAstrologyService - Service for Islamic/Arabic astrological analysis
 * Provides traditional Islamic astrological insights including numerology,
 * lunar mansions, and spiritual guidance rooted in Islamic tradition.
 */
class IslamicAstrologyService extends ServiceTemplate {
  constructor() {
    super('IslamicAstrology');
    this.serviceName = 'IslamicAstrologyService';
    this.calculatorPath = '../../../services/astrology/islamicAstrology';
    logger.info('IslamicAstrologyService initialized');
  }

  async initialize() {
    try {
      await super.initialize();
      logger.info('✅ IslamicAstrologyService initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize IslamicAstrologyService:', error);
      throw error;
    }
  }

  /**
   * Process Islamic astrology calculation
   * @param {Object} params - Calculation parameters
   * @returns {Object} Islamic astrology analysis
   */
  async processCalculation(params) {
    try {
      this.validateParams(params);

      const { birthData, options = {} } = params;

      // Get Islamic astrology analysis from calculator
      const islamicAnalysis = await this.calculator.generateIslamicAnalysis(birthData, options);

      return {
        success: true,
        data: islamicAnalysis,
        metadata: {
          calculationType: 'islamic_astrology',
          timestamp: new Date().toISOString(),
          system: 'Traditional Islamic/Arabic Astrology',
          elements: ['Lunar Mansions', 'Abjad Numerology', 'Planetary Influences', 'Spiritual Guidance']
        }
      };
    } catch (error) {
      logger.error('❌ Error in IslamicAstrologyService calculation:', error);
      return {
        success: false,
        error: error.message,
        metadata: {
          calculationType: 'islamic_astrology',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Format result for consistent output
   * @param {Object} result - Raw calculator result
   * @returns {Object} Formatted result
   */
  formatResult(result) {
    if (result.error) {
      return {
        success: false,
        error: result.error,
        message: 'Islamic astrology analysis failed'
      };
    }

    return {
      success: true,
      data: result,
      summary: result.summary || 'Islamic astrology analysis completed',
      metadata: {
        system: 'Islamic Astrology Analysis',
        calculationMethod: 'Traditional Islamic/Arabic astrological principles',
        elements: ['Lunar Mansions', 'Numerology', 'Planetary Influences', 'Spiritual Guidance'],
        tradition: 'Islamic/Arabic astrological wisdom with Quranic foundations'
      }
    };
  }

  /**
   * Validate input parameters
   * @param {Object} params - Input parameters
   * @private
   */
  validateParams(params) {
    if (!params) {
      throw new Error('Input parameters are required for Islamic astrology analysis');
    }

    // Birth data is optional for Islamic astrology as it focuses more on names and lunar positions
    return true;
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
      methods: ['execute', 'processCalculation', 'formatResult'],
      dependencies: ['IslamicAstrology']
    };
  }

  /**
   * Get service-specific help
   * @returns {string} Help information
   */
  getHelp() {
    return `
☪️ **Islamic Astrology Service**

**Purpose:** Provides traditional Islamic/Arabic astrological insights including lunar mansions, numerology, and spiritual guidance

**Analysis Includes:**

**🌙 Lunar Mansions Analysis:**
• 28 stations of the Moon (Manazil al-Qamar)
• Auspicious and inauspicious lunar phases
• Spiritual influences and guidance for each mansion
• Timing for religious observances and practices

**🔢 Abjad Numerology:**
• Numerical values of Arabic letters
• Destiny number calculation from names
• Character analysis through sacred numerology
• Spiritual path guidance based on numerical meanings

**🕌 Planetary Influences:**
• Islamic planetary correspondences
• Spiritual attributes and divine connections
• Influence on daily life and religious practices
• Guidance for strengthening faith and connection

**📅 Sacred Timing:**
• Optimal times for prayer and worship
• Lunar calendar significance
• Religious observance timing (Ramadan, Hajj, Eid)
• Spiritual development periods

**🕊️ Spiritual Guidance:**
• Quranic wisdom integration
• Prayer and meditation guidance
• Strengthening faith through celestial understanding
• Divine will alignment

**Example Usage:**
"Islamic astrology analysis"
"Arabic numerology for my name"
"Lunar mansion guidance today"

**Output Format:**
Comprehensive Islamic astrology report with lunar mansions analysis, numerology insights, planetary influences, and spiritual guidance
    `.trim();
  }

  /**
   * Generate Islamic astrology analysis
   * @param {Object} params - Analysis parameters
   * @returns {Object} Complete Islamic analysis
   */
  async generateIslamicAnalysis(params) {
    try {
      const { name, birthDate, options = {} } = params;

      // Generate Abjad numerology if name is provided
      let numerologyAnalysis = null;
      if (name) {
        numerologyAnalysis = await this._generateAbjadNumerology(name);
      }

      // Generate lunar mansion analysis if birth date is provided
      let lunarAnalysis = null;
      if (birthDate) {
        lunarAnalysis = await this._generateLunarMansionAnalysis(birthDate);
      }

      // Get general Islamic guidance
      const spiritualGuidance = this._generateSpiritualGuidance(options);

      return {
        numerology: numerologyAnalysis,
        lunarMansions: lunarAnalysis,
        spiritualGuidance,
        summary: this._generateIslamicSummary(numerologyAnalysis, lunarAnalysis, spiritualGuidance)
      };
    } catch (error) {
      logger.error('Error generating Islamic analysis:', error);
      throw new Error(`Failed to generate Islamic astrology analysis: ${error.message}`);
    }
  }

  /**
   * Generate Abjad numerology from name
   * @private
   * @param {string} name - Person's name
   * @returns {Object} Numerology analysis
   */
  async _generateAbjadNumerology(name) {
    try {
      return await this.calculator.calculateAbjadNumerology(name);
    } catch (error) {
      logger.warn('Error calculating Abjad numerology:', error.message);
      return {
        name,
        error: 'Unable to calculate Abjad numerology',
        fallback: 'Focus on spiritual practices and divine remembrance'
      };
    }
  }

  /**
   * Generate lunar mansion analysis
   * @private
   * @param {string} birthDate - Birth date
   * @returns {Object} Lunar mansion analysis
   */
  async _generateLunarMansionAnalysis(birthDate) {
    try {
      return await this.calculator.analyzeLunarMansions(birthDate);
    } catch (error) {
      logger.warn('Error analyzing lunar mansions:', error.message);
      return {
        birthDate,
        error: 'Unable to analyze lunar mansions',
        fallback: 'The current lunar phase offers spiritual opportunities'
      };
    }
  }

  /**
   * Generate spiritual guidance
   * @private
   * @param {Object} options - Guidance options
   * @returns {Object} Spiritual guidance
   */
  _generateSpiritualGuidance(options) {
    return {
      quranicWisdom: this._extractQuranicWisdom(),
      prayerGuidance: this._generatePrayerGuidance(options),
      spiritualPractices: this._suggestSpiritualPractices(options)
    };
  }

  /**
   * Extract relevant Quranic wisdom
   * @private
   * @returns {string} Quranic wisdom
   */
  _extractQuranicWisdom() {
    const verses = [
      'And it is He who placed for you the stars that you may be guided by them through the darknesses of the land and sea. - Quran 6:97',
      'Indeed, in the creation of the heavens and earth and the alternation of the night and day are signs for those of understanding. - Quran 3:190',
      'And We have certainly beautified the nearest heaven with lamps and have made [from] them what is thrown at the devils and have prepared for them the punishment of the Blaze. - Quran 67:5',
      'The sun and the moon [move] by precise calculation. - Quran 55:7'
    ];

    return verses[Math.floor(Math.random() * verses.length)];
  }

  /**
   * Generate prayer guidance
   * @private
   * @param {Object} options - Options
   * @returns {Array} Prayer guidance
   */
  _generatePrayerGuidance(options) {
    return [
      'Establish regular salah (prayer) with sincerity and presence of heart',
      'Increase dhikr (remembrance of Allah) throughout the day',
      'Recite morning and evening supplications for divine protection',
      'Perform voluntary night prayers (Tahajjud) for spiritual advancement'
    ];
  }

  /**
   * Suggest spiritual practices
   * @private
   * @param {Object} options - Options
   * @returns {Array} Spiritual practices
   */
  _suggestSpiritualPractices(options) {
    return [
      'Read and contemplate the meanings of the Quran daily',
      'Give charity regularly to purify wealth and assist others',
      'Fast voluntarily on recommended days (Ashura, Arafat, etc.)',
      'Visit the sick and care for family members',
      'Seek knowledge of Islamic sciences and celestial wisdom'
    ];
  }

  /**
   * Generate comprehensive Islamic summary
   * @private
   * @param {Object} numerology - Numerology analysis
   * @param {Object} lunar - Lunar analysis
   * @param {Object} guidance - Spiritual guidance
   * @returns {string} Summary text
   */
  _generateIslamicSummary(numerology, lunar, guidance) {
    let summary = '☪️ *Islamic Astrology Analysis*\n\n';

    if (numerology && !numerology.error) {
      summary += '*Abjad Numerology:*\n';
      summary += `Your name number is ${numerology.destinyNumber}. `;
      summary += `This indicates ${numerology.spiritualPath}.\n\n`;
    }

    if (lunar && !lunar.error) {
      summary += '*Lunar Mansion:*\n';
      summary += `Your birth lunar mansion is ${lunar.mansion.name} (${lunar.mansion.arabic}), `;
      summary += `meaning "${lunar.mansion.meaning}". `;
      summary += `This is ${lunar.mansion.nature.toLowerCase()} for spiritual endeavors.\n\n`;
    }

    summary += '*Spiritual Focus:*\n';
    summary += 'Focus on increasing your connection with the Divine through regular prayer ';
    summary += 'and remembrance. The current lunar phase offers opportunities for spiritual growth.\n\n';

    summary += `*Divine Guidance:*\n"${guidance.quranicWisdom}"`;

    return summary;
  }

  async getHealthStatus() {
    try {
      const baseHealth = await super.getHealthStatus();
      return {
        ...baseHealth,
        features: {
          islamicNumerology: true,
          lunarMansions: true,
          spiritualGuidance: true
        },
        supportedAnalyses: [
          'abjad_numerology',
          'lunar_mansion_analysis',
          'spiritual_guidance',
          'prayer_timing'
        ],
        calculationMethods: {
          abjadCalculation: true,
          lunarAnalysis: true,
          spiritualGuidance: true
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

module.exports = IslamicAstrologyService;
