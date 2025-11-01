const AstrologicalThemesAnalysisService = require('../../../../src/core/services/astrologicalThemesAnalysisService');
const logger = require('../../../../src/utils/logger');

// Mock the AstrologicalThemesAnalyzer dependency
const mockAstrologicalThemesAnalyzer = {
  generateThemesAnalysis: jest.fn(),
  identifyDominantThemes: jest.fn(),
  analyzeCollectivePatterns: jest.fn(),
  analyzeKarmicPatterns: jest.fn(),
};

jest.mock('../../../../src/core/services/calculators/AstrologicalThemesAnalyzer', () => {
  return jest.fn().mockImplementation(() => mockAstrologicalThemesAnalyzer);
});

// Mock logger to prevent console output during tests
jest.mock('../../../../src/utils/logger');

describe('AstrologicalThemesAnalysisService', () => {
  let serviceInstance;

  beforeEach(async () => {
    jest.clearAllMocks();
    serviceInstance = new AstrologicalThemesAnalysisService();
    // If the service has an initialize method, call it here
    if (serviceInstance.initialize) {
      await serviceInstance.initialize();
    }

    // Reset mocks for the analyzer before each test
    mockAstrologicalThemesAnalyzer.generateThemesAnalysis.mockClear();
    mockAstrologicalThemesAnalyzer.identifyDominantThemes.mockClear();
    mockAstrologicalThemesAnalyzer.analyzeCollectivePatterns.mockClear();
    mockAstrologicalThemesAnalyzer.analyzeKarmicPatterns.mockClear();

    // Default mock implementations for analyzer methods
    mockAstrologicalThemesAnalyzer.generateThemesAnalysis.mockResolvedValue({
      themes: ['Leadership'],
      mood: 'Positive'
    });
    mockAstrologicalThemesAnalyzer.identifyDominantThemes.mockResolvedValue(['Leadership and authority patterns']);
    mockAstrologicalThemesAnalyzer.analyzeCollectivePatterns.mockResolvedValue({
      globalMood: 'Mixed emotional currents',
      trends: ['Social change'],
      archetypes: ['Hero'
      ],
      challenges: ['Conflict'],
      transformations: ['Growth']
    });
    mockAstrologicalThemesAnalyzer.analyzeKarmicPatterns.mockResolvedValue({
      karmic: ['Past life lessons'],
      transformations: ['Spiritual awakening'],
      paths: ['Self-discovery'],
      challenges: ['Ego'],
      opportunities: ['Compassion']
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should initialize correctly', () => {
      expect(serviceInstance).toBeInstanceOf(AstrologicalThemesAnalysisService);
      expect(serviceInstance.serviceName).toBe('AstrologicalThemesAnalysisService');
      expect(serviceInstance.calculator).toBe(mockAstrologicalThemesAnalyzer);
    });
  });

  describe('processCalculation', () => {
    const chartData = {
      planetaryPositions: {
        sun: { longitude: 120, sign: 'Leo', house: 10 }
      }
    };

    it('should process calculation correctly with valid input', async () => {
      const result = await serviceInstance.processCalculation(chartData);
      expect(mockAstrologicalThemesAnalyzer.generateThemesAnalysis).toHaveBeenCalledWith(chartData);
      expect(result).toBeDefined();
    });

    it('should handle invalid input gracefully', async () => {
      const invalidChartData = null;
      await expect(serviceInstance.processCalculation(invalidChartData))
        .rejects
        .toThrow('Chart data is required for astrological themes analysis');
    });
  });

  describe('identifyDominantThemes', () => {
    const chartData = {
      planetaryPositions: {
        sun: { longitude: 120, sign: 'Leo', house: 10 }
      }
    };
    const params = { chartData, scope: 'global' };

    it('should call analyzer.identifyDominantThemes and return formatted result', async () => {
      const result = await serviceInstance.identifyDominantThemes(params);

      expect(mockAstrologicalThemesAnalyzer.identifyDominantThemes).toHaveBeenCalledWith(chartData, 'global');
      expect(result.success).toBe(true);
      expect(result.data.dominantThemes).toBeDefined();
      expect(result.metadata.calculationType).toBe('dominant_themes_analysis');
    });

    it('should handle errors from analyzer.identifyDominantThemes', async () => {
      mockAstrologicalThemesAnalyzer.identifyDominantThemes.mockRejectedValue(new Error('Analyzer error'));
      const result = await serviceInstance.identifyDominantThemes(params);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Analyzer error');
    });
  });

  describe('analyzeCollectiveUnconscious', () => {
    const chartData = {
      planetaryPositions: {
        moon: { longitude: 120, sign: 'Leo', house: 10 }
      }
    };
    const params = { chartData };

    it('should call analyzer.analyzeCollectivePatterns and return formatted result', async () => {
      const result = await serviceInstance.analyzeCollectiveUnconscious(params);

      expect(mockAstrologicalThemesAnalyzer.analyzeCollectivePatterns).toHaveBeenCalledWith(chartData);
      expect(result.success).toBe(true);
      expect(result.data.collectiveMood).toBeDefined();
      expect(result.metadata.calculationType).toBe('collective_unconscious_analysis');
    });
  });

  describe('analyzeKarmicAndTransformation', () => {
    const chartData = {
      planetaryPositions: {
        saturn: { longitude: 120, sign: 'Leo', house: 10 }
      }
    };
    const params = { chartData };

    it('should call analyzer.analyzeKarmicPatterns and return formatted result', async () => {
      const result = await serviceInstance.analyzeKarmicAndTransformation(params);

      expect(mockAstrologicalThemesAnalyzer.analyzeKarmicPatterns).toHaveBeenCalledWith(chartData);
      expect(result.success).toBe(true);
      expect(result.data.karmicPatterns).toBeDefined();
      expect(result.metadata.calculationType).toBe('karmic_transformation_analysis');
    });
  });

  describe('generateComprehensiveThemesReport', () => {
    const chartData = {
      planetaryPositions: {
        sun: { longitude: 120, sign: 'Leo', house: 10 }
      }
    };
    const params = { chartData, focusArea: 'all' };

    it('should call all analysis methods and return a comprehensive report', async () => {
      const result = await serviceInstance.generateComprehensiveThemesReport(params);

      expect(mockAstrologicalThemesAnalyzer.identifyDominantThemes).toHaveBeenCalled();
      expect(mockAstrologicalThemesAnalyzer.analyzeCollectivePatterns).toHaveBeenCalled();
      expect(mockAstrologicalThemesAnalyzer.analyzeKarmicPatterns).toHaveBeenCalled();

      expect(result.success).toBe(true);
      expect(result.data.dominantThemes).toBeDefined();
      expect(result.data.collectiveAnalysis).toBeDefined();
      expect(result.data.karmicAnalysis).toBeDefined();
      expect(result.metadata.calculationType).toBe('comprehensive_themes_report');
    });

    it('should handle errors during report generation', async () => {
      mockAstrologicalThemesAnalyzer.identifyDominantThemes.mockRejectedValue(new Error('Report error'));
      const result = await serviceInstance.generateComprehensiveThemesReport(params);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Report error');
    });
  });

  describe('getHealthStatus', () => {
    it('should return a healthy status when operational', async () => {
      const status = await serviceInstance.getHealthStatus();
      expect(status.status).toBe('healthy');
      expect(status.features).toBeDefined();
      expect(status.features.analysisTypes).toContain('archetypal');
      expect(status.features.themeCategories).toContain('dominant');
    });
  });

  describe('getMetadata', () => {
    it('should return correct metadata', () => {
      const metadata = serviceInstance.getMetadata();
      expect(metadata.name).toBe('AstrologicalThemesAnalysisService');
      expect(metadata.category).toBe('thematic');
      expect(metadata.methods).toContain('identifyDominantThemes');
    });
  });

  describe('validate', () => {
    it('should validate chart data correctly', () => {
      const chartData = {
        planetaryPositions: {
          sun: { longitude: 120, sign: 'Leo', house: 10 }
        }
      };
      
      expect(() => serviceInstance.validate(chartData)).not.toThrow();
    });

    it('should throw error for missing chart data', () => {
      expect(() => serviceInstance.validate(null))
        .toThrow('Chart data is required for astrological themes analysis');
    });

    it('should warn for chart data with limited planetary information', () => {
      const consoleWarnSpy = jest.spyOn(logger, 'warn').mockImplementation(() => {});
      const chartData = {}; // No planetary positions
      
      expect(() => serviceInstance.validate(chartData)).not.toThrow();
      expect(consoleWarnSpy).toHaveBeenCalledWith('Chart data has limited planetary information');
      consoleWarnSpy.mockRestore();
    });
  });
});