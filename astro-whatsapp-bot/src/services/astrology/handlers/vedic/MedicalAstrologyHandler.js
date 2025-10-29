/**
 * Medical Astrology Handler
 * Handles health and medical astrology requests
 */
const logger = require('../../../../utils/logger');
const MundaneAstrologyReader = require('../../../mundaneAstrology');

const handleMedicalAstrology = async (message, user) => {
  if (!message.includes('medical') && !message.includes('health') && !message.includes('disease') && !message.includes('illness') && !message.includes('health analysis')) {
    return null;
  }

  if (!user.birthDate) {
    return '🏥 *Medical Astrology Analysis*\n\n👤 I need your birth details for personalized health analysis.\n\nSend format: DDMMYY or DDMMYYYY\nExample: 150691 (June 15, 1991)';
  }

  try {
    const mundaneReader = new MundaneAstrologyReader();
    const chartData = {
      planets: {},
      houses: {},
      aspects: []
    };

    const healthAnalysis = await mundaneReader.generateMundaneAnalysis(chartData, 'health');

    if (healthAnalysis.error) {
      return '❌ Unable to generate mundane astrology analysis for health.';
    }

    const healthResult = `🏥 *Medical Astrology Analysis*\n\n${healthAnalysis.focusArea ? healthAnalysis.focusArea.toUpperCase() + ' ' : ''}Health Analysis:\n${healthAnalysis.disclaimer || ''}\n\n`;

    if (healthAnalysis.worldEvents && healthAnalysis.worldEvents.length > 0) {
      healthResult += `🩺 *Health Events:*\n${healthAnalysis.worldEvents.map(event => `• ${event.prediction}`).join('\n')}\n\n`;
    }

    if (healthAnalysis.timingAnalysis) {
      healthResult += `⏰ *Timing:*\n${healthAnalysis.timingAnalysis.currentPeriod || ''}\n\n`;
    }

    if (healthAnalysis.recommendations && healthAnalysis.recommendations.length > 0) {
      healthResult += `💊 *Recommendations:*\n${healthAnalysis.recommendations.map(rec => `• ${rec}`).join('\n')}\n\n`;
    }

    return healthResult;
  } catch (error) {
    logger.error('Medical astrology error:', error);
    return '❌ Error generating medical astrology analysis.';
  }
};

module.exports = { handleMedicalAstrology };