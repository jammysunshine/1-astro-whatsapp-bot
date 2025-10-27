const vedicCalculator = require('./src/services/astrology/vedicCalculator');
const { generateAstrologyResponse } = require('./src/services/astrology/astrologyEngine');

async function testIntegration() {
  console.log('🧪 Testing Integration of Enhanced Calculation Methods\n');

  // Mock user object
  const mockUser = {
    phoneNumber: '+1234567890',
    name: 'Test User',
    birthDate: '15/06/1990',
    birthTime: '14:30',
    birthPlace: 'Mumbai, India'
  };

  // Test 1: Direct method calls
  console.log('1️⃣ Testing Direct Method Calls:');

  try {
    const progressions = await vedicCalculator.calculateEnhancedSecondaryProgressions({
      birthDate: mockUser.birthDate,
      birthTime: mockUser.birthTime,
      birthPlace: mockUser.birthPlace
    }, new Date());

    console.log('✅ calculateEnhancedSecondaryProgressions: SUCCESS');
    console.log(`   Age: ${progressions.ageInYears} years`);
    console.log(`   Key progressions: ${progressions.keyProgressions.length}`);
  } catch (error) {
    console.log('❌ calculateEnhancedSecondaryProgressions: FAILED');
    console.log(`   Error: ${error.message}`);
  }

  try {
    const solarArc = await vedicCalculator.calculateEnhancedSolarArcDirections({
      birthDate: mockUser.birthDate,
      birthTime: mockUser.birthTime,
      birthPlace: mockUser.birthPlace
    }, new Date());

    console.log('✅ calculateEnhancedSolarArcDirections: SUCCESS');
    console.log(`   Age: ${solarArc.ageInYears} years`);
    console.log(`   Key directions: ${solarArc.keyDirections.length}`);
  } catch (error) {
    console.log('❌ calculateEnhancedSolarArcDirections: FAILED');
    console.log(`   Error: ${error.message}`);
  }

  // Test 2: Integration through astrologyEngine
  console.log('\n2️⃣ Testing Integration through Astrology Engine:');

  try {
    const progressionsResponse = await generateAstrologyResponse('progressions', mockUser);
    console.log('✅ Astrology Engine - Progressions: SUCCESS');
    console.log(`   Response length: ${progressionsResponse.length} characters`);
  } catch (error) {
    console.log('❌ Astrology Engine - Progressions: FAILED');
    console.log(`   Error: ${error.message}`);
  }

  try {
    const solarArcResponse = await generateAstrologyResponse('solar arc', mockUser);
    console.log('✅ Astrology Engine - Solar Arc: SUCCESS');
    console.log(`   Response length: ${solarArcResponse.length} characters`);
  } catch (error) {
    console.log('❌ Astrology Engine - Solar Arc: FAILED');
    console.log(`   Error: ${error.message}`);
  }

  // Test 3: Menu action integration
  console.log('\n3️⃣ Testing Menu Action Integration:');

  const { executeMenuAction } = require('./src/services/whatsapp/messageProcessor');

  try {
    // Mock the message processor's executeMenuAction for progressions
    const progressionsResult = await executeMenuAction('+1234567890', mockUser, 'get_secondary_progressions');
    console.log('✅ Menu Action - Progressions: SUCCESS');
    console.log(`   Result type: ${typeof progressionsResult}`);
  } catch (error) {
    console.log('❌ Menu Action - Progressions: FAILED');
    console.log(`   Error: ${error.message}`);
  }

  try {
    // Mock the message processor's executeMenuAction for solar arc
    const solarArcResult = await executeMenuAction('+1234567890', mockUser, 'get_solar_arc_directions');
    console.log('✅ Menu Action - Solar Arc: SUCCESS');
    console.log(`   Result type: ${typeof solarArcResult}`);
  } catch (error) {
    console.log('❌ Menu Action - Solar Arc: FAILED');
    console.log(`   Error: ${error.message}`);
  }

  console.log('\n🎉 Integration Testing Complete!');
}

// Run the test
testIntegration().catch(console.error);