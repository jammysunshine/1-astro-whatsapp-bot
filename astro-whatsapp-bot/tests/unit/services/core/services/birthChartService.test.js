// tests/unit/services/astrology/birthChartService.test.js
// Unit tests for BirthChartService

const BirthChartService = require('../../../../src/core/services/birthChartService');

describe('BirthChartService', () => {
  let service;

  beforeEach(() => {
    service = new BirthChartService();
  });

  describe('validate', () => {
    it('should validate valid birth data', () => {
      const data = {
        birthDate: '15031990',
        birthTime: '1430',
        birthPlace: 'Mumbai, India',
        user: { id: 'user-123' }
      };

      expect(() => service.validate(data)).not.toThrow();
      expect(service.validate(data)).toBe(true);
    });

    it('should validate data with minimal required fields', () => {
      const data = {
        birthDate: '15031990',
        birthPlace: 'Mumbai, India',
        user: { id: 'user-123' }
      };

      expect(() => service.validate(data)).not.toThrow();
      expect(service.validate(data)).toBe(true);
    });

    it('should throw error for missing birthDate', () => {
      const data = {
        birthTime: '1430',
        birthPlace: 'Mumbai, India',
        user: { id: 'user-123' }
      };

      expect(() => service.validate(data)).toThrow('Birth date is required for birth chart calculation');
    });

    it('should throw error for missing birthPlace', () => {
      const data = {
        birthDate: '15031990',
        birthTime: '1430',
        user: { id: 'user-123' }
      };

      expect(() => service.validate(data)).toThrow('Birth place is required for birth chart calculation');
    });

    it('should throw error for missing user', () => {
      const data = {
        birthDate: '15031990',
        birthTime: '1430',
        birthPlace: 'Mumbai, India'
      };

      expect(() => service.validate(data)).toThrow('User data is required for birth chart calculation');
    });
  });

  describe('processCalculation', () => {
    it('should generate birth chart for valid data', async () => {
      const data = {
        birthDate: '15031990',
        birthTime: '1430',
        birthPlace: 'Mumbai, India',
        user: { id: 'user-123', name: 'John Doe' }
      };

      const result = await service.processCalculation(data);

      expect(result).toBeDefined();
      expect(result.planets).toBeDefined();
      expect(result.houses).toBeDefined();
      expect(result.aspects).toBeDefined();
      expect(result.sunSign).toBeDefined();
      expect(result.moonSign).toBeDefined();
      expect(result.risingSign).toBeDefined();
    });

    it('should handle birth chart without birth time', async () => {
      const data = {
        birthDate: '15031990',
        birthPlace: 'Mumbai, India',
        user: { id: 'user-456', name: 'Jane Smith' }
      };

      const result = await service.processCalculation(data);

      expect(result).toBeDefined();
      expect(result.planets).toBeDefined();
      expect(result.houses).toBeDefined();
      expect(result.aspects).toBeDefined();
    });

    it('should calculate accurate planetary positions', async () => {
      const data = {
        birthDate: '15031990', // March 15, 1990
        birthTime: '1430', // 2:30 PM
        birthPlace: 'Mumbai, India',
        user: { id: 'user-test', name: 'Test User' }
      };

      const result = await service.processCalculation(data);

      expect(result).toBeDefined();
      expect(result.sunSign).toBe('Pisces'); // Sun in Pisces on March 15
      expect(result.planets).toBeInstanceOf(Array);
      expect(result.planets.length).toBeGreaterThan(0);
    });
  });

  describe('formatResult', () => {
    it('should format successful birth chart result', () => {
      const rawResult = {
        sunSign: 'Pisces',
        moonSign: 'Cancer',
        risingSign: 'Sagittarius',
        planets: [
          { name: 'Sun', sign: 'Pisces', degree: 24.5 },
          { name: 'Moon', sign: 'Cancer', degree: 12.3 }
        ],
        houses: [
          { number: 1, sign: 'Sagittarius', degree: 15.2 },
          { number: 2, sign: 'Capricorn', degree: 8.7 }
        ],
        aspects: [
          { planet1: 'Sun', planet2: 'Moon', aspect: 'trine', orb: 1.2 }
        ]
      };

      const formatted = service.formatResult(rawResult);

      expect(formatted.success).toBe(true);
      expect(formatted.chart).toBeDefined();
      expect(formatted.chart.sunSign).toBe('Pisces');
      expect(formatted.chart.moonSign).toBe('Cancer');
      expect(formatted.chart.risingSign).toBe('Sagittarius');
      expect(formatted.chart.planets).toHaveLength(2);
      expect(formatted.chart.houses).toHaveLength(2);
      expect(formatted.chart.aspects).toHaveLength(1);
      expect(formatted.timestamp).toBeDefined();
    });

    it('should format error result', () => {
      const rawResult = {
        error: 'Invalid birth date format'
      };

      const formatted = service.formatResult(rawResult);

      expect(formatted.success).toBe(false);
      expect(formatted.error).toBe('Invalid birth date format');
      expect(formatted.chart).toBeUndefined();
    });
  });

  describe('execute', () => {
    it('should execute complete birth chart workflow', async () => {
      const data = {
        birthDate: '15031990',
        birthTime: '1430',
        birthPlace: 'Mumbai, India',
        user: { id: 'user-123', name: 'John Doe' }
      };

      const result = await service.execute(data);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.chart).toBeDefined();
      expect(result.chart.sunSign).toBeDefined();
      expect(result.chart.planets).toBeDefined();
      expect(result.chart.houses).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });

    it('should handle validation errors in execute', async () => {
      const data = {
        birthTime: '1430',
        birthPlace: 'Mumbai, India',
        user: { id: 'user-123' }
        // missing birthDate
      };

      await expect(service.execute(data)).rejects.toThrow('Birth date is required for birth chart calculation');
    });
  });

  describe('getMetadata', () => {
    it('should return service metadata', () => {
      const metadata = service.getMetadata();

      expect(metadata.name).toBe('BirthChartService');
      expect(metadata.category).toBe('astrology');
      expect(metadata.description).toContain('birth chart');
      expect(metadata.version).toBe('1.0.0');
      expect(metadata.supportedCalculations).toEqual(
        expect.arrayContaining(['planets', 'houses', 'aspects'])
      );
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
