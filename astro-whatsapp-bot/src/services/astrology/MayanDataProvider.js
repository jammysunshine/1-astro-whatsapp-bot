class MayanDataProvider {
  constructor() {
    // Tzolk'in day signs (20 signs)
    this.daySigns = {
      1: {
        name: 'Imix',
        meaning: 'Crocodile/Primal Waters',
        element: 'Water',
        direction: 'East',
        qualities: ['Creation', 'Instinct', 'Potential', 'Nurturing']
      },
      2: {
        name: 'Ik',
        meaning: 'Wind',
        element: 'Air',
        direction: 'North',
        qualities: ['Communication', 'Spirit', 'Breath', 'Change']
      },
      3: {
        name: 'Akbal',
        meaning: 'Night/House',
        element: 'Earth',
        direction: 'West',
        qualities: ['Dreams', 'Mystery', 'Intuition', 'Protection']
      },
      4: {
        name: 'Kan',
        meaning: 'Lizard/Serpent',
        element: 'Fire',
        direction: 'South',
        qualities: ['Prosperity', 'Abundance', 'Transformation', 'Healing']
      },
      5: {
        name: 'Chicchan',
        meaning: 'Serpent',
        element: 'Fire',
        direction: 'East',
        qualities: ['Instinct', 'Survival', 'Life Force', 'Sensuality']
      },
      6: {
        name: 'Cimi',
        meaning: 'Death/Transformation',
        element: 'Water',
        direction: 'North',
        qualities: ['Change', 'Release', 'Rebirth', 'Closure']
      },
      7: {
        name: 'Manik',
        meaning: 'Deer/Hand',
        element: 'Earth',
        direction: 'West',
        qualities: ['Healing', 'Cooperation', 'Skill', 'Craftsmanship']
      },
      8: {
        name: 'Lamat',
        meaning: 'Rabbit/Star',
        element: 'Air',
        direction: 'South',
        qualities: ['Abundance', 'Fertility', 'Art', 'Multiplication']
      },
      9: {
        name: 'Muluc',
        meaning: 'Water/Offerings',
        element: 'Water',
        direction: 'East',
        qualities: ['Purification', 'Flow', 'Emotions', 'Sacrifice']
      },
      10: {
        name: 'Oc',
        meaning: 'Dog/Loyalty',
        element: 'Earth',
        direction: 'North',
        qualities: ['Loyalty', 'Guidance', 'Friendship', 'Protection']
      },
      11: {
        name: 'Chuen',
        meaning: 'Monkey/Artist',
        element: 'Air',
        direction: 'West',
        qualities: ['Creativity', 'Playfulness', 'Ingenuity', 'Magic']
      },
      12: {
        name: 'Eb',
        meaning: 'Road/Human',
        element: 'Fire',
        direction: 'South',
        qualities: ['Service', 'Humanity', 'Wisdom', 'Path']
      },
      13: {
        name: 'Ben',
        meaning: 'Reed/Sky',
        element: 'Air',
        direction: 'East',
        qualities: ['Authority', 'Leadership', 'Divine Connection', 'Growth']
      },
      14: {
        name: 'Ix',
        meaning: 'Jaguar/Magic',
        element: 'Earth',
        direction: 'North',
        qualities: ['Magic', 'Mystery', 'Shamanism', 'Inner Strength']
      },
      15: {
        name: 'Men',
        meaning: 'Eagle/Vision',
        element: 'Fire',
        direction: 'West',
        qualities: ['Vision', 'Perspective', 'Freedom', 'Spirit']
      },
      16: {
        name: 'Cib',
        meaning: 'Vulture/Owl',
        element: 'Air',
        direction: 'South',
        qualities: ['Wisdom', 'Death', 'Transition', 'Ancestors']
      },
      17: {
        name: 'Caban',
        meaning: 'Earthquake/Earth',
        element: 'Earth',
        direction: 'East',
        qualities: ['Movement', 'Synchronicity', 'Change', 'Foundation']
      },
      18: {
        name: 'Eznab',
        meaning: 'Knife/Mirror',
        element: 'Water',
        direction: 'North',
        qualities: ['Truth', 'Reflection', 'Justice', 'Clarity']
      },
      19: {
        name: 'Cauac',
        meaning: 'Storm/Rain',
        element: 'Fire',
        direction: 'West',
        qualities: ['Cleansing', 'Renewal', 'Energy', 'Catalysis']
      },
      20: {
        name: 'Ahau',
        meaning: 'Sun/Light',
        element: 'Air',
        direction: 'South',
        qualities: [
          'Enlightenment',
          'Kingship',
          'Divine Authority',
          'Illumination'
        ]
      }
    };

    // Tones (numbers 1-13) and their meanings
    this.tones = {
      1: {
        name: 'Magnetic',
        meaning: 'Unify, attract, purpose',
        qualities: ['Leadership', 'New beginnings', 'Magnetic attraction']
      },
      2: {
        name: 'Lunar',
        meaning: 'Polarize, stabilize, challenge',
        qualities: ['Cooperation', 'Balance', 'Sensitivity']
      },
      3: {
        name: 'Electric',
        meaning: 'Activate, bond, service',
        qualities: ['Creativity', 'Communication', 'Service']
      },
      4: {
        name: 'Self-Existing',
        meaning: 'Define, measure, form',
        qualities: ['Stability', 'Definition', 'Form']
      },
      5: {
        name: 'Overtone',
        meaning: 'Empower, command, radiance',
        qualities: ['Empowerment', 'Command', 'Radiance']
      },
      6: {
        name: 'Rhythmic',
        meaning: 'Organize, balance, equality',
        qualities: ['Organization', 'Balance', 'Equality']
      },
      7: {
        name: 'Resonant',
        meaning: 'Inspire, attune, channel',
        qualities: ['Inspiration', 'Attunement', 'Guidance']
      },
      8: {
        name: 'Galactic',
        meaning: 'Harmonize, model, integrity',
        qualities: ['Integrity', 'Modeling', 'Harmony']
      },
      9: {
        name: 'Solar',
        meaning: 'Pulse, realize, intention',
        qualities: ['Intention', 'Realization', 'Pulse']
      },
      10: {
        name: 'Planetary',
        meaning: 'Perfect, manifest, production',
        qualities: ['Manifestation', 'Production', 'Perfection']
      },
      11: {
        name: 'Spectral',
        meaning: 'Dissolve, release, liberation',
        qualities: ['Liberation', 'Release', 'Dissolution']
      },
      12: {
        name: 'Crystal',
        meaning: 'Dedicate, universalize, cooperation',
        qualities: ['Cooperation', 'Universalization', 'Dedication']
      },
      13: {
        name: 'Cosmic',
        meaning: 'Transcend, enlighten, presence',
        qualities: ['Enlightenment', 'Transcendence', 'Presence']
      }
    };

    // Haab months (18 months + 5 unlucky days)
    this.haabMonths = {
      1: {
        name: 'Pop',
        meaning: 'Mat',
        qualities: ['New beginnings', 'Planting', 'Initiation']
      },
      2: {
        name: 'Wo',
        meaning: 'Black Storm',
        qualities: ['Transformation', 'Cleansing', 'Change']
      },
      3: {
        name: 'Sip',
        meaning: 'Red Storm',
        qualities: ['Purification', 'Renewal', 'Energy']
      },
      4: {
        name: 'Sotz\'',
        meaning: 'Bat',
        qualities: ['Sovereignty', 'Leadership', 'Authority']
      },
      5: {
        name: 'Sek',
        meaning: 'Death',
        qualities: ['Transformation', 'Release', 'Rebirth']
      },
      6: {
        name: 'Xul',
        meaning: 'Dog',
        qualities: ['Loyalty', 'Guidance', 'Protection']
      },
      7: {
        name: 'Yaxkin',
        meaning: 'New Sun',
        qualities: ['Enlightenment', 'New beginnings', 'Solar energy']
      },
      8: {
        name: 'Mol',
        meaning: 'Water',
        qualities: ['Flow', 'Emotions', 'Adaptation']
      },
      9: {
        name: 'Chen',
        meaning: 'Black Storm',
        qualities: ['Transformation', 'Cleansing', 'Change']
      },
      10: {
        name: 'Yax',
        meaning: 'Green Storm',
        qualities: ['Growth', 'Abundance', 'Nature']
      },
      11: {
        name: 'Sak',
        meaning: 'White Storm',
        qualities: ['Purification', 'Clarity', 'Truth']
      },
      12: {
        name: 'Keh',
        meaning: 'Red Storm',
        qualities: ['Energy', 'Action', 'Catalysis']
      },
      13: {
        name: 'Mak',
        meaning: 'Enclosed',
        qualities: ['Containment', 'Protection', 'Boundaries']
      },
      14: {
        name: 'Kankin',
        meaning: 'Yellow Sun',
        qualities: ['Ripening', 'Maturity', 'Harvest']
      },
      15: {
        name: 'Muan',
        meaning: 'Owl',
        qualities: ['Wisdom', 'Night', 'Mystery']
      },
      16: {
        name: 'Pax',
        meaning: 'Planting Time',
        qualities: ['Sowing seeds', 'Planning', 'Preparation']
      },
      17: {
        name: 'Kayab',
        meaning: 'Turtle',
        qualities: ['Stability', 'Patience', 'Endurance']
      },
      18: {
        name: 'Kumku',
        meaning: 'Granary',
        qualities: ['Storage', 'Abundance', 'Preservation']
      },
      19: {
        name: 'Wayeb',
        meaning: 'Five Unlucky Days',
        qualities: ['Caution', 'Reflection', 'Preparation']
      }
    };

    // Year bearers and their significance
    this.yearBearers = {
      Ik: {
        meaning: 'Wind Year',
        qualities: ['Change', 'Communication', 'Adaptability']
      },
      Manik: {
        meaning: 'Deer Year',
        qualities: ['Healing', 'Cooperation', 'Skill']
      },
      Eb: {
        meaning: 'Human Year',
        qualities: ['Service', 'Wisdom', 'Community']
      },
      Caban: {
        meaning: 'Earth Year',
        qualities: ['Stability', 'Foundation', 'Movement']
      }
    };
  }
}

module.exports = { MayanDataProvider };
