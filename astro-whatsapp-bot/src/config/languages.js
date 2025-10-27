/**
 * Language Configuration
 * 
 * This file contains the configuration for all supported languages in the Astrology WhatsApp Bot.
 * It includes language metadata, RTL support information, and script information.
 */

const languages = {
  // Major Indian Languages
  'en': { 
    name: 'English', 
    nativeName: 'English',
    rtl: false,
    script: 'Latin',
    enabled: true
  },
  'hi': { 
    name: 'Hindi', 
    nativeName: 'हिन्दी',
    rtl: false,
    script: 'Devanagari',
    enabled: true
  },
  'bn': { 
    name: 'Bengali', 
    nativeName: 'বাংলা',
    rtl: false,
    script: 'Bengali',
    enabled: true
  },
  'te': { 
    name: 'Telugu', 
    nativeName: 'తెలుగు',
    rtl: false,
    script: 'Telugu',
    enabled: true
  },
  'ml': { 
    name: 'Malayalam', 
    nativeName: 'മലയാളം',
    rtl: false,
    script: 'Malayalam',
    enabled: true
  },
  'ta': { 
    name: 'Tamil', 
    nativeName: 'தமிழ்',
    rtl: false,
    script: 'Tamil',
    enabled: true
  },
  'gu': { 
    name: 'Gujarati', 
    nativeName: 'ગુજરાતી',
    rtl: false,
    script: 'Gujarati',
    enabled: true
  },
  'kn': { 
    name: 'Kannada', 
    nativeName: 'ಕನ್ನಡ',
    rtl: false,
    script: 'Kannada',
    enabled: true
  },
  'pa': { 
    name: 'Punjabi', 
    nativeName: 'ਪੰਜਾਬੀ',
    rtl: false,
    script: 'Gurmukhi',
    enabled: true
  },
  'mr': { 
    name: 'Marathi', 
    nativeName: 'मराठी',
    rtl: false,
    script: 'Devanagari',
    enabled: true
  },
  'ur': { 
    name: 'Urdu', 
    nativeName: 'اردو',
    rtl: true,
    script: 'Arabic',
    enabled: true
  },
  
  // Major European Languages
  'es': { 
    name: 'Spanish', 
    nativeName: 'Español',
    rtl: false,
    script: 'Latin',
    enabled: true
  },
  'fr': { 
    name: 'French', 
    nativeName: 'Français',
    rtl: false,
    script: 'Latin',
    enabled: true
  },
  'de': { 
    name: 'German', 
    nativeName: 'Deutsch',
    rtl: false,
    script: 'Latin',
    enabled: true
  },
  'ar': { 
    name: 'Arabic', 
    nativeName: 'العربية',
    rtl: true,
    script: 'Arabic',
    enabled: true
  },
  
  // Additional Languages
  'pt': { 
    name: 'Portuguese', 
    nativeName: 'Português',
    rtl: false,
    script: 'Latin',
    enabled: true
  },
  'ru': { 
    name: 'Russian', 
    nativeName: 'Русский',
    rtl: false,
    script: 'Cyrillic',
    enabled: true
  },
  'zh': { 
    name: 'Chinese', 
    nativeName: '中文',
    rtl: false,
    script: 'Chinese',
    enabled: true
  },
  'ja': { 
    name: 'Japanese', 
    nativeName: '日本語',
    rtl: false,
    script: 'Japanese',
    enabled: true
  },
  'ko': { 
    name: 'Korean', 
    nativeName: '한국어',
    rtl: false,
    script: 'Korean',
    enabled: true
  }
};

/**
 * Get list of all supported languages
 * @returns {Array} Array of language codes
 */
const getSupportedLanguages = () => {
  return Object.keys(languages).filter(code => languages[code].enabled);
};

/**
 * Get language information by code
 * @param {string} code - Language code
 * @returns {Object|null} Language information or null if not found
 */
const getLanguageInfo = (code) => {
  return languages[code] || null;
};

/**
 * Check if language is RTL (Right-to-Left)
 * @param {string} code - Language code
 * @returns {boolean} True if RTL, false otherwise
 */
const isRTL = (code) => {
  const lang = languages[code];
  return lang ? lang.rtl : false;
};

/**
 * Get language name by code
 * @param {string} code - Language code
 * @returns {string} Language name or code if not found
 */
const getLanguageName = (code) => {
  const lang = languages[code];
  return lang ? lang.name : code;
};

/**
 * Get native language name by code
 * @param {string} code - Language code
 * @returns {string} Native language name or code if not found
 */
const getNativeLanguageName = (code) => {
  const lang = languages[code];
  return lang ? lang.nativeName : code;
};

module.exports = {
  languages,
  getSupportedLanguages,
  getLanguageInfo,
  isRTL,
  getLanguageName,
  getNativeLanguageName
};