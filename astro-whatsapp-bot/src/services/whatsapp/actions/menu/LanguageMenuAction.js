const BaseAction = require('../BaseAction');
const { ResponseBuilder } = require('../../utils/ResponseBuilder');
const { sendMessage } = require('../../messageSender');
const translationService = require('../../../../services/i18n/TranslationService');

/**
 * LanguageMenuAction - Shows language selection menu with all 28 supported languages
 * Accessible through Settings > Language menu path
 */
class LanguageMenuAction extends BaseAction {
  static get actionId() {
    return 'show_language_menu';
  }

  /**
   * Execute the language menu action
   * @returns {Promise<Object|null>} Action result
   */
  async execute() {
    try {
      this.logExecution('start', 'Displaying language selection menu');

      // Get current language for display
      const currentLanguage = this.user?.preferredLanguage || 'en';
      const languagesMenu = this.generateLanguageMenu(currentLanguage);

      // Build menu structure
      const message = ResponseBuilder.buildInteractiveListMessage(
        this.phoneNumber,
        languagesMenu.title,
        languagesMenu.body,
        languagesMenu.sections,
        'languages',
        this.user?.preferredLanguage || 'en'
      );

      await sendMessage(
        message.to,
        message.interactive,
        'interactive'
      );

      this.logExecution('complete', 'Language menu displayed successfully');
      return {
        success: true,
        type: 'language_menu',
        languagesCount: languagesMenu.sections[0]?.rows?.length || 0
      };

    } catch (error) {
      this.logger.error('Error in LanguageMenuAction:', error);
      await this.handleExecutionError(error);
      return { success: false, reason: 'execution_error', error: error.message };
    }
  }

  /**
   * Generate language menu with all 28 supported languages
   * @param {string} currentLanguage - Current user language code
   * @returns {Object} Menu structure for WhatsApp
   */
  generateLanguageMenu(currentLanguage) {
    const languages = this.getAllSupportedLanguages();
    const currentLangInfo = languages.find(lang => lang.code === currentLanguage);

    return {
      title: `🌐 Language Settings`,
      body: `Current Language: ${currentLangInfo?.name || 'English'}\n\nChoose your preferred language for all astrology services and menus.\n\n🇿 Select a language below:`,
      sections: [
        {
          title: '🌍 Supported Languages (28)',
          rows: languages.map(lang => ({
            id: `set_language_${lang.code}`,
            title: `${lang.flag} ${lang.name}`,
            description: lang.nativeName ? `${lang.nativeName} (${lang.users})` : `${lang.users} estimated speakers`
          }))
        }
      ]
    };
  }

  /**
   * Get all 28 supported languages with details
   * @returns {Array} Array of language objects
   */
  getAllSupportedLanguages() {
    return [
      { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', users: '1.5B+' },
      { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳', users: '615M' },
      { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', users: '422M', rtl: true },
      { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', users: '580M' },
      { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', users: '280M' },
      { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩', users: '265M' },
      { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', users: '230M', rtl: true },
      { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷', users: '260M' },
      { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', users: '258M' },
      { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', users: '135M' },
      { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', users: '85M' },
      { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭', users: '60M' },
      { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳', users: '85M' },
      { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳', users: '83M' },
      { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳', users: '68M' },
      { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳', users: '99M' },
      { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳', users: '59M' },
      { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳', users: '38M' },
      { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳', users: '152M' },
      { code: 'or', name: 'Oriya', nativeName: 'ଓଡ଼ିଆ', flag: '🇮🇳', users: '35M' },
      { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', flag: '🇮🇳', users: '24M' },
      { code: 'mai', name: 'Maithili', nativeName: 'मैथिली', flag: '🇮🇳', users: '34M' },
      { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', flag: '🇳🇵', users: '19M' },
      { code: 'si', name: 'Sinhala', nativeName: 'සිංහල', flag: '🇱🇰', users: '17M' },
      { code: 'sd', name: 'Sindhi', nativeName: 'سنڌي', flag: '🇵🇰', users: '24M' },
      { code: 'zgh', name: 'Tamaziɣt', nativeName: 'ⵜⴰⵎⴰⵣⵉⵖⵜ', flag: '🇲🇦', users: '8M' },
      { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', flag: '🇪🇹', users: '33M' },
      { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇹🇿', users: '16M' }
    ];
  }

  /**
   * Create individual language setting actions
   * @returns {Array} Array of language setting actions
   */
  static getLanguageSettingActions() {
    const languages = [
      'en', 'hi', 'ar', 'es', 'fr', 'bn', 'ur', 'pt', 'ru', 'de',
      'it', 'th', 'ta', 'te', 'gu', 'mr', 'kn', 'ml', 'pa', 'or',
      'as', 'mai', 'ne', 'si', 'sd', 'zgh', 'am', 'sw'
    ];

    return languages.map(code => ({
      id: `set_language_${code}`,
      action: 'set_language',
      languageCode: code,
      description: `Set user language to ${code.toUpperCase()}`
    }));
  }

  /**
   * Handle execution errors
   * @param {Error} error - Execution error
   */
  async handleExecutionError(error) {
    const errorMessage = 'Sorry, I encountered an error displaying the language menu. Please try accessing Settings again.';
    await sendMessage(this.phoneNumber, errorMessage, 'text');
  }
}

module.exports = LanguageMenuAction;