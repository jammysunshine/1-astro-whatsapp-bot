/**
 * Vedic Numerology Handler
 * Handles Vedic numerology and name number analysis requests
 */
const logger = require('../../../../utils/logger');
const vedicNumerology = require('../../vedicNumerology');

const handleVedicNumerology = async(message, user) => {
  if (!message.includes('vedic') && !message.includes('numerology') && !message.includes('numbers')) {
    return null;
  }

  if (!user.name) {
    return '🔢 *Vedic Numerology*\n\nPlease provide your name for numerological analysis.';
  }

  try {
    const analysis = vedicNumerology.calculateNameNumber(user.name);

    return `🔢 *Vedic Numerology Analysis*\n\n👤 Name: ${user.name}\n\n📊 *Primary Number:* ${analysis.primaryNumber}\n💫 *Interpretation:* ${analysis.primaryMeaning}\n\n🔮 *Compound Number:* ${analysis.compoundNumber}\n✨ *Destiny:* ${analysis.compoundMeaning}\n\n📈 *Karmic Influences:* ${analysis.karmicPath}`;
  } catch (error) {
    logger.error('Vedic Numerology error:', error);
    return '❌ Error calculating Vedic numerology. Please try again.';
  }
};

module.exports = { handleVedicNumerology };
