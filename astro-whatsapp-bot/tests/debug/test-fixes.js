// Test file to verify all fixes are working
const mongoose = require('mongoose');
const { createUser, getUserByPhone, updateUserProfile, addBirthDetails } = require('../../src/models/userModel');
const User = require('../../src/models/User');

async function testUserCreationAndDefaults() {
  console.log('🧪 Testing User Creation and Defaults...');

  try {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('✅ Connected to database');

    // Clean up any existing test data
    await User.deleteMany({ phoneNumber: { $in: ['+1234567890', '+1234567891', '+1234567892'] } });

    // Test 1: Create user with name provided
    console.log('\n📝 Test 1: Create user with name provided');
    const user1 = await createUser('+1234567890', { name: 'Test User' });
    console.log('User 1 created:', {
      phoneNumber: user1.phoneNumber,
      name: user1.name,
      id: user1.id
    });

    if (user1.name === 'Test User') {
      console.log('✅ Test 1 PASSED: Name set correctly');
    } else {
      console.log('❌ Test 1 FAILED: Name not set correctly');
      return false;
    }

    // Test 2: Create user without name (should use default)
    console.log('\n📝 Test 2: Create user without name (should use default)');
    const user2 = await createUser('+1234567891');
    console.log('User 2 created:', {
      phoneNumber: user2.phoneNumber,
      name: user2.name,
      id: user2.id
    });

    if (user2.name === 'Cosmic Explorer') {
      console.log('✅ Test 2 PASSED: Default name set correctly');
    } else {
      console.log('❌ Test 2 FAILED: Default name not set correctly');
      return false;
    }

    // Test 3: Get user by phone
    console.log('\n📝 Test 3: Get user by phone');
    const retrievedUser = await getUserByPhone('+1234567890');
    console.log('Retrieved user:', {
      phoneNumber: retrievedUser.phoneNumber,
      name: retrievedUser.name
    });

    if (retrievedUser.name === 'Test User') {
      console.log('✅ Test 3 PASSED: User retrieved with correct name');
    } else {
      console.log('❌ Test 3 FAILED: User not retrieved with correct name');
      return false;
    }

    // Test 4: Update user profile
    console.log('\n📝 Test 4: Update user profile');
    const updatedUser = await updateUserProfile('+1234567890', {
      name: 'Updated Test User',
      preferredLanguage: 'es'
    });
    console.log('Updated user:', {
      phoneNumber: updatedUser.phoneNumber,
      name: updatedUser.name,
      preferredLanguage: updatedUser.preferredLanguage
    });

    if (updatedUser.name === 'Updated Test User' && updatedUser.preferredLanguage === 'es') {
      console.log('✅ Test 4 PASSED: User profile updated correctly');
    } else {
      console.log('❌ Test 4 FAILED: User profile not updated correctly');
      return false;
    }

    // Test 5: Add birth details and check profile completion
    console.log('\n📝 Test 5: Add birth details and check profile completion');
    const userWithBirthDetails = await addBirthDetails(
      '+1234567892',
      '15061990',
      '1430',
      'Mumbai, India'
    );
    console.log('User with birth details:', {
      phoneNumber: userWithBirthDetails.phoneNumber,
      birthDate: userWithBirthDetails.birthDate,
      birthTime: userWithBirthDetails.birthTime,
      birthPlace: userWithBirthDetails.birthPlace,
      profileComplete: userWithBirthDetails.profileComplete
    });

    if (userWithBirthDetails.profileComplete === true) {
      console.log('✅ Test 5 PASSED: Profile completion set correctly');
    } else {
      console.log('❌ Test 5 FAILED: Profile completion not set correctly');
      return false;
    }

    console.log('\n🎉 All tests passed!');
    return true;
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    return false;
  } finally {
    // Clean up
    try {
      await User.deleteMany({ phoneNumber: { $in: ['+1234567890', '+1234567891', '+1234567892'] } });
      await mongoose.connection.close();
      console.log('🧹 Cleaned up test data');
    } catch (cleanupError) {
      console.error('❌ Error during cleanup:', cleanupError);
    }
  }
}

// Run the test
testUserCreationAndDefaults().then(success => {
  if (success) {
    console.log('\n✅ All fixes are working correctly!');
    process.exit(0);
  } else {
    console.log('\n❌ Some fixes are not working correctly');
    process.exit(1);
  }
});
