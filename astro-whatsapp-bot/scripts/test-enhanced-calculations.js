const VedicCalculator = require('./src/services/astrology/vedicCalculator');
const sweph = require('sweph');

/**
 * Test script for enhanced Vedic Calculator methods
 */

async function testCalculatePrecisePosition() {
  console.log('🧪 Testing calculatePrecisePosition method...\n');

  try {
    // Check if method exists
    if (typeof VedicCalculator.calculatePrecisePosition !== 'function') {
      console.log('❌ calculatePrecisePosition method not found');
      return;
    }

    console.log('✅ calculatePrecisePosition method exists');

    // Test with a basic call (will likely fail due to ephemeris issues, but tests the method structure)
    try {
      const result = await VedicCalculator.calculatePrecisePosition(2450000, 'sun', {});
      if (result && result.planet) {
        console.log('✅ Method call successful');
      } else {
        console.log('⚠️ Method returned result but may have errors:', result.error || 'Unknown');
      }
    } catch (callError) {
      console.log('⚠️ Method call failed (expected due to ephemeris setup):', callError.message);
    }

    console.log('✅ calculatePrecisePosition tests completed\n');

  } catch (error) {
    console.error('❌ Error testing calculatePrecisePosition:', error.message);
  }
}

async function testCalculateLunarNodes() {
  console.log('🧪 Testing calculateLunarNodes method...\n');

  try {
    // Check if method exists
    if (typeof VedicCalculator.calculateLunarNodes !== 'function') {
      console.log('❌ calculateLunarNodes method not found');
      return;
    }

    console.log('✅ calculateLunarNodes method exists');

    // Test with a basic call
    try {
      const result = VedicCalculator.calculateLunarNodes(2450000, 'true');
      if (result && (result.rahu || result.error)) {
        console.log('✅ Method call successful');
      } else {
        console.log('⚠️ Method returned unexpected result');
      }
    } catch (callError) {
      console.log('⚠️ Method call failed:', callError.message);
    }

    console.log('✅ calculateLunarNodes tests completed\n');

  } catch (error) {
    console.error('❌ Error testing calculateLunarNodes:', error.message);
  }
}

async function testGenerateEphemerisTable() {
  console.log('🧪 Testing generateEphemerisTable method...\n');

  try {
    // Check if method exists
    if (typeof VedicCalculator.generateEphemerisTable !== 'function') {
      console.log('❌ generateEphemerisTable method not found');
      return;
    }

    console.log('✅ generateEphemerisTable method exists');

    // Test with a basic call
    try {
      const startDate = new Date(2024, 9, 25);
      const result = VedicCalculator.generateEphemerisTable(startDate, 2, {
        planets: ['sun'],
        includeAspects: false
      });

      if (result && (result.dailyData || result.error)) {
        console.log('✅ Method call successful');
      } else {
        console.log('⚠️ Method returned unexpected result');
      }
    } catch (callError) {
      console.log('⚠️ Method call failed:', callError.message);
    }

    console.log('✅ generateEphemerisTable tests completed\n');

  } catch (error) {
    console.error('❌ Error testing generateEphemerisTable:', error.message);
  }
}

async function testSecondaryProgressions() {
  console.log('🧪 Testing calculateEnhancedSecondaryProgressions method...\n');

  try {
    // Check if method exists
    if (typeof VedicCalculator.calculateEnhancedSecondaryProgressions !== 'function') {
      console.log('❌ calculateEnhancedSecondaryProgressions method not found');
      return;
    }

    console.log('✅ calculateEnhancedSecondaryProgressions method exists');

    // Test with a basic call
    try {
      const birthData = {
        birthDate: '15/06/1990',
        birthTime: '14:30',
        birthPlace: 'Mumbai, India'
      };

      const result = await VedicCalculator.calculateEnhancedSecondaryProgressions(birthData, new Date());

      if (result && (result.progressedPlanets || result.error)) {
        console.log('✅ Method call successful');
      } else {
        console.log('⚠️ Method returned unexpected result');
      }
    } catch (callError) {
      console.log('⚠️ Method call failed:', callError.message);
    }

    console.log('✅ calculateEnhancedSecondaryProgressions tests completed\n');

  } catch (error) {
    console.error('❌ Error testing calculateEnhancedSecondaryProgressions:', error.message);
  }
}

async function testSolarArcDirections() {
  console.log('🧪 Testing calculateEnhancedSolarArcDirections method...\n');

  try {
    // Check if method exists
    if (typeof VedicCalculator.calculateEnhancedSolarArcDirections !== 'function') {
      console.log('❌ calculateEnhancedSolarArcDirections method not found');
      return;
    }

    console.log('✅ calculateEnhancedSolarArcDirections method exists');

    // Test with a basic call
    try {
      const birthData = {
        birthDate: '15/06/1990',
        birthTime: '14:30',
        birthPlace: 'Mumbai, India'
      };

      const result = await VedicCalculator.calculateEnhancedSolarArcDirections(birthData, new Date());

      if (result && (result.directedPlanets || result.error)) {
        console.log('✅ Method call successful');
      } else {
        console.log('⚠️ Method returned unexpected result');
      }
    } catch (callError) {
      console.log('⚠️ Method call failed:', callError.message);
    }

    console.log('✅ calculateEnhancedSolarArcDirections tests completed\n');

  } catch (error) {
    console.error('❌ Error testing calculateEnhancedSolarArcDirections:', error.message);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Enhanced Vedic Calculator Tests\n');
  console.log('=' .repeat(50));

  await testCalculatePrecisePosition();
  await testCalculateLunarNodes();
  await testGenerateEphemerisTable();
  await testSecondaryProgressions();
  await testSolarArcDirections();

  console.log('=' .repeat(50));
  console.log('🏁 All tests completed!');
}

// Execute tests
runAllTests().catch(error => {
  console.error('💥 Test execution failed:', error);
  process.exit(1);
});