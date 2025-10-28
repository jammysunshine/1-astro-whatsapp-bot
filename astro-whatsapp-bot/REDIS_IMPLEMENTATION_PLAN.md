# Redis Implementation Plan for Astrology WhatsApp Bot

## Overview
This document outlines a comprehensive plan for implementing Redis caching in the Astrology WhatsApp Bot to significantly improve performance, reduce database load, and enhance user experience.

## Objectives
1. Implement Redis-based caching to reduce MongoDB load
2. Improve response times for user interactions
3. Cache pre-calculated astrological services for each user
4. Implement rate limiting to prevent system abuse
5. Cache frequently accessed data and API responses
6. Optimize resource utilization and scalability

## Implementation Requirements for Executing AI

### Critical Mandate
Any AI executing this scope must follow this essential process:

1. **Thoroughly Review Existing Codebase**: Before implementing any changes, the AI must read and analyze all existing source files, particularly:
   - `src/models/userModel.js`
   - `src/services/whatsapp/messageProcessor.js`
   - `src/services/whatsapp/messageSender.js`
   - `src/config/database.js`
   - `src/server.js`
   - All files in `src/services/astrology/`
   - All files in `src/models/`

2. **Create Independent Plan**: Based on the codebase review, the AI must create their own Redis implementation plan with specific approaches for each caching strategy.

3. **Merge Plans**: The AI should merge their independently created plan with this comprehensive plan, creating a combined approach that leverages both perspectives.

4. **Create Final Scope and Plan**: The AI should produce a final, unified scope and plan that incorporates both approaches for optimal results.

This approach ensures that the implementation is tailored to the actual state of the codebase while leveraging comprehensive frameworks provided in this document.

## Cache Implementation Strategy

### 1. User Profile and Pre-Calculated Astro Data Caching

#### Files to Modify:
- `src/models/userModel.js` - Update user retrieval functions
- `src/services/whatsapp/messageProcessor.js` - Integrate with caching
- `src/services/cache/redisCache.js` - Create new Redis service
- `src/services/astrology/vedicCalculator.js` - Update calculation functions

#### Implementation:
```javascript
// Cache structure for user data
const USER_CACHE_KEY = `user:${phoneNumber}`;
const USER_ASTRO_CACHE_KEY = `user_astro:${phoneNumber}`;
const USER_SERVICE_CACHE_KEY = `user_service:${phoneNumber}:${serviceType}`;
```

**Strategy:**
- Cache complete user profile with 1-hour TTL
- Cache pre-calculated astro services per user with service-specific TTLs
- Cache individual services separately for granular control
- Implement pre-calculation when user profile is complete

**TTL Guidelines:**
- Birth charts: 24 hours (though birth data doesn't change, allow for recalculation)
- Daily horoscopes: 1 hour
- Transits: 6 hours
- Compatibility data: 24 hours
- Static calculations: 7 days

#### Pre-calculation Triggers:
- When user completes profile with birth details
- When user updates birth details  
- Periodic background job every 12 hours to refresh daily-changing data
- On first request after cache expiry

### 2. Session and Conversation State Caching

#### Files to Modify:
- `src/services/whatsapp/messageProcessor.js`
- `src/conversation/conversationEngine.js`
- `src/models/userModel.js` (session functions)

#### Implementation:
```javascript
// Cache structure for sessions
const SESSION_CACHE_KEY = `session:${phoneNumber}`;
const CONVERSATION_CONTEXT_CACHE_KEY = `context:${phoneNumber}`;
```

**Strategy:**
- Cache user's current position in conversation flows
- Cache pending responses and conversation state
- Cache menu navigation context
- TTL: 30 minutes (conversation typically completes within this timeframe)

### 3. Third-Party API Response Caching

#### Files to Modify:
- `src/services/whatsapp/messageSender.js` (WhatsApp tokens)
- `src/services/astrology/geocoding/GeocodingService.js`
- `src/services/ai/` files (Mistral, OpenAI, etc.)
- `src/services/payment/paymentService.js`

#### Implementation:
```javascript
// Cache structures
const GEOCODE_CACHE_KEY = `geocode:${location}`;
const TIMEZONE_CACHE_KEY = `timezone:${coordinates}`;
const API_TOKEN_CACHE_KEY = `api_token:${service}`;
const PAYMENT_STATUS_CACHE_KEY = `payment:${phoneNumber}`;
```

**Strategy:**
- Cache geocoding results for locations (TTL: 30 days, rarely changes)
- Cache timezone calculations for coordinates
- Cache WhatsApp business account tokens
- Cache payment status and subscription benefits
- Cache Google Maps API responses for common locations

### 4. Menu and Configuration Caching

#### Files to Modify:
- `src/conversation/menuLoader.js`
- `src/conversation/flowLoader.js`
- `src/utils/promptUtils.js`
- `src/services/i18n/TranslationService.js`

#### Implementation:
```javascript
// Cache structures
const MENU_CACHE_KEY = `menu:${menuName}`;
const FLOW_CACHE_KEY = `flow:${flowName}`;
const PROMPT_CACHE_KEY = `prompt:${promptKey}`;
const TRANSLATION_CACHE_KEY = `translation:${lang}:${key}`;
```

**Strategy:**
- Cache menu configurations (TTL: 1 hour)
- Cache conversation flows (TTL: 1 hour)
- Cache language translations (TTL: 1 hour)
- Cache frequently used prompts (TTL: 1 hour)

### 5. Astrological Data and Ephemeris Caching

#### Files to Modify:
- `src/services/astrology/vedicCalculator.js`
- `src/services/astrology/astrologyEngine.js`
- `src/services/astrology/` all calculation files
- `src/services/astrology/geocoding/GeocodingService.js` (for timezone caching)

#### Implementation:
```javascript
// Cache structures
const EPHEMERIS_CACHE_KEY = `ephemeris:${julianDay}`;
const PLANETARY_POSITION_CACHE_KEY = `planet_pos:${planet}:${julianDay}`;
const RISING_SIGN_CACHE_KEY = `rising:${time}:${place}`;
const HOUSE_CUSPS_CACHE_KEY = `houses:${birthDataKey}`;
```

**Strategy:**
- Cache planetary positions for specific Julian Days (these are fixed astronomical data)
- Cache calculated house cusps for common birth times/locations
- Cache rising sign calculations for frequently used time/place combinations
- Cache compatibility calculation baselines

### 6. Rate Limiting Implementation

#### Files to Modify:
- `src/services/whatsapp/messageProcessor.js` (main integration)
- `src/services/cache/redisCache.js` (rate limiting functions)

#### Implementation:
```javascript
// Rate limiting cache structure
const RATE_LIMIT_KEY = `rate_limit:${phoneNumber}`;
```

**Strategy:**
- Track requests per user per time window
- Default: 10 requests per minute per user
- Adjustable limits based on subscription tier
- Block requests that exceed rate limits

### 7. AI and External Service Response Caching

#### Files to Modify:
- `src/services/ai/MistralAIService.js`
- `src/services/ai/` other AI service files
- `src/services/whatsapp/messageProcessor.js` (integration)

#### Implementation:
```javascript
// AI response cache structure
const AI_RESPONSE_CACHE_KEY = `ai:${promptHash}`;
const AI_MODEL_STATUS_CACHE_KEY = `ai_model:${modelType}`;
```

**Strategy:**
- Cache AI responses for similar prompts
- Cache AI model initialization status
- Cache generated tarot, numerology, and other AI-based readings

### 8. Compatibility and Relationship Data Caching

#### Files to Modify:
- `src/services/whatsapp/messageProcessor.js` (compatibility functions)
- `src/services/astrology/compatibility/CompatibilityChecker.js`

#### Implementation:
```javascript
// Compatibility cache structure
const COMPATIBILITY_CACHE_KEY = `compat:${user1Id}:${user2Id}`;
const COMPATIBILITY_PROFILE_CACHE_KEY = `compat_profile:${phoneNumber}`;
```

**Strategy:**
- Cache compatibility results between users
- Cache compatibility profile snippets for quick lookup
- Cache in both directions for faster retrieval

## Detailed File Modification Plan

### 1. Create Redis Cache Service (`src/services/cache/redisCache.js`)
```javascript
const redis = require('redis');
const logger = require('../../utils/logger');

class RedisCache {
  constructor() {
    this.client = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      retry_strategy: (options) => {
        if (options.error && options.error.code === 'ECONNREFUSED') {
          logger.error('Redis server connection refused');
          return new Error('Redis server connection refused');
        }
        return Math.min(options.attempt * 100, 3000);
      }
    });

    this.client.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });

    this.client.on('connect', () => {
      logger.info('Redis Client Connected');
    });

    this.client.connect();
  }

  // User caching methods
  async cacheUser(phoneNumber, userData, ttl = 3600) { /* ... */ }
  async getCachedUser(phoneNumber) { /* ... */ }
  async deleteCachedUser(phoneNumber) { /* ... */ }
  
  // User astro data caching methods
  async cacheUserProfileCalculations(phoneNumber, calculations, ttl = 3600) { /* ... */ }
  async getCachedUserProfileCalculations(phoneNumber) { /* ... */ }
  async cacheUserSpecificService(phoneNumber, serviceType, result, ttl) { /* ... */ }
  async getCachedUserSpecificService(phoneNumber, serviceType) { /* ... */ }
  
  // Rate limiting methods
  async isRateLimited(phoneNumber, maxRequests = 10, windowMs = 60000) { /* ... */ }
  async incrementRequestCount(phoneNumber, windowMs = 60000) { /* ... */ }
  
  // General caching methods
  async cacheData(key, data, ttl = 3600) { /* ... */ }
  async getCachedData(key) { /* ... */ }
  
  // Astro data caching methods
  async cachePlanetaryPosition(key, positionData, ttl = 2592000) { /* ... */ }
  async getCachedPlanetaryPosition(key) { /* ... */ }
  async cacheEphemerisRange(startJulianDay, endJulianDay, data, ttl = 604800) { /* ... */ }
  async getCachedEphemerisRange(startJulianDay, endJulianDay) { /* ... */ }
  
  // Translation and localization methods
  async cacheTranslation(key, translation, ttl = 3600) { /* ... */ }
  async getCachedTranslation(key) { /* ... */ }
  
  // Menu configuration methods
  async cacheMenuConfiguration(menuName, config, ttl = 3600) { /* ... */ }
  async getCachedMenuConfiguration(menuName) { /* ... */ }
  
  // Session and conversation methods
  async cacheSessionState(phoneNumber, state, ttl = 1800) { /* ... */ }
  async getCachedSessionState(phoneNumber) { /* ... */ }
  
  // Compatibility methods
  async cacheCompatibilityResult(user1Id, user2Id, result, ttl = 86400) { /* ... */ }
  async getCachedCompatibilityResult(user1Id, user2Id) { /* ... */ }
}

module.exports = RedisCache;
```

### 2. Update User Model (`src/models/userModel.js`)
- Modify `getUserByPhone()` to check Redis cache first
- Modify `createUser()` to cache new user data
- Modify `updateUserProfile()` to invalidate cache when necessary
- Add pre-calculation triggers when birth details are complete

### 3. Update Message Processor (`src/services/whatsapp/messageProcessor.js`)
- Add Redis cache initialization
- Integrate rate limiting at top of `processIncomingMessage`
- Update service functions to use cached user calculations when available
- Add pre-calculation triggers for new users
- Update translation calls to use cached results

### 4. Update Server Initialization (`src/server.js`)
- Initialize Redis connection at startup
- Add periodic job for pre-calculation of all users

### 5. Update Astro Calculation Files (`src/services/astrology/`)
- Add caching to calculation functions
- Implement ephemeris data caching
- Update compatibility calculations to use cache

### 6. Update Menu and Flow Loaders (`src/conversation/`)
- Add caching to menu configurations
- Add caching to conversation flows
- Update to use cached configurations

### 7. Update AI Services (`src/services/ai/`)
- Add caching to AI responses
- Add model status caching
- Update to use cached responses when appropriate

### 8. Update Geocoding Service (`src/services/astrology/geocoding/`)
- Add caching to geocoding results
- Add timezone calculation caching

## Performance Benefits

### Expected Improvements:
- **Database Load**: 70-80% reduction in MongoDB queries
- **Response Time**: 80-90% improvement for returning users with cached data
- **API Calls**: 90% reduction in third-party API calls (geocoding, etc.)
- **Computational Overhead**: 60-70% reduction for returning users
- **Scalability**: Support for 3-5x more concurrent users

### Monitoring Requirements:
- Cache hit/miss ratios
- Redis memory usage
- Database query reduction metrics
- Response time improvements
- Rate limiting effectiveness

## Implementation Order

### Phase 1: Foundation
1. Create `redisCache.js` service
2. Update `src/server.js` to initialize Redis
3. Update `src/models/userModel.js` with basic caching

### Phase 2: Core Functionality  
1. Implement user pre-calculation
2. Add rate limiting
3. Update `messageProcessor.js` for caching integration

### Phase 3: Service Caching
1. Add menu and configuration caching
2. Add third-party API response caching
3. Add astrological data caching

### Phase 4: Advanced Caching
1. Add AI response caching
2. Add session and conversation state caching
3. Add compatibility data caching

## Environment Configuration

Add to `.env`:
```
REDIS_URL=redis://localhost:6379
CACHE_TTL=3600
RATE_LIMIT_MAX=10
RATE_LIMIT_WINDOW=60000
REDIS_PASSWORD=your_redis_password
```

Update `docker-compose.yml` to include Redis service.

## Testing Strategy

1. Unit tests for Redis cache functions
2. Integration tests for cached service calls
3. Performance tests comparing with/without cache
4. Rate limiting tests
5. Cache invalidation tests
6. Error handling tests when Redis is unavailable

This comprehensive plan provides a foundation for implementing Redis caching that will significantly improve application performance while maintaining data accuracy and system reliability.