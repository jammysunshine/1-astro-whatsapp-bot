const logger = require('../../../utils/logger');

/**
 * Handle greeting messages
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {string|null} Response or null if not handled
 */
const handleGreeting = (message, user) => {
  const greetings = ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening'];

  if (greetings.some(greeting => message.includes(greeting))) {
    return `🌟 Hello! I'm the Astro Wisdom Bot. I can help you with astrology readings, numerology, tarot, and more mystical insights.\n\nUse the menu to explore available services.`;
  }

  return null;
};

/**
 * Handle menu requests
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {string|null} Response or null if not handled
 */
const handleMenu = (message, user) => {
  const menuKeywords = ['menu', 'options', 'services', 'help'];

  if (menuKeywords.some(keyword => message.includes(keyword))) {
    return "📋 Use the interactive menu buttons below to explore services, or type 'menu' at any time.";
  }

  return null;
};

/**
 * Handle profile update requests
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {string|null} Response or null if not handled
 */
const handleUpdateProfile = (message, user) => {
  const profileKeywords = ['update', 'profile', 'birth', 'change', 'edit'];

  if (profileKeywords.some(keyword => message.includes(keyword))) {
    return `📝 Profile Update\n\nTo update your birth details, send:\nBirth date (DDMMYY): 150690\nBirth time (HHMM): 1430\nBirth place: Mumbai, India`;
  }

  return null;
};

/**
 * Handle default responses when no handlers match
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {string} Default response
 */
const handleDefaultResponse = (message, user) => {
  const helpfulHints = [
    "Try asking about your daily horoscope or birth chart!",
    "I can analyze compatibility, provide numerology insights, or give tarot readings.",
    "Use the menu to see all available astrology services.",
    "Tell me your birth details to get personalized readings."
  ];

  const randomHint = helpfulHints[Math.floor(Math.random() * helpfulHints.length)];

  return `🌟 I understand you're looking for astrological guidance!\n\n${randomHint}\n\nWhat would you like to explore today?`;
};

module.exports = {
  handleGreeting,
  handleMenu,
  handleUpdateProfile,
  handleDefaultResponse
};