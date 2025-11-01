const Joi = require('joi');
const logger = require('../utils/logger');

/**
 * Generic validation middleware using Joi
 * @param {Object} schema - Joi validation schema
 * @param {string} property - Property to validate ('body', 'params', 'query', 'headers')
 * @returns {Function} Express middleware
 */
const validate = (schema, property = 'body') => (req, res, next) => {
  try {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // Return all validation errors
      stripUnknown: true // Remove unknown fields
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      logger.warn('❌ Input validation failed:', {
        errors,
        property,
        value: req[property]
      });

      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
    }

    // Update the request property with the validated and sanitized value
    req[property] = value;
    next();
  } catch (validationError) {
    logger.error('❌ Validation middleware error:', validationError);
    return res.status(500).json({
      error: 'Internal server error during validation'
    });
  }
};

/**
 * Validation middleware for birth data
 */
const validateBirthData = validate(require('./schemas').birthDataSchema, 'body');

/**
 * Validation middleware for service execution
 */
const validateServiceExecution = validate(require('./schemas').serviceExecutionSchema, 'body');

/**
 * Validation middleware for WhatsApp message payload
 */
const validateWhatsAppMessage = validate(require('./schemas').whatsappMessageSchema, 'body');

/**
 * Validation middleware for WhatsApp webhook payload
 */
const validateWhatsAppWebhook = validate(require('./schemas').whatsappWebhookSchema, 'body');

/**
 * Validation middleware for Razorpay webhook
 */
const validateRazorpayWebhook = validate(require('./schemas').razorpayWebhookSchema, 'body');

/**
 * Validation middleware for Stripe webhook
 */
const validateStripeWebhook = validate(require('./schemas').stripeWebhookSchema, 'body');

/**
 * Validation middleware for user input
 */
const validateUserInput = validate(require('./schemas').userInputSchema, 'body');

/**
 * Validate service parameters (for dynamic service routing)
 */
const validateServiceParams = (req, res, next) => {
  const { service } = req.params;

  // Validate service name parameter - should match expected service names format
  if (!service || typeof service !== 'string' || !/^[a-zA-Z][a-zA-Z0-9_]*Service$/.test(service)) {
    logger.warn('❌ Invalid service parameter:', { service });
    return res.status(400).json({
      error: 'Invalid service parameter',
      message: 'Service name must follow the format: [ServiceName]Service'
    });
  }

  // Sanitize the service parameter to prevent directory traversal
  const sanitizedService = service.replace(/[^a-zA-Z0-9_]/g, '');
  req.params.service = sanitizedService;

  next();
};

module.exports = {
  validate,
  validateBirthData,
  validateServiceExecution,
  validateWhatsAppMessage,
  validateWhatsAppWebhook,
  validateRazorpayWebhook,
  validateStripeWebhook,
  validateUserInput,
  validateServiceParams
};
