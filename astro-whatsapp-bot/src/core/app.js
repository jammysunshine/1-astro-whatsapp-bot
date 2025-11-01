const express = require('express');
const { errorHandler } = require('./middleware');
const logger = require('./utils/logger');
const {
  validateServiceExecution,
  validateServiceParams
} = require('./validation/middleware');

// Import all service classes
const BirthChartService = require('./services/birthChartService');
const VimshottariDashaService = require('./services/vimshottariDashaService');
// Add imports for all 90 services (will be added gradually)

class ServiceManager {
  constructor() {
    this.services = this._initializeServices();
  }

  _initializeServices() {
    return {
      birthChartService: new BirthChartService(),
      vimshottariDashaService: new VimshottariDashaService()
      // Add all other services here (will be added as implemented)
    };
  }

  getService(serviceName) {
    return this.services[serviceName];
  }

  getAllServices() {
    return Object.keys(this.services);
  }
}

class CoreApp {
  constructor() {
    this.serviceManager = new ServiceManager();
    this.app = express();
    this._setupMiddleware();
    this._setupRoutes();
    this._setupErrorHandling();
  }

  _setupMiddleware() {
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    // Add CORS, rate limiting, etc. if needed
    this.app.use((req, res, next) => {
      res.setHeader('Content-Type', 'application/json');
      next();
    });
  }

  _setupRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: this.serviceManager.getAllServices().length
      });
    });

    // Service execution endpoint with validation
    this.app.post('/execute/:service', validateServiceParams, validateServiceExecution, async(req, res) => {
      try {
        const { service } = req.params;
        const { data } = req.body;

        const serviceInstance = this.serviceManager.getService(service);
        if (!serviceInstance) {
          return res.status(404).json({
            error: `Service '${service}' not found`,
            availableServices: this.serviceManager.getAllServices()
          });
        }

        const result = await serviceInstance.execute(data);
        res.json(result);
      } catch (error) {
        logger.error('Service execution error:', error);
        res.status(500).json({
          error: `Service execution failed: ${error.message}`
        });
      }
    });

    // Get service metadata
    this.app.get('/services/:service', (req, res) => {
      try {
        const { service } = req.params;
        const serviceInstance = this.serviceManager.getService(service);

        if (!serviceInstance) {
          return res.status(404).json({
            error: `Service '${service}' not found`
          });
        }

        const metadata = serviceInstance.getMetadata();
        res.json(metadata);
      } catch (error) {
        res.status(500).json({
          error: error.message
        });
      }
    });

    // Get all services
    this.app.get('/services', (req, res) => {
      res.json({
        services: this.serviceManager.getAllServices(),
        total: this.serviceManager.getAllServices().length
      });
    });
  }

  _setupErrorHandling() {
    this.app.use(errorHandler);
  }

  async start(port = 4000) {
    try {
      this.app.listen(port, () => {
        logger.info(`Core Modular Monolith running on port ${port}`);
        logger.info(
          `Available services: ${this.serviceManager.getAllServices().length}`
        );
      });
    } catch (error) {
      logger.error('Failed to start Core App:', error);
      process.exit(1);
    }
  }
}

// Only start if this file is run directly
if (require.main === module) {
  const coreApp = new CoreApp();
  coreApp.start();
}

module.exports = CoreApp;
