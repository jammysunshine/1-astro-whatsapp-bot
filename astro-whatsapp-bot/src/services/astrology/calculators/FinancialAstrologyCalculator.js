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
        'Prosperity Strategies'
      ],
      status: 'Operational'
    };
  }
}

module.exports = { FinancialAstrologyCalculator };
