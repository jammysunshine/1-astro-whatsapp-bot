// tests/unit/services/core/services/advancedTransitsService.test.js
const AdvancedTransitsService = require('../../../../../src/core/services/advancedTransitsService');
const logger = require('../../../../../src/utils/logger');

// Mock dependencies
jest.mock('../../../../../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));

// Mock the calculator
jest.mock('../../../../../src/core/services/calculators/SignificantTransitsCalculator', () => ({
  SignificantTransitsCalculator: jest.fn().mockImplementation(() => ({
    calculateAdvancedTransits: jest.fn(),
    calculateTransitAspects: jest.fn(),
    calculateTransitReturns: jest.fn(),
    calculatePlanetaryStations: jest.fn(),
    calculateEclipseTransits: jest.fn(),
    calculateCompositeTransits: jest.fn()
  }))
}));

let serviceInstance;

beforeEach(async () => {
  jest.clearAllMocks();

  serviceInstance = new AdvancedTransitsService();
  await serviceInstance.initialize();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('AdvancedTransitsService', () => {
  describe('constructor', () => {
    it('should initialize correctly', () => {
      expect(serviceInstance).toBeInstanceOf(AdvancedTransitsService);
      expect(serviceInstance.serviceName).toBe('AdvancedTransitsService');
      expect(serviceInstance.calculatorPath).toBe('./calculators/SignificantTransitsCalculator');
    });
  });

  describe('processCalculation', () => {
    const validBirthData = {
      birthDate: '15/06/1990',
      birthTime: '14:30',
      birthPlace: 'New York, USA',
      name: 'John Doe'
    };

    it('should process advanced transits calculation successfully', async () => {
      const mockResult = {
        type: 'advanced_transits',
        analysisPeriod: '6 months ahead',
        upcomingTransits: [
          {
            date: new Date(),
            transitingPlanet: 'jupiter',
            natalPoint: { name: 'sun', type: 'planets' },
            aspect: 'conjunction'
          }
        ],
        periodInfluence: {
          overallInfluence: 'Favorable period',
          rating: 'Good'
        }
      };

      serviceInstance.calculator.calculateAdvancedTransits.mockResolvedValue(mockResult);

      const result = await serviceInstance.processCalculation(validBirthData);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.timestamp).toBeDefined();
      expect(result.service).toBe('AdvancedTransitsService');
      expect(serviceInstance.calculator.calculateAdvancedTransits).toHaveBeenCalledWith(
        validBirthData,
        expect.any(Date),
        expect.any(Date),
        {}
      );
    });

    it('should handle calculator errors', async () => {
      serviceInstance.calculator.calculateAdvancedTransits.mockRejectedValue(
        new Error('Calculator error')
      );

      await expect(serviceInstance.processCalculation(validBirthData)).rejects.toThrow(
        'Advanced transits calculation failed: Calculator error'
      );
    });
  });

  describe('calculateTransitAspects', () => {
    const validParams = {
      birthData: {
        birthDate: '15/06/1990',
        birthTime: '14:30',
        birthPlace: 'New York, USA'
      },
      date: new Date(),
      options: { aspects: ['conjunction', 'trine'] }
    };

    it('should calculate transit aspects successfully', async () => {
      const mockResult = {
        aspects: [
          {
            planet: 'jupiter',
            aspect: 'trine',
            natalPoint: 'sun',
            orb: 1.5
          }
        ]
      };

      serviceInstance.calculator.calculateTransitAspects.mockResolvedValue(mockResult);

      const result = await serviceInstance.calculateTransitAspects(validParams);

      expect(result.success).toBe(true);
      expect(result.data).toBe(mockResult);
      expect(result.metadata.calculationType).toBe('transit_aspects');
      expect(result.metadata.date).toBe(validParams.date);
      expect(serviceInstance.calculator.calculateTransitAspects).toHaveBeenCalledWith(
        validParams.birthData,
        validParams.date,
        validParams.options
      );
    });

    it('should handle missing birthData parameter', async () => {
      await expect(serviceInstance.calculateTransitAspects({})).rejects.toThrow(
        'Missing required parameter: birthData'
      );
    });

    it('should handle calculator errors', async () => {
      serviceInstance.calculator.calculateTransitAspects.mockRejectedValue(
        new Error('Transit aspects calculation failed')
      );

      const result = await serviceInstance.calculateTransitAspects(validParams);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Transit aspects calculation failed');
      expect(result.metadata.calculationType).toBe('transit_aspects');
    });
  });

  describe('calculateTransitReturns', () => {
    const validParams = {
      birthData: {
        birthDate: '15/06/1990',
        birthTime: '14:30',
        birthPlace: 'New York, USA'
      },
      planet: 'jupiter',
      year: 2025,
      options: { exact: true }
    };

    it('should calculate transit returns successfully', async () => {
      const mockResult = {
        returns: [
          {
            date: new Date('2025-01-15'),
            exactness: 0.8
          }
        ]
      };

      serviceInstance.calculator.calculateTransitReturns.mockResolvedValue(mockResult);

      const result = await serviceInstance.calculateTransitReturns(validParams);

      expect(result.success).toBe(true);
      expect(result.data).toBe(mockResult);
      expect(result.metadata.calculationType).toBe('transit_returns');
      expect(result.metadata.planet).toBe('jupiter');
      expect(result.metadata.year).toBe(2025);
    });

    it('should handle missing birthData parameter', async () => {
      await expect(serviceInstance.calculateTransitReturns({ planet: 'sun' })).rejects.toThrow(
        'Missing required parameter: birthData'
      );
    });

    it('should handle calculator errors', async () => {
      serviceInstance.calculator.calculateTransitReturns.mockRejectedValue(
        new Error('Transit returns calculation failed')
      );

      const result = await serviceInstance.calculateTransitReturns(validParams);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Transit returns calculation failed');
    });
  });

  describe('calculatePlanetaryStations', () => {
    const validParams = {
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31'),
      planets: ['mars', 'jupiter'],
      options: { retrograde: true }
    };

    it('should calculate planetary stations successfully', async () => {
      const mockResult = {
        stations: [
          {
            planet: 'mars',
            station: 'retrograde',
            date: new Date('2025-03-15')
          }
        ]
      };

      serviceInstance.calculator.calculatePlanetaryStations.mockResolvedValue(mockResult);

      const result = await serviceInstance.calculatePlanetaryStations(validParams);

      expect(result.success).toBe(true);
      expect(result.data).toBe(mockResult);
      expect(result.metadata.calculationType).toBe('planetary_stations');
      expect(result.metadata.period.startDate).toBe(validParams.startDate);
      expect(result.metadata.period.endDate).toBe(validParams.endDate);
    });

    it('should handle missing required parameters', async () => {
      await expect(serviceInstance.calculatePlanetaryStations({})).rejects.toThrow(
        'Missing required parameter: startDate'
      );
    });

    it('should handle calculator errors', async () => {
      serviceInstance.calculator.calculatePlanetaryStations.mockRejectedValue(
        new Error('Planetary stations calculation failed')
      );

      const result = await serviceInstance.calculatePlanetaryStations(validParams);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Planetary stations calculation failed');
    });
  });

  describe('calculateEclipseTransits', () => {
    const validParams = {
      birthData: {
        birthDate: '15/06/1990',
        birthTime: '14:30',
        birthPlace: 'New York, USA'
      },
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31'),
      options: { type: 'solar' }
    };

    it('should calculate eclipse transits successfully', async () => {
      const mockResult = {
        eclipses: [
          {
            date: new Date('2025-03-14'),
            type: 'solar',
            significance: 'high'
          }
        ]
      };

      serviceInstance.calculator.calculateEclipseTransits.mockResolvedValue(mockResult);

      const result = await serviceInstance.calculateEclipseTransits(validParams);

      expect(result.success).toBe(true);
      expect(result.data).toBe(mockResult);
      expect(result.metadata.calculationType).toBe('eclipse_transits');
    });

    it('should handle missing birthData parameter', async () => {
      await expect(serviceInstance.calculateEclipseTransits({})).rejects.toThrow(
        'Missing required parameter: birthData'
      );
    });

    it('should handle calculator errors', async () => {
      serviceInstance.calculator.calculateEclipseTransits.mockRejectedValue(
        new Error('Eclipse transits calculation failed')
      );

      const result = await serviceInstance.calculateEclipseTransits(validParams);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Eclipse transits calculation failed');
    });
  });

  describe('calculateCompositeTransits', () => {
    const validParams = {
      birthData1: {
        birthDate: '15/06/1990',
        birthTime: '14:30',
        birthPlace: 'New York, USA'
      },
      birthData2: {
        birthDate: '22/12/1992',
        birthTime: '09:15',
        birthPlace: 'London, UK'
      },
      date: new Date(),
      options: { aspects: ['conjunction'] }
    };

    it('should calculate composite transits successfully', async () => {
      const mockResult = {
        compositeAspects: [
          {
            planet: 'venus',
            aspect: 'trine',
            midpoint: 120.5
          }
        ]
      };

      serviceInstance.calculator.calculateCompositeTransits.mockResolvedValue(mockResult);

      const result = await serviceInstance.calculateCompositeTransits(validParams);

      expect(result.success).toBe(true);
      expect(result.data).toBe(mockResult);
      expect(result.metadata.calculationType).toBe('composite_transits');
    });

    it('should handle missing required parameters', async () => {
      await expect(serviceInstance.calculateCompositeTransits({ birthData1: {} })).rejects.toThrow(
        'Missing required parameter: birthData2'
      );
    });

    it('should handle calculator errors', async () => {
      serviceInstance.calculator.calculateCompositeTransits.mockRejectedValue(
        new Error('Composite transits calculation failed')
      );

      const result = await serviceInstance.calculateCompositeTransits(validParams);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Composite transits calculation failed');
    });
  });

  describe('formatResult', () => {
    it('should format result with success structure', () => {
      const mockResult = { data: 'test data' };

      const formatted = serviceInstance.formatResult(mockResult);

      expect(formatted.success).toBe(true);
      expect(formatted.data).toBe(mockResult);
      expect(formatted.timestamp).toBeDefined();
      expect(formatted.service).toBe('AdvancedTransitsService');
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
        'birthTime is required for advanced transits analysis'
      );
    });
  });

  describe('getMetadata', () => {
    it('should return correct metadata', () => {
      const metadata = serviceInstance.getMetadata();

      expect(metadata.name).toBe('AdvancedTransitsService');
      expect(metadata.version).toBe('1.0.0');
      expect(metadata.category).toBe('vedic');
      expect(metadata.methods).toContain('calculateAdvancedTransits');
      expect(metadata.dependencies).toContain('TransitCalculator');
    });
  });

  describe('getHealthStatus', () => {
    it('should return healthy status', async () => {
      const status = await serviceInstance.getHealthStatus();

      expect(status.status).toBe('healthy');
      expect(status.serviceName).toBe('AdvancedTransitsService');
      expect(status.features).toBeDefined();
      expect(status.supportedAnalyses).toBeDefined();
    });
  });
});