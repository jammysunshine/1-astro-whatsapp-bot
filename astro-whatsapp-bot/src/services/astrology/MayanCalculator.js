class MayanCalculator {
  constructor(dataProvider) {
    this.dataProvider = dataProvider;
  }

  /**
   * Calculate Tzolk'in date (260-day sacred calendar)
   * @param {string} birthDate - Birth date in DD/MM/YYYY format
   * @returns {Object} Tzolk'in date information
   */
  calculateTzolkIn(birthDate) {
    try {
      const [day, month, year] = birthDate.split('/').map(Number);

      // Create date object
      const birth = new Date(year, month - 1, day);

      // Mayan calendar correlation (using Goodman-Martinez-Thompson correlation)
      // Base date: July 26, 2023 = 4 Ahau (Mayan date)
      const baseDate = new Date(2023, 6, 26); // July 26, 2023
      const baseKin = 4; // 4 Ahau
      const baseDaySign = 20; // Ahau

      // Calculate days since base date
      const daysDiff = Math.floor((birth - baseDate) / (1000 * 60 * 60 * 24));

      // Calculate current kin
      const currentKin = (baseKin + daysDiff) % 260;
      const kin = currentKin === 0 ? 260 : currentKin;

      // Calculate tone (1-13)
      const tone = ((kin - 1) % 13) + 1;

      // Calculate day sign (1-20)
      const daySign = ((kin - 1) % 20) + 1;

      return {
        kin,
        tone: this.dataProvider.tones[tone],
        daySign: this.dataProvider.daySigns[daySign],
        fullName: `${tone} ${this.dataProvider.daySigns[daySign].name}`,
        meaning: `${this.dataProvider.tones[tone].name} ${this.dataProvider.daySigns[daySign].name}`,
        qualities: [
          ...this.dataProvider.tones[tone].qualities,
          ...this.dataProvider.daySigns[daySign].qualities
        ]
      };
    } catch (error) {
      return {
        kin: 1,
        tone: this.dataProvider.tones[1],
        daySign: this.dataProvider.daySigns[1],
        fullName: '1 Imix',
        meaning: 'Magnetic Imix',
        qualities: ['Creation', 'New beginnings']
      };
    }
  }

  /**
   * Calculate Haab date (365-day solar calendar)
   * @param {string} birthDate - Birth date in DD/MM/YYYY format
   * @returns {Object} Haab date information
   */
  calculateHaab(birthDate) {
    try {
      const [day, month, year] = birthDate.split('/').map(Number);

      // Create date object
      const birth = new Date(year, month - 1, day);

      // Calculate day of year (1-365)
      const startOfYear = new Date(year, 0, 1);
      const dayOfYear =
        Math.floor((birth - startOfYear) / (1000 * 60 * 60 * 24)) + 1;

      // Haab month (1-19, where 19 is Wayeb)
      const haabMonth = Math.floor((dayOfYear - 1) / 20) + 1;
      const dayInMonth = ((dayOfYear - 1) % 20) + 1;

      const monthData = this.dataProvider.haabMonths[haabMonth];

      return {
        month: haabMonth,
        day: dayInMonth,
        monthName: monthData.name,
        meaning: monthData.meaning,
        qualities: monthData.qualities,
        fullName: `${dayInMonth} ${monthData.name}`,
        isWayeb: haabMonth === 19
      };
    } catch (error) {
      return {
        month: 1,
        day: 1,
        monthName: 'Pop',
        meaning: 'Mat',
        qualities: ['New beginnings'],
        fullName: '1 Pop',
        isWayeb: false
      };
    }
  }

  /**
   * Calculate year bearer
   * @param {string} birthDate - Birth date in DD/MM/YYYY format
   * @returns {Object} Year bearer information
   */
  calculateYearBearer(birthDate) {
    try {
      const [day, month, year] = birthDate.split('/').map(Number);

      // Year bearer is determined by the Tzolk'in day sign of the first day of the year
      // Simplified calculation
      const yearStart = new Date(year, 0, 1);
      const tzolkin = this.calculateTzolkIn(
        `${yearStart.getDate().toString().padStart(2, '0')}/${(yearStart.getMonth() + 1).toString().padStart(2, '0')}/${year}`
      );

      // Map to year bearer signs
      const yearBearerSigns = ['Ik', 'Manik', 'Eb', 'Caban'];
      const yearBearerIndex = (year - 2000) % 4; // Simplified cycle
      const yearBearerName = yearBearerSigns[yearBearerIndex];

      return {
        sign: yearBearerName,
        meaning: this.dataProvider.yearBearers[yearBearerName].meaning,
        qualities: this.dataProvider.yearBearers[yearBearerName].qualities,
        year
      };
    } catch (error) {
      return {
        sign: 'Ik',
        meaning: 'Wind Year',
        qualities: ['Change', 'Communication'],
        year: new Date().getFullYear()
      };
    }
  }
}

module.exports = { MayanCalculator };
