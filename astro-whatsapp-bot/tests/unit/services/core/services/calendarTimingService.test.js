// tests/unit/services/core/services/calendarTimingService.test.js
const CalendarTimingService = require('../../../../../src/core/services/calendarTimingService');
const logger = require('../../../../../src/utils/logger');

// Mock dependencies
jest.mock('../../../../../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));

// Mock calculators
jest.mock('../../../../../src/core/services/calculators/ChartGenerator', () => ({
  calculateMuhurta: jest.fn(),
  calculateAbhijitMuhurta: jest.fn(),
  calculateRahukalam: jest.fn(),
  calculateGulikakalam: jest.fn()
}));

jest.mock('../../../../../src/core/services/calculators/PanchangCalculator', () => ({
  calculatePanchang: jest.fn()
}));

let serviceInstance;

beforeEach(async () => {
  jest.clearAllMocks();

  serviceInstance = new CalendarTimingService();
  await serviceInstance.initialize();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('CalendarTimingService', () => {
  describe('constructor', () => {
    it('should initialize correctly', () => {
      expect(serviceInstance).toBeInstanceOf(CalendarTimingService);
      expect(serviceInstance.serviceName).toBe('CalendarTimingService');
      expect(serviceInstance.calculatorPath).toBe('./calculators/ChartGenerator');
    });
  });

  describe('processCalculation', () => {
    const validTimingData = {
      date: '15/06/2025',
      location: {
        latitude: 28.6139,
        longitude: 77.209
      },
      activityType: 'business'
    };

    it('should process calendar timing calculation successfully', async () => {
      // Mock calculator responses
      serviceInstance.calculator.calculateMuhurta.mockResolvedValue({
        recommendedMuhurtas: [
          { startTime: '10:00', endTime: '11:00', reason: 'Favorable for business' }
        ]
      });
      serviceInstance.calculator.calculateAbhijitMuhurta.mockResolvedValue({
        isAvailable: true,
        startTime: '11:36',
        endTime: '12:24'
      });
      serviceInstance.calculator.calculateRahukalam.mockResolvedValue({
        startTime: '15:00',
        endTime: '16:30'
      });
      serviceInstance.calculator.calculateGulikakalam.mockResolvedValue({
        startTime: '13:30',
        endTime: '15:00'
      });

      const result = await serviceInstance.processCalculation(validTimingData);

      expect(result).toBeDefined();
      expect(result.date).toBe('15/06/2025');
      expect(result.location).toEqual(validTimingData.location);
      expect(result.activityType).toBe('business');
      expect(result.muhurtaAnalysis).toBeDefined();
      expect(result.abhijitMuhurta).toBeDefined();
      expect(result.rahukalam).toBeDefined();
      expect(result.gulikakalam).toBeDefined();
      expect(result.recommendations).toBeDefined();
    });

    it('should handle calculator errors', async () => {
      jest.spyOn(serviceInstance, 'getCalendarTimingAnalysis').mockRejectedValue(
        new Error('Analysis failed')
      );

      await expect(serviceInstance.processCalculation(validTimingData)).rejects.toThrow(
        'Calendar timing analysis failed: Analysis failed'
      );
    });
  });

  describe('getCalendarTimingAnalysis', () => {
    const timingData = {
      date: '15/06/2025',
      location: {
        latitude: 28.6139,
        longitude: 77.209
      },
      activityType: 'marriage'
    };

    beforeEach(() => {
      // Mock all calculator methods
      serviceInstance.calculator.calculateMuhurta.mockResolvedValue({
        recommendedMuhurtas: []
      });
      serviceInstance.calculator.calculateAbhijitMuhurta.mockResolvedValue({
        isAvailable: true,
        startTime: '11:36',
        endTime: '12:24'
      });
      serviceInstance.calculator.calculateRahukalam.mockResolvedValue({
        startTime: '15:00',
        endTime: '16:30'
      });
      serviceInstance.calculator.calculateGulikakalam.mockResolvedValue({
        startTime: '13:30',
        endTime: '15:00'
      });
    });

    it('should return comprehensive timing analysis', async () => {
      const result = await serviceInstance.getCalendarTimingAnalysis(timingData);

      expect(result).toBeDefined();
      expect(result.date).toBe('15/06/2025');
      expect(result.location).toEqual(timingData.location);
      expect(result.activityType).toBe('marriage');
      expect(result.muhurtaAnalysis).toBeDefined();
      expect(result.abhijitMuhurta).toBeDefined();
      expect(result.rahukalam).toBeDefined();
      expect(result.gulikakalam).toBeDefined();
      expect(result.panchangTiming).toBeDefined();
      expect(result.recommendations).toBeDefined();
    });

    it('should call all calculator methods with correct parameters', async () => {
      await serviceInstance.getCalendarTimingAnalysis(timingData);

      expect(serviceInstance.calculator.calculateMuhurta).toHaveBeenCalledWith(
        '15/06/2025',
        timingData.location,
        'marriage'
      );
      expect(serviceInstance.calculator.calculateAbhijitMuhurta).toHaveBeenCalledWith(
        '15/06/2025',
        timingData.location
      );
      expect(serviceInstance.calculator.calculateRahukalam).toHaveBeenCalledWith(
        '15/06/2025',
        timingData.location
      );
      expect(serviceInstance.calculator.calculateGulikakalam).toHaveBeenCalledWith(
        '15/06/2025',
        timingData.location
      );
    });
  });

  describe('_getPanchangTiming', () => {
    it('should get panchang timing data', async () => {
      const date = '15/06/2025';
      const location = { latitude: 28.6139, longitude: 77.209 };

      const mockPanchangData = {
        tithi: 'Shukla Paksha Dvitiya',
        nakshatra: 'Rohini',
        yoga: 'Shukla',
        karana: 'Bava',
        sunrise: '05:30',
        sunset: '19:15'
      };

      // Mock PanchangCalculator
      const mockPanchangCalc = {
        calculatePanchang: jest.fn().mockResolvedValue(mockPanchangData)
      };

      serviceInstance.calculator = mockPanchangCalc;

      const result = await serviceInstance._getPanchangTiming(date, location);

      expect(result).toBeDefined();
      expect(result.tithi).toBe('Shukla Paksha Dvitiya');
      expect(result.nakshatra).toBe('Rohini');
      expect(result.yoga).toBe('Shukla');
      expect(result.karana).toBe('Bava');
      expect(result.sunrise).toBe('05:30');
      expect(result.sunset).toBe('19:15');
    });

    it('should handle panchang calculation errors gracefully', async () => {
      const date = '15/06/2025';
      const location = { latitude: 28.6139, longitude: 77.209 };

      // Mock calculator to throw error
      serviceInstance.calculator = null;

      const result = await serviceInstance._getPanchangTiming(date, location);

      expect(result).toBeNull();
    });
  });

  describe('_generateTimingRecommendations', () => {
    it('should generate timing recommendations', () => {
      const analysis = {
        muhurtaAnalysis: {
          recommendedMuhurtas: [
            { startTime: '10:00', endTime: '11:00', reason: 'Favorable for business' }
          ]
        },
        abhijitMuhurta: {
          isAvailable: true,
          startTime: '11:36',
          endTime: '12:24'
        },
        rahukalam: {
          startTime: '15:00',
          endTime: '16:30'
        },
        gulikakalam: {
          startTime: '13:30',
          endTime: '15:00'
        },
        activityType: 'business'
      };

      const result = serviceInstance._generateTimingRecommendations(analysis);

      expect(result).toBeDefined();
      expect(result.optimalTimes).toBeDefined();
      expect(result.optimalTimes.length).toBeGreaterThan(0);
      expect(result.avoidTimes).toBeDefined();
      expect(result.avoidTimes.length).toBeGreaterThan(0);
      expect(result.generalAdvice).toBeDefined();
      expect(result.activitySpecific).toBeDefined();

      // Check Abhijit Muhurta is included
      const abhijitTime = result.optimalTimes.find(t => t.type === 'Abhijit Muhurta');
      expect(abhijitTime).toBeDefined();
      expect(abhijitTime.time).toBe('11:36 - 12:24');

      // Check Rahukalam is included in avoid times
      const rahukalamTime = result.avoidTimes.find(t => t.type === 'Rahukalam');
      expect(rahukalamTime).toBeDefined();
      expect(rahukalamTime.time).toBe('15:00 - 16:30');
    });

    it('should handle missing abhijit muhurta', () => {
      const analysis = {
        muhurtaAnalysis: { recommendedMuhurtas: [] },
        abhijitMuhurta: { isAvailable: false },
        rahukalam: null,
        gulikakalam: null,
        activityType: 'general'
      };

      const result = serviceInstance._generateTimingRecommendations(analysis);

      expect(result.optimalTimes).toEqual([]);
      expect(result.avoidTimes).toEqual([]);
    });
  });

  describe('_getActivitySpecificAdvice', () => {
    it('should return activity-specific advice for marriage', () => {
      const advice = serviceInstance._getActivitySpecificAdvice('marriage');

      expect(advice).toBeDefined();
      expect(advice.priority).toBe('High');
      expect(advice.considerations).toContain('auspicious tithi');
      expect(advice.bestMuhurta).toBe('Abhijit Muhurta or Brahma Muhurta');
    });

    it('should return activity-specific advice for business', () => {
      const advice = serviceInstance._getActivitySpecificAdvice('business');

      expect(advice).toBeDefined();
      expect(advice.priority).toBe('Medium');
      expect(advice.considerations).toContain('Avoid Rahukalam');
      expect(advice.bestMuhurta).toContain('Abhijit Muhurta');
    });

    it('should return general advice for unknown activity types', () => {
      const advice = serviceInstance._getActivitySpecificAdvice('unknown');

      expect(advice).toBeDefined();
      expect(advice.priority).toBe('Low');
      expect(advice.considerations).toBe('General auspicious timing');
      expect(advice.bestMuhurta).toContain('Abhijit Muhurta');
    });
  });

  describe('_createTimingSummary', () => {
    it('should create timing summary', () => {
      const result = {
        date: '15/06/2025',
        location: { latitude: 28.6139, longitude: 77.209 },
        activityType: 'business',
        recommendations: {
          optimalTimes: [
            { type: 'Abhijit Muhurta', time: '11:36 - 12:24', reason: 'Most auspicious' }
          ],
          avoidTimes: [
            { type: 'Rahukalam', time: '15:00 - 16:30', reason: 'Inauspicious' }
          ],
          activitySpecific: { priority: 'High', considerations: 'Check tithi' }
        }
      };

      const summary = serviceInstance._createTimingSummary(result);

      expect(summary).toBeDefined();
      expect(summary.date).toBe('15/06/2025');
      expect(summary.location).toEqual(result.location);
      expect(summary.activityType).toBe('business');
      expect(summary.optimalTiming).toEqual(result.recommendations.optimalTimes[0]);
      expect(summary.timesToAvoid).toEqual(result.recommendations.avoidTimes);
      expect(summary.keyRecommendation).toEqual(result.recommendations.activitySpecific);
    });
  });

  describe('validate', () => {
    it('should validate correct timing data', () => {
      const validData = {
        date: '15/06/2025',
        location: {
          latitude: 28.6139,
          longitude: 77.209
        },
        activityType: 'business'
      };

      expect(() => serviceInstance.validate(validData)).not.toThrow();
    });

    it('should throw error for missing timing data', () => {
      expect(() => serviceInstance.validate(null)).toThrow('Timing data is required');
    });

    it('should throw error for missing required fields', () => {
      expect(() => serviceInstance.validate({})).toThrow('Date is required for calendar timing analysis');
      expect(() => serviceInstance.validate({ date: '15/06/2025' })).toThrow('Location is required for calendar timing analysis');
    });

    it('should throw error for invalid date format', () => {
      const invalidData = {
        date: '15-06-2025',
        location: {
          latitude: 28.6139,
          longitude: 77.209
        }
      };

      expect(() => serviceInstance.validate(invalidData)).toThrow(
        'Date must be in DD/MM/YYYY format'
      );
    });

    it('should throw error for missing location coordinates', () => {
      const invalidData = {
        date: '15/06/2025',
        location: {}
      };

      expect(() => serviceInstance.validate(invalidData)).toThrow(
        'Location must include latitude and longitude coordinates'
      );
    });
  });

  describe('formatResult', () => {
    it('should format result with service information', () => {
      const mockResult = {
        date: '15/06/2025',
        muhurtaAnalysis: { recommendedMuhurtas: [] },
        recommendations: { optimalTimes: [] }
      };

      const formatted = serviceInstance.formatResult(mockResult);

      expect(formatted.success).toBe(true);
      expect(formatted.service).toBe('Vedic Calendar Timing Analysis');
      expect(formatted.timestamp).toBeDefined();
      expect(formatted.data).toBe(mockResult);
      expect(formatted.disclaimer).toContain('Timing Disclaimer');
    });
  });

  describe('getMetadata', () => {
    it('should return correct metadata', () => {
      const metadata = serviceInstance.getMetadata();

      expect(metadata.name).toBe('CalendarTimingService');
      expect(metadata.version).toBe('1.0.0');
      expect(metadata.category).toBe('vedic');
      expect(metadata.methods).toEqual(['execute', 'getCalendarTimingAnalysis']);
      expect(metadata.dependencies).toEqual(['MuhurtaCalculator', 'PanchangCalculator']);
    });
  });

  describe('getHealthStatus', () => {
    it('should return healthy status', async () => {
      const status = await serviceInstance.getHealthStatus();

      expect(status.status).toBe('healthy');
      expect(status.serviceName).toBe('CalendarTimingService');
      expect(status.features).toBeDefined();
      expect(status.supportedAnalyses).toBeDefined();
    });
  });
});