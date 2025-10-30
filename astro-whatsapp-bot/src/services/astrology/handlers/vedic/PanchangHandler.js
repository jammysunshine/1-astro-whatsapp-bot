/**
 * Panchang Handler
 * Handles Hindu calendar and daily timing requests
 */
const logger = require('../../../../utils/logger');
const { Panchang } = require('../../panchang');

const handlePanchang = async (message, user) => {
  if (!message.includes('panchang') && !message.includes('daily calendar') && !message.includes('hindu calendar')) {
    return null;
  }

  try {
    const panchangService = new Panchang();
    const today = new Date();
    const dateData = {
      date: `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`,
      time: `${today.getHours()}:${today.getMinutes()}`,
      latitude: user.latitude || 28.6139, // Default Delhi
      longitude: user.longitude || 77.2090,
      timezone: user.timezone || 5.5 // IST
    };

    const panchang = await panchangService.generatePanchang(dateData);
    if (panchang.error) {
      return '❌ Unable to generate panchang for today.';
    }

    return panchang.summary;
  } catch (error) {
    logger.error('Panchang generation error:', error);
    return '❌ Error generating daily panchang. Please try again.';
  }
};

module.exports = { handlePanchang };