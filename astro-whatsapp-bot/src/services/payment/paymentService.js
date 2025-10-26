const logger = require('../../utils/logger');
const {
  updateSubscription,
  addLoyaltyPoints,
} = require('../../models/userModel');
const Razorpay = require('razorpay');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Payment Service with Real Gateway Integration
 * Handles subscription management and payment processing for multiple regions
 */

class PaymentService {
  constructor() {
    // Initialize payment gateways
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      this.razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });
    } else {
      this.razorpay = null;
      console.warn('Razorpay not initialized: RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET not set');
    }

    // Subscription plans with regional pricing
    this.plans = {
      free: {
        name: 'Free',
        price: { INR: 0, AED: 0, AUD: 0 },
        currency: { india: 'INR', uae: 'AED', australia: 'AUD' },
        features: [
          'Daily micro-prediction',
          'Birth chart visualization',
          '7-day transit summary',
        ],
      },
      essential: {
        name: 'Essential',
        price: { INR: 230, AED: 20, AUD: 20 },
        currency: { india: 'INR', uae: 'AED', australia: 'AUD' },
        features: [
          'Daily personalized horoscope',
          'Weekly video predictions',
          'Basic compatibility (5 people)',
        ],
      },
      premium: {
        name: 'Premium',
        price: { INR: 299, AED: 25, AUD: 25 },
        currency: { india: 'INR', uae: 'AED', australia: 'AUD' },
        features: [
          'Unlimited AI questions',
          'Priority astrologer access',
          'Unlimited compatibility',
        ],
      },
      vip: {
        name: 'VIP',
        price: { INR: 799, AED: 80, AUD: 80 },
        currency: { india: 'INR', uae: 'AED', australia: 'AUD' },
        features: [
          'All Premium features',
          'Dedicated astrologer',
          'Quarterly life planning sessions',
        ],
      },
    };

    // Micro-transaction services
    this.microServices = {
      flash_insight: {
        name: 'Flash Insight',
        price: { INR: 25, AED: 1, AUD: 1 },
      },
      transit_alert: {
        name: 'Transit Alert',
        price: { INR: 15, AED: 0.5, AUD: 0.5 },
      },
      remedial_fix: {
        name: 'Remedial Quick Fix',
        price: { INR: 50, AED: 2, AUD: 2 },
      },
      compatibility_snapshot: {
        name: 'Compatibility Snapshot',
        price: { INR: 75, AED: 3, AUD: 3 },
      },
    };
  }

  /**
   * Get subscription plan details
   * @param {string} planId - Plan identifier
   * @param {string} region - User region (india, uae, australia)
   * @returns {Object} Plan details with regional pricing
   */
  getPlan(planId, region = 'india') {
    const plan = this.plans[planId] || this.plans.free;
    return {
      ...plan,
      price:
        plan.price[
          plan.currency[region] === 'INR'
            ? 'INR'
            : plan.currency[region] === 'AED'
              ? 'AED'
              : 'AUD'
        ],
      currency: plan.currency[region],
    };
  }

  /**
   * Get all available plans
   * @returns {Object} All plans
   */
  getAllPlans() {
    return this.plans;
  }

  /**
   * Process subscription upgrade with real payment gateways
   * @param {string} phoneNumber - User's phone number
   * @param {string} planId - Target plan ID
   * @param {string} region - User region (india, uae, australia)
   * @param {string} paymentMethod - Payment method preference
   * @returns {Promise<Object>} Subscription result
   */
  async processSubscription(
    phoneNumber,
    planId,
    region = 'india',
    paymentMethod = 'card'
  ) {
    try {
      const plan = this.getPlan(planId, region);
      if (!plan) {
        throw new Error(`Invalid plan: ${planId}`);
      }

      // Process payment based on region
      const paymentResult = await this.processPayment(
        plan.price,
        plan.currency,
        region,
        paymentMethod,
        {
          type: 'subscription',
          planId,
          phoneNumber,
        }
      );

      if (paymentResult.success) {
        // Calculate expiry (30 days from now for monthly plans)
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);

        // Update user subscription
        await updateSubscription(phoneNumber, planId, expiryDate);

        // Add loyalty points for subscription
        await addLoyaltyPoints(phoneNumber, 50);

        logger.info(
          `✅ Subscription updated for ${phoneNumber}: ${planId} (${region})`
        );

        return {
          success: true,
          plan: planId,
          expiryDate,
          transactionId: paymentResult.transactionId,
          message: `🎉 Welcome to ${plan.name} plan! Your subscription is active until ${expiryDate.toDateString()}.`,
        };
      } else {
        throw new Error('Payment failed');
      }
    } catch (error) {
      logger.error(
        `❌ Subscription processing failed for ${phoneNumber}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Process payment using appropriate gateway based on region
   * @param {number} amount - Payment amount
   * @param {string} currency - Payment currency
   * @param {string} region - User region
   * @param {string} paymentMethod - Payment method
   * @param {Object} metadata - Additional payment metadata
   * @returns {Promise<Object>} Payment result
   */
  async processPayment(amount, currency, region, paymentMethod, metadata = {}) {
    try {
      if (region === 'india') {
        return await this.processRazorpayPayment(
          amount,
          currency,
          paymentMethod,
          metadata
        );
      } else {
        return await this.processStripePayment(
          amount,
          currency,
          paymentMethod,
          metadata
        );
      }
    } catch (error) {
      logger.error(`Payment processing failed for region ${region}:`, error);
      throw error;
    }
  }

  /**
   * Process payment via Razorpay (India)
   * @param {number} amount - Amount in paisa (INR * 100)
   * @param {string} currency - Currency code
   * @param {string} paymentMethod - Payment method
   * @param {Object} metadata - Payment metadata
   * @returns {Promise<Object>} Payment result
   */
  async processRazorpayPayment(amount, currency, paymentMethod, metadata) {
    if (!this.razorpay) {
      throw new Error('Razorpay payment gateway not configured');
    }
    try {
      const options = {
        amount: amount * 100, // Razorpay expects amount in paisa
        currency,
        receipt: `rcpt_${Date.now()}`,
        payment_capture: 1, // Auto capture
        notes: {
          type: metadata.type || 'subscription',
          planId: metadata.planId,
          phoneNumber: metadata.phoneNumber,
        },
      };

      const order = await this.razorpay.orders.create(options);

      return {
        success: true,
        transactionId: order.id,
        orderId: order.id,
        amount,
        currency,
        gateway: 'razorpay',
        paymentUrl: this.generateRazorpayPaymentLink(
          order.id,
          amount,
          currency
        ),
      };
    } catch (error) {
      logger.error('Razorpay payment creation failed:', error);
      throw new Error('Payment processing failed');
    }
  }

  /**
   * Process payment via Stripe (UAE, Australia)
   * @param {number} amount - Amount in cents
   * @param {string} currency - Currency code
   * @param {string} paymentMethod - Payment method
   * @param {Object} metadata - Payment metadata
   * @returns {Promise<Object>} Payment result
   */
  async processStripePayment(amount, currency, paymentMethod, metadata) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe expects amount in cents
        currency: currency.toLowerCase(),
        payment_method_types: this.getStripePaymentMethods(paymentMethod),
        metadata: {
          type: metadata.type || 'subscription',
          planId: metadata.planId,
          phoneNumber: metadata.phoneNumber,
        },
        description: `Astrology Bot ${metadata.type} - ${metadata.planId}`,
      });

      return {
        success: true,
        transactionId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amount,
        currency,
        gateway: 'stripe',
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      logger.error('Stripe payment creation failed:', error);
      throw new Error('Payment processing failed');
    }
  }

  /**
   * Get Stripe payment methods based on user preference
   * @param {string} paymentMethod - Preferred payment method
   * @returns {Array} Supported payment methods
   */
  getStripePaymentMethods(paymentMethod) {
    const methods = ['card']; // Default to card

    if (paymentMethod === 'apple_pay') {
      methods.push('apple_pay');
    } else if (paymentMethod === 'google_pay') {
      methods.push('google_pay');
    }

    return methods;
  }

  /**
   * Generate Razorpay payment link
   * @param {string} orderId - Razorpay order ID
   * @param {number} amount - Amount
   * @param {string} currency - Currency
   * @returns {string} Payment link
   */
  generateRazorpayPaymentLink(orderId, amount, currency) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    return `https://api.razorpay.com/v1/checkout/embedded?key_id=${keyId}&order_id=${orderId}&amount=${amount * 100}&currency=${currency}`;
  }

  /**
   * Process micro-transaction with real payment gateways
   * @param {string} phoneNumber - User's phone number
   * @param {string} serviceType - Type of service (flash_insight, transit_alert, etc.)
   * @param {string} region - User region
   * @param {string} paymentMethod - Payment method
   * @returns {Promise<Object>} Transaction result
   */
  async processMicroTransaction(
    phoneNumber,
    serviceType,
    region = 'india',
    paymentMethod = 'card'
  ) {
    try {
      const service = this.microServices[serviceType];
      if (!service) {
        throw new Error(`Invalid service type: ${serviceType}`);
      }

      // Get regional pricing
      const currency =
        region === 'india' ? 'INR' : region === 'uae' ? 'AED' : 'AUD';
      const amount = service.price[currency];

      // Process payment
      const paymentResult = await this.processPayment(
        amount,
        currency,
        region,
        paymentMethod,
        {
          type: 'micro_transaction',
          serviceType,
          phoneNumber,
        }
      );

      if (paymentResult.success) {
        // Add loyalty points for micro-transaction
        await addLoyaltyPoints(phoneNumber, 5);

        logger.info(
          `✅ Micro-transaction completed for ${phoneNumber}: ${serviceType} (${region})`
        );

        return {
          success: true,
          service: serviceType,
          amount,
          currency,
          transactionId: paymentResult.transactionId,
          message: `✅ ${service.name} purchased successfully!`,
        };
      } else {
        throw new Error('Payment failed');
      }
    } catch (error) {
      logger.error(`❌ Micro-transaction failed for ${phoneNumber}:`, error);
      throw error;
    }
  }

  /**
   * Detect user region based on phone number
   * @param {string} phoneNumber - User's phone number
   * @returns {string} Detected region
   */
  detectRegion(phoneNumber) {
    if (!phoneNumber) {
      return 'india';
    }

    // Remove any non-numeric characters except +
    const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');

    if (cleanNumber.startsWith('+971') || cleanNumber.startsWith('971')) {
      return 'uae';
    } else if (cleanNumber.startsWith('+61') || cleanNumber.startsWith('61')) {
      return 'australia';
    } else {
      return 'india'; // Default to India
    }
  }

  /**
   * Get subscription status for user
   * @param {Object} user - User object
   * @param {string} region - User region
   * @returns {Object} Subscription status
   */
  getSubscriptionStatus(user, region = 'india') {
    const plan = this.getPlan(user.subscriptionTier || 'free', region);
    const isActive = user.subscriptionExpiry
      ? new Date(user.subscriptionExpiry) > new Date()
      : user.subscriptionTier === 'free';

    return {
      plan: user.subscriptionTier || 'free',
      planName: plan.name,
      isActive,
      expiryDate: user.subscriptionExpiry,
      features: plan.features,
      price: plan.price,
      currency: plan.currency,
    };
  }

  /**
   * Handle Razorpay webhook
   * @param {Object} webhookData - Webhook payload from Razorpay
   * @returns {Promise<Object>} Processing result
   */
  async handleRazorpayWebhook(webhookData) {
    if (!this.razorpay) {
      throw new Error('Razorpay payment gateway not configured');
    }
    try {
      const { event, payload } = webhookData;

      if (event === 'payment.captured') {
        const payment = payload.payment.entity;
        const orderId = payment.order_id;
        const amount = payment.amount / 100; // Convert from paisa to rupees

        // Extract metadata from order
        const order = await this.razorpay.orders.fetch(orderId);
        const notes = order.notes || {};

        if (notes.type === 'subscription') {
          // Process subscription payment
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + 30);

          await updateSubscription(notes.phoneNumber, notes.planId, expiryDate);
          await addLoyaltyPoints(notes.phoneNumber, 50);

          logger.info(
            `✅ Razorpay subscription payment processed: ${notes.phoneNumber} - ${notes.planId}`
          );
        } else if (notes.type === 'micro_transaction') {
          // Process micro-transaction
          await addLoyaltyPoints(notes.phoneNumber, 5);
          logger.info(
            `✅ Razorpay micro-transaction processed: ${notes.phoneNumber} - ${notes.serviceType}`
          );
        }

        return { success: true, processed: true };
      }

      return { success: true, processed: false };
    } catch (error) {
      logger.error('Razorpay webhook processing failed:', error);
      throw error;
    }
  }

  /**
   * Handle Stripe webhook
   * @param {Object} webhookData - Webhook payload from Stripe
   * @returns {Promise<Object>} Processing result
   */
  async handleStripeWebhook(webhookData) {
    try {
      const { type, data } = webhookData;

      if (type === 'payment_intent.succeeded') {
        const paymentIntent = data.object;
        const { metadata } = paymentIntent;

        if (metadata.type === 'subscription') {
          // Process subscription payment
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + 30);

          await updateSubscription(
            metadata.phoneNumber,
            metadata.planId,
            expiryDate
          );
          await addLoyaltyPoints(metadata.phoneNumber, 50);

          logger.info(
            `✅ Stripe subscription payment processed: ${metadata.phoneNumber} - ${metadata.planId}`
          );
        } else if (metadata.type === 'micro_transaction') {
          // Process micro-transaction
          await addLoyaltyPoints(metadata.phoneNumber, 5);
          logger.info(
            `✅ Stripe micro-transaction processed: ${metadata.phoneNumber} - ${metadata.serviceType}`
          );
        }

        return { success: true, processed: true };
      }

      return { success: true, processed: false };
    } catch (error) {
      logger.error('Stripe webhook processing failed:', error);
      throw error;
    }
  }

  /**
   * Generate payment link for subscription
   * @param {string} planId - Plan ID
   * @param {string} phoneNumber - User's phone number
   * @param {string} region - User region
   * @param {string} paymentMethod - Payment method
   * @returns {Promise<Object>} Payment link and details
   */
  async generatePaymentLink(
    planId,
    phoneNumber,
    region = 'india',
    paymentMethod = 'card'
  ) {
    try {
      const plan = this.getPlan(planId, region);

      if (region === 'india') {
        if (!this.razorpay) {
          throw new Error('Razorpay payment gateway not configured');
        }
        // Create Razorpay order
        const options = {
          amount: plan.price * 100, // Amount in paisa
          currency: plan.currency,
          receipt: `rcpt_${phoneNumber}_${Date.now()}`,
          payment_capture: 1,
          notes: {
            planId,
            phoneNumber,
            region,
          },
        };

        const order = await this.razorpay.orders.create(options);

        return {
          gateway: 'razorpay',
          orderId: order.id,
          amount: plan.price,
          currency: plan.currency,
          paymentUrl: `https://api.razorpay.com/v1/checkout/embedded?key_id=${process.env.RAZORPAY_KEY_ID}&order_id=${order.id}`,
          keyId: process.env.RAZORPAY_KEY_ID,
        };
      } else {
        // Create Stripe payment link
        const paymentLink = await stripe.paymentLinks.create({
          line_items: [
            {
              price_data: {
                currency: plan.currency.toLowerCase(),
                product_data: {
                  name: `${plan.name} Subscription`,
                  description: `Monthly astrology subscription - ${plan.features.join(', ')}`,
                },
                unit_amount: Math.round(plan.price * 100),
              },
              quantity: 1,
            },
          ],
          metadata: {
            planId,
            phoneNumber,
            region,
          },
          after_completion: {
            type: 'redirect',
            redirect: {
              url: `${process.env.BASE_URL || 'https://astrologybot.com'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            },
          },
        });

        return {
          gateway: 'stripe',
          paymentUrl: paymentLink.url,
          amount: plan.price,
          currency: plan.currency,
          paymentLinkId: paymentLink.id,
        };
      }
    } catch (error) {
      logger.error(`Payment link generation failed for ${phoneNumber}:`, error);
      throw error;
    }
  }
}

module.exports = new PaymentService();
