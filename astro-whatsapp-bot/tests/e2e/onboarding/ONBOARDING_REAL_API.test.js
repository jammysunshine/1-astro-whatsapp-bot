const { TestDatabaseManager, RealWhatsAppIntegration, isRealAPIMode } = require('../../utils/testSetup');
const { processIncomingMessage } = require('../../../src/services/whatsapp/messageProcessor');
const WhatsAppService = require('../../../src/services/whatsapp/whatsappService');

describe('ONBOARDING_REAL_API: Real WhatsApp + Google Maps API Integration', () => {
  let dbManager;
  let realWhatsApp;

  beforeAll(async () => {
    // STRICTLY ENFORCE: Only run if explicitly requested
    if (!isRealAPIMode()) {
      console.log('⚠️  REAL API TEST SKIPPED: Set TEST_MODE=e2e-real or USE_REAL_APIS=true');
      return;
    }

    console.log('🚨 TESTING WITH REAL APIs - ACTUAL MESSAGES WILL BE SENT!');
    console.log('📊 Costs may apply for WhatsApp/Google Maps API usage');

    dbManager = new TestDatabaseManager();
    await dbManager.setup();

    // Use actual WhatsApp service with real credentials
    realWhatsApp = new RealWhatsAppIntegration();
  }, 120000);

  afterAll(async () => {
    if (isRealAPIMode()) {
      await dbManager.teardown();
      console.log('🏁 Real API test suite completed');
    }
  }, 30000);

  beforeEach(async () => {
    if (isRealAPIMode()) {
      realWhatsApp.clearMessages();
      await dbManager.cleanupUser('+1234567890'); // Approved test number only
    }
  });

  // DISABLED BY DEFAULT - requires explicit environment setup
  test.skip('should test complete onboarding with real WhatsApp API responses', async () => {
    if (!isRealAPIMode()) return;

    const phoneNumber = '+1234567890'; // Only use this approved test number

    console.log(`📱 Starting REAL WhatsApp onboarding test for ${phoneNumber}`);
    console.log('⚠️  ACTUAL WHATSAPP MESSAGES AND GOOGLE MAPS USE WILL BE BILLED');

    // Phase 1: Invalid input - expect real error via WhatsApp
    console.log('1️⃣ Testing invalid date format with real WhatsApp API...');
    await processIncomingMessage({
      from: phoneNumber,
      type: 'text',
      text: { body: 'invalid-date' }
    }, {});

    // Verify real WhatsApp message was sent
    let messages = realWhatsApp.getSentMessages(phoneNumber);
    expect(messages.filter(m => m.status === 'sent').length).toBeGreaterThan(0);

    // Phase 2: Valid date - expect real success message
    console.log('2️⃣ Testing valid date with real WhatsApp API...');
    await processIncomingMessage({
      from: phoneNumber,
      type: 'text',
      text: { body: '15061990' }
    }, {});

    messages = realWhatsApp.getSentMessages(phoneNumber);
    const sentMessageCountBefore = messages.filter(m => m.status === 'sent').length;
    expect(sentMessageCountBefore).toBeGreaterThan(1); // Should have cumulative messages

    // Phase 3: Valid time
    console.log('3️⃣ Testing time input with real WhatsApp API...');
    await processIncomingMessage({
      from: phoneNumber,
      type: 'text',
      text: { body: '1430' }
    }, {});

    // Phase 4: Location with REAL Google Maps geocoding
    console.log('4️⃣ Testing location with REAL Google Maps API...');

    // Get real coordinates for Mumbai
    const GeocodingService = require('../../../src/services/astrology/geocoding/GeocodingService');
    const geocodingService = new GeocodingService();
    const coordinates = await geocodingService.getCoordinatesForPlace('Mumbai, India');

    console.log(`📍 Real geocoding result: ${coordinates[0]}, ${coordinates[1]}`);

    await processIncomingMessage({
      from: phoneNumber,
      type: 'text',
      text: { body: 'Mumbai, India' }
    }, {});

    // Verify actual database record with real geocoding data
    const user = await dbManager.db.collection('users').findOne({ phoneNumber });
    expect(user).toBeDefined();
    expect(user.birthDate).toBe('15061990');
    expect(user.birthTime).toBe('1430');
    expect(user.birthPlace).toBe('Mumbai, India');
    expect(user.coordinates).toBeDefined(); // Real coordinates from Google Maps

    // Verify final success message was sent via real WhatsApp
    messages = realWhatsApp.getSentMessages(phoneNumber);
    const finalMessageCount = messages.filter(m => m.status === 'sent').length;
    expect(finalMessageCount).toBeGreaterThan(3); // Should have onboarding completion message

    console.log(`✅ REAL API TEST SUCCESSFUL: Sent ${finalMessageCount} WhatsApp messages`);
    const apiCosts = messages.filter(m => m.status === 'sent').length * 0.005; // Rough estimate
    console.log(`💰 Estimated API costs: $${apiCosts.toFixed(3)} (${messages.filter(m => m.status === 'sent').length} messages)`);

  }, 150000); // Extended timeout for real network calls
});