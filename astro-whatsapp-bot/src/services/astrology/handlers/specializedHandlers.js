// Connected to actual service implementations - QUICK WINS
const tarorReader = require('../tarotReader');
const { IChingService } = require('../iching');
const astrocartographyReader = require('../astrocartographyReader');

/**
 * Handle Tarot reading requests
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {string|null} Response or null if not handled
 */
const handleTarot = async(message, user) => {
  if (!message.includes('tarot') && !message.includes('cards')) {
    return null;
  }

  try {
    const reading = tarorReader.generateTarotReading(user);
    if (reading.error) {
      return '❌ Unable to generate tarot reading at this time.';
    }

    return `🔮 *Tarot Reading*\n\n${reading.interpretation}\n\n🎴 *Cards Drawn:* ${reading.cards.length} cards\n💫 *Personal Guidance:* ${reading.advice}`;
  } catch (error) {
    console.error('Tarot reading error:', error);
    return '❌ Error generating tarot reading. Please try again.';
  }
};

/**
 * Handle I Ching reading requests
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {string|null} Response or null if not handled
 */
const handleIChing = async(message, user) => {
  if (!message.includes('iching') && !message.includes('i ching') && !message.includes('oracle')) {
    return null;
  }

  try {
    const ichingService = new IChingService();
    const reading = ichingService.generateIChingReading();
    if (reading.error) {
      return '❌ Unable to consult the I Ching oracle at this time.';
    }

    return reading.ichingDescription;
  } catch (error) {
    console.error('I Ching reading error:', error);
    return '❌ Error consulting the I Ching oracle. Please try again.';
  }
};

// Connected to actual service implementations - QUICK WINS
const { PrashnaAstrology } = require('../prashnaAstrology');

/**
 * Handle Prashna Astrology requests
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {string|null} Response or null if not handled
 */
const handlePrashna = async(message, user) => {
  if (!message.includes('prashna') && !message.includes('question') && !message.includes('answer') && !message.includes('consult') && !message.includes('horary')) {
    return null;
  }

  // Extract the actual question from the message
  const question = message.replace(/prashna|question|answer|consult|horary/gi, '').replace(/^\s+|\s+$/g, '');
  if (!question || question.length < 5) {
    return '❓ *Prashna Astrology - Question-Based Divination*\n\nPlease ask a specific question for accurate horary analysis.\n\nExamples:\n• "Will I get the job?"\n• "When will my relationship improve?"\n• "Should I invest in property now?"';
  }

  try {
    const prashnaService = new PrashnaAstrology();
    const currentTime = new Date();

    const prashnaData = {
      question,
      questionTime: `${currentTime.getHours()}:${currentTime.getMinutes()}`,
      questionDate: `${currentTime.getDate()}/${currentTime.getMonth() + 1}/${currentTime.getFullYear()}`,
      questionLocation: {
        latitude: user.latitude || 28.6139, // Default Delhi
        longitude: user.longitude || 77.2090,
        timezone: user.timezone || 5.5
      },
      user
    };

    const prashnaReading = await prashnaService.generatePrashnaAnalysis(prashnaData);

    if (prashnaReading.error) {
      return '❌ Unable to generate prashna reading. Please ensure your birth details are complete.';
    }

    return prashnaReading.summary;
  } catch (error) {
    console.error('Prashna reading error:', error);
    return '❌ Error generating prashna analysis. Please try again.';
  }
};

/**
 * Handle Chinese Astrology requests
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {string|null} Response or null if not handled
 */
const handleChineseAstrology = async(message, user) => {
  if (!message.includes('chinese') && !message.includes('bazi') && !message.includes('four pillars')) {
    return null;
  }

  return '🏮 *Chinese Astrology - Four Pillars*\n\nAncient Chinese wisdom analyzes life through heavenly stems and earthly branches, revealing your Ba Zi (Eight Characters) destiny chart.\n\nFour Pillars reveal:\n• Day Master (core self)\n• Year Pillar (ancestral influences)\n• Month Pillar (family/siblings)\n• Hour Pillar (children/legacy)\n\nThese elements combine to show your natural talents, challenges, and optimal life path in harmony with Chinese cosmology.';
};

/**
 * Handle Kabbalistic Astrology requests
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {string|null} Response or null if not handled
 */
const handleKabbalistic = async(message, user) => {
  if (!message.includes('kabbal') && !message.includes('tree of life') && !message.includes('sephiroth')) {
    return null;
  }

  return '✡️ *Kabbalistic Astrology*\n\nHebrew mystical tradition connects the Tree of Life (Etz Chaim) with planetary influences. The ten Sephiroth represent divine emanations:\n\n🌳 *Tree Structure:*\n• Kether (Crown) - divine will\n• Chokmah (Wisdom) - pure understanding\n• Binah (Understanding) - analytical wisdom\n• Chesed (Mercy) - unconditional love\n• Geburah (Severity) - divine justice\n• Tiphareth (Beauty) - harmony\n• Netzach (Victory) - enduring passion\n• Hod (Glory) - intellect and communication\n• Yesod (Foundation) - astral/emotional realm\n• Malkuth (Kingdom) - physical manifestation\n\nPlanets bridge kabbalistic spheres, revealing soul\'s journey through divine light.';
};

/**
 * Handle Mayan Astrology requests
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {string|null} Response or null if not handled
 */
const handleMayan = async(message, user) => {
  if (!message.includes('mayan') && !message.includes('maya') && !message.includes('aztec')) {
    return null;
  }

  return '🗿 *Mayan Astrology*\n\nAncient Mesoamerican calendar system reveals divine cycles through day signs and cosmic energies. Your Mayan birth sign determines your archetypal energies:\n\n🌞 *Key Elements:*\n• Tzolkin (260-day sacred calendar)\n• Haab (365-day solar calendar)\n• Thirteen galactic tones\n• Twenty day signs\n• Nahual (spirit companion)\n• Galactic signature\n\n🗓️ *Mayan Day Signs:*\n• Imox - primordial waters, intuitive wisdom\n• Ik - breath of life, vital energy\n• Akbal - darkness, inner strength\n• Kan - seed, abundance\n• Chicchan - serpent, kundalini energy\n\nYour Mayan sign reveals archetypal forces guiding your sacred service.';
};

/**
 * Handle Celtic Astrology requests
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {string|null} Response or null if not handled
 */
const handleCeltic = async(message, user) => {
  if (!message.includes('celtic') && !message.includes('druid') && !message.includes('tree sign')) {
    return null;
  }

  return '🌿 *Celtic Tree Astrology*\n\nDruid wisdom connects human destiny with sacred trees through Ogham alphabet. Your Celtic tree sign reveals personality and life path:\n\n🌳 *Celtic Tree Signs:*\n• Birch - new beginnings, purification\n• Rowan - protection, inspiration\n• Alder - warrior spirit, courage\n• Willow - intuition, healing\n• Hawthorn - love, beauty, transformation\n• Oak - strength, endurance, leadership\n• Holly - courage, survival instinct\n• Hazel - wisdom, divination\n• Vine - joy, spiritual growth\n• Ivy - determination, independence\n• Reed - loyalty, family bonds\n• Elder - transformation, regeneration\n\nEach tree offers unique energies for personal growth and understanding natural cycles.';
};

/**
 * Handle Astrocartography requests
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {string|null} Response or null if not handled
 */
const handleAstrocartography = async(message, user) => {
  if (!message.includes('astro') && !message.includes('cartography') && !message.includes('geographic')) {
    return null;
  }

  if (!user.birthDate) {
    return '🗺️ Astrocartography requires your birth details. Please provide date, time, and place.';
  }

  try {
    const birthData = {
      birthDate: user.birthDate,
      birthTime: user.birthTime || '12:00',
      birthPlace: user.birthPlace || 'Unknown',
      name: user.name || 'User'
    };

    const reading = astrocartographyReader.generateAstrocartography(birthData);

    if (reading.error) {
      return '❌ Unable to generate astrocartography at this time.';
    }

    return reading.astrocartographyDescription;
  } catch (error) {
    console.error('Astrocartography reading error:', error);
    return '❌ Error generating astrocartography reading. Please try again.';
  }
};

/**
 * Handle Varga Charts requests
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {string|null} Response or null if not handled
 */
const handleVargaCharts = async(message, user) => {
  if (!message.includes('varga') && !message.includes('division') && !message.includes('divisional') &&
      !message.includes('navamsa') && !message.includes('dashamsa') && !message.includes('hora')) {
    return null;
  }

  if (!user.birthDate) {
    return '🕉️ Varga Charts require your birth details. Please complete your profile first.';
  }

  try {
    const { VargaCharts } = require('../vargaCharts');
    const vargaService = new VargaCharts();

    const birthData = {
      birthDate: user.birthDate,
      birthTime: user.birthTime || '12:00',
      birthPlace: user.birthPlace || 'Unknown'
    };

    const vargaAnalysis = await vargaService.calculateVargaCharts(birthData, ['NAVAMSA', 'DASHAMSA', 'HORA']);

    if (vargaAnalysis.error) {
      return `🕉️ *Vedic Varga Charts*\n\n${vargaAnalysis.fallbackMessage || 'Unable to calculate divisional charts at this time.'}`;
    }

    // Basic summary for handler
    let response = '🕉️ *Vedic Varga Charts Analysis*\n\nKey Divisional Charts:\n';

    if (vargaAnalysis.vargaCharts.NAVAMSA) {
      response += `💍 Navamsa (Marriage): Ascendant in ${vargaAnalysis.vargaCharts.NAVAMSA.ascendantSign}\n`;
    }

    if (vargaAnalysis.vargaCharts.DASHAMSA) {
      response += `🏢 Dashamsa (Career): Ascendant in ${vargaAnalysis.vargaCharts.DASHAMSA.ascendantSign}\n`;
    }

    if (vargaAnalysis.vargaCharts.HORA) {
      response += `💰 Hora (Wealth): Ascendant in ${vargaAnalysis.vargaCharts.HORA.ascendantSign}\n`;
    }

    response += '\nVarga charts divide your birth chart to show specialized life areas. For detailed analysis, use the menu options.';

    return response;
  } catch (error) {
    console.error('Varga charts error:', error);
    return '❌ Error analyzing varga charts. Please try again.';
  }
};

/**
 * Handle Palmistry requests
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {string|null} Response or null if not handled
 */
const handlePalmistry = async(message, user) => {
  if (!message.includes('palmistry') && !message.includes('palm reading')) {
    return null;
  }
  return '✋ *Palmistry Analysis*\n\nPalmistry analysis is not yet implemented. Please check back later!';
};

module.exports = {
  handleChineseAstrology,
  handleTarot,
  handlePalmistry,
  handleKabbalistic,
  handleMayan,
  handleCeltic,
  handleIChing,
  handlePrashna,
  handleAstrocartography,
  handleVargaCharts
};