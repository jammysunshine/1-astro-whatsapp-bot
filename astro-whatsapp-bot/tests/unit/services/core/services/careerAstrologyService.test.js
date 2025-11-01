// tests/unit/services/core/services/careerAstrologyService.test.js
const CareerAstrologyService = require('../../../../../src/core/services/careerAstrologyService');
const logger = require('../../../../../src/utils/logger');

// Mock dependencies
jest.mock('../../../../../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));

// Mock calculator
jest.mock('../../../../../src/core/services/calculators/CareerAstrologyCalculator', () => ({
  calculateCareerAstrologyAnalysis: jest.fn()
}));

let serviceInstance;

beforeEach(async () => {
  jest.clearAllMocks();

  serviceInstance = new CareerAstrologyService();
  await serviceInstance.initialize();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('CareerAstrologyService', () => {
  describe('constructor', () => {
    it('should initialize correctly', () => {
      expect(serviceInstance).toBeInstanceOf(CareerAstrologyService);
      expect(serviceInstance.serviceName).toBe('CareerAstrologyService');
      expect(serviceInstance.calculatorPath).toBe('./calculators/CareerAstrologyCalculator');
    });
  });

  describe('initialize', () => {
    it('should initialize successfully', async () => {
      const newService = new CareerAstrologyService();
      await expect(newService.initialize()).resolves.toBeUndefined();
      expect(logger.info).toHaveBeenCalledWith('✅ CareerAstrologyService initialized successfully');
    });

    it('should handle initialization errors', async () => {
      const mockError = new Error('Initialization failed');
      jest.spyOn(CareerAstrologyService.prototype, '__proto__', 'get').mockReturnValue({
        initialize: jest.fn().mockRejectedValue(mockError)
      });

      const newService = new CareerAstrologyService();
      await expect(newService.initialize()).rejects.toThrow('Initialization failed');
      expect(logger.error).toHaveBeenCalledWith('❌ Failed to initialize CareerAstrologyService:', mockError);
    });
  });

  describe('analyzeCareerAstrology', () => {
    const validParams = {
      birthData: {
        birthDate: '15/06/1990',
        birthTime: '14:30',
        birthPlace: 'New York, USA'
      },
      options: { deepAnalysis: true }
    };

    const mockCareerAnalysis = {
      midheavenAnalysis: 'Strong leadership potential',
      tenthHousePlanets: [{ planet: 'Sun', influence: 'Leadership qualities' }],
      careerPlanets: [{ planet: 'Mars', careerImpact: 'Action-oriented career' }],
      successPotential: 'High success potential',
      introduction: 'Career analysis summary',
      careerDirection: 'Leadership roles',
      careerTiming: [
        { event: 'Saturn Return', description: 'Career establishment phase' },
        { event: 'Jupiter Transit', description: 'Growth opportunities' }
      ]
    };

    beforeEach(() => {
      serviceInstance.calculator.calculateCareerAstrologyAnalysis.mockResolvedValue(mockCareerAnalysis);
    });

    it('should analyze career astrology successfully', async () => {
      const result = await serviceInstance.analyzeCareerAstrology(validParams);

      expect(result.success).toBe(true);
      expect(result.data.careerAnalysis).toBe(mockCareerAnalysis);
      expect(result.data.careerInsights).toBeDefined();
      expect(result.data.suitableProfessions).toBeDefined();
      expect(result.data.developmentPlan).toBeDefined();
      expect(result.data.summary).toBeDefined();
      expect(result.metadata.calculationType).toBe('career_astrology');
      expect(result.metadata.analysisDepth).toBe('comprehensive');
    });

    it('should handle calculator errors', async () => {
      serviceInstance.calculator.calculateCareerAstrologyAnalysis.mockRejectedValue(
        new Error('Analysis failed')
      );

      const result = await serviceInstance.analyzeCareerAstrology(validParams);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Analysis failed');
      expect(result.metadata.calculationType).toBe('career_astrology');
    });

    it('should validate required parameters', async () => {
      await expect(serviceInstance.analyzeCareerAstrology({})).rejects.toThrow();
    });
  });

  describe('processCalculation', () => {
    it('should delegate to mainMethod', async () => {
      const mockData = { test: 'data' };
      const mockResult = { success: true, data: mockData };

      jest.spyOn(serviceInstance, 'mainMethod').mockResolvedValue(mockResult);

      const result = await serviceInstance.processCalculation(mockData);

      expect(serviceInstance.mainMethod).toHaveBeenCalledWith(mockData);
      expect(result).toBe(mockResult);
    });
  });

  describe('getHealthStatus', () => {
    it('should return healthy status with features', async () => {
      const status = await serviceInstance.getHealthStatus();

      expect(status.status).toBe('healthy');
      expect(status.features.careerAnalysis).toBe(true);
      expect(status.features.careerTiming).toBe(true);
      expect(status.features.careerChangeAnalysis).toBe(true);
      expect(status.features.professionMatching).toBe(true);
      expect(status.features.developmentPlanning).toBe(true);
      expect(status.supportedAnalyses).toContain('career_astrology_analysis');
      expect(status.supportedAnalyses).toContain('career_timing');
    });
  });

  describe('generateCareerInsights', () => {
    it('should generate career insights from analysis', () => {
      const careerAnalysis = {
        midheavenAnalysis: 'Leadership potential',
        tenthHousePlanets: [
          { planet: 'Sun', influence: 'Leadership qualities' },
          { planet: 'Mars', influence: 'Action-oriented' }
        ],
        careerPlanets: [
          { planet: 'Jupiter', careerImpact: 'Growth opportunities' }
        ],
        successPotential: 'High potential for success'
      };

      const insights = serviceInstance.generateCareerInsights(careerAnalysis);

      expect(insights).toBeDefined();
      expect(insights.length).toBeGreaterThan(0);

      const midheavenInsight = insights.find(i => i.type === 'midheaven');
      expect(midheavenInsight).toBeDefined();
      expect(midheavenInsight.title).toBe('Career Direction');
      expect(midheavenInsight.strength).toBe('high');

      const tenthHouseInsights = insights.filter(i => i.type === 'tenth_house');
      expect(tenthHouseInsights.length).toBe(2);

      const successInsight = insights.find(i => i.type === 'success_potential');
      expect(successInsight).toBeDefined();
      expect(successInsight.strength).toBe('high');
    });

    it('should handle empty analysis', () => {
      const insights = serviceInstance.generateCareerInsights({});
      expect(insights).toEqual([]);
    });
  });

  describe('identifySuitableProfessions', () => {
    it('should identify suitable professions', () => {
      const careerAnalysis = {
        midheavenAnalysis: 'Aries leadership',
        tenthHousePlanets: [
          { planet: 'Sun' },
          { planet: 'Mars' }
        ]
      };

      const professions = serviceInstance.identifySuitableProfessions(careerAnalysis);

      expect(professions).toBeDefined();
      expect(professions.length).toBeGreaterThan(0);
      expect(professions.length).toBeLessThanOrEqual(10);

      professions.forEach(prof => {
        expect(prof).toHaveProperty('profession');
        expect(prof).toHaveProperty('matchScore');
        expect(prof).toHaveProperty('category');
        expect(prof.matchScore).toBeGreaterThanOrEqual(0);
        expect(prof.matchScore).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('createCareerDevelopmentPlan', () => {
    it('should create comprehensive development plan', () => {
      const careerAnalysis = {
        careerDirection: 'Leadership roles'
      };

      const plan = serviceInstance.createCareerDevelopmentPlan(careerAnalysis);

      expect(plan).toBeDefined();
      expect(plan.shortTerm).toBeDefined();
      expect(plan.mediumTerm).toBeDefined();
      expect(plan.longTerm).toBeDefined();
      expect(plan.skills).toBeDefined();
      expect(plan.challenges).toBeDefined();

      expect(plan.shortTerm.length).toBeGreaterThan(0);
      expect(plan.mediumTerm.length).toBeGreaterThan(0);
      expect(plan.longTerm.length).toBeGreaterThan(0);

      plan.shortTerm.forEach(goal => {
        expect(goal).toHaveProperty('goal');
        expect(goal).toHaveProperty('actions');
        expect(goal).toHaveProperty('timeframe');
      });
    });
  });

  describe('generateCareerSummary', () => {
    it('should generate career summary', () => {
      const careerAnalysis = {
        introduction: 'Career analysis for individual',
        careerDirection: 'Leadership and management',
        careerTiming: [
          { event: 'Saturn Return', description: 'Career establishment' },
          { event: 'Jupiter Transit', description: 'Growth phase' },
          { event: 'Mars Transit', description: 'Action phase' }
        ]
      };

      const summary = serviceInstance.generateCareerSummary(careerAnalysis);

      expect(summary).toBeDefined();
      expect(typeof summary).toBe('string');
      expect(summary).toContain('Career analysis for individual');
      expect(summary).toContain('Leadership and management');
      expect(summary).toContain('Current Career Phase:');
      expect(summary).toContain('Saturn Return');
      expect(summary).toContain('Jupiter Transit');
    });

    it('should handle missing timing data', () => {
      const careerAnalysis = {
        introduction: 'Basic analysis',
        careerDirection: 'General direction'
      };

      const summary = serviceInstance.generateCareerSummary(careerAnalysis);

      expect(summary).toContain('Basic analysis');
      expect(summary).toContain('General direction');
      expect(summary).not.toContain('Current Career Phase:');
    });
  });

  describe('analyzeTimingOpportunities', () => {
    it('should analyze timing opportunities', () => {
      const careerTiming = [
        { event: 'Saturn Return', description: 'Career establishment phase' },
        { event: 'Jupiter Transit', description: 'Growth opportunities' }
      ];
      const timeframe = 12;

      const opportunities = serviceInstance.analyzeTimingOpportunities(careerTiming, timeframe);

      expect(opportunities).toBeDefined();
      expect(opportunities.length).toBe(2);

      opportunities.forEach(opp => {
        expect(opp).toHaveProperty('type');
        expect(opp).toHaveProperty('description');
        expect(opp).toHaveProperty('timeframe');
        expect(opp).toHaveProperty('priority');
      });

      const saturnOpp = opportunities.find(o => o.type === 'Saturn Return');
      expect(saturnOpp.priority).toBe('high');
    });

    it('should handle empty timing data', () => {
      const opportunities = serviceInstance.analyzeTimingOpportunities([], 12);
      expect(opportunities).toEqual([]);
    });
  });

  describe('identifyFavorablePeriods', () => {
    it('should identify favorable periods', () => {
      const careerAnalysis = {
        successPotential: 'High success potential'
      };
      const timeframe = 6;

      const periods = serviceInstance.identifyFavorablePeriods(careerAnalysis, timeframe);

      expect(periods).toBeDefined();
      expect(periods.length).toBeGreaterThan(0);

      periods.forEach(period => {
        expect(period).toHaveProperty('period');
        expect(period).toHaveProperty('description');
        expect(period).toHaveProperty('favorability');
        expect(period).toHaveProperty('recommendations');
      });
    });
  });

  describe('assessCurrentCareerPhase', () => {
    it('should assess current career phase', () => {
      const careerAnalysis = {};

      const phase = serviceInstance.assessCurrentCareerPhase(careerAnalysis);

      expect(phase).toBeDefined();
      expect(phase).toHaveProperty('phase');
      expect(phase).toHaveProperty('description');
      expect(phase).toHaveProperty('age');
      expect(phase).toHaveProperty('focus');
    });
  });

  describe('assessCareerAlignment', () => {
    it('should assess career alignment', () => {
      const careerAnalysis = {
        careerDirection: 'Leadership and management roles'
      };
      const currentCareer = {
        field: 'Management and leadership'
      };

      const alignment = serviceInstance.assessCareerAlignment(careerAnalysis, currentCareer);

      expect(alignment).toBeDefined();
      expect(alignment).toHaveProperty('score');
      expect(alignment).toHaveProperty('strengths');
      expect(alignment).toHaveProperty('challenges');
      expect(alignment).toHaveProperty('recommendations');
      expect(alignment.score).toBeGreaterThanOrEqual(0);
      expect(alignment.score).toBeLessThanOrEqual(100);
    });
  });

  describe('identifyChangeOpportunities', () => {
    it('should identify change opportunities', () => {
      const careerAnalysis = {
        careerTiming: [
          { event: 'Career change opportunity', description: 'Time for transition' }
        ]
      };
      const alignmentAssessment = { score: 30 };

      const opportunities = serviceInstance.identifyChangeOpportunities(careerAnalysis, alignmentAssessment);

      expect(opportunities).toBeDefined();
      expect(opportunities.length).toBeGreaterThan(0);

      opportunities.forEach(opp => {
        expect(opp).toHaveProperty('type');
        expect(opp).toHaveProperty('description');
        expect(opp).toHaveProperty('urgency');
      });
    });
  });

  describe('generateTransitionPlan', () => {
    it('should generate transition plan', () => {
      const careerAnalysis = {};
      const changeOpportunities = [];

      const plan = serviceInstance.generateTransitionPlan(careerAnalysis, changeOpportunities);

      expect(plan).toBeDefined();
      expect(plan).toHaveProperty('preparation');
      expect(plan).toHaveProperty('transition');
      expect(plan).toHaveProperty('establishment');

      expect(plan.preparation.length).toBeGreaterThan(0);
      expect(plan.transition.length).toBeGreaterThan(0);
      expect(plan.establishment.length).toBeGreaterThan(0);
    });
  });

  describe('extractMCSign', () => {
    it('should extract Midheaven sign from analysis', () => {
      expect(serviceInstance.extractMCSign('Strong Aries leadership')).toBe('Aries');
      expect(serviceInstance.extractMCSign('Capricorn career focus')).toBe('Capricorn');
      expect(serviceInstance.extractMCSign('Pisces creative work')).toBe('Pisces');
    });

    it('should return Unknown for no sign found', () => {
      expect(serviceInstance.extractMCSign('No zodiac signs here')).toBe('Unknown');
    });
  });

  describe('getProfessionsForSign', () => {
    it('should return professions for zodiac signs', () => {
      expect(serviceInstance.getProfessionsForSign('Aries')).toContain('Entrepreneur');
      expect(serviceInstance.getProfessionsForSign('Taurus')).toContain('Banking');
      expect(serviceInstance.getProfessionsForSign('Leo')).toContain('Management');
    });

    it('should return default professions for unknown signs', () => {
      const professions = serviceInstance.getProfessionsForSign('Unknown');
      expect(professions).toEqual(['General business', 'Service industry']);
    });
  });

  describe('getProfessionsForPlanet', () => {
    it('should return professions for planets', () => {
      expect(serviceInstance.getProfessionsForPlanet('Sun')).toContain('Leadership');
      expect(serviceInstance.getProfessionsForPlanet('Moon')).toContain('Healthcare');
      expect(serviceInstance.getProfessionsForPlanet('Mars')).toContain('Military');
    });

    it('should return default professions for unknown planets', () => {
      const professions = serviceInstance.getProfessionsForPlanet('Unknown');
      expect(professions).toEqual(['Business', 'Service industry']);
    });
  });

  describe('calculateProfessionMatch', () => {
    it('should calculate profession match score', () => {
      const careerAnalysis = {
        careerDirection: 'Leadership roles',
        successPotential: 'High success potential'
      };

      const score = serviceInstance.calculateProfessionMatch('CEO', careerAnalysis);
      expect(score).toBeGreaterThanOrEqual(50);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('categorizeProfession', () => {
    it('should categorize professions correctly', () => {
      expect(serviceInstance.categorizeProfession('CEO')).toBe('Leadership');
      expect(serviceInstance.categorizeProfession('Software Engineer')).toBe('Technical');
      expect(serviceInstance.categorizeProfession('Artist')).toBe('Creative');
      expect(serviceInstance.categorizeProfession('Doctor')).toBe('Service');
      expect(serviceInstance.categorizeProfession('Accountant')).toBe('Business');
    });

    it('should return General for uncategorized professions', () => {
      expect(serviceInstance.categorizeProfession('Unknown Profession')).toBe('General');
    });
  });

  describe('identifyKeySkills', () => {
    it('should identify key skills from career analysis', () => {
      const careerAnalysis = {
        careerPlanets: [
          { planet: 'Sun' },
          { planet: 'Mercury' }
        ]
      };

      const skills = serviceInstance.identifyKeySkills(careerAnalysis);

      expect(skills).toBeDefined();
      expect(skills.length).toBeGreaterThan(0);
      expect(skills.length).toBeLessThanOrEqual(8);
      expect(skills).toContain('Leadership');
      expect(skills).toContain('Communication');
    });
  });

  describe('identifyCareerChallenges', () => {
    it('should identify career challenges', () => {
      const careerAnalysis = {
        successPotential: 'Some challenges but good potential with effort'
      };

      const challenges = serviceInstance.identifyCareerChallenges(careerAnalysis);

      expect(challenges).toBeDefined();
      expect(challenges.length).toBeGreaterThan(0);

      challenges.forEach(challenge => {
        expect(challenge).toHaveProperty('challenge');
        expect(challenge).toHaveProperty('strategy');
      });
    });
  });

  describe('mainMethod', () => {
    it('should execute main calculation method', async () => {
      const params = {
        birthData: {
          birthDate: '15/06/1990',
          birthTime: '14:30',
          birthPlace: 'New York, USA'
        }
      };

      const mockResult = { careerAnalysis: 'mock data' };
      serviceInstance.calculator.calculateCareerAstrologyAnalysis.mockResolvedValue(mockResult);

      const result = await serviceInstance.mainMethod(params);

      expect(result.success).toBe(true);
      expect(result.data).toBe(mockResult);
      expect(result.metadata.calculationType).toBe('career_astrology');
    });

    it('should handle errors in main method', async () => {
      const params = { birthData: {} };
      serviceInstance.calculator.calculateCareerAstrologyAnalysis.mockRejectedValue(
        new Error('Calculation failed')
      );

      const result = await serviceInstance.mainMethod(params);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Calculation failed');
    });
  });
});