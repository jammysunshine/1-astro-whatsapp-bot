const fs = require('fs');
const path = require('path');
const logger = require('../../utils/logger');

const MENU_CONFIG_PATH = path.join(__dirname, 'menuConfig.json');
let menuConfigurations = {};

/**
 * Loads menu configurations from menuConfig.json.
 */
const loadMenus = () => {
  try {
    const data = fs.readFileSync(MENU_CONFIG_PATH, 'utf8');
    menuConfigurations = JSON.parse(data);
    logger.info('✅ Menu configurations loaded successfully.');
  } catch (error) {
    logger.error(`❌ Error loading menu configurations from ${MENU_CONFIG_PATH}:`, error);
    // Exit the process or throw an error if critical configuration cannot be loaded
    process.exit(1); 
  }
};

/**
 * Retrieves a specific menu configuration by its ID.
 * @param {string} menuId - The ID of the menu (e.g., 'main_menu').
 * @returns {Object|undefined} The menu configuration object, or undefined if not found.
 */
const getMenu = (menuId) => {
  return menuConfigurations[menuId];
};

// Load menus immediately when the module is imported
loadMenus();

module.exports = {
  loadMenus,
  getMenu,
};