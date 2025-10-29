const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');
const { createUser, getUserByPhone } = require('../../src/models/userModel');
const WhatsAppService = require('../../src/services/whatsapp/whatsappService');
require('dotenv').config();

class TestDatabaseManager {
  constructor() {
    this.mongoClient = null;
    this.db = null;
    this.connection = null;
  }

  async setup() {
    // Connect to real MongoDB Atlas (required for real calculations)
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable required for testing');
    }

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 50
    });

    this.mongoClient = new MongoClient(mongoUri);
    await this.mongoClient.connect();
    this.db = this.mongoClient.db('test_whatsup_astrology');
  }

  async teardown() {
    if (this.db) {
      await this.db.dropDatabase();
    }
    if (this.mongoClient) {
      await this.mongoClient.close();
    }
    await mongoose.connection.close();
  }

  async cleanupUser(phoneNumber) {
    if (this.db) {
      await this.db.collection('users').deleteMany({ phoneNumber });
      await this.db.collection('sessions').deleteMany({ phoneNumber });
      await this.db.collection('readings').deleteMany({ phoneNumber });
    }
  }

  async createTestUser(phoneNumber, profileData = {}) {
    return await createUser(phoneNumber, {
      name: profileData.name || 'Test User',
      birthDate: profileData.birthDate || '15061990',
      birthTime: profileData.birthTime || '1430',
      birthPlace: profileData.birthPlace || 'Mumbai, India',
      ...profileData
    });
  }
}

// Real API integration setup (no mocks)
class RealWhatsAppIntegration {
  constructor() {
    this.whatsAppService = new WhatsAppService();
    this.testNumbers = [
      '+1234567890', // Staging number
      '+1987654321', // Test number
      '+1555123456' // Development number
    ];
    this.sentMessages = [];
  }

  async sendMessage(phoneNumber, message, type = 'text') {
    // Use real WhatsApp Business API
    try {
      console.log(`📤 Sending real WhatsApp message to ${phoneNumber}:`, typeof message === 'string' ? message.substring(0, 100) : 'Structured message');

      // Only send to test numbers to avoid spam/costs
      if (this.testNumbers.includes(phoneNumber)) {
        const response = await this.whatsAppService.sendMessage(phoneNumber, message, type);
        this.sentMessages.push({
          phoneNumber,
          message,
          type,
          timestamp: new Date(),
          status: 'sent',
          response
        });
        return response;
      } else {
        console.warn(`⚠️  Skipping real WhatsApp send to non-test number: ${phoneNumber}`);
        this.sentMessages.push({
          phoneNumber,
          message,
          type,
          timestamp: new Date(),
          status: 'skipped',
          reason: 'Non-test number'
        });
        return { simulated: true };
      }
    } catch (error) {
      console.error('❌ Real WhatsApp API error:', error.message);
      this.sentMessages.push({
        phoneNumber,
        message,
        type,
        timestamp: new Date(),
        status: 'error',
        error: error.message
      });
      throw error;
    }
  }

  getSentMessages(phoneNumber = null) {
    return phoneNumber ? this.sentMessages.filter(m => m.phoneNumber === phoneNumber) : this.sentMessages;
  }

  clearMessages() {
    this.sentMessages = [];
  }
}

// Mock setup function (for unit tests)
function setupWhatsAppMocks() {
  jest.mock('../../src/services/whatsapp/messageSender', () => ({
    sendMessage: jest.fn().mockResolvedValue(true),
    sendListMessage: jest.fn().mockResolvedValue(true),
    sendButtonMessage: jest.fn().mockResolvedValue(true)
  }));

  // Import after mocking
  const { sendMessage } = require('../../src/services/whatsapp/messageSender');

  return {
    mockSendMessage: sendMessage,
    restoreMocks: () => jest.restoreAllMocks()
  };
}

// Real API setup function (for integration tests)
function setupRealWhatsAppAPI() {
  return new RealWhatsAppIntegration();
}

// Environment-based API mode detection
function isRealAPIMode() {
  return process.env.TEST_MODE === 'integration' ||
         process.env.TEST_MODE === 'e2e-real' ||
         process.env.USE_REAL_APIS === 'true';
}

function getWhatsAppIntegration() {
  return isRealAPIMode() ? setupRealWhatsAppAPI() : setupWhatsAppMocks();
}

module.exports = {
  TestDatabaseManager,
  setupWhatsAppMocks,
  setupRealWhatsAppAPI,
  RealWhatsAppIntegration,
  isRealAPIMode,
  getWhatsAppIntegration
};
