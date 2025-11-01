const logger = require('../../shared/utils/logger');

class RequestRouter {
  constructor(serviceRegistry) {
    this.logger = logger; // Use the singleton logger instance
    this.serviceRegistry = serviceRegistry;
  }

  async routeRequest(serviceName, data, context) {
    this.logger.log(`Routing request for service: ${serviceName}`);
    const service = this.serviceRegistry.getService(serviceName);

    if (!service) {
      this.logger.warn(`Service '${serviceName}' not found.`);
      throw new Error(`Service '${serviceName}' not found.`);
    }

    // Basic validation (can be expanded with more sophisticated schema validation)
    const validationResult = service.validate(data);
    if (!validationResult.isValid) {
      this.logger.warn(`Validation failed for service ${serviceName}:`, validationResult.errors);
      throw new Error(`Validation failed: ${validationResult.errors.join(', ')}`);
    }

    // Execute the service
    try {
      const result = await service.execute(data, context);
      this.logger.log(`Service ${serviceName} executed successfully.`);
      return result;
    } catch (error) {
      this.logger.error(`Error executing service ${serviceName}:`, error);
      throw new Error(`Service execution failed: ${error.message}`);
    }
  }
}

module.exports = RequestRouter;