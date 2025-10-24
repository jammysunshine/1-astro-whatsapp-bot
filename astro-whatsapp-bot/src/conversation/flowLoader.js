const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

const FLOW_CONFIG_PATH = path.join(__dirname, 'flowConfig.json');
let conversationFlows = {};

/**
 * Loads conversation flow configurations from flowConfig.json.
 */
const loadFlows = () => {
  try {
    const data = fs.readFileSync(FLOW_CONFIG_PATH, 'utf8');
    conversationFlows = JSON.parse(data);
    logger.info('✅ Conversation flows loaded successfully.');
  } catch (error) {
    logger.error(`❌ Error loading conversation flows from ${FLOW_CONFIG_PATH}:`, error);
    // Exit the process or throw an error if critical configuration cannot be loaded
    process.exit(1);
  }
};

/**
 * Retrieves a specific conversation flow by its ID.
 * @param {string} flowId - The ID of the conversation flow (e.g., 'onboarding').
 * @returns {Object|undefined} The conversation flow object, or undefined if not found.
 */
const getFlow = flowId => conversationFlows[flowId];

// Load flows immediately when the module is imported
loadFlows();

module.exports = {
  loadFlows,
  getFlow
};
