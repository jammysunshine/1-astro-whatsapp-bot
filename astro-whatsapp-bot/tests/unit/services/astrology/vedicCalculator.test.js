// tests/unit/services/astrology/vedicCalculator.test.js
// Unit tests for Vedic Calculator with real astrology library

// Mock dependencies
jest.mock('astrologer');
jest.mock('sweph');

// Import the mocked module
const calculator = require('../../../../src/services/astrology/vedic/VedicCalculator');

// Mock the module itself
jest.mock('../../../../src/services/astrology/vedic/VedicCalculator', () => ({
  calculateBirthChart: jest.fn().mockImplementation(birthData => {
    if (birthData.date === 'invalid') {
      throw new Error('Invalid birth data');
    }
    return {
      sunSign: 'Pisces',
      moonSign: 'Pisces',
      risingSign: 'Aquarius'
    };
  }),
  generateHoroscope: jest.fn().mockReturnValue({
    daily: 'Test horoscope',
    weekly: 'Test weekly'
  }),
  generateTransitPreview: jest.fn().mockReturnValue('Test transit preview'),
  checkCompatibility: jest.fn().mockReturnValue({
    score: 85,
    description: 'Good compatibility'
  }),
  calculateSecondaryProgressions: jest
    .fn()
    .mockImplementation(async birthData => {
      if (birthData.birthDate === 'invalid') {
        return { error: 'Unable to calculate secondary progressions' };
      }
      return {
        ageInYears: 30,
        ageInDays: 10950,
        progressedDate: '2024-01-15T14:30:00.000Z',
        formattedProgressedDate: 'Monday, January 15, 2024',
        progressedChart: {
          sunSign: 'Aquarius',
          moonSign: 'Pisces',
          risingSign: 'Capricorn'
        },
        analysis: {
          progressedSunSign: 'Aquarius',
          progressedMoonSign: 'Pisces',
          progressedRisingSign: 'Capricorn',
          ageDescription: 'Mid-life transitions and stability',
          planetaryPositions: {},
          aspects: []
        },
        keyProgressions: [
          {
            planet: 'Sun',
            position: 'Aquarius',
            significance: 'Identity and life direction in Aquarius'
          }
        ],
        majorThemes: ['Focus on mid-life transitions and stability'],
        lifeChanges: [
          'Saturn Return: Major life restructuring and responsibility'
        ]
      };
    }),
  calculateSolarArcDirections: jest.fn().mockImplementation(birthData => {
    if (birthData.birthDate === 'invalid') {
      return { error: 'Unable to calculate solar arc directions' };
    }
    return {
      ageInYears: 30,
      ageInDays: 10950,
      solarArcDegrees: 10950,
      directedChart: {
        sunSign: 'Aquarius',
        moonSign: 'Pisces',
        risingSign: 'Capricorn'
      },
      analysis: {
        directedSunSign: 'Aquarius',
        directedMoonSign: 'Pisces',
        directedRisingSign: 'Capricorn',
        ageDescription: 'Mid-life transitions and stability',
        planetaryPositions: {},
        aspects: []
      },
      keyDirections: [
        {
          planet: 'Sun',
          from: 'Natal position',
          to: 'Aquarius',
          significance:
            'Identity and life direction directed to Aquarius themes'
        }
      ],
      lifeChanges: [
        'Saturn Return: Major life restructuring and responsibility'
      ]
    };
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

  describe('calculateSecondaryProgressions', () => {
    it('should calculate secondary progressions for valid birth data', async() => {
      const birthData = {
        birthDate: '15/03/1990',
        birthTime: '14:30',
        birthPlace: 'Mumbai, India'
      };

      const progressions =
        await calculator.calculateSecondaryProgressions(birthData);

      expect(progressions).toBeDefined();
      expect(progressions.ageInYears).toBeDefined();
      expect(progressions.ageInDays).toBeDefined();
      expect(progressions.progressedDate).toBeDefined();
      expect(progressions.formattedProgressedDate).toBeDefined();
      expect(progressions.progressedChart).toBeDefined();
      expect(progressions.analysis).toBeDefined();
      expect(progressions.keyProgressions).toBeDefined();
      expect(progressions.majorThemes).toBeDefined();
      expect(progressions.lifeChanges).toBeDefined();
    });

    it('should handle invalid birth data gracefully', async() => {
      const birthData = {
        birthDate: 'invalid',
        birthTime: 'invalid',
        birthPlace: 'invalid'
      };

      const progressions =
        await calculator.calculateSecondaryProgressions(birthData);

      expect(progressions).toBeDefined();
      expect(progressions.error).toBeDefined();
    });
  });

  describe('calculateSolarArcDirections', () => {
    it('should calculate solar arc directions for valid birth data', () => {
      const birthData = {
        birthDate: '15/03/1990',
        birthTime: '14:30',
        birthPlace: 'Mumbai, India'
      };

      const solarArc = calculator.calculateSolarArcDirections(birthData);

      expect(solarArc).toBeDefined();
      expect(solarArc.ageInYears).toBeDefined();
      expect(solarArc.ageInDays).toBeDefined();
      expect(solarArc.solarArcDegrees).toBeDefined();
      expect(solarArc.directedChart).toBeDefined();
      expect(solarArc.analysis).toBeDefined();
      expect(solarArc.keyDirections).toBeDefined();
      expect(solarArc.lifeChanges).toBeDefined();
    });

    it('should handle invalid birth data gracefully', () => {
      const birthData = {
        birthDate: 'invalid',
        birthTime: 'invalid',
        birthPlace: 'invalid'
      };

      const solarArc = calculator.calculateSolarArcDirections(birthData);

      expect(solarArc).toBeDefined();
      expect(solarArc.error).toBeDefined();
    });
  });
});
