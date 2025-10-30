/**
 * ValidationMixin - Common validation methods for WhatsApp actions
 * Contains shared validation logic that was duplicated across action classes
 * Designed to be mixed into action classes to reduce code duplication
 */

const ValidationMixin = {
  /**
   * Validate user profile completion for service requirements
   * @param {string} displayName - Human-readable service name
   * @returns {Promise<boolean>} True if profile is complete and valid
   */
  async validateProfileCompletion(displayName) {
    try {
      if (!this.user) {
        await this.handleProfileError(displayName, 'incomplete_profile');
        return false;
      }

      const config = this.getActionConfig();
      const requiredFields = config?.requiredProfileFields || [];

      // If no specific fields required, just check general profile completion
      if (requiredFields.length === 0) {
        if (this.user.profileComplete) {
          return true;
        }
        await this.handleProfileError(displayName, 'incomplete_profile');
        return false;
      }

      // Check specific required fields
      const missingFields = [];
      requiredFields.forEach(field => {
        if (!this.user[field]) {
          missingFields.push(field);
        }
      });

      if (missingFields.length > 0) {
        await this.handleProfileError(displayName, 'incomplete_profile');
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error('Error in validateProfileCompletion:', error);
      await this.handleProfileError(displayName, 'incomplete_profile');
      return false;
    }
  },

  /**
   * Validate subscription limits for premium features
   * @param {string} featureType - The feature type to check limits for
   * @returns {Promise<Object>} Limits check result with isAllowed boolean
   */
  async validateSubscriptionLimits(featureType) {
    try {
      // For now, return allowed by default
      // This will be enhanced when actual subscription service is integrated
      return {
        isAllowed: true,
        plan: 'free',
        limits: {
          used: 0,
          limit: 10,
          remaining: 10
        }
      };
    } catch (error) {
      this.logger.warn('Error checking subscription limits:', error);
      // On error, allow access to avoid blocking users
      return {
        isAllowed: true,
        plan: 'free',
        limits: { used: 0, limit: 10, remaining: 10 }
      };
    }
  },

  /**
   * Validate cooldown period between requests
   * @param {string} actionId - The action ID to check cooldown for
   * @returns {Promise<Object>} Cooldown check result
   */
  async validateActionCooldown(actionId) {
    const config = this.getActionConfig();
    const cooldownMs = config?.cooldown || 0;

    if (cooldownMs <= 0) {
      return { canProceed: true };
    }

    try {
      // Check if user has recent activity for this action
      // This would typically check a cache or database
      const lastUse = await this.getLastActionTime(actionId);

      if (lastUse) {
        const timeSinceLastUse = Date.now() - lastUse;
        if (timeSinceLastUse < cooldownMs) {
          const remainingMs = cooldownMs - timeSinceLastUse;
          const remainingMinutes = Math.ceil(remainingMs / 60000);

          return {
            canProceed: false,
            remainingMs,
            remainingMinutes,
            message: `Please wait ${remainingMinutes} minute(s) before using this feature again.`
          };
        }
      }

      // Update last action time
      await this.setLastActionTime(actionId, Date.now());

      return { canProceed: true };
    } catch (error) {
      this.logger.warn('Error checking action cooldown:', error);
      // Allow action on error to avoid blocking users
      return { canProceed: true };
    }
  },

  /**
   * Validate daily usage limits
   * @param {string} featureType - The feature type to check daily limits for
   * @returns {Promise<Object>} Daily limit check result
   */
  async validateDailyLimits(featureType) {
    try {
      const usage = await this.getDailyUsage(featureType);
      const limits = await this.validateSubscriptionLimits(featureType);

      const maxDaily = limits.limits?.dailyLimit || 10;

      if (usage >= maxDaily) {
        return {
          canProceed: false,
          used: usage,
          limit: maxDaily,
          message: `You've reached your daily limit of ${maxDaily} for this feature.`
        };
      }

      return {
        canProceed: true,
        used: usage,
        limit: maxDaily,
        remaining: maxDaily - usage
      };
    } catch (error) {
      this.logger.warn('Error checking daily limits:', error);
      return { canProceed: true };
    }
  },

  /**
   * Validate input data format and content
   * @param {Object} inputData - The input data to validate
   * @param {Object} validationRules - Validation rules to apply
   * @returns {Promise<Object>} Validation result with errors if any
   */
  async validateInputData(inputData, validationRules = {}) {
    const errors = [];

    try {
      // Check required fields
      if (validationRules.required) {
        validationRules.required.forEach(field => {
          if (!inputData[field] || inputData[field].toString().trim() === '') {
            errors.push(`Field '${field}' is required`);
          }
        });
      }

      // Check field lengths
      if (validationRules.maxLengths) {
        Object.entries(validationRules.maxLengths).forEach(([field, maxLength]) => {
          if (inputData[field] && inputData[field].toString().length > maxLength) {
            errors.push(`Field '${field}' exceeds maximum length of ${maxLength} characters`);
          }
        });
      }

      // Check field formats (basic patterns)
      if (validationRules.patterns) {
        Object.entries(validationRules.patterns).forEach(([field, pattern]) => {
          if (inputData[field] && !pattern.test(inputData[field])) {
            errors.push(`Field '${field}' has invalid format`);
          }
        });
      }

      // Custom validation functions
      if (validationRules.custom) {
        for (const [field, validator] of Object.entries(validationRules.custom)) {
          if (typeof validator === 'function') {
            const result = await validator(inputData[field], inputData);
            if (result !== true) {
              errors.push(result || `Field '${field}' validation failed`);
            }
          }
        }
      }
    } catch (error) {
      this.logger.error('Error in input validation:', error);
      errors.push('Input validation encountered an error');
    }

    return {
      isValid: errors.length === 0,
      errors,
      errorMessage: errors.length > 0 ? errors.join('; ') : null
    };
  },

  /**
   * Unified validation method that combines all validation types
   * @param {Object} params - Validation parameters
   * @returns {Promise<Object>} Comprehensive validation result
   */
  async performComprehensiveValidation(params = {}) {
    const results = {
      profile: { isValid: true },
      subscription: { isAllowed: true },
      cooldown: { canProceed: true },
      dailyLimits: { canProceed: true },
      input: { isValid: true },
      overall: { canProceed: true, errors: [] }
    };

    try {
      // Profile validation
      if (params.requireProfile !== false) {
        results.profile.isValid = await this.validateProfileCompletion(params.displayName || 'this service');
      }

      // Subscription validation
      if (params.checkSubscription !== false) {
        results.subscription = await this.validateSubscriptionLimits(params.featureType);
      }

      // Cooldown validation
      if (params.checkCooldown !== false) {
        results.cooldown = await this.validateActionCooldown(params.actionId);
      }

      // Daily limits validation
      if (params.checkDailyLimits === true) {
        results.dailyLimits = await this.validateDailyLimits(params.featureType);
      }

      // Input validation
      if (params.inputData && params.validationRules) {
        results.input = await this.validateInputData(params.inputData, params.validationRules);
      }

      // Overall result
      results.overall.canProceed = (
        results.profile.isValid &&
        results.subscription.isAllowed &&
        results.cooldown.canProceed &&
        results.dailyLimits.canProceed &&
        results.input.isValid
      );

      // Collect all errors
      if (!results.profile.isValid) { results.overall.errors.push('Profile incomplete'); }
      if (!results.subscription.isAllowed) { results.overall.errors.push(results.subscription.message || 'Subscription limit reached'); }
      if (!results.cooldown.canProceed) { results.overall.errors.push(results.cooldown.message || 'Cooldown active'); }
      if (!results.dailyLimits.canProceed) { results.overall.errors.push(results.dailyLimits.message || 'Daily limit reached'); }
      if (!results.input.isValid) { results.overall.errors.push(results.input.errorMessage || 'Input validation failed'); }
    } catch (error) {
      this.logger.error('Error in comprehensive validation:', error);
      results.overall.canProceed = false;
      results.overall.errors.push('Validation system error');
    }

    return results;
  },

  /**
   * Handle validation errors with appropriate messaging
   * @param {Array} errors - List of validation errors
   * @param {string} displayName - Service display name
   */
  async handleValidationErrors(errors, displayName) {
    // Find the most appropriate error message based on error types
    let errorMessage = '';
    let shortestWaitTime = Infinity;

    for (const error of errors) {
      if (error.includes('limit')) {
        errorMessage = await this.generateSubscriptionError(displayName);
        break;
      } else if (error.includes('Profile') || error.includes('incomplete')) {
        errorMessage = await this.generateProfileError(displayName);
        break;
      } else if (error.includes('cooldown') || error.includes('wait')) {
        // Try to extract wait time and choose the longest
        const timeMatch = error.match(/(\d+)\s*minute/i);
        if (timeMatch) {
          const minutes = parseInt(timeMatch[1]);
          if (minutes < shortestWaitTime) {
            shortestWaitTime = minutes;
            errorMessage = `⏰ Please wait ${minutes} minute(s) before using this feature again.`;
          }
        }
      }
    }

    // Default error message
    if (!errorMessage) {
      errorMessage = `❌ Unable to process your request for ${displayName}. Please try again.`;
    }

    const { sendMessage } = require('../../messageSender');
    await sendMessage(this.phoneNumber, errorMessage, 'text');
  },

  // Helper methods (typically implemented by action classes)

  /**
   * Handle profile completion error
   * @param {string} displayName - Service display name
   * @param {string} errorType - Type of profile error
   */
  async handleProfileError(displayName, errorType) {
    const errorMessage = await this.generateProfileError(displayName);
    const { sendMessage } = require('../../messageSender');
    await sendMessage(this.phoneNumber, errorMessage, 'text');
  },

  /**
   * Generate profile error message
   * @param {string} displayName - Service display name
   * @returns {string} Formatted error message
   */
  async generateProfileError(displayName) {
    const config = this.getActionConfig();
    return config?.errorMessages?.incomplete ||
      `👤 *Complete Your Profile First*\n\nTo access ${displayName}, please complete your birth profile with date, time, and place.\n\nUse the Settings menu to update your information.`;
  },

  /**
   * Generate subscription error message
   * @param {string} displayName - Service display name
   * @returns {string} Formatted error message
   */
  async generateSubscriptionError(displayName) {
    const config = this.getActionConfig();
    return config?.errorMessages?.limitReached ||
      '⭐ *Premium Astrology Available*\n\nYou\'ve reached your limit for astrology insights.\n\nUpgrade to Premium for unlimited personalized readings!';
  },

  // Placeholder methods for future implementation
  async getLastActionTime(actionId) { return null; },
  async setLastActionTime(actionId, timestamp) { },
  async getDailyUsage(featureType) { return 0; }
};

module.exports = ValidationMixin;
