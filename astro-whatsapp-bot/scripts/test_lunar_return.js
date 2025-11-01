// Simple test script for lunar return functionality
const vedicCalculator = require('./src/core/services/calculators/VedicCalculator');

async function testLunarReturn() {
  try {
    console.log('Testing Lunar Return functionality...');

    // Test data
    const birthData = {
      birthDate: '15/06/1990',
      birthTime: '14:30',
      birthPlace: 'Delhi, India'
    };

    console.log('Birth data:', birthData);

    // First test basic birth chart generation
    console.log('Testing basic birth chart generation...');
    const natalChart = await vedicCalculator.generateBasicBirthChart({
      name: 'Test User',
      ...birthData
    });

    console.log('Natal chart generated:', {
      sunSign: natalChart.sunSign,
      moonSign: natalChart.moonSign,
      hasFullChart: !!natalChart.fullChart,
      hasPlanets: !!natalChart.fullChart?.planets,
      moonPosition: natalChart.fullChart?.planets?.moon?.position?.longitude,
      moonPositionDirect: natalChart.fullChart?.planets?.moon?.longitude,
      planetsKeys: natalChart.fullChart?.planets ? Object.keys(natalChart.fullChart.planets) : 'no planets',
      fullChartKeys: natalChart.fullChart ? Object.keys(natalChart.fullChart) : 'no fullChart'
    });

    // Log the full chart structure for debugging
    if (natalChart.fullChart) {
      console.log('Full chart structure:', JSON.stringify(natalChart.fullChart, null, 2).substring(0, 500) + '...');
    }

    const moonLongitude = natalChart.fullChart?.planets?.moon?.position?.longitude;
    if (moonLongitude === undefined || moonLongitude === null) {
      console.error('❌ Natal chart missing moon position');
      return;
    }

    // Test lunar return calculation
    console.log('Testing lunar return calculation...');
    const lunarReturn = await vedicCalculator.calculateLunarReturn(birthData);

    if (lunarReturn.error) {
      console.error('❌ Lunar return calculation failed:', lunarReturn.error);
      return;
    }

    console.log('✅ Lunar return calculated successfully!');
    console.log('Next lunar return date:', lunarReturn.formattedDate);
    console.log('Monthly themes:', lunarReturn.monthlyThemes);
    console.log('Emotional focus:', lunarReturn.emotionalCycle);
    console.log('Recommendations:', lunarReturn.recommendations);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testLunarReturn();