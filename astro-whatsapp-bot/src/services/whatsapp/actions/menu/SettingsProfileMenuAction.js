const GenericSubmenuAction = require('./GenericSubmenuAction');

/**
 * Settings & Profile Menu Action - Displays settings and profile management options.
 * Allows users to update language preferences, view profiles, and manage settings.
 */
class SettingsProfileMenuAction extends GenericSubmenuAction {
  /**
   * Unique action identifier
   */
  static get actionId() {
    return 'show_settings_profile_menu';
  }
}

module.exports = SettingsProfileMenuAction;