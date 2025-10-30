const BaseAction = require('../BaseAction');
const { getTranslatedMenu } = require('../../../conversation/menuLoader');
const { ResponseBuilder } = require('../../utils/ResponseBuilder');

/**
 * Generic Submenu Action - Displays submenu navigation menus.
 * Dynamically loads and displays submenu content based on actionId.
 */
class GenericSubmenuAction extends BaseAction {
  /**
   * Get action identifier - will be overridden by subclasses
   */
  static get actionId() {
    return 'generic_submenu';
  }

  /**
   * Execute the submenu action
   * @returns {Promise<Object|null>} Action result
   */
  async execute() {
    try {
      this.logExecution('start', `Showing submenu: ${this.constructor.actionId}`);

      // Get the translated submenu based on actionId
      const menuData = await this.getSubmenuData();
      if (!menuData) {
        await this.handleMenuLoadError();
        return { success: false, reason: 'menu_not_found' };
      }

      // Build and send the menu response
      const response = ResponseBuilder.buildInteractiveListMessage(
        this.phoneNumber,
        menuData.body,
        menuData.button,
        menuData.sections,
        this.constructor.actionId,
        this.user.preferredLanguage || 'en'
      );

      await this.sendMessage(response.to, response.interactive, 'interactive');

      this.logExecution('complete', `Submenu ${this.constructor.actionId} displayed successfully`);
      return {
        success: true,
        type: 'submenu_display',
        menu: this.constructor.actionId
      };
    } catch (error) {
      this.logger.error(`Error in ${this.constructor.actionId}:`, error);
      await this.handleExecutionError(error);
      return { success: false, reason: 'execution_error', error: error.message };
    }
  }

  /**
   * Get submenu data based on actionId
   * @returns {Promise<Object|null>} Menu data or null
   */
  async getSubmenuData() {
    try {
      // The actionId should match the menu config key
      const menuKey = this.constructor.actionId;
      return await getTranslatedMenu(menuKey, this.user.preferredLanguage || 'en');
    } catch (error) {
      this.logger.error(`Error loading submenu ${this.constructor.actionId}:`, error);
      return null;
    }
  }

  /**
   * Handle menu load errors
   */
  async handleMenuLoadError() {
    const errorMessage = await this.translate('errors.menu_not_found', this.user.preferredLanguage || 'en', {
      menu: this.constructor.actionId
    });
    await this.sendMessage(this.phoneNumber, errorMessage, 'text');
  }

  /**
   * Handle execution errors
   * @param {Error} error - Execution error
   */
  async handleExecutionError(error) {
    const errorMessage = await this.translate('errors.submenu_execution_error', this.user.preferredLanguage || 'en', {
      menu: this.constructor.actionId
    });
    await this.sendMessage(this.phoneNumber, errorMessage, 'text');
  }
}

module.exports = GenericSubmenuAction;
