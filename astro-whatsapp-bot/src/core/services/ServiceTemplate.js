const AstroServiceInterface = require('../interfaces/astroServiceInterface');
const logger = require('../utils/logger');

class ServiceTemplate extends AstroServiceInterface {
  constructor(calculatorService) {
    super();
    this.calculator = calculatorService;
    logger.info(`Service ${this.constructor.name} initialized`);
  }

  async execute(data) {
    try {
      logger.info(`${this.constructor.name} execution started`, data);

      // Validate input data
      this.validate(data);

      // Process the request using calculator
      const result = await this.processCalculation(data);

      // Format and return result
      const formattedResult = this.formatResult(result);

      logger.info(`${this.constructor.name} execution completed`);
      return formattedResult;

    } catch (error) {
      logger.error(`${this.constructor.name} execution failed:`, error);
      throw error;
    }
  }

  validate(data) {
    if (!data) {
      throw new Error('Input data is required');
    }
    return true;
  }

  async processCalculation(data) {
    // To be implemented by specific service
    throw new Error('processCalculation must be implemented');
  }

  formatResult(result) {
    return result;
  }

  getMetadata() {
    return {
      name: this.constructor.name,
      version: '1.0.0',
      category: 'astrology',
      status: 'active'
    };
  }
}

module.exports = ServiceTemplate;
