/**
 * Ashtakavarga Handler
 * Handles Vedic 64-point strength analysis requests
 */
const logger = require('../../../../utils/logger');
const { AshtakavargaCalculator } = require('../../calculators/AshtakavargaCalculator');

const handleAshtakavarga = async(message, user) => {
  if (!message.includes('ashtakavarga') && !message.includes('64-point') && !message.includes('benefic') && !message.includes('strength analysis')) {
    return null;
  }

  if (!user.birthDate) {
    return '🔢 *Ashtakavarga Analysis*\n\n👤 I need your birth details for Vedic 64-point strength analysis.\n\nSend format: DDMMYY or DDMMYYYY\nExample: 150691 (June 15, 1991)';
  }

  try {
    const calculator = new AshtakavargaCalculator();
    // Set services if available
    if (global.vedicCore?.geocodingService) {
      calculator.setServices({ geocodingService: global.vedicCore.geocodingService });
    }

    const birthData = {
      birthDate: user.birthDate || '15/06/1991',
      birthTime: user.birthTime || '14:30',
      birthPlace: user.birthPlace || 'Delhi, India'
    };

    const analysis = await calculator.calculateAshtakavarga(birthData);

    if (analysis.error) {
      return '❌ Error calculating Ashtakavarga. This requires precise ephemeris calculations. Please try again.';
    }

    const summary = calculator._generateAshtakavargaSummary(analysis.analysis);
    return `${summary}\n\n🕉️ *Ancient Vedic wisdom uses 64 mathematical combinations to reveal planetary harmony at birth.*`;
  } catch (error) {
    logger.error('Ashtakavarga calculation error:', error);
    return '❌ Error calculating Ashtakavarga. This requires precise ephemeris calculations. Please try again.';
  }
};

module.exports = { handleAshtakavarga };
