// tests/unit/services/astrology/dailyHoroscopeService.test.js
// Unit tests for DailyHoroscopeService

const DailyHoroscopeService = require('src/core/services/dailyHoroscopeService');

describe('DailyHoroscopeService', () => {
  let service;

  beforeEach(() => {
    service = new DailyHoroscopeService();
  });

  describe('validate', () => {
    it('should validate valid input data', () => {
      const data = {
        birthDate: '15/03/1990',
        birthTime: '14:30',
        birthPlace: 'Mumbai, India',
        user: { id: 'user-123' }
      };

      const result = service.validate(data);
      expect(result).toBeDefined();
      expect(result.birthDate).toBe('15/03/1990');
      expect(result.birthPlace).toBe('Mumbai, India');
    });

    it('should validate data with minimal required fields', () => {
      const data = {
        birthDate: '15/03/1990',
        birthPlace: 'Mumbai, India',
        user: { id: 'user-123' }
      };

      const result = service.validate(data);
      expect(result).toBeDefined();
      expect(result.birthDate).toBe('15/03/1990');
      expect(result.birthPlace).toBe('Mumbai, India');
    });

    it('should throw error for missing data', () => {
      expect(() => service.validate(null)).toThrow('Input data is required');
    });

    it('should throw error for missing birthDate', () => {
      const data = {
        birthTime: '14:30',
        birthPlace: 'Mumbai, India',
        user: { id: 'user-123' }
      };

      expect(() => service.validate(data)).toThrow('Required field \'birthDate\' is missing or empty');
    });

    it('should throw error for missing birthPlace', () => {
      const data = {
        birthDate: '15/03/1990',
        birthTime: '14:30',
        user: { id: 'user-123' }
      };

      expect(() => service.validate(data)).toThrow('Required field \'birthPlace\' is missing or empty');
    });
  });

  describe('processCalculation', () => {
    it('should generate daily horoscope for valid data', async () => {
      const data = {
        birthDate: '15031990',
        birthTime: '1430',
        birthPlace: 'Mumbai, India',
        user: { id: 'user-123', name: 'John Doe' }
      };

      const result = await service.processCalculation(data);

      expect(result).toBeDefined();
      expect(result.prediction).toBeDefined();
      expect(result.luckyNumber).toBeDefined();
      expect(result.luckyColor).toBeDefined();
      expect(result.mood).toBeDefined();
      expect(result.health).toBeDefined();
      expect(result.love).toBeDefined();
      expect(result.career).toBeDefined();
      expect(result.finance).toBeDefined();
    });

    it('should handle birth chart without birth time', async () => {
      const data = {
        birthDate: '15031990',
        birthPlace: 'Mumbai, India',
        user: { id: 'user-456', name: 'Jane Smith' }
      };

      const result = await service.processCalculation(data);

      expect(result).toBeDefined();
      expect(result.prediction).toBeDefined();
      expect(result.luckyNumber).toBeDefined();
    });
  });

  describe('formatResult', () => {
    it('should format successful result', () => {
      const rawResult = {
        prediction: 'Today brings creative inspiration',
        luckyNumber: 7,
        luckyColor: 'Blue',
        mood: 'Introspective',
        health: 'Focus on mental wellness',
        love: 'Deep connections possible',
        career: 'Creative projects succeed',
        finance: 'Unexpected gains'
      };

      const formatted = service.formatResult(rawResult);

      expect(formatted.success).toBe(true);
      expect(formatted.data).toBe(rawResult);
      expect(formatted.summary).toBe('Today brings creative inspiration');
      expect(formatted.metadata).toBeDefined();
      expect(formatted.metadata.serviceName).toBe('DailyHoroscopeService');
      expect(formatted.metadata.calculationType).toBe('Vedic Daily Horoscope');
      expect(formatted.metadata.timestamp).toBeDefined();
      expect(formatted.disclaimer).toContain('Daily horoscopes provide general astrological guidance');
    });

    it('should format error result', () => {
      const rawResult = {
        error: 'Invalid birth date format'
      };

      const formatted = service.formatResult(rawResult);

      expect(formatted.success).toBe(true); // ServiceTemplate always returns success: true
      expect(formatted.data).toBe(rawResult);
      expect(formatted.summary).toBe('Daily horoscope generated');
    });
  });

  describe('execute', () => {
    it('should execute complete daily horoscope workflow', async () => {
      const data = {
        birthDate: '15031990',
        birthTime: '1430',
        birthPlace: 'Mumbai, India',
        user: { id: 'user-123', name: 'John Doe' }
      };

      const result = await service.execute(data);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.prediction).toBeDefined();
      expect(result.data.luckyNumber).toBeDefined();
      expect(result.data.luckyColor).toBeDefined();
      expect(result.metadata).toBeDefined();
      expect(result.metadata.serviceName).toBe('DailyHoroscopeService');
      expect(result.disclaimer).toBeDefined();
    });

    it('should handle validation errors in execute', async () => {
      const data = {
        birthTime: '1430',
        birthPlace: 'Mumbai, India',
        user: { id: 'user-123' }
        // missing birthDate
      };

      await expect(service.execute(data)).rejects.toThrow('Birth date is required for daily horoscope generation.');
    });
  });

  describe('getMetadata', () => {
    it('should return service metadata', () => {
      const metadata = service.getMetadata();

      expect(metadata.name).toBe('DailyHoroscopeService');
      expect(metadata.version).toBe('1.0.0');
      expect(metadata.category).toBe('vedic');
      expect(metadata.methods).toEqual(
        expect.arrayContaining(['processCalculation', 'getHoroscopeForDate', 'getTodaysHoroscope', 'getWeeklyHoroscope'])
      );
      expect(metadata.description).toContain('Vedic daily horoscope prediction service');
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