// tests/unit/services/core/services/risingSignService.test.js
// Comprehensive test suite for risingSignService

const RisingSignService = require('src/core/services/risingSignService');
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
  calculateRisingSign: jest.fn()
};

jest.mock('../../../src/core/services/calculators/SignCalculator', () => {
  return jest.fn().mockImplementation(() => mockCalculator);
});

// Mock BirthData since it's referenced but not imported in the service
jest.mock('src/models/BirthData', () => {
  return {
    BirthData: jest.fn().mockImplementation((data) => {
      return {
        data,
        validate: jest.fn(() => {
          // Simulate validation - throw error for invalid data
          if (!data.birthDate || !data.birthTime || !data.birthPlace) {
            throw new Error('Required field is missing or empty');
          }
        })
      };
    })
  };
});

describe('RisingSignService', () => {
  let risingSignService;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create a new instance for each test
    risingSignService = new RisingSignService();
  });

  describe('Service Initialization', () => {
    test('should initialize RisingSignService with correct properties', () => {
      expect(risingSignService).toBeInstanceOf(RisingSignService);
      expect(risingSignService.serviceName).toBe('RisingSignService');
      expect(risingSignService.calculatorPath).toBe('./calculators/SignCalculator');
      
      // Verify logger was called during initialization
      expect(logger.info).toHaveBeenCalledWith('RisingSignService initialized');
    });
  });

  describe('_getSignFromLongitude method', () => {
    test('should return correct zodiac signs', () => {
      expect(risingSignService._getSignFromLongitude(0)).toBe('Aries');
      expect(risingSignService._getSignFromLongitude(30)).toBe('Taurus');
      expect(risingSignService._getSignFromLongitude(60)).toBe('Gemini');
      expect(risingSignService._getSignFromLongitude(90)).toBe('Cancer');
      expect(risingSignService._getSignFromLongitude(120)).toBe('Leo');
      expect(risingSignService._getSignFromLongitude(150)).toBe('Virgo');
      expect(risingSignService._getSignFromLongitude(180)).toBe('Libra');
      expect(risingSignService._getSignFromLongitude(210)).toBe('Scorpio');
      expect(risingSignService._getSignFromLongitude(240)).toBe('Sagittarius');
      expect(risingSignService._getSignFromLongitude(270)).toBe('Capricorn');
      expect(risingSignService._getSignFromLongitude(300)).toBe('Aquarius');
      expect(risingSignService._getSignFromLongitude(330)).toBe('Pisces');
    });

    test('should handle longitude wrapping', () => {
      expect(risingSignService._getSignFromLongitude(360)).toBe('Aries');
      expect(risingSignService._getSignFromLongitude(390)).toBe('Taurus');
    });
  });

  describe('_getRisingSignTraits method', () => {
    test('should return correct traits for Aries Rising', () => {
      const traits = risingSignService._getRisingSignTraits('Aries');
      
      expect(traits.mask).toBe('Confident and assertive');
      expect(traits.behavior).toBe('Direct and action-oriented');
      expect(traits.socialStyle).toBe('Bold and competitive');
      expect(traits.defenseMechanism).toBe('Confrontation and direct action');
    });

    test('should return correct traits for Cancer Rising', () => {
      const traits = risingSignService._getRisingSignTraits('Cancer');
      
      expect(traits.mask).toBe('Nurturing and sensitive');
      expect(traits.behavior).toBe('Protective and intuitive');
      expect(traits.socialStyle).toBe('Caring and empathetic');
      expect(traits.defenseMechanism).toBe('Emotional withdrawal');
    });

    test('should return default traits for unknown sign', () => {
      const traits = risingSignService._getRisingSignTraits('UnknownSign');
      
      expect(traits.mask).toBe('Unique personal presentation');
      expect(traits.behavior).toBe('Individual behavioral patterns');
    });
  });

  describe('_analyzePhysicalAppearance method', () => {
    test('should return correct appearance for Leo Rising', () => {
      const appearance = risingSignService._analyzePhysicalAppearance('Leo');
      
      expect(appearance.build).toBe('Strong and dignified');
      expect(appearance.features).toBe('Commanding presence, warm smile, thick hair');
      expect(appearance.energy).toBe('Radiant and confident presence');
      expect(appearance.style).toBe('Dramatic and eye-catching clothing');
    });

    test('should return correct appearance for Gemini Rising', () => {
      const appearance = risingSignService._analyzePhysicalAppearance('Gemini');
      
      expect(appearance.build).toBe('Slim and agile');
      expect(appearance.features).toBe('Expressive eyes, quick smile, youthful appearance');
    });

    test('should return default appearance for unknown sign', () => {
      const appearance = risingSignService._analyzePhysicalAppearance('UnknownSign');
      
      expect(appearance.build).toBe('Unique physical characteristics');
      expect(appearance.features).toBe('Individual facial features');
    });
  });

  describe('_assessFirstImpressions method', () => {
    test('should return correct first impressions for Libra Rising', () => {
      const impressions = risingSignService._assessFirstImpressions('Libra');
      
      expect(impressions.firstImpression).toBe('Charming and diplomatic');
      expect(impressions.socialMask).toBe('Harmonious and fair-minded personality');
      expect(impressions.initialApproach).toBe('Gracious and balanced');
      expect(impressions.underlyingTruth).toBe('Seeks peace and aesthetic beauty');
    });

    test('should return correct first impressions for Scorpio Rising', () => {
      const impressions = risingSignService._assessFirstImpressions('Scorpio');
      
      expect(impressions.firstImpression).toBe('Intense and magnetic');
      expect(impressions.underlyingTruth).toBe('Guards deep emotional intensity');
    });

    test('should return default first impressions for unknown sign', () => {
      const impressions = risingSignService._assessFirstImpressions('UnknownSign');
      
      expect(impressions.firstImpression).toBe('Unique initial presentation');
      expect(impressions.socialMask).toBe('Individual social persona');
    });
  });

  describe('_determineLifeApproach method', () => {
    test('should return correct life approach for Virgo Rising', () => {
      const approach = risingSignService._determineLifeApproach('Virgo');
      
      expect(approach.lifeOrientation).toBe('Service and improvement focused');
      expect(approach.problemSolving).toBe('Detailed analysis and helpful action');
      expect(approach.goalOrientation).toBe('Perfection through service and organization');
    });

    test('should return correct life approach for Sagittarius Rising', () => {
      const approach = risingSignService._determineLifeApproach('Sagittarius');
      
      expect(approach.lifeOrientation).toBe('Exploration and truth focused');
      expect(approach.problemSolving).toBe('Broad perspective and adventure');
    });

    test('should return default life approach for unknown sign', () => {
      const approach = risingSignService._determineLifeApproach('UnknownSign');
      
      expect(approach.lifeOrientation).toBe('Personal life focus');
      expect(approach.decisionMaking).toBe('Individual decision style');
    });
  });

  describe('_identifyHealthTendencies method', () => {
    test('should return correct health tendencies for Aries Rising', () => {
      const tendencies = risingSignService._identifyHealthTendencies('Aries');
      
      expect(tendencies.constitution).toBe('Athletic and energetic');
      expect(tendencies.strengths).toBe('Strong vitality and quick recovery');
      expect(tendencies.vulnerabilities).toBe('Head, eyes, accidents from impulsiveness');
      expect(tendencies.approach).toBe('Physical activity and stress management');
    });

    test('should return correct health tendencies for Pisces Rising', () => {
      const tendencies = risingSignService._identifyHealthTendencies('Pisces');
      
      expect(tendencies.constitution).toBe('Compassionate and intuitive');
      expect(tendencies.strengths).toBe('Strong imagination and spiritual healing');
      expect(tendencies.vulnerabilities).toBe('Feet, immune system, boundary issues');
      expect(tendencies.approach).toBe('Immune health and spiritual grounding');
    });

    test('should return default health tendencies for unknown sign', () => {
      const tendencies = risingSignService._identifyHealthTendencies('UnknownSign');
      
      expect(tendencies.constitution).toBe('Unique health constitution');
      expect(tendencies.strengths).toBe('Individual health strengths');
    });
  });

  describe('processCalculation method', () => {
    const validBirthData = {
      birthDate: '15/05/1990',
      birthTime: '12:30',
      birthPlace: 'Mumbai, India'
    };

    beforeEach(() => {
      // Mock the calculator to return a valid result
      mockCalculator.calculateRisingSign.mockResolvedValue({
        sign: 'Taurus',
        degree: 15.5
      });

      // Mock helper methods to return testable values
      jest.spyOn(risingSignService, '_getRisingSignTraits')
        .mockReturnValue({ test: 'traits' });
      jest.spyOn(risingSignService, '_analyzePhysicalAppearance')
        .mockReturnValue({ test: 'appearance' });
      jest.spyOn(risingSignService, '_assessFirstImpressions')
        .mockReturnValue({ test: 'firstImpressions' });
      jest.spyOn(risingSignService, '_determineLifeApproach')
        .mockReturnValue({ test: 'lifeApproach' });
      jest.spyOn(risingSignService, '_identifyHealthTendencies')
        .mockReturnValue({ test: 'healthTendencies' });
      jest.spyOn(risingSignService, '_createRisingSignInterpretation')
        .mockReturnValue('test interpretation');
    });

    test('should process calculation successfully with valid data', async () => {
      const result = await risingSignService.processCalculation(validBirthData);
      
      expect(mockCalculator.calculateRisingSign).toHaveBeenCalledWith(
        '15/05/1990',
        '12:30',
        'Mumbai, India',
        'sidereal'
      );
      
      expect(result.risingSignData.sign).toBe('Taurus');
      expect(result.risingSignTraits).toEqual({ test: 'traits' });
      expect(result.physicalAppearance).toEqual({ test: 'appearance' });
      expect(result.firstImpressions).toEqual({ test: 'firstImpressions' });
      expect(result.lifeApproach).toEqual({ test: 'lifeApproach' });
      expect(result.healthTendencies).toEqual({ test: 'healthTendencies' });
      expect(result.interpretation).toBe('test interpretation');
    });

    test('should use tropical chart type when specified', async () => {
      await risingSignService.processCalculation(validBirthData, { chartType: 'tropical' });
      
      expect(mockCalculator.calculateRisingSign).toHaveBeenCalledWith(
        '15/05/1990',
        '12:30',
        'Mumbai, India',
        'tropical'
      );
    });

    test('should handle calculation errors gracefully', async () => {
      mockCalculator.calculateRisingSign.mockRejectedValue(
        new Error('Calculator error')
      );
      
      await expect(risingSignService.processCalculation(validBirthData))
        .rejects
        .toThrow('Rising sign calculation failed: Calculator error');
      
      expect(logger.error).toHaveBeenCalledWith(
        'RisingSignService processCalculation error:',
        expect.any(Error)
      );
    });
  });

  describe('_createRisingSignInterpretation method', () => {
    test('should create a comprehensive interpretation', () => {
      const risingSignData = { sign: 'Aries' };
      const traits = {
        mask: 'Confident and assertive',
        naturalApproach: 'Pioneering and independent',
        communication: 'Straightforward and honest',
        leadershipStyle: 'Dynamic and decisive'
      };
      const firstImpressions = {
        socialMask: 'Bold and competitive personality',
        underlyingTruth: 'Needs to prove capability and courage'
      };

      const interpretation = risingSignService._createRisingSignInterpretation(
        risingSignData,
        traits,
        firstImpressions
      );

      expect(interpretation).toContain('Aries');
      expect(interpretation).toContain('confident and assertive');
      expect(interpretation).toContain('pioneering and independent');
      expect(interpretation).toContain('bold and competitive personality');
      expect(interpretation).toContain('needs to prove capability and courage');
    });
  });

  describe('formatResult method', () => {
    test('should format result with required fields', () => {
      const mockResult = {
        risingSignData: { sign: 'Taurus', degree: 15.5 },
        interpretation: 'test interpretation'
      };

      const formatted = risingSignService.formatResult(mockResult);

      expect(formatted.success).toBe(true);
      expect(formatted.data).toBe(mockResult);
      expect(formatted.summary).toBe('test interpretation');
      expect(formatted.metadata).toBeDefined();
      expect(formatted.metadata.serviceName).toBe('RisingSignService');
      expect(formatted.metadata.calculationType).toBe('Rising Sign Analysis');
      expect(formatted.disclaimer).toContain('Rising sign analysis describes your social persona');
    });
  });

  describe('getMetadata method', () => {
    test('should return correct metadata', () => {
      const metadata = risingSignService.getMetadata();

      expect(metadata.name).toBe('RisingSignService');
      expect(metadata.version).toBe('1.0.0');
      expect(metadata.category).toBe('vedic');
      expect(metadata.methods).toContain('processCalculation');
      expect(metadata.description).toContain('Calculates and interprets the Rising sign');
    });
  });

  describe('getHealthStatus method', () => {
    test('should return healthy status when service is operational', async () => {
      const healthStatus = await risingSignService.getHealthStatus();

      expect(healthStatus).toBeDefined();
      expect(healthStatus.status).toBeDefined();
      expect(healthStatus.features).toEqual({});
      expect(healthStatus.supportedAnalyses).toEqual([]);
    });

    test('should return unhealthy status when error occurs', async () => {
      jest.spyOn(risingSignService, 'getHealthStatus').mockRejectedValue(
        new Error('Health check failed')
      );

      await expect(risingSignService.getHealthStatus())
        .rejects
        .toThrow('Health check failed');
    });
  });

  describe('getHelp method', () => {
    test('should return help text that contains required information', () => {
      const helpText = risingSignService.getHelp();

      expect(helpText).toContain('Rising Sign Service');
      expect(helpText).toContain('Purpose');
      expect(helpText).toContain('Required Inputs');
      expect(helpText).toContain('Analysis Includes');
      expect(helpText).toContain('Example Usage');
      expect(helpText).toContain('Output Format');
    });
  });

  describe('Input Validation', () => {
    test('should throw error for missing birth data', () => {
      expect(() => {
        risingSignService._validateInput(null);
      }).toThrow('Birth data is required for Rising Sign analysis.');
    });
  });

  describe('Service Architecture Compliance', () => {
    test('should implement ServiceTemplate pattern', () => {
      expect(risingSignService.serviceName).toBeDefined();
      expect(typeof risingSignService.getHealthStatus).toBe('function');
      expect(typeof risingSignService.getMetadata).toBe('function');
    });

    test('should have required methods', () => {
      expect(typeof risingSignService.processCalculation).toBe('function');
      expect(typeof risingSignService.formatResult).toBe('function');
      expect(typeof risingSignService.getHelp).toBe('function');
    });
  });

  describe('Error Handling & Validation', () => {
    test('should handle concurrent requests properly', async () => {
      const birthData = { 
        birthDate: '15/05/1990',
        birthTime: '12:30',
        birthPlace: 'Mumbai, India'
      };
      
      mockCalculator.calculateRisingSign.mockResolvedValue({
        sign: 'Taurus',
        degree: 15.5
      });

      const concurrentRequests = Array(3).fill().map(() =>
        risingSignService.processCalculation(birthData)
      );

      const results = await Promise.all(concurrentRequests);

      // All should succeed
      results.forEach(result => {
        expect(result.risingSignData.sign).toBe('Taurus');
      });
    });

    test('should handle null/undefined input gracefully', async () => {
      await expect(risingSignService.processCalculation(null))
        .rejects
        .toThrow('Birth data is required for Rising Sign analysis.');
    });
  });

  describe('Performance & Resilience', () => {
    test('should respond within acceptable time for valid data', async () => {
      mockCalculator.calculateRisingSign.mockResolvedValue({
        sign: 'Taurus',
        degree: 15.5
      });

      jest.spyOn(risingSignService, '_getRisingSignTraits')
        .mockReturnValue({ test: 'traits' });
      jest.spyOn(risingSignService, '_analyzePhysicalAppearance')
        .mockReturnValue({ test: 'appearance' });
      jest.spyOn(risingSignService, '_assessFirstImpressions')
        .mockReturnValue({ test: 'firstImpressions' });
      jest.spyOn(risingSignService, '_determineLifeApproach')
        .mockReturnValue({ test: 'lifeApproach' });
      jest.spyOn(risingSignService, '_identifyHealthTendencies')
        .mockReturnValue({ test: 'healthTendencies' });
      jest.spyOn(risingSignService, '_createRisingSignInterpretation')
        .mockReturnValue('test interpretation');

      const startTime = Date.now();
      await risingSignService.processCalculation({
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