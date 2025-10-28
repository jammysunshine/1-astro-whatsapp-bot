// tests/unit/services/astrology/kabbalisticReader.test.js
// Unit tests for Kabbalistic Reader

const kabbalisticReader = require('../../../../src/services/astrology/kabbalisticReader');

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

describe('KabbalisticReader', () => {
  describe('generateKabbalisticChart', () => {
    it('should generate Kabbalistic chart for valid birth data', () => {
      const birthData = {
        birthDate: '15/03/1990',
        birthTime: '14:30',
        name: 'John Doe',
      };

      const chart = kabbalisticReader.generateKabbalisticChart(birthData);

      expect(chart).toBeDefined();
      expect(chart.name).toBe(birthData.name);
      expect(chart.sunSign).toBeDefined();
      expect(chart.moonSign).toBeDefined();
      expect(chart.primarySephirah).toBeDefined();
      expect(chart.secondarySephirah).toBeDefined();
      expect(chart.pathworking).toBeDefined();
      expect(chart.lifeLesson).toBeDefined();
      expect(chart.mysticalQualities).toBeDefined();
      expect(chart.treeOfLifeGuidance).toBeDefined();
      expect(chart.kabbalisticDescription).toBeDefined();
    });

    it('should handle invalid birth data gracefully', () => {
      const birthData = {
        birthDate: 'invalid',
        birthTime: 'invalid',
        name: 'Invalid User',
      };

      const chart = kabbalisticReader.generateKabbalisticChart(birthData);

      expect(chart).toBeDefined();
      expect(chart.error).toBeDefined();
      expect(chart.fallback).toBeDefined();
    });
  });
});
