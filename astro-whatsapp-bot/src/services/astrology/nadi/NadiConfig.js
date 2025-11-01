const logger = require('../../../utils/logger');

/**
 * NadiAstrology Configuration - Constants and data structures for Nadi Astrology
 */
class NadiConfig {
  constructor() {
    logger.info(
      'Module: NadiConfig loaded - Nadi Astrology constants and data'
    );
  }

  /**
   * Get complete Nadi Granthas (authentic ancient texts)
   */
  getNadiGranthas() {
    return {
      bhrigu_nadi: {
        name: 'Bhrigu Nadi',
        focus: 'Past life karma and current life predictions',
        predictions: 'Detailed life events, career, marriage, children'
      },
      sukra_nadi: {
        name: 'Sukra Nadi',
        focus: 'Marriage, relationships, and family life',
        predictions: 'Spouse description, marriage timing, family harmony'
      },
      siva_nadi: {
        name: 'Siva Nadi',
        focus: 'Spiritual path and liberation',
        predictions: 'Spiritual growth, enlightenment, divine purpose'
      },
      chandra_nadi: {
        name: 'Chandra Nadi',
        focus: 'Emotional life and mental health',
        predictions: 'Emotional patterns, psychological insights, healing'
      },
      surya_nadi: {
        name: 'Surya Nadi',
        focus: 'Leadership and authority',
        predictions: 'Leadership qualities, authority, social status'
      },
      mangal_nadi: {
        name: 'Mangal Nadi',
        focus: 'Courage and physical health',
        predictions: 'Physical strength, courage, health challenges'
      },
      budha_nadi: {
        name: 'Budha Nadi',
        focus: 'Intelligence and communication',
        predictions: 'Mental abilities, learning, teaching, writing'
      },
      guru_nadi: {
        name: 'Guru Nadi',
        focus: 'Wisdom and prosperity',
        predictions: 'Knowledge, wealth, teaching, spiritual guidance'
      },
      sani_nadi: {
        name: 'Sani Nadi',
        focus: 'Karma and discipline',
        predictions: 'Life lessons, discipline, longevity, detachment'
      },
      rahu_nadi: {
        name: 'Rahu Nadi',
        focus: 'Ambition and unconventional path',
        predictions: 'Foreign connections, innovation, transformation'
      },
      ketu_nadi: {
        name: 'Ketu Nadi',
        focus: 'Spirituality and liberation',
        predictions: 'Spiritual awakening, detachment, past life issues'
      }
    };
  }

  /**
   * Get authentic Nadi Nakshatra classifications
   */
  getNadiNakshatras() {
    return {
      ashwini: {
        category: '1-10',
        grantha: 'bhrigu_nadi',
        characteristics:
          'Born leaders, authoritative, successful in politics/business',
        compatibility: { adi: true, madhya: true, antya: false }
      },
      bharani: {
        category: '11-20',
        grantha: 'sukra_nadi',
        characteristics: 'Artistic inclinations, creative talents, passionate',
        compatibility: { adi: true, madhya: true, antya: true }
      },
      krittika: {
        category: '21-30',
        grantha: 'mangal_nadi',
        characteristics: 'Courageous, energetic, natural warriors',
        compatibility: { adi: false, madhya: true, antya: true }
      },
      rohini: {
        category: '31-40',
        grantha: 'bhrigu_nadi',
        characteristics: 'Beautiful, attractive, material success',
        compatibility: { adi: true, madhya: true, antya: false }
      },
      mrigashira: {
        category: '41-50',
        grantha: 'chandra_nadi',
        characteristics: 'Travel inclined, curious, seeker of knowledge',
        compatibility: { adi: true, madhya: true, antya: true }
      },
      ardra: {
        category: '51-60',
        grantha: 'rahu_nadi',
        characteristics: 'Transformative, intense, spiritual evolution',
        compatibility: { adi: false, madhya: true, antya: true }
      },
      punarvasu: {
        category: '61-70',
        grantha: 'guru_nadi',
        characteristics: 'Healing abilities, spiritual knowledge, rebirth',
        compatibility: { adi: true, madhya: true, antya: false }
      },
      pushya: {
        category: '71-80',
        grantha: 'surya_nadi',
        characteristics: 'Nourishing, caring, wealth accumulation',
        compatibility: { adi: true, madhya: true, antya: true }
      },
      ashlesha: {
        category: '81-90',
        grantha: 'ketu_nadi',
        characteristics: 'Intuitive, psychic, snake-like wisdom',
        compatibility: { adi: false, madhya: true, antya: true }
      },
      magha: {
        category: '91-100',
        grantha: 'sani_nadi',
        characteristics: 'Ancestral duties, leadership, serious-minded',
        compatibility: { adi: true, madhya: true, antya: false }
      },
      purva_phalguni: {
        category: '11-20',
        grantha: 'sukra_nadi',
        characteristics: 'Romantic, artistic, relationship oriented',
        compatibility: { adi: true, madhya: true, antya: true }
      },
      uttara_phalguni: {
        category: '21-30',
        grantha: 'surya_nadi',
        characteristics: 'Compassionate, healing, service oriented',
        compatibility: { adi: true, madhya: true, antya: false }
      },
      hasta: {
        category: '31-40',
        grantha: 'budha_nadi',
        characteristics: 'Skillful hands, craftsmanship, analytical',
        compatibility: { adi: true, madhya: true, antya: true }
      },
      chitra: {
        category: '41-50',
        grantha: 'mangal_nadi',
        characteristics: 'Artistically brilliant, construction inclined',
        compatibility: { adi: false, madhya: true, antya: true }
      },
      swati: {
        category: '51-60',
        grantha: 'rahu_nadi',
        characteristics: 'Balancing nature, diplomatic, independent',
        compatibility: { adi: true, madhya: true, antya: false }
      },
      vishakha: {
        category: '61-70',
        grantha: 'guru_nadi',
        characteristics: 'Goal-oriented, philosophical, structured',
        compatibility: { adi: true, madhya: true, antya: true }
      },
      anuradha: {
        category: '71-80',
        grantha: 'chandra_nadi',
        characteristics: 'Team worker, loyal, spiritually inclined',
        compatibility: { adi: true, madhya: true, antya: false }
      },
      jyeshtha: {
        category: '81-90',
        grantha: 'sani_nadi',
        characteristics: 'Senior nature, authoritative, protective',
        compatibility: { adi: false, madhya: true, antya: true }
      },
      mula: {
        category: '91-100',
        grantha: 'ketu_nadi',
        characteristics: 'Rooted wisdom, spiritual seeking, destruction',
        compatibility: { adi: true, madhya: true, antya: false }
      },
      purva_ashadha: {
        category: '11-20',
        grantha: 'rahu_nadi',
        characteristics: 'Victorious, fearless, non-materialistic',
        compatibility: { adi: true, madhya: true, antya: true }
      },
      uttara_ashadha: {
        category: '21-30',
        grantha: 'surya_nadi',
        characteristics: 'Ancestral pride, hardworking, goal-oriented',
        compatibility: { adi: true, madhya: true, antya: false }
      },
      shravana: {
        category: '31-40',
        grantha: 'chandra_nadi',
        characteristics: 'Listening nature, spiritual, research inclined',
        compatibility: { adi: true, madhya: true, antya: true }
      },
      dhanishta: {
        category: '41-50',
        grantha: 'mangal_nadi',
        characteristics: 'Wealthy, musical, energetic, fortunate',
        compatibility: { adi: false, madhya: true, antya: true }
      },
      shatabhisha: {
        category: '51-60',
        grantha: 'rahu_nadi',
        characteristics: 'Healing nature, mysterious, research oriented',
        compatibility: { adi: true, madhya: true, antya: false }
      },
      purva_bhadrapada: {
        category: '61-70',
        grantha: 'guru_nadi',
        characteristics: 'Spiritual, research oriented, unconventional',
        compatibility: { adi: true, madhya: true, antya: true }
      },
      uttara_bhadrapada: {
        category: '71-80',
        grantha: 'sani_nadi',
        characteristics: 'Artistic, spiritual, destructive creation',
        compatibility: { adi: true, madhya: true, antya: false }
      },
      revati: {
        category: '81-90',
        grantha: 'bhrigu_nadi',
        characteristics: 'Caring nature, loving, final liberation',
        compatibility: { adi: true, madhya: true, antya: true }
      }
    };
  }

  /**
   * Get Nadi matching system
   */
  getNadiMatching() {
    return {
      adi: {
        compatible: ['adi', 'madhya'],
        description: 'Dynamic and energetic - compatible with active types'
      },
      madhya: {
        compatible: ['adi', 'madhya', 'antya'],
        description: 'Balanced and harmonious - compatible with all types'
      },
      antya: {
        compatible: ['madhya', 'antya'],
        description: 'Peaceful and spiritual - compatible with calm types'
      }
    };
  }

  /**
   * Get Nadi Dosha definitions
   */
  getNadiDoshas() {
    return {
      nadi_dosha: {
        name: 'Nadi Dosha',
        cause: 'Same Nadi (Adi/Madhya/Antya) in both partners',
        effect: 'Health issues, financial problems, relationship conflicts',
        remedy: 'Marriage after age 28, special pujas, gemstone therapy'
      },
      gana_dosha: {
        name: 'Gana Dosha',
        cause: 'Incompatible Gana (Deva/Manushya/Rakshasa)',
        effect: 'Personality conflicts, communication issues',
        remedy: 'Understanding and compromise, counseling, spiritual practices'
      },
      bhakut_dosha: {
        name: 'Bhakut Dosha',
        cause: 'Planetary positions in 6th, 8th, 12th houses',
        effect: 'Financial difficulties, health issues, family problems',
        remedy: 'Kumbh Vivah ceremony, special mantras, charitable activities'
      }
    };
  }

  /**
   * Get nakshatra names array
   */
  getNakshatraNames() {
    return [
      'ashwini',
      'bharani',
      'krittika',
      'rohini',
      'mrigashira',
      'ardra',
      'punarvasu',
      'pushya',
      'ashlesha',
      'magha',
      'purva_phalguni',
      'uttara_phalguni',
      'hasta',
      'chitra',
      'swati',
      'vishakha',
      'anuradha',
      'jyeshtha',
      'mula',
      'purva_ashadha',
      'uttara_ashadha',
      'shravana',
      'dhanishta',
      'shatabhisha',
      'purva_bhadrapada',
      'uttara_bhadrapada',
      'revati'
    ];
  }
}

module.exports = { NadiConfig };
