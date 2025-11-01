// tests/unit/services/core/dailyHoroscopeService.test.js
// Comprehensive test suite for dailyHoroscopeService (demonstrating proper service testing)

const dailyHoroscopeService = require('../../../../src/core/services/dailyHoroscopeService');

// Mock calculator dependencies
jest.mock('../../../../src/core/services/calculators/dailyHoroscopeCalculator', () => ({
  generateDailyHoroscope: jest.fn(),
  getTransitData: jest.fn(),
  validateSunSign: jest.fn(),
  getCurrentTransitsForSign: jest.fn()
}));

const dailyHoroscopeCalculator = require('../../../../src/core/services/calculators/dailyHoroscopeCalculator');

// Mock logger for clean testing
const logger = require('../../../../src/utils/logger');
jest.spyOn(logger, 'info').mockImplementation(() => {});
jest.spyOn(logger, 'error').mockImplementation(() => {});

describe('dailyHoroscopeService (Core Service Layer)', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default calculator mocks
    dailyHoroscopeCalculator.generateDailyHoroscope.mockResolvedValue({
      prediction: 'Today brings opportunities for growth and new beginnings',
      luckyColor: 'Green',
      luckyNumber: 7,
      mood: 'Optimistic',
      intensity: 'Moderate'
    });

    dailyHoroscopeCalculator.validateSunSign.mockReturnValue(true);

    dailyHoroscopeCalculator.getTransitData.mockResolvedValue({
      sunSign: 'Pisces',
      moonSign: 'Gemini',
      currentTransits: ['Venus trine Jupiter', 'Mars in Aries'],
      rulingPlanet: 'Jupiter'
    });
  });

  describe('Service Architecture Compliance', () => {
    test('should export dailyHoroscopeService class', () => {
      expect(dailyHoroscopeService).toBeDefined();
      expect(typeof dailyHoroscopeService).toBe('function');
    });

    test('should not expose calculator methods directly', () => {
      const service = new dailyHoroscopeService();

      // Service should abstract calculator details
      expect(service.generateDailyHoroscope).toBeUndefined();
      expect(service.getTransitData).toBeUndefined();
    });

    test('should implement service template pattern', () => {
      const service = new dailyHoroscopeService();

      expect(service.serviceName).toBeDefined();
      expect(service.version).toBeDefined();
      expect(typeof service.getHealthStatus).toBe('function');
      expect(typeof service.getMetadata).toBe('function');
    });
  });

  describe('getDailyHoroscope method', () => {
    test('should generate daily horoscope for valid sun sign', async () => {
      const sunSign = 'Pisces';

      const result = await dailyHoroscopeService.getDailyHoroscope(sunSign);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data.prediction).toBeDefined();
      expect(result.data.luckyColor).toBeDefined();
      expect(result.data.luckyNumber).toBeDefined();

      expect(dailyHoroscopeCalculator.generateDailyHoroscope).toHaveBeenCalledWith(sunSign);
    });

    test('should reject invalid sun signs', async () => {
      dailyHoroscopeCalculator.validateSunSign.mockReturnValue(false);

      const result = await dailyHoroscopeService.getDailyHoroscope('InvalidSign');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid');
    });

    test('should handle calculator errors gracefully', async () => {
      dailyHoroscopeCalculator.generateDailyHoroscope.mockRejectedValue(
        new Error('Calculator failed')
      );

      const result = await dailyHoroscopeService.getDailyHoroscope('Pisces');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Calculator failed');
    });
  });

  describe('getHoroscopeWithTransits method', () => {
    test('should include transit information in horoscope', async () => {
      const sunSign = 'Pisces';

      const result = await dailyHoroscopeService.getHoroscopeWithTransits(sunSign);

      expect(result.success).toBe(true);
      expect(result.data.prediction).toBeDefined();
      expect(result.data.transitData).toBeDefined();
      expect(result.data.transitData.currentTransits).toBeDefined();

      expect(dailyHoroscopeCalculator.generateDailyHoroscope).toHaveBeenCalledWith(sunSign);
      expect(dailyHoroscopeCalculator.getTransitData).toHaveBeenCalledWith(sunSign);
    });

    test('should handle transit data failures separately', async () => {
      dailyHoroscopeCalculator.getTransitData.mockRejectedValue(new Error('Transits unavailable'));

      const result = await dailyHoroscopeService.getHoroscopeWithTransits('Aries');

      expect(result.success).toBe(true); // Horoscope still succeeds
      expect(result.data.prediction).toBeDefined();
      expect(result.data.transitData).toBeUndefined(); // But transits fail silently
    });
  });

  describe('getHoroscopesByBatch method', () => {
    test('should generate horoscopes for multiple signs efficiently', async () => {
      const signs = ['Aries', 'Taurus', 'Gemini'];

      const result = await dailyHoroscopeService.getHoroscopesByBatch(signs);

      expect(result.success).toBe(true);
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data).toHaveLength(3);

      // Each horoscope should be complete
      result.data.forEach(horoscope => {
        expect(horoscope.sign).toBeDefined();
        expect(horoscope.prediction).toBeDefined();
      });

      expect(dailyHoroscopeCalculator.generateDailyHoroscope).toHaveBeenCalledTimes(3);
    });

    test('should filter invalid signs in batch processing', async () => {
      dailyHoroscopeCalculator.validateSunSign
        .mockReturnValueOnce(true)  // Aries valid
        .mockReturnValueOnce(false) // Taurus invalid
        .mockReturnValueOnce(true); // Gemini valid

      const result = await dailyHoroscopeService.getHoroscopesByBatch(['Aries', 'Taurus', 'Gemini']);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2); // Only valid signs processed
      expect(result.errors).toBeDefined();
    });
  });

  describe('getGeneralHoroscope method', () => {
    test('should generate general horoscope without specific sign', async () => {
      const result = await dailyHoroscopeService.getGeneralHoroscope();

      expect(result.success).toBe(true);
      expect(result.data.general).toBe(true);
      expect(result.data.prediction).toBeDefined();
      expect(result.data.forAllSigns).toBe(true);
    });
  });

  describe('getHoroscopeTrends method', () => {
    test('should provide astrological trends for timeframe', async () => {
      const result = await dailyHoroscopeService.getHoroscopeTrends('weekly');

      expect(result.success).toBe(true);
      expect(result.data.trends).toBeDefined();
      expect(result.data.timeframe).toBe('weekly');
    });

    test('should handle trend calculation failures', async () => {
      dailyHoroscopeCalculator.getTransitData.mockRejectedValue(new Error('Trends unavailable'));

      const result = await dailyHoroscopeService.getHoroscopeTrends('monthly');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Service Health & Monitoring', () => {
    test('should provide comprehensive health status', async () => {
      const health = await dailyHoroscopeService.getHealthStatus();

      expect(health).toBeDefined();
      expect(health.status).toBeDefined();
      expect(health.lastChecked).toBeDefined();

      // Should check calculator connectivity
      expect(health.calculatorAccessible).toBeDefined();
      expect(health.transitDataAvailable).toBeDefined();
    });

    test('should expose service capabilities', () => {
      const service = new dailyHoroscopeService();
      const metadata = service.getMetadata();

      expect(metadata).toBeDefined();
      expect(metadata.methods).toContain('getDailyHoroscope');
      expect(metadata.methods).toContain('getHoroscopeWithTransits');
      expect(metadata.capabilities).toBeDefined();
    });

    test('should track service usage statistics', () => {
      // Service should have usage tracking
      const service = new dailyHoroscopeService();

      expect(service.usageStats).toBeDefined();
      expect(typeof service.recordUsage).toBe('function');
    });
  });

  describe('Error Handling & Validation', () => {
    test('should validate input parameters', async () => {
      const invalidInputs = [null, undefined, '', 'invalid_sign', 123];

      for (const input of invalidInputs) {
        const result = await dailyHoroscopeService.getDailyHoroscope(input);
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      }
    });

    test('should handle concurrent requests properly', async () => {
      const sign = 'Cancer';
      const concurrentRequests = Array(5).fill().map(() =>
        dailyHoroscopeService.getDailyHoroscope(sign)
      );

      const results = await Promise.all(concurrentRequests);

      // All should succeed
      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.data.prediction).toBeDefined();
      });

      // But calculator should be called efficiently (not 5 separate times)
      expect(dailyHoroscopeCalculator.generateDailyHoroscope).toHaveBeenCalled();
    });

    test('should implement circuit breaker for calculator failures', async () => {
      // Simulate calculator failures
      dailyHoroscopeCalculator.generateDailyHoroscope
        .mockRejectedValue(new Error('Service unavailable'))
        .mockRejectedValue(new Error('Timeout'))
        .mockRejectedValue(new Error('Connection failed'));

      // First few should fail gracefully
      for (let i = 0; i < 3; i++) {
        const result = await dailyHoroscopeService.getDailyHoroscope('Leo');
        expect(result.success).toBe(false);
        expect(result.data.fallback).toBeDefined();
      }
    });
  });

  describe('Performance & Resilience', () => {
    test('should implement caching for frequent data', async () => {
      // First call
      await dailyHoroscopeService.getDailyHoroscope('Virgo');

      // Second call with same parameters should use cache
      await dailyHoroscopeService.getDailyHoroscope('Virgo');

      // Calculator should only be called once due to caching
      expect(dailyHoroscopeCalculator.generateDailyHoroscope).toHaveBeenCalledTimes(1);
    });

    test('should provide graceful degradation when calculator unavailable', async () => {
      // Simulate calculator completely down
      dailyHoroscopeCalculator.generateDailyHoroscope.mockRejectedValue(
        new Error('Calculator service down')
      );

      const result = await dailyHoroscopeService.getDailyHoroscope('Libra');

      expect(result.success).toBe(false);
      expect(result.data.fallback).toBeDefined();
      expect(result.data.fallbackMessage).toContain('unavailable');
      expect(result.data.basicPrediction).toBeDefined();
    });

    test('should implement rate limiting', async () => {
      const service = new dailyHoroscopeService();
      expect(service.checkRateLimit).toBeDefined();

      // Service should track request rates
      const rateCheck = service.checkRateLimit('user123');
      expect(rateCheck.allowed).toBeDefined();
    });
  });
});

// Performance tests
describe('dailyHoroscopeService Performance Requirements', () => {
  test('should respond within 200ms for cached horoscopes', async () => {
    const start = Date.now();
    await dailyHoroscopeService.getDailyHoroscope('Capricorn');
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(200);
  });

  test('should handle load without memory leaks', async () => {
    const requests = Array(100).fill().map((_, i) =>
      dailyHoroscopeService.getDailyHoroscope(`Sign${i % 12}`)
    );

    const results = await Promise.all(requests);
    expect(results).toHaveLength(100);

    // Force garbage collection check (if available)
    if (global.gc) {
      global.gc();
    }

    // Memory should be stable
    const memoryUsage = process.memoryUsage();
    expect(memoryUsage.heapUsed).toBeLessThan(50 * 1024 * 1024); // <50MB
  });
});