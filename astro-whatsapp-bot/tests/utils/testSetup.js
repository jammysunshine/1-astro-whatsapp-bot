const AstrologyEngine = require('../../src/services/astrology/astrologyEngine');

/**
 * Test Database Manager - Mock database operations for testing
 */
class TestDatabaseManager {
  constructor() {
    this.users = new Map();
    this.conversations = new Map();
  }

  /**
   * Reset all test data
   */
  reset() {
    this.users.clear();
    this.conversations.clear();
  }

  /**
   * Save user data
   */
  async saveUser(userId, userData) {
    this.users.set(userId, { ...userData, _id: userId });
    return this.users.get(userId);
  }

  /**
   * Get user by ID
   */
  async getUser(userId) {
    return this.users.get(userId) || null;
  }

  /**
   * Save conversation
   */
  async saveConversation(conversationId, conversationData) {
    this.conversations.set(conversationId, { ...conversationData, _id: conversationId });
    return this.conversations.get(conversationId);
  }

  /**
   * Get conversation by ID
   */
  async getConversation(conversationId) {
    return this.conversations.get(conversationId) || null;
  }

  /**
   * Get WhatsApp integration mock
   */
  getWhatsAppIntegration() {
    return {
      sendMessage: jest.fn(),
      sendInteractiveButtons: jest.fn(),
      sendListMessage: jest.fn(),
      markMessageAsRead: jest.fn()
    };
  }
}

/**
 * Get test database manager instance
 */
function getTestDatabaseManager() {
  return new TestDatabaseManager();
}

/**
 * Get WhatsApp integration mock
 */
function getWhatsAppIntegration() {
  return new TestDatabaseManager().getWhatsAppIntegration();
}

/**
 * Setup test environment
 */
function setupTestEnvironment() {
  const dbManager = new TestDatabaseManager();

  // Mock database operations
  jest.mock('../../src/database/databaseManager', () => ({
    saveUser: dbManager.saveUser.bind(dbManager),
    getUser: dbManager.getUser.bind(dbManager),
    saveConversation: dbManager.saveConversation.bind(dbManager),
    getConversation: dbManager.getConversation.bind(dbManager)
  }));

  // Mock WhatsApp integration if needed
  jest.mock('../../src/services/whatsapp/WhatsAppService', () => ({
    sendMessage: jest.fn(),
    sendInteractiveButtons: jest.fn(),
    sendListMessage: jest.fn(),
    markMessageAsRead: jest.fn()
  }));

  return dbManager;
}

/**
 * Create test astrology engine
 */
async function createTestAstrologyEngine() {
  const engine = new AstrologyEngine();
  await engine.initialize();
  return engine;
}

module.exports = {
  TestDatabaseManager,
  getTestDatabaseManager,
  getWhatsAppIntegration,
  setupTestEnvironment,
  createTestAstrologyEngine
};