/**
 * Ashtakavarga Handler
 * Handles Vedic 64-point strength analysis requests
 */
const logger = require('../../../../utils/logger');
const { calculateAshtakavarga } = require('./calculations');

const handleAshtakavarga = async (message, user) => {
  if (!message.includes('ashtakavarga') && !message.includes('64-point') && !message.includes('benefic') && !message.includes('strength analysis')) {
    return null;
  }

  if (!user.birthDate) {
    return '🔢 *Ashtakavarga Analysis*\n\n👤 I need your birth details for Vedic 64-point strength analysis.\n\nSend format: DDMMYY or DDMMYYYY\nExample: 150691 (June 15, 1991)';
  }

  try {
    const analysis = await calculateAshtakavarga(user);
    return `🔢 *Ashtakavarga - Vedic 64-Point Strength Analysis*\n\n${analysis.overview}\n\n💫 *Planetary Strengths:*\n${analysis.planetaryStrengths.map(p => p.strength).join('\n')}\n\n🏔️ *Peak Houses (10+ points):*\n${analysis.peakHouses.join(', ')}\n\n🌟 *Interpretation:*\n${analysis.interpretation}\n\n🕉️ *Ancient Vedic wisdom uses 64 mathematical combinations to reveal planetary harmony at birth.*`;
  } catch (error) {
    logger.error('Ashtakavarga calculation error:', error);
    return '❌ Error calculating Ashtakavarga. This requires precise ephemeris calculations. Please try again.';
  }
};

module.exports = { handleAshtakavarga };