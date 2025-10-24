const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { handleWhatsAppWebhook, verifyWhatsAppWebhook } = require('./controllers/whatsappController');
const { errorHandler } = require('./utils/errorHandler');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.W1_PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ verify: (req, res, buf, encoding) => {
  if (req.headers['content-type'] === 'application/x-www-form-urlencoded') {
    req.rawBody = buf.toString(encoding);
  }
} }));
app.use(bodyParser.urlencoded({ extended: true, verify: (req, res, buf, encoding) => {
  req.rawBody = buf.toString(encoding);
} }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Astrology WhatsApp Bot API'
  });
});

// WhatsApp webhook endpoints
app.post('/webhook', handleWhatsAppWebhook);
app.get('/webhook', verifyWhatsAppWebhook);

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Astrology WhatsApp Bot API is running on port ${PORT}`);
  logger.info(`📝 Health check: http://localhost:${PORT}/health`);
  logger.info(`📱 WhatsApp webhook: http://localhost:${PORT}/webhook`);
});

module.exports = app;
