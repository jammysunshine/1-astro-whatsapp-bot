const BaseAction = require('../BaseAction');
const { sendMessage } = require('../../messageSender');
const { updateUserProfile } = require('../../../../models/userModel');
const translationService = require('../../../../services/i18n/TranslationService');

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
    const confirmationMessage = this.generateConfirmationMessage(languageInfo);

    await sendMessage(this.phoneNumber, confirmationMessage, 'text');

    // Send quick guide in new language
    setTimeout(async () => {
      try {
        const guideMessage = `🌟 Language set to ${languageInfo.flag} ${languageInfo.name}!\n\nYou can now:\n- Access all menu options in your language\n- Get astrology readings with translations\n- Change language anytime via Settings\n\nMain menu: "menu" or "Menu"`;
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
  generateConfirmationMessage(languageInfo) {
    const messages = {
      en: `✅ Language Set Successfully!\n🌐 New Language: English (English)\n🇺🇸 All astrology services now available in English.`,
      hi: `✅ भाषा सफलतापूर्वक निर्धारित की गई!\n🌐 नई भाषा: हिन्दी (Hindi)\n🇮🇳 सभी ज्योतिष सेवाएं अब हिंदी में उपलब्ध हैं।`,
      ar: `✅ تم تعيين اللغة بنجاح!\n🌐 اللغة الجديدة: العربية (Arabic)\n🇸🇦 جميع خدمات التنجيم الآن متاحة باللغة العربية.`,
      es: `✅ ¡Idioma configurado exitosamente!\n🌐 Nuevo idioma: Español (Spanish)\n🇪🇸 Todos los servicios astrológicos ahora disponibles en español.`,
      fr: `✅ Langue définie avec succès!\n🌐 Nouvelle langue: Français (French)\n🇫🇷 Tous les services astrologiques maintenant disponibles en français.`,
      de: `✅ Sprache erfolgreich eingestellt!\n🌐 Neue Sprache: Deutsch (German)\n🇩🇪 Alle astrologischen Dienstleistungen jetzt auf Deutsch verfügbar.`,
      it: `✅ Lingua impostata con successo!\n🌐 Nuova lingua: Italiano (Italian)\n🇮🇹 Tutti i servizi astrologici ora disponibili in italiano.`,
      pt: `✅ Idioma definido com sucesso!\n🌐 Novo idioma: Português (Portuguese)\n🇧🇷 Todos os serviços astrológicos agora disponíveis em português.`,
      ru: `✅ Язык успешно установлен!\n🌐 Новый язык: Русский (Russian)\n🇷🇺 Все астрологические услуги теперь доступны на русском языке.`,
      bn: `✅ ভাষা সফলভাবে নির্ধারণ করা হয়েছে!\n🌐 নতুন ভাষা: বাংলা (Bengali)\n🇧🇩 সমস্ত জ্যোতিষ পরিষেবা এখন বাংলায় উপলব্ধ৷`,
      ta: `✅ மொழி வெற்றிகரமாக அமைக்கப்பட்டது!\n🌐 புதிய மொழி: தமிழ் (Tamil)\n🇮🇳 அனைத்து ஜோதிட சேவைகளும் இப்போது தமிழில் கிடைக்கின்றன.`,
      te: `✅ భాష సఫలంగా సెట్ చేయబడింది!\n🌐 కొత్త భాష: తెలుగు (Telugu)\n🇮🇳 అన్ని జ్యోతిష సేవలు ఇప్పుడు తెలుగులో అందుబాటులో ఉన్నాయి.`,
      ur: `✅ زبان کامیابی سے سیٹ کی گئی!\n🌐 نئی زبان: اردو (Urdu)\n🇵🇰 تمام نجومی خدمات اب اردو میں دستیاب ہیں۔`,
      th: `✅ ตั้งภาษาสำเร็จแล้ว!\n🌐 ภาษาใหม่: ไทย (Thai)\n🇹🇭 บริการโหราศาสตร์ทั้งหมดตอนนี้มีให้บริการในภาษาไทย`
    };

    return messages[languageInfo.code] || messages['en'];
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
      { code: 'mai', name: 'Maithili', nativeName: 'मैथिली', flag: '🇮🇳' },
      { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', flag: '🇳🇵' },
      { code: 'si', name: 'Sinhala', nativeName: 'සිංහල', flag: '🇱🇰' },
      { code: 'sd', name: 'Sindhi', nativeName: 'سنڌي', flag: '🇵🇰' },
      { code: 'zgh', name: 'Tamaziɣt', nativeName: 'ⵜⴰⵎⴰⵣⵉⵖⵜ', flag: '🇲🇦' },
      { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', flag: '🇪🇹' },
      { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇹🇿' }
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
    const errorMessage = '❌ Sorry, I couldn't update your language preference. Please try again or contact support.\n\nYou can still use the bot in English.';
    await sendMessage(this.phoneNumber, errorMessage, 'text');
  }
}

module.exports = SetLanguageAction;