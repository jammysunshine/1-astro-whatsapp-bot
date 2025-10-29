const BaseAction = require('../BaseAction');
const { getTranslatedMenu } = require('../../../../conversation/menuLoader');
const { ResponseBuilder } = require('../../utils/ResponseBuilder');

/**
 * WesternAstrologyMenuAction - Displays the Western astrology menu.
 * Provides access to Western astrology services and readings.
 */
class WesternAstrologyMenuAction extends BaseAction {
  /**
   * Unique action identifier
   */
  static get actionId() {
    return 'show_western_astrology_menu';
  }

  /**
   * Execute the show western astrology menu action
   * @returns {Promise<Object|null>} Action result
   */
  async execute() {
    try {
      this.logExecution('start', 'Showing Western astrology menu');

      // Get the translated western astrology menu
      const menuData = await this.getWesternAstrologyMenuData();
      if (!menuData) {
        await this.handleMenuLoadError();
        return { success: false, reason: 'menu_not_found' };
      }

      // Send the western astrology menu to user
      await this.sendWesternAstrologyMenu(menuData);

      this.logExecution('complete', 'Western astrology menu sent successfully');
      return {
        success: true,
        menuType: 'western_astrology',
        sections: menuData.sections?.length || 0,
        totalItems: this.countMenuItems(menuData)
      };

    } catch (error) {
      this.logger.error('Error in WesternAstrologyMenuAction:', error);
      await this.handleExecutionError(error);
      return { success: false, reason: 'execution_error', error: error.message };
    }
  }

  /**
   * Get western astrology menu data for the user's language
   * @returns {Promise<Object|null>} Menu data or null if not found
   */
  async getWesternAstrologyMenuData() {
    try {
      const userLanguage = this.getUserLanguage();
      return await getTranslatedMenu('western_astrology_menu', userLanguage);
    } catch (error) {
      this.logger.error('Error loading western astrology menu:', error);
      return null;
    }
  }

  /**
   * Send the western astrology menu to the user
   * @param {Object} menuData - Menu configuration
   */
  async sendWesternAstrologyMenu(menuData) {
    try {
      // Use ResponseBuilder to send interactive list message
      const message = ResponseBuilder.buildInteractiveMessage(
        this.phoneNumber,
        'list',
        menuData.body,
        {
          button: menuData.button,
          sections: menuData.sections,
          language: this.getUserLanguage()
        }
      );

      await this.sendMessage(message, 'interactive');
    } catch (error) {
      this.logger.error('Error sending western astrology menu:', error);
      // Fallback to simple text message
      await this.sendMessage(menuData.body, 'text');
    }
  }

  /**
   * Count total menu items across all sections
   * @param {Object} menuData - Menu configuration
   * @returns {number} Total number of menu items
   */
  countMenuItems(menuData) {
    if (!menuData.sections) return 0;

    return menuData.sections.reduce((total, section) => {
      return total + (section.rows ? section.rows.length : 0);
    }, 0);
  }

  /**
   * Handle menu loading error
   */
  async handleMenuLoadError() {
    const errorMessage = 'Sorry, I couldn\'t load the Western Astrology menu right now. Please try again in a moment.';
    await this.sendMessage(errorMessage, 'text');
  }

  /**
   * Handle execution errors
   * @param {Error} error - Execution error
   */
  async handleExecutionError(error) {
    const errorMessage = 'I encountered an error displaying the Western Astrology menu. Please try again.';
    await this.sendMessage(errorMessage, 'text');
  }

  /**
   * Get action metadata for registration
   * @returns {Object} Action metadata
   */
  static getMetadata() {
    return {
      id: this.actionId,
      description: 'Display the Western Astrology services menu',
      keywords: ['western', 'western astrology', 'modern astrology', 'natal chart'],
      category: 'menu',
      subscriptionRequired: false,
      cooldown: 0 // No cooldown for menu navigation
    };
  }
}

module.exports = WesternAstrologyMenuAction;