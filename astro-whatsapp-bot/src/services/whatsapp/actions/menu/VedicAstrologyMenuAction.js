const BaseAction = require('../BaseAction');
const { getTranslatedMenu } = require('../../../../conversation/menuLoader');
const { ResponseBuilder } = require('../../utils/ResponseBuilder');

/**
 * VedicAstrologyMenuAction - Displays the Vedic astrology menu.
 * Provides access to Vedic/Jyotish astrology services and readings.
 */
class VedicAstrologyMenuAction extends BaseAction {
  /**
   * Unique action identifier
   */
  static get actionId() {
    return 'show_vedic_astrology_menu';
  }

  /**
   * Execute the show vedic astrology menu action
   * @returns {Promise<Object|null>} Action result
   */
  async execute() {
    try {
      this.logExecution('start', 'Showing Vedic astrology menu');

      // Get the translated vedic astrology menu
      const menuData = await this.getVedicAstrologyMenuData();
      if (!menuData) {
        await this.handleMenuLoadError();
        return { success: false, reason: 'menu_not_found' };
      }

      // Send the vedic astrology menu to user
      await this.sendVedicAstrologyMenu(menuData);

      this.logExecution('complete', 'Vedic astrology menu sent successfully');
      return {
        success: true,
        menuType: 'vedic_astrology',
        sections: menuData.sections?.length || 0,
        totalItems: this.countMenuItems(menuData)
      };
    } catch (error) {
      this.logger.error('Error in VedicAstrologyMenuAction:', error);
      await this.handleExecutionError(error);
      return { success: false, reason: 'execution_error', error: error.message };
    }
  }

  /**
   * Get vedic astrology menu data for the user's language
   * @returns {Promise<Object|null>} Menu data or null if not found
   */
  async getVedicAstrologyMenuData() {
    try {
      const userLanguage = this.getUserLanguage();
      return await getTranslatedMenu('vedic_astrology_menu', userLanguage);
    } catch (error) {
      this.logger.error('Error loading vedic astrology menu:', error);
      return null;
    }
  }

  /**
   * Send the vedic astrology menu to the user
   * @param {Object} menuData - Menu configuration
   */
  async sendVedicAstrologyMenu(menuData) {
    try {
      // Update user session with current menu for numbered fallbacks
      await this.updateUserSessionMenu('vedic_astrology_menu');

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

      // Also send numbered fallback instructions
      const fallbackText = '\n\n📱 If the menu above doesn\'t work, reply with a number:\n1-14 for services, 15 to go back.';
      await this.sendMessage(fallbackText, 'text');
    } catch (error) {
      this.logger.error('Error sending vedic astrology menu:', error);
      // Fallback to numbered text menu
      const numberedMenuText = this.generateNumberedMenuText(menuData);
      await this.sendMessage(numberedMenuText, 'text');
    }
  }

  /**
   * Update user's session with current menu type
   * @param {string} menuType - Type of menu being displayed
   */
  async updateUserSessionMenu(menuType) {
    try {
      const { updateUserProfile } = require('../../../../models/userModel');
      await updateUserProfile(this.phoneNumber, { lastMenu: menuType });
    } catch (error) {
      this.logger.error('Error updating user session menu:', error);
    }
  }

  /**
   * Generate numbered menu text fallback
   * @param {Object} menuData - Menu configuration
   * @returns {string} Numbered text menu
   */
  generateNumberedMenuText(menuData) {
    let menuText = '🕉️ *Vedic Astrology Services*\n\nChoose by replying with a number:\n\n';

    let itemCount = 1;
    if (menuData.sections) {
      menuData.sections.forEach(section => {
        if (section.rows) {
          section.rows.forEach(row => {
            menuText += `${itemCount}. ${row.title} - ${row.description}\n`;
            itemCount++;
          });
        }
      });
    }

    menuText += '\n\nJust reply with the number of your choice! 🔢';
    return menuText;
  }

  /**
   * Count total menu items across all sections
   * @param {Object} menuData - Menu configuration
   * @returns {number} Total number of menu items
   */
  countMenuItems(menuData) {
    if (!menuData.sections) { return 0; }

    return menuData.sections.reduce((total, section) => total + (section.rows ? section.rows.length : 0), 0);
  }

  /**
   * Handle menu loading error
   */
  async handleMenuLoadError() {
    const errorMessage = 'Sorry, I couldn\'t load the Vedic Astrology menu right now. Please try again in a moment.';
    await this.sendMessage(errorMessage, 'text');
  }

  /**
   * Handle execution errors
   * @param {Error} error - Execution error
   */
  async handleExecutionError(error) {
    const errorMessage = 'I encountered an error displaying the Vedic Astrology menu. Please try again.';
    await this.sendMessage(errorMessage, 'text');
  }

  /**
   * Get action metadata for registration
   * @returns {Object} Action metadata
   */
  static getMetadata() {
    return {
      id: this.actionId,
      description: 'Display the Vedic/Jyotish Astrology services menu',
      keywords: ['vedic', 'jyotish', 'kundli', 'indian astrology', 'vedic astrology'],
      category: 'menu',
      subscriptionRequired: false,
      cooldown: 0 // No cooldown for menu navigation
    };
  }
}

module.exports = VedicAstrologyMenuAction;
