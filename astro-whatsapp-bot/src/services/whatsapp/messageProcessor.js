// src/services/whatsapp/messageProcessor.js
// Message processor for generating astrology responses

const logger = require('../../utils/logger');
const { getUserByPhone, createUser } = require('../../models/userModel');
const { sendTextMessage, sendInteractiveMessage } = require('./messageSender');
const { generateAstrologyResponse } = require('../astrology/astrologyEngine');

/**
 * Process user message and generate appropriate astrology response
 * @param {string} phoneNumber - User's WhatsApp number
 * @param {string} messageText - Text of the user's message
 * @param {string} messageId - WhatsApp message ID
 * @param {string} timestamp - Message timestamp
 */
const processUserMessage = async (phoneNumber, messageText, messageId, timestamp) => {
  try {
    logger.info(`Processing message from ${phoneNumber}: ${messageText}`);

    // Get or create user
    let user = await getUserByPhone(phoneNumber);
    if (!user) {
      logger.info(`New user detected: ${phoneNumber}`);
      user = await createUser(phoneNumber);
    }

    // Process the message based on content and user state
    const response = await generateAstrologyResponse(messageText, user);
    
    // Send response back to user
    await sendTextMessage(phoneNumber, response);

    logger.info(`Astrology response sent to ${phoneNumber}`);
  } catch (error) {
    logger.error(`Error processing message from ${phoneNumber}:`, error);
    // Send error message to user
    try {
      await sendTextMessage(phoneNumber, 'Sorry, I encountered an error processing your message. Please try again.');
    } catch (sendError) {
      logger.error(`Error sending error message to ${phoneNumber}:`, sendError);
    }
  }
};

/**
 * Generate appropriate astrology response based on user message
 * @param {string} messageText - User's message
 * @param {Object} user - User object with profile information
 * @returns {string} Response text to send back to user
 */
const generateAstrologyResponse = async (messageText, user) => {
  const lowerMessage = messageText.toLowerCase().trim();

  // Handle greeting messages
  if (isGreeting(lowerMessage)) {
    if (!user.birthDate) {
      return getGreetingWithOnboarding(user);
    } else {
      return getGreeting(user);
    }
  }

  // Handle help requests
  if (lowerMessage.includes('help') || lowerMessage.includes('menu') || lowerMessage.includes('options')) {
    return getHelpMessage();
  }

  // Handle profile setup requests
  if (lowerMessage.includes('profile') || lowerMessage.includes('details') || lowerMessage.includes('birth')) {
    return getProfileSetupMessage();
  }

  // Handle astrology service requests
  if (lowerMessage.includes('horoscope') || lowerMessage.includes('daily') || lowerMessage.includes('today')) {
    return getDailyHoroscopeMessage(user);
  }

  if (lowerMessage.includes('compatibility') || lowerMessage.includes('match') || lowerMessage.includes('love')) {
    return getCompatibilityMessage();
  }

  if (lowerMessage.includes('kundli') || lowerMessage.includes('chart')) {
    return getKundliMessage();
  }

  // Handle subscription-related queries
  if (lowerMessage.includes('subscription') || lowerMessage.includes('premium') || lowerMessage.includes('plan')) {
    return getSubscriptionMessage();
  }

  // Handle general astrology questions
  if (lowerMessage.includes('what') || lowerMessage.includes('how') || lowerMessage.includes('?')) {
    return getGeneralAstrologyResponse(user);
  }

  // Default response
  return getDefaultResponse(user);
};

/**
 * Check if message is a greeting
 */
const isGreeting = (message) => {
  const greetings = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'namaste', 'hola'];
  return greetings.some(greeting => message.includes(greeting));
};

/**
 * Get greeting message for new users
 */
const getGreetingWithOnboarding = (user) => {
  return `🌟 Welcome to your Personal Cosmic Coach! ✨
  
I'm here to guide you with clarity, confidence, and control in uncertain times.

To get personalized astrological insights, please share your birth details:
• Date of birth (DD/MM/YYYY)
• Time of birth (HH:MM, if known)
• Place of birth (City, Country)

Once I have this, I can create your personalized birth chart and provide insights tailored just for you!

To see all options, just type "help"`;
};

/**
 * Get greeting message for existing users
 */
const getGreeting = (user) => {
  return `🌟 Welcome back to your Personal Cosmic Coach! ✨

Ready to explore what the stars have in store for you? 

To see options: type "help"
For daily insights: type "daily horoscope"
To check compatibility: type "compatibility"
For your birth chart: type "my kundli"

How can I help you today?`;
};

/**
 * Get help message with available options
 */
const getHelpMessage = () => {
  return `🔮 *Available Services* 🔮

*Free Services:*
• Daily micro-prediction - "daily"
• Birth chart visualization - "my kundli" 
• 7-day transit summary - "transits"
• Compatibility checking - "match with [name]"

*Premium Services:*
• Daily personalized horoscope - "upgrade"
• AI Twin (personalized AI astrologer) - "ai twin"
• Transit Timing Engine - "transit timing"
• Astro-Social Network - "social"

*To get started:*
• Share your birth details: "My birth is [date] [time] [place]"
• Check today's energy: "daily"
• See what's trending: "trending"

Type "profile" to update your details or "subscription" to learn about plans!`;
};

/**
 * Get profile setup message
 */
const getProfileSetupMessage = () => {
  return `📋 *Profile Setup*

To get personalized astrological readings, I need your birth details:

**Required:**
• Date of birth (DD/MM/YYYY)
• Time of birth (HH:MM) - if unknown, I'll use sunrise time
• Place of birth (City, Country)

**Example:** "My birth details are: 15/03/1990, 07:30, Mumbai, India"

**Optional:**
• Gender
• Preferred language
• Time zone

Privacy: Your birth details are securely stored and used only for astrological calculations.`;
};

/**
 * Get daily horoscope message
 */
const getDailyHoroscopeMessage = (user) => {
  if (!user.birthDate) {
    return `🌟 To get your personalized daily horoscope, please share your birth details first! 🌟
    
Type "profile" to add your birth information.`;
  }
  
  return `☀️ *Your Daily Cosmic Forecast*

Based on your chart, today's energies suggest:

*Personal Energy:* [Would be calculated based on user's chart]
*Best Time for:* [Would be calculated based on transits]
*Cosmic Highlight:* [Would be calculated based on current planetary positions]

For your full personalized forecast, consider upgrading to Premium! 

To upgrade: type "upgrade"`;
};

/**
 * Get compatibility message
 */
const getCompatibilityMessage = () => {
  return `💕 *Compatibility Matching*

Check astrological compatibility with friends, family, or partners!

*For yourself:* "check my compatibility"
*With someone:* "compatibility with John Doe" (they need to share their birth details too)

*Premium members* can check unlimited compatibility matches!

To get started: type "profile" to add your birth details first.`;
};

/**
 * Get kundli message
 */
const getKundliMessage = () => {
  return `📄 *Your Personal Birth Chart*

Your kundli contains the positions of planets at your birth time, revealing your personality, life patterns, and future possibilities.

*To generate your chart:*
1. Add your birth details first (type "profile")
2. I'll create an interactive birth chart
3. Share it with friends to check compatibility!

*Premium members* get enhanced chart analysis with detailed insights!

Get started now by sharing your birth details: "My birth is [date] [time] [place]"`;
};

/**
 * Get subscription message
 */
const getSubscriptionMessage = () => {
  return `💎 *Subscription Plans*

*Free:* Daily micro-prediction, birth chart visualization, 7-day transit summary, community forum access, compatibility checking with one additional person
*Essential:* ₹230/month (35% discount from original ₹299) - Daily personalized horoscope with action items, weekly video predictions from AI avatar of top astrologer, monthly group Q&A sessions with astrologers, basic compatibility matching (up to 5 people)
*Premium:* ₹299/month (UPI, PayTM, Google Pay, NetBanking, Cards) - Unlimited questions to AI, priority access to human astrologers (24-hour response vs. 72-hour), personalized monthly reports with 3-month forecasts, access to exclusive remedial solutions, compatibility checking with unlimited people
*VIP:* ₹799/month - All Premium features, dedicated human astrologer (user choice of top 3), quarterly in-depth life planning sessions, personalized meditation and mindfulness practices based on chart, special access to rare planetary event readings, exclusive VIP-only community access

To upgrade: type "upgrade" or visit our website (link will be shared)`;
};

/**
 * Get general astrology response
 */
const getGeneralAstrologyResponse = (user) => {
  let response = `🔮 *Cosmic Insights*

I can provide personalized guidance based on your birth chart! 

Currently, I offer:`;

  if (!user.birthDate) {
    response += '\n\n 📋 *First, add your birth details:* "My birth is [date] [time] [place]"';
  } else {
    response += `
  
• Daily horoscopes based on your chart
• Compatibility analysis with others  
• Transit timing for important decisions
• Remedial suggestions for challenging periods
• Career and relationship guidance`;
  }

  response += `

For immediate help: type "help"
To explore: type "explore"`;

  return response;
};

/**
 * Get default response
 */
const getDefaultResponse = (user) => {
  return `🌟 *Personal Cosmic Coach* 🌟

I'm your AI-powered astrologer, here to provide clarity, confidence, and control!

*Quick Start:*
${user.birthDate ? '• "Daily" - Get today\'s forecast' : '• "Profile" - Add your birth details first!'}
• "Help" - See all available services
• "Compatibility" - Check matches with others
• "Upgrade" - Learn about premium features

Your personal cosmic insights are just a message away! ✨`;
};

module.exports = {
  processUserMessage,
  generateAstrologyResponse,
  isGreeting,
  getGreetingWithOnboarding,
  getGreeting,
  getHelpMessage,
  getProfileSetupMessage,
  getDailyHoroscopeMessage,
  getCompatibilityMessage,
  getKundliMessage,
  getSubscriptionMessage,
  getGeneralAstrologyResponse,
  getDefaultResponse
};