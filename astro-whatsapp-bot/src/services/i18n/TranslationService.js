const fs = require('fs').promises;
const path = require('path');
const logger = require('../../utils/logger');

/**
 * Translation Service
 * Handles multilingual support with resource externalization
 * Supports 20+ languages with modular resource bundles
 */
class TranslationService {
  constructor() {
    this.resourceBundles = new Map();
    this.supportedLanguages = new Map();
    this.cache = new Map();
    this.cacheExpirationMs = 30 * 60 * 1000; // 30 minutes
    this.localesPath = path.join(__dirname, 'locales');

    this.initializeSupportedLanguages();
  }

  /**
   * Initialize supported languages configuration
   */
  initializeSupportedLanguages() {
    // Core languages with full support
    this.supportedLanguages.set('hi', {
      name: 'Hindi',
      nativeName: 'हिंदी',
      rtl: false,
      script: 'Devanagari',
      enabled: true,
      complete: true
    });

    this.supportedLanguages.set('ar', {
      name: 'Arabic',
      nativeName: 'العربية',
      rtl: true,
      script: 'Arabic',
      enabled: true,
      complete: true
    });

    this.supportedLanguages.set('ta', {
      name: 'Tamil',
      nativeName: 'தமிழ்',
      rtl: false,
      script: 'Tamil',
      enabled: true,
      complete: true
    });

    // Indian languages (placeholders for now)
    const indianLanguages = [
      ['bn', 'Bengali', 'বাংলা', false, 'Bengali'],
      ['te', 'Telugu', 'తెలుగు', false, 'Telugu'],
      ['mr', 'Marathi', 'मराठी', false, 'Devanagari'],
      ['gu', 'Gujarati', 'ગુજરાતી', false, 'Gujarati'],
      ['kn', 'Kannada', 'ಕನ್ನಡ', false, 'Kannada'],
      ['ml', 'Malayalam', 'മലയാളം', false, 'Malayalam'],
      ['pa', 'Punjabi', 'ਪੰਜਾਬੀ', false, 'Gurmukhi'],
      ['or', 'Odia', 'ଓଡ଼ିଆ', false, 'Odia'],
      ['as', 'Assamese', 'অসমীয়া', false, 'Bengali'],
      ['ur', 'Urdu', 'اردو', true, 'Arabic']
    ];

    indianLanguages.forEach(([code, name, nativeName, rtl, script]) => {
      this.supportedLanguages.set(code, {
        name,
        nativeName,
        rtl,
        script,
        enabled: true,
        complete: false // Placeholder
      });
    });

    // European languages
    const europeanLanguages = [
      ['en', 'English', 'English', false, 'Latin'],
      ['es', 'Spanish', 'Español', false, 'Latin'],
      ['fr', 'French', 'Français', false, 'Latin'],
      ['de', 'German', 'Deutsch', false, 'Latin'],
      ['it', 'Italian', 'Italiano', false, 'Latin'],
      ['pt', 'Portuguese', 'Português', false, 'Latin'],
      ['ru', 'Russian', 'Русский', false, 'Cyrillic'],
      ['nl', 'Dutch', 'Nederlands', false, 'Latin']
    ];

    europeanLanguages.forEach(([code, name, nativeName, rtl, script]) => {
      this.supportedLanguages.set(code, {
        name,
        nativeName,
        rtl,
        script,
        enabled: true,
        complete: false // Placeholder
      });
    });

    // Middle East/UAE languages
    const middleEastLanguages = [
      ['fa', 'Persian', 'فارسی', true, 'Arabic'],
      ['tr', 'Turkish', 'Türkçe', false, 'Latin'],
      ['he', 'Hebrew', 'עברית', true, 'Hebrew']
    ];

    middleEastLanguages.forEach(([code, name, nativeName, rtl, script]) => {
      this.supportedLanguages.set(code, {
        name,
        nativeName,
        rtl,
        script,
        enabled: true,
        complete: false // Placeholder
      });
    });

    // Asian languages
    const asianLanguages = [
      ['zh', 'Chinese', '中文', false, 'Han'],
      ['ja', 'Japanese', '日本語', false, 'Hiragana/Katakana'],
      ['ko', 'Korean', '한국어', false, 'Hangul'],
      ['th', 'Thai', 'ไทย', false, 'Thai']
    ];

    asianLanguages.forEach(([code, name, nativeName, rtl, script]) => {
      this.supportedLanguages.set(code, {
        name,
        nativeName,
        rtl,
        script,
        enabled: true,
        complete: false // Placeholder
      });
    });

    logger.info(`Initialized ${this.supportedLanguages.size} supported languages`);
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages() {
    return Array.from(this.supportedLanguages.entries()).map(([code, config]) => ({
      code,
      ...config
    }));
  }

  /**
   * Check if language is supported
   */
  isLanguageSupported(languageCode) {
    return this.supportedLanguages.has(languageCode);
  }

  /**
   * Get language configuration
   */
  getLanguageConfig(languageCode) {
    return this.supportedLanguages.get(languageCode);
  }

  /**
   * Detect user language from phone number or explicit preference
   */
  detectLanguage(phoneNumber, explicitLanguage = null) {
    // If explicit language is provided and supported, use it
    if (explicitLanguage && this.isLanguageSupported(explicitLanguage)) {
      return explicitLanguage;
    }

    // Detect from phone number
    if (phoneNumber) {
      const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');

      // UAE numbers
      if (cleanNumber.startsWith('+971') || cleanNumber.startsWith('971')) {
        return 'ar'; // Arabic
      }

      // Saudi Arabia numbers
      if (cleanNumber.startsWith('+966') || cleanNumber.startsWith('966')) {
        return 'ar'; // Arabic
      }

      // Indian numbers - detect region for language preference
      if (cleanNumber.startsWith('+91') || cleanNumber.startsWith('91')) {
        // Could implement more sophisticated detection based on area codes
        // For now, default to Hindi
        return 'hi';
      }

      // Other regions
      if (cleanNumber.startsWith('+1')) return 'en'; // USA
      if (cleanNumber.startsWith('+44')) return 'en'; // UK
      if (cleanNumber.startsWith('+33')) return 'fr'; // France
      if (cleanNumber.startsWith('+49')) return 'de'; // Germany
      if (cleanNumber.startsWith('+39')) return 'it'; // Italy
      if (cleanNumber.startsWith('+34')) return 'es'; // Spain
      if (cleanNumber.startsWith('+351')) return 'pt'; // Portugal
      if (cleanNumber.startsWith('+7')) return 'ru'; // Russia
      if (cleanNumber.startsWith('+86')) return 'zh'; // China
      if (cleanNumber.startsWith('+81')) return 'ja'; // Japan
      if (cleanNumber.startsWith('+82')) return 'ko'; // Korea
    }

    // Default to English
    return 'en';
  }

  /**
   * Load resource bundle for a language
   */
  async loadResourceBundle(languageCode) {
    try {
      const cacheKey = `bundle_${languageCode}`;
      const cached = this.getCachedResult(cacheKey);
      if (cached) {
        return cached;
      }

      const bundlePath = path.join(this.localesPath, `${languageCode}.json`);

      // Check if file exists
      try {
        await fs.access(bundlePath);
      } catch (error) {
        logger.warn(`Resource bundle not found for language: ${languageCode}`);
        // Return empty bundle - will fall back to English
        return {};
      }

       const bundleContent = await fs.readFile(bundlePath, 'utf8');
       const bundle = JSON.parse(bundleContent);

       this.resourceBundles.set(languageCode, bundle);
       this.setCachedResult(cacheKey, bundle);
       return bundle;
    } catch (error) {
      logger.error(`Error loading resource bundle for ${languageCode}:`, error);
      return {};
    }
  }

  /**
   * Get cached result
   */
  getCachedResult(cacheKey) {
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheExpirationMs) {
      return cached.data;
    }
    if (cached) {
      this.cache.delete(cacheKey);
    }
    return null;
  }

  /**
   * Set cached result
   */
  setCachedResult(cacheKey, data) {
    if (this.cache.size >= 100) { // Max cache size
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Get nested value from object using dot notation
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * Translate a resource key
   */
  async translate(key, languageCode = 'en', parameters = {}) {
    try {
      // Load resource bundle
      let bundle = await this.loadResourceBundle(languageCode);

      // Try to get the translation
      let translation = this.getNestedValue(bundle, key);

      // If not found and not English, try English fallback
      if (translation === undefined && languageCode !== 'en') {
        const englishBundle = await this.loadResourceBundle('en');
        translation = this.getNestedValue(englishBundle, key);
      }

      // If still not found, return the key as fallback
      if (translation === undefined) {
        logger.warn(`Translation missing for key: ${key} in language: ${languageCode}`);
        return key;
      }

      // Handle parameters
      if (typeof translation === 'string' && parameters && typeof parameters === 'object' && Object.keys(parameters).length > 0) {
        translation = this.interpolateParameters(translation, parameters);
      }

      // Handle RTL languages
      const langConfig = this.getLanguageConfig(languageCode);
      if (langConfig && langConfig.rtl) {
        translation = `\u200F${translation}\u200F`; // Add RTL embedding
      }

      return translation;
    } catch (error) {
      logger.error(`Translation error for key ${key}:`, error);
      return key;
    }
  }

  /**
   * Interpolate parameters in translation string
   */
  interpolateParameters(template, parameters) {
    let result = template;

    // Simple parameter replacement: {param}
    Object.entries(parameters).forEach(([key, value]) => {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      result = result.replace(regex, value);
    });

    return result;
  }

  /**
   * Get multiple translations at once
   */
  async translateMultiple(keys, languageCode = 'en', parameters = {}) {
    const translations = {};
    for (const key of keys) {
      translations[key] = await this.translate(key, languageCode, parameters);
    }
    return translations;
  }

  /**
   * Format a message with parameters
   */
  async format(key, parameters = {}, languageCode = 'en') {
    return this.translate(key, languageCode, parameters);
  }

  /**
   * Check if a translation exists
   */
  async hasTranslation(key, languageCode) {
    try {
      const bundle = await this.loadResourceBundle(languageCode);
      const translation = this.getNestedValue(bundle, key);
      return translation !== undefined;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get all available keys for a language
   */
  async getAvailableKeys(languageCode) {
    try {
      const bundle = await this.loadResourceBundle(languageCode);
      return this.flattenObjectKeys(bundle);
    } catch (error) {
      return [];
    }
  }

  /**
   * Flatten object keys to dot notation
   */
  flattenObjectKeys(obj, prefix = '') {
    const keys = [];

    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        keys.push(...this.flattenObjectKeys(value, fullKey));
      } else {
        keys.push(fullKey);
      }
    }

    return keys;
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    this.resourceBundles.clear();
    logger.info('Translation cache cleared');
  }

  /**
   * Reload resource bundles
   */
  async reloadBundles() {
    this.clearCache();
    logger.info('Resource bundles reloaded');
  }
}

module.exports = new TranslationService();