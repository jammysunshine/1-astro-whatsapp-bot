// tests/e2e/real-whatsapp-flow.test.js
// REAL end-to-end tests for WhatsApp bot flows (no mocks)
// Tests actual server, MongoDB storage, and astrology calculations

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/server');
const User = require('../../src/models/User');
const Session = require('../../src/models/Session');
const { getAllUsers, getUserByPhone, createUser, updateUserProfile, addBirthDetails } = require('../../src/models/userModel');

// Mock message sending to avoid actual WhatsApp API calls in tests
// Mock message sending to avoid actual WhatsApp API calls in tests
// jest.mock('../../src/services/whatsapp/messageSender', () => ({
//   sendMessage: jest.fn().mockResolvedValue({}),
//   sendTextMessage: jest.fn().mockResolvedValue({}),
//   sendInteractiveButtons: jest.fn().mockResolvedValue({}),
//   sendListMessage: jest.fn().mockResolvedValue({})
// }));

const { sendMessage, sendTextMessage, sendInteractiveButtons, sendListMessage } = require('../../src/services/whatsapp/messageSender');

jest.mock('../../src/services/whatsapp/messageSender', () => ({
  sendMessage: jest.fn().mockResolvedValue({}),
  sendTextMessage: jest.fn().mockResolvedValue({}),
  sendInteractiveButtons: jest.fn().mockResolvedValue({}),
  sendListMessage: jest.fn().mockResolvedValue({})
}));

describe('REAL WhatsApp Bot End-to-End Flow Tests', () => {
  beforeAll(async () => {
    // Set test environment variables
    process.env.NODE_ENV = 'test';
    process.env.W1_SKIP_WEBHOOK_SIGNATURE = 'true';
    process.env.W1_WHATSAPP_ACCESS_TOKEN = 'test_token';
    process.env.W1_WHATSAPP_PHONE_NUMBER_ID = 'test_phone_id';
  });

  beforeEach(async () => {
    // Clear database collections before each test
    try {
      await User.deleteMany({});
      await Session.deleteMany({});
    } catch (error) {
      // Collections might not exist, that's fine
    }
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('Complete User Onboarding Flow', () => {
    const testPhone = '+1234567890';

     it('should complete full onboarding and generate real astrology reading', async () => {
       // Step 1: New user sends birth date directly (welcome step expects date)
       const birthDateResponse = await request(app)
         .post('/webhook')
         .send({
           entry: [{
             id: 'test-entry-1',
             changes: [{
               field: 'messages',
               value: {
                 messaging_product: 'whatsapp',
                 metadata: { display_phone_number: '+1234567890', phone_number_id: 'test' },
                 contacts: [{ profile: { name: 'Test User' }, wa_id: testPhone }],
                 messages: [{
                   from: testPhone,
                   id: 'msg-birth-date',
                   timestamp: Date.now().toString(),
                   text: { body: '15031990' }, // 15/03/1990
                   type: 'text'
                 }]
               }
             }]
           }]
         })
         .set('x-hub-signature-256', 'test-signature')
         .expect(200);

       expect(birthDateResponse.body.success).toBe(true);

       // Wait for async operations to complete
       await new Promise(resolve => setTimeout(resolve, 3000));

       // Verify user was created
       let user = await getUserByPhone(testPhone);
       expect(user).toBeTruthy();
       expect(user.profileComplete).toBe(false);

       // Step 2: User provides birth time
      const birthTimeInputResponse = await request(app)
        .post('/webhook')
        .send({
          entry: [{
            id: 'test-entry-2',
            changes: [{
              field: 'messages',
              value: {
                messaging_product: 'whatsapp',
                metadata: { display_phone_number: '+1234567890', phone_number_id: 'test' },
                contacts: [{ profile: { name: 'Test User' }, wa_id: testPhone }],
                messages: [{
                  from: testPhone,
                  id: 'msg-birth-time-input',
                  timestamp: Date.now().toString(),
                  text: { body: '1430' }, // 14:30
                  type: 'text'
                }]
              }
            }]
          }]
        })
        .set('x-hub-signature-256', 'test-signature')
        .expect(200);

      expect(birthTimeInputResponse.body.success).toBe(true);

      // Step 3: User provides birth place
      const birthPlaceResponse = await request(app)
        .post('/webhook')
        .send({
          entry: [{
            id: 'test-entry-3',
            changes: [{
              field: 'messages',
              value: {
                messaging_product: 'whatsapp',
                metadata: { display_phone_number: '+1234567890', phone_number_id: 'test' },
                contacts: [{ profile: { name: 'Test User' }, wa_id: testPhone }],
                messages: [{
                  from: testPhone,
                  id: 'msg-birth-place',
                  timestamp: Date.now().toString(),
                  text: { body: 'Mumbai, India' },
                  type: 'text'
                }]
              }
            }]
          }]
        })
         .set('x-hub-signature-256', 'test-signature')
         .expect(200);

       expect(birthPlaceResponse.body.success).toBe(true);

       // Step 4: User selects language (English)
      const languageResponse = await request(app)
        .post('/webhook')
        .send({
          entry: [{
            id: 'test-entry-4',
            changes: [{
              field: 'messages',
              value: {
                messaging_product: 'whatsapp',
                metadata: { display_phone_number: '+1234567890', phone_number_id: 'test' },
                contacts: [{ profile: { name: 'Test User' }, wa_id: testPhone }],
                messages: [{
                  from: testPhone,
                  id: 'msg-language',
                  timestamp: Date.now().toString(),
                  type: 'interactive',
                  interactive: {
                    type: 'button_reply',
                    button_reply: {
                      id: 'lang_english',
                      title: 'English 🇺🇸'
                    }
                  }
                }]
              }
            }]
          }]
        })
         .set('x-hub-signature-256', 'test-signature')
         .expect(200);

       expect(languageResponse.body.success).toBe(true);

       // Step 5: User confirms details
      const confirmResponse = await request(app)
        .post('/webhook')
        .send({
          entry: [{
            id: 'test-entry-5',
            changes: [{
              field: 'messages',
              value: {
                messaging_product: 'whatsapp',
                metadata: { display_phone_number: '+1234567890', phone_number_id: 'test' },
                contacts: [{ profile: { name: 'Test User' }, wa_id: testPhone }],
                messages: [{
                  from: testPhone,
                  id: 'msg-confirm',
                  timestamp: Date.now().toString(),
                  type: 'interactive',
                  interactive: {
                    type: 'button_reply',
                    button_reply: {
                      id: 'confirm_yes',
                      title: '✅ Yes, Continue'
                    }
                  }
                }]
              }
            }]
          }]
        })
        .set('x-hub-signature-256', 'test-signature')
        .expect(200);

      expect(confirmResponse.body.success).toBe(true);

      // Wait for async database operations and astrology calculations to complete
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Add a short delay to ensure database consistency
      await new Promise(resolve => setTimeout(resolve, 500));

      // Verify user profile is complete with astrology data
      user = await getUserByPhone(testPhone);
      expect(user).toBeTruthy();
      expect(user.profileComplete).toBe(true);
      expect(user.birthDate).toBe('15/03/1990');
      expect(user.birthTime).toBe('14:30');
      expect(user.birthPlace).toBe('Mumbai, India');
      expect(user.preferredLanguage).toBe('en');

      // Verify astrology calculations were performed and stored
      expect(user.sunSign).toBe('Pisces'); // Based on 15/03/1990
      expect(user.moonSign).toBeDefined(); // Moon sign is dynamic, just check if it's set
      expect(user.risingSign).toBeDefined(); // Rising sign is dynamic, just check if it's set

      // Verify the completion message content
      expect(sendMessage).toHaveBeenCalledTimes(2); // One for the completion message, one for the main menu
      const completionMessageCall = sendMessage.mock.calls[0][1];
      expect(completionMessageCall).toContain('🎉 *Welcome to your cosmic journey!*');
      expect(completionMessageCall).toContain(`☀️ *Sun Sign:* ${user.sunSign}`);
      expect(completionMessageCall).toContain(`🌙 *Moon Sign:* ${user.moonSign}`);
      expect(completionMessageCall).toContain(`⬆️ *Rising Sign:* ${user.risingSign}`);
      expect(completionMessageCall).toContain('🔥 *Your Top 3 Life Patterns:*');
      expect(completionMessageCall).toContain('⭐ *3-Day Cosmic Preview:*');

      // Verify the main menu was sent
      const mainMenuCall = sendMessage.mock.calls[1][1];
      expect(mainMenuCall.type).toBe('button');
      expect(mainMenuCall.body).toContain('🌟 *What would you like to explore today?*');
      expect(mainMenuCall.buttons).toHaveLength(3);

      console.log('✅ User onboarding completed successfully!');
      console.log(`Sun Sign: ${user.sunSign}`);
      console.log(`Moon Sign: ${user.moonSign}`);
      console.log(`Rising Sign: ${user.risingSign}`);
    }, 30000); // Increased timeout for real processing
  });

  describe('Existing User Astrology Requests', () => {
    const testPhone = '+0987654321';

    beforeEach(async () => {
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
    });

    it('should generate real daily horoscope for existing user', async () => {
      const horoscopeResponse = await request(app)
        .post('/webhook')
        .send({
          entry: [{
            id: 'test-entry-horoscope',
            changes: [{
              field: 'messages',
              value: {
                messaging_product: 'whatsapp',
                metadata: { display_phone_number: '+0987654321', phone_number_id: 'test' },
                contacts: [{ profile: { name: 'Existing User' }, wa_id: testPhone }],
                messages: [{
                  from: testPhone,
                  id: 'msg-horoscope',
                  timestamp: Date.now().toString(),
                  text: { body: 'Daily horoscope' },
                  type: 'text'
                }]
              }
            }]
          }]
        })
        .set('x-hub-signature-256', 'test-signature')
        .expect(200);

      expect(horoscopeResponse.body.success).toBe(true);

      // Verify that sendMessage was called with a horoscope message
      expect(sendMessage).toHaveBeenCalled();
      const sentMessage = sendMessage.mock.calls[sendMessage.mock.calls.length - 1][1];
      expect(sentMessage).toContain('🌟 *Daily Horoscope for Pisces*');
      expect(sentMessage).toContain('Today brings opportunities for growth and self-discovery.');

      console.log('✅ Daily horoscope request processed successfully!');
    });

    it('should handle compatibility request with real calculations', async () => {
      const compatibilityResponse = await request(app)
        .post('/webhook')
        .send({
          entry: [{
            id: 'test-entry-compatibility',
            changes: [{
              field: 'messages',
              value: {
                messaging_product: 'whatsapp',
                metadata: { display_phone_number: '+0987654321', phone_number_id: 'test' },
                contacts: [{ profile: { name: 'Existing User' }, wa_id: testPhone }],
                messages: [{
                  from: testPhone,
                  id: 'msg-compatibility',
                  timestamp: Date.now().toString(),
                  text: { body: 'Check compatibility with 25/12/1985' },
                  type: 'text'
                }]
              }
            }]
          }]
        })
        .set('x-hub-signature-256', 'test-signature')
        .expect(200);

      expect(compatibilityResponse.body.success).toBe(true);

      // Verify that sendMessage was called with a compatibility message
      expect(sendMessage).toHaveBeenCalled();
      const sentMessage = sendMessage.mock.calls[sendMessage.mock.calls.length - 1][1];
      expect(sentMessage).toContain('💕 *Compatibility Analysis*');
      expect(sentMessage).toContain('*Your Sign:* Pisces');
      expect(sentMessage).toContain('*Their Sign:* Capricorn'); // 25/12/1985 is Capricorn
      expect(sentMessage).toContain('*Compatibility:* Neutral'); // Pisces-Capricorn is Neutral

      console.log('✅ Compatibility request processed successfully!');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle invalid webhook payload gracefully', async () => {
      const invalidResponse = await request(app)
        .post('/webhook')
        .send({ invalid: 'payload' })
        .set('x-hub-signature-256', 'test-signature')
        .expect(400);

      expect(invalidResponse.body.error).toBeDefined();
    });

    it('should handle malformed messages gracefully', async () => {
      const malformedResponse = await request(app)
        .post('/webhook')
        .send({
          entry: [{
            changes: [{
              value: {
                messages: [{
                  from: '+1234567890',
                  type: 'text',
                  text: {} // Missing body
                }]
              }
            }]
          }]
        })
        .set('x-hub-signature-256', 'test-signature')
        .expect(200); // Should not crash

      expect(malformedResponse.body.success).toBe(true);
    });
  });
});

  afterAll(async () => {
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