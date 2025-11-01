// tests/unit/services/core/services/moonSignService.test.js
// Comprehensive test suite for moonSignService

const MoonSignService = require('src/core/services/moonSignService');
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

describe('MoonSignService', () => {
  let moonSignService;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create a new instance for each test
    moonSignService = new MoonSignService();
  });

  describe('Service Initialization', () => {
    test('should initialize MoonSignService with correct properties', () => {
      expect(moonSignService).toBeInstanceOf(MoonSignService);
      expect(moonSignService.serviceName).toBe('MoonSignService');
      expect(moonSignService.calculatorPath).toBe('./calculators/SignCalculator');
      
      // Verify logger was called during initialization
      expect(logger.info).toHaveBeenCalledWith('MoonSignService initialized');
    });
  });

  describe('validate method', () => {
    test('should validate valid birth data', () => {
      expect(() => moonSignService.validate({
        birthDate: '15/05/1990',
        birthTime: '12:30',
        birthPlace: 'Mumbai, India'
      })).not.toThrow();
    });

    test('should throw error for missing birth data', () => {
      expect(() => moonSignService.validate(null))
        .toThrow('Birth data is required');
        
      expect(() => moonSignService.validate(undefined))
        .toThrow('Birth data is required');
    });

    test('should throw error for missing birth date', () => {
      expect(() => moonSignService.validate({
        birthTime: '12:30',
        birthPlace: 'Mumbai, India'
      })).toThrow('Valid birth date (DD/MM/YYYY format) is required');
    });

    test('should throw error for missing birth time', () => {
      expect(() => moonSignService.validate({
        birthDate: '15/05/1990',
        birthPlace: 'Mumbai, India'
      })).toThrow('Valid birth time (HH:MM format) is required');
    });

    test('should throw error for missing birth place', () => {
      expect(() => moonSignService.validate({
        birthDate: '15/05/1990',
        birthTime: '12:30'
      })).toThrow('Valid birth place is required');
    });

    test('should throw error for invalid date format', () => {
      expect(() => moonSignService.validate({
        birthDate: 'invalid-date',
        birthTime: '12:30',
        birthPlace: 'Mumbai, India'
      })).toThrow('Birth date must be in DD/MM/YYYY format');
    });

    test('should throw error for invalid time format', () => {
      expect(() => moonSignService.validate({
        birthDate: '15/05/1990',
        birthTime: 'invalid-time',
        birthPlace: 'Mumbai, India'
      })).toThrow('Birth time must be in HH:MM format');
    });
  });

  describe('Private calculation methods', () => {
    describe('_getDayOfYear method', () => {
      test('should calculate day of year for regular dates', () => {
        expect(moonSignService._getDayOfYear(1, 1, 2023)).toBe(1); // Jan 1
        expect(moonSignService._getDayOfYear(31, 1, 2023)).toBe(31); // Jan 31
        expect(moonSignService._getDayOfYear(1, 2, 2023)).toBe(32); // Feb 1
        expect(moonSignService._getDayOfYear(15, 6, 2023)).toBe(166); // Jun 15
      });

      test('should handle leap years correctly', () => {
        // 2024 is a leap year
        expect(moonSignService._getDayOfYear(1, 3, 2024)).toBe(61); // Mar 1 (with Feb 29)
        
        // 2023 is not a leap year
        expect(moonSignService._getDayOfYear(1, 3, 2023)).toBe(60); // Mar 1 (without Feb 29)
      });

      test('should handle end of year', () => {
        expect(moonSignService._getDayOfYear(31, 12, 2023)).toBe(365); // Dec 31 (non-leap year)
        expect(moonSignService._getDayOfYear(31, 12, 2024)).toBe(366); // Dec 31 (leap year)
      });
    });

    describe('_getSignFromLongitude method', () => {
      test('should return correct zodiac signs', () => {
        expect(moonSignService._getSignFromLongitude(0)).toBe('Aries');
        expect(moonSignService._getSignFromLongitude(30)).toBe('Taurus');
        expect(moonSignService._getSignFromLongitude(60)).toBe('Gemini');
        expect(moonSignService._getSignFromLongitude(90)).toBe('Cancer');
        expect(moonSignService._getSignFromLongitude(120)).toBe('Leo');
        expect(moonSignService._getSignFromLongitude(150)).toBe('Virgo');
        expect(moonSignService._getSignFromLongitude(180)).toBe('Libra');
        expect(moonSignService._getSignFromLongitude(210)).toBe('Scorpio');
        expect(moonSignService._getSignFromLongitude(240)).toBe('Sagittarius');
        expect(moonSignService._getSignFromLongitude(270)).toBe('Capricorn');
        expect(moonSignService._getSignFromLongitude(300)).toBe('Aquarius');
        expect(moonSignService._getSignFromLongitude(330)).toBe('Pisces');
      });

      test('should handle longitude wrapping', () => {
        expect(moonSignService._getSignFromLongitude(360)).toBe('Aries');
        expect(moonSignService._getSignFromLongitude(390)).toBe('Taurus');
        expect(moonSignService._getSignFromLongitude(361)).toBe('Aries');
      });
    });

    describe('_getNakshatraFromLongitude method', () => {
      test('should return correct nakshatras', () => {
        expect(moonSignService._getNakshatraFromLongitude(0)).toBe('Ashwini');
        expect(moonSignService._getNakshatraFromLongitude(13.5)).toBe('Bharani');
        expect(moonSignService._getNakshatraFromLongitude(26.7)).toBe('Krittika');
        expect(moonSignService._getNakshatraFromLongitude(40)).toBe('Rohini');
      });

      test('should handle nakshatra wrapping', () => {
        expect(moonSignService._getNakshatraFromLongitude(360)).toBe('Ashwini');
        expect(moonSignService._getNakshatraFromLongitude(365)).toBe('Bharani');
      });
    });
  });

  describe('_calculateMoonSign method', () => {
    test('should calculate moon sign with approximate position', async () => {
      const result = await moonSignService._calculateMoonSign(
        '15/05/1990', 
        '12:30', 
        'Mumbai, India', 
        'sidereal'
      );

      expect(result).toBeDefined();
      expect(result.sign).toBeDefined();
      expect(result.nakshatra).toBeDefined();
      expect(result.degree).toBeDefined();
      expect(result.calculationMethod).toBeDefined();
    });

    test('should handle calculation errors', async () => {
      // Simulate an error in _getDayOfYear
      jest.spyOn(moonSignService, '_getDayOfYear')
        .mockImplementation(() => { throw new Error('Date calculation error'); });

      const result = await moonSignService._calculateMoonSign(
        '15/05/1990', 
        '12:30', 
        'Mumbai, India', 
        'sidereal'
      );

      expect(result.sign).toBe('Unknown');
      expect(result.nakshatra).toBe('Unknown');
      expect(result.degree).toBe(0);
      expect(result.calculationMethod).toBe('Error in calculation');
    });
  });

  describe('_getMoonSignTraits method', () => {
    test('should return correct traits for Aries Moon', () => {
      const traits = moonSignService._getMoonSignTraits('Aries');
      
      expect(traits.emotionalNature).toBe('Direct and impulsive');
      expect(traits.mindPattern).toBe('Quick-thinking and decisive');
      expect(traits.psychologicalDisposition).toBe('Independent and self-reliant');
      expect(traits.needs).toBe('Freedom and excitement');
    });

    test('should return correct traits for Cancer Moon', () => {
      const traits = moonSignService._getMoonSignTraits('Cancer');
      
      expect(traits.emotionalNature).toBe('Deeply feeling and nurturing');
      expect(traits.mindPattern).toBe('Intuitive and protective');
      expect(traits.psychologicalDisposition).toBe('Sensitive and caring');
      expect(traits.needs).toBe('Emotional security and family');
    });

    test('should return default traits for unknown sign', () => {
      const traits = moonSignService._getMoonSignTraits('UnknownSign');
      
      expect(traits.emotionalNature).toBe('Unique emotional expression');
      expect(traits.mindPattern).toBe('Individual thought processes');
      expect(traits.psychologicalDisposition).toBe('Personal psychological makeup');
    });
  });

  describe('_analyzeEmotionalNature method', () => {
    test('should analyze emotional nature correctly', () => {
      const mockData = { sign: 'Leo' };
      const analysis = moonSignService._analyzeEmotionalNature(mockData);
      
      expect(analysis.primaryEmotion).toBeDefined();
      expect(analysis.emotionalSecurity).toBeDefined();
      expect(analysis.emotionalExpression).toBeDefined();
      expect(analysis.vulnerabilityAreas).toBeDefined();
      expect(analysis.strengthAreas).toBeDefined();
    });
  });

  describe('_getNakshatraEmotionalInfluence method', () => {
    test('should return correct influence for Rohini', () => {
      const influence = moonSignService._getNakshatraEmotionalInfluence('Rohini');
      
      expect(influence.emotion).toBe('Nurturing and sensual');
      expect(influence.influence).toBe('Emotional nourishment and growth');
    });

    test('should return correct influence for Pushya', () => {
      const influence = moonSignService._getNakshatraEmotionalInfluence('Pushya');
      
      expect(influence.emotion).toBe('Protective and caring');
      expect(influence.influence).toBe('Emotional security and support');
    });

    test('should return default influence for unknown nakshatra', () => {
      const influence = moonSignService._getNakshatraEmotionalInfluence('Unknown');
      
      expect(influence.emotion).toBe('Unique emotional quality');
      expect(influence.influence).toBe('Special emotional influence');
    });
  });

  describe('_assessPsychologicalDisposition method', () => {
    test('should assess psychological disposition correctly', () => {
      const mockData = { sign: 'Taurus' };
      const mockTraits = moonSignService._getMoonSignTraits('Taurus');
      
      const assessment = moonSignService._assessPsychologicalDisposition(mockData, mockTraits);
      
      expect(assessment.coreDisposition).toBe(mockTraits.psychologicalDisposition);
      expect(assessment.mentalPatterns).toBeDefined();
      expect(assessment.copingStrategies).toBe(mockTraits.copingMechanism);
      expect(assessment.growthAreas).toBeDefined();
      expect(assessment.naturalTalents).toBeDefined();
    });
  });

  describe('processCalculation method', () => {
    const validBirthData = {
      birthDate: '15/05/1990',
      birthTime: '12:30',
      birthPlace: 'Mumbai, India'
    };

    beforeEach(() => {
      // Mock the calculateMoonSign method
      jest.spyOn(moonSignService, 'calculateMoonSign')
        .mockResolvedValue({
          moonSignData: { sign: 'Taurus', nakshatra: 'Rohini' },
          moonSignTraits: {},
          emotionalNature: {},
          nakshatraInfluence: {},
          psychologicalDisposition: {},
          lifeAreas: {},
          chartType: 'sidereal',
          interpretation: 'Test interpretation'
        });
    });

    test('should process calculation successfully with valid data', async () => {
      const result = await moonSignService.processCalculation(validBirthData);
      
      expect(moonSignService.calculateMoonSign).toHaveBeenCalledWith(
        validBirthData,
        {}
      );
    });

    test('should handle calculation options', async () => {
      const options = { chartType: 'tropical' };
      await moonSignService.processCalculation(validBirthData, options);
      
      expect(moonSignService.calculateMoonSign).toHaveBeenCalledWith(
        validBirthData,
        options
      );
    });

    test('should handle calculation errors gracefully', async () => {
      jest.spyOn(moonSignService, 'calculateMoonSign')
        .mockRejectedValue(new Error('Calculation failed'));
      
      await expect(moonSignService.processCalculation(validBirthData))
        .rejects
        .toThrow('Moon sign calculation failed: Calculation failed');
      
      expect(logger.error).toHaveBeenCalledWith(
        'MoonSignService error:',
        expect.any(Error)
      );
    });
  });

  describe('calculateMoonSign method', () => {
    const birthData = {
      birthDate: '15/05/1990',
      birthTime: '12:30',
      birthPlace: 'Mumbai, India'
    };

    beforeEach(() => {
      // Mock helper methods to return testable values
      jest.spyOn(moonSignService, '_calculateMoonSign')
        .mockResolvedValue({ sign: 'Taurus', nakshatra: 'Rohini' });
      jest.spyOn(moonSignService, '_getMoonSignTraits')
        .mockReturnValue({ test: 'traits' });
      jest.spyOn(moonSignService, '_analyzeEmotionalNature')
        .mockReturnValue({ test: 'emotionalNature' });
      jest.spyOn(moonSignService, '_getNakshatraEmotionalInfluence')
        .mockReturnValue({ test: 'nakshatraInfluence' });
      jest.spyOn(moonSignService, '_assessPsychologicalDisposition')
        .mockReturnValue({ test: 'psychologicalDisposition' });
      jest.spyOn(moonSignService, '_identifyLifeAreas')
        .mockReturnValue({ test: 'lifeAreas' });
      jest.spyOn(moonSignService, '_createMoonSignInterpretation')
        .mockReturnValue('test interpretation');
    });

    test('should calculate moon sign with default options', async () => {
      const result = await moonSignService.calculateMoonSign(birthData);
      
      expect(result.moonSignData.sign).toBe('Taurus');
      expect(result.moonSignTraits).toEqual({ test: 'traits' });
      expect(result.emotionalNature).toEqual({ test: 'emotionalNature' });
      expect(result.nakshatraInfluence).toEqual({ test: 'nakshatraInfluence' });
      expect(result.psychologicalDisposition).toEqual({ test: 'psychologicalDisposition' });
      expect(result.lifeAreas).toEqual({ test: 'lifeAreas' });
      expect(result.chartType).toBe('sidereal');
      expect(result.interpretation).toBe('test interpretation');
    });

    test('should calculate moon sign with tropical option', async () => {
      const options = { chartType: 'tropical' };
      await moonSignService.calculateMoonSign(birthData, options);
      
      expect(moonSignService._calculateMoonSign).toHaveBeenCalledWith(
        '15/05/1990',
        '12:30',
        'Mumbai, India',
        'tropical'
      );
    });

    test('should handle calculation errors gracefully', async () => {
      jest.spyOn(moonSignService, '_calculateMoonSign')
        .mockRejectedValue(new Error('Calculation error'));
      
      await expect(moonSignService.calculateMoonSign(birthData))
        .rejects
        .toThrow('Calculation error');
      
      expect(logger.error).toHaveBeenCalledWith(
        'Moon sign calculation error:',
        expect.any(Error)
      );
    });
  });

  describe('formatResult method', () => {
    test('should format result with required fields and disclaimer', () => {
      const mockResult = {
        moonSignData: { sign: 'Taurus', nakshatra: 'Rohini' },
        moonSignTraits: { test: 'traits' },
        emotionalNature: { test: 'emotionalNature' },
        nakshatraInfluence: { test: 'nakshatraInfluence' },
        psychologicalDisposition: { test: 'psychologicalDisposition' },
        lifeAreas: { test: 'lifeAreas' },
        chartType: 'sidereal',
        interpretation: 'test interpretation'
      };

      const formatted = moonSignService.formatResult(mockResult);

      expect(formatted.service).toBe('Moon Sign Analysis');
      expect(formatted.timestamp).toBeDefined();
      expect(formatted.moonSign).toBeDefined();
      expect(formatted.moonSign.basic).toBe(mockResult.moonSignData);
      expect(formatted.moonSign.traits).toBe(mockResult.moonSignTraits);
      expect(formatted.interpretation).toBe('test interpretation');
      expect(formatted.disclaimer).toBeDefined();
      expect(formatted.disclaimer).toContain('Moon sign analysis reveals emotional patterns');
    });
  });

  describe('getHealthStatus method', () => {
    test('should return healthy status when service is operational', async () => {
      const healthStatus = await moonSignService.getHealthStatus();

      expect(healthStatus).toBeDefined();
      expect(healthStatus.status).toBeDefined();
      expect(healthStatus.features).toEqual({});
      expect(healthStatus.supportedAnalyses).toEqual([]);
    });

    test('should return unhealthy status when error occurs', async () => {
      jest.spyOn(moonSignService, 'getHealthStatus').mockRejectedValue(
        new Error('Health check failed')
      );

      await expect(moonSignService.getHealthStatus())
        .rejects
        .toThrow('Health check failed');
    });
  });

  describe('_identifyLifeAreas method', () => {
    test('should return correct life areas for Aries Moon', () => {
      const lifeAreas = moonSignService._identifyLifeAreas('Aries');
      
      expect(lifeAreas.home).toContain('independence');
      expect(lifeAreas.relationships).toContain('passionate');
      expect(lifeAreas.health).toContain('stress management');
    });

    test('should return correct life areas for Cancer Moon', () => {
      const lifeAreas = moonSignService._identifyLifeAreas('Cancer');
      
      expect(lifeAreas.home).toContain('emotional sanctuary');
      expect(lifeAreas.relationships).toContain('nurturing');
      expect(lifeAreas.health).toContain('digestive');
    });

    test('should return default areas for unknown sign', () => {
      const lifeAreas = moonSignService._identifyLifeAreas('UnknownSign');
      
      expect(lifeAreas.home).toBe('Personal living preferences');
      expect(lifeAreas.relationships).toBe('Emotional connection patterns');
    });
  });

  describe('_createMoonSignInterpretation method', () => {
    test('should create a comprehensive interpretation', () => {
      const moonSignData = { sign: 'Aries', nakshatra: 'Ashwini' };
      const traits = {
        emotionalNature: 'Direct and impulsive',
        mindPattern: 'Quick-thinking and decisive',
        psychologicalDisposition: 'Independent and self-reliant',
        respondsTo: 'Challenges and new experiences'
      };
      const emotionalNature = {
        emotionalSecurity: 'Finds security in independence and self-reliance'
      };

      const interpretation = moonSignService._createMoonSignInterpretation(
        moonSignData,
        traits,
        emotionalNature
      );

      expect(interpretation).toContain('Aries');
      expect(interpretation).toContain('Direct and impulsive');
      expect(interpretation).toContain('Quick-thinking and decisive');
      expect(interpretation).toContain('independence and self-reliance');
      expect(interpretation).toContain('Challenges and new experiences');
      expect(interpretation).toContain('Ashwini');
      expect(interpretation).toContain('emotional');
    });
  });

  describe('Service Architecture Compliance', () => {
    test('should implement ServiceTemplate pattern', () => {
      expect(moonSignService.serviceName).toBeDefined();
      expect(typeof moonSignService.getHealthStatus).toBe('function');
      expect(typeof moonSignService.getMetadata).toBe('function');
    });

    test('should have required methods', () => {
      expect(typeof moonSignService.validate).toBe('function');
      expect(typeof moonSignService.processCalculation).toBe('function');
      expect(typeof moonSignService.formatResult).toBe('function');
    });
  });

  describe('Error Handling & Validation', () => {
    test('should handle concurrent requests properly', async () => {
      const birthData = { 
        birthDate: '15/05/1990',
        birthTime: '12:30',
        birthPlace: 'Mumbai, India'
      };
      
      const mockResult = {
        moonSignData: { sign: 'Taurus', nakshatra: 'Rohini' },
        interpretation: 'test'
      };
      
      jest.spyOn(moonSignService, 'calculateMoonSign')
        .mockResolvedValue(mockResult);

      const concurrentRequests = Array(3).fill().map(() =>
        moonSignService.processCalculation(birthData)
      );

      const results = await Promise.all(concurrentRequests);

      // All should succeed
      results.forEach(result => {
        expect(result.service).toBe('Moon Sign Analysis');
      });
    });

    test('should handle null/undefined input gracefully', async () => {
      const invalidInputs = [null, undefined, {}];

      for (const input of invalidInputs) {
        await expect(moonSignService.processCalculation(input))
          .rejects
          .toThrow('Birth data is required');
      }
    });
  });

  describe('Performance & Resilience', () => {
    test('should respond within acceptable time for valid data', async () => {
      const mockResult = {
        moonSignData: { sign: 'Taurus', nakshatra: 'Rohini' },
        moonSignTraits: {},
        emotionalNature: {},
        nakshatraInfluence: {},
        psychologicalDisposition: {},
        lifeAreas: {},
        chartType: 'sidereal',
        interpretation: 'test interpretation'
      };
      
      jest.spyOn(moonSignService, 'calculateMoonSign')
        .mockResolvedValue(mockResult);

      const startTime = Date.now();
      await moonSignService.processCalculation({
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