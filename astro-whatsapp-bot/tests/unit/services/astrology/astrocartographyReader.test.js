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
  describe('generateAstrocartography', () => {
    it('should generate Astrocartography reading for valid birth data', () => {
      const birthData = {
        birthDate: '15/03/1990',
        birthTime: '14:30',
        birthPlace: 'Mumbai, India',
        name: 'Test User'
      };

      const reading = astrocartographyReader.generateAstrocartography(birthData);

      expect(reading).toBeDefined();
      expect(reading.birthData).toBeDefined();
      expect(reading.planetaryLines).toBeDefined();
      expect(reading.interpretation).toBeDefined();
    });

    it('should handle invalid birth data', () => {
      const birthData = {
        birthDate: 'invalid',
        birthTime: 'invalid',
        birthPlace: 'invalid',
        name: 'Test User'
      };

      const reading = astrocartographyReader.generateAstrocartography(birthData);
      expect(reading).toBeDefined();
      expect(reading.error).toBeDefined();
    });
  });

  describe('calculatePlanetaryPositions', () => {
    it('should calculate planetary positions', () => {
      const positions = astrocartographyReader.calculatePlanetaryPositions('15/03/1990', '14:30');

      expect(positions).toBeDefined();
      expect(Array.isArray(positions)).toBe(true);
      expect(positions.length).toBeGreaterThan(0);
    });
  });

  describe('generatePlanetaryLines', () => {
    it('should generate planetary lines', () => {
      const positions = astrocartographyReader.calculatePlanetaryPositions('15/03/1990', '14:30');
      const lines = astrocartographyReader.generatePlanetaryLines(positions);

      expect(lines).toBeDefined();
      expect(Array.isArray(lines)).toBe(true);
      expect(lines.length).toBeGreaterThan(0);
    });
  });
});
