const logger = require('../../utils/logger');

/**
 * Registry for managing menu actions and keyword mappings in the astrology bot.
 * Implements the Command pattern for clean action dispatch and management.
 */
class ActionRegistry {
  constructor() {
    this.actions = new Map();          // actionName -> action instance
    this.keywordMappings = new Map();  // keyword -> actionName
    this.buttonMappings = new Map();   // buttonId -> actionName
    this.menuMappings = new Map();     // menuType -> actions array
    this.initialized = false;
  }

  /**
   * Register an action instance
   * @param {string} actionName - Unique action name
   * @param {Object} actionInstance - Action class instance
   */
  registerAction(actionName, actionInstance) {
    if (this.actions.has(actionName)) {
      logger.warn(`⚠️ Action '${actionName}' already registered, overwriting`);
    }

    this.actions.set(actionName, actionInstance);
    logger.info(`📝 Registered action: ${actionName}`);
  }

  /**
   * Map a keyword to an action
   * @param {string} keyword - Trigger keyword
   * @param {string} actionName - Target action name
   */
  registerKeyword(keyword, actionName) {
    if (!this.actions.has(actionName)) {
      logger.error(`❌ Cannot register keyword '${keyword}' for non-existent action '${actionName}'`);
      return;
    }

    // Store lowercase for case-insensitive matching
    this.keywordMappings.set(keyword.toLowerCase(), actionName);
    logger.info(`🔤 Registered keyword mapping: '${keyword}' → ${actionName}`);
  }

  /**
   * Map a button ID to an action
   * @param {string} buttonId - Button ID
   * @param {string} actionName - Target action name
   */
  registerButton(buttonId, actionName) {
    if (!this.actions.has(actionName)) {
      logger.error(`❌ Cannot register button '${buttonId}' for non-existent action '${actionName}'`);
      return;
    }

    this.buttonMappings.set(buttonId, actionName);
    logger.info(`🔘 Registered button mapping: '${buttonId}' → ${actionName}`);
  }

  /**
   * Get action instance by name
   * @param {string} actionName - Action name
   * @returns {Object|null} Action instance or null if not found
   */
  getAction(actionName) {
    const action = this.actions.get(actionName);
    if (!action) {
      logger.warn(`⚠️ Action '${actionName}' not found in registry`);
    }
    return action || null;
  }

  /**
   * Get action for keyword
   * @param {string} keyword - Trigger keyword (case-insensitive)
   * @returns {Object|null} Action instance or null if not found
   */
  getActionForKeyword(keyword) {
    const actionName = this.keywordMappings.get(keyword.toLowerCase());
    if (actionName) {
      return this.getAction(actionName);
    }
    return null;
  }

  /**
   * Get action for button ID
   * @param {string} buttonId - Button ID
   * @returns {Object|null} Action instance or null if not found
   */
  getActionForButton(buttonId) {
    const actionName = this.buttonMappings.get(buttonId);
    if (actionName) {
      return this.getAction(actionName);
    }
    return null;
  }

  /**
   * Check if keyword is registered
   * @param {string} keyword - Keyword to check
   * @returns {boolean} True if keyword exists
   */
  hasKeyword(keyword) {
    return this.keywordMappings.has(keyword.toLowerCase());
  }

  /**
   * Check if button ID is registered
   * @param {string} buttonId - Button ID to check
   * @returns {boolean} True if button ID exists
   */
  hasButton(buttonId) {
    return this.buttonMappings.has(buttonId);
  }

  /**
   * Get all registered actions
   * @returns {Array} Array of action names
   */
  getAllActionNames() {
    return Array.from(this.actions.keys());
  }

  /**
   * Get all registered keywords
   * @returns {Array} Array of keywords
   */
  getAllKeywords() {
    return Array.from(this.keywordMappings.keys());
  }

  /**
   * Initialize core actions (menu navigation, basic commands)
   * This is called to set up the basic action mappings
   */
  initializeCoreActions() {
    // Note: This method sets up mappings only.
    // Actual action instances will be registered separately.

    // Basic menu navigation actions
    this.menuMappings.set('main_menu', ['show_main_menu']);
    this.menuMappings.set('western_astrology', ['show_western_basic_menu', 'show_western_advanced_menu']);
    this.menuMappings.set('vedic_astrology', ['show_vedic_basic_menu', 'show_vedic_advanced_menu']);
    this.menuMappings.set('divination', ['show_divination_wisdom_menu']);

    logger.info('🎯 Core ActionRegistry mappings initialized');
  }

  /**
   * Execute action by name with user context
   * @param {string} actionName - Action name to execute
   * @param {Object} user - User object
   * @param {string} phoneNumber - Phone number
   * @param {Object} data - Additional data
   * @returns {Promise<Object|null>} Execution result
   */
  async executeAction(actionName, user, phoneNumber, data = {}) {
    const ActionClass = this.getAction(actionName);
    if (!ActionClass) {
      logger.warn(`⚠️ Cannot execute unknown action: ${actionName}`);
      return null;
    }

    try {
      logger.info(`🚀 Executing action: ${actionName} for ${phoneNumber}`);
      // Instantiate the action class with required parameters
      const actionInstance = new ActionClass(user, phoneNumber, data);
      const result = await actionInstance.execute();
      actionInstance.logExecution(result);
      return result;
    } catch (error) {
      logger.error(`❌ Error executing action ${actionName}:`, error);
      throw error;
    }
  }

  /**
   * Get registry statistics
   * @returns {Object} Statistics object
   */
  getStats() {
    return {
      totalActions: this.actions.size,
      totalKeywords: this.keywordMappings.size,
      totalButtons: this.buttonMappings.size,
      totalMenus: this.menuMappings.size,
      initialized: this.initialized
    };
  }

  /**
   * Clear all mappings (for testing/reset)
   */
  clear() {
    this.actions.clear();
    this.keywordMappings.clear();
    this.buttonMappings.clear();
    this.menuMappings.clear();
    this.initialized = false;
    logger.info('🧹 ActionRegistry cleared');
  }

  /**
   * Validate registry state
   * @returns {Object} Validation result
   */
  validate() {
    const result = { isValid: true, errors: [] };

    // Check for orphaned keyword mappings
    for (const [keyword, actionName] of this.keywordMappings) {
      if (!this.actions.has(actionName)) {
        result.errors.push(`Keyword '${keyword}' maps to non-existent action '${actionName}'`);
        result.isValid = false;
      }
    }

    // Check for orphaned button mappings
    for (const [buttonId, actionName] of this.buttonMappings) {
      if (!this.actions.has(actionName)) {
        result.errors.push(`Button '${buttonId}' maps to non-existent action '${actionName}'`);
        result.isValid = false;
      }
    }

    // Check for actions with missing properites
    for (const [actionName, ActionClass] of this.actions) {
      if (!ActionClass || typeof ActionClass !== 'function') {
        result.errors.push(`Action '${actionName}' is not a valid class`);
        result.isValid = false;
      }
    }

    result.errorMessage = result.errors.join('; ');
    return result;
  }
}

module.exports = ActionRegistry;