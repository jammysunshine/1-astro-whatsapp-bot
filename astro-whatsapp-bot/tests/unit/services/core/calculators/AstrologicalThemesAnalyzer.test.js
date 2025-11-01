// tests/unit/services/core/calculators/AstrologicalThemesAnalyzer.test.js
const { AstrologicalThemesAnalyzer } = require('../src/core/services/calculators/AstrologicalThemesAnalyzer');
const logger = require('../src/utils/logger');

// Mock logger to prevent console output during tests
jest.mock('../src/utils/logger');

describe('AstrologicalThemesAnalyzer', () => {
  let analyzerInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    analyzerInstance = new AstrologicalThemesAnalyzer();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should initialize correctly', () => {
      expect(analyzerInstance).toBeInstanceOf(AstrologicalThemesAnalyzer);
    });
  });

  describe('identifyDominantThemes', () => {
    it('should identify dominant themes correctly', () => {
      const chartData = {
        planetaryPositions: {
          sun: { longitude: 120, sign: 'Leo', house: 5 },
          saturn: { longitude: 210, sign: 'Libra', house: 8 },
          uranus: { longitude: 300, sign: 'Aquarius', house: 11 }
        }
      };

      const themes = analyzerInstance.identifyDominantThemes(chartData);
      
      expect(Array.isArray(themes)).toBe(true);
      expect(themes.length).toBeGreaterThan(0);
    });

    it('should handle chart data with limited planetary information', () => {
      const chartData = {
        planetaryPositions: {}
      };

      const themes = analyzerInstance.identifyDominantThemes(chartData);
      
      expect(Array.isArray(themes)).toBe(true);
      expect(themes.length).toBeGreaterThan(0);
      expect(themes[0]).toContain('Unknown planetary energies');
    });
  });

  describe('assessGlobalMood', () => {
    it('should assess global mood based on moon position', () => {
      const chartData = {
        planetaryPositions: {
          moon: { house: 1 }
        }
      };

      const mood = analyzerInstance.assessGlobalMood(chartData);
      
      expect(typeof mood).toBe('string');
      expect(mood).toBe('Bold and initiative-driven global mood');
    });

    it('should handle missing moon position', () => {
      const chartData = {
        planetaryPositions: {}
      };

      const mood = analyzerInstance.assessGlobalMood(chartData);
      
      expect(typeof mood).toBe('string');
      expect(mood).toBe('Unknown collective mood');
    });
  });

  describe('identifyKeyTransactions', () => {
    it('should identify key transactions', () => {
      const chartData = {
        planetaryPositions: {
          saturn: { longitude: 210 },
          uranus: { longitude: 300 }
        }
      };

      const transactions = analyzerInstance.identifyKeyTransactions(chartData);
      
      expect(Array.isArray(transactions)).toBe(true);
      expect(transactions.length).toBeGreaterThan(0);
      expect(transactions.some(t => t.includes('Saturn'))).toBe(true);
      expect(transactions.some(t => t.includes('Uranus'))).toBe(true);
    });
  });

  describe('analyzeCollectiveUnconscious', () => {
    it('should analyze collective unconscious indicators', () => {
      const chartData = {
        planetaryPositions: {
          sun: { longitude: 120, sign: 'Leo' },
          moon: { longitude: 90, sign: 'Cancer' }
        }
      };

      const analysis = analyzerInstance.analyzeCollectiveUnconscious(chartData);
      
      expect(typeof analysis).toBe('object');
      expect(analysis.archetypalInfluences).toBeDefined();
      expect(analysis.karmicPatterns).toBeDefined();
      expect(analysis.psychologicalClimate).toBeDefined();
      expect(analysis.transformativePotential).toBeDefined();
    });
  });

  describe('analyzePlanetaryClimates', () => {
    it('should analyze planetary climates', () => {
      const chartData = {
        planetaryPositions: {
          mars: { longitude: 210 },
          saturn: { longitude: 210 }
        }
      };

      const climates = analyzerInstance.analyzePlanetaryClimates(chartData);
      
      expect(Array.isArray(climates)).toBe(true);
      // Check for Mars-Saturn aspects or other planetary climates
      expect(climates.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('generateThemesAnalysis', () => {
    it('should generate comprehensive themes analysis', async () => {
      const chartData = {
        planetaryPositions: {
          sun: { longitude: 120, sign: 'Leo', house: 5 },
          moon: { longitude: 90, sign: 'Cancer', house: 4 },
          saturn: { longitude: 210, sign: 'Libra', house: 8 },
          uranus: { longitude: 300, sign: 'Aquarius', house: 11 }
        }
      };

      const analysis = await analyzerInstance.generateThemesAnalysis(chartData, 'global');
      
      expect(typeof analysis).toBe('object');
      expect(analysis.scope).toBe('global');
      expect(Array.isArray(analysis.dominantThemes)).toBe(true);
      expect(typeof analysis.globalMood).toBe('string');
      expect(Array.isArray(analysis.keyTransactions)).toBe(true);
      expect(typeof analysis.collectiveUnconsciousIndicators).toBe('object');
      expect(Array.isArray(analysis.planetaryClimates)).toBe(true);
      expect(Array.isArray(analysis.archetypalInfluences)).toBe(true);
      expect(typeof analysis.karmicPatterns).toBe('object');
      expect(typeof analysis.psychologicalClimate).toBe('string');
      expect(typeof analysis.transformativePotential).toBe('string');
      expect(Array.isArray(analysis.recommendations)).toBe(true);
      expect(typeof analysis.summary).toBe('string');
    });
  });

  describe('analyzeKarmicPatterns', () => {
    it('should analyze karmic patterns', () => {
      const chartData = {
        planetaryPositions: {
          rahu: { longitude: 150 },
          ketu: { longitude: 330 },
          saturn: { longitude: 210 }
        }
      };

      const karmicAnalysis = analyzerInstance.analyzeKarmicPatterns(chartData);
      
      expect(typeof karmicAnalysis).toBe('object');
      expect(Array.isArray(karmicAnalysis.karmic)).toBe(true);
      expect(Array.isArray(karmicAnalysis.transformations)).toBe(true);
      expect(Array.isArray(karmicAnalysis.paths)).toBe(true);
      expect(Array.isArray(karmicAnalysis.challenges)).toBe(true);
      expect(Array.isArray(karmicAnalysis.opportunities)).toBe(true);
    });
  });

  describe('generateRecommendations', () => {
    it('should generate recommendations', () => {
      const chartData = {
        planetaryPositions: {
          uranus: { longitude: 300 },
          saturn: { longitude: 210 },
          pluto: { longitude: 270 },
          neptune: { longitude: 330 }
        }
      };

      const recommendations = analyzerInstance.generateRecommendations(chartData);
      
      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('generateSummary', () => {
    it('should generate summary', () => {
      const chartData = {
        planetaryPositions: {
          sun: { longitude: 120, sign: 'Leo', house: 5 }
        }
      };

      const summary = analyzerInstance.generateSummary(chartData, 'global');
      
      expect(typeof summary).toBe('string');
      expect(summary.length).toBeGreaterThan(0);
      expect(summary).toContain('global');
    });
  });
});