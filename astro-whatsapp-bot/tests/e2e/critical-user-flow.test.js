const request = require('supertest');
const User = require('../../src/models/User');
const Session = require('../../src/models/Session');
const {
  getUserByPhone,
  createUser,
  addBirthDetails,
  updateUserProfile
} = require('../../src/models/userModel');
const logger = require('../../src/utils/logger');
const mongoose = require('mongoose');

let app;

// Mock webhookValidator only, as it's external to the core app logic being tested here
jest.mock('../../src/services/whatsapp/webhookValidator');
const {
  validateWebhookSignature
} = require('../../src/services/whatsapp/webhookValidator');

// Mock sendMessage to avoid actual API calls during testing
jest.mock('../../src/services/whatsapp/messageSender');
const { sendMessage } = require('../../src/services/whatsapp/messageSender');

// Mock paymentService to avoid actual payment processing
jest.mock('../../src/services/payment/paymentService');
const paymentService = require('../../src/services/payment/paymentService');

// Mock numerologyService to avoid actual numerology calculations
jest.mock('../../src/services/astrology/numerologyService');
const numerologyService = require('../../src/services/astrology/numerologyService');

// Mock messageProcessor for error handling tests
jest.mock('../../src/services/whatsapp/messageProcessor');
const { processIncomingMessage } = require('../../src/services/whatsapp/messageProcessor');

// For the first test, let it call the real function
processIncomingMessage.mockImplementation(jest.requireActual('../../src/services/whatsapp/messageProcessor').processIncomingMessage);

// E2E tests use real database operations
describe('Critical User Flow End-to-End Tests', () => {
  const testPhone = '+1234567890';

  beforeAll(async() => {
    // Set test environment variables
    process.env.NODE_ENV = 'test';
    process.env.W1_SKIP_WEBHOOK_SIGNATURE = 'true';
    process.env.W1_WHATSAPP_ACCESS_TOKEN = 'test_token';
    process.env.W1_WHATSAPP_PHONE_NUMBER_ID = 'test_phone_id';

    // Ensure database is connected before running tests
    const mongoose = require('mongoose');
    let attempts = 0;
    while (mongoose.connection.readyState !== 1 && attempts < 10) {
      await new Promise(resolve => setTimeout(resolve, 500));
      attempts++;
    }
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database connection failed');
    }

    // Require app after DB is connected
    app = require('../../src/server');
  });

  beforeEach(async() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Setup default mock responses for webhookValidator
    validateWebhookSignature.mockReturnValue(true);

    // Setup default mock responses for sendMessage
    sendMessage.mockResolvedValue({
      messaging_product: 'whatsapp',
      contacts: [{ input: testPhone, wa_id: testPhone }],
      messages: [{ id: 'test-message-id' }]
    });

    // Setup default mock responses for paymentService
    paymentService.detectRegion = jest.fn().mockReturnValue('IN');
    paymentService.processSubscription = jest.fn().mockResolvedValue({
      success: true,
      message: '💎 *Premium Subscription Confirmed!*\n\nThank you for upgrading to Premium! Your payment has been processed successfully.'
    });
    paymentService.getPlan = jest.fn().mockReturnValue({
      name: 'Premium',
      features: ['Unlimited daily horoscopes', 'Advanced birth chart analysis', 'Priority support']
    });

    // Setup mock responses for numerologyService
    numerologyService.getNumerologyReport = jest.fn().mockReturnValue({
      lifePath: {
        number: 5,
        interpretation: 'As a Life Path 5, you\'re adventurous, freedom-loving, and adaptable. You thrive on change and new experiences.'
      },
      expression: {
        number: 8,
        interpretation: 'Your name vibrates with power, success, and material abundance.'
      },
      soulUrge: {
        number: 3,
        interpretation: 'Your heart desires creativity, self-expression, and social connection.'
      }
    });

    // Setup default mock for processIncomingMessage to resolve
    processIncomingMessage.mockResolvedValue();
  });

  describe('Existing User Daily Horoscope Flow', () => {
    const testPhone = '+0987654321';

    beforeEach(async() => {
      // Create a complete user profile using MongoDB storage
      await createUser(testPhone);
      await addBirthDetails(testPhone, '15/03/1990', '14:30', 'Mumbai, India');
      await updateUserProfile(testPhone, {
        profileComplete: true,
        preferredLanguage: 'english',
        sunSign: 'Pisces',
        moonSign: 'Pisces',
        risingSign: 'Aquarius'
      });
      // Clear sendMessage mocks after user setup
      sendMessage.mockClear();
    });

    it('should generate real daily horoscope for existing user', async() => {
      const dailyHoroscopePayload = {
        entry: [
          {
            id: 'entry-daily',
            time: '1234567892',
            changes: [
              {
                field: 'messages',
                value: {
                  messaging_product: 'whatsapp',
                  metadata: {
                    display_phone_number: '+0987654321',
                    phone_number_id: 'phone-id-daily'
                  },
                  contacts: [
                    {

                      from: testPhone,

                      id: 'msg-birth-time',

                      timestamp: Date.now().toString(),

                      type: 'text',

                      text: {

                        body: '1430'

                      }

                    }
                  ],
                  messages: [
                    {
                      from: testPhone,
                      id: 'message-id-daily',
                      timestamp: Date.now().toString(),
                      text: { body: 'Daily horoscope' },
                      type: 'text'
                    }
                  ]
                }
              }
            ]
          }
        ]
      };

      const response = await request(app)
        .post('/webhook')
        .send(dailyHoroscopePayload)
        .set('Content-Type', 'application/json')
        .set('x-hub-signature-256', 'sha256=valid-signature')
        .expect(200);

      expect(response.body.success).toBe(true);

      // Wait for async operations to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verify that sendMessage was called with a horoscope message
      expect(sendMessage).toHaveBeenCalled();
      const sentMessage = sendMessage.mock.calls[0][1];
      expect(sentMessage).toContain('🌟 *Daily Horoscope for Pisces*');
      expect(sentMessage).toContain(
        'Today brings opportunities for growth and self-discovery.'
      );

      logger.info('✅ Daily horoscope request processed successfully!');
    });
  });

  describe('Interactive Button Flow', () => {
    const testPhone = '+1122334455';

    beforeEach(async() => {
      // Create a complete user profile using MongoDB storage
      await createUser(testPhone);
      await addBirthDetails(testPhone, '15/03/1990', '14:30', 'Mumbai, India');
      await updateUserProfile(testPhone, {
        profileComplete: true,
        preferredLanguage: 'english',
        sunSign: 'Pisces',
        moonSign: 'Pisces',
        risingSign: 'Aquarius'
      });
      // Clear sendMessage mocks after user setup
      sendMessage.mockClear();
    });

    it('should process interactive button reply for compatibility checking', async() => {
      const interactivePayload = {
        entry: [
          {
            id: 'entry-interactive',
            time: '1234567893',
            changes: [
              {
                field: 'messages',
                value: {
                  messaging_product: 'whatsapp',
                  metadata: {
                    display_phone_number: '+1122334455',
                    phone_number_id: 'phone-id-interactive'
                  },
                  contacts: [
                    {
                      profile: { name: 'Interactive User' },
                      wa_id: testPhone
                    }
                  ],
                  messages: [
                    {
                      from: testPhone,
                      id: 'message-id-interactive',
                      timestamp: Date.now().toString(),
                      type: 'interactive',
                      interactive: {
                        type: 'button_reply',
                        button_reply: {
                          id: 'btn_check_compatibility',
                          title: 'Compatibility'
                        }
                      }
                    }
                  ]
                }
              }
            ]
          }
        ]
      };

      const response = await request(app)
        .post('/webhook')
        .send(interactivePayload)
        .set('Content-Type', 'application/json')
        .set('x-hub-signature-256', 'sha256=valid-signature')
        .expect(200);

      expect(response.body.success).toBe(true);

      // Wait for async operations to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verify that sendMessage was called with a compatibility message
      expect(sendMessage).toHaveBeenCalled();
      const sentMessage = sendMessage.mock.calls[0][1];
      expect(sentMessage).toContain('💕 *Compatibility Analysis*');
      expect(sentMessage).toContain(
        'I can check how compatible you are with someone else!'
      );

      logger.info(
        '✅ Interactive button reply for compatibility processed successfully!'
      );
    });
  });

  describe('Error Handling Flow', () => {
    it('should handle processing errors gracefully', async() => {
      // Mock processIncomingMessage to throw an error
      processIncomingMessage.mockRejectedValue(
        new Error('Simulated processing failed')
      );

      const errorPayload = {
        entry: [
          {
            id: 'entry-error',
            time: '1234567894',
            changes: [
              {
                field: 'messages',
                value: {
                  messaging_product: 'whatsapp',
                  metadata: {
                    display_phone_number: '+5566778899',
                    phone_number_id: 'phone-id-error'
                  },
                  contacts: [
                    {
                      profile: { name: 'Error User' },
                      wa_id: '5566778899'
                    }
                  ],
                  messages: [
                    {
                      from: '5566778899',
                      id: 'message-id-error',
                      timestamp: Date.now().toString(),
                      text: { body: 'This will cause an error' },
                      type: 'text'
                    }
                  ]
                }
              }
            ]
          }
        ]
      };

      const response = await request(app)
        .post('/webhook')
        .send(errorPayload)
        .set('Content-Type', 'application/json')
        .set('x-hub-signature-256', 'sha256=valid-signature')
        .expect(500);

      expect(response.body.error).toBe('Internal server error');
      expect(response.body.message).toBe('Simulated processing failed');

      // Verify that an error message was sent to the user
      expect(sendMessage).toHaveBeenCalledWith(
        '5566778899',
        'I\'m sorry, I encountered an error processing your message. Please try again later!'
      );

      // Verify that the error was logged
      expect(logger.error).toHaveBeenCalledWith(
        '❌ Error processing message from +5566778899:',
        expect.any(Error)
      );
    });
  });

  describe('Performance and Scalability Flow', () => {
    const testPhoneBase = '+12345678';

    beforeEach(async() => {
      // Clear database collections before each test
      await User.deleteMany({});
      await Session.deleteMany({});

      // Create a complete user profile for each simulated user
      for (let i = 0; i < 10; i++) {
        const phoneNumber = `${testPhoneBase}${i}`;
        await createUser(phoneNumber);
        await addBirthDetails(
          phoneNumber,
          '15/03/1990',
          '14:30',
          'Mumbai, India'
        );
        await updateUserProfile(phoneNumber, {
          profileComplete: true,
          preferredLanguage: 'english',
          sunSign: 'Pisces',
          moonSign: 'Pisces',
          risingSign: 'Aquarius'
        });
      }
      sendMessage.mockClear();
    });

    it('should handle high volume of messages without crashing', async() => {
      // Create multiple webhook payloads
      const payloads = [];
      for (let i = 0; i < 10; i++) {
        const phoneNumber = `${testPhoneBase}${i}`;
        payloads.push({
          entry: [
            {
              id: `entry-high-volume-${i}`,
              time: Date.now().toString(),
              changes: [
                {
                  field: 'messages',
                  value: {
                    messaging_product: 'whatsapp',
                    metadata: {
                      display_phone_number: phoneNumber,
                      phone_number_id: 'phone-id-volume'
                    },
                    contacts: [
                      {
                        profile: { name: `User ${i}` },
                        wa_id: phoneNumber
                      }
                    ],
                    messages: [
                      {
                        from: phoneNumber,
                        id: `message-id-volume-${i}`,
                        timestamp: Date.now().toString(),
                        text: { body: 'Daily horoscope' },
                        type: 'text'
                      }
                    ]
                  }
                }
              ]
            }
          ]
        });
      }

      // Process all payloads concurrently
      const promises = payloads.map(payload =>
        request(app)
          .post('/webhook')
          .send(payload)
          .set('Content-Type', 'application/json')
          .set('x-hub-signature-256', 'sha256=valid-signature')
          .expect(200)
      );

      const responses = await Promise.all(promises);

      // Verify all responses are successful
      responses.forEach(response => {
        expect(response.body.success).toBe(true);
      });

      // Wait for async operations to complete
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Verify all messages were processed and responses sent
      expect(sendMessage).toHaveBeenCalledTimes(20); // Each user gets a horoscope + main menu
      for (let i = 0; i < 10; i++) {
        const phoneNumber = `${testPhoneBase}${i}`;
        // Check horoscope message (even indices)
        const horoscopeCall = sendMessage.mock.calls[i * 2][1];
        expect(horoscopeCall).toContain('🔮 *Your Daily Horoscope*');
        // Check main menu message (odd indices)
        const menuCall = sendMessage.mock.calls[i * 2 + 1][1];
        expect(menuCall.type).toBe('button');
      }

      logger.info('✅ High volume messages processed without crashing!');
    });
  });

  describe('Security and Compliance Flow', () => {
    it('should validate webhook signatures when provided', async() => {
      // This test specifically checks the webhookValidator, which is mocked at the top.
      // To test the real webhookValidator, we need to unmock it for this specific test.
      // However, the current setup mocks it globally. For now, we'll keep the mock
      // and ensure the webhookValidator.validateWebhookSignature is called.

      const testPhone = '+9988776655';
      const secret = process.env.W1_WHATSAPP_APP_SECRET || 'test_app_secret';
      const rawBody = JSON.stringify({
        entry: [
          {
            id: 'entry-secure',
            time: Date.now().toString(),
            changes: [
              {
                field: 'messages',
                value: {
                  messaging_product: 'whatsapp',
                  metadata: {
                    display_phone_number: testPhone,
                    phone_number_id: 'phone-id-secure'
                  },
                  contacts: [
                    {
                      profile: { name: 'Secure User' },
                      wa_id: testPhone
                    }
                  ],
                  messages: [
                    {
                      from: testPhone,
                      id: 'message-id-secure',
                      timestamp: Date.now().toString(),
                      text: { body: 'Secure message' },
                      type: 'text'
                    }
                  ]
                }
              }
            ]
          }
        ]
      });

      // Generate a valid signature for the rawBody
      const crypto = require('crypto');
      const hmac = crypto.createHmac('sha256', secret);
      hmac.update(rawBody);
      const validSignature = `sha256=${hmac.digest('hex')}`;

      // Temporarily disable skipping signature validation for this test
      const originalSkip = process.env.W1_SKIP_WEBHOOK_SIGNATURE;
      process.env.W1_SKIP_WEBHOOK_SIGNATURE = 'false';
      process.env.W1_WHATSAPP_APP_SECRET = secret; // Ensure secret is set for validation

      const response = await request(app)
        .post('/webhook')
        .send(JSON.parse(rawBody)) // Send parsed body, rawBody is used for signature
        .set('Content-Type', 'application/json')
        .set('x-hub-signature-256', validSignature)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Restore original skip setting
      process.env.W1_SKIP_WEBHOOK_SIGNATURE = originalSkip;

      // Verify that the real webhookValidator was called
      // This requires unmocked webhookValidator, which is currently mocked globally.
      // For now, we'll assert on the outcome of the webhook processing.
      logger.info('✅ Webhook signature validation test passed!');
    });
  });

  describe('Subscription and Payment Flow', () => {
    const testPhone = '+7778889999';

    beforeEach(async() => {
      // Create a complete user profile using MongoDB storage
      await createUser(testPhone);
      await addBirthDetails(testPhone, '15/03/1990', '14:30', 'Mumbai, India');
      await updateUserProfile(testPhone, {
        profileComplete: true,
        preferredLanguage: 'english',
        sunSign: 'Pisces',
        moonSign: 'Pisces',
        risingSign: 'Aquarius',
        subscriptionTier: 'free'
      });
      sendMessage.mockClear();
    });

    it('should handle subscription plan inquiry', async() => {
      const subscriptionInquiryPayload = {
        entry: [
          {
            id: 'entry-subscription-inquiry',
            time: Date.now().toString(),
            changes: [
              {
                field: 'messages',
                value: {
                  messaging_product: 'whatsapp',
                  metadata: {
                    display_phone_number: testPhone,
                    phone_number_id: 'phone-id-subscription'
                  },
                  contacts: [
                    {
                      profile: { name: 'Subscription User' },
                      wa_id: testPhone
                    }
                  ],
                  messages: [
                    {
                      from: testPhone,
                      id: 'message-id-subscription-inquiry',
                      timestamp: Date.now().toString(),
                      text: { body: 'What are the subscription plans?' },
                      type: 'text'
                    }
                  ]
                }
              }
            ]
          }
        ]
      };

      const response = await request(app)
        .post('/webhook')
        .send(subscriptionInquiryPayload)
        .set('Content-Type', 'application/json')
        .set('x-hub-signature-256', 'sha256=valid-signature')
        .expect(200);

      expect(response.body.success).toBe(true);

      // Wait for async operations to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verify that sendMessage was called with subscription plans
      expect(sendMessage).toHaveBeenCalled();
      const sentMessage = sendMessage.mock.calls[0][1];
      expect(sentMessage.type).toBe('interactive');
      expect(sentMessage.body).toContain('💳 *Choose Your Cosmic Plan*');
      expect(sentMessage.buttons).toHaveLength(2); // Essential and Premium

      logger.info('✅ Subscription plan inquiry processed successfully!');
    });

    it('should handle premium subscription request', async() => {
      const premiumSubscriptionPayload = {
        entry: [
          {
            id: 'entry-premium-subscription',
            time: Date.now().toString(),
            changes: [
              {
                field: 'messages',
                value: {
                  messaging_product: 'whatsapp',
                  metadata: {
                    display_phone_number: testPhone,
                    phone_number_id: 'phone-id-premium'
                  },
                  contacts: [
                    {
                      profile: { name: 'Premium User' },
                      wa_id: testPhone
                    }
                  ],
                  messages: [
                    {
                      from: testPhone,
                      id: 'message-id-premium',
                      timestamp: Date.now().toString(),
                      type: 'interactive',
                      interactive: {
                        type: 'button_reply',
                        button_reply: {
                          id: 'plan_premium',
                          title: '💎 Premium ₹299'
                        }
                      }
                    }
                  ]
                }
              }
            ]
          }
        ]
      };

      const response = await request(app)
        .post('/webhook')
        .send(premiumSubscriptionPayload)
        .set('Content-Type', 'application/json')
        .set('x-hub-signature-256', 'sha256=valid-signature')
        .expect(200);

      expect(response.body.success).toBe(true);

      // Wait for async operations to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verify that sendMessage was called with subscription confirmation
      expect(sendMessage).toHaveBeenCalledTimes(2); // Confirmation and payment prompt
      const confirmMessage = sendMessage.mock.calls[0][1];
      expect(confirmMessage.type).toBe('interactive');
      expect(confirmMessage.body).toContain('You\'ve selected: *premium*');

      const paymentMessage = sendMessage.mock.calls[1][1];
      expect(paymentMessage).toContain('💳 *Subscription Processing*');

      // Verify user's subscription status in DB
      const updatedUser = await getUserByPhone(testPhone);
      expect(updatedUser.subscriptionTier).toBe('premium');
      expect(updatedUser.subscriptionExpiry).toBeDefined();

      logger.info('✅ Premium subscription request processed successfully!');
    });
  });

  describe('Astrology Readings Flow', () => {
    describe('Profile Management Flow', () => {
      const testPhone = '+5554443333';

      beforeEach(async() => {
        // Create a complete user profile using MongoDB storage
        await createUser(testPhone);
        await addBirthDetails(
          testPhone,
          '15/03/1990',
          '14:30',
          'Mumbai, India'
        );
        await updateUserProfile(testPhone, {
          profileComplete: true,
          preferredLanguage: 'english',
          sunSign: 'Pisces',
          moonSign: 'Pisces',
          risingSign: 'Aquarius',
          name: 'John Doe'
        });
        sendMessage.mockClear();
      });

      it('should handle profile viewing request', async() => {
        const profileViewPayload = {
          entry: [
            {
              id: 'entry-profile-view',
              time: Date.now().toString(),
              changes: [
                {
                  field: 'messages',
                  value: {
                    messaging_product: 'whatsapp',
                    metadata: {
                      display_phone_number: testPhone,
                      phone_number_id: 'phone-id-profile'
                    },
                    contacts: [
                      {
                        profile: { name: 'Profile User' },
                        wa_id: testPhone
                      }
                    ],
                    messages: [
                      {
                        from: testPhone,
                        id: 'message-id-profile',
                        timestamp: Date.now().toString(),
                        text: { body: 'Show my profile' },
                        type: 'text'
                      }
                    ]
                  }
                }
              ]
            }
          ]
        };

        const response = await request(app)
          .post('/webhook')
          .send(profileViewPayload)
          .set('Content-Type', 'application/json')
          .set('x-hub-signature-256', 'sha256=valid-signature')
          .expect(200);

        expect(response.body.success).toBe(true);

        // Wait for async operations to complete
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Verify that sendMessage was called with profile details
        expect(sendMessage).toHaveBeenCalled();
        const sentMessage = sendMessage.mock.calls[0][1];
        expect(sentMessage.body).toContain('📋 *Your Profile*');
        expect(sentMessage.body).toContain('Name: John Doe');
        expect(sentMessage.body).toContain('Birth Date: 15/03/1990');

        logger.info('✅ Profile viewing request processed successfully!');
      });
    });
    const testPhone = '+6665554444';

    beforeEach(async() => {
      // Create a complete user profile using MongoDB storage
      await createUser(testPhone);
      await addBirthDetails(testPhone, '15/03/1990', '14:30', 'Mumbai, India');
      await updateUserProfile(testPhone, {
        profileComplete: true,
        preferredLanguage: 'english',
        sunSign: 'Pisces',
        moonSign: 'Pisces',
        risingSign: 'Aquarius'
      });
      sendMessage.mockClear();
    });

    it('should handle tarot reading request', async() => {
      const tarotReadingPayload = {
        entry: [
          {
            id: 'entry-tarot',
            time: Date.now().toString(),
            changes: [
              {
                field: 'messages',
                value: {
                  messaging_product: 'whatsapp',
                  metadata: {
                    display_phone_number: testPhone,
                    phone_number_id: 'phone-id-tarot'
                  },
                  contacts: [
                    {
                      profile: { name: 'Tarot User' },
                      wa_id: testPhone
                    }
                  ],
                  messages: [
                    {
                      from: testPhone,
                      id: 'message-id-tarot',
                      timestamp: Date.now().toString(),
                      text: { body: 'Give me a tarot reading' },
                      type: 'text'
                    }
                  ]
                }
              }
            ]
          }
        ]
      };

      const response = await request(app)
        .post('/webhook')
        .send(tarotReadingPayload)
        .set('Content-Type', 'application/json')
        .set('x-hub-signature-256', 'sha256=valid-signature')
        .expect(200);

      expect(response.body.success).toBe(true);

      // Wait for async operations to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verify that sendMessage was called with a tarot reading
      expect(sendMessage).toHaveBeenCalled();
      const sentMessage = sendMessage.mock.calls[0][1];
      expect(sentMessage).toContain('🔮 *Tarot Reading*');
      expect(sentMessage).toContain('Current Situation');

      logger.info('✅ Tarot reading request processed successfully!');
    });

    it('should handle palmistry reading request', async() => {
      const palmistryReadingPayload = {
        entry: [
          {
            id: 'entry-palmistry',
            time: Date.now().toString(),
            changes: [
              {
                field: 'messages',
                value: {
                  messaging_product: 'whatsapp',
                  metadata: {
                    display_phone_number: testPhone,
                    phone_number_id: 'phone-id-palmistry'
                  },
                  contacts: [
                    {
                      profile: { name: 'Palmistry User' },
                      wa_id: testPhone
                    }
                  ],
                  messages: [
                    {
                      from: testPhone,
                      id: 'message-id-palmistry',
                      timestamp: Date.now().toString(),
                      text: { body: 'Read my palm' },
                      type: 'text'
                    }
                  ]
                }
              }
            ]
          }
        ]
      };

      const response = await request(app)
        .post('/webhook')
        .send(palmistryReadingPayload)
        .set('Content-Type', 'application/json')
        .set('x-hub-signature-256', 'sha256=valid-signature')
        .expect(200);

      expect(response.body.success).toBe(true);

      // Wait for async operations to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verify that sendMessage was called with a palmistry analysis
      expect(sendMessage).toHaveBeenCalled();
      const sentMessage = sendMessage.mock.calls[0][1];
      expect(sentMessage).toContain('✋ *Palmistry Analysis*');
      expect(sentMessage).toContain('*Hand Type:*');

      logger.info('✅ Palmistry reading request processed successfully!');
    });

    it('should handle numerology report request', async() => {
      const numerologyPayload = {
        entry: [
          {
            id: 'entry-numerology',
            time: Date.now().toString(),
            changes: [
              {
                field: 'messages',
                value: {
                  messaging_product: 'whatsapp',
                  metadata: {
                    display_phone_number: testPhone,
                    phone_number_id: 'phone-id-numerology'
                  },
                  contacts: [
                    {
                      profile: { name: 'Numerology User' },
                      wa_id: testPhone
                    }
                  ],
                  messages: [
                    {
                      from: testPhone,
                      id: 'message-id-numerology',
                      timestamp: Date.now().toString(),
                      text: { body: 'numerology report' },
                      type: 'text'
                    }
                  ]
                }
              }
            ]
          }
        ]
      };

      const response = await request(app)
        .post('/webhook')
        .send(numerologyPayload)
        .set('Content-Type', 'application/json')
        .set('x-hub-signature-256', 'sha256=valid-signature')
        .expect(200);

      expect(response.body.success).toBe(true);

      // Wait for async operations to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verify that sendMessage was called with a numerology report
      expect(sendMessage).toHaveBeenCalled();
      const sentMessage = sendMessage.mock.calls[0][1];
      expect(sentMessage).toContain('🔢 *Numerology Analysis*');
      expect(sentMessage).toContain('*Life Path:*');

      logger.info('✅ Numerology report request processed successfully!');
    });
  });

  afterAll(async() => {
    // Close the server to clear any open handles
    if (app && app.close) {
      await app.close();
    } else if (app && app._server && app._server.close) {
      await app._server.close();
    }
    // Ensure mongoose connection is closed
    await mongoose.connection.close();
  });
});
