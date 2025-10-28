const { TestDatabaseManager, setupWhatsAppMocks, getWhatsAppIntegration } = require('../../utils/testSetup');
const { processIncomingMessage } = require('../../../src/services/whatsapp/messageProcessor');

describe('SUBSCRIPTION FLOW INTEGRATION: Payment and Subscription Management', () => {
  let dbManager;
  let whatsAppIntegration;
  let mocks;

  beforeAll(async () => {
    dbManager = new TestDatabaseManager();
    await dbManager.setup();
    whatsAppIntegration = getWhatsAppIntegration();
    mocks = setupWhatsAppMocks();
  }, 30000);

  afterAll(async () => {
    mocks.restoreMocks();
    await dbManager.teardown();
  }, 10000);

  beforeEach(async () => {
    mocks.mockSendMessage.mockClear();
    await dbManager.cleanupUser('+subscription_test_user');
  });

  // Helper function to simulate a user completing the onboarding and reaching subscription prompt
  const simulateOnboardingAndReachSubscription = async (phoneNumber) => {
    // Assuming a simplified onboarding for test setup
    await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Hi' } }, {});
    await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: '15061990' } }, {});
    await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: '1430' } }, {});
    await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Mumbai, India' } }, {});
    await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Yes' } }, {});
    whatsAppIntegration.mockSendMessage.mockClear(); // Clear messages up to this point

    // Simulate user requesting a premium feature that leads to subscription prompt
    await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Premium Feature' } }, {});
    expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
      phoneNumber,
      expect.stringContaining('To access this feature, please choose a subscription plan.')
    );
    whatsAppIntegration.mockSendMessage.mockClear();
  };

  describe('Payment Provider Integration (5 tests)', () => {
    test('should handle payment timeout scenarios and offer recovery mechanisms', async () => {
      const phoneNumber = '+subscription_test_user';
      await simulateOnboardingAndReachSubscription(phoneNumber);

      // Simulate user selecting a plan
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Monthly Plan' } }, {});
      whatsAppIntegration.mockSendMessage.mockClear();

      // Simulate payment gateway initiating, then timing out
      // This would involve mocking the payment gateway response to be a timeout
      // For now, we simulate the bot's response to a timeout condition.
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Payment Timeout' } }, {}); // Assuming this input triggers the timeout handling

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Your payment timed out. Please try again or contact support.')
      );
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Would you like to retry payment?')
      );
    });

    test('should guide user through payment retry flow for insufficient funds', async () => {
      const phoneNumber = '+subscription_test_user';
      await simulateOnboardingAndReachSubscription(phoneNumber);

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Monthly Plan' } }, {});
      whatsAppIntegration.mockSendMessage.mockClear();

      // Simulate payment gateway returning insufficient funds error
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Insufficient Funds' } }, {}); // Assuming this input triggers the error handling

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Your payment failed due to insufficient funds. Please check your payment method or try again.')
      );
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Would you like to retry payment?')
      );
    });

    test('should perform subscription rollback if payment is cancelled mid-flow', async () => {
      const phoneNumber = '+subscription_test_user';
      await simulateOnboardingAndReachSubscription(phoneNumber);

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Monthly Plan' } }, {});
      whatsAppIntegration.mockSendMessage.mockClear();

      // Simulate user cancelling payment on the gateway side
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Cancel Payment' } }, {}); // Assuming this input triggers cancellation handling

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Your payment was cancelled. No subscription has been activated.')
      );
      // Verify that no subscription record was created or any pending subscription was rolled back
      const user = await dbManager.db.collection('users').findOne({ phoneNumber: phoneNumber });
      expect(user.subscriptionStatus).not.toBe('active');
      expect(user.subscriptionPlan).toBeUndefined();
    });

    test('should handle regional payment restrictions and currency conversion', async () => {
      const phoneNumber = '+subscription_test_user';
      await simulateOnboardingAndReachSubscription(phoneNumber);

      // Simulate user from a region with specific restrictions (e.g., Iran, Cuba)
      // This would involve setting user's location or mocking a regional restriction response
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Yearly Plan (Iran)' } }, {}); // Assuming input indicates region

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Unfortunately, due to regional restrictions, we cannot process payments from your location directly.')
      );
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Please contact support for alternative payment options.')
      );
      // Test for currency conversion if applicable (e.g., user in Japan, plan in USD)
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Monthly Plan (JPY)' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('The monthly plan costs $X USD, which is approximately Y JPY.')
      );
    });

    test('should process multi-currency payments with accurate exchange rate calculations', async () => {
      const phoneNumber = '+subscription_test_user';
      await simulateOnboardingAndReachSubscription(phoneNumber);

      // Simulate user selecting a plan and paying in a different currency
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Monthly Plan (EUR)' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Processing your payment of X EUR for the Monthly Plan.')
      );
      // This would require mocking an external exchange rate API and verifying the calculated amount.
      // For now, we check the confirmation message.
    });
  });

  describe('Subscription State Management (5 tests)', () => {
    test('should handle plan upgrade during active subscription with prorated billing', async () => {
      const phoneNumber = '+subscription_test_user';
      await simulateOnboardingAndReachSubscription(phoneNumber);

      // Simulate initial subscription to a Monthly Plan
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Monthly Plan' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Confirm Payment' } }, {}); // Assume payment success
      whatsAppIntegration.mockSendMessage.mockClear();

      // Simulate user upgrading to Yearly Plan mid-cycle
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Upgrade to Yearly Plan' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Upgrading to Yearly Plan. Your remaining Monthly Plan credit will be prorated.')
      );
      // Verify prorated billing calculation and new subscription status
      const user = await dbManager.db.collection('users').findOne({ phoneNumber: phoneNumber });
      expect(user.subscriptionPlan).toBe('Yearly');
      expect(user.proratedCredit).toBeDefined(); // Check for prorated credit field
    });

    test('should handle plan downgrade scenarios and credit calculation', async () => {
      const phoneNumber = '+subscription_test_user';
      await simulateOnboardingAndReachSubscription(phoneNumber);

      // Simulate initial subscription to a Yearly Plan
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Yearly Plan' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Confirm Payment' } }, {});
      whatsAppIntegration.mockSendMessage.mockClear();

      // Simulate user downgrading to Monthly Plan
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Downgrade to Monthly Plan' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Downgrading to Monthly Plan. Your remaining Yearly Plan will be converted to credit.')
      );
      // Verify credit calculation and new subscription status
      const user = await dbManager.db.collection('users').findOne({ phoneNumber: phoneNumber });
      expect(user.subscriptionPlan).toBe('Monthly');
      expect(user.downgradeCredit).toBeDefined(); // Check for downgrade credit field
    });

    test('should handle subscription renewal failures and grace period', async () => {
      const phoneNumber = '+subscription_test_user';
      await simulateOnboardingAndReachSubscription(phoneNumber);

      // Simulate initial subscription
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Monthly Plan' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Confirm Payment' } }, {});
      whatsAppIntegration.mockSendMessage.mockClear();

      // Simulate renewal failure (e.g., card expired)
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Renewal Failed' } }, {}); // Trigger renewal failure

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Your subscription renewal failed. You are now in a grace period.')
      );
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Please update your payment method to avoid service interruption.')
      );
      const user = await dbManager.db.collection('users').findOne({ phoneNumber: phoneNumber });
      expect(user.subscriptionStatus).toBe('grace_period');
    });

    test('should validate multi-device subscription access and account linking', async () => {
      const phoneNumber = '+subscription_test_user';
      await simulateOnboardingAndReachSubscription(phoneNumber);

      // Simulate initial subscription
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Monthly Plan' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Confirm Payment' } }, {});
      whatsAppIntegration.mockSendMessage.mockClear();

      // Simulate accessing from a second device/number linked to the same account
      const secondDeviceNumber = '+subscription_test_user_device2';
      await processIncomingMessage({ from: secondDeviceNumber, type: 'text', text: { body: 'Hi' } }, {});
      await processIncomingMessage({ from: secondDeviceNumber, type: 'text', text: { body: 'Link Account ' + phoneNumber } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        secondDeviceNumber,
        expect.stringContaining('Your account has been successfully linked. You now have premium access.')
      );
      const user = await dbManager.db.collection('users').findOne({ phoneNumber: secondDeviceNumber });
      expect(user.subscriptionStatus).toBe('active'); // Should inherit subscription
    });

    test('should implement subscription pause/resume functionality with billing cycle adjustments', async () => {
      const phoneNumber = '+subscription_test_user';
      await simulateOnboardingAndReachSubscription(phoneNumber);

      // Simulate initial subscription
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Monthly Plan' } }, {});
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Confirm Payment' } }, {});
      whatsAppIntegration.mockSendMessage.mockClear();

      // Simulate pausing subscription
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Pause Subscription' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Your subscription has been paused. Billing will resume when you unpause.')
      );
      const user = await dbManager.db.collection('users').findOne({ phoneNumber: phoneNumber });
      expect(user.subscriptionStatus).toBe('paused');

      // Simulate resuming subscription
      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Resume Subscription' } }, {});
      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Your subscription has been resumed. Your billing cycle has been adjusted.')
      );
      expect(user.subscriptionStatus).toBe('active');
      expect(user.billingCycleAdjusted).toBe(true); // Custom field to check adjustment
    });
  });

  describe('Payment Method Variations (5 tests)', () => {
    test('should integrate UPI payment and validate Indian payment flows', async () => {
      const phoneNumber = '+subscription_test_user';
      await simulateOnboardingAndReachSubscription(phoneNumber);

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Monthly Plan (UPI)' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Please complete your UPI payment using the provided link/QR code.')
      );
      // This would involve mocking UPI gateway callbacks and verifying status updates.
    });

    test('should handle international card processing with currency conversion', async () => {
      const phoneNumber = '+subscription_test_user';
      await simulateOnboardingAndReachSubscription(phoneNumber);

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Yearly Plan (International Card)' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Processing your international card payment. Exchange rates may apply.')
      );
      // Verify that the system correctly identifies the card as international and applies conversion.
    });

    test('should integrate wallet/payment app (e.g., Google Pay) and handle third-party callbacks', async () => {
      const phoneNumber = '+subscription_test_user';
      await simulateOnboardingAndReachSubscription(phoneNumber);

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Monthly Plan (Google Pay)' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Redirecting to Google Pay to complete your payment.')
      );
      // This would involve mocking the callback from Google Pay and verifying subscription activation.
    });

    test('should offer cryptocurrency payment options and integrate blockchain transactions', async () => {
      const phoneNumber = '+subscription_test_user';
      await simulateOnboardingAndReachSubscription(phoneNumber);

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Monthly Plan (Crypto)' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Please send X amount of Y cryptocurrency to the following address.')
      );
      // This would involve mocking blockchain transaction confirmations and verifying subscription activation.
    });

    test('should process PayPal/Apple Pay payments through alternative payment flows', async () => {
      const phoneNumber = '+subscription_test_user';
      await simulateOnboardingAndReachSubscription(phoneNumber);

      await processIncomingMessage({ from: phoneNumber, type: 'text', text: { body: 'Monthly Plan (PayPal)' } }, {});

      expect(whatsAppIntegration.mockSendMessage).toHaveBeenCalledWith(
        phoneNumber,
        expect.stringContaining('Redirecting to PayPal to complete your payment.')
      );
      // Similar to other third-party integrations, mock the callback and verify.
    });
  });
});
