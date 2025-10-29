# Message Processor Refactoring Plan

## Current Issues in messageProcessor.js

### Code Duplication
The current `messageProcessor.js` (approximately 3,200+ lines) exhibits significant code duplication:

1. **Menu Action Handling**: Each menu action (50+ options) has similar validation, user language detection, and response sending patterns
2. **Interactive Message Response Creation**: Similar button/button structures repeated for each menu option
3. **Error Handling**: Same try-catch and validation patterns repeated across multiple functions
4. **User Profile Validation**: Repeated validation checks with similar structures
5. **Translation Logic**: Same fallback patterns used across all menu options
6. **Response Formatting**: Similar text formatting structures for different astrology services

### Structural Issues
1. **Monolithic Function**: The `executeMenuAction` function contains all menu logic in a single switch statement
2. **Mixed Concerns**: Message processing, business logic, and response formatting are all in one file
3. **Maintenance Difficulty**: Fixing an issue requires updating 50+ places if the pattern is duplicated
4. **Code Reuse Infeasibility**: Common patterns can't be easily abstracted due to tight coupling

## Refactoring Strategy

### Phase 1: Extract Common Utilities

#### 1.1 Create Response Building Utilities
```javascript
// src/services/whatsapp/utils/responseBuilder.js
class ResponseBuilder {
  static buildInteractiveResponse(phoneNumber, type, content, options = {}) {
    // Centralize the construction of interactive responses
  }
  
  static buildMenuResponse(phoneNumber, menuData, userLanguage) {
    // Centralize menu response building logic
  }
  
  static buildErrorResponse(phoneNumber, errorKey, userLanguage) {
    // Centralize error response building
  }
}
```

#### 1.2 Create Validation Utilities
```javascript
// src/services/whatsapp/utils/validation.js
class ValidationService {
  static validateUserProfile(user, phoneNumber, serviceName) {
    // Extracted common validation logic
  }
  
  static validateResponse(response) {
    // Response validation logic
  }
}
```

#### 1.3 Create Translation Utilities
```javascript
// src/services/whatsapp/utils/translation.js
class TranslationServiceWrapper {
  static getButtonTitle(key, language, fallback) {
    // Centralize button title translation with fallbacks
  }
  
  static getTranslatedContent(key, language, fallback) {
    // Centralize content translation
  }
}
```

### Phase 2: Create Action Framework

#### 2.1 Define Action Interface
```javascript
// src/services/whatsapp/actions/baseAction.js
class BaseAction {
  async validate(user, phoneNumber) {
    // Common validation
  }
  
  async execute(user, phoneNumber, actionData) {
    // Must be implemented by subclasses
  }
  
  async buildResponse(user, phoneNumber, actionData) {
    // Common response building
  }
}
```

#### 2.2 Create Specific Action Categories
```
src/services/whatsapp/actions/
├── baseAction.js
├── astrology/
│   ├── DailyHoroscopeAction.js
│   ├── BirthChartAction.js
│   ├── CompatibilityAction.js
│   └── ... (other astrology actions)
├── menu/
│   ├── MainMenuAction.js
│   ├── WesternAstrologyMenuAction.js
│   └── ... (other menu actions)
├── profile/
│   ├── ProfileUpdateAction.js
│   └── ProfileViewAction.js
└── divination/
    ├── TarotAction.js
    ├── IChingAction.js
    └── ... (other divination actions)
```

### Phase 3: Create Message Type Processors

#### 3.1 Text Message Processor
```javascript
// src/services/whatsapp/processors/TextMessageProcessor.js
class TextMessageProcessor {
  constructor(actionRegistry) {
    this.actionRegistry = actionRegistry;
  }
  
  async process(message, user) {
    // Handle all text message processing
    // Map keywords to actions using the registry
  }
  
  async processKeyword(messageText, user, phoneNumber) {
    // Centralized keyword processing
  }
}
```

#### 3.2 Interactive Message Processor
```javascript
// src/services/whatsapp/processors/InteractiveMessageProcessor.js
class InteractiveMessageProcessor {
  constructor(actionRegistry) {
    this.actionRegistry = actionRegistry;
  }
  
  async process(message, user) {
    // Handle interactive message processing
  }
  
  async processButtonReply(buttonId, user, phoneNumber) {
    // Centralized button processing
  }
}
```

### Phase 4: Create Action Registry

```javascript
// src/services/whatsapp/ActionRegistry.js
class ActionRegistry {
  constructor() {
    this.actions = new Map();
    this.keywordMap = new Map();  // keyword -> action mapping
    this.buttonMap = new Map();   // buttonId -> action mapping
  }
  
  registerAction(actionName, actionInstance) {
    this.actions.set(actionName, actionInstance);
  }
  
  registerKeyword(keyword, actionName) {
    this.keywordMap.set(keyword, actionName);
  }
  
  getAction(actionName) {
    return this.actions.get(actionName);
  }
  
  getActionForKeyword(keyword) {
    const actionName = this.keywordMap.get(keyword.toLowerCase());
    return actionName ? this.actions.get(actionName) : null;
  }
}
```

### Phase 5: Refactored Main Message Processor

```javascript
// src/services/whatsapp/messageProcessor.js (much simplified)
const { ActionRegistry } = require('./ActionRegistry');
const { TextMessageProcessor } = require('./processors/TextMessageProcessor');
const { InteractiveMessageProcessor } = require('./processors/InteractiveMessageProcessor');

class MessageProcessor {
  constructor() {
    this.registry = new ActionRegistry();
    this.textProcessor = new TextMessageProcessor(this.registry);
    this.interactiveProcessor = new InteractiveMessageProcessor(this.registry);
    this.initializeActions();  // Register all actions
  }
  
  initializeActions() {
    // Register all actions and their keywords
  }
  
  async processIncomingMessage(message, value) {
    // Much simplified main processing
  }
}
```

## Implementation Plan

### Week 1: Extract Utilities
- Create all utility classes (ResponseBuilder, ValidationService, TranslationServiceWrapper)
- Move common functions to these utilities
- Ensure backward compatibility

### Week 2: Create Action Framework
- Implement BaseAction class
- Create the first few specific actions (e.g., DailyHoroscopeAction, MainMenuAction)
- Create ActionRegistry
- Test with a subset of actions

### Week 3: Implement Processors
- Create TextMessageProcessor and InteractiveMessageProcessor
- Move message type processing logic to respective processors
- Connect processors to action registry

### Week 4: Integrate and Replace
- Replace the monolithic switch statement with the new architecture
- Thorough testing of all actions
- Update tests to work with new architecture

### Week 5: Cleanup and Optimization
- Remove old duplicated code
- Add error handling and logging improvements
- Performance optimization
- Documentation updates

## Benefits of This Approach

### 1. Single Point of Change
- Fixing a validation issue: Update ValidationService once
- Changing response format: Update ResponseBuilder once
- Adding translation fallback: Update TranslationServiceWrapper once

### 2. Maintainability
- Each action is in its own file with clear responsibility
- Easier to test individual components
- Better code organization

### 3. Extensibility
- Adding new actions is straightforward
- New message types can be easily supported
- Custom action behaviors without code duplication

### 4. Testability
- Each action can be unit tested in isolation
- Utilities can be tested independently
- Integration tests can focus on the coordination layer

## Migration Path

### Before Migration
- Ensure all tests pass with current code
- Create comprehensive test suite to validate behavior after changes

### During Migration
- Implement new architecture in parallel
- Use feature flags to gradually migrate to new system
- Maintain old code until all functionality is verified

### After Migration
- Remove old code once verified
- Update documentation
- Refactor tests to match new architecture