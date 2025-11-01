// tests/unit/services/core/calculators/PoliticalTimingAnalyzer.test.js
const { PoliticalTimingAnalyzer } = require('../../../../../src/core/services/calculators/PoliticalTimingAnalyzer');
const logger = require('../../../../../src/utils/logger');

// Mock logger to prevent console output during tests
jest.mock('../../../../../src/utils/logger');

describe('PoliticalTimingAnalyzer', () => {
  let analyzerInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    analyzerInstance = new PoliticalTimingAnalyzer();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should initialize correctly', () => {
      expect(analyzerInstance).toBeInstanceOf(PoliticalTimingAnalyzer);
    });
  });

  describe('analyzePoliticalTiming', () => {
    it('should analyze political timing correctly', async () => {
      const chartData = {
        planetaryPositions: {
          sun: { longitude: 120, sign: 'Leo', house: 10 },
          saturn: { longitude: 210, sign: 'Libra', house: 1 },
          uranus: { longitude: 300, sign: 'Aquarius', house: 3 },
          jupiter: { longitude: 240, sign: 'Sagittarius', house: 2 }
        }
      };

      const analysis = await analyzerInstance.analyzePoliticalTiming(chartData);
      
      expect(typeof analysis).toBe('object');
      expect(Array.isArray(analysis.favorablePeriods)).toBe(true);
      expect(Array.isArray(analysis.challengingPeriods)).toBe(true);
      expect(Array.isArray(analysis.majorTransitionPeriods)).toBe(true);
      expect(Array.isArray(analysis.stabilityPeriods)).toBe(true);
      expect(Array.isArray(analysis.electionOpportunities)).toBe(true);
      expect(Array.isArray(analysis.legislativeWindows)).toBe(true);
      expect(Array.isArray(analysis.diplomaticOpportunities)).toBe(true);
      expect(typeof analysis.crisisPotential).toBe('object');
      expect(Array.isArray(analysis.leadershipTransitionWindows)).toBe(true);
    });

    it('should handle errors gracefully', async () => {
      const chartData = null;
      
      const analysis = await analyzerInstance.analyzePoliticalTiming(chartData);
      
      expect(typeof analysis).toBe('object');
      expect(analysis.error).toBeDefined();
      expect(typeof analysis.fallback).toBe('string');
    });
  });

  describe('identifyFavorablePoliticalPeriods', () => {
    it('should identify favorable political periods', () => {
      const chartData = {
        planetaryPositions: {
          jupiter: { longitude: 240, sign: 'Sagittarius', house: 9 },
          venus: { longitude: 330, sign: 'Pisces', house: 12 },
          mercury: { longitude: 150, sign: 'Virgo', house: 6 }
        }
      };

      const periods = analyzerInstance.identifyFavorablePoliticalPeriods(chartData);
      
      expect(Array.isArray(periods)).toBe(true);
      expect(periods.length).toBeGreaterThanOrEqual(0);
    });

    it('should return normal periods when no strong favorable indicators', () => {
      const chartData = {
        planetaryPositions: {}
      };

      const periods = analyzerInstance.identifyFavorablePoliticalPeriods(chartData);
      
      expect(Array.isArray(periods)).toBe(true);
      expect(periods.length).toBeGreaterThan(0);
      expect(periods[0].type).toBe('normal');
    });
  });

  describe('identifyChallengingPoliticalPeriods', () => {
    it('should identify challenging political periods', () => {
      const chartData = {
        planetaryPositions: {
          mars: { longitude: 15, sign: 'Aries', house: 1 },
          saturn: { longitude: 60, sign: 'Taurus', house: 6 },
          rahu: { longitude: 120 },
          ketu: { longitude: 300 }
        }
      };

      const periods = analyzerInstance.identifyChallengingPoliticalPeriods(chartData);
      
      expect(Array.isArray(periods)).toBe(true);
      expect(periods.length).toBeGreaterThanOrEqual(0);
    });

    it('should return caution periods when no strong challenging indicators', () => {
      const chartData = {
        planetaryPositions: {}
      };

      const periods = analyzerInstance.identifyChallengingPoliticalPeriods(chartData);
      
      expect(Array.isArray(periods)).toBe(true);
      expect(periods.length).toBeGreaterThan(0);
      expect(periods[0].type).toBe('caution');
    });
  });

  describe('identifyMajorTransitions', () => {
    it('should identify major transition periods', () => {
      const chartData = {
        planetaryPositions: {
          saturn: { longitude: 210, sign: 'Libra' },
          uranus: { longitude: 300, sign: 'Aquarius' },
          pluto: { longitude: 270, sign: 'Scorpio' }
        }
      };

      const transitions = analyzerInstance.identifyMajorTransitions(chartData);
      
      expect(Array.isArray(transitions)).toBe(true);
      expect(transitions.length).toBeGreaterThanOrEqual(0);
      
      // Check for expected transition types
      const hasStructural = transitions.some(t => t.type === 'structural');
      const hasRevolutionary = transitions.some(t => t.type === 'revolutionary');
      const hasTransformational = transitions.some(t => t.type === 'transformational');
      
      expect(hasStructural || hasRevolutionary || hasTransformational).toBe(true);
    });
  });

  describe('analyzeStabilityWindows', () => {
    it('should analyze stability windows', () => {
      const chartData = {
        planetaryPositions: {
          jupiter: { longitude: 240, sign: 'Sagittarius' },
          venus: { longitude: 330, sign: 'Pisces' },
          sun: { longitude: 120, sign: 'Leo', house: 5 }
        }
      };

      const windows = analyzerInstance.analyzeStabilityWindows(chartData);
      
      expect(Array.isArray(windows)).toBe(true);
      expect(windows.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('identifyElectionOpportunities', () => {
    it('should identify election opportunities', () => {
      const chartData = {
        planetaryPositions: {
          mercury: { longitude: 150, sign: 'Virgo' },
          venus: { longitude: 330, sign: 'Pisces' }
        }
      };

      const opportunities = analyzerInstance.identifyElectionOpportunities(chartData);
      
      expect(Array.isArray(opportunities)).toBe(true);
      expect(opportunities.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('identifyLegislativeWindows', () => {
    it('should identify legislative windows', () => {
      const chartData = {
        planetaryPositions: {
          mercury: { longitude: 150, sign: 'Virgo' },
          jupiter: { longitude: 240, sign: 'Sagittarius' }
        }
      };

      const windows = analyzerInstance.identifyLegislativeWindows(chartData);
      
      expect(Array.isArray(windows)).toBe(true);
      expect(windows.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('identifyDiplomaticWindows', () => {
    it('should identify diplomatic windows', () => {
      const chartData = {
        planetaryPositions: {
          venus: { longitude: 330, sign: 'Pisces' },
          moon: { longitude: 90, sign: 'Cancer' }
        }
      };

      const windows = analyzerInstance.identifyDiplomaticWindows(chartData);
      
      expect(Array.isArray(windows)).toBe(true);
      expect(windows.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('assessCrisisPotential', () => {
    it('should assess crisis potential', () => {
      const chartData = {
        planetaryPositions: {
          mars: { longitude: 15, sign: 'Aries' },
          saturn: { longitude: 60, sign: 'Taurus' },
          rahu: { longitude: 120 },
          ketu: { longitude: 300 }
        }
      };

      const crisisAssessment = analyzerInstance.assessCrisisPotential(chartData);
      
      expect(typeof crisisAssessment).toBe('object');
      expect(crisisAssessment.level).toBeDefined();
      expect(Array.isArray(crisisAssessment.factors)).toBe(true);
      expect(Array.isArray(crisisAssessment.mitigation)).toBe(true);
    });
  });

  describe('identifyLeadershipTransitions', () => {
    it('should identify leadership transition windows', () => {
      const chartData = {
        planetaryPositions: {
          saturn: { longitude: 210, sign: 'Libra' },
          mars: { longitude: 15, sign: 'Aries' },
          rahu: { longitude: 120 }
        }
      };

      const transitions = analyzerInstance.identifyLeadershipTransitions(chartData);
      
      expect(Array.isArray(transitions)).toBe(true);
      expect(transitions.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('suggestCrisisMitigation', () => {
    it('should suggest crisis mitigation strategies', () => {
      const chartData = {};
      const rulership = {};

      const strategies = analyzerInstance.suggestCrisisMitigation(chartData, rulership);
      
      expect(Array.isArray(strategies)).toBe(true);
      expect(strategies.length).toBeGreaterThan(0);
      expect(typeof strategies[0]).toBe('string');
    });
  });

  describe('checkBeneficAspect', () => {
    it('should detect beneficial aspects', () => {
      const planet1 = { longitude: 0 }; // 0 degrees
      const planet2 = { longitude: 60 }; // 60 degrees (sextile)
      
      const isBenefic = analyzerInstance.checkBeneficAspect(planet1, planet2);
      
      expect(typeof isBenefic).toBe('boolean');
      // Sextile should be considered benefic (within 8-degree orb)
      expect(isBenefic).toBe(true);
    });

    it('should not detect non-beneficial aspects', () => {
      const planet1 = { longitude: 0 }; // 0 degrees
      const planet2 = { longitude: 90 }; // 90 degrees (square)
      
      const isBenefic = analyzerInstance.checkBeneficAspect(planet1, planet2);
      
      expect(typeof isBenefic).toBe('boolean');
      // Square should not be considered benefic
      expect(isBenefic).toBe(false);
    });

    it('should handle null planets', () => {
      const isBenefic = analyzerInstance.checkBeneficAspect(null, null);
      
      expect(typeof isBenefic).toBe('boolean');
      expect(isBenefic).toBe(false);
    });
  });
});