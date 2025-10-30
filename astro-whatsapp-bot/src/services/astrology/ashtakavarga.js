/**
 * Ashtakavarga System - Vedic 64-Point Analysis
 * Advanced system for analyzing benefic influences on life areas
 */

const logger = require('../../utils/logger');
const sweph = require('sweph');

class Ashtakavarga {
  constructor() {
    logger.info('Module: Ashtakavarga loaded - Vedic 64-Point Beneficial Analysis');
    this.initializeAshtakavargaSystem();
  }

  /**
   * Initialize the complete Ashtakavarga calculation system
   */
  initializeAshtakavargaSystem() {
    // Planet sequence for Ashtakavarga calculations
    this.planets = [
      { name: 'sun', sanskrit: 'रवि', symbol: '☉', weight: 1 },
      { name: 'moon', sanskrit: 'चंद्र', symbol: '☽', weight: 1 },
      { name: 'mars', sanskrit: 'मंगल', symbol: '♂', weight: 1 },
      { name: 'mercury', sanskrit: 'बुध', symbol: '☿', weight: 1 },
      { name: 'jupiter', sanskrit: 'गुरु', symbol: '♃', weight: 1 },
      { name: 'venus', sanskrit: 'शुक्र', symbol: '♀', weight: 1 },
      { name: 'saturn', sanskrit: 'शनि', symbol: '♄', weight: 1 }
    ];

    // 12 zodiac signs (rashis) for the 7 planets create 12x7 = 84 potential points
    this.rashis = [
      { name: 'Aries', sanskrit: 'मेष', symbol: '♈', element: 'Fire', quality: 'Cardinal' },
      { name: 'Taurus', sanskrit: 'वृषभ', symbol: '♉', element: 'Earth', quality: 'Fixed' },
      { name: 'Gemini', sanskrit: 'मिथुन', symbol: '♊', element: 'Air', quality: 'Mutable' },
      { name: 'Cancer', sanskrit: 'कर्क', symbol: '♋', element: 'Water', quality: 'Cardinal' },
      { name: 'Leo', sanskrit: 'सिंह', symbol: '♌', element: 'Fire', quality: 'Fixed' },
      { name: 'Virgo', sanskrit: 'कन्या', symbol: '♍', element: 'Earth', quality: 'Mutable' },
      { name: 'Libra', sanskrit: 'तुला', symbol: '♎', element: 'Air', quality: 'Cardinal' },
      { name: 'Scorpio', sanskrit: 'वृश्चिक', symbol: '♏', element: 'Water', quality: 'Fixed' },
      { name: 'Sagittarius', sanskrit: 'धनुष', symbol: '♐', element: 'Fire', quality: 'Mutable' },
      { name: 'Capricorn', sanskrit: 'मकर', symbol: '♑', element: 'Earth', quality: 'Cardinal' },
      { name: 'Aquarius', sanskrit: 'कुम्भ', symbol: '♒', element: 'Air', quality: 'Fixed' },
      { name: 'Pisces', sanskrit: 'मीन', symbol: '♓', element: 'Water', quality: 'Mutable' }
    ];

    // Relationship matrices for each planet (where they consider signs beneficial)
    this.relationshipMatrices = {
      sun: {
        ownSign: [4], // 0-based index: Aries
        exalted: [3], // Cancer
        friendlySigns: [0, 3, 6, 7, 9, 11], // Aries, Cancer, Libra, Scorpio, Capricorn, Pisces
        neutralSigns: [2, 5, 8], // Gemini, Virgo, Sagittarius
        enemySigns: [1, 10] // Taurus, Aquarius
      },
      moon: {
        ownSign: [3], // Cancer
        exalted: [1], // Taurus
        friendlySigns: [1, 5, 6, 7, 8, 9], // Taurus, Virgo, Libra, Scorpio, Sagittarius, Capricorn
        neutralSigns: [0, 3, 10, 11], // Aries, Cancer, Aquarius, Pisces
        enemySigns: [2] // Gemini
      },
      mars: {
        ownSign: [0, 7], // Aries, Scorpio
        exalted: [9], // Capricorn
        friendlySigns: [0, 1, 3, 5, 6, 9, 11], // Aries, Taurus, Cancer, Virgo, Libra, Capricorn, Pisces
        neutralSigns: [2, 7, 10], // Gemini, Scorpio, Aquarius
        enemySigns: [4, 8] // Leo, Sagittarius
      },
      mercury: {
        ownSign: [2, 5], // Gemini, Virgo
        exalted: [2], // Gemini (some systems), or Cancer
        friendlySigns: [1, 3, 5, 6, 7, 8, 9, 10], // Taurus, Cancer, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius
        neutralSigns: [0, 4, 11], // Aries, Leo, Pisces
        enemySigns: [] // Neutral to all
      },
      jupiter: {
        ownSign: [6, 8], // Libra, Sagittarius
        exalted: [9], // Capricorn
        friendlySigns: [0, 2, 3, 4, 5, 6, 9, 11], // Aries, Gemini, Cancer, Leo, Virgo, Libra, Capricorn, Pisces
        neutralSigns: [7, 8, 10], // Scorpio, Sagittarius, Aquarius
        enemySigns: [1] // Taurus
      },
      venus: {
        ownSign: [1, 6], // Taurus, Libra
        exalted: [5], // Virgo
        friendlySigns: [1, 2, 3, 4, 5, 6, 7, 9, 11], // Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Capricorn, Pisces
        neutralSigns: [8, 10], // Sagittarius, Aquarius
        enemySigns: [0] // Aries
      },
      saturn: {
        ownSign: [9, 10], // Capricorn, Aquarius
        exalted: [6], // Libra
        friendlySigns: [1, 2, 5, 7, 9, 10, 11], // Taurus, Gemini, Virgo, Scorpio, Capricorn, Aquarius, Pisces
        neutralSigns: [0, 3, 8], // Aries, Cancer, Sagittarius
        enemySigns: [4, 6] // Leo, Libra
      }
    };

    // House lords and their relationships to signs
    this.houseLords = {
      0: 'mars',    1: 'venus',  2: 'mercury', 3: 'moon',
      4: 'sun',     5: 'mercury', 6: 'venus',  7: 'mars',
      8: 'jupiter', 9: 'saturn',  10: 'saturn', 11: 'jupiter'
    };

    // Bhavas (houses) and their meanings for Ashtakavarga application
    this.bhavas = {
      1: { name: 'Self', sanskrit: 'आत्मभाव', significations: ['Life', 'Body', 'Personality'] },
      2: { name: 'Wealth', sanskrit: 'धनभाव', significations: ['Family', 'Wealth', 'Speech'] },
      3: { name: 'Siblings', sanskrit: 'सहोदर भाव', significations: ['Siblings', 'Communication', 'Courage'] },
      4: { name: 'Home', sanskrit: 'सुखभाव', significations: ['Mother', 'Home', 'Education'] },
      5: { name: 'Children', sanskrit: 'संतान भाव', significations: ['Children', 'Intelligence', 'Creativity'] },
      6: { name: 'Enemies', sanskrit: 'रिपु भाव', significations: ['Enemies', 'Disease', 'Service'] },
      7: { name: 'Spouse', sanskrit: 'कलात्र भाव', significations: ['Marriage', 'Business', 'Partnership'] },
      8: { name: 'Longevity', sanskrit: 'आयु भाव', significations: ['Death', 'Occult', 'Chronic disease'] },
      9: { name: 'Fortune', sanskrit: 'भाग्य भाव', significations: ['Father', 'Religion', 'Higher learning'] },
      10: { name: 'Career', sanskrit: 'कर्म भाव', significations: ['Profession', 'Authority', 'Reputation'] },
      11: { name: 'Gains', sanskrit: 'लाभ भाव', significations: ['Friends', 'Gains', 'Elders'] },
      12: { name: 'Expenditure', sanskrit: 'व्यय भाव', significations: ['Expenses', 'Losses', 'Liberation'] }
    };
  }

  /**
   * Generate complete Ashtakavarga analysis for a birth chart
   * @param {Object} birthData - Birth date, time, place data
   * @returns {Object} Complete Ashtakavarga analysis
   */
  async generateAshtakavargaAnalysis(birthData) {
    try {
      const { birthDate, birthTime, birthPlace } = birthData;

      // Parse birth data
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);
      const julianDay = this.dateToJulianDay(year, month, day, hour + minute / 60);

      // Calculate natal planetary positions
      const natalChart = await this.calculateNatalChart(julianDay, birthPlace);

      // Generate Ashtakavarga tables for each planet
      const ashtakavargaTables = {};
      const planetTotals = {};
      let grandTotal = 0;

      for (const planet of this.planets) {
        const table = this.calculateAshtakavargaTable(planet.name, natalChart);
        ashtakavargaTables[planet.name] = table;
        planetTotals[planet.name] = table.reduce((sum, points) => sum + points, 0);
        grandTotal += planetTotals[planet.name];
      }

      // Calculate overall Ashtakavarga strength
      const averageStrength = Math.round(grandTotal / 7);

      // Identify strongest and weakest areas
      const areasAnalysis = this.analyzeAreasOfStrength(ashtakavargaTables, planetTotals);

      // Generate predictions based on Ashtakavarga
      const predictions = this.generatePredictions(ashtakavargaTables, natalChart, averageStrength);

      // Calculate timing based on strengths
      const timing = this.calculateTimingFromAshtakavarga(ashtakavargaTables, natalChart);

      return {
        natalChart,
        ashtakavargaTables,
        planetTotals,
        grandTotal,
        averageStrength,
        areasAnalysis,
        predictions,
        timing,
        interpretation: this.generateAshtakavargaInterpretation(ashtakavargaTables, planetTotals, grandTotal, averageStrength),
        summary: this.generateAshtakavargaSummary(predictions, areasAnalysis, averageStrength, timing)
      };
    } catch (error) {
      logger.error('Error generating Ashtakavarga analysis:', error);
      return {
        error: `Unable to generate Ashtakavarga analysis: ${error.message}`,
        fallback: 'Ashtakavarga provides advanced Vedic 64-point beneficial influence analysis'
      };
    }
  }

  /**
   * Calculate Ashtakavarga table for a specific planet
   * @private
   */
  calculateAshtakavargaTable(planetName, natalChart) {
    const table = new Array(12).fill(0); // 12 rashis
    const relationships = this.relationshipMatrices[planetName];

    for (let rashiIndex = 0; rashiIndex < 12; rashiIndex++) {
      let points = 0;

      // 1. Friendship/Natural Relationships
      if (relationships.ownSign.includes(rashiIndex)) { points += 4; } else if (relationships.exalted.includes(rashiIndex)) { points += 4; } else if (relationships.friendlySigns.includes(rashiIndex)) { points += 4; } else if (relationships.neutralSigns.includes(rashiIndex)) { points += 3; } else if (relationships.enemySigns.includes(rashiIndex)) { points += 1; } else { points += 3; } // Mula-trikona or other relationships

      // 2. Trikonasphuta: Relationships with houses 1, 5, 9 from planet's position
      const planetPosition = natalChart.planets[planetName]?.sign || 0;
      const trikonalHouses = [
        planetPosition,
        (planetPosition + 4) % 12, // 5th from planet
        (planetPosition + 8) % 12  // 9th from planet
      ];

      if (trikonalHouses.includes(rashiIndex)) { points += 3; }

      // 3. Ekadhipatya: If rashi lord is in trikona from planet
      const rashiLord = this.houseLords[rashiIndex];
      if (rashiLord && natalChart.planets[rashiLord]) {
        const lordPosition = natalChart.planets[rashiLord].sign;
        const distance = (lordPosition - planetPosition + 12) % 12;

        if ([0, 4, 8].includes(distance)) { points += 2; }
      }

      // 4. Aspect considerations
      // Simplified: planets having 4th, 7th, 10th aspects give points
      for (const [otherPlanet, data] of Object.entries(natalChart.planets)) {
        if (otherPlanet !== planetName) {
          const aspect = Math.abs(data.sign - rashiIndex);
          const normalizedAspect = aspect > 6 ? Math.abs(aspect - 12) : aspect;

          if ([3, 6, 9].includes(normalizedAspect)) { // 4th, 7th, 10th aspects
            points += 1;
          }
        }
      }

      // 5. Nakshatra Lord influences
      // Simplified: Moon's nakshatra ruler gets additional points
      const moonNakRuler = this.getMoonNakRuler(natalChart.planets.moon);
      if (moonNakRuler === planetName) {
        points += 1;
      }

      table[rashiIndex] = Math.min(points, 8); // Maximum 8 points per rashi
    }

    return table;
  }

  /**
   * Calculate natal chart positions
   * @private
   */
  async calculateNatalChart(jd, location) {
    const { latitude, longitude } = location;
    const planets = {};

    for (const planet of this.planets) {
      try {
        const result = sweph.calc(jd, this.getPlanetId(planet.name), sweph.FLG_SWIEPH | sweph.FLG_SIDEREAL);
        const longitude = result.longitude?.[0] || 0;
        const sign = Math.floor(longitude / 30) % 12;

        planets[planet.name] = {
          longitude,
          sign,
          degree: longitude % 30,
          house: this.calculateHouse(longitude, jd, latitude, longitude)
        };
      } catch (error) {
        logger.warn(`Error calculating ${planet.name}:`, error.message);
        planets[planet.name] = { longitude: 0, sign: 0, house: 1 };
      }
    }

    return { planets, jd, location };
  }

  /**
   * Analyze areas of strength and weakness
   * @private
   */
  analyzeAreasOfStrength(ashtakavargaTables, planetTotals) {
    const analysis = {
      strongestAreas: [],
      weakestAreas: [],
      balancedAreas: [],
      overallBalance: {}
    };

    // Find average points per planet per rashi
    const averages = {};
    for (let rashiIndex = 0; rashiIndex < 12; rashiIndex++) {
      let total = 0;
      for (const planet of this.planets) {
        total += ashtakavargaTables[planet.name][rashiIndex];
      }
      averages[rashiIndex] = Math.round(total / 7);
    }

    // Classify each rashi
    for (let rashiIndex = 0; rashiIndex < 12; rashiIndex++) {
      const score = averages[rashiIndex];
      const rashiName = this.rashis[rashiIndex].name;

      if (score >= 6) {
        analysis.strongestAreas.push({
          rashi: rashiName,
          score,
          areas: this.bhavas[(rashiIndex + 1) % 12 + 1]?.significations || []
        });
      } else if (score <= 3) {
        analysis.weakestAreas.push({
          rashi: rashiName,
          score,
          areas: this.bhavas[(rashiIndex + 1) % 12 + 1]?.significations || []
        });
      } else {
        analysis.balancedAreas.push({
          rashi: rashiName,
          score,
          areas: this.bhavas[(rashiIndex + 1) % 12 + 1]?.significations || []
        });
      }
    }

    analysis.overallBalance = {
      totalRashis: 12,
      strongCount: analysis.strongestAreas.length,
      weakCount: analysis.weakestAreas.length,
      balancedCount: analysis.balancedAreas.length,
      strengthIndex: Math.round((analysis.strongestAreas.length / 12) * 100)
    };

    return analysis;
  }

  /**
   * Generate predictions based on Ashtakavarga
   * @private
   */
  generatePredictions(ashtakavargaTables, natalChart, averageStrength) {
    const predictions = {
      lifeAreas: {},
      planetaryStrengths: {},
      remedialMeasures: []
    };

    // Life area predictions
    for (let house = 1; house <= 12; house++) {
      const houseIndex = (house - 1);
      const averagePoints = this.getAverageForHouse(ashtakavargaTables, houseIndex);

      predictions.lifeAreas[house] = {
        house,
        name: this.bhavas[house].name,
        significations: this.bhavas[house].significations,
        strength: averagePoints,
        prediction: this.generateHousePrediction(house, averagePoints, averageStrength)
      };
    }

    // Planetary strength analysis
    for (const planet of this.planets) {
      const total = ashtakavargaTables[planet.name].reduce((sum, points) => sum + points, 0);
      const maxPossible = 12 * 8; // 12 rashis * max 8 points = 96
      const percentage = Math.round((total / maxPossible) * 100);

      predictions.planetaryStrengths[planet.name] = {
        total,
        percentage,
        assessment: this.assessPlanetaryStrength(percentage),
        influence: this.getPlanetInfluence(planet.name, total)
      };
    }

    // Remedial measures for weak areas
    predictions.remedialMeasures = this.generateRemedialMeasures(ashtakavargaTables, natalChart);

    return predictions;
  }

  /**
   * Generate comprehensive Ashtakavarga interpretation
   * @private
   */
  generateAshtakavargaInterpretation(ashtakavargaTables, planetTotals, grandTotal, averageStrength) {
    let interpretation = '';

    // Overall strength
    if (averageStrength >= 40) {
      interpretation += 'Your Ashtakavarga indicates strong benefic influences throughout life. ';
    } else if (averageStrength >= 30) {
      interpretation += 'Your Ashtakavarga shows moderate benefic potential with some areas stronger than others. ';
    } else {
      interpretation += 'Your Ashtakavarga suggests areas requiring additional strengthening through spiritual practices. ';
    }

    // Planetary analysis
    const strongPlanets = Object.entries(planetTotals)
      .filter(([, total]) => total >= 50)
      .map(([planet]) => planet);

    if (strongPlanets.length > 0) {
      interpretation += `Strong benefic influences from: ${strongPlanets.join(', ')}. `;
    }

    // Life area insights
    const weakHouses = [];
    for (let house = 1; house <= 12; house++) {
      const averagePoints = this.getAverageForHouse(ashtakavargaTables, house - 1);
      if (averagePoints <= 25) { // Weak house threshold
        weakHouses.push(this.bhavas[house].name);
      }
    }

    if (weakHouses.length > 0) {
      interpretation += `Areas requiring attention: ${weakHouses.join(', ')}. `;
    }

    interpretation += 'Ashtakavarga reveals the distribution of benefic planetary influences across different life areas, guiding timing and success potential.';

    return interpretation;
  }

  /**
   * Generate comprehensive summary
   * @private
   */
  generateAshtakavargaSummary(predictions, areasAnalysis, averageStrength, timing) {
    return `🔢 **Ashtakavarga Analysis - Advanced Vedic 64-Point System**

**Overall Strength:** ${averageStrength}/56 (${Math.round((averageStrength / 56) * 100)}%)
**Strongest Areas:** ${areasAnalysis.strongestAreas.length}/12 rashis
**Weakest Areas:** ${areasAnalysis.weakestAreas.length}/12 rashis

**Key Life Areas Analysis:**
${this.formatLifeAreasSummary(predictions.lifeAreas)}

**Strength Distribution:**
• Strong Benefic Planets: ${Object.values(predictions.planetaryStrengths).filter(p => p.assessment === 'Strong').length}/7
• Moderate Planets: ${Object.values(predictions.planetaryStrengths).filter(p => p.assessment === 'Moderate').length}/7
• Weak Planets: ${Object.values(predictions.planetaryStrengths).filter(p => p.assessment === 'Weak').length}/7

**Recommended Focus Areas:**
${predictions.remedialMeasures.slice(0, 3).map(item => `• ${item}`).join('\n')}

🕉️ *Ashtakavarga reveals benefic planetary dots across 12 zodiac signs for comprehensive life analysis.*`;
  }

  // Helper methods
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

  calculateHouse(longitude, jd, lat, lon) {
    // Simplified house calculation
    return Math.floor(longitude / 30) + 1;
  }

  dateToJulianDay(year, month, day, hour) {
    return hour / 24 + day + Math.floor((153 * month + 2) / 5) + 365 * year + Math.floor(year / 4) - Math.floor(year / 100) + Math.floor(year / 400) - 32045;
  }

  getMoonNakRuler(moon) {
    const nakshatraIndex = Math.floor(moon.longitude / (360 / 27));
    const rulers = ['ketu', 'venus', 'sun', 'moon', 'mars', 'rahu', 'jupiter', 'saturn', 'mercury'];
    return rulers[nakshatraIndex % 9] || 'moon';
  }

  getAverageForHouse(ashtakavargaTables, houseIndex) {
    let total = 0;
    for (const planet of this.planets) {
      total += ashtakavargaTables[planet.name][houseIndex];
    }
    return total;
  }

  generateHousePrediction(house, points, averageStrength) {
    const strength = points > averageStrength ? 'Above Average' :
      points < averageStrength - 10 ? 'Below Average' : 'Average';

    const houseName = this.bhavas[house].name;
    const significations = this.bhavas[house].significations.join(', ');

    return `${houseName}:${strength} potential in ${significations}`;
  }

  assessPlanetaryStrength(percentage) {
    if (percentage >= 70) { return 'Strong'; }
    if (percentage >= 50) { return 'Moderate'; }
    return 'Weak';
  }

  getPlanetInfluence(planetName, totalPoints) {
    const influences = {
      sun: ['Career', 'Authority', 'Leadership'],
      moon: ['Home', 'Emotions', 'Mind'],
      mars: ['Energy', 'Conflict', 'Action'],
      mercury: ['Communication', 'Business', 'Learning'],
      jupiter: ['Wisdom', 'Expansion', 'Religion'],
      venus: ['Love', 'Luxury', 'Creativity'],
      saturn: ['Discipline', 'Karma', 'Longevity']
    };
    return `${planetName.charAt(0).toUpperCase() + planetName.slice(1)} influences: ${influences[planetName]?.join(', ')}`;
  }

  generateRemedialMeasures(ashtakavargaTables, natalChart, planetTotals = {}) {
    const measures = [];

    // Check weak rashis (<3 average points)
    for (let rashiIndex = 0; rashiIndex < 12; rashiIndex++) {
      const averagePoints = this.getAverageForHouse(ashtakavargaTables, rashiIndex);
      if (averagePoints < 3) {
        const rashiName = this.rashis[rashiIndex].name;
        measures.push(`Strengthen ${rashiName} influence through related gemstones and mantras`);
      }
    }

    // Check planetary weaknesses
    for (const [planet, total] of Object.entries(planetTotals)) {
      if (total < 30) {
        measures.push(`Strengthen ${planet} through specific gemstone and mantras`);
      }
    }

    // General measures
    if (measures.length === 0) {
      measures.push('Regular spiritual practices to maintain beneficial influences');
      measures.push('Chant "Om Shreem Maha Lakshmiyei Namaha" for overall prosperity');
    }

    return measures;
  }

  calculateTimingFromAshtakavarga(ashtakavargaTables, natalChart) {
    // Simplified timing based on strongest rashi periods
    return {
      favorablePeriods: 'Strength periods based on rashi influences',
      challengingPeriods: 'Weak rashi periods requiring care',
      nextStrongPeriod: 'Based on current planetary positions',
      overallTiming: 'Mixed with targeted opportunities'
    };
  }

  formatLifeAreasSummary(lifeAreas) {
    return `${Object.values(lifeAreas).slice(0, 6).map(area =>
      `${area.name}: ${area.strength}/56 points`
    ).join('\n• ')}\n• [... and 6 more areas]`;
  }

  /**
   * Get Ashtakavarga system information
   * @returns {Object} System catalog
   */
  getAshtakavargaCatalog() {
    return {
      system_type: '64-point benefice analysis system',
      scope: 'Planetary beneficial influences across 12 zodiac signs',
      traditional_use: 'Advanced Vedic timing and area-specific strength analysis',
      calculation_method: 'Friendship, exaltation, trikona, and aspect-based scoring',
      max_score_per_rashi: '8 points (7 planets x maximum beneficial relationships)',
      interpretation: 'Higher scores indicate stronger benefic influences in that area',
      modern_application: 'Career timing, marriage timing, health strengthening'
    };
  }
}

module.exports = { Ashtakavarga };