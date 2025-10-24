const logger = require('../../utils/logger');
const { updateSubscription, addLoyaltyPoints } = require('../../models/userModel');

/**
 * Basic Payment Service for MVP
 * Handles subscription management and basic payment processing
 */

class PaymentService {
  constructor() {
    // Subscription plans for MVP
    this.plans = {
      free: {
        name: 'Free',
        price: 0,
        currency: 'INR',
        features: ['Daily micro-prediction', 'Birth chart visualization', '7-day transit summary']
      },
      essential: {
        name: 'Essential',
        price: 230,
        currency: 'INR',
        features: ['Daily personalized horoscope', 'Weekly video predictions', 'Basic compatibility (5 people)']
      },
      premium: {
        name: 'Premium',
        price: 299,
        currency: 'INR',
        features: ['Unlimited AI questions', 'Priority astrologer access', 'Unlimited compatibility']
      }
    };
  }

  /**
   * Get subscription plan details
   * @param {string} planId - Plan identifier
   * @returns {Object} Plan details
   */
  getPlan(planId) {
    return this.plans[planId] || this.plans.free;
  }

  /**
   * Get all available plans
   * @returns {Object} All plans
   */
  getAllPlans() {
    return this.plans;
  }

  /**
   * Process subscription upgrade (simplified for MVP)
   * @param {string} phoneNumber - User's phone number
   * @param {string} planId - Target plan ID
   * @returns {Promise<Object>} Subscription result
   */
  async processSubscription(phoneNumber, planId) {
    try {
      const plan = this.getPlan(planId);
      if (!plan) {
        throw new Error(`Invalid plan: ${planId}`);
      }

      // For MVP, we'll simulate payment processing
      // In production, this would integrate with Stripe/Razorpay
      const paymentResult = await this.simulatePayment(plan.price);

      if (paymentResult.success) {
        // Calculate expiry (30 days from now for monthly plans)
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);

        // Update user subscription
        await updateSubscription(phoneNumber, planId, expiryDate);

        // Add loyalty points for subscription
        await addLoyaltyPoints(phoneNumber, 50);

        logger.info(`✅ Subscription updated for ${phoneNumber}: ${planId}`);

        return {
          success: true,
          plan: planId,
          expiryDate,
          message: `🎉 Welcome to ${plan.name} plan! Your subscription is active until ${expiryDate.toDateString()}.`
        };
      } else {
        throw new Error('Payment failed');
      }
    } catch (error) {
      logger.error(`❌ Subscription processing failed for ${phoneNumber}:`, error);
      throw error;
    }
  }

  /**
   * Simulate payment processing (for MVP)
   * @param {number} amount - Payment amount
   * @returns {Promise<Object>} Payment result
   */
  async simulatePayment(amount) {
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // For MVP, always succeed (in production, this would call payment gateway)
    return {
      success: true,
      transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount,
      timestamp: new Date()
    };
  }

  /**
   * Process micro-transaction (for MVP)
   * @param {string} phoneNumber - User's phone number
   * @param {string} serviceType - Type of service (flash_insight, transit_alert, etc.)
   * @returns {Promise<Object>} Transaction result
   */
  async processMicroTransaction(phoneNumber, serviceType) {
    try {
      const services = {
        flash_insight: { name: 'Flash Insight', price: 25 },
        transit_alert: { name: 'Transit Alert', price: 15 },
        remedial_fix: { name: 'Remedial Quick Fix', price: 50 },
        compatibility_snapshot: { name: 'Compatibility Snapshot', price: 75 }
      };

      const service = services[serviceType];
      if (!service) {
        throw new Error(`Invalid service type: ${serviceType}`);
      }

      // Simulate payment
      const paymentResult = await this.simulatePayment(service.price);

      if (paymentResult.success) {
        // Add loyalty points for micro-transaction
        await addLoyaltyPoints(phoneNumber, 5);

        logger.info(`✅ Micro-transaction completed for ${phoneNumber}: ${serviceType}`);

        return {
          success: true,
          service: serviceType,
          amount: service.price,
          transactionId: paymentResult.transactionId,
          message: `✅ ${service.name} purchased successfully!`
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
   * Get subscription status for user
   * @param {Object} user - User object
   * @returns {Object} Subscription status
   */
  getSubscriptionStatus(user) {
    const plan = this.getPlan(user.subscriptionTier || 'free');
    const isActive = user.subscriptionExpiry ?
      new Date(user.subscriptionExpiry) > new Date() :
      user.subscriptionTier === 'free';

    return {
      plan: user.subscriptionTier || 'free',
      planName: plan.name,
      isActive,
      expiryDate: user.subscriptionExpiry,
      features: plan.features,
      price: plan.price,
      currency: plan.currency
    };
  }

  /**
   * Generate payment link (placeholder for MVP)
   * @param {string} planId - Plan ID
   * @param {string} phoneNumber - User's phone number
   * @returns {string} Payment link
   */
  generatePaymentLink(planId, phoneNumber) {
    const plan = this.getPlan(planId);
    // In production, this would generate a real payment link
    return `https://payment.astrologybot.com/subscribe?plan=${planId}&user=${phoneNumber}&amount=${plan.price}`;
  }
}

module.exports = new PaymentService();
