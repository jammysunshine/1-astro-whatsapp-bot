// tests/unit/services/astrology/mayanReader.test.js
// Unit tests for Mayan Reader

const mayanReader = require('../../../../src/services/astrology/mayanReader');

// Mock dependencies
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

describe('MayanReader', () => {
  describe('generateMayanChart', () => {
    it('should generate Mayan chart for valid birth data', () => {
      const birthData = {
        birthDate: '15/03/1990',
        birthTime: '14:30',
        name: 'John Doe',
      };

      const chart = mayanReader.generateMayanChart(birthData);

      expect(chart).toBeDefined();
      expect(chart.name).toBe(birthData.name);
      expect(chart.tzolkin).toBeDefined();
      expect(chart.haab).toBeDefined();
      expect(chart.yearBearer).toBeDefined();
      expect(chart.personality).toBeDefined();
      expect(chart.lifePath).toBeDefined();
      expect(chart.dailyGuidance).toBeDefined();
      expect(chart.mayanDescription).toBeDefined();
    });

    it('should handle invalid birth data gracefully', () => {
      const birthData = {
        birthDate: 'invalid',
        birthTime: 'invalid',
        name: 'Invalid User',
      };

      const chart = mayanReader.generateMayanChart(birthData);

      expect(chart).toBeDefined();
      expect(chart.error).toBeDefined();
      expect(chart.fallback).toBeDefined();
    });
  });
});
