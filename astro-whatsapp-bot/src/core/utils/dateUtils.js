class DateUtils {
  static parseDate(dateString) {
    if (!dateString) { return null; }

    const [day, month, year] = dateString.split('/').map(Number);
    if (!day || !month || !year) {
      throw new Error('Invalid date format. Expected DD/MM/YYYY');
    }

    const date = new Date(year, month - 1, day);
    return date;
  }

  static parseTime(timeString) {
    if (!timeString) { return null; }

    const [hour, minute] = timeString.split(':').map(Number);
    if (hour === undefined || minute === undefined) {
      throw new Error('Invalid time format. Expected HH:MM');
    }

    return { hour, minute };
  }

  static calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  }

  static getJulianDay(date) {
    // Simplified Julian Day calculation
    const a = Math.floor((14 - (date.getMonth() + 1)) / 12);
    const y = date.getFullYear() + 4800 - a;
    const m = (date.getMonth() + 1) + (12 * a) - 3;

    return date.getDate() + Math.floor((153 * m + 2) / 5) +
           365 * y + Math.floor(y / 4) - Math.floor(y / 100) +
           Math.floor(y / 400) - 32045;
  }
}

module.exports = DateUtils;
