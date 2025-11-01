// tests/unit/services/core/services/antardashaService.test.js
const AntardashaService = require('../../../../../src/core/services/antardashaService');
const logger = require('../../../../../src/utils/logger');

// Mock dependencies
jest.mock('../../../../../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));

// Mock the calculator
jest.mock('../../../../../src/core/services/calculators/index', () => ({
  AntardashaCalculator: jest.fn().mockImplementation(() => ({
    getAntardashaAnalysis: jest.fn()
  }))
}));

let serviceInstance;

beforeEach(async () => {
  jest.clearAllMocks();

  serviceInstance = new AntardashaService();
  await serviceInstance.initialize();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('AntardashaService', () => {
  describe('constructor', () => {
    it('should initialize correctly', () => {
      expect(serviceInstance).toBeInstanceOf(AntardashaService);
      expect(serviceInstance.serviceName).toBe('AntardashaService');
      expect(serviceInstance.calculatorPath).toBe('./calculators/index');
    });
  });

  describe('initialize', () => {
    it('should initialize successfully', async () => {
      const newService = new AntardashaService();
      await expect(newService.initialize()).resolves.not.toThrow();
      expect(logger.info).toHaveBeenCalledWith('✅ AntardashaService initialized successfully');
    });

    it('should handle initialization errors', async () => {
      const mockError = new Error('Init failed');
      jest.spyOn(AntardashaService.prototype, 'initialize').mockRejectedValueOnce(mockError);

      const newService = new AntardashaService();
      await expect(newService.initialize()).rejects.toThrow('Init failed');
      expect(logger.error).toHaveBeenCalledWith('❌ Failed to initialize AntardashaService:', mockError);
    });
  });

  describe('processCalculation', () => {
    const validBirthData = {
      birthDate: '15/06/1990',
      birthTime: '14:30',
      birthPlace: 'New York, USA',
      name: 'John Doe'
    };

    it('should process Antardasha calculation successfully', async () => {
      const mockResult = {
        currentDasha: 'Jupiter',
        currentDashaStart: '2020-01-01',
        currentDashaEnd: '2036-01-01',
        currentAntardasha: 'Venus',
        currentAntardashaStart: '2024-01-01',
        currentAntardashaEnd: '2026-01-01',
        antardashas: [
          {
            name: 'Venus',
            startDate: '2024-01-01',
            endDate: '2026-01-01',
            years: 2
          }
        ],
        analysis: {
          planet: 'Venus',
          nature: 'Love, beauty, harmony',
          positiveInfluences: 'Harmony, creativity',
          challenges: 'Indulgence, relationship issues',
          advice: 'Cultivate harmonious relationships',
          duration: '2.0 years',
          remainingTime: '1 year 6 months'
        },
        nextAntardasha: {
          name: 'Sun',
          startDate: '2026-01-01',
          endDate: '2028-01-01',
          years: 2
        }
      };

      serviceInstance.calculator.getAntardashaAnalysis.mockResolvedValue(mockResult);

      const result = await serviceInstance.processCalculation({
        birthData: validBirthData,
        options: { detailed: true }
      });

      expect(result).toEqual({
        ...mockResult,
        type: 'antardasha',
        generatedAt: expect.any(String),
        service: 'AntardashaService'
      });
      expect(serviceInstance.calculator.getAntardashaAnalysis).toHaveBeenCalledWith(
        validBirthData,
        { detailed: true }
      );
    });

    it('should handle missing birthData parameter', async () => {
      await expect(serviceInstance.processCalculation({})).rejects.toThrow(
        'Missing required parameter: birthData'
      );
    });

    it('should handle calculator errors', async () => {
      serviceInstance.calculator.getAntardashaAnalysis.mockRejectedValue(
        new Error('Calculator error')
      );

      await expect(serviceInstance.processCalculation({
        birthData: validBirthData
      })).rejects.toThrow('Antardasha analysis failed: Calculator error');
    });
  });

  describe('formatResult', () => {
    it('should format result with success structure', () => {
      const mockResult = {
        currentDasha: 'Jupiter',
        analysis: { planet: 'Venus' }
      };

      const formatted = serviceInstance.formatResult(mockResult);

      expect(formatted.success).toBe(true);
      expect(formatted.data).toBe(mockResult);
      expect(formatted.timestamp).toBeDefined();
      expect(formatted.service).toBe('AntardashaService');
    });
  });

  describe('validate', () => {
    it('should validate correct birth data', () => {
      const validData = {
        birthData: {
          birthDate: '15/06/1990',
          birthTime: '14:30',
          birthPlace: 'New York'
        }
      };

      expect(serviceInstance.validate(validData)).toBe(true);
    });

    it('should throw error for missing input', () => {
      expect(() => serviceInstance.validate(null)).toThrow('Input data is required');
    });

    it('should throw error for missing birthData', () => {
      expect(() => serviceInstance.validate({})).toThrow('Birth data is required for Antardasha analysis');
    });
  });

  describe('getMetadata', () => {
    it('should return correct metadata', () => {
      const metadata = serviceInstance.getMetadata();

      expect(metadata.name).toBe('AntardashaService');
      expect(metadata.version).toBe('1.0.0');
      expect(metadata.category).toBe('vedic');
      expect(metadata.methods).toContain('getAntardashaAnalysis');
      expect(metadata.dependencies).toContain('AntardashaCalculator');
    });
  });

  describe('getHealthStatus', () => {
    it('should return healthy status', async () => {
      const status = await serviceInstance.getHealthStatus();

      expect(status.status).toBe('healthy');
      expect(status.serviceName).toBe('AntardashaService');
      expect(status.features.antardashaAnalysis).toBe(true);
      expect(status.features.dashaTiming).toBe(true);
      expect(status.features.predictiveAstrology).toBe(true);
      expect(status.supportedAnalyses).toContain('antardasha_analysis');
      expect(status.supportedAnalyses).toContain('dasha_timing');
      expect(status.supportedAnalyses).toContain('predictive_astrology');
    });
  });
});