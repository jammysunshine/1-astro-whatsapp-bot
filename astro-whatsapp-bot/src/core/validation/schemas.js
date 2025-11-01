const Joi = require('joi');

// Common validation patterns
const patterns = {
  phoneNumber: /^[\+]?[1-9][\d]{0,15}$/, // International phone number format
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  date: /^\d{4}-\d{2}-\d{2}$/,
  time: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
  coordinates: /^-?([0-8]?[0-9]|90)(\.\d+)?$/, // Latitude/longitude
  location: /^[a-zA-Z\s,.'-]{2,100}$/ // Location name/area
};

// Birth data validation schema
const birthDataSchema = Joi.object({
  birthDate: Joi.string()
    .pattern(patterns.date)
    .required()
    .messages({
      'string.pattern.base': 'Birth date must be in YYYY-MM-DD format',
      'any.required': 'Birth date is required'
    }),
  birthTime: Joi.string()
    .pattern(patterns.time)
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
  partnerBirthData: Joi.object().keys({
    birthDate: Joi.string().pattern(patterns.date),
    birthTime: Joi.string().pattern(patterns.time),
    birthPlace: Joi.string().trim().min(2).max(100),
    latitude: Joi.number().min(-90).max(90),
    longitude: Joi.number().min(-180).max(180),
    timezone: Joi.string().default('UTC')
  }).optional()
}).messages({
  'object.unknown': 'Unknown field provided in birth data'
});

// Service execution schema
const serviceExecutionSchema = Joi.object({
  data: Joi.alternatives().try(
    birthDataSchema,
    Joi.object().min(1), // For other types of data
    Joi.array().min(1)
  ).required(),
  options: Joi.object({
    format: Joi.string().valid('json', 'text', 'html').optional(),
    language: Joi.string().length(2).pattern(/^[a-z]{2}$/).optional(),
    detailed: Joi.boolean().optional()
  }).optional()
});

// WhatsApp message validation schema
const whatsappMessageSchema = Joi.object({
  from: Joi.string()
    .pattern(/^[0-9]{10,15}$/) // WhatsApp ID format
    .required()
    .messages({
      'string.pattern.base': 'Invalid WhatsApp number format',
      'any.required': 'WhatsApp number is required'
    }),
  id: Joi.string().required().messages({
    'any.required': 'Message ID is required'
  }),
  timestamp: Joi.string().required().messages({
    'any.required': 'Message timestamp is required'
  }),
  type: Joi.string()
    .valid('text', 'image', 'video', 'audio', 'document', 'location', 'contact', 'interactive', 'button', 'list')
    .required()
    .messages({
      'any.required': 'Message type is required',
      'any.only': 'Invalid message type'
    }),
  text: Joi.object({
    body: Joi.string().max(4096).required() // WhatsApp message limit
  })
    .when('type', { is: 'text', then: Joi.required(), otherwise: Joi.optional() })
    .messages({
      'any.required': 'Text body is required for text messages'
    }),
  image: Joi.object({
    id: Joi.string().required(),
    link: Joi.string().uri().optional(),
    caption: Joi.string().max(1024).optional()
  })
    .when('type', { is: 'image', then: Joi.required(), otherwise: Joi.optional() }),
  video: Joi.object({
    id: Joi.string().required(),
    link: Joi.string().uri().optional(),
    caption: Joi.string().max(1024).optional()
  })
    .when('type', { is: 'video', then: Joi.required(), otherwise: Joi.optional() }),
  document: Joi.object({
    id: Joi.string().required(),
    link: Joi.string().uri().optional(),
    filename: Joi.string().max(255).optional()
  })
    .when('type', { is: 'document', then: Joi.required(), otherwise: Joi.optional() }),
  location: Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
    name: Joi.string().max(100).optional(),
    address: Joi.string().max(255).optional()
  })
    .when('type', { is: 'location', then: Joi.required(), otherwise: Joi.optional() }),
  contact: Joi.object({
    addresses: Joi.array().items(Joi.object({
      street: Joi.string().max(255).optional(),
      city: Joi.string().max(100).optional(),
      state: Joi.string().max(100).optional(),
      zip: Joi.string().max(20).optional(),
      country: Joi.string().max(100).optional(),
      type: Joi.string().valid('HOME', 'WORK').optional()
    })).optional(),
    birthday: Joi.string().pattern(/^([0-9]{4})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/).optional(),
    emails: Joi.array().items(Joi.object({
      email: Joi.string().email().required(),
      type: Joi.string().valid('HOME', 'WORK').optional()
    })).optional(),
    name: Joi.object({
      first_name: Joi.string().max(100).required(),
      last_name: Joi.string().max(100).optional(),
      middle_name: Joi.string().max(100).optional(),
      suffix: Joi.string().max(100).optional(),
      prefix: Joi.string().max(100).optional()
    }).required(),
    org: Joi.object({
      company: Joi.string().max(100).optional(),
      department: Joi.string().max(100).optional(),
      title: Joi.string().max(100).optional()
    }).optional(),
    phones: Joi.array().items(Joi.object({
      phone: Joi.string().max(30).required(),
      type: Joi.string().valid('CELL', 'MAIN', 'IPHONE', 'HOME', 'WORK').optional(),
      wa_id: Joi.string().pattern(/^[0-9]{10,15}$/).optional()
    })).optional(),
    urls: Joi.array().items(Joi.object({
      url: Joi.string().uri().required(),
      type: Joi.string().valid('HOME', 'WORK').optional()
    })).optional()
  })
    .when('type', { is: 'contact', then: Joi.required(), otherwise: Joi.optional() }),
  interactive: Joi.object({
    type: Joi.string().valid('button_reply', 'list_reply').required(),
    button_reply: Joi.object({
      id: Joi.string().required(),
      title: Joi.string().max(100).required()
    }).when('..type', { is: 'button_reply', then: Joi.required(), otherwise: Joi.optional() }),
    list_reply: Joi.object({
      id: Joi.string().required(),
      title: Joi.string().max(100).required(),
      description: Joi.string().max(1000).optional()
    }).when('..type', { is: 'list_reply', then: Joi.required(), otherwise: Joi.optional() }),
    title: Joi.string().max(100).required()
  })
    .when('type', { is: 'interactive', then: Joi.required(), otherwise: Joi.optional() }),
  button: Joi.object({
    payload: Joi.string().max(1024).required(),
    text: Joi.string().max(20).required()
  })
    .when('type', { is: 'button', then: Joi.required(), otherwise: Joi.optional() })
}).messages({
  'object.unknown': 'Unknown field provided in message object'
});

// WhatsApp webhook validation schema
const whatsappWebhookSchema = Joi.object({
  object: Joi.string().valid('whatsapp_business_account').required(),
  entry: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().required(),
        changes: Joi.array()
          .items(
            Joi.object({
              value: Joi.object({
                messaging_product: Joi.string().valid('whatsapp').required(),
                metadata: Joi.object({
                  display_phone_number: Joi.string().required(),
                  phone_number_id: Joi.string().required()
                }).optional(),
                contacts: Joi.array()
                  .items(
                    Joi.object({
                      profile: Joi.object({
                        name: Joi.string().max(255).optional()
                      }).optional(),
                      wa_id: Joi.string().required()
                    })
                  )
                  .optional(),
                messages: Joi.array()
                  .items(whatsappMessageSchema)
                  .optional(),
                statuses: Joi.array()
                  .items(
                    Joi.object({
                      id: Joi.string().required(),
                      status: Joi.string()
                        .valid('sent', 'delivered', 'read', 'failed')
                        .required(),
                      timestamp: Joi.string().required(),
                      recipient_id: Joi.string().required()
                    })
                  )
                  .optional()
              }).required(),
              field: Joi.string().valid('messages').required()
            })
          )
          .required()
      })
    )
    .required()
});

// Payment webhook validation schemas
const razorpayWebhookSchema = Joi.object({
  event: Joi.string()
    .valid(
      'payment.captured',
      'payment.authorized',
      'payment.failed',
      'order.created',
      'refund.created'
    )
    .required(),
  payload: Joi.object({
    payment: Joi.object({
      entity: Joi.object({
        id: Joi.string().required(),
        amount: Joi.number().integer().min(0).required(),
        currency: Joi.string().length(3).required(),
        status: Joi.string()
          .valid('created', 'authorized', 'captured', 'failed')
          .required()
      }).required()
    }).optional(),
    order: Joi.object({
      entity: Joi.object({
        id: Joi.string().required(),
        amount: Joi.number().integer().min(0).required(),
        currency: Joi.string().length(3).required(),
        status: Joi.string()
          .valid('created', 'paid', 'attempted', 'cancelled', 'expired')
          .required()
      }).required()
    }).optional()
  }).required(),
  created_at: Joi.number().integer().required()
});

const stripeWebhookSchema = Joi.object({
  id: Joi.string().required(),
  object: Joi.string().valid('event', 'payment_intent', 'checkout.session').required(),
  type: Joi.string().required(),
  created: Joi.number().integer().required(),
  data: Joi.object({
    object: Joi.object().required()
  }).required(),
  livemode: Joi.boolean().optional(),
  pending_webhooks: Joi.number().integer().optional()
});

// User input validation for various services
const userInputSchema = Joi.object({
  question: Joi.string().max(1000).optional().messages({
    'string.max': 'Question cannot exceed 1000 characters'
  }),
  name: Joi.string().max(100).optional().messages({
    'string.max': 'Name cannot exceed 100 characters'
  }),
  email: Joi.string().email().optional().messages({
    'string.email': 'Invalid email format'
  }),
  phone: Joi.string().pattern(patterns.phoneNumber).optional().messages({
    'string.pattern.base': 'Invalid phone number format'
  }),
  location: Joi.string().max(200).optional().messages({
    'string.max': 'Location cannot exceed 200 characters'
  }),
  date: Joi.string().pattern(patterns.date).optional().messages({
    'string.pattern.base': 'Date must be in YYYY-MM-DD format'
  }),
  time: Joi.string().pattern(patterns.time).optional().messages({
    'string.pattern.base': 'Time must be in HH:MM format'
  })
});

// Generic validation schema for any data
const genericDataSchema = Joi.object({
  data: Joi.alternatives().try(
    Joi.string().max(5000),
    Joi.number(),
    Joi.boolean(),
    Joi.object().max(100), // Limit object nesting
    Joi.array().max(100)   // Limit array size
  ).required()
});

module.exports = {
  birthDataSchema,
  serviceExecutionSchema,
  whatsappMessageSchema,
  whatsappWebhookSchema,
  razorpayWebhookSchema,
  stripeWebhookSchema,
  userInputSchema,
  genericDataSchema,
  patterns
};
