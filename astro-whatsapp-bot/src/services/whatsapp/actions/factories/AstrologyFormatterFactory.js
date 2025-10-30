/**
 * AstrologyFormatterFactory - Centralized formatting factory for astrology content
 * Handles all astrology-specific formatting that was duplicated across action classes
 * Provides consistent formatting for birth charts, horoscopes, planetary data, etc.
 */

class AstrologyFormatterFactory {
  /**
   * Format birth chart data into readable chart layout
   * @param {Object} chartData - Raw birth chart data
   * @returns {string} Formatted birth chart text
   */
  static formatBirthChart(chartData) {
    if (!chartData || typeof chartData !== 'object') {
      return 'Birth chart data unavailable.';
    }

    let response = `*🪐 Birth Chart for ${this.sanitizeName(chartData.name)}*\n`;

    // Birth information
    response += this.formatBirthInfo(chartData);

    // Lagna/Ascendant
    if (chartData.lagna) {
      response += `\n🏠 *Ascendant:* ${chartData.lagna.sign || 'Unknown'}`;
      if (chartData.lagna.longitude) {
        response += ` (${chartData.lagna.longitude.toFixed(1)}°)`;
      }
    }

    // Planetary positions
    response += this.formatPlanetaryPositions(chartData);

    // Houses (if available)
    if (chartData.houses) {
      response += this.formatHousePositions(chartData);
    }

    // Key aspects or summary
    if (chartData.kundliSummary || chartData.aspects) {
      response += this.formatChartSummary(chartData);
    }

    // Add disclaimer
    response += this.formatChartDisclaimer(chartData);

    return response;
  }

  /**
   * Format daily horoscope data
   * @param {Object} horoscopeData - Raw horoscope data
   * @returns {string} Formatted horoscope text
   */
  static formatHoroscope(horoscopeData) {
    if (!horoscopeData || typeof horoscopeData !== 'object') {
      return 'Horoscope data unavailable.';
    }

    const name = horoscopeData.name || 'You';
    const date = horoscopeData.date || new Date().toLocaleDateString();

    let response = `*☀️ Daily Horoscope for ${name}*\n📅 ${date}\n\n`;

    // Main horoscope content
    if (horoscopeData.content) {
      response += this.enhanceHoroscopeText(horoscopeData.content);
    }

    // Daily guidance section
    response += '\n\n🌟 *Daily Guidance:*\n';
    if (horoscopeData.guidance) {
      response += horoscopeData.guidance;
    } else {
      const guidances = [
        'Trust your intuition today',
        'Stay open to unexpected opportunities',
        'Focus on what brings you joy',
        'Be patient with yourself and others',
        'Take time for self-reflection',
        'Express gratitude for what you have',
        'Embrace change as growth'
      ];
      response += guidances[Math.floor(Math.random() * guidances.length)];
    }

    return response;
  }

  /**
   * Format compatibility analysis data
   * @param {Object} compatibilityData - Raw compatibility data
   * @returns {string} Formatted compatibility text
   */
  static formatCompatibility(compatibilityData) {
    if (!compatibilityData || typeof compatibilityData !== 'object') {
      return 'Compatibility analysis unavailable.';
    }

    let response = '*💕 Relationship Compatibility Analysis*\n\n';

    if (compatibilityData.partner1 && compatibilityData.partner2) {
      response += `👫 ${compatibilityData.partner1.name} & ${compatibilityData.partner2.name}\n\n`;
    }

    if (compatibilityData.overallScore !== undefined) {
      const score = Math.round(compatibilityData.overallScore);
      response += `*Overall Compatibility: ${score}%*\n\n`;
    }

    if (compatibilityData.strengths && Array.isArray(compatibilityData.strengths)) {
      response += '*💪 Strengths:*\n';
      compatibilityData.strengths.slice(0, 3).forEach(strength => {
        response += `• ${strength}\n`;
      });
      response += '\n';
    }

    if (compatibilityData.challenges && Array.isArray(compatibilityData.challenges)) {
      response += '*⚠️ Areas for Growth:*\n';
      compatibilityData.challenges.slice(0, 3).forEach(challenge => {
        response += `• ${challenge}\n`;
      });
      response += '\n';
    }

    if (compatibilityData.advice) {
      response += `*💬 Advice:* ${compatibilityData.advice}\n`;
    }

    return response;
  }

  /**
   * Format numerology analysis data
   * @param {Object} numerologyData - Raw numerology data
   * @returns {string} Formatted numerology text
   */
  static formatNumerology(numerologyData) {
    if (!numerologyData || typeof numerologyData !== 'object') {
      return 'Numerology analysis unavailable.';
    }

    let response = `*🔢 Numerology Analysis for ${numerologyData.name || 'You'}*\n\n`;

    if (numerologyData.lifePathNumber !== undefined) {
      response += `*Life Path Number:* ${numerologyData.lifePathNumber}\n`;
      if (numerologyData.lifePathDescription) {
        response += `${numerologyData.lifePathDescription}\n\n`;
      }
    }

    if (numerologyData.destinyNumber !== undefined) {
      response += `*Destiny Number:* ${numerologyData.destinyNumber}\n`;
      if (numerologyData.destinyDescription) {
        response += `${numerologyData.destinyDescription}\n\n`;
      }
    }

    if (numerologyData.soulUrgeNumber !== undefined) {
      response += `*Soul Urge Number:* ${numerologyData.soulUrgeNumber}\n`;
      if (numerologyData.soulUrgeDescription) {
        response += `${numerologyData.soulUrgeDescription}\n\n`;
      }
    }

    if (numerologyData.personalityNumber !== undefined) {
      response += `*Personality Number:* ${numerologyData.personalityNumber}\n`;
      if (numerologyData.personalityDescription) {
        response += `${numerologyData.personalityDescription}\n\n`;
      }
    }

    return response;
  }

  /**
   * Format planetary transit data
   * @param {Object} transitData - Raw transit data
   * @returns {string} Formatted transit text
   */
  static formatTransits(transitData) {
    if (!transitData || typeof transitData !== 'object') {
      return 'Transit analysis unavailable.';
    }

    let response = '*🌌 Current Planetary Transits*\n\n';

    if (transitData.currentDate) {
      response += `📅 Analysis for: ${transitData.currentDate}\n\n`;
    }

    if (transitData.majorTransits && Array.isArray(transitData.majorTransits)) {
      response += '*Key Transits This Week:*\n';
      transitData.majorTransits.slice(0, 5).forEach(transit => {
        response += `• ${transit.planet} in ${transit.sign}: ${transit.aspect}\n`;
      });
      response += '\n';
    }

    if (transitData.personalImpact) {
      response += `*♌ Personal Impact:*\n${transitData.personalImpact}\n\n`;
    }

    if (transitData.generalInfluence) {
      response += `*🌍 General Influence:*\n${transitData.generalInfluence}\n`;
    }

    return response;
  }

  /**
   * Format dasha period analysis
   * @param {Object} dashaData - Raw dasha data
   * @returns {string} Formatted dasha text
   */
  static formatDasha(dashaData) {
    if (!dashaData || typeof dashaData !== 'object') {
      return 'Dasha analysis unavailable.';
    }

    let response = '*⏳ Vimshottari Dasha Analysis*\n\n';

    if (dashaData.currentDasha) {
      const current = dashaData.currentDasha;
      response += `*Current Mahadasha:* ${current.planet}\n`;
      response += `Duration: ${current.startDate} - ${current.endDate} (${current.yearsLeft} years remaining)\n\n`;

      if (current.influence) {
        response += `*♐ Current Influence:*\n${current.influence}\n\n`;
      }
    }

    if (dashaData.nextDasha) {
      const next = dashaData.nextDasha;
      response += `*Next Mahadasha:* ${next.planet} (${next.startDate})\n\n`;
    }

    if (dashaData.remedies) {
      response += `*🙏 Recommended Remedies:*\n${dashaData.remedies}\n\n`;
    }

    return response;
  }

  // Shared utility methods

  /**
   * Sanitize name for display
   * @param {string} name - Name to sanitize
   * @returns {string} Sanitized name
   */
  static sanitizeName(name) {
    if (!name) { return 'Unknown'; }
    return name.replace(/[<>'"&]/g, '').substring(0, 50);
  }

  /**
   * Format birth information consistently
   * @param {Object} chartData - Chart data with birth info
   * @returns {string} Formatted birth information
   */
  static formatBirthInfo(chartData) {
    let info = '';

    if (chartData.birthDetails) {
      const { date, time, place } = chartData.birthDetails;
      info += `📅 ${date || 'Unknown'}`;
      if (time) { info += ` ${time}`; }
      if (place) { info += `\n📍 ${place}`; }
    }

    return `${info}\n`;
  }

  /**
   * Format planetary positions section
   * @param {Object} chartData - Chart data with planets
   * @returns {string} Formatted planetary positions
   */
  static formatPlanetaryPositions(chartData) {
    let response = '\n🪐 *Planetary Positions:*\n';

    const planets = chartData.planetaryPositions || chartData.planets || {};
    const planetOrder = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

    planetOrder.forEach(planet => {
      if (planets[planet]) {
        const data = planets[planet];
        if (data.sign) {
          response += `• ${planet}: ${data.sign}`;
          if (data.longitude !== undefined) {
            response += ` (${data.longitude.toFixed(1)}°)`;
          }
          if (data.house) {
            response += ` House ${data.house}`;
          }
          response += '\n';
        }
      }
    });

    return `${response}\n`;
  }

  /**
   * Format house positions (if available)
   * @param {Object} chartData - Chart data with houses
   * @returns {string} Formatted house positions
   */
  static formatHousePositions(chartData) {
    if (!chartData.houses || typeof chartData.houses !== 'object') {
      return '';
    }

    let response = '🏠 *House Cusps:*\n';
    Object.entries(chartData.houses).slice(0, 12).forEach(([house, data]) => {
      if (data && data.sign) {
        response += `• House ${house}: ${data.sign}\n`;
      }
    });

    return `${response}\n`;
  }

  /**
   * Format chart summary or aspects
   * @param {Object} chartData - Chart data with summary
   * @returns {string} Formatted chart summary
   */
  static formatChartSummary(chartData) {
    let response = '💫 *Chart Insights:*\n';

    if (chartData.kundliSummary) {
      const summary = chartData.kundliSummary.length > 300 ?
        `${chartData.kundliSummary.substring(0, 300)}...` :
        chartData.kundliSummary;
      response += `${summary}\n\n`;
    }

    if (chartData.aspectPatterns && chartData.aspectPatterns.length > 0) {
      response += '*Key Aspects:*\n';
      chartData.aspectPatterns.slice(0, 3).forEach(pattern => {
        response += `• ${pattern.type}: ${pattern.description}\n`;
      });
      response += '\n';
    }

    return response;
  }

  /**
   * Format chart disclaimer
   * @param {Object} chartData - Chart data
   * @returns {string} Formatted disclaimer
   */
  static formatChartDisclaimer(chartData) {
    let disclaimer = '\n---\n';

    if (chartData.type === 'fallback') {
      disclaimer += '⚠️ *Note:* Chart calculation temporarily unavailable.\n';
    } else {
      disclaimer += '📋 *This is your basic birth chart overview.*\n';
      disclaimer += '*For detailed analysis, consult with a certified astrologer.*\n';
    }

    return disclaimer;
  }

  /**
   * Enhance horoscope text with emojis
   * @param {string} text - Raw horoscope text
   * @returns {string} Enhanced text with emojis
   */
  static enhanceHoroscopeText(text) {
    let enhanced = text;

    const emojiMap = {
      lucky: '🍀', fortunate: '🍀', blessed: '🍀',
      challenges: '⚠️', difficulties: '⚠️',
      love: '💕', romance: '💕', relationship: '💕',
      career: '💼', work: '💼', job: '💼',
      money: '💰', wealth: '💰', finance: '💰',
      health: '🏥', wellness: '🏥'
    };

    Object.entries(emojiMap).forEach(([keyword, emoji]) => {
      enhanced = enhanced.replace(new RegExp(`\\b${keyword}\\b`, 'gi'), `${emoji} $&`);
    });

    return enhanced;
  }
}

module.exports = { AstrologyFormatterFactory };
