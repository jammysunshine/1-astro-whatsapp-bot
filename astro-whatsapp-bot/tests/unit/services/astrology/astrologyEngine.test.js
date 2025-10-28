// tests/unit/services/astrology/astrologyEngine.test.js
// Unit tests for Astrology Engine

const astrologyEngine = require('../../../../src/services/astrology/astrologyEngine');


describe('AstrologyEngine', () => {
  describe('generateAstrologyResponse', () => {
    it('should generate astrology response for valid user', async() => {
      const user = {
        sunSign: 'Pisces',
        moonSign: 'Pisces',
        risingSign: 'Aquarius',
        birthDate: '15/03/1990',
        birthTime: '14:30',
        birthPlace: 'Mumbai, India'
      };

      const response = await astrologyEngine.generateAstrologyResponse('hello', user);

      expect(response).toBeDefined();
      expect(typeof response).toBe('string');
    });
  });

  describe('validateBirthData', () => {
    it('should validate valid birth data', () => {
      const result = astrologyEngine.validateBirthData('15031990', '1430', 'Mumbai, India');

      expect(result.isValid).toBe(true);
    });

    it('should reject invalid birth data', () => {
      const result = astrologyEngine.validateBirthData('invalid', '', '');

      expect(result.isValid).toBe(false);
      expect(result.message).toBeDefined();
    });
  });
});