// tests/unit/services/core/services/politicalTimingAnalysisService.test.js
const PoliticalTimingAnalysisService = require('../../../../../src/core/services/politicalTimingAnalysisService');
const logger = require('../../../../../src/utils/logger');

// Mock logger to prevent console output during tests
jest.mock('../../../../../src/utils/logger');

describe('PoliticalTimingAnalysisService', () => {
  let serviceInstance;

  beforeEach(async () => {
    jest.clearAllMocks();
    serviceInstance = new PoliticalTimingAnalysisService();
    // If the service has an initialize method, call it here
    if (serviceInstance.initialize) {
      await serviceInstance.initialize();
    }
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should initialize correctly', () => {
      expect(serviceInstance).toBeInstanceOf(PoliticalTimingAnalysisService);
      expect(serviceInstance.serviceName).toBe('PoliticalTimingAnalysisService');
    });
  });

  describe('processCalculation', () => {
    it('should process calculation correctly with valid input', async () => {
      const chartData = {
        planetaryPositions: {
          sun: { longitude: 120, sign: 'Leo', house: 10 },
          saturn: { longitude: 210, sign: 'Libra', house: 1 }
        }
      };

      const result = await serviceInstance.processCalculation(chartData);
      
      expect(result).toBeDefined();
      // Add more specific assertions based on expected output
    });

    it('should handle invalid input gracefully', async () => {
      const chartData = null;
      
      await expect(serviceInstance.processCalculation(chartData))
        .rejects
        .toThrow('Chart data is required for political timing analysis');
    });
  });

  describe('analyzePoliticalTiming', () => {
    it('should analyze political timing correctly', async () => {
      const params = {
        chartData: {
          planetaryPositions: {
            sun: { longitude: 120, sign: 'Leo', house: 10 },
            saturn: { longitude: 210, sign: 'Libra', house: 1 }
          }
        },
        rulership: {
          sign: 'Libra',
          planet: 'Venus'
        }
      };

      const result = await serviceInstance.analyzePoliticalTiming(params);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.favorablePeriods).toBeDefined();
      expect(result.data.challengingPeriods).toBeDefined();
      expect(result.metadata.calculationType).toBe('political_timing_analysis');
    });

    it('should handle missing chart data', async () => {
      const params = {};

      const result = await serviceInstance.analyzePoliticalTiming(params);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('identifyFavorablePoliticalPeriods', () => {
    it('should identify favorable political periods', async () => {
      const params = {
        chartData: {
          planetaryPositions: {
            sun: { longitude: 120, sign: 'Leo', house: 10 },
            jupiter: { longitude: 240, sign: 'Sagittarius', house: 2 }
          }
        }
      };

      const result = await serviceInstance.identifyFavorablePoliticalPeriods(params);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.periods).toBeDefined();
      expect(result.data.totalFavorablePeriods).toBeDefined();
      expect(result.metadata.calculationType).toBe('favorable_political_periods');
    });

    it('should handle missing chart data', async () => {
      const params = {};

      const result = await serviceInstance.identifyFavorablePoliticalPeriods(params);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('identifyChallengingPoliticalPeriods', () => {
    it('should identify challenging political periods', async () => {
      const params = {
        chartData: {
          planetaryPositions: {
            sun: { longitude: 120, sign: 'Leo', house: 10 },
            mars: { longitude: 210, sign: 'Libra', house: 1 }
          }
        }
      };

      const result = await serviceInstance.identifyChallengingPoliticalPeriods(params);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.periods).toBeDefined();
      expect(result.data.totalChallengingPeriods).toBeDefined();
      expect(result.data.riskLevel).toBeDefined();
      expect(result.metadata.calculationType).toBe('challenging_political_periods');
    });
  });

  describe('analyzeMajorTransitions', () => {
    it('should analyze major political transitions', async () => {
      const params = {
        chartData: {
          planetaryPositions: {
            sun: { longitude: 120, sign: 'Leo', house: 10 },
            saturn: { longitude: 210, sign: 'Libra', house: 1 },
            uranus: { longitude: 300, sign: 'Aquarius', house: 3 }
          }
        }
      };

      const result = await serviceInstance.analyzeMajorTransitions(params);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.transitions).toBeDefined();
      expect(result.data.transitionTypes).toBeDefined();
      expect(result.metadata.calculationType).toBe('major_political_transitions');
    });
  });

  describe('generatePoliticalTimingReport', () => {
    it('should generate comprehensive political timing report', async () => {
      const params = {
        chartData: {
          planetaryPositions: {
            sun: { longitude: 120, sign: 'Leo', house: 10 },
            saturn: { longitude: 210, sign: 'Libra', house: 1 },
            uranus: { longitude: 300, sign: 'Aquarius', house: 3 },
            jupiter: { longitude: 240, sign: 'Sagittarius', house: 2 }
          }
        },
        scope: 'medium'
      };

      const result = await serviceInstance.generatePoliticalTimingReport(params);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.timingAnalysis).toBeDefined();
      expect(result.data.favorablePeriods).toBeDefined();
      expect(result.data.challengingPeriods).toBeDefined();
      expect(result.data.majorTransitions).toBeDefined();
      expect(result.metadata.calculationType).toBe('comprehensive_political_timing_report');
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
      expect(metadata.methods).toContain('identifyFavorablePoliticalPeriods');
      expect(metadata.methods).toContain('identifyChallengingPoliticalPeriods');
      expect(metadata.methods).toContain('analyzeMajorTransitions');
      expect(metadata.methods).toContain('generatePoliticalTimingReport');
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