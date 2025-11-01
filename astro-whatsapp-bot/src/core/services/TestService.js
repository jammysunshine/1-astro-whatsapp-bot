const ServiceTemplate = require('./ServiceTemplate');
const logger = require('../../shared/utils/logger');
const Joi = require('joi');

class TestService extends ServiceTemplate {
  constructor(calculatorName = 'TestCalculator') {
    super(calculatorName);
    this.serviceName = 'TestService';
    this.calculatorPath = './calculators/TestCalculator';
    this.inputSchema = Joi.object({
      message: Joi.string().required(),
      value: Joi.number().optional().default(0)
    });
    logger.log('TestService initialized');
  }

  async processCalculation(data) {
    this.logger.log(`Processing test calculation with message: ${data.message} and value: ${data.value}`);
    return {
      receivedMessage: data.message,
      processedValue: data.value * 2,
      status: 'success',
      timestamp: new Date().toISOString()
    };
  }

  getMetadata() {
    return {
      name: this.serviceName,
      description: 'A simple test service to verify monolith functionality.',
      requiredFields: ['message'],
      subscriptionLevel: 'free',
      enabled: true,
      version: '1.0.0'
    };
  }

  async getHealthStatus() {
    const baseHealth = await super.getHealthStatus();
    return {
      ...baseHealth,
      customCheck: 'TestService is always healthy',
      isHealthy: true
    };
  }
}

module.exports = TestService;