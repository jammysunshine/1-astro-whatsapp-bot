// Simple debug test to check user creation
const { createUser, getUserByPhone } = require('./src/models/userModel');
const mongoose = require('mongoose');

const TEST_PHONE = '+1234567890';
const TEST_USER_DATA = {
  name: 'Test User',
  birthDate: '15061990',
  birthTime: '1430',
  birthPlace: 'Mumbai, India',
  profileComplete: true
};

async function debugTest() {
  try {
    // Connect to test database using Atlas
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://jammysunshine:11wMGp1fnrwhZGIQ@cluster0.qqweu91.mongodb.net/astro-whatsapp-bot-test';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to database');
    
    // Clean up any existing test user
    const User = require('./src/models/User');
    await User.deleteMany({ phoneNumber: TEST_PHONE });
    console.log('Cleaned up existing test users');
    
    // Create user
    console.log('Creating user with data:', TEST_USER_DATA);
    const user = await createUser(TEST_PHONE, TEST_USER_DATA);
    console.log('Created user:', {
      phoneNumber: user.phoneNumber,
      name: user.name,
      id: user.id
    });
    
    // Retrieve user
    const retrievedUser = await getUserByPhone(TEST_PHONE);
    console.log('Retrieved user:', {
      phoneNumber: retrievedUser.phoneNumber,
      name: retrievedUser.name,
      id: retrievedUser.id
    });
    
    console.log('Expected name:', TEST_USER_DATA.name);
    console.log('Actual name:', retrievedUser.name);
    console.log('Names match:', retrievedUser.name === TEST_USER_DATA.name);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from database');
  }
}

debugTest();