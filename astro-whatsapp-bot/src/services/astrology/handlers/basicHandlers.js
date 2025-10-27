const { matchesIntent } = require('../utils/intentUtils');
const logger = require('../../../utils/logger');

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
 * @returns {string} Default response with interactive options
 */
const handleDefaultResponse = (message, user) => {
  // Default response with interactive options
  return `🌟 *Welcome to Your Cosmic Journey!*\n\nI'm your Personal Cosmic Coach, ready to guide you through the mysteries of the stars. Here are some popular cosmic explorations:\n\n🔮 *Daily Guidance:*\n• "horoscope" - Your daily cosmic weather\n• "birth chart" - Your complete astrological blueprint\n• "numerology" - Your soul's numerical code\n\n🌏 *World Traditions:*\n• "chinese" - BaZi Four Pillars analysis\n• "vedic" - Traditional Hindu astrology\n• "tarot" - Mystical card readings\n\n💫 *Specialized Insights:*\n• "compatibility" - Relationship astrology\n• "career" - Professional path guidance\n• "future self" - Life timeline simulation\n\n🕉️ *Ancient Wisdom:*\n• "kundli" - Vedic birth chart\n• "remedies" - Planetary healing practices\n• "muhurta" - Auspicious timing\n\nWhat aspect of your cosmic journey interests you most? ✨`;
};

/**
 * Handle menu requests
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {string|null} Menu response or null if not a menu request
 */
const handleMenu = (message, user) => {
  if (matchesIntent(message, ['menu', 'help', 'options', 'what can you do', 'commands'])) {
    return `🌟 *Cosmic Coach Menu - Your Guide to the Stars*\n\n*🔮 BASIC READINGS*\nhoroscope - Daily cosmic guidance\nbirth chart - Complete astrological analysis\nnumerology - Soul's numerical blueprint\n\n*🌏 WORLD TRADITIONS*\nchinese/bazi - Four Pillars of Destiny\nvedic/kundli - Hindu astrology\nislamic - Ilm-e-Nujum & Taqdeer\ntarot - Mystical card readings\n\n*💫 SPECIALIZED INSIGHTS*\ncompatibility - Relationship analysis\ncareer - Professional guidance\nmedical - Health astrology\nfinancial - Wealth patterns\nfuture self - Life timeline\n\n*🕉️ ANCIENT WISDOM*\nremedies - Planetary healing\nmuhurta - Auspicious timing\npanchang - Hindu calendar\nfestivals - Sacred celebrations\n\n*🔍 ADVANCED ANALYSIS*\ndasha - Planetary periods\nashtakavarga - Strength analysis\nvarga charts - Divisional charts\nprogressions - Soul's evolution\n\nSimply type any of these keywords to begin your cosmic exploration! ✨`;
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
    return `📝 *Update Your Cosmic Profile*\n\nTo provide accurate astrological guidance, I need your birth details. Please share:\n\n*Required:*\n• Birth date (DD/MM/YYYY)\n• Birth place (City, Country)\n\n*Recommended:*\n• Birth time (HH:MM) for precise calculations\n• Full name for personalized readings\n\n*Example:*\n15/06/1990, 14:30, Mumbai, India\n\nSend your details now, and I'll update your profile for future readings! ✨`;
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