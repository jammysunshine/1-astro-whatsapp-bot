const logger = require('../../utils/logger');
const vedicCalculator = require('./vedicCalculator');

/**
 * Generates an astrology response based on user input and user data.
 * Uses basic Vedic astrology calculations for MVP functionality.
 * @param {string} messageText - The text message from the user.
 * @param {Object} user - The user object containing profile information.
 * @returns {Promise<string>} The generated astrology response.
 */
const generateAstrologyResponse = async(messageText, user) => {
  logger.info(`Generating astrology response for user ${user.phoneNumber} with message: ${messageText}`);

  const message = messageText.toLowerCase().trim();

  // Greeting responses
  if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
    return `🌟 Hello ${user.name || 'cosmic explorer'}! Welcome to your Personal Cosmic Coach. I'm here to help you navigate your cosmic journey. What would you like to explore today?`;
  }

  // Daily horoscope
  if (message.includes('horoscope') || message.includes('daily')) {
    if (!user.birthDate) {
      return 'I\'d love to give you a personalized daily horoscope! Please share your birth date (DD/MM/YYYY) first so I can calculate your sun sign.';
    }

    const sunSign = vedicCalculator.calculateSunSign(user.birthDate);
    const horoscope = vedicCalculator.generateDailyHoroscope(sunSign);

    // Add social proof and progress tracking
    const userCount = 2847; // Mock social proof
    const insightsReceived = user.insightsReceived || 0;

    return `🌟 *Daily Horoscope for ${sunSign}*\n\n${horoscope}\n\n⭐ *${userCount} users* with your sign found today's guidance particularly accurate!\n\n📊 *Your Cosmic Journey:* ${insightsReceived + 1} personalized insights received\n\nRemember, the stars guide us but you create your destiny! ✨`;
  }

  // Birth chart requests
  if (message.includes('birth chart') || message.includes('kundli') || message.includes('chart')) {
    if (!user.birthDate) {
      return 'To generate your birth chart, I need your birth details. Please provide:\n• Birth date (DD/MM/YYYY)\n• Birth time (HH:MM) - optional but recommended\n• Birth place (City, Country)\n\nExample: 15/06/1990, 14:30, Mumbai, India';
    }

    try {
      const chartData = await vedicCalculator.generateDetailedChart({
        birthDate: user.birthDate,
        birthTime: user.birthTime,
        birthPlace: user.birthPlace
      });

      const patterns = chartData.lifePatterns;
      const userCount = 2847;

      return `📊 *Your Complete Birth Chart Analysis*\n\n☀️ *Sun Sign:* ${chartData.sunSign} - Your core identity\n🌙 *Moon Sign:* ${chartData.moonSign} - Your emotional nature\n⬆️ *Rising Sign:* ${chartData.risingSign} - How others see you\n\n🔥 *Your Top 3 Life Patterns:*\n1. ${patterns[0]}\n2. ${patterns[1]}\n3. ${patterns[2]}\n\n⭐ *${userCount} users* with similar charts report these patterns resonate strongly!\n\nWould you like your daily horoscope or compatibility analysis?`;
    } catch (error) {
      logger.error('Error generating birth chart:', error);
      return 'I\'m having trouble generating your birth chart right now. Please try again later or contact support.';
    }
  }

  // Compatibility requests
  if (message.includes('compatibility') || message.includes('match') || message.includes('compatible')) {
    if (!user.birthDate) {
      return 'For compatibility analysis, I need your birth details first. Please share your birth date (DD/MM/YYYY) so I can get started.';
    }

    return '💕 *Compatibility Analysis*\n\nI can check how compatible you are with someone else! Please provide their birth date (DD/MM/YYYY) and I\'ll compare it with your chart.\n\nExample: 25/12/1985\n\n*Note:* This is a basic compatibility check. Premium users get detailed relationship insights!';
  }

  // Profile/birth details
  if (message.includes('profile') || message.includes('details') || message.includes('birth')) {
    if (user.profileComplete) {
      return `📋 *Your Profile*\n\nName: ${user.name || 'Not set'}\nBirth Date: ${user.birthDate}\nBirth Time: ${user.birthTime || 'Not set'}\nBirth Place: ${user.birthPlace || 'Not set'}\nSun Sign: ${vedicCalculator.calculateSunSign(user.birthDate)}\n\nWould you like to update any information or get a reading?`;
    } else {
      return 'Let\'s complete your profile! I need your birth details to provide accurate readings.\n\nPlease provide:\n• Birth date (DD/MM/YYYY)\n• Birth time (HH:MM) - optional\n• Birth place (City, Country)\n\nExample: 15/06/1990, 14:30, Mumbai, India';
    }
  }

  // Help and general responses
  if (message.includes('help') || message.includes('what can you do') || message.includes('commands')) {
    return '🌟 *I\'m your Personal Cosmic Coach!*\n\nI can help you with:\n\n📅 *Daily Horoscope* - Personalized daily guidance\n📊 *Birth Chart* - Your cosmic blueprint\n💕 *Compatibility* - Relationship insights\n🔮 *Predictions* - Future guidance\n\nJust send me a message like:\n• "What\'s my horoscope today?"\n• "Show me my birth chart"\n• "Check compatibility with [birth date]"\n\nWhat\'s on your mind? ✨';
  }

  // Default response
  return `✨ Thank you for your message, ${user.name || 'cosmic explorer'}!\n\nI'm here to guide you through your cosmic journey. I can provide personalized horoscopes, birth chart analysis, compatibility insights, and much more.\n\nWhat aspect of your life would you like cosmic guidance on today? 🌟`;
};

module.exports = {
  generateAstrologyResponse
};
