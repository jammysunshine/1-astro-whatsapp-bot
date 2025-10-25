// tests/unit/services/astrology/tarotReader.test.js
// Unit tests for Tarot card reading service

const { generateTarotReading } = require('services/astrology/tarotReader');

describe('Tarot Reader Service', () => {
  describe('generateTarotReading', () => {
    it('should generate a single card reading', () => {
      const user = { id: 'user-123', birthDate: '15/03/1990' };
      const reading = generateTarotReading(user, 'single');

      expect(reading).toBeDefined();
      expect(reading.type).toBe('single');
      expect(reading.cards).toHaveLength(1);
      expect(reading.interpretation).toBeDefined();
      expect(reading.advice).toBeDefined();
    });

    it('should generate a three-card spread reading', () => {
      const user = { id: 'user-456', birthDate: '20/07/1985' };
      const reading = generateTarotReading(user, 'three-card');

      expect(reading).toBeDefined();
      expect(reading.type).toBe('three-card');
      expect(reading.cards).toHaveLength(3);
      expect(reading.interpretation).toBeDefined();
      expect(reading.advice).toBeDefined();
    });

    it('should generate a Celtic cross spread reading', () => {
      const user = { id: 'user-789', birthDate: '10/12/1992' };
      const reading = generateTarotReading(user, 'celtic-cross');

      expect(reading).toBeDefined();
      expect(reading.type).toBe('celtic-cross');
      expect(reading.cards).toHaveLength(10);
      expect(reading.interpretation).toBeDefined();
      expect(reading.advice).toBeDefined();
    });

    it('should handle invalid spread type', () => {
      const user = { id: 'user-999', birthDate: '01/01/2000' };
      const reading = generateTarotReading(user, 'invalid-spread');

      expect(reading).toBeDefined();
      expect(reading.type).toBe('invalid-spread');
      expect(reading.cards).toHaveLength(1);
    });

    it('should handle user personalization', () => {
      const user = { id: 'user-111', birthDate: '25/05/1988', sunSign: 'Gemini' };
      const reading = generateTarotReading(user, 'single');

      expect(reading).toBeDefined();
      expect(reading.personalized).toBe(true);
    });
  });
});
