const logger = require('../../../../utils/logger');

/**
 * TransitCalculator - Daily astrological transits and previews
 * Handles transit calculations, daily themes, and short-term astrological influences
 */
class TransitCalculator {
  constructor() {
    logger.info('Module: TransitCalculator loaded - Daily Transit Preview');
  }

  setServices(vedicCalculator) {
    this.vedicCalculator = vedicCalculator;
    this.astrologer = vedicCalculator.astrologer;
    this.geocodingService = vedicCalculator.geocodingService;
    this.vedicCore = vedicCalculator.vedicCore;
  }

  /**
   * Generate 3-day transit preview with real astrological calculations
   * @param {Object} birthData - Birth data
   * @param {number} days - Number of days
   * @returns {Object} Transit preview
   */
  async generateTransitPreview(birthData, days = 3) {
    try {
      const { birthDate, birthTime = '12:00', birthPlace = 'Delhi, India' } = birthData;

      // Parse birth date
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);

      // Get birth coordinates and timezone
      const locationInfo = await this.geocodingService.getLocationInfo(birthPlace);
      const birthDateTime = new Date(year, month - 1, day, hour, minute);
      const birthTimestamp = birthDateTime.getTime();

      // Prepare natal data
      const natalData = {
        year, month, date: day, hours: hour, minutes: minute, seconds: 0,
        latitude: locationInfo.latitude, longitude: locationInfo.longitude, timezone: locationInfo.timezone,
        chartType: 'sidereal'
      };

      const transits = {};

      // Generate transit preview for each day
      for (let i = 0; i < days; i++) {
        const transitDate = new Date();
        transitDate.setDate(transitDate.getDate() + i);

        const transitData = {
          year: transitDate.getFullYear(),
          month: transitDate.getMonth() + 1,
          date: transitDate.getDate(),
          hours: 12, minutes: 0, seconds: 0, // Noon for daily transits
          latitude: locationInfo.latitude, longitude: locationInfo.longitude, timezone: locationInfo.timezone,
          chartType: 'sidereal'
        };

        // Generate transit chart
        const transitChart = this.astrologer.generateTransitChartData(natalData, transitData);

        // Analyze major transits and aspects
        const dayName = i === 0 ? 'today' : i === 1 ? 'tomorrow' : `day${i + 1}`;
        transits[dayName] = this._interpretDailyTransits(transitChart, i);
      }

      return transits;
    } catch (error) {
      logger.error('Error generating transit preview:', error);
      // Fallback to basic preview
      return {
        today: '🌅 *Today:* Planetary energies support new beginnings and communication. Perfect for starting conversations or initiating projects.',
        tomorrow: '🌞 *Tomorrow:* Focus on relationships and partnerships. Harmonious energies make this a good day for collaboration.',
        day3: '🌙 *Day 3:* Creative inspiration flows strongly. Use this energy for artistic pursuits or innovative thinking.'
      };
    }
  }

  /**
   * Interpret daily transits for transit preview
   * @private
   * @param {Object} transitChart - Transit chart data
   * @param {number} dayOffset - Days from today (0 = today, 1 = tomorrow, etc.)
   * @returns {string} Daily transit interpretation
   */
  _interpretDailyTransits(transitChart, dayOffset) {
    const dayNames = ['Today', 'Tomorrow', 'Day 3'];
    const dayName = dayNames[dayOffset] || `Day ${dayOffset + 1}`;

    let interpretation = `🌟 *${dayName}:* `;

    const aspects = transitChart.aspects || [];
    const planets = transitChart.planets || [];

    // Analyze major planetary aspects
    const majorAspects = aspects.filter(aspect =>
      ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'].includes(aspect.planet1) ||
      ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'].includes(aspect.planet2)
    );

    // Check for significant transits
    const sunAspects = majorAspects.filter(a => a.planet1 === 'Sun' || a.planet2 === 'Sun');
    const moonAspects = majorAspects.filter(a => a.planet1 === 'Moon' || a.planet2 === 'Moon');
    const venusAspects = majorAspects.filter(a => a.planet1 === 'Venus' || a.planet2 === 'Venus');
    const marsAspects = majorAspects.filter(a => a.planet1 === 'Mars' || a.planet2 === 'Mars');

    const insights = [];

    // Sun transits (consciousness, vitality)
    if (sunAspects.length > 0) {
      const sunAspect = sunAspects[0];
      if (sunAspect.aspect === 'Trine' || sunAspect.aspect === 'Sextile') {
        insights.push('Solar energy brings confidence and vitality');
      } else if (sunAspect.aspect === 'Square' || sunAspect.aspect === 'Opposition') {
        insights.push('Solar challenges encourage self-awareness and growth');
      }
    }

    // Moon transits (emotions, intuition)
    if (moonAspects.length > 0) {
      const moonAspect = moonAspects[0];
      if (moonAspect.aspect === 'Trine' || moonAspect.aspect === 'Sextile') {
        insights.push('Emotional awareness and intuition are heightened');
      } else if (moonAspect.aspect === 'Square' || moonAspect.aspect === 'Opposition') {
        insights.push('Emotional challenges invite inner reflection');
      }
    }

    // Venus transits (relationships, harmony)
    if (venusAspects.length > 0) {
      insights.push('Harmonious energies favor relationships and creative pursuits');
    }

    // Mars transits (action, energy)
    if (marsAspects.length > 0) {
      insights.push('Dynamic energy supports action and new beginnings');
    }

    // Mercury transits (communication, thinking)
    const mercuryAspects = majorAspects.filter(a => a.planet1 === 'Mercury' || a.planet2 === 'Mercury');
    if (mercuryAspects.length > 0) {
      insights.push('Communication and mental clarity are emphasized');
    }

    // Jupiter transits (expansion, wisdom)
    const jupiterAspects = majorAspects.filter(a => a.planet1 === 'Jupiter' || a.planet2 === 'Jupiter');
    if (jupiterAspects.length > 0) {
      insights.push('Opportunities for growth and learning present themselves');
    }

    // Saturn transits (structure, responsibility)
    const saturnAspects = majorAspects.filter(a => a.planet1 === 'Saturn' || a.planet2 === 'Saturn');
    if (saturnAspects.length > 0) {
      insights.push('Focus on structure, discipline, and long-term goals');
    }

    if (insights.length === 0) {
      // Default interpretation based on day
      const defaults = [
        'Planetary energies support new beginnings and communication',
        'Focus on relationships and partnerships with harmonious energies',
        'Creative inspiration flows strongly for artistic pursuits'
      ];
      interpretation += defaults[dayOffset] || 'A balanced day for personal growth and reflection';
    } else {
      interpretation += `${insights.slice(0, 2).join('. ')}.`;
    }

    return interpretation;
  }

  /**
   * Calculate current planetary transits
   * @param {Date} targetDate - Date for which to calculate transits (defaults to now)
   * @returns {Object} Current planetary positions and aspects
   */
  async calculateCurrentTransits(targetDate = null) {
    try {
      const now = targetDate || new Date();
      const locationInfo = await this.geocodingService.getLocationInfo('Delhi, India'); // Default location

      const transitData = {
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        date: now.getDate(),
        hours: now.getHours(),
        minutes: now.getMinutes(),
        seconds: 0,
        latitude: locationInfo.latitude,
        longitude: locationInfo.longitude,
        timezone: locationInfo.timezone,
        chartType: 'sidereal'
      };

      const transitChart = this.astrologer.generateNatalChartData(transitData);

      return {
        date: now.toLocaleDateString(),
        timestamp: now.toISOString(),
        locations: transitChart.planets,
        aspects: transitChart.aspects || [],
        summary: this._generateTransitSummary(transitChart)
      };
    } catch (error) {
      logger.error('Error calculating current transits:', error);
      return { error: 'Unable to calculate current transits' };
    }
  }

  /**
   * Generate transit summary
   * @private
   * @param {Object} transitChart - Transit chart data
   * @returns {string} Transit summary
   */
  _generateTransitSummary(transitChart) {
    let summary = '🪐 *Current Planetary Positions*\n\n';

    if (transitChart.planets) {
      Object.entries(transitChart.planets).forEach(([planet, data]) => {
        if (data && data.signName) {
          summary += `• ${planet.charAt(0).toUpperCase() + planet.slice(1)}: ${data.signName}\n`;
        }
      });
    }

    if (transitChart.aspects && transitChart.aspects.length > 0) {
      summary += '\n*Planetary Aspects:*\n';
      transitChart.aspects.slice(0, 5).forEach(aspect => {
        summary += `• ${aspect.planet1}-${aspect.planet2}: ${aspect.aspect}\n`;
      });
    }

    return summary;
  }

  /**
   * Analyze transits relative to birth chart
   * @param {Object} birthData - Birth data
   * @param {Date} targetDate - Date for transit analysis
   * @returns {Object} Transit analysis relative to natal chart
   */
  async analyzeTransitsToNatal(birthData, targetDate = null) {
    try {
      const natalChart = await this._generateBasicBirthChart(birthData);
      const transitChart = await this.calculateCurrentTransits(targetDate);

      // Compare transit planets with natal positions
      const transitAspects = this._findTransitAspects(natalChart, transitChart);

      return {
        date: transitChart.date,
        natalChart: {
          sunSign: natalChart.interpretations?.sunSign || 'Unknown',
          moonSign: natalChart.interpretations?.moonSign || 'Unknown',
          risingSign: natalChart.interpretations?.risingSign || 'Unknown'
        },
        currentTransits: transitChart.locations,
        transitAspects,
        interpretation: this._interpretTransitAspects(transitAspects),
        summary: this._generateTransitNatalSummary(transitAspects, transitChart.date)
      };
    } catch (error) {
      logger.error('Error analyzing transits to natal:', error);
      return { error: 'Unable to analyze transits relative to natal chart' };
    }
  }

  /**
   * Generate basic birth chart (helper method)
   * @private
   * @param {Object} birthData - Birth data
   * @returns {Object} Basic birth chart
   */
  async _generateBasicBirthChart(birthData) {
    try {
      const { birthDate, birthTime, birthPlace } = birthData;
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);

      const locationInfo = await this.geocodingService.getLocationInfo(birthPlace);

      const astroData = {
        year, month, date: day, hours: hour, minutes: minute, seconds: 0,
        latitude: locationInfo.latitude, longitude: locationInfo.longitude,
        timezone: locationInfo.timezone, chartType: 'sidereal'
      };

      return this.astrologer.generateNatalChartData(astroData);
    } catch (error) {
      logger.error('Error generating basic birth chart:', error);
      return { planets: {} };
    }
  }

  /**
   * Find important transit aspects to natal planets
   * @private
   * @param {Object} natalChart - Natal chart data
   * @param {Object} transitChart - Transit chart data
   * @returns {Array} Important transit aspects
   */
  _findTransitAspects(natalChart, transitChart) {
    const aspects = [];

    if (!natalChart.planets || !transitChart.locations) {
      return aspects;
    }

    // Check each transit planet against each natal planet
    Object.entries(transitChart.locations).forEach(([transitPlanet, transitData]) => {
      if (!transitData.longitude) return;

      Object.entries(natalChart.planets).forEach(([natalPlanet, natalData]) => {
        if (!natalData.longitude) return;

        // Calculate angular separation
        const angle = Math.abs(transitData.longitude - natalData.longitude);
        const minAngle = Math.min(angle, 360 - angle);

        // Check for major aspects with wider orb for transits
        if (minAngle <= 12) { // Conjunction (within 12 degrees)
          aspects.push({
            transitPlanet,
            natalPlanet,
            aspect: 'Conjunction',
            orb: minAngle,
            strength: this._evaluateTransitStrength(transitPlanet, natalPlanet, 'Conjunction')
          });
        } else if (Math.abs(minAngle - 90) <= 10) { // Square
          aspects.push({
            transitPlanet,
            natalPlanet,
            aspect: 'Square',
            orb: Math.abs(minAngle - 90),
            strength: this._evaluateTransitStrength(transitPlanet, natalPlanet, 'Square')
          });
        } else if (Math.abs(minAngle - 120) <= 10) { // Trine
          aspects.push({
            transitPlanet,
            natalPlanet,
            aspect: 'Trine',
            orb: Math.abs(minAngle - 120),
            strength: this._evaluateTransitStrength(transitPlanet, natalPlanet, 'Trine')
          });
        } else if (Math.abs(minAngle - 180) <= 10) { // Opposition
          aspects.push({
            transitPlanet,
            natalPlanet,
            aspect: 'Opposition',
            orb: Math.abs(minAngle - 180),
            strength: this._evaluateTransitStrength(transitPlanet, natalPlanet, 'Opposition')
          });
        }
      });
    });

    // Sort by strength
    return aspects.sort((a, b) => b.strength - a.strength);
  }

  /**
   * Evaluate transit aspect strength
   * @private
   * @param {string} transitPlanet - Transiting planet
   * @param {string} natalPlanet - Natal planet
   * @param {string} aspect - Aspect type
   * @returns {number} Strength score (0-10)
   */
  _evaluateTransitStrength(transitPlanet, natalPlanet, aspect) {
    let strength = 5;

    // Planet importance (personal planets are stronger)
    const personalPlanets = ['sun', 'moon', 'mercury', 'venus', 'mars'];
    const outerPlanets = ['jupiter', 'saturn', 'rahu', 'ketu'];

    if (personalPlanets.includes(natalPlanet)) {
      strength += 2;
    }
    if (personalPlanets.includes(transitPlanet)) {
      strength += 2;
    }

    // Aspect importance
    const aspectStrength = {
      'Conjunction': 3,
      'Opposition': 2,
      'Square': 2,
      'Trine': 1
    };
    strength += aspectStrength[aspect] || 0;

    return Math.min(10, strength);
  }

  /**
   * Interpret transit aspects
   * @private
   * @param {Array} transitAspects - Transit aspects array
   * @returns {Object} Interpretation of transits
   */
  _interpretTransitAspects(transitAspects) {
    const interpretation = {
      themes: [],
      influences: [],
      advice: []
    };

    transitAspects.slice(0, 3).forEach(aspect => {
      const description = `${aspect.transitPlanet} transiting ${aspect.natalPlanet} (${aspect.aspect})`;

      if (aspect.aspect === 'Conjunction') {
        interpretation.themes.push(`${description} - Activation and focus`);
        interpretation.influences.push(`${aspect.natalPlanet} themes prominently activated`);
      } else if (aspect.aspect === 'Square') {
        interpretation.themes.push(`${description} - Challenge and growth`);
        interpretation.influences.push(`${aspect.natalPlanet} facing tension requiring action`);
      } else if (aspect.aspect === 'Trine') {
        interpretation.themes.push(`${description} - Support and opportunity`);
        interpretation.influences.push(`${aspect.natalPlanet} receiving beneficial support`);
      } else if (aspect.aspect === 'Opposition') {
        interpretation.themes.push(`${description} - Balance and awareness`);
        interpretation.influences.push(`${aspect.natalPlanet} requires balancing opposing forces`);
      }
    });

    // Generate general advice based on strongest aspects
    if (interpretation.themes.length > 0) {
      interpretation.advice.push('Focus on areas activated by current transits');
      interpretation.advice.push('Use challenging aspects as opportunities for growth');
      interpretation.advice.push('Take advantage of beneficial transits for important decisions');
    }

    return interpretation;
  }

  /**
   * Generate transit to natal summary
   * @private
   * @param {Array} transitAspects - Transit aspects
   * @param {string} date - Date of transits
   * @returns {string} Formatted summary
   */
  _generateTransitNatalSummary(transitAspects, date) {
    let summary = `🔄 *Transit Analysis for ${date}*\n\n`;

    summary += '*Key Transit Aspects:*\n';
    if (transitAspects.length > 0) {
      transitAspects.slice(0, 3).forEach(aspect => {
        summary += `• ${aspect.transitPlanet} - ${aspect.natalPlanet} (${aspect.aspect})\n`;
      });
    } else {
      summary += '• No major transits currently\n';
    }

    summary += '\n*Overall Transit Energy:*\n';
    const strongAspects = transitAspects.filter(a => a.strength >= 7);
    if (strongAspects.length > 0) {
      summary += 'Intense period of astrological activity and personal development\n';
    } else {
      summary += 'Relatively stable period with opportunities for steady progress\n';
    }

    summary += '\n_Focus on areas indicated by current transits for optimal timing._';

    return summary;
  }
}

module.exports = { TransitCalculator };