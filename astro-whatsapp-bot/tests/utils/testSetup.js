const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');
const { createUser, getUserByPhone } = require('../../src/models/userModel');
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

// Mock setup function
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

module.exports = {
  TestDatabaseManager,
  setupWhatsAppMocks
};