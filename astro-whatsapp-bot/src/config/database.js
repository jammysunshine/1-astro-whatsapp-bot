const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * Database configuration and connection management
 */

// Database connection options
const getConnectionOptions = mongoURI => {
  const baseOptions = {
    maxPoolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 30000, // Keep trying to send operations for 30 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  };

  // Add serverApi for Atlas connections (mongodb+srv)
  if (mongoURI.startsWith('mongodb+srv://')) {
    baseOptions.serverApi = {
      version: mongoose.mongo.ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    };
  }

  return baseOptions;
};

/**
 * Connect to MongoDB Atlas
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    // In test environment, always disconnect first to avoid connection conflicts
    if (process.env.NODE_ENV === 'test') {
      if (mongoose.connection.readyState > 0) {
        await mongoose.disconnect();
        logger.info('🔄 Disconnected from previous DB connection for test');
      }
    } else {
      // Check if already connected
      if (mongoose.connection.readyState > 0) {
        logger.info('🗄️ DB already connected');
        return;
      }
    }

    let mongoURI;

    // For local development without explicit MONGODB_URI, use in-memory server
    if (process.env.NODE_ENV === 'development' && !process.env.MONGODB_URI) {
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongoServer = await MongoMemoryServer.create({
          instance: {
            startupTimeout: 30000,
          },
        });
        mongoURI = mongoServer.getUri();
        process.env.MONGODB_URI = mongoURI; // Set for consistency
        logger.info(`🔗 Using in-memory DB for ${process.env.NODE_ENV}: ${mongoURI}`);
      } catch (error) {
        logger.error('❌ Failed to start MongoDB Memory Server:', error.message);
        throw error;
      }
    }

    // Check if MONGODB_URI is set (for testing with memory server)
    if (process.env.MONGODB_URI) {
      mongoURI = process.env.MONGODB_URI;
      logger.debug(`🔗 Using MONGODB_URI: ${mongoURI}`);
      logger.info(
        `🔗 Attempting DB connection: ${mongoURI.replace(/:([^:@]{4})[^:@]*@/, ':****@')}`
      );
    } else {
      // Use separate environment variables for production
      const dbUser = process.env.DB_USER;
      const dbPassword = process.env.DB_PASSWORD;
      const dbHost = process.env.DB_HOST;
      const dbName = process.env.DB_NAME;

      logger.info(`🔗 Using DB_USER: ${dbUser ? 'Set' : 'Not Set'}`);
      logger.info(`🔗 Using DB_HOST: ${dbHost || 'Not Set'}`);
      logger.info(`🔗 Using DB_NAME: ${dbName || 'Not Set'}`);
      logger.info(`🔗 NODE_ENV: ${process.env.NODE_ENV}`);

      if (!dbUser || !dbPassword || !dbHost || !dbName) {
        throw new Error(
          'Database environment variables (DB_USER, DB_PASSWORD, DB_HOST, DB_NAME) are not set'
        );
      }

      mongoURI = `mongodb+srv://${dbUser}:${dbPassword}@${dbHost}/${dbName}?retryWrites=true&w=majority`;
      logger.info(
        `🔗 Attempting DB connection: mongodb+srv://****:****@${dbHost}/${dbName}?retryWrites=true&w=majority`
      );
    }

    // Connect to MongoDB
    const conn = await mongoose.connect(
      mongoURI,
      getConnectionOptions(mongoURI)
    );

    logger.info(`🗄️ MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on('connected', () => {
      logger.info('🗄️ Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', err => {
      logger.error('❌ Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️ Mongoose disconnected from MongoDB');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('📴 MongoDB connection closed due to app termination');
      process.exit(0);
    });
  } catch (error) {
    logger.error('❌ MongoDB connection failed:', error);
    // Don't exit process in production or test, let Railway handle restarts
    if (
      process.env.NODE_ENV !== 'production' &&
      process.env.NODE_ENV !== 'test'
    ) {
      process.exit(1);
    }
    throw error;
  }
};

/**
 * Close database connection
 * @returns {Promise<void>}
 */
const closeDB = async () => {
  try {
    await mongoose.connection.close();
    logger.info('📴 MongoDB connection closed');
  } catch (error) {
    logger.error('❌ Error closing MongoDB connection:', error);
    throw error;
  }
};

/**
 * Check database connection health
 * @returns {Object} Connection status
 */
const getConnectionStatus = () => {
  const state = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  return {
    status: states[state] || 'unknown',
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null,
    readyState: state,
  };
};

module.exports = {
  connectDB,
  closeDB,
  getConnectionStatus,
};
