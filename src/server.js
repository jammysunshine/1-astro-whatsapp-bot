const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const crypto = require('crypto');
const { handleWhatsAppWebhook } = require('./controllers/whatsappController');
const { errorHandler } = require('./utils/errorHandler');
const logger = require('./utils/logger');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ 
  verify: (req, res, buf, encoding) => {
    req.rawBody = buf.toString(encoding);
  }
}));
app.use(bodyParser.urlencoded({ 
  extended: true, 
  verify: (req, res, buf, encoding) => {
    req.rawBody = buf.toString(encoding);
  }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'Astrology WhatsApp Bot API',
    uptime: process.uptime()
  });
});

// WhatsApp webhook endpoint with verification and processing
app.post('/webhook', (req, res) => {
  // Verify the request is from WhatsApp (if verification enabled)
  if (process.env.WHATSAPP_VERIFY_TOKEN) {
    const signature = req.headers['x-hub-signature-256'];
    if (signature) {
      const expectedSignature = 'sha256=' + crypto
        .createHmac('sha256', process.env.WHATSAPP_APP_SECRET)
        .update(req.rawBody)
        .digest('hex');
      
      if (signature !== expectedSignature) {
        logger.error('Invalid webhook signature');
        return res.status(401).send('Unauthorized');
      }
    }
  }

  // Process the webhook
  handleWhatsAppWebhook(req, res).catch(error => {
    logger.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  });
});

// Webhook verification endpoint (for initial setup with WhatsApp)
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      logger.info('Webhook verified successfully');
      res.status(200).send(challenge);
    } else {
      logger.warn('Webhook verification failed');
      res.status(403).send('Forbidden');
    }
  } else {
    res.status(200).send('Webhook endpoint ready');
  }
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Health check available at http://localhost:${PORT}/health`);
  logger.info(`WhatsApp webhook ready at http://localhost:${PORT}/webhook`);
  
  // Validate required environment variables
  const requiredEnvVars = ['WHATSAPP_VERIFY_TOKEN', 'WHATSAPP_APP_SECRET'];
  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missingEnvVars.length > 0) {
    logger.warn(`Missing environment variables: ${missingEnvVars.join(', ')}. Please set them before going to production.`);
  }
});

module.exports = app;