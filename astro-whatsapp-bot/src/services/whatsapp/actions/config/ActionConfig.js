/**
 * Centralized configuration for WhatsApp actions
 * Provides action-specific settings, display names, error messages,
 * and feature requirements for consistent behavior across all actions.
 */

const ASTROLOGY_CONFIG = {
  // Astrology Actions Configuration
  get_daily_horoscope: {
    displayName: 'Daily Horoscope',
    requiredProfileFields: ['birthDate'],
    subscriptionFeature: 'horoscope_daily',
    cooldown: 300000, // 5 minutes
    errorMessages: {
      incomplete: 'Daily horoscopes require at least your birth date.',
      limitReached: 'You have reached your daily horoscope limit for today.'
    }
  },

  show_birth_chart: {
    displayName: 'Birth Chart',
    requiredProfileFields: ['birthDate', 'birthTime', 'birthPlace'],
    subscriptionFeature: 'birth_chart',
    cooldown: 600000, // 10 minutes
    errorMessages: {
      incomplete:
        'Birth charts require complete birth information: date, time, and place.',
      limitReached:
        'You have reached your birth chart generation limit for this month.'
    }
  },

  get_current_transits: {
    displayName: 'Current Transits',
    requiredProfileFields: ['birthDate', 'birthTime', 'birthPlace'],
    subscriptionFeature: 'transits_current',
    cooldown: 1800000, // 30 minutes
    errorMessages: {
      incomplete: 'Current transits require complete birth information.',
      limitReached: 'You have reached your transit analysis limit for today.'
    }
  },

  start_couple_compatibility_flow: {
    displayName: 'Couple Compatibility',
    requiredProfileFields: ['birthDate', 'birthTime'],
    subscriptionFeature: 'compatibility_couple',
    cooldown: 300000, // 5 minutes
    errorMessages: {
      incomplete:
        'Compatibility analysis requires birth date and time for both partners.',
      limitReached: 'You have reached your compatibility analysis limit.'
    }
  },

  get_hindu_festivals_info: {
    displayName: 'Hindu Festivals',
    requiredProfileFields: [],
    subscriptionFeature: 'festivals_hindu',
    cooldown: 86400000, // 24 hours
    errorMessages: {
      incomplete: '', // No profile requirements
      limitReached: 'Festival information updates daily.'
    }
  },

  get_synastry_analysis: {
    displayName: 'Relationship Synastry',
    requiredProfileFields: ['birthDate', 'birthTime', 'birthPlace'],
    subscriptionFeature: 'synastry_relationship',
    cooldown: 3600000, // 1 hour
    errorMessages: {
      incomplete:
        'Relationship synastry requires complete birth information for both partners.',
      limitReached: 'You have reached your relationship analysis limit.'
    }
  },

  get_vimshottari_dasha_analysis: {
    displayName: 'Vimshottari Dasha',
    requiredProfileFields: ['birthDate', 'birthTime', 'birthPlace'],
    subscriptionFeature: 'dasha_vimshottari',
    cooldown: 3600000, // 1 hour
    errorMessages: {
      incomplete: 'Dasha analysis requires complete birth information.',
      limitReached: 'You have reached your planetary period analysis limit.'
    }
  },

  get_numerology_analysis: {
    displayName: 'Numerology Analysis',
    requiredProfileFields: ['birthDate'],
    subscriptionFeature: 'numerology_analysis',
    cooldown: 1800000, // 30 minutes
    errorMessages: {
      incomplete: 'Numerology analysis requires your birth date.',
      limitReached: 'You have reached your numerology analysis limit.'
    }
  },

  get_ashtakavarga_analysis: {
    displayName: 'Ashtakavarga Analysis',
    requiredProfileFields: ['birthDate', 'birthTime', 'birthPlace'],
    subscriptionFeature: 'ashtakavarga_analysis',
    cooldown: 3600000, // 1 hour
    errorMessages: {
      incomplete: 'Ashtakavarga analysis requires complete birth information.',
      limitReached: 'You have reached your Vedic strength analysis limit.'
    }
  },

  get_varga_charts_analysis: {
    displayName: 'Varga Chart Analysis',
    requiredProfileFields: ['birthDate', 'birthTime', 'birthPlace'],
    subscriptionFeature: 'varga_charts',
    cooldown: 3600000, // 1 hour
    errorMessages: {
      incomplete: 'Varga chart analysis requires complete birth information.',
      limitReached: 'You have reached your divisional chart analysis limit.'
    }
  },

  get_tarot_reading: {
    displayName: 'Tarot Reading',
    requiredProfileFields: ['birthDate'],
    subscriptionFeature: 'tarot_reading',
    cooldown: 1800000, // 30 minutes
    errorMessages: {
      incomplete: 'Tarot readings require at least your birth date.',
      limitReached: 'You have reached your tarot reading limit for today.'
    }
  },

  get_iching_reading: {
    displayName: 'I Ching Reading',
    requiredProfileFields: [],
    subscriptionFeature: 'iching_reading',
    cooldown: 1800000, // 30 minutes
    errorMessages: {
      incomplete: '', // No profile requirements
      limitReached: 'You have reached your I Ching consultation limit.'
    }
  },

  get_muhurta_analysis: {
    displayName: 'Muhurta Analysis',
    requiredProfileFields: [],
    subscriptionFeature: 'muhurta_analysis',
    cooldown: 3600000, // 1 hour
    errorMessages: {
      incomplete: '', // No profile requirements
      limitReached: 'You have reached your auspicious time analysis limit.'
    }
  },

  get_secondary_progressions: {
    displayName: 'Secondary Progressions',
    requiredProfileFields: ['birthDate', 'birthTime', 'birthPlace'],
    subscriptionFeature: 'progressions_secondary',
    cooldown: 3600000, // 1 hour
    errorMessages: {
      incomplete: 'Secondary progressions require complete birth information.',
      limitReached: 'You have reached your progressed chart analysis limit.'
    }
  },

  get_solar_return_analysis: {
    displayName: 'Solar Return Analysis',
    requiredProfileFields: ['birthDate', 'birthTime', 'birthPlace'],
    subscriptionFeature: 'solar_return_analysis',
    cooldown: 3600000, // 1 hour
    errorMessages: {
      incomplete: 'Solar return analysis requires complete birth information.',
      limitReached: 'You have reached your annual chart analysis limit.'
    }
  },

  get_traditional_horary: {
    displayName: 'Traditional Horary Astrology',
    requiredProfileFields: [],
    subscriptionFeature: 'horary_traditional',
    cooldown: 1800000, // 30 minutes
    errorMessages: {
      incomplete:
        'Horary charts are cast at the precise moment you ask your question.',
      limitReached:
        'Each genuine question deserves careful timing. Try again later.'
    }
  },
  // NEW ASTROLOGY ACTIONS
  calculateCompatibilityScore: {
    displayName: 'Overall Compatibility Score',
    requiredProfileFields: ['birthDate', 'birthTime', 'birthPlace'],
    subscriptionFeature: 'compatibility_score',
    cooldown: 300000, // 5 minutes
    errorMessages: {
      incomplete: 'Compatibility score requires complete birth information for both partners.',
      limitReached: 'You have reached your compatibility score limit.'
    }
  },
  calculateNakshatraPorutham: {
    displayName: 'Nakshatra Matching',
    requiredProfileFields: ['birthDate', 'birthTime', 'birthPlace'],
    subscriptionFeature: 'nakshatra_matching',
    cooldown: 300000, // 5 minutes
    errorMessages: {
      incomplete: 'Nakshatra matching requires complete birth information for both partners.',
      limitReached: 'You have reached your nakshatra matching limit.'
    }
  },
  start_family_astrology_flow: {
    displayName: 'Family Astrology',
    requiredProfileFields: ['birthDate', 'birthTime', 'birthPlace'],
    subscriptionFeature: 'family_astrology',
    cooldown: 3600000, // 1 hour
    errorMessages: {
      incomplete: 'Family astrology requires complete birth information for all members.',
      limitReached: 'You have reached your family astrology analysis limit.'
    }
  },
  start_business_partnership_flow: {
    displayName: 'Business Partnership',
    requiredProfileFields: ['birthDate', 'birthTime', 'birthPlace'],
    subscriptionFeature: 'business_partnership',
    cooldown: 3600000, // 1 hour
    errorMessages: {
      incomplete: 'Business partnership analysis requires complete birth information for all partners.',
      limitReached: 'You have reached your business partnership analysis limit.'
    }
  },
  start_group_timing_flow: {
    displayName: 'Group Event Timing',
    requiredProfileFields: ['birthDate', 'birthTime', 'birthPlace'],
    subscriptionFeature: 'group_timing',
    cooldown: 3600000, // 1 hour
    errorMessages: {
      incomplete: 'Group event timing requires complete birth information for all members and event details.',
      limitReached: 'You have reached your group timing analysis limit.'
    }
  },
  get_lunar_return: {
    displayName: 'Lunar Return',
    requiredProfileFields: ['birthDate', 'birthTime', 'birthPlace'],
    subscriptionFeature: 'lunar_return',
    cooldown: 3600000, // 1 hour
    errorMessages: {
      incomplete: 'Lunar return analysis requires complete birth information.',
      limitReached: 'You have reached your lunar return analysis limit.'
    }
  },
  get_future_self_analysis: {
    displayName: 'Future Self Analysis',
    requiredProfileFields: ['birthDate', 'birthTime', 'birthPlace'],
    subscriptionFeature: 'future_self_analysis',
    cooldown: 3600000, // 1 hour
    errorMessages: {
      incomplete: 'Future self analysis requires complete birth information.',
      limitReached: 'You have reached your future self analysis limit.'
    }
  },
  get_electional_astrology: {
    displayName: 'Electional Astrology',
    requiredProfileFields: [],
    subscriptionFeature: 'electional_astrology',
    cooldown: 3600000, // 1 hour
    errorMessages: {
      incomplete: '',
      limitReached: 'You have reached your electional astrology limit.'
    }
  },
  get_mundane_astrology_analysis: {
    displayName: 'Mundane Astrology',
    requiredProfileFields: [],
    subscriptionFeature: 'mundane_astrology',
    cooldown: 3600000, // 1 hour
    errorMessages: {
      incomplete: '',
      limitReached: 'You have reached your mundane astrology analysis limit.'
    }
  },
  generateDetailedChartAnalysis: {
    displayName: 'Detailed Chart Analysis',
    requiredProfileFields: ['birthDate', 'birthTime', 'birthPlace'],
    subscriptionFeature: 'detailed_chart_analysis',
    cooldown: 3600000, // 1 hour
    errorMessages: {
      incomplete: 'Detailed chart analysis requires complete birth information.',
      limitReached: 'You have reached your detailed chart analysis limit.'
    }
  },
  generateBasicBirthChart: {
    displayName: 'Basic Birth Chart',
    requiredProfileFields: ['birthDate', 'birthTime', 'birthPlace'],
    subscriptionFeature: 'basic_birth_chart',
    cooldown: 600000, // 10 minutes
    errorMessages: {
      incomplete: 'Basic birth chart requires complete birth information.',
      limitReached: 'You have reached your basic birth chart limit.'
    }
  },
  generateWesternBirthChart: {
    displayName: 'Western Birth Chart',
    requiredProfileFields: ['birthDate', 'birthTime', 'birthPlace'],
    subscriptionFeature: 'western_birth_chart',
    cooldown: 600000, // 10 minutes
    errorMessages: {
      incomplete: 'Western birth chart requires complete birth information.',
      limitReached: 'You have reached your Western birth chart limit.'
    }
  },
  calculateSunSign: {
    displayName: 'Sun Sign Analysis',
    requiredProfileFields: ['birthDate'],
    subscriptionFeature: 'sun_sign_analysis',
    cooldown: 300000, // 5 minutes
    errorMessages: {
      incomplete: 'Sun sign analysis requires your birth date.',
      limitReached: 'You have reached your sun sign analysis limit.'
    }
  },
  calculateMoonSign: {
    displayName: 'Moon Sign Analysis',
    requiredProfileFields: ['birthDate', 'birthTime', 'birthPlace'],
    subscriptionFeature: 'moon_sign_analysis',
    cooldown: 300000, // 5 minutes
    errorMessages: {
      incomplete: 'Moon sign analysis requires complete birth information.',
      limitReached: 'You have reached your moon sign analysis limit.'
    }
  },
  calculateRisingSign: {
    displayName: 'Rising Sign (Lagna)',
    requiredProfileFields: ['birthDate', 'birthTime', 'birthPlace'],
    subscriptionFeature: 'rising_sign_analysis',
    cooldown: 300000, // 5 minutes
    errorMessages: {
      incomplete: 'Rising sign analysis requires complete birth information.',
      limitReached: 'You have reached your rising sign analysis limit.'
    }
  },
  calculateNakshatra: {
    displayName: 'Nakshatra Analysis',
    requiredProfileFields: ['birthDate', 'birthTime', 'birthPlace'],
    subscriptionFeature: 'nakshatra_analysis',
    cooldown: 300000, // 5 minutes
    errorMessages: {
      incomplete: 'Nakshatra analysis requires complete birth information.',
      limitReached: 'You have reached your nakshatra analysis limit.'
    }
  },
  calculateCurrentDasha: {
    displayName: 'Current Dasha Analysis',
    requiredProfileFields: ['birthDate', 'birthTime', 'birthPlace'],
    subscriptionFeature: 'current_dasha_analysis',
    cooldown: 300000, // 5 minutes
    errorMessages: {
      incomplete: 'Current Dasha analysis requires complete birth information.',
      limitReached: 'You have reached your current Dasha analysis limit.'
    }
  },
  calculateUpcomingDashas: {
    displayName: 'Upcoming Dashas',
    requiredProfileFields: ['birthDate', 'birthTime', 'birthPlace'],
    subscriptionFeature: 'upcoming_dashas',
    cooldown: 3600000, // 1 hour
    errorMessages: {
      incomplete: 'Upcoming Dashas requires complete birth information.',
      limitReached: 'You have reached your upcoming Dashas limit.'
    }
  },
  calculateAntardasha: {
    displayName: 'Antardasha Breakdown',
    requiredProfileFields: ['birthDate', 'birthTime', 'birthPlace'],
    subscriptionFeature: 'antardasha_breakdown',
    cooldown: 3600000, // 1 hour
    errorMessages: {
      incomplete: 'Antardasha breakdown requires complete birth information.',
      limitReached: 'You have reached your antardasha breakdown limit.'
    }
  },
  calculateJaiminiAstrology: {
    displayName: 'Jaimini Astrology',
    requiredProfileFields: ['birthDate', 'birthTime', 'birthPlace'],
    subscriptionFeature: 'jaimini_astrology',
    cooldown: 3600000, // 1 hour
    errorMessages: {
      incomplete: 'Jaimini astrology requires complete birth information.',
      limitReached: 'You have reached your Jaimini astrology limit.'
    }
  },
  calculateJaiminiDashas: {
    displayName: 'Jaimini Dashas',
    requiredProfileFields: ['birthDate', 'birthTime', 'birthPlace'],
    subscriptionFeature: 'jaimini_dashas',
    cooldown: 3600000, // 1 hour
    errorMessages: {
      incomplete: 'Jaimini Dashas requires complete birth information.',
      limitReached: 'You have reached your Jaimini Dashas limit.'
    }
  },
  calculateGochar: {
    displayName: 'Gochar (Transits)',
    requiredProfileFields: ['birthDate', 'birthTime', 'birthPlace'],
    subscriptionFeature: 'gochar_transits',
    cooldown: 300000, // 5 minutes
    errorMessages: {
      incomplete: 'Gochar analysis requires complete birth information.',
      limitReached: 'You have reached your Gochar analysis limit.'
    }
  },
  calculateSolarReturn: {
    displayName: 'Solar Return Analysis',
    requiredProfileFields: ['birthDate', 'birthTime', 'birthPlace'],
    subscriptionFeature: 'solar_return_analysis',
    cooldown: 3600000, // 1 hour
    errorMessages: {
      incomplete: 'Solar return analysis requires complete birth information.',
      limitReached: 'You have reached your annual chart analysis limit.'
    }
  },
  calculateVarshaphal: {
    displayName: 'Varshaphal (Annual Chart)',
    requiredProfileFields: ['birthDate', 'birthTime', 'birthPlace'],
    subscriptionFeature: 'varshaphal_analysis',
    cooldown: 3600000, // 1 hour
    errorMessages: {
      incomplete: 'Varshaphal analysis requires complete birth information.',
      limitReached: 'You have reached your Varshaphal analysis limit.'
    }
  },
  calculateSecondaryProgressions: {
    displayName: 'Secondary Progressions',
    requiredProfileFields: ['birthDate', 'birthTime', 'birthPlace'],
    subscriptionFeature: 'secondary_progressions',
    cooldown: 3600000, // 1 hour
    errorMessages: {
      incomplete: 'Secondary progressions require complete birth information.',
      limitReached: 'You have reached your progressed chart analysis limit.'
    }
  },
  calculateSolarArcDirections: {
    displayName: 'Solar Arc Directions',
    requiredProfileFields: ['birthDate', 'birthTime', 'birthPlace'],
    subscriptionFeature: 'solar_arc_directions',
    cooldown: 3600000, // 1 hour
    errorMessages: {
      incomplete: 'Solar arc directions require complete birth information.',
      limitReached: 'You have reached your solar arc directions limit.'
    }
  },
  calculateEnhancedSecondaryProgressions: {
    displayName: 'Enhanced Secondary Progressions',
    requiredProfileFields: ['birthDate', 'birthTime', 'birthPlace'],
    subscriptionFeature: 'enhanced_secondary_progressions',
    cooldown: 3600000, // 1 hour
    errorMessages: {
      incomplete: 'Enhanced secondary progressions require complete birth information.',
      limitReached: 'You have reached your enhanced progressed chart analysis limit.'
    }
  },
  calculateEnhancedSolarArcDirections: {
    displayName: 'Enhanced Solar Arc Directions',
    requiredProfileFields: ['birthDate', 'birthTime', 'birthPlace'],
    subscriptionFeature: 'enhanced_solar_arc_directions',
    cooldown: 3600000, // 1 hour
    errorMessages: {
      incomplete: 'Enhanced solar arc directions require complete birth information.',
      limitReached: 'You have reached your enhanced solar arc directions limit.'
    }
  },
  calculateNextSignificantTransits: {
    displayName: 'Next Significant Transits',
    requiredProfileFields: ['birthDate', 'birthTime', 'birthPlace'],
    subscriptionFeature: 'next_significant_transits',
    cooldown: 300000, // 5 minutes
    errorMessages: {
      incomplete: 'Next significant transits require complete birth information.',
      limitReached: 'You have reached your next significant transits limit.'
    }
  },
  calculateAdvancedTransits: {
    displayName: 'Advanced Transits',
    requiredProfileFields: ['birthDate', 'birthTime', 'birthPlace'],
    subscriptionFeature: 'advanced_transits',
    cooldown: 3600000, // 1 hour
    errorMessages: {
      incomplete: 'Advanced transits require complete birth information.',
      limitReached: 'You have reached your advanced transits limit.'
    }
  },
  identifyMajorTransits: {
    displayName: 'Identify Major Transits',
    requiredProfileFields: ['birthDate', 'birthTime', 'birthPlace'],
    subscriptionFeature: 'major_transits',
    cooldown: 3600000, // 1 hour
    errorMessages: {
      incomplete: 'Major transits identification requires complete birth information.',
      limitReached: 'You have reached your major transits identification limit.'
    }
  },
  generateTransitPreview: {
    displayName: 'Transit Preview',
    requiredProfileFields: ['birthDate', 'birthTime', 'birthPlace'],
    subscriptionFeature: 'transit_preview',
    cooldown: 300000, // 5 minutes
    errorMessages: {
      incomplete: 'Transit preview requires complete birth information.',
      limitReached: 'You have reached your transit preview limit.'
    }
  },
  calculateCompositeChart: {
    displayName: 'Composite Chart',
    requiredProfileFields: ['birthDate', 'birthTime', 'birthPlace'],
    subscriptionFeature: 'composite_chart',
    cooldown: 3600000, // 1 hour
    errorMessages: {
      incomplete: 'Composite chart requires complete birth information for both partners.',
      limitReached: 'You have reached your composite chart limit.'
    }
  },
  calculateDavisonChart: {
    displayName: 'Davison Chart',
    requiredProfileFields: ['birthDate', 'birthTime', 'birthPlace'],
    subscriptionFeature: 'davison_chart',
    cooldown: 3600000, // 1 hour
    errorMessages: {
      incomplete: 'Davison chart requires complete birth information for both partners.',
      limitReached: 'You have reached your Davison chart limit.'
    }
  },
  generateGroupAstrology: {
    displayName: 'Group Astrology',
    requiredProfileFields: ['birthDate', 'birthTime', 'birthPlace'],
    subscriptionFeature: 'group_astrology',
    cooldown: 3600000, // 1 hour
    errorMessages: {
      incomplete: 'Group astrology requires complete birth information for all members.',
      limitReached: 'You have reached your group astrology limit.'
    }
  },
  calculateVedicYogas: {
    displayName: 'Vedic Yogas',
    requiredProfileFields: ['birthDate', 'birthTime', 'birthPlace'],
    subscriptionFeature: 'vedic_yogas',
    cooldown: 3600000, // 1 hour
    errorMessages: {
      incomplete: 'Vedic yogas analysis requires complete birth information.',
      limitReached: 'You have reached your Vedic yogas limit.'
    }
  },
  calculateAsteroids: {
    displayName: 'Asteroid Analysis',
    requiredProfileFields: ['birthDate', 'birthTime', 'birthPlace'],
    subscriptionFeature: 'asteroid_analysis',
    cooldown: 3600000, // 1 hour
    errorMessages: {
      incomplete: 'Asteroid analysis requires complete birth information.',
      limitReached: 'You have reached your asteroid analysis limit.'
    }
  },
  generateComprehensiveVedicAnalysis: {
    displayName: 'Comprehensive Vedic Analysis',
    requiredProfileFields: ['birthDate', 'birthTime', 'birthPlace'],
    subscriptionFeature: 'comprehensive_vedic_analysis',
    cooldown: 3600000, // 1 hour
    errorMessages: {
      incomplete: 'Comprehensive Vedic analysis requires complete birth information.',
      limitReached: 'You have reached your comprehensive Vedic analysis limit.'
    }
  },
  generateFutureSelfSimulator: {
    displayName: 'Future Self Simulator',
    requiredProfileFields: ['birthDate', 'birthTime', 'birthPlace'],
    subscriptionFeature: 'future_self_simulator',
    cooldown: 3600000, // 1 hour
    errorMessages: {
      incomplete: 'Future self simulator requires complete birth information.',
      limitReached: 'You have reached your future self simulator limit.'
    }
  },
  get_ayurvedic_astrology_analysis: {
    displayName: 'Ayurvedic Astrology',
    requiredProfileFields: ['birthDate', 'birthTime', 'birthPlace'],
    subscriptionFeature: 'ayurvedic_astrology',
    cooldown: 3600000, // 1 hour
    errorMessages: {
      incomplete: 'Ayurvedic astrology requires complete birth information.',
      limitReached: 'You have reached your Ayurvedic astrology limit.'
    }
  },
  generateLifePatterns: {
    displayName: 'Life Patterns Analysis',
    requiredProfileFields: ['birthDate', 'birthTime', 'birthPlace'],
    subscriptionFeature: 'life_patterns_analysis',
    cooldown: 3600000, // 1 hour
    errorMessages: {
      incomplete: 'Life patterns analysis requires complete birth information.',
      limitReached: 'You have reached your life patterns analysis limit.'
    }
  },
  get_panchang_analysis: {
    displayName: 'Panchang (Hindu Calendar)',
    requiredProfileFields: [],
    subscriptionFeature: 'panchang_analysis',
    cooldown: 300000, // 5 minutes
    errorMessages: {
      incomplete: '',
      limitReached: 'You have reached your Panchang analysis limit.'
    }
  },
  calculateAbhijitMuhurta: {
    displayName: 'Abhijit Muhurta',
    requiredProfileFields: ['birthDate', 'birthTime', 'birthPlace'],
    subscriptionFeature: 'abhijit_muhurta',
    cooldown: 300000, // 5 minutes
    errorMessages: {
      incomplete: 'Abhijit Muhurta requires complete birth information.',
      limitReached: 'You have reached your Abhijit Muhurta limit.'
    }
  },
  calculateRahukalam: {
    displayName: 'Rahukalam',
    requiredProfileFields: ['birthDate', 'birthTime', 'birthPlace'],
    subscriptionFeature: 'rahukalam',
    cooldown: 300000, // 5 minutes
    errorMessages: {
      incomplete: 'Rahukalam requires complete birth information.',
      limitReached: 'You have reached your Rahukalam limit.'
    }
  },
  calculateGulikakalam: {
    displayName: 'Gulikakalam',
    requiredProfileFields: ['birthDate', 'birthTime', 'birthPlace'],
    subscriptionFeature: 'gulikakalam',
    cooldown: 300000, // 5 minutes
    errorMessages: {
      incomplete: 'Gulikakalam requires complete birth information.',
      limitReached: 'You have reached your Gulikakalam limit.'
    }
  },
  calculateCosmicEvents: {
    displayName: 'Cosmic Events',
    requiredProfileFields: [],
    subscriptionFeature: 'cosmic_events',
    cooldown: 3600000, // 1 hour
    errorMessages: {
      incomplete: '',
      limitReached: 'You have reached your cosmic events limit.'
    }
  },
  generateEphemerisTable: {
    displayName: 'Ephemeris Table',
    requiredProfileFields: [],
    subscriptionFeature: 'ephemeris_table',
    cooldown: 3600000, // 1 hour
    errorMessages: {
      incomplete: '',
      limitReached: 'You have reached your ephemeris table limit.'
    }
  },
  calculateUpcomingSeasonalEvents: {
    displayName: 'Upcoming Seasonal Events',
    requiredProfileFields: [],
    subscriptionFeature: 'seasonal_events',
    cooldown: 3600000, // 1 hour
    errorMessages: {
      incomplete: '',
      limitReached: 'You have reached your seasonal events limit.'
    }
  },
  calculateUpcomingPlanetaryEvents: {
    displayName: 'Upcoming Planetary Events',
    requiredProfileFields: [],
    subscriptionFeature: 'planetary_events',
    cooldown: 3600000, // 1 hour
    errorMessages: {
      incomplete: '',
      limitReached: 'You have reached your planetary events limit.'
    }
  },
  get_vedic_remedies_info: {
    displayName: 'Vedic Remedies',
    requiredProfileFields: ['birthDate', 'birthTime', 'birthPlace'],
    subscriptionFeature: 'vedic_remedies',
    cooldown: 3600000, // 1 hour
    errorMessages: {
      incomplete: 'Vedic remedies require complete birth information.',
      limitReached: 'You have reached your Vedic remedies limit.'
    }
  },
  generateKaalSarpDosha: {
    displayName: 'Kaal Sarp Dosha',
    requiredProfileFields: ['birthDate', 'birthTime', 'birthPlace'],
    subscriptionFeature: 'kaal_sarp_dosha',
    cooldown: 3600000, // 1 hour
    errorMessages: {
      incomplete: 'Kaal Sarp Dosha analysis requires complete birth information.',
      limitReached: 'You have reached your Kaal Sarp Dosha limit.'
    }
  },
  generateSadeSatiAnalysis: {
    displayName: 'Sade Sati Analysis',
    requiredProfileFields: ['birthDate', 'birthTime', 'birthPlace'],
    subscriptionFeature: 'sade_sati_analysis',
    cooldown: 3600000, // 1 hour
    errorMessages: {
      incomplete: 'Sade Sati analysis requires complete birth information.',
      limitReached: 'You have reached your Sade Sati analysis limit.'
    }
  },
  get_divination_reading: {
    displayName: 'General Divination Reading',
    requiredProfileFields: [],
    subscriptionFeature: 'divination_reading',
    cooldown: 1800000, // 30 minutes
    errorMessages: {
      incomplete: '',
      limitReached: 'You have reached your divination reading limit.'
    }
  },
  show_chinese_flow: {
    displayName: 'Chinese Bazi (Four Pillars)',
    requiredProfileFields: ['birthDate', 'birthTime', 'birthPlace'],
    subscriptionFeature: 'chinese_bazi',
    cooldown: 3600000, // 1 hour
    errorMessages: {
      incomplete: 'Chinese Bazi requires complete birth information.',
      limitReached: 'You have reached your Chinese Bazi limit.'
    }
  },
  get_mayan_analysis: {
    displayName: 'Mayan Astrology',
    requiredProfileFields: ['birthDate'],
    subscriptionFeature: 'mayan_astrology',
    cooldown: 3600000, // 1 hour
    errorMessages: {
      incomplete: 'Mayan astrology requires your birth date.',
      limitReached: 'You have reached your Mayan astrology limit.'
    }
  },
  get_celtic_analysis: {
    displayName: 'Celtic Tree Astrology',
    requiredProfileFields: ['birthDate'],
    subscriptionFeature: 'celtic_astrology',
    cooldown: 3600000, // 1 hour
    errorMessages: {
      incomplete: 'Celtic astrology requires your birth date.',
      limitReached: 'You have reached your Celtic astrology limit.'
    }
  },
  get_kabbalistic_analysis: {
    displayName: 'Kabbalistic Astrology',
    requiredProfileFields: ['birthDate'],
    subscriptionFeature: 'kabbalistic_astrology',
    cooldown: 3600000, // 1 hour
    errorMessages: {
      incomplete: 'Kabbalistic astrology requires your birth date.',
      limitReached: 'You have reached your Kabbalistic astrology limit.'
    }
  },
  get_hellenistic_astrology_analysis: {
    displayName: 'Hellenistic Astrology',
    requiredProfileFields: ['birthDate', 'birthTime', 'birthPlace'],
    subscriptionFeature: 'hellenistic_astrology',
    cooldown: 3600000, // 1 hour
    errorMessages: {
      incomplete: 'Hellenistic astrology requires complete birth information.',
      limitReached: 'You have reached your Hellenistic astrology limit.'
    }
  },
  get_islamic_astrology_info: {
    displayName: 'Islamic Astrology',
    requiredProfileFields: ['birthDate', 'birthTime', 'birthPlace'],
    subscriptionFeature: 'islamic_astrology',
    cooldown: 3600000, // 1 hour
    errorMessages: {
      incomplete: 'Islamic astrology requires complete birth information.',
      limitReached: 'You have reached your Islamic astrology limit.'
    }
  },
  get_horary_reading: {
    displayName: 'Horary Astrology',
    requiredProfileFields: [],
    subscriptionFeature: 'horary_astrology',
    cooldown: 1800000, // 30 minutes
    errorMessages: {
      incomplete: '',
      limitReached: 'You have reached your horary astrology limit.'
    }
  },
  get_horary_reading_analysis: {
    displayName: 'Horary Reading Analysis',
    requiredProfileFields: [],
    subscriptionFeature: 'horary_reading_analysis',
    cooldown: 1800000, // 30 minutes
    errorMessages: {
      incomplete: '',
      limitReached: 'You have reached your horary reading analysis limit.'
    }
  },
  get_astrocartography_analysis: {
    displayName: 'Astrocartography',
    requiredProfileFields: ['birthDate', 'birthTime', 'birthPlace'],
    subscriptionFeature: 'astrocartography',
    cooldown: 3600000, // 1 hour
    errorMessages: {
      incomplete: 'Astrocartography requires complete birth information.',
      limitReached: 'You have reached your astrocartography limit.'
    }
  },
  get_vedic_numerology_analysis: {
    displayName: 'Vedic Numerology',
    requiredProfileFields: ['birthDate'],
    subscriptionFeature: 'vedic_numerology',
    cooldown: 1800000, // 30 minutes
    errorMessages: {
      incomplete: 'Vedic numerology requires your birth date.',
      limitReached: 'You have reached your Vedic numerology limit.'
    }
  },
  get_vedic_yogas_analysis: {
    displayName: 'Vedic Yogas Interpretation',
    requiredProfileFields: ['birthDate', 'birthTime', 'birthPlace'],
    subscriptionFeature: 'vedic_yogas_interpretation',
    cooldown: 3600000, // 1 hour
    errorMessages: {
      incomplete: 'Vedic yogas interpretation requires complete birth information.',
      limitReached: 'You have reached your Vedic yogas interpretation limit.'
    }
  },
  get_specialized_analysis: {
    displayName: 'Specialized Chart Analysis',
    requiredProfileFields: ['birthDate', 'birthTime', 'birthPlace'],
    subscriptionFeature: 'specialized_analysis',
    cooldown: 3600000, // 1 hour
    errorMessages: {
      incomplete: 'Specialized chart analysis requires complete birth information.',
      limitReached: 'You have reached your specialized chart analysis limit.'
    }
  },
  get_dasha_predictive_analysis: {
    displayName: 'Dasha Predictive Insights',
    requiredProfileFields: ['birthDate', 'birthTime', 'birthPlace'],
    subscriptionFeature: 'dasha_predictive_analysis',
    cooldown: 3600000, // 1 hour
    errorMessages: {
      incomplete: 'Dasha predictive insights require complete birth information.',
      limitReached: 'You have reached your dasha predictive insights limit.'
    }
  },
  get_enhanced_panchang_analysis: {
    displayName: 'Enhanced Panchang Analysis',
    requiredProfileFields: [],
    subscriptionFeature: 'enhanced_panchang_analysis',
    cooldown: 300000, // 5 minutes
    errorMessages: {
      incomplete: '',
      limitReached: 'You have reached your enhanced Panchang analysis limit.'
    }
  },
  get_calendar_timing_analysis: {
    displayName: 'General Calendar Timing Analysis',
    requiredProfileFields: [],
    subscriptionFeature: 'calendar_timing_analysis',
    cooldown: 300000, // 5 minutes
    errorMessages: {
      incomplete: '',
      limitReached: 'You have reached your calendar timing analysis limit.'
    }
  }
};

const MENU_CONFIG = {
  // Menu action configurations
  show_main_menu: {
    displayName: 'Main Menu',
    requiredProfileFields: [],
    subscriptionFeature: null,
    cooldown: 0
  },

  show_western_astrology_menu: {
    displayName: 'Western Astrology Menu',
    requiredProfileFields: [],
    subscriptionFeature: null,
    cooldown: 0
  },

  show_vedic_astrology_menu: {
    displayName: 'Vedic Astrology Menu',
    requiredProfileFields: [],
    subscriptionFeature: null,
    cooldown: 0
  },
  // NEW MENU ACTIONS
  show_relationships_groups_menu: {
    displayName: 'Relationships & Group Astrology',
    requiredProfileFields: [],
    subscriptionFeature: null,
    cooldown: 0
  },
  show_relationships_compatibility_menu: {
    displayName: 'Compatibility & Matching',
    requiredProfileFields: [],
    subscriptionFeature: null,
    cooldown: 0
  },
  show_relationships_charts_menu: {
    displayName: 'Relationship Charts',
    requiredProfileFields: [],
    subscriptionFeature: null,
    cooldown: 0
  },
  show_relationships_group_dynamics_menu: {
    displayName: 'Family & Group Dynamics',
    requiredProfileFields: [],
    subscriptionFeature: null,
    cooldown: 0
  },
  show_calendar_timings_menu: {
    displayName: 'Calendar & Astrological Timings',
    requiredProfileFields: [],
    subscriptionFeature: null,
    cooldown: 0
  },
  show_calendar_timings_sub_menu_1: {
    displayName: 'More Calendar & Timings',
    requiredProfileFields: [],
    subscriptionFeature: null,
    cooldown: 0
  },
  show_health_remedies_menu: {
    displayName: 'Health, Remedies & Doshas',
    requiredProfileFields: [],
    subscriptionFeature: null,
    cooldown: 0
  },
  show_western_basic_advanced_menu: {
    displayName: 'Western Basic & Advanced Charts',
    requiredProfileFields: [],
    subscriptionFeature: null,
    cooldown: 0
  },
  show_western_predictive_specialized_menu: {
    displayName: 'Western Predictive & Specialized',
    requiredProfileFields: [],
    subscriptionFeature: null,
    cooldown: 0
  },
  show_vedic_predictive_specialized_menu: {
    displayName: 'Vedic Predictive & Specialized',
    requiredProfileFields: [],
    subscriptionFeature: null,
    cooldown: 0
  },
  show_vedic_predictive_specialized_sub_menu_1: {
    displayName: 'More Vedic Predictive & Specialized',
    requiredProfileFields: [],
    subscriptionFeature: null,
    cooldown: 0
  },
  show_vedic_transits_progressions_menu: {
    displayName: 'Vedic Transits & Progressions',
    requiredProfileFields: [],
    subscriptionFeature: null,
    cooldown: 0
  },
  show_vedic_specialized_reports_menu: {
    displayName: 'Vedic Specialized Reports',
    requiredProfileFields: [],
    subscriptionFeature: null,
    cooldown: 0
  },
  show_divination_mystic_menu: {
    displayName: 'Divination & Mystic Arts',
    requiredProfileFields: [],
    subscriptionFeature: null,
    cooldown: 0
  },
  show_divination_cards_physical_menu: {
    displayName: 'Cards & Physical Divination',
    requiredProfileFields: [],
    subscriptionFeature: null,
    cooldown: 0
  },
  show_divination_ancient_menu: {
    displayName: 'Ancient & Cultural Astrologies',
    requiredProfileFields: [],
    subscriptionFeature: null,
    cooldown: 0
  },
  show_divination_specialized_menu: {
    displayName: 'Specialized Divination Methods',
    requiredProfileFields: [],
    subscriptionFeature: null,
    cooldown: 0
  }
};

const PROFILE_CONFIG = {
  // Profile action configurations
  btn_update_profile: {
    displayName: 'Update Profile',
    requiredProfileFields: [],
    subscriptionFeature: null,
    cooldown: 0
  },

  btn_view_profile: {
    displayName: 'View Profile',
    requiredProfileFields: [],
    subscriptionFeature: null,
    cooldown: 0
  },
  show_settings_profile_menu: {
    displayName: 'Settings & Profile',
    requiredProfileFields: [],
    subscriptionFeature: null,
    cooldown: 0
  },
  show_language_menu: {
    displayName: 'Change Language',
    requiredProfileFields: [],
    subscriptionFeature: null,
    cooldown: 0
  }
};

const NUMEROLOGY_CONFIG = {
  // Numerology action configurations
  get_numerology_report: {
    displayName: 'Numerology Report',
    requiredProfileFields: ['birthDate'],
    subscriptionFeature: 'numerology_report',
    cooldown: 1800000, // 30 minutes
    errorMessages: {
      incomplete: 'Numerology reports require your birth date.',
      limitReached: 'You have reached your numerology report limit.'
    }
  },
  show_numerology_lifepatterns_menu: {
    displayName: 'Numerology & Life Patterns',
    requiredProfileFields: [],
    subscriptionFeature: null,
    cooldown: 0
  }
};

const DIVINATION_CONFIG = {
  // Divination action configurations
  get_palmistry_analysis: {
    displayName: 'Palmistry Analysis',
    requiredProfileFields: [],
    subscriptionFeature: 'palmistry_analysis',
    cooldown: 3600000, // 1 hour
    errorMessages: {
      incomplete: '', // No profile requirements
      limitReached:
        'Palmistry analysis requires hand images (available in Premium).'
    }
  }
};

module.exports = {
  ASTROLOGY_CONFIG,
  MENU_CONFIG,
  PROFILE_CONFIG,
  NUMEROLOGY_CONFIG,
  DIVINATION_CONFIG,

  // Get configuration by action ID with fallback
  getActionConfig(actionId) {
    return (
      ASTROLOGY_CONFIG[actionId] ||
      MENU_CONFIG[actionId] ||
      PROFILE_CONFIG[actionId] ||
      NUMEROLOGY_CONFIG[actionId] ||
      DIVINATION_CONFIG[actionId] ||
      {}
    );
  },

  // Common action limits and defaults
  defaults: {
    cooldown: 300000, // 5 minutes default
    dailyLimit: 10,
    monthlyLimit: 50
  }
};
