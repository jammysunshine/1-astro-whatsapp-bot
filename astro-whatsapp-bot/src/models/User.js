const mongoose = require('mongoose');

/**
 * User Schema for Astrology WhatsApp Bot
 * Stores user profiles, preferences, and astrology data
 */
const userSchema = new mongoose.Schema(
  {
    // Basic user information
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Profile information
    name: {
      type: String,
      default: 'Cosmic Explorer',
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', null],
      default: null,
    },
    preferredLanguage: {
      type: String,
      default: 'en',
    },
    timezone: {
      type: String,
      default: () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    },

    // Birth details for astrology
    birthDate: {
      type: String, // DD/MM/YYYY format
      default: null,
    },
    birthTime: {
      type: String, // HH:MM format
      default: null,
    },
    birthPlace: {
      type: String, // City, Country
      default: null,
    },

    // Astrology data (calculated from birth details)
    sunSign: String,
    moonSign: String,
    risingSign: String,
    kundliGenerated: {
      type: Boolean,
      default: false,
    },

    // Subscription and billing
    subscriptionTier: {
      type: String,
      enum: ['free', 'essential', 'premium', 'vip'],
      default: 'free',
    },
    subscriptionExpiry: Date,

    // User preferences
    preferences: {
      dailyNotifications: { type: Boolean, default: true },
      weeklyNotifications: { type: Boolean, default: true },
      compatibilityNotifications: { type: Boolean, default: true },
      morningHoroscopeTime: { type: String, default: '08:00' },
      eveningReflectionTime: { type: String, default: '20:00' },
    },

    // Profile status
    profileComplete: {
      type: Boolean,
      default: false,
    },

    // Activity tracking
    createdAt: {
      type: Date,
      default: Date.now,
    },
    lastInteraction: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    lastHoroscopeSent: Date,
    totalMessages: {
      type: Number,
      default: 0,
    },

    // AI Twin functionality
    aiTwinPersonality: String,
    aiTwinMemory: [
      {
        timestamp: { type: Date, default: Date.now },
        interaction: String,
        response: String,
      },
    ],

    // Prediction and compatibility tracking
    predictionHistory: [
      {
        timestamp: { type: Date, default: Date.now },
        type: String, // 'daily', 'weekly', 'monthly'
        prediction: String,
      },
    ],
    compatibilityChecks: {
      type: Number,
      default: 0,
    },

    // Loyalty and referral system
    loyaltyPoints: {
      type: Number,
      default: 0,
    },
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    referredBy: String,
    referredUsers: [String],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
    collection: 'users',
  }
);

// Indexes for performance
userSchema.index({ phoneNumber: 1 });
userSchema.index({ referralCode: 1 });
userSchema.index({ subscriptionTier: 1 });
userSchema.index({ lastInteraction: -1 });
userSchema.index({ createdAt: -1 });

// Pre-save middleware to update updatedAt
userSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for checking active subscription
userSchema.virtual('hasActiveSubscription').get(function () {
  if (!this.subscriptionTier || this.subscriptionTier === 'free') {
    return false;
  }

  if (!this.subscriptionExpiry) {
    return true; // Lifetime subscription
  }

  return this.subscriptionExpiry > new Date();
});

// Method to get subscription benefits
userSchema.methods.getSubscriptionBenefits = function () {
  const tier = this.subscriptionTier || 'free';

  const benefits = {
    free: {
      dailyMicroPrediction: true,
      birthChartVisualization: true,
      weeklyTransitSummary: true,
      communityForum: true,
      compatibilityChecks: 1,
      maxCompatibilityChecks: 1,
    },
    essential: {
      dailyPersonalizedHoroscope: true,
      weeklyVideoPredictions: true,
      monthlyGroupQnA: true,
      basicCompatibilityMatching: true,
      compatibilityChecks: 5,
      maxCompatibilityChecks: 5,
      dailyCosmicTips: true,
      luckyNumberOfDay: true,
    },
    premium: {
      unlimitedQuestions: true,
      priorityHumanAstrologer: true,
      priorityResponseTime: '24h',
      monthlyReports: true,
      exclusiveRemedialSolutions: true,
      unlimitedCompatibility: true,
      maxCompatibilityChecks: Infinity,
      priorityReplies: true,
    },
    vip: {
      dedicatedHumanAstrologer: true,
      quarterlyLifePlanning: true,
      personalizedMeditation: true,
      rarePlanetaryEventReadings: true,
      exclusiveCommunity: true,
      maxCompatibilityChecks: Infinity,
    },
  };

  return benefits[tier] || benefits.free;
};

// Static method to generate user ID
userSchema.statics.generateUserId = function () {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Static method to generate referral code
userSchema.statics.generateReferralCode = function () {
  return `REF${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
};

module.exports = mongoose.model('User', userSchema);
