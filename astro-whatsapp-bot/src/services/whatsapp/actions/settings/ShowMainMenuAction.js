const BaseAction = require('../BaseAction');
const { ResponseBuilder } = require('../../../utils/ResponseBuilder');
const { sendMessage } = require('../../../messageSender');
const { getTranslatedMenu } = require('../../../conversation/menuLoader');

/**
 * ShowMainMenuAction - Displays the main menu with astrology services.
 * Central navigation hub for all bot features.
 */
class ShowMainMenuAction extends BaseAction {
  /**
   * Unique action identifier
   */
  static get actionId() {
    return 'show_main_menu';
  }

  /**
   * Execute the show main menu action
   * @returns {Promise<Object|null>} Action result
   */
  async execute() {
    try {
      this.logExecution('start', 'Showing main menu');

      const userLanguage = this.getUserLanguage();

      // Get the main menu for the user's language
      const mainMenu = await getTranslatedMenu('main_menu', userLanguage);

      if (mainMenu) {
        await this.sendMainMenu(mainMenu, userLanguage);
      } else {
        await this.sendFallbackMenu(userLanguage);
      }

      this.logExecution('complete', 'Main menu sent successfully');
      return {
        success: true,
        type: 'menu',
        menuType: 'main',
        language: userLanguage
      };
    } catch (error) {
      this.logger.error('Error showing main menu:', error);
      await this.handleExecutionError(error);
      return {
        success: false,
        reason: 'execution_error',
        error: error.message
      };
    }
  }

  /**
   * Send the main menu using the configured menu system
   * @param {Object} mainMenu - Translated menu data
   * @param {string} userLanguage - User's language code
   */
  async sendMainMenu(mainMenu, userLanguage) {
    try {
      await sendMessage(this.phoneNumber, mainMenu, 'interactive');
    } catch (error) {
      this.logger.error('Error sending main menu:', error);
      await this.sendFallbackMenu(userLanguage);
    }
  }

  /**
   * Send a basic fallback menu when the configured menu fails
   * @param {string} userLanguage - User's language code
   */
  async sendFallbackMenu(userLanguage) {
    try {
      const fallbackMenu = this.buildFallbackMenu(userLanguage);

      // Use ResponseBuilder to create a consistent interactive message
      const message = ResponseBuilder.buildInteractiveListMessage(
        this.phoneNumber,
        fallbackMenu.body,
        'Choose Service',
        fallbackMenu.sections,
        userLanguage
      );

      await sendMessage(message.to, message.interactive, 'interactive');
    } catch (error) {
      this.logger.error('Error sending fallback menu:', error);
      // Final fallback to plain text
      await this.sendPlainTextMenu(userLanguage);
    }
  }

  /**
   * Build fallback menu structure
   * @param {string} userLanguage - Language code
   * @returns {Object} Menu structure
   */
  buildFallbackMenu(userLanguage) {
    return {
      body:
        this.getTranslatedContent(
          'messages.menus.main.welcome',
          userLanguage
        ) ||
        '🕉️ *Welcome to Astro Insights*\n\nDiscover your cosmic blueprint through ancient wisdom and modern astrology.',

      sections: [
        {
          titleKey: 'menu.section.astrology',
          title: '🔮 Astrology Services',
          rows: [
            {
              id: 'get_daily_horoscope',
              titleKey: 'menu.daily_horoscope',
              title: '☀️ Daily Horoscope',
              descriptionKey: 'menu.daily_description',
              description: 'Personal daily guidance'
            },
            {
              id: 'show_birth_chart',
              titleKey: 'menu.birth_chart',
              title: '📊 Birth Chart',
              descriptionKey: 'menu.chart_description',
              description: 'Your cosmic blueprint'
            },
            {
              id: 'get_tarot_reading',
              titleKey: 'menu.tarot',
              title: '🔮 Tarot Reading',
              descriptionKey: 'menu.tarot_description',
              description: 'Card-based insights'
            }
          ]
        },
        {
          titleKey: 'menu.section.divination',
          title: '✨ Divination Arts',
          rows: [
            {
              id: 'get_iching_reading',
              titleKey: 'menu.iching',
              title: '🪙 I Ching Oracle',
              descriptionKey: 'menu.iching_description',
              description: 'Ancient Chinese wisdom'
            },
            {
              id: 'get_palmistry_analysis',
              titleKey: 'menu.palmistry',
              title: '✋ Palmistry',
              descriptionKey: 'menu.palmistry_description',
              description: 'Hand reading analysis'
            },
            {
              id: 'show_relationships_groups_menu',
              titleKey: 'menu.relationships',
              title: '👥 Relationships & Groups',
              descriptionKey: 'menu.relationships_description',
              description: 'Compatibility & groups'
            }
          ]
        },
        {
          titleKey: 'menu.section.settings',
          title: '⚙️ Settings',
          rows: [
            {
              id: 'show_settings_profile_menu',
              titleKey: 'menu.settings',
              title: '👤 Profile & Settings',
              descriptionKey: 'menu.settings_description',
              description: 'Update your profile'
            },
            {
              id: 'show_language_settings_menu',
              titleKey: 'menu.language',
              title: '🌐 Language',
              descriptionKey: 'menu.language_description',
              description: 'Change language'
            },
            {
              id: 'show_help_support',
              titleKey: 'menu.help',
              title: '❓ Help & Support',
              descriptionKey: 'menu.help_description',
              description: 'Get assistance'
            }
          ]
        }
      ]
    };
  }

  /**
   * Send plain text menu as final fallback
   * @param {string} userLanguage - Language code
   */
  async sendPlainTextMenu(userLanguage) {
    const textMenu = this.buildTextMenu(userLanguage);
    await sendMessage(this.phoneNumber, textMenu, 'text');
  }

  /**
   * Build simple text-based menu
   * @param {string} userLanguage - Language code
   * @returns {string} Text menu
   */
  buildTextMenu(userLanguage) {
    return `🕉️ *Astro Insights - Main Menu*

${
  this.getTranslatedContent('messages.menus.main.welcome', userLanguage) ||
  'Discover your cosmic blueprint through ancient wisdom.'
}

*Available Services:*

1. ☀️ *Daily Horoscope* - Personal guidance for today
   Type: "horoscope" or "daily"

2. 📊 *Birth Chart* - Your complete astrological map
   Type: "chart" or "kundli"

3. 🔮 *Tarot Reading* - Card-based divination
   Type: "tarot"

4. 🪙 *I Ching Oracle* - Ancient Chinese wisdom
   Type: "iching" or "oracle"

5. ✋ *Palmistry* - Hand reading analysis
   Send a palm photo with caption "palm"

6. 👥 *Compatibility* - Relationship analysis
   Type: "compatibility" or "match"

*Settings:*
• 👤 *Profile* - Type "settings" or "profile"
• 🌐 *Language* - Type "language"
• ❓ *Help* - Type "help"

Choose a service by typing the name or number.
Type "menu" to see this menu again.`;
  }

  /**
   * Get translated content with fallback
   * @param {string} key - Translation key
   * @param {string} language - Language code
   * @returns {string} Translated content
   */
  getTranslatedContent(key, language) {
    try {
      // If translation service is available, use it
      if (typeof global.translationService !== 'undefined') {
        return (
          global.translationService.translate(key, language) ||
          this.getDefaultContent(key)
        );
      }
    } catch (error) {
      // Ignore translation errors
    }
    return this.getDefaultContent(key);
  }

  /**
   * Get default content for fallback
   * @param {string} key - Content key
   * @returns {string} Default content
   */
  getDefaultContent(key) {
    const defaults = {
      'messages.menus.main.welcome':
        '🕉️ *Welcome to Astro Insights*\n\nDiscover your cosmic blueprint through ancient wisdom and modern astrology.',
      'menu.section.astrology': '🔮 Astrology Services',
      'menu.daily_horoscope': '☀️ Daily Horoscope'
      // Add more defaults as needed
    };
    return defaults[key] || '';
  }

  /**
   * Handle execution errors
   * @param {Error} error - Execution error
   */
  async handleExecutionError(error) {
    const errorMessage =
      'Sorry, I couldn\'t display the main menu right now. Please try again by typing "menu".';
    await sendMessage(this.phoneNumber, errorMessage, 'text');
  }

  /**
   * Get action metadata for registration
   * @returns {Object} Action metadata
   */
  static getMetadata() {
    return {
      id: this.actionId,
      description: 'Display main navigation menu',
      keywords: ['menu', 'main menu', 'home', 'start'],
      category: 'navigation',
      subscriptionRequired: false,
      cooldown: 30000 // 30 seconds between requests
    };
  }
}

module.exports = ShowMainMenuAction;
