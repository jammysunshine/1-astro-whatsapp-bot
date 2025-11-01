const fs = require('fs');
const path = require('path');
const logger = require('../../shared/utils/logger');
const AstroServiceInterface = require('../interfaces/AstroServiceInterface');

class ServiceRegistry {
  constructor(servicesConfigPath) {
    this.logger = logger; // Use the singleton logger instance
    if (process.env.NODE_ENV === 'development') {
      delete require.cache[require.resolve('../../shared/utils/logger')];
    }
    this.services = new Map();
    this.servicesConfigPath = servicesConfigPath;
    this.serviceMetadata = {};
  }

  async initialize() {
    this.logger.log('Initializing Service Registry...');
    await this.loadServiceMetadata();
    await this.autoDiscoverServices();
    this.logger.log(`Service Registry initialized with ${this.services.size} services.`);
  }

  async loadServiceMetadata() {
    try {
      const configContent = await fs.promises.readFile(this.servicesConfigPath, 'utf8');
      this.serviceMetadata = JSON.parse(configContent);
      this.logger.log(`Loaded service metadata from ${this.servicesConfigPath}`);
    } catch (error) {
      this.logger.error(`Failed to load service metadata from ${this.servicesConfigPath}:`, error);
      this.serviceMetadata = {}; // Ensure it's an empty object on failure
    }
  }

  async autoDiscoverServices() {
    const servicesDir = path.join(__dirname, '../../core/services');
    this.logger.log(`Auto-discovering services in ${servicesDir}`);

    if (!fs.existsSync(servicesDir)) {
      this.logger.warn(`Services directory not found: ${servicesDir}`);
      return;
    }

    const serviceFiles = fs.readdirSync(servicesDir).filter(file => file.endsWith('.js') && file !== 'ServiceTemplate.js');

    for (const file of serviceFiles) {
      const serviceName = path.basename(file, '.js');
      const servicePath = path.join(servicesDir, file);
      try {
        // Clear cache to ensure fresh load in development
        if (process.env.NODE_ENV === 'development') {
          delete require.cache[require.resolve(servicePath)];
        }
        const ServiceClass = require(servicePath);
        const serviceInstance = new ServiceClass();

        console.log(`ServiceRegistry: Checking service: ${serviceName}`);
        console.log(`ServiceRegistry: serviceInstance:`, serviceInstance);
        console.log(`ServiceRegistry: AstroServiceInterface:`, AstroServiceInterface);
        console.log(`ServiceRegistry: serviceInstance instanceof AstroServiceInterface:`, serviceInstance instanceof AstroServiceInterface);

        if (!(serviceInstance instanceof AstroServiceInterface)) {
          this.logger.warn(`Service ${serviceName} does not implement AstroServiceInterface. Skipping.`);
          continue;
        }

        // Initialize service with its specific metadata if available
        const metadata = this.serviceMetadata[serviceName] || {};
        serviceInstance.initialize(metadata);

        this.services.set(serviceName, serviceInstance);
        this.logger.log(`Discovered and registered service: ${serviceName}`);
      } catch (error) {
        this.logger.error(`Failed to load or initialize service ${serviceName} from ${servicePath}:`, error);
      }
    }
  }

  getService(name) {
    const service = this.services.get(name);
    if (!service) {
      this.logger.warn(`Service '${name}' not found in registry.`);
    }
    return service;
  }

  getServiceMetadata(name) {
    return this.serviceMetadata[name];
  }

  getAllServiceNames() {
    return Array.from(this.services.keys());
  }

  async getHealthStatus() {
    const health = {};
    for (const [name, service] of this.services.entries()) {
      try {
        health[name] = await service.getHealthStatus();
      } catch (error) {
        this.logger.error(`Error getting health status for service ${name}:`, error);
        health[name] = { isHealthy: false, message: error.message };
      }
    }
    return health;
  }
}

module.exports = ServiceRegistry;