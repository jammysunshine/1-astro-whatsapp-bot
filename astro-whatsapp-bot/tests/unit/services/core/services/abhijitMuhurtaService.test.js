// tests/unit/services/core/services/abhijitMuhurtaService.test.js
const AbhijitMuhurtaService = require('../../../../../src/core/services/abhijitMuhurtaService');
const logger = require('../../../../../src/utils/logger');

// Mock dependencies
jest.mock('../../../../../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));

let serviceInstance;

beforeEach(async () => {
  jest.clearAllMocks();

  serviceInstance = new AbhijitMuhurtaService();
  await serviceInstance.initialize();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('AbhijitMuhurtaService', () => {
  describe('constructor', () => {
    it('should initialize correctly', () => {
      expect(serviceInstance).toBeInstanceOf(AbhijitMuhurtaService);
      expect(serviceInstance.serviceName).toBe('AbhijitMuhurtaService');
      expect(serviceInstance.calculatorPath).toBe('./calculators/index');
    });
  });

  describe('processCalculation', () => {
    const validBirthData = {
      birthDate: '15/06/1990',
      birthTime: '14:30',
      birthPlace: 'New York, USA'
    };

    it('should process Abhijit Muhurta calculation successfully', async () => {
      const result = await serviceInstance.processCalculation(validBirthData);

      expect(result).toBeDefined();
      expect(result.birthData).toEqual(validBirthData);
      expect(result.abhijitTiming).toBeDefined();
      expect(result.abhijitTiming.startTime).toBeDefined();
      expect(result.abhijitTiming.endTime).toBeDefined();
      expect(result.abhijitTiming.durationMinutes).toBeDefined();
      expect(result.significanceAnalysis).toBeDefined();
      expect(result.recommendations).toBeDefined();
      expect(result.summary).toBeDefined();
      expect(result.serviceMetadata).toBeDefined();
      expect(result.serviceMetadata.serviceName).toBe('AbhijitMuhurtaService');
    });

    it('should handle calculator errors', async () => {
      // Mock a method to throw error
      jest.spyOn(serviceInstance, '_calculateAbhijitMuhurta').mockRejectedValue(
        new Error('Calculation failed')
      );

      await expect(serviceInstance.processCalculation(validBirthData)).rejects.toThrow(
        'Abhijit Muhurta analysis failed: Calculation failed'
      );
    });

    it('should validate input data', async () => {
      await expect(serviceInstance.processCalculation(null)).rejects.toThrow(
        'Birth data is required for Abhijit Muhurta analysis'
      );
    });
  });

  describe('_calculateAbhijitMuhurta', () => {
    const validBirthData = {
      birthDate: '15/06/1990',
      birthTime: '14:30',
      birthPlace: 'New York, USA'
    };

    it('should calculate Abhijit Muhurta timing', async () => {
      const result = await serviceInstance._calculateAbhijitMuhurta(validBirthData);

      expect(result).toBeDefined();
      expect(result.birthData).toEqual(validBirthData);
      expect(result.abhijitTiming).toBeDefined();
      expect(result.abhijitTiming.startTime).toMatch(/^\d{2}:\d{2}$/);
      expect(result.abhijitTiming.endTime).toMatch(/^\d{2}:\d{2}$/);
      expect(result.abhijitTiming.durationMinutes).toBeGreaterThan(0);
      expect(result.significanceAnalysis).toBeDefined();
      expect(result.recommendations).toBeDefined();
    });
  });

  describe('_calculateAbhijitTiming', () => {
    it('should calculate Abhijit timing from sun times', () => {
      const sunTimes = {
        sunrise: 6.0,
        sunset: 18.0
      };

      const result = serviceInstance._calculateAbhijitTiming(sunTimes);

      expect(result).toBeDefined();
      expect(result.startTime).toMatch(/^\d{2}:\d{2}$/);
      expect(result.endTime).toMatch(/^\d{2}:\d{2}$/);
      expect(result.durationMinutes).toBeGreaterThan(0);
      expect(result.centerTime).toMatch(/^\d{2}:\d{2}$/);
      expect(result.sunTimes.sunrise).toMatch(/^\d{2}:\d{2}$/);
      expect(result.sunTimes.sunset).toMatch(/^\d{2}:\d{2}$/);
    });

    it('should handle calculation errors gracefully', () => {
      // Mock sunTimes to cause error
      const invalidSunTimes = null;

      const result = serviceInstance._calculateAbhijitTiming(invalidSunTimes);

      expect(result).toBeDefined();
      expect(result.startTime).toBe('11:36');
      expect(result.endTime).toBe('12:24');
      expect(result.durationMinutes).toBe(48);
    });
  });

  describe('_analyzeAbhijitSignificance', () => {
    it('should analyze Abhijit significance', () => {
      const abhijitTiming = {
        durationMinutes: 48
      };
      const birthData = {
        birthDate: '15/06/1990',
        birthTime: '14:30',
        birthPlace: 'New York, USA'
      };

      const result = serviceInstance._analyzeAbhijitSignificance(abhijitTiming, birthData);

      expect(result).toBeDefined();
      expect(result.name).toBe('Abhijit');
      expect(result.sanskrit).toBe('अभिजित्');
      expect(result.translation).toBe('Unconquerable Victory');
      expect(result.characteristics).toBeDefined();
      expect(result.characteristics.length).toBeGreaterThan(0);
      expect(result.benefits).toBeDefined();
      expect(result.benefits.length).toBeGreaterThan(0);
      expect(result.activities).toBeDefined();
      expect(result.activities.highlyRecommended).toBeDefined();
      expect(result.activities.moderatelyRecommended).toBeDefined();
      expect(result.activities.avoid).toBeDefined();
    });
  });

  describe('_generateAbhijitRecommendations', () => {
    it('should generate recommendations', () => {
      const abhijitTiming = {
        startTime: '11:36',
        endTime: '12:24'
      };
      const significanceAnalysis = {
        activities: {
          highlyRecommended: ['Starting new ventures']
        }
      };

      const result = serviceInstance._generateAbhijitRecommendations(abhijitTiming, significanceAnalysis);

      expect(result).toBeDefined();
      expect(result.optimalUsage).toBeDefined();
      expect(result.optimalUsage.length).toBeGreaterThan(0);
      expect(result.preparation).toBeDefined();
      expect(result.preparation.length).toBeGreaterThan(0);
      expect(result.duringAbhijit).toBeDefined();
      expect(result.duringAbhijit.length).toBeGreaterThan(0);
      expect(result.postAbhijit).toBeDefined();
      expect(result.postAbhijit.length).toBeGreaterThan(0);
      expect(result.mantras).toBeDefined();
      expect(result.mantras.length).toBeGreaterThan(0);
      expect(result.remedies).toBeDefined();
      expect(result.remedies.length).toBeGreaterThan(0);
    });
  });

  describe('_generateAbhijitSummary', () => {
    it('should generate comprehensive summary', () => {
      const abhijitTiming = {
        startTime: '11:36',
        endTime: '12:24',
        durationMinutes: 48,
        centerTime: '12:00'
      };
      const significanceAnalysis = {
        activities: {
          highlyRecommended: ['Starting new ventures', 'Important meetings', 'Travel', 'Medical procedures']
        },
        benefits: ['Maximum divine blessings', 'Highest probability of success', 'Protection from negative influences']
      };
      const recommendations = {
        optimalUsage: ['Plan important activities', 'Set clear intentions', 'Engage in activities with full focus']
      };

      const result = serviceInstance._generateAbhijitSummary(
        abhijitTiming,
        significanceAnalysis,
        recommendations
      );

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toContain('Abhijit Muhurta Analysis');
      expect(result).toContain('11:36 - 12:24');
      expect(result).toContain('48 minutes');
      expect(result).toContain('Center Time: 12:00');
      expect(result).toContain('Highly Recommended Activities');
      expect(result).toContain('Benefits');
      expect(result).toContain('Optimal Usage Tips');
    });
  });

  describe('formatResult', () => {
    it('should format successful result', () => {
      const mockResult = {
        abhijitTiming: { startTime: '11:36', endTime: '12:24' },
        summary: 'Abhijit analysis completed'
      };

      const formatted = serviceInstance.formatResult(mockResult);

      expect(formatted.success).toBe(true);
      expect(formatted.data).toBe(mockResult);
      expect(formatted.summary).toBe('Abhijit analysis completed');
      expect(formatted.metadata).toBeDefined();
      expect(formatted.metadata.system).toBe('Abhijit Muhurta Analysis');
    });

    it('should format error result', () => {
      const errorResult = {
        error: 'Calculation failed'
      };

      const formatted = serviceInstance.formatResult(errorResult);

      expect(formatted.success).toBe(false);
      expect(formatted.error).toBe('Calculation failed');
      expect(formatted.message).toBe('Abhijit Muhurta analysis failed');
    });
  });

  describe('getMetadata', () => {
    it('should return correct metadata', () => {
      const metadata = serviceInstance.getMetadata();

      expect(metadata.name).toBe('AbhijitMuhurtaService');
      expect(metadata.version).toBe('1.0.0');
      expect(metadata.category).toBe('vedic');
      expect(metadata.methods).toEqual(['execute', 'processCalculation', 'formatResult']);
      expect(metadata.dependencies).toEqual([]);
    });
  });

  describe('getHealthStatus', () => {
    it('should return healthy status', async () => {
      const status = await serviceInstance.getHealthStatus();

      expect(status.status).toBe('healthy');
      expect(status.serviceName).toBe('AbhijitMuhurtaService');
      expect(status.features).toBeDefined();
      expect(status.features.abhijitTiming).toBe(true);
      expect(status.features.muhurtaAnalysis).toBe(true);
      expect(status.features.spiritualPractices).toBe(true);
      expect(status.supportedCalculations).toBeDefined();
      expect(status.calculationMethods).toBeDefined();
    });
  });

  describe('_validateInput', () => {
    it('should validate correct birth data', () => {
      const validData = {
        birthDate: '15/06/1990',
        birthTime: '14:30',
        birthPlace: 'New York'
      };

      expect(() => serviceInstance._validateInput(validData)).not.toThrow();
    });

    it('should throw error for missing birth data', () => {
      expect(() => serviceInstance._validateInput(null)).toThrow(
        'Birth data is required for Abhijit Muhurta analysis'
      );
    });
  });

  describe('_decimalToTime', () => {
    it('should convert decimal hours to time string', () => {
      expect(serviceInstance._decimalToTime(12.5)).toBe('12:30');
      expect(serviceInstance._decimalToTime(6.25)).toBe('06:15');
      expect(serviceInstance._decimalToTime(18.75)).toBe('18:45');
    });
  });

  describe('_dateToJulianDay', () => {
    it('should convert date to Julian Day', () => {
      const jd = serviceInstance._dateToJulianDay(1990, 6, 15, 14.5);
      expect(jd).toBeGreaterThan(2448000); // Approximate range for 1990
      expect(typeof jd).toBe('number');
    });
  });
});