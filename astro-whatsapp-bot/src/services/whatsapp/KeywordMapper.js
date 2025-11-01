const logger = require('../../utils/logger');
const translationService = require('../i18n/TranslationService');

/**
 * Intelligent keyword mapping system for text message processing.
 * Maps user input to actions using fuzzy matching and keyword recognition.
 */
class KeywordMapper {
  constructor() {
    this.keywordMap = new Map(); // keyword pattern -> action mapping
    this.fuzzyKeywords = new Map(); // keyword -> variations
    this.contextualPatterns = new Map(); // context -> keywords
    this.initialized = false;
  }

  /**
   * Initialize with default keyword mappings
   */
  initialize() {
    if (this.initialized) {
      return;
    }

    // Basic astrology actions
    this.addKeywordMapping(
      ['horoscope', 'horo', 'daily horoscope'],
      'get_daily_horoscope'
    );
    this.addKeywordMapping(
      ['chart', 'birth chart', 'natal chart'],
      'show_birth_chart'
    );
    this.addKeywordMapping(
      ['compatibility', 'match', 'synastry'],
      'initiate_compatibility_flow'
    );
    this.addKeywordMapping(['tarot', 'card reading'], 'get_tarot_reading');
    this.addKeywordMapping(
      ['iching', 'i ching', 'yijing'],
      'get_iching_reading'
    );
    this.addKeywordMapping(
      ['palmistry', 'palm reading', 'hand reading'],
      'get_palmistry_analysis'
    );

    // Menu navigation
    this.addKeywordMapping(['menu', 'main menu', 'home'], 'show_main_menu');
    this.addKeywordMapping(
      ['western astrology', 'western'],
      'show_western_astrology_menu'
    );
    this.addKeywordMapping(
      ['vedic astrology', 'hindu astrology', 'vedic', 'indian astrology'],
      'show_vedic_astrology_menu'
    );
    this.addKeywordMapping(
      ['divination', 'mystic', 'spiritual'],
      'show_divination_mystic_menu'
    );
    this.addKeywordMapping(
      ['numerology', 'numbers', 'numeretic'],
      'show_numerology_special_menu'
    );
    this.addKeywordMapping(
      ['relationships', 'groups', 'family', 'couple'],
      'show_relationships_groups_menu'
    );

    // Settings and help
    this.addKeywordMapping(
      ['settings', 'profile', 'preferences'],
      'show_settings_profile_menu'
    );
    this.addKeywordMapping(
      ['language', 'lang', 'idioma', 'sprache'],
      'show_language_settings_menu'
    );
    this.addKeywordMapping(
      ['help', 'support', 'assistance'],
      'show_help_support'
    );
    this.addKeywordMapping(
      ['subscription', 'plan', 'premium'],
      'show_subscription_plans'
    );

    // Contextual patterns for better matching
    this.initializeContextualPatterns();

    this.initialized = true;
    logger.info('🔤 KeywordMapper initialized with base mappings');
  }

  /**
   * Add keyword mapping
   * @param {Array|string} keywords - Keywords or keyword array
   * @param {string} actionId - Action identifier
   * @param {number} priority - Matching priority (higher = preferred)
   */
  addKeywordMapping(keywords, actionId, priority = 1) {
    const keywordArray = Array.isArray(keywords) ? keywords : [keywords];

    keywordArray.forEach(keyword => {
      const cleanKeyword = keyword.toLowerCase().trim();
      if (!this.keywordMap.has(cleanKeyword)) {
        this.keywordMap.set(cleanKeyword, { actionId, priority });
      } else {
        // Update if higher priority
        const existing = this.keywordMap.get(cleanKeyword);
        if (priority > existing.priority) {
          this.keywordMap.set(cleanKeyword, { actionId, priority });
        }
      }
    });
  }

  /**
   * Add fuzzy keyword variations
   * @param {string} baseKeyword - Base keyword
   * @param {Array} variations - Array of variations
   */
  addFuzzyVariations(baseKeyword, variations) {
    const cleanBase = baseKeyword.toLowerCase().trim();
    if (!this.fuzzyKeywords.has(cleanBase)) {
      this.fuzzyKeywords.set(cleanBase, new Set());
    }

    variations.forEach(variation => {
      this.fuzzyKeywords.get(cleanBase).add(variation.toLowerCase().trim());
    });
  }

  /**
   * Initialize contextual patterns for smarter matching
   */
  initializeContextualPatterns() {
    // Astrology contexts
    this.contextualPatterns.set(
      'astrology_expertise',
      new Set([
        'read',
        'reading',
        'chart',
        'kundli',
        'predict',
        'forecast',
        'zodiac',
        'horoscope',
        'birth',
        'natal'
      ])
    );

    this.contextualPatterns.set(
      'question_intent',
      new Set([
        'what',
        'how',
        'when',
        'why',
        'where',
        'who',
        'should',
        'can',
        'will',
        'does',
        'is',
        'are'
      ])
    );

    this.contextualPatterns.set(
      'greeting',
      new Set([
        'hello',
        'hi',
        'hey',
        'good morning',
        'good evening',
        'namaste',
        'salaam',
        'welcome'
      ])
    );
  }

  /**
   * Get action ID for text input
   * @param {string} text - Input text to analyze
   * @param {Object} context - Additional context (language, user, etc.)
   * @returns {string|null} Action ID or null if no match
   */
  getActionIdForText(text, context = {}) {
    if (!text || typeof text !== 'string') {
      return null;
    }

    const cleanText = text.toLowerCase().trim();
    if (!cleanText) {
      return null;
    }

    // Direct exact matches first
    if (this.keywordMap.has(cleanText)) {
      return this.keywordMap.get(cleanText).actionId;
    }

    // Check substring matches (contains)
    const words = cleanText.split(/\s+/);
    for (const word of words) {
      if (word.length > 2 && this.keywordMap.has(word)) {
        return this.keywordMap.get(word).actionId;
      }
    }

    // Fuzzy matching for multi-word phrases
    const matchedAction = this.findBestFuzzyMatch(cleanText);
    if (matchedAction) {
      return matchedAction;
    }

    // Contextual pattern matching
    const contextualAction = this.matchContextualPattern(cleanText);
    if (contextualAction) {
      return contextualAction;
    }

    // Language-specific matching
    if (context.language && context.language !== 'en') {
      const langAction = this.matchLocalizedKeywords(
        cleanText,
        context.language
      );
      if (langAction) {
        return langAction;
      }
    }

    // Default fallback
    if (this.isAstrologyQuery(cleanText)) {
      return 'show_main_menu'; // Show menu for astrology-related queries
    }

    return null;
  }

  /**
   * Find best fuzzy match from input
   * @param {string} input - Input text
   * @returns {string|null} Best matched action ID
   */
  findBestFuzzyMatch(input) {
    let bestMatch = null;
    let bestScore = 0;

    for (const [keyword, mapping] of this.keywordMap) {
      const score = this.calculateSimilarity(input, keyword);
      if (score > bestScore && score > 0.6) {
        // 60% similarity threshold
        bestMatch = mapping.actionId;
        bestScore = score;
      }
    }

    return bestMatch;
  }

  /**
   * Calculate string similarity (Levenshtein-based)
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {number} Similarity score (0-1)
   */
  calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) {
      return 1.0;
    }

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {number} Edit distance
   */
  levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1 // deletion
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Match contextual patterns
   * @param {string} input - Input text
   * @returns {string|null} Action ID
   */
  matchContextualPattern(input) {
    const words = input.toLowerCase().split(/\s+/);

    // Check astrology expertise context
    const astrologyWords = words.filter(word =>
      this.contextualPatterns.get('astrology_expertise').has(word)
    );
    if (astrologyWords.length > 0) {
      return 'show_main_menu';
    }

    // Check question intent
    const questionWords = words.filter(word =>
      this.contextualPatterns.get('question_intent').has(word)
    );
    if (questionWords.length > 2) {
      return 'get_tarot_reading'; // Default to tarot for questions
    }

    // Check greeting
    const greetingWords = words.filter(word =>
      this.contextualPatterns.get('greeting').has(word)
    );
    if (greetingWords.length > 0) {
      return 'show_main_menu';
    }

    return null;
  }

  /**
   * Match localized keywords
   * @param {string} input - Input text
   * @param {string} language - Language code
   * @returns {string|null} Action ID
   */
  matchLocalizedKeywords(input, language) {
    try {
      // Try to translate input and match English keywords
      // This would require reverse translation capability

      // For now, handle basic language variations manually
      const localizedMappings = {
        hi: {
          कुंडली: 'show_birth_chart',
          'जन्म चार्ट': 'show_birth_chart',
          तारोट: 'get_tarot_reading',
          मेनू: 'show_main_menu'
        },
        ar: {
          الكوكبة: 'get_daily_horoscope',
          التنجيم: 'show_birth_chart',
          التاروت: 'get_tarot_reading',
          القائمة: 'show_main_menu'
        },
        es: {
          horóscopo: 'get_daily_horoscope',
          'carta natal': 'show_birth_chart',
          tarot: 'get_tarot_reading',
          menú: 'show_main_menu'
        }
      };

      if (localizedMappings[language] && localizedMappings[language][input]) {
        return localizedMappings[language][input];
      }
    } catch (error) {
      logger.warn(`⚠️ Error matching localized keywords: ${error.message}`);
    }

    return null;
  }

  /**
   * Determine if text is astrology-related
   * @param {string} text - Input text
   * @returns {boolean} True if astrology-related
   */
  isAstrologyQuery(text) {
    const astrologyIndicators = [
      'zodiac',
      'sign',
      'planet',
      'moon',
      'sun',
      'mercury',
      'venus',
      'mars',
      'jupiter',
      'saturn',
      'uranus',
      'neptune',
      'pluto',
      'aries',
      'taurus',
      'gemini',
      'cancer',
      'leo',
      'virgo',
      'libra',
      'scorpio',
      'sagittarius',
      'capricorn',
      'aquarius',
      'pisces',
      'rashi',
      'nakshatra',
      'dasha',
      'transit',
      'aspect',
      'house',
      'cusp',
      'midheaven',
      'ascendant'
    ];

    const words = text.toLowerCase().split(/\s+/);
    const astrologyWords = words.filter(word =>
      astrologyIndicators.some(indicator => word.includes(indicator))
    );

    return astrologyWords.length > 0;
  }

  /**
   * Get all registered keywords
   * @returns {Array} Array of registered keywords
   */
  getAllKeywords() {
    return Array.from(this.keywordMap.keys());
  }

  /**
   * Get statistics
   * @returns {Object} Statistics object
   */
  getStats() {
    return {
      totalKeywords: this.keywordMap.size,
      totalFuzzyKeywords: this.fuzzyKeywords.size,
      contextualPatterns: this.contextualPatterns.size,
      initialized: this.initialized
    };
  }

  /**
   * Clear all mappings
   */
  clear() {
    this.keywordMap.clear();
    this.fuzzyKeywords.clear();
    this.contextualPatterns.clear();
    this.initialized = false;
    logger.info('🧹 KeywordMapper cleared');
  }
}

module.exports = KeywordMapper;
