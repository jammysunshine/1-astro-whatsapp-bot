const ServiceRegistry = require('./ServiceRegistry');
const RequestRouter = require('./RequestRouter');
const ResponseFormatter = require('./ResponseFormatter');
const logger = require('../../shared/utils/logger');
const path = require('path');

class ServiceGateway {
  constructor() {
    this.logger = logger; // Use the singleton logger instance
    const servicesConfigPath = path.join(__dirname, '../config/services.json');
    this.serviceRegistry = new ServiceRegistry(servicesConfigPath);
    this.requestRouter = new RequestRouter(this.serviceRegistry);
    this.responseFormatter = new ResponseFormatter();
  }

  async initialize() {
    this.logger.log('Initializing Service Gateway...');
    await this.serviceRegistry.initialize();
    this.logger.log('Service Gateway initialized.');
  }

  async processRequest(serviceName, data, context = { frontend: 'default', locale: 'en' }) {
    try {
      this.logger.log(`Processing request for service: ${serviceName}`);
      const result = await this.requestRouter.routeRequest(serviceName, data, context);
      return this.responseFormatter.formatResponse(serviceName, result, context);
    } catch (error) {
      this.logger.error(`Error processing request for service ${serviceName}:`, error);
      return this.responseFormatter.formatErrorResponse(serviceName, error, context);
    }
  }

  async getHealthStatus() {
    this.logger.log('Checking Service Gateway health...');
    const registryHealth = await this.serviceRegistry.getHealthStatus();
    const overallHealthy = Object.values(registryHealth).every(service => service.isHealthy);

    return {
      isHealthy: overallHealthy,
      message: overallHealthy ? 'All services operational' : 'Some services unhealthy',
      services: registryHealth,
      timestamp: new Date().toISOString()
    };
  }

  getServiceMetadata(serviceName) {
    return this.serviceRegistry.getServiceMetadata(serviceName);
  }

  getAllServiceNames() {
    return this.serviceRegistry.getAllServiceNames();
  }
}

module.exports = ServiceGateway;