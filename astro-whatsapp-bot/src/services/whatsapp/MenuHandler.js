const logger = require('../../utils/logger');

// Simple in-memory store for numbered menu mappings (in production, use Redis/DB)
const numberedMenuMappings = new Map();

/**
 * MenuHandler - WhatsApp menu fallback and mapping management
 * Handles numbered menu fallbacks and action ID mapping
 */
class MenuHandler {
  constructor() {
    this.logger = logger;
  }

  /**
   * Create numbered fallback menu when interactive list fails
   * @param {Object} message - Original interactive message object
   * @param {string} phoneNumber - User's phone number
   * @returns {string} Numbered menu text
   */
  createNumberedMenuFallback(message, phoneNumber) {
    const sections = message.sections || [];

    // Store mappings first
    if (!numberedMenuMappings.has(phoneNumber)) {
      numberedMenuMappings.set(phoneNumber, {});
    }

    let menuText = '📋 *Menu Options:*\n\n';

    // Add the main menu body if available
    if (message.body?.text) {
      menuText = `${message.body.text}\n\n${menuText}`;
    } else if (typeof message.body === 'string') {
      menuText = `${message.body}\n\n${menuText}`;
    }

    const menuMappings = {};
    let currentIndex = 1;

    // Process each section
    sections.forEach(section => {
      if (section.title) {
        menuText += `_${section.title}_\n`;
      }

      section.rows?.forEach(row => {
        const cleanTitle = this._sanitizeTitle(row.title || row.id);
        menuText += `${currentIndex}. ${cleanTitle}`;
        if (row.description && row.description.trim()) {
          menuText += `\n    ${row.description}`;
        }
        menuText += '\n\n';

        // Map number to action ID
        menuMappings[currentIndex.toString()] =
          row.id || row.title.toLowerCase();

        // Also map the clean title for flexibility
        const titleKey = cleanTitle.toLowerCase().trim();
        if (titleKey && titleKey !== row.title?.toLowerCase()) {
          menuMappings[titleKey] = row.id || row.title.toLowerCase();
        }

        currentIndex++;
      });
    });

    // Store mappings
    numberedMenuMappings.set(phoneNumber, menuMappings);
    this.logger.info(
      `🔢 Stored ${Object.keys(menuMappings).length} menu mappings for ${phoneNumber}`
    );

    menuText +=
      '\n💡 *How to use:*\n• Type a number (1, 2, 3, etc.) to select\n• Or type the option name\n• Or type "menu" to see options again';

    return menuText;
  }

  /**
   * Find action ID from numbered input or text match
   * @param {string} phoneNumber - User's phone number
   * @param {string} userInput - User's text input
   * @returns {string|null} Action ID or null if not found
   */
  getNumberedMenuAction(phoneNumber, userInput) {
    const userMappings = numberedMenuMappings.get(phoneNumber);
    if (!userMappings) {
      this.logger.debug(`No menu mappings found for ${phoneNumber}`);
      return null;
    }

    const cleanInput = userInput.trim().toLowerCase();

    // Check direct number mappings
    if (userMappings[cleanInput]) {
      this.logger.info(
        `📌 Found numbered menu action: ${userMappings[cleanInput]} for input: ${userInput}`
      );
      return userMappings[cleanInput];
    }

    // Remove prefixes like numbers for partial matches
    const cleanedInput = cleanInput.replace(/^[\d\.•\-*]+/, '').trim();
    if (cleanedInput !== cleanInput && userMappings[cleanedInput]) {
      this.logger.info(
        `📌 Found cleaned menu action: ${userMappings[cleanedInput]} for input: ${userInput}`
      );
      return userMappings[cleanedInput];
    }

    // Try partial matches for text input
    for (const [key, value] of Object.entries(userMappings)) {
      if (!/^\d+$/.test(key) && this._matchWords(cleanedInput, key)) {
        this.logger.info(
          `📌 Found partial match: ${value} for input: ${userInput} (matched: ${key})`
        );
        return value;
      }
    }

    this.logger.debug(
      `No menu action found for ${phoneNumber} input: ${userInput}`
    );
    return null;
  }

  /**
   * Clear numbered menu mappings for a user
   * @param {string} phoneNumber - User's phone number
   * @returns {boolean} True if mappings were cleared
   */
  clearNumberedMenuMappings(phoneNumber) {
    const hadMappings = numberedMenuMappings.has(phoneNumber);
    numberedMenuMappings.delete(phoneNumber);

    if (hadMappings) {
      this.logger.info(`🗑️ Cleared menu mappings for ${phoneNumber}`);
    }

    return hadMappings;
  }

  /**
   * Get menu statistics for a user
   * @param {string} phoneNumber - User's phone number
   * @returns {Object} Menu statistics
   */
  getMenuStats(phoneNumber) {
    const mappings = numberedMenuMappings.get(phoneNumber);

    return {
      hasMappings: !!mappings,
      mappingCount: mappings ? Object.keys(mappings).length : 0,
      lastActivity: new Date().toISOString()
    };
  }

  /**
   * Get all active menu mappings (admin/stats function)
   * @returns {Object} All active menu mappings by phone number
   */
  getAllActiveMenus() {
    const activeMenus = {};

    for (const [phoneNumber, mappings] of numberedMenuMappings.entries()) {
      activeMenus[phoneNumber] = {
        mappings,
        count: Object.keys(mappings).length
      };
    }

    return {
      activeMenus,
      totalActiveUsers: numberedMenuMappings.size,
      totalMappings: Array.from(numberedMenuMappings.values()).reduce(
        (total, mappings) => total + Object.keys(mappings).length,
        0
      )
    };
  }

  /**
   * Clear all expired/old menu mappings
   * @param {number} maxAgeHours - Maximum age in hours (default: 24)
   * @returns {number} Number of mappings cleared
   */
  clearExpiredMappings(maxAgeHours = 24) {
    // In a real system, we'd track timestamps for each mapping
    // For now, this is a placeholder for future implementation
    this.logger.info(
      `🧹 Menu cleanup requested - would clean mappings older than ${maxAgeHours} hours`
    );

    // Simple implementation: for large numbers, do periodic cleanup
    if (numberedMenuMappings.size > 100) {
      numberedMenuMappings.clear();
      this.logger.info('🧹 Cleared all menu mappings due to high volume');
      return numberedMenuMappings.size;
    }

    return 0;
  }

  /**
   * Sanitize menu title for display
   * @private
   * @param {string} title - Raw title
   * @returns {string} Sanitized title
   */
  _sanitizeTitle(title) {
    if (!title) {
      return 'Option';
    }

    // Remove emoji for cleaner text (keep numbers/symbols)
    return title.replace(/([^\w\s\d\-])/g, '').trim() || title;
  }

  /**
   * Match words in input against key with flexible matching
   * @private
   * @param {string} input - User input
   * @param {string} key - Menu key
   * @returns {boolean} True if words match
   */
  _matchWords(input, key) {
    if (!input || !key) {
      return false;
    }

    // Split into words and check if input words are contained in key
    const inputWords = input
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 0);
    const keyLower = key.toLowerCase();

    // At least one word from input should match the key
    return inputWords.some(word => keyLower.includes(word));
  }

  /**
   * Health check for MenuHandler
   * @returns {Object} Health status
   */
  healthCheck() {
    try {
      const activeMappings = Array.from(numberedMenuMappings.values()).reduce(
        (total, mappings) => total + Object.keys(mappings).length,
        0
      );

      return {
        healthy: true,
        activeUsers: numberedMenuMappings.size,
        totalMappings: activeMappings,
        memoryUsage: `${(activeMappings * 0.1).toFixed(2)} KB estimated`,
        version: '1.0.0',
        features: ['Numbered Menus', 'Fallback Handling', 'Input Matching'],
        status: 'Operational'
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = { MenuHandler };
