const mongoose = require('mongoose');

/**
 * Session Schema for WhatsApp Bot Conversations
 * Stores conversation state and context
 */
const sessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    phoneNumber: {
      type: String,
      required: true,
      index: true
    },

    // Conversation state
    currentFlow: {
      type: String,
      default: null
    },
    currentStep: {
      type: String,
      default: null
    },
    flowData: {
      type: mongoose.Schema.Types.Mixed, // Flexible object for flow-specific data
      default: {}
    },

    // Context and memory
    context: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    memory: [
      {
        timestamp: { type: Date, default: Date.now },
        type: String, // 'user_input', 'bot_response', 'system_event'
        content: mongoose.Schema.Types.Mixed
      }
    ],

    // Session metadata
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 86400 // Auto-delete after 24 hours of inactivity
    },
    lastActivity: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    },

    // User agent and device info
    userAgent: String,
    platform: {
      type: String,
      enum: ['whatsapp', 'web', 'api'],
      default: 'whatsapp'
    }
  },
  {
    timestamps: true,
    collection: 'sessions'
  }
);

// Indexes for performance
sessionSchema.index({ phoneNumber: 1, lastActivity: -1 });
sessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 }); // TTL index for auto-cleanup
sessionSchema.index({ isActive: 1 });

// Pre-save middleware to update lastActivity
sessionSchema.pre('save', function(next) {
  this.lastActivity = new Date();
  next();
});

// Method to update session activity
sessionSchema.methods.touch = function() {
  this.lastActivity = new Date();
  return this.save();
};

// Method to add to memory
sessionSchema.methods.addToMemory = function(type, content) {
  this.memory.push({
    timestamp: new Date(),
    type,
    content
  });

  // Keep only last 50 memory items to prevent unbounded growth
  if (this.memory.length > 50) {
    this.memory = this.memory.slice(-50);
  }

  return this.save();
};

// Static method to clean up old sessions
sessionSchema.statics.cleanupOldSessions = async function() {
  const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

  const result = await this.deleteMany({
    lastActivity: { $lt: cutoffDate },
    isActive: false
  });

  return result.deletedCount;
};

// Static method to get active session for phone number
sessionSchema.statics.getActiveSession = function(phoneNumber) {
  return this.findOne({
    phoneNumber,
    isActive: true
  }).sort({ lastActivity: -1 });
};

sessionSchema.statics.generateSessionId = function() {
  return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

module.exports = mongoose.model('Session', sessionSchema);
