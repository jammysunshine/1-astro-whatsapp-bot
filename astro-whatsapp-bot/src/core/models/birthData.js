const Joi = require('joi');
const path = require('path');
const fs = require('fs');

// Import the birth data schema
// We'll build the schema inline to avoid circular dependencies
const birthDataSchema = Joi.object({
  birthDate: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({
      'string.pattern.base': 'Birth date must be in YYYY-MM-DD format',
      'any.required': 'Birth date is required'
    }),
  birthTime: Joi.string()
    .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required()
    .messages({
      'string.pattern.base': 'Birth time must be in HH:MM format',
      'any.required': 'Birth time is required'
    }),
  birthPlace: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Birth place must be at least 2 characters long',
      'string.max': 'Birth place cannot exceed 100 characters',
      'any.required': 'Birth place is required'
    }),
  latitude: Joi.number()
    .min(-90)
    .max(90)
    .required()
    .messages({
      'number.min': 'Latitude must be between -90 and 90',
      'number.max': 'Latitude must be between -90 and 90',
      'any.required': 'Latitude is required'
    }),
  longitude: Joi.number()
    .min(-180)
    .max(180)
    .required()
    .messages({
      'number.min': 'Longitude must be between -180 and 180',
      'number.max': 'Longitude must be between -180 and 180',
      'any.required': 'Longitude is required'
    }),
  timezone: Joi.string()
    .optional()
    .default('UTC')
    .messages({
      'string.base': 'Timezone must be a string'
    }),
  name: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Name must be at least 1 character long',
      'string.max': 'Name cannot exceed 100 characters'
    }),
  gender: Joi.string()
    .valid('male', 'female', 'other', 'prefer_not_to_say')
    .optional()
    .messages({
      'any.only': 'Gender must be one of: male, female, other, prefer_not_to_say'
    }),
  partnerBirthData: Joi.object().keys({
    birthDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/),
    birthTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    birthPlace: Joi.string().trim().min(2).max(100),
    latitude: Joi.number().min(-90).max(90),
    longitude: Joi.number().min(-180).max(180),
    timezone: Joi.string().default('UTC')
  }).optional()
}).messages({
  'object.unknown': 'Unknown field provided in birth data'
});

class BirthData {
  constructor(data) {
    // Use the comprehensive birth data schema for validation
    const { error, value } = birthDataSchema.validate(data, {
      stripUnknown: true,
      allowUnknown: false
    });

    if (error) {
      const errors = error.details.map(detail => detail.message);
      throw new Error(`Validation errors: ${errors.join(', ')}`);
    }

    // Assign validated and sanitized values
    Object.assign(this, value);
    this.createdAt = new Date();
  }

  validate() {
    // The validation has already been done in the constructor
    // This method is kept for backward compatibility
    return true;
  }

  toLog() {
    return {
      name: this.name,
      birthDate: this.birthDate,
      birthTime: this.birthTime,
      birthPlace: this.birthPlace,
      gender: this.gender,
      latitude: this.latitude,
      longitude: this.longitude,
      timezone: this.timezone
    };
  }
}

module.exports = BirthData;
