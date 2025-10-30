/**
 * Harmonic Astrology Handler
 * Handles life rhythm and harmonic analysis requests
 */
const logger = require('../../../../utils/logger');

const handleHarmonicAstrology = async(message, user) => {
  if (!message.includes('harmonic') && !message.includes('cycle') && !message.includes('rhythm') && !message.includes('pattern')) {
    return null;
  }

  try {
    // Simple harmonic astrology response using basic life cycle analysis
    const currentAge = user.birthDate ? new Date().getFullYear() - new Date(user.birthDate.split('/').reverse().join('-')).getFullYear() : 30;

    const lifeCycles = [
      { phase: 'Foundation', age: '0-20 years', themes: 'Building basics, learning, self-discovery' },
      { phase: 'Development', age: '21-35 years', themes: 'Career, relationships, establishing independence' },
      { phase: 'Mastery', age: '36-50 years', themes: 'Leadership, wisdom, major life contributions' },
      { phase: 'Reflection', age: '51+ years', themes: 'Legacy, inner peace, guiding others' }
    ];

    const currentCycle = lifeCycles.find(cycle => {
      const ageRange = cycle.age.split('-');
      const minAge = parseInt(ageRange[0]);
      const maxAge = parseInt(ageRange[1]) || 100; // Handle '51+ years'
      return currentAge >= minAge && currentAge <= maxAge;
    }) || lifeCycles[1];

    const cycleInsights = [
      'Life follows predictable metamorphic phases',
      'Each decade brings new developmental opportunities',
      'Understanding your current life cycle enhances decision-making',
      'Harmonic progression reveals natural growth patterns'
    ];

    return `🎵 *Life Harmonic Analysis*\n\n*Current Age:* ~${currentAge} years\n*Life Phase:* ${currentCycle.phase}\n*Age Range:* ${currentCycle.age}\n\n*Themes:* ${currentCycle.themes}\n\n🔮 *Key Insights:*\n• ${cycleInsights.slice(0, 3).join('\n• ')}\n\n🌀 *Harmonic astrology reveals the divine rhythm of your life's journey. Each phase brings unique challenges and opportunities for growth.*`;
  } catch (error) {
    logger.error('Harmonic astrology error:', error);
    return '❌ Error generating harmonic astrology analysis.';
  }
};

module.exports = { handleHarmonicAstrology };
