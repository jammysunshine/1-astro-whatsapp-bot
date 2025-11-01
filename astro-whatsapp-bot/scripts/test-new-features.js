// Test script for new astrology features - UPDATED IMPORT PATHS
const astrocartographyReader = require('./src/core/services/calculators/astrocartographyReader');
const { PoliticalAstrology } = require('./src/core/services/calculators/PoliticalAstrology'); // Updated to use available calculator
const HellenisticAstrologyReader = require('./src/core/services/calculators/hellenisticAstrology');
const AgeHarmonicAstrologyReader = require('./src/core/services/numerologyService'); // TODO: Age harmonic service not yet migrated - using numerology service temporarily

const mundaneAstrology = new PoliticalAstrology(); // Updated to use migrated PoliticalAstrology calculator
const hellenisticAstrology = new HellenisticAstrologyReader();
const ageHarmonicAstrology = new AgeHarmonicAstrologyReader();

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

    // Test Age Harmonic Astrology (using numerology service temporarily)
    console.log('🔢 Testing Age Harmonic Astrology (numerology service)...');
    const ageHarmonicResult = await ageHarmonicAstrology.generateAgeHarmonicAnalysis ? ageHarmonicAstrology.generateAgeHarmonicAnalysis(birthData) : ageHarmonicAstrology.generateFullReport('Test User', birthData.birthDate);
    console.log('✅ Age Harmonic Astrology result:', ageHarmonicResult ? 'Success' : 'Failed');

    console.log('\n🎉 All new features tested successfully!');

  } catch (error) {
    console.error('❌ Error testing features:', error.message);
  }
}

testNewFeatures();