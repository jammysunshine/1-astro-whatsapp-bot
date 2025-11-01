// tests/unit/services/core/calculators/AshtakavargaCalculator.test.js
const AshtakavargaCalculator = require('../../../../../src/core/services/calculators/AshtakavargaCalculator');
const logger = require('../../../../../src/utils/logger');
const sweph = require('sweph');

// Mock logger to prevent console output during tests
beforeEach(() => {
  jest.spyOn(logger, 'info').mockImplementation(() => {});
  jest.spyOn(logger, 'error').mockImplementation(() => {});
  jest.spyOn(logger, 'warn').mockImplementation(() => {});
  jest.spyOn(logger, 'debug').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('AshtakavargaCalculator', () => {
  let calculator;

  beforeEach(() => {
    calculator = new AshtakavargaCalculator();
  });

  describe('constructor', () => {
    it('should initialize correctly', () => {
      expect(calculator).toBeInstanceOf(AshtakavargaCalculator);
    });
  });

  describe('setServices', () => {
    it('should set calendricalService and geocodingService', () => {
      const mockCalendricalService = {};
      const mockGeocodingService = {};
      calculator.setServices(mockCalendricalService, mockGeocodingService);
      expect(calculator.calendricalService).toBe(mockCalendricalService);
      expect(calculator.geocodingService).toBe(mockGeocodingService);
    });
  });

  describe('calculateAshtakavarga', () => {
    const mockBirthData = {
      birthDate: '15/06/1991',
      birthTime: '14:30',
      birthPlace: 'Delhi, India',
      timezone: 5.5
    };

    const mockPlanetaryPositions = {
      Sun: { longitude: 90, latitude: 0, speed: 1 },
      Moon: { longitude: 120, latitude: 0, speed: 1 },
      Mars: { longitude: 150, latitude: 0, speed: 1 },
      Mercury: { longitude: 75, latitude: 0, speed: 1 },
      Jupiter: { longitude: 180, latitude: 0, speed: 1 },
      Venus: { longitude: 45, latitude: 0, speed: 1 },
      Saturn: { longitude: 210, latitude: 0, speed: 1 }
    };

    beforeEach(() => {
      // Mock the private _getPlanetaryPositions method
      jest.spyOn(calculator, '_getPlanetaryPositions').mockResolvedValue(mockPlanetaryPositions);
    });

    it('should calculate Ashtakavarga for valid birth data', async () => {
      const result = await calculator.calculateAshtakavarga(mockBirthData);

      expect(result).toBeDefined();
      expect(result.overview).toBeDefined();
      expect(result.planetaryStrengths).toBeInstanceOf(Array);
      expect(result.planetaryStrengths.length).toBe(7); // 7 planets
      expect(result.peakHouses).toBeInstanceOf(Array);
      expect(result.interpretation).toBeDefined();
      expect(calculator._getPlanetaryPositions).toHaveBeenCalledWith(mockBirthData);
    });

    it('should handle errors during planetary positions calculation', async () => {
      calculator._getPlanetaryPositions.mockRejectedValue(new Error('Planetary calculation failed'));

      await expect(calculator.calculateAshtakavarga(mockBirthData)).rejects.toThrow('Failed to calculate Ashtakavarga');
    });

    it('should return correct interpretation for multiple peak houses', async () => {
      // Manipulate mock to ensure multiple peak houses
      calculator._getPlanetaryPositions.mockResolvedValue({
        ...mockPlanetaryPositions,
        Sun: { longitude: 0, latitude: 0, speed: 1 }, // House 1
        Moon: { longitude: 30, latitude: 0, speed: 1 }, // House 2
        Mars: { longitude: 60, latitude: 0, speed: 1 }, // House 3
        Mercury: { longitude: 90, latitude: 0, speed: 1 }, // House 4
        Jupiter: { longitude: 120, latitude: 0, speed: 1 }, // House 5
        Venus: { longitude: 150, latitude: 0, speed: 1 }, // House 6
        Saturn: { longitude: 180, latitude: 0, speed: 1 } // House 7
      });

      const result = await calculator.calculateAshtakavarga(mockBirthData);
      expect(result.interpretation).toContain('Excellent planetary harmony');
    });

    it('should return correct interpretation for single peak house', async () => {
      // Manipulate mock to ensure single peak house
      calculator._getPlanetaryPositions.mockResolvedValue({
        ...mockPlanetaryPositions,
        Sun: { longitude: 0, latitude: 0, speed: 1 }, // House 1
        Moon: { longitude: 30, latitude: 0, speed: 1 }, // House 2
        Mars: { longitude: 60, latitude: 0, speed: 1 }, // House 3
        Mercury: { longitude: 90, latitude: 0, speed: 1 }, // House 4
        Jupiter: { longitude: 120, latitude: 0, speed: 1 }, // House 5
        Venus: { longitude: 150, latitude: 0, speed: 1 }, // House 6
        Saturn: { longitude: 210, latitude: 0, speed: 1 } // House 8
      });

      const result = await calculator.calculateAshtakavarga(mockBirthData);
      expect(result.interpretation).toContain('Balanced potential'); // Default if not enough peak houses
    });
  });

  describe('_getPlanetaryPositions', () => {
    const mockBirthData = {
      birthDate: '15/06/1991',
      birthTime: '14:30',
      birthPlace: 'Delhi, India',
      timezone: 5.5
    };

    beforeEach(() => {
      // Mock sweph.calc_ut
      jest.spyOn(sweph, 'swe_calc_ut').mockImplementation((jd, ephemId, flags) => {
        // Return consistent mock data for each planet
        if (ephemId === sweph.SE_SUN) return { rc: 0, longitude: [90, 0, 1] };
        if (ephemId === sweph.SE_MOON) return { rc: 0, longitude: [120, 0, 1] };
        if (ephemId === sweph.SE_MARS) return { rc: 0, longitude: [150, 0, 1] };
        if (ephemId === sweph.SE_MERCURY) return { rc: 0, longitude: [75, 0, 1] };
        if (ephemId === sweph.SE_JUPITER) return { rc: 0, longitude: [180, 0, 1] };
        if (ephemId === sweph.SE_VENUS) return { rc: 0, longitude: [45, 0, 1] };
        if (ephemId === sweph.SE_SATURN) return { rc: 0, longitude: [210, 0, 1] };
        return { rc: -1 }; // Default for unknown
      });
    });

    it('should return planetary positions using sweph', async () => {
      // Temporarily access private method for testing
      const planetaryPositions = await calculator._getPlanetaryPositions(mockBirthData);

      expect(planetaryPositions).toBeDefined();
      expect(planetaryPositions.Sun).toBeDefined();
      expect(planetaryPositions.Sun.longitude).toBe(90);
      expect(planetaryPositions.Moon).toBeDefined();
      expect(planetaryPositions.Moon.longitude).toBe(120);
      expect(sweph.swe_calc_ut).toHaveBeenCalledTimes(7); // For 7 planets
    });

    it('should handle sweph errors gracefully', async () => {
      jest.spyOn(sweph, 'swe_calc_ut').mockImplementation(() => {
        return { rc: -1 }; // Simulate error from sweph
      });

      const planetaryPositions = await calculator._getPlanetaryPositions(mockBirthData);
      expect(planetaryPositions.Sun).toBeUndefined(); // Should not have Sun if sweph failed
      expect(logger.warn).toHaveBeenCalled(); // Expect a warning for failed calculation
    });
  });

  describe('_generateAshtakavargaSummary', () => {
    it('should format the summary correctly', () => {
      const mockAnalysis = {
        overview: 'Overview text',
        planetaryStrengths: [{ name: 'Sun', strength: 'Sun: 10 points' }],
        peakHouses: ['House 1', 'House 7'],
        interpretation: 'Interpretation text'
      };

      // Temporarily access private method for testing
      const summary = calculator._generateAshtakavargaSummary(mockAnalysis);

      expect(summary).toContain('🔢 *Vedic Ashtakavarga Analysis*');
      expect(summary).toContain('Overview text');
      expect(summary).toContain('💫 *Planetary Strengths:*');
      expect(summary).toContain('Sun: 10 points');
      expect(summary).toContain('🏆 *Peak Areas:*');
      expect(summary).toContain('House 1, House 7');
      expect(summary).toContain('📖 *Interpretation:*');
      expect(summary).toContain('Interpretation text');
    });

    it('should handle empty planetaryStrengths and peakHouses', () => {
      const mockAnalysis = {
        overview: 'Overview text',
        planetaryStrengths: [],
        peakHouses: [],
        interpretation: 'Interpretation text'
      };

      const summary = calculator._generateAshtakavargaSummary(mockAnalysis);
      expect(summary).not.toContain('💫 *Planetary Strengths:*');
      expect(summary).not.toContain('🏆 *Peak Areas:*');
    });
  });

  describe('healthCheck', () => {
    it('should return a healthy status', () => {
      const status = calculator.healthCheck();
      expect(status.healthy).toBe(true);
      expect(status.name).toBe('AshtakavargaCalculator');
      expect(status.status).toBe('Operational');
      expect(status.calculations).toBeInstanceOf(Array);
    });
  });

  // Refactoring Note: The methods _isAshtakavargaRequest, _formatBirthDataRequiredMessage,
  // and handleAshtakavargaRequest are handler-specific and should ideally not reside
  // within a Calculator class. They are not unit tested here as part of the calculator's
  // core functionality, but their presence is noted for future refactoring.
});
