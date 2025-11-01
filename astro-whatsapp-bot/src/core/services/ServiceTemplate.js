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
        // Get the calculator - try default export, then named export matching the name, then module itself
        const rawCalculator = CalculatorModule.default || CalculatorModule[this.calculatorName] || CalculatorModule;

        // Check if rawCalculator is a constructor function (class) and needs instantiation
        if (typeof rawCalculator === 'function' && rawCalculator.prototype && rawCalculator.prototype.constructor) {
          // This is a class constructor - we need to handle instantiation
          // For now, we'll try to instantiate with no arguments, which might fail for complex calculators
          // A more robust solution would require dependency injection, but for now we try basic instantiation
          try {
            this.calculator = new rawCalculator();
          } catch (instantiationError) {
            // If instantiation fails (likely due to required constructor parameters),
            // store the class constructor for the service to handle its own instantiation if needed
            this.calculator = rawCalculator;
            logger.warn(`Calculator ${this.calculatorName} is a class that requires constructor parameters. Stored as constructor:`, instantiationError.message);
          }
        } else {
          // This is likely an already instantiated object or static methods container
          this.calculator = rawCalculator;
        }

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
