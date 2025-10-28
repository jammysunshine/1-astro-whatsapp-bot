const { TestDatabaseManager, getWhatsAppIntegration } = require('../../utils/testSetup');
const { processIncomingMessage } = require('../../../src/services/whatsapp/messageProcessor');
const SubscriptionService = require('../../../src/services/payment/subscriptionService');

describe('SUBSCRIPTION_001: Payment Timeout Scenarios', () => {
  let dbManager;
  let whatsAppIntegration;
  let subscriptionService;

  beforeAll(async () => {
    console.log('💳 Testing subscription payment timeout scenarios...');

    dbManager = new TestDatabaseManager();
    await dbManager.setup();
    whatsAppIntegration = getWhatsAppIntegration();
    subscriptionService = new SubscriptionService();
  }, 30000);

  afterAll(async () => {
    await dbManager.teardown();
  }, 15000);

  beforeEach(async () => {
    whatsAppIntegration.clearMessages?.();
    await dbManager.cleanupUser('+subscription_test_user');
  });

  test('should handle payment gateway timeout gracefully', async () => {
    const userPhone = '+subscription_test_user';

    // Setup user with premium subscription interest
    await dbManager.createTestUser(userPhone, {
      birthDate: '15061990',
      birthTime: '1430',
      birthPlace: 'Premium City',
      profileComplete: true
    });

    // Navigate to subscription options
    await processIncomingMessage({
      from: userPhone,
      interactive: {
        type: 'list_reply',
        list_reply: {
          id: 'show_subscription_plans',
          title: 'Subscription Plans',
          description: 'Choose your plan'
        }
      },
      type: 'interactive'
    }, {});
    whatsAppIntegration.clearMessages?.();

    // Select premium plan
    await processIncomingMessage({
      from: userPhone,
      interactive: {
        type: 'list_reply',
        list_reply: {
          id: 'select_premium_plan',
          title: 'Premium Plan - $9.99/month',
          description: 'Unlimited readings and features'
        }
      },
      type: 'interactive'
    }, {});
    whatsAppIntegration.clearMessages?.();

    // Simulate payment gateway timeout by mocking long delay
    const originalProcessPayment = subscriptionService.processPayment;
    subscriptionService.processPayment = jest.fn().mockImplementation(() =>
      new Promise((resolve) => setTimeout(() => resolve({ status: 'timeout' }), 45000))
    );

    // Attempt payment processing (this should timeout)
    const paymentTimeoutMessage = {
      from: userPhone,
      interactive: {
        type: 'button_reply',
        button_reply: {
          id: 'confirm_payment',
          title: 'Confirm Payment'
        }
      },
      type: 'interactive'
    };

    // Start payment but expect timeout handling
    try {
      await processIncomingMessage(paymentTimeoutMessage, {});
    } catch (error) {
      // Expected timeout behavior
    }

    // Verify timeout message was sent
    const mockCalls = whatsAppIntegration.mockSendMessage.mock.calls;
    const timeoutMessage = mockCalls.find(call =>
      call[1].includes('timeout') ||
      call[1].includes('taking longer') ||
      call[1].includes('try again')
    );

    expect(timeoutMessage).toBeDefined();
    expect(timeoutMessage[1]).toMatch(/(timeout|temporarily unavailable|try again)/i);

    // Verify user subscription status remains unchanged
    const user = await dbManager.db.collection('users').findOne({ phoneNumber: userPhone });
    expect(user.subscriptionStatus).toBeUndefined(); // No subscription created
    expect(user.subscriptionTier).toBeUndefined();

    // Restore original method
    subscriptionService.processPayment = originalProcessPayment;
  }, 50000);

  test('should allow user to retry payment after timeout', async () => {
    const userPhone = '+subscription_test_user';

    // User receives timeout message, now retries
    await processIncomingMessage({
      from: userPhone,
      interactive: {
        type: 'button_reply',
        button_reply: {
          id: 'retry_payment',
          title: 'Retry Payment'
        }
      },
      type: 'interactive'
    }, {});

    // Verify retry flow starts
    const retryMessage = whatsAppIntegration.mockSendMessage.mock.calls.find(call =>
      call[1].includes('processing') ||
      call[1].includes('retry') ||
      call[1].includes('payment')
    );

    expect(retryMessage).toBeDefined();
  }, 20000);

  test('should handle timeout recovery when payment succeeds after delay', async () => {
    const userPhone = '+subscription_test_user';

    // Simulate slow but eventually successful payment
    const originalProcessPayment = subscriptionService.processPayment;
    subscriptionService.processPayment = jest.fn().mockResolvedValue({
      status: 'success',
      transactionId: 'delayed-success-123',
      subscriptionId: 'sub-delayed-456'
    });

    // Complete the retry flow
    await processIncomingMessage({
      from: userPhone,
      interactive: {
        type: 'button_reply',
        button_reply: {
          id: 'confirm_payment',
          title: 'Confirm Payment'
        }
      },
      type: 'interactive'
    }, {});

    // Verify successful completion despite delay
    const successMessage = whatsAppIntegration.mockSendMessage.mock.calls.find(call =>
      call[1].includes('successful') ||
      call[1].includes('activated') ||
      call[1].includes('premium')
    );

    expect(successMessage).toBeDefined();

    // Verify subscription was created
    const user = await dbManager.db.collection('users').findOne({ phoneNumber: userPhone });
    expect(user.subscriptionStatus).toBe('active');
    expect(user.subscriptionTier).toBe('premium');

    // Verify transaction was recorded
    const transaction = await dbManager.db.collection('payment_transactions').findOne({
      userPhone: userPhone,
      status: 'success'
    });
    expect(transaction).toBeDefined();
    expect(transaction.transactionId).toBe('delayed-success-123');

    subscriptionService.processPayment = originalProcessPayment;
  }, 30000);
});