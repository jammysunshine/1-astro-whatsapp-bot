/**
 * Utility functions for astrology calculations
 */

/**
 * Get zodiac sign from birth date
 * @param {string} birthDate - Birth date in DDMMYYYY format
 * @returns {string} Zodiac sign
 */
const getZodiacSign = birthDate => {
  // Simple implementation - parse DDMMYYYY
  if (!birthDate || birthDate.length !== 8) { return 'Unknown'; }

  const day = parseInt(birthDate.substring(0, 2));
  const month = parseInt(birthDate.substring(2, 4));

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) { return 'Aries'; }
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) { return 'Taurus'; }
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) { return 'Gemini'; }
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) { return 'Cancer'; }
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) { return 'Leo'; }
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) { return 'Virgo'; }
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) { return 'Libra'; }
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) { return 'Scorpio'; }
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) { return 'Sagittarius'; }
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) { return 'Capricorn'; }
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) { return 'Aquarius'; }
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) { return 'Pisces'; }

  return 'Unknown';
};

/**
 * Get daily horoscope for a sign
 * @param {string} sign - Zodiac sign
 * @returns {string} Daily horoscope text
 */
const getDailyHoroscope = sign => {
  // Simple dummy horoscopes
  const horoscopes = {
    Aries: 'Today brings energy and enthusiasm. Take initiative in your projects.',
    Taurus: 'Focus on stability and practicality. Good day for financial matters.',
    Gemini: 'Communication is key. Share your ideas with others.',
    Cancer: 'Emotional connections are highlighted. Nurture your relationships.',
    Leo: 'Creativity flows. Express yourself boldly.',
    Virgo: 'Attention to detail will serve you well. Organize your tasks.',
    Libra: 'Harmony and balance are important. Seek peaceful resolutions.',
    Scorpio: 'Deep insights await. Trust your intuition.',
    Sagittarius: 'Adventure calls. Explore new possibilities.',
    Capricorn: 'Discipline leads to success. Stay focused on your goals.',
    Aquarius: 'Innovation is your strength. Think outside the box.',
    Pisces: 'Creativity and imagination guide you. Dream big.'
  };

  return horoscopes[sign] || 'The stars align for a positive day. Trust your instincts.';
};

module.exports = {
  getZodiacSign,
  getDailyHoroscope
};
