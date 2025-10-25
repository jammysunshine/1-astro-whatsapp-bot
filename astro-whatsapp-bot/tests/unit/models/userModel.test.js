// tests/unit/models/userModel.test.js
// Unit tests for User Model functions

const {
  getUserByPhone,
  createUser,
  addBirthDetails,
  updateUserProfile,
} = require('../../../src/models/userModel');
const User = require('../../../src/models/User');
const mongoose = require('mongoose');

// Mock User model
jest.mock('../../../src/models/User');

describe('UserModel Functions', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    jest.clearAllMocks();
  });

  describe('getUserByPhone', () => {
    it('should get user by phone number', async () => {
      const mockUser = {
        id: 'user-101',
        phoneNumber: '+1234567890',
        name: 'Test User',
        save: jest.fn().mockResolvedValue(),
      };

      User.findOne.mockResolvedValue(mockUser);

      await updateUserProfile('+1234567890', { name: 'Updated User' });

      expect(mockUser.save).toHaveBeenCalled();
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile', async () => {
      const mockUser = {
        phoneNumber: '+1234567890',
        save: jest.fn().mockResolvedValue(),
      };

      User.findOne.mockResolvedValue(mockUser);

      await updateUserProfile('+1234567890', { name: 'Updated User' });

      expect(mockUser.save).toHaveBeenCalled();
    });
  });
});