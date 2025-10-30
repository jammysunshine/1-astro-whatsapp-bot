/**
 * Ayurvedic Astrology Handler
 * Handles Ayurvedic constitution and dosha analysis requests
 */
const logger = require('../../../../utils/logger');
const ayurvedicAstrology = require('../../ayurvedicAstrology');

const handleAyurvedicAstrology = async (message, user) => {
  if (!message.includes('ayurvedic') && !message.includes('ayurveda') && !message.includes('constitution')) {
    return null;
  }

  if (!user.birthDate) {
    return '🌿 *Ayurvedic Astrology - Dosha Constitution*\n\n👤 I need your birth details for Ayurvedic constitution analysis.\n\nSend format: DDMMYY or DDMMYYYY\nExample: 150691 (June 15, 1991)';
  }

  try {
    const constitution = ayurvedicAstrology.determineConstitution(user);
    const recommendations = ayurvedicAstrology.generateRecommendations(user);

    return `🌿 *Ayurvedic Astrology - Your Constitution*\n\n${constitution.description}\n\n💫 *Your Dosha Balance:*\n${constitution.doshaBreakdown}\n\n🏥 *Health Guidelines:*\n${recommendations.health}\n\n🍽️ *Dietary Wisdom:*\n${recommendations.diet}\n\n🧘 *Lifestyle:*\n${recommendations.lifestyle}`;
  } catch (error) {
    logger.error('Ayurvedic Astrology error:', error);
    return '❌ Error determining Ayurvedic constitution. Please try again.';
  }
};

module.exports = { handleAyurvedicAstrology };