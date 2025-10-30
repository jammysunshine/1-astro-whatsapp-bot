/**
 * Nadi Astrology Handler
 * Handles Nadi palm leaf reading requests
 */
const logger = require('../../../../utils/logger');

const handleNadi = async(message, user) => {
  if (!message.includes('nadi') && !message.includes('palm leaf') && !message.includes('scripture')) {
    return null;
  }

  if (!user.birthDate) {
    return '🌿 *Nadi Astrology Palm Leaf Reading*\n\n👤 I need your complete birth details for authentic Nadi palm leaf correlation.\n\nSend format: DDMMYY or DDMMYYYY, HHMM, City, Country\nExample: 150691, 1430, Delhi, India';
  }

  try {
    const { NadiService } = require('../../nadi');
    const nadiService = NadiService.createNadiService();
    const birthData = {
      birthDate: user.birthDate,
      birthTime: user.birthTime || '12:00',
      birthPlace: user.birthPlace || 'Unknown',
      name: user.name || 'User'
    };

    const reading = await nadiService.performNadiReading(birthData);
    if (reading.error) {
      return '❌ Unable to perform authentic Nadi reading. Please ensure your birth details are complete.';
    }
    return reading.summary;
  } catch (error) {
    logger.error('Nadi reading error:', error);
    return '❌ Error generating Nadi palm leaf reading. Please try again.';
  }
};

module.exports = { handleNadi };
