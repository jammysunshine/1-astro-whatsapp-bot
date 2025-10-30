const logger = require('../../../utils/logger');

/**
 * NadiDataRepository - Repository for Nadi astrology knowledge and data
 * Contains all nakshatra definitions, nadi systems, dasha periods, and reference data
 */
class NadiDataRepository {
  constructor() {
    logger.info('NadiDataRepository: Knowledge repository initialized');
  }

  /**
   * Get all nakshatra definitions
   * @returns {Array} Array of 27 nakshatra objects
   */
  getNakshatras() {
    return [
      {
        name: 'Ashwini',
        rulingPlanet: 'Ketu',
        deity: 'Ashwini Kumaras',
        nature: 'Light'
      },
      {
        name: 'Bharani',
        rulingPlanet: 'Venus',
        deity: 'Yama',
        nature: 'Fierce'
      },
      { name: 'Krittika', rulingPlanet: 'Sun', deity: 'Agni', nature: 'Mixed' },
      {
        name: 'Rohini',
        rulingPlanet: 'Moon',
        deity: 'Brahma',
        nature: 'Fixed'
      },
      {
        name: 'Mrigashira',
        rulingPlanet: 'Mars',
        deity: 'Soma',
        nature: 'Soft'
      },
      { name: 'Ardra', rulingPlanet: 'Rahu', deity: 'Rudra', nature: 'Fierce' },
      {
        name: 'Punarvasu',
        rulingPlanet: 'Jupiter',
        deity: 'Aditi',
        nature: 'Moveable'
      },
      {
        name: 'Pushya',
        rulingPlanet: 'Saturn',
        deity: 'Brihaspati',
        nature: 'Light'
      },
      {
        name: 'Ashlesha',
        rulingPlanet: 'Mercury',
        deity: 'Nagadevata',
        nature: 'Fierce'
      },
      {
        name: 'Magha',
        rulingPlanet: 'Ketu',
        deity: 'Pitris',
        nature: 'Fierce'
      },
      {
        name: 'Purva Phalguni',
        rulingPlanet: 'Venus',
        deity: 'Bhaga',
        nature: 'Moveable'
      },
      {
        name: 'Uttara Phalguni',
        rulingPlanet: 'Sun',
        deity: 'Aryaman',
        nature: 'Fixed'
      },
      {
        name: 'Hasta',
        rulingPlanet: 'Moon',
        deity: 'Savitar',
        nature: 'Light'
      },
      {
        name: 'Chitra',
        rulingPlanet: 'Mars',
        deity: 'Vishwakarma',
        nature: 'Soft'
      },
      {
        name: 'Swati',
        rulingPlanet: 'Rahu',
        deity: 'Vayu',
        nature: 'Moveable'
      },
      {
        name: 'Vishakha',
        rulingPlanet: 'Jupiter',
        deity: 'Indra',
        nature: 'Mixed'
      },
      {
        name: 'Anuradha',
        rulingPlanet: 'Saturn',
        deity: 'Mitra',
        nature: 'Fierce'
      },
      {
        name: 'Jyeshtha',
        rulingPlanet: 'Mercury',
        deity: 'Indra',
        nature: 'Fierce'
      },
      {
        name: 'Mula',
        rulingPlanet: 'Ketu',
        deity: 'Nirriti',
        nature: 'Fierce'
      },
      {
        name: 'Purva Ashadha',
        rulingPlanet: 'Venus',
        deity: 'Apas',
        nature: 'Moveable'
      },
      {
        name: 'Uttara Ashadha',
        rulingPlanet: 'Sun',
        deity: 'Vishwadevas',
        nature: 'Fixed'
      },
      {
        name: 'Shravana',
        rulingPlanet: 'Moon',
        deity: 'Vishwakarma',
        nature: 'Moveable'
      },
      {
        name: 'Dhanishta',
        rulingPlanet: 'Mars',
        deity: 'Vasus',
        nature: 'Light'
      },
      {
        name: 'Shatabhisha',
        rulingPlanet: 'Rahu',
        deity: 'Varuna',
        nature: 'Fixed'
      },
      {
        name: 'Purva Bhadrapada',
        rulingPlanet: 'Jupiter',
        deity: 'Aja Ekapada',
        nature: 'Fierce'
      },
      {
        name: 'Uttara Bhadrapada',
        rulingPlanet: 'Saturn',
        deity: 'Ahir Budhnya',
        nature: 'Moveable'
      },
      {
        name: 'Revati',
        rulingPlanet: 'Mercury',
        deity: 'Pushan',
        nature: 'Soft'
      }
    ];
  }

  /**
   * Get nakshatra characteristics by name
   * @param {string} nakshatraName - Name of the nakshatra
   * @returns {string} Characteristics description
   */
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

  /**
   * Get health focus area for nakshatra
   * @param {string} nakshatraName - Name of the nakshatra
   * @returns {string} Health focus area
   */
  getNakshatraHealthFocus(nakshatraName) {
    const healthFocus = {
      Ashwini: 'head and nervous system',
      Bharani: 'reproductive system',
      Krittika: 'digestive system',
      Rohini: 'throat and neck',
      Mrigashira: 'respiratory system',
      Ardra: 'skin and nervous system',
      Punarvasu: 'lungs and digestive system',
      Pushya: 'stomach and digestive health',
      Ashlesha: 'digestive and nervous system',
      Magha: 'bones and skeletal system',
      'Purva Phalguni': 'reproductive and urinary system',
      'Uttara Phalguni': 'kidneys and urinary system',
      Hasta: 'hands and arms',
      Chitra: 'skin and blood circulation',
      Swati: 'veins and nervous system',
      Vishakha: 'intestines and excretory system',
      Anuradha: 'heart and circulatory system',
      Jyeshtha: 'ears and hearing',
      Mula: 'digestive and nervous system',
      'Purva Ashadha': 'joints and muscular system',
      'Uttara Ashadha': 'joints and muscular system',
      Shravana: 'ears and nervous system',
      Dhanishta: 'throat and speech',
      Shatabhisha: 'lower abdomen and excretory system',
      'Purva Bhadrapada': 'feet and lower limbs',
      'Uttara Bhadrapada': 'feet and lower limbs',
      Revati: 'feet and ankles'
    };
    return healthFocus[nakshatraName] || 'overall well-being and balance';
  }

  /**
   * Get Nadi systems definitions
   * @returns {Object} Nadi systems data
   */
  getNadiSystems() {
    return {
      adi: {
        name: 'Adi Nadi',
        characteristics: 'Leadership, independence, pioneering spirit',
        strengths: ['Leadership', 'Innovation', 'Independence'],
        challenges: ['Impatience', 'Stubbornness'],
        lifePurpose: 'To lead and innovate in chosen field'
      },
      Madhya: {
        name: 'Madhya Nadi',
        characteristics: 'Balance, harmony, diplomatic nature',
        strengths: ['Diplomacy', 'Balance', 'Harmony'],
        challenges: ['Indecisiveness', 'Over-accommodation'],
        lifePurpose: 'To bring harmony and balance to situations'
      },
      Antya: {
        name: 'Antya Nadi',
        characteristics: 'Service, compassion, spiritual inclination',
        strengths: ['Compassion', 'Service', 'Spirituality'],
        challenges: ['Self-sacrifice', 'Boundary issues'],
        lifePurpose: 'To serve others and contribute to greater good'
      }
    };
  }

  /**
   * Get Dasha periods definitions
   * @returns {Object} Dasha period data
   */
  getDashaPeriods() {
    return {
      sun: {
        duration: 6,
        characteristics: 'Leadership, authority, father figures, government'
      },
      moon: {
        duration: 10,
        characteristics: 'Emotions, mother, home, mental peace'
      },
      mars: {
        duration: 7,
        characteristics: 'Energy, courage, siblings, property'
      },
      mercury: {
        duration: 17,
        characteristics: 'Intelligence, communication, business, education'
      },
      jupiter: {
        duration: 16,
        characteristics: 'Wisdom, spirituality, children, prosperity'
      },
      venus: {
        duration: 20,
        characteristics: 'Love, marriage, luxury, arts, beauty'
      },
      saturn: {
        duration: 19,
        characteristics: 'Discipline, hard work, longevity, spirituality'
      },
      rahu: {
        duration: 18,
        characteristics: 'Ambition, foreign lands, unconventional path'
      },
      ketu: {
        duration: 7,
        characteristics: 'Spirituality, detachment, past life karma'
      }
    };
  }

  /**
   * Get dasha influence description
   * @param {string} planet - Planet name
   * @returns {string} Influence description
   */
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

  /**
   * Get nakshatra nakshatra-based remedies
   * @returns {Object} Remedies by nakshatra
   */
  getNakshatraRemedies() {
    return {
      Ashwini: ['Horse donation', 'White color offerings', 'Morning prayers'],
      Bharani: [
        'Yam mantra chanting',
        'Red color offerings',
        'Courage-building activities'
      ],
      Krittika: ['Fire rituals', 'Gold offerings', 'Leadership development'],
      Rohini: ['Brahma mantra', 'White flowers', 'Creative pursuits'],
      Mrigashira: ['Moon offerings', 'Green color', 'Emotional healing'],
      Ardra: ['Rudra prayers', 'Water offerings', 'Conflict resolution'],
      Punarvasu: ['Aditi worship', 'White clothes', 'Family harmony'],
      Pushya: ['Brihaspati prayers', 'Yellow offerings', 'Wisdom seeking'],
      Ashlesha: [
        'Snake offerings',
        'Copper items',
        'Communication improvement'
      ],
      Magha: ['Ancestor worship', 'Black color', 'Legacy building'],
      'Purva Phalguni': [
        'Bhaga prayers',
        'Red flowers',
        'Relationship healing'
      ],
      'Uttara Phalguni': [
        'Aryaman worship',
        'White offerings',
        'Justice pursuits'
      ],
      Hasta: ['Savitar prayers', 'Green color', 'Skill development'],
      Chitra: [
        'Vishwakarma worship',
        'Multi-color offerings',
        'Creative expression'
      ],
      Swati: ['Vayu prayers', 'Mixed colors', 'Balance seeking'],
      Vishakha: ['Indra worship', 'Purple offerings', 'Leadership roles'],
      Anuradha: ['Mitra prayers', 'Red color', 'Friendship building'],
      Jyeshtha: ['Indra worship', 'Blue color', 'Authority development'],
      Mula: ['Nirriti prayers', 'Black offerings', 'Transformation work'],
      'Purva Ashadha': ['Apas worship', 'Blue color', 'Emotional healing'],
      'Uttara Ashadha': [
        'Vishwadevas prayers',
        'Mixed colors',
        'Community service'
      ],
      Shravana: ['Vishwakarma worship', 'White color', 'Learning pursuits'],
      Dhanishta: ['Vasus prayers', 'Gold color', 'Prosperity rituals'],
      Shatabhisha: ['Varuna worship', 'Blue color', 'Healing practices'],
      'Purva Bhadrapada': [
        'Aja Ekapada prayers',
        'Purple color',
        'Spiritual growth'
      ],
      'Uttara Bhadrapada': [
        'Ahir Budhnya worship',
        'Mixed colors',
        'Wisdom seeking'
      ],
      Revati: ['Pushan prayers', 'Yellow color', 'Nurturing activities']
    };
  }

  /**
   * Get nadi system remedies
   * @param {string} nadiName - Nadi system name
   * @returns {Array} Remedies for nadi system
   */
  getNadiRemedies(nadiName) {
    const nadiRemedies = {
      'Adi Nadi': [
        'Leadership development workshops',
        'Independent decision making'
      ],
      'Madhya Nadi': ['Meditation for balance', 'Harmony-seeking activities'],
      'Antya Nadi': ['Service-oriented activities', 'Compassion practices']
    };
    return nadiRemedies[nadiName] || [];
  }

  /**
   * Get compatible nakshatras for a given nakshatra
   * @param {string} nakshatraName - Name of the nakshatra
   * @returns {Array} Array of compatible nakshatra names
   */
  getCompatibleNakshatras(nakshatraName) {
    const compatible = {
      Ashwini: ['Bharani', 'Pushya', 'Shravana'],
      Bharani: ['Ashwini', 'Rohini', 'Dhanishta'],
      Krittika: ['Uttara Phalguni', 'Uttara Ashadha'],
      Rohini: ['Bharani', 'Hasta', 'Shravana'],
      Mrigashira: ['Punarvasu', 'Anuradha', 'Revati'],
      Ardra: ['Swati', 'Shatabhisha'],
      Punarvasu: ['Mrigashira', 'Pushya', 'Uttara Bhadrapada'],
      Pushya: ['Ashwini', 'Punarvasu', 'Revati'],
      Ashlesha: ['Jyeshtha', 'Mula'],
      Magha: ['Purva Phalguni', 'Uttara Phalguni'],
      'Purva Phalguni': ['Magha', 'Uttara Phalguni', 'Dhanishta'],
      'Uttara Phalguni': ['Krittika', 'Purva Phalguni', 'Uttara Ashadha'],
      Hasta: ['Rohini', 'Chitra', 'Shravana'],
      Chitra: ['Hasta', 'Swati', 'Vishakha'],
      Swati: ['Ardra', 'Chitra', 'Anuradha'],
      Vishakha: ['Chitra', 'Jyeshtha', 'Purva Ashadha'],
      Anuradha: ['Mrigashira', 'Swati', 'Uttara Ashadha'],
      Jyeshtha: ['Ashlesha', 'Vishakha', 'Mula'],
      Mula: ['Ashlesha', 'Jyeshtha', 'Purva Ashadha'],
      'Purva Ashadha': ['Vishakha', 'Mula', 'Uttara Ashadha'],
      'Uttara Ashadha': ['Krittika', 'Anuradha', 'Purva Ashadha'],
      Shravana: ['Ashwini', 'Hasta', 'Dhanishta'],
      Dhanishta: ['Bharani', 'Purva Phalguni', 'Shravana'],
      Shatabhisha: ['Ardra', 'Purva Bhadrapada'],
      'Purva Bhadrapada': ['Shatabhisha', 'Uttara Bhadrapada', 'Revati'],
      'Uttara Bhadrapada': ['Punarvasu', 'Purva Bhadrapada'],
      Revati: ['Mrigashira', 'Pushya', 'Purva Bhadrapada']
    };
    return (
      compatible[nakshatraName] || [
        'Various nakshatras based on individual charts'
      ]
    );
  }

  /**
   * Get best matches for a given nakshatra
   * @param {string} nakshatraName - Name of the nakshatra
   * @returns {Array} Array of best match nakshatra names
   */
  getBestMatches(nakshatraName) {
    const bestMatches = {
      Ashwini: ['Pushya', 'Shravana'],
      Bharani: ['Rohini', 'Dhanishta'],
      Krittika: ['Uttara Phalguni'],
      Rohini: ['Hasta', 'Shravana'],
      Mrigashira: ['Anuradha', 'Revati'],
      Ardra: ['Swati'],
      Punarvasu: ['Pushya', 'Uttara Bhadrapada'],
      Pushya: ['Ashwini', 'Revati'],
      Ashlesha: ['Jyeshtha'],
      Magha: ['Purva Phalguni'],
      'Purva Phalguni': ['Magha', 'Dhanishta'],
      'Uttara Phalguni': ['Krittika'],
      Hasta: ['Rohini', 'Chitra'],
      Chitra: ['Hasta', 'Vishakha'],
      Swati: ['Anuradha'],
      Vishakha: ['Chitra', 'Purva Ashadha'],
      Anuradha: ['Mrigashira', 'Uttara Ashadha'],
      Jyeshtha: ['Ashlesha', 'Mula'],
      Mula: ['Jyeshtha', 'Purva Ashadha'],
      'Purva Ashadha': ['Vishakha', 'Uttara Ashadha'],
      'Uttara Ashadha': ['Anuradha', 'Purva Ashadha'],
      Shravana: ['Ashwini', 'Hasta'],
      Dhanishta: ['Bharani', 'Purva Phalguni'],
      Shatabhisha: ['Purva Bhadrapada'],
      'Purva Bhadrapada': ['Uttara Bhadrapada'],
      'Uttara Bhadrapada': ['Punarvasu'],
      Revati: ['Mrigashira', 'Pushya']
    };
    return (
      bestMatches[nakshatraName] || [
        'Compatible partners based on full chart analysis'
      ]
    );
  }

  /**
   * Get relationship advice for a nakshatra
   * @param {string} nakshatraName - Name of the nakshatra
   * @returns {string} Relationship advice
   */
  getRelationshipAdvice(nakshatraName) {
    return `Your ${nakshatraName} nakshatra suggests seeking partners who complement your natural tendencies and support your life purpose.`;
  }
}

module.exports = { NadiDataRepository };