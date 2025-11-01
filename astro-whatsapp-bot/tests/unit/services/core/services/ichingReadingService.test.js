// tests/unit/services/astrology/ichingReader.test.js
// Unit tests for I Ching Reader

const IChingReadingService = require('src/core/services/ichingReadingService');

// Mock dependencies
const logger = require('src/utils/logger');

let ichingReadingServiceInstance;

beforeEach(async () => {
  jest.spyOn(logger, 'info').mockImplementation(() => {});
  jest.spyOn(logger, 'error').mockImplementation(() => {});
  jest.spyOn(logger, 'warn').mockImplementation(() => {});
  jest.spyOn(logger, 'debug').mockImplementation(() => {});

  ichingReadingServiceInstance = new IChingReadingService();
  await ichingReadingServiceInstance.initialize();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('IChingReadingService', () => {
  describe('generateIChingReading', () => {
    it('should generate I Ching reading for valid question', async () => {
      const question = 'What is my path?';

      const result = await ichingReadingServiceInstance.generateIChingReading({ question });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.question).toBe(question);
      expect(result.data.primaryHexagram).toBeDefined();
      expect(result.data.interpretation).toBeDefined();
      expect(result.data.ichingDescription).toBeDefined();
    });

    it('should generate I Ching reading without a question (general guidance)', async () => {
      const result = await ichingReadingServiceInstance.generateIChingReading({ question: 'General guidance' });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.question).toBe('General guidance');
      expect(result.data.primaryHexagram).toBeDefined();
      expect(result.data.interpretation).toBeDefined();
      expect(result.data.ichingDescription).toBeDefined();
    });

    it('should handle errors during reading generation', async () => {
      jest.spyOn(ichingReadingServiceInstance.ichingService.interpreter, 'generateIChingReading').mockImplementation(() => {
        throw new Error('Test error from interpreter');
      });

      const result = await ichingReadingServiceInstance.generateIChingReading({ question: 'Test question' });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('Test error from interpreter');
    });

    it('should return error if question is missing', async () => {
      const result = await ichingReadingServiceInstance.generateIChingReading({});
      expect(result.success).toBe(false);
      expect(result.error).toContain('Question is required');
    });
  });

  describe('getDailyIChingGuidance', () => {
    it('should generate daily I Ching guidance', async () => {
      const focus = 'daily focus';
      const result = await ichingReadingServiceInstance.getDailyIChingGuidance({ focus });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.question).toBe(focus);
      expect(result.data.primaryHexagram).toBeDefined();
      expect(result.data.interpretation).toBeDefined();
    });

    it('should generate daily I Ching guidance without specific focus', async () => {
      const result = await ichingReadingServiceInstance.getDailyIChingGuidance({});

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.question).toBe('daily wisdom');
    });
  });

  describe('getHexagramInterpretation', () => {
    it('should return interpretation for a valid hexagram number', async () => {
      const hexagramNumber = 1;
      const result = await ichingReadingServiceInstance.getHexagramInterpretation({ hexagramNumber });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.number).toBe(hexagramNumber);
      expect(result.data.name).toBe('The Creative');
      expect(result.data.judgment).toBeDefined();
    });

    it('should return error for missing hexagram number', async () => {
      const result = await ichingReadingServiceInstance.getHexagramInterpretation({});
      expect(result.success).toBe(false);
      expect(result.error).toContain('Hexagram number is required');
    });

    it('should return error for invalid hexagram number (out of range)', async () => {
      const result = await ichingReadingServiceInstance.getHexagramInterpretation({ hexagramNumber: 0 });
      expect(result.success).toBe(false);
      expect(result.error).toContain('Hexagram number must be between 1 and 64');

      const result2 = await ichingReadingServiceInstance.getHexagramInterpretation({ hexagramNumber: 65 });
      expect(result2.success).toBe(false);
      expect(result2.error).toContain('Hexagram number must be between 1 and 64');
    });
  });

  describe('getQuickIChingReading', () => {
    it('should generate a quick I Ching reading summary', async () => {
      const question = 'How will my day be?';
      const result = await ichingReadingServiceInstance.getQuickIChingReading({ question });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.hexagram).toBeDefined();
      expect(result.data.summary).toBeDefined();
    });

    it('should return error if question is missing for quick reading', async () => {
      const result = await ichingReadingServiceInstance.getQuickIChingReading({});
      expect(result.success).toBe(false);
      expect(result.error).toContain('Question is required');
    });
  });

  describe('getTrigramInfo', () => {
    it('should return information for a valid trigram number', async () => {
      const trigramNumber = 0;
      const result = await ichingReadingServiceInstance.getTrigramInfo({ trigramNumber });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.trigramNumber).toBe(trigramNumber);
      expect(result.data.name).toBe('Heaven');
      expect(result.data.meaning).toBeDefined();
    });

    it('should return error for missing trigram number', async () => {
      const result = await ichingReadingServiceInstance.getTrigramInfo({});
      expect(result.success).toBe(false);
      expect(result.error).toContain('Trigram number is required');
    });

    it('should return error for invalid trigram number (out of range)', async () => {
      const result = await ichingReadingServiceInstance.getTrigramInfo({ trigramNumber: -1 });
      expect(result.success).toBe(false);
      expect(result.error).toContain('Trigram number must be between 0 and 7');

      const result2 = await ichingReadingServiceInstance.getTrigramInfo({ trigramNumber: 8 });
      expect(result2.success).toBe(false);
      expect(result2.error).toContain('Trigram number must be between 0 and 7');
    });
  });

  describe('createHexagramKeyFromNumber', () => {
    it('should return a string key for a given hexagram number', () => {
      const hexagramNumber = 1;
      const key = ichingReadingServiceInstance.createHexagramKeyFromNumber(hexagramNumber);
      expect(typeof key).toBe('string');
      expect(key).toBe('666666');
    });
  });

  describe('createLinesFromHexagramNumber', () => {
    it('should return an array of 6 line values for a given hexagram number', () => {
      const hexagramNumber = 1;
      const lines = ichingReadingServiceInstance.createLinesFromHexagramNumber(hexagramNumber);
      expect(Array.isArray(lines)).toBe(true);
      expect(lines.length).toBe(6);
      expect(lines).toEqual([8, 8, 8, 8, 8, 8]);
    });

    it('should correctly convert hexagram 64 to lines', () => {
      const hexagramNumber = 64;
      const lines = ichingReadingServiceInstance.createLinesFromHexagramNumber(hexagramNumber);
      expect(lines).toEqual([7, 7, 7, 7, 7, 7]);
    });
  });

  describe('processCalculation', () => {
    it('should call generateIChingReading', async () => {
      const spy = jest.spyOn(ichingReadingServiceInstance, 'generateIChingReading');
      const params = { question: 'Test processCalculation' };
      await ichingReadingServiceInstance.processCalculation(params);
      expect(spy).toHaveBeenCalledWith(params);
    });
  });

  describe('getHealthStatus', () => {
    it('should return a healthy status when everything is operational', async () => {
      const status = await ichingReadingServiceInstance.getHealthStatus();
      expect(status.status).toBe('healthy');
      expect(status.features.ichingReading).toBe(true);
      expect(status.supportedCalculations).toContain('iching_reading');
    });

    it('should return an unhealthy status if initialization fails', async () => {
      jest.spyOn(ichingReadingServiceInstance.ichingService, 'healthCheck').mockImplementation(() => {
        throw new Error('IChingService is down');
      });

      const status = await ichingReadingServiceInstance.getHealthStatus();
      expect(status.status).toBe('unhealthy');
      expect(status.error).toContain('IChingService is down');
    });
  });

  describe('getMetadata', () => {
    it('should return correct metadata', () => {
      const metadata = ichingReadingServiceInstance.getMetadata();
      expect(metadata.name).toBe('IChingReadingService');
      expect(metadata.category).toBe('divination');
      expect(metadata.methods).toContain('generateIChingReading');
    });
  });

  describe('getHelp', () => {
    it('should return help information string', () => {
      const help = ichingReadingServiceInstance.getHelp();
      expect(typeof help).toBe('string');
      expect(help).toContain('I Ching Reading Service');
      expect(help).toContain('Purpose:');
    });
  });
});