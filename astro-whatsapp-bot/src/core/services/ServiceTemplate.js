const AstroServiceInterface = require('../interfaces/astroServiceInterface');
const logger = require('../utils/logger');

class ServiceTemplate extends AstroServiceInterface {
  constructor(calculatorName) {
    super();
    this.calculatorName = calculatorName; // Store the calculator name
    this.calculator = null; // Will be loaded dynamically
    logger.info(`Service ${this.constructor.name} initialized with calculator: ${calculatorName}`);
  }

  async initialize() {
    if (this.calculatorName && this.calculatorPath) {
      try {
        // Dynamically import the calculator module
        const CalculatorModule = require(this.calculatorPath);
        // Assuming the calculator is the default export or a named export matching the name
        this.calculator = CalculatorModule.default || CalculatorModule; // Adjust based on actual calculator module export
        logger.info(`Calculator ${this.calculatorName} loaded for ${this.constructor.name}`);
      } catch (error) {
        logger.error(`Failed to load calculator ${this.calculatorName} from ${this.calculatorPath}:`, error);
        throw new Error(`Failed to load calculator: ${this.calculatorName}`);
      }
    } else if (this.calculatorName) {
      logger.warn(`Calculator path not defined for ${this.constructor.name}. Calculator ${this.calculatorName} will not be loaded.`);
    } else {
      logger.info(`No specific calculator defined for ${this.constructor.name}.`);
    }
  }

  async execute(data) {
    try {
      logger.info(`${this.constructor.name} execution started`, data);

      // Ensure calculator is loaded before use
      if (this.calculatorName && !this.calculator) {
        await this.initialize();
      }

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
      status: 'active',
      calculator: this.calculatorName || 'None'
    };
  }

  async getHealthStatus() {
    try {
      // Basic health check for the service itself
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        serviceName: this.constructor.name,
        calculatorStatus: 'N/A'
      };

      // Check calculator health if loaded
      if (this.calculator && typeof this.calculator.getHealthStatus === 'function') {
        const calculatorHealth = await this.calculator.getHealthStatus();
        health.calculatorStatus = calculatorHealth;
      } else if (this.calculatorName) {
        health.calculatorStatus = `Calculator ${this.calculatorName} not loaded or no health check method.`;
      }

      return health;
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = ServiceTemplate;
