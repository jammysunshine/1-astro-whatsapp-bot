/**
 * Jaimini Astrology Service
 * Implements Jaimini system of Vedic astrology with Chara Karakas, Rasi aspects, and special combinations
 */

const ServiceTemplate = require('../serviceTemplate');
const VedicCalculator = require('../../../services/astrology/vedic/calculators');
const { validateCoordinates, validateDateTime } = require('../../../utils/validation');
const { formatDegree, formatTime } = require('../../../utils/formatters');

class JaiminiAstrologyService extends ServiceTemplate {
  constructor() {
    super('JaiminiAstrology', {
      description: 'Jaimini system astrology with Chara Karakas and special techniques',
      version: '1.0.0',
      author: 'Vedic Astrology System',
      category: 'vedic',
      requiresLocation: true,
      requiresDateTime: true,
      supportedLanguages: ['en', 'hi', 'sa'],
      features: [
        'chara_karakas',
        'sthira_karakas', 
        'rasi_aspects',
        'pada_analysis',
        'argala',
        'iṣṭa_kaṣṭa',
        'upapada_analysis',
        'arudha_calculation'
      ]
    });
  }

  /**
   * Calculate Chara Karakas (variable significators)
   */
  calculateCharaKarakas(chart) {
    const planets = [
      { name: 'Sun', longitude: chart.sun },
      { name: 'Moon', longitude: chart.moon },
      { name: 'Mars', longitude: chart.mars },
      { name: 'Mercury', longitude: chart.mercury },
      { name: 'Jupiter', longitude: chart.jupiter },
      { name: 'Saturn', longitude: chart.saturn },
      { name: 'Rahu', longitude: chart.rahu },
      { name: 'Ketu', longitude: chart.ketu }
    ];

    // Sort by longitude (descending for Chara Karakas)
    const sortedPlanets = planets.sort((a, b) => b.longitude - a.longitude);
    
    const charaKarakas = {
      AtmaKaraka: sortedPlanets[0]?.name || 'Sun',
      AmatyaKaraka: sortedPlanets[1]?.name || 'Moon',
      BhratriKaraka: sortedPlanets[2]?.name || 'Mars',
      MatriKaraka: sortedPlanets[3]?.name || 'Mercury',
      PitriKaraka: sortedPlanets[4]?.name || 'Jupiter',
      PutraKaraka: sortedPlanets[5]?.name || 'Saturn',
      GnatiKaraka: sortedPlanets[6]?.name || 'Rahu',
      DaraKaraka: sortedPlanets[7]?.name || 'Ketu'
    };

    return charaKarakas;
  }

  /**
   * Calculate Sthira Karakas (fixed significators)
   */
  calculateSthiraKarakas(chart) {
    const sthiraKarakas = {
      MatriKaraka: 'Moon',
      PitriKaraka: 'Sun',
      AmatyaKaraka: 'Jupiter',
      BhratriKaraka: 'Mars',
      PutraKaraka: 'Saturn',
      GnatiKaraka: 'Mercury',
      DaraKaraka: 'Venus'
    };
    return sthiraKarakas;
  }

  /**
   * Calculate Rasi aspects according to Jaimini system
   */
  calculateRasiAspects(rasi) {
    const aspects = {
      Aries: ['Cancer', 'Leo', 'Scorpio', 'Aquarius'],
      Taurus: ['Leo', 'Virgo', 'Sagittarius', 'Pisces'],
      Gemini: ['Virgo', 'Libra', 'Capricorn', 'Aries'],
      Cancer: ['Libra', 'Scorpio', 'Aquarius', 'Taurus'],
      Leo: ['Scorpio', 'Sagittarius', 'Pisces', 'Gemini'],
      Virgo: ['Sagittarius', 'Capricorn', 'Aries', 'Cancer'],
      Libra: ['Capricorn', 'Aquarius', 'Taurus', 'Leo'],
      Scorpio: ['Aquarius', 'Pisces', 'Gemini', 'Virgo'],
      Sagittarius: ['Pisces', 'Aries', 'Cancer', 'Libra'],
      Capricorn: ['Aries', 'Taurus', 'Leo', 'Scorpio'],
      Aquarius: ['Taurus', 'Gemini', 'Virgo', 'Sagittarius'],
      Pisces: ['Gemini', 'Cancer', 'Libra', 'Capricorn']
    };
    return aspects[rasi] || [];
  }

  /**
   * Calculate Pada (Arudha Pada) for each house
   */
  calculatePada(chart) {
    const pada = {};
    const houseLords = this.calculateHouseLords(chart);
    
    for (let house = 1; house <= 12; house++) {
      const lord = houseLords[house];
      const lordPosition = this.getPlanetPosition(chart, lord);
      const housesFromLord = ((house - 1 + lordPosition) % 12) + 1;
      
      // Pada is counted from lord's position as many houses as the lord is away from the house
      pada[house] = ((lordPosition + housesFromLord - 1) % 12) + 1;
    }
    
    return pada;
  }

  /**
   * Calculate Argala (intervention) for planets
   */
  calculateArgala(chart, planet) {
    const planetPosition = this.getPlanetPosition(chart, planet);
    const argalaPositions = {
      primary: [(planetPosition + 2) % 12 + 1, (planetPosition + 4) % 12 + 1, (planetPosition + 11) % 12 + 1],
      secondary: [(planetPosition + 5) % 12 + 1, (planetPosition + 8) % 12 + 1]
    };
    return argalaPositions;
  }

  /**
   * Calculate Ishta and Kashta (spiritual and material strength)
   */
  calculateIshtaKashta(chart) {
    const atmaKaraka = this.calculateCharaKarakas(chart).AtmaKaraka;
    const akPosition = this.getPlanetPosition(chart, atmaKaraka);
    const moonPosition = this.getPlanetPosition(chart, 'Moon');
    
    const ishta = ((akPosition - moonPosition + 12) % 12) * 3 + 30;
    const kashta = ((moonPosition - akPosition + 12) % 12) * 3 + 30;
    
    return { ishta, kashta };
  }

  /**
   * Calculate Upapada (Guru Pada) for marriage analysis
   */
  calculateUpapada(chart) {
    const pada = this.calculatePada(chart);
    const twelfthLord = this.getLordOfHouse(chart, 12);
    const twelfthLordPosition = this.getPlanetPosition(chart, twelfthLord);
    
    // Upapada is Pada of 12th house
    const upapada = pada[12];
    return upapada;
  }

  /**
   * Calculate Arudha Lagna
   */
  calculateArudhaLagna(chart) {
    const ascendant = chart.ascendant;
    const ascendantLord = this.getLordOfHouse(chart, 1);
    const lordPosition = this.getPlanetPosition(chart, ascendantLord);
    
    // Count from ascendant as many houses as the lord is away
    const arudhaLagna = ((ascendant - 1 + lordPosition - 1) % 12) + 1;
    
    // Exception: if Arudha Lagna is in 1st or 7th from ascendant, add 10 houses
    const distanceFromAsc = ((arudhaLagna - ascendant + 12) % 12);
    if (distanceFromAsc === 0 || distanceFromAsc === 6) {
      return ((arudhaLagna + 9) % 12) + 1;
    }
    
    return arudhaLagna;
  }

  /**
   * Get planet position in houses
   */
  getPlanetPosition(chart, planet) {
    const planetLongitudes = {
      Sun: chart.sun,
      Moon: chart.moon,
      Mars: chart.mars,
      Mercury: chart.mercury,
      Jupiter: chart.jupiter,
      Venus: chart.venus,
      Saturn: chart.saturn,
      Rahu: chart.rahu,
      Ketu: chart.ketu
    };
    
    const longitude = planetLongitudes[planet] || 0;
    return Math.floor(longitude / 30) + 1;
  }

  /**
   * Calculate house lords
   */
  calculateHouseLords(chart) {
    const ascendant = Math.floor(chart.ascendant / 30) * 30;
    const houseLords = {};
    
    const lordMap = {
      Aries: 'Mars',
      Taurus: 'Venus',
      Gemini: 'Mercury',
      Cancer: 'Moon',
      Leo: 'Sun',
      Virgo: 'Mercury',
      Libra: 'Venus',
      Scorpio: 'Mars',
      Sagittarius: 'Jupiter',
      Capricorn: 'Saturn',
      Aquarius: 'Saturn',
      Pisces: 'Jupiter'
    };
    
    for (let house = 1; house <= 12; house++) {
      const houseLongitude = (ascendant + (house - 1) * 30) % 360;
      const sign = this.getLongitudeSign(houseLongitude);
      houseLords[house] = lordMap[sign];
    }
    
    return houseLords;
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
   * Get lord of a house
   */
  getLordOfHouse(chart, house) {
    const houseLords = this.calculateHouseLords(chart);
    return houseLords[house];
  }

  /**
   * Main calculation method
   */
  async calculate(userData, options = {}) {
    try {
      this.validateInput(userData);
      
      const { datetime, latitude, longitude } = userData;
      const chart = await VedicCalculator.calculateChart(datetime, latitude, longitude);
      
      const charaKarakas = this.calculateCharaKarakas(chart);
      const sthiraKarakas = this.calculateSthiraKarakas(chart);
      const arudhaLagna = this.calculateArudhaLagna(chart);
      const pada = this.calculatePada(chart);
      const upapada = this.calculateUpapada(chart);
      const ishtaKashta = this.calculateIshtaKashta(chart);
      
      const analysis = {
        charaKarakas,
        sthiraKarakas,
        arudhaLagna,
        pada,
        upapada,
        ishtaKashta,
        interpretations: this.generateInterpretations({
          charaKarakas,
          arudhaLagna,
          upapada,
          ishtaKashta,
          chart
        })
      };
      
      return this.formatOutput(analysis, options.language || 'en');
      
    } catch (error) {
      throw new Error(`Jaimini calculation failed: ${error.message}`);
    }
  }

  /**
   * Generate interpretations
   */
  generateInterpretations(data) {
    const { charaKarakas, arudhaLagna, upapada, ishtaKashta, chart } = data;
    
    const interpretations = {
      atmaKaraka: this.interpretAtmaKaraka(charaKarakas.AtmaKaraka),
      arudhaLagna: this.interpretArudhaLagna(arudhaLagna),
      upapada: this.interpretUpapada(upapada),
      ishtaKashta: this.interpretIshtaKashta(ishtaKashta),
      overall: this.generateOverallAnalysis(data)
    };
    
    return interpretations;
  }

  /**
   * Interpret Atma Karaka
   */
  interpretAtmaKaraka(planet) {
    const interpretations = {
      Sun: 'Strong leadership qualities, soul purpose connected to authority and self-expression',
      Moon: 'Emotional depth, nurturing nature, soul purpose through emotional intelligence',
      Mars: 'Courage and initiative, soul purpose through action and competition',
      Mercury: 'Intellectual pursuits, communication skills, soul purpose through knowledge',
      Jupiter: 'Wisdom and teaching, soul purpose through spiritual guidance',
      Venus: 'Love and harmony, soul purpose through relationships and creativity',
      Saturn: 'Discipline and responsibility, soul purpose through hard work and service',
      Rahu: 'Unconventional path, soul purpose through breaking boundaries',
      Ketu: 'Spiritual liberation, soul purpose through detachment and enlightenment'
    };
    
    return interpretations[planet] || 'Unique soul journey';
  }

  /**
   * Interpret Arudha Lagna
   */
  interpretArudhaLagna(arudhaLagna) {
    const signs = [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    
    const sign = signs[arudhaLagna - 1];
    const interpretations = {
      Aries: 'Public image of leadership and initiative',
      Taurus: 'Public image of stability and material success',
      Gemini: 'Public image of communication and versatility',
      Cancer: 'Public image of nurturing and emotional connection',
      Leo: 'Public image of creativity and authority',
      Virgo: 'Public image of service and analytical ability',
      Libra: 'Public image of balance and social harmony',
      Scorpio: 'Public image of transformation and intensity',
      Sagittarius: 'Public image of wisdom and expansion',
      Capricorn: 'Public image of achievement and responsibility',
      Aquarius: 'Public image of innovation and humanitarianism',
      Pisces: 'Public image of compassion and spirituality'
    };
    
    return interpretations[sign] || 'Unique public perception';
  }

  /**
   * Interpret Upapada
   */
  interpretUpapada(upapada) {
    const signs = [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    
    const sign = signs[upapada - 1];
    const interpretations = {
      Aries: 'Active and passionate marriage partner',
      Taurus: 'Stable and committed marriage',
      Gemini: 'Communicative and versatile marriage',
      Cancer: 'Nurturing and emotional marriage',
      Leo: 'Proud and creative marriage',
      Virgo: 'Service-oriented and practical marriage',
      Libra: 'Balanced and harmonious marriage',
      Scorpio: 'Intense and transformative marriage',
      Sagittarius: 'Adventurous and philosophical marriage',
      Capricorn: 'Responsible and traditional marriage',
      Aquarius: 'Unconventional and intellectual marriage',
      Pisces: 'Spiritual and compassionate marriage'
    };
    
    return interpretations[sign] || 'Unique marriage dynamics';
  }

  /**
   * Interpret Ishta and Kashta
   */
  interpretIshtaKashta(ishtaKashta) {
    const { ishta, kashta } = ishtaKashta;
    
    let ishtaLevel = 'Low';
    let kashtaLevel = 'Low';
    
    if (ishta >= 165) ishtaLevel = 'Very High';
    else if (ishta >= 135) ishtaLevel = 'High';
    else if (ishta >= 105) ishtaLevel = 'Medium';
    
    if (kashta >= 165) kashtaLevel = 'Very High';
    else if (kashta >= 135) kashtaLevel = 'High';
    else if (kashta >= 105) kashtaLevel = 'Medium';
    
    return {
      ishta: `${ishtaLevel} spiritual strength (${ishta}°)`,
      kashta: `${kashtaLevel} material challenges (${kashta}°)`,
      balance: ishta > kashta ? 'Spiritual inclination dominates' : 'Material focus dominates'
    };
  }

  /**
   * Generate overall analysis
   */
  generateOverallAnalysis(data) {
    const { charaKarakas, arudhaLagna, ishtaKashta } = data;
    
    return {
      summary: `Jaimini analysis reveals ${charaKarakas.AtmaKaraka} as Atma Karaka, indicating your soul's primary focus.`,
      strengths: this.identifyStrengths(data),
      challenges: this.identifyChallenges(data),
      recommendations: this.generateRecommendations(data)
    };
  }

  /**
   * Identify strengths
   */
  identifyStrengths(data) {
    const strengths = [];
    const { charaKarakas, ishtaKashta } = data;
    
    if (ishtaKashta.ishta > 120) {
      strengths.push('Strong spiritual foundation and inner guidance');
    }
    
    if (charaKarakas.AtmaKaraka === 'Jupiter' || charaKarakas.AtmaKaraka === 'Sun') {
      strengths.push('Natural leadership and wisdom qualities');
    }
    
    return strengths;
  }

  /**
   * Identify challenges
   */
  identifyChallenges(data) {
    const challenges = [];
    const { ishtaKashta } = data;
    
    if (ishtaKashta.kashta > 120) {
      challenges.push('Material obstacles requiring patience and perseverance');
    }
    
    return challenges;
  }

  /**
   * Generate recommendations
   */
  generateRecommendations(data) {
    const recommendations = [];
    const { charaKarakas, ishtaKashta } = data;
    
    if (ishtaKashta.ishta > ishtaKashta.kashta) {
      recommendations.push('Focus on spiritual practices and inner development');
    } else {
      recommendations.push('Balance material pursuits with spiritual awareness');
    }
    
    const akRemedies = {
      Sun: 'Practice self-discipline and leadership',
      Moon: 'Develop emotional intelligence and nurturing',
      Mars: 'Channel energy constructively',
      Mercury: 'Pursue knowledge and communication skills',
      Jupiter: 'Study philosophy and teach others',
      Venus: 'Cultivate relationships and artistic expression',
      Saturn: 'Embrace responsibility and service',
      Rahu: 'Explore unconventional paths wisely',
      Ketu: 'Practice detachment and meditation'
    };
    
    recommendations.push(akRemedies[charaKarakas.AtmaKaraka] || 'Follow your inner guidance');
    
    return recommendations;
  }

  /**
   * Format output for display
   */
  formatOutput(analysis, language = 'en') {
    const translations = {
      en: {
        title: 'Jaimini Astrology Analysis',
        charaKarakas: 'Chara Karakas (Variable Significators)',
        sthiraKarakas: 'Sthira Karakas (Fixed Significators)',
        arudhaLagna: 'Arudha Lagna (Public Image)',
        pada: 'Pada (Arudha Padas)',
        upapada: 'Upapada (Marriage Indicator)',
        ishtaKashta: 'Ishta-Kashta (Spiritual-Material Balance)',
        interpretations: 'Interpretations',
        atmaKaraka: 'Atma Karaka (Soul Significator)',
        overallAnalysis: 'Overall Analysis',
        strengths: 'Strengths',
        challenges: 'Challenges',
        recommendations: 'Recommendations'
      },
      hi: {
        title: 'जैमिनी ज्योतिष विश्लेषण',
        charaKarakas: 'चर कारक (परिवर्तनशील कारक)',
        sthiraKarakas: 'स्थिर कारक (स्थिर कारक)',
        arudhaLagna: 'आरूढ लग्न (सार्वजनिक छवि)',
        pada: 'पद (आरूढ पद)',
        upapada: 'उपपद (विवाह सूचक)',
        ishtaKashta: 'इष्ट-कष्ट (आध्यात्मिक-भौतिक संतुलन)',
        interpretations: 'व्याख्या',
        atmaKaraka: 'आत्मा कारक (आत्मा कारक)',
        overallAnalysis: 'समग्र विश्लेषण',
        strengths: 'शक्तियां',
        challenges: 'चुनौतियां',
        recommendations: 'सिफारिशें'
      }
    };
    
    const t = translations[language] || translations.en;
    
    return {
      metadata: this.getMetadata(),
      analysis: {
        title: t.title,
        sections: {
          [t.charaKarakas]: analysis.charaKarakas,
          [t.sthiraKarakas]: analysis.sthiraKarakas,
          [t.arudhaLagna]: `House ${analysis.arudhaLagna}`,
          [t.upapada]: `House ${analysis.upapada}`,
          [t.ishtaKashta]: analysis.ishtaKashta,
          [t.interpretations]: analysis.interpretations
        }
      }
    };
  }
}

module.exports = new JaiminiAstrologyService();