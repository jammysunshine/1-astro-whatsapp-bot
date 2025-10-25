const { Astrologer } = require('astrologer');
const sweph = require('sweph');

console.log('Testing Astrologer Library...');

// Set ephemeris path
try {
  sweph.set_ephe_path('./ephe');
  console.log('Swiss Ephemeris initialized');
} catch (error) {
  console.warn('Swiss Ephemeris error:', error.message);
}

const astrologer = new Astrologer();

// Test data
const astroData = {
  year: 1990,
  month: 6,
  date: 15,
  hours: 12,
  minutes: 0,
  seconds: 0,
  latitude: 28.6139,
  longitude: 77.2090,
  timezone: 5.5,
  chartType: 'sidereal'
};

console.log('Test data:', astroData);

try {
  const chart = astrologer.generateNatalChartData(astroData);
  console.log('Chart generated successfully');
  console.log('Chart keys:', Object.keys(chart));
  console.log('Interpretations:', chart.interpretations);
  console.log('Planets keys:', Object.keys(chart.planets || {}));
  if (chart.planets) {
    console.log('Sample planet (sun):', chart.planets.sun);
  }
} catch (error) {
  console.error('Error generating chart:', error);
}