const ServiceTemplate = require('../ServiceTemplate');
const logger = require('../../utils/logger');
const { BirthData } = require('../../models');

// Import calculator from legacy structure (for now)
const { DashaAnalysisCalculator } = require('../../../services/astrology/vedic/calculators/DashaAnalysisCalculator');

class VimshottariDashaService extends ServiceTemplate {
  constructor() {
    super(new DashaAnalysisCalculator());
    this.serviceName = 'VimshottariDashaService';
    logger.info('VimshottariDashaService initialized');
  }

  async processCalculation(birthData) {
    try {
      // Validate input with model
      const validatedData = new BirthData(birthData);
      validatedData.validate();

      // Get dasha data from calculator
      const dashaData = await this.calculator.calculateDashaAnalysis(birthData);

      // Add metadata
      dashaData.type = 'vimshottari';
      dashaData.generatedAt = new Date().toISOString();
      dashaData.service = this.serviceName;

      return dashaData;
    } catch (error) {
      logger.error('VimshottariDashaService calculation error:', error);
      throw new Error(`Dasha analysis failed: ${error.message}`);
    }
  }

  formatResult(result) {
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
      service: this.serviceName
    };
  }

  validate(birthData) {
    if (!birthData) {
      throw new Error('Birth data is required');
    }

    const required = ['birthDate', 'birthTime', 'birthPlace'];
    for (const field of required) {
      if (!birthData[field]) {
        throw new Error(`${field} is required for dasha analysis`);
      }
    }

    return true;
  }

  getMetadata() {
    return {
      name: this.serviceName,
      version: '1.0.0',
      category: 'vedic',
      methods: ['getCurrentDasha', 'getDashaPredictions'],
      dependencies: ['DashaAnalysisCalculator']
    };
  }
}

module.exports = VimshottariDashaService;