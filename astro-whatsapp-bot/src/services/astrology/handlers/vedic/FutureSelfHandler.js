/**
 * Future Self Handler
 * Handles evolutionary potential and future self analysis
 */
const logger = require('../../../../utils/logger');
const { AgeHarmonicAstrologyReader } = require('../../../ageHarmonicAstrology');

const handleFutureSelf = async (message, user) => {
  if (!message.includes('future') && !message.includes('self') && !message.includes('potential') && !message.includes('evolution')) {
    return null;
  }

  if (!user.birthDate) {
    return '🔮 Future Self Analysis requires your birth date. Please provide DD/MM/YYYY format.';
  }

  try {
    const harmonicReader = new AgeHarmonicAstrologyReader();
    const birthData = {
      birthDate: user.birthDate,
      birthTime: user.birthTime || '12:00',
      name: user.name || 'User',
      birthPlace: user.birthPlace || 'Unknown'
    };

    const analysis = await harmonicReader.generateAgeHarmonicAnalysis(birthData);
    if (analysis.error) {
      return '❌ Error generating future self analysis.';
    }

    return `🔮 *Future Self Analysis*\n\n${analysis.interpretation}\n\n🌱 *Evolutionary Timeline:*\n${analysis.nextHarmonic ? `Next activation: ${analysis.nextHarmonic.name} at age ${analysis.nextHarmonic.ageRange}` : 'Continuing current development'}\n\n✨ *Peak Potentials:*\n${analysis.currentHarmonics.map(h => h.themes.join(', ')).join('; ')}\n\n🌀 *Transformational Path:* Your future self develops through harmonic cycles, each bringing new dimensions of growth and self-realization.`;
  } catch (error) {
    logger.error('Future self analysis error:', error);
    return '❌ Error generating future self analysis.';
  }
};

module.exports = { handleFutureSelf };