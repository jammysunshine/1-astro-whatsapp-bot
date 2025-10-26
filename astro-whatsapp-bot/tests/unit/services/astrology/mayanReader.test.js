// tests/unit/services/astrology/mayanReader.test.js
// Unit tests for Mayan Reader

const mayanReader = require('../../../src/services/astrology/mayanReader');

// Mock dependencies
jest.mock('../../../src/utils/logger');

describe('MayanReader', () => {
  describe('generateMayanReading', () => {
    it('should generate Mayan reading for valid birth date', () => {
      const birthDate = '15/03/1990';

      const reading = mayanReader.generateMayanReading(birthDate);

      expect(reading).toBeDefined();
      expect(reading.birthDate).toBe(birthDate);
      expect(reading.sign).toBeDefined();
      expect(reading.interpretation).toBeDefined();
    });

    it('should handle invalid birth date', () => {
      const birthDate = 'invalid';

      expect(() => mayanReader.generateMayanReading(birthDate)).toThrow();
    });
  });

  describe('calculateMayanSign', () => {
    it('should calculate Mayan sign for birth date', () => {
      const birthDate = '15/03/1990';

      const sign = mayanReader.calculateMayanSign(birthDate);

      expect(sign).toBeDefined();
      expect(sign).toMatch(/^(Imix|Ik|Akbal|Kan|Chicchan|Cimi|Manik|Lamat|Muluc|Oc|Chuen|Eb|Ben|Ix|Men|Cib|Caban|Etznab|Cauac|Ahau)$/);
    });
  });

  describe('getMayanElement', () => {
    it('should get Mayan element for sign', () => {
      const sign = 'Imix';

      const element = mayanReader.getMayanElement(sign);

      expect(element).toBeDefined();
      expect(element).toMatch(/^(Earth|Air|Fire|Water)$/);
    });
  });
});
