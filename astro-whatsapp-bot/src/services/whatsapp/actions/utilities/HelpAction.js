const BaseAction = require('../BaseAction');
const { ResponseBuilder } = require('../../utils/ResponseBuilder');
const { sendMessage } = require('../../messageSender');
const translationService = require('../../../../services/i18n/TranslationService');

/**
 * HelpAction - Provides comprehensive help and support information.
 * Explains available features, functionality, and how to navigate the bot.
 */
class HelpAction extends BaseAction {
  /**
   * Unique action identifier
   */
  static get actionId() {
    return 'show_help_support';
  }

  /**
   * Execute the help action
   * @returns {Promise<Object|null>} Action result
   */
  async execute() {
    try {
      this.logExecution('start', 'Providing help and support');

      // Send comprehensive help information
      await this.sendHelpInformation();

      this.logExecution('complete', 'Help information sent');
      return {
        success: true,
        type: 'help_information',
        helpType: 'comprehensive'
      };

    } catch (error) {
      this.logger.error('Error in HelpAction:', error);
      await this.handleExecutionError(error);
      return { success: false, reason: 'execution_error', error: error.message };
    }
  }

  /**
   * Send comprehensive help and support information
   */
  async sendHelpInformation() {
    try {
      const helpMessage = this.formatHelpMessage();
      const userLanguage = this.getUserLanguage();

      const helpButtons = [
        {
          id: 'show_main_menu',
          titleKey: 'buttons.main_menu',
          title: '🏠 Main Menu'
        },
        {
          id: 'show_quick_start',
          titleKey: 'buttons.quick_start',
          title: '🚀 Quick Start'
        },
        {
          id: 'contact_support',
          titleKey: 'buttons.support',
          title: '📞 Support'
        },
        {
          id: 'show_commands_list',
          titleKey: 'buttons.commands',
          title: '📋 Commands'
        }
      ];

      const message = ResponseBuilder.buildInteractiveButtonMessage(
        this.phoneNumber,
        helpMessage,
        helpButtons,
        userLanguage
      );

      await sendMessage(
        message.to,
        message.interactive,
        'interactive'
      );

    } catch (error) {
      this.logger.error('Error sending help information:', error);
      await this.handleExecutionError(error);
    }
  }

  /**
   * Format comprehensive help message
   * @returns {string} Formatted help text
   */
  formatHelpMessage() {
    let help = `🆘 *Help & Support - Cosmic Companion*\n\n`;

    help += `*👋 Welcome to your personal astrology guide!*\n`;
    help += `I'm here to help you understand the cosmic influences on your life through:\n\n`;

    // Main Features
    help += `*🌟 CORE FEATURES:*\n`;
    help += `• **Daily Horoscope** - Cosmic guidance for each day\n`;
    help += `• **Birth Chart** - Your complete astrological blueprint\n`;
    help += `• **Compatibility** - Relationship analysis with others\n`;
    help += `• **Current Transits** - Planetary influences right now\n`;
    help += `• **Numerology** - Numbers that reveal your life path\n`;
    help += `• **Tarot Reading** - Mystical card guidance\n\n`;

    // How to Use
    help += `*📱 HOW TO USE:*\n`;
    help += `• Send "menu" anytime to see all options\n`;
    help += `• Complete your birth profile for personalized readings\n`;
    help += `• Use keywords like "horoscope", "chart", "tarot"\n`;
    help += `• Interactive buttons guide your journey\n\n`;

    // Getting Started
    help += `*🚀 GETTING STARTED:*\n`;
    help += `1. **Complete Profile**: Birth date, time, place\n`;
    help += `2. **Choose Reading**: Pick from main menu\n`;
    help += `3. **Explore Features**: Try different services\n`;
    help += `4. **Ask Questions**: Natural language supported\n\n`;

    // Tips
    help += `*💡 TIPS:*\n`;
    help += `• All readings are personalized to your chart\n`;
    help += `• Multilingual support available\n`;
    help += `• Daily horoscopes refresh automatically\n`;
    help += `• Your data is private and secure\n\n`;

    // Support
    help += `*📞 NEED ASSISTANCE?*\n`;
    help += `• Quick start guide: Tap "🚀 Quick Start"\n`;
    help += `• Command reference: Tap "📋 Commands"\n`;
    help += `• Support contact: Tap "📞 Support"\n`;
    help += `• Profile setup: Available in main menu\n\n`;

    help += `*✨ Remember: The universe has a plan for you. Let the stars guide your journey.*`;

    return help;
  }

  /**
   * Send quick start guide
   */
  async sendQuickStartGuide() {
    const quickStart = this.formatQuickStartGuide();
    await sendMessage(this.phoneNumber, quickStart, 'text');
  }

  /**
   * Format quick start guide
   * @returns {string} Quick start text
   */
  formatQuickStartGuide() {
    return `🚀 *Quick Start Guide*\n\n` +
      `*🎯 First Steps:*\n` +
      `1. Complete your birth profile (required for most features)\n` +
      `2. Try "Daily Horoscope" for immediate cosmic guidance\n` +
      `3. Explore "Birth Chart" to understand your blueprint\n\n` +
      `*✨ Try These Commands:*\n` +
      `• "menu" - See all available options\n` +
      `• "horoscope" - Get daily guidance\n` +
      `• "chart" - View your birth chart\n` +
      `• "tarot" - Mystical card reading\n` +
      `• "compatibility" - Relationship analysis\n\n` +
      `Ready to explore the cosmos? Send "menu" to begin!`;
  }

  /**
   * Send comprehensive commands list
   */
  async sendCommandsList() {
    const commands = this.formatCommandsList();
    await sendMessage(this.phoneNumber, commands, 'text');
  }

  /**
   * Format comprehensive commands list
   * @returns {string} Commands text
   */
  formatCommandsList() {
    return `📋 *Available Commands*\n\n` +

      `*🎯 ASTROLOGY COMMANDS:*\n` +
      `• "horoscope" - Daily horoscope\n` +
      `• "chart" - Birth chart analysis\n` +
      `• "transits" - Current planetary influences\n` +
      `• "compatibility" - Relationship analysis\n` +
      `• "numerology" - Life path numbers\n\n` +

      `*🔮 DIVINATION COMMANDS:*\n` +
      `• "tarot" - Tarot card reading\n` +
      `• "iching" - I Ching consultation\n` +
      `• "palmistry" - Hand analysis\n\n` +

      `*⚙️ SYSTEM COMMANDS:*\n` +
      `• "menu" - Main navigation\n` +
      `• "help" - This help guide\n` +
      `• "profile" - User settings\n` +
      `• "language" - Change language\n\n` +

      `*💡 TIPS:*\n` +
      `• Commands work in any language\n` +
      `• Try natural language: "What's my destiny?"\n` +
      `• Interactive buttons for easy navigation`;
  }

  /**
   * Send contact support information
   */
  async sendSupportContact() {
    const support = this.formatSupportInfo();
    await sendMessage(this.phoneNumber, support, 'text');
  }

  /**
   * Format support contact information
   * @returns {string} Support text
   */
  formatSupportInfo() {
    return `📞 *Contact Support*\n\n` +
      `*🆘 Need Help?*\n` +
      `We're here to assist you on your cosmic journey!\n\n` +

      `*📧 Contact Methods:*\n` +
      `• In-app: Use the feedback option in settings\n` +
      `• Email: support@cosmiccompanion.com\n` +
      `• Hours: 24/7 (AI assistant available)\n\n` +

      `*❓ Common Questions:*\n` +
      `• How do I complete my profile? → Use "Settings" menu\n` +
      `• Why do I need birth details? → For accurate calculations\n` +
      `• Can I change my language? → Yes, in profile settings\n` +
      `• Is my data secure? → Yes, fully encrypted and private\n\n` +

      `*🕐 Response Time:*\n` +
      `• General questions: Immediate (this chat)\n` +
      `• Technical issues: Within 24 hours\n` +
      `• Custom consultations: 2-3 business days\n\n` +

      `*💫 Thank you for choosing Cosmic Companion!*`;
  }

  /**
   * Handle execution errors
   * @param {Error} error - Execution error
   */
  async handleExecutionError(error) {
    const errorMessage = '❌ Sorry, there was an error displaying help information. Please try again or contact support if the problem persists.';
    await sendMessage(this.phoneNumber, errorMessage, 'text');
  }

  /**
   * Get action metadata for registration
   * @returns {Object} Action metadata
   */
  static getMetadata() {
    return {
      id: this.actionId,
      description: 'Provide comprehensive help and support information',
      keywords: ['help', 'support', 'guide', 'tutorial', 'how to', 'commands'],
      category: 'utilities',
      subscriptionRequired: false,
      cooldown: 60000 // 1 minute between help requests
    };
  }
}

module.exports = HelpAction;