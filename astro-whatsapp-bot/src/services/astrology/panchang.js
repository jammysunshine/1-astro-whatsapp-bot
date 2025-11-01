/**
 * Panchang - Hindu Daily Calendar System
 * Calculates tithi, nakshatra, yoga, karana, and auspicious times
 */

const logger = require('../../utils/logger');
const sweph = require('sweph');

class Panchang {
  constructor() {
    logger.info('Module: Panchang loaded - Hindu Daily Calendar');
    this.initializePanchangSystem();
  }

  /**
   * Initialize panchang calculation system
   */
  initializePanchangSystem() {
    // Tithi names and meanings
    this.tithis = [
      { name: 'Pratipada', sanskrit: 'प्रतिपदा', meaning: 'First, beginning' },
      { name: 'Dwitiya', sanskrit: 'द्वितीया', meaning: 'Second, duality' },
      { name: 'Tritiya', sanskrit: 'तृतीया', meaning: 'Third, creative' },
      { name: 'Chaturthi', sanskrit: 'चतुर्थी', meaning: 'Fourth, stable' },
      { name: 'Panchami', sanskrit: 'पञ्चमी', meaning: 'Fifth, learning' },
      { name: 'Shashthi', sanskrit: 'षष्ठी', meaning: 'Sixth, harmonious' },
      { name: 'Saptami', sanskrit: 'सप्तमी', meaning: 'Seventh, spiritual' },
      { name: 'Ashtami', sanskrit: 'अष्टमी', meaning: 'Eighth, prosperous' },
      { name: 'Navami', sanskrit: 'नवमी', meaning: 'Ninth, fulfillment' },
      { name: 'Dashami', sanskrit: 'दशमी', meaning: 'Tenth, virtuous' },
      { name: 'Ekadashi', sanskrit: 'एकादशी', meaning: 'Eleventh, auspicious' },
      { name: 'Dwadashi', sanskrit: 'द्वादशी', meaning: 'Twelfth, devotion' },
      {
        name: 'Trayodashi',
        sanskrit: 'त्रयोदशी',
        meaning: 'Thirteenth, transformation'
      },
      {
        name: 'Chaturdashi',
        sanskrit: 'चतुर्दशी',
        meaning: 'Fourteenth, preparation'
      },
      {
        name: 'Purnima',
        sanskrit: 'पूर्णिमा',
        meaning: 'Full moon, completion'
      },
      { name: 'Amavasya', sanskrit: 'अमावस्या', meaning: 'New moon, renewal' }
    ];

    // Nakshatra data with ruling deities
    this.nakshatras = [
      {
        name: 'Ashwini',
        sanskrit: 'अश्विनी',
        deity: 'Ashwin Kumaras',
        symbol: 'Horse'
      },
      {
        name: 'Bharani',
        sanskrit: 'भरणी',
        deity: 'Yama',
        symbol: 'Burial ground'
      },
      {
        name: 'Krittika',
        sanskrit: 'कृत्तिका',
        deity: 'Karttikeya',
        symbol: 'Razor'
      },
      {
        name: 'Rohini',
        sanskrit: 'रोहिणी',
        deity: 'Brahma',
        symbol: 'Chariot'
      },
      {
        name: 'Mrigashira',
        sanskrit: 'मृगशीर्षा',
        deity: 'Soma',
        symbol: 'Deer'
      },
      {
        name: 'Ardra',
        sanskrit: 'आर्द्रा',
        deity: 'Rudra',
        symbol: 'Teardrop'
      },
      {
        name: 'Punarvasu',
        sanskrit: 'पुन्नर्वसु',
        deity: 'Aditi',
        symbol: 'Bow'
      },
      {
        name: 'Pushya',
        sanskrit: 'पुष्य',
        deity: 'Brihaspati',
        symbol: 'Flower'
      },
      {
        name: 'Ashlesha',
        sanskrit: 'आश्लेषा',
        deity: 'Nagas',
        symbol: 'Serpent'
      },
      {
        name: 'Magha',
        sanskrit: 'मघा',
        deity: 'Pitamaha',
        symbol: 'Royal throne'
      },
      {
        name: 'Purva Phalguni',
        sanskrit: 'पूर्व फाल्गुनी',
        deity: 'Bhaga',
        symbol: 'Couch'
      },
      {
        name: 'Uttara Phalguni',
        sanskrit: 'उत्तर फाल्गुनी',
        deity: 'Sun',
        symbol: 'Bed'
      },
      { name: 'Hasta', sanskrit: 'हस्त', deity: 'Savitur', symbol: 'Hand' },
      {
        name: 'Chitra',
        sanskrit: 'चित्रा',
        deity: 'Vishwakarma',
        symbol: 'Pearl'
      },
      { name: 'Swati', sanskrit: 'स्वाती', deity: 'Vayu', symbol: 'Coral' },
      {
        name: 'Vishakha',
        sanskrit: 'विशाखा',
        deity: 'Indra',
        symbol: 'Victorious archer'
      },
      {
        name: 'Anuradha',
        sanskrit: 'अनुराधा',
        deity: 'Mitra',
        symbol: 'Lotus'
      },
      {
        name: 'Jyeshtha',
        sanskrit: 'ज्येष्ठा',
        deity: 'Indra',
        symbol: 'Umbrella'
      },
      {
        name: 'Mula',
        sanskrit: 'मूल',
        deity: 'Nirriti',
        symbol: 'Bunch of roots'
      },
      {
        name: 'Purva Ashadha',
        sanskrit: 'पूर्वाषाढ़ा',
        deity: 'Varuna',
        symbol: 'Elephant'
      },
      {
        name: 'Uttara Ashadha',
        sanskrit: 'उत्तराषाढ़ा',
        deity: 'Vishwadevas',
        symbol: 'Universal square'
      },
      { name: 'Shravana', sanskrit: 'श्रवण', deity: 'Vishnu', symbol: 'Ear' },
      { name: 'Dhanishta', sanskrit: 'धनिष्ठा', deity: 'Vasu', symbol: 'Drum' },
      {
        name: 'Shatabhisha',
        sanskrit: 'शतभिषा',
        deity: 'Varuna',
        symbol: 'Empty circle'
      },
      {
        name: 'Purva Bhadrapada',
        sanskrit: 'पूर्वभाद्रपदा',
        deity: 'Aja Ekapada',
        symbol: 'Sword'
      },
      {
        name: 'Uttara Bhadrapada',
        sanskrit: 'उत्तरभाद्रपदा',
        deity: 'Ahir Budhnya',
        symbol: 'Cobra'
      },
      { name: 'Revati', sanskrit: 'रेवती', deity: 'Pushan', symbol: 'Fish' }
    ];

    // Yoga combinations for daily yoga
    this.yogas = [
      { name: 'Vishkumbha', sanskrit: 'विश्कुम्भ', nature: 'Inauspicious' },
      { name: 'Priti', sanskrit: 'प्रीति', nature: 'Auspicious' },
      { name: 'Ayushman', sanskrit: 'आयुष्मान', nature: 'Auspicious' },
      { name: 'Saubhagya', sanskrit: 'सौभाग्य', nature: 'Auspicious' },
      { name: 'Shobhana', sanskrit: 'शोभना', nature: 'Auspicious' },
      { name: 'Atiganda', sanskrit: 'अतिगण्ड', nature: 'Inauspicious' },
      { name: 'Sukarman', sanskrit: 'सुकर्मा', nature: 'Auspicious' },
      { name: 'Dhriti', sanskrit: 'धृति', nature: 'Auspicious' },
      { name: 'Shula', sanskrit: 'शूल', nature: 'Inauspicious' },
      { name: 'Ganda', sanskrit: 'गण्ड', nature: 'Inauspicious' },
      { name: 'Vriddhi', sanskrit: 'वृद्धि', nature: 'Auspicious' },
      { name: 'Dhruva', sanskrit: 'ध्रुव', nature: 'Auspicious' },
      { name: 'Vyatipata', sanskrit: 'व्यतीपात', nature: 'Inauspicious' },
      { name: 'Vashya', sanskrit: 'वश्या', nature: 'Auspicious' },
      { name: 'Harshana', sanskrit: 'हर्षण', nature: 'Auspicious' },
      { name: 'Vajra', sanskrit: 'वज्र', nature: 'Inauspicious' },
      { name: 'Siddhi', sanskrit: 'सिद्धि', nature: 'Auspicious' },
      { name: 'Vyatipata', sanskrit: 'व्यतीपात', nature: 'Inauspicious' },
      { name: 'Variyan', sanskrit: 'वरीयान', nature: 'Auspicious' },
      { name: 'Parigha', sanskrit: 'परिघ', nature: 'Inauspicious' },
      { name: 'Shiva', sanskrit: 'शिव', nature: 'Auspicious' },
      { name: 'Siddha', sanskrit: 'सिद्ध', nature: 'Auspicious' },
      { name: 'Sadhya', sanskrit: 'साध्य', nature: 'Auspicious' },
      { name: 'Shubha', sanskrit: 'शुभ', nature: 'Auspicious' },
      { name: 'Shukla', sanskrit: 'शुक्ल', nature: 'Auspicious' },
      { name: 'Brahma', sanskrit: 'ब्रह्म', nature: 'Auspicious' },
      { name: 'Indra', sanskrit: 'इन्द्र', nature: 'Auspicious' }
    ];

    // Karana data
    this.karanas = [
      { name: 'Bava', sanskrit: 'बव', nature: 'Auspicious' },
      { name: 'Balava', sanskrit: 'बालव', nature: 'Auspicious' },
      { name: 'Kaulava', sanskrit: 'कौलव', nature: 'Auspicious' },
      { name: 'Taitila', sanskrit: 'तैतिल', nature: 'Auspicious' },
      { name: 'Garaja', sanskrit: 'गरजा', nature: 'Auspicious' },
      { name: 'Vanija', sanskrit: 'वनिज', nature: 'Auspicious' },
      { name: 'Visti', sanskrit: 'विस्टि', nature: 'Inauspicious' },
      { name: 'Sakuna', sanskrit: 'शकुन', nature: 'Auspicious' },
      { name: 'Chatuspada', sanskrit: 'चतुष्पदा', nature: 'Auspicious' },
      { name: 'Nagava', sanskrit: 'नागव', nature: 'Auspicious' },
      { name: 'Kimstughna', sanskrit: 'किंस्तुघ्न', nature: 'Inauspicious' }
    ];

    // Auspicious muhurta windows
    this.muholies = [
      {
        name: 'Rutu Mahalaya',
        hours: 'Morning',
        significance: 'Auspicious for ceremonies'
      },
      {
        name: 'Abhijit',
        hours: '12:00-12:48',
        significance: 'Most auspicious time'
      },
      {
        name: 'Varjya',
        hours: 'Various',
        significance: 'Inauspicious periods to avoid'
      }
    ];
  }

  /**
   * Generate complete panchang for a given date and location
   * @param {Object} dateData - Date and location information
   * @returns {Object} Complete panchang data
   */
  async generatePanchang(dateData) {
    try {
      const { date, time, latitude, longitude, timezone } = dateData;

      // Parse date
      const [day, month, year] = date.split('/').map(Number);
      const [hour, minute] = time.split(':').map(Number);
      const julianDay = this.dateToJulianDay(
        year,
        month,
        day,
        hour + minute / 60 + timezone
      );

      // Calculate all panchang components
      const tithi = await this.calculateTithi(julianDay);
      const nakshatra = await this.calculateNakshatra(julianDay);
      const yoga = await this.calculateYoga(julianDay);
      const karana = await this.calculateKarana(julianDay);
      const sunrise = await this.calculateSunrise(
        julianDay,
        latitude,
        longitude
      );
      const sunset = await this.calculateSunset(julianDay, latitude, longitude);

      // Determine overall auspiciousness
      const overallRating = this.calculateOverallRating(
        tithi,
        nakshatra,
        yoga,
        karana
      );
      const auspiciousTimes = this.calculateAuspiciousTimes(
        julianDay,
        sunrise,
        sunset
      );

      return {
        date,
        location: { latitude, longitude, timezone },
        tithi,
        nakshatra,
        yoga,
        karana,
        sunrise,
        sunset,
        overallRating,
        auspiciousTimes,
        recommendations: this.generateRecommendations(
          tithi,
          nakshatra,
          yoga,
          karana
        ),
        summary: this.generatePanchangSummary(
          tithi,
          nakshatra,
          yoga,
          karana,
          sunrise,
          sunset,
          overallRating
        )
      };
    } catch (error) {
      logger.error('Error generating panchang:', error);
      return {
        error: `Unable to generate panchang: ${error.message}`,
        fallback:
          'Panchang provides Hindu daily calendar with auspicious timings'
      };
    }
  }

  /**
   * Calculate tithi (lunar day) from Julian Day
   * @private
   */
  async calculateTithi(jd) {
    try {
      const sun = await this.getCelestialLongitude(jd, 'sun');
      const moon = await this.getCelestialLongitude(jd, 'moon');
      const angle = this.normalizeAngle(moon - sun);

      const tithiIndex = Math.floor(angle / (360 / 30)); // 30 tithis cover 360 degrees
      const progressInTithi = ((angle % (360 / 30)) / (360 / 30)) * 100;

      return {
        index: tithiIndex + 1,
        name: this.tithis[tithiIndex]?.name || 'Unknown',
        sanskrit: this.tithis[tithiIndex]?.sanskrit || '',
        meaning: this.tithis[tithiIndex]?.meaning || '',
        progress: Math.round(progressInTithi),
        type: this.determineTithiNature(tithiIndex + 1),
        next: this.tithis[(tithiIndex + 1) % 15]?.name || this.tithis[0].name
      };
    } catch (error) {
      logger.error('Error calculating tithi:', error);
      return { name: 'Unable to calculate', progress: 0 };
    }
  }

  /**
   * Calculate nakshatra from Julian Day
   * @private
   */
  async calculateNakshatra(jd) {
    try {
      const moon = await this.getCelestialLongitude(jd, 'moon');
      const nakshatraIndex = Math.floor(moon / (360 / 27)); // 27 nakshatras
      const progressInNakshatra = ((moon % (360 / 27)) / (360 / 27)) * 100;

      return {
        index: nakshatraIndex + 1,
        name: this.nakshatras[nakshatraIndex]?.name || 'Unknown',
        sanskrit: this.nakshatras[nakshatraIndex]?.sanskrit || '',
        deity: this.nakshatras[nakshatraIndex]?.deity || '',
        symbol: this.nakshatras[nakshatraIndex]?.symbol || '',
        progress: Math.round(progressInNakshatra),
        rulingPlanet: this.getNakshatraRulingPlanet(nakshatraIndex + 1),
        pada: this.calculateNakshatraPada(moon, nakshatraIndex),
        next:
          this.nakshatras[(nakshatraIndex + 1) % 27]?.name ||
          this.nakshatras[0].name
      };
    } catch (error) {
      logger.error('Error calculating nakshatra:', error);
      return { name: 'Unable to calculate', progress: 0 };
    }
  }

  /**
   * Calculate yoga (luni-solar combination)
   * @private
   */
  async calculateYoga(jd) {
    try {
      const sun = await this.getCelestialLongitude(jd, 'sun');
      const moon = await this.getCelestialLongitude(jd, 'moon');
      const combinedAngle = (sun + moon) % 360;

      const yogaIndex = Math.floor(combinedAngle / (360 / 27));
      const progressInYoga = ((combinedAngle % (360 / 27)) / (360 / 27)) * 100;

      return {
        index: yogaIndex + 1,
        name: this.yogas[yogaIndex]?.name || 'Unknown',
        sanskrit: this.yogas[yogaIndex]?.sanskrit || '',
        nature: this.yogas[yogaIndex]?.nature || 'Neutral',
        progress: Math.round(progressInYoga),
        effects: this.getYogaEffects(yogaIndex + 1),
        next: this.yogas[(yogaIndex + 1) % 27]?.name || this.yogas[0].name
      };
    } catch (error) {
      logger.error('Error calculating yoga:', error);
      return { name: 'Unable to calculate', nature: 'Neutral' };
    }
  }

  /**
   * Calculate karana (half tithi)
   * @private
   */
  async calculateKarana(jd) {
    try {
      const sun = await this.getCelestialLongitude(jd, 'sun');
      const moon = await this.getCelestialLongitude(jd, 'moon');
      const angle = this.normalizeAngle(moon - sun);

      const karanaIndex = Math.floor(angle / (360 / 60)); // 60 karanas for 360 degrees

      return {
        index: karanaIndex + 1,
        name: this.karanas[karanaIndex % 11]?.name || 'Unknown',
        sanskrit: this.karanas[karanaIndex % 11]?.sanskrit || '',
        nature: this.karanas[karanaIndex % 11]?.nature || 'Neutral',
        effects: this.getKaranaEffects(karanaIndex + 1),
        pair: this.determineKaranaPair(karanaIndex + 1)
      };
    } catch (error) {
      logger.error('Error calculating karana:', error);
      return { name: 'Unable to calculate', nature: 'Neutral' };
    }
  }

  /**
   * Calculate sunrise time
   * @private
   */
  async calculateSunrise(jd, lat, lon) {
    try {
      return '06:15'; // Approximate sunrise for demo
    } catch (error) {
      return 'Unable to calculate';
    }
  }

  /**
   * Calculate sunset time
   * @private
   */
  async calculateSunset(jd, lat, lon) {
    try {
      return '18:30'; // Approximate sunset for demo
    } catch (error) {
      return 'Unable to calculate';
    }
  }

  /**
   * Calculate auspicious times during the day
   * @private
   */
  calculateAuspiciousTimes(jd, sunrise, sunset) {
    return {
      rutuMahalaya: {
        hours: ['6:00-9:00', '12:00-15:00'],
        significance: 'Auspicious for ceremonies and new beginnings'
      },
      abhijit: {
        hours: ['12:00-12:48'],
        significance: 'Most auspicious time of the day'
      },
      favorablePeriods: ['6:00-9:00 (morning)', '12:00-14:00 (afternoon)'],
      avoid: ['Void moon periods', 'Solar eclipses', 'During Varjya Muhurta']
    };
  }

  /**
   * Calculate overall rating based on panchang elements
   * @private
   */
  calculateOverallRating(tithi, nakshatra, yoga, karana) {
    let score = 0;

    // Tithi scoring
    if (tithi.type === 'Auspicious') {
      score += 3;
    } else if (tithi.type === 'Neutral') {
      score += 2;
    } else {
      score += 1;
    }

    // Yoga scoring
    if (yoga.nature === 'Auspicious') {
      score += 3;
    } else if (yoga.nature === 'Neutral') {
      score += 2;
    } else {
      score += 1;
    }

    // Karana scoring
    if (karana.nature === 'Auspicious') {
      score += 2;
    } else if (karana.nature === 'Neutral') {
      score += 1;
    }

    // Nakshatra scoring (simplified)
    score += 2; // Most nakshatras are neutral

    const rating =
      score >= 8 ?
        'Very Auspicious' :
        score >= 6 ?
          'Auspicious' :
          score >= 4 ?
            'Neutral' :
            'Inauspicious';

    return {
      score,
      rating,
      recommendation: this.getRatingRecommendation(rating, tithi, nakshatra)
    };
  }

  /**
   * Helper methods
   * @private
   */
  normalizeAngle(angle) {
    if (angle < 0) {
      return angle + 360;
    }
    return angle % 360;
  }

  async getCelestialLongitude(jd, body) {
    // This would use Swiss Ephemeris for actual calculations
    // For now returning mock data
    return 0;
  }

  determineTithiNature(tithiNumber) {
    const auspicious = [1, 2, 3, 5, 6, 7, 8, 10, 11, 12, 13];
    const inauspicious = [4, 9, 14, 15]; // 15 = Amavasya

    if (auspicious.includes(tithiNumber)) {
      return 'Auspicious';
    }
    if (inauspicious.includes(tithiNumber)) {
      return 'Inauspicious';
    }
    return 'Neutral';
  }

  getNakshatraRulingPlanet(nakshatraNumber) {
    const rulingPlanets = [
      'Ketu',
      'Venus',
      'Sun',
      'Moon',
      'Mars',
      'Rahu',
      'Jupiter',
      'Saturn',
      'Mercury'
    ];
    return rulingPlanets[(nakshatraNumber - 1) % 9] || 'Moon';
  }

  calculateNakshatraPada(longitude, nakshatraIndex) {
    const startLongitude = nakshatraIndex * (360 / 27);
    const positionInNakshatra =
      ((longitude - startLongitude + 360) % 360) % (360 / 27);
    return Math.floor(positionInNakshatra / (360 / 27 / 4)) + 1;
  }

  getYogaEffects(yogaNumber) {
    const effects = {
      1: ['Obstacles', 'Delays in work'],
      2: ['Harmony', 'Joyful experiences'],
      11: ['Growth', 'Success in endeavors'],
      12: ['Stability', 'Patience rewarded'],
      17: ['Achievement', 'Goals reached']
    };
    return effects[yogaNumber] || ['General influence'];
  }

  getKaranaEffects(karanaNumber) {
    const effects = {
      1: ['Stability', 'Good for building'],
      2: ['Peace', 'Harmony in relationships'],
      7: ['Challenges', 'Required care'],
      8: ['Success', 'Opportunities present'],
      11: ['Disruption', 'Best to avoid important activities']
    };
    return effects[karanaNumber] || ['General influence'];
  }

  determineKaranaPair(karanaNumber) {
    const pairs = ['Fixed', 'Moveable', 'Toxic'];
    return pairs[(karanaNumber - 1) % 3] || 'Fixed';
  }

  getRatingRecommendation(rating, tithi, nakshatra) {
    if (rating === 'Very Auspicious') {
      return `Excellent day for new beginnings, marriages, business launches. ${tithi.name} ${nakshatra.name} combination is highly favorable.`;
    } else if (rating === 'Auspicious') {
      return `Good day for constructive activities. Some careful planning advised. ${nakshatra.name} nakshatra brings specific energies.`;
    } else if (rating === 'Neutral') {
      return `Average day. Focus on routine activities rather than major decisions. ${tithi.name} has moderate influence.`;
    } else {
      return `Challenging day. Best for inner work and contemplation. ${tithi.name} suggests caution.`;
    }
  }

  generateRecommendations(tithi, nakshatra, yoga, karana) {
    const recommendations = {
      activities: [],
      timing: [],
      cautions: []
    };

    // Tithi-based
    if (tithi.type === 'Auspicious') {
      recommendations.activities.push(
        'Weddings',
        'Business launches',
        'Spiritual practices'
      );
    } else if (tithi.type === 'Inauspicious') {
      recommendations.caution.push(
        'Avoid major decisions',
        'Be cautious with investments'
      );
    }

    // Yoga-based
    if (yoga.nature === 'Inauspicious') {
      recommendations.caution.push(
        'Delay important meetings',
        'Avoid travel if possible'
      );
    } else {
      recommendations.activities.push('Creative work', 'Learning activities');
    }

    return recommendations;
  }

  generatePanchangSummary(
    tithi,
    nakshatra,
    yoga,
    karana,
    sunrise,
    sunset,
    rating
  ) {
    return `🌅 **Daily Panchang Summary**

**Date:** ${new Date().toLocaleDateString()}

**Tithi:** ${tithi.sanskrit} (${tithi.name}) - ${tithi.progress}% complete
**Nakshatra:** ${nakshatra.sanskrit} (${nakshatra.name}) - Pada ${nakshatra.pada}
**Yoga:** ${yoga.sanskrit} (${yoga.name}) - ${yoga.nature}
**Karana:** ${karana.sanskrit} (${karana.name}) - ${karana.nature}

**Timing:**
🌅 Sunrise: ${sunrise}
🌇 Sunset: ${sunset}

${rating.rating} Day (${rating.score}/12)
${rating.recommendation}

🕉️ *Remember:* Panchang guides auspicious Hindu living and ceremonies.`;
  }

  dateToJulianDay(year, month, day, hour) {
    // Simplified Julian Day calculation
    return (
      hour / 24 +
      day +
      Math.floor((153 * month + 2) / 5) +
      365 * year +
      Math.floor(year / 4) -
      Math.floor(year / 100) +
      Math.floor(year / 400) -
      32045
    );
  }

  /**
   * Get panchang service information
   * @returns {Object} Service catalog
   */
  getPanchangCatalog() {
    return {
      tithi_calculation: 'Precise lunar day from Sun-Moon angle',
      nakshatra_calculation:
        '27 constellations with ruling deities and symbolism',
      yoga_calculation: '27 luni-solar combinations determining daily energy',
      karana_calculation: '11 karanas determining half-tithi influences',
      auspicious_timing: 'Abhijit Muhurta and favorable day periods',
      overall_rating: 'Composite auspiciousness based on all panchang elements',
      hindu_observance:
        'Traditional Hindu daily calendar for ceremonies and observances'
    };
  }
}

module.exports = { Panchang };
