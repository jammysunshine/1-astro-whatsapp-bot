const BaseAction = require('../BaseAction');
const { sendMessage } = require('../../messageSender');
const { getUserByPhone, addBirthDetails, updateUserProfile } = require('../../../../models/userModel');
const translationService = require('../../../services/i18n/TranslationService');

/**
 * UpdateProfileAction - Interactive profile update system
 * Reuses existing birth data capture and validation functions
 * Supports updating name, birth details, and preferences
 */
class UpdateProfileAction extends BaseAction {
  static get actionId() {
    return 'btn_update_profile';
  }

  /**
   * Execute the update profile action - starts interactive flow
   * @returns {Promise<Object|null>} Action result
   */
  async execute() {
    try {
      this.logExecution('start', 'Starting profile update process');

      // Get current user data
      const currentUser = await getUserByPhone(this.phoneNumber);
      if (!currentUser) {
        await this.sendUserNotFoundError();
        return { success: false, reason: 'user_not_found' };
      }

      // Start interactive profile update flow
      await this.startUpdateFlow(currentUser);

      this.logExecution('complete', 'Profile update flow initiated');
      return {
        success: true,
        type: 'profile_update_initiated',
        currentProfileComplete: currentUser.profileComplete
      };
    } catch (error) {
      this.logger.error('Error in UpdateProfileAction:', error);
      await this.handleExecutionError(error);
      return { success: false, reason: 'execution_error', error: error.message };
    }
  }

  /**
   * Start the interactive profile update flow
   * @param {Object} currentUser - Current user data
   */
  async startUpdateFlow(currentUser) {
    const options = this.buildUpdateOptions(currentUser);

    // Send update options menu
    await sendMessage(this.phoneNumber, options.message, 'text');

    // Send interactive menu for specific updates
    const menuMessage = {
      to: this.phoneNumber,
      interactive: {
        type: 'list',
        body: '📝 *Select what to update:*',
        action: {
          button: 'Choose Update Option',
          sections: [{
            title: 'Profile Update Options',
            rows: options.rows
          }]
        }
      }
    };

    await sendMessage(this.phoneNumber, menuMessage.interactive, 'interactive');

    // Add helpful instruction
    setTimeout(async() => {
      try {
        const hintMessage = '💡 *Tip:* Choose "Update Birth Details" for complete astrology readings. This is the most requested update!';
        await sendMessage(this.phoneNumber, hintMessage, 'text');
      } catch (error) {
        this.logger.error('Error sending hint:', error);
      }
    }, 1500);
  }

  /**
   * Build update options based on current profile status
   * @param {Object} user - Current user data
   * @returns {Object} Update options and menu rows
   */
  buildUpdateOptions(user) {
    const rows = [];
    const items = [
      {
        title: '📝 Update Name',
        description: `Current: ${user.name || 'Not set'}`,
        actionId: 'profile_update_name'
      },
      {
        title: '🎂 Update Birth Details',
        description: `${user.birthDate ? 'Update existing birth information' : 'Add birth date, time & place'}`,
        actionId: 'profile_update_birth'
      }
    ];

    // Only show name/language options if birth is complete
    if (user.profileComplete) {
      items.push(
        {
          title: '🌐 Update Language',
          description: `Current: ${this.getLanguageDisplay(user.preferredLanguage)}`,
          actionId: 'profile_update_language'
        },
        {
          title: '⭐ Update Preferences',
          description: 'Notification and astrology preferences',
          actionId: 'profile_update_preferences'
        }
      );
    }

    // Convert to menu rows
    items.forEach((item, index) => {
      rows.push({
        id: item.actionId,
        title: item.title,
        description: item.description
      });
    });

    const message = `📋 *UPDATE YOUR COSMIC PROFILE*\n\n${user.profileComplete ?
      '✅ Your profile is complete! Make targeted updates below:' :
      '⚠️ Your profile needs birth details for full astrology analysis. Start with "Update Birth Details".'}\n
🌟 Current Status:
• Birth Info: ${user.birthDate ? 'Set' : 'Missing'}
• Profile Complete: ${user.profileComplete ? 'Yes ✅' : 'No ⚠️'}

Choose what to update:`;

    return { message, rows };
  }

  /**
   * Handle specific profile update types (called by menu selection)
   * @param {string} updateType - Type of update requested
   */
  async handleProfileUpdate(updateType) {
    try {
      switch (updateType) {
      case 'profile_update_name':
        await this.handleNameUpdate();
        break;

      case 'profile_update_birth':
        await this.startBirthDetailsFlow();
        break;

      case 'profile_update_language':
        await this.sendLanguageUpdateInstructions();
        break;

      case 'profile_update_preferences':
        await this.sendPreferencesUpdateInstructions();
        break;

      default:
        await this.sendInvalidUpdateError();
      }
    } catch (error) {
      this.logger.error(`Error handling profile update ${updateType}:`, error);
      await this.handleExecutionError(error);
    }
  }

  /**
   * Handle name update flow
   */
  async handleNameUpdate() {
    const promptMessage = '📝 *Update Your Name*\n\nPlease reply with your preferred name for your cosmic profile:';
    await sendMessage(this.phoneNumber, promptMessage, 'text');

    // Set user session to expect name update
    await this.setSessionExpectation('name_update');
  }

  /**
   * Start birth details capture flow - REUSES existing functions
   */
  async startBirthDetailsFlow() {
    const currentUser = await getUserByPhone(this.phoneNumber);

    const flowMessage = `🎂 *Update Birth Details*

${currentUser.birthDate ?
    `📅 Current birth date: ${this.formatBirthDate(currentUser.birthDate)}\n` +
  `${currentUser.birthTime ? `⏰ Current time: ${this.formatBirthTime(currentUser.birthTime)}\n` : ''}` +
  `${currentUser.birthPlace ? `📍 Current place: ${currentUser.birthPlace}\n\n` : '\n'}` :
    '👋 Welcome! For accurate astrology readings, we need your birth details.\n\n'
}

💫 *Please provide your birth information in order:*

1️⃣ *Birth Date:* Reply with DDMMYY or DDMMYYYY format
   Example: 150691 (June 15, 1991)

2️⃣ *Birth Time:* Reply with HHMM format (optional but recommended)
   Example: 1430 (2:30 PM)

3️⃣ *Birth Place:* Reply with City, Country
   Example: Delhi, India or New York, USA

${this.getBirthDetailsInstructions()}`;

    await sendMessage(this.phoneNumber, flowMessage, 'text');

    // Set session to expect birth details
    await this.setSessionExpectation('birth_details_update');
  }

  /**
   * Process birth details update - REUSES existing addBirthDetails function
   * @param {Object} birthData - Parsed birth data
   */
  async processBirthDetailsUpdate(birthData) {
    try {
      this.logger.info(`Processing birth details update for ${this.phoneNumber}:`, birthData);

      // REUSE existing addBirthDetails function from userModel
      const updatedUser = await addBirthDetails(
        this.phoneNumber,
        birthData.birthDate,
        birthData.birthTime,
        birthData.birthPlace
      );

      // Send success confirmation
      const successMessage = `✅ *Birth Details Updated Successfully!*

🎂 New Birth Information:
• Date: ${this.formatBirthDate(birthData.birthDate)}
• Time: ${birthData.birthTime ? this.formatBirthTime(birthData.birthTime) : 'Not specified'}
• Place: ${birthData.birthPlace}

${updatedUser.profileComplete ?
    '✅ Your profile is now complete! You can access all astrology services.' :
    '⚠️ Profile still incomplete. Add birth place for full analysis.'}

🌟 Ready for comprehensive astrology readings!`;
      await sendMessage(this.phoneNumber, successMessage, 'text');

      // Clear session expectation
      await this.clearSessionExpectation();

      return { success: true, profileComplete: updatedUser.profileComplete };
    } catch (error) {
      this.logger.error('Error updating birth details:', error);
      await this.sendBirthDetailsError();
      return { success: false, error: error.message };
    }
  }

  /**
   * Process name update
   * @param {string} newName - New name to set
   */
  async processNameUpdate(newName) {
    try {
      // Validate name
      const cleanName = newName.trim();
      if (cleanName.length < 1 || cleanName.length > 50) {
        await this.sendValidationError('Name must be 1-50 characters long.');
        return;
      }

      // Update name using existing updateUserProfile function
      const updatedUser = await updateUserProfile(this.phoneNumber, {
        name: cleanName
      });

      const successMessage = `✅ *Name Updated Successfully!*

👤 New Name: ${cleanName}
📋 Profile Updated: ${new Date().toLocaleDateString()}`;

      await sendMessage(this.phoneNumber, successMessage, 'text');
      await this.clearSessionExpectation();

      return { success: true };
    } catch (error) {
      this.logger.error('Error updating name:', error);
      await this.sendNameUpdateError();
      return { success: false, error: error.message };
    }
  }

  /**
   * Send language update instructions
   */
  async sendLanguageUpdateInstructions() {
    const langMessage = '🌐 *Language Update*\n\nTo change your preferred language:\n\n1. Go to Settings → Language menu\n2. Select from 28 available languages\n3. Your preference will be saved automatically\n\nOr type "language" to access the language menu directly.';
    await sendMessage(this.phoneNumber, langMessage, 'text');
  }

  /**
   * Send preferences update instructions
   */
  async sendPreferencesUpdateInstructions() {
    const prefMessage = '⚙️ *Preferences*\n\nMost preferences are handled through our Settings menu. Let us know what specific preference you\'d like to update:\n\n• Astrology reading depth\n• Notification settings\n• Chart display preferences\n• Default language\n\nReply with what you want to change or use the main Settings menu.';
    await sendMessage(this.phoneNumber, prefMessage, 'text');
  }

  /**
   * Send invalid update error
   */
  async sendInvalidUpdateError() {
    const errorMessage = '❌ Invalid update option. Please use the Settings menu to select a valid update choice.';
    await sendMessage(this.phoneNumber, errorMessage, 'text');
  }

  /**
   * Birth details instructions
   * @returns {string} Instructions text
   */
  getBirthDetailsInstructions() {
    return `📋 *Important Instructions:*
• Date must be in DDMMYY or DDMMYYYY format (no slashes or spaces)
• Time is optional but greatly improves accuracy
• Include country for precise time zone calculations
• You can update individual pieces at any time
• Privacy: All data is encrypted and used only for astrology calculations

💫 *Why we need this:* Accurate birth data enables precise planetary calculations for authentic Vedic and Western astrology readings.`;
  }

  /**
   * Format birth date for display
   * @param {string} birthDate - Raw birth date
   * @returns {string} Formatted date
   */
  formatBirthDate(birthDate) {
    try {
      if (birthDate.length === 6) {
        const day = birthDate.substring(0, 2);
        const month = birthDate.substring(2, 4);
        const year = `19${birthDate.substring(4, 6)}`;
        return `${day}/${month}/${year}`;
      } else {
        const day = birthDate.substring(0, 2);
        const month = birthDate.substring(2, 4);
        const year = birthDate.substring(4, 8);
        return `${day}/${month}/${year}`;
      }
    } catch (error) {
      return birthDate;
    }
  }

  /**
   * Format birth time for display
   * @param {string} birthTime - Raw birth time
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
      en: 'English', hi: 'Hindi', ar: 'Arabic', es: 'Spanish',
      fr: 'French', bn: 'Bengali', ur: 'Urdu', pt: 'Portuguese',
      ru: 'Russian', de: 'German', it: 'Italian', th: 'Thai'
    };
    return languages[languageCode] || languageCode || 'English';
  }

  /**
   * Set session expectation for interactive flow
   * @param {string} expectation - What to expect next
   */
  async setSessionExpectation(expectation) {
    try {
      // This would update session to expect next input
      // Implementation depends on existing session management
      this.logger.info(`Set session expectation: ${expectation} for ${this.phoneNumber}`);
    } catch (error) {
      this.logger.error('Error setting session expectation:', error);
    }
  }

  /**
   * Clear session expectation
   */
  async clearSessionExpectation() {
    try {
      this.logger.info(`Cleared session expectation for ${this.phoneNumber}`);
    } catch (error) {
      this.logger.error('Error clearing session expectation:', error);
    }
  }

  /**
   * Send error for user not found
   */
  async sendUserNotFoundError() {
    const errorMessage = '❌ Unable to find your profile. Please restart or contact support.';
    await sendMessage(this.phoneNumber, errorMessage, 'text');
  }

  /**
   * Send birth details update error
   */
  async sendBirthDetailsError() {
    const errorMessage = '❌ Error updating birth details. Please ensure date format is correct (DDMMYY) and try again.';
    await sendMessage(this.phoneNumber, errorMessage, 'text');
  }

  /**
   * Send name update error
   */
  async sendNameUpdateError() {
    const errorMessage = '❌ Error updating name. Please ensure name is 1-50 characters and try again.';
    await sendMessage(this.phoneNumber, errorMessage, 'text');
  }

  /**
   * Send validation error
   * @param {string} message - Error message
   */
  async sendValidationError(message) {
    const errorMessage = `❌ ${message}`;
    await sendMessage(this.phoneNumber, errorMessage, 'text');
  }

  /**
   * Handle execution errors
   * @param {Error} error - Execution error
   */
  async handleExecutionError(error) {
    const errorMessage = '❌ Sorry, there was an error updating your profile. Please try again.';
    await sendMessage(this.phoneNumber, errorMessage, 'text');
  }
}

module.exports = UpdateProfileAction;
