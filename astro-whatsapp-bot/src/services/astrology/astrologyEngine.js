const logger = require('../../utils/logger');
const vedicCalculator = require('./vedicCalculator');
const chineseCalculator = require('./chineseCalculator');

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
    const horoscope = vedicCalculator.generateDailyHoroscope(sunSign);

    // Add social proof and progress tracking
    const userCount = 2847; // Mock social proof
    const insightsReceived = user.insightsReceived || 0;

    return `🌟 *Daily Horoscope for ${sunSign}*\n\n${horoscope}\n\n⭐ *${userCount} users* with your sign found today's guidance particularly accurate!\n\n📊 *Your Cosmic Journey:* ${insightsReceived + 1} personalized insights received\n\nRemember, the stars guide us but you create your destiny! ✨`;
  }

   // Chinese astrology (BaZi) requests
   if (message.includes('chinese') || message.includes('bazi') || message.includes('four pillars') || message.includes('八字')) {
     if (!user.birthDate) {
       return 'To generate your BaZi (Four Pillars) analysis, I need your birth details. Please provide:\n• Birth date (DD/MM/YYYY)\n• Birth time (HH:MM) - optional but recommended\n• Birth place (City, Country)\n\nExample: 15/06/1990, 14:30, Beijing, China';
     }

     try {
       const baziAnalysis = chineseCalculator.calculateFourPillars(user.birthDate, user.birthTime || '12:00');
       const zodiacInfo = chineseCalculator.getChineseZodiac(user.birthDate);

       let response = `🌏 *Your BaZi (Four Pillars of Destiny) Analysis*\n\n`;
       response += `*Four Pillars:* ${baziAnalysis.chineseNotation}\n\n`;
       response += `*Day Master:* ${baziAnalysis.dayMaster.stem} (${baziAnalysis.dayMaster.element}) - ${baziAnalysis.dayMaster.strength} energy\n\n`;
       response += `*Element Analysis:*\n`;
       response += `Strongest: ${baziAnalysis.elementAnalysis.strongest}\n`;
       response += `Balance: ${baziAnalysis.elementAnalysis.balance}\n\n`;
       response += `*Chinese Zodiac:* ${zodiacInfo.animal} (${zodiacInfo.element})\n`;
       response += `*Traits:* ${zodiacInfo.traits}\n\n`;
       response += `*Interpretation:* ${baziAnalysis.interpretation}\n\n`;
       response += `Would you like your Vedic birth chart or compatibility analysis?`;

       return response;
     } catch (error) {
       logger.error('Error generating BaZi analysis:', error);
       return 'I\'m having trouble generating your BaZi analysis right now. Please try again later.';
     }
   }

   // Birth chart requests
   if (message.includes('birth chart') || message.includes('kundli') || message.includes('chart')) {
     if (!user.birthDate) {
       return 'To generate your birth chart, I need your birth details. Please provide:\n• Birth date (DD/MM/YYYY)\n• Birth time (HH:MM) - optional but recommended\n• Birth place (City, Country)\n\nExample: 15/06/1990, 14:30, Mumbai, India';
     }

     try {
       const chartData = vedicCalculator.generateBasicBirthChart({
         name: user.name,
         birthDate: user.birthDate,
         birthTime: user.birthTime || '12:00',
         birthPlace: user.birthPlace || 'Delhi'
       });

       const userCount = 2847;

       let response = `📊 *Your Complete Natal Chart Analysis*\n\n`;
       response += `☀️ *Sun Sign:* ${chartData.sunSign} - Your core identity\n`;
       response += `🌙 *Moon Sign:* ${chartData.moonSign} - Your emotional nature\n`;
       response += `⬆️ *Rising Sign:* ${chartData.risingSign} - How others perceive you\n\n`;

       // Add dominant elements and qualities
       if (chartData.dominantElements && chartData.dominantElements.length > 0) {
         response += `🔥 *Dominant Elements:* ${chartData.dominantElements.join(', ')}\n`;
       }
       if (chartData.dominantQualities && chartData.dominantQualities.length > 0) {
         response += `⚡ *Dominant Qualities:* ${chartData.dominantQualities.join(', ')}\n\n`;
       }

       // Add personality traits
       if (chartData.personalityTraits && chartData.personalityTraits.length > 0) {
         response += `👤 *Key Personality Traits:*\n`;
         chartData.personalityTraits.slice(0, 4).forEach((trait, index) => {
           response += `${index + 1}. ${trait}\n`;
         });
         response += '\n';
       }

       // Add strengths
       if (chartData.strengths && chartData.strengths.length > 0) {
         response += `💪 *Your Cosmic Strengths:*\n`;
         chartData.strengths.forEach((strength, index) => {
           response += `• ${strength}\n`;
         });
         response += '\n';
       }

       // Add challenges
       if (chartData.challenges && chartData.challenges.length > 0) {
         response += `🎯 *Areas for Growth:*\n`;
         chartData.challenges.forEach((challenge, index) => {
           response += `• ${challenge}\n`;
         });
         response += '\n';
       }

       response += `⭐ *${userCount} users* with similar charts report these insights resonate strongly!\n\n`;

       // Add Chinese astrology (BaZi) analysis
       try {
         const baziAnalysis = chineseCalculator.calculateFourPillars(user.birthDate, user.birthTime || '12:00');
         if (baziAnalysis.pillars) {
           response += `🌏 *Chinese Astrology (BaZi):*\n`;
           response += `Four Pillars: ${baziAnalysis.chineseNotation}\n`;
           response += `Day Master: ${baziAnalysis.dayMaster.element} (${baziAnalysis.dayMaster.strength})\n`;
           response += `Chinese Zodiac: ${baziAnalysis.pillars.year.animal} (${baziAnalysis.pillars.year.element})\n\n`;
         }
       } catch (error) {
         logger.warn('Could not generate BaZi analysis:', error.message);
       }

       response += `Would you like your daily horoscope, compatibility analysis, or transit insights?`;

       return response;
     } catch (error) {
       logger.error('Error generating birth chart:', error);
       return 'I\'m having trouble generating your birth chart right now. Please try again later or contact support.';
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
     return '🌟 *I\'m your Personal Cosmic Coach!*\n\nI can help you with:\n\n📅 *Daily Horoscope* - Personalized daily guidance\n📊 *Vedic Birth Chart* - Your cosmic blueprint (Western astrology)\n🌏 *BaZi Analysis* - Chinese Four Pillars astrology\n💕 *Compatibility* - Relationship insights\n🔮 *Predictions* - Future guidance\n\nJust send me a message like:\n• "What\'s my horoscope today?"\n• "Show me my birth chart"\n• "Chinese astrology" or "BaZi analysis"\n• "Check compatibility with [birth date]"\n\nWhat\'s on your mind? ✨';
   }

  // Default response
  return `✨ Thank you for your message, ${user.name || 'cosmic explorer'}!\n\nI'm here to guide you through your cosmic journey. I can provide personalized horoscopes, birth chart analysis, compatibility insights, and much more.\n\nWhat aspect of your life would you like cosmic guidance on today? 🌟`;
};

module.exports = {
  generateAstrologyResponse
};
