/**
 * Varga Charts - Vedic Divisional Charts Analysis
 * Traditional Indian Astrology division charts for detailed analysis
 */

const logger = require('../../utils/logger');
const sweph = require('sweph');

class VargaCharts {
  constructor() {
    logger.info('Module: VargaCharts loaded - Vedic Divisional Charts for Detailed Analysis');
    this.initializeVargaSystem();
  }

  /**
   * Initialize varga chart system with traditional divisions and their significances
   */
  initializeVargaSystem() {
    // Varga (Division) Charts with their Sanskrit names and significances
    this.vargaDetails = {
      RASHI: {    // D-1 (Birth Chart)
        Sanskrit: 'राशि',
        divisional: 1,
        significances: ['Physical body', 'Personality', 'First impressions', 'General life direction'],
        planetsMultiplied: 1
      },
      HORA: {     // D-2 (Wealth Chart)
        Sanskrit: 'होरा',
        divisional: 2,
        significances: ['Wealth', 'Family', 'Speech', 'Food', 'Material possessions'],
        planetsMultiplied: 1
      },
      DREKKANA: { // D-3 (Siblings Chart)
        Sanskrit: 'द्रेक्काण',
        divisional: 3,
        significances: ['Siblings', 'Courage', 'Short journeys', 'Communication', 'Early education'],
        planetsMultiplied: 1
      },
      CHATURTHAMSA: { // D-4 (Property Chart)
        Sanskrit: 'चतुर्थांश',
        divisional: 4,
        significances: ['Property', 'Home', 'Mother', 'Education', 'Conveyances', 'Fixed assets'],
        planetsMultiplied: 1
      },
      SAPTAMSA: { // D-7 (Children Chart)
        Sanskrit: 'सप्तमांश',
        divisional: 7,
        significances: ['Children', 'Creativity', 'Grandchildren', 'Spiritual progress'],
        planetsMultiplied: 1
      },
      NAVAMSA: {  // D-9 (Marriage/Spouse Chart) - Most important
        Sanskrit: 'नवांश',
        divisional: 9,
        significances: ['Marriage', 'Spouse', 'Dharma', 'Fortune', 'Spiritual life', 'Past karma'],
        planetsMultiplied: 1
      },
      DASHAMSA: { // D-10 (Career Chart)
        Sanskrit: 'दशमांश',
        divisional: 10,
        significances: ['Career', 'Profession', 'Authority', 'Public reputation', 'Fame'],
        planetsMultiplied: 1
      },
      DWADASAMSA: { // D-12 (Parents Chart)
        Sanskrit: 'द्वादशांश',
        divisional: 12,
        significances: ['Parents', 'Spirituality', 'Foreign travel', 'Expenses', 'Liberation'],
        planetsMultiplied: 1
      },
      SHODASAMSA: { // D-16 (Vehicles/Conveyances Chart)
        Sanskrit: 'षोडशांश',
        divisional: 16,
        significances: ['Vehicles', 'Happiness', 'Comfort', 'Luxury items', 'Pleasure'],
        planetsMultiplied: 1
      },
      VIMSAMSA: { // D-20 (Spiritual Chart)
        Sanskrit: 'विंशांश',
        divisional: 20,
        significances: ['Worship', 'Religious activities', 'Meditation', 'Spiritual growth'],
        planetsMultiplied: 1
      },
      CHATURVIMSAMSA: { // D-24 (Education Chart)
        Sanskrit: 'चतुर्विंशांश',
        divisional: 24,
        significances: ['Higher education', 'Knowledge', 'Learning', 'Skills'],
        planetsMultiplied: 1
      },
      SAPTAVIMSAMSA: { // D-27 (Strength Chart)
        Sanskrit: 'सप्तविंशांश',
        divisional: 27,
        significances: ['Strength', 'Vitality', 'Enemies', 'Diseases', 'Obstacles'],
        planetsMultiplied: 1
      },
      TRIMSAMSA: { // D-30 (Misfortunes Chart)
        Sanskrit: 'त्रिंशांश',
        divisional: 30,
        significances: ['Misfortunes', 'Sorrows', 'Debts', 'Enemies', 'Longevity'],
        planetsMultiplied: 1
      },
      KHAVEDAMSA: { // D-40 (Auspicious Chart)
        Sanskrit: 'खवेदांश',
        divisional: 40,
        significances: ['Auspicious events', 'Royal favor', 'Good fortune', 'Blessings'],
        planetsMultiplied: 1
      },
      AKSHAVEDAMSA: { // D-45 (Character Chart)
        Sanskrit: 'अक्षवेदांश',
        divisional: 45,
        significances: ['Character', 'Nature', 'Personality traits', 'Behavioral patterns'],
        planetsMultiplied: 1
      },
      SHASHTYAMSA: { // D-60 (Past Life Chart) - Most detailed
        Sanskrit: 'षष्ट्यांश',
        divisional: 60,
        significances: ['Past lives', 'Karma', 'Subconscious mind', 'Hidden strengths'],
        planetsMultiplied: 1
      }
    };

    // Shadvarga (6-fold system) - Traditional strength classification
    this.shadvarga = {
      CHESHTA: { aspects: ['Initiative'], description: 'Power to initiate actions' },
      NAIPEUNIKA: { aspects: ['Relationship power'], description: 'Power in relationships' },
      KENDRA: { aspects: ['Stability'], description: 'Power of stability' },
      DREKKANA: { aspects: ['Direct action'], description: 'Power of direct action' },
      STHIRAMSHA: { aspects: ['Fixed assets'], description: 'Power over fixed assets' },
      ASPECTS: { aspects: ['Influence'], description: 'Power through planetary aspects' }
    };

    // Planetary significances in different vargas
    this.planetarySignificance = {
      Sun: ['Self', 'Father', 'Authority', 'Government'],
      Moon: ['Mind', 'Mother', 'Emotions', 'Public'],
      Mars: ['Energy', 'Brothers', 'Enemies', 'Property'],
      Mercury: ['Intelligence', 'Communication', 'Business', 'Maternal relatives'],
      Jupiter: ['Wisdom', 'Children', 'Wealth', 'Spouse'],
      Venus: ['Luxury', 'Vehicles', 'Spouse', 'Arts'],
      Saturn: ['Service', 'Longevity', 'Hard work', 'Paternal relatives'],
      Rahu: ['Material gains', 'Foreign lands', 'Manipulation'],
      Ketu: ['Spirituality', 'Detachment', 'Past life karma']
    };
  }

  /**
   * Calculate varga charts for a birth chart
   * @param {Object} birthData - Birth date, time, place
   * @param {Array} vargas - Which vargas to calculate (optional)
   * @returns {Object} Varga chart analysis
   */
  async calculateVargaCharts(birthData, vargas = ['RASHI', 'HORA', 'DREKKANA', 'CHATURTHAMSA', 'SAPTAMSA', 'NAVAMSA', 'DASHAMSA']) {
    try {
      const { birthDate, birthTime, birthPlace } = birthData;

      // Parse birth data
      const { julianDay, latitude, longitude } = this.parseBirthData(birthDate, birthTime, birthPlace);

      // Calculate main birth chart first
      const birthChart = await this.calculateRashiChart(julianDay, latitude, longitude);

      // Calculate requested varga charts
      const vargaCharts = {};
      for (const vargaName of vargas) {
        vargaCharts[vargaName] = await this.calculateVargaChart(
          vargaName,
          birthChart,
          julianDay,
          latitude,
          longitude
        );
      }

      return {
        birthChart,
        vargaCharts,
        analysis: this.analyzeVargaCharts(vargaCharts),
        recommendations: this.generateVargaRecommendations(vargaCharts)
      };
    } catch (error) {
      logger.error('Error calculating varga charts:', error);
      return {
        error: `Varga chart calculation failed: ${error.message}`,
        recommendations: ['Varga charts provide detailed life area analysis through chart divisions']
      };
    }
  }

  /**
   * Calculate Rashi (D-1) chart as base
   * @private
   */
  async calculateRashiChart(julianDay, latitude, longitude) {
    const planets = {};
    const houses = {};

    // Calculate planet positions
    const planetList = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];
    for (const planet of planetList) {
      const result = sweph.calc(julianDay, this.getPlanetId(planet), sweph.FLG_SWIEPH | sweph.FLG_SIDEREAL);
      if (result.longitude) {
        const longitude = result.longitude[0];
        planets[planet.charAt(0).toUpperCase() + planet.slice(1)] = {
          longitude,
          sign: this.longitudeToSign(longitude),
          house: this.longitudeToHouse(longitude, 0), // Will be set after lagna calculation
          nakshatra: this.longitudeToNakshatra(longitude)
        };
      }
    }

    // Calculate houses (ascendant-based)
    const cusps = new Array(13);
    sweph.houses(julianDay, latitude, longitude, 'P', cusps);
    const lagna = cusps[0];

    // Update house assignments for planets
    Object.keys(planets).forEach(planet => {
      planets[planet].house = this.longitudeToHouse(planets[planet].longitude, lagna);
    });

    // House cusps
    for (let i = 1; i <= 12; i++) {
      houses[i] = {
        cusp: cusps[i - 1],
        sign: this.longitudeToSign(cusps[i - 1])
      };
    }

    return {
      planets,
      houses,
      lagna,
      ascendantSign: this.longitudeToSign(lagna)
    };
  }

  /**
   * Calculate specific varga chart
   * @private
   */
  async calculateVargaChart(vargaName, birthChart, julianDay, latitude, longitude) {
    if (!this.vargaDetails[vargaName]) {
      throw new Error(`Unknown varga: ${vargaName}`);
    }

    const vargaInfo = this.vargaDetails[vargaName];
    const { divisional } = vargaInfo;

    // For D-1, just return the birth chart
    if (divisional === 1) {
      return birthChart;
    }

    // Calculate divisional chart
    const vargaPlanets = {};
    const vargaHouses = {};

    // Planet positions multiplied by divisional factor
    Object.entries(birthChart.planets).forEach(([planet, data]) => {
      const divLongitude = (data.longitude * divisional) % 360;
      vargaPlanets[planet] = {
        longitude: divLongitude,
        sign: this.longitudeToSign(divLongitude),
        house: Math.floor(divLongitude / 30) + 1,
        strength: this.calculatePlanetaryStrength(planet, divLongitude, vargaName)
      };
    });

    // House cusps (simplified for divisional charts)
    const baseLagna = birthChart.lagna;
    const divisionalLagna = (baseLagna * divisional) % 360;

    for (let i = 1; i <= 12; i++) {
      const cuspLongitude = (divisionalLagna + (i - 1) * 30) % 360;
      vargaHouses[i] = {
        cusp: cuspLongitude,
        sign: this.longitudeToSign(cuspLongitude)
      };
    }

    return {
      planets: vargaPlanets,
      houses: vargaHouses,
      lagna: divisionalLagna,
      ascendantSign: this.longitudeToSign(divisionalLagna),
      divisionalFactor: divisional,
      significances: vargaInfo.significances
    };
  }

  /**
   * Analyze varga charts for insights and patterns
   * @private
   */
  analyzeVargaCharts(vargaCharts) {
    const analysis = {
      strengthAnalysis: {},
      keyInsights: [],
      problematicAreas: [],
      favorableCombinations: []
    };

    // Analyze Navamsa (D-9) - Most important for marriage/spirituality
    if (vargaCharts.NAVAMSA) {
      const navamsaAnalysis = this.analyzeNavamsaChart(vargaCharts.NAVAMSA);
      analysis.keyInsights.push(...navamsaAnalysis.insights);
      analysis.problematicAreas.push(...navamsaAnalysis.concerns);
    }

    // Analyze Dashamsa (D-10) - Career analysis
    if (vargaCharts.DASHAMSA) {
      const dashamsaAnalysis = this.analyzeDashamsaChart(vargaCharts.DASHAMSA);
      analysis.keyInsights.push(...dashamsaAnalysis.insights);
      analysis.favorableCombinations.push(...dashamsaAnalysis.strengths);
    }

    // Analyze Hora (D-2) - Wealth analysis
    if (vargaCharts.HORA) {
      const horaAnalysis = this.analyzeHoraChart(vargaCharts.HORA);
      analysis.keyInsights.push(...horaAnalysis.insights);
    }

    // Calculate overall planetary strength across vargas
    analysis.strengthAnalysis = this.calculateOverallStrength(vargaCharts);

    return analysis;
  }

  /**
   * Analyze Navamsa chart for marriage and dharma insights
   * @private
   */
  analyzeNavamsaChart(navamsaChart) {
    const insights = [];
    const concerns = [];

    // Check Venus Jupiter positions (marriage significators)
    const venus = navamsaChart.planets.Venus;
    const jupiter = navamsaChart.planets.Jupiter;

    if (venus) {
      if (venus.house === 7 || venus.house === 5) {
        insights.push('Venus well-placed in Navamsa - harmonious relationships');
      } else if (venus.house === 6 || venus.house === 12) {
        concerns.push('Venus in challenging position - relationship adjustments needed');
      }
    }

    if (jupiter) {
      if ([1, 5, 9].includes(jupiter.house)) {
        insights.push('Jupiter in trine house - spiritual growth and fortune');
      }
    }

    return { insights, concerns };
  }

  /**
   * Analyze Dashamsa chart for career insights
   * @private
   */
  analyzeDashamsaChart(dashamsaChart) {
    const insights = [];
    const strengths = [];

    // Check 10th house (career house) in Dashamsa
    if (dashamsaChart.houses && dashamsaChart.houses[10]) {
      insights.push(`Dashamsa 10th house in ${dashamsaChart.houses[10].sign} - career direction`);
    }

    // Sun and Mars positioning
    const sun = dashamsaChart.planets.Sun;
    const mars = dashamsaChart.planets.Mars;

    if (sun && [1, 5, 9, 10].includes(sun.house)) {
      strengths.push('Sun strongly placed - leadership potential');
    }

    if (mars && [3, 6, 10, 11].includes(mars.house)) {
      strengths.push('Mars energy supports career actions');
    }

    return { insights, strengths };
  }

  /**
   * Analyze Hora chart for wealth insights
   * @private
   */
  analyzeHoraChart(horaChart) {
    const insights = [];

    // Hora shows wealth: 2nd and 11th houses are key
    if (horaChart.planets.Jupiter && [2, 11].includes(horaChart.planets.Jupiter.house)) {
      insights.push('Jupiter in wealth houses - prosperous periods ahead');
    }

    if (horaChart.planets.Venus && [2, 11].includes(horaChart.planets.Venus.house)) {
      insights.push('Venus in wealth houses - comfort through material means');
    }

    return { insights };
  }

  /**
   * Calculate overall planetary strength across vargas
   * @private
   */
  calculateOverallStrength(vargaCharts) {
    const strength = {};

    // Key planets to check across vargas
    const keyPlanets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

    keyPlanets.forEach(planet => {
      strength[planet] = {
        score: 0,
        favorableVargas: [],
        challengingVargas: []
      };

      // Check placement in key vargas
      ['RASHI', 'NAVAMSA', 'DASHAMSA', 'HORA'].forEach(varga => {
        if (vargaCharts[varga] && vargaCharts[varga].planets[planet]) {
          const data = vargaCharts[varga].planets[planet];
          const score = this.evaluatePlacementStrength(planet, data.house);

          strength[planet].score += score;
          if (score > 2) {
            strength[planet].favorableVargas.push(varga);
          } else if (score < 1) {
            strength[planet].challengingVargas.push(varga);
          }
        }
      });
    });

    return strength;
  }

  /**
   * Generate varga chart recommendations
   * @private
   */
  generateVargaRecommendations(vargaCharts) {
    const recommendations = {
      lifeAreas: {},
      remedies: [],
      favorablePeriods: []
    };

    // Marriage recommendations from Navamsa
    if (vargaCharts.NAVAMSA) {
      const navamsa = vargaCharts.NAVAMSA;
      recommendations.lifeAreas.marriage = this.getNavamsaMarriageGuidance(navamsa);
    }

    // Career recommendations from Dashamsa
    if (vargaCharts.DASHAMSA) {
      const dashamsa = vargaCharts.DASHAMSA;
      recommendations.lifeAreas.career = this.getDashamsaCareerGuidance(dashamsa);
    }

    // Wealth recommendations from Hora
    if (vargaCharts.HORA) {
      const hora = vargaCharts.HORA;
      recommendations.lifeAreas.wealth = this.getHoraWealthGuidance(hora);
    }

    // General remedies based on weak placements
    recommendations.remedies = this.generateRemedies(vargaCharts);

    return recommendations;
  }

  /**
   * Get marriage guidance from Navamsa
   * @private
   */
  getNavamsaMarriageGuidance(navamsa) {
    let guidance = 'Navamsa analysis for marriage: ';

    const venus = navamsa.planets.Venus;
    if (venus) {
      if ([5, 7, 9].includes(venus.house)) {
        guidance += 'Venus well-positioned for harmonious marriage';
      } else if ([6, 8, 12].includes(venus.house)) {
        guidance += 'Venus placement suggests adjustments needed in relationships';
      }
    }

    return guidance;
  }

  /**
   * Get career guidance from Dashamsa
   * @private
   */
  getDashamsaCareerGuidance(dashamsa) {
    let guidance = 'Dashamsa indication for career: ';

    const sun = dashamsa.planets.Sun;
    if (sun) {
      if (sun.house === 10) {
        guidance += 'Strong career potential with leadership';
      } else if ([1, 4, 5, 9].includes(sun.house)) {
        guidance += 'Career success through personal strengths';
      } else {
        guidance += 'Career may require persistence and learning';
      }
    }

    return guidance;
  }

  /**
   * Get wealth guidance from Hora
   * @private
   */
  getHoraWealthGuidance(hora) {
    let guidance = 'Hora wealth indications: ';

    const jupiter = hora.planets.Jupiter;
    if (jupiter) {
      if ([2, 11].includes(jupiter.house)) {
        guidance += 'Strong wealth-building potential';
      } else if (jupiter.house === 12) {
        guidance += 'Wealth through expenses or foreign connections';
      }
    }

    return guidance;
  }

  /**
   * Generate general remedies based on varga analysis
   * @private
   */
  generateRemedies(vargaCharts) {
    const remedies = [];

    // Check for weak Jupiter placements (common remedy)
    if (this.needsJupiterRemedies(vargaCharts)) {
      remedies.push('Consider yellow sapphire or Jupiter remedies for wisdom and fortune');
    }

    // Venus remedies for relationship issues
    if (this.needsVenusRemedies(vargaCharts)) {
      remedies.push('Consider diamond or Venus mantras for harmony and beauty');
    }

    // Sun remedies for confidence and authority
    if (this.needsSunRemedies(vargaCharts)) {
      remedies.push('Practice Surya namaskar and wear ruby for confidence');
    }

    remedies.push('Consult a qualified Vedic astrologer for personalized remedies');

    return remedies;
  }

  // Helper methods
  parseBirthData(birthDate, birthTime, birthPlace) {
    // Simplified parsing - convert to Julian day
    const date = new Date(`${birthDate}T${birthTime}`);
    const julianDay = this.dateToJulianDay(date);

    // Default coordinates (would normally be geocoded from birthPlace)
    return {
      julianDay,
      latitude: 28.6139, // New Delhi coordinates as default
      longitude: 77.2090
    };
  }

  dateToJulianDay(date) {
    return Math.floor((date.getTime() / 86400000) + 2440587.5);
  }

  longitudeToSign(longitude) {
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    return signs[Math.floor(longitude / 30) % 12];
  }

  longitudeToHouse(longitude, ascendant) {
    const diff = ((longitude - ascendant + 360) % 360);
    return Math.floor(diff / 30) + 1;
  }

  longitudeToNakshatra(longitude) {
    const nakshatras = [
      'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha',
      'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha',
      'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishtha', 'Shatabhisha',
      'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
    ];
    const nakIndex = Math.floor(longitude * 27 / 360) % 27;
    return nakshatras[nakIndex];
  }

  getPlanetId(planetName) {
    const ids = {
      sun: sweph.SE_SUN,
      moon: sweph.SE_MOON,
      mars: sweph.SE_MARS,
      mercury: sweph.SE_MERCURY,
      jupiter: sweph.SE_JUPITER,
      venus: sweph.SE_VENUS,
      saturn: sweph.SE_SATURN
    };
    return ids[planetName] || sweph.SE_SUN;
  }

  calculatePlanetaryStrength(planet, longitude, vargaName) {
    // Simplified strength calculation based on placement
    const house = Math.floor(longitude / 30) + 1;
    return this.evaluatePlacementStrength(planet, house);
  }

  evaluatePlacementStrength(planet, house) {
    // House strengths vary by planet
    const favorableHouses = {
      Sun: [1, 5, 9, 10, 11],
      Moon: [1, 4, 5, 7, 9],
      Mars: [1, 3, 6, 10, 11],
      Mercury: [1, 3, 5, 6, 9, 11],
      Jupiter: [1, 5, 7, 9, 11],
      Venus: [1, 4, 5, 7, 9, 12],
      Saturn: [3, 6, 10, 11]
    };

    const challengingHouses = {
      Sun: [6, 8, 12],
      Moon: [3, 6, 8, 11],
      Mars: [4, 5, 8, 9],
      Mercury: [8, 12],
      Jupiter: [3, 6, 8, 10],
      Venus: [3, 6, 8],
      Saturn: [1, 8, 9]
    };

    if (favorableHouses[planet]?.includes(house)) { return 3; }
    if (challengingHouses[planet]?.includes(house)) { return 0; }
    return 1.5; // Neutral placement
  }

  needsJupiterRemedies(vargaCharts) {
    // Check if Jupiter is weak in key vargas
    return ['NAVAMSA', 'DASHAMSA'].some(varga =>
      vargaCharts[varga]?.planets?.Jupiter?.strength < 2
    );
  }

  needsVenusRemedies(vargaCharts) {
    return vargaCharts.NAVAMSA?.planets?.Venus?.house === 12 ||
           vargaCharts.NAVAMSA?.planets?.Venus?.house === 6;
  }

  needsSunRemedies(vargaCharts) {
    return vargaCharts.DASHAMSA?.planets?.Sun?.house === 12 ||
           vargaCharts.DASHAMSA?.planets?.Sun?.house === 8;
  }

  /**
   * Get complete varga chart catalog
   * @returns {Object} Varga service information
   */
  getVargaCatalog() {
    return {
      availableVargas: Object.keys(this.vargaDetails),
      significanceMap: this.vargaDetails,
      keyVargas: ['NAVAMSA', 'DASHAMSA', 'HORA', 'DREKKANA', 'CHATURTHAMSA'],
      shadvarga: this.shadvarga,
      planetarySignificance: this.planetarySignificance,
      calculationMethod: 'Traditional Vedic divisional harmonics using Swiss Ephemeris',
      traditionalReference: 'Brihat Parasara Hora Sastra divisions'
    };
  }
}

module.exports = { VargaCharts };
