class CelticDataProvider {
  constructor() {
    // Celtic Tree Signs (13 trees based on lunar calendar)
    this.treeSigns = {
      Birch: {
        dates: 'Dec 24 - Jan 20',
        meaning: 'New Beginnings, Renewal, Purification',
        element: 'Water',
        planet: 'Venus',
        qualities: ['Pioneer', 'Cleansing', 'Innocence', 'Protection'],
        symbol: '🌿',
        treeWisdom:
          'The birch tree teaches us to release the old and embrace new beginnings with courage and purity.'
      },
      Rowan: {
        dates: 'Jan 21 - Feb 17',
        meaning: 'Protection, Inspiration, Quickening',
        element: 'Fire',
        planet: 'Uranus',
        qualities: ['Protection', 'Inspiration', 'Vision', 'Defense'],
        symbol: '🌳',
        treeWisdom:
          'The rowan guards against harm and inspires creative vision and spiritual protection.'
      },
      Ash: {
        dates: 'Feb 18 - Mar 17',
        meaning: 'Strength, Flexibility, Connection',
        element: 'Air',
        planet: 'Neptune',
        qualities: ['Strength', 'Adaptability', 'Connection', 'Wisdom'],
        symbol: '🌳',
        treeWisdom:
          'The ash tree bridges worlds, offering strength, flexibility, and connection to ancient wisdom.'
      },
      Alder: {
        dates: 'Mar 18 - Apr 14',
        meaning: 'Bravery, Leadership, Oracle',
        element: 'Fire',
        planet: 'Mars',
        qualities: ['Bravery', 'Leadership', 'Oracle', 'Resilience'],
        symbol: '🌳',
        treeWisdom:
          'The alder teaches courage in the face of adversity and the power of prophetic vision.'
      },
      Willow: {
        dates: 'Apr 15 - May 12',
        meaning: 'Intuition, Dreams, Healing',
        element: 'Water',
        planet: 'Moon',
        qualities: ['Intuition', 'Dreams', 'Healing', 'Flexibility'],
        symbol: '🌿',
        treeWisdom:
          'The willow flows with emotional wisdom, healing through intuition and dream work.'
      },
      Hawthorn: {
        dates: 'May 13 - Jun 9',
        meaning: 'Love, Protection, Fae Magic',
        element: 'Air',
        planet: 'Venus',
        qualities: ['Love', 'Protection', 'Magic', 'Transformation'],
        symbol: '🌸',
        treeWisdom:
          'The hawthorn guards the gateway between worlds, teaching love, protection, and fae magic.'
      },
      Oak: {
        dates: 'Jun 10 - Jul 7',
        meaning: 'Strength, Endurance, Leadership',
        element: 'Fire',
        planet: 'Jupiter',
        qualities: ['Strength', 'Endurance', 'Leadership', 'Stability'],
        symbol: '🌳',
        treeWisdom:
          'The mighty oak embodies enduring strength, leadership, and the power of steadfast wisdom.'
      },
      Holly: {
        dates: 'Jul 8 - Aug 4',
        meaning: 'Defense, Healing, Balance',
        element: 'Earth',
        planet: 'Saturn',
        qualities: ['Defense', 'Healing', 'Balance', 'Determination'],
        symbol: '🌿',
        treeWisdom:
          'The holly teaches defensive strength, healing balance, and determined protection.'
      },
      Hazel: {
        dates: 'Aug 5 - Sep 1',
        meaning: 'Wisdom, Inspiration, Poetry',
        element: 'Air',
        planet: 'Mercury',
        qualities: ['Wisdom', 'Inspiration', 'Poetry', 'Divination'],
        symbol: '🌰',
        treeWisdom:
          'The hazel tree of wisdom inspires poetry, divination, and profound intellectual insight.'
      },
      Vine: {
        dates: 'Sep 2 - Sep 29',
        meaning: 'Joy, Prosperity, Celebration',
        element: 'Earth',
        planet: 'Venus',
        qualities: ['Joy', 'Prosperity', 'Celebration', 'Growth'],
        symbol: '🍇',
        treeWisdom:
          'The vine teaches joyful abundance, prosperity through celebration, and bountiful growth.'
      },
      Ivy: {
        dates: 'Sep 30 - Oct 27',
        meaning: 'Endurance, Fidelity, Determination',
        element: 'Water',
        planet: 'Saturn',
        qualities: ['Endurance', 'Fidelity', 'Determination', 'Resilience'],
        symbol: '🌿',
        treeWisdom:
          'The ivy demonstrates enduring strength, faithful determination, and resilient growth.'
      },
      Reed: {
        dates: 'Oct 28 - Nov 24',
        meaning: 'Family, Community, Harmony',
        element: 'Air',
        planet: 'Mercury',
        qualities: ['Family', 'Community', 'Harmony', 'Communication'],
        symbol: '🌾',
        treeWisdom:
          'The reed teaches community harmony, family bonds, and the strength of collective wisdom.'
      },
      Elder: {
        dates: 'Nov 25 - Dec 23',
        meaning: 'Transformation, Death, Rebirth',
        element: 'Water',
        planet: 'Pluto',
        qualities: ['Transformation', 'Rebirth', 'Wisdom', 'Regeneration'],
        symbol: '🌿',
        treeWisdom:
          'The elder tree guides through transformation, teaching the wisdom of death and rebirth cycles.'
      }
    };

    // Celtic Animal Totems
    this.animalTotems = {
      Stag: {
        qualities: [
          'Leadership',
          'Majesty',
          'Independence',
          'Spiritual Authority'
        ],
        element: 'Fire'
      },
      Salmon: {
        qualities: [
          'Wisdom',
          'Inspiration',
          'Transformation',
          'Ancient Knowledge'
        ],
        element: 'Water'
      },
      Bear: {
        qualities: ['Strength', 'Protection', 'Healing', 'Inner Wisdom'],
        element: 'Earth'
      },
      Raven: {
        qualities: ['Magic', 'Transformation', 'Divination', 'Mystery'],
        element: 'Air'
      },
      Wolf: {
        qualities: ['Loyalty', 'Family', 'Intuition', 'Social Bonds'],
        element: 'Earth'
      },
      Eagle: {
        qualities: ['Vision', 'Freedom', 'Spirituality', 'Higher Perspective'],
        element: 'Air'
      },
      Horse: {
        qualities: ['Freedom', 'Power', 'Journey', 'Wild Spirit'],
        element: 'Fire'
      },
      Swan: {
        qualities: ['Grace', 'Beauty', 'Transformation', 'Inner Beauty'],
        element: 'Water'
      },
      Owl: {
        qualities: ['Wisdom', 'Night Vision', 'Mystery', 'Ancient Knowledge'],
        element: 'Air'
      },
      Dragon: {
        qualities: ['Power', 'Magic', 'Transformation', 'Ancient Wisdom'],
        element: 'Fire'
      }
    };

    // Celtic Wheel of the Year (8 festivals)
    this.celticWheel = {
      Samhain: {
        date: 'Oct 31',
        meaning: 'End of Harvest, Ancestor Connection',
        season: 'Autumn'
      },
      Yule: {
        date: 'Dec 21',
        meaning: 'Winter Solstice, Rebirth',
        season: 'Winter'
      },
      Imbolc: {
        date: 'Feb 2',
        meaning: 'First Stirrings, Purification',
        season: 'Winter'
      },
      Ostara: {
        date: 'Mar 21',
        meaning: 'Spring Equinox, New Life',
        season: 'Spring'
      },
      Beltane: {
        date: 'May 1',
        meaning: 'Summer Begins, Fertility',
        season: 'Spring'
      },
      Litha: {
        date: 'Jun 21',
        meaning: 'Summer Solstice, Power',
        season: 'Summer'
      },
      Lammas: {
        date: 'Aug 1',
        meaning: 'First Harvest, Gratitude',
        season: 'Summer'
      },
      Mabon: {
        date: 'Sep 21',
        meaning: 'Autumn Equinox, Balance',
        season: 'Autumn'
      }
    };
  }
}

module.exports = { CelticDataProvider };