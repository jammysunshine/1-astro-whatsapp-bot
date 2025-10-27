const vedicCalculator = require('../vedicCalculator');
const { matchesIntent } = require('../utils/intentUtils');
const { buildHoroscopeResponse, buildNumerologyResponse } = require('../utils/responseBuilders');
const logger = require('../../../utils/logger');

/**
 * Handle daily horoscope requests
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {Promise<string|null>} Horoscope response or null if not a horoscope request
 */
const handleHoroscope = async (message, user) => {
  if (matchesIntent(message, ['horoscope', 'daily', /^what'?s my (daily )?horoscope/])) {
    if (!user.birthDate) {
      return 'I\'d love to give you a personalized daily horoscope! Please share your birth date (DD/MM/YYYY) first so I can calculate your sun sign.';
    }

    try {
      const sunSign = vedicCalculator.calculateSunSign(user.birthDate);
      const horoscopeData = await vedicCalculator.generateDailyHoroscope({
        birthDate: user.birthDate,
        birthTime: user.birthTime,
        birthPlace: user.birthPlace
      });

      return buildHoroscopeResponse(horoscopeData, sunSign, user);
    } catch (error) {
      logger.error('Error generating horoscope:', error);
      return 'I\'m having trouble generating your horoscope right now. Please try again later.';
    }
  }
  return null;
};

/**
 * Handle numerology requests
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {Promise<string|null>} Numerology response or null if not a numerology request
 */
const handleNumerology = async (message, user) => {
  if (matchesIntent(message, ['numerology', 'numbers', 'life path number', 'expression number', 'soul urge', /^numerology/, /^numbers/])) {
    if (!user.birthDate) {
      return 'For numerology analysis, I need your birth details and full name to calculate your core numbers.\n\nPlease provide:\n• Birth date (DD/MM/YYYY)\n• Full name (as it appears on birth certificate)\n\nExample: 15/06/1990, John Michael Smith';
    }

    try {
      const numerologyAnalysis = vedicCalculator.calculateNumerology({
        birthDate: user.birthDate,
        name: user.name || 'Unknown'
      });

      if (numerologyAnalysis.error) {
        return `I encountered an issue: ${numerologyAnalysis.error}`;
      }

      return buildNumerologyResponse(numerologyAnalysis);
    } catch (error) {
      logger.error('Error generating numerology analysis:', error);
      return 'I\'m having trouble calculating your numerology right now. Please try again later.';
    }
  }
  return null;
};

/**
 * Handle solar return requests
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {Promise<string|null>} Solar return response or null if not a solar return request
 */
const handleSolarReturn = async (message, user) => {
  if (matchesIntent(message, ['solar return', 'birthday chart', 'annual chart', 'year ahead', /^solar.?return/])) {
    if (!user.birthDate) {
      return 'For solar return analysis, I need your complete birth details to calculate your annual birthday chart.\n\nPlease provide:\n• Birth date (DD/MM/YYYY)\n• Birth time (HH:MM)\n• Birth place (City, Country)\n\nExample: 15/06/1990, 14:30, Mumbai, India';
    }

    try {
      const solarReturnAnalysis = vedicCalculator.calculateSolarReturn({
        birthDate: user.birthDate,
        birthTime: user.birthTime || '12:00',
        birthPlace: user.birthPlace || 'Delhi'
      });

      if (solarReturnAnalysis.error) {
        return `I encountered an issue: ${solarReturnAnalysis.error}`;
      }

      let response = '🌞 *Solar Return Analysis*\n\n';
      response += `*Your ${solarReturnAnalysis.yearAhead} Birthday Chart:*\n\n`;

      response += `*Solar Return Date:* ${solarReturnAnalysis.solarReturnDate}\n`;
      response += `*Time:* ${solarReturnAnalysis.solarReturnTime}\n\n`;

      if (solarReturnAnalysis.dominantThemes.length > 0) {
        response += '*Dominant Themes for the Year:*\n';
        solarReturnAnalysis.dominantThemes.forEach(theme => {
          response += `• ${theme}\n`;
        });
        response += '\n';
      }

      if (solarReturnAnalysis.opportunities.length > 0) {
        response += '*Key Opportunities:*\n';
        solarReturnAnalysis.opportunities.forEach(opportunity => {
          response += `• ${opportunity}\n`;
        });
        response += '\n';
      }

      if (solarReturnAnalysis.challenges.length > 0) {
        response += '*Areas of Growth:*\n';
        solarReturnAnalysis.challenges.forEach(challenge => {
          response += `• ${challenge}\n`;
        });
        response += '\n';
      }

      response += '*Solar Return Summary:*\n';
      response += `${solarReturnAnalysis.summary}\n\n`;

      response += 'Your solar return reveals the cosmic themes for your coming year! 📅';

      return response;
    } catch (error) {
      logger.error('Error generating solar return analysis:', error);
      return 'I\'m having trouble calculating your solar return chart right now. Please try again later.';
    }
  }
  return null;
};

/**
 * Handle asteroid analysis requests
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {Promise<string|null>} Asteroid analysis response or null if not an asteroid request
 */
const handleAsteroids = async (message, user) => {
  if (matchesIntent(message, ['asteroids', 'asteroid analysis', 'chiron', 'juno', 'vesta', 'pallas', /^asteroid/])) {
    if (!user.birthDate) {
      return 'For asteroid analysis, I need your complete birth details to calculate Chiron, Juno, Vesta, and Pallas positions.\n\nPlease provide:\n• Birth date (DD/MM/YYYY)\n• Birth time (HH:MM)\n• Birth place (City, Country)\n\nExample: 15/06/1990, 14:30, Mumbai, India';
    }

    try {
      const asteroidAnalysis = vedicCalculator.calculateAsteroids({
        birthDate: user.birthDate,
        birthTime: user.birthTime || '12:00',
        birthPlace: user.birthPlace || 'Delhi'
      });

      if (asteroidAnalysis.error) {
        return `I encountered an issue: ${asteroidAnalysis.error}`;
      }

      let response = '🪐 *Asteroid Analysis*\n\n';
      response += '*Four Key Asteroids:*\n\n';

      // Chiron
      response += `🌾 *Ceres in ${asteroidAnalysis.asteroids.ceres.sign}*\n`;
      response += `• Nurturing Style: ${asteroidAnalysis.interpretations.ceres.nurturingStyle}\n`;
      response += `• Caregiving Approach: ${asteroidAnalysis.interpretations.ceres.caregivingApproach}\n\n`;

      response += `🩹 *Chiron in ${asteroidAnalysis.asteroids.chiron.sign}*\n`;
      response += `• Core Wound: ${asteroidAnalysis.interpretations.chiron.coreWound}\n`;
      response += `• Healing Gift: ${asteroidAnalysis.interpretations.chiron.healingGift}\n\n`;


      response += `💍 *Juno in ${asteroidAnalysis.asteroids.juno.sign}*\n`;
      response += `• Relationship Style: ${asteroidAnalysis.interpretations.juno.relationshipStyle}\n`;
      response += `• Commitment Style: ${asteroidAnalysis.interpretations.juno.commitmentStyle}\n\n`;


      response += `🏛️ *Vesta in ${asteroidAnalysis.asteroids.vesta.sign}*\n`;
      response += `• Sacred Focus: ${asteroidAnalysis.interpretations.vesta.sacredFocus}\n`;
      response += `• Devotion Style: ${asteroidAnalysis.interpretations.vesta.devotionStyle}\n\n`;


      response += `🎨 *Pallas in ${asteroidAnalysis.asteroids.pallas.sign}*\n`;
      response += `• Wisdom Type: ${asteroidAnalysis.interpretations.pallas.wisdomType}\n`;
      response += `• Problem Solving: ${asteroidAnalysis.interpretations.pallas.problemSolving}\n\n`;

      response += '*Asteroid Wisdom:*\n';
      response += '• Chiron shows your deepest wounds and healing gifts\n';
      response += '• Juno reveals your partnership patterns and needs\n';
      response += '• Vesta indicates your sacred focus and dedication\n';
      response += '• Pallas shows your strategic wisdom and creativity\n\n';

      response += 'These asteroids add psychological depth to your astrological profile! 🔮';

      return response;
    } catch (error) {
      logger.error('Error generating asteroid analysis:', error);
      return 'I\'m having trouble calculating your asteroid positions right now. Please try again later.';
    }
  }
  return null;
};

logger.info('Module: westernHandlers loaded successfully.');

module.exports = {
  handleHoroscope,
  handleNumerology,
  handleSolarReturn,
  handleAsteroids
};