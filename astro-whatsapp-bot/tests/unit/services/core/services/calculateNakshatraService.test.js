// tests/unit/services/core/services/calculateNakshatraService.test.js
const CalculateNakshatraService = require('../../../../../src/core/services/calculateNakshatraService');
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

  serviceInstance = new CalculateNakshatraService();
  await serviceInstance.initialize();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('CalculateNakshatraService', () => {
  describe('constructor', () => {
    it('should initialize correctly', () => {
      expect(serviceInstance).toBeInstanceOf(CalculateNakshatraService);
      expect(serviceInstance.serviceName).toBe('CalculateNakshatraService');
      expect(serviceInstance.calculatorPath).toBe('./calculators/SignCalculator');
    });
  });

  describe('processCalculation', () => {
    const validBirthData = {
      birthDate: '15/06/1990',
      birthTime: '14:30',
      birthPlace: 'New York, USA'
    };

    it('should process nakshatra calculation successfully', async () => {
      const result = await serviceInstance.processCalculation(validBirthData);

      expect(result).toBeDefined();
      expect(result.service).toBe('Nakshatra Calculation Analysis');
      expect(result.nakshatra).toBeDefined();
      expect(result.nakshatra.basic).toBeDefined();
      expect(result.nakshatra.traits).toBeDefined();
      expect(result.nakshatra.rulingPlanet).toBeDefined();
      expect(result.nakshatra.padaAnalysis).toBeDefined();
      expect(result.nakshatra.symbolism).toBeDefined();
      expect(result.nakshatra.lifePurpose).toBeDefined();
      expect(result.interpretation).toBeDefined();
      expect(result.disclaimer).toContain('Nakshatra analysis');
    });

    it('should handle calculator errors', async () => {
      jest.spyOn(serviceInstance, 'calculateNakshatra').mockRejectedValue(
        new Error('Calculation failed')
      );

      await expect(serviceInstance.processCalculation(validBirthData)).rejects.toThrow(
        'Nakshatra calculation failed: Calculation failed'
      );
    });

    it('should validate input data', async () => {
      await expect(serviceInstance.processCalculation(null)).rejects.toThrow(
        'Birth data is required'
      );
    });
  });

  describe('calculateNakshatra', () => {
    const validBirthData = {
      birthDate: '15/06/1990',
      birthTime: '14:30',
      birthPlace: 'New York, USA'
    };

    it('should calculate comprehensive nakshatra analysis', async () => {
      const result = await serviceInstance.calculateNakshatra(validBirthData);

      expect(result).toBeDefined();
      expect(result.nakshatraData).toBeDefined();
      expect(result.nakshatraData.nakshatra).toBeDefined();
      expect(result.nakshatraData.pada).toBeGreaterThan(0);
      expect(result.nakshatraData.pada).toBeLessThanOrEqual(4);
      expect(result.nakshatraTraits).toBeDefined();
      expect(result.rulingPlanet).toBeDefined();
      expect(result.padaAnalysis).toBeDefined();
      expect(result.symbolism).toBeDefined();
      expect(result.lifePurpose).toBeDefined();
      expect(result.interpretation).toBeDefined();
      expect(result.chartType).toBe('sidereal');
    });

    it('should support different chart types', async () => {
      const result = await serviceInstance.calculateNakshatra(validBirthData, { chartType: 'tropical' });

      expect(result.chartType).toBe('tropical');
    });
  });

  describe('_calculateNakshatra', () => {
    it('should calculate nakshatra from birth data', async () => {
      const result = await serviceInstance._calculateNakshatra('15/06/1990', '14:30', 'New York, USA', 'sidereal');

      expect(result).toBeDefined();
      expect(result.nakshatra).toBeDefined();
      expect(typeof result.nakshatra).toBe('string');
      expect(result.pada).toBeGreaterThan(0);
      expect(result.pada).toBeLessThanOrEqual(4);
      expect(result.degree).toBeDefined();
      expect(result.calculationMethod).toBeDefined();
    });

    it('should handle calculation errors gracefully', async () => {
      // Mock _getDayOfYear to cause error
      jest.spyOn(serviceInstance, '_getDayOfYear').mockImplementation(() => {
        throw new Error('Date calculation failed');
      });

      const result = await serviceInstance._calculateNakshatra('15/06/1990', '14:30', 'New York, USA', 'sidereal');

      expect(result).toBeDefined();
      expect(result.nakshatra).toBe('Unknown');
      expect(result.pada).toBe(1);
      expect(result.degree).toBe(0);
      expect(result.calculationMethod).toBe('Error in calculation');
    });
  });

  describe('_getDayOfYear', () => {
    it('should calculate day of year correctly', () => {
      expect(serviceInstance._getDayOfYear(1, 1, 2023)).toBe(1); // January 1
      expect(serviceInstance._getDayOfYear(31, 12, 2023)).toBe(365); // December 31 (non-leap year)
      expect(serviceInstance._getDayOfYear(29, 2, 2024)).toBe(60); // February 29 (leap year)
    });

    it('should handle leap years', () => {
      expect(serviceInstance._getDayOfYear(28, 2, 2023)).toBe(59); // February 28 (non-leap)
      expect(serviceInstance._getDayOfYear(29, 2, 2024)).toBe(60); // February 29 (leap)
      expect(serviceInstance._getDayOfYear(1, 3, 2024)).toBe(61); // March 1 (leap)
    });
  });

  describe('_getNakshatraTraits', () => {
    it('should return traits for known nakshatras', () => {
      const ashwiniTraits = serviceInstance._getNakshatraTraits('Ashwini');
      expect(ashwiniTraits.nature).toBe('Light');
      expect(ashwiniTraits.gender).toBe('Female');
      expect(ashwiniTraits.caste).toBe('Warrior');
      expect(ashwiniTraits.qualities).toContain('Swift');
      expect(ashwiniTraits.strengths).toContain('Speed');

      const rohiniTraits = serviceInstance._getNakshatraTraits('Rohini');
      expect(rohiniTraits.nature).toBe('Fixed');
      expect(rohiniTraits.gender).toBe('Female');
      expect(rohiniTraits.caste).toBe('Trader');
      expect(rohiniTraits.qualities).toContain('Beautiful');
    });

    it('should return default traits for unknown nakshatras', () => {
      const unknownTraits = serviceInstance._getNakshatraTraits('Unknown');
      expect(unknownTraits.nature).toBe('Unknown');
      expect(unknownTraits.qualities).toEqual(['Unique qualities']);
      expect(unknownTraits.challenges).toEqual(['Individual challenges']);
      expect(unknownTraits.strengths).toEqual(['Personal strengths']);
    });
  });

  describe('_getNakshatraRulingPlanet', () => {
    it('should return ruling planet information', () => {
      const ketuInfo = serviceInstance._getNakshatraRulingPlanet('Ashwini');
      expect(ketuInfo.energy).toBe('Spiritual and dissolving');
      expect(ketuInfo.influence).toContain('Liberation');
      expect(ketuInfo.qualities).toContain('Wisdom');

      const venusInfo = serviceInstance._getNakshatraRulingPlanet('Bharani');
      expect(venusInfo.energy).toBe('Harmonious and sensual');
      expect(venusInfo.influence).toContain('Love');
      expect(venusInfo.qualities).toContain('Charm');
    });

    it('should return default info for unknown planets', () => {
      const unknownInfo = serviceInstance._getNakshatraRulingPlanet('Unknown');
      expect(unknownInfo.energy).toBe('Unique cosmic influence');
      expect(unknownInfo.influence).toBe('Special planetary guidance');
      expect(unknownInfo.qualities).toBe('Individual planetary characteristics');
    });
  });

  describe('_analyzePada', () => {
    it('should analyze pada characteristics', () => {
      const pada1 = serviceInstance._analyzePada(1);
      expect(pada1.focus).toBe('Foundation and initiation');
      expect(pada1.qualities).toContain('Beginning');
      expect(pada1.qualities).toContain('Leadership');
      expect(pada1.strengths).toContain('Initiative');

      const pada2 = serviceInstance._analyzePada(2);
      expect(pada2.focus).toBe('Development and growth');
      expect(pada2.qualities).toContain('Stability');
      expect(pada2.challenges).toContain('Emotional attachment');

      const pada3 = serviceInstance._analyzePada(3);
      expect(pada3.focus).toBe('Expression and creativity');
      expect(pada3.qualities).toContain('Communication');
      expect(pada3.strengths).toContain('Creativity');

      const pada4 = serviceInstance._analyzePada(4);
      expect(pada4.focus).toBe('Completion and wisdom');
      expect(pada4.qualities).toContain('Wisdom');
      expect(pada4.challenges).toContain('Perfectionism');
    });

    it('should return default analysis for invalid pada', () => {
      const invalidPada = serviceInstance._analyzePada(5);
      expect(invalidPada.focus).toBe('Unique pada focus');
      expect(invalidPada.qualities).toEqual(['Individual qualities']);
    });
  });

  describe('_getNakshatraSymbolism', () => {
    it('should return symbolism and mythology', () => {
      const ashwiniSymbolism = serviceInstance._getNakshatraSymbolism('Ashwini');
      expect(ashwiniSymbolism.symbol).toBe('Horse\'s head');
      expect(ashwiniSymbolism.deity).toBe('Ashwin Kumaras (divine physicians)');
      expect(ashwiniSymbolism.mythology).toContain('Twin gods');
      expect(ashwiniSymbolism.meaning).toContain('Swift healing');

      const rohiniSymbolism = serviceInstance._getNakshatraSymbolism('Rohini');
      expect(rohiniSymbolism.symbol).toBe('Cart or chariot');
      expect(rohiniSymbolism.deity).toBe('Brahma (creator god)');
      expect(rohiniSymbolism.meaning).toContain('Beauty');
    });

    it('should return default symbolism for unknown nakshatras', () => {
      const unknownSymbolism = serviceInstance._getNakshatraSymbolism('Unknown');
      expect(unknownSymbolism.symbol).toBe('Unique symbol');
      expect(unknownSymbolism.deity).toBe('Special deity');
      expect(unknownSymbolism.mythology).toBe('Individual mythological significance');
    });
  });

  describe('_identifyLifePurpose', () => {
    it('should identify life purpose for known nakshatras', () => {
      expect(serviceInstance._identifyLifePurpose('Ashwini')).toContain('healing and swift positive change');
      expect(serviceInstance._identifyLifePurpose('Rohini')).toContain('nurture growth and beauty');
      expect(serviceInstance._identifyLifePurpose('Hasta')).toContain('heal and craft with skill');
    });

    it('should return default purpose for unknown nakshatras', () => {
      const purpose = serviceInstance._identifyLifePurpose('Unknown');
      expect(purpose).toBe('To fulfill unique soul purpose through authentic self-expression and service');
    });
  });

  describe('_createNakshatraInterpretation', () => {
    it('should create comprehensive interpretation', () => {
      const nakshatraData = {
        nakshatra: 'Ashwini',
        pada: 1
      };
      const traits = {
        nature: 'Light',
        caste: 'Warrior',
        qualities: ['Swift', 'Healing', 'Independent']
      };
      const rulingPlanet = {
        energy: 'spiritual and dissolving'
      };

      const interpretation = serviceInstance._createNakshatraInterpretation(
        nakshatraData,
        traits,
        rulingPlanet
      );

      expect(interpretation).toContain('Ashwini nakshatra');
      expect(interpretation).toContain('Light nakshatra');
      expect(interpretation).toContain('Warrior energy');
      expect(interpretation).toContain('Swift and Healing');
      expect(interpretation).toContain('1st pada');
      expect(interpretation).toContain('foundation and initiation');
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

    it('should throw error for invalid data types', () => {
      expect(() => serviceInstance.validate({ birthDate: 123 })).toThrow(
        'Valid birth date (DD/MM/YYYY format) is required'
      );
      expect(() => serviceInstance.validate({
        birthDate: '15/06/1990',
        birthTime: 1430
      })).toThrow('Valid birth time (HH:MM format) is required');
    });
  });

  describe('formatResult', () => {
    it('should format result with service information', () => {
      const mockResult = {
        nakshatraData: { nakshatra: 'Ashwini', pada: 1 },
        nakshatraTraits: { nature: 'Light' },
        rulingPlanet: { energy: 'Spiritual' },
        padaAnalysis: { focus: 'Foundation' },
        symbolism: { symbol: 'Horse head' },
        lifePurpose: 'To heal others',
        chartType: 'sidereal',
        interpretation: 'Complete interpretation'
      };

      const formatted = serviceInstance.formatResult(mockResult);

      expect(formatted.service).toBe('Nakshatra Calculation Analysis');
      expect(formatted.timestamp).toBeDefined();
      expect(formatted.nakshatra.basic).toBe(mockResult.nakshatraData);
      expect(formatted.nakshatra.traits).toBe(mockResult.nakshatraTraits);
      expect(formatted.nakshatra.rulingPlanet).toBe(mockResult.rulingPlanet);
      expect(formatted.nakshatra.padaAnalysis).toBe(mockResult.padaAnalysis);
      expect(formatted.nakshatra.symbolism).toBe(mockResult.symbolism);
      expect(formatted.nakshatra.lifePurpose).toBe(mockResult.lifePurpose);
      expect(formatted.nakshatra.chartType).toBe('sidereal');
      expect(formatted.interpretation).toBe(mockResult.interpretation);
      expect(formatted.disclaimer).toContain('Nakshatra analysis');
    });
  });

  describe('getMetadata', () => {
    it('should return correct metadata', () => {
      const metadata = serviceInstance.getMetadata();

      expect(metadata.name).toBe('CalculateNakshatraService');
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
      expect(status.serviceName).toBe('CalculateNakshatraService');
      expect(status.features).toBeDefined();
      expect(status.supportedAnalyses).toBeDefined();
    });
  });
});