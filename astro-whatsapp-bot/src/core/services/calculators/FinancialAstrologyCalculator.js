const logger = require('../../../utils/logger');
const sweph = require('sweph');

/**
 * FinancialAstrologyCalculator - Specialized calculator for wealth, investments, and financial analysis
 * Handles financial astrology calculations including wealth planets, cycles, and strategies
 */
class FinancialAstrologyCalculator {
  constructor() {
    logger.info(
      'Module: FinancialAstrologyCalculator loaded - Wealth and investment astrology'
    );
  }

  setServices(calendricalService, geocodingService) {
    this.calendricalService = calendricalService;
    this.geocodingService = geocodingService;
  }

  /**
   * Calculate financial astrology analysis - wealth, investments, career finance
   */
  async calculateFinancialAstrologyAnalysis(birthData) {
    try {
      const planetaryPositions = await this._getPlanetaryPositions(birthData);
      const houses = await this._calculateHouses(birthData);

      // Calculate current age for financial timing
      const currentAge = this._calculateCurrentAge(birthData);

      // Analyze financial indicators based on chart
      const wealthPlanets = this._analyzeWealthPlanets(
        planetaryPositions,
        houses
      );
      const financialCycles = this._analyzeFinancialTiming(
        currentAge,
        planetaryPositions,
        houses
      );
      const wealthHouses = this._analyzeWealthHouses(
        planetaryPositions,
        houses
      );
      const riskAssessment = this._assessFinancialRisks(
        planetaryPositions,
        houses
      );
      const prosperityOpportunities = this._identifyProsperityOpportunities(
        planetaryPositions,
        houses
      );

      const introduction =
        'Your birth chart reveals your financial potential, wealth-building patterns, and optimal timing for prosperity. Planets influence income, expenses, investments, and financial security.';

      const strategy = this._determineWealthBuildingStrategy(
        wealthPlanets,
        riskAssessment
      );

      return {
        introduction,
        wealthPlanets,
        financialCycles,
        wealthHouses,
        riskAssessment,
        prosperityOpportunities,
        strategy
      };
    } catch (error) {
      logger.error('Financial Astrology calculation error:', error);
      throw new Error('Failed to calculate financial astrology analysis');
    }
  }

  /**
   * Get planetary positions for birth data
   * @private
   */
  async _getPlanetaryPositions(birthData) {
    const { birthDate, birthTime, timezone = 5.5 } = birthData;
    const [day, month, year] = birthDate.split('/').map(Number);
    const [hour, minute] = birthTime.split(':').map(Number);

    const utcTime = new Date(
      Date.UTC(year, month - 1, day, hour - timezone, minute)
    );
    const julianDay = utcTime.getTime() / 86400000 + 2440587.5;

    const planets = {};
    const planetEphemIds = [
      sweph.SE_SUN,
      sweph.SE_MOON,
      sweph.SE_MARS,
      sweph.SE_MERCURY,
      sweph.SE_JUPITER,
      sweph.SE_VENUS,
      sweph.SE_SATURN
    ];
    const planetNames = [
      'Sun',
      'Moon',
      'Mars',
      'Mercury',
      'Jupiter',
      'Venus',
      'Saturn'
    ];

    planetEphemIds.forEach((ephemId, index) => {
      const result = sweph.swe_calc_ut(julianDay, ephemId, sweph.SEFLG_SPEED);
      if (result.rc >= 0) {
        planets[planetNames[index]] = {
          longitude: result.longitude[0],
          latitude: result.latitude[0],
          speed: result.longitude[2]
        };
      }
    });

    return planets;
  }

  /**
   * Calculate houses using Placidian system
   * @private
   */
  async _calculateHouses(birthData) {
    const {
      birthDate,
      birthTime,
      latitude = 28.6139,
      longitude = 77.209,
      timezone = 5.5
    } = birthData;
    const [day, month, year] = birthDate.split('/').map(Number);
    const [hour, minute] = birthTime.split(':').map(Number);

    const utcTime = new Date(
      Date.UTC(year, month - 1, day, hour - timezone, minute)
    );
    const julianDay = utcTime.getTime() / 86400000 + 2440587.5;

    const cusps = new Array(13);
    const result = sweph.swe_houses(julianDay, latitude, longitude, 'P', cusps);
    return cusps;
  }

  /**
   * Calculate current age
   * @private
   */
  _calculateCurrentAge(birthData) {
    const { birthDate } = birthData;
    const [day, month, year] = birthDate.split('/').map(Number);

    const birthDateObj = new Date(year, month - 1, day);
    const currentDate = new Date();
    const currentAge = Math.floor(
      (currentDate - birthDateObj) / (365.25 * 24 * 60 * 60 * 1000)
    );
    return currentAge;
  }

  /**
   * Get zodiac sign from longitude
   * @private
   */
  _getSignFromLongitude(longitude) {
    const signs = [
      'Aries',
      'Taurus',
      'Gemini',
      'Cancer',
      'Leo',
      'Virgo',
      'Libra',
      'Scorpio',
      'Sagittarius',
      'Capricorn',
      'Aquarius',
      'Pisces'
    ];
    const signIndex = Math.floor(longitude / 30);
    return signs[signIndex];
  }

  /**
   * Get house number from longitude and ascendant
   * @private
   */
  _getHouseNumber(longitude, ascendant) {
    const angle = (longitude - ascendant + 360) % 360;
    return Math.floor(angle / 30) + 1;
  }

  // ================= FINANCIAL ASTROLOGY METHODS =================

  /**
   * Analyze wealth planets
   * @private
   */
  _analyzeWealthPlanets(planets, cusps) {
    const wealthPlanets = [];

    if (planets.Jupiter?.longitude) {
      const jupiterHouse = this._getHouseNumber(
        planets.Jupiter.longitude,
        cusps[0]
      );
      wealthPlanets.push({
        planet: 'Jupiter',
        interpretation: this._getWealthPlanetInterpretation(
          'Jupiter',
          jupiterHouse
        )
      });
    }

    if (planets.Venus?.longitude) {
      const venusHouse = this._getHouseNumber(
        planets.Venus.longitude,
        cusps[0]
      );
      wealthPlanets.push({
        planet: 'Venus',
        interpretation: this._getWealthPlanetInterpretation(
          'Venus',
          venusHouse
        )
      });
    }

    if (planets.Moon?.longitude) {
      const moonHouse = this._getHouseNumber(planets.Moon.longitude, cusps[0]);
      wealthPlanets.push({
        planet: 'Moon',
        interpretation: this._getWealthPlanetInterpretation('Moon', moonHouse)
      });
    }

    return wealthPlanets.slice(0, 4);
  }

  /**
   * Analyze financial timing
   * @private
   */
  _analyzeFinancialTiming(currentAge, planets, cusps) {
    const cycles = [];

    const jupiterCycles = [12, 24, 36, 48, 60, 72, 84];
    if (
      jupiterCycles.some(age => currentAge >= age - 1 && currentAge <= age + 1)
    ) {
      cycles.push({
        cycle: 'Jupiter Return (Abundance & Growth)',
        description:
          'Expansion of wealth and increased prosperity opportunities'
      });
    }

    if (currentAge >= 27 && currentAge <= 33) {
      cycles.push({
        cycle: 'Saturn Return (Career = Financial Maturity)',
        description:
          'Financial stability through established career and disciplined wealth building'
      });
    }

    cycles.push({
      cycle: 'Venus Cycle (Income Flow)',
      description: 'Natural rhythm of financial intake and expenditure'
    });

    cycles.push({
      cycle: 'Jupiter Transits (Wealth Expansion)',
      description:
        '12-year cycles of prosperity and abundance when Jupiter transits wealth houses'
    });

    return cycles.slice(0, 3);
  }

  /**
   * Analyze wealth houses
   * @private
   */
  _analyzeWealthHouses(planets, cusps) {
    const wealthHouses = [];

    const secondHouseSign = this._getSignFromLongitude(cusps[1]);
    wealthHouses.push({
      house: '2nd House (Personal Wealth)',
      interpretation: `${secondHouseSign} in 2nd house indicates wealth through personal values. Your relationship with money reflects your core self-worth.`
    });

    const eighthHouseSign = this._getSignFromLongitude(cusps[7]);
    wealthHouses.push({
      house: '8th House (Shared/Transformative Wealth)',
      interpretation: `${eighthHouseSign} in 8th house shows wealth through partnerships or transformative changes.`
    });

    const eleventhHouseSign = this._getSignFromLongitude(cusps[10]);
    wealthHouses.push({
      house: '11th House (Gains & Life Goals)',
      interpretation: `${eleventhHouseSign} in 11th house indicates wealth through achievements and collective efforts.`
    });

    return wealthHouses;
  }

  /**
   * Assess financial risks
   * @private
   */
  _assessFinancialRisks(planets, cusps) {
    const risks = [];

    if (planets.Mars?.longitude) {
      const marsHouse = this._getHouseNumber(planets.Mars.longitude, cusps[0]);
      if (marsHouse === 8) {
        risks.push({
          area: 'Investment Risks',
          level: 'Elevated - Mars in 8th can indicate sudden financial changes'
        });
      }
    }

    if (planets.Saturn?.longitude) {
      const saturnHouse = this._getHouseNumber(
        planets.Saturn.longitude,
        cusps[0]
      );
      if (saturnHouse === 2) {
        risks.push({
          area: 'Security Concerns',
          level:
            'Moderate - Saturn creates structure but may indicate financial limitation'
        });
      }
    }

    if (risks.length === 0) {
      risks.push({
        area: 'General Risk Assessment',
        level: 'Balanced - Chart shows moderate financial stability'
      });
    }

    return risks.slice(0, 3);
  }

  /**
   * Identify prosperity opportunities
   * @private
   */
  _identifyProsperityOpportunities(planets, cusps) {
    const opportunities = [];

    if (planets.Jupiter?.longitude) {
      const jupiterHouse = this._getHouseNumber(
        planets.Jupiter.longitude,
        cusps[0]
      );
      if ([2, 5, 9, 11].includes(jupiterHouse)) {
        opportunities.push({
          opportunity: 'Abundance Expansion',
          timing: 'Jupiter is well-placed for wealth building'
        });
      }
    }

    if (planets.Venus?.longitude) {
      const venusHouse = this._getHouseNumber(
        planets.Venus.longitude,
        cusps[0]
      );
      if (venusHouse === 2 || venusHouse === 11) {
        opportunities.push({
          opportunity: 'Income Opportunities',
          timing: 'Venus suggests natural flow of money'
        });
      }
    }

    if (opportunities.length === 0) {
      opportunities.push({
        opportunity: 'Balanced Financial Growth',
        timing: 'Chart supports steady wealth accumulation'
      });
    }

    return opportunities.slice(0, 3);
  }

  /**
   * Determine wealth building strategy
   * @private
   */
  _determineWealthBuildingStrategy(wealthPlanets, riskAssessment) {
    let strategy = 'Focus on ';

    const hasJupiter = wealthPlanets.some(p => p.planet === 'Jupiter');
    const hasVenus = wealthPlanets.some(p => p.planet === 'Venus');
    const highRisk = riskAssessment.some(r => r.level.includes('Elevated'));

    if (hasJupiter) {
      strategy +=
        'expansion and opportunity recognition. Jupiter favors growth ventures.';
    } else if (hasVenus) {
      strategy += 'value appreciation and luxury sector investments.';
    } else {
      strategy +=
        'balanced diversification. Multiple approaches to wealth building.';
    }

    if (highRisk) {
      strategy +=
        ' Consider conservative strategies and build financial safety nets.';
    } else {
      strategy +=
        ' Your chart supports moderate risk-taking with good potential.';
    }

    return strategy;
  }

  /**
   * Get wealth planet interpretation
   * @private
   */
  _getWealthPlanetInterpretation(planet, house) {
    const interpretations = {
      Jupiter: {
        2: 'Jupiter in 2nd house suggests abundant personal wealth',
        11: 'Jupiter in 11th house indicates prosperity through goals',
        default: 'Jupiter expansion favors wealth accumulation'
      },
      Venus: {
        2: 'Venus in 2nd house indicates financial harmony',
        7: 'Venus in 7th house suggests wealth through partnerships',
        default: 'Venus supports income through beautiful pursuits'
      },
      Moon: {
        2: 'Moon in 2nd house connects emotional security to financial well-being',
        default: 'Moon influences wealth comfort and financial relationship'
      }
    };

    return (
      interpretations[planet]?.[house] ||
      interpretations[planet]?.default ||
      `${planet}'s energy influences financial decisions`
    );
  }

  /**
   * Check if message is a financial astrology request
   * @private
   */
  _isFinancialAstrologyRequest(message) {
    if (!message || typeof message !== 'string') return false;

    const keywords = [
      'financial',
      'money',
      'wealth',
      'business',
      'finance',
      'investment',
      'prosperity',
      'income'
    ];

    const lowerMessage = message.toLowerCase();
    return keywords.some(keyword => lowerMessage.includes(keyword));
  }

  /**
   * Format birth data required message for financial astrology
   * @private
   */
  _formatFinancialBirthDataRequiredMessage() {
    return '💰 *Financial Astrology Analysis*\n\n👤 I need your birth details for personalized wealth analysis.\n\nSend format: DDMMYY or DDMMYYYY\nExample: 150691 (June 15, 1991)\n\nFor general financial astrology insights, you can ask about "wealth astrology" or "planetary finance indicators".';
  }

  /**
   * Get planetary finance indicators educational content
   * @private
   */
  _getFinancialIndicatorsContent() {
    return {
      planets: [
        { planet: 'Jupiter', role: 'Prosperity and abundance', description: 'Expands fortunes, brings opportunities, governs growth cycles' },
        { planet: 'Venus', role: 'Income and luxury', description: 'Rules possessions, represents natural flow of money, governs luxury spending' },
        { planet: 'Saturn', role: 'Long-term wealth building', description: 'Builds lasting foundations, teaches financial discipline and patience' },
        { planet: 'Mercury', role: 'Commerce and trade', description: 'Rules communication, business dealings, and mental calculation' },
        { planet: 'Mars', role: 'Risk-taking investments', description: 'Drives ambitious enterprises and competitive business ventures' }
      ],
      cycles: [
        { cycle: 'Jupiter Return (12 years)', description: 'Major wealth periods and prosperity breakthroughs' },
        { cycle: 'Saturn Opposition (30 years)', description: 'Peak financial challenges requiring discipline and restructuring' },
        { cycle: 'Venus Transit', description: 'Natural periods of income opportunity and financial flow' }
      ],
      warnings: [
        'Mars-Uranus aspects can cause market volatility and risky investments',
        'Saturn-Neptune aspects may create financial illusions or unrealistic expectations',
        'Eclipse periods (Solar/Lunar) often bring sudden financial changes'
      ],
      markets: {
        bull: 'Jupiter expansion phases create optimism and growth markets',
        bear: 'Saturn contraction periods bring market corrections and caution',
        volatile: 'Mars transits through Scorpio/8th or Aries/1st create price swings'
      }
    };
  }

  /**
   * Handle Financial Astrology request (migrated from handler)
   * @param {string} message - User message
   * @param {Object} user - User object
   * @returns {string|null} Response or null if not handled
   */
  async handleFinancialAstrologyRequest(message, user) {
    if (!this._isFinancialAstrologyRequest(message)) {
      return null;
    }

    try {
      // Check if user has birth data for personalized analysis
      if (user.birthDate) {
        const birthData = {
          birthDate: user.birthDate,
          birthTime: user.birthTime || '12:00',
          birthPlace: user.birthPlace || 'Delhi, India',
          latitude: user.latitude || 28.6139,
          longitude: user.longitude || 77.209,
          timezone: user.timezone || 5.5
        };

        const analysis = await this.calculateFinancialAstrologyAnalysis(birthData);

        if (analysis.error) {
          return '❌ Unable to generate personalized financial astrology analysis.';
        }

        // Format personalized financial analysis
        let financeResult = '💰 *Personalized Financial Astrology Analysis*\n\n';
        financeResult += `📋 ${analysis.introduction}\n\n`;

        if (analysis.wealthPlanets && analysis.wealthPlanets.length > 0) {
          financeResult += `🌟 *Wealth Planets:*\n`;
          analysis.wealthPlanets.slice(0, 3).forEach(planet => {
            financeResult += `• ${planet.planet}: ${planet.interpretation}\n`;
          });
          financeResult += '\n';
        }

        if (analysis.financialCycles && analysis.financialCycles.length > 0) {
          financeResult += `⏰ *Current Financial Cycles:*\n`;
          analysis.financialCycles.forEach(cycle => {
            financeResult += `• ${cycle.cycle}: ${cycle.description}\n`;
          });
          financeResult += '\n';
        }

        if (analysis.strategy) {
          financeResult += `🎯 *Wealth Strategy:*\n${analysis.strategy}\n\n`;
        }

        financeResult += `🕉️ *Vedic Finance:* Your chart reveals personalized pathways to wealth. Jupiter-Venus combinations bring prosperity breakthroughs.\n\n`;
        financeResult += `⚠️ *Disclaimer:* Financial astrology provides guidance, not guarantees. Always consult professional financial advisors.`;

        return financeResult;

      } else {
        // Provide general educational content about financial astrology
        const indicators = this._getFinancialIndicatorsContent();
        let response = '💰 *Financial Astrology Analysis*\n\n';
        response += 'Venus rules wealth and possessions. Jupiter expands fortunes. Saturn builds lasting foundations. Mars drives ambitious enterprises.\n\n';

        response += '🪐 *Planetary Finance Indicators:*\n';
        indicators.planets.forEach(p => {
          response += `• ${p.planet}: ${p.role} - ${p.description}\n`;
        });
        response += '\n';

        response += '📅 *Financial Cycles:*\n';
        indicators.cycles.forEach(c => {
          response += `• ${c.cycle}: ${c.description}\n`;
        });
        response += '\n';

        response += '⚠️ *Financial Warnings:*\n';
        indicators.warnings.forEach(w => {
          response += `• ${w}\n`;
        });
        response += '\n';

        response += '📊 *Market Weather:*\n';
        response += `• Bull Markets: ${indicators.markets.bull}\n`;
        response += `• Bear Markets: ${indicators.markets.bear}\n`;
        response += `• Volatile Periods: ${indicators.markets.volatile}\n\n`;

        response += '💫 *Wealth Building:* Financial astrology reveals optimal timing for investments, career moves, and business decisions.\n\n';
        response += '🕉️ *Ancient Finance:* Vedic texts teach "Dhana Yoga" - planetary combinations creating wealth.\n\n';
        response += this._formatFinancialBirthDataRequiredMessage();

        return response;
      }

    } catch (error) {
      logger.error('Financial astrology error:', error);
      return '❌ Error generating financial astrology analysis.';
    }
  }

  /**
   * Health check for FinancialAstrologyCalculator
   * @returns {Object} Health status
   */
  healthCheck() {
    return {
      healthy: true,
      version: '1.0.0',
      name: 'FinancialAstrologyCalculator',
      calculations: [
        'Wealth Planets',
        'Financial Timing',
        'Risk Assessment',
        'Prosperity Strategies',
        'Handler Methods'
      ],
      status: 'Operational'
    };
  }
}

module.exports = { FinancialAstrologyCalculator };