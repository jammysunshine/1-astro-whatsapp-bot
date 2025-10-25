const express = require('express');
// Force redeploy to pick up new env vars
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const { connectDB } = require('./config/database');
const { handleWhatsAppWebhook, verifyWhatsAppWebhook } = require('./controllers/whatsappController');
const { errorHandler } = require('./utils/errorHandler');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.W1_PORT || 3000;

// Middleware
app.use(helmet({
  frameguard: { action: 'deny' },
  xssFilter: { mode: 'block' }
}));
app.use(cors());
app.use(bodyParser.json({
  verify: (req, res, buf, encoding) => {
    req.rawBody = buf.toString(encoding);
  },
  limit: '10mb'
}));
app.use(bodyParser.urlencoded({
  extended: true,
  verify: (req, res, buf, encoding) => {
    req.rawBody = buf.toString(encoding);
  },
  limit: '10mb'
}));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Astrology WhatsApp Bot API is running',
    version: '1.0.0'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  const memUsage = process.memoryUsage();
  const memUsageMB = {
    rss: Math.round(memUsage.rss / 1024 / 1024),
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
    external: Math.round(memUsage.external / 1024 / 1024)
  };

  // Check if memory usage is too high (Railway containers typically have 512MB-1GB limits)
  const isMemoryCritical = memUsageMB.heapUsed > 300; // 300MB threshold

  const healthStatus = isMemoryCritical ? 'degraded' : 'healthy';
  const statusCode = isMemoryCritical ? 503 : 200;

  res.status(statusCode).json({
    status: healthStatus,
    timestamp: new Date().toISOString(),
    service: 'Astrology WhatsApp Bot API',
    uptime: process.uptime(),
    memory: memUsageMB,
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch
    },
    ...(isMemoryCritical && { warning: 'High memory usage detected' })
  });
});

// Readiness check endpoint
app.get('/ready', (req, res) => {
  // Check if essential services are available
  const essentialEnvVars = [
    'W1_WHATSAPP_ACCESS_TOKEN',
    'W1_WHATSAPP_PHONE_NUMBER_ID'
  ];

  const missingVars = essentialEnvVars.filter(varName => !process.env[varName]);

  // For Railway deployment, be more lenient - don't fail if env vars are missing
  // The bot can still start and handle errors gracefully
  if (missingVars.length > 0) {
    console.warn('⚠️ Missing environment variables:', missingVars);
    // Still return ready status to prevent Railway from killing the container
    return res.status(200).json({
      status: 'ready (with warnings)',
      timestamp: new Date().toISOString(),
      service: 'Astrology WhatsApp Bot API',
      warnings: `Missing env vars: ${missingVars.join(', ')}`
    });
  }

  res.status(200).json({
    status: 'ready',
    timestamp: new Date().toISOString(),
    service: 'Astrology WhatsApp Bot API'
  });
});

// WhatsApp webhook endpoints
app.post('/webhook', handleWhatsAppWebhook);
app.get('/webhook', verifyWhatsAppWebhook);

// Test endpoint for rate limiting
app.get('/rate-limit-test', (req, res) => {
  res.status(200).json({ message: 'Rate limit test endpoint' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'Route not found'
  });
});

// Error handling middleware
app.use(errorHandler);

// Global error handlers
process.on('uncaughtException', error => {
  logger.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('📴 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('📴 SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Memory monitoring
setInterval(() => {
  const memUsage = process.memoryUsage();
  const memUsageMB = {
    rss: Math.round(memUsage.rss / 1024 / 1024),
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
    external: Math.round(memUsage.external / 1024 / 1024)
  };

  // More aggressive memory monitoring for Railway
  if (memUsageMB.heapUsed > 200) { // Log if heap usage > 200MB
    logger.warn('⚠️ High memory usage detected:', memUsageMB);
  }

  // Force garbage collection if available and memory is high
  if (global.gc && memUsageMB.heapUsed > 250) {
    logger.info('🗑️ Running garbage collection due to high memory usage');
    global.gc();
  }
}, 15000); // Check every 15 seconds

// Initialize database connection
connectDB().catch(error => {
  logger.error('❌ Failed to connect to database:', error);
  // Don't exit in production, let Railway handle
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

// Start server only if not in test environment
let server;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    logger.info(`🚀 Astrology WhatsApp Bot API is running on port ${PORT}`);
    logger.info(`📝 Health check: http://localhost:${PORT}/health`);
    logger.info(`📱 WhatsApp webhook: http://localhost:${PORT}/webhook`);
    logger.info('💾 Memory usage:', process.memoryUsage());
  }).on('error', error => {
    logger.error('❌ Server failed to start:', error);
    process.exit(1);
  });

  // Handle server errors
  server.on('error', error => {
    logger.error('❌ Server error:', error);
    process.exit(1);
  });
}

module.exports = app;
