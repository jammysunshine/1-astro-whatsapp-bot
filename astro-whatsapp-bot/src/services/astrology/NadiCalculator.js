class NadiCalculator {
  constructor(dataProvider) {
    this.dataProvider = dataProvider;
  }

  /**
   * Calculate birth nakshatra
   * @param {string} birthDate - Birth date
   * @param {string} birthTime - Birth time
   * @returns {Object} Birth nakshatra information
   */
  calculateBirthNakshatra(birthDate, birthTime) {
    try {
      // Simplified nakshatra calculation
      // In reality, this requires precise astronomical calculations
      const [day, month, year] = birthDate.split('/').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);

      // Calculate approximate nakshatra based on date and time
      const dayOfYear = this.getDayOfYear(day, month);
      const timeFactor = (hour * 60 + minute) / 1440; // Fraction of day

      const nakshatraIndex = Math.floor((dayOfYear + timeFactor * 27) % 27);
      const nakshatra = this.dataProvider.nakshatras[nakshatraIndex];

      return {
        name: nakshatra.name,
        rulingPlanet: nakshatra.rulingPlanet,
        deity: nakshatra.deity,
        nature: nakshatra.nature,
        pada: this.calculatePada(hour, minute),
        characteristics: this.getNakshatraCharacteristics(nakshatra.name),
        rulingDeity: nakshatra.deity
      };
    } catch (error) {
      return {
        error: 'Unable to calculate birth nakshatra'
      };
    }
  }

  /**
   * Determine Nadi system
   * @param {Object} birthNakshatra - Birth nakshatra
   * @param {string} birthDate - Birth date
   * @returns {Object} Nadi system
   */
  determineNadiSystem(birthNakshatra, birthDate) {
    try {
      // Simplified Nadi determination based on nakshatra and birth date
      const [day, month, year] = birthDate.split('/').map(Number);
      const total = day + month + year;

      let nadiType;
      if (total % 3 === 0) {
        nadiType = 'adi';
      } else if (total % 3 === 1) {
        nadiType = 'Madhya';
      } else {
        nadiType = 'Antya';
      }

      return this.dataProvider.nadiSystems[nadiType];
    } catch (error) {
      return this.dataProvider.nadiSystems.adi; // Default
    }
  }

  /**
   * Calculate current dasha period
   * @param {string} birthDate - Birth date
   * @returns {Object} Current dasha information
   */
  calculateCurrentDasha(birthDate) {
    try {
      const [day, month, year] = birthDate.split('/').map(Number);
      const birthDateObj = new Date(year, month - 1, day);
      const now = new Date();

      const ageInYears = now.getFullYear() - birthDateObj.getFullYear();
      const ageInMonths =
        now.getMonth() - birthDateObj.getMonth() + ageInYears * 12;

      // Simplified dasha calculation
      const totalDashaYears = Object.values(
        this.dataProvider.dashaPeriods
      ).reduce((sum, period) => sum + period.duration, 0);
      const currentPosition = ageInYears % totalDashaYears;

      let accumulatedYears = 0;
      let currentDasha = null;

      for (const [planet, period] of Object.entries(
        this.dataProvider.dashaPeriods
      )) {
        accumulatedYears += period.duration;
        if (currentPosition < accumulatedYears) {
          currentDasha = {
            planet: planet.charAt(0).toUpperCase() + planet.slice(1),
            duration: period.duration,
            remaining: accumulatedYears - currentPosition,
            characteristics: period.characteristics,
            influence: this.getDashaInfluence(planet)
          };
          break;
        }
      }

      return (
        currentDasha || {
          planet: 'Sun',
          duration: 6,
          remaining: 3,
          characteristics: 'Leadership and authority',
          influence: 'Period of leadership and self-expression'
        }
      );
    } catch (error) {
      return { error: 'Unable to calculate current dasha' };
    }
  }

  getDayOfYear(day, month) {
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let dayOfYear = day;
    for (let i = 0; i < month - 1; i++) {
      dayOfYear += daysInMonth[i];
    }
    return dayOfYear;
  }

  calculatePada(hour, minute) {
    const totalMinutes = hour * 60 + minute;
    const padaDuration = 1440 / 4; // 4 padas per nakshatra
    return Math.floor(totalMinutes / padaDuration) + 1;
  }

  getNakshatraCharacteristics(nakshatraName) {
    const characteristics = {
      Ashwini: 'Independent, energetic, healing abilities, pioneering spirit',
      Bharani: 'Ambitious, courageous, transformative, leadership qualities',
      Krittika: 'Sharp intellect, leadership, purification, warrior spirit',
      Rohini: 'Creative, nurturing, material success, artistic talents',
      Mrigashira:
        'Research-oriented, restless, communicative, searching nature',
      Ardra: 'Dynamic, stormy, destructive-constructive, research abilities',
      Punarvasu: 'Spiritual, learned, wealthy, devoted to elders',
      Pushya: 'Nurturing, spiritual, prosperous, caring nature',
      Ashlesha: 'Psychic, intuitive, healing, mystical abilities',
      Magha: 'Royal, authoritative, spiritual, ancestral connection',
      'Purva Phalguni': 'Creative, romantic, pleasure-seeking, diplomatic',
      'Uttara Phalguni': 'Charitable, prosperous, spiritual, service-oriented',
      Hasta: 'Healing, skilled, artistic, communicative',
      Chitra: 'Creative, artistic, skillful, dynamic',
      Swati: 'Independent, harmonious, diplomatic, self-sufficient',
      Vishakha: 'Social, ambitious, goal-oriented, leadership',
      Anuradha: 'Devotional, successful, friendly, spiritual',
      Jyeshtha: 'Eldest, authoritative, knowledgeable, occult abilities',
      Mula: 'Research, spiritual, destructive-constructive, philosophical',
      'Purva Ashadha': 'Victorious, ambitious, spiritual, leadership',
      'Uttara Ashadha': 'Spiritual, victorious, ambitious, leadership',
      Shravana: 'Learning, fame, spiritual, devoted',
      Dhanishta: 'Musical, prosperous, spiritual, wealthy',
      Shatabhisha: 'Healing, mystical, research, independent',
      'Purva Bhadrapada': 'Spiritual, creative, mystical, transformative',
      'Uttara Bhadrapada': 'Spiritual, charitable, prosperous, wise',
      Revati: 'Prosperous, spiritual, guiding, compassionate'
    };
    return (
      characteristics[nakshatraName] || 'Unique characteristics and abilities'
    );
  }

  getDashaInfluence(planet) {
    const influences = {
      sun: 'Focus on leadership, authority, and self-expression',
      moon: 'Emphasis on emotions, home, and mental well-being',
      mars: 'Energy for action, courage, and new beginnings',
      mercury: 'Time for learning, communication, and intellectual pursuits',
      jupiter: 'Period of expansion, wisdom, and spiritual growth',
      venus: 'Focus on relationships, beauty, and material comforts',
      saturn: 'Time for discipline, hard work, and life lessons',
      rahu: 'Period of ambition, unconventional paths, and growth',
      ketu: 'Time for spirituality, detachment, and inner wisdom'
    };
    return influences[planet] || 'Period of personal growth and development';
  }
}

module.exports = { NadiCalculator };
