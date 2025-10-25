// tests/e2e/astrology-integration.test.js
// End-to-end tests for astrology library integrations

const {
  generateTarotReading,
} = require('../../src/services/astrology/tarotReader');
const {
  generatePalmistryReading,
} = require('../../src/services/astrology/palmistryReader');
const {
  generateNadiReading,
} = require('../../src/services/astrology/nadiReader');
const chineseCalculator = require('../../src/services/astrology/chineseCalculator');
const vedicCalculator = require('../../src/services/astrology/vedicCalculator');
const {
  getNumerologyReport,
} = require('../../src/services/astrology/numerologyService');

describe('Astrology Library Integration Tests', () => {
  const testUser = {
    id: 'test-user-123',
    birthDate: '15/03/1990',
    birthTime: '07:30',
    birthPlace: 'Mumbai, India',
    name: 'Test User',
  };

  describe('Tarot Reader Integration', () => {
    it('should generate valid single card tarot reading', () => {
      const reading = generateTarotReading(testUser, 'single');

      expect(reading).toBeDefined();
      expect(reading.type).toBe('single');
      expect(reading.cards).toHaveLength(1);
      expect(reading.interpretation).toBeDefined();
      expect(reading.advice).toBeDefined();
      expect(typeof reading.interpretation).toBe('string');
      expect(typeof reading.advice).toBe('string');
      expect(reading.interpretation.length).toBeGreaterThan(10);
      expect(reading.advice.length).toBeGreaterThan(10);
    });

    it('should generate valid three-card spread reading', () => {
      const reading = generateTarotReading(testUser, 'three-card');

      expect(reading).toBeDefined();
      expect(reading.type).toBe('three-card');
      expect(reading.cards).toHaveLength(3);
      expect(reading.interpretation).toBeDefined();
      expect(reading.advice).toBeDefined();
    });

    it('should generate valid Celtic cross reading', () => {
      const reading = generateTarotReading(testUser, 'celtic-cross');

      expect(reading).toBeDefined();
      expect(reading.type).toBe('celtic-cross');
      expect(reading.cards).toHaveLength(10);
      expect(reading.interpretation).toBeDefined();
      expect(reading.advice).toBeDefined();
    });

    it('should handle invalid spread type gracefully', () => {
      const reading = generateTarotReading(testUser, 'invalid-spread');

      expect(reading).toBeDefined();
      expect(reading.type).toBe('invalid-spread');
      expect(reading.cards).toHaveLength(1); // Falls back to single card
    });
  });

  describe('Palmistry Reader Integration', () => {
    it('should generate valid palmistry reading', () => {
      const reading = generatePalmistryReading(testUser);

      expect(reading).toBeDefined();
      expect(reading.handType).toBeDefined();
      expect(reading.lifeLine).toBeDefined();
      expect(reading.heartLine).toBeDefined();
      expect(reading.headLine).toBeDefined();
      expect(reading.fateLine).toBeDefined();
      expect(reading.interpretation).toBeDefined();
      expect(reading.advice).toBeDefined();
      expect(typeof reading.interpretation).toBe('string');
      expect(typeof reading.advice).toBe('string');
    });

    it('should generate sample reading when no user provided', () => {
      const reading = generatePalmistryReading(null);

      expect(reading).toBeDefined();
      expect(reading.handType).toBeDefined();
      expect(
        reading.overallPersonality || reading.interpretation
      ).toBeDefined();
    });
  });

  describe('Nadi Reader Integration', () => {
    it('should generate valid Nadi astrology reading', () => {
      const reading = generateNadiReading(testUser);

      expect(reading).toBeDefined();
      expect(reading.nadiType).toBeDefined();
      expect(reading.dasaPeriods).toBeDefined();
      expect(reading.remedies).toBeDefined();
      expect(Array.isArray(reading.dasaPeriods)).toBe(true);
      expect(Array.isArray(reading.remedies)).toBe(true);
      expect(reading.dasaPeriods.length).toBeGreaterThan(0);
    });

    it('should handle missing birth date', () => {
      const userWithoutBirth = { id: 'test-user-no-birth' };
      const reading = generateNadiReading(userWithoutBirth);

      expect(reading).toBeDefined();
      expect(reading.error).toBeDefined();
      expect(reading.error).toContain('Birth date');
    });
  });

  describe('Chinese Calculator Integration', () => {
    it('should calculate valid Chinese zodiac sign', () => {
      const sign = chineseCalculator.getChineseZodiac('15/03/1990');

      expect(sign).toBeDefined();
      expect(sign.animal).toBeDefined();
      expect(sign.element).toBeDefined();
      expect(sign.traits).toBeDefined();
      expect(sign.elementTraits).toBeDefined();
      expect(typeof sign.traits).toBe('string');
      expect(typeof sign.elementTraits).toBe('string');
    });

    it('should handle different birth dates correctly', () => {
      const sign1 = chineseCalculator.getChineseZodiac('01/01/1980');
      const sign2 = chineseCalculator.getChineseZodiac('01/01/1990');

      expect(sign1.animal).not.toBe(sign2.animal); // Different years should give different signs
    });
  });

  describe('Vedic Calculator Integration', () => {
    it('should calculate valid Vedic birth chart', () => {
      const chart = vedicCalculator.generateBasicBirthChart(testUser);

      expect(chart).toBeDefined();
      expect(chart.sunSign).toBeDefined();
      expect(chart.moonSign).toBeDefined();
      expect(chart.risingSign || chart.ascendant).toBeDefined();
      expect(chart.planets).toBeDefined();
      expect(typeof chart.sunSign).toBe('string');
      expect(typeof chart.moonSign).toBe('string');
    });

    it('should handle invalid birth data gracefully', () => {
      const userWithoutBirth = { id: 'test-user-no-birth' };
      const chart = vedicCalculator.generateBasicBirthChart(userWithoutBirth);

      expect(chart).toBeDefined();
      expect(chart.sunSign).toBeDefined();
      expect(chart.description).toBeDefined();
    });
  });

  describe('Numerology Service Integration', () => {
    it('should generate valid numerology report', () => {
      const report = getNumerologyReport(testUser.birthDate, testUser.name);

      expect(report).toBeDefined();
      expect(report.lifePath).toBeDefined();
      expect(report.expression).toBeDefined();
      expect(report.soulUrge).toBeDefined();
      expect(report.personality).toBeDefined();

      // Numbers should be between 1-9 or 11, 22, 33 (master numbers)
      const validNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33];
      expect(validNumbers).toContain(report.lifePath.number);
      expect(validNumbers).toContain(report.expression.number);
    });

    it('should handle user without name', () => {
      const report = getNumerologyReport('15/03/1990', '');

      expect(report).toBeDefined();
      // Should still return life path even without name
      expect(report.lifePath).toBeDefined();
      expect(report.lifePath.number).toBeDefined();
    });
  });

  describe('Cross-System Compatibility', () => {
    it('should generate compatible readings across different systems', () => {
      const tarot = generateTarotReading(testUser, 'single');
      const palmistry = generatePalmistryReading(testUser);
      const nadi = generateNadiReading(testUser);
      const chinese = chineseCalculator.getChineseZodiac(testUser.birthDate);
      const vedic = vedicCalculator.generateBasicBirthChart(testUser);
      const numerology = getNumerologyReport(testUser);

      // All systems should return valid data without throwing errors
      expect(tarot).toBeDefined();
      expect(palmistry).toBeDefined();
      expect(nadi).toBeDefined();
      expect(chinese).toBeDefined();
      expect(vedic).toBeDefined();
      expect(numerology).toBeDefined();

      // All should return valid data
      expect(tarot.type).toBeDefined();
      expect(palmistry.handType).toBeDefined();
      expect(nadi.nadiType).toBeDefined();
      expect(numerology.lifePath).toBeDefined();
    });

    it('should handle edge cases consistently across systems', () => {
      const edgeUser = {
        id: 'edge-user',
        birthDate: '29/02/2000', // Leap year edge case
        birthTime: '23:59', // End of day
        birthPlace: 'North Pole', // Extreme location
        name: 'A', // Minimal name
      };

      expect(() => generateTarotReading(edgeUser, 'single')).not.toThrow();
      expect(() => generatePalmistryReading(edgeUser)).not.toThrow();
      expect(() => generateNadiReading(edgeUser)).not.toThrow();
      expect(() =>
        chineseCalculator.getChineseZodiac(edgeUser.birthDate)
      ).not.toThrow();
      expect(() =>
        vedicCalculator.generateBasicBirthChart(edgeUser)
      ).not.toThrow();
      expect(() => getNumerologyReport(edgeUser)).not.toThrow();
    });
  });
});
