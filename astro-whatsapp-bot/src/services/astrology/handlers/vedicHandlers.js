const vedicCalculator = require('../vedicCalculator');
const nadiReader = require('../nadiReader');
const { VedicRemedies } = require('../vedicRemedies');
const { IslamicAstrology } = require('../islamicAstrology');
const { VimshottariDasha } = require('../vimshottariDasha');
const { JaiminiAstrology } = require('../jaiminiAstrology');
const { NadiAstrology } = require('../nadiAstrology');
const { HinduFestivals } = require('../hinduFestivals');
const { VedicNumerology } = require('../vedicNumerology');
const { AyurvedicAstrology } = require('../ayurvedicAstrology');
const { matchesIntent } = require('../utils/intentUtils');
const { buildMedicalAstrologyResponse, buildFinancialAstrologyResponse, buildHarmonicAstrologyResponse, buildCareerAstrologyResponse } = require('../utils/responseBuilders');
const logger = require('../../../utils/logger');

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
 * Handle Nadi astrology requests
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {Promise<string|null>} Nadi response or null if not a Nadi request
 */
const handleNadi = async (message, user) => {
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
    } catch (error) {
      logger.error('Error generating Nadi analysis:', error);
      return 'I\'m having trouble accessing the Nadi records right now. Please try again later.';
    }
  }
  return null;
};

/**
 * Handle fixed stars analysis requests
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {Promise<string|null>} Fixed stars response or null if not a fixed stars request
 */
const handleFixedStars = async (message, user) => {
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
  return null;
};

/**
 * Handle medical astrology requests
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {Promise<string|null>} Medical astrology response or null if not a medical request
 */
const handleMedicalAstrology = async (message, user) => {
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

      return buildMedicalAstrologyResponse(medicalAnalysis);
    } catch (error) {
      logger.error('Error generating medical astrology analysis:', error);
      return 'I\'m having trouble analyzing your medical astrology chart right now. Please try again later.';
    }
  }
  return null;
};

/**
 * Handle financial astrology requests
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {Promise<string|null>} Financial astrology response or null if not a financial request
 */
const handleFinancialAstrology = async (message, user) => {
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

      return buildFinancialAstrologyResponse(financialAnalysis);
    } catch (error) {
      logger.error('Error generating financial astrology analysis:', error);
      return 'I\'m having trouble analyzing your financial astrology chart right now. Please try again later.';
    }
  }
  return null;
};

/**
 * Handle harmonic astrology requests
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {Promise<string|null>} Harmonic astrology response or null if not a harmonic request
 */
const handleHarmonicAstrology = async (message, user) => {
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

      return buildHarmonicAstrologyResponse(harmonicAnalysis);
    } catch (error) {
      logger.error('Error generating harmonic astrology analysis:', error);
      return 'I\'m having trouble analyzing your harmonic astrology chart right now. Please try again later.';
    }
  }
  return null;
};

/**
 * Handle career astrology requests
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {Promise<string|null>} Career astrology response or null if not a career request
 */
const handleCareerAstrology = async (message, user) => {
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

      return buildCareerAstrologyResponse(careerAnalysis);
    } catch (error) {
      logger.error('Error generating career astrology analysis:', error);
      return 'I\'m having trouble analyzing your career astrology chart right now. Please try again later.';
    }
  }
  return null;
};

/**
 * Handle Vedic remedies requests
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {Promise<string|null>} Vedic remedies response or null if not a remedies request
 */
const handleVedicRemedies = async (message, user) => {
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
  return null;
};

/**
 * Handle Islamic astrology requests
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {Promise<string|null>} Islamic astrology response or null if not an Islamic request
 */
const handleIslamicAstrology = async (message, user) => {
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
  return null;
};

/**
 * Handle Vimshottari Dasha analysis requests
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {Promise<string|null>} Vimshottari Dasha response or null if not a dasha request
 */
const handleVimshottariDasha = async (message, user) => {
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
  return null;
};

/**
 * Handle Jaimini Astrology analysis requests
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {Promise<string|null>} Jaimini Astrology response or null if not a Jaimini request
 */
const handleJaiminiAstrology = async (message, user) => {
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
  return null;
};

/**
 * Handle Hindu Festivals requests
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {Promise<string|null>} Hindu Festivals response or null if not a festivals request
 */
const handleHinduFestivals = async (message, user) => {
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
  return null;
};

/**
 * Handle Vedic numerology requests
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {Promise<string|null>} Vedic numerology response or null if not a Vedic numerology request
 */
const handleVedicNumerology = async (message, user) => {
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
  return null;
};

/**
 * Handle Ayurvedic astrology requests
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {Promise<string|null>} Ayurvedic astrology response or null if not an Ayurvedic request
 */
const handleAyurvedicAstrology = async (message, user) => {
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
  return null;
};

logger.info('Module: vedicHandlers loaded successfully.');

module.exports = {
  handleNadi,
  handleFixedStars,
  handleMedicalAstrology,
  handleFinancialAstrology,
  handleHarmonicAstrology,
  handleCareerAstrology,
  handleVedicRemedies,
  handleIslamicAstrology,
  handleVimshottariDasha,
  handleJaiminiAstrology,
  handleHinduFestivals,
  handleVedicNumerology,
  handleAyurvedicAstrology
};