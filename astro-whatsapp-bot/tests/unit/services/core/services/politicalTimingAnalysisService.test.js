const PoliticalTimingAnalysisService = require('../../../../src/core/services/politicalTimingAnalysisService');
const logger = require('../../../../src/utils/logger');

// Mock the PoliticalTimingAnalyzer dependency
const mockPoliticalTimingAnalyzer = {
  analyzePoliticalTiming: jest.fn(),
  identifyFavorablePoliticalPeriods: jest.fn(),
  identifyChallengingPoliticalPeriods: jest.fn(),
  identifyMajorTransitions: jest.fn(),
};

jest.mock('../../../../src/core/services/calculators/PoliticalTimingAnalyzer', () => {
  return jest.fn().mockImplementation(() => mockPoliticalTimingAnalyzer);
});

// Mock logger to prevent console output during tests
jest.mock('../../../../src/utils/logger');

describe('PoliticalTimingAnalysisService', () => {
  let serviceInstance;

  beforeEach(async () => {
    jest.clearAllMocks();
    serviceInstance = new PoliticalTimingAnalysisService();
    // If the service has an initialize method, call it here
    if (serviceInstance.initialize) {
      await serviceInstance.initialize();
    }

    // Reset mocks for the analyzer before each test
    mockPoliticalTimingAnalyzer.analyzePoliticalTiming.mockClear();
    mockPoliticalTimingAnalyzer.identifyFavorablePoliticalPeriods.mockClear();
    mockPoliticalTimingAnalyzer.identifyChallengingPoliticalPeriods.mockClear();
    mockPoliticalTimingAnalyzer.identifyMajorTransitions.mockClear();

    // Default mock implementations for analyzer methods
    mockPoliticalTimingAnalyzer.analyzePoliticalTiming.mockResolvedValue({
      favorablePeriods: ['period1'],
      challengingPeriods: ['period2'],
      majorTransitionPeriods: ['period3'],
      stabilityPeriods: ['period4']
    });
    mockPoliticalTimingAnalyzer.identifyFavorablePoliticalPeriods.mockResolvedValue(['favorable1']);
    mockPoliticalTimingAnalyzer.identifyChallengingPoliticalPeriods.mockResolvedValue(['challenging1']);
    mockPoliticalTimingAnalyzer.identifyMajorTransitions.mockResolvedValue(['transition1']);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should initialize correctly', () => {
      expect(serviceInstance).toBeInstanceOf(PoliticalTimingAnalysisService);
      expect(serviceInstance.serviceName).toBe('PoliticalTimingAnalysisService');
      expect(serviceInstance.calculator).toBe(mockPoliticalTimingAnalyzer);
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
      expect(mockPoliticalTimingAnalyzer.analyzePoliticalTiming).toHaveBeenCalledWith(chartData);
      expect(result).toBeDefined();
    });

    it('should handle invalid input gracefully', async () => {
      const invalidChartData = null;
      await expect(serviceInstance.processCalculation(invalidChartData))
        .rejects
        .toThrow('Chart data is required for political timing analysis');
    });
  });

  describe('analyzePoliticalTiming', () => {
    const chartData = {
      planetaryPositions: {
        sun: { longitude: 120, sign: 'Leo', house: 10 }
      }
    };
    const params = { chartData };

    it('should call analyzer.analyzePoliticalTiming and return formatted result', async () => {
      const result = await serviceInstance.analyzePoliticalTiming(params);

      expect(mockPoliticalTimingAnalyzer.analyzePoliticalTiming).toHaveBeenCalledWith(chartData, undefined);
      expect(result.success).toBe(true);
      expect(result.data.favorablePeriods).toBeDefined();
      expect(result.metadata.calculationType).toBe('political_timing_analysis');
    });

    it('should handle errors from analyzer.analyzePoliticalTiming', async () => {
      mockPoliticalTimingAnalyzer.analyzePoliticalTiming.mockRejectedValue(new Error('Analyzer error'));
      const result = await serviceInstance.analyzePoliticalTiming(params);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Analyzer error');
    });
  });

  describe('identifyFavorablePoliticalPeriods', () => {
    const chartData = {
      planetaryPositions: {
        sun: { longitude: 120, sign: 'Leo', house: 10 }
      }
    };
    const params = { chartData };

    it('should call analyzer.identifyFavorablePoliticalPeriods and return formatted result', async () => {
      const result = await serviceInstance.identifyFavorablePoliticalPeriods(params);

      expect(mockPoliticalTimingAnalyzer.identifyFavorablePoliticalPeriods).toHaveBeenCalledWith(chartData, undefined);
      expect(result.success).toBe(true);
      expect(result.data.periods).toBeDefined();
      expect(result.metadata.calculationType).toBe('favorable_political_periods');
    });
  });

  describe('identifyChallengingPoliticalPeriods', () => {
    const chartData = {
      planetaryPositions: {
        sun: { longitude: 120, sign: 'Leo', house: 10 }
      }
    };
    const params = { chartData };

    it('should call analyzer.identifyChallengingPoliticalPeriods and return formatted result', async () => {
      const result = await serviceInstance.identifyChallengingPoliticalPeriods(params);

      expect(mockPoliticalTimingAnalyzer.identifyChallengingPoliticalPeriods).toHaveBeenCalledWith(chartData, undefined);
      expect(result.success).toBe(true);
      expect(result.data.periods).toBeDefined();
      expect(result.metadata.calculationType).toBe('challenging_political_periods');
    });
  });

  describe('analyzeMajorTransitions', () => {
    const chartData = {
      planetaryPositions: {
        sun: { longitude: 120, sign: 'Leo', house: 10 }
      }
    };
    const params = { chartData };

    it('should call analyzer.identifyMajorTransitions and return formatted result', async () => {
      const result = await serviceInstance.analyzeMajorTransitions(params);

      expect(mockPoliticalTimingAnalyzer.identifyMajorTransitions).toHaveBeenCalledWith(chartData, undefined);
      expect(result.success).toBe(true);
      expect(result.data.transitions).toBeDefined();
      expect(result.metadata.calculationType).toBe('major_political_transitions');
    });
  });

  describe('generatePoliticalTimingReport', () => {
    const chartData = {
      planetaryPositions: {
        sun: { longitude: 120, sign: 'Leo', house: 10 }
      }
    };
    const params = { chartData, scope: 'medium' };

    it('should call all analysis methods and return a comprehensive report', async () => {
      const result = await serviceInstance.generatePoliticalTimingReport(params);

      expect(mockPoliticalTimingAnalyzer.analyzePoliticalTiming).toHaveBeenCalled();
      expect(mockPoliticalTimingAnalyzer.identifyFavorablePoliticalPeriods).toHaveBeenCalled();
      expect(mockPoliticalTimingAnalyzer.identifyChallengingPoliticalPeriods).toHaveBeenCalled();
      expect(mockPoliticalTimingAnalyzer.identifyMajorTransitions).toHaveBeenCalled();

      expect(result.success).toBe(true);
      expect(result.data.timingAnalysis).toBeDefined();
      expect(result.data.favorablePeriods).toBeDefined();
      expect(result.data.challengingPeriods).toBeDefined();
      expect(result.data.majorTransitions).toBeDefined();
      expect(result.metadata.calculationType).toBe('comprehensive_political_timing_report');
    });

    it('should handle errors during report generation', async () => {
      mockPoliticalTimingAnalyzer.analyzePoliticalTiming.mockRejectedValue(new Error('Report error'));
      const result = await serviceInstance.generatePoliticalTimingReport(params);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Report error');
    });
  });

  describe('getHealthStatus', () => {
    it('should return a healthy status when operational', async () => {
      const status = await serviceInstance.getHealthStatus();
      expect(status.status).toBe('healthy');
      expect(status.features).toBeDefined();
      expect(status.features.analysisTypes).toContain('favorable');
      expect(status.features.analysisTypes).toContain('challenging');
      expect(status.features.analysisTypes).toContain('transitional');
    });
  });

  describe('getMetadata', () => {
    it('should return correct metadata', () => {
      const metadata = serviceInstance.getMetadata();
      expect(metadata.name).toBe('PoliticalTimingAnalysisService');
      expect(metadata.category).toBe('political_timing');
      expect(metadata.methods).toContain('analyzePoliticalTiming');
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
        .toThrow('Chart data is required for political timing analysis');
    });

    it('should warn for chart data with limited planetary information', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const chartData = {}; // No planetary positions
      
      expect(() => serviceInstance.validate(chartData)).not.toThrow();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});