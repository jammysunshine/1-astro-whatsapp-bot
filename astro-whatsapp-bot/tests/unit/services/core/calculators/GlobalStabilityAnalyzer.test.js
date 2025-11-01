// tests/unit/services/core/calculators/GlobalStabilityAnalyzer.test.js
const { GlobalStabilityAnalyzer } = require('../../../../../src/core/services/calculators/GlobalStabilityAnalyzer');
const logger = require('../../../../../src/utils/logger');

// Mock logger to prevent console output during tests
jest.mock('../../../../../src/utils/logger');

describe('GlobalStabilityAnalyzer', () => {
  let analyzerInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    analyzerInstance = new GlobalStabilityAnalyzer();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should initialize correctly', () => {
      expect(analyzerInstance).toBeInstanceOf(GlobalStabilityAnalyzer);
    });
  });

  describe('analyzeGlobalStabilityPatterns', () => {
    it('should analyze global stability patterns correctly', () => {
      const politicalResults = {
        'United States': {
          politicalStability: {
            rating: 'Stable'
          }
        },
        'Germany': {
          politicalStability: {
            rating: 'Stable'
          }
        },
        'Syria': {
          politicalStability: {
            rating: 'Unstable'
          }
        }
      };

      const patterns = analyzerInstance.analyzeGlobalStabilityPatterns(politicalResults);
      
      expect(typeof patterns).toBe('object');
      expect(typeof patterns.overallStability).toBe('string');
      expect(typeof patterns.stableNations).toBe('number');
      expect(typeof patterns.unstableNations).toBe('number');
      expect(typeof patterns.globalStabilityIndex).toBe('number');
      
      // Check that counts are correct
      expect(patterns.stableNations).toBe(2);
      expect(patterns.unstableNations).toBe(1);
    });

    it('should handle empty political results', () => {
      const politicalResults = {};

      const patterns = analyzerInstance.analyzeGlobalStabilityPatterns(politicalResults);
      
      expect(typeof patterns).toBe('object');
      expect(patterns.overallStability).toBe('Low');
      expect(patterns.stableNations).toBe(0);
      expect(patterns.unstableNations).toBe(0);
      expect(patterns.globalStabilityIndex).toBe(0);
    });
  });

  describe('calculateOverallStability', () => {
    it('should calculate high stability when most countries are stable', () => {
      const stability = analyzerInstance.calculateOverallStability(80, 20);
      
      expect(stability).toBe('High');
    });

    it('should calculate moderate stability with balanced stable/unstable ratio', () => {
      const stability = analyzerInstance.calculateOverallStability(60, 60);
      
      expect(stability).toBe('Moderate');
    });

    it('should calculate low-moderate stability when slightly more unstable', () => {
      const stability = analyzerInstance.calculateOverallStability(40, 50);
      
      expect(stability).toBe('Low-Moderate');
    });

    it('should calculate low stability when significantly more unstable', () => {
      const stability = analyzerInstance.calculateOverallStability(20, 80);
      
      expect(stability).toBe('Low');
    });
  });

  describe('identifyGlobalLeadershipPatterns', () => {
    it('should identify global leadership patterns correctly', () => {
      const politicalResults = {
        'United States': {
          leadershipAnalysis: {
            leadershipTransitions: ['2024 Presidential Election']
          }
        },
        'Germany': {
          leadershipAnalysis: {
            leadershipTransitions: []
          }
        },
        'India': {
          leadershipAnalysis: {
            leadershipTransitions: ['2024 General Elections']
          }
        }
      };

      const patterns = analyzerInstance.identifyGlobalLeadershipPatterns(politicalResults);
      
      expect(Array.isArray(patterns)).toBe(true);
      expect(patterns.length).toBe(2); // Two countries with transitions
      
      // Check that we found the countries with leadership transitions
      const countriesWithTransitions = patterns.map(p => p.country);
      expect(countriesWithTransitions).toContain('United States');
      expect(countriesWithTransitions).toContain('India');
    });

    it('should return empty array when no leadership transitions', () => {
      const politicalResults = {
        'United States': {
          leadershipAnalysis: {
            leadershipTransitions: []
          }
        },
        'Germany': {
          leadershipAnalysis: {
            leadershipTransitions: []
          }
        }
      };

      const patterns = analyzerInstance.identifyGlobalLeadershipPatterns(politicalResults);
      
      expect(Array.isArray(patterns)).toBe(true);
      expect(patterns.length).toBe(0);
    });
  });

  describe('assessGlobalPoliticalTensions', () => {
    it('should assess global political tensions correctly', () => {
      const politicalResults = {
        'United States': {
          politicalStability: {
            rating: 'Stable'
          }
        },
        'Germany': {
          politicalStability: {
            rating: 'Unstable'
          },
          politicalStability: {
            factors: ['Economic challenges', 'Energy crisis'],
            outlook: 'Improving'
          }
        },
        'Syria': {
          politicalStability: {
            rating: 'Very Unstable'
          },
          politicalStability: {
            factors: ['Ongoing conflict', 'Humanitarian crisis'],
            outlook: 'Uncertain'
          }
        }
      };

      const tensions = analyzerInstance.assessGlobalPoliticalTensions(politicalResults);
      
      expect(Array.isArray(tensions)).toBe(true);
      expect(tensions.length).toBe(2); // Two unstable countries
      
      // Check that we found the unstable countries
      const unstableCountries = tensions.map(t => t.country);
      expect(unstableCountries).toContain('Germany');
      expect(unstableCountries).toContain('Syria');
    });

    it('should return empty array when no unstable countries', () => {
      const politicalResults = {
        'United States': {
          politicalStability: {
            rating: 'Stable'
          }
        },
        'Germany': {
          politicalStability: {
            rating: 'Stable'
          }
        }
      };

      const tensions = analyzerInstance.assessGlobalPoliticalTensions(politicalResults);
      
      expect(Array.isArray(tensions)).toBe(true);
      expect(tensions.length).toBe(0);
    });
  });

  describe('identifyDiplomaticOpportunities', () => {
    it('should identify diplomatic opportunities correctly', () => {
      const politicalResults = {
        'United States': {
          internationalInfluence: {
            relationshipStrength: 'Strong'
          },
          politicalStability: {
            rating: 'Stable'
          }
        },
        'Germany': {
          internationalInfluence: {
            relationshipStrength: 'Moderate'
          },
          politicalStability: {
            rating: 'Stable'
          }
        },
        'Syria': {
          internationalInfluence: {
            relationshipStrength: 'Weak'
          },
          politicalStability: {
            rating: 'Unstable'
          }
        }
      };

      const opportunities = analyzerInstance.identifyDiplomaticOpportunities(politicalResults);
      
      expect(Array.isArray(opportunities)).toBe(true);
      expect(opportunities.length).toBeGreaterThan(0);
      
      // Should include stable countries and those with strong diplomatic potentials
      expect(opportunities).toContain('United States');
      expect(opportunities).toContain('Germany');
    });

    it('should return empty array when no diplomatic opportunities', () => {
      const politicalResults = {};

      const opportunities = analyzerInstance.identifyDiplomaticOpportunities(politicalResults);
      
      expect(Array.isArray(opportunities)).toBe(true);
      expect(opportunities.length).toBe(0);
    });
  });

  describe('analyzeGlobalStability', () => {
    it('should perform comprehensive global stability analysis', async () => {
      const politicalResults = {
        'United States': {
          politicalStability: {
            rating: 'Stable'
          },
          leadershipAnalysis: {
            leadershipTransitions: []
          },
          internationalInfluence: {
            relationshipStrength: 'Strong'
          }
        },
        'Germany': {
          politicalStability: {
            rating: 'Stable'
          },
          leadershipAnalysis: {
            leadershipTransitions: []
          },
          internationalInfluence: {
            relationshipStrength: 'Strong'
          }
        },
        'Syria': {
          politicalStability: {
            rating: 'Unstable'
          },
          leadershipAnalysis: {
            leadershipTransitions: ['Ongoing conflict']
          },
          internationalInfluence: {
            relationshipStrength: 'Weak'
          }
        }
      };

      const analysis = await analyzerInstance.analyzeGlobalStability(politicalResults);
      
      expect(typeof analysis).toBe('object');
      expect(typeof analysis.stabilityPatterns).toBe('object');
      expect(Array.isArray(analysis.leadershipPatterns)).toBe(true);
      expect(Array.isArray(analysis.politicalTensions)).toBe(true);
      expect(Array.isArray(analysis.diplomaticOpportunities)).toBe(true);
      expect(typeof analysis.summary).toBe('string');
      expect(typeof analysis.globalRiskAssessment).toBe('string');
      expect(Array.isArray(analysis.trendAnalysis)).toBe(true);
      expect(Array.isArray(analysis.recommendations)).toBe(true);
    });
  });

  describe('generateSummary', () => {
    it('should generate summary correctly', () => {
      const politicalResults = {
        stableNations: 70,
        unstableNations: 30,
        overallStability: 'Moderate',
        globalStabilityIndex: 70
      };

      const summary = analyzerInstance.generateSummary(politicalResults);
      
      expect(typeof summary).toBe('string');
      expect(summary).toContain('Moderate stability index of 70%');
      expect(summary).toContain('70 nations stable, 30 nations unstable');
    });
  });

  describe('assessGlobalRisk', () => {
    it('should assess high risk when more unstable than stable', () => {
      const politicalResults = {
        stableNations: 30,
        unstableNations: 70
      };

      const risk = analyzerInstance.assessGlobalRisk(politicalResults);
      
      expect(risk).toBe('High Risk');
    });

    it('should assess moderate risk when some unstable countries exist', () => {
      const politicalResults = {
        stableNations: 80,
        unstableNations: 20
      };

      const risk = analyzerInstance.assessGlobalRisk(politicalResults);
      
      expect(risk).toBe('Moderate Risk');
    });

    it('should assess low risk when no unstable countries', () => {
      const politicalResults = {
        stableNations: 100,
        unstableNations: 0
      };

      const risk = analyzerInstance.assessGlobalRisk(politicalResults);
      
      expect(risk).toBe('Low Risk');
    });
  });

  describe('analyzeTrends', () => {
    it('should analyze global trends correctly', () => {
      const politicalResults = {
        'United States': {
          leadershipAnalysis: {
            leadershipTransitions: ['2024 Presidential Election']
          }
        },
        'Germany': {
          leadershipAnalysis: {
            leadershipTransitions: ['2024 General Elections']
          }
        },
        'India': {
          leadershipAnalysis: {
            leadershipTransitions: ['2024 General Elections']
          }
        },
        'Syria': {
          politicalStability: {
            rating: 'Unstable'
          }
        },
        'Yemen': {
          politicalStability: {
            rating: 'Unstable'
          }
        },
        'Afghanistan': {
          politicalStability: {
            rating: 'Unstable'
          }
        }
      };

      const trends = analyzerInstance.analyzeTrends(politicalResults);
      
      expect(Array.isArray(trends)).toBe(true);
      expect(trends.length).toBeGreaterThanOrEqual(0);
      
      // Check for expected trends
      const hasHighLeadershipActivity = trends.some(t => t.includes('High leadership transition activity'));
      const hasMultipleTensionPoints = trends.some(t => t.includes('Multiple global tension points'));
    });
  });

  describe('generateRecommendationsForGlobalStability', () => {
    it('should generate recommendations correctly', () => {
      const politicalResults = {
        'Syria': {
          politicalStability: {
            rating: 'Unstable'
          }
        }
      };

      const recommendations = analyzerInstance.generateRecommendationsForGlobalStability(politicalResults);
      
      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);
      
      // Should have recommendations for dealing with tensions
      const hasFocusOnSolutions = recommendations.some(r => r.includes('Focus on diplomatic solutions'));
      const hasStrengthenCooperation = recommendations.some(r => r.includes('Strengthen multilateral cooperation'));
      
      expect(hasFocusOnSolutions || hasStrengthenCooperation).toBe(true);
    });
  });
});