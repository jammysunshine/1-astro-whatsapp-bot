// tests/unit/services/core/services/tarotReadingService.test.js
// Unit tests for TarotReadingService

const TarotReadingService = require('../../../../src/core/services/tarotReadingService');
const logger = require('../../../../src/utils/logger');

// Mock logger to prevent console output during tests
beforeEach(() => {
  jest.spyOn(logger, 'info').mockImplementation(() => {});
  jest.spyOn(logger, 'error').mockImplementation(() => {});
  jest.spyOn(logger, 'warn').mockImplementation(() => {});
  jest.spyOn(logger, 'debug').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks(); // Restore all mocks after each test
});

describe('TarotReadingService', () => {
  let service;

  beforeEach(async () => {
    service = new TarotReadingService();
    // If the service has an initialize method, call it here
    if (service.initialize) {
      await service.initialize();
    }
  });

  describe('validate', () => {
    it('should validate valid input data', () => {
      const data = {
        user: { id: 'user-123', birthDate: '15/03/1990' },
        spreadType: 'single'
      };

      expect(() => service.validate(data)).not.toThrow();
      expect(service.validate(data)).toBe(true);
    });

    it('should validate data without spreadType', () => {
      const data = {
        user: { id: 'user-123', birthDate: '15/03/1990' }
      };

      expect(() => service.validate(data)).not.toThrow();
      expect(service.validate(data)).toBe(true);
    });

    it('should throw error for missing data', () => {
      expect(() => service.validate(null)).toThrow('Input data is required for tarot reading');
      expect(() => service.validate(undefined)).toThrow('Input data is required for tarot reading');
    });

    it('should throw error for invalid spreadType', () => {
      const data = {
        user: { id: 'user-123', birthDate: '15/03/1990' },
        spreadType: 123
      };

      expect(() => service.validate(data)).toThrow('Spread type must be a string');
    });
  });

  describe('processCalculation', () => {
    it('should process single card reading', async () => {
      const data = {
        user: { id: 'user-123', birthDate: '15/03/1990' },
        spreadType: 'single'
      };

      const result = await service.processCalculation(data);

      expect(result).toBeDefined();
      expect(result.type).toBe('single');
      expect(result.cards).toHaveLength(1);
      expect(result.interpretation).toBeDefined();
      expect(result.advice).toBeDefined();
    });

    it('should process three-card spread reading', async () => {
      const data = {
        user: { id: 'user-456', birthDate: '20/07/1985' },
        spreadType: 'three-card'
      };

      const result = await service.processCalculation(data);

      expect(result).toBeDefined();
      expect(result.type).toBe('three-card');
      expect(result.cards).toHaveLength(3);
      expect(result.interpretation).toBeDefined();
      expect(result.advice).toBeDefined();
    });

    it('should default to single card when no spreadType provided', async () => {
      const data = {
        user: { id: 'user-789', birthDate: '10/12/1992' }
      };

      const result = await service.processCalculation(data);

      expect(result).toBeDefined();
      expect(result.type).toBe('single');
      expect(result.cards).toHaveLength(1);
    });
  });

  describe('formatResult', () => {
    it('should format successful result', () => {
      const rawResult = {
        type: 'single',
        cards: [{ name: 'The Fool', suit: 'Major Arcana' }],
        interpretation: 'New beginnings await',
        advice: 'Take a leap of faith',
        personalized: true,
        userSign: 'Pisces'
      };

      const formatted = service.formatResult(rawResult);

      expect(formatted.success).toBe(true);
      expect(formatted.type).toBe('single');
      expect(formatted.cards).toHaveLength(1);
      expect(formatted.interpretation).toBe('New beginnings await');
      expect(formatted.advice).toBe('Take a leap of faith');
      expect(formatted.personalized).toBe(true);
      expect(formatted.userSign).toBe('Pisces');
      expect(formatted.timestamp).toBeDefined();
    });

    it('should format error result', () => {
      const rawResult = {
        error: 'Invalid spread type',
        type: 'invalid'
      };

      const formatted = service.formatResult(rawResult);

      expect(formatted.success).toBe(false);
      expect(formatted.error).toBe('Invalid spread type');
      expect(formatted.type).toBe('invalid');
      expect(formatted.cards).toEqual([]);
      expect(formatted.interpretation).toBe('');
      expect(formatted.advice).toBe('');
    });
  });

  describe('execute', () => {
    it('should execute complete tarot reading workflow', async () => {
      const data = {
        user: { id: 'user-123', birthDate: '15/03/1990' },
        spreadType: 'single'
      };

      const result = await service.execute(data);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.type).toBe('single');
      expect(result.cards).toHaveLength(1);
      expect(result.interpretation).toBeDefined();
      expect(result.advice).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });

    it('should handle validation errors in execute', async () => {
      const data = null;

      await expect(service.execute(data)).rejects.toThrow('Input data is required for tarot reading');
    });
  });

  describe('getMetadata', () => {
    it('should return service metadata', () => {
      const metadata = service.getMetadata();

      expect(metadata.name).toBe('TarotReadingService');
      expect(metadata.category).toBe('divination');
      expect(metadata.description).toContain('tarot card readings');
      expect(metadata.version).toBe('1.0.0');
      expect(metadata.supportedSpreads).toEqual(['single', 'three', 'three-card']);
      expect(metadata.status).toBe('active');
    });
  });

  describe('getHealthStatus', () => {
    it('should return healthy status when service is working', async () => {
      const health = await service.getHealthStatus();

      expect(health.status).toBe('healthy');
      expect(health.timestamp).toBeDefined();
    });
  });
});