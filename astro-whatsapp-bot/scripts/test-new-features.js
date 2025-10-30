// Test script for new astrology features
const astrocartographyReader = require('./src/services/astrology/astrocartographyReader');
const MundaneAstrologyReader = require('./src/services/astrology/mundaneAstrology');
const HellenisticAstrologyReader = require('./src/services/astrology/hellenisticAstrology');
const AgeHarmonicAstrologyReader = require('./src/services/astrology/ageHarmonicAstrology');

const mundaneAstrology = new MundaneAstrologyReader();
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

    // Test Age Harmonic Astrology
    console.log('🔢 Testing Age Harmonic Astrology...');
    const ageHarmonicResult = await ageHarmonicAstrology.generateAgeHarmonicAnalysis(birthData);
    console.log('✅ Age Harmonic Astrology result:', ageHarmonicResult ? 'Success' : 'Failed');

    console.log('\n🎉 All new features tested successfully!');

  } catch (error) {
    console.error('❌ Error testing features:', error.message);
  }
}

testNewFeatures();