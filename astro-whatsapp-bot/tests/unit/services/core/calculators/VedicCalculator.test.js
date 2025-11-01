// tests/unit/services/astrology/vedicCalculator.test.js
// Unit tests for Vedic Calculator with real astrology library

const VedicCalculator = require('../src/core/services/calculators/VedicCalculator');

// Mock dependencies
jest.mock('astrologer');
jest.mock('sweph');

// Mock internal calculator dependencies
jest.mock('../src/core/services/calculators/ChartGenerator', () => ({
  calculate: jest.fn().mockResolvedValue({ sunSign: 'Pisces', moonSign: 'Pisces', risingSign: 'Aquarius' }),
}));
jest.mock('../src/core/services/calculators/DashaAnalysisCalculator', () => ({
  calculateCurrentDasha: jest.fn().mockResolvedValue({ dasha: 'Venus', period: '2020-2040' }),
}));
jest.mock('../src/core/services/calculators/TransitCalculator', () => ({
  calculate: jest.fn().mockResolvedValue({ planet: 'Jupiter', position: 'Taurus' }),
}));
jest.mock('../src/core/services/calculators/VedicYogasCalculator', () => ({
  calculate: jest.fn().mockResolvedValue({ yogas: ['Raja Yoga'] }),
}));
jest.mock('../src/core/services/calculators/RetrogradeCalculator', () => ({
  calculateRetrogrades: jest.fn().mockResolvedValue({ retrogrades: ['Mercury'] }),
}));
jest.mock('../src/core/services/calculators/CosmicEventsCalculator', () => ({
  calculateCosmicEvents: jest.fn().mockResolvedValue({ events: ['Full Moon'] }),
}));

const logger = require('../src/utils/logger');

describe('VedicCalculator', () => {
  let calculator;

  beforeEach(async () => {
    jest.clearAllMocks();
    calculator = new VedicCalculator();
    await calculator.initialize(); // Initialize to load mocked dependencies
  });

  describe('initialize', () => {
    it('should initialize and load all sub-calculators', async () => {
      // Check if the sub-calculators were loaded
      expect(calculator.birthChart).toBeDefined();
      expect(calculator.dasha).toBeDefined();
      expect(calculator.transits).toBeDefined();
      expect(calculator.yogas).toBeDefined();
      expect(calculator.retrogrades).toBeDefined();
      expect(calculator.cosmic).toBeDefined();
      expect(calculator.initialized).toBe(true);
    });

    it('should not re-initialize if already initialized', async () => {
      const initialBirthChart = calculator.birthChart;
      await calculator.initialize(); // Call initialize again
      expect(calculator.birthChart).toBe(initialBirthChart); // Should be the same instance
    });
  });

  describe('calculateBirthChart', () => {
    it('should call ChartGenerator.calculate with birth data', async () => {
      const birthData = { date: '15/03/1990', time: '14:30', place: 'Mumbai, India' };
      await calculator.calculateBirthChart(birthData);
      const { calculate } = require('../src/core/services/calculators/ChartGenerator');
      expect(calculate).toHaveBeenCalledWith(birthData);
    });

    it('should return the result from ChartGenerator.calculate', async () => {
      const birthData = { date: '15/03/1990', time: '14:30', place: 'Mumbai, India' };
      const expectedResult = { sunSign: 'Pisces', moonSign: 'Pisces', risingSign: 'Aquarius' };
      const { calculate } = require('../src/core/services/calculators/ChartGenerator');
      calculate.mockResolvedValue(expectedResult);

      const result = await calculator.calculateBirthChart(birthData);
      expect(result).toBe(expectedResult);
    });
  });

  describe('calculateCurrentDasha', () => {
    it('should call DashaAnalysisCalculator.calculateCurrentDasha with birth data', async () => {
      const birthData = { date: '15/03/1990' };
      await calculator.calculateCurrentDasha(birthData);
      const { calculateCurrentDasha } = require('../src/core/services/calculators/DashaAnalysisCalculator');
      expect(calculateCurrentDasha).toHaveBeenCalledWith(birthData);
    });
  });

  describe('calculateCurrentTransits', () => {
    it('should call TransitCalculator.calculate with birth data', async () => {
      const birthData = { date: '15/03/1990' };
      await calculator.calculateCurrentTransits(birthData);
      const { calculate } = require('../src/core/services/calculators/TransitCalculator');
      expect(calculate).toHaveBeenCalledWith(birthData);
    });
  });

  describe('calculateVedicYogas', () => {
    it('should call VedicYogasCalculator.calculate with birth data', async () => {
      const birthData = { date: '15/03/1990' };
      await calculator.calculateVedicYogas(birthData);
      const { calculate } = require('../src/core/services/calculators/VedicYogasCalculator');
      expect(calculate).toHaveBeenCalledWith(birthData);
    });
  });

  describe('calculateCosmicEvents', () => {
    it('should call CosmicEventsCalculator.calculateCosmicEvents with birth data and days ahead', async () => {
      const birthData = { date: '15/03/1990' };
      const daysAhead = 60;
      await calculator.calculateCosmicEvents(birthData, daysAhead);
      const { calculateCosmicEvents } = require('../src/core/services/calculators/CosmicEventsCalculator');
      expect(calculateCosmicEvents).toHaveBeenCalledWith(birthData, daysAhead);
    });
  });

  describe('calculateGochar', () => {
    it('should calculate Gochar by calling current transits and internal methods', async () => {
      const birthData = { date: '15/03/1990' };
      const options = { currentDate: new Date(), aspects: true, houses: true };

      // Mock internal methods for Gochar
      jest.spyOn(calculator, '_calculateTransitAspects').mockResolvedValue(['mock aspect']);
      jest.spyOn(calculator, '_calculateHouseTransits').mockResolvedValue(['mock house transit']);
      jest.spyOn(calculator, '_analyzeTransits').mockReturnValue({ summary: 'mock analysis' });

      const result = await calculator.calculateGochar(birthData, options);

      const { calculate } = require('../src/core/services/calculators/TransitCalculator');
      expect(calculate).toHaveBeenCalledWith({ ...birthData, currentDate: options.currentDate });
      expect(calculator._calculateTransitAspects).toHaveBeenCalled();
      expect(calculator._calculateHouseTransits).toHaveBeenCalled();
      expect(calculator._analyzeTransits).toHaveBeenCalled();

      expect(result.summary).toBeDefined();
      expect(result.planetaryPositions).toBeDefined();
      expect(result.aspects).toEqual(['mock aspect']);
      expect(result.houseTransits).toEqual(['mock house transit']);
    });

    it('should handle errors during Gochar calculation', async () => {
      const birthData = { date: '15/03/1990' };
      const options = { currentDate: new Date() };

      const { calculate } = require('../src/core/services/calculators/TransitCalculator');
      calculate.mockRejectedValue(new Error('Transit calculation failed'));

      await expect(calculator.calculateGochar(birthData, options)).rejects.toThrow('Gochar calculation failed');
    });
  });

  describe('healthCheck', () => {
    it('should return a healthy status', () => {
      const status = calculator.healthCheck();
      expect(status.healthy).toBe(true);
      expect(status.name).toBe('VedicCalculator');
      expect(status.status).toBe('Operational');
      expect(status.calculations).toBeInstanceOf(Array);
    });
  });
});