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
    displayName: 'Compatibility Analysis',
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
