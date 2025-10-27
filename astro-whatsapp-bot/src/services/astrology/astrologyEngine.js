const logger = require('../../utils/logger');
const vedicCalculator = require('./vedicCalculator');
const chineseCalculator = require('./chineseCalculator');
const tarotReader = require('./tarotReader');
const palmistryReader = require('./palmistryReader');
const nadiReader = require('./nadiReader');
const kabbalisticReader = require('./kabbalisticReader');
const mayanReader = require('./mayanReader');
const celticReader = require('./celticReader');
const ichingReader = require('./ichingReader');
const astrocartographyReader = require('./astrocartographyReader');
const horaryReader = require('./horaryReader');
const { VedicRemedies } = require('./vedicRemedies');
const { IslamicAstrology } = require('./islamicAstrology');
const { VimshottariDasha } = require('./vimshottariDasha');
const { JaiminiAstrology } = require('./jaiminiAstrology');
const { NadiAstrology } = require('./nadiAstrology');
const { HinduFestivals } = require('./hinduFestivals');
const { VedicNumerology } = require('./vedicNumerology');
const { AyurvedicAstrology } = require('./ayurvedicAstrology');

// Configuration for horary timezone
const HORARY_TIMEZONE = process.env.HORARY_TIMEZONE || 'Asia/Kolkata';

logger.info(
  'Module: astrologyEngine loaded. All sub-modules imported successfully.'
);

/**
 * Extract partner birth data from user message
 * @param {string} message - User message
 * @returns {Object|null} Partner data or null if not found
 */
const extractPartnerData = message => {
  const lowerMessage = message.toLowerCase();

  // Check if message contains birth date pattern
  const dateMatch = message.match(/(\d{1,2}\/\d{1,2}\/\d{4})/);
  if (!dateMatch) { return null; }

  const birthDate = dateMatch[1];

  // Extract name if provided
  let name = 'Partner';
  const nameMatch = message.match(/(?:name:?\s*|partner:?\s*)([A-Za-z\s]+)/i);
  if (nameMatch) {
    name = nameMatch[1].trim();
  }

  // Extract birth time if provided
  let birthTime = '12:00';
  const timeMatch = message.match(/(\d{1,2}:\d{2})/);
  if (timeMatch) {
    birthTime = timeMatch[1];
  }

  // Extract birth place if provided
  let birthPlace = 'Delhi, India';
  const placeMatch = message.match(/(?:place:?\s*|birthplace:?\s*|born in:?\s*)([A-Za-z\s,]+)/i);
  if (placeMatch) {
    birthPlace = placeMatch[1].trim();
  } else {
    // Try to extract place from remaining text
    const placePatterns = message.split(birthDate)[1];
    if (placePatterns) {
      const placeWords = placePatterns.match(/([A-Za-z\s,]+)/);
      if (placeWords && placeWords[1].trim().length > 2) {
        birthPlace = placeWords[1].trim();
      }
    }
  }

  return {
    name,
    birthDate,
    birthTime,
    birthPlace
  };
};

// Initialize Vedic Remedies system
const vedicRemedies = new VedicRemedies();

// Initialize Islamic Astrology system
const islamicAstrology = new IslamicAstrology();

// Initialize Vimshottari Dasha system
const vimshottariDasha = new VimshottariDasha();

// Initialize Jaimini Astrology system
const jaiminiAstrology = new JaiminiAstrology();

// Initialize Nadi Astrology system
const nadiAstrology = new NadiAstrology();

// Initialize Hindu Festivals system
const hinduFestivals = new HinduFestivals();

// Initialize Vedic Numerology system
const vedicNumerology = new VedicNumerology();

// Initialize Ayurvedic Astrology system
const ayurvedicAstrology = new AyurvedicAstrology();

/**
 * Improved intent recognition using regex patterns for better accuracy
 * @param {string} message - The user message
 * @param {Array<string|RegExp>} patterns - Array of patterns to match
 * @returns {boolean} True if any pattern matches
 */
const matchesIntent = (message, patterns) => patterns.some(pattern => {
  if (typeof pattern === 'string') {
    return message.includes(pattern.toLowerCase());
  }
  return pattern.test(message);
});

/**
 * Generates an astrology response based on user input and user data.
 * Uses basic Vedic astrology calculations for MVP functionality.
 * @param {string} messageText - The text message from the user.
 * @param {Object} user - The user object containing profile information.
 * @returns {Promise<string>} The generated astrology response.
 */
const generateAstrologyResponse = async(messageText, user) => {
  logger.info(
    `Generating astrology response for user ${user.phoneNumber} with message: ${messageText}`
  );

  const message = messageText.toLowerCase().trim();

  // Greeting responses
  if (matchesIntent(message, ['hello', 'hi', 'hey', /^greetings?/])) {
    return `🌟 Hello ${user.name || 'cosmic explorer'}! Welcome to your Personal Cosmic Coach. I'm here to help you navigate your cosmic journey. What would you like to explore today?`;
  }

  // Daily horoscope
  if (matchesIntent(message, ['horoscope', 'daily', /^what'?s my (daily )?horoscope/])) {
    if (!user.birthDate) {
      return 'I\'d love to give you a personalized daily horoscope! Please share your birth date (DD/MM/YYYY) first so I can calculate your sun sign.';
    }

    const sunSign = vedicCalculator.calculateSunSign(user.birthDate);
    const horoscopeData = await vedicCalculator.generateDailyHoroscope({
      birthDate: user.birthDate,
      birthTime: user.birthTime,
      birthPlace: user.birthPlace
    });

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
  }

  // Chinese astrology (BaZi) requests
  if (matchesIntent(message, ['chinese', 'bazi', 'four pillars', '八字', /^ba.?zi/])) {
    if (!user.birthDate) {
      return 'To generate your BaZi (Four Pillars) analysis, I need your birth details. Please provide:\n• Birth date (DD/MM/YYYY)\n• Birth time (HH:MM) - optional but recommended\n• Birth place (City, Country)\n\nExample: 15/06/1990, 14:30, Beijing, China';
    }

    try {
      const baziAnalysis = chineseCalculator.calculateFourPillars(
        user.birthDate,
        user.birthTime || '12:00'
      );
      const zodiacInfo = chineseCalculator.getChineseZodiac(user.birthDate);

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
    } catch (error) {
      logger.error('Error generating BaZi analysis:', error);
      return 'I\'m having trouble generating your BaZi analysis right now. Please try again later.';
    }
  }

  // Tarot reading requests
  if (matchesIntent(message, ['tarot', 'card', 'reading', /^tarot/])) {
    try {
      const spread = message.includes('celtic') ?
        'celtic' :
        message.includes('three') ?
          'three' :
          message.includes('single') ?
            'single' :
            'single';

      let reading;
      switch (spread) {
      case 'celtic':
        reading = tarotReader.celticCrossReading();
        break;
      case 'three':
        reading = tarotReader.threeCardReading();
        break;
      default:
        reading = tarotReader.singleCardReading();
      }

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
    } catch (error) {
      logger.error('Error generating tarot reading:', error);
      return 'I\'m having trouble connecting with the tarot cards right now. Please try again later.';
    }
  }

  // Palmistry requests
  if (matchesIntent(message, ['palm', 'hand', 'palmistry', /^palm/])) {
    try {
      const analysis = palmistryReader.generatePalmistryAnalysis();

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
    } catch (error) {
      logger.error('Error generating palmistry analysis:', error);
      return 'I\'m having trouble reading the palm lines right now. Please try again later.';
    }
  }

  // Nadi astrology requests
  if (matchesIntent(message, ['nadi', 'south indian', 'palm leaf', /^nadi/])) {
    if (!user.birthDate) {
      return 'For Nadi astrology analysis, I need your birth details. Nadi readings are highly specific to exact birth information.\n\nPlease provide:\n• Birth date (DD/MM/YYYY)\n• Birth time (HH:MM)\n• Birth place (City, State, Country)\n\nExample: 15/06/1990, 14:30, Chennai, Tamil Nadu, India';
    }

    try {
      const nadiAnalysis = nadiAstrology.performNadiReading({
        birthDate: user.birthDate,
        birthTime: user.birthTime || '12:00',
        birthPlace: user.birthPlace || 'Chennai, India',
        name: user.name
      });

      if (nadiAnalysis.error) {
        return `I encountered an issue: ${nadiAnalysis.error}`;
      }

      return nadiAnalysis.summary;

      response += '*Predictions:*\n';
      nadiAnalysis.predictions.forEach(pred => {
        response += `• *${pred.area}:* ${pred.insight}\n`;
      });

      response += `\n*Karmic Insights:* ${nadiAnalysis.karmicInsights}\n\n`;
      response +=
        'Nadi astrology connects you to ancient South Indian wisdom! 🕉️';

      return response;
    } catch (error) {
      logger.error('Error generating Nadi analysis:', error);
      return 'I\'m having trouble accessing the Nadi records right now. Please try again later.';
    }
  }

  // Kabbalistic astrology requests
  if (matchesIntent(message, ['kabbalah', 'kabbalistic', 'tree of life', 'sephiroth', /^kabbal/])) {
    if (!user.birthDate) {
      return 'For Kabbalistic analysis, I need your birth details to map your soul\'s journey on the Tree of Life.\n\nPlease provide:\n• Birth date (DD/MM/YYYY)\n• Birth time (HH:MM) - optional\n\nExample: 15/06/1990, 14:30';
    }

    try {
      const kabbalisticAnalysis = kabbalisticReader.generateKabbalisticChart({
        birthDate: user.birthDate,
        birthTime: user.birthTime || '12:00',
        name: user.name
      });

      return kabbalisticAnalysis.kabbalisticDescription;
    } catch (error) {
      logger.error('Error generating Kabbalistic analysis:', error);
      return 'I\'m having trouble connecting with the Tree of Life energies right now. Please try again later.';
    }
  }

  // Mayan astrology requests
  if (matchesIntent(message, ['mayan', 'tzolk', 'haab', 'mayan calendar', /^mayan/])) {
    if (!user.birthDate) {
      return 'For Mayan calendar analysis, I need your birth date to calculate your Tzolk\'in and Haab dates.\n\nPlease provide:\n• Birth date (DD/MM/YYYY)\n\nExample: 15/06/1990';
    }

    try {
      const mayanAnalysis = mayanReader.generateMayanChart({
        birthDate: user.birthDate,
        birthTime: user.birthTime || '12:00',
        name: user.name
      });

      return mayanAnalysis.mayanDescription;
    } catch (error) {
      logger.error('Error generating Mayan analysis:', error);
      return 'I\'m having trouble connecting with the Mayan calendar energies right now. Please try again later.';
    }
  }

  // Celtic astrology requests
  if (matchesIntent(message, ['celtic', 'druid', 'tree sign', 'celtic astrology', /^celtic/])) {
    if (!user.birthDate) {
      return 'For Celtic tree sign analysis, I need your birth date to determine your tree sign and animal totem.\n\nPlease provide:\n• Birth date (DD/MM/YYYY)\n\nExample: 15/06/1990';
    }

    try {
      const celticAnalysis = celticReader.generateCelticChart({
        birthDate: user.birthDate,
        birthTime: user.birthTime || '12:00',
        name: user.name
      });

      return celticAnalysis.celticDescription;
    } catch (error) {
      logger.error('Error generating Celtic analysis:', error);
      return 'I\'m having trouble connecting with the Celtic forest energies right now. Please try again later.';
    }
  }

  // I Ching requests
  if (matchesIntent(message, ['i ching', 'iching', 'hexagram', 'oracle', /^i.?ching/])) {
    try {
      const question = message
        .replace(/i ching|iching|hexagram|oracle/gi, '')
        .trim();
      const reading = ichingReader.generateIChingReading(question);

      return reading.ichingDescription;
    } catch (error) {
      logger.error('Error generating I Ching reading:', error);
      return 'I\'m having trouble consulting the I Ching oracle right now. Please try again later.';
    }
  }

  // Fixed stars analysis requests
  if (matchesIntent(message, ['fixed stars', 'fixed star analysis', 'stellar influences', 'ancient stars', /^fixed.?star/])) {
    if (!user.birthDate) {
      return 'For fixed stars analysis, I need your complete birth details to analyze ancient stellar influences on your chart.\n\nPlease provide:\n• Birth date (DD/MM/YYYY)\n• Birth time (HH:MM)\n• Birth place (City, Country)\n\nExample: 15/06/1990, 14:30, Mumbai, India';
    }

    try {
      const fixedStarsAnalysis = vedicCalculator.calculateFixedStars({
        birthDate: user.birthDate,
        birthTime: user.birthTime || '12:00',
        birthPlace: user.birthPlace || 'Delhi'
      });

      if (fixedStarsAnalysis.error) {
        return `I encountered an issue: ${fixedStarsAnalysis.error}`;
      }

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
    } catch (error) {
      logger.error('Error generating fixed stars analysis:', error);
      return 'I\'m having trouble analyzing your fixed star influences right now. Please try again later.';
    }
  }

  // Medical astrology requests
  if (matchesIntent(message, ['medical astrology', 'health astrology', 'medical chart', 'health analysis', /^medical/, /^health/])) {
    if (!user.birthDate) {
      return 'For medical astrology analysis, I need your complete birth details to analyze planetary rulerships and health tendencies.\n\nPlease provide:\n• Birth date (DD/MM/YYYY)\n• Birth time (HH:MM)\n• Birth place (City, Country)\n\nExample: 15/06/1990, 14:30, Mumbai, India';
    }

    try {
      const medicalAnalysis = vedicCalculator.calculateMedicalAstrology({
        birthDate: user.birthDate,
        birthTime: user.birthTime || '12:00',
        birthPlace: user.birthPlace || 'Delhi'
      });

      if (medicalAnalysis.error) {
        return `I encountered an issue: ${medicalAnalysis.error}`;
      }

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
    } catch (error) {
      logger.error('Error generating medical astrology analysis:', error);
      return 'I\'m having trouble analyzing your medical astrology chart right now. Please try again later.';
    }
  }

  // Financial astrology requests
  if (matchesIntent(message, ['financial astrology', 'wealth astrology', 'money astrology', 'financial chart', 'wealth analysis', /^financial/, /^wealth/, /^money/])) {
    if (!user.birthDate) {
      return 'For financial astrology analysis, I need your complete birth details to analyze wealth patterns and prosperity indicators.\n\nPlease provide:\n• Birth date (DD/MM/YYYY)\n• Birth time (HH:MM)\n• Birth place (City, Country)\n\nExample: 15/06/1990, 14:30, Mumbai, India';
    }

    try {
      const financialAnalysis = vedicCalculator.calculateFinancialAstrology({
        birthDate: user.birthDate,
        birthTime: user.birthTime || '12:00',
        birthPlace: user.birthPlace || 'Delhi'
      });

      if (financialAnalysis.error) {
        return `I encountered an issue: ${financialAnalysis.error}`;
      }

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
    } catch (error) {
      logger.error('Error generating financial astrology analysis:', error);
      return 'I\'m having trouble analyzing your financial astrology chart right now. Please try again later.';
    }
  }

  // Harmonic astrology requests
  if (matchesIntent(message, ['harmonic astrology', 'harmonic chart', 'harmonic analysis', 'deeper patterns', /^harmonic/])) {
    if (!user.birthDate) {
      return 'For harmonic astrology analysis, I need your complete birth details to analyze deeper chart patterns and hidden harmonics.\n\nPlease provide:\n• Birth date (DD/MM/YYYY)\n• Birth time (HH:MM)\n• Birth place (City, Country)\n\nExample: 15/06/1990, 14:30, Mumbai, India';
    }

    try {
      const harmonicAnalysis = vedicCalculator.calculateHarmonicAstrology({
        birthDate: user.birthDate,
        birthTime: user.birthTime || '12:00',
        birthPlace: user.birthPlace || 'Delhi'
      });

      if (harmonicAnalysis.error) {
        return `I encountered an issue: ${harmonicAnalysis.error}`;
      }

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
    } catch (error) {
      logger.error('Error generating harmonic astrology analysis:', error);
      return 'I\'m having trouble analyzing your harmonic astrology chart right now. Please try again later.';
    }
  }

  // Numerology requests
  if (matchesIntent(message, ['numerology', 'numbers', 'life path number', 'expression number', 'soul urge', /^numerology/, /^numbers/])) {
    if (!user.birthDate) {
      return 'For numerology analysis, I need your birth details and full name to calculate your core numbers.\n\nPlease provide:\n• Birth date (DD/MM/YYYY)\n• Full name (as it appears on birth certificate)\n\nExample: 15/06/1990, John Michael Smith';
    }

    try {
      const numerologyAnalysis = vedicCalculator.calculateNumerology({
        birthDate: user.birthDate,
        name: user.name || 'Unknown'
      });

      if (numerologyAnalysis.error) {
        return `I encountered an issue: ${numerologyAnalysis.error}`;
      }

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
    } catch (error) {
      logger.error('Error generating numerology analysis:', error);
      return 'I\'m having trouble calculating your numerology right now. Please try again later.';
    }
  }

  // Career astrology requests
  if (matchesIntent(message, ['career astrology', 'vocation', 'career path', 'professional', 'job astrology', /^career/, /^vocation/])) {
    if (!user.birthDate) {
      return 'For career astrology analysis, I need your complete birth details to analyze your professional path and vocational strengths.\n\nPlease provide:\n• Birth date (DD/MM/YYYY)\n• Birth time (HH:MM)\n• Birth place (City, Country)\n\nExample: 15/06/1990, 14:30, Mumbai, India';
    }

    try {
      const careerAnalysis = vedicCalculator.calculateCareerAstrology({
        birthDate: user.birthDate,
        birthTime: user.birthTime || '12:00',
        birthPlace: user.birthPlace || 'Delhi'
      });

      if (careerAnalysis.error) {
        return `I encountered an issue: ${careerAnalysis.error}`;
      }

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
    } catch (error) {
      logger.error('Error generating career astrology analysis:', error);
      return 'I\'m having trouble analyzing your career astrology chart right now. Please try again later.';
    }
  }

  // Event astrology requests
  if (matchesIntent(message, ['event astrology', 'cosmic events', 'eclipses', 'planetary events', 'seasonal astrology', 'cosmic calendar', /^event.?astrology/, /^cosmic.?events/])) {
    if (!user.birthDate) {
      return 'For event astrology analysis, I need your complete birth details to correlate cosmic events with your personal chart.\n\nPlease provide:\n• Birth date (DD/MM/YYYY)\n• Birth time (HH:MM)\n• Birth place (City, Country)\n\nExample: 15/06/1990, 14:30, Mumbai, India';
    }

    try {
      const eventAnalysis = vedicCalculator.calculateCosmicEvents({
        birthDate: user.birthDate,
        birthTime: user.birthTime || '12:00',
        birthPlace: user.birthPlace || 'Delhi'
      });

      if (eventAnalysis.error) {
        return `I encountered an issue: ${eventAnalysis.error}`;
      }

      let response = `🌟 *Event Astrology: ${eventAnalysis.period}*\n\n`;
      response += 'Discover how cosmic events influence your personal journey!\n\n';

      // Add eclipses
      if (eventAnalysis.events.eclipses.length > 0) {
        response += '*🌑 Upcoming Eclipses:*\n\n';
        eventAnalysis.events.eclipses.forEach(eclipse => {
          response += `*${eclipse.date} - ${eclipse.type} ${eclipse.subtype} Eclipse*\n`;
          response += `• Significance: ${eclipse.significance}\n`;
          response += `• Visibility: ${eclipse.localVisibility}\n\n`;
        });
      }

      // Add planetary events
      if (eventAnalysis.events.planetaryEvents.length > 0) {
        response += '*🪐 Planetary Events:*\n\n';
        eventAnalysis.events.planetaryEvents.slice(0, 4).forEach(event => {
          response += `*${event.date} - ${event.planet} ${event.event}*\n`;
          response += `• ${event.significance}\n`;
          response += `• Intensity: ${event.intensity}\n\n`;
        });
      }

      // Add seasonal events
      if (eventAnalysis.events.seasonalEvents.length > 0) {
        response += '*🌸 Seasonal Transitions:*\n\n';
        eventAnalysis.events.seasonalEvents.forEach(event => {
          response += `*${event.date} - ${event.event}*\n`;
          response += `• ${event.astrological}\n`;
          response += `• Element: ${event.element}\n\n`;
        });
      }

      // Add personal impact
      if (eventAnalysis.events.personalImpact.length > 0) {
        response += '*🔮 Personal Impact on Your Chart:*\n\n';
        eventAnalysis.events.personalImpact.slice(0, 3).forEach(impact => {
          response += `*${impact.event}*\n`;
          response += `• ${impact.personalImpact}\n`;
          response += `• Affected areas: ${impact.affectedHouses.join(', ')}\n\n`;
        });
      }

      response += '*How to Work with These Energies:*\n';
      response += '• Pay attention to dreams and intuition during eclipses\n';
      response += '• Use retrograde periods for review and reflection\n';
      response += '• Align actions with seasonal energies\n';
      response += '• Trust the cosmic timing of your life\n\n';

      response += 'The universe is always communicating with you! 🌌';

      return response;
    } catch (error) {
      logger.error('Error generating event astrology analysis:', error);
      return 'I\'m having trouble analyzing cosmic events right now. Please try again later.';
    }
  }

  // Future self simulator requests
  if (matchesIntent(message, ['future self', 'future self simulator', 'life timeline', 'long-term forecast', 'alternative pathways', 'what will my life be like', /^future.?self/, /^life.?timeline/])) {
    if (!user.birthDate) {
      return 'For future self simulation, I need your complete birth details to create your long-term life timeline.\n\nPlease provide:\n• Birth date (DD/MM/YYYY)\n• Birth time (HH:MM)\n• Birth place (City, Country)\n\nExample: 15/06/1990, 14:30, Mumbai, India';
    }

    try {
      const futureSelfAnalysis = vedicCalculator.generateFutureSelfSimulator({
        birthDate: user.birthDate,
        birthTime: user.birthTime || '12:00',
        birthPlace: user.birthPlace || 'Delhi',
        name: user.name
      });

      if (futureSelfAnalysis.error) {
        return `I encountered an issue: ${futureSelfAnalysis.error}`;
      }

      let response = `🔮 *Future Self Simulator - ${futureSelfAnalysis.projectionYears} Year Projection*\n\n`;
      response += `Hello ${user.name || 'cosmic explorer'}! Let's explore the potential pathways of your future self.\n\n`;

      // Current life stage
      if (futureSelfAnalysis.lifeStages.length > 0) {
        const currentStage = futureSelfAnalysis.lifeStages[0];
        response += `*Current Life Stage:* ${currentStage.stage} (${currentStage.ageRange})\n`;
        response += `*Themes:* ${currentStage.themes.join(', ')}\n\n`;
      }

      // Major life transitions
      if (futureSelfAnalysis.lifeTimeline.length > 0) {
        response += '*🌟 Major Life Transitions Ahead:*\n\n';
        futureSelfAnalysis.lifeTimeline.forEach(event => {
          response += `*Age ${Math.round(event.age)} - ${event.event}*\n`;
          response += `• Significance: ${event.significance}\n`;
          response += `• Key Themes: ${event.themes.join(', ')}\n\n`;
        });
      }

      // Potential scenarios
      if (futureSelfAnalysis.scenarioModels.length > 0) {
        response += '*🔀 Potential Life Scenarios:*\n\n';
        futureSelfAnalysis.scenarioModels.forEach(scenario => {
          response += `*${scenario.scenario}* (${scenario.category})\n`;
          response += `• Probability: ${scenario.probability}\n`;
          response += `• Timeline: ${scenario.timeline}\n`;
          response += `• Key Indicators: ${scenario.keyIndicators.join(', ')}\n`;
          response += `• Success Factors: ${scenario.successFactors.join(', ')}\n\n`;
        });
      }

      // Goal projections
      if (futureSelfAnalysis.goalProjections.length > 0) {
        response += '*🎯 Goal Achievement Projections:*\n\n';
        const topGoals = futureSelfAnalysis.goalProjections.slice(0, 4);
        topGoals.forEach(projection => {
          response += `*${projection.goal}* (${projection.category})\n`;
          response += `• Likelihood: ${projection.overallLikelihood}\n`;
          if (projection.favorablePeriods.length > 0) {
            response += `• Best Periods: ${projection.favorablePeriods.join(', ')}\n`;
          }
          response += `• Key Factors: ${projection.keyFactors.join(', ')}\n\n`;
        });
      }

      // Future life stages
      if (futureSelfAnalysis.lifeStages.length > 1) {
        response += '*📅 Future Life Stages:*\n\n';
        futureSelfAnalysis.lifeStages.slice(1, 3).forEach(stage => {
          response += `*${stage.stage}* (${stage.ageRange})\n`;
          response += `• Duration: ${stage.duration} years\n`;
          response += `• Themes: ${stage.themes.join(', ')}\n`;
          response += `• Opportunities: ${stage.opportunities.join(', ')}\n\n`;
        });
      }

      response += '*💫 How to Shape Your Future:*\n';
      response += '• Align with your astrological timing\n';
      response += '• Focus on your highest probability scenarios\n';
      response += '• Use goal projections as guideposts\n';
      response += '• Trust your intuition and inner wisdom\n';
      response += '• Take conscious action toward your vision\n\n';

      response += '*Remember:* This is a simulation based on astrological patterns. Your free will and consciousness ultimately shape your destiny. The future is not fixed - it\'s a canvas for your creation! 🎨✨';

      return response;
    } catch (error) {
      logger.error('Error generating future self simulation:', error);
      return 'I\'m having trouble simulating your future self right now. Please try again later.';
    }
  }

  // Group astrology requests
  if (matchesIntent(message, ['group astrology', 'family astrology', 'group reading', 'family reading', 'combined chart', 'group compatibility', /^group.?astrology/, /^family.?astrology/])) {
    if (!user.birthDate) {
      return 'For group astrology analysis, I need your complete birth details first.\n\nPlease provide your birth information:\n• Birth date (DD/MM/YYYY)\n• Birth time (HH:MM)\n• Birth place (City, Country)\n\nExample: 15/06/1990, 14:30, Mumbai, India\n\nThen I can analyze group dynamics with other members!';
    }

    return '👨‍👩‍👧‍👦 *Group & Family Astrology*\n\nDiscover the cosmic dynamics of your family or social group! I can create:\n\n🌟 *Composite Charts* - Combined energy of the group\n🤝 *Compatibility Analysis* - How members interact astrologically\n📊 *Group Dynamics* - Communication styles and decision making\n🎯 *Shared Purpose* - Collective goals and challenges\n⏰ *Timing Insights* - Best periods for group activities\n\n*To get a group reading:*\n\n1. Send your birth details (if not already set)\n2. Provide details for 2-6 other group members\n3. Specify group type: "family", "couple", "friends", or "colleagues"\n\n*Format for each member:*\n```\nName: [Full Name]\nBirth: DD/MM/YYYY, HH:MM\nPlace: [City, Country]\n```\n\nExample:\n```\nJohn: 15/06/1990, 14:30, Mumbai, India\nJane: 22/03/1992, 09:15, Delhi, India\nType: family\n```\n\nWhat type of group would you like to analyze?';
  }

  // Hindu Vedic astrology requests
  if (matchesIntent(message, ['kundli', 'vedic kundli', 'hindu kundli', 'birth chart', 'janam kundli', /^kundli/, /^janam/])) {
    if (!user.birthDate) {
      return 'For your Vedic Kundli, I need your complete birth details to create your traditional Hindu birth chart.\n\nPlease provide:\n• Birth date (DD/MM/YYYY)\n• Birth time (HH:MM)\n• Birth place (City, Country)\n\nExample: 15/06/1990, 14:30, Mumbai, India';
    }

    try {
      const kundli = vedicCalculator.generateVedicKundli({
        birthDate: user.birthDate,
        birthTime: user.birthTime || '12:00',
        birthPlace: user.birthPlace || 'Delhi',
        name: user.name
      });

      if (kundli.error) {
        return `I encountered an issue: ${kundli.error}`;
      }

      let response = `🕉️ *Vedic Kundli for ${kundli.name}*\n\n`;
      response += '*Birth Details:*\n';
      response += `📅 Date: ${kundli.birthDetails.date}\n`;
      response += `🕐 Time: ${kundli.birthDetails.time}\n`;
      response += `📍 Place: ${kundli.birthDetails.place}\n\n`;

      response += `*Lagna (Ascendant):* ${kundli.lagna}\n\n`;

      // Show key houses
      response += '*Key Houses (Bhavas):*\n';
      const keyHouses = [1, 4, 5, 7, 9, 10];
      keyHouses.forEach(houseNum => {
        const house = kundli.houses[houseNum - 1];
        if (house) {
          response += `• *${house.name}*: ${house.sign}`;
          if (house.planets.length > 0) {
            response += ` (${house.planets.join(', ')})`;
          }
          response += '\n';
        }
      });
      response += '\n';

      // Show planetary positions
      response += '*Planetary Positions:*\n';
      Object.values(kundli.planetaryPositions).slice(0, 5).forEach(planet => {
        response += `• *${planet.name}*: ${planet.sign} (${planet.house}th house)`;
        if (planet.dignity !== 'Neutral') {
          response += ` - ${planet.dignity}`;
        }
        response += '\n';
      });
      response += '\n';

      // Show Yogas
      if (kundli.interpretations.yogaFormations.length > 0) {
        response += '*Special Yogas:*\n';
        kundli.interpretations.yogaFormations.forEach(yoga => {
          response += `• ${yoga.name}: ${yoga.effect}\n`;
        });
        response += '\n';
      }

      response += `*Summary:*\n${kundli.kundliSummary}\n\n`;

      response += 'This is your traditional Vedic Kundli following ancient Hindu astrological principles! 🕉️';

      return response;
    } catch (error) {
      logger.error('Error generating Vedic Kundli:', error);
      return 'I\'m having trouble generating your Vedic Kundli right now. Please try again later.';
    }
  }

  // Marriage compatibility requests
  if (matchesIntent(message, ['marriage compatibility', 'guna matching', 'kundli matching', 'marriage matching', 'wedding compatibility', /^guna/, /^marriage.?match/])) {
    if (!user.birthDate) {
      return 'For marriage compatibility analysis, I need your complete birth details first.\n\nPlease provide your birth information:\n• Birth date (DD/MM/YYYY)\n• Birth time (HH:MM)\n• Birth place (City, Country)\n\nExample: 15/06/1990, 14:30, Mumbai, India\n\nThen I can match it with your partner\'s chart!';
    }

    return '💕 *Hindu Marriage Compatibility (Kundli Matching)*\n\nI can perform traditional Vedic marriage compatibility analysis using the sacred 36-point Guna matching system!\n\n*What I analyze:*\n• *36-Point Guna System* - Varna, Tara, Yoni, Grahamaitri, Gana, Bhakut, Nadi\n• *Manglik Dosha* - Mars placement analysis and remedies\n• *Overall Compatibility* - Traditional Hindu marriage assessment\n\n*To get marriage compatibility:*\n\n1. Send your birth details (if not already set)\n2. Provide your partner\'s birth details\n\n*Partner\'s details format:*\n```\nName: [Partner Name]\nBirth: DD/MM/YYYY, HH:MM\nPlace: [City, Country]\n```\n\nExample:\n```\nName: Priya Sharma\nBirth: 25/12/1992, 10:30\nPlace: Jaipur, India\n```\n\nThis follows traditional Vedic astrology principles used for Hindu marriages! 🕉️';
  }

  // Lagna analysis requests
  if (matchesIntent(message, ['lagna', 'ascendant', 'lagna analysis', 'rising sign analysis', /^lagna/])) {
    if (!user.birthDate) {
      return 'For Lagna (Ascendant) analysis, I need your complete birth details.\n\nPlease provide:\n• Birth date (DD/MM/YYYY)\n• Birth time (HH:MM)\n• Birth place (City, Country)\n\nExample: 15/06/1990, 14:30, Mumbai, India';
    }

    try {
      const kundli = vedicCalculator.generateVedicKundli({
        birthDate: user.birthDate,
        birthTime: user.birthTime || '12:00',
        birthPlace: user.birthPlace || 'Delhi',
        name: user.name
      });

      if (kundli.error) {
        return `I encountered an issue: ${kundli.error}`;
      }

      const { lagnaAnalysis } = kundli.interpretations;

      let response = `🏠 *Lagna (Ascendant) Analysis for ${kundli.name}*\n\n`;
      response += `*Your Lagna:* ${kundli.lagna}\n`;
      response += `*Strength:* ${lagnaAnalysis.strength}\n\n`;

      response += `*Lagna Lord:* ${lagnaAnalysis.lord}\n`;
      response += `*Lord's Position:* ${lagnaAnalysis.lordPosition}\n\n`;

      response += `*Personality & Life Path:*\n${lagnaAnalysis.interpretation}\n\n`;

      if (lagnaAnalysis.planetsInLagna.length > 0) {
        response += `*Planets in Lagna:* ${lagnaAnalysis.planetsInLagna.join(', ')}\n\n`;
      }

      response += '*What this means for you:*\n';
      response += '• Your Lagna represents your outward personality and first impressions\n';
      response += '• It shows how others perceive you and your approach to life\n';
      response += '• The Lagna lord indicates your life direction and natural talents\n';
      response += '• Planets in Lagna modify your basic personality\n\n';

      response += 'Your Lagna reveals your soul\'s chosen vehicle in this lifetime! ✨';

      return response;
    } catch (error) {
      logger.error('Error generating Lagna analysis:', error);
      return 'I\'m having trouble analyzing your Lagna right now. Please try again later.';
    }
  }

  // Manglik dosha requests
  if (matchesIntent(message, ['prashna', 'horary', 'question astrology', 'prashna kundli', /^prashna/, /^horary/])) {
    return '🕉️ *Prashna (Horary) Astrology*\n\nPrashna astrology provides answers to specific questions using the exact time you ask them!\n\n*How it works:*\n• Predictions based on planetary positions at the moment of your question\n• No birth details required - just your question and current time\n• Answers specific queries about timing and outcomes\n\n*Perfect for questions like:*\n• "When will I get married?"\n• "Will I get the job?"\n• "When will my health improve?"\n• "Will my business succeed?"\n\n*To ask a Prashna question:*\nSend your question now, and I\'ll analyze the current planetary positions to give you guidance!\n\nExample: "Will I get married this year?"\n\nWhat question is on your mind? 🔮';
  }

  if (matchesIntent(message, ['ashtakavarga', '8-fold strength', 'bindu analysis', /^ashtakavarga/])) {
    return '🕉️ *Ashtakavarga (8-Fold Strength Analysis)*\n\nAshtakavarga is an ancient Vedic technique that analyzes planetary strength across 12 houses!\n\n*What it reveals:*\n• 8-fold strength of each planet (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn)\n• Bindu (dot) system showing favorable periods\n• Trikona Shodhana - triangle reduction for deeper insights\n• Ekadhipatya - sole lordship of houses\n\n*Benefits:*\n• Identifies strongest and weakest planetary periods\n• Shows favorable houses and life areas\n• Helps timing of important decisions\n• Reveals planetary power distribution\n\n*To get your Ashtakavarga analysis:*\nI need your complete birth details (date, time, place).\n\nThis advanced analysis provides deep insights into planetary strengths! 🔮';
  }

  if (matchesIntent(message, ['varga charts', 'divisional charts', 'navamsa', 'dashamsa', 'd-9', 'd-10', /^varga/, /^divisional/])) {
    return '🕉️ *Varga (Divisional) Charts*\n\nVarga charts are specialized Vedic astrology divisions that provide detailed analysis for specific life areas!\n\n*Available Varga Charts:*\n\n🕉️ *D-9 Navamsa* - Marriage, spouse, spiritual life, dharma\n💼 *D-10 Dashamsa* - Career, profession, authority, public image\n👨‍👩‍👧‍👦 *D-12 Dwadasamsa* - Parents, ancestry, spiritual practices\n🏠 *D-16 Shodasamsa* - Vehicles, pleasures, happiness, comforts\n📚 *D-24 Chaturvimsamsa* - Education, learning, knowledge, intelligence\n⚕️ *D-30 Trimsamsa* - Misfortunes, health issues, enemies, obstacles\n\n*Benefits:*\n• Specialized analysis for different life areas\n• Deeper insights beyond the main birth chart\n• Understanding of specific life challenges and opportunities\n• Guidance for targeted spiritual practices\n\n*To get your Varga Charts analysis:*\nI need your complete birth details (date, time, place).\n\nThis comprehensive system reveals hidden aspects of your life journey! 🔮';
  }

  if (matchesIntent(message, ['shadbala', '6-fold strength', 'shad bala', 'planetary strength', /^shadbala/])) {
    return '🕉️ *Shadbala (6-Fold Planetary Strength)*\n\nShadbala is the most comprehensive Vedic system for measuring planetary strength through 6 different methods!\n\n*Six Types of Bala (Strength):*\n\n🏛️ *Sthana Bala* - Positional strength (exaltation, own sign, house position)\n🧭 *Dig Bala* - Directional strength (planetary directions)\n⏰ *Kala Bala* - Temporal strength (time-based influences)\n⚡ *Chesta Bala* - Motivational strength (speed, retrograde)\n🌿 *Naisargika Bala* - Natural strength (innate planetary power)\n👁️ *Drik Bala* - Aspect strength (influences from other planets)\n\n*Benefits:*\n• Precise measurement of planetary power\n• Understanding of when planets are strongest\n• Guidance for timing important decisions\n• Identification of planetary periods for success\n• Comprehensive strength analysis beyond basic dignity\n\n*What You\'ll Discover:*\n• Strength percentage for each planet (0-100%)\n• Detailed breakdown of all 6 strength types\n• Planetary strength rankings\n• Recommendations based on strongest/weakest planets\n\n*To get your Shadbala analysis:*\nI need your complete birth details (date, time, place).\n\nThis advanced analysis provides the deepest insight into planetary power! 🔮';
  }

  if (matchesIntent(message, ['muhurta', 'electional', 'auspicious time', 'auspicious timing', 'electional astrology', /^muhurta/])) {
    return '🕉️ *Muhurta (Electional Astrology) - Auspicious Timing*\n\nMuhurta is the ancient Vedic science of choosing the most auspicious time for important life events!\n\n*Perfect for:*\n💒 *Weddings & Marriages* - Find the most harmonious timing\n💼 *Business Launches* - Start ventures at peak success times\n🏠 *House Warming* - Bless new homes at auspicious moments\n📚 *Education Beginnings* - Start studies at favorable times\n🛐 *Religious Ceremonies* - Perform pujas at sacred times\n🎯 *Any Important Life Event*\n\n*What Muhurta Considers:*\n\n🌓 *Panchaka Dosha Avoidance* - 5 defects to avoid:\n   • Rahu Kalam (Rahu\'s period)\n   • Gulika Kalam (most inauspicious)\n   • Yamaganda Tithi\n   • Visha Ghati Nakshatra\n   • Surya Sankranti\n\n⭐ *Abhijit Muhurta* - The most auspicious time of day (noon ± 24 min)\n\n🪐 *Planetary Positions* - Benefic planets in favorable houses\n📅 *Weekday Auspiciousness* - Best days for different activities\n🌙 *Lunar Phase* - Tithi and lunar considerations\n\n*How to Get Muhurta:*\n\n1. Tell me your event type (wedding, business, house warming, etc.)\n2. Provide preferred date (DD/MM/YYYY)\n3. Give location (City, Country)\n\nExample: "Muhurta for wedding on 15/06/2024 in Mumbai, India"\n\nI\'ll provide:\n• Top 5 auspicious timings on your preferred date\n• Alternative dates if needed\n• Detailed reasoning for each timing\n• Planetary and astronomical factors\n\n*Benefits:*\n• Maximize success potential of important events\n• Minimize obstacles and challenges\n• Align with cosmic energies\n• Follow ancient Vedic wisdom\n\nWhat event are you planning? I\'ll find the perfect auspicious time! 🕉️';
  }

  if (matchesIntent(message, ['panchang', 'hindu calendar', 'almanac', 'daily panchang', 'tithi', /^panchang/])) {
    return '🕉️ *Panchang (Hindu Almanac) - Daily Guidance*\n\nPanchang is the traditional Hindu calendar that provides comprehensive daily guidance based on lunar and planetary positions!\n\n*What Panchang Includes:*\n\n🌓 *Tithi* - Lunar day (Shukla/Krishna Paksha)\n⭐ *Nakshatra* - Lunar constellation (27 Nakshatras)\n🪐 *Yoga* - Planetary combination (27 Yogas)\n⚡ *Karana* - Half lunar day (11 Karanas)\n\n🌅 *Sunrise & Sunset* - Local timings\n🌙 *Moon Phase* - Current lunar phase\n📅 *Weekday* - Day of the week\n\n*Inauspicious Periods to Avoid:*\n😈 *Rahukalam* - Rahu\'s period (varies by weekday)\n👹 *Gulikakalam* - Most inauspicious time\n⚠️ *Yamagandam* - Inauspicious period\n\n⭐ *Abhijit Muhurta* - Most auspicious time of day\n\n*Daily Guidance:*\n✅ *Auspicious Activities* - Recommended for the day\n❌ *Inauspicious Activities* - To avoid on this day\n📊 *Overall Day Rating* - Auspicious/Neutral/Inauspicious\n\n*How to Get Panchang:*\n\nSend your request in this format:\n```\nPanchang for [DD/MM/YYYY] in [City, Country]\n```\n\n*Examples:*\n• "Panchang for 15/06/2024 in Mumbai, India"\n• "Daily Panchang for Delhi"\n• "Hindu Almanac for today in Bangalore"\n\n*Benefits:*\n• Daily spiritual guidance and planning\n• Know auspicious times for activities\n• Avoid inauspicious periods\n• Follow traditional Hindu calendar\n• Plan religious ceremonies and festivals\n• Cultural and religious awareness\n\n*Perfect for:*\n• Planning weddings and ceremonies\n• Business and important decisions\n• Religious observances\n• Daily spiritual practice\n• Cultural celebrations\n\nWhat date and location would you like the Panchang for? 🕉️';
  }

  if (matchesIntent(message, ['manglik', 'manglik dosha', 'mars dosha', 'mangal dosha', /^manglik/, /^mangal/])) {
    if (!user.birthDate) {
      return 'For Manglik dosha analysis, I need your complete birth details to check Mars placement.\n\nPlease provide:\n• Birth date (DD/MM/YYYY)\n• Birth time (HH:MM)\n• Birth place (City, Country)\n\nExample: 15/06/1990, 14:30, Mumbai, India';
    }

    try {
      const kundli = vedicCalculator.generateVedicKundli({
        birthDate: user.birthDate,
        birthTime: user.birthTime || '12:00',
        birthPlace: user.birthPlace || 'Delhi',
        name: user.name
      });

      if (kundli.error) {
        return `I encountered an issue: ${kundli.error}`;
      }

      const marsPosition = kundli.planetaryPositions.mars;
      const manglikHouses = [1, 2, 4, 7, 8, 12];
      const isManglik = manglikHouses.includes(marsPosition?.house);

      return `🔮 *Manglik Dosha Analysis*\n\n*Your Mars Position:* ${marsPosition?.signName || 'Unknown'} (${marsPosition?.house || 'Unknown'}th house)\n\n${isManglik ? '*Manglik Dosha Present*' : '*No Manglik Dosha*'}\n\n${isManglik ?
        'Mars in houses 1, 2, 4, 7, 8, or 12 from Lagna indicates Manglik dosha.\n\n*Effects:* Can cause delays in marriage, relationship challenges.\n\n*Remedies:*\n• Fast on Tuesdays\n• Donate red items\n• Chant "Om Angarakaya Namaha"\n• Consider marriage to another Manglik\n• Consult priest for specific remedies' :
        'Mars is not in dosha-causing positions. Generally favorable for marriage timing.'}\n\n*Note:* This is a basic analysis. Consult a qualified astrologer for detailed remedies. 🕉️`;
    } catch (error) {
      logger.error('Error in Manglik analysis:', error);
      return '❌ Sorry, I couldn\'t analyze Manglik dosha right now. Please try again later.';
    }
  }

  // Kaal Sarp Dosha analysis
  if (matchesIntent(message, ['kaal sarp', 'kalsarp', 'kaalsarp', 'kal sarp', 'kalsarp dosha', 'kaal sarp dosha', /^kaal/, /^kal/])) {
    if (!user.birthDate) {
      return 'For Kaal Sarp Dosha analysis, I need your complete birth details to check Rahu-Ketu positions.\n\nPlease provide:\n• Birth date (DD/MM/YYYY)\n• Birth time (HH:MM)\n• Birth place (City, Country)\n\nExample: 15/06/1990, 14:30, Mumbai, India';
    }

    try {
      const kaalSarpAnalysis = vedicCalculator.generateKaalSarpDosha({
        birthDate: user.birthDate,
        birthTime: user.birthTime || '12:00',
        birthPlace: user.birthPlace || 'Delhi',
        name: user.name
      });

      if (kaalSarpAnalysis.error) {
        return `I encountered an issue: ${kaalSarpAnalysis.error}`;
      }

      return kaalSarpAnalysis.summary;
    } catch (error) {
      logger.error('Error in Kaal Sarp Dosha analysis:', error);
      return '❌ Sorry, I couldn\'t analyze Kaal Sarp Dosha right now. Please try again later.';
    }
  }

  // Sade Sati analysis
  if (matchesIntent(message, ['sade sati', 'sadesati', 'saturn period', 'saturn transit', 'shani sade sati', /^sade/, /^saturn.*sati/])) {
    if (!user.birthDate) {
      return 'For Sade Sati analysis, I need your complete birth details to check Saturn\'s transit through your Moon sign.\n\nPlease provide:\n• Birth date (DD/MM/YYYY)\n• Birth time (HH:MM)\n• Birth place (City, Country)\n\nExample: 15/06/1990, 14:30, Mumbai, India';
    }

    try {
      const sadeSatiAnalysis = vedicCalculator.generateSadeSatiAnalysis({
        birthDate: user.birthDate,
        birthTime: user.birthTime || '12:00',
        birthPlace: user.birthPlace || 'Delhi',
        name: user.name
      });

      if (sadeSatiAnalysis.error) {
        return `I encountered an issue: ${sadeSatiAnalysis.error}`;
      }

      return sadeSatiAnalysis.summary;
    } catch (error) {
      logger.error('Error in Sade Sati analysis:', error);
      return '❌ Sorry, I couldn\'t analyze Sade Sati right now. Please try again later.';
    }
  }

  // Vedic Remedies requests
  if (matchesIntent(message, ['remedies', 'gemstones', 'mantras', 'charities', 'pujas', 'yantras', 'vedic remedies', 'astrological remedies', /^remedies/, /^gemstone/, /^mantra/])) {
    // Check for specific planet or dosha
    const planetMatch = message.match(/(?:remedies?|gemstones?|mantras?|charities?)\s+(?:for\s+)?(?:planet\s+)?(\w+)/i);
    const doshaMatch = message.match(/(?:remedies?|gemstones?|mantras?|charities?)\s+(?:for\s+)?(?:dosha\s+)?(\w+(?:\s+\w+)*)/i);

    if (planetMatch) {
      const planet = planetMatch[1].toLowerCase();
      try {
        const remedies = vedicRemedies.generatePlanetRemedies(planet);
        if (remedies.error) {
          return `I don't have remedies information for "${planet}". Available planets: Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu.`;
        }
        return remedies.summary;
      } catch (error) {
        logger.error('Error generating planet remedies:', error);
        return '❌ Sorry, I couldn\'t generate remedies right now. Please try again later.';
      }
    } else if (doshaMatch) {
      const dosha = doshaMatch[1].toLowerCase().replace(/\s+/g, '_');
      try {
        const remedies = vedicRemedies.generateDoshaRemedies(dosha);
        if (remedies.error) {
          return `I don't have remedies for "${dosha}". Available doshas: Kaal Sarp, Manglik, Pitru, Sade Sati.`;
        }

        let response = `🕉️ *Vedic Remedies for ${dosha.replace(/_/g, ' ').toUpperCase()}*\n\n`;

        if (remedies.gemstones) {
          response += '*Recommended Gemstones:*\n';
          remedies.gemstones.forEach(gem => {
            response += `• ${gem.name} (${gem.sanskrit}) - ${gem.finger}, ${gem.day}\n`;
          });
          response += '\n';
        }

        if (remedies.mantras) {
          response += '*Powerful Mantras:*\n';
          remedies.mantras.forEach(mantra => {
            response += `• "${mantra.beej}"\n`;
          });
          response += '\n';
        }

        if (remedies.puja) {
          response += '*Recommended Puja:*\n';
          response += `• ${remedies.puja.name} (${remedies.puja.duration})\n`;
          response += `• Benefits: ${remedies.puja.benefits}\n\n`;
        }

        if (remedies.special) {
          response += '*Special Practices:*\n';
          if (remedies.special.fasting) { response += `• Fasting: ${remedies.special.fasting}\n`; }
          if (remedies.special.offerings) { response += `• Offerings: ${remedies.special.offerings}\n`; }
          if (remedies.special.rituals) { response += `• Rituals: ${remedies.special.rituals}\n`; }
        }

        response += '\n🕉️ *Note:* Consult a qualified priest or astrologer before performing pujas. Remedies should be personalized to your birth chart.';

        return response;
      } catch (error) {
        logger.error('Error generating dosha remedies:', error);
        return '❌ Sorry, I couldn\'t generate remedies right now. Please try again later.';
      }
    } else {
      // General remedies catalog
      const catalog = vedicRemedies.getRemediesCatalog();
      return `🕉️ *Vedic Remedies System*\n\nI can provide comprehensive remedies for:\n\n*Planetary Remedies:*\n• Gemstones, Mantras, Charities for each planet\n• Available for: ${catalog.gemstones.join(', ')}\n\n*Dosha Remedies:*\n• Specialized remedies for: ${catalog.doshas.join(', ')}\n\n*Examples:*\n• "remedies for sun" - Sun-related remedies\n• "gemstones for saturn" - Blue Sapphire details\n• "remedies for kaal sarp dosha" - Kaal Sarp remedies\n• "mantras for venus" - Venus mantras\n\nWhat specific remedies would you like to know about?`;
    }
  }

  // Islamic Astrology requests
  if (matchesIntent(message, ['islamic astrology', 'ilm e nujum', 'ilm-e-nujum', 'islamic numerology', 'abjad', 'taqdeer', 'destiny islamic', 'muslim astrology', /^islamic/, /^ilm/, /^taqdeer/, /^abjad/])) {
    // Check for specific Islamic analysis type
    const numerologyMatch = message.match(/(?:numerology|abjad|ilm.*nujum)\s+(?:for\s+)?(?:name\s+)?(.+)/i);
    const taqdeerMatch = message.match(/(?:taqdeer|destiny|islamic.*destiny)/i);

    if (numerologyMatch) {
      const name = numerologyMatch[1].trim();
      try {
        const numerologyAnalysis = islamicAstrology.calculateIlmNujum(name);
        if (numerologyAnalysis.error) {
          return `I encountered an issue: ${numerologyAnalysis.error}`;
        }
        return numerologyAnalysis.summary;
      } catch (error) {
        logger.error('Error in Islamic numerology analysis:', error);
        return '❌ Sorry, I couldn\'t analyze the Islamic numerology right now. Please try again later.';
      }
    } else if (taqdeerMatch) {
      if (!user.birthDate) {
        return 'For Taqdeer (Islamic Destiny) analysis, I need your complete birth details.\n\nPlease provide:\n• Birth date (DD/MM/YYYY)\n• Birth time (HH:MM)\n• Birth place (City, Country)\n\nExample: 15/06/1990, 14:30, Mecca, Saudi Arabia';
      }

      try {
        const taqdeerAnalysis = islamicAstrology.calculateTaqdeer({
          birthDate: user.birthDate,
          birthTime: user.birthTime || '12:00',
          birthPlace: user.birthPlace || 'Mecca',
          name: user.name
        });

        if (taqdeerAnalysis.error) {
          return `I encountered an issue: ${taqdeerAnalysis.error}`;
        }

        return taqdeerAnalysis.summary;
      } catch (error) {
        logger.error('Error in Taqdeer analysis:', error);
        return '❌ Sorry, I couldn\'t analyze the Islamic destiny right now. Please try again later.';
      }
    } else {
      // General Islamic astrology catalog
      const catalog = islamicAstrology.getIslamicAstrologyCatalog();
      return '🕌 *Islamic Astrology - Ilm-e-Nujum & Taqdeer*\n\nDiscover your divine path through Islamic astrological wisdom!\n\n*Ilm-e-Nujum (Islamic Numerology):*\n• Abjad system analysis for names\n• Divine qualities and life purpose\n• Spiritual guidance based on name numbers\n\n*Taqdeer (Destiny Analysis):*\n• Lunar mansion influences at birth\n• Planetary guidance in Islamic context\n• Life path and divine purpose\n• Spiritual, worldly, and relationship destiny\n\n*Available Services:*\n• Islamic Numerology (Abjad)\n• Taqdeer Destiny Analysis\n• Lunar Mansions Guidance\n• Islamic Planetary Influences\n• Prayer Times & Auspicious Periods\n\n*Examples:*\n• "ilm e nujum for Muhammad" - Islamic numerology for a name\n• "taqdeer analysis" - Complete destiny analysis\n• "islamic astrology" - General Islamic astrology guidance\n\nWhat aspect of Islamic astrology interests you?';
    }
  }

  // Vimshottari Dasha analysis requests
  if (matchesIntent(message, ['vimshottari dasha', 'dasha analysis', 'planetary periods', 'dasha prediction', 'vimshottari', /^dasha/, /^vimshottari/])) {
    if (!user.birthDate) {
      return 'For Vimshottari Dasha analysis, I need your complete birth details to calculate your planetary periods.\n\nPlease provide:\n• Birth date (DD/MM/YYYY)\n• Birth time (HH:MM)\n• Birth place (City, Country)\n\nExample: 15/06/1990, 14:30, Mumbai, India';
    }

    try {
      const dashaAnalysis = vimshottariDasha.calculateVimshottariDasha({
        birthDate: user.birthDate,
        birthTime: user.birthTime || '12:00',
        birthPlace: user.birthPlace || 'Delhi',
        name: user.name
      });

      if (dashaAnalysis.error) {
        return `I encountered an issue: ${dashaAnalysis.error}`;
      }

      return dashaAnalysis.summary;
    } catch (error) {
      logger.error('Error in Vimshottari Dasha analysis:', error);
      return '❌ Sorry, I couldn\'t analyze the Vimshottari Dasha right now. Please try again later.';
    }
  }

  // Jaimini Astrology analysis requests
  if (matchesIntent(message, ['jaimini astrology', 'jaimini', 'karakas', 'jaimini karakas', 'jaimini aspects', /^jaimini/])) {
    if (!user.birthDate) {
      return 'For Jaimini Astrology analysis, I need your complete birth details to calculate Karakas and aspects.\n\nPlease provide:\n• Birth date (DD/MM/YYYY)\n• Birth time (HH:MM)\n• Birth place (City, Country)\n\nExample: 15/06/1990, 14:30, Mumbai, India';
    }

    try {
      const jaiminiAnalysis = jaiminiAstrology.calculateJaiminiKarakas({
        birthDate: user.birthDate,
        birthTime: user.birthTime || '12:00',
        birthPlace: user.birthPlace || 'Delhi',
        name: user.name
      });

      if (jaiminiAnalysis.error) {
        return `I encountered an issue: ${jaiminiAnalysis.error}`;
      }

      return jaiminiAnalysis.summary;
    } catch (error) {
      logger.error('Error in Jaimini Astrology analysis:', error);
      return '❌ Sorry, I couldn\'t analyze the Jaimini Astrology right now. Please try again later.';
    }
  }

  // Hindu Festivals requests
  if (matchesIntent(message, ['hindu festivals', 'festival calendar', 'hindu calendar', 'festivals', 'auspicious timings', 'muhurta', /^festival/, /^hindu.*calendar/])) {
    // Check for specific festival queries
    const festivalMatch = message.match(/(?:festival|festivals)\s+(?:for|about|info)\s+(.+)/i);
    const dateMatch = message.match(/(?:festivals?|calendar)\s+(?:for|on)\s+(\d{1,2}[-\/]\d{1,2}[-\/]\d{4}|\d{4}[-\/]\d{1,2}[-\/]\d{1,2})/i);
    const upcomingMatch = message.match(/(?:upcoming|next|future)\s+(?:festivals?|calendar)/i);

    if (festivalMatch) {
      const festivalName = festivalMatch[1].trim();
      try {
        const festivalDetails = hinduFestivals.getFestivalDetails(festivalName);
        if (festivalDetails.error) {
          return festivalDetails.error;
        }

        let response = `🕉️ *${festivalDetails.name} (${festivalDetails.english})*\n\n`;
        response += `*📅 Date:* ${festivalDetails.date}\n`;
        response += `*📆 Gregorian Period:* ${festivalDetails.gregorian_period}\n`;
        response += `*🕉️ Significance:* ${festivalDetails.significance}\n`;
        response += `*🙏 Deities:* ${festivalDetails.deities}\n\n`;

        response += '*📿 Key Rituals:*\n';
        festivalDetails.rituals.forEach(ritual => {
          response += `• ${ritual}\n`;
        });
        response += '\n';

        response += '*⭐ Auspicious Activities:*\n';
        festivalDetails.auspicious_activities.forEach(activity => {
          response += `• ${activity}\n`;
        });
        response += '\n';

        response += `*⏰ Duration:* ${festivalDetails.duration}\n`;
        if (festivalDetails.regional_variations) {
          response += `*🌍 Regional Variations:* ${festivalDetails.regional_variations}\n`;
        }

        return response;
      } catch (error) {
        logger.error('Error getting festival details:', error);
        return '❌ Sorry, I couldn\'t retrieve festival information right now. Please try again later.';
      }
    } else if (dateMatch) {
      const dateStr = dateMatch[1];
      try {
        // Normalize date format
        const normalizedDate = dateStr.replace(/[-\/]/g, '-');
        const festivalsInfo = hinduFestivals.getFestivalsForDate(normalizedDate);
        return festivalsInfo.summary;
      } catch (error) {
        logger.error('Error getting festivals for date:', error);
        return '❌ Sorry, I couldn\'t retrieve festival information for this date. Please try again later.';
      }
    } else if (upcomingMatch) {
      try {
        const upcomingFestivals = hinduFestivals.getUpcomingFestivals();
        return upcomingFestivals.summary;
      } catch (error) {
        logger.error('Error getting upcoming festivals:', error);
        return '❌ Sorry, I couldn\'t retrieve upcoming festival information right now. Please try again later.';
      }
    } else {
      // General Hindu festivals catalog
      const catalog = hinduFestivals.getFestivalsCatalog();
      return '🕉️ *Hindu Festivals & Auspicious Timings*\n\nDiscover the rich calendar of Hindu festivals and auspicious periods!\n\n*🪔 Major Hindu Festivals:*\n• Diwali (Festival of Lights) - Lakshmi Puja, prosperity\n• Holi (Festival of Colors) - Spring celebration, renewal\n• Durga Puja - Goddess worship, divine power\n• Maha Shivaratri - Lord Shiva\'s night, spiritual awakening\n• Raksha Bandhan - Brother-sister bond, protection\n• Ganesh Chaturthi - Lord Ganesha, obstacle removal\n• Navaratri - Nine nights of Goddess, purification\n• Krishna Janmashtami - Lord Krishna\'s birth, devotion\n• Ram Navami - Lord Rama\'s birth, righteousness\n• Hanuman Jayanti - Lord Hanuman, strength and devotion\n\n*⏰ Auspicious Timings:*\n• Abhijit Muhurta - Most auspicious time (11:30 AM - 12:30 PM)\n• Brahma Muhurta - Spiritual practices (pre-dawn)\n• Rahu Kalam - Avoid important work (varies by day)\n• Yamagandam - Challenging period (varies by day)\n\n*Examples of Requests:*\n• "festivals for 2024-10-28" - Festivals on Diwali\n• "festival about diwali" - Detailed Diwali information\n• "upcoming festivals" - Next 30 days festival calendar\n• "auspicious timings" - Daily muhurta guidance\n\nWhat festival or timing information would you like to know about?';
    }
  }

  // Vedic numerology requests
  if (matchesIntent(message, ['vedic numerology', 'chani numerology', 'indian numerology', 'sanskrit numerology', /^vedic.?numerology/, /^chani/, /^indian.?numerology/])) {
    if (!user.birthDate) {
      return 'For Vedic Numerology analysis, I need your complete birth details and full name to calculate your Chani numbers.\n\nPlease provide:\n• Birth date (DD/MM/YYYY)\n• Full name (as it appears on birth certificate)\n\nExample: 15/06/1990, Rajesh Kumar Sharma';
    }

    try {
      const vedicAnalysis = vedicNumerology.getVedicNumerologyAnalysis(user.birthDate, user.name || 'Unknown');

      if (vedicAnalysis.error) {
        return `I encountered an issue: ${vedicAnalysis.error}`;
      }

      return vedicAnalysis.summary;
    } catch (error) {
      logger.error('Error generating Vedic numerology analysis:', error);
      return 'I\'m having trouble calculating your Vedic numerology right now. Please try again later.';
    }
  }

  // Ayurvedic astrology requests
  if (matchesIntent(message, ['ayurvedic astrology', 'ayurveda astrology', 'dosha analysis', 'vata pitta kapha', 'ayurvedic constitution', /^ayurvedic/, /^dosha/, /^vata/, /^pitta/, /^kapha/])) {
    if (!user.birthDate) {
      return 'For Ayurvedic Astrology analysis, I need your complete birth details to determine your dosha constitution.\n\nPlease provide:\n• Birth date (DD/MM/YYYY)\n• Birth time (HH:MM)\n• Birth place (City, Country)\n\nExample: 15/06/1990, 14:30, Mumbai, India';
    }

    try {
      const ayurvedicAnalysis = ayurvedicAstrology.analyzeAyurvedicConstitution({
        birthDate: user.birthDate,
        birthTime: user.birthTime || '12:00',
        birthPlace: user.birthPlace || 'Delhi'
      });

      if (ayurvedicAnalysis.error) {
        return `I encountered an issue: ${ayurvedicAnalysis.error}`;
      }

      return ayurvedicAnalysis.summary;
    } catch (error) {
      logger.error('Error generating Ayurvedic astrology analysis:', error);
      return 'I\'m having trouble analyzing your Ayurvedic constitution right now. Please try again later.';
    }
  }

  // Ashtakavarga analysis requests
  if (matchesIntent(message, ['ashtakavarga', '8-fold strength', 'bindu analysis', /^ashtakavarga/])) {
    if (!user.birthDate) {
      return 'For Ashtakavarga analysis, I need your complete birth details.\n\nPlease provide:\n• Birth date (DD/MM/YYYY)\n• Birth time (HH:MM)\n• Birth place (City, Country)\n\nExample: 15/06/1990, 14:30, Mumbai, India';
    }

    try {
      const ashtakavargaAnalysis = vedicCalculator.generateAshtakavarga({
        birthDate: user.birthDate,
        birthTime: user.birthTime || '12:00',
        birthPlace: user.birthPlace || 'Delhi',
        name: user.name
      });

      if (ashtakavargaAnalysis.error) {
        return `I encountered an issue: ${ashtakavargaAnalysis.error}`;
      }

      return ashtakavargaAnalysis.summary;
    } catch (error) {
      logger.error('Error in Ashtakavarga analysis:', error);
      return '❌ Sorry, I couldn\'t perform the Ashtakavarga analysis right now. Please try again later.';
    }
  }

  // Varga Charts analysis requests
  if (matchesIntent(message, ['varga charts', 'divisional charts', 'navamsa', 'dashamsa', 'd-9', 'd-10', /^varga/, /^divisional/])) {
    if (!user.birthDate) {
      return 'For Varga Charts analysis, I need your complete birth details.\n\nPlease provide:\n• Birth date (DD/MM/YYYY)\n• Birth time (HH:MM)\n• Birth place (City, Country)\n\nExample: 15/06/1990, 14:30, Mumbai, India';
    }

    try {
      const vargaAnalysis = vedicCalculator.generateVargaCharts({
        birthDate: user.birthDate,
        birthTime: user.birthTime || '12:00',
        birthPlace: user.birthPlace || 'Delhi',
        name: user.name
      });

      if (vargaAnalysis.error) {
        return `I encountered an issue: ${vargaAnalysis.error}`;
      }

      return vargaAnalysis.summary;
    } catch (error) {
      logger.error('Error in Varga Charts analysis:', error);
      return '❌ Sorry, I couldn\'t perform the Varga Charts analysis right now. Please try again later.';
    }
  }

  // Shadbala analysis requests
  if (matchesIntent(message, ['shadbala', '6-fold strength', 'shad bala', 'planetary strength', /^shadbala/])) {
    if (!user.birthDate) {
      return 'For Shadbala analysis, I need your complete birth details.\n\nPlease provide:\n• Birth date (DD/MM/YYYY)\n• Birth time (HH:MM)\n• Birth place (City, Country)\n\nExample: 15/06/1990, 14:30, Mumbai, India';
    }

    try {
      const shadbalaAnalysis = vedicCalculator.generateShadbala({
        birthDate: user.birthDate,
        birthTime: user.birthTime || '12:00',
        birthPlace: user.birthPlace || 'Delhi',
        name: user.name
      });

      if (shadbalaAnalysis.error) {
        return `I encountered an issue: ${shadbalaAnalysis.error}`;
      }

      return shadbalaAnalysis.summary;
    } catch (error) {
      logger.error('Error in Shadbala analysis:', error);
      return '❌ Sorry, I couldn\'t perform the Shadbala analysis right now. Please try again later.';
    }
  }

  // Muhurta analysis requests
  if (matchesIntent(message, ['muhurta', 'electional', 'auspicious time', 'auspicious timing', 'electional astrology', /^muhurta/])) {
    return '🕉️ *Muhurta (Electional Astrology) - Auspicious Timing*\n\nTo find the perfect auspicious time for your event, please provide:\n\n*Event Type:* (wedding, business launch, house warming, education, religious ceremony, etc.)\n\n*Preferred Date:* DD/MM/YYYY\n\n*Location:* City, Country\n\nExample: "Wedding on 15/06/2024 in Mumbai, India"\n\nI\'ll analyze:\n• Panchaka Dosha (5 defects to avoid)\n• Abhijit Muhurta (most auspicious time)\n• Planetary positions for your event type\n• Weekday and lunar phase suitability\n• Alternative dates if needed\n\nWhat event are you planning? 🔮';
  }

  // Process Muhurta requests with event details
  const muhurtaMatch = message.match(/(?:muhurta|auspicious.*time).*?(?:for|on)?\s*([a-zA-Z\s]+?)\s*(?:on|at)?\s*(\d{1,2}\/\d{1,2}\/\d{4})\s*(?:in|at)?\s*([a-zA-Z\s,]+)$/i);
  if (muhurtaMatch) {
    const eventType = muhurtaMatch[1].trim();
    const preferredDate = muhurtaMatch[2].trim();
    const location = muhurtaMatch[3].trim();

    try {
      const muhurtaAnalysis = vedicCalculator.generateMuhurta({
        eventType,
        preferredDate,
        location
      });

      if (muhurtaAnalysis.error) {
        return `I encountered an issue: ${muhurtaAnalysis.error}`;
      }

      return muhurtaAnalysis.summary;
    } catch (error) {
      logger.error('Error in Muhurta analysis:', error);
      return '❌ Sorry, I couldn\'t perform the Muhurta analysis right now. Please try again later.';
    }
  }

  // Panchang analysis requests
  if (matchesIntent(message, ['panchang', 'hindu calendar', 'almanac', 'daily panchang', 'tithi', /^panchang/])) {
    return '🕉️ *Panchang (Hindu Almanac) - Daily Guidance*\n\nTo get the Panchang for any date, please provide:\n\n*Date:* DD/MM/YYYY (or "today")\n\n*Location:* City, Country\n\nExample: "Panchang for 15/06/2024 in Mumbai, India"\n\nI\'ll provide complete daily guidance including:\n• Tithi, Nakshatra, Yoga, Karana\n• Sunrise/sunset times\n• Inauspicious periods (Rahukalam, Gulikakalam)\n• Abhijit Muhurta (most auspicious time)\n• Recommended and activities to avoid\n• Overall day rating\n\nWhat date and location would you like? 🔮';
  }

  // Process Panchang requests with date and location
  const panchangMatch = message.match(/(?:panchang|hindu calendar|almanac|daily panchang).*?(?:for)?\s*(\d{1,2}\/\d{1,2}\/\d{4}|today)\s*(?:in|at)?\s*([a-zA-Z\s,]+)$/i);
  if (panchangMatch) {
    let date = panchangMatch[1];
    const location = panchangMatch[2].trim();

    // Handle "today"
    if (date.toLowerCase() === 'today') {
      const now = new Date();
      date = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
    }

    try {
      const panchangAnalysis = vedicCalculator.generatePanchang({
        date,
        location
      });

      if (panchangAnalysis.error) {
        return `I encountered an issue: ${panchangAnalysis.error}`;
      }

      return panchangAnalysis.summary;
    } catch (error) {
      logger.error('Error in Panchang analysis:', error);
      return '❌ Sorry, I couldn\'t generate the Panchang right now. Please try again later.';
    }
  }

  // Prashna Astrology processing
  if (matchesIntent(message, ['prashna', 'horary', 'question astrology', /^prashna/, /^horary/]) ||
        message.includes('?') && (message.includes('when') || message.includes('will') || message.includes('should'))) {
    // Extract the question
    const question = message.trim();

    // Get current time and user's location (simplified - would need user location)
    const now = new Date();
    const questionTime = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    // For demo purposes, use a default location. In production, get from user profile
    const questionPlace = user.birthPlace || 'Delhi, India';

    try {
      const prashnaAnalysis = vedicCalculator.generatePrashnaAnalysis({
        question,
        questionTime,
        questionPlace
      });

      if (prashnaAnalysis.error) {
        return `❌ *Prashna Analysis Error*\n\n${prashnaAnalysis.error}\n\nPlease try again or provide more details.`;
      }

      return prashnaAnalysis.summary;
    } catch (error) {
      logger.error('Error in Prashna analysis:', error);
      return '❌ Sorry, I couldn\'t perform the Prashna analysis right now. Please try again later.';
    }
  }

  // Default response with interactive options

  // Solar return analysis requests
  if (matchesIntent(message, ['solar return', 'birthday chart', 'annual chart', 'year ahead', /^solar.?return/])) {
    if (!user.birthDate) {
      return 'For solar return analysis, I need your complete birth details to calculate your annual birthday chart.\n\nPlease provide:\n• Birth date (DD/MM/YYYY)\n• Birth time (HH:MM)\n• Birth place (City, Country)\n\nExample: 15/06/1990, 14:30, Mumbai, India';
    }

    try {
      const solarReturnAnalysis = vedicCalculator.calculateSolarReturn({
        birthDate: user.birthDate,
        birthTime: user.birthTime || '12:00',
        birthPlace: user.birthPlace || 'Delhi'
      });

      if (solarReturnAnalysis.error) {
        return `I encountered an issue: ${solarReturnAnalysis.error}`;
      }

      let response = '🌞 *Solar Return Analysis*\n\n';
      response += `*Your ${solarReturnAnalysis.yearAhead} Birthday Chart:*\n\n`;

      response += `*Solar Return Date:* ${solarReturnAnalysis.solarReturnDate}\n`;
      response += `*Time:* ${solarReturnAnalysis.solarReturnTime}\n\n`;

      if (solarReturnAnalysis.dominantThemes.length > 0) {
        response += '*Dominant Themes for the Year:*\n';
        solarReturnAnalysis.dominantThemes.forEach(theme => {
          response += `• ${theme}\n`;
        });
        response += '\n';
      }

      if (solarReturnAnalysis.opportunities.length > 0) {
        response += '*Key Opportunities:*\n';
        solarReturnAnalysis.opportunities.forEach(opportunity => {
          response += `• ${opportunity}\n`;
        });
        response += '\n';
      }

      if (solarReturnAnalysis.challenges.length > 0) {
        response += '*Areas of Growth:*\n';
        solarReturnAnalysis.challenges.forEach(challenge => {
          response += `• ${challenge}\n`;
        });
        response += '\n';
      }

      response += '*Solar Return Summary:*\n';
      response += `${solarReturnAnalysis.summary}\n\n`;

      response += 'Your solar return reveals the cosmic themes for your coming year! 📅';

      return response;
    } catch (error) {
      logger.error('Error generating solar return analysis:', error);
      return 'I\'m having trouble calculating your solar return chart right now. Please try again later.';
    }
  }

  // Asteroid analysis requests
  if (matchesIntent(message, ['asteroids', 'asteroid analysis', 'chiron', 'juno', 'vesta', 'pallas', /^asteroid/])) {
    if (!user.birthDate) {
      return 'For asteroid analysis, I need your complete birth details to calculate Chiron, Juno, Vesta, and Pallas positions.\n\nPlease provide:\n• Birth date (DD/MM/YYYY)\n• Birth time (HH:MM)\n• Birth place (City, Country)\n\nExample: 15/06/1990, 14:30, Mumbai, India';
    }

    try {
      const asteroidAnalysis = vedicCalculator.calculateAsteroids({
        birthDate: user.birthDate,
        birthTime: user.birthTime || '12:00',
        birthPlace: user.birthPlace || 'Delhi'
      });

      if (asteroidAnalysis.error) {
        return `I encountered an issue: ${asteroidAnalysis.error}`;
      }

      let response = '🪐 *Asteroid Analysis*\n\n';
      response += '*Four Key Asteroids:*\n\n';

      // Chiron
      response += `🌾 *Ceres in ${asteroidAnalysis.asteroids.ceres.sign}*\n`;
      response += `• Nurturing Style: ${asteroidAnalysis.interpretations.ceres.nurturingStyle}\n`;
      response += `• Caregiving Approach: ${asteroidAnalysis.interpretations.ceres.caregivingApproach}\n\n`;

      response += `🩹 *Chiron in ${asteroidAnalysis.asteroids.chiron.sign}*\n`;
      response += `• Core Wound: ${asteroidAnalysis.interpretations.chiron.coreWound}\n`;
      response += `• Healing Gift: ${asteroidAnalysis.interpretations.chiron.healingGift}\n\n`;


      response += `💍 *Juno in ${asteroidAnalysis.asteroids.juno.sign}*\n`;
      response += `• Relationship Style: ${asteroidAnalysis.interpretations.juno.relationshipStyle}\n`;
      response += `• Commitment Style: ${asteroidAnalysis.interpretations.juno.commitmentStyle}\n\n`;


      response += `🏛️ *Vesta in ${asteroidAnalysis.asteroids.vesta.sign}*\n`;
      response += `• Sacred Focus: ${asteroidAnalysis.interpretations.vesta.sacredFocus}\n`;
      response += `• Devotion Style: ${asteroidAnalysis.interpretations.vesta.devotionStyle}\n\n`;


      response += `🎨 *Pallas in ${asteroidAnalysis.asteroids.pallas.sign}*\n`;
      response += `• Wisdom Type: ${asteroidAnalysis.interpretations.pallas.wisdomType}\n`;
      response += `• Problem Solving: ${asteroidAnalysis.interpretations.pallas.problemSolving}\n\n`;

      response += '*Asteroid Wisdom:*\n';
      response += '• Chiron shows your deepest wounds and healing gifts\n';
      response += '• Juno reveals your partnership patterns and needs\n';
      response += '• Vesta indicates your sacred focus and dedication\n';
      response += '• Pallas shows your strategic wisdom and creativity\n\n';

      response += 'These asteroids add psychological depth to your astrological profile! 🔮';

      return response;
    } catch (error) {
      logger.error('Error generating asteroid analysis:', error);
      return 'I\'m having trouble calculating your asteroid positions right now. Please try again later.';
    }
  }

  // Astrocartography requests
  if (matchesIntent(message, ['astrocartography', 'astro cartography', 'planetary lines', 'relocation', /^astro.?cartography/])) {
    if (!user.birthDate) {
      return 'For astrocartography analysis, I need your complete birth details to map planetary lines across the globe.\n\nPlease provide:\n• Birth date (DD/MM/YYYY)\n• Birth time (HH:MM)\n• Birth place (City, Country)\n\nExample: 15/06/1990, 14:30, New York, USA';
    }

    try {
      const astrocartographyAnalysis =
         astrocartographyReader.generateAstrocartography({
           birthDate: user.birthDate,
           birthTime: user.birthTime || '12:00',
           birthPlace: user.birthPlace || 'London, UK',
           name: user.name
         });

      return astrocartographyAnalysis.astrocartographyDescription;
    } catch (error) {
      logger.error('Error generating astrocartography analysis:', error);
      return 'I\'m having trouble mapping the planetary lines right now. Please try again later.';
    }
  }

  // Electional astrology requests
  if (matchesIntent(message, ['electional', 'auspicious time', 'best time', 'election', /^election/]) ||
      (matchesIntent(message, ['when should i', 'best date for', 'auspicious date']))) {
    return '📅 *Electional Astrology - Auspicious Timing*\n\nI can help you find the best dates and times for important events based on astrological factors!\n\nWhat type of event are you planning?\n\n• *Wedding/Marriage* - Venus and Jupiter favorable\n• *Business Launch* - Mercury and Jupiter beneficial\n• *Medical Procedure* - Jupiter and Venus protective\n• *Travel/Journey* - Jupiter and Sagittarius energy\n• *Legal Matters* - Libra and Sagittarius justice\n\nReply with the event type and I\'ll find auspicious timing in the next 30 days!';
  }

  // Horary astrology requests
  if (matchesIntent(message, ['horary', /^horary/]) ||
       (matchesIntent(message, ['question']) &&
        matchesIntent(message, ['when', 'will', 'should', 'can', 'does', 'is', 'are']))) {
    // Extract the question from the message
    const questionMatch = message.match(/(?:horary|question|ask)\s+(.*)/i);
    const question = questionMatch ?
      questionMatch[1].trim() :
      message.replace(/horary/i, '').trim();

    if (!question || question.length < 5) {
      return 'For horary astrology, please ask a clear, specific question. Horary works best with questions like:\n\n• "When will I get a job?"\n• "Will my relationship work out?"\n• "Should I move to another city?"\n• "When will my health improve?"\n\nWhat is your question?';
    }

    try {
      const currentTime = new Date()
        .toLocaleString('en-IN', {
          timeZone: HORARY_TIMEZONE,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
        .replace(/(\d+)\/(\d+)\/(\d+),\s*(.+)/, '$2/$1/$3 $4');

      const horaryReading = horaryReader.generateHoraryReading(
        question,
        currentTime
      );

      if (!horaryReading.valid) {
        return horaryReading.reason;
      }

      return horaryReading.horaryDescription;
    } catch (error) {
      logger.error('Error generating horary reading:', error);
      return 'I\'m having trouble casting the horary chart right now. Please try again later.';
    }
  }

  // Secondary progressions requests
  if (matchesIntent(message, ['progressions', 'secondary progressions', 'progressed chart', /^progressions/])) {
    if (!user.birthDate) {
      return 'For secondary progressions analysis, I need your complete birth details to calculate your progressed chart.\n\nPlease provide:\n• Birth date (DD/MM/YYYY)\n• Birth time (HH:MM)\n• Birth place (City, Country)\n\nExample: 15/06/1990, 14:30, Mumbai, India';
    }

    try {
      const progressions = await vedicCalculator.calculateEnhancedSecondaryProgressions({
        birthDate: user.birthDate,
        birthTime: user.birthTime || '12:00',
        birthPlace: user.birthPlace || 'Delhi'
      }, new Date());

      if (progressions.error) {
        return `I encountered an issue calculating your progressions: ${progressions.error}`;
      }

      let response = '🔮 *Enhanced Secondary Progressions Analysis*\n\n';
      response += '⚡ *High-Precision Calculations* - Using Swiss Ephemeris with lunar nodes\n\n';
      response += `*Current Age:* ${progressions.ageInYears} years, ${progressions.ageInDays} days progressed\n`;
      response += `*Progressed Chart Date:* ${progressions.formattedProgressedDate}\n`;
      response += `*Julian Day:* ${progressions.progressedJulianDay.toFixed(2)}\n\n`;

      response += '*🔑 Key Progressed Planetary Positions:*\n';
      progressions.keyProgressions.slice(0, 5).forEach(prog => {
        response += `• *${prog.planet}:* ${prog.position} - ${prog.significance}\n`;
      });
      response += '\n';

      if (progressions.majorThemes.length > 0) {
        response += '*🌟 Current Life Themes & Psychological Development:*\n';
        progressions.majorThemes.forEach(theme => {
          response += `• ${theme}\n`;
        });
        response += '\n';
      }

      if (progressions.lifeChanges.length > 0) {
        response += '*🔄 Anticipated Life Changes & Transitions:*\n';
        progressions.lifeChanges.forEach(change => {
          response += `• ${change}\n`;
        });
        response += '\n';
      }

      if (progressions.lunarNodes) {
        response += '*🌙 Progressed Lunar Nodes:*\n';
        response += `• *Rahu:* ${progressions.lunarNodes.rahu.signName} ${progressions.lunarNodes.rahu.degreesInSign.toFixed(1)}°\n`;
        response += `• *Ketu:* ${progressions.lunarNodes.ketu.signName} ${progressions.lunarNodes.ketu.degreesInSign.toFixed(1)}°\n\n`;
      }

      response += '*📚 Understanding Secondary Progressions:*\n';
      response += '• *Time Equation:* One day after birth = one year of life\n';
      response += '• *Psychological Depth:* Inner development and soul growth\n';
      response += '• *Timing Precision:* Reveals exact periods of change\n';
      response += '• *Planetary Motion:* Sun progresses ~1°/year, Moon ~13°/year\n';
      response += '• *Lunar Nodes:* Include Rahu/Ketu for karmic insights\n\n';

      response += '*💡 How to Use This Information:*\n';
      response += '• Align important decisions with progressed planetary positions\n';
      response += '• Prepare for life changes during significant progressed aspects\n';
      response += '• Use progressed lunar nodes for spiritual guidance\n';
      response += '• Combine with transits for comprehensive timing analysis\n\n';

      response += 'Your progressed chart reveals the precise unfolding of your soul\'s journey! ✨';

      return response;
    } catch (error) {
      logger.error('Error generating secondary progressions:', error);
      return 'I\'m having trouble calculating your secondary progressions right now. Please try again later.';
    }
  }

  // Solar arc directions requests
  if (matchesIntent(message, ['solar arc', 'arc directions', 'directed chart', /^solar.?arc/])) {
    if (!user.birthDate) {
      return 'For solar arc directions analysis, I need your complete birth details.\n\nPlease provide:\n• Birth date (DD/MM/YYYY)\n• Birth time (HH:MM)\n• Birth place (City, Country)\n\nExample: 15/06/1990, 14:30, Mumbai, India';
    }

    try {
      const solarArc = await vedicCalculator.calculateEnhancedSolarArcDirections({
        birthDate: user.birthDate,
        birthTime: user.birthTime || '12:00',
        birthPlace: user.birthPlace || 'Delhi'
      }, new Date());

      if (solarArc.error) {
        return `I encountered an issue calculating your solar arc directions: ${solarArc.error}`;
      }

      let response = '☀️ *Enhanced Solar Arc Directions Analysis*\n\n';
      response += '⚡ *High-Precision Calculations* - All planets directed by solar movement\n\n';
      response += `*Current Age:* ${solarArc.ageInYears} years old\n`;
      response += `*Solar Arc Movement:* ${solarArc.solarArcDegrees.toFixed(2)}° from birth positions\n`;
      response += `*Directed Chart Date:* ${solarArc.formattedArcDate}\n\n`;

      response += '*🔑 Key Solar Arc Directed Planets:*\n';
      solarArc.keyDirections.slice(0, 4).forEach(direction => {
        response += `• *${direction.planet}:* ${direction.from} → ${direction.to}\n`;
        response += `  ${direction.significance}\n`;
      });
      response += '\n';

      if (solarArc.lifeChanges.length > 0) {
        response += '*🌟 Major Life Changes & Turning Points:*\n';
        solarArc.lifeChanges.forEach(change => {
          response += `• ${change}\n`;
        });
        response += '\n';
      }

      response += '*📚 Understanding Solar Arc Directions:*\n';
      response += '• *Unified Motion:* All planets move the same arc distance as the Sun\n';
      response += '• *Major Life Events:* Reveals significant changes and transformations\n';
      response += '• *Turning Points:* Shows when life direction fundamentally shifts\n';
      response += '• *Predictive Power:* Highly effective for timing important events\n';
      response += '• *Orb Influence:* Effects felt within 1-2° of exact aspects\n\n';

      response += '*💡 How to Use Solar Arc Information:*\n';
      response += '• Prepare for major changes when solar arcs activate natal planets\n';
      response += '• Time important decisions around solar arc conjunctions\n';
      response += '• Use with transits for comprehensive predictive analysis\n';
      response += '• Combine with secondary progressions for deeper insights\n\n';

      response += 'Solar arc directions illuminate your path of destiny and transformation! ✨';

      return response;
    } catch (error) {
      logger.error('Error generating solar arc directions:', error);
      return 'I\'m having trouble calculating your solar arc directions right now. Please try again later.';
    }
  }

  // Solar return analysis requests
  if (matchesIntent(message, ['solar return', 'birthday chart', 'annual chart', 'year ahead', /^solar.?return/])) {
    if (!user.birthDate) {
      return 'For solar return analysis, I need your complete birth details to calculate your annual birthday chart.\n\nPlease provide:\n• Birth date (DD/MM/YYYY)\n• Birth time (HH:MM)\n• Birth place (City, Country)\n\nExample: 15/06/1990, 14:30, Mumbai, India';
    }

    try {
      const currentYear = new Date().getFullYear();
      const solarReturn = await vedicCalculator.calculateSolarReturn({
        birthDate: user.birthDate,
        birthTime: user.birthTime || '12:00',
        birthPlace: user.birthPlace || 'Delhi'
      }, currentYear);

      if (solarReturn.error) {
        return `I encountered an issue calculating your solar return: ${solarReturn.error}`;
      }

      return solarReturn.summary;
    } catch (error) {
      logger.error('Error generating solar return analysis:', error);
      return 'I\'m having trouble calculating your solar return chart right now. Please try again later.';
    }
  }

  // Birth chart requests
  if (matchesIntent(message, ['birth chart', 'kundli', 'chart', /^kundli/]) ||
        (matchesIntent(message, ['complete']) && matchesIntent(message, ['analysis']))) {
    if (!user.birthDate) {
      return '📊 *Complete Vedic Birth Chart Analysis*\n\nI need your complete birth details to create your personalized cosmic blueprint.\n\nPlease provide:\n• Birth date (DD/MM/YYYY)\n• Birth time (HH:MM) - crucial for accuracy!\n• Birth place (City, Country)\n\nExample: 15/06/1990, 14:30, Mumbai, India\n\n💡 *Pro Tip:* The more accurate your birth time, the more precise your chart!\n\nSend "menu" to explore other cosmic insights!';
    }

    // Enhanced birth data validation
    const validation = this.validateBirthData(user.birthDate, user.birthTime, user.birthPlace);
    if (!validation.isValid) {
      return `❌ *Birth Data Validation*\n\n${validation.message}\n\nPlease check and correct your birth details. Send "update profile" to modify your information.`;
    }

    try {
      const chartData = vedicCalculator.generateCompleteVedicAnalysis({
        name: user.name,
        birthDate: user.birthDate,
        birthTime: user.birthTime || '12:00',
        birthPlace: user.birthPlace || 'Delhi'
      });

      return chartData.comprehensiveDescription;
    } catch (error) {
      logger.error('Error generating complete Vedic analysis:', error);

      // Enhanced fallback with more information
      try {
        const basicChart = vedicCalculator.generateBasicBirthChart({
          name: user.name,
          birthDate: user.birthDate,
          birthTime: user.birthTime || '12:00',
          birthPlace: user.birthPlace || 'Delhi'
        });

        let response = '📊 *Your Vedic Birth Chart (Basic Analysis)*\n\n';
        response += `☀️ *Sun Sign:* ${basicChart.sunSign}\n`;
        response += `🌙 *Moon Sign:* ${basicChart.moonSign}\n`;
        response += `⬆️ *Rising Sign:* ${basicChart.risingSign}\n\n`;
        response += '⚠️ *Service Note:* I\'m currently experiencing technical difficulties with the full analysis. This basic chart shows your core planetary positions.\n\n';
        response += '💡 *What you can do next:*\n';
        response += '• Try again in a few minutes\n';
        response += '• Send "horoscope" for daily guidance\n';
        response += '• Send "compatibility" for relationship insights\n\n';
        response += 'Your birth data is safely stored. The full analysis will be available soon!';

        return response;
      } catch (fallbackError) {
        logger.error('Fallback chart generation also failed:', fallbackError);
        return '⚠️ *Technical Difficulties*\n\nI\'m currently unable to generate your birth chart due to technical issues. This is usually temporary.\n\n💡 *Suggestions:*\n• Try again in 5-10 minutes\n• Send "support" if the issue persists\n• Use other features like "horoscope" or "tarot" in the meantime\n\nYour birth data remains securely stored and will be available when the service is restored.';
      }
    }
  }

  // Check for lunar return requests
  if (matchesIntent(message, ['lunar return', 'monthly lunar', 'moon return', /^lunar/])) {
    if (!user.birthDate) {
      return 'For lunar return analysis, I need your complete birth details first.\n\nPlease provide your birth information:\n• Birth date (DD/MM/YYYY)\n• Birth time (HH:MM) - optional\n• Birth place (City, Country)\n\nExample: 15/06/1990, 14:30, Mumbai, India';
    }

    try {
      const lunarReturn = vedicCalculator.calculateLunarReturn({
        birthDate: user.birthDate,
        birthTime: user.birthTime || '12:00',
        birthPlace: user.birthPlace || 'Delhi, India'
      });

      if (lunarReturn.error) {
        return `❌ *Lunar Return Error*\n\n${lunarReturn.error}\n\nPlease check your birth details and try again.`;
      }

      // Format the response
      let response = '🌙 *Lunar Return Analysis*\n\n';
      response += `*Next Lunar Return:* ${lunarReturn.formattedDate}\n\n`;

      // Monthly themes
      if (lunarReturn.monthlyThemes && lunarReturn.monthlyThemes.length > 0) {
        response += '*Monthly Themes:*\n';
        lunarReturn.monthlyThemes.forEach(theme => {
          response += `• ${theme}\n`;
        });
        response += '\n';
      }

      // Emotional cycle
      if (lunarReturn.emotionalCycle) {
        response += `*Emotional Focus:* ${lunarReturn.emotionalCycle}\n\n`;
      }

      // Recommendations
      if (lunarReturn.recommendations && lunarReturn.recommendations.length > 0) {
        response += '*Monthly Guidance:*\n';
        lunarReturn.recommendations.forEach(rec => {
          response += `• ${rec}\n`;
        });
        response += '\n';
      }

      // Analysis details
      if (lunarReturn.analysis && lunarReturn.analysis.emotionalFocus) {
        response += `*Key Insights:* ${lunarReturn.analysis.emotionalFocus}\n\n`;
      }

      response += '*About Lunar Returns:*\n';
      response += 'Lunar returns occur when the Moon returns to its natal position (approximately every 27.3 days). This chart reveals the emotional and psychological themes for the coming month, showing how you\'ll feel and what life areas will be emphasized.';

      return response;
    } catch (error) {
      logger.error('Error generating lunar return:', error);
      return '❌ Sorry, I encountered an error while calculating your lunar return. Please try again later.';
    }
  }

  // Check for partner birth details in message (for synastry analysis)
  const partnerData = extractPartnerData(message);
  if (partnerData && user.birthDate) {
    try {
      // Perform synastry analysis
      const synastryResult = vedicCalculator.performSynastryAnalysis(
        {
          name: user.name || 'You',
          birthDate: user.birthDate,
          birthTime: user.birthTime || '12:00',
          birthPlace: user.birthPlace || 'Delhi, India'
        },
        {
          name: partnerData.name || 'Partner',
          birthDate: partnerData.birthDate,
          birthTime: partnerData.birthTime || '12:00',
          birthPlace: partnerData.birthPlace || 'Delhi, India'
        }
      );

      if (synastryResult.error) {
        return `❌ *Synastry Analysis Error*\n\n${synastryResult.error}\n\nPlease check your partner's birth details and try again.`;
      }

      // Format the response
      let response = `💕 *Synastry Analysis: ${synastryResult.person1.name} & ${synastryResult.person2.name}*\n\n`;

      // Compatibility overview
      const compat = synastryResult.compatibility;
      response += `🎯 *Overall Compatibility: ${compat.overallScore}/100*\n`;
      response += `${compat.summary}\n\n`;

      // Category scores
      response += '📊 *Compatibility Categories:*\n';
      response += `💖 Romantic: ${compat.categories.romantic}/100\n`;
      response += `💬 Communication: ${compat.categories.communication}/100\n`;
      response += `❤️ Emotional: ${compat.categories.emotional}/100\n`;
      response += `🧘 Spiritual: ${compat.categories.spiritual}/100\n\n`;

      // Key aspects
      if (synastryResult.synastryAspects && synastryResult.synastryAspects.length > 0) {
        response += '🔗 *Key Synastry Aspects:*\n';
        synastryResult.synastryAspects.slice(0, 5).forEach(aspect => {
          response += `• ${aspect.planet1}-${aspect.planet2} ${aspect.aspect}: ${aspect.interpretation}\n`;
        });
        response += '\n';
      }

      // Composite chart insights
      if (synastryResult.compositeChart && synastryResult.compositeChart.interpretations) {
        response += '🌟 *Composite Chart Insights:*\n';
        response += `${synastryResult.compositeChart.interpretations.relationshipNature}\n\n`;
      }

      // Davison chart purpose
      if (synastryResult.davisonChart && synastryResult.davisonChart.relationshipPurpose) {
        response += '🎭 *Relationship Purpose (Davison Chart):*\n';
        response += `${synastryResult.davisonChart.relationshipPurpose}\n\n`;
      }

      // Strengths and challenges
      if (compat.strengths && compat.strengths.length > 0) {
        response += '✅ *Relationship Strengths:*\n';
        compat.strengths.forEach(strength => {
          response += `• ${strength}\n`;
        });
        response += '\n';
      }

      if (compat.challenges && compat.challenges.length > 0) {
        response += '⚠️ *Areas for Growth:*\n';
        compat.challenges.forEach(challenge => {
          response += `• ${challenge}\n`;
        });
        response += '\n';
      }

      // Relationship insights
      if (synastryResult.relationshipInsights && synastryResult.relationshipInsights.length > 0) {
        response += '💡 *Key Relationship Insights:*\n';
        synastryResult.relationshipInsights.forEach(insight => {
          response += `• ${insight.insight}\n`;
        });
      }

      return response;
    } catch (error) {
      logger.error('Error performing synastry analysis:', error);
      return '❌ Sorry, I encountered an error while performing the synastry analysis. Please try again later.';
    }
  }

  // Synastry analysis requests
  if (matchesIntent(message, ['synastry', 'relationship astrology', 'couple analysis', 'partner compatibility', /^synastry/])) {
    if (!user.birthDate) {
      return 'For synastry analysis, I need your complete birth details first.\n\nPlease provide your birth information:\n• Birth date (DD/MM/YYYY)\n• Birth time (HH:MM) - optional\n• Birth place (City, Country)\n\nExample: 15/06/1990, 14:30, Mumbai, India';
    }

    return '💕 *Synastry Analysis - Relationship Astrology*\n\nI can perform a detailed synastry analysis comparing your birth chart with your partner\'s chart. This reveals how your planetary energies interact!\n\nPlease provide your partner\'s birth details:\n• Birth date (DD/MM/YYYY)\n• Birth time (HH:MM) - optional but recommended\n• Birth place (City, Country)\n\nExample: 25/12/1985, 09:15, London, UK\n\nThis will show:\n• Planetary aspects between charts\n• Composite chart insights\n• Relationship strengths and challenges\n• Romantic and emotional compatibility';
  }

  // Compatibility requests
  if (matchesIntent(message, ['compatibility', 'match', 'compatible', /^compatib/])) {
    if (!user.birthDate) {
      return 'For compatibility analysis, I need your birth details first. Please share your birth date (DD/MM/YYYY) so I can get started.';
    }

    return '💕 *Compatibility Analysis*\n\nI can check how compatible you are with someone else! Please provide their birth date (DD/MM/YYYY) and I\'ll compare it with your chart.\n\nExample: 25/12/1985\n\n*Note:* This is a basic compatibility check. Premium users get detailed relationship insights!';
  }

  // Profile/birth details
  if (matchesIntent(message, ['profile', 'details', 'birth', /^my (profile|details|birth)/])) {
    if (user.profileComplete) {
      return `📋 *Your Profile*\n\nName: ${user.name || 'Not set'}\nBirth Date: ${user.birthDate}\nBirth Time: ${user.birthTime || 'Not set'}\nBirth Place: ${user.birthPlace || 'Not set'}\nSun Sign: ${user.sunSign || 'Not calculated'}\n\nWould you like to update any information or get a reading?`;
    } else {
      return 'Let\'s complete your profile! I need your birth details to provide accurate readings.\n\nPlease provide:\n• Birth date (DD/MM/YYYY)\n• Birth time (HH:MM) - optional\n• Birth place (City, Country)\n\nExample: 15/06/1990, 14:30, Mumbai, India';
    }
  }

  // Help and general responses
  if (matchesIntent(message, ['help', 'what can you do', 'commands', /^help/, /^what do you do/])) {
    return '🌟 *I\'m your Personal Cosmic Coach!*\n\nI can help you with:\n\n📅 *Daily Horoscope* - Personalized daily guidance\n📊 *Vedic Birth Chart* - Your cosmic blueprint with advanced dasha & transits\n🕉️ *Hindu Vedic Astrology* - Traditional Kundli, marriage matching, Lagna analysis\n🌏 *BaZi Analysis* - Chinese Four Pillars astrology\n💕 *Compatibility* - Relationship insights\n\n🔮 *Divination Systems:*\n🔮 *Tarot Readings* - Single card, 3-card, or Celtic Cross spreads\n🤲 *Palmistry* - Hand analysis and life path insights\n📜 *Nadi Astrology* - South Indian palm leaf predictions\n\n🌳 *Mystical Traditions:*\n🌳 *Kabbalistic Astrology* - Tree of Life and Sephiroth analysis\n🗓️ *Mayan Calendar* - Tzolk\'in and Haab date calculations\n🍃 *Celtic Astrology* - Tree signs and animal totems\n🔮 *I Ching* - Ancient Chinese oracle\n\n🗺️ *Advanced Systems:*\n🗺️ *Astrocartography* - Planetary lines and relocation guidance\n⏰ *Horary Astrology* - Answers to specific questions\n🪐 *Asteroid Analysis* - Chiron, Juno, Vesta, Pallas insights\n⭐ *Fixed Stars* - Ancient stellar influences and cosmic wisdom\n\n🔬 *Predictive Astrology:*\n🔬 *Secondary Progressions* - Soul\'s journey and life development\n☀️ *Solar Arc Directions* - Major life changes and turning points\n\nJust send me a message like:\n• "What\'s my horoscope today?"\n• "Show me my birth chart"\n• "Asteroid analysis" or "Fixed stars"\n• "Secondary progressions" or "Solar arc directions"\n• "Tarot reading" or "Palmistry"\n• "Kabbalistic analysis" or "Mayan calendar"\n• "I Ching oracle" or "Astrocartography"\n• "Horary: When will I find love?"\n\nWhat aspect of your cosmic journey interests you? ✨';
  }

  // Default response with interactive options
  return `✨ Thank you for your message, ${user.name || 'cosmic explorer'}!\n\nI'm here to guide you through your cosmic journey. I can provide personalized horoscopes, birth chart analysis, compatibility insights, and much more.\n\nWhat aspect of your life would you like cosmic guidance on today? 🌟`;
};

/**
 * Validate birth data format and completeness
 * @param {string} birthDate - Birth date string
 * @param {string} birthTime - Birth time string
 * @param {string} birthPlace - Birth place string
 * @returns {Object} Validation result
 */
function validateBirthData(birthDate, birthTime, birthPlace) {
  const result = { isValid: true, message: '' };

  // Validate birth date format
  if (!birthDate) {
    result.isValid = false;
    result.message = 'Birth date is required.';
    return result;
  }

  const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  const dateMatch = birthDate.match(dateRegex);

  if (!dateMatch) {
    result.isValid = false;
    result.message = 'Birth date must be in DD/MM/YYYY format (e.g., 15/06/1990).';
    return result;
  }

  const [, day, month, year] = dateMatch.map(Number);

  // Validate date ranges
  if (day < 1 || day > 31) {
    result.isValid = false;
    result.message = 'Birth day must be between 1 and 31.';
    return result;
  }

  if (month < 1 || month > 12) {
    result.isValid = false;
    result.message = 'Birth month must be between 1 and 12.';
    return result;
  }

  if (year < 1800 || year > new Date().getFullYear()) {
    result.isValid = false;
    result.message = `Birth year must be between 1800 and ${new Date().getFullYear()}.`;
    return result;
  }

  // Validate birth time format (if provided)
  if (birthTime) {
    const timeRegex = /^(\d{1,2}):(\d{2})$/;
    const timeMatch = birthTime.match(timeRegex);

    if (!timeMatch) {
      result.isValid = false;
      result.message = 'Birth time must be in HH:MM format (e.g., 14:30).';
      return result;
    }

    const [, hour, minute] = timeMatch.map(Number);

    if (hour < 0 || hour > 23) {
      result.isValid = false;
      result.message = 'Birth hour must be between 00 and 23.';
      return result;
    }

    if (minute < 0 || minute > 59) {
      result.isValid = false;
      result.message = 'Birth minute must be between 00 and 59.';
      return result;
    }
  }

  // Validate birth place
  if (!birthPlace || birthPlace.trim().length < 2) {
    result.isValid = false;
    result.message = 'Birth place is required and should be at least 2 characters long.';
    return result;
  }

  // Check for reasonable place format (City, Country)
  if (!birthPlace.includes(',')) {
    result.message += '\nTip: Include country for better accuracy (e.g., "Mumbai, India").';
  }

  return result;
}

module.exports = {
  generateAstrologyResponse,
  validateBirthData
};
