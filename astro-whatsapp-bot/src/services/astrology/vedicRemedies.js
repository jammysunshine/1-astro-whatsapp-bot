/**
 * Vedic Remedies System - Comprehensive Astrological Remedies
 * Provides gemstones, mantras, charities, pujas, and yantras for planetary appeasement
 */

const logger = require('../../utils/logger');

class VedicRemedies {
  constructor() {
    logger.info('Module: VedicRemedies loaded.');
    this.initializeRemediesDatabase();
  }

  /**
   * Initialize comprehensive remedies database
   */
  initializeRemediesDatabase() {
    // Planetary Gemstones Database
    this.gemstones = {
      sun: {
        name: 'Ruby (Manik)',
        sanskrit: 'Manikya',
        color: 'Red',
        weight: '3-7 carats',
        finger: 'Ring finger',
        day: 'Sunday',
        metal: 'Gold',
        benefits: 'Power, authority, leadership, vitality, confidence',
        mantras: ['Om Suryaya Namaha', 'Om Adityaya Namaha'],
        precautions: 'Avoid wearing during solar eclipses, consult astrologer for exact weight'
      },
      moon: {
        name: 'Pearl (Moti)',
        sanskrit: 'Mukta',
        color: 'White/Cream',
        weight: '2-6 carats',
        finger: 'Little finger',
        day: 'Monday',
        metal: 'Silver',
        benefits: 'Emotional balance, mental peace, intuition, fertility, wealth',
        mantras: ['Om Chandraya Namaha', 'Om Somaya Namaha'],
        precautions: 'Avoid wearing during lunar eclipses, keep clean and pure'
      },
      mars: {
        name: 'Coral (Moonga)',
        sanskrit: 'Pravala',
        color: 'Red',
        weight: '3-7 carats',
        finger: 'Ring finger',
        day: 'Tuesday',
        metal: 'Gold/Silver',
        benefits: 'Courage, energy, vitality, property, siblings, marriage',
        mantras: ['Om Mangalaya Namaha', 'Om Angarakaya Namaha'],
        precautions: 'Avoid wearing during Mars retrograde, handle with care'
      },
      mercury: {
        name: 'Emerald (Panna)',
        sanskrit: 'Marakata',
        color: 'Green',
        weight: '2-5 carats',
        finger: 'Little finger',
        day: 'Wednesday',
        metal: 'Gold',
        benefits: 'Intelligence, communication, business, education, health',
        mantras: ['Om Budhaya Namaha', 'Om Soumyaya Namaha'],
        precautions: 'Avoid wearing during Mercury retrograde, ensure clarity'
      },
      jupiter: {
        name: 'Yellow Sapphire (Pukhraj)',
        sanskrit: 'Pushparaga',
        color: 'Yellow',
        weight: '3-7 carats',
        finger: 'Index finger',
        day: 'Thursday',
        metal: 'Gold',
        benefits: 'Wisdom, prosperity, children, spirituality, knowledge',
        mantras: ['Om Gurave Namaha', 'Om Brahmaputraya Namaha'],
        precautions: 'Avoid wearing during Jupiter retrograde, ensure honey color'
      },
      venus: {
        name: 'Diamond (Heera)',
        sanskrit: 'Vajra',
        color: 'Clear',
        weight: '0.5-2 carats',
        finger: 'Ring finger',
        day: 'Friday',
        metal: 'Platinum/Gold',
        benefits: 'Love, beauty, luxury, marriage, arts, wealth',
        mantras: ['Om Shukraya Namaha', 'Om Daityagurave Namaha'],
        precautions: 'Must be flawless, avoid wearing during Venus retrograde'
      },
      saturn: {
        name: 'Blue Sapphire (Neelam)',
        sanskrit: 'Neelam',
        color: 'Blue',
        weight: '3-7 carats',
        finger: 'Middle finger',
        day: 'Saturday',
        metal: 'Silver/Iron',
        benefits: 'Discipline, longevity, career, spiritual growth, justice',
        mantras: ['Om Shanaye Namaha', 'Om Sanaischaraya Namaha'],
        precautions: 'Must be cornflower blue, avoid during Sade Sati peak'
      },
      rahu: {
        name: 'Hessonite (Gomed)',
        sanskrit: 'Gomedh',
        color: 'Brown/Red',
        weight: '3-6 carats',
        finger: 'Middle finger',
        day: 'Saturday',
        metal: 'Silver',
        benefits: 'Protection from evil, foreign travel, unconventional success',
        mantras: ['Om Rahave Namaha', 'Om Sarpaya Namaha'],
        precautions: 'Avoid wearing during Rahu Mahadasha, handle carefully'
      },
      ketu: {
        name: 'Cat\'s Eye (Lehsunia)',
        sanskrit: 'Vaidurya',
        color: 'Gray/White',
        weight: '3-6 carats',
        finger: 'Middle finger',
        day: 'Tuesday',
        metal: 'Silver',
        benefits: 'Spiritual liberation, detachment, healing, intuition',
        mantras: ['Om Ketave Namaha', 'Om Chitravarnaya Namaha'],
        precautions: 'Rare and expensive, avoid during Ketu Mahadasha'
      }
    };

    // Planetary Mantras Database
    this.mantras = {
      sun: {
        beej: 'Om Hram Shum Shukraya Namaha',
        planetary: 'Om Suryaya Namaha',
        stotra: 'Aditya Hridayam',
        count: '7000 times',
        time: 'Sunrise',
        benefits: 'Removes Sun-related afflictions, improves health and authority'
      },
      moon: {
        beej: 'Om Shram Shreem Shraum Sah Chandraya Namaha',
        planetary: 'Om Somaya Namaha',
        stotra: 'Chandra Kavacham',
        count: '11000 times',
        time: 'Monday evening',
        benefits: 'Emotional healing, mental peace, family harmony'
      },
      mars: {
        beej: 'Om Kram Kreem Kroum Sah Bhaumaya Namaha',
        planetary: 'Om Angarakaya Namaha',
        stotra: 'Mangala Kavacham',
        count: '10000 times',
        time: 'Tuesday morning',
        benefits: 'Courage, energy, protection from accidents and enemies'
      },
      mercury: {
        beej: 'Om Bram Breem Broum Sah Budhaya Namaha',
        planetary: 'Om Budhaya Namaha',
        stotra: 'Budha Kavacham',
        count: '17000 times',
        time: 'Wednesday morning',
        benefits: 'Intelligence, communication skills, business success'
      },
      jupiter: {
        beej: 'Om Gram Greem Graum Sah Gurave Namaha',
        planetary: 'Om Gurave Namaha',
        stotra: 'Guru Kavacham',
        count: '16000 times',
        time: 'Thursday morning',
        benefits: 'Wisdom, prosperity, spiritual growth, children'
      },
      venus: {
        beej: 'Om Dram Dreem Droum Sah Shukraya Namaha',
        planetary: 'Om Shukraya Namaha',
        stotra: 'Shukra Kavacham',
        count: '16000 times',
        time: 'Friday evening',
        benefits: 'Love, beauty, luxury, artistic talents'
      },
      saturn: {
        beej: 'Om Pram Preem Proum Sah Shanaye Namaha',
        planetary: 'Om Shanaye Namaha',
        stotra: 'Shani Kavacham',
        count: '19000 times',
        time: 'Saturday evening',
        benefits: 'Discipline, longevity, protection from Sade Sati'
      },
      rahu: {
        beej: 'Om Bhram Bhreem Bhroum Sah Rahave Namaha',
        planetary: 'Om Rahave Namaha',
        stotra: 'Rahu Kavacham',
        count: '18000 times',
        time: 'Saturday night',
        benefits: 'Protection from evil influences, success in foreign lands'
      },
      ketu: {
        beej: 'Om Stram Streem Stroum Sah Ketave Namaha',
        planetary: 'Om Ketave Namaha',
        stotra: 'Ketu Kavacham',
        count: '17000 times',
        time: 'Tuesday night',
        benefits: 'Spiritual liberation, healing, detachment from material world'
      }
    };

    // Charity and Donation Database
    this.charities = {
      sun: {
        items: ['Wheat', 'Red flowers', 'Red cloth', 'Copper vessels', 'Gold'],
        places: ['Temples', 'Brahmins', 'Poor people', 'Cows'],
        days: ['Sundays'],
        benefits: 'Removes Sun afflictions, improves health and status'
      },
      moon: {
        items: ['Rice', 'White flowers', 'White cloth', 'Milk', 'Silver'],
        places: ['Temples', 'Old people', 'Widows', 'Rivers'],
        days: ['Mondays'],
        benefits: 'Emotional healing, family peace, mental clarity'
      },
      mars: {
        items: ['Red lentils', 'Red flowers', 'Red cloth', 'Copper', 'Blood donation'],
        places: ['Temples', 'Warriors', 'Poor people', 'Fire'],
        days: ['Tuesdays'],
        benefits: 'Reduces aggression, improves courage and vitality'
      },
      mercury: {
        items: ['Green grams', 'Green vegetables', 'Books', 'Pen/pencil', 'Emerald'],
        places: ['Temples', 'Students', 'Teachers', 'Poor children'],
        days: ['Wednesdays'],
        benefits: 'Improves intelligence, communication, and education'
      },
      jupiter: {
        items: ['Yellow items', 'Turmeric', 'Sweets', 'Gold', 'Books'],
        places: ['Temples', 'Brahmins', 'Teachers', 'Poor people'],
        days: ['Thursdays'],
        benefits: 'Wisdom, prosperity, spiritual growth, children'
      },
      venus: {
        items: ['White items', 'Perfumes', 'Clothes', 'Diamond', 'Silver'],
        places: ['Temples', 'Artists', 'Women', 'Poor people'],
        days: ['Fridays'],
        benefits: 'Love, beauty, luxury, artistic success'
      },
      saturn: {
        items: ['Black sesame', 'Black cloth', 'Iron items', 'Oil', 'Black grams'],
        places: ['Temples', 'Old people', 'Widows', 'Poor people'],
        days: ['Saturdays'],
        benefits: 'Reduces Saturn afflictions, improves longevity'
      },
      rahu: {
        items: ['Black items', 'Lead', 'Dark clothes', 'Radish', 'Garlic'],
        places: ['Temples', 'Snake charmers', 'Foreigners', 'Poor people'],
        days: ['Saturdays'],
        benefits: 'Protection from evil, success in foreign ventures'
      },
      ketu: {
        items: ['Brown items', 'Horse gram', 'Black dog food', 'Flags', 'Banners'],
        places: ['Temples', 'Dogs', 'Poor people', 'Spiritual organizations'],
        days: ['Tuesdays'],
        benefits: 'Spiritual liberation, healing, detachment'
      }
    };

    // Puja and Ritual Database
    this.pujas = {
      navagraha: {
        name: 'Navagraha Puja',
        planets: ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'],
        duration: '3-7 days',
        benefits: 'Overall planetary balance, removes multiple afflictions',
        requirements: ['Priest', 'Special materials', 'Sacred space']
      },
      shani: {
        name: 'Shani Sade Sati Nivaran Puja',
        planets: ['Saturn'],
        duration: '1-3 days',
        benefits: 'Protection during Sade Sati, reduces Saturn afflictions',
        requirements: ['Black sesame seeds', 'Iron nails', 'Black cloth', 'Priest']
      },
      kaal_sarp: {
        name: 'Kaal Sarp Dosha Nivaran Puja',
        planets: ['Rahu', 'Ketu'],
        duration: '1-2 days',
        benefits: 'Removes Kaal Sarp Dosha effects, brings prosperity',
        requirements: ['Snake images', 'Milk', 'Honey', 'Priest']
      },
      manglik: {
        name: 'Manglik Dosha Nivaran Puja',
        planets: ['Mars'],
        duration: '1 day',
        benefits: 'Reduces Manglik effects, smooth marriage',
        requirements: ['Red flowers', 'Red cloth', 'Copper vessels', 'Priest']
      },
      pitru: {
        name: 'Pitru Dosha Nivaran Puja',
        planets: ['Sun', 'Rahu', 'Ketu'],
        duration: '1-2 days',
        benefits: 'Ancestral blessings, removes Pitru Dosha',
        requirements: ['Water', 'Black sesame', 'Food offerings', 'Priest']
      }
    };

    // Yantra Database
    this.yantras = {
      navagraha: {
        name: 'Navagraha Yantra',
        purpose: 'Overall planetary protection and balance',
        material: 'Copper/Gold plate',
        installation: 'North-east corner facing east',
        worship: 'Daily puja with flowers, incense, and mantras',
        benefits: 'Harmonizes all planetary influences'
      },
      shani: {
        name: 'Shani Yantra',
        purpose: 'Protection from Saturn afflictions',
        material: 'Iron plate',
        installation: 'Southern direction',
        worship: 'Saturdays with black sesame and oil lamps',
        benefits: 'Reduces Sade Sati effects, brings discipline'
      },
      kaal_sarp: {
        name: 'Kaal Sarp Yantra',
        purpose: 'Removes Kaal Sarp Dosha',
        material: 'Copper plate',
        installation: 'Eastern direction',
        worship: 'Daily with snake motifs and offerings',
        benefits: 'Neutralizes Rahu-Ketu axis effects'
      },
      mahamrityunjaya: {
        name: 'Mahamrityunjaya Yantra',
        purpose: 'Protection from life-threatening situations',
        material: 'Gold/Silver plate',
        installation: 'Temple or sacred space',
        worship: 'Daily with Mahamrityunjaya mantra',
        benefits: 'Health protection, longevity, divine blessings'
      },
      vashikaran: {
        name: 'Vashikaran Yantra',
        purpose: 'Attraction and influence',
        material: 'Copper plate',
        installation: 'Private worship space',
        worship: 'With specific mantras and offerings',
        benefits: 'Positive influence, relationship harmony'
      }
    };
  }

  /**
   * Generate comprehensive remedies for a planet
   * @param {string} planet - Planet name (sun, moon, mars, etc.)
   * @returns {Object} Complete remedies package
   */
  generatePlanetRemedies(planet) {
    const planetKey = planet.toLowerCase();

    if (!this.gemstones[planetKey]) {
      return {
        error: `Remedies not available for planet: ${planet}`
      };
    }

    return {
      gemstone: this.gemstones[planetKey],
      mantra: this.mantras[planetKey],
      charity: this.charities[planetKey],
      summary: this.generateRemediesSummary(planetKey)
    };
  }

  /**
   * Generate remedies for specific doshas
   * @param {string} doshaType - Type of dosha (kaal_sarp, manglik, pitru, sade_sati)
   * @returns {Object} Dosha-specific remedies
   */
  generateDoshaRemedies(doshaType) {
    const remedies = {
      kaal_sarp: {
        gemstones: [this.gemstones.rahu, this.gemstones.ketu],
        mantras: [this.mantras.rahu, this.mantras.ketu],
        puja: this.pujas.kaal_sarp,
        yantra: this.yantras.kaal_sarp,
        charities: [this.charities.rahu, this.charities.ketu],
        special: {
          fasting: 'Saturdays and Tuesdays',
          offerings: 'Milk to snakes, black sesame to poor',
          rituals: 'Kaal Sarp Yantra installation'
        }
      },
      manglik: {
        gemstones: [this.gemstones.mars],
        mantras: [this.mantras.mars],
        puja: this.pujas.manglik,
        charities: [this.charities.mars],
        special: {
          fasting: 'Tuesdays',
          offerings: 'Red flowers, copper vessels',
          rituals: 'Mangal Chandika puja'
        }
      },
      pitru: {
        gemstones: [this.gemstones.sun, this.gemstones.rahu],
        mantras: [this.mantras.sun, this.mantras.rahu],
        puja: this.pujas.pitru,
        charities: [this.charities.sun, this.charities.rahu],
        special: {
          fasting: 'Amavasya (new moon)',
          offerings: 'Pinda daan, water to ancestors',
          rituals: 'Tarpan ceremony'
        }
      },
      sade_sati: {
        gemstones: [this.gemstones.saturn],
        mantras: [this.mantras.saturn],
        puja: this.pujas.shani,
        yantra: this.yantras.shani,
        charities: [this.charities.saturn],
        special: {
          fasting: 'Saturdays',
          offerings: 'Black sesame, iron items, oil lamps',
          rituals: 'Shani Shingnapur temple visit'
        }
      }
    };

    return remedies[doshaType] || {
      error: `Remedies not available for dosha: ${doshaType}`
    };
  }

  /**
   * Generate remedies summary for a planet
   * @param {string} planetKey - Planet key
   * @returns {string} Formatted summary
   */
  generateRemediesSummary(planetKey) {
    const gem = this.gemstones[planetKey];
    const mantra = this.mantras[planetKey];
    const charity = this.charities[planetKey];

    let summary = `🪐 *${gem.name} (${gem.sanskrit})*\n\n`;
    summary += '*Wearing Instructions:*\n';
    summary += `• Weight: ${gem.weight}\n`;
    summary += `• Finger: ${gem.finger}\n`;
    summary += `• Day: ${gem.day}\n`;
    summary += `• Metal: ${gem.metal}\n\n`;

    summary += `*Benefits:* ${gem.benefits}\n\n`;

    summary += '📿 *Mantras:*\n';
    summary += `• Beej: "${mantra.beej}"\n`;
    summary += `• Count: ${mantra.count}\n`;
    summary += `• Time: ${mantra.time}\n\n`;

    summary += '🙏 *Charities:*\n';
    summary += `• Items: ${charity.items.join(', ')}\n`;
    summary += `• Days: ${charity.days.join(', ')}\n`;
    summary += `• Places: ${charity.places.join(', ')}\n\n`;

    summary += `*Benefits:* ${charity.benefits}\n\n`;

    summary += `⚠️ *Precautions:* ${gem.precautions}\n\n`;
    summary += '🕉️ *Note:* Consult a qualified astrologer before starting any remedies. Results vary by individual chart.';

    return summary;
  }

  /**
   * Get all available remedies types
   * @returns {Object} Remedies catalog
   */
  getRemediesCatalog() {
    return {
      gemstones: Object.keys(this.gemstones),
      mantras: Object.keys(this.mantras),
      charities: Object.keys(this.charities),
      pujas: Object.keys(this.pujas),
      yantras: Object.keys(this.yantras),
      doshas: ['kaal_sarp', 'manglik', 'pitru', 'sade_sati']
    };
  }
}

module.exports = { VedicRemedies };
