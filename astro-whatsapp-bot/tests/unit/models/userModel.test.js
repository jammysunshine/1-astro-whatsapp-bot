// tests/unit/models/userModel.test.js
// Unit tests for User Model functions

const {
  getUserByPhone,
  createUser,
  addBirthDetails,
  updateUserProfile
} = require('../../../src/models/userModel');
const User = require('../../../src/models/User');
const mongoose = require('mongoose');

// No mock for User model - use actual database operations

describe('UserModel Functions', () => {
  beforeAll(async() => {
    // Use the MongoDB URI from environment or default to test database
    const mongoUri =
      process.env.MONGODB_URI ||
      'mongodb://localhost:27017/astro-whatsapp-bot-test';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  });

  afterAll(async() => {
    await mongoose.connection.close();
  });

  beforeEach(async() => {
    // Clean up test data before each test
    await User.deleteMany({
      phoneNumber: {
        $in: ['+1234567890', '+1234567891', '+1234567892', '+1234567893']
      }
    });
    jest.clearAllMocks();
  });

  afterEach(async() => {
    // Clean up after each test
    await User.deleteMany({
      phoneNumber: {
        $in: ['+1234567890', '+1234567891', '+1234567892', '+1234567893']
      }
    });
  });

  describe('getUserByPhone', () => {
    it('should get user by phone number', async() => {
      // Create a test user directly in database
      const testUserData = {
        id: 'user-test-123',
        phoneNumber: '+1234567890',
        name: 'Test User',
        referralCode: 'TEST123'
      };

      const testUser = new User(testUserData);
      await testUser.save();

      const user = await getUserByPhone('+1234567890');

      expect(user).toBeDefined();
      expect(user.phoneNumber).toBe('+1234567890');
      expect(user.name).toBe('Test User');
      expect(user.referralCode).toBe('TEST123');
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile', async() => {
      // Create a test user first
      const testUserData = {
        id: 'user-test-456',
        phoneNumber: '+1234567891',
        name: 'Original Name',
        referralCode: 'TEST456'
      };

      const testUser = new User(testUserData);
      await testUser.save();

      // Update the user profile
      const updateData = {
        name: 'Updated User',
        preferredLanguage: 'es'
      };

      const result = await updateUserProfile('+1234567891', updateData);

      expect(result).toBeDefined();
      expect(result.name).toBe('Updated User');
      expect(result.preferredLanguage).toBe('es');
    });
  });

  describe('createUser', () => {
    it('should create a new user with proper defaults', async() => {
      const phoneNumber = '+1234567892';
      const profileData = {
        name: 'New Test User'
      };

      const user = await createUser(phoneNumber, profileData);

      expect(user).toBeDefined();
      expect(user.phoneNumber).toBe(phoneNumber);
      expect(user.name).toBe('New Test User');
      expect(user.referralCode).toBeDefined();
      // Check that default values are set
      expect(user.preferredLanguage).toBe('en'); // Default from schema
    });

    it('should create user with default name when not provided', async() => {
      const phoneNumber = '+1234567893';

      const user = await createUser(phoneNumber);

      expect(user).toBeDefined();
      expect(user.phoneNumber).toBe(phoneNumber);
      expect(user.name).toBe('Cosmic Explorer'); // Default from schema
    });
  });
});
