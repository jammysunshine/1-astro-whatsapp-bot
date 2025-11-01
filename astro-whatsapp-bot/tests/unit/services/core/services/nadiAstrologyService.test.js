// tests/unit/services/astrology/nadiReader.test.js
// Unit tests for Nadi astrology reading service

const NadiAstrologyService = require('../../../../src/core/services/nadiAstrologyService');

describe('NadiAstrologyService', () => {
  let service;

  beforeEach(() => {
    service = new NadiAstrologyService();
  });

  describe('processCalculation', () => {
    it('should generate a Nadi astrology reading', async () => {
      const birthData = {
        birthDate: '15/03/1990',
        birthPlace: 'Chennai'
      };
      const reading = await service.processCalculation(birthData);

      expect(reading).toBeDefined();
      expect(typeof reading).toBe('object');
      expect(reading.nadiType).toBeDefined();
      expect(reading.dasaPeriods).toBeDefined();
      expect(reading.remedies).toBeDefined();
      expect(reading.interpretation).toBeDefined();
    });

    it('should handle missing birth date', async () => {
      const birthData = { birthPlace: 'Chennai' };
      await expect(service.processCalculation(birthData)).rejects.toThrow('Birth date is required');
    });

    it('should provide Dasa period calculations', async () => {
      const birthData = {
        birthDate: '10/12/1992',
        birthPlace: 'Delhi'
      };
      const reading = await service.processCalculation(birthData);

      expect(reading.dasaPeriods).toBeDefined();
      expect(Array.isArray(reading.dasaPeriods)).toBe(true);
      expect(reading.dasaPeriods.length).toBeGreaterThan(0);
    });

    it('should include traditional Nadi remedies', async () => {
      const birthData = {
        birthDate: '25/05/1988',
        birthPlace: 'Bangalore'
      };
      const reading = await service.processCalculation(birthData);

      expect(reading.remedies).toBeDefined();
      expect(Array.isArray(reading.remedies)).toBe(true);
      expect(reading.remedies.length).toBeGreaterThan(0);
    });
  });
});