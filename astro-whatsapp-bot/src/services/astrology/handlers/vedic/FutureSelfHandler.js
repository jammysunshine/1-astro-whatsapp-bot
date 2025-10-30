/**
 * Future Self Handler
 * Handles evolutionary potential and future self analysis
 */
const logger = require('../../../../utils/logger');
const { DashaAnalysisCalculator } = require('../../vedic/calculators/DashaAnalysisCalculator');

const handleFutureSelf = async (message, user) => {
  if (!message.includes('future') && !message.includes('self') && !message.includes('potential') && !message.includes('evolution')) {
    return null;
  }

  if (!user.birthDate) {
    return '🔮 Future Self Analysis requires your birth date. Please provide DD/MM/YYYY format.';
  }

  try {
    const dashaCalculator = new DashaAnalysisCalculator();
    // Set services if available
    if (global.vedicCore?.geocodingService) {
      dashaCalculator.setServices({ geocodingService: global.vedicCore.geocodingService });
    }

    const birthData = {
      birthDate: user.birthDate,
      birthTime: user.birthTime || '12:00',
      name: user.name || 'User',
      birthPlace: user.birthPlace || 'Unknown'
    };

    const analysis = await dashaCalculator.calculateVimshottariDasha(birthData);
    if (analysis.error) {
      return '❌ Error generating future self analysis.';
    }

    return `🔮 *Future Self Dasha Analysis*\n\n${analysis.summary}\n\n🌱 *Evolutionary Timeline:*\nNext major dasha: ${analysis.nextMahadasha?.planet || 'Continuing current'}\nEnd date: ${analysis.currentMahadasha?.endDate?.toLocaleDateString() || 'Ongoing'}\n\n✨ *Current Life Period:*\n${analysis.analysis?.themes.join(', ') || 'Transformation and growth'}\n\n🌀 *Dasha Wisdom:* Each planetary period brings specific lessons and opportunities for your soul's evolution. Embrace the energies of ${analysis.currentMahadasha?.planet} for continuous spiritual development.`;
  } catch (error) {
    logger.error('Future self analysis error:', error);
    return '❌ Error generating future self analysis.';
  }
};

module.exports = { handleFutureSelf };