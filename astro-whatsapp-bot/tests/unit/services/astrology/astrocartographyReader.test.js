// tests/unit/services/astrology/astrocartographyReader.test.js
// Unit tests for Astrocartography Reader

const astrocartographyReader = require('../../../../src/services/astrology/astrocartographyReader');
const logger = require('../../../../src/utils/logger');

beforeEach(() => {
  jest.spyOn(logger, 'info').mockImplementation(() => {});
  jest.spyOn(logger, 'error').mockImplementation(() => {});
  jest.spyOn(logger, 'warn').mockImplementation(() => {});
  jest.spyOn(logger, 'debug').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('AstrocartographyReader', () => {
  describe('generateAstrocartographyReading', () => {
    it('should generate Astrocartography reading for valid birth data', () => {
      const birthData = {
        date: '15/03/1990',
        time: '14:30',
        place: 'Mumbai, India'
      };

      const reading = astrocartographyReader.generateAstrocartographyReading(birthData);

      expect(reading).toBeDefined();
      expect(reading.birthData).toEqual(birthData);
      expect(reading.lines).toBeDefined();
      expect(reading.interpretation).toBeDefined();
    });

    it('should handle invalid birth data', () => {
      const birthData = {
        date: 'invalid',
        time: 'invalid',
        place: 'invalid'
      };

      expect(() => astrocartographyReader.generateAstrocartographyReading(birthData)).toThrow();
    });
  });

  describe('calculateAstrocartographyLines', () => {
    it('should calculate Astrocartography lines', () => {
      const birthData = {
        date: '15/03/1990',
        time: '14:30',
        place: 'Mumbai, India'
      };

      const lines = astrocartographyReader.calculateAstrocartographyLines(birthData);

      expect(lines).toBeDefined();
      expect(lines).toHaveLength(10);
      expect(lines.every(line => line.name && line.description)).toBe(true);
    });
  });

  describe('interpretLines', () => {
    it('should interpret Astrocartography lines', () => {
      const lines = [
        { name: 'Sun Line', description: 'Test description' }
      ];

      const interpretation = astrocartographyReader.interpretLines(lines);

      expect(interpretation).toBeDefined();
      expect(interpretation).toContain('Sun Line');
    });
  });
});
