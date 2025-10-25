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
        phoneNumber: '+1234567890',
        name: 'Test User',
      };

      User.findOne.mockResolvedValue(mockUser);

      const user = await getUserByPhone('+1234567890');

      expect(user).toEqual(mockUser);
      expect(User.findOne).toHaveBeenCalledWith({ phoneNumber: '+1234567890' });
    });

    it('should return null if user not found', async () => {
      User.findOne.mockResolvedValue(null);

      const user = await getUserByPhone('+1234567890');

      expect(user).toBeNull();
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const mockUser = {
        phoneNumber: '+1234567890',
        name: 'Test User',
      };

      User.create.mockResolvedValue(mockUser);

      const user = await createUser('+1234567890');

      expect(user).toEqual(mockUser);
      expect(User.create).toHaveBeenCalledWith({ phoneNumber: '+1234567890' });
    });
  });

  describe('addBirthDetails', () => {
    it('should add birth details to user', async () => {
      const mockUser = {
        phoneNumber: '+1234567890',
        save: jest.fn().mockResolvedValue(),
      };

      User.findOne.mockResolvedValue(mockUser);

      await addBirthDetails('+1234567890', '15/03/1990', '14:30', 'Mumbai, India');

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