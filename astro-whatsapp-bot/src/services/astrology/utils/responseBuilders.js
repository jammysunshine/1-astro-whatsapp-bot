const logger = require('../../../utils/logger');

/**
 * Build horoscope response
 * @param {Object} horoscopeData - Horoscope data
 * @param {string} sunSign - User's sun sign
 * @param {Object} user - User object
 * @returns {string} Formatted horoscope response
 */
const buildHoroscopeResponse = (horoscopeData, sunSign, user) => {
  // Format the horoscope data into readable text
  let horoscopeText = horoscopeData.general;
  if (horoscopeData.luckyColor) {
    horoscopeText += `\n\n🎨 *Lucky Color:* ${horoscopeData.luckyColor}`;
  }
  if (horoscopeData.luckyNumber) {
    horoscopeText += `\n🔢 *Lucky Number:* ${horoscopeData.luckyNumber}`;
  }
  if (horoscopeData.love) {
    horoscopeText += `\n💕 *Love:* ${horoscopeData.love}`;
  }
  if (horoscopeData.career) {
    horoscopeText += `\n💼 *Career:* ${horoscopeData.career}`;
  }
  if (horoscopeData.finance) {
    horoscopeText += `\n💰 *Finance:* ${horoscopeData.finance}`;
  }
  if (horoscopeData.health) {
    horoscopeText += `\n🏥 *Health:* ${horoscopeData.health}`;
  }

  // Add social proof and progress tracking
  const userCount = process.env.SOCIAL_PROOF_COUNT || 2847; // Configurable social proof
  const insightsReceived = user.insightsReceived || 0;

  return `🌟 *Daily Horoscope for ${sunSign}*\n\n${horoscopeText}\n\n⭐ *${userCount} users* with your sign found today's guidance particularly accurate!\n\n📊 *Your Cosmic Journey:* ${insightsReceived + 1} personalized insights received\n\nRemember, the stars guide us but you create your destiny! ✨`;
};

/**
 * Build BaZi analysis response
 * @param {Object} baziAnalysis - BaZi analysis data
 * @param {Object} zodiacInfo - Chinese zodiac info
 * @returns {string} Formatted BaZi response
 */
const buildBaZiResponse = (baziAnalysis, zodiacInfo) => {
  let response = '🌏 *Your BaZi (Four Pillars of Destiny) Analysis*\n\n';
  response += `*Four Pillars:* ${baziAnalysis.chineseNotation}\n\n`;
  response += `*Day Master:* ${baziAnalysis.dayMaster.stem} (${baziAnalysis.dayMaster.element}) - ${baziAnalysis.dayMaster.strength} energy\n\n`;
  response += '*Element Analysis:*\n';
  response += `Strongest: ${baziAnalysis.elementAnalysis.strongest}\n`;
  response += `Balance: ${baziAnalysis.elementAnalysis.balance}\n\n`;
  response += `*Chinese Zodiac:* ${zodiacInfo.animal} (${zodiacInfo.element})\n`;
  response += `*Traits:* ${zodiacInfo.traits}\n\n`;
  response += `*Interpretation:* ${baziAnalysis.interpretation}\n\n`;
  response +=
    'Would you like your Vedic birth chart or compatibility analysis?';

  return response;
};

/**
 * Build tarot reading response
 * @param {Object} reading - Tarot reading data
 * @returns {string} Formatted tarot response
 */
const buildTarotResponse = reading => {
  let response = '🔮 *Tarot Reading*\n\n';
  response += `*Spread:* ${reading.spread}\n\n`;

  reading.cards.forEach((card, index) => {
    response += `*${card.position}:* ${card.name}\n`;
    response += `• ${card.meaning}\n`;
    if (card.advice) {
      response += `• *Advice:* ${card.advice}\n`;
    }
    response += '\n';
  });

  response += `*Overall Message:* ${reading.overallMessage}\n\n`;
  response +=
    'Remember, tarot offers guidance, not certainty. Trust your intuition! ✨';

  return response;
};

/**
 * Build palmistry analysis response
 * @param {Object} analysis - Palmistry analysis data
 * @returns {string} Formatted palmistry response
 */
const buildPalmistryResponse = analysis => {
  let response = '🤲 *Palmistry Analysis*\n\n';
  response += `*Hand Type:* ${analysis.handType}\n`;
  response += `*Personality:* ${analysis.personality}\n\n`;

  response += '*Key Lines:*\n';
  analysis.lines.forEach(line => {
    response += `• *${line.name}:* ${line.interpretation}\n`;
  });

  response += '\n*Mounts Analysis:*\n';
  analysis.mounts.forEach(mount => {
    response += `• *${mount.name}:* ${mount.significance}\n`;
  });

  response += `\n*Life Path:* ${analysis.lifePath}\n\n`;
  response += 'Palmistry reveals the story written on your hands! 🪬';

  return response;
};

/**
 * Build fixed stars analysis response
 * @param {Object} fixedStarsAnalysis - Fixed stars analysis data
 * @returns {string} Formatted fixed stars response
 */
const buildFixedStarsResponse = fixedStarsAnalysis => {
  let response = '⭐ *Fixed Stars Analysis*\n\n';
  response += '*Ancient Stellar Influences:*\n\n';

  if (fixedStarsAnalysis.aspects.length > 0) {
    fixedStarsAnalysis.aspects.forEach(aspect => {
      response += `🌟 *${aspect.planet} conjunct ${aspect.fixedStar}*\n`;
      response += `• ${aspect.significance}\n\n`;
    });
  } else {
    response += '• General cosmic wisdom and stellar guidance\n\n';
  }

  if (fixedStarsAnalysis.interpretations.lifePurpose) {
    response += `*Life Purpose:* ${fixedStarsAnalysis.interpretations.lifePurpose}\n\n`;
  }

  if (fixedStarsAnalysis.interpretations.gifts.length > 0) {
    response += '*Stellar Gifts:*\n';
    fixedStarsAnalysis.interpretations.gifts.slice(0, 3).forEach(gift => {
      response += `• ${gift}\n`;
    });
    response += '\n';
  }

  response += '*Major Fixed Stars:*\n';
  response += '• Regulus: Royal leadership and success\n';
  response += '• Spica: Abundance and scholarly wisdom\n';
  response += '• Arcturus: Justice and prosperity\n';
  response += '• Antares: Courage and regeneration\n';
  response += '• Vega: Harmony and artistic expression\n';
  response += '• Sirius: Brilliance and spiritual guidance\n\n';

  response += 'Fixed stars connect you to timeless cosmic archetypes! ✨';

  return response;
};

/**
 * Build medical astrology response
 * @param {Object} medicalAnalysis - Medical astrology analysis data
 * @returns {string} Formatted medical astrology response
 */
const buildMedicalAstrologyResponse = medicalAnalysis => {
  let response = '🏥 *Medical Astrology Analysis*\n\n';
  response += '*Traditional Health Insights:*\n\n';

  response += `*6th House (Health):* ${medicalAnalysis.sixthHouse.sign} - ${medicalAnalysis.sixthHouse.healthFocus}\n`;
  response += `*Ruling Planet:* ${medicalAnalysis.sixthHouse.ruler}\n\n`;

  if (medicalAnalysis.healthTendencies.length > 0) {
    response += '*Health Tendencies:*\n';
    medicalAnalysis.healthTendencies.forEach(tendency => {
      response += `• ${tendency}\n`;
    });
    response += '\n';
  }

  if (medicalAnalysis.wellnessRecommendations.length > 0) {
    response += '*Wellness Recommendations:*\n';
    medicalAnalysis.wellnessRecommendations.forEach(rec => {
      response += `• ${rec}\n`;
    });
    response += '\n';
  }

  response += '*Planetary Body Rulerships:*\n';
  Object.entries(medicalAnalysis.planetaryRulers).forEach(([planet, data]) => {
    response += `• *${planet}:* ${data.bodyParts}\n`;
  });
  response += '\n';

  response += '*Medical Astrology Summary:*\n';
  response += `${medicalAnalysis.summary}\n\n`;

  response += 'Medical astrology provides traditional insights for holistic wellness! 🌿';

  return response;
};

/**
 * Build financial astrology response
 * @param {Object} financialAnalysis - Financial astrology analysis data
 * @returns {string} Formatted financial astrology response
 */
const buildFinancialAstrologyResponse = financialAnalysis => {
  let response = '💰 *Financial Astrology Analysis*\n\n';
  response += '*Wealth & Prosperity Insights:*\n\n';

  response += `*2nd House (Wealth):* ${financialAnalysis.secondHouse.sign} - ${financialAnalysis.secondHouse.wealthFocus}\n`;
  response += `*Ruling Planet:* ${financialAnalysis.secondHouse.ruler}\n\n`;

  if (financialAnalysis.financialTendencies.length > 0) {
    response += '*Financial Tendencies:*\n';
    financialAnalysis.financialTendencies.forEach(tendency => {
      response += `• ${tendency}\n`;
    });
    response += '\n';
  }

  if (financialAnalysis.prosperityIndicators.length > 0) {
    response += '*Prosperity Indicators:*\n';
    financialAnalysis.prosperityIndicators.forEach(indicator => {
      response += `• ${indicator}\n`;
    });
    response += '\n';
  }

  response += '*Key Wealth Planets:*\n';
  Object.entries(financialAnalysis.wealthPlanets).forEach(([planet, data]) => {
    if (data.planet) {
      response += `• *${data.planet}:* ${data.sign} - ${data.influence}\n`;
    } else {
      response += `• *${planet}:* ${data.sign} - ${data.influence}\n`;
    }
  });
  response += '\n';

  response += '*Financial Astrology Summary:*\n';
  response += `${financialAnalysis.summary}\n\n`;

  response += 'Financial astrology reveals your natural wealth patterns and optimal paths to prosperity! 💎';

  return response;
};

/**
 * Build harmonic astrology response
 * @param {Object} harmonicAnalysis - Harmonic astrology analysis data
 * @returns {string} Formatted harmonic astrology response
 */
const buildHarmonicAstrologyResponse = harmonicAnalysis => {
  let response = '🔮 *Harmonic Astrology Analysis*\n\n';
  response += '*Deeper Chart Patterns & Hidden Harmonics:*\n\n';

  if (harmonicAnalysis.dominantHarmonics.length > 0) {
    response += '*Dominant Harmonics:*\n';
    harmonicAnalysis.dominantHarmonics.forEach(harmonic => {
      response += `• ${harmonic}\n`;
    });
    response += '\n';
  }

  if (harmonicAnalysis.keyPatterns.length > 0) {
    response += '*Key Patterns:*\n';
    harmonicAnalysis.keyPatterns.forEach(pattern => {
      response += `• ${pattern}\n`;
    });
    response += '\n';
  }

  if (harmonicAnalysis.lifeThemes.length > 0) {
    response += '*Life Themes:*\n';
    harmonicAnalysis.lifeThemes.forEach(theme => {
      response += `• ${theme}\n`;
    });
    response += '\n';
  }

  if (harmonicAnalysis.harmonicAspects.length > 0) {
    response += '*Harmonic Aspects:*\n';
    harmonicAnalysis.harmonicAspects.slice(0, 3).forEach(aspect => {
      response += `• ${aspect.planets}: ${aspect.aspect}\n`;
    });
    response += '\n';
  }

  response += '*Harmonic Astrology Summary:*\n';
  response += `${harmonicAnalysis.summary}\n\n`;

  response += 'Harmonic astrology reveals the deeper rhythms and patterns of your soul\'s journey! ✨';

  return response;
};

/**
 * Build numerology response
 * @param {Object} numerologyAnalysis - Numerology analysis data
 * @returns {string} Formatted numerology response
 */
const buildNumerologyResponse = numerologyAnalysis => {
  let response = '🔢 *Numerology Analysis*\n\n';
  response += '*Your Core Numbers:*\n\n';

  response += `*Life Path:* ${numerologyAnalysis.coreNumbers.lifePath} - ${numerologyAnalysis.interpretations.lifePath.split(':')[0] || 'Your life journey'}\n`;
  response += `*Expression:* ${numerologyAnalysis.coreNumbers.expression} - ${numerologyAnalysis.interpretations.expression.split(':')[0] || 'Your natural talents'}\n`;
  response += `*Soul Urge:* ${numerologyAnalysis.coreNumbers.soulUrge} - ${numerologyAnalysis.interpretations.soulUrge.split(':')[0] || 'Your inner desires'}\n`;
  response += `*Personality:* ${numerologyAnalysis.coreNumbers.personality} - ${numerologyAnalysis.interpretations.personality.split(':')[0] || 'Your outward self'}\n`;
  response += `*Birthday:* ${numerologyAnalysis.coreNumbers.birthday} - ${numerologyAnalysis.interpretations.birthday.split(':')[0] || 'Your birthday energy'}\n\n`;

  if (numerologyAnalysis.strengths.length > 0) {
    response += '*Key Strengths:*\n';
    numerologyAnalysis.strengths.forEach(strength => {
      response += `• ${strength}\n`;
    });
    response += '\n';
  }

  if (numerologyAnalysis.lifePurpose) {
    response += `*Life Purpose:* ${numerologyAnalysis.lifePurpose}\n\n`;
  }

  response += '*Numerology Summary:*\n';
  response += `${numerologyAnalysis.summary}\n\n`;

  response += 'Your numbers hold the key to understanding your soul\'s blueprint! 🔑';

  return response;
};

/**
 * Build career astrology response
 * @param {Object} careerAnalysis - Career astrology analysis data
 * @returns {string} Formatted career astrology response
 */
const buildCareerAstrologyResponse = careerAnalysis => {
  let response = '💼 *Career Astrology Analysis*\n\n';
  response += '*Professional Path & Vocation:*\n\n';

  response += `*10th House (Career):* ${careerAnalysis.tenthHouse.sign} - ${careerAnalysis.tenthHouse.careerFocus}\n`;
  response += `*Midheaven:* ${careerAnalysis.midheaven.sign} - ${careerAnalysis.midheaven.careerDirection}\n`;
  response += `*Ruling Planet:* ${careerAnalysis.tenthHouse.ruler}\n\n`;

  if (careerAnalysis.careerTendencies.length > 0) {
    response += '*Career Tendencies:*\n';
    careerAnalysis.careerTendencies.forEach(tendency => {
      response += `• ${tendency}\n`;
    });
    response += '\n';
  }

  if (careerAnalysis.vocationalStrengths.length > 0) {
    response += '*Vocational Strengths:*\n';
    careerAnalysis.vocationalStrengths.forEach(strength => {
      response += `• ${strength}\n`;
    });
    response += '\n';
  }

  response += '*Key Career Planets:*\n';
  Object.entries(careerAnalysis.careerPlanets).forEach(([planet, data]) => {
    if (data.planet) {
      response += `• *${data.planet}:* ${data.sign} - ${data.influence}\n`;
    } else {
      response += `• *${planet}:* ${data.sign} - ${data.influence}\n`;
    }
  });
  response += '\n';

  response += '*Career Astrology Summary:*\n';
  response += `${careerAnalysis.summary}\n\n`;

  response += 'Your career astrology reveals your professional destiny and optimal vocational path! 🎯';

  return response;
};

logger.info('Module: responseBuilders loaded successfully.');

module.exports = {
  buildHoroscopeResponse,
  buildBaZiResponse,
  buildTarotResponse,
  buildPalmistryResponse,
  buildFixedStarsResponse,
  buildMedicalAstrologyResponse,
  buildFinancialAstrologyResponse,
  buildHarmonicAstrologyResponse,
  buildNumerologyResponse,
  buildCareerAstrologyResponse
};
