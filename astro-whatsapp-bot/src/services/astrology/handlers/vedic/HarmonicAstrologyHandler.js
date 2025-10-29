/**
 * Harmonic Astrology Handler
 * Handles life rhythm and harmonic analysis requests
 */
const logger = require('../../../../utils/logger');
const { AgeHarmonicAstrologyReader } = require('../../../ageHarmonicAstrology');

const handleHarmonicAstrology = async (message, user) => {
  if (!message.includes('harmonic') && !message.includes('cycle') && !message.includes('rhythm') && !message.includes('pattern')) {
    return null;
  }

  try {
    const harmonicReader = new AgeHarmonicAstrologyReader();
    const birthData = {
      birthDate: user.birthDate || '15/06/1991',
      birthTime: user.birthTime || '14:30',
      name: user.name || 'User',
      birthPlace: user.birthPlace || 'Delhi, India'
    };

    const analysis = await harmonicReader.generateAgeHarmonicAnalysis(birthData);
    if (analysis.error) {
      return '❌ Error generating harmonic astrology analysis.';
    }

    return `🎵 *Harmonic Astrology - Life Rhythms*\n\n${analysis.interpretation}\n\n🎯 *Current Harmonic:* ${analysis.currentHarmonics.map(h => h.name).join(', ')}\n\n🔮 *Life Techniques:* ${analysis.techniques.slice(0, 3).join(', ')}\n\n🌀 *Harmonic age divides lifespan into rhythmic cycles. Each harmonic reveals different developmental themes and planetary activations. Your current rhythm emphasizes ${analysis.currentHarmonics[0]?.themes.join(', ') || 'growth patterns'}.`;
  } catch (error) {
    logger.error('Harmonic astrology error:', error);
    return '❌ Error generating harmonic astrology analysis.';
  }
};

module.exports = { handleHarmonicAstrology };