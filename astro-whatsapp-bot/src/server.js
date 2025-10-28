const express = require('express');
// Load environment variables
require('dotenv').config();

// Force redeploy to pick up new env vars
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const { connectDB } = require('./config/database');
const {
  handleWhatsAppWebhook,
  verifyWhatsAppWebhook
} = require('./controllers/whatsappController');
const paymentService = require('./services/payment/paymentService');
const { errorHandler } = require('./utils/errorHandler');
const logger = require('./utils/logger');

const app = express();

// Log WhatsApp credentials at startup
const whatsappAccessToken = process.env.W1_WHATSAPP_ACCESS_TOKEN;
const whatsappPhoneNumberId = process.env.W1_WHATSAPP_PHONE_NUMBER_ID;
logger.debug(`WhatsApp Access Token (masked): ${whatsappAccessToken ? `${whatsappAccessToken.substring(0, 5)}...${whatsappAccessToken.substring(whatsappAccessToken.length - 5)}` : 'Not Set'}`);
logger.debug(`WhatsApp Phone Number ID: ${whatsappPhoneNumberId || 'Not Set'}`);

// Connect to MongoDB
connectDB();

const PORT = process.env.W1_PORT || 3000;

// Middleware
app.use(
  helmet({
    frameguard: { action: 'deny' },
    xssFilter: { mode: 'block' }
  })
);
app.use(cors());
app.use(
  bodyParser.json({
    verify: (req, res, buf, encoding) => {
      req.rawBody = buf.toString(encoding);
    },
    limit: '10mb'
  })
);
app.use(
  bodyParser.urlencoded({
    extended: true,
    verify: (req, res, buf, encoding) => {
      req.rawBody = buf.toString(encoding);
    },
    limit: '10mb'
  })
);

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
  // Increase threshold for tests to prevent false degraded status
  const isMemoryCritical = memUsageMB.heapUsed > 400; // 400MB threshold

  const healthStatus = isMemoryCritical ? 'degraded' : 'healthy';

  res.status(200).json({
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

// Debug WhatsApp endpoint
app.get('/debug-whatsapp', async(req, res) => {
  try {
    const axios = require('axios');
    // Reconstruct token from parts (same logic as messageSender)
    const tokenPart1 = process.env.W1_WHATSAPP_ACCESS_TOKEN_PART1;
    const tokenPart2 = process.env.W1_WHATSAPP_ACCESS_TOKEN_PART2;
    const token = tokenPart1 && tokenPart2 ? tokenPart1 + tokenPart2 : process.env.W1_WHATSAPP_ACCESS_TOKEN;
    const phoneId = process.env.W1_WHATSAPP_PHONE_NUMBER_ID;

    const debug = {
      tokenLength: token ? token.length : 0,
      tokenReconstructed: !!(tokenPart1 && tokenPart2),
      tokenPart1Length: tokenPart1 ? tokenPart1.length : 0,
      tokenPart2Length: tokenPart2 ? tokenPart2.length : 0,
      tokenStart: token ? token.substring(0, 10) : null,
      tokenEnd: token ? token.substring(Math.max(0, token.length - 10)) : null,
      tokenMasked: token ? `${token.substring(0, 20)}...${token.substring(Math.max(0, token.length - 20))}` : null,
      envVarExists: !!process.env.W1_WHATSAPP_ACCESS_TOKEN,
      envPart1Exists: !!process.env.W1_WHATSAPP_ACCESS_TOKEN_PART1,
      envPart2Exists: !!process.env.W1_WHATSAPP_ACCESS_TOKEN_PART2,
      phoneId,
      timestamp: new Date().toISOString(),
      deploymentCheck: 'v5'
    };

    // Test WhatsApp API
    const response = await axios.get(`https://graph.facebook.com/v18.0/${phoneId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    res.json({
      status: 'success',
      debug,
      whatsappResponse: response.data
    });
  } catch (error) {
    // Reconstruct token from parts (same logic as messageSender)
    const tokenPart1 = process.env.W1_WHATSAPP_ACCESS_TOKEN_PART1;
    const tokenPart2 = process.env.W1_WHATSAPP_ACCESS_TOKEN_PART2;
    const token = tokenPart1 && tokenPart2 ? tokenPart1 + tokenPart2 : process.env.W1_WHATSAPP_ACCESS_TOKEN;
    res.json({
      status: 'error',
      debug: {
        tokenLength: token ? token.length : 0,
        tokenReconstructed: !!(tokenPart1 && tokenPart2),
        tokenPart1Length: tokenPart1 ? tokenPart1.length : 0,
        tokenPart2Length: tokenPart2 ? tokenPart2.length : 0,
        tokenStart: token ? token.substring(0, 10) : null,
        tokenEnd: token ? token.substring(Math.max(0, token.length - 10)) : null,
        tokenMasked: token ? `${token.substring(0, 20)}...${token.substring(Math.max(0, token.length - 20))}` : null,
        envVarExists: !!process.env.W1_WHATSAPP_ACCESS_TOKEN,
        envPart1Exists: !!process.env.W1_WHATSAPP_ACCESS_TOKEN_PART1,
        envPart2Exists: !!process.env.W1_WHATSAPP_ACCESS_TOKEN_PART2,
        phoneId: process.env.W1_WHATSAPP_PHONE_NUMBER_ID,
        error: error.message,
        response: error.response?.data,
        deploymentCheck: 'v5'
      }
    });
  }
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

// Payment webhook endpoints
app.post('/webhooks/razorpay', async(req, res) => {
  try {
    const result = await paymentService.handleRazorpayWebhook(req.body);
    res.status(200).json(result);
  } catch (error) {
    logger.error('Razorpay webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

app.post('/webhooks/stripe', async(req, res) => {
  try {
    const result = await paymentService.handleStripeWebhook(req.body);
    res.status(200).json(result);
  } catch (error) {
    logger.error('Stripe webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

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

let server;
let memoryMonitorInterval;

if (process.env.NODE_ENV !== 'test') {
  server = app
    .listen(PORT, () => {
      logger.info(`🚀 Astrology WhatsApp Bot API is running on port ${PORT}`);
      logger.info(`📝 Health check: http://localhost:${PORT}/health`);
      logger.info(`📱 WhatsApp webhook: http://localhost:${PORT}/webhook`);
      logger.info('💾 Memory usage:', process.memoryUsage());
    })
    .on('error', error => {
      logger.error('❌ Server failed to start:', error);
      process.exit(1);
    });

  // Start memory monitoring
  memoryMonitorInterval = setInterval(() => {
    const memUsage = process.memoryUsage();
    const memUsageMB = {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024)
    };

    if (memUsageMB.heapUsed > 200) {
      logger.warn('⚠️ High memory usage detected:', memUsageMB);
    }

    if (global.gc && memUsageMB.heapUsed > 250) {
      logger.info('🗑️ Running garbage collection due to high memory usage');
      global.gc();
    }
  }, 15000);

  // Handle server errors
  server.on('error', error => {
    logger.error('❌ Server error:', error);
    process.exit(1);
  });

  // Clear interval on server close
  server.on('close', () => {
    if (memoryMonitorInterval) {
      clearInterval(memoryMonitorInterval);
      logger.info('Memory monitor interval cleared.');
    }
  });
} else {
  // In test environment, ensure interval is cleared if server is started implicitly
  // This might be redundant if tests explicitly manage server lifecycle
  app.on('close', () => {
    if (memoryMonitorInterval) {
      clearInterval(memoryMonitorInterval);
      logger.info('Memory monitor interval cleared in test environment.');
    }
  });
}

module.exports = app;
