const Joi = require('joi');
const { ValidationError } = require('./errorHandler');

/**
 * Input validation utilities for the astrology WhatsApp bot
 */

/**
 * Validate birth date format (DD/MM/YYYY)
 * @param {string} birthDate - Birth date string
 * @returns {boolean} True if valid
 */
const isValidBirthDate = birthDate => {
  const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = birthDate.match(dateRegex);

  if (!match) { return false; }

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);

  // Basic date validation
  if (month < 1 || month > 12) { return false; }
  if (day < 1 || day > 31) { return false; }
  if (year < 1900 || year > new Date().getFullYear()) { return false; }

  // Check days in month
  const daysInMonth = new Date(year, month, 0).getDate();
  if (day > daysInMonth) { return false; }

  return true;
};

/**
 * Validate birth time format (HH:MM)
 * @param {string} birthTime - Birth time string
 * @returns {boolean} True if valid
 */
const isValidBirthTime = birthTime => {
  if (birthTime.toLowerCase() === 'unknown') { return true; }

  const timeRegex = /^(\d{2}):(\d{2})$/;
  const match = birthTime.match(timeRegex);

  if (!match) { return false; }

  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);

  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
};

/**
 * Validate phone number (basic validation)
 * @param {string} phoneNumber - Phone number string
 * @returns {boolean} True if valid
 */
const isValidPhoneNumber = phoneNumber => {
  // Basic phone number validation (10-15 digits, may start with +)
  const phoneRegex = /^\+?\d{10,15}$/;
  return phoneRegex.test(phoneNumber.replace(/\s+/g, ''));
};

/**
 * Validate WhatsApp message payload
 * @param {Object} payload - Message payload
 * @returns {Object} Validation result
 */
const validateWhatsAppMessage = payload => {
  const schema = Joi.object({
    object: Joi.string().valid('whatsapp_business_account').required(),
    entry: Joi.array().items(
      Joi.object({
        id: Joi.string().required(),
        changes: Joi.array().items(
          Joi.object({
            value: Joi.object({
              messaging_product: Joi.string().valid('whatsapp').required(),
              metadata: Joi.object({
                display_phone_number: Joi.string().required(),
                phone_number_id: Joi.string().required()
              }).required(),
              contacts: Joi.array().items(
                Joi.object({
                  profile: Joi.object({
                    name: Joi.string().required()
                  }).required(),
                  wa_id: Joi.string().required()
                })
              ),
              messages: Joi.array().items(
                Joi.object({
                  id: Joi.string().required(),
                  from: Joi.string().required(),
                  timestamp: Joi.string().required(),
                  type: Joi.string().valid('text', 'image', 'video', 'audio', 'document', 'button', 'interactive').required()
                })
              )
            }).required(),
            field: Joi.string().valid('messages').required()
          })
        ).required()
      })
    ).required()
  });

  const { error, value } = schema.validate(payload, { allowUnknown: true });
  return { isValid: !error, error: error?.message, value };
};

/**
 * Sanitize user input to prevent XSS and injection attacks
 * @param {string} input - User input string
 * @returns {string} Sanitized input
 */
const sanitizeInput = input => {
  if (typeof input !== 'string') { return input; }

  const sanitized = input
    .replace(/<script[^>]*>|<\/script>/gi, '') // Remove script tags
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/['";()]/g, '') // Remove quotes and parentheses
    .replace(/\\/g, '') // Remove backslashes
    .replace(/\//g, '') // Remove slashes for command injection
    .trim();

  // If input contained SQL keywords, return empty string
  if (/\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b/gi.test(input)) {
    return '';
  }

  return sanitized;
};

/**
 * Validate subscription plan ID
 * @param {string} planId - Plan identifier
 * @returns {boolean} True if valid
 */
const isValidPlanId = planId => {
  const validPlans = ['free', 'essential', 'premium', 'vip'];
  return validPlans.includes(planId);
};

/**
 * Validate user profile data
 * @param {Object} profileData - Profile data object
 * @returns {Object} Validation result
 */
const validateUserProfile = profileData => {
  const schema = Joi.object({
    name: Joi.string().min(1).max(100).optional(),
    birthDate: Joi.string().pattern(/^(\d{2})\/(\d{2})\/(\d{4})$/).optional(),
    birthTime: Joi.string().pattern(/^(\d{2}):(\d{2})$/).allow('unknown').optional(),
    birthPlace: Joi.string().min(1).max(100).optional(),
    gender: Joi.string().valid('male', 'female', 'other').optional(),
    preferredLanguage: Joi.string().min(2).max(10).optional(),
    timezone: Joi.string().optional()
  });

  const { error, value } = schema.validate(profileData);
  return { isValid: !error, error: error?.message, value };
};

/**
 * Rate limiting validation
 * @param {string} identifier - User identifier (IP or phone)
 * @param {number} limit - Rate limit
 * @param {number} windowMs - Time window in milliseconds
 * @returns {boolean} True if within limits
 */
const checkRateLimit = (identifier, limit = 100, windowMs = 900000) => {
  // This would typically use Redis or in-memory cache
  // For MVP, we'll use a simple in-memory store
  const now = Date.now();
  const windowStart = now - windowMs;

  // This is a placeholder - in production, use Redis
  return true; // Allow all requests for MVP
};

module.exports = {
  isValidBirthDate,
  isValidBirthTime,
  isValidPhoneNumber,
  validateWhatsAppMessage,
  sanitizeInput,
  isValidPlanId,
  validateUserProfile,
  checkRateLimit
};
