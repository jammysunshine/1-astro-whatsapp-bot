/**
 * Vimshottari Dasha Handler
 * Handles Vimshottari Dasha period requests
 */
const logger = require('../../../../utils/logger');

const vimshottariDasha = require('../../vimshottariDasha');

const handleVimshottariDasha = async(message, user) => {
  if (
    !message.includes('dasha') &&
    !message.includes('vimshottari') &&
    !message.includes('planetary period') &&
    !message.includes('dasha analysis')
  ) {
    return null;
  }

  if (!user.birthDate) {
    return '⏰ *Vimshottari Dasha Analysis*\n\n👤 I need your birth details for dasha calculations.\n\nSend format: DDMMYY or DDMMYYYY\nExample: 150691 (June 15, 1991)';
  }

  try {
    const dashaCalculation = await vimshottariDasha.calculateCurrentDasha(user);

    if (dashaCalculation.error) {
      return '❌ Unable to calculate vimshottari dasha. Please enter complete birth date.';
    }

    return `⏰ *Vimshottari Dasha Analysis - 120-Year Planetary Cycle*\n\n${dashaCalculation.description}\n\n📊 *Current Mahadasha:* ${dashaCalculation.currentMahadasha}\n${dashaCalculation.mahadashaRuler} ruling for ${dashaCalculation.yearsRemaining} years\n\n🏃 *Current Antardasha:* ${dashaCalculation.currentAntardasha}\n${dashaCalculation.antardashaRuler} ruling for ${dashaCalculation.monthsRemaining} months\n\n🔮 *Next Transitions:*\n• Next Antardasha: ${dashaCalculation.nextAntardasha} (${dashaCalculation.nextRuler})\n• Next Mahadasha: ${dashaCalculation.nextMahadasha}\n\n✨ *Influences:* ${dashaCalculation.influences}\n\n💫 *Vedic Wisdom:* The dasha system reveals timing of planetary influences over your life's journey. 🕉️`;
  } catch (error) {
    logger.error('Vimshottari Dasha calculation error:', error);
    return '❌ Error calculating Vimshottari Dasha. Please try again.';
  }
};

module.exports = { handleVimshottariDasha };
