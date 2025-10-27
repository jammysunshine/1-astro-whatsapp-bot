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

// Mock User model
jest.mock('../../../src/models/User');

describe('UserModel Functions', () => {
  beforeAll(async() => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test');
  });

  afterAll(async() => {
    await mongoose.connection.close();
  });

  beforeEach(async() => {
    await User.deleteMany({});
    jest.clearAllMocks();
  });

  describe('getUserByPhone', () => {
    it('should get user by phone number', async () => {
      const mockUser = {
        id: 'user-456',
        phoneNumber: '+1234567890',
        name: 'Test User',
        toObject: jest.fn().mockReturnValue({
          id: 'user-456',
          phoneNumber: '+1234567890',
          name: 'Test User'
        })
      };

      User.findOne.mockResolvedValue(mockUser);

      const user = await getUserByPhone('+1234567890');

      expect(user).toEqual({
        id: 'user-456',
        phoneNumber: '+1234567890',
        name: 'Test User'
      });
      expect(User.findOne).toHaveBeenCalledWith({ phoneNumber: '+1234567890' });
    });
  });
  });

  describe('updateUserProfile', () => {
    it('should update user profile', async () => {
      const mockUser = {
        phoneNumber: '+1234567890',
        save: jest.fn().mockResolvedValue(),
        toObject: jest.fn().mockReturnValue({
          phoneNumber: '+1234567890',
          name: 'Updated User'
        })
      };

      User.findOne.mockResolvedValue(mockUser);

      const result = await updateUserProfile('+1234567890', { name: 'Updated User' });

      expect(mockUser.save).toHaveBeenCalled();
      expect(result).toEqual({
        phoneNumber: '+1234567890',
        name: 'Updated User'
      });
    });
  });
});
