// tests/unit/services/astrology/numerologyService.test.js
// Unit tests for Numerology Service

const numerologyService = require('../../../../src/services/astrology/numerologyService');

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

describe('NumerologyService', () => {
  describe('generateFullReport', () => {
    it('should generate numerology report with life path, expression, soul urge, personality, destiny, and maturity numbers', async () => {
      const birthDate = '15/03/1990';
      const name = 'John Doe';

      const report = await numerologyService.generateFullReport(name, birthDate);

      expect(report).toBeDefined();
      expect(report.lifePath).toBeDefined();
      expect(report.expression).toBeDefined();
      expect(report.soulUrge).toBeDefined();
      expect(report.personality).toBeDefined();
      expect(report.destiny).toBeDefined();
      expect(report.maturity).toBeDefined();
      expect(report.lifePathDescription).toBeDefined();
      expect(report.expressionDescription).toBeDefined();
      expect(report.soulUrgeDescription).toBeDefined();
      expect(report.personalityDescription).toBeDefined();
      expect(report.strengths).toBeDefined();
      expect(report.challenges).toBeDefined();
      expect(report.careerPaths).toBeDefined();
      expect(report.compatibleNumbers).toBeDefined();
    });

    it('should handle empty name for numerology report', async () => {
      const birthDate = '15/03/1990';
      const name = '';

      const report = await numerologyService.generateFullReport(name, birthDate);

      // Empty name should still return valid structure but with zero values
      expect(report).toBeDefined();
      expect(report.lifePath).toBe(1); // Birth date calculation still works
      expect(report.expression).toBe(0); // No letters = 0
      expect(report.soulUrge).toBe(0); // No vowels = 0
      expect(report.personality).toBe(0); // No consonants = 0
      expect(report.expressionDescription).toBe('Interpretation not found.');
    });
  });
});