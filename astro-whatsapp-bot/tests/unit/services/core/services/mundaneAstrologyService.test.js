// tests/unit/services/core/services/mundaneAstrologyService.test.js
const MundaneAstrologyService = require('../../../../../src/core/services/mundaneAstrologyService');
const logger = require('../../../../../src/utils/logger');

// Mock the MundaneAstrologyReader dependency
const mockMundaneAstrologyReader = {
  generateMundaneAnalysis: jest.fn(),
  analyzePoliticalClimate: jest.fn(),
  analyzeEconomicTrends: jest.fn(),
  analyzeSocialPatterns: jest.fn(),
  // Mock config for healthCheck
  config: {
    countryRulerships: { 'United States': {}, India: {} }
  }
};

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

describe('MundaneAstrologyService', () => {
  let service;

  beforeEach(() => {
    // Mock the import of MundaneAstrologyReader
    jest.mock('../../../../../src/core/services/calculators/mundaneAstrologyReader', () => {
      return jest.fn().mockImplementation(() => mockMundaneAstrologyReader);
    });
    service = new MundaneAstrologyService();
  });

  describe('constructor', () => {
    it('should initialize correctly', () => {
      expect(service).toBeInstanceOf(MundaneAstrologyService);
      expect(service.serviceName).toBe('MundaneAstrologyService');
      expect(service.calculatorPath).toBe('./calculators/mundaneAstrologyReader');
    });
  });

  describe('processCalculation', () => {
    const mockChartData = { planetaryPositions: { sun: { longitude: 10 } } };
    const mockAnalysisResult = { globalOverview: {}, politicalAnalysis: {} };

    beforeEach(() => {
      mockMundaneAstrologyReader.generateMundaneAnalysis.mockResolvedValue(mockAnalysisResult);
    });

    it('should process calculation and return result', async () => {
      const result = await service.processCalculation(mockChartData);
      expect(result).toBe(mockAnalysisResult);
      expect(mockMundaneAstrologyReader.generateMundaneAnalysis).toHaveBeenCalledWith(mockChartData);
    });

    it('should throw error if chartData is missing', async () => {
      await expect(service.processCalculation(null)).rejects.toThrow('Chart data is required');
    });

    it('should throw error if generateMundaneAnalysis fails', async () => {
      mockMundaneAstrologyReader.generateMundaneAnalysis.mockRejectedValue(new Error('Analysis failed'));
      await expect(service.processCalculation(mockChartData)).rejects.toThrow('Mundane astrology analysis failed: Analysis failed');
    });
  });

  describe('analyzePoliticalTrends', () => {
    const mockChartData = { planetaryPositions: { sun: { longitude: 10 } } };
    const mockCountry = 'India';
    const mockPoliticalAnalysis = { timingPredictions: {}, eventPredictions: {} };
    const mockGlobalOverview = { globalOverview: {} };

    beforeEach(() => {
      mockMundaneAstrologyReader.generateMundaneAnalysis.mockResolvedValue(mockGlobalOverview);
      mockMundaneAstrologyReader.analyzePoliticalClimate.mockResolvedValue(mockPoliticalAnalysis);
    });

    it('should analyze political trends for a given country', async () => {
      const result = await service.analyzePoliticalTrends({ chartData: mockChartData, country: mockCountry });

      expect(result.success).toBe(true);
      expect(result.data.country).toBe(mockCountry);
      expect(result.data.politicalAnalysis).toBe(mockPoliticalAnalysis);
      expect(mockMundaneAstrologyReader.generateMundaneAnalysis).toHaveBeenCalledWith(mockChartData, 'political');
      expect(mockMundaneAstrologyReader.analyzePoliticalClimate).toHaveBeenCalledWith(mockChartData, mockCountry);
    });

    it('should return error if chartData is missing', async () => {
      const result = await service.analyzePoliticalTrends({ country: mockCountry });
      expect(result.success).toBe(false);
      expect(result.error).toContain('chartData is required');
    });

    it('should return error if country is missing', async () => {
      const result = await service.analyzePoliticalTrends({ chartData: mockChartData });
      expect(result.success).toBe(false);
      expect(result.error).toContain('country is required');
    });
  });

  describe('analyzeEconomicTrends', () => {
    const mockChartData = { planetaryPositions: { sun: { longitude: 10 } } };
    const mockEconomicAnalysis = { marketTrends: {}, currencyAnalysis: {} };
    const mockGlobalOverview = { globalOverview: {} };

    beforeEach(() => {
      mockMundaneAstrologyReader.generateMundaneAnalysis.mockResolvedValue(mockGlobalOverview);
      mockMundaneAstrologyReader.analyzeEconomicTrends.mockResolvedValue(mockEconomicAnalysis);
    });

    it('should analyze economic trends', async () => {
      const result = await service.analyzeEconomicTrends({ chartData: mockChartData });

      expect(result.success).toBe(true);
      expect(result.data.economicAnalysis).toBe(mockEconomicAnalysis);
      expect(mockMundaneAstrologyReader.generateMundaneAnalysis).toHaveBeenCalledWith(mockChartData, 'economic');
      expect(mockMundaneAstrologyReader.analyzeEconomicTrends).toHaveBeenCalledWith(mockChartData);
    });

    it('should return error if chartData is missing', async () => {
      const result = await service.analyzeEconomicTrends({});
      expect(result.success).toBe(false);
      expect(result.error).toContain('chartData is required');
    });
  });

  describe('predictWorldEvents', () => {
    const mockChartData = { planetaryPositions: { sun: { longitude: 10 } } };
    const mockTimeframe = 6;
    const mockFullAnalysis = { keyEvents: [] };

    beforeEach(() => {
      mockMundaneAstrologyReader.generateMundaneAnalysis.mockResolvedValue(mockFullAnalysis);
    });

    it('should predict world events', async () => {
      const result = await service.predictWorldEvents({ chartData: mockChartData, timeframe: mockTimeframe });

      expect(result.success).toBe(true);
      expect(result.data.timeframe).toBe(mockTimeframe);
      expect(result.data.eventPredictions).toBeInstanceOf(Array);
      expect(mockMundaneAstrologyReader.generateMundaneAnalysis).toHaveBeenCalledWith(mockChartData);
    });

    it('should return error if chartData is missing', async () => {
      const result = await service.predictWorldEvents({ timeframe: mockTimeframe });
      expect(result.success).toBe(false);
      expect(result.error).toContain('chartData is required');
    });

    it('should return error if timeframe is missing', async () => {
      const result = await service.predictWorldEvents({ chartData: mockChartData });
      expect(result.success).toBe(false);
      expect(result.error).toContain('timeframe is required');
    });
  });

  describe('analyzeSocialTrends', () => {
    const mockChartData = { planetaryPositions: { sun: { longitude: 10 } } };
    const mockSocialAnalysis = { culturalTrends: [], socialMovementIndicators: [] };
    const mockGlobalOverview = { globalOverview: { globalMood: 'mixed' } };

    beforeEach(() => {
      mockMundaneAstrologyReader.generateMundaneAnalysis.mockResolvedValue(mockGlobalOverview);
      mockMundaneAstrologyReader.analyzeSocialPatterns.mockResolvedValue(mockSocialAnalysis);
    });

    it('should analyze social trends', async () => {
      const result = await service.analyzeSocialTrends({ chartData: mockChartData });

      expect(result.success).toBe(true);
      expect(result.data.socialAnalysis).toBe(mockSocialAnalysis);
      expect(result.data.collectiveMood).toBe(mockGlobalOverview.globalOverview.globalMood);
      expect(mockMundaneAstrologyReader.generateMundaneAnalysis).toHaveBeenCalledWith(mockChartData, 'social');
      expect(mockMundaneAstrologyReader.analyzeSocialPatterns).toHaveBeenCalledWith(mockChartData);
    });

    it('should return error if chartData is missing', async () => {
      const result = await service.analyzeSocialTrends({});
      expect(result.success).toBe(false);
      expect(result.error).toContain('chartData is required');
    });
  });

  describe('generateSeasonalForecast', () => {
    const mockChartData = { planetaryPositions: { sun: { longitude: 10 } } };
    const mockSeason = 'spring';
    const mockHemisphere = 'northern';
    const mockAnalysis = { globalOverview: {}, keyEvents: [] };

    beforeEach(() => {
      mockMundaneAstrologyReader.generateMundaneAnalysis.mockResolvedValue(mockAnalysis);
    });

    it('should generate seasonal forecast', async () => {
      const result = await service.generateSeasonalForecast({ chartData: mockChartData, season: mockSeason, hemisphere: mockHemisphere });

      expect(result.success).toBe(true);
      expect(result.data.season).toBe(mockSeason);
      expect(result.data.hemisphere).toBe(mockHemisphere);
      expect(result.data.seasonalInsights).toBeDefined();
      expect(mockMundaneAstrologyReader.generateMundaneAnalysis).toHaveBeenCalledWith(mockChartData);
    });

    it('should return error if chartData is missing', async () => {
      const result = await service.generateSeasonalForecast({ season: mockSeason, hemisphere: mockHemisphere });
      expect(result.success).toBe(false);
      expect(result.error).toContain('chartData is required');
    });

    it('should return error if season is missing', async () => {
      const result = await service.generateSeasonalForecast({ chartData: mockChartData, hemisphere: mockHemisphere });
      expect(result.success).toBe(false);
      expect(result.error).toContain('season is required');
    });

    it('should return error if hemisphere is missing', async () => {
      const result = await service.generateSeasonalForecast({ chartData: mockChartData, season: mockSeason });
      expect(result.success).toBe(false);
      expect(result.error).toContain('hemisphere is required');
    });
  });

  describe('getHealthStatus', () => {
    it('should return a healthy status', async () => {
      const status = await service.getHealthStatus();
      expect(status.status).toBe('healthy');
      expect(status.features.analysisTypes).toBeInstanceOf(Array);
      expect(status.features.supportedCountries).toBeGreaterThan(0);
    });

    it('should return an unhealthy status if an error occurs', async () => {
      // Mocking a method that is called during health check to throw an error
      jest.spyOn(service, 'getMetadata').mockImplementation(() => {
        throw new Error('Metadata error');
      });
      const status = await service.getHealthStatus();
      expect(status.status).toBe('unhealthy');
      expect(status.error).toContain('Metadata error');
    });
  });

  describe('getMetadata', () => {
    it('should return correct metadata', () => {
      const metadata = service.getMetadata();
      expect(metadata.name).toBe('MundaneAstrologyService');
      expect(metadata.category).toBe('mundane');
      expect(metadata.methods).toBeInstanceOf(Array);
    });
  });

  describe('getHelp', () => {
    it('should return help information string', () => {
      const help = service.getHelp();
      expect(typeof help).toBe('string');
      expect(help).toContain('MundaneAstrologyService');
      expect(help).toContain('Purpose:');
    });
  });
});
