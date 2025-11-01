/**
 * Language Configuration
 *
 * This file contains the configuration for all supported languages in the Astrology WhatsApp Bot.
 * It includes language metadata, RTL support information, and script information.
 */

const languages = {
  // Core languages with full support
  hi: {
    name: 'Hindi',
    nativeName: 'हिंदी',
    rtl: false,
    script: 'Devanagari',
    enabled: true,
    complete: true,
    regions: ['IN'],
    flag: '🇮🇳'
  },

  ar: {
    name: 'Arabic',
    nativeName: 'العربية',
    rtl: true,
    script: 'Arabic',
    enabled: true,
    complete: true,
    regions: ['AE', 'SA', 'EG'],
    flag: '🇦🇪'
  },

  ta: {
    name: 'Tamil',
    nativeName: 'தமிழ்',
    rtl: false,
    script: 'Tamil',
    enabled: true,
    complete: true,
    regions: ['IN'],
    flag: '🇮🇳'
  },

  // Indian languages (full implementation planned)
  bn: {
    name: 'Bengali',
    nativeName: 'বাংলা',
    rtl: false,
    script: 'Bengali',
    enabled: true,
    complete: false,
    regions: ['IN'],
    flag: '🇮🇳'
  },

  te: {
    name: 'Telugu',
    nativeName: 'తెలుగు',
    rtl: false,
    script: 'Telugu',
    enabled: true,
    complete: true,
    regions: ['IN'],
    flag: '🇮🇳'
  },

  mr: {
    name: 'Marathi',
    nativeName: 'मराठी',
    rtl: false,
    script: 'Devanagari',
    enabled: true,
    complete: true,
    regions: ['IN'],
    flag: '🇮🇳'
  },

  gu: {
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    rtl: false,
    script: 'Gujarati',
    enabled: true,
    complete: false,
    regions: ['IN'],
    flag: '🇮🇳'
  },

  kn: {
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    rtl: false,
    script: 'Kannada',
    enabled: true,
    complete: false,
    regions: ['IN'],
    flag: '🇮🇳'
  },

  ml: {
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    rtl: false,
    script: 'Malayalam',
    enabled: true,
    complete: false,
    regions: ['IN'],
    flag: '🇮🇳'
  },

  pa: {
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    rtl: false,
    script: 'Gurmukhi',
    enabled: true,
    complete: false,
    regions: ['IN'],
    flag: '🇮🇳'
  },

  or: {
    name: 'Odia',
    nativeName: 'ଓଡ଼ିଆ',
    rtl: false,
    script: 'Odia',
    enabled: true,
    complete: false,
    regions: ['IN'],
    flag: '🇮🇳'
  },

  as: {
    name: 'Assamese',
    nativeName: 'অসমীয়া',
    rtl: false,
    script: 'Bengali',
    enabled: true,
    complete: false,
    regions: ['IN'],
    flag: '🇮🇳'
  },

  ur: {
    name: 'Urdu',
    nativeName: 'اردو',
    rtl: true,
    script: 'Arabic',
    enabled: true,
    complete: false,
    regions: ['IN', 'PK'],
    flag: '🇵🇰'
  },

  // European languages
  en: {
    name: 'English',
    nativeName: 'English',
    rtl: false,
    script: 'Latin',
    enabled: true,
    complete: true,
    regions: ['US', 'GB', 'CA', 'AU'],
    flag: '🇺🇸'
  },

  es: {
    name: 'Spanish',
    nativeName: 'Español',
    rtl: false,
    script: 'Latin',
    enabled: true,
    complete: false,
    regions: ['ES', 'MX', 'AR'],
    flag: '🇪🇸'
  },

  fr: {
    name: 'French',
    nativeName: 'Français',
    rtl: false,
    script: 'Latin',
    enabled: true,
    complete: false,
    regions: ['FR', 'CA'],
    flag: '🇫🇷'
  },

  de: {
    name: 'German',
    nativeName: 'Deutsch',
    rtl: false,
    script: 'Latin',
    enabled: true,
    complete: false,
    regions: ['DE', 'AT'],
    flag: '🇩🇪'
  },

  it: {
    name: 'Italian',
    nativeName: 'Italiano',
    rtl: false,
    script: 'Latin',
    enabled: true,
    complete: false,
    regions: ['IT'],
    flag: '🇮🇹'
  },

  pt: {
    name: 'Portuguese',
    nativeName: 'Português',
    rtl: false,
    script: 'Latin',
    enabled: true,
    complete: false,
    regions: ['PT', 'BR'],
    flag: '🇵🇹'
  },

  ru: {
    name: 'Russian',
    nativeName: 'Русский',
    rtl: false,
    script: 'Cyrillic',
    enabled: true,
    complete: false,
    regions: ['RU'],
    flag: '🇷🇺'
  },

  nl: {
    name: 'Dutch',
    nativeName: 'Nederlands',
    rtl: false,
    script: 'Latin',
    enabled: true,
    complete: false,
    regions: ['NL'],
    flag: '🇳🇱'
  },

  // Middle East/UAE languages
  fa: {
    name: 'Persian',
    nativeName: 'فارسی',
    rtl: true,
    script: 'Arabic',
    enabled: true,
    complete: false,
    regions: ['IR'],
    flag: '🇮🇷'
  },

  tr: {
    name: 'Turkish',
    nativeName: 'Türkçe',
    rtl: false,
    script: 'Latin',
    enabled: true,
    complete: false,
    regions: ['TR'],
    flag: '🇹🇷'
  },

  he: {
    name: 'Hebrew',
    nativeName: 'עברית',
    rtl: true,
    script: 'Hebrew',
    enabled: true,
    complete: false,
    regions: ['IL'],
    flag: '🇮🇱'
  },

  // Asian languages
  zh: {
    name: 'Chinese',
    nativeName: '中文',
    rtl: false,
    script: 'Han',
    enabled: true,
    complete: false,
    regions: ['CN'],
    flag: '🇨🇳'
  },

  ja: {
    name: 'Japanese',
    nativeName: '日本語',
    rtl: false,
    script: 'Hiragana/Katakana',
    enabled: true,
    complete: false,
    regions: ['JP'],
    flag: '🇯🇵'
  },

  ko: {
    name: 'Korean',
    nativeName: '한국어',
    rtl: false,
    script: 'Hangul',
    enabled: true,
    complete: false,
    regions: ['KR'],
    flag: '🇰🇷'
  },

  th: {
    name: 'Thai',
    nativeName: 'ไทย',
    rtl: false,
    script: 'Thai',
    enabled: true,
    complete: false,
    regions: ['TH'],
    flag: '🇹🇭'
  },

  ne: {
    name: 'Nepali',
    nativeName: 'नेपाली',
    rtl: false,
    script: 'Devanagari',
    enabled: true,
    complete: false,
    regions: ['NP'],
    flag: '🇳🇵'
  },

  ks: {
    name: 'Kashmiri',
    nativeName: 'कॉशुर',
    rtl: false,
    script: 'Devanagari',
    enabled: true,
    complete: false,
    regions: ['IN'],
    flag: '🇮🇳'
  },

  kok: {
    name: 'Konkani',
    nativeName: 'कोंकणी',
    rtl: false,
    script: 'Devanagari',
    enabled: true,
    complete: false,
    regions: ['IN'],
    flag: '🇮🇳'
  },

  mai: {
    name: 'Maithili',
    nativeName: 'मैथिली',
    rtl: false,
    script: 'Devanagari',
    enabled: true,
    complete: false,
    regions: ['IN'],
    flag: '🇮🇳'
  }
};

/**
 * Get list of all supported languages
 * @returns {Array} Array of language codes
 */
const getSupportedLanguages = () =>
  Object.keys(languages).filter(code => languages[code].enabled);

/**
 * Get language information by code
 * @param {string} code - Language code
 * @returns {Object|null} Language information or null if not found
 */
const getLanguageInfo = code => languages[code] || null;

/**
 * Check if language is RTL (Right-to-Left)
 * @param {string} code - Language code
 * @returns {boolean} True if RTL, false otherwise
 */
const isRTL = code => {
  const lang = languages[code];
  return lang ? lang.rtl : false;
};

/**
 * Get language name by code
 * @param {string} code - Language code
 * @returns {string} Language name or code if not found
 */
const getLanguageName = code => {
  const lang = languages[code];
  return lang ? lang.name : code;
};

/**
 * Get native language name by code
 * @param {string} code - Language code
 * @returns {string} Native language name or code if not found
 */
const getNativeLanguageName = code => {
  const lang = languages[code];
  return lang ? lang.nativeName : code;
};

/**
 * Get languages by region
 * @param {string} region - Region code (e.g., 'IN', 'AE')
 * @returns {Array} Array of language objects for the region
 */
const getLanguagesByRegion = region =>
  Object.entries(languages)
    .filter(([, config]) => config.regions && config.regions.includes(region))
    .map(([code, config]) => ({ code, ...config }));

/**
 * Get all RTL languages
 * @returns {Array} Array of RTL language objects
 */
const getRTLLanguages = () =>
  Object.entries(languages)
    .filter(([, config]) => config.rtl)
    .map(([code, config]) => ({ code, ...config }));

/**
 * Get complete languages (fully implemented)
 * @returns {Array} Array of complete language objects
 */
const getCompleteLanguages = () =>
  Object.entries(languages)
    .filter(([, config]) => config.complete)
    .map(([code, config]) => ({ code, ...config }));

/**
 * Get placeholder languages (not fully implemented)
 * @returns {Array} Array of placeholder language objects
 */
const getPlaceholderLanguages = () =>
  Object.entries(languages)
    .filter(([, config]) => !config.complete)
    .map(([code, config]) => ({ code, ...config }));

module.exports = {
  languages,
  getSupportedLanguages,
  getLanguageInfo,
  isRTL,
  getLanguageName,
  getNativeLanguageName,
  getLanguagesByRegion,
  getRTLLanguages,
  getCompleteLanguages,
  getPlaceholderLanguages
};