// tests/unit/services/astrology/nadiReader.test.js
// Unit tests for Nadi astrology reading service

const { generateNadiReading } = require('services/astrology/nadiReader');

describe('Nadi Reader Service', () => {
  describe('generateNadiReading', () => {
    it('should generate a Nadi astrology reading', () => {
      const user = { id: 'user-123', birthDate: '15/03/1990', birthPlace: 'Chennai' };
      const reading = generateNadiReading(user);

      expect(reading).toBeDefined();
      expect(reading.nadiType).toBeDefined();
      expect(reading.dasaPeriods).toBeDefined();
      expect(reading.remedies).toBeDefined();
      expect(reading.predictions).toBeDefined();
      expect(reading.interpretation).toBeDefined();
    });

    it('should determine Nadi type based on birth details', () => {
      const user = { id: 'user-456', birthDate: '20/07/1985', birthPlace: 'Mumbai' };
      const reading = generateNadiReading(user);

      expect(['Adi', 'Madhya', 'Antya'].includes(reading.nadiType)).toBe(true);
      expect(reading.interpretation).toContain(reading.nadiType);
    });

    it('should provide Dasa period calculations', () => {
      const user = { id: 'user-789', birthDate: '10/12/1992', birthPlace: 'Delhi' };
      const reading = generateNadiReading(user);

      expect(reading.dasaPeriods).toBeDefined();
      expect(Array.isArray(reading.dasaPeriods)).toBe(true);
      expect(reading.dasaPeriods.length).toBeGreaterThan(0);

      const firstDasa = reading.dasaPeriods[0];
      expect(firstDasa.planet).toBeDefined();
      expect(firstDasa.startDate).toBeDefined();
      expect(firstDasa.endDate).toBeDefined();
      expect(firstDasa.effects).toBeDefined();
    });

    it('should include traditional Nadi remedies', () => {
      const user = { id: 'user-111', birthDate: '25/05/1988', birthPlace: 'Bangalore' };
      const reading = generateNadiReading(user);

      expect(reading.remedies).toBeDefined();
      expect(Array.isArray(reading.remedies)).toBe(true);
      expect(reading.remedies.length).toBeGreaterThan(0);

      reading.remedies.forEach(remedy => {
        expect(remedy.type).toBeDefined();
        expect(remedy.description).toBeDefined();
      });
    });

    it('should provide life predictions based on Nadi', () => {
      const user = { id: 'user-222', birthDate: '05/09/1995', birthPlace: 'Hyderabad' };
      const reading = generateNadiReading(user);

      expect(reading.predictions).toBeDefined();
      expect(reading.predictions.career).toBeDefined();
      expect(reading.predictions.relationships).toBeDefined();
      expect(reading.predictions.health).toBeDefined();
      expect(reading.predictions.wealth).toBeDefined();
    });
  });
});