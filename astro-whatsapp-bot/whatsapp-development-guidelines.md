# WhatsApp Development Rules & Standards

## Overview
This document outlines the development standards and architectural patterns for the Astro WhatsApp Bot. These rules ensure consistent user experience, maintainable code, and proper WhatsApp Business API usage.

## 1. Message Type Architecture

### When to Use Buttons (Interactive Messages)
Buttons should be used for **structured navigation and limited-choice interactions**:

#### ✅ Use Buttons For:
- **Main Menu Navigation**: `main_menu`, `personal_astrology_menu`, `family_group_menu`, `settings_profile_menu`
- **Onboarding Flows**: Language selection, profile confirmation (Yes/No)
- **Service Response Actions**: "Another Reading", "Main Menu", "Detailed Analysis"
- **Subscription Selection**: Plan choices (Essential/Premium)
- **Limited Options**: Maximum 3 buttons per message (WhatsApp API limit)

#### ❌ Don't Use Buttons For:
- **Data Collection**: Birth dates, times, locations (require text input)
- **Free-form Questions**: AI-powered responses to general queries
- **Error Messages**: Immediate text feedback needed
- **Complex Multi-step**: Sequential data collection processes
- **Open-ended Input**: Variable user responses

### Button Implementation Pattern
```javascript
// Correct button structure
const buttons = [
  { type: 'reply', reply: { id: 'btn_action', title: 'Action Name' } },
  { type: 'reply', reply: { id: 'btn_menu', title: 'Main Menu' } }
];

await sendMessage(phoneNumber, { type: 'button', body, buttons }, 'interactive');
```

## 2. Date/Time Format Standards

### Strict Format Requirements
**ALL date/time inputs must enforce these exact formats:**

#### Birth Date
- **Format**: `DDMMYY` (6 digits) or `DDMMYYYY` (8 digits)
- **Examples**: `150690` (June 15, 1990) or `15061990`
- **Validation**: Reject all other formats (DD/MM/YYYY, MM/DD/YYYY, etc.)

#### Birth Time
- **Format**: `HHMM` (4 digits, 24-hour format)
- **Examples**: `1430` (2:30 PM), `0930` (9:30 AM)
- **Validation**: Reject all other formats (HH:MM, 12-hour, etc.)

### Century Disambiguation
For `DDMMYY` format, automatically resolve century:
- Prefer 2000s for recent births (≤ current year)
- Fall back to 1900s if 2000s interpretation is invalid
- Show clarification buttons if both interpretations are valid

### Multilingual Format Specification
**All 27+ supported languages must specify formats as:**
- **English**: "DDMMYY or DDMMYYYY format"
- **Other Languages**: Translated equivalents with same format restrictions
- **Examples**: Always show both formats: `150690 or 15061990, 1430`

## 3. Conversation Flow Patterns

### Flow Configuration Structure
```json
{
  "flow_name": {
    "start_step": "initial_step",
    "steps": {
      "step_name": {
        "prompt": "User message with clear instructions",
        "validation": "date|time|text|language_choice",
        "next_step": "next_step_name",
        "data_key": "user_property",
        "interactive": {
          "type": "button_reply",
          "body": "Confirmation message",
          "buttons": [...]
        }
      }
    }
  }
}
```

### Flow vs Direct Action Decision Tree
```
User Message Received
├── Has active session?
│   ├── Yes → Process in current flow
│   └── No → Check message type
│       ├── Text → Keyword matching
│       ├── Interactive → Button processing
│       └── Media → Media handling
```

## 4. Multilingual Support Standards

### Language Detection & Fallback
1. **Primary**: Use user's `preferredLanguage` setting
2. **Secondary**: Detect from phone number country code
3. **Fallback**: English for unsupported languages
4. **Validation**: All translations must maintain format specifications

### Translation Key Structure
```json
{
  "messages": {
    "service_name": {
      "title": "Translated title",
      "description": "Translated description"
    }
  },
  "prompts": {
    "birth_date": {
      "request": "Translated request with DDMMYY/DDMMYYYY format",
      "invalid": "Translated error with format reminder"
    }
  },
  "buttons": {
    "action_name": "Translated button text"
  }
}
```

### RTL Language Support
- Add RTL embedding for Arabic, Hebrew, Persian: `\u200F${text}\u200F`
- Ensure proper text direction in interactive messages
- Test button layouts in RTL languages

## 5. Error Handling & Validation

### Validation Functions
```javascript
// Date validation - strict DDMMYY/DDMMYYYY only
const isValidBirthDate = (date) => {
  const dateRegex = /^(\d{2})(\d{2})(\d{2}(\d{2})?)$/;
  // Century disambiguation logic
  // Return true/false
};

// Time validation - strict HHMM only
const isValidBirthTime = (time) => {
  const timeRegex = /^(\d{2})(\d{2})$/;
  // Return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59
};
```

### Error Message Standards
- **Immediate Feedback**: Text responses for validation errors
- **Clear Instructions**: Include correct format examples
- **Multilingual**: Error messages in user's language
- **Actionable**: Tell user exactly how to fix the issue

### Fallback Mechanisms
1. **Button Failure**: Fall back to text menu
2. **Language Failure**: Fall back to English
3. **Service Failure**: Graceful degradation with error messages
4. **API Failure**: Retry logic with exponential backoff

## 6. Menu Configuration Standards

### Menu Structure
```json
{
  "menu_name": {
    "type": "button",
    "body": "Menu description with clear instructions",
    "buttons": [
      {
        "id": "btn_unique_id",
        "title": "Button Text (≤20 chars)",
        "action": "executeMenuAction function name"
      }
    ]
  }
}
```

### Menu Action Implementation
```javascript
const executeMenuAction = async(phoneNumber, user, action) => {
  switch (action) {
    case 'get_daily_horoscope':
      // Validate profile, generate response, send with buttons
      break;
    case 'show_main_menu':
      // Send main menu with buttons
      break;
  }
};
```

## 7. Message Processing Architecture

### Message Type Handling
```javascript
// In messageProcessor.js
switch (type) {
  case 'text':
    await processTextMessage(message, user);
    break;
  case 'interactive':
    await processInteractiveMessage(message, user);
    break;
  case 'button':
    await processButtonMessage(message, user);
    break;
}
```

### Text Message Processing Priority
1. **Active Flow**: Continue conversation flow if user has active session
2. **Keyword Matching**: Check for direct commands ("horoscope", "kundli")
3. **AI Processing**: General questions → Mistral AI
4. **Menu Fallback**: Default menu with buttons

### Interactive Message Processing
1. **Button Reply**: Process button ID through action mapping
2. **List Reply**: Handle list selections
3. **Flow Context**: Check for active conversation flows

## 8. API Integration Standards

### WhatsApp Business API Usage
- **Rate Limiting**: Respect API limits and implement backoff
- **Error Handling**: Comprehensive error response handling
- **Message Types**: Use appropriate message types for content
- **Media Handling**: Support image, video, audio, document types

### External Service Integration
- **Timeout Handling**: 30-second timeouts for API calls
- **Retry Logic**: Exponential backoff for failed requests
- **Fallback Content**: Provide text alternatives when services fail
- **Caching**: Implement appropriate caching for translations and responses

## 9. Testing Standards

### Unit Testing Requirements
- **Validation Functions**: Test all date/time format validations
- **Message Processing**: Test different message types
- **Flow Logic**: Test conversation flow state management
- **Error Handling**: Test error scenarios and fallbacks

### Integration Testing
- **End-to-End Flows**: Complete user journeys
- **Multilingual Testing**: Test in multiple languages
- **Button Interactions**: Test all button flows
- **API Integration**: Test external service integrations

## 10. Code Organization Standards

### File Structure
```
src/
├── services/
│   ├── whatsapp/
│   │   ├── messageProcessor.js    # Main message handling
│   │   ├── messageSender.js       # WhatsApp API integration
│   │   └── webhookValidator.js    # Security validation
│   ├── i18n/
│   │   ├── TranslationService.js  # Multilingual support
│   │   └── locales/               # Language files
│   └── astrology/                 # Astrology services
├── conversation/
│   ├── conversationEngine.js      # Flow management
│   ├── flowConfig.json           # Conversation flows
│   └── menuConfig.json           # Menu definitions
├── models/
│   └── userModel.js              # User data management
└── utils/
    ├── inputValidator.js         # Input validation
    ├── promptUtils.js           # Centralized prompts
    └── logger.js                # Logging utility
```

### Naming Conventions
- **Button IDs**: `btn_descriptive_name`
- **Action Names**: `camelCase` function names
- **Flow Names**: `snake_case` flow identifiers
- **Translation Keys**: `dot.notation.hierarchy`

## 11. Performance & Scalability

### Caching Strategy
- **Translations**: Cache language bundles (30-minute expiration)
- **User Sessions**: Cache active conversation states
- **API Responses**: Cache expensive astrology calculations
- **Menu Configurations**: Cache parsed menu structures

### Database Optimization
- **User Queries**: Index phone numbers and active sessions
- **Session Management**: Automatic cleanup of expired sessions
- **Batch Operations**: Use bulk operations for multiple updates
- **Connection Pooling**: Proper database connection management

## 12. Security Standards

### Input Validation
- **Sanitization**: Sanitize all user inputs
- **Format Validation**: Strict format enforcement
- **Length Limits**: Prevent buffer overflow attacks
- **Content Filtering**: Filter inappropriate content

### API Security
- **Token Management**: Secure WhatsApp API token handling
- **Webhook Validation**: Verify webhook authenticity
- **Rate Limiting**: Prevent abuse and spam
- **Error Masking**: Don't expose internal errors to users

## 13. Monitoring & Logging

### Log Levels
- **ERROR**: System failures, API errors
- **WARN**: Validation failures, fallback usage
- **INFO**: Successful operations, user interactions
- **DEBUG**: Detailed operation tracing

### Key Metrics to Monitor
- **Message Processing**: Success/failure rates
- **Response Times**: API and processing latency
- **User Engagement**: Button vs text interaction ratios
- **Error Rates**: By message type and service
- **Language Usage**: Popular languages and fallbacks

## 14. Deployment Standards

### Environment Configuration
- **Environment Variables**: Secure credential management
- **Configuration Files**: Version-controlled config files
- **Secret Management**: Proper secret storage and rotation
- **Environment Parity**: Consistent configs across environments

### Rollback Procedures
- **Version Tagging**: Tag releases for easy rollback
- **Feature Flags**: Enable/disable features without deployment
- **Gradual Rollout**: Phased deployment for critical changes
- **Monitoring Alerts**: Automated rollback triggers

---

## Compliance Checklist

Before deploying any WhatsApp bot changes:

- [ ] All date/time inputs use strict DDMMYY/DDMMYYYY and HHMM formats
- [ ] Button usage follows structured navigation patterns
- [ ] Error messages provide clear, actionable feedback
- [ ] All new text includes multilingual translations
- [ ] Input validation prevents invalid formats
- [ ] Fallback mechanisms handle API failures
- [ ] Performance impact assessed and optimized
- [ ] Security review completed for new features
- [ ] Tests added for new functionality
- [ ] Documentation updated for changes

## References

- [WhatsApp Business API Documentation](https://developers.facebook.com/docs/whatsapp/)
- [Multilingual Support Standards](./MULTILINGUAL_SUPPORT_COMPLETE.md)
- [Date/Time Format Validation](./docs/validation/)
- [Conversation Flow Architecture](./docs/architecture/)