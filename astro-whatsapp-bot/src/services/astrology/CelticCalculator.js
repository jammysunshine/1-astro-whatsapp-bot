class CelticCalculator {
  constructor(dataProvider) {
    this.dataProvider = dataProvider;
  }

  /**
   * Calculate Celtic tree sign based on birth date
   * @param {string} birthDate - Birth date in DD/MM/YYYY format
   * @returns {Object} Tree sign information
   */
  calculateTreeSign(birthDate) {
    try {
      const [day, month] = birthDate.split('/').map(Number);

      // Celtic tree signs based on lunar calendar
      const treeDates = [
        { sign: 'Birch', start: [24, 12], end: [20, 1] },
        { sign: 'Rowan', start: [21, 1], end: [17, 2] },
        { sign: 'Ash', start: [18, 2], end: [17, 3] },
        { sign: 'Alder', start: [18, 3], end: [14, 4] },
        { sign: 'Willow', start: [15, 4], end: [12, 5] },
        { sign: 'Hawthorn', start: [13, 5], end: [9, 6] },
        { sign: 'Oak', start: [10, 6], end: [7, 7] },
        { sign: 'Holly', start: [8, 7], end: [4, 8] },
        { sign: 'Hazel', start: [5, 8], end: [1, 9] },
        { sign: 'Vine', start: [2, 9], end: [29, 9] },
        { sign: 'Ivy', start: [30, 9], end: [27, 10] },
        { sign: 'Reed', start: [28, 10], end: [24, 11] },
        { sign: 'Elder', start: [25, 11], end: [23, 12] }
      ];

      for (const { sign, start, end } of treeDates) {
        const [startDay, startMonth] = start;
        const [endDay, endMonth] = end;

        if (
          (month === startMonth && day >= startDay) ||
          (month === endMonth && day <= endDay) ||
          (month > startMonth && month < endMonth)
        ) {
          return {
            name: sign,
            ...this.dataProvider.treeSigns[sign]
          };
        }
      }

      return {
        name: 'Birch',
        ...this.dataProvider.treeSigns['Birch']
      };
    } catch (error) {
      return {
        name: 'Oak',
        ...this.dataProvider.treeSigns['Oak']
      };
    }
  }

  /**
   * Calculate animal totem based on birth date
   * @param {string} birthDate - Birth date in DD/MM/YYYY format
   * @returns {Object} Animal totem information
   */
  calculateAnimalTotem(birthDate) {
    try {
      const [day, month, year] = birthDate.split('/').map(Number);

      // Simplified animal totem calculation based on day of year
      const birth = new Date(year, month - 1, day);
      const startOfYear = new Date(year, 0, 1);
      const dayOfYear = Math.floor(
        (birth - startOfYear) / (1000 * 60 * 60 * 24)
      );

      const animals = Object.keys(this.dataProvider.animalTotems);
      const animalIndex = dayOfYear % animals.length;
      const animalName = animals[animalIndex];

      return {
        name: animalName,
        ...this.dataProvider.animalTotems[animalName]
      };
    } catch (error) {
      return {
        name: 'Raven',
        ...this.dataProvider.animalTotems['Raven']
      };
    }
  }

  /**
   * Calculate seasonal influence based on birth date
   * @param {string} birthDate - Birth date in DD/MM/YYYY format
   * @returns {Object} Seasonal influence
   */
  calculateSeasonalInfluence(birthDate) {
    try {
      const [day, month] = birthDate.split('/').map(Number);

      // Celtic seasons
      const seasons = {
        Winter: {
          months: [12, 1, 2],
          qualities: ['Introspection', 'Planning', 'Inner Growth']
        },
        Spring: {
          months: [3, 4, 5],
          qualities: ['Growth', 'Renewal', 'Creativity']
        },
        Summer: {
          months: [6, 7, 8],
          qualities: ['Abundance', 'Energy', 'Expression']
        },
        Autumn: {
          months: [9, 10, 11],
          qualities: ['Harvest', 'Reflection', 'Gratitude']
        }
      };

      const season =
        Object.keys(seasons).find(season =>
          seasons[season].months.includes(month)
        ) || 'Spring';

      return {
        season,
        qualities: seasons[season].qualities,
        festivals: this.getSeasonalFestivals(season)
      };
    } catch (error) {
      return {
        season: 'Spring',
        qualities: ['Growth', 'Renewal'],
        festivals: ['Ostara', 'Beltane']
      };
    }
  }

  /**
   * Get seasonal festivals
   * @param {string} season - Season name
   * @returns {Array} Festival names
   */
  getSeasonalFestivals(season) {
    const festivalMap = {
      Winter: ['Samhain', 'Yule', 'Imbolc'],
      Spring: ['Imbolc', 'Ostara', 'Beltane'],
      Summer: ['Beltane', 'Litha', 'Lammas'],
      Autumn: ['Lammas', 'Mabon', 'Samhain']
    };

    return festivalMap[season] || [];
  }
}

module.exports = { CelticCalculator };