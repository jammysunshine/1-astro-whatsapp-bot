// tests/unit/models/User.test.js
// Unit tests for User model

const User = require('../../../src/models/User');
const mongoose = require('mongoose');

describe('User Model', () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('User Creation', () => {
    it('should create a new user with valid data', async () => {
      const userData = {
        id: 'user-456',
        phoneNumber: '+1234567890',
        name: 'Test User',
        birthDate: '15/03/1990',
        birthTime: '14:30',
        birthPlace: 'Mumbai, India',
        preferredLanguage: 'en',
        sunSign: 'Pisces',
        moonSign: 'Pisces',
        risingSign: 'Aquarius',
        profileComplete: true,
      };

      await new User(userData).save();

      const foundUser = await User.findOne({ phoneNumber: '+1234567890' });

      expect(foundUser).toBeTruthy();
      expect(foundUser.phoneNumber).toBe('+1234567890');
    });

    it('should update user profile', async () => {
      const userData = {
        id: 'user-123',
        phoneNumber: '+1234567890',
        name: 'Test User',
        birthDate: '15/03/1990',
        birthTime: '14:30',
        birthPlace: 'Mumbai, India',
        preferredLanguage: 'en',
        sunSign: 'Pisces',
        moonSign: 'Pisces',
        risingSign: 'Aquarius',
        profileComplete: true,
      };

      const user = await new User(userData).save();

      user.name = 'Updated User';
      await user.save();

      const updatedUser = await User.findById(user._id);
      expect(updatedUser.name).toBe('Updated User');
    });
  });
});