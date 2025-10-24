const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
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
app.use(bodyParser.json({ verify: (req, res, buf, encoding) => {
  if (req.headers['content-type'] === 'application/x-www-form-urlencoded') {
    req.rawBody = buf.toString(encoding);
  }
} }));
app.use(bodyParser.urlencoded({ extended: true, verify: (req, res, buf, encoding) => {
  req.rawBody = buf.toString(encoding);
} }));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Astrology WhatsApp Bot API is running',
    version: '1.0.0'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Astrology WhatsApp Bot API',
    uptime: process.uptime()
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

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info(`🚀 Astrology WhatsApp Bot API is running on port ${PORT}`);
    logger.info(`📝 Health check: http://localhost:${PORT}/health`);
    logger.info(`📱 WhatsApp webhook: http://localhost:${PORT}/webhook`);
  });
}

module.exports = app;
