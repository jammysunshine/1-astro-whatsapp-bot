/**
 * Hindu Festivals Calendar - Comprehensive Festival Guide
 * Includes major Hindu festivals, dates, significance, rituals, and auspicious timings
 */

const logger = require('../../utils/logger');

class HinduFestivals {
  constructor() {
    logger.info('Module: HinduFestivals loaded.');
    this.initializeFestivalDatabase();
  }

  /**
   * Initialize comprehensive Hindu festivals database
   */
  initializeFestivalDatabase() {
    // Major Hindu Festivals
    this.festivals = {
      diwali: {
        name: 'Diwali (Deepavali)',
        english: 'Festival of Lights',
        date: 'Amavasya (New Moon) in Kartik month',
        gregorian_period: 'October-November',
        significance: 'Victory of light over darkness, triumph of good over evil',
        deities: 'Lakshmi (Goddess of Wealth), Lord Ganesha',
        rituals: [
          'House cleaning and decoration with lights',
          'Lakshmi Puja in the evening',
          'Exchange of sweets and gifts',
          'Fireworks and illumination',
          'Visit to temples'
        ],
        auspicious_activities: [
          'Starting new business ventures',
          'House warming ceremonies',
          'Marriage ceremonies',
          'Investment and financial activities'
        ],
        duration: '5 days (from Dhanteras to Bhaiduj)',
        regional_variations: 'Called Deepavali in South India, Diwali in North India'
      },

      holi: {
        name: 'Holi',
        english: 'Festival of Colors',
        date: 'Full Moon (Purnima) in Phalgun month',
        gregorian_period: 'February-March',
        significance: 'Victory of good over evil, renewal, and spring celebration',
        deities: 'Lord Krishna, Radha, Prahlad',
        rituals: [
          'Holika Dahan (burning of Holika effigy)',
          'Playing with colors (gulal)',
          'Bhang consumption (in some regions)',
          'Bonfire celebrations',
          'Family gatherings'
        ],
        auspicious_activities: [
          'New beginnings and ventures',
          'Marriage proposals',
          'Planting and agriculture',
          'Artistic and creative pursuits'
        ],
        duration: '2 days (Holika Dahan and Rangwali Holi)',
        regional_variations: 'Lathmar Holi in Bihar, Phagwah in Caribbean'
      },

      durga_puja: {
        name: 'Durga Puja',
        english: 'Worship of Goddess Durga',
        date: 'Ashwin month (September-October)',
        gregorian_period: 'September-October',
        significance: 'Victory of Goddess Durga over Mahishasura, divine feminine power',
        deities: 'Goddess Durga and her nine forms',
        rituals: [
          'Pandal decoration with Durga idols',
          'Daily puja and aarti',
          'Dhunochi Nach (traditional dance)',
          'Pushpanjali (flower offerings)',
          'Immersion (Visharjan) ceremony'
        ],
        auspicious_activities: [
          'Spiritual practices and meditation',
          'Family reunions',
          'Cultural performances',
          'Charitable activities'
        ],
        duration: '10 days (from Maha Saptami to Vijayadashami)',
        regional_variations: 'Most elaborate in West Bengal, called Dussehra in North India'
      },

      maha_shivaratri: {
        name: 'Maha Shivaratri',
        english: 'Great Night of Lord Shiva',
        date: '14th night of Krishna Paksha in Phalgun month',
        gregorian_period: 'February-March',
        significance: 'Marriage of Shiva and Parvati, awakening of spiritual consciousness',
        deities: 'Lord Shiva',
        rituals: [
          'All-night vigil and prayers',
          'Abhishek (bathing Shiva lingam)',
          'Chanting Om Namah Shivaya',
          'Fasting and meditation',
          'Visit to Shiva temples'
        ],
        auspicious_activities: [
          'Spiritual practices and yoga',
          'Marriage ceremonies',
          'Starting spiritual journeys',
          'Healing and detoxification'
        ],
        duration: '1 day (all-night celebration)',
        regional_variations: 'Special celebrations in Varanasi, Somnath, and Tamil Nadu'
      },

      raksha_bandhan: {
        name: 'Raksha Bandhan',
        english: 'Bond of Protection',
        date: 'Full Moon (Purnima) in Shravan month',
        gregorian_period: 'August',
        significance: 'Sacred bond between brothers and sisters',
        deities: 'Lord Yama (protection from death)',
        rituals: [
          'Tying rakhi (sacred thread) by sisters',
          'Applying tilak and giving blessings by brothers',
          'Exchange of gifts and sweets',
          'Family prayers and feasts'
        ],
        auspicious_activities: [
          'Strengthening family bonds',
          'Starting new relationships',
          'Protection rituals',
          'Charitable activities'
        ],
        duration: '1 day',
        regional_variations: 'Celebrated differently across India, special in North India'
      },

      ganesh_chaturthi: {
        name: 'Ganesh Chaturthi',
        english: 'Birthday of Lord Ganesha',
        date: '4th day of bright half (Shukla Chaturthi) in Bhadrapad month',
        gregorian_period: 'August-September',
        significance: 'Birth of Lord Ganesha, remover of obstacles',
        deities: 'Lord Ganesha',
        rituals: [
          'Installation of Ganesha idol',
          'Daily puja and offerings',
          'Modak (sweet) distribution',
          'Cultural programs and music',
          'Immersion ceremony (Visarjan)'
        ],
        auspicious_activities: [
          'Starting new ventures and projects',
          'Education and learning',
          'Marriage ceremonies',
          'House construction'
        ],
        duration: '10 days (from Chaturthi to Anant Chaturdashi)',
        regional_variations: 'Most elaborate in Maharashtra, 1-2 days in other regions'
      },

      navaratri: {
        name: 'Navaratri',
        english: 'Nine Nights of Goddess',
        date: 'Ashwin month (September-October)',
        gregorian_period: 'September-October',
        significance: 'Nine forms of Goddess Durga, spiritual purification',
        deities: 'Nine forms of Goddess Durga',
        rituals: [
          'Daily puja to different forms of Durga',
          'Fasting and spiritual practices',
          'Garba and Dandiya dances',
          'Kanya Puja (worship of young girls)',
          'Dussehra celebration on 10th day'
        ],
        auspicious_activities: [
          'Spiritual practices and meditation',
          'Starting new spiritual disciplines',
          'Artistic and cultural activities',
          'Health and wellness routines'
        ],
        duration: '9-10 days',
        regional_variations: 'Garba in Gujarat, Durga Puja in Bengal, Saraswati Puja in Kerala'
      },

      krishna_janmashtami: {
        name: 'Krishna Janmashtami',
        english: 'Birthday of Lord Krishna',
        date: '8th day of Krishna Paksha in Shravan month',
        gregorian_period: 'August-September',
        significance: 'Birth of Lord Krishna, divine incarnation',
        deities: 'Lord Krishna',
        rituals: [
          'Fasting until midnight',
          'Bhajan and kirtan singing',
          'Dahi Handi (breaking pots of curd)',
          'Ras Leela dances',
          'Midnight birth celebration'
        ],
        auspicious_activities: [
          'Spiritual practices and devotion',
          'Music and artistic pursuits',
          'Community celebrations',
          'Charitable activities'
        ],
        duration: '1 day',
        regional_variations: 'Dahi Handi in Maharashtra, special celebrations in Mathura'
      },

      ram_navami: {
        name: 'Ram Navami',
        english: 'Birthday of Lord Rama',
        date: '9th day of bright half (Shukla Navami) in Chaitra month',
        gregorian_period: 'March-April',
        significance: 'Birth of Lord Rama, ideal of righteousness',
        deities: 'Lord Rama',
        rituals: [
          'Ram Katha recitation',
          'Processions and chariot rides',
          'Distribution of prasad',
          'Visit to Rama temples',
          'Fasting and prayers'
        ],
        auspicious_activities: [
          'Marriage ceremonies',
          'Starting righteous ventures',
          'Education and learning',
          'Community service'
        ],
        duration: '1 day',
        regional_variations: 'Special celebrations in Ayodhya, special fasting in South India'
      },

      hanuman_jayanti: {
        name: 'Hanuman Jayanti',
        english: 'Birthday of Lord Hanuman',
        date: 'Full Moon (Purnima) in Chaitra month',
        gregorian_period: 'March-April',
        significance: 'Birth of Lord Hanuman, devotion and strength',
        deities: 'Lord Hanuman',
        rituals: [
          'Hanuman Chalisa recitation',
          'Sindoor application to Hanuman idols',
          'Processions and chariot rides',
          'Distribution of prasad',
          'Strength and devotion prayers'
        ],
        auspicious_activities: [
          'Physical fitness and strength building',
          'Overcoming obstacles',
          'Devotional practices',
          'Courage and determination activities'
        ],
        duration: '1 day',
        regional_variations: 'Special celebrations in North India, Kerala, and Tamil Nadu'
      }
    };

    // Hindu Calendar Months
    this.hinduMonths = {
      chaitra: { name: 'Chaitra', gregorian: 'March-April', festivals: ['Ram Navami', 'Hanuman Jayanti'] },
      vaishakha: { name: 'Vaishakha', gregorian: 'April-May', festivals: ['Akshaya Tritiya'] },
      jyeshtha: { name: 'Jyeshtha', gregorian: 'May-June', festivals: ['Vat Pournima'] },
      ashadha: { name: 'Ashadha', gregorian: 'June-July', festivals: ['Guru Purnima'] },
      shravana: { name: 'Shravana', gregorian: 'July-August', festivals: ['Raksha Bandhan', 'Krishna Janmashtami'] },
      bhadrapada: { name: 'Bhadrapada', gregorian: 'August-September', festivals: ['Ganesh Chaturthi', 'Onam'] },
      ashvina: { name: 'Ashvina', gregorian: 'September-October', festivals: ['Navaratri', 'Durga Puja', 'Diwali'] },
      kartika: { name: 'Kartika', gregorian: 'October-November', festivals: ['Diwali', 'Kartik Purnima'] },
      margashirsha: { name: 'Margashirsha', gregorian: 'November-December', festivals: ['Kartik Purnima'] },
      pausha: { name: 'Pausha', gregorian: 'December-January', festivals: ['Sankranti'] },
      magha: { name: 'Magha', gregorian: 'January-February', festivals: ['Maghi Purnima'] },
      phalguna: { name: 'Phalguna', gregorian: 'February-March', festivals: ['Maha Shivaratri', 'Holi'] }
    };

    // Auspicious timings and muhurtas
    this.auspiciousTimings = {
      abhijit_muhurta: {
        name: 'Abhijit Muhurta',
        time: 'Approximately 11:30 AM - 12:30 PM',
        significance: 'Most auspicious time of the day',
        activities: 'All important activities, marriages, business starts'
      },
      brahma_muhurta: {
        name: 'Brahma Muhurta',
        time: '1.5 hours before sunrise',
        significance: 'Best time for spiritual practices',
        activities: 'Meditation, yoga, spiritual studies'
      },
      rahu_kalam: {
        name: 'Rahu Kalam',
        time: 'Varies by weekday (inauspicious period)',
        significance: 'Time to avoid important activities',
        activities: 'Rest, routine work, avoid new beginnings'
      },
      yamagandam: {
        name: 'Yamagandam',
        time: 'Varies by weekday (challenging period)',
        significance: 'Time of increased challenges',
        activities: 'Caution in activities, spiritual practices'
      }
    };

    // Festival-specific auspicious timings
    this.festivalTimings = {
      diwali: {
        lakshmi_puja: 'Evening after sunset',
        best_time: 'Pradosh Kaal (twilight period)',
        activities: 'Wealth-related activities, business starts'
      },
      holi: {
        holika_dahan: 'Sunset on Phalgun Amavasya',
        rangwali: 'Next day morning',
        activities: 'New beginnings, relationship starts'
      },
      durga_puja: {
        pushpanjali: 'Morning hours',
        sandhi_puja: 'Transitional period between days',
        activities: 'Spiritual practices, family gatherings'
      }
    };
  }

  /**
   * Get festival information for a specific date
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Object} Festival information
   */
  getFestivalsForDate(date) {
    try {
      const targetDate = new Date(date);
      const festivals = [];

      // Check each festival's approximate date
      for (const [key, festival] of Object.entries(this.festivals)) {
        if (this.isFestivalDate(festival, targetDate)) {
          festivals.push({
            ...festival,
            key,
            estimated_date: this.getEstimatedGregorianDate(festival, targetDate.getFullYear())
          });
        }
      }

      return {
        date,
        festivals,
        auspicious_timings: this.getAuspiciousTimingsForDate(targetDate),
        summary: this.generateFestivalSummary(date, festivals)
      };
    } catch (error) {
      logger.error('Error getting festivals for date:', error);
      return {
        error: 'Unable to retrieve festival information for this date'
      };
    }
  }

  /**
   * Check if a date falls within a festival period
   * @param {Object} festival - Festival data
   * @param {Date} targetDate - Target date
   * @returns {boolean} Whether date is during festival
   */
  isFestivalDate(festival, targetDate) {
    // Simplified date checking - in production would use lunar calendar calculations
    const month = targetDate.getMonth() + 1;
    const day = targetDate.getDate();

    // Approximate festival dates based on lunar calendar
    const festivalApproximations = {
      diwali: { month: 10, day: 15, range: 7 }, // October-November
      holi: { month: 3, day: 15, range: 7 }, // February-March
      durga_puja: { month: 9, day: 20, range: 10 }, // September-October
      maha_shivaratri: { month: 2, day: 28, range: 3 }, // February-March
      raksha_bandhan: { month: 8, day: 15, range: 5 }, // August
      ganesh_chaturthi: { month: 8, day: 25, range: 10 }, // August-September
      navaratri: { month: 9, day: 20, range: 9 }, // September-October
      krishna_janmashtami: { month: 8, day: 20, range: 5 }, // August-September
      ram_navami: { month: 3, day: 25, range: 5 }, // March-April
      hanuman_jayanti: { month: 3, day: 28, range: 3 } // March-April
    };

    const approx = festivalApproximations[festival.name.toLowerCase().replace(/\s+/g, '_')];
    if (!approx) { return false; }

    return Math.abs(month - approx.month) <= 1 && Math.abs(day - approx.day) <= approx.range;
  }

  /**
   * Get estimated Gregorian date for a festival
   * @param {Object} festival - Festival data
   * @param {number} year - Year
   * @returns {string} Estimated date
   */
  getEstimatedGregorianDate(festival, year) {
    // Simplified estimation - would use proper lunar calendar in production
    const estimations = {
      diwali: `${year}-10-28 to ${year}-11-03`,
      holi: `${year}-03-14 to ${year}-03-15`,
      durga_puja: `${year}-09-22 to ${year}-10-01`,
      maha_shivaratri: `${year}-02-28`,
      raksha_bandhan: `${year}-08-19`,
      ganesh_chaturthi: `${year}-08-31 to ${year}-09-09`,
      navaratri: `${year}-09-26 to ${year}-10-04`,
      krishna_janmashtami: `${year}-08-26`,
      ram_navami: `${year}-03-30`,
      hanuman_jayanti: `${year}-03-29`
    };

    return estimations[festival.name.toLowerCase().replace(/\s+/g, '_')] || 'Date varies by lunar calendar';
  }

  /**
   * Get auspicious timings for a specific date
   * @param {Date} date - Target date
   * @returns {Object} Auspicious timings
   */
  getAuspiciousTimingsForDate(date) {
    const dayOfWeek = date.getDay();
    const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // Rahu Kalam timings by weekday (approximate)
    const rahuKalamTimings = {
      0: '4:30 PM - 6:00 PM', // Sunday
      1: '7:30 AM - 9:00 AM', // Monday
      2: '3:00 PM - 4:30 PM', // Tuesday
      3: '12:00 PM - 1:30 PM', // Wednesday
      4: '1:30 PM - 3:00 PM', // Thursday
      5: '10:30 AM - 12:00 PM', // Friday
      6: '9:00 AM - 10:30 AM'  // Saturday
    };

    return {
      abhijit_muhurta: this.auspiciousTimings.abhijit_muhurta,
      brahma_muhurta: this.auspiciousTimings.brahma_muhurta,
      rahu_kalam: {
        ...this.auspiciousTimings.rahu_kalam,
        time: rahuKalamTimings[dayOfWeek],
        day: weekdayNames[dayOfWeek]
      },
      yamagandam: {
        ...this.auspiciousTimings.yamagandam,
        time: this.getYamagandamTime(dayOfWeek),
        day: weekdayNames[dayOfWeek]
      }
    };
  }

  /**
   * Get Yamagandam timing for a weekday
   * @param {number} dayOfWeek - Day of week (0-6)
   * @returns {string} Yamagandam time
   */
  getYamagandamTime(dayOfWeek) {
    const yamagandamTimings = {
      0: '3:00 PM - 4:30 PM', // Sunday
      1: '4:30 PM - 6:00 PM', // Monday
      2: '12:00 PM - 1:30 PM', // Tuesday
      3: '10:30 AM - 12:00 PM', // Wednesday
      4: '9:00 AM - 10:30 PM', // Thursday
      5: '7:30 AM - 9:00 AM', // Friday
      6: '1:30 PM - 3:00 PM'  // Saturday
    };

    return yamagandamTimings[dayOfWeek];
  }

  /**
   * Get upcoming festivals for the next 30 days
   * @param {string} startDate - Starting date
   * @returns {Object} Upcoming festivals
   */
  getUpcomingFestivals(startDate = new Date().toISOString().split('T')[0]) {
    const start = new Date(startDate);
    const upcoming = [];

    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(start);
      checkDate.setDate(start.getDate() + i);

      const festivalsOnDate = this.getFestivalsForDate(checkDate.toISOString().split('T')[0]);
      if (festivalsOnDate.festivals.length > 0) {
        upcoming.push({
          date: checkDate.toISOString().split('T')[0],
          festivals: festivalsOnDate.festivals
        });
      }
    }

    return {
      period: `Next 30 days from ${startDate}`,
      upcoming_festivals: upcoming,
      total_festivals: upcoming.length,
      summary: this.generateUpcomingSummary(upcoming)
    };
  }

  /**
   * Get detailed information about a specific festival
   * @param {string} festivalName - Name of the festival
   * @returns {Object} Festival details
   */
  getFestivalDetails(festivalName) {
    const normalizedName = festivalName.toLowerCase().replace(/\s+/g, '_');
    const festival = this.festivals[normalizedName];

    if (!festival) {
      return {
        error: `Festival "${festivalName}" not found. Available festivals: ${Object.keys(this.festivals).join(', ')}`
      };
    }

    return {
      ...festival,
      key: normalizedName,
      estimated_dates: this.getEstimatedGregorianDate(festival, new Date().getFullYear()),
      rituals_detailed: this.getDetailedRituals(festival),
      regional_significance: this.getRegionalSignificance(festival),
      modern_celebration: this.getModernCelebrationTips(festival)
    };
  }

  /**
   * Get detailed rituals for a festival
   * @param {Object} festival - Festival data
   * @returns {Array} Detailed rituals
   */
  getDetailedRituals(festival) {
    // Add more detailed ritual information
    const detailedRituals = {
      diwali: [
        'Clean and decorate home with rangoli and lights',
        'Prepare traditional sweets (laddus, barfis)',
        'Perform Lakshmi Puja with proper mantras',
        'Light lamps and candles in every room',
        'Exchange gifts and distribute prasad',
        'Visit temples and seek blessings'
      ],
      holi: [
        'Prepare colors and water balloons safely',
        'Light Holika bonfire with prayers',
        'Apply gulal (colors) respectfully',
        'Share sweets and festive meals',
        'Forgive and forget past grievances',
        'Celebrate with music and dance'
      ]
    };

    return detailedRituals[festival.name.toLowerCase().replace(/\s+/g, '_')] || festival.rituals;
  }

  /**
   * Get regional significance of a festival
   * @param {Object} festival - Festival data
   * @returns {Object} Regional information
   */
  getRegionalSignificance(festival) {
    const regionalInfo = {
      diwali: {
        north_india: 'Festival of lights, Lakshmi worship, family celebrations',
        south_india: 'Called Deepavali, focus on Narakasura defeat, oil lamps',
        west_india: 'Colorful decorations, business community celebrations',
        east_india: 'Kali Puja in Bengal, special significance'
      },
      holi: {
        north_india: 'Spring festival, Krishna legends, color celebrations',
        west_india: 'Special rangoli, community celebrations',
        south_india: 'More restrained, focus on Holika story',
        international: 'Celebrated by Indian diaspora worldwide'
      }
    };

    return regionalInfo[festival.name.toLowerCase().replace(/\s+/g, '_')] || {
      general: festival.regional_variations || 'Celebrated across India with regional variations'
    };
  }

  /**
   * Get modern celebration tips
   * @param {Object} festival - Festival data
   * @returns {Array} Modern tips
   */
  getModernCelebrationTips(festival) {
    const modernTips = {
      diwali: [
        'Use LED lights for eco-friendly celebrations',
        'Share festive meals with neighbors and colleagues',
        'Use festival as opportunity for family bonding',
        'Support local artisans for decorations and sweets',
        'Practice mindfulness during the festival of light'
      ],
      holi: [
        'Use natural, skin-safe colors',
        'Respect personal boundaries with colors',
        'Include non-Hindu friends in celebrations',
        'Use festival for community building',
        'Focus on the spiritual meaning of renewal'
      ]
    };

    return modernTips[festival.name.toLowerCase().replace(/\s+/g, '_')] || [
      'Connect with family and community',
      'Practice the spiritual significance',
      'Share joy and positivity',
      'Maintain cultural traditions'
    ];
  }

  /**
   * Generate festival summary for a date
   * @param {string} date - Date
   * @param {Array} festivals - Festivals on that date
   * @returns {string} Summary text
   */
  generateFestivalSummary(date, festivals) {
    if (festivals.length === 0) {
      return `🗓️ *Hindu Festivals for ${date}*\n\nNo major Hindu festivals on this date. Check auspicious timings for daily activities.`;
    }

    let summary = `🕉️ *Hindu Festivals for ${date}*\n\n`;

    festivals.forEach(festival => {
      summary += `*${festival.name} (${festival.english})*\n`;
      summary += `📅 Estimated: ${festival.estimated_date}\n`;
      summary += `🕉️ Significance: ${festival.significance}\n`;
      summary += `🙏 Deities: ${festival.deities}\n\n`;
    });

    summary += '*Auspicious Activities Today:*\n';
    const allActivities = [...new Set(festivals.flatMap(f => f.auspicious_activities))];
    allActivities.slice(0, 5).forEach(activity => {
      summary += `• ${activity}\n`;
    });

    summary += '\n🕉️ *Note:* Dates may vary slightly based on lunar calendar. Consult local panchang for exact timings.';

    return summary;
  }

  /**
   * Generate upcoming festivals summary
   * @param {Array} upcoming - Upcoming festivals
   * @returns {string} Summary text
   */
  generateUpcomingSummary(upcoming) {
    if (upcoming.length === 0) {
      return 'No major Hindu festivals in the next 30 days.';
    }

    let summary = '📅 *Upcoming Hindu Festivals*\n\n';
    summary += `Found ${upcoming.length} festival(s) in the next 30 days:\n\n`;

    upcoming.forEach(item => {
      summary += `*${item.date}:*\n`;
      item.festivals.forEach(festival => {
        summary += `• ${festival.name} (${festival.english})\n`;
      });
      summary += '\n';
    });

    summary += '🕉️ *Plan your activities around these auspicious occasions!*';

    return summary;
  }

  /**
   * Get Hindu festivals catalog
   * @returns {Object} Available services
   */
  getFestivalsCatalog() {
    return {
      festival_lookup: 'Get festivals for specific date',
      upcoming_festivals: 'Next 30 days festival calendar',
      festival_details: 'Detailed information about specific festival',
      auspicious_timings: 'Daily auspicious periods and muhurtas',
      festival_significance: 'Spiritual and cultural meaning of festivals'
    };
  }
}

module.exports = { HinduFestivals };
