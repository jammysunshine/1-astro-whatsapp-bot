// tests/unit/services/core/services/asteroidsService.test.js
const AsteroidsService = require('../../../../../src/core/services/asteroidsService');
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
  AsteroidCalculator: jest.fn().mockImplementation(() => ({
    calculateAsteroidPositions: jest.fn(),
    analyzeAsteroidAspects: jest.fn(),
    calculateAsteroidTransits: jest.fn(),
    getCeresAnalysis: jest.fn(),
    getPallasAnalysis: jest.fn(),
    getJunoAnalysis: jest.fn(),
    getVestaAnalysis: jest.fn(),
    getChironAnalysis: jest.fn()
  }))
}));

let serviceInstance;

beforeEach(async () => {
  jest.clearAllMocks();

  serviceInstance = new AsteroidsService();
  await serviceInstance.initialize();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('AsteroidsService', () => {
  describe('constructor', () => {
    it('should initialize correctly', () => {
      expect(serviceInstance).toBeInstanceOf(AsteroidsService);
      expect(serviceInstance.serviceName).toBe('AsteroidsService');
      expect(serviceInstance.calculatorPath).toBe('./calculators/index');
    });
  });

  describe('lasteroidsCalculation', () => {
    const validBirthData = {
      birthDate: '15/06/1990',
      birthTime: '14:30',
      birthPlace: 'New York, USA',
      name: 'John Doe'
    };

    it('should calculate asteroid positions successfully', async () => {
      const mockResult = {
        birthData: validBirthData,
        asteroids: {
          ceres: {
            name: 'Ceres',
            longitude: 120.5,
            sign: 'Virgo',
            retrograde: false
          },
          pallas: {
            name: 'Pallas',
            longitude: 200.3,
            sign: 'Libra',
            retrograde: false
          }
        },
        interpretation: {
          ceres: { significance: 'Nurturing', placement: 'Virgo - Practical care' },
          pallas: { significance: 'Wisdom', placement: 'Libra - Balanced strategy' }
        }
      };

      serviceInstance.calculator.calculateAsteroidPositions.mockResolvedValue(mockResult);

      const result = await serviceInstance.lasteroidsCalculation(validBirthData);

      expect(result).toEqual(mockResult);
      expect(serviceInstance.calculator.calculateAsteroidPositions).toHaveBeenCalledWith(
        validBirthData,
        ['Ceres', 'Pallas', 'Juno', 'Vesta'],
        {}
      );
    });

    it('should handle calculator errors', async () => {
      serviceInstance.calculator.calculateAsteroidPositions.mockRejectedValue(
        new Error('Calculator error')
      );

      await expect(serviceInstance.lasteroidsCalculation(validBirthData)).rejects.toThrow(
        'Asteroid calculation failed: Calculator error'
      );
    });
  });

  describe('analyzeAsteroidAspects', () => {
    const validParams = {
      birthData: {
        birthDate: '15/06/1990',
        birthTime: '14:30',
        birthPlace: 'New York, USA'
      },
      asteroids: ['Ceres', 'Pallas'],
      options: { detailed: true }
    };

    it('should analyze asteroid aspects successfully', async () => {
      const mockResult = {
        aspects: [
          { asteroid: 'Ceres', planet: 'Sun', aspect: 'trine', orb: 2.1 },
          { asteroid: 'Pallas', planet: 'Mercury', aspect: 'sextile', orb: 1.8 }
        ],
        summary: 'Harmonious asteroid aspects indicate balanced energies'
      };

      serviceInstance.calculator.analyzeAsteroidAspects.mockResolvedValue(mockResult);

      const result = await serviceInstance.analyzeAsteroidAspects(validParams);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResult);
      expect(result.metadata.calculationType).toBe('asteroid_aspects');
      expect(result.metadata.asteroids).toEqual(['Ceres', 'Pallas']);
      expect(serviceInstance.calculator.analyzeAsteroidAspects).toHaveBeenCalledWith(
        validParams.birthData,
        ['Ceres', 'Pallas'],
        { detailed: true }
      );
    });

    it('should use default asteroids when not specified', async () => {
      const paramsWithoutAsteroids = {
        birthData: validParams.birthData
      };

      serviceInstance.calculator.analyzeAsteroidAspects.mockResolvedValue({});

      await serviceInstance.analyzeAsteroidAspects(paramsWithoutAsteroids);

      expect(serviceInstance.calculator.analyzeAsteroidAspects).toHaveBeenCalledWith(
        validParams.birthData,
        ['Ceres', 'Pallas', 'Juno', 'Vesta'],
        {}
      );
    });

    it('should handle missing birthData parameter', async () => {
      await expect(serviceInstance.analyzeAsteroidAspects({})).rejects.toThrow(
        'Missing required parameter: birthData'
      );
    });

    it('should handle calculator errors', async () => {
      serviceInstance.calculator.analyzeAsteroidAspects.mockRejectedValue(
        new Error('Analysis failed')
      );

      const result = await serviceInstance.analyzeAsteroidAspects(validParams);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Analysis failed');
      expect(result.metadata.calculationType).toBe('asteroid_aspects');
    });
  });

  describe('calculateAsteroidTransits', () => {
    const validParams = {
      birthData: {
        birthDate: '15/06/1990',
        birthTime: '14:30',
        birthPlace: 'New York, USA'
      },
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      asteroids: ['Ceres', 'Pallas'],
      options: { aspects: true }
    };

    it('should calculate asteroid transits successfully', async () => {
      const mockResult = {
        transits: [
          {
            date: '2024-03-15',
            asteroid: 'Ceres',
            aspect: 'conjunction',
            planet: 'Sun',
            significance: 'New nurturing cycle begins'
          }
        ],
        period: { startDate: '2024-01-01', endDate: '2024-12-31' }
      };

      serviceInstance.calculator.calculateAsteroidTransits.mockResolvedValue(mockResult);

      const result = await serviceInstance.calculateAsteroidTransits(validParams);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResult);
      expect(result.metadata.calculationType).toBe('asteroid_transits');
      expect(result.metadata.period).toEqual({
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      });
    });

    it('should handle calculator errors', async () => {
      serviceInstance.calculator.calculateAsteroidTransits.mockRejectedValue(
        new Error('Transit calculation failed')
      );

      const result = await serviceInstance.calculateAsteroidTransits(validParams);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Transit calculation failed');
    });
  });

  describe('getCeresAnalysis', () => {
    const validParams = {
      birthData: {
        birthDate: '15/06/1990',
        birthTime: '14:30',
        birthPlace: 'New York, USA'
      },
      options: { detailed: true }
    };

    it('should get Ceres analysis successfully', async () => {
      const mockResult = {
        position: { sign: 'Virgo', degrees: 15 },
        aspects: [{ planet: 'Moon', aspect: 'trine' }],
        interpretation: 'Nurturing through practical service',
        themes: ['caregiving', 'cycles', 'nourishment']
      };

      serviceInstance.calculator.getCeresAnalysis.mockResolvedValue(mockResult);

      const result = await serviceInstance.getCeresAnalysis(validParams);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResult);
      expect(result.metadata.calculationType).toBe('ceres_analysis');
    });

    it('should handle calculator errors', async () => {
      serviceInstance.calculator.getCeresAnalysis.mockRejectedValue(
        new Error('Ceres analysis failed')
      );

      const result = await serviceInstance.getCeresAnalysis(validParams);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Ceres analysis failed');
    });
  });

  describe('getPallasAnalysis', () => {
    const validParams = {
      birthData: {
        birthDate: '15/06/1990',
        birthTime: '14:30',
        birthPlace: 'New York, USA'
      }
    };

    it('should get Pallas analysis successfully', async () => {
      const mockResult = {
        position: { sign: 'Libra', degrees: 22 },
        aspects: [{ planet: 'Venus', aspect: 'conjunction' }],
        interpretation: 'Strategic thinking through harmony',
        themes: ['wisdom', 'strategy', 'creativity']
      };

      serviceInstance.calculator.getPallasAnalysis.mockResolvedValue(mockResult);

      const result = await serviceInstance.getPallasAnalysis(validParams);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResult);
      expect(result.metadata.calculationType).toBe('pallas_analysis');
    });
  });

  describe('getJunoAnalysis', () => {
    const validParams = {
      birthData: {
        birthDate: '15/06/1990',
        birthTime: '14:30',
        birthPlace: 'New York, USA'
      }
    };

    it('should get Juno analysis successfully', async () => {
      const mockResult = {
        position: { sign: 'Scorpio', degrees: 8 },
        aspects: [{ planet: 'Pluto', aspect: 'sextile' }],
        interpretation: 'Intense commitment in partnerships',
        themes: ['partnership', 'equality', 'commitment']
      };

      serviceInstance.calculator.getJunoAnalysis.mockResolvedValue(mockResult);

      const result = await serviceInstance.getJunoAnalysis(validParams);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResult);
      expect(result.metadata.calculationType).toBe('juno_analysis');
    });
  });

  describe('getVestaAnalysis', () => {
    const validParams = {
      birthData: {
        birthDate: '15/06/1990',
        birthTime: '14:30',
        birthPlace: 'New York, USA'
      }
    };

    it('should get Vesta analysis successfully', async () => {
      const mockResult = {
        position: { sign: 'Sagittarius', degrees: 12 },
        aspects: [{ planet: 'Jupiter', aspect: 'trine' }],
        interpretation: 'Dedication to higher purpose',
        themes: ['focus', 'dedication', 'inner flame']
      };

      serviceInstance.calculator.getVestaAnalysis.mockResolvedValue(mockResult);

      const result = await serviceInstance.getVestaAnalysis(validParams);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResult);
      expect(result.metadata.calculationType).toBe('vesta_analysis');
    });
  });

  describe('getChironAnalysis', () => {
    const validParams = {
      birthData: {
        birthDate: '15/06/1990',
        birthTime: '14:30',
        birthPlace: 'New York, USA'
      }
    };

    it('should get Chiron analysis successfully', async () => {
      const mockResult = {
        position: { sign: 'Cancer', degrees: 5 },
        aspects: [{ planet: 'Moon', aspect: 'square' }],
        interpretation: 'Healing emotional wounds',
        themes: ['wounds', 'healing', 'teaching']
      };

      serviceInstance.calculator.getChironAnalysis.mockResolvedValue(mockResult);

      const result = await serviceInstance.getChironAnalysis(validParams);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResult);
      expect(result.metadata.calculationType).toBe('chiron_analysis');
    });
  });

  describe('formatResult', () => {
    it('should format result with success structure', () => {
      const mockResult = {
        asteroids: { ceres: { name: 'Ceres' } },
        interpretation: 'Asteroid analysis complete'
      };

      const formatted = serviceInstance.formatResult(mockResult);

      expect(formatted.success).toBe(true);
      expect(formatted.data).toBe(mockResult);
      expect(formatted.timestamp).toBeDefined();
      expect(formatted.service).toBe('AsteroidsService');
    });
  });

  describe('validate', () => {
    it('should validate correct birth data', () => {
      const validData = {
        birthDate: '15/06/1990',
        birthTime: '14:30',
        birthPlace: 'New York'
      };

      expect(serviceInstance.validate(validData)).toBe(true);
    });

    it('should throw error for missing birth data', () => {
      expect(() => serviceInstance.validate(null)).toThrow('Birth data is required');
    });

    it('should throw error for missing required fields', () => {
      expect(() => serviceInstance.validate({ birthDate: '15/06/1990' })).toThrow(
        'birthTime is required for asteroid analysis'
      );
      expect(() => serviceInstance.validate({
        birthDate: '15/06/1990',
        birthTime: '14:30'
      })).toThrow('birthPlace is required for asteroid analysis');
    });
  });

  describe('getMetadata', () => {
    it('should return correct metadata', () => {
      const metadata = serviceInstance.getMetadata();

      expect(metadata.name).toBe('AsteroidsService');
      expect(metadata.version).toBe('1.0.0');
      expect(metadata.category).toBe('vedic');
      expect(metadata.methods).toContain('calculateAsteroidPositions');
      expect(metadata.methods).toContain('analyzeAsteroidAspects');
      expect(metadata.methods).toContain('calculateAsteroidTransits');
      expect(metadata.dependencies).toContain('AsteroidCalculator');
    });
  });

  describe('processCalculation', () => {
    it('should delegate to lasteroidsCalculation', async () => {
      const mockData = { birthDate: '15/06/1990' };
      const mockResult = { asteroids: {} };

      const spy = jest.spyOn(serviceInstance, 'lasteroidsCalculation').mockResolvedValue(mockResult);

      const result = await serviceInstance.processCalculation(mockData);

      expect(spy).toHaveBeenCalledWith(mockData);
      expect(result).toBe(mockResult);
    });
  });

  describe('getHealthStatus', () => {
    it('should return healthy status', async () => {
      const status = await serviceInstance.getHealthStatus();

      expect(status.status).toBe('healthy');
      expect(status.serviceName).toBe('AsteroidsService');
      expect(status.features).toBeDefined();
      expect(status.supportedAnalyses).toBeDefined();
    });
  });
});