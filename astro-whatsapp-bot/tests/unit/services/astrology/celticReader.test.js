// tests/unit/services/astrology/celticReader.test.js
// Unit tests for Celtic Reader

const celticReader = require('../../../../src/services/astrology/celticReader');

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

describe('CelticReader', () => {
  describe('generateCelticChart', () => {
    it('should generate Celtic chart for valid birth data', () => {
      const birthData = {
        birthDate: '15/03/1990',
        birthTime: '14:30',
        name: 'John Doe'
      };

      const chart = celticReader.generateCelticChart(birthData);

      expect(chart).toBeDefined();
      expect(chart.name).toBe(birthData.name);
      expect(chart.treeSign).toBeDefined();
      expect(chart.animalTotem).toBeDefined();
      expect(chart.seasonalInfluence).toBeDefined();
      expect(chart.druidicWisdom).toBeDefined();
      expect(chart.lifePath).toBeDefined();
      expect(chart.personalityTraits).toBeDefined();
      expect(chart.celticDescription).toBeDefined();
    });

    it('should handle invalid birth data gracefully', () => {
      const birthData = {
        birthDate: 'invalid',
        birthTime: 'invalid',
        name: 'Invalid User'
      };

      const chart = celticReader.generateCelticChart(birthData);

      expect(chart).toBeDefined();
      expect(chart.error).toBeDefined();
      expect(chart.fallback).toBeDefined();
    });
  });

  describe('generateCelticGuidance', () => {
    it('should generate Celtic daily guidance for valid birth date', () => {
      const birthDate = '15/03/1990';

      const guidance = celticReader.generateCelticGuidance(birthDate);

      expect(guidance).toBeDefined();
      expect(guidance.treeGuidance).toBeDefined();
      expect(guidance.animalGuidance).toBeDefined();
      expect(guidance.dailyRitual).toBeDefined();
      expect(guidance.seasonalWisdom).toBeDefined();
      expect(guidance.affirmation).toBeDefined();
    });

    it('should handle errors during guidance generation', () => {
      const birthDate = 'invalid';

      const guidance = celticReader.generateCelticGuidance(birthDate);

      expect(guidance).toBeDefined();
      expect(guidance.treeGuidance).toBeDefined();
      expect(guidance.fallback).toBeDefined();
    });
  });
});
