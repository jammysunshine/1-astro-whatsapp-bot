/**
 * Composite Chart Service
 * Implements composite chart calculations for relationship analysis
 */

const ServiceTemplate = require('../serviceTemplate');
const VedicCalculator = require('../../services/astrology/vedic/calculators');
const { validateCoordinates, validateDateTime } = require('../../utils/validation');
const { formatDegree, formatTime } = require('../../utils/formatters');

class CompositeChartService extends ServiceTemplate {
  constructor() {
    super('CompositeChart', {
      description: 'Composite chart analysis for relationship compatibility and dynamics',
      version: '1.0.0',
      author: 'Vedic Astrology System',
      category: 'relationship',
      requiresLocation: true,
      requiresDateTime: true,
      supportedLanguages: ['en', 'hi', 'sa'],
      features: [
        'composite_chart_generation',
        'relationship_aspects',
        'composite_house_analysis',
        'relationship_dynamics',
        'compatibility_analysis',
        'relationship_challenges',
        'relationship_strengths',
        'composite_interpretations'
      ]
    });
  }

  /**
   * Calculate composite chart between two people
   */
  async calculateCompositeChart(person1Data, person2Data) {
    const chart1 = await VedicCalculator.calculateChart(
      person1Data.datetime, 
      person1Data.latitude, 
      person1Data.longitude
    );
    
    const chart2 = await VedicCalculator.calculateChart(
      person2Data.datetime, 
      person2Data.latitude, 
      person2Data.longitude
    );
    
    // Calculate composite positions (midpoints)
    const compositeChart = {
      sun: this.calculateMidpoint(chart1.sun, chart2.sun),
      moon: this.calculateMidpoint(chart1.moon, chart2.moon),
      mercury: this.calculateMidpoint(chart1.mercury, chart2.mercury),
      venus: this.calculateMidpoint(chart1.venus, chart2.venus),
      mars: this.calculateMidpoint(chart1.mars, chart2.mars),
      jupiter: this.calculateMidpoint(chart1.jupiter, chart2.jupiter),
      saturn: this.calculateMidpoint(chart1.saturn, chart2.saturn),
      rahu: this.calculateMidpoint(chart1.rahu, chart2.rahu),
      ketu: this.calculateMidpoint(chart1.ketu, chart2.ketu),
      ascendant: this.calculateMidpoint(chart1.ascendant, chart2.ascendant),
      mc: this.calculateMidpoint(chart1.mc, chart2.mc)
    };
    
    return compositeChart;
  }

  /**
   * Calculate midpoint between two longitudes
   */
  calculateMidpoint(long1, long2) {
    const diff = Math.abs(long1 - long2);
    const avg = (long1 + long2) / 2;
    
    // Handle wrap-around at 360 degrees
    if (diff > 180) {
      return (avg + 180) % 360;
    }
    
    return avg;
  }

  /**
   * Calculate composite aspects
   */
  calculateCompositeAspects(compositeChart) {
    const aspects = [];
    const planets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];
    
    for (let i = 0; i < planets.length; i++) {
      for (let j = i + 1; j < planets.length; j++) {
        const planet1 = planets[i];
        const planet2 = planets[j];
        const long1 = compositeChart[planet1];
        const long2 = compositeChart[planet2];
        
        const aspect = this.calculateAspect(long1, long2);
        if (aspect.aspect !== 'none') {
          aspects.push({
            planet1: this.capitalizeFirst(planet1),
            planet2: this.capitalizeFirst(planet2),
            aspect: aspect.aspect,
            orb: aspect.orb,
            strength: aspect.strength,
            interpretation: this.getCompositeAspectInterpretation(planet1, planet2, aspect.aspect)
          });
        }
      }
    }
    
    return aspects;
  }

  /**
   * Calculate aspect between two longitudes
   */
  calculateAspect(long1, long2) {
    const diff = Math.abs(long1 - long2);
    const normalizedDiff = diff > 180 ? 360 - diff : diff;
    
    const aspects = [
      { type: 'conjunction', angle: 0, orb: 8 },
      { type: 'opposition', angle: 180, orb: 8 },
      { type: 'trine', angle: 120, orb: 8 },
      { type: 'square', angle: 90, orb: 8 },
      { type: 'sextile', angle: 60, orb: 6 }
    ];
    
    for (const aspect of aspects) {
      const angleDiff = Math.abs(normalizedDiff - aspect.angle);
      if (angleDiff <= aspect.orb) {
        return {
          aspect: aspect.type,
          orb: angleDiff,
          strength: Math.max(0, 100 - (angleDiff / aspect.orb) * 100)
        };
      }
    }
    
    return { aspect: 'none', orb: 0, strength: 0 };
  }

  /**
   * Get composite aspect interpretation
   */
  getCompositeAspectInterpretation(planet1, planet2, aspect) {
    const interpretations = {
      conjunction: {
        'sun-moon': 'Emotional and ego alignment, strong identity fusion',
        'sun-venus': 'Harmony in values and affection, shared aesthetic preferences',
        'moon-venus': 'Emotional compatibility, nurturing and affectionate bond',
        'venus-mars': 'Passionate attraction, romantic and sexual chemistry',
        'mercury-venus': 'Intellectual and aesthetic harmony, pleasant communication',
        'jupiter-venus': 'Optimistic and expansive relationship, shared values',
        'saturn-venus': 'Serious and committed relationship, lasting bond'
      },
      opposition: {
        'sun-moon': 'Complementary energies, balance between masculine and feminine',
        'sun-venus': 'Tension between self-expression and relationship harmony',
        'moon-venus': 'Emotional needs vs. relationship harmony challenges',
        'venus-mars': 'Sexual tension and attraction, passion vs. harmony',
        'mercury-venus': 'Intellectual vs. emotional communication styles',
        'jupiter-venus': 'Growth vs. pleasure seeking, expansion vs. comfort',
        'saturn-venus': 'Responsibility vs. pleasure, duty vs. enjoyment'
      },
      trine: {
        'sun-moon': 'Natural emotional and ego harmony, easy understanding',
        'sun-venus': 'Creative and harmonious self-expression in relationship',
        'moon-venus': 'Natural emotional and affectionate compatibility',
        'venus-mars': 'Harmonious passion and attraction, balanced sexuality',
        'mercury-venus': 'Easy and pleasant communication, intellectual harmony',
        'jupiter-venus': 'Optimistic and growth-oriented relationship',
        'saturn-venus': 'Stable and harmonious commitment, lasting values'
      },
      square: {
        'sun-moon': 'Ego vs. emotional needs, internal relationship tension',
        'sun-venus': 'Self-expression vs. relationship harmony conflicts',
        'moon-venus': 'Emotional needs vs. affection expression challenges',
        'venus-mars': 'Passion vs. harmony conflicts, sexual tension',
        'mercury-venus': 'Communication vs. affection expression issues',
        'jupiter-venus': 'Growth vs. pleasure seeking conflicts',
        'saturn-venus': 'Responsibility vs. enjoyment conflicts'
      },
      sextile: {
        'sun-moon': 'Supportive ego and emotional connection',
        'sun-venus': 'Creative self-expression supported by relationship',
        'moon-venus': 'Supportive emotional and affectionate connection',
        'venus-mars': 'Supportive passion and attraction dynamics',
        'mercury-venus': 'Supportive intellectual and affectionate communication',
        'jupiter-venus': 'Supportive growth and pleasure seeking',
        'saturn-venus': 'Supportive responsibility and enjoyment balance'
      }
    };
    
    const key = `${planet1}-${planet2}`;
    const reverseKey = `${planet2}-${planet1}`;
    
    return interpretations[aspect]?.[key] || 
           interpretations[aspect]?.[reverseKey] || 
           `Composite ${aspect} aspect between ${planet1} and ${planet2}`;
  }

  /**
   * Calculate composite house positions
   */
  calculateCompositeHouses(compositeChart) {
    const houses = [];
    const ascendant = compositeChart.ascendant;
    
    for (let house = 1; house <= 12; house++) {
      const houseCusp = (ascendant + (house - 1) * 30) % 360;
      const housePlanets = this.getPlanetsInHouse(compositeChart, houseCusp);
      
      houses.push({
        house,
        cusp: houseCusp,
        sign: this.getLongitudeSign(houseCusp),
        planets: housePlanets,
        interpretation: this.getCompositeHouseInterpretation(house, housePlanets)
      });
    }
    
    return houses;
  }

  /**
   * Get planets in a specific house
   */
  getPlanetsInHouse(compositeChart, houseCusp) {
    const planets = [];
    const planetNames = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];
    
    planetNames.forEach(planet => {
      const longitude = compositeChart[planet];
      const housePosition = this.getHousePosition(longitude, houseCusp);
      
      if (housePosition === 1) {
        planets.push(this.capitalizeFirst(planet));
      }
    });
    
    return planets;
  }

  /**
   * Get house position for a planet
   */
  getHousePosition(longitude, houseCusp) {
    const diff = (longitude - houseCusp + 360) % 360;
    return Math.floor(diff / 30) + 1;
  }

  /**
   * Get composite house interpretation
   */
  getCompositeHouseInterpretation(house, planets) {
    const interpretations = {
      1: 'Relationship identity and self-expression as a couple',
      2: 'Shared values, resources, and financial matters',
      3: 'Communication patterns, intellectual connection, and shared interests',
      4: 'Emotional foundation, home life, and family matters',
      5: 'Creativity, romance, and shared pleasures',
      6: 'Daily routines, work, and service to others',
      7: 'Partnership dynamics, balance, and relationship harmony',
      8: 'Transformation, intimacy, and shared resources',
      9: 'Shared beliefs, higher learning, and spiritual growth',
      10: 'Public image, career, and shared ambitions',
      11: 'Friendships, social networks, and shared goals',
      12: 'Spiritual connection, hidden matters, and endings'
    };
    
    const baseInterpretation = interpretations[house] || 'Relationship focus area';
    
    if (planets.length > 0) {
      return `${baseInterpretation} with emphasis on ${planets.join(', ')}`;
    }
    
    return baseInterpretation;
  }

  /**
   * Analyze relationship dynamics
   */
  analyzeRelationshipDynamics(compositeChart, aspects, houses) {
    const dynamics = {
      strengths: this.identifyStrengths(aspects, houses),
      challenges: this.identifyChallenges(aspects, houses),
      communication: this.analyzeCommunication(compositeChart, aspects),
      emotional: this.analyzeEmotional(compositeChart, aspects),
      passion: this.analyzePassion(compositeChart, aspects),
      stability: this.analyzeStability(compositeChart, aspects)
    };
    
    return dynamics;
  }

  /**
   * Identify relationship strengths
   */
  identifyStrengths(aspects, houses) {
    const strengths = [];
    
    // Harmonious aspects
    const harmoniousAspects = aspects.filter(a => 
      ['trine', 'sextile'].includes(a.aspect) && a.strength > 60
    );
    
    harmoniousAspects.forEach(aspect => {
      strengths.push(`Strong ${aspect.aspect} between ${aspect.planet1} and ${aspect.planet2}`);
    });
    
    // House strengths
    const firstHouse = houses.find(h => h.house === 1);
    if (firstHouse && firstHouse.planets.includes('Sun')) {
      strengths.push('Strong shared identity and purpose');
    }
    
    const seventhHouse = houses.find(h => h.house === 7);
    if (seventhHouse && seventhHouse.planets.includes('Venus')) {
      strengths.push('Natural harmony and partnership balance');
    }
    
    return strengths;
  }

  /**
   * Identify relationship challenges
   */
  identifyChallenges(aspects, houses) {
    const challenges = [];
    
    // Challenging aspects
    const challengingAspects = aspects.filter(a => 
      ['square', 'opposition'].includes(a.aspect) && a.strength > 60
    );
    
    challengingAspects.forEach(aspect => {
      challenges.push(`Tension between ${aspect.planet1} and ${aspect.planet2} (${aspect.aspect})`);
    });
    
    // House challenges
    const twelfthHouse = houses.find(h => h.house === 12);
    if (twelfthHouse && twelfthHouse.planets.length > 0) {
      challenges.push('Hidden or unconscious relationship dynamics');
    }
    
    return challenges;
  }

  /**
   * Analyze communication patterns
   */
  analyzeCommunication(compositeChart, aspects) {
    const mercuryAspects = aspects.filter(a => 
      a.planet1 === 'Mercury' || a.planet2 === 'Mercury'
    );
    
    const harmonious = mercuryAspects.filter(a => 
      ['trine', 'sextile'].includes(a.aspect)
    ).length;
    
    const challenging = mercuryAspects.filter(a => 
      ['square', 'opposition'].includes(a.aspect)
    ).length;
    
    if (harmonious > challenging) {
      return 'Harmonious communication with natural understanding';
    } else if (challenging > harmonious) {
      return 'Communication challenges requiring conscious effort';
    } else {
      return 'Balanced communication with both harmony and challenges';
    }
  }

  /**
   * Analyze emotional connection
   */
  analyzeEmotional(compositeChart, aspects) {
    const moonAspects = aspects.filter(a => 
      a.planet1 === 'Moon' || a.planet2 === 'Moon'
    );
    
    const harmonious = moonAspects.filter(a => 
      ['trine', 'sextile'].includes(a.aspect)
    ).length;
    
    const challenging = moonAspects.filter(a => 
      ['square', 'opposition'].includes(a.aspect)
    ).length;
    
    if (harmonious > challenging) {
      return 'Natural emotional harmony and understanding';
    } else if (challenging > harmonious) {
      return 'Emotional tensions requiring awareness and work';
    } else {
      return 'Complex emotional dynamics with growth potential';
    }
  }

  /**
   * Analyze passion and attraction
   */
  analyzePassion(compositeChart, aspects) {
    const venusAspects = aspects.filter(a => 
      a.planet1 === 'Venus' || a.planet2 === 'Venus'
    );
    
    const marsAspects = aspects.filter(a => 
      a.planet1 === 'Mars' || a.planet2 === 'Mars'
    );
    
    const venusMarsAspect = aspects.find(a => 
      (a.planet1 === 'Venus' && a.planet2 === 'Mars') ||
      (a.planet1 === 'Mars' && a.planet2 === 'Venus')
    );
    
    if (venusMarsAspect) {
      if (['conjunction', 'trine', 'sextile'].includes(venusMarsAspect.aspect)) {
        return 'Strong passion and romantic chemistry';
      } else {
        return 'Intense passion with some tension';
      }
    }
    
    return 'Moderate passion with room for growth';
  }

  /**
   * Analyze stability and commitment
   */
  analyzeStability(compositeChart, aspects) {
    const saturnAspects = aspects.filter(a => 
      a.planet1 === 'Saturn' || a.planet2 === 'Saturn'
    );
    
    const harmonious = saturnAspects.filter(a => 
      ['trine', 'sextile'].includes(a.aspect)
    ).length;
    
    const challenging = saturnAspects.filter(a => 
      ['square', 'opposition'].includes(a.aspect)
    ).length;
    
    if (harmonious > challenging) {
      return 'Natural stability and long-term commitment potential';
    } else if (challenging > harmonious) {
      return 'Stability challenges requiring conscious effort';
    } else {
      return 'Balanced stability with growth opportunities';
    }
  }

  /**
   * Get sign from longitude
   */
  getLongitudeSign(longitude) {
    const signs = [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    return signs[Math.floor(longitude / 30) % 12];
  }

  /**
   * Capitalize first letter
   */
  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Main calculation method
   */
  async calculate(userData, options = {}) {
    try {
      this.validateInput(userData);
      
      const { person1, person2 } = userData;
      
      if (!person1 || !person2) {
        throw new Error('Two people\'s data required for composite chart calculation');
      }
      
      const compositeChart = await this.calculateCompositeChart(person1, person2);
      const aspects = this.calculateCompositeAspects(compositeChart);
      const houses = this.calculateCompositeHouses(compositeChart);
      const dynamics = this.analyzeRelationshipDynamics(compositeChart, aspects, houses);
      
      const analysis = {
        compositeChart,
        aspects,
        houses,
        dynamics,
        interpretations: this.generateInterpretations({
          compositeChart,
          aspects,
          houses,
          dynamics
        })
      };
      
      return this.formatOutput(analysis, options.language || 'en');
      
    } catch (error) {
      throw new Error(`Composite chart calculation failed: ${error.message}`);
    }
  }

  /**
   * Generate interpretations
   */
  generateInterpretations(data) {
    const { compositeChart, aspects, houses, dynamics } = data;
    
    const interpretations = {
      overall: this.generateOverallAnalysis(data),
      relationship: this.generateRelationshipAnalysis(data),
      recommendations: this.generateRecommendations(data),
      compatibility: this.generateCompatibilityAnalysis(data)
    };
    
    return interpretations;
  }

  /**
   * Generate overall analysis
   */
  generateOverallAnalysis(data) {
    const { dynamics } = data;
    
    return {
      summary: 'Composite chart reveals the relationship as a unique entity with its own dynamics',
      strengths: dynamics.strengths,
      challenges: dynamics.challenges,
      growthAreas: this.identifyGrowthAreas(data)
    };
  }

  /**
   * Generate relationship analysis
   */
  generateRelationshipAnalysis(data) {
    const { dynamics } = data;
    
    return {
      communication: dynamics.communication,
      emotional: dynamics.emotional,
      passion: dynamics.passion,
      stability: dynamics.stability,
      overallDynamics: 'Complex interplay of energies creating unique relationship patterns'
    };
  }

  /**
   * Generate recommendations
   */
  generateRecommendations(data) {
    const recommendations = [];
    const { dynamics } = data;
    
    if (dynamics.communication.includes('challenges')) {
      recommendations.push('Focus on conscious communication and active listening');
    }
    
    if (dynamics.emotional.includes('tensions')) {
      recommendations.push('Work on emotional awareness and mutual understanding');
    }
    
    if (dynamics.stability.includes('challenges')) {
      recommendations.push('Build trust through consistency and reliability');
    }
    
    if (dynamics.passion.includes('room for growth')) {
      recommendations.push('Explore shared interests and creative activities together');
    }
    
    return recommendations;
  }

  /**
   * Generate compatibility analysis
   */
  generateCompatibilityAnalysis(data) {
    const { aspects, dynamics } = data;
    
    const harmoniousAspects = aspects.filter(a => 
      ['trine', 'sextile'].includes(a.aspect)
    ).length;
    
    const challengingAspects = aspects.filter(a => 
      ['square', 'opposition'].includes(a.aspect)
    ).length;
    
    let compatibilityLevel = 'Moderate';
    if (harmoniousAspects > challengingAspects * 1.5) {
      compatibilityLevel = 'High';
    } else if (challengingAspects > harmoniousAspects * 1.5) {
      compatibilityLevel = 'Challenging';
    }
    
    return {
      level: compatibilityLevel,
      harmony: harmoniousAspects,
      tension: challengingAspects,
      growth: 'Both harmony and tension provide opportunities for growth'
    };
  }

  /**
   * Identify growth areas
   */
  identifyGrowthAreas(data) {
    const growthAreas = [];
    const { dynamics } = data;
    
    if (dynamics.communication.includes('challenges')) {
      growthAreas.push('Communication and understanding');
    }
    
    if (dynamics.emotional.includes('tensions')) {
      growthAreas.push('Emotional connection and awareness');
    }
    
    if (dynamics.stability.includes('challenges')) {
      growthAreas.push('Trust and commitment building');
    }
    
    return growthAreas;
  }

  /**
   * Format output for display
   */
  formatOutput(analysis, language = 'en') {
    const translations = {
      en: {
        title: 'Composite Chart Analysis',
        compositeChart: 'Composite Chart',
        aspects: 'Composite Aspects',
        houses: 'Composite Houses',
        dynamics: 'Relationship Dynamics',
        interpretations: 'Interpretations',
        overallAnalysis: 'Overall Analysis',
        relationshipAnalysis: 'Relationship Analysis',
        recommendations: 'Recommendations',
        compatibilityAnalysis: 'Compatibility Analysis'
      },
      hi: {
        title: 'समग्र कुंडली विश्लेषण',
        compositeChart: 'समग्र कुंडली',
        aspects: 'समग्र पहलू',
        houses: 'समग्र भाव',
        dynamics: 'रिश्ते की गतिशीलता',
        interpretations: 'व्याख्या',
        overallAnalysis: 'समग्र विश्लेषण',
        relationshipAnalysis: 'रिश्ते का विश्लेषण',
        recommendations: 'सिफारिशें',
        compatibilityAnalysis: 'अनुकूलता विश्लेषण'
      }
    };
    
    const t = translations[language] || translations.en;
    
    return {
      metadata: this.getMetadata(),
      analysis: {
        title: t.title,
        sections: {
          [t.compositeChart]: analysis.compositeChart,
          [t.aspects]: analysis.aspects,
          [t.houses]: analysis.houses,
          [t.dynamics]: analysis.dynamics,
          [t.interpretations]: analysis.interpretations
        }
      }
    };
  }
}

module.exports = new CompositeChartService();