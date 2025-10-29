const fs = require('fs');
const path = require('path');
const TranslationService = require('../services/i18n/TranslationService');
const logger = require('../utils/logger');

const MENU_CONFIG_PATH = path.join(__dirname, 'menuConfig.json');
let menuConfigurations = {};
const userLanguageCache = new Map(); // Cache for translated menus

/**
 * Loads base menu configurations from menuConfig.json.
 * These contain translation keys, not final text.
 */
const loadMenus = () => {
  try {
    const data = fs.readFileSync(MENU_CONFIG_PATH, 'utf8');
    menuConfigurations = JSON.parse(data);
    logger.info('✅ Menu configurations loaded successfully.');
  } catch (error) {
    logger.error(
      `❌ Error loading menu configurations from ${MENU_CONFIG_PATH}:`,
      error
    );
    // Exit the process if critical configuration cannot be loaded
    process.exit(1);
  }
};

/**
 * Retrieves and translates a specific menu configuration by its ID.
 * @param {string} menuId - The ID of the menu (e.g., 'main_menu').
 * @param {string} languageCode - The user's language code (e.g., 'ar', 'hi').
 * @returns {Object|undefined} The translated menu configuration object.
 */
const getTranslatedMenu = async(menuId, languageCode = 'en') => {
  try {
    // Generate cache key
    const cacheKey = `${menuId}_${languageCode}`;

    // Check cache first
    if (userLanguageCache.has(cacheKey)) {
      return userLanguageCache.get(cacheKey);
    }

    // Get base menu configuration
    const baseMenu = menuConfigurations[menuId];
    if (!baseMenu) {
      logger.warn(`Menu not found: ${menuId}`);
      return undefined;
    }

    // Deep clone to avoid modifying original
    const translatedMenu = JSON.parse(JSON.stringify(baseMenu));

    // Translate all translatable fields
    await translateMenuFields(translatedMenu, languageCode);

    // Cache the translated menu
    userLanguageCache.set(cacheKey, translatedMenu);

    // Limit cache size
    if (userLanguageCache.size > 50) {
      const firstKey = userLanguageCache.keys().next().value;
      userLanguageCache.delete(firstKey);
    }

    return translatedMenu;
  } catch (error) {
    logger.error(`Error getting translated menu ${menuId}:`, error);
    // Fallback to base menu
    return menuConfigurations[menuId];
  }
};

/**
 * Recursively translates all translatable fields in a menu object.
 * @param {Object} menu - The menu object to translate.
 * @param {string} languageCode - Language code.
 */
const translateMenuFields = async(menu, languageCode) => {
  if (typeof menu !== 'object' || menu === null) {
    return;
  }

  for (const key in menu) {
    if (menu.hasOwnProperty(key)) {
      const value = menu[key];

      // Check if this field is translatable (contains translation keys)
      if (typeof value === 'string' && value.startsWith('translation:')) {
        // Extract translation key (e.g., "translation:messages.welcome.greeting")
        const translationKey = value.substring(12); // Remove "translation:" prefix
        try {
          const translatedValue = await TranslationService.translate(translationKey, languageCode);
          menu[key] = translatedValue;
        } catch (error) {
          logger.warn(`Translation failed for key ${translationKey}: ${error.message}`);
          // Keep original value as fallback
        }
      } else if (value && typeof value === 'object') {
        // Recursively process nested objects
        await translateMenuFields(value, languageCode);
      }
    }
  }
};

/**
 * Clears the translation cache (useful for development/testing).
 */
const clearTranslationCache = () => {
  userLanguageCache.clear();
  logger.info('Menu translation cache cleared');
};

/**
 * Retrieves the base (untranslated) menu configuration.
 * @param {string} menuId - The ID of the menu.
 * @returns {Object|undefined} The base menu configuration.
 */
const getMenu = menuId => menuConfigurations[menuId];

/**
 * Gets cache statistics for monitoring.
 * @returns {Object} Cache statistics.
 */
const getCacheStats = () => ({
  baseMenusLoaded: Object.keys(menuConfigurations).length,
  cachedMenus: userLanguageCache.size,
  supportedLanguages: TranslationService.getSupportedLanguages().length
});

// Load menus immediately when the module is imported
loadMenus();

module.exports = {
  loadMenus,
  getMenu,
  getTranslatedMenu,
  clearTranslationCache,
  getCacheStats
};
