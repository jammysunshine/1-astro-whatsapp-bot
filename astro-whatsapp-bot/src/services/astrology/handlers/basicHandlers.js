const { matchesIntent } = require('../utils/intentUtils');
const logger = require('../../../utils/logger');
const mistralAIService = require('../../ai/MistralAIService');

/**
 * Handle greeting responses
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {string|null} Greeting response or null if not a greeting
 */
const handleGreeting = (message, user) => {
  if (matchesIntent(message, ['hello', 'hi', 'hey', /^greetings?/])) {
    return `🌟 Hello ${user.name || 'cosmic explorer'}! Welcome to your Personal Cosmic Coach. I'm here to help you navigate your cosmic journey. What would you like to explore today?`;
  }
  return null;
};

/**
 * Handle default responses when no specific intent is matched
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {Promise<string>} Default response with interactive options or AI-generated response
 */
const handleDefaultResponse = async(message, user) => {
  // If the message is a question or seems like it needs AI assistance, use Mistral AI
  const lowerMessage = message.toLowerCase();
  const isQuestion = lowerMessage.includes('?') ||
                    lowerMessage.startsWith('what') ||
                    lowerMessage.startsWith('how') ||
                    lowerMessage.startsWith('why') ||
                    lowerMessage.startsWith('when') ||
                    lowerMessage.startsWith('where') ||
                    lowerMessage.startsWith('can you') ||
                    lowerMessage.startsWith('tell me') ||
                    lowerMessage.includes('explain') ||
                    lowerMessage.includes('about');

  if (isQuestion && mistralAIService.isConfigured()) {
    try {
      logger.info('Using AI for general question response');
      return await mistralAIService.generateAstrologyResponse(message);
    } catch (error) {
      logger.error('AI response failed, falling back to default:', error);
      // Fall back to default response
    }
  }

  // Default response - let the messageProcessor handle the interactive menu
  return '🌟 *Welcome to Your Cosmic Journey!*\n\nI\'m your Personal Cosmic Coach, ready to guide you through the mysteries of the stars.\n\n*Choose your path:*\n👤 *Personal Astrology* - Western or Vedic birth charts, horoscopes, and insights\n👨‍👩‍👧‍👦 *Family & Group* - Compatibility, family dynamics, and group readings\n⚙️ *Settings & Profile* - Manage your details, preferences, and subscription\n\nSimply tap a button below to begin!';
};

/**
 * Handle menu requests
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {string|null} Menu response or null if not a menu request
 */
const handleMenu = (message, user) => {
  if (matchesIntent(message, ['menu', 'help', 'options', 'what can you do', 'commands'])) {
    return '🌟 *Cosmic Coach Menu - Your Guide to the Stars*\n\n*🔮 BASIC READINGS*\nhoroscope - Daily cosmic guidance\nbirth chart - Complete astrological analysis\nnumerology - Soul\'s numerical blueprint\n\n*🌏 WORLD TRADITIONS*\nchinese/bazi - Four Pillars of Destiny\nvedic/kundli - Hindu astrology\nislamic - Ilm-e-Nujum & Taqdeer\ntarot - Mystical card readings\n\n*💫 SPECIALIZED INSIGHTS*\ncompatibility - Relationship analysis\ncareer - Professional guidance\nmedical - Health astrology\nfinancial - Wealth patterns\nfuture self - Life timeline\n\n*🕉️ ANCIENT WISDOM*\nremedies - Planetary healing\nmuhurta - Auspicious timing\npanchang - Hindu calendar\nfestivals - Sacred celebrations\n\n*🔍 ADVANCED ANALYSIS*\ndasha - Planetary periods\nashtakavarga - Strength analysis\nvarga charts - Divisional charts\nprogressions - Soul\'s evolution\n\nSimply type any of these keywords to begin your cosmic exploration! ✨';
  }
  return null;
};

/**
 * Handle update profile requests
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {string|null} Profile update response or null if not a profile request
 */
const handleUpdateProfile = (message, user) => {
  if (matchesIntent(message, ['update profile', 'change details', 'edit info', 'set birth'])) {
    return '📝 *Update Your Cosmic Profile*\n\nTo provide accurate astrological guidance, I need your birth details. Please share:\n\n*Required:*\n• Birth date (DD/MM/YYYY)\n• Birth place (City, Country)\n\n*Recommended:*\n• Birth time (HH:MM) for precise calculations\n• Full name for personalized readings\n\n*Example:*\n15/06/1990, 14:30, Mumbai, India\n\nSend your details now, and I\'ll update your profile for future readings! ✨';
  }
  return null;
};

logger.info('Module: basicHandlers loaded successfully.');

module.exports = {
  handleGreeting,
  handleDefaultResponse,
  handleMenu,
  handleUpdateProfile
};
