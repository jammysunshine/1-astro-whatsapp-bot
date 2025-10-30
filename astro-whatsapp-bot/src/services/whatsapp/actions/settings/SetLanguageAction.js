const BaseAction = require('../BaseAction');
const { sendMessage } = require('../../messageSender');
const { updateUserProfile } = require('../../../../models/userModel');
const translationService = require('../../../services/i18n/TranslationService');

/**
 * SetLanguageAction - Handles setting user language preferences
 * Supports all 28 languages with proper validation and storage
 */
class SetLanguageAction extends BaseAction {
  constructor(user, phoneNumber, data = {}) {
    super(user, phoneNumber, data);
    this.requestedLanguage = data.languageCode;
  }

  static get actionId() {
    return 'set_language';
  }

  /**
   * Execute the language setting action
   * @returns {Promise<Object|null>} Action result
   */
  async execute() {
    try {
      this.logExecution('start', `Setting language to ${this.requestedLanguage}`);

      // Validate requested language
      const languageInfo = this.validateLanguage(this.requestedLanguage);
      if (!languageInfo) {
        await this.sendInvalidLanguageError();
        return { success: false, reason: 'invalid_language' };
      }

      // Update user language preference
      await this.updateLanguagePreference(languageInfo.code);

      // Send confirmation message in new language if possible
      await this.sendLanguageConfirmation(languageInfo);

      this.logExecution('complete', `Language set to ${languageInfo.code}`);
      return {
        success: true,
        type: 'language_setting',
        newLanguage: languageInfo.code,
        languageName: languageInfo.name
      };
    } catch (error) {
      this.logger.error('Error in SetLanguageAction:', error);
      await this.handleExecutionError(error);
      return { success: false, reason: 'execution_error', error: error.message };
    }
  }

  /**
   * Validate requested language code
   * @param {string} languageCode - Language code to validate
   * @returns {Object|null} Language info or null if invalid
   */
  validateLanguage(languageCode) {
    const supportedLanguages = this.getSupportedLanguages();
    return supportedLanguages.find(lang => lang.code === languageCode) || null;
  }

  /**
   * Update user language preference in database
   * @param {string} languageCode - New language code
   */
  async updateLanguagePreference(languageCode) {
    try {
      await updateUserProfile(this.phoneNumber, {
        preferredLanguage: languageCode,
        languageUpdatedAt: new Date().toISOString()
      });
    } catch (error) {
      this.logger.error('Error updating language preference:', error);
      throw error;
    }
  }

  /**
   * Send confirmation message for language change
   * @param {Object} languageInfo - Language information
   */
  async sendLanguageConfirmation(languageInfo) {
    const confirmationMessage = await this.generateConfirmationMessage(languageInfo);

    await sendMessage(this.phoneNumber, confirmationMessage, 'text');

    // Send quick guide in new language
    setTimeout(async() => {
      try {
        const guideMessage = await translationService.translate('messages.language.set_confirmation_guide', languageInfo.code, {
          flag: languageInfo.flag,
          name: languageInfo.name
        });
        await sendMessage(this.phoneNumber, guideMessage, 'text');
      } catch (error) {
        this.logger.error('Error sending language guide:', error);
      }
    }, 1000);
  }

  /**
   * Generate confirmation message for language change
   * @param {Object} languageInfo - Language information
   * @returns {string} Confirmation message
   */
  async generateConfirmationMessage(languageInfo) {
    // Use parameterized translation that works for all languages
    const confirmationMessage = await translationService.translate('messages.language.set_confirmation', 'en', {
      flag: languageInfo.flag || '🌐',
      language: languageInfo.nativeName || languageInfo.name || languageInfo.code.toUpperCase()
    });

    return confirmationMessage;
  }

  /**
   * Get all supported languages for validation
   * @returns {Array} Array of supported language objects
   */
  getSupportedLanguages() {
    return [
      { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
      { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
      { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', rtl: true },
      { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
      { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
      { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩' },
      { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', rtl: true },
      { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
      { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
      { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
      { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
      { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
      { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
      { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
      { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
      { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
      { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
      { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
      { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
      { code: 'or', name: 'Oriya', nativeName: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
      { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', flag: '🇮🇳' },
      { code: 'fa', name: 'Persian', nativeName: 'فارسی', flag: '🇮🇷', rtl: true },
      { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
      { code: 'he', name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱', rtl: true },
      { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
      { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
      { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
      { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' }
    ];
  }

  /**
   * Send error for invalid language
   */
  async sendInvalidLanguageError() {
    const errorMessage = '❌ Invalid language selection.\n\nPlease choose from the supported 28 languages in the language menu.\n\nType "settings" or "language" to see all available options.';
    await sendMessage(this.phoneNumber, errorMessage, 'text');
  }

  /**
   * Handle execution errors
   * @param {Error} error - Execution error
   */
  async handleExecutionError(error) {
    const errorMessage = '❌ Sorry, I couldn\'t update your language preference. Please try again or contact support.\n\nYou can still use the bot in English.';
    await sendMessage(this.phoneNumber, errorMessage, 'text');
  }
}

module.exports = SetLanguageAction;
