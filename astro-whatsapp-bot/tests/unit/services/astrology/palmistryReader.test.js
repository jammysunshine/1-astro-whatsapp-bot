// tests/unit/services/astrology/palmistryReader.test.js
// Unit tests for Palmistry reading service

const { generatePalmistryReading } = require('services/astrology/palmistryReader');

describe('Palmistry Reader Service', () => {
  describe('generatePalmistryReading', () => {
    it('should generate a complete palmistry reading', () => {
      const user = { id: 'user-123', birthDate: '15/03/1990', handType: 'square' };
      const reading = generatePalmistryReading(user);

      expect(reading).toBeDefined();
      expect(reading.handType).toBeDefined();
      expect(reading.lifeLine).toBeDefined();
      expect(reading.heartLine).toBeDefined();
      expect(reading.headLine).toBeDefined();
      expect(reading.fateLine).toBeDefined();
      expect(reading.mounts).toBeDefined();
      expect(reading.interpretation).toBeDefined();
    });

    it('should analyze different hand types', () => {
      const handTypes = ['square', 'long', 'short', 'conical'];

      handTypes.forEach(type => {
        const user = { id: 'user-test', birthDate: '01/01/1990', handType: type };
        const reading = generatePalmistryReading(user);

        expect(reading.handType).toBe(type);
        expect(reading.interpretation).toContain(type);
      });
    });

    it('should provide career insights from fate line', () => {
      const user = { id: 'user-456', birthDate: '20/07/1985', careerFocus: true };
      const reading = generatePalmistryReading(user);

      expect(reading.fateLine).toBeDefined();
      expect(reading.fateLine.career).toBeDefined();
      expect(reading.interpretation).toContain('career');
    });

    it('should provide relationship insights from heart line', () => {
      const user = { id: 'user-789', birthDate: '10/12/1992', relationshipFocus: true };
      const reading = generatePalmistryReading(user);

      expect(reading.heartLine).toBeDefined();
      expect(reading.heartLine.relationships).toBeDefined();
      expect(reading.interpretation).toContain('relationship');
    });

    it('should analyze mount characteristics', () => {
      const user = { id: 'user-111', birthDate: '25/05/1988' };
      const reading = generatePalmistryReading(user);

      expect(reading.mounts).toBeDefined();
      expect(reading.mounts.venus).toBeDefined();
      expect(reading.mounts.jupiter).toBeDefined();
      expect(reading.mounts.saturn).toBeDefined();
      expect(reading.mounts.mercury).toBeDefined();
    });
  });
});