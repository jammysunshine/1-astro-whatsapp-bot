/**
 * Age Harmonic Astrology Reader
 * Analyzes life stages through harmonic divisions of lifespan
 */

const logger = require('../../utils/logger');

class AgeHarmonicAstrologyReader {
  constructor() {
    logger.info('Module: AgeHarmonicAstrologyReader loaded.');

    // Harmonic periods and their meanings
    this.harmonicPeriods = {
      1: {
        name: 'Fundamental Period',
        description: 'Basic life foundation and identity',
        ageRange: '0-1 years',
        themes: ['Foundation', 'Identity', 'Survival']
      },
      2: {
        name: 'Opposition Period',
        description: 'Balancing and integration phase',
        ageRange: '1-2 years',
        themes: ['Independence', 'Balance', 'Integration']
      },
      3: {
        name: 'Trine Period',
        description: 'Creative expression and growth',
        ageRange: '2-3 years',
        themes: ['Creativity', 'Expression', 'Growth']
      },
      4: {
        name: 'Square Period',
        description: 'Challenge and transformation',
        ageRange: '3-4 years',
        themes: ['Challenge', 'Structure', 'Transformation']
      },
      5: {
        name: 'Quintile Period',
        description: 'Innovation and change',
        ageRange: '4-5 years',
        themes: ['Innovation', 'Change', 'Learning']
      },
      6: {
        name: 'Sextile Period',
        description: 'Harmony and cooperation',
        ageRange: '5-6 years',
        themes: ['Harmony', 'Cooperation', 'Balance']
      },
      7: {
        name: 'Septile Period',
        description: 'Spiritual awareness and introspection',
        ageRange: '6-7 years',
        themes: ['Spirituality', 'Introspection', 'Wisdom']
      },
      8: {
        name: 'Octile Period',
        description: 'Power and transformation',
        ageRange: '7-8 years',
        themes: ['Power', 'Transformation', 'Regeneration']
      },
      9: {
        name: 'Novile Period',
        description: 'Completion and new beginnings',
        ageRange: '8-9 years',
        themes: ['Completion', 'New Beginnings', 'Fulfillment']
      },
      12: {
        name: 'Duodecile Period',
        description: 'Karmic lessons and spiritual growth',
        ageRange: '9-12 years',
        themes: ['Karma', 'Spiritual Growth', 'Life Lessons']
      },
      18: {
        name: 'Semi-Novile Period',
        description: 'Maturation and responsibility',
        ageRange: '12-18 years',
        themes: ['Maturation', 'Responsibility', 'Independence']
      },
      24: {
        name: 'Vigintile Period',
        description: 'Career and life direction',
        ageRange: '18-24 years',
        themes: ['Career', 'Direction', 'Exploration']
      },
      30: {
        name: 'Trigon Period',
        description: 'Mastery and achievement',
        ageRange: '24-30 years',
        themes: ['Mastery', 'Achievement', 'Stability']
      },
      36: {
        name: 'Tretrigonal Period',
        description: 'Mid-life transformation',
        ageRange: '30-36 years',
        themes: ['Transformation', 'Mid-life', 'Change']
      },
      45: {
        name: 'Quindecile Period',
        description: 'Wisdom and mentorship',
        ageRange: '36-45 years',
        themes: ['Wisdom', 'Mentorship', 'Legacy']
      },
      60: {
        name: 'Sexagesimal Period',
        description: 'Elder wisdom and completion',
        ageRange: '45-60 years',
        themes: ['Wisdom', 'Completion', 'Legacy']
      },
      72: {
        name: 'Septuagintal Period',
        description: 'Spiritual culmination',
        ageRange: '60-72 years',
        themes: ['Spirituality', 'Culmination', 'Transcendence']
      }
    };

    // Life stage harmonics based on common life cycles
    this.lifeStageHarmonics = {
      childhood: { harmonics: [1, 2, 3, 4, 5, 6, 7], ageRange: '0-12' },
      adolescence: { harmonics: [8, 12, 18], ageRange: '12-18' },
      young_adulthood: { harmonics: [24, 30], ageRange: '18-30' },
      midlife: { harmonics: [36, 45], ageRange: '30-45' },
      mature_adulthood: { harmonics: [60, 72], ageRange: '45-72' }
    };

    // Planetary harmonics and their influences
    this.planetaryHarmonics = {
      sun: {
        harmonics: [1, 3, 9, 12, 18],
        themes: ['Identity', 'Purpose', 'Life Direction']
      },
      moon: {
        harmonics: [2, 4, 6, 12, 24],
        themes: ['Emotions', 'Security', 'Nurturing']
      },
      mercury: {
        harmonics: [3, 5, 6, 12, 18],
        themes: ['Communication', 'Learning', 'Adaptability']
      },
      venus: {
        harmonics: [2, 3, 5, 6, 12],
        themes: ['Relationships', 'Values', 'Harmony']
      },
      mars: {
        harmonics: [4, 8, 12, 24, 36],
        themes: ['Action', 'Energy', 'Drive']
      },
      jupiter: {
        harmonics: [3, 9, 12, 18, 36],
        themes: ['Expansion', 'Wisdom', 'Growth']
      },
      saturn: {
        harmonics: [4, 8, 12, 24, 36],
        themes: ['Structure', 'Responsibility', 'Discipline']
      },
      uranus: {
        harmonics: [5, 8, 12, 18, 24],
        themes: ['Innovation', 'Freedom', 'Change']
      },
      neptune: {
        harmonics: [6, 12, 18, 24, 36],
        themes: ['Spirituality', 'Dreams', 'Imagination']
      },
      pluto: {
        harmonics: [8, 12, 18, 24, 36],
        themes: ['Transformation', 'Power', 'Regeneration']
      }
    };
  }

  /**
   * Generate age harmonic astrology analysis
   * @param {Object} birthData - Birth data object
   * @param {number} currentAge - Current age (optional, will calculate if not provided)
   * @returns {Object} Age harmonic analysis
   */
  async generateAgeHarmonicAnalysis(birthData, currentAge = null) {
    try {
      const { birthDate, birthTime, name, birthPlace } = birthData;

      // Calculate current age if not provided
      const age = currentAge || this.calculateCurrentAge(birthDate);

      // Get planetary positions
      const planetaryPositions = await this.getPlanetaryPositions(
        birthDate,
        birthTime,
        birthPlace
      );

      // Calculate harmonic periods for current age
      const currentHarmonics = this.calculateHarmonicPeriods(age);

      // Analyze planetary harmonics
      const planetaryHarmonics = this.analyzePlanetaryHarmonics(
        planetaryPositions,
        age
      );

      // Determine life stage
      const lifeStage = this.determineLifeStage(age);

      // Generate harmonic aspects
      const harmonicAspects = this.generateHarmonicAspects(
        planetaryPositions,
        currentHarmonics
      );

      // Create harmonic chart
      const harmonicChart = this.createHarmonicChart(
        planetaryPositions,
        currentHarmonics
      );

      // Generate interpretation
      const interpretation = this.generateHarmonicInterpretation(
        currentHarmonics,
        planetaryHarmonics,
        lifeStage,
        age
      );

      return {
        name,
        currentAge: age,
        lifeStage,
        currentHarmonics,
        planetaryHarmonics,
        harmonicAspects,
        harmonicChart,
        interpretation,
        nextHarmonic: this.getNextHarmonicPeriod(age),
        techniques: this.getHarmonicTechniques(),
        disclaimer:
          '⚠️ *Age Harmonic Astrology Disclaimer:* Harmonic analysis divides life into rhythmic cycles. This is an interpretive technique that should complement, not replace, traditional astrological analysis.'
      };
    } catch (error) {
      logger.error('Error generating age harmonic analysis:', error);
      return {
        error: 'Unable to generate age harmonic astrology analysis',
        fallback: 'Age harmonics reveal life rhythms and developmental cycles'
      };
    }
  }

  /**
   * Calculate current age from birth date
   * @param {string} birthDate - Birth date (DD/MM/YYYY)
   * @returns {number} Current age in years
   */
  calculateCurrentAge(birthDate) {
    const [day, month, year] = birthDate.split('/').map(Number);
    const birth = new Date(year, month - 1, day);
    const today = new Date();

    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  }

  /**
   * Get planetary positions for harmonic analysis
   * @param {string} birthDate - Birth date
   * @param {string} birthTime - Birth time
   * @param {string} birthPlace - Birth place
   * @returns {Object} Planetary positions
   */
  async getPlanetaryPositions(birthDate, birthTime, birthPlace) {
    try {
      const vedicCalc = require('./vedic/VedicCalculator');
      return await vedicCalc.calculatePlanetaryPositions(
        birthDate,
        birthTime,
        birthPlace
      );
    } catch (error) {
      logger.error('Error getting planetary positions:', error);
      return {};
    }
  }

  /**
   * Calculate harmonic periods for a given age
   * @param {number} age - Current age
   * @returns {Array} Active harmonic periods
   */
  calculateHarmonicPeriods(age) {
    const harmonics = [];

    // Check each harmonic period
    Object.entries(this.harmonicPeriods).forEach(([harmonic, data]) => {
      const harmonicNum = parseInt(harmonic);
      const periodStart = harmonicNum - 1;
      const periodEnd = harmonicNum;

      if (age >= periodStart && age < periodEnd) {
        harmonics.push({
          harmonic: harmonicNum,
          name: data.name,
          description: data.description,
          ageRange: data.ageRange,
          themes: data.themes,
          progress: ((age - periodStart) / (periodEnd - periodStart)) * 100
        });
      }
    });

    // Also check for longer-term harmonics that are still active
    [12, 18, 24, 30, 36, 45, 60, 72].forEach(harmonic => {
      if (age < harmonic) {
        const periodStart = harmonic - harmonic / 12; // Approximate start
        if (age >= periodStart) {
          const data = this.harmonicPeriods[harmonic];
          if (data) {
            harmonics.push({
              harmonic,
              name: data.name,
              description: data.description,
              ageRange: data.ageRange,
              themes: data.themes,
              progress: ((age - periodStart) / (harmonic - periodStart)) * 100
            });
          }
        }
      }
    });

    return harmonics.slice(0, 5); // Return top 5 most relevant harmonics
  }

  /**
   * Analyze planetary harmonics for current age
   * @param {Object} planetaryPositions - Planetary positions
   * @param {number} age - Current age
   * @returns {Object} Planetary harmonic analysis
   */
  analyzePlanetaryHarmonics(planetaryPositions, age) {
    const analysis = {};

    Object.entries(this.planetaryHarmonics).forEach(([planet, data]) => {
      const planetData = planetaryPositions[planet];
      if (planetData) {
        // Find active harmonics for this planet
        const activeHarmonics = data.harmonics.filter(h => {
          const periodStart = h - 1;
          const periodEnd = h;
          return age >= periodStart && age < periodEnd;
        });

        if (activeHarmonics.length > 0) {
          analysis[planet] = {
            harmonics: activeHarmonics,
            themes: data.themes,
            sign: planetData.sign,
            house: planetData.house,
            influence: this.getPlanetaryHarmonicInfluence(
              planet,
              activeHarmonics,
              age
            )
          };
        }
      }
    });

    return analysis;
  }

  /**
   * Get planetary harmonic influence description
   * @param {string} planet - Planet name
   * @param {Array} harmonics - Active harmonics
   * @param {number} age - Current age
   * @returns {string} Influence description
   */
  getPlanetaryHarmonicInfluence(planet, harmonics, age) {
    const planetNames = {
      sun: 'identity and purpose',
      moon: 'emotions and security',
      mercury: 'communication and learning',
      venus: 'relationships and values',
      mars: 'action and energy',
      jupiter: 'growth and wisdom',
      saturn: 'structure and responsibility',
      uranus: 'innovation and freedom',
      neptune: 'spirituality and dreams',
      pluto: 'transformation and power'
    };

    const planetTheme = planetNames[planet] || planet;
    const harmonicStr = harmonics.join(', ');

    return `Harmonic ${harmonicStr} activation of ${planetTheme}`;
  }

  /**
   * Determine life stage based on age
   * @param {number} age - Current age
   * @returns {Object} Life stage information
   */
  determineLifeStage(age) {
    if (age < 12) {
      return { stage: 'childhood', ...this.lifeStageHarmonics.childhood };
    }
    if (age < 18) {
      return { stage: 'adolescence', ...this.lifeStageHarmonics.adolescence };
    }
    if (age < 30) {
      return {
        stage: 'young_adulthood',
        ...this.lifeStageHarmonics.young_adulthood
      };
    }
    if (age < 45) {
      return { stage: 'midlife', ...this.lifeStageHarmonics.midlife };
    }
    return {
      stage: 'mature_adulthood',
      ...this.lifeStageHarmonics.mature_adulthood
    };
  }

  /**
   * Generate harmonic aspects between planets
   * @param {Object} planetaryPositions - Planetary positions
   * @param {Array} currentHarmonics - Current harmonic periods
   * @returns {Array} Harmonic aspects
   */
  generateHarmonicAspects(planetaryPositions, currentHarmonics) {
    const aspects = [];
    const planets = Object.keys(planetaryPositions);

    // Create harmonic positions by dividing longitudes
    currentHarmonics.forEach(harmonic => {
      const harmonicPositions = {};

      planets.forEach(planet => {
        const originalPos = planetaryPositions[planet].longitude;
        harmonicPositions[planet] = (originalPos * harmonic.harmonic) % 360;
      });

      // Find aspects in harmonic chart
      for (let i = 0; i < planets.length; i++) {
        for (let j = i + 1; j < planets.length; j++) {
          const planet1 = planets[i];
          const planet2 = planets[j];

          const pos1 = harmonicPositions[planet1];
          const pos2 = harmonicPositions[planet2];

          const aspect = this.findHarmonicAspect(pos1, pos2);
          if (aspect) {
            aspects.push({
              harmonic: harmonic.harmonic,
              planets: [planet1, planet2],
              aspect: aspect.type,
              orb: aspect.orb,
              significance: `Harmonic ${harmonic.harmonic} ${aspect.type} between ${planet1} and ${planet2}`
            });
          }
        }
      }
    });

    return aspects.slice(0, 8); // Return most significant aspects
  }

  /**
   * Find aspect between two harmonic positions
   * @param {number} pos1 - First position
   * @param {number} pos2 - Second position
   * @returns {Object|null} Aspect information
   */
  findHarmonicAspect(pos1, pos2) {
    const diff = Math.abs(pos1 - pos2);
    const normalizedDiff = Math.min(diff, 360 - diff);

    const aspects = [
      { type: 'conjunction', angle: 0, orb: 8 },
      { type: 'sextile', angle: 60, orb: 6 },
      { type: 'square', angle: 90, orb: 8 },
      { type: 'trine', angle: 120, orb: 8 },
      { type: 'opposition', angle: 180, orb: 10 }
    ];

    for (const aspect of aspects) {
      if (Math.abs(normalizedDiff - aspect.angle) <= aspect.orb) {
        return {
          type: aspect.type,
          orb: Math.abs(normalizedDiff - aspect.angle)
        };
      }
    }

    return null;
  }

  /**
   * Create harmonic chart visualization
   * @param {Object} planetaryPositions - Original planetary positions
   * @param {Array} currentHarmonics - Current harmonic periods
   * @returns {Object} Harmonic chart data
   */
  createHarmonicChart(planetaryPositions, currentHarmonics) {
    const chart = {};

    currentHarmonics.forEach(harmonic => {
      chart[harmonic.harmonic] = {
        name: harmonic.name,
        description: harmonic.description,
        planetaryPositions: {}
      };

      Object.entries(planetaryPositions).forEach(([planet, data]) => {
        const harmonicLongitude = (data.longitude * harmonic.harmonic) % 360;
        chart[harmonic.harmonic].planetaryPositions[planet] = {
          originalLongitude: data.longitude,
          harmonicLongitude,
          harmonicSign: this.getZodiacSign(harmonicLongitude),
          originalSign: data.sign
        };
      });
    });

    return chart;
  }

  /**
   * Get zodiac sign from longitude
   * @param {number} longitude - Longitude in degrees
   * @returns {string} Zodiac sign
   */
  getZodiacSign(longitude) {
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
    const signIndex = Math.floor(longitude / 30) % 12;
    return signs[signIndex];
  }

  /**
   * Generate harmonic interpretation
   * @param {Array} currentHarmonics - Current harmonic periods
   * @param {Object} planetaryHarmonics - Planetary harmonic analysis
   * @param {Object} lifeStage - Life stage information
   * @param {number} age - Current age
   * @returns {string} Interpretation
   */
  generateHarmonicInterpretation(
    currentHarmonics,
    planetaryHarmonics,
    lifeStage,
    age
  ) {
    let interpretation = '';

    // Current harmonic periods
    if (currentHarmonics.length > 0) {
      interpretation += `At age ${age}, you are in ${currentHarmonics.map(h => `harmonic ${h.harmonic} (${h.name})`).join(' and ')}. `;
    }

    // Life stage context
    interpretation += `This falls within the ${lifeStage.stage.replace('_', ' ')} phase, emphasizing ${lifeStage.harmonics.join(', ')} harmonics. `;

    // Planetary harmonics
    const activePlanets = Object.keys(planetaryHarmonics);
    if (activePlanets.length > 0) {
      interpretation += `Key planetary harmonics active: ${activePlanets.slice(0, 3).join(', ')}. `;
    }

    // Age-specific insights
    if (age < 12) {
      interpretation +=
        'Focus on foundational development and learning life rhythms. ';
    } else if (age < 18) {
      interpretation += 'Emphasize identity formation and future direction. ';
    } else if (age < 30) {
      interpretation += 'Build skills and establish life patterns. ';
    } else if (age < 45) {
      interpretation += 'Focus on career and relationship development. ';
    } else {
      interpretation += 'Emphasize wisdom sharing and life completion. ';
    }

    return interpretation;
  }

  /**
   * Get next harmonic period
   * @param {number} age - Current age
   * @returns {Object} Next harmonic period
   */
  getNextHarmonicPeriod(age) {
    const harmonics = Object.keys(this.harmonicPeriods)
      .map(h => parseInt(h))
      .sort((a, b) => a - b);

    const nextHarmonic = harmonics.find(h => h > age);
    if (nextHarmonic) {
      return {
        harmonic: nextHarmonic,
        ...this.harmonicPeriods[nextHarmonic],
        yearsUntil: nextHarmonic - age
      };
    }

    return null;
  }

  /**
   * Get available harmonic techniques
   * @returns {Array} List of techniques
   */
  getHarmonicTechniques() {
    return [
      'Harmonic Periods - Life stage analysis through mathematical divisions',
      'Planetary Harmonics - Planet-specific rhythmic activations',
      'Life Stage Harmonics - Developmental phase analysis',
      'Harmonic Aspects - Relationships between harmonic positions',
      'Harmonic Charts - Visual representation of life rhythms',
      'Age Progression - How harmonics change through life'
    ];
  }
}

module.exports = AgeHarmonicAstrologyReader;
