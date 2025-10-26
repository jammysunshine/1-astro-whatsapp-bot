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

// Configuration for horary timezone
const HORARY_TIMEZONE = process.env.HORARY_TIMEZONE || 'Asia/Kolkata';

logger.info(
  'Module: astrologyEngine loaded. All sub-modules imported successfully.'
);

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
    const horoscopeData = vedicCalculator.generateDailyHoroscope(
      user.birthDate
    );

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
      const nadiAnalysis = nadiReader.calculateNadiReading(
        user.birthDate,
        user.birthTime || '12:00',
        user.birthPlace || 'Chennai, India'
      );

      let response = '📜 *Nadi Astrology Analysis*\n\n';
      response += `*Nakshatra:* ${nadiAnalysis.nakshatra}\n`;
      response += `*Rashi:* ${nadiAnalysis.rashi}\n`;
      response += `*Nadi:* ${nadiAnalysis.nadi}\n\n`;

      response += '*Current Dasha:*\n';
      response += `• Mahadasha: ${nadiAnalysis.currentDasha.mahadasha} (${nadiAnalysis.currentDasha.period})\n`;
      response += `• Antardasha: ${nadiAnalysis.currentDasha.antardasha}\n\n`;

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
      response += `🩹 *Chiron in ${asteroidAnalysis.asteroids.chiron.sign}*\n`;
      response += `• Core Wound: ${asteroidAnalysis.interpretations.chiron.coreWound}\n`;
      response += `• Healing Gift: ${asteroidAnalysis.interpretations.chiron.healingGift}\n\n`;

      // Juno
      response += `💍 *Juno in ${asteroidAnalysis.asteroids.juno.sign}*\n`;
      response += `• Relationship Style: ${asteroidAnalysis.interpretations.juno.relationshipStyle}\n`;
      response += `• Commitment Style: ${asteroidAnalysis.interpretations.juno.commitmentStyle}\n\n`;

      // Vesta
      response += `🏛️ *Vesta in ${asteroidAnalysis.asteroids.vesta.sign}*\n`;
      response += `• Sacred Focus: ${asteroidAnalysis.interpretations.vesta.sacredFocus}\n`;
      response += `• Devotion Style: ${asteroidAnalysis.interpretations.vesta.devotionStyle}\n\n`;

      // Pallas
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
      const progressions = vedicCalculator.calculateSecondaryProgressions({
        birthDate: user.birthDate,
        birthTime: user.birthTime || '12:00',
        birthPlace: user.birthPlace || 'Delhi'
      });

      if (progressions.error) {
        return `I encountered an issue calculating your progressions: ${progressions.error}`;
      }

      let response = '🔮 *Secondary Progressions Analysis*\n\n';
      response += `*Age:* ${progressions.ageInYears} years old\n`;
      response += `*Life Stage:* ${progressions.ageDescription}\n\n`;

      response += '*Key Progressed Planets:*\n';
      progressions.keyProgressions.forEach(prog => {
        response += `• *${prog.planet}:* ${prog.position} - ${prog.significance}\n`;
      });
      response += '\n';

      if (progressions.majorThemes.length > 0) {
        response += '*Current Themes:*\n';
        progressions.majorThemes.forEach(theme => {
          response += `• ${theme}\n`;
        });
        response += '\n';
      }

      response += '*How Progressions Work:*\n';
      response += '• Planets move one day per year of life\n';
      response += '• Progressed Sun moves ~1° per year\n';
      response += '• Progressed Moon moves ~13-14° per year\n';
      response += '• Shows inner development and life timing\n\n';

      response += 'Secondary progressions reveal your soul\'s journey and life lessons! 🌟';

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
      const solarArc = vedicCalculator.calculateSolarArcDirections({
        birthDate: user.birthDate,
        birthTime: user.birthTime || '12:00',
        birthPlace: user.birthPlace || 'Delhi'
      });

      if (solarArc.error) {
        return `I encountered an issue calculating your solar arc directions: ${solarArc.error}`;
      }

      let response = '☀️ *Solar Arc Directions Analysis*\n\n';
      response += `*Age:* ${solarArc.ageInYears} years old\n`;
      response += `*Solar Arc Movement:* ${solarArc.solarArcDegrees}°\n\n`;

      response += '*Key Directed Planets:*\n';
      solarArc.keyDirections.slice(0, 3).forEach(direction => {
        response += `• *${direction.planet}:* ${direction.from} → ${direction.to}\n`;
        response += `  ${direction.significance}\n`;
      });
      response += '\n';

      if (solarArc.lifeChanges.length > 0) {
        response += '*Life Changes:*\n';
        solarArc.lifeChanges.forEach(change => {
          response += `• ${change}\n`;
        });
        response += '\n';
      }

      response += '*How Solar Arc Works:*\n';
      response += '• All planets move same distance as the Sun\n';
      response += '• Shows major life changes and turning points\n';
      response += '• Powerful for predicting significant events\n\n';

      response += 'Solar arc directions reveal major life transformations! ⚡';

      return response;
    } catch (error) {
      logger.error('Error generating solar arc directions:', error);
      return 'I\'m having trouble calculating your solar arc directions right now. Please try again later.';
    }
  }

  // Birth chart requests
   if (matchesIntent(message, ['birth chart', 'kundli', 'chart', /^kundli/]) ||
       (matchesIntent(message, ['complete']) && matchesIntent(message, ['analysis']))) {
     if (!user.birthDate) {
       return 'To generate your complete Vedic birth chart analysis, I need your birth details. Please provide:\n• Birth date (DD/MM/YYYY)\n• Birth time (HH:MM) - optional but recommended\n• Birth place (City, Country)\n\nExample: 15/06/1990, 14:30, Mumbai, India';
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
       // Fallback to basic chart
       try {
         const basicChart = vedicCalculator.generateBasicBirthChart({
           name: user.name,
           birthDate: user.birthDate,
           birthTime: user.birthTime || '12:00',
           birthPlace: user.birthPlace || 'Delhi'
         });

         let response = '📊 *Your Vedic Birth Chart*\n\n';
         response += `☀️ *Sun Sign:* ${basicChart.sunSign}\n`;
         response += `🌙 *Moon Sign:* ${basicChart.moonSign}\n`;
         response += `⬆️ *Rising Sign:* ${basicChart.risingSign}\n\n`;
         response +=
           'I\'m having trouble generating the full analysis right now. Please try again later.';

         return response;
       } catch (fallbackError) {
         return 'I\'m having trouble generating your birth chart right now. Please try again later or contact support.';
       }
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
      return `📋 *Your Profile*\n\nName: ${user.name || 'Not set'}\nBirth Date: ${user.birthDate}\nBirth Time: ${user.birthTime || 'Not set'}\nBirth Place: ${user.birthPlace || 'Not set'}\nSun Sign: ${vedicCalculator.calculateSunSign(user.birthDate)}\n\nWould you like to update any information or get a reading?`;
    } else {
      return 'Let\'s complete your profile! I need your birth details to provide accurate readings.\n\nPlease provide:\n• Birth date (DD/MM/YYYY)\n• Birth time (HH:MM) - optional\n• Birth place (City, Country)\n\nExample: 15/06/1990, 14:30, Mumbai, India';
    }
  }

  // Help and general responses
   if (matchesIntent(message, ['help', 'what can you do', 'commands', /^help/, /^what do you do/])) {
     return '🌟 *I\'m your Personal Cosmic Coach!*\n\nI can help you with:\n\n📅 *Daily Horoscope* - Personalized daily guidance\n📊 *Vedic Birth Chart* - Your cosmic blueprint with advanced dasha & transits\n🌏 *BaZi Analysis* - Chinese Four Pillars astrology\n💕 *Compatibility* - Relationship insights\n\n🔮 *Divination Systems:*\n🔮 *Tarot Readings* - Single card, 3-card, or Celtic Cross spreads\n🤲 *Palmistry* - Hand analysis and life path insights\n📜 *Nadi Astrology* - South Indian palm leaf predictions\n\n🌳 *Mystical Traditions:*\n🌳 *Kabbalistic Astrology* - Tree of Life and Sephiroth analysis\n🗓️ *Mayan Calendar* - Tzolk\'in and Haab date calculations\n🍃 *Celtic Astrology* - Tree signs and animal totems\n🔮 *I Ching* - Ancient Chinese oracle\n\n🗺️ *Advanced Systems:*\n🗺️ *Astrocartography* - Planetary lines and relocation guidance\n⏰ *Horary Astrology* - Answers to specific questions\n🪐 *Asteroid Analysis* - Chiron, Juno, Vesta, Pallas insights\n\n🔬 *Predictive Astrology:*\n🔬 *Secondary Progressions* - Soul\'s journey and life development\n☀️ *Solar Arc Directions* - Major life changes and turning points\n\nJust send me a message like:\n• "What\'s my horoscope today?"\n• "Show me my birth chart"\n• "Asteroid analysis" or "Chiron placement"\n• "Secondary progressions" or "Solar arc directions"\n• "Tarot reading" or "Palmistry"\n• "Kabbalistic analysis" or "Mayan calendar"\n• "I Ching oracle" or "Astrocartography"\n• "Horary: When will I find love?"\n\nWhat aspect of your cosmic journey interests you? ✨';
   }

  // Default response with interactive options
  return `✨ Thank you for your message, ${user.name || 'cosmic explorer'}!\n\nI'm here to guide you through your cosmic journey. I can provide personalized horoscopes, birth chart analysis, compatibility insights, and much more.\n\nWhat aspect of your life would you like cosmic guidance on today? 🌟`;
};

module.exports = {
  generateAstrologyResponse
};
