# Detailed Use Cases for User Interactions (Enhanced)

## Use Case 1: New User Registration and Profile Creation (Enhanced)

**Actor**: New user
**Precondition**: User has WhatsApp installed
**Flow**:

1. User sends "Hi" to the bot number
2. Bot responds with welcome message and asks for basic information
3. Bot guides user through birth details input (date, time, place)
4. Bot verifies phone number via OTP
5. Bot allows user to select preferred astrology systems, languages, and friend connections
6. User sets up payment method
7. System creates user profile and recommends initial reading with compatibility feature
8. System suggests adding a friend for compatibility check

## Use Case 2: Daily Horoscope Subscription (Enhanced)

**Actor**: Registered user
**Precondition**: User has completed basic profile setup
**Flow**:

1. User sends "Daily Horoscope" or selects from menu
2. System confirms subscription status
3. If unsubscribed, system presents daily plan options
4. User selects plan and completes payment
5. System sends immediate daily horoscope
6. For subscribed users, system sends daily horoscope automatically at preferred time
7. User can request daily horoscope manually at any time
8. **Social Element**: User can share daily horoscope with friends/compatibility matches

## Use Case 3: One-Time Question Service

**Actor**: Any user
**Precondition**: User has basic account set up
**Flow**:

1. User asks a specific question (e.g., "Will I get a job promotion this month?")
2. System responds with payment required message
3. User confirms payment (based on question complexity)
4. System processes payment via available method
5. AI system provides initial analysis
6. If needed, question is routed to human astrologer
7. User receives comprehensive answer

## Use Case 4: Human Astrologer Chat

**Actor**: Subscribed user
**Precondition**: User has active subscription
**Flow**:

1. User sends "Chat with Astrologer" or selects from menu
2. System checks subscription status
3. If subscribed, connects user to available astrologer
4. If not subscribed, prompts for one-time chat payment
5. User-chat session begins with astrologer
6. Session duration and type defined by subscription tier
7. System sends follow-up report after chat completion

## Use Case 5: Subscription Management

**Actor**: Registered user
**Precondition**: User has an account
**Flow**:

1. User sends "My Account" or "Manage Subscription"
2. System displays current subscription status
3. User can upgrade/downgrade plan
4. User can update payment method
5. User can manage auto-renewal settings
6. User can cancel subscription (with proper notice)

## Use Case 6: Multi-System Reading Request

**Actor**: Subscribed user
**Precondition**: User has active subscription
**Flow**:

1. User requests combined reading (e.g., "Vedic and Western compatibility report")
2. System verifies subscription covers requested service
3. System processes request using multiple astrology systems
4. User receives integrated report with different perspective
5. Option to ask follow-up questions about the reading

## Use Case 7: Referral and Loyalty Rewards (Enhanced)

**Actor**: Existing user
**Precondition**: User has account and referral code
**Flow**:

1. User sends "refer" or "share" command
2. System provides unique referral link/code with compatibility feature
3. User shares with contacts via WhatsApp
4. When referred friend signs up and makes purchase, both users get credited
5. System updates loyalty points based on activities
6. User can check reward status and redeem points
7. **Social Element**: System shows compatibility between referrer and referred if both use service

## Use Case 8: Payment and Billing

**Actor**: Any user
**Precondition**: User requires paid service
**Flow**:

1. User selects desired service
2. System displays pricing based on region and currency
3. User selects preferred payment method
4. System processes payment through secure gateway
5. User receives payment confirmation
6. Service is delivered as promised
7. Receipt is sent via WhatsApp

## Use Case 9: Compatibility and Social Features (New)

**Actor**: Active user
**Precondition**: User has basic profile set up
**Flow**:

1. User sends "compatibility" or "check with friend"
2. System asks for friend's birth details
3. System generates compatibility report
4. Both users may receive summary (if friend has account)
5. Option to share results
6. System suggests next steps for relationship growth
7. **Viral Element**: Encourages friend to sign up for full compatibility report
