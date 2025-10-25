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

/**
 * Generates an astrology response based on user input and user data.
 * Uses basic Vedic astrology calculations for MVP functionality.
 * @param {string} messageText - The text message from the user.
 * @param {Object} user - The user object containing profile information.
 * @returns {Promise<string>} The generated astrology response.
 */
const generateAstrologyResponse = async(messageText, user) => {
  logger.info(`Generating astrology response for user ${user.phoneNumber} with message: ${messageText}`);

  const message = messageText.toLowerCase().trim();

  // Greeting responses
  if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
    return `🌟 Hello ${user.name || 'cosmic explorer'}! Welcome to your Personal Cosmic Coach. I'm here to help you navigate your cosmic journey. What would you like to explore today?`;
  }

  // Daily horoscope
  if (message.includes('horoscope') || message.includes('daily')) {
    if (!user.birthDate) {
      return 'I\'d love to give you a personalized daily horoscope! Please share your birth date (DD/MM/YYYY) first so I can calculate your sun sign.';
    }

    const sunSign = vedicCalculator.calculateSunSign(user.birthDate);
    const horoscopeData = vedicCalculator.generateDailyHoroscope(user.birthDate);

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
    const userCount = 2847; // Mock social proof
    const insightsReceived = user.insightsReceived || 0;

    return `🌟 *Daily Horoscope for ${sunSign}*\n\n${horoscopeText}\n\n⭐ *${userCount} users* with your sign found today's guidance particularly accurate!\n\n📊 *Your Cosmic Journey:* ${insightsReceived + 1} personalized insights received\n\nRemember, the stars guide us but you create your destiny! ✨`;
  }

  // Chinese astrology (BaZi) requests
  if (message.includes('chinese') || message.includes('bazi') || message.includes('four pillars') || message.includes('八字')) {
    if (!user.birthDate) {
      return 'To generate your BaZi (Four Pillars) analysis, I need your birth details. Please provide:\n• Birth date (DD/MM/YYYY)\n• Birth time (HH:MM) - optional but recommended\n• Birth place (City, Country)\n\nExample: 15/06/1990, 14:30, Beijing, China';
    }

    try {
      const baziAnalysis = chineseCalculator.calculateFourPillars(user.birthDate, user.birthTime || '12:00');
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
      response += 'Would you like your Vedic birth chart or compatibility analysis?';

      return response;
    } catch (error) {
      logger.error('Error generating BaZi analysis:', error);
      return 'I\'m having trouble generating your BaZi analysis right now. Please try again later.';
    }
  }

  // Tarot reading requests
  if (message.includes('tarot') || message.includes('card') || message.includes('reading')) {
    try {
      const spread = message.includes('celtic') ? 'celtic' :
                    message.includes('three') ? 'three' :
                    message.includes('single') ? 'single' : 'single';

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
        if (card.advice) response += `• *Advice:* ${card.advice}\n`;
        response += '\n';
      });

      response += `*Overall Message:* ${reading.overallMessage}\n\n`;
      response += 'Remember, tarot offers guidance, not certainty. Trust your intuition! ✨';

      return response;
    } catch (error) {
      logger.error('Error generating tarot reading:', error);
      return 'I\'m having trouble connecting with the tarot cards right now. Please try again later.';
    }
  }

  // Palmistry requests
  if (message.includes('palm') || message.includes('hand') || message.includes('palmistry')) {
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
  if (message.includes('nadi') || message.includes('south indian') || message.includes('palm leaf')) {
    if (!user.birthDate) {
      return 'For Nadi astrology analysis, I need your birth details. Nadi readings are highly specific to exact birth information.\n\nPlease provide:\n• Birth date (DD/MM/YYYY)\n• Birth time (HH:MM)\n• Birth place (City, State, Country)\n\nExample: 15/06/1990, 14:30, Chennai, Tamil Nadu, India';
    }

    try {
      const nadiAnalysis = nadiReader.calculateNadiReading(user.birthDate, user.birthTime || '12:00', user.birthPlace || 'Chennai, India');

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
      response += 'Nadi astrology connects you to ancient South Indian wisdom! 🕉️';

      return response;
    } catch (error) {
      logger.error('Error generating Nadi analysis:', error);
      return 'I\'m having trouble accessing the Nadi records right now. Please try again later.';
    }
  }

  // Kabbalistic astrology requests
  if (message.includes('kabbalah') || message.includes('kabbalistic') || message.includes('tree of life') || message.includes('sephiroth')) {
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
  if (message.includes('mayan') || message.includes('tzolk') || message.includes('haab') || message.includes('mayan calendar')) {
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
  if (message.includes('celtic') || message.includes('druid') || message.includes('tree sign') || message.includes('celtic astrology')) {
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
  if (message.includes('i ching') || message.includes('iching') || message.includes('hexagram') || message.includes('oracle')) {
    try {
      const question = message.replace(/i ching|iching|hexagram|oracle/gi, '').trim();
      const reading = ichingReader.generateIChingReading(question);

      return reading.ichingDescription;
    } catch (error) {
      logger.error('Error generating I Ching reading:', error);
      return 'I\'m having trouble consulting the I Ching oracle right now. Please try again later.';
    }
  }

  // Astrocartography requests
  if (message.includes('astrocartography') || message.includes('astro cartography') || message.includes('planetary lines') || message.includes('relocation')) {
    if (!user.birthDate) {
      return 'For astrocartography analysis, I need your complete birth details to map planetary lines across the globe.\n\nPlease provide:\n• Birth date (DD/MM/YYYY)\n• Birth time (HH:MM)\n• Birth place (City, Country)\n\nExample: 15/06/1990, 14:30, New York, USA';
    }

    try {
      const astrocartographyAnalysis = astrocartographyReader.generateAstrocartography({
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

  // Horary astrology requests
  if (message.includes('horary') || message.includes('question') && (message.includes('when') || message.includes('will') || message.includes('should') || message.includes('can'))) {
    // Extract the question from the message
    const questionMatch = message.match(/(?:horary|question|ask)\s+(.*)/i);
    const question = questionMatch ? questionMatch[1].trim() : message.replace(/horary/i, '').trim();

    if (!question || question.length < 5) {
      return 'For horary astrology, please ask a clear, specific question. Horary works best with questions like:\n\n• "When will I get a job?"\n• "Will my relationship work out?"\n• "Should I move to another city?"\n• "When will my health improve?"\n\nWhat is your question?';
    }

    try {
      const currentTime = new Date().toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).replace(/(\d+)\/(\d+)\/(\d+),\s*(.+)/, '$2/$1/$3 $4');

      const horaryReading = horaryReader.generateHoraryReading(question, currentTime);

      if (!horaryReading.valid) {
        return horaryReading.reason;
      }

      return horaryReading.horaryDescription;
    } catch (error) {
      logger.error('Error generating horary reading:', error);
      return 'I\'m having trouble casting the horary chart right now. Please try again later.';
    }
  }

  // Birth chart requests
  if (message.includes('birth chart') || message.includes('kundli') || message.includes('chart') || message.includes('complete') && message.includes('analysis')) {
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
        response += 'I\'m having trouble generating the full analysis right now. Please try again later.';

        return response;
      } catch (fallbackError) {
        return 'I\'m having trouble generating your birth chart right now. Please try again later or contact support.';
      }
    }
  }

  // Compatibility requests
  if (message.includes('compatibility') || message.includes('match') || message.includes('compatible')) {
    if (!user.birthDate) {
      return 'For compatibility analysis, I need your birth details first. Please share your birth date (DD/MM/YYYY) so I can get started.';
    }

    return '💕 *Compatibility Analysis*\n\nI can check how compatible you are with someone else! Please provide their birth date (DD/MM/YYYY) and I\'ll compare it with your chart.\n\nExample: 25/12/1985\n\n*Note:* This is a basic compatibility check. Premium users get detailed relationship insights!';
  }

  // Profile/birth details
  if (message.includes('profile') || message.includes('details') || message.includes('birth')) {
    if (user.profileComplete) {
      return `📋 *Your Profile*\n\nName: ${user.name || 'Not set'}\nBirth Date: ${user.birthDate}\nBirth Time: ${user.birthTime || 'Not set'}\nBirth Place: ${user.birthPlace || 'Not set'}\nSun Sign: ${vedicCalculator.calculateSunSign(user.birthDate)}\n\nWould you like to update any information or get a reading?`;
    } else {
      return 'Let\'s complete your profile! I need your birth details to provide accurate readings.\n\nPlease provide:\n• Birth date (DD/MM/YYYY)\n• Birth time (HH:MM) - optional\n• Birth place (City, Country)\n\nExample: 15/06/1990, 14:30, Mumbai, India';
    }
  }

  // Help and general responses
  if (message.includes('help') || message.includes('what can you do') || message.includes('commands')) {
    return '🌟 *I\'m your Personal Cosmic Coach!*\n\nI can help you with:\n\n📅 *Daily Horoscope* - Personalized daily guidance\n📊 *Vedic Birth Chart* - Your cosmic blueprint with advanced dasha & transits\n🌏 *BaZi Analysis* - Chinese Four Pillars astrology\n💕 *Compatibility* - Relationship insights\n\n🔮 *Divination Systems:*\n🔮 *Tarot Readings* - Single card, 3-card, or Celtic Cross spreads\n🤲 *Palmistry* - Hand analysis and life path insights\n📜 *Nadi Astrology* - South Indian palm leaf predictions\n\n🌳 *Mystical Traditions:*\n🌳 *Kabbalistic Astrology* - Tree of Life and Sephiroth analysis\n🗓️ *Mayan Calendar* - Tzolk\'in and Haab date calculations\n🍃 *Celtic Astrology* - Tree signs and animal totems\n🔮 *I Ching* - Ancient Chinese oracle\n\n🗺️ *Advanced Systems:*\n🗺️ *Astrocartography* - Planetary lines and relocation guidance\n⏰ *Horary Astrology* - Answers to specific questions\n\nJust send me a message like:\n• "What\'s my horoscope today?"\n• "Show me my birth chart"\n• "Tarot reading" or "Palmistry"\n• "Kabbalistic analysis" or "Mayan calendar"\n• "I Ching oracle" or "Astrocartography"\n• "Horary: When will I find love?"\n\nWhat aspect of your cosmic journey interests you? ✨';
  }

  // Default response with interactive options
  return `✨ Thank you for your message, ${user.name || 'cosmic explorer'}!\n\nI'm here to guide you through your cosmic journey. I can provide personalized horoscopes, birth chart analysis, compatibility insights, and much more.\n\nWhat aspect of your life would you like cosmic guidance on today? 🌟`;
};

module.exports = {
  generateAstrologyResponse
};
