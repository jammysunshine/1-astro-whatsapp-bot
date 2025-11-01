class BirthData {
  constructor({ birthDate, birthTime, birthPlace, name, gender }) {
    this.birthDate = birthDate;
    this.birthTime = birthTime;
    this.birthPlace = birthPlace;
    this.name = name;
    this.gender = gender;
    this.createdAt = new Date();
  }

  validate() {
    const required = ['birthDate', 'birthTime', 'birthPlace'];
    const errors = [];

    for (const field of required) {
      if (!this[field]) {
        errors.push(`${field} is required`);
      }
    }

    // Validate date format (DD/MM/YYYY)
    if (this.birthDate && !/^\d{2}\/\d{2}\/\d{4}$/.test(this.birthDate)) {
      errors.push('birthDate must be in DD/MM/YYYY format');
    }

    // Validate time format (HH:MM)
    if (this.birthTime && !/^\d{1,2}:\d{2}$/.test(this.birthTime)) {
      errors.push('birthTime must be in HH:MM format');
    }

    if (errors.length > 0) {
      throw new Error(`Validation errors: ${errors.join(', ')}`);
    }

    return true;
  }

  toLog() {
    return {
      name: this.name,
      birthDate: this.birthDate,
      birthTime: this.birthTime,
      birthPlace: this.birthPlace,
      gender: this.gender
    };
  }
}

module.exports = BirthData;
