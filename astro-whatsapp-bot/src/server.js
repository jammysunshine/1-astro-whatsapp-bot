const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Astro WhatsApp Bot API'
  });
});

// Basic route for testing
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Astro WhatsApp Bot API is running!',
    version: '1.0.0'
  });
});

// WhatsApp webhook endpoint (to be implemented)
app.post('/webhook', (req, res) => {
  res.status(200).json({
    message: 'Webhook endpoint ready for WhatsApp integration',
    status: 'success'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Astro WhatsApp Bot API is running on port ${PORT}`);
  console.log(`📝 Health check: http://localhost:${PORT}/health`);
  console.log(`📱 WhatsApp webhook: http://localhost:${PORT}/webhook`);
});

module.exports = app;