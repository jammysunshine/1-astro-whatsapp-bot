/**
 * Hindu Festivals Handler
 * Handles Hindu festival and auspicious timing information
 */
const logger = require('../../../../utils/logger');

const handleHinduFestivals = async (message, user) => {
  if (!message.includes('hindu') && !message.includes('festival') && !message.includes('festivals')) {
    return null;
  }

  const HinduFestivals = require('../../../hinduFestivals');
  try {
    const festivalsService = new HinduFestivals();
    const today = new Date().toISOString().split('T')[0];
    const festivalData = festivalsService.getFestivalsForDate(today);

    if (festivalData.error) {
      return '❌ Unable to retrieve festival information.';
    }

    return `🕉️ *Hindu Festivals & Auspicious Timings*\n\n${festivalData.summary}`;
  } catch (error) {
    logger.error('Hindu Festivals error:', error);
    return '❌ Error retrieving festival information. Please try again.';
  }
};

module.exports = { handleHinduFestivals };
