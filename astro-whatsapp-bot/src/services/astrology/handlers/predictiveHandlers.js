const vedicCalculator = require('../vedicCalculator');
const horaryReader = require('../horaryReader');
const { matchesIntent } = require('../utils/intentUtils');
const { getBirthDetailsPrompt } = require('../../../utils/promptUtils');
const logger = require('../../../utils/logger');

// Configuration for horary timezone
const HORARY_TIMEZONE = process.env.HORARY_TIMEZONE || 'Asia/Kolkata';

/**
 * Handle event astrology requests
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {Promise<string|null>} Event astrology response or null if not an event request
 */
const handleEventAstrology = async(message, user) => {
  if (matchesIntent(message, ['event astrology', 'cosmic events', 'eclipses', 'planetary events', 'seasonal astrology', 'cosmic calendar', /^event.?astrology/, /^cosmic.?events/])) {
    if (!user.birthDate) {
      return getBirthDetailsPrompt('event astrology', 'correlate cosmic events with your personal chart');
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
  return null;
};

/**
 * Handle future self simulator requests
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {Promise<string|null>} Future self response or null if not a future self request
 */
const handleFutureSelf = async(message, user) => {
  if (matchesIntent(message, ['future self', 'future self simulator', 'life timeline', 'long-term forecast', 'alternative pathways', 'what will my life be like', /^future.?self/, /^life.?timeline/])) {
    if (!user.birthDate) {
      return getBirthDetailsPrompt('future self simulation', 'create your long-term life timeline');
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

      // Sanitize user name to prevent XSS
      const sanitizedName = user.name ? 
        user.name.replace(/[<>'"&]/g, '').substring(0, 50) : 
        'cosmic explorer';
      
      let response = `🔮 *Future Self Simulator - ${futureSelfAnalysis.projectionYears} Year Projection*\n\n`;
      response += `Hello ${sanitizedName}! Let's explore the potential pathways of your future self.\n\n`;

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
  return null;
};

/**
 * Handle group astrology requests
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {Promise<string|null>} Group astrology response or null if not a group request
 */
const handleGroupAstrology = async(message, user) => {
  if (matchesIntent(message, ['group astrology', 'family astrology', 'group reading', 'family reading', 'combined chart', 'group compatibility', /^group.?astrology/, /^family.?astrology/])) {
    if (!user.birthDate) {
      return `${getBirthDetailsPrompt('group astrology', 'analyze group dynamics with other members')}\n\nThen I can analyze group dynamics with other members!`;
    }

    return '👨‍👩‍👧‍👦 *Group & Family Astrology*\n\nDiscover the cosmic dynamics of your family or social group! I can create:\n\n🌟 *Composite Charts* - Combined energy of the group\n🤝 *Compatibility Analysis* - How members interact astrologically\n📊 *Group Dynamics* - Communication styles and decision making\n🎯 *Shared Purpose* - Collective goals and challenges\n⏰ *Timing Insights* - Best periods for group activities\n\n*To get a group reading:*\n\n1. Send your birth details (if not already set)\n2. Provide details for 2-6 other group members\n3. Specify group type: "family", "couple", "friends", or "colleagues"\n\n*Format for each member:*\n```\nName: [Full Name]\nBirth: DDMMYY or DDMMYYYY, HHMM\nPlace: [City, Country]\n```\n\nExample:\n```\nJohn: 15061990, 1430, Mumbai, India\nJane: 22031992, 0915, Delhi, India\nType: family\n```\n\nWhat type of group would you like to analyze?';
  }
  return null;
};

/**
 * Handle marriage compatibility requests
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {Promise<string|null>} Marriage compatibility response or null if not a marriage request
 */
const handleMarriageCompatibility = async(message, user) => {
  if (matchesIntent(message, ['marriage compatibility', 'guna matching', 'kundli matching', 'marriage matching', 'wedding compatibility', /^guna/, /^marriage.?match/])) {
    if (!user.birthDate) {
      return `${getBirthDetailsPrompt('marriage compatibility', 'match it with your partner\'s chart')}\n\nThen I can match it with your partner's chart!`;
    }

    return '💕 *Hindu Marriage Compatibility (Kundli Matching)*\n\nI can perform traditional Vedic marriage compatibility analysis using the sacred 36-point Guna matching system!\n\n*What I analyze:*\n• *36-Point Guna System* - Varna, Tara, Yoni, Grahamaitri, Gana, Bhakut, Nadi\n• *Manglik Dosha* - Mars placement analysis and remedies\n• *Overall Compatibility* - Traditional Hindu marriage assessment\n\n*To get marriage compatibility:*\n\n1. Send your birth details (if not already set)\n2. Provide your partner\'s birth details\n\n*Partner\'s details format:*\n```\nName: [Partner Name]\nBirth: DDMMYY or DDMMYYYY, HHMM\nPlace: [City, Country]\n```\n\nExample:\n```\nName: Priya Sharma\nBirth: 25121992, 1030\nPlace: Jaipur, India\n```\n\nThis follows traditional Vedic astrology principles used for Hindu marriages! 🕉️';
  }
  return null;
};

/**
 * Handle Lagna analysis requests
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {Promise<string|null>} Lagna analysis response or null if not a Lagna request
 */
const handleLagnaAnalysis = async(message, user) => {
  if (matchesIntent(message, ['lagna', 'ascendant', 'lagna analysis', 'rising sign analysis', /^lagna/])) {
    if (!user.birthDate) {
      return getBirthDetailsPrompt('Lagna (Ascendant)', 'provide complete birth details');
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
  return null;
};

/**
 * Handle Prashna astrology requests
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {Promise<string|null>} Prashna response or null if not a Prashna request
 */
const handlePrashna = async(message, user) => {
  if (matchesIntent(message, ['prashna', 'horary', 'question astrology', 'prashna kundli', /^prashna/, /^horary/])) {
    return '🕉️ *Prashna (Horary) Astrology*\n\nPrashna astrology provides answers to specific questions using the exact time you ask them!\n\n*How it works:*\n• Predictions based on planetary positions at the moment of your question\n• No birth details required - just your question and current time\n• Answers specific queries about timing and outcomes\n\n*Perfect for questions like:*\n• "When will I get married?"\n• "Will I get the job?"\n• "When will my health improve?"\n• "Will my business succeed?"\n\n*To ask a Prashna question:*\nSend your question now, and I\'ll analyze the current planetary positions to give you guidance!\n\nExample: "Will I get married this year?"\n\nWhat question is on your mind? 🔮';
  }
  return null;
};

/**
 * Handle electional astrology requests
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {Promise<string|null>} Electional response or null if not an electional request
 */
const handleElectional = async(message, user) => {
  if (matchesIntent(message, ['electional', 'auspicious time', 'best time', 'election', /^election/]) ||
      (matchesIntent(message, ['when should i', 'best date for', 'auspicious date']))) {
    return '📅 *Electional Astrology - Auspicious Timing*\n\nI can help you find the best dates and times for important events based on astrological factors!\n\nWhat type of event are you planning?\n\n• *Wedding/Marriage* - Venus and Jupiter favorable\n• *Business Launch* - Mercury and Jupiter beneficial\n• *Medical Procedure* - Jupiter and Venus protective\n• *Travel/Journey* - Jupiter and Sagittarius energy\n• *Legal Matters* - Libra and Sagittarius justice\n\nReply with the event type and I\'ll find auspicious timing in the next 30 days!';
  }
  return null;
};

/**
 * Handle horary astrology requests
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {Promise<string|null>} Horary response or null if not a horary request
 */
const handleHorary = async(message, user) => {
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
  return null;
};

/**
 * Handle secondary progressions requests
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {Promise<string|null>} Secondary progressions response or null if not a progressions request
 */
const handleSecondaryProgressions = async(message, user) => {
  if (matchesIntent(message, ['progressions', 'secondary progressions', 'progressed chart', /^progressions/])) {
    if (!user.birthDate) {
      return getBirthDetailsPrompt('secondary progressions', 'calculate your progressed chart');
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
  return null;
};

/**
 * Handle solar arc directions requests
 * @param {string} message - User message
 * @param {Object} user - User object
 * @returns {Promise<string|null>} Solar arc response or null if not a solar arc request
 */
const handleSolarArc = async(message, user) => {
  if (matchesIntent(message, ['solar arc', 'arc directions', 'directed chart', /^solar.?arc/])) {
    if (!user.birthDate) {
      return getBirthDetailsPrompt('solar arc directions', 'provide complete birth details');
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
  return null;
};

logger.info('Module: predictiveHandlers loaded successfully.');

module.exports = {
  handleEventAstrology,
  handleFutureSelf,
  handleGroupAstrology,
  handleMarriageCompatibility,
  handleLagnaAnalysis,
  handlePrashna,
  handleElectional,
  handleHorary,
  handleSecondaryProgressions,
  handleSolarArc
};
