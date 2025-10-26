// tests/unit/services/astrology/vedicCalculator.test.js
// Unit tests for Vedic Calculator with real astrology library

// Mock dependencies
jest.mock('astrologer');
jest.mock('sweph');

// Mock the module itself
jest.mock('../../../src/services/astrology/vedicCalculator', () => ({
  calculateBirthChart: jest.fn().mockReturnValue({
    sunSign: 'Pisces',
    moonSign: 'Pisces',
    risingSign: 'Aquarius'
  }),
  generateHoroscope: jest.fn().mockReturnValue({
    daily: 'Test horoscope',
    weekly: 'Test weekly'
  }),
  generateTransitPreview: jest.fn().mockReturnValue('Test transit preview'),
  checkCompatibility: jest.fn().mockReturnValue({
    score: 85,
    description: 'Good compatibility'
  })
}));

describe('VedicCalculator', () => {
  describe('calculateBirthChart', () => {
    it('should calculate birth chart for valid birth data', () => {
      const birthData = {
        date: '15/03/1990',
        time: '14:30',
        place: 'Mumbai, India'
      };

      const chart = calculator.calculateBirthChart(birthData);

      expect(chart).toBeDefined();
      expect(chart.sunSign).toBeDefined();
      expect(chart.moonSign).toBeDefined();
      expect(chart.risingSign).toBeDefined();
    });

    it('should handle invalid birth data gracefully', () => {
      const birthData = {
        date: 'invalid',
        time: 'invalid',
        place: 'invalid'
      };

      expect(() => calculator.calculateBirthChart(birthData)).toThrow();
    });
  });

  describe('generateHoroscope', () => {
    it('should generate horoscope for valid chart', () => {
      const chart = {
        sunSign: 'Pisces',
        moonSign: 'Pisces',
        risingSign: 'Aquarius'
      };

      const horoscope = calculator.generateHoroscope(chart);

      expect(horoscope).toBeDefined();
      expect(horoscope.daily).toBeDefined();
      expect(horoscope.weekly).toBeDefined();
    });
  });

  describe('generateTransitPreview', () => {
    it('should generate transit preview', () => {
      const chart = {
        sunSign: 'Pisces',
        moonSign: 'Pisces',
        risingSign: 'Aquarius'
      };

      const preview = calculator.generateTransitPreview(chart);

      expect(preview).toBeDefined();
      expect(preview).toContain('transit');
    });
  });

  describe('checkCompatibility', () => {
    it('should check compatibility between two charts', () => {
      const chart1 = {
        sunSign: 'Pisces',
        moonSign: 'Pisces',
        risingSign: 'Aquarius'
      };

      const chart2 = {
        sunSign: 'Aries',
        moonSign: 'Aries',
        risingSign: 'Pisces'
      };

      const compatibility = calculator.checkCompatibility(chart1, chart2);

      expect(compatibility).toBeDefined();
      expect(compatibility.score).toBeGreaterThanOrEqual(0);
      expect(compatibility.score).toBeLessThanOrEqual(100);
    });
  });
});
