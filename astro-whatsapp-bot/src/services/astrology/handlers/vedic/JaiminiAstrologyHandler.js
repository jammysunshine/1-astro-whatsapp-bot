/**
 * Jaimini Astrology Handler
 * Handles Jaimini astrology and karaka analysis requests
 */
const logger = require('../../../../utils/logger');
const { calculateJaiminiKarakaAnalysis } = require('../vedic/calculations');

const handleJaiminiAstrology = async (message, user) => {
  if (!message.includes('jaimini') && !message.includes('sphuta') && !message.includes('karaka') && !message.includes('jaimini astrology')) {
    return null;
  }

  if (!user.birthDate) {
    return '🌟 *Jaimini Astrology - Karaka Analysis*\n\n👤 I need your birth details for Jaimini karaka calculations.\n\nSend format: DDMMYY or DDMMYYYY\nExample: 150691 (June 15, 1991)';
  }

  try {
    // Calculate Jaimini karakas using Swiss Ephemeris
    const karakaAnalysis = await calculateJaiminiKarakaAnalysis(user);

    return `🌟 *Jaimini Astrology - Karaka (Significator) Analysis*\n\n${karakaAnalysis.introduction}\n\n🪐 *Your Planetary Karakas:*\n${karakaAnalysis.karakas.map(k => `• ${k.name}: ${k.significator} (${k.planet}: ${k.description})`).join('\n')}\n\n📊 *Karaka Hierarchy:*\n${karakaAnalysis.primaryKaraka} ${karakaAnalysis.secondaryKaraka}\n\n🔮 *Sphuta Positions (Jaimini calculation):*\n${karakaAnalysis.sphutaAnalysis.map(s => `• ${s.position}: ${s.interpretation}`).join('\n')}\n\n🎯 *Key Insights:*\n${karakaAnalysis.insights.map(i => `• ${i.insight}`).join('\n')}\n\n🧘 *Jaimini Wisdom:*\n${karakaAnalysis.guidance}\n\n✨ *Note:* Jaimini astrology focuses on karakas (significators) as controllers of life aspects, different from mainstream Western ruling planets. 🕉️`;
  } catch (error) {
    logger.error('Jaimini Astrology analysis error:', error);
    return '❌ Error generating Jaimini astrology analysis. Please try again.';
  }
};

module.exports = { handleJaiminiAstrology };