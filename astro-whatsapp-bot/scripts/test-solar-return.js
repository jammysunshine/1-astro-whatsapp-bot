const vedicCalculator = require('./src/services/astrology/vedicCalculator');
const { generateAstrologyResponse } = require('./src/services/astrology/astrologyEngine');

async function testSolarReturn() {
  console.log('🧪 Testing Solar Return Implementation\n');

  // Mock user object
  const mockUser = {
    phoneNumber: '+1234567890',
    name: 'Test User',
    birthDate: '15/06/1990',
    birthTime: '14:30',
    birthPlace: 'Mumbai, India'
  };

  // Test 1: Direct method call
  console.log('1️⃣ Testing Direct Solar Return Calculation:');

  try {
    const solarReturn = await vedicCalculator.calculateSolarReturn({
      birthDate: mockUser.birthDate,
      birthTime: mockUser.birthTime,
      birthPlace: mockUser.birthPlace
    }, 2024);

    console.log('✅ calculateSolarReturn: SUCCESS');
    console.log(`   Age at return: ${solarReturn.ageAtReturn}`);
    console.log(`   Solar return date: ${solarReturn.solarReturnDate}`);
    console.log(`   Dominant themes: ${solarReturn.dominantThemes.length}`);
    console.log(`   Opportunities: ${solarReturn.opportunities.length}`);
  } catch (error) {
    console.log('❌ calculateSolarReturn: FAILED');
    console.log(`   Error: ${error.message}`);
  }

  // Test 2: Integration through astrology engine
  console.log('\n2️⃣ Testing Integration through Astrology Engine:');

  try {
    const response = await generateAstrologyResponse('solar return', mockUser);
    console.log('✅ Astrology Engine - Solar Return: SUCCESS');
    console.log(`   Response length: ${response.length} characters`);
    console.log(`   Contains solar return: ${response.includes('Solar Return')}`);
  } catch (error) {
    console.log('❌ Astrology Engine - Solar Return: FAILED');
    console.log(`   Error: ${error.message}`);
  }

  console.log('\n🎉 Solar Return Testing Complete!');
}

// Run the test
testSolarReturn().catch(console.error);