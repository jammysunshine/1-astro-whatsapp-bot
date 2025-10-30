class NadiDataProvider {
  constructor() {
    // Nakshatras (27 lunar mansions)
    this.nakshatras = [
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

    // Nadi systems (based on birth star and other factors)
    this.nadiSystems = {
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

    // Dasha periods (planetary periods)
    this.dashaPeriods = {
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
}

module.exports = { NadiDataProvider };