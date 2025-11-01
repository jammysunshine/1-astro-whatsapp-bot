// tests/unit/services/core/services/basicBirthChartService.test.js
const BasicBirthChartService = require('../../../../../src/core/services/basicBirthChartService');
const logger = require('../../../../../src/utils/logger');

// Mock dependencies
jest.mock('../../../../../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));

// Mock the calculator
jest.mock('../../../../../src/core/services/calculators/ChartGenerator', () => ({
  generateVedicKundli: jest.fn(),
  generateWesternBirthChart: jest.fn()
}));

let serviceInstance;

beforeEach(async () => {
  jest.clearAllMocks();

  serviceInstance = new BasicBirthChartService();
  await serviceInstance.initialize();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('BasicBirthChartService', () => {
  describe('constructor', () => {
    it('should initialize correctly', () => {
      expect(serviceInstance).toBeInstanceOf(BasicBirthChartService);
      expect(serviceInstance.serviceName).toBe('BasicBirthChartService');
      expect(serviceInstance.calculatorPath).toBe('./calculators/ChartGenerator');
    });
  });

  describe('processCalculation', () => {
    const validBirthData = {
      birthDate: '15/06/1990',
      birthTime: '14:30',
      birthPlace: 'New York, USA',
      name: 'John Doe'
    };

    it('should process basic birth chart calculation successfully', async () => {
      const mockChart = {
        birthDetails: validBirthData,
        ascendant: { sign: 'Leo', degree: 15.5 },
        planetaryPositions: {
          Sun: { sign: 'Gemini', house: 11, longitude: 75.2, retrograde: false },
          Moon: { sign: 'Cancer', house: 12, longitude: 95.8, retrograde: false },
          Mars: { sign: 'Aries', house: 8, longitude: 15.3, retrograde: false }
        },
        houses: {
          1: { sign: 'Leo', planets: ['Sun'] },
          2: { sign: 'Virgo', planets: [] },
          3: { sign: 'Libra', planets: ['Mercury'] }
        },
        rasiChart: 'rasi chart data'
      };

      serviceInstance.calculator.generateVedicKundli.mockResolvedValue(mockChart);

      const result = await serviceInstance.processCalculation(validBirthData);

      expect(result.service).toBe('Basic Birth Chart');
      expect(result.chart.basic.ascendant.sign).toBe('Leo');
      expect(result.chart.basic.planets.Sun.sign).toBe('Gemini');
      expect(result.chart.interpretation).toBeDefined();
      expect(result.chart.keyIndicators).toBeDefined();
      expect(result.chart.personalityProfile).toBeDefined();
      expect(result.summary).toBeDefined();
      expect(result.disclaimer).toContain('comprehensive analysis');
    });

    it('should handle calculator errors', async () => {
      serviceInstance.calculator.generateVedicKundli.mockRejectedValue(
        new Error('Chart generation failed')
      );

      await expect(serviceInstance.processCalculation(validBirthData)).rejects.toThrow(
        'Basic birth chart generation failed: Chart generation failed'
      );
    });

    it('should support Western chart type', async () => {
      const mockWesternChart = {
        ascendant: { sign: 'Sagittarius', degree: 22.1 },
        planets: {
          Sun: { sign: 'Leo', house: 1, longitude: 135.5 },
          Moon: { sign: 'Pisces', house: 8, longitude: 345.2 }
        }
      };

      serviceInstance.calculator.generateWesternBirthChart.mockResolvedValue(mockWesternChart);

      const result = await serviceInstance.processCalculation(validBirthData, { type: 'western' });

      expect(result.chart.chartType).toBe('western');
      expect(serviceInstance.calculator.generateWesternBirthChart).toHaveBeenCalledWith(validBirthData);
    });
  });

  describe('generateBasicBirthChart', () => {
    const validBirthData = {
      birthDate: '15/06/1990',
      birthTime: '14:30',
      birthPlace: 'New York, USA'
    };

    it('should generate basic Vedic chart by default', async () => {
      const mockFullKundli = {
        birthDetails: validBirthData,
        ascendant: { sign: 'Leo', degree: 15.5 },
        planetaryPositions: {
          Sun: { sign: 'Gemini', house: 11, longitude: 75.2 },
          Moon: { sign: 'Cancer', house: 12, longitude: 95.8 }
        },
        houses: {
          1: { sign: 'Leo', planets: ['Sun'] },
          2: { sign: 'Virgo', planets: [] }
        },
        rasiChart: 'rasi chart data'
      };

      serviceInstance.calculator.generateVedicKundli.mockResolvedValue(mockFullKundli);

      const result = await serviceInstance.generateBasicBirthChart(validBirthData);

      expect(result.chart.ascendant.sign).toBe('Leo');
      expect(result.chart.planets.Sun.sign).toBe('Gemini');
      expect(result.chart.planets.Sun.house).toBe(11);
      expect(result.chart.planets.Sun.degree).toBe(15.2); // 75.2 % 30
      expect(result.chart.houses[1].sign).toBe('Leo');
      expect(result.chart.houses[1].planets).toEqual(['Sun']);
      expect(result.interpretation).toBeDefined();
      expect(result.keyIndicators).toBeDefined();
      expect(result.personalityProfile).toBeDefined();
      expect(result.chartType).toBe('vedic');
    });

    it('should generate basic Western chart when specified', async () => {
      const mockWesternChart = {
        ascendant: { sign: 'Sagittarius', degree: 22.1 },
        planets: {
          Sun: { sign: 'Leo', house: 1, longitude: 135.5 },
          Moon: { sign: 'Pisces', house: 8, longitude: 345.2 }
        }
      };

      serviceInstance.calculator.generateWesternBirthChart.mockResolvedValue(mockWesternChart);

      const result = await serviceInstance.generateBasicBirthChart(validBirthData, { type: 'western' });

      expect(result.chartType).toBe('western');
      expect(result.chart.ascendant.sign).toBe('Sagittarius');
      expect(serviceInstance.calculator.generateWesternBirthChart).toHaveBeenCalledWith(validBirthData);
    });
  });

  describe('_extractBasicPlanets', () => {
    it('should extract basic planetary information', () => {
      const planetaryPositions = {
        Sun: { sign: 'Leo', house: 1, longitude: 135.5, retrograde: false },
        Moon: { sign: 'Cancer', house: 4, longitude: 95.8, retrograde: false },
        Mars: { sign: 'Aries', house: 10, longitude: 15.3, retrograde: true },
        Mercury: { sign: 'Virgo', house: 2, longitude: 165.2, retrograde: false },
        Jupiter: { sign: 'Sagittarius', house: 5, longitude: 255.7, retrograde: false },
        Venus: { sign: 'Libra', house: 3, longitude: 195.4, retrograde: false },
        Saturn: { sign: 'Capricorn', house: 6, longitude: 285.1, retrograde: false },
        Uranus: { sign: 'Aquarius', house: 7, longitude: 315.8, retrograde: false } // Should be excluded
      };

      const result = serviceInstance._extractBasicPlanets(planetaryPositions);

      expect(result.Sun.sign).toBe('Leo');
      expect(result.Sun.house).toBe(1);
      expect(result.Sun.degree).toBe(15.5); // 135.5 % 30
      expect(result.Sun.retrograde).toBe(false);

      expect(result.Moon.sign).toBe('Cancer');
      expect(result.Moon.house).toBe(4);
      expect(result.Moon.degree).toBe(5.8); // 95.8 % 30
      expect(result.Moon.retrograde).toBe(false);

      expect(result.Mars.retrograde).toBe(true);

      expect(result.Uranus).toBeUndefined(); // Not in key planets list
    });
  });

  describe('_extractBasicHouses', () => {
    it('should extract basic house information', () => {
      const houses = {
        1: { sign: 'Leo', planets: ['Sun'], lord: 'Sun' },
        2: { sign: 'Virgo', planets: [], lord: 'Mercury' },
        3: { sign: 'Libra', planets: ['Mercury', 'Venus'], lord: 'Venus' },
        4: { sign: 'Scorpio', planets: ['Mars'], lord: 'Mars' }
      };

      const result = serviceInstance._extractBasicHouses(houses);

      expect(result[1].sign).toBe('Leo');
      expect(result[1].planets).toEqual(['Sun']);

      expect(result[2].sign).toBe('Virgo');
      expect(result[2].planets).toEqual([]);

      expect(result[3].sign).toBe('Libra');
      expect(result[3].planets).toEqual(['Mercury', 'Venus']);
    });
  });

  describe('_generateBasicInterpretation', () => {
    it('should generate basic interpretation', () => {
      const chart = {
        ascendant: { sign: 'Leo' },
        planets: {
          Sun: { sign: 'Gemini', house: 11 },
          Moon: { sign: 'Cancer', house: 12 }
        }
      };

      const result = serviceInstance._generateBasicInterpretation(chart, 'vedic');

      expect(result.ascendant).toContain('Creative and charismatic presence');
      expect(result.sunSign).toContain('Sun in Gemini in the 11th house');
      expect(result.moonSign).toContain('Moon in Cancer in the 12th house');
      expect(result.dominantPlanets).toBeDefined();
      expect(result.chartBalance).toBeDefined();
    });
  });

  describe('_identifyKeyIndicators', () => {
    it('should identify key indicators from chart', () => {
      const chart = {
        planets: {
          Sun: { house: 10 },
          Moon: { house: 4 },
          Jupiter: { house: 9 },
          Saturn: { house: 7 }
        }
      };

      const result = serviceInstance._identifyKeyIndicators(chart, 'vedic');

      expect(result.strengths).toContain('Strong emotional foundation');
      expect(result.opportunities).toContain('Educational and travel opportunities');
      expect(result.challenges).toContain('Relationship commitment challenges');
      expect(result.lifeFocus).toContain('Career, reputation, and public life');
    });
  });

  describe('_createPersonalityProfile', () => {
    it('should create personality profile', () => {
      const chart = {
        ascendant: { sign: 'Leo' },
        planets: {
          Sun: { sign: 'Aries' },
          Moon: { sign: 'Cancer' },
          Mercury: { sign: 'Gemini' },
          Mars: { sign: 'Leo' },
          Venus: { sign: 'Libra' }
        }
      };

      const result = serviceInstance._createPersonalityProfile(chart, 'vedic');

      expect(result.coreTraits).toContain('Confident and creative');
      expect(result.coreTraits).toContain('Natural leader');
      expect(result.coreTraits).toContain('Deeply feeling');
      expect(result.communication).toContain('Versatile and quick-thinking');
      expect(result.approach).toContain('Creative and confident action');
      expect(result.motivation).toContain('Relationship balance and beauty');
    });
  });

  describe('_interpretAscendant', () => {
    it('should interpret ascendant signs', () => {
      expect(serviceInstance._interpretAscendant({ sign: 'Leo' }, 'vedic')).toContain('Creative and charismatic presence');
      expect(serviceInstance._interpretAscendant({ sign: 'Virgo' }, 'vedic')).toContain('Detail-oriented and service-focused');
      expect(serviceInstance._interpretAscendant({ sign: 'Unknown' }, 'vedic')).toContain('Unknown approach to life');
    });
  });

  describe('_interpretSunSign', () => {
    it('should interpret Sun sign placement', () => {
      const sun = { sign: 'Gemini', house: 11 };
      const result = serviceInstance._interpretSunSign(sun, 'vedic');
      expect(result).toContain('Sun in Gemini in the 11th house');
      expect(result).toContain('core identity and life purpose');
    });

    it('should handle missing Sun data', () => {
      const result = serviceInstance._interpretSunSign(null, 'vedic');
      expect(result).toBe('Sun placement analysis unavailable');
    });
  });

  describe('_interpretMoonSign', () => {
    it('should interpret Moon sign placement', () => {
      const moon = { sign: 'Cancer', house: 4 };
      const result = serviceInstance._interpretMoonSign(moon, 'vedic');
      expect(result).toContain('Moon in Cancer in the 4th house');
      expect(result).toContain('emotional nature and inner security needs');
    });

    it('should handle missing Moon data', () => {
      const result = serviceInstance._interpretMoonSign(null, 'vedic');
      expect(result).toBe('Moon placement analysis unavailable');
    });
  });

  describe('_identifyDominantPlanets', () => {
    it('should identify dominant planets in angular houses', () => {
      const planets = {
        Sun: { house: 1 },
        Moon: { house: 4 },
        Mars: { house: 7 },
        Jupiter: { house: 10 },
        Venus: { house: 5 } // Not angular
      };

      const result = serviceInstance._identifyDominantPlanets(planets);

      expect(result).toContain('Sun (angular)');
      expect(result).toContain('Moon (angular)');
      expect(result).toContain('Mars (angular)');
      expect(result).toContain('Jupiter (angular)');
      expect(result).not.toContain('Venus (angular)');
    });

    it('should handle charts with no angular planets', () => {
      const planets = {
        Mercury: { house: 3 },
        Venus: { house: 5 }
      };

      const result = serviceInstance._identifyDominantPlanets(planets);

      expect(result).toContain('Balanced planetary distribution');
    });
  });

  describe('_assessChartBalance', () => {
    it('should assess well-balanced chart', () => {
      const chart = {
        planets: { Sun: {}, Moon: {}, Mars: {}, Mercury: {}, Jupiter: {}, Venus: {}, Saturn: {} },
        houses: { 1: {}, 2: {}, 3: {}, 4: {}, 5: {}, 6: {}, 7: {}, 8: {}, 9: {}, 10: {}, 11: {}, 12: {} }
      };

      const result = serviceInstance._assessChartBalance(chart);
      expect(result).toContain('Well-balanced chart');
    });

    it('should assess focused chart', () => {
      const chart = {
        planets: { Sun: {}, Moon: {} },
        houses: { 1: {}, 2: {} }
      };

      const result = serviceInstance._assessChartBalance(chart);
      expect(result).toContain('focused planetary emphasis');
    });
  });

  describe('validate', () => {
    it('should validate correct birth data', () => {
      const validData = {
        birthDate: '15/06/1990',
        birthTime: '14:30',
        birthPlace: 'New York'
      };

      expect(() => serviceInstance.validate(validData)).not.toThrow();
    });

    it('should throw error for missing birth data', () => {
      expect(() => serviceInstance.validate(null)).toThrow('Birth data is required');
    });

    it('should throw error for missing required fields', () => {
      expect(() => serviceInstance.validate({ birthDate: '15/06/1990' })).toThrow(
        'Valid birth time (HH:MM format) is required'
      );
      expect(() => serviceInstance.validate({
        birthDate: '15/06/1990',
        birthTime: '14:30'
      })).toThrow('Valid birth place is required');
    });

    it('should throw error for invalid date format', () => {
      const invalidData = {
        birthDate: '15-06-1990',
        birthTime: '14:30',
        birthPlace: 'New York'
      };

      expect(() => serviceInstance.validate(invalidData)).toThrow(
        'Birth date must be in DD/MM/YYYY format'
      );
    });

    it('should throw error for invalid time format', () => {
      const invalidData = {
        birthDate: '15/06/1990',
        birthTime: '14-30',
        birthPlace: 'New York'
      };

      expect(() => serviceInstance.validate(invalidData)).toThrow(
        'Birth time must be in HH:MM format'
      );
    });
  });

  describe('formatResult', () => {
    it('should format result with service information', () => {
      const mockResult = {
        chart: { ascendant: { sign: 'Leo' } },
        interpretation: { ascendant: 'Bold presence' },
        keyIndicators: { strengths: ['Creative'] },
        personalityProfile: { coreTraits: ['Charismatic'] },
        chartType: 'vedic',
        summary: 'Basic chart summary'
      };

      const formatted = serviceInstance.formatResult(mockResult);

      expect(formatted.service).toBe('Basic Birth Chart');
      expect(formatted.timestamp).toBeDefined();
      expect(formatted.chart.basic).toBe(mockResult.chart);
      expect(formatted.chart.interpretation).toBe(mockResult.interpretation);
      expect(formatted.chart.keyIndicators).toBe(mockResult.keyIndicators);
      expect(formatted.chart.personalityProfile).toBe(mockResult.personalityProfile);
      expect(formatted.chart.chartType).toBe('vedic');
      expect(formatted.summary).toBe(mockResult.summary);
      expect(formatted.disclaimer).toContain('comprehensive analysis');
    });
  });

  describe('getMetadata', () => {
    it('should return correct metadata', () => {
      const metadata = serviceInstance.getMetadata();

      expect(metadata.name).toBe('BasicBirthChartService');
      expect(metadata.description).toContain('simplified birth chart generation');
      expect(metadata.version).toBe('1.0.0');
      expect(metadata.dependencies).toContain('ChartGenerator');
      expect(metadata.category).toBe('vedic');
    });
  });

  describe('getHealthStatus', () => {
    it('should return healthy status', async () => {
      const status = await serviceInstance.getHealthStatus();

      expect(status.status).toBe('healthy');
      expect(status.serviceName).toBe('BasicBirthChartService');
      expect(status.features).toBeDefined();
      expect(status.supportedAnalyses).toBeDefined();
    });
  });
});