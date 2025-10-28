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
    it('should calculate life path number for valid birth date', async () => {
      const birthDate = '15/03/1990';
      const fullName = 'John Doe';

      const report = await numerologyService.generateFullReport(fullName, birthDate);

      expect(report.lifePath).toBeGreaterThanOrEqual(1);
      expect(report.lifePath).toBeLessThanOrEqual(9);
    });

    it('should handle invalid birth date', async () => {
      const birthDate = 'invalid';
      const fullName = 'John Doe';

      await expect(numerologyService.generateFullReport(fullName, birthDate)).rejects.toThrow();
    });

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

      await expect(numerologyService.generateFullReport(name, birthDate)).rejects.toThrow();
    });
  });
});
