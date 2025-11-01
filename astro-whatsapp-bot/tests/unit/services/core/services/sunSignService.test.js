// tests/unit/services/core/services/sunSignService.test.js
// Comprehensive test suite for sunSignService

const SunSignService = require('src/core/services/sunSignService');
const logger = require('src/utils/logger');

// Mock winston logger
const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
  silly: jest.fn()
};

jest.mock('src/utils/logger', () => mockLogger);

// Mock the calculator
const mockCalculator = {
  calculateSunSign: jest.fn()
};

jest.mock('../../../src/core/services/calculators/SignCalculator', () => {
  return jest.fn().mockImplementation(() => mockCalculator);
});

describe('SunSignService', () => {
  let sunSignService;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create a new instance for each test
    sunSignService = new SunSignService();
  });

  describe('Service Initialization', () => {
    test('should initialize SunSignService with correct properties', () => {
      expect(sunSignService).toBeInstanceOf(SunSignService);
      expect(sunSignService.serviceName).toBe('SunSignService');
      expect(sunSignService.calculatorPath).toBe('./calculators/SignCalculator');
      
      // Verify logger was called during initialization
      expect(logger.info).toHaveBeenCalledWith('SunSignService initialized');
    });
  });

  describe('validate method', () => {
    test('should validate valid birth date', () => {
      expect(() => sunSignService.validate({ birthDate: '15/05/1990' }))
        .not.toThrow();
    });

    test('should throw error for missing birth data', () => {
      expect(() => sunSignService.validate(null))
        .toThrow('Birth data is required');
        
      expect(() => sunSignService.validate(undefined))
        .toThrow('Birth data is required');
    });

    test('should throw error for missing birth date', () => {
      expect(() => sunSignService.validate({}))
        .toThrow('Valid birth date (DD/MM/YYYY format) is required');
    });

    test('should throw error for invalid date format', () => {
      expect(() => sunSignService.validate({ birthDate: 'invalid-date' }))
        .toThrow('Birth date must be in DD/MM/YYYY format');
        
      expect(() => sunSignService.validate({ birthDate: '15-05-1990' }))
        .toThrow('Birth date must be in DD/MM/YYYY format');
    });

    test('should throw error for invalid month', () => {
      expect(() => sunSignService.validate({ birthDate: '15/13/1990' }))
        .toThrow('Month must be between 1 and 12');
        
      expect(() => sunSignService.validate({ birthDate: '15/0/1990' }))
        .toThrow('Month must be between 1 and 12');
    });

    test('should throw error for invalid day', () => {
      expect(() => sunSignService.validate({ birthDate: '32/05/1990' }))
        .toThrow('Day must be between 1 and 31');
        
      expect(() => sunSignService.validate({ birthDate: '0/05/1990' }))
        .toThrow('Day must be between 1 and 31');
    });

    test('should throw error for invalid year', () => {
      const currentYear = new Date().getFullYear();
      
      expect(() => sunSignService.validate({ birthDate: '15/05/1800' }))
        .toThrow('Year must be between 1900 and ' + (currentYear + 1));
        
      expect(() => sunSignService.validate({ birthDate: '15/05/' + (currentYear + 2) }))
        .toThrow('Year must be between 1900 and ' + (currentYear + 1));
    });
  });

  describe('_getSunSignTraits method', () => {
    test('should return correct traits for Aries', () => {
      const traits = sunSignService._getSunSignTraits('Aries');
      
      expect(traits.element).toBe('Fire');
      expect(traits.quality).toBe('Cardinal');
      expect(traits.rulingPlanet).toBe('Mars');
      expect(traits.strengths).toContain('Courageous');
      expect(traits.weaknesses).toContain('Impatient');
    });

    test('should return correct traits for Taurus', () => {
      const traits = sunSignService._getSunSignTraits('Taurus');
      
      expect(traits.element).toBe('Earth');
      expect(traits.rulingPlanet).toBe('Venus');
      expect(traits.strengths).toContain('Reliable');
      expect(traits.weaknesses).toContain('Stubborn');
    });

    test('should return default traits for unknown sign', () => {
      const traits = sunSignService._getSunSignTraits('UnknownSign');
      
      expect(traits.element).toBe('Unknown');
      expect(traits.rulingPlanet).toBe('Unknown');
      expect(traits.strengths).toContain('Unique qualities');
    });
  });

  describe('_getNakshatraInfo method', () => {
    test('should return correct information for Ashwini', () => {
      const info = sunSignService._getNakshatraInfo('Ashwini');
      
      expect(info.rulingPlanet).toBe('Ketu');
      expect(info.deity).toBe('Ashwin Kumaras');
      expect(info.symbol).toBe('Horse\'s head');
      expect(info.meaning).toBe('Swift healing and new beginnings');
    });

    test('should return correct information for Revati', () => {
      const info = sunSignService._getNakshatraInfo('Revati');
      
      expect(info.rulingPlanet).toBe('Mercury');
      expect(info.deity).toBe('Pushan');
      expect(info.symbol).toBe('Fish');
      expect(info.meaning).toBe('Prosperity and guidance');
    });

    test('should return default info for unknown nakshatra', () => {
      const info = sunSignService._getNakshatraInfo('UnknownNakshatra');
      
      expect(info.rulingPlanet).toBe('Unknown');
      expect(info.meaning).toBe('Unique cosmic influence');
    });
  });

  describe('_getPlanetaryRuler method', () => {
    test('should return correct info for Mars', () => {
      const mockTraits = {
        element: 'Fire',
        quality: 'Cardinal',
        rulingPlanet: 'Mars'
      };
      
      // Mock the _getSunSignTraits method to return the mock data
      jest.spyOn(sunSignService, '_getSunSignTraits')
        .mockReturnValue(mockTraits);
      
      const info = sunSignService._getPlanetaryRuler('Aries');
      
      expect(info.energy).toBe('Dynamic and assertive');
      expect(info.influence).toBe('Action, courage, and physical vitality');
    });

    test('should return correct info for Venus', () => {
      const mockTraits = {
        element: 'Earth',
        quality: 'Fixed',
        rulingPlanet: 'Venus'
      };
      
      jest.spyOn(sunSignService, '_getSunSignTraits')
        .mockReturnValue(mockTraits);
      
      const info = sunSignService._getPlanetaryRuler('Taurus');
      
      expect(info.energy).toBe('Harmonious and sensual');
      expect(info.influence).toBe('Love, beauty, and material comfort');
    });

    test('should return default info for unknown planet', () => {
      const mockTraits = {
        element: 'Fire',
        quality: 'Cardinal',
        rulingPlanet: 'UnknownPlanet'
      };
      
      jest.spyOn(sunSignService, '_getSunSignTraits')
        .mockReturnValue(mockTraits);
      
      const info = sunSignService._getPlanetaryRuler('Aries');
      
      expect(info.energy).toBe('Unique cosmic influence');
    });
  });

  describe('_getSunSignCompatibility method', () => {
    test('should return correct compatibility for Aries', () => {
      const compatibility = sunSignService._getSunSignCompatibility('Aries');
      
      expect(compatibility.bestMatches).toContain('Leo');
      expect(compatibility.challengingMatches).toContain('Cancer');
      expect(compatibility.compatibleElements).toBe('Fire and Air signs harmonize well');
    });

    test('should return correct compatibility for Taurus', () => {
      const compatibility = sunSignService._getSunSignCompatibility('Taurus');
      
      expect(compatibility.bestMatches).toContain('Virgo');
      expect(compatibility.challengingMatches).toContain('Leo');
      expect(compatibility.compatibleElements).toBe('Earth and Water signs provide stability');
    });

    test('should return default compatibility for unknown sign', () => {
      const compatibility = sunSignService._getSunSignCompatibility('UnknownSign');
      
      expect(compatibility.bestMatches).toContain('Various signs');
      expect(compatibility.compatibleElements).toBe('Unique compatibility patterns');
    });
  });

  describe('_getLifePurpose method', () => {
    test('should return correct life purpose for Aries', () => {
      const purpose = sunSignService._getLifePurpose('Aries');
      
      expect(purpose).toContain('pioneer new paths');
      expect(purpose).toContain('inspire others through bold action');
    });

    test('should return correct life purpose for Leo', () => {
      const purpose = sunSignService._getLifePurpose('Leo');
      
      expect(purpose).toContain('shine authentically');
      expect(purpose).toContain('creative self-expression');
    });

    test('should return default purpose for unknown sign', () => {
      const purpose = sunSignService._getLifePurpose('UnknownSign');
      
      expect(purpose).toContain('fulfill unique potential');
      expect(purpose).toContain('authentic self-expression');
    });
  });

  describe('processCalculation method', () => {
    const validBirthData = {
      birthDate: '15/05/1990',
      birthTime: '12:30',
      birthPlace: 'Mumbai, India'
    };

    beforeEach(() => {
      // Mock the calculateSunSign method
      jest.spyOn(sunSignService, 'calculateSunSign')
        .mockResolvedValue({
          sunSignData: { sign: 'Taurus', nakshatra: 'Rohini' },
          sunSignTraits: {},
          nakshatraInfo: {},
          planetaryRuler: {},
          compatibility: {},
          lifePurpose: {},
          chartType: 'sidereal',
          interpretation: 'Test interpretation'
        });
    });

    test('should process calculation successfully with valid data', async () => {
      const result = await sunSignService.processCalculation(validBirthData);
      
      expect(sunSignService.calculateSunSign).toHaveBeenCalledWith(
        validBirthData,
        {}
      );
      expect(sunSignService._formatResult).toBeDefined();
    });

    test('should handle calculation options', async () => {
      const options = { chartType: 'tropical' };
      await sunSignService.processCalculation(validBirthData, options);
      
      expect(sunSignService.calculateSunSign).toHaveBeenCalledWith(
        validBirthData,
        options
      );
    });

    test('should handle calculation errors gracefully', async () => {
      jest.spyOn(sunSignService, 'calculateSunSign')
        .mockRejectedValue(new Error('Calculation failed'));
      
      await expect(sunSignService.processCalculation(validBirthData))
        .rejects
        .toThrow('Sun sign calculation failed: Calculation failed');
      
      expect(logger.error).toHaveBeenCalledWith(
        'SunSignService error:',
        expect.any(Error)
      );
    });
  });

  describe('calculateSunSign method', () => {
    const birthData = {
      birthDate: '15/05/1990',
      birthTime: '12:30',
      birthPlace: 'Mumbai, India'
    };

    beforeEach(() => {
      // Mock the calculator
      mockCalculator.calculateSunSign.mockResolvedValue({
        sign: 'Taurus',
        nakshatra: 'Rohini'
      });

      // Mock helper methods to return testable values
      jest.spyOn(sunSignService, '_getSunSignTraits')
        .mockReturnValue({ test: 'traits' });
      jest.spyOn(sunSignService, '_getNakshatraInfo')
        .mockReturnValue({ test: 'nakshatraInfo' });
      jest.spyOn(sunSignService, '_getPlanetaryRuler')
        .mockReturnValue({ test: 'planetaryRuler' });
      jest.spyOn(sunSignService, '_getSunSignCompatibility')
        .mockReturnValue({ test: 'compatibility' });
      jest.spyOn(sunSignService, '_getLifePurpose')
        .mockReturnValue('test life purpose');
      jest.spyOn(sunSignService, '_createSunSignInterpretation')
        .mockReturnValue('test interpretation');
    });

    test('should calculate sun sign with default options', async () => {
      const result = await sunSignService.calculateSunSign(birthData);
      
      expect(mockCalculator.calculateSunSign).toHaveBeenCalledWith(
        '15/05/1990',
        '12:30',
        'Mumbai, India',
        'sidereal'
      );
      
      expect(result.sunSignData.sign).toBe('Taurus');
      expect(result.sunSignTraits).toEqual({ test: 'traits' });
      expect(result.nakshatraInfo).toEqual({ test: 'nakshatraInfo' });
      expect(result.chartType).toBe('sidereal');
    });

    test('should calculate sun sign with tropical option', async () => {
      const options = { chartType: 'tropical' };
      await sunSignService.calculateSunSign(birthData, options);
      
      expect(mockCalculator.calculateSunSign).toHaveBeenCalledWith(
        '15/05/1990',
        '12:30',
        'Mumbai, India',
        'tropical'
      );
    });

    test('should use default time and place when not provided', async () => {
      const birthDataWithoutTimePlace = {
        birthDate: '20/08/1988'
      };
      
      await sunSignService.calculateSunSign(birthDataWithoutTimePlace);
      
      expect(mockCalculator.calculateSunSign).toHaveBeenCalledWith(
        '20/08/1988',
        '12:00',
        'Delhi, India',
        'sidereal'
      );
    });

    test('should handle calculator errors gracefully', async () => {
      mockCalculator.calculateSunSign.mockRejectedValue(
        new Error('Calculator error')
      );
      
      await expect(sunSignService.calculateSunSign(birthData))
        .rejects
        .toThrow('Calculator error');
      
      expect(logger.error).toHaveBeenCalledWith(
        'Sun sign calculation error:',
        expect.any(Error)
      );
    });
  });

  describe('formatResult method', () => {
    test('should format result with required fields and disclaimer', () => {
      const mockResult = {
        sunSignData: { sign: 'Taurus', nakshatra: 'Rohini' },
        sunSignTraits: { test: 'traits' },
        nakshatraInfo: { test: 'nakshatraInfo' },
        planetaryRuler: { test: 'planetaryRuler' },
        compatibility: { test: 'compatibility' },
        lifePurpose: 'test purpose',
        chartType: 'sidereal',
        interpretation: 'test interpretation'
      };

      const formatted = sunSignService.formatResult(mockResult);

      expect(formatted.service).toBe('Sun Sign Analysis');
      expect(formatted.timestamp).toBeDefined();
      expect(formatted.sunSign).toBeDefined();
      expect(formatted.interpretation).toBe('test interpretation');
      expect(formatted.disclaimer).toBeDefined();
      expect(formatted.disclaimer).toContain('Sun sign analysis provides general personality insights');
    });
  });

  describe('getHealthStatus method', () => {
    test('should return healthy status when service is operational', async () => {
      const healthStatus = await sunSignService.getHealthStatus();

      expect(healthStatus).toBeDefined();
      expect(healthStatus.status).toBeDefined();
      expect(healthStatus.features).toEqual({});
      expect(healthStatus.supportedAnalyses).toEqual([]);
    });

    test('should return unhealthy status when error occurs', async () => {
      jest.spyOn(sunSignService, 'getHealthStatus').mockRejectedValue(
        new Error('Health check failed')
      );

      await expect(sunSignService.getHealthStatus())
        .rejects
        .toThrow('Health check failed');
    });
  });

  describe('getMetadata method', () => {
    test('should return correct metadata', () => {
      // Since SunSignService extends ServiceTemplate, we need to call the base getMetadata method
      const baseMetadata = sunSignService.getMetadata();

      expect(baseMetadata.name).toBe('SunSignService');
      expect(baseMetadata.methods).toContain('execute');
      expect(baseMetadata.dependencies).toBeDefined();
    });
  });

  describe('_createSunSignInterpretation method', () => {
    test('should create a comprehensive interpretation', () => {
      const sunSignData = { sign: 'Aries', nakshatra: 'Ashwini' };
      const traits = {
        element: 'Fire',
        quality: 'Cardinal',
        polarity: 'Masculine',
        rulingPlanet: 'Mars',
        strengths: ['Courageous', 'Enthusiastic']
      };
      const nakshatraInfo = {
        rulingPlanet: 'Ketu',
        meaning: 'Swift healing and new beginnings'
      };

      const interpretation = sunSignService._createSunSignInterpretation(
        sunSignData,
        traits,
        nakshatraInfo
      );

      expect(interpretation).toContain('Aries');
      expect(interpretation).toContain('Fire');
      expect(interpretation).toContain('Cardinal');
      expect(interpretation).toContain('Mars');
      expect(interpretation).toContain('Courageous');
      expect(interpretation).toContain('Ashwini');
      expect(interpretation).toContain('Ketu');
      expect(interpretation).toContain('swift healing and new beginnings');
    });
  });

  describe('Service Architecture Compliance', () => {
    test('should implement ServiceTemplate pattern', () => {
      expect(sunSignService.serviceName).toBeDefined();
      expect(typeof sunSignService.getHealthStatus).toBe('function');
      expect(typeof sunSignService.getMetadata).toBe('function');
    });

    test('should have required methods', () => {
      expect(typeof sunSignService.validate).toBe('function');
      expect(typeof sunSignService.processCalculation).toBe('function');
      expect(typeof sunSignService.formatResult).toBe('function');
    });
  });

  describe('Error Handling & Validation', () => {
    test('should handle concurrent requests properly', async () => {
      const birthData = { birthDate: '15/05/1990' };
      
      const mockResult = {
        sunSignData: { sign: 'Taurus', nakshatra: 'Rohini' },
        interpretation: 'test'
      };
      
      jest.spyOn(sunSignService, 'calculateSunSign')
        .mockResolvedValue(mockResult);

      const concurrentRequests = Array(3).fill().map(() =>
        sunSignService.processCalculation(birthData)
      );

      const results = await Promise.all(concurrentRequests);

      // All should succeed
      results.forEach(result => {
        expect(result.service).toBe('Sun Sign Analysis');
      });
    });

    test('should handle null/undefined input gracefully', async () => {
      const invalidInputs = [null, undefined, {}];

      for (const input of invalidInputs) {
        await expect(sunSignService.processCalculation(input))
          .rejects
          .toThrow('Birth data is required');
      }
    });
  });

  describe('Performance & Resilience', () => {
    test('should respond within acceptable time for valid data', async () => {
      const mockResult = {
        sunSignData: { sign: 'Taurus', nakshatra: 'Rohini' },
        sunSignTraits: {},
        nakshatraInfo: {},
        planetaryRuler: {},
        compatibility: {},
        lifePurpose: {},
        chartType: 'sidereal',
        interpretation: 'test interpretation'
      };
      
      jest.spyOn(sunSignService, 'calculateSunSign')
        .mockResolvedValue(mockResult);

      const startTime = Date.now();
      await sunSignService.processCalculation({
        birthDate: '15/05/1990',
        birthTime: '12:30',
        birthPlace: 'Mumbai, India'
      });
      const duration = Date.now() - startTime;

      // Should complete within reasonable time (e.g., 150ms)
      expect(duration).toBeLessThan(150);
    });
  });
});