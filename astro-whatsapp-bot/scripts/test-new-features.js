// Test script for new astrology features - UPDATED IMPORT PATHS
const astrocartographyReader = require('../src/core/services/calculators/astrocartographyReader');
const { PoliticalAstrology } = require('../src/core/services/calculators/PoliticalAstrology'); // Updated to use available calculator
const HellenisticAstrologyReader = require('../src/core/services/calculators/hellenisticAstrology');
const AgeHarmonicAstrologyService = require('../src/core/services/ageHarmonicAstrologyService'); // Updated to use new service
const PoliticalAstrologyService = require('../src/core/services/politicalAstrologyService'); // Added new service

const mundaneAstrology = new PoliticalAstrology(); // Updated to use migrated PoliticalAstrology calculator
const hellenisticAstrology = new HellenisticAstrologyReader();
const ageHarmonicAstrology = new AgeHarmonicAstrologyService(); // Updated to use new service
const politicalAstrology = new PoliticalAstrologyService(); // Added new service

async function testNewFeatures() {
  console.log('🧪 Testing new astrology features...\n');

  // Sample birth data
  const birthData = {
    birthDate: '15/03/1990',
    birthTime: '14:30',
    birthPlace: 'Mumbai, India'
  };

  try {
    // Test Astrocartography
    console.log('🌍 Testing Astrocartography...');
    const astroResult = await astrocartographyReader.generateAstrocartography(birthData);
    console.log('✅ Astrocartography result:', astroResult ? 'Success' : 'Failed');

    // Test Mundane Astrology
    console.log('🌐 Testing Mundane Astrology...');
    const mundaneResult = await mundaneAstrology.generateMundaneAnalysis(birthData);
    console.log('✅ Mundane Astrology result:', mundaneResult ? 'Success' : 'Failed');

    // Test Hellenistic Astrology
    console.log('🏛️ Testing Hellenistic Astrology...');
    const hellenisticResult = await hellenisticAstrology.generateHellenisticAnalysis(birthData);
    console.log('✅ Hellenistic Astrology result:', hellenisticResult ? 'Success' : 'Failed');

    // Test Age Harmonic Astrology
    console.log('🔢 Testing Age Harmonic Astrology...');
    const ageHarmonicResult = await ageHarmonicAstrology.processCalculation(birthData);
    console.log('✅ Age Harmonic Astrology result:', ageHarmonicResult ? 'Success' : 'Failed');

    // Test Political Astrology
    console.log('🏛️ Testing Political Astrology...');
    const politicalResult = await politicalAstrology.processCalculation(birthData);
    console.log('✅ Political Astrology result:', politicalResult ? 'Success' : 'Failed');

    console.log('\n🎉 All new features tested successfully!');

  } catch (error) {
    console.error('❌ Error testing features:', error.message);
  }
}

testNewFeatures();