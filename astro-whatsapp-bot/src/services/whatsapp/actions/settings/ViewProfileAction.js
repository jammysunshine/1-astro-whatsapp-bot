const BaseAction = require('../BaseAction');
const { sendMessage } = require('../../messageSender');
const { getUserByPhone, hasActiveSubscription, getSubscriptionBenefits } = require('../../../models/userModel');
const translationService = require('../../../services/i18n/TranslationService');

/**
 * ViewProfileAction - Displays current user profile information
 * Shows birth details, subscription status, and account preferences
 */
class ViewProfileAction extends BaseAction {
  constructor(user, phoneNumber, data = {}) {
    super(user, phoneNumber, data);
  }

  static get actionId() {
    return 'btn_view_profile';
  }

  /**
   * Execute the view profile action
   * @returns {Promise<Object|null>} Action result
   */
  async execute() {
    try {
      this.logExecution('start', 'Viewing user profile');

      // Get fresh user data from database (not from potentially stale session data)
      const freshUserData = await getUserByPhone(this.phoneNumber);

      if (!freshUserData) {
        await this.sendUserNotFoundError();
        return { success: false, reason: 'user_not_found' };
      }

      const profileSummary = this.buildProfileSummary(freshUserData);
      await sendMessage(this.phoneNumber, profileSummary, 'text');

      // Optional: Add quick edit option
      await this.sendEditOption();

      this.logExecution('complete', 'Profile view displayed successfully');
      return {
        success: true,
        type: 'profile_view',
        profileComplete: freshUserData.profileComplete,
        subscriptionTier: freshUserData.subscriptionTier
      };
    } catch (error) {
      this.logger.error('Error in ViewProfileAction:', error);
      await this.handleExecutionError(error);
      return { success: false, reason: 'execution_error', error: error.message };
    }
  }

  /**
   * Build comprehensive profile summary
   * @param {Object} userData - Fresh user data from database
   * @returns {string} Formatted profile summary
   */
  buildProfileSummary(userData) {
    const summary = [];

    // Header
    summary.push('📋 *YOUR COSMIC PROFILE*\n');

    // Basic Info
    summary.push('👤 *Personal Information:*');
    summary.push(`• Name: ${userData.name || 'Not set'}`);
    summary.push(`• Phone: ${this.maskPhoneNumber(this.phoneNumber)}`);
    summary.push(`• Member since: ${this.formatDate(userData.createdAt)}`);
    summary.push(`• Preferred Language: ${this.getLanguageDisplay(userData.preferredLanguage)}`);
    summary.push('');

    // Birth Details
    summary.push('🎂 *Birth Details:*');
    if (userData.birthDate) {
      summary.push(`• Date: ${this.formatBirthDate(userData.birthDate)}`);

      if (userData.birthTime) {
        summary.push(`• Time: ${this.formatBirthTime(userData.birthTime)}`);
      } else {
        summary.push(`• Time: ${this.getTranslation('profile.time_not_set', userData.preferredLanguage || 'en')}`);
      }

      if (userData.birthPlace) {
        summary.push(`• Place: ${userData.birthPlace}`);
      } else {
        summary.push(`• Place: ${this.getTranslation('profile.place_not_set', userData.preferredLanguage || 'en')}`);
      }
    } else {
      summary.push(`• ${this.getTranslation('profile.birth_details_not_complete', userData.preferredLanguage || 'en')}`);
    }
    summary.push('');

    // Profile Status
    const isComplete = userData.profileComplete;
    statusEmoji = isComplete ? '✅' : '⚠️';
    summary.push(`${statusEmoji} *Profile Status:* ${isComplete ?
      this.getTranslation('profile.complete', userData.preferredLanguage || 'en') :
      this.getTranslation('profile.incomplete_birth_needed', userData.preferredLanguage || 'en')}`);
    summary.push('');

    // Subscription Status
    const hasActiveSub = hasActiveSubscription(userData);
    const benefits = getSubscriptionBenefits(userData);
    const subEmoji = hasActiveSub ? '💎' : '🆓';
    summary.push(`${subEmoji} *${this.getTranslation('profile.subscription', userData.preferredLanguage || 'en')}:*`);
    summary.push(`• Tier: ${userData.subscriptionTier || 'free'} ${hasActiveSub ? '🎉' : ''}`);

    if (userData.subscriptionExpiry && hasActiveSub) {
      summary.push(`• Expires: ${this.formatDate(userData.subscriptionExpiry)}`);
    } else if (hasActiveSub) {
      summary.push(`• ${this.getTranslation('profile.lifetime_subscription', userData.preferredLanguage || 'en')}`);
    }

    summary.push(`• Compatibility checks used: ${userData.compatibilityChecks || 0}/${benefits.maxCompatibilityChecks === Infinity ? '∞' : benefits.maxCompatibilityChecks}`);
    summary.push('');

    // Activity Summary
    summary.push('📊 *Activity Summary:*');
    summary.push(`• Last interaction: ${this.formatDate(userData.lastInteraction)}`);
    if (userData.loyaltyPoints) {
      summary.push(`• Loyalty points: ${userData.loyaltyPoints} ⭐`);
    }
    if (userData.referredUsers && userData.referredUsers.length > 0) {
      summary.push(`• Friends referred: ${userData.referredUsers.length} 👥`);
    }

    return summary.join('\n');
  }

  /**
   * Send option to edit profile
   */
  async sendEditOption() {
    setTimeout(async() => {
      try {
        const editMessage = '💡 *Need to update your information?* Use Settings → Update Profile to edit your birth details, name, or preferences.\n\nOr type "settings" to see all options.';
        await sendMessage(this.phoneNumber, editMessage, 'text');
      } catch (error) {
        this.logger.error('Error sending edit option:', error);
      }
    }, 1500);
  }

  /**
   * Format birth date for display
   * @param {string} birthDate - Raw birth date
   * @returns {string} Formatted date
   */
  formatBirthDate(birthDate) {
    try {
      // Convert DDMMYY/DDMMYYYY to readable format
      if (birthDate.length === 6) {
        // DDMMYY format
        const day = birthDate.substring(0, 2);
        const month = birthDate.substring(2, 4);
        const year = `19${birthDate.substring(4, 6)}`;
        return `${day}/${month}/${year}`;
      } else {
        // DDMMYYYY format
        const day = birthDate.substring(0, 2);
        const month = birthDate.substring(2, 4);
        const year = birthDate.substring(4, 8);
        return `${day}/${month}/${year}`;
      }
    } catch (error) {
      return birthDate; // Return as-is if formatting fails
    }
  }

  /**
   * Format birth time for display
   * @param {string} birthTime - Raw birth time (HHMM)
   * @returns {string} Formatted time
   */
  formatBirthTime(birthTime) {
    try {
      const hours = parseInt(birthTime.substring(0, 2));
      const minutes = birthTime.substring(2, 4);
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      return `${displayHours}:${minutes} ${period}`;
    } catch (error) {
      return birthTime;
    }
  }

  /**
   * Get language display name
   * @param {string} languageCode - Language code
   * @returns {string} Language name
   */
  getLanguageDisplay(languageCode) {
    const languages = {
      en: 'English',
      hi: 'Hindi',
      ar: 'Arabic',
      es: 'Spanish',
      fr: 'French',
      bn: 'Bengali',
      ur: 'Urdu',
      pt: 'Portuguese',
      ru: 'Russian',
      de: 'German',
      it: 'Italian',
      th: 'Thai',
      ta: 'Tamil',
      te: 'Telugu',
      gu: 'Gujarati',
      mr: 'Marathi',
      kn: 'Kannada',
      ml: 'Malayalam',
      pa: 'Punjabi'
    };
    return languages[languageCode] || languageCode || 'English';
  }

  /**
   * Get translation with fallback
   * @param {string} key - Translation key
   * @param {string} language - Language code
   * @returns {string} Translated text
   */
  getTranslation(key, language) {
    try {
      // Use translation service if available
      if (global.translationService && global.translationService.translate) {
        return global.translationService.translate(key, language) || this.getDefaultTranslation(key);
      }
    } catch (error) {
      // Ignore translation errors
    }
    return this.getDefaultTranslation(key);
  }

  /**
   * Default translations for profile viewing
   * @param {string} key - Translation key
   * @returns {string} Default text
   */
  getDefaultTranslation(key) {
    const defaults = {
      'profile.time_not_set': 'Not specified',
      'profile.place_not_set': 'Not specified',
      'profile.birth_details_not_complete': 'Birth details not complete. Use Update Profile to add them.',
      'profile.complete': 'Complete - Ready for all astrology services!',
      'profile.incomplete_birth_needed': 'Incomplete - Birth details needed for full astrology analysis',
      'profile.subscription': 'Current Plan',
      'profile.lifetime_subscription': 'Lifetime access'
    };
    return defaults[key] || key;
  }

  /**
   * Format date for display
   * @param {Date|string} date - Date to format
   * @returns {string} Formatted date
   */
  formatDate(date) {
    try {
      if (!date) { return 'Never'; }
      const d = new Date(date);
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return date;
    }
  }

  /**
   * Mask phone number for privacy
   * @param {string} phone - Full phone number
   * @returns {string} Masked phone number
   */
  maskPhoneNumber(phone) {
    if (!phone || phone.length < 4) { return phone; }
    const { length } = phone;
    const last4 = phone.substring(length - 4);
    return `...${last4}`;
  }

  /**
   * Send error for user not found
   */
  async sendUserNotFoundError() {
    const errorMessage = '❌ Unable to retrieve your profile at this time. Please try again later or contact support.';
    await sendMessage(this.phoneNumber, errorMessage, 'text');
  }

  /**
   * Handle execution errors
   * @param {Error} error - Execution error
   */
  async handleExecutionError(error) {
    const errorMessage = '❌ Sorry, there was an error viewing your profile. Please try again.';
    await sendMessage(this.phoneNumber, errorMessage, 'text');
  }
}

module.exports = ViewProfileAction;
