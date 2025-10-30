const logger = require('../../../../utils/logger');
const sweph = require('sweph');

/**
 * AstrologicalCalculators - Specialized astrological calculation modules
 * Handles financial, medical, and career astrology calculations
 * Separate from AdvancedCalculator for focused domain specialization
 */
class AstrologicalCalculators {
  constructor() {
    logger.info('Module: AstrologicalCalculators loaded - Specialized astrological calculations');
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
      const wealthPlanets = this._analyzeWealthPlanets(planetaryPositions, houses);
      const financialCycles = this._analyzeFinancialTiming(currentAge, planetaryPositions, houses);
      const wealthHouses = this._analyzeWealthHouses(planetaryPositions, houses);
      const riskAssessment = this._assessFinancialRisks(planetaryPositions, houses);
      const prosperityOpportunities = this._identifyProsperityOpportunities(planetaryPositions, houses);

      const introduction = `Your birth chart reveals your financial potential, wealth-building patterns, and optimal timing for prosperity. Planets influence income, expenses, investments, and financial security.`;

      const strategy = this._determineWealthBuildingStrategy(wealthPlanets, riskAssessment);

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
   * Calculate medical astrology analysis - health patterns and wellness
   */
  async calculateMedicalAstrologyAnalysis(birthData) {
    try {
      const planetaryPositions = await this._getPlanetaryPositions(birthData);
      const houses = await this._calculateHouses(birthData);

      // Analyze health indicators based on chart
      const healthIndicators = this._analyzeChartHealthIndicators(planetaryPositions, houses);
      const houseAnalysis = this._analyzeHealthHouses(planetaryPositions, houses);
      const focusAreas = this._identifyHealthFocusAreas(planetaryPositions, houses);
      const recommendations = this._generateHealthRecommendations(focusAreas);

      const introduction = `Your birth chart reveals innate health patterns and potential challenges. Medical astrology helps understand how planetary influences affect your physical well-being and vitality.`;

      return {
        introduction,
        healthIndicators,
        houseAnalysis,
        focusAreas,
        recommendations
      };

    } catch (error) {
      logger.error('Medical Astrology calculation error:', error);
      throw new Error('Failed to calculate medical astrology analysis');
    }
  }

  /**
   * Calculate career astrology analysis - professional guidance and timing
   */
  async calculateCareerAstrologyAnalysis(birthData) {
    try {
      const planetaryPositions = await this._getPlanetaryPositions(birthData);
      const houses = await this._calculateHouses(birthData);

      // Calculate current age for career timing
      const currentAge = this._calculateCurrentAge(birthData);

      // Analyze career indicators based on chart
      const midheavenAnalysis = this._analyzeMidheaven(houses[9], planetaryPositions);
      const tenthHousePlanets = this._analyzeTenthHousePlanets(planetaryPositions, houses);
      const careerPlanets = this._analyzeCareerPlanets(planetaryPositions, houses);
      const careerTiming = this._analyzeCareerTiming(currentAge, planetaryPositions, houses);
      const careerDirection = this._determineCareerDirection(midheavenAnalysis, tenthHousePlanets, careerPlanets);
      const successPotential = this._assessSuccessPotential(midheavenAnalysis, tenthHousePlanets, careerPlanets);

      const introduction = `Your birth chart reveals your professional calling, career strengths, and optimal timing for success. The Midheaven (MC) represents your public face and career direction.`;

      return {
        introduction,
        midheavenAnalysis,
        tenthHousePlanets,
        careerPlanets,
        careerTiming,
        careerDirection,
        successPotential
      };

    } catch (error) {
      logger.error('Career Astrology calculation error:', error);
      throw new Error('Failed to calculate career astrology analysis');
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

    const utcTime = new Date(Date.UTC(year, month - 1, day, hour - timezone, minute));
    const julianDay = utcTime.getTime() / 86400000 + 2440587.5;

    const planets = {};
    const planetEphemIds = [sweph.SE_SUN, sweph.SE_MOON, sweph.SE_MARS, sweph.SE_MERCURY,
                           sweph.SE_JUPITER, sweph.SE_VENUS, sweph.SE_SATURN];
    const planetNames = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

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
    const { birthDate, birthTime, latitude = 28.6139, longitude = 77.2090, timezone = 5.5 } = birthData;
    const [day, month, year] = birthDate.split('/').map(Number);
    const [hour, minute] = birthTime.split(':').map(Number);

    const utcTime = new Date(Date.UTC(year, month - 1, day, hour - timezone, minute));
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
    const currentAge = Math.floor((currentDate - birthDateObj) / (365.25 * 24 * 60 * 60 * 1000));
    return currentAge;
  }

  /**
   * Get zodiac sign from longitude
   * @private
   */
  _getSignFromLongitude(longitude) {
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const signIndex = Math.floor(longitude / 30);
    return signs[signIndex];
  }

  /**
   * Get house number from longitude and ascendant
   * @private
   */
  _getHouseNumber(longitude, ascendant) {
    const angle = ((longitude - ascendant + 360) % 360);
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
      const jupiterHouse = this._getHouseNumber(planets.Jupiter.longitude, cusps[0]);
      wealthPlanets.push({
        planet: 'Jupiter',
        interpretation: this._getWealthPlanetInterpretation('Jupiter', jupiterHouse)
      });
    }

    if (planets.Venus?.longitude) {
      const venusHouse = this._getHouseNumber(planets.Venus.longitude, cusps[0]);
      wealthPlanets.push({
        planet: 'Venus',
        interpretation: this._getWealthPlanetInterpretation('Venus', venusHouse)
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
    if (jupiterCycles.some(age => currentAge >= age - 1 && currentAge <= age + 1)) {
      cycles.push({
        cycle: 'Jupiter Return (Abundance & Growth)',
        description: 'Expansion of wealth and increased prosperity opportunities'
      });
    }

    if (currentAge >= 27 && currentAge <= 33) {
      cycles.push({
        cycle: 'Saturn Return (Career = Financial Maturity)',
        description: 'Financial stability through established career and disciplined wealth building'
      });
    }

    cycles.push({
      cycle: 'Venus Cycle (Income Flow)',
      description: 'Natural rhythm of financial intake and expenditure'
    });

    cycles.push({
      cycle: 'Jupiter Transits (Wealth Expansion)',
      description: '12-year cycles of prosperity and abundance when Jupiter transits wealth houses'
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
      const saturnHouse = this._getHouseNumber(planets.Saturn.longitude, cusps[0]);
      if (saturnHouse === 2) {
        risks.push({
          area: 'Security Concerns',
          level: 'Moderate - Saturn creates structure but may indicate financial limitation'
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
      const jupiterHouse = this._getHouseNumber(planets.Jupiter.longitude, cusps[0]);
      if ([2, 5, 9, 11].includes(jupiterHouse)) {
        opportunities.push({
          opportunity: 'Abundance Expansion',
          timing: 'Jupiter is well-placed for wealth building'
        });
      }
    }

    if (planets.Venus?.longitude) {
      const venusHouse = this._getHouseNumber(planets.Venus.longitude, cusps[0]);
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
      strategy += 'expansion and opportunity recognition. Jupiter favors growth ventures.';
    } else if (hasVenus) {
      strategy += 'value appreciation and luxury sector investments.';
    } else {
      strategy += 'balanced diversification. Multiple approaches to wealth building.';
    }

    if (highRisk) {
      strategy += ' Consider conservative strategies and build financial safety nets.';
    } else {
      strategy += ' Your chart supports moderate risk-taking with good potential.';
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

    return interpretations[planet]?.[house] || interpretations[planet]?.default || `${planet}'s energy influences financial decisions`;
  }

  // ================= MEDICAL ASTROLOGY METHODS =================

  /**
   * Analyze chart health indicators
   * @private
   */
  _analyzeChartHealthIndicators(planets, cusps) {
    const indicators = [];

    Object.keys(planets).forEach(planet => {
      if (planets[planet]?.longitude) {
        const house = this._getHouseNumber(planets[planet].longitude, cusps[0]);
        const sign = this._getSignFromLongitude(planets[planet].longitude);
        const interpretation = this._getPlanetHealthInterpretation(planet, house, planets[planet].longitude);

        indicators.push({
          planet,
          sign,
          house,
          interpretation
        });
      }
    });

    return indicators.slice(0, 5);
  }

  /**
   * Analyze health houses
   * @private
   */
  _analyzeHealthHouses(planets, cusps) {
    const houseAnalysis = [];

    const sixthHouseSign = this._getSignFromLongitude(cusps[5]);
    houseAnalysis.push({
      house: '6th House (Daily Health & Service)',
      interpretation: `${sixthHouseSign} in 6th house suggests health maintained through daily routines.`
    });

    const eighthHouseSign = this._getSignFromLongitude(cusps[7]);
    houseAnalysis.push({
      house: '8th House (Chronic Conditions & Recovery)',
      interpretation: `${eighthHouseSign} in 8th house indicates transformation through health challenges.`
    });

    return houseAnalysis;
  }

  /**
   * Identify health focus areas
   * @private
   */
  _identifyHealthFocusAreas(planets, cusps) {
    const focusAreas = [];

    if (planets.Saturn?.longitude) {
      const saturnHouse = this._getHouseNumber(planets.Saturn.longitude, cusps[0]);
      if (saturnHouse === 6 || saturnHouse === 12) {
        focusAreas.push({
          area: 'Chronic Conditions',
          insights: 'Saturn\'s position suggests long-term health maintenance.'
        });
      }
    }

    if (focusAreas.length === 0) {
      focusAreas.push({
        area: 'General Wellness',
        insights: 'Your chart shows balanced health indicators.'
      });
    }

    return focusAreas.slice(0, 3);
  }

  /**
   * Generate health recommendations
   * @private
   */
  _generateHealthRecommendations(focusAreas) {
    const recommendations = [];

    if (focusAreas[0].area === 'Chronic Conditions') {
      recommendations.push('Establish consistent health routines and consider specialized medical guidance');
    } else {
      recommendations.push('Maintain a balanced diet, regular sleep schedule, and stress management');
    }

    return recommendations;
  }

  /**
   * Get planet health interpretation
   * @private
   */
  _getPlanetHealthInterpretation(planet, house, longitude) {
    const sign = this._getSignFromLongitude(longitude);

    const interpretations = {
      Sun: {
        6: 'Sun in 6th house suggests vitality through daily routine',
        default: 'Sun represents core vitality and life force energy'
      },
      Moon: {
        6: 'Moon in 6th house connects emotional well-being to daily habits',
        default: 'Moon influences emotional health and sensitivity'
      },
      Mars: {
        8: 'Mars in 8th house suggests energetic transformation',
        default: 'Mars represents physical energy and immunity'
      }
    };

    return interpretations[planet]?.[house] || interpretations[planet]?.default || `${planet} represents health influences in ${sign}`;
  }

  // ================= CAREER ASTROLOGY METHODS =================

  /**
   * Analyze Midheaven
   * @private
   */
  _analyzeMidheaven(midheavenLongitude, planets) {
    const mcSign = this._getSignFromLongitude(midheavenLongitude);
    return `Midheaven in ${mcSign}: Professional expression and public achievements.`;
  }

  /**
   * Analyze tenth house planets
   * @private
   */
  _analyzeTenthHousePlanets(planets, cusps) {
    return [{ planet: 'Sun', influence: 'Leadership and authority in career' }];
  }

  /**
   * Analyze career planets
   * @private
   */
  _analyzeCareerPlanets(planets, cusps) {
    return [{ planet: 'Jupiter', careerImpact: 'Expansion and opportunities in profession' }];
  }

  /**
   * Analyze career timing
   * @private
   */
  _analyzeCareerTiming(currentAge, planets, cusps) {
    return [{ event: 'Saturn Return', description: 'Career maturity and established position' }];
  }

  /**
   * Determine career direction
   * @private
   */
  _determineCareerDirection(midheavenAnalysis, tenthHousePlanets, careerPlanets) {
    return 'Career path focuses on leadership and professional growth';
  }

  /**
   * Assess success potential
   * @private
   */
  _assessSuccessPotential(midheavenAnalysis, tenthHousePlanets, careerPlanets) {
    return 'High potential for professional success and recognition';
  }

  /**
   * Health check for AstrologicalCalculators
   * @returns {Object} Health status
   */
  healthCheck() {
    return {
      healthy: true,
      version: '1.0.0',
      calculations: ['Financial Astrology', 'Medical Astrology', 'Career Astrology'],
      status: 'Operational'
    };
  }
}

module.exports = { AstrologicalCalculators };