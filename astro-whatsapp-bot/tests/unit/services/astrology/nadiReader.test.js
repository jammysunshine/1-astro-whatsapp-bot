// tests/unit/services/astrology/nadiReader.test.js
// Unit tests for Nadi astrology reading service

const { generateNadiReading } = require('services/astrology/nadiReader');

describe('Nadi Reader Service', () => {
  describe('generateNadiReading', () => {
    it('should generate a Nadi astrology reading', () => {
      const user = { id: 'user-123', birthDate: '15/03/1990', birthPlace: 'Chennai' };
      const reading = generateNadiReading(user);

      expect(reading).toBeDefined();
      expect(typeof reading).toBe('object');
      expect(reading.nadiType).toBeDefined();
      expect(reading.dasaPeriods).toBeDefined();
      expect(reading.remedies).toBeDefined();
      expect(reading.interpretation).toBeDefined();
    });

    it('should handle missing birth date', () => {
      const user = { id: 'user-456' };
      const reading = generateNadiReading(user);

      expect(reading).toBeDefined();
      expect(reading.error).toBeDefined();
    });

    it('should provide Dasa period calculations', () => {
      const user = { id: 'user-789', birthDate: '10/12/1992', birthPlace: 'Delhi' };
      const reading = generateNadiReading(user);

      expect(reading.dasaPeriods).toBeDefined();
      expect(Array.isArray(reading.dasaPeriods)).toBe(true);
      expect(reading.dasaPeriods.length).toBeGreaterThan(0);
    });

    it('should include traditional Nadi remedies', () => {
      const user = { id: 'user-111', birthDate: '25/05/1988', birthPlace: 'Bangalore' };
      const reading = generateNadiReading(user);

      expect(reading.remedies).toBeDefined();
      expect(Array.isArray(reading.remedies)).toBe(true);
      expect(reading.remedies.length).toBeGreaterThan(0);
    });
  });
});