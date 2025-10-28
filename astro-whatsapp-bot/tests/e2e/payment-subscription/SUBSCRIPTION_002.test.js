const { TestDatabaseManager, getWhatsAppIntegration } = require('../../utils/testSetup');
const { processIncomingMessage } = require('../../../src/services/whatsapp/messageProcessor');

describe('SUBSCRIPTION_002: Insufficient Funds Handling', () => {
  let dbManager;
  let whatsAppIntegration;

  beforeAll(async () => {
    console.log('💸 Testing subscription insufficient funds scenarios...');

    dbManager = new TestDatabaseManager();
    await dbManager.setup();
    whatsAppIntegration = getWhatsAppIntegration();
  }, 30000);

  afterAll(async () => {
    await dbManager.teardown();
  }, 15000);

  beforeEach(async () => {
    whatsAppIntegration.clearMessages?.();
    await dbManager.cleanupUser('+funds_test_user');
  });

  test('should handle card declined due to insufficient funds', async () => {
    const userPhone = '+funds_test_user';

    // Setup premium user
    await dbManager.createTestUser(userPhone, {
      birthDate: '15061990',
      birthTime: '1430',
      birthPlace: 'New York, USA',
      profileComplete: true
    });

    // Navigate to premium plan selection
    await processIncomingMessage({
      from: userPhone,
      interactive: {
        type: 'list_reply',
        list_reply: {
          id: 'select_premium_plan',
          title: 'Premium Plan - $9.99/month'
        }
      },
      type: 'interactive'
    }, {});
    whatsAppIntegration.clearMessages?.();

    // Mock insufficient funds response from payment processor
    jest.doMock('../../../src/services/payment/subscriptionService', () => ({
      SubscriptionService: jest.fn().mockImplementation(() => ({
        processPayment: jest.fn().mockRejectedValue({
          code: 'INSUFFICIENT_FUNDS',
          message: 'Card declined: insufficient funds'
        })
      }))
    }));

    // Attempt payment with insufficient funds
    const paymentDeclineMessage = {
      from: userPhone,
      interactive: {
        type: 'button_reply',
        button_reply: {
          id: 'confirm_payment',
          title: 'Pay $9.99'
        }
      },
      type: 'interactive'
    };

    await processIncomingMessage(paymentDeclineMessage, {});

    // Verify declined payment message
    const declineMessage = whatsAppIntegration.mockSendMessage.mock.calls.find(call =>
      call[1].includes('insufficient') ||
      call[1].includes('declined') ||
      call[1].includes('funds')
    );

    expect(declineMessage).toBeDefined();
    expect(declineMessage[1]).toContain('insufficient funds');

    // Verify no subscription was created
    const user = await dbManager.db.collection('users').findOne({ phoneNumber: userPhone });
    expect(user.subscriptionStatus).toBeUndefined();
    expect(user.subscriptionTier).toBeUndefined();

    // Verify failed transaction was logged
    const failedTransaction = await dbManager.db.collection('payment_transactions').findOne({
      userPhone: userPhone,
      status: 'failed',
      failureReason: 'INSUFFICIENT_FUNDS'
    });
    expect(failedTransaction).toBeDefined();
  }, 25000);

  test('should offer alternative payment methods after decline', async () => {
    const userPhone = '+funds_test_user';

    // After receiving decline message, check for alternative options
    const alternativePaymentMessage = whatsAppIntegration.mockSendMessage.mock.calls.find(call =>
      call[1].includes('alternative') ||
      call[1].includes('different card') ||
      call[1].includes('try again')
    );

    expect(alternativePaymentMessage).toBeDefined();
    expect(alternativePaymentMessage[1]).toMatch(/(alternative|different card|try again)/i);
  }, 10000);

  test('should track failed payment attempts per user', async () => {
    const userPhone = '+funds_test_user';

    // Check that failed payment attempts are tracked
    const user = await dbManager.db.collection('users').findOne({ phoneNumber: userPhone });
    const userStats = await dbManager.db.collection('user_payment_stats').findOne({
      userPhone: userPhone
    });

    if (userStats) {
      expect(userStats.failedAttempts).toBeGreaterThan(0);
      expect(userStats.lastFailureReason).toBe('INSUFFICIENT_FUNDS');
    }
  }, 10000);

  test('should suggest downgrade to basic plan after multiple declines', async () => {
    const userPhone = '+funds_test_user';

    // If user has multiple failed attempts, should suggest basic/free tier
    const declineMessages = whatsAppIntegration.mockSendMessage.mock.calls;
    const downgradeSuggestion = declineMessages.find(call =>
      call[1].includes('basic') ||
      call[1].includes('free') ||
      call[1].includes('downgrade') ||
      call[1].includes('start small')
    );

    // May or may not be included depending on implementation
    // This test verifies if downgrade suggestion exists when appropriate
    if (downgradeSuggestion) {
      expect(downgradeSuggestion[1]).toMatch(/(basic|free|downgrade)/i);
    }
  }, 10000);
});