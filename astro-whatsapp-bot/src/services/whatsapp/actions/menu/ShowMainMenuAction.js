const BaseAction = require('../BaseAction');
const { getTranslatedMenu } = require('../../../../conversation/menuLoader');
const { ResponseBuilder } = require('../../utils/ResponseBuilder');

/**
 * ShowMainMenuAction - Displays the main navigation menu.
 * Provides access to all major sections of the astrology bot.
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

      // Get the translated main menu
      const menuData = await this.getMainMenuData();
      if (!menuData) {
        await this.handleMenuLoadError();
        return { success: false, reason: 'menu_not_found' };
      }

      // Send the main menu to user
      await this.sendMainMenu(menuData);

      this.logExecution('complete', 'Main menu sent successfully');
      return {
        success: true,
        menuType: 'main',
        buttons: menuData.buttons?.length || 0
      };

    } catch (error) {
      this.logger.error('Error in ShowMainMenuAction:', error);
      await this.handleExecutionError(error);
      return { success: false, reason: 'execution_error', error: error.message };
    }
  }

  /**
   * Get main menu data for the user's language
   * @returns {Promise<Object|null>} Menu data or null if not found
   */
  async getMainMenuData() {
    try {
      const userLanguage = this.getUserLanguage();
      return await getTranslatedMenu('main_menu', userLanguage);
    } catch (error) {
      this.logger.error('Error loading main menu:', error);
      return null;
    }
  }

  /**
   * Send the main menu to the user
   * @param {Object} menuData - Menu configuration
   */
  async sendMainMenu(menuData) {
    try {
      // Use ResponseBuilder to send interactive message
      const message = ResponseBuilder.buildInteractiveMessage(
        this.phoneNumber,
        'button',
        menuData.body,
        {
          buttons: menuData.buttons,
          language: this.getUserLanguage()
        }
      );

      await this.sendMessage(message, 'interactive');
    } catch (error) {
      this.logger.error('Error sending main menu:', error);
      // Fallback to simple text message
      await this.sendMessage(menuData.body, 'text');
    }
  }

  /**
   * Handle menu loading error
   */
  async handleMenuLoadError() {
    const errorMessage = 'Sorry, I couldn\'t load the main menu right now. Please try again in a moment.';
    await this.sendMessage(errorMessage, 'text');
  }

  /**
   * Handle execution errors
   * @param {Error} error - Execution error
   */
  async handleExecutionError(error) {
    const errorMessage = 'I encountered an error displaying the menu. Please try typing "menu" again.';
    await this.sendMessage(errorMessage, 'text');
  }

  /**
   * Get action metadata for registration
   * @returns {Object} Action metadata
   */
  static getMetadata() {
    return {
      id: this.actionId,
      description: 'Display the main navigation menu',
      keywords: ['menu', 'main', 'home', 'start'],
      category: 'menu',
      subscriptionRequired: false,
      cooldown: 0 // No cooldown for menu navigation
    };
  }
}

module.exports = ShowMainMenuAction;