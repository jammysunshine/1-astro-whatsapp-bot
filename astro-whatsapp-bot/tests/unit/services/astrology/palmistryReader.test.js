// tests/unit/services/astrology/palmistryReader.test.js
// Unit tests for Palmistry reading service

const {
  generatePalmistryReading,
} = require('services/astrology/palmistryReader');

describe('Palmistry Reader Service', () => {
  describe('generatePalmistryReading', () => {
    it('should generate a palmistry reading', () => {
      const user = { id: 'user-123', birthDate: '15/03/1990' };
      const reading = generatePalmistryReading(user);

      expect(reading).toBeDefined();
      expect(typeof reading).toBe('object');
      expect(reading).not.toHaveProperty('error');
    });

    it('should generate sample reading when no user provided', () => {
      const reading = generatePalmistryReading();

      expect(reading).toBeDefined();
      expect(typeof reading).toBe('object');
      expect(reading).not.toHaveProperty('error');
    });

    it('should handle user with hand data', () => {
      const user = {
        id: 'user-456',
        birthDate: '20/07/1985',
        handType: 'earth',
        fingerShape: 'square',
      };
      const reading = generatePalmistryReading(user);

      expect(reading).toBeDefined();
      expect(typeof reading).toBe('object');
    });
  });
});
