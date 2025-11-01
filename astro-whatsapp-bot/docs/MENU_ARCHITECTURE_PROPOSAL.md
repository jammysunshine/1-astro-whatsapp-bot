# **Proposed Menu Architecture: Modular, Flexible, and Frontend-Agnostic**

## 1. Introduction

The current approach to defining and managing the bot's interactive menu tree, primarily through a single `ActionConfig.js` file, presents significant challenges:

*   **Monolithic Configuration:** `ActionConfig.js` is becoming excessively large and complex, making it difficult to manage, update, and debug.
*   **Tight Coupling:** Menu structure, display labels, and action mappings are tightly coupled within code, requiring code changes and deployments for simple menu updates.
*   **Lack of Flexibility:** Adapting the menu tree for frequent changes or A/B testing is cumbersome.
*   **Frontend Dependency:** The current structure is inherently tied to the WhatsApp frontend, making expansion to Web, Android, iOS, and Telegram frontends difficult and redundant.
*   **Backend Integration:** The mapping between frontend actions and backend services is not clearly abstracted, hindering the transition from a monolithic microservice to individual microservices.

This document proposes a new architecture designed to address these issues, ensuring modularity, flexibility, easy configurability, and maintainability for menu tree changes, while future-proofing the system for multiple frontends and evolving backend services.

## 2. Core Principles

The proposed architecture is built upon the following principles:

*   **Modularity & Decoupling:** Separate menu definitions from rendering logic and action handling.
*   **Data-Driven Configuration:** Define menu structures using external, human-readable data files (e.g., JSON/YAML).
*   **Frontend Agnostic Menu Definitions:** The core menu structure should be independent of any specific frontend platform.
*   **Clear Separation of Concerns:** Distinct layers for menu definition, frontend rendering, action mapping, and backend service invocation.
*   **Flexibility & Configurability:** Menu changes should ideally require only data file modifications, not code changes.
*   **Maintainability:** Simplify updates, reduce cognitive load, and minimize the risk of errors.
*   **Future-Proofing:** Design for seamless integration with future frontends (Web, Android, iOS, Telegram) and the transition from a monolithic backend to individual microservices.
*   **Redundancy Support:** Acknowledge and explicitly support redundancy in menu options (e.g., a popular service appearing in multiple menus) as a UX feature, not a design flaw.

## 3. Proposed Architecture Overview

The new architecture introduces several layers to achieve the desired modularity and flexibility:

```mermaid
graph TD
    subgraph Frontend Platforms
        WhatsAppFrontend[WhatsApp Frontend]
        WebFrontend[Web Frontend]
        AndroidFrontend[Android Frontend]
        iOSFrontend[iOS Frontend]
        TelegramFrontend[Telegram Frontend]
    end

    WhatsAppFrontend --> FrontendAdapter[WhatsApp Menu Adapter]
    WebFrontend --> FrontendAdapter
    AndroidFrontend --> FrontendAdapter
    iOSFrontend --> FrontendAdapter
    TelegramFrontend --> FrontendAdapter

    FrontendAdapter --> MenuRenderer[Generic Menu Renderer]
    MenuRenderer --> MenuLoader[Menu Loader/Parser]
    MenuLoader --> MenuDefinitions[Menu Definition Files (JSON/YAML)]

    FrontendAdapter --> ActionMapper[Action Mapper]
    ActionMapper --> BackendServiceGateway[Backend Service Gateway]

    BackendServiceGateway --> MonolithicMicroservice[Monolithic Astro Microservice]
    MonolithicMicroservice --> AstroServices[100 Astro Services (Internal)]

    BackendServiceGateway --> IndividualMicroservices[Individual Astro Microservices (Future Phase)]
    IndividualMicroservices --> AstroServices
```

### 3.1. Menu Definition Layer (Frontend Agnostic)

This layer defines the entire menu tree structure, including menu types, labels, actions, and hierarchy, using external data files.

*   **Purpose:** Decouple menu structure from code, enable easy updates, and support multiple frontends.
*   **Implementation:** A dedicated directory (e.g., `astro-whatsapp-bot/menu_definitions/`) containing JSON or YAML files. Each file defines a specific menu or a logical group of menu items.
*   **Key Concepts:**
    *   **Menu ID:** A unique identifier for each menu (e.g., `main_menu`, `vedic_astrology_menu`).
    *   **Action ID:** A unique identifier for each selectable option within a menu (e.g., `get_daily_horoscope`, `show_vedic_predictive_specialized_menu`). These map directly to backend service calls or other menu actions.
    *   **Menu Item Structure:** Each item will include:
        *   `label`: Display text for the menu option (e.g., "Daily Horoscope").
        *   `actionId`: The unique ID that triggers a specific backend service or navigates to another menu.
        *   `type`: (Optional) `service` or `menu` to indicate if it's a direct service call or a navigation to a sub-menu.
        *   `description`: (Optional) A short description for list items.
    *   **Menu Structure:**
        *   `menuId`: Unique ID.
        *   `type`: `buttons` or `list`.
        *   `body`: Main text/header for the menu.
        *   `sections`: (For lists) Array of sections, each with a `title` and `rows` (array of menu items).
        *   `buttons`: (For buttons) Array of menu items.
        *   `navigation`: (Optional) Common navigation options like "Back to Main Menu".

### 3.2. Menu Loader/Parser

A utility responsible for loading, parsing, and caching the menu definition files.

*   **Purpose:** Provide a centralized, efficient way to access menu structures.
*   **Implementation:** A module that reads the JSON/YAML files, validates their structure, and stores them in memory for quick retrieval.

### 3.3. Frontend Abstraction Layer (Generic Menu Renderer)

A generic interface or base class that defines how menus are rendered, independent of the specific frontend platform.

*   **Purpose:** Provide a consistent API for frontend adapters to interact with menu data.
*   **Implementation:** A function or class that takes a `menuId` and a `platformContext` (e.g., `whatsapp`, `web`) and returns a generic representation of the menu (e.g., an array of buttons, a list object with sections and rows).

### 3.4. Frontend-Specific Adapters/Renderers

Platform-specific implementations that translate the generic menu representation into the native UI elements of each frontend.

*   **Purpose:** Handle platform-specific UI rendering and message formatting.
*   **Implementation:**
    *   **WhatsApp Menu Adapter:** Translates generic menu data into WhatsApp Interactive Buttons or Interactive Lists, adhering to character limits and formatting rules. This will replace the current hardcoded menu generation logic in `ShowMainMenuAction.js` and similar files.
    *   **Web Menu Adapter (Future):** Renders menu data as HTML/CSS elements.
    *   **Android/iOS Menu Adapters (Future):** Renders menu data using native UI components.
    *   **Telegram Menu Adapter (Future):** Renders menu data using Telegram's inline keyboards or custom keyboards.

### 3.5. Action Mapper

This layer is responsible for taking a selected `actionId` from any frontend and mapping it to the appropriate backend service invocation.

*   **Purpose:** Decouple frontend actions from backend service implementation details.
*   **Implementation:** A module that uses the `ActionConfig.js` (now streamlined for service metadata) to determine which service to call and what parameters it requires.

### 3.6. Backend Service Layer

This layer consists of your actual astrological services.

*   **Initial Phase:** The existing monolithic microservice encapsulates all 100 astro services. The Action Mapper will invoke functions/methods within this monolith.
*   **Future Phase:** As services are decoupled into individual microservices, the Action Mapper will be updated to route requests to the appropriate microservice endpoints.

## 4. Detailed Implementation Instructions

### Step 1: Externalize Menu Definitions into JSON/YAML Files

Create a new directory `astro-whatsapp-bot/menu_definitions/`. Each menu (including sub-menus) will have its own file.

**Example: `astro-whatsapp-bot/menu_definitions/main_menu.json`**

```json
{
  "menuId": "main_menu",
  "type": "list",
  "body": "🌟 *Astro Wisdom Portal*

Discover cosmic insights through astrology, numerology, and divination traditions.",
  "sections": [
    {
      "title": "Main Astrology Sections",
      "rows": [
        { "label": "🌍 Western Astrology", "actionId": "show_western_astrology_menu" },
        { "label": "🕉️ Vedic Astrology", "actionId": "show_vedic_astrology_menu" },
        { "label": "🔮 Divination & Mystic Arts", "actionId": "show_divination_mystic_menu" }
      ]
    },
    {
      "title": "Key Life Areas",
      "rows": [
        { "label": "👥 Relationships & Group Astrology", "actionId": "show_relationships_groups_menu" },
        { "label": "🔢 Numerology & Life Patterns", "actionId": "show_numerology_lifepatterns_menu" },
        { "label": "🗓️ Calendar & Astrological Timings", "actionId": "show_calendar_timings_menu" },
        { "label": "⚕️ Health, Remedies & Doshas", "actionId": "show_health_remedies_menu" }
      ]
    },
    {
      "title": "User Management",
      "rows": [
        { "label": "⚙️ Settings & Profile", "actionId": "show_settings_profile_menu" }
      ]
    }
  ],
  "navigation": [
    { "label": "🏠 Back to Main Menu", "actionId": "show_main_menu" }
  ]
}
```

**Example: `astro-whatsapp-bot/menu_definitions/vedic_astrology_menu.json`**
*(Note: This is one of the larger menus, requiring internal navigation which will be handled by the adapter constructing the actual message content)*

```json
{
  "menuId": "vedic_astrology_menu",
  "type": "list",
  "body": "🕉️ _Vedic Astrology Services_

Choose your preferred Vedic astrological reading:",
  "sections": [
    {
      "title": "Core Readings & Charts Section",
      "rows": [
        { "label": "📊 Vedic Birth Chart (Kundli)", "actionId": "get_hindu_astrology_analysis" },
        { "label": "📜 Nadi Astrology Reading", "actionId": "show_nadi_flow" },
        { "label": "📈 Detailed Chart Analysis", "actionId": "generateDetailedChartAnalysis" },
        { "label": "🌍 Basic Birth Chart (Quick View)", "actionId": "generateBasicBirthChart" },
        { "label": "☀️ Sun Sign Analysis (Vedic)", "actionId": "calculateSunSign" },
        { "label": "🌙 Moon Sign Analysis (Vedic)", "actionId": "calculateMoonSign" },
        { "label": "⬆️ Rising Sign (Lagna) Analysis", "actionId": "calculateRisingSign" },
        { "label": "🌌 Nakshatra Analysis (Lunar Mansions)", "actionId": "calculateNakshatra" }
      ]
    },
    {
      "title": "Navigation to Advanced Vedic",
      "rows": [
        { "label": "⏳ Vedic Predictive & Specialized", "actionId": "show_vedic_predictive_specialized_menu" },
        { "label": "⬅️ Back to Main Menu", "actionId": "show_main_menu" }
      ]
    }
  ],
  "navigation": [
    { "label": "⬅️ Back to Main Menu", "actionId": "show_main_menu" }
  ]
}
```

*(Continue creating similar JSON/YAML files for all menus and sub-menus as per the proposed structure in the previous turns, ensuring all 100 services are covered and WhatsApp limits are respected. Add `navigation` section where appropriate for back buttons.)*

### Step 2: Create a Menu Loader/Parser

Create a utility module (e.g., `astro-whatsapp-bot/src/utils/menuLoader.js`) to load these definions.

```javascript
// astro-whatsapp-bot/src/utils/menuLoader.js
const fs = require('fs');
const path = require('path');
const logger = require('./logger'); // Assuming you have a logger utility

const MENU_DEFINITIONS_DIR = path.join(__dirname, '../../../menu_definitions');
const menuCache = {};

class MenuLoader {
  static async loadMenu(menuId) {
    if (menuCache[menuId]) {
      return menuCache[menuId];
    }

    const menuFilePath = path.join(MENU_DEFINITIONS_DIR, `${menuId}.json`);
    try {
      const menuData = await fs.promises.readFile(menuFilePath, 'utf8');
      const menu = JSON.parse(menuData);
      // Basic validation (can be expanded)
      if (!menu.menuId || !menu.type || !menu.body) {
        throw new Error(`Invalid menu definition in ${menuFilePath}`);
      }
      menuCache[menuId] = menu;
      logger.info(`Menu '${menuId}' loaded and cached.`);
      return menu;
    } catch (error) {
      logger.error(`Failed to load menu '${menuId}':`, error);
      throw new Error(`Menu '${menuId}' not found or invalid.`);
    }
  }

  static clearCache() {
    Object.keys(menuCache).forEach(key => delete menuCache[key]);
    logger.info('Menu cache cleared.');
  }

  // Optional: Load all menus at startup
  static async loadAllMenus() {
    try {
      const files = await fs.promises.readdir(MENU_DEFINITIONS_DIR);
      const jsonFiles = files.filter(file => file.endsWith('.json'));
      for (const file of jsonFiles) {
        const menuId = file.replace('.json', '');
        await MenuLoader.loadMenu(menuId);
      }
      logger.info(`All menus loaded: ${Object.keys(menuCache).join(', ')}`);
    } catch (error) {
      logger.error('Failed to load all menus:', error);
      throw error;
    }
  }
}

module.exports = MenuLoader;
```

### Step 3: Refactor `ActionConfig.js`

`ActionConfig.js` should now exclusively contain metadata for the *backend services* (the 100 astro services), not menu display logic. Menu display names will be read from the menu definition files.

*(This will involve a manual process of going through `ActionConfig.js` and removing `displayName` from `ASTROLOGY_CONFIG`, `NUMEROLOGY_CONFIG`, `DIVINATION_CONFIG`, `PROFILE_CONFIG` if these display names refer to menu items. Only retain `displayName` if it's used for internal logging or non-menu display purposes for the backend service itself. The `MENU_CONFIG` object can be significantly streamlined or removed entirely if menu actions are handled by the `MenuLoader`.)*

```javascript
// astro-whatsapp-bot/src/services/whatsapp/actions/config/ActionConfig.js
// This file becomes much smaller, focusing purely on service requirements and metadata

const ASTROLOGY_CONFIG = {
  get_daily_horoscope: {
    // displayName removed as it's now in menu definition
    requiredProfileFields: ['birthDate'],
    subscriptionFeature: 'horoscope_daily',
    cooldown: 300000, // 5 minutes
    errorMessages: {
      incomplete: 'Daily horoscopes require at least your birth date.',
      limitReached: 'You have reached your daily horoscope limit for today.'
    }
  },
  // ... (all 100 services, with displayNames removed/updated as appropriate)
};

const PROFILE_CONFIG = {
  btn_update_profile: {
    // displayName removed
    requiredProfileFields: [],
    subscriptionFeature: null,
    cooldown: 0
  },
  btn_view_profile: {
    // displayName removed
    requiredProfileFields: [],
    subscriptionFeature: null,
    cooldown: 0
  }
};

const NUMEROLOGY_CONFIG = {
  get_numerology_report: {
    // displayName removed
    requiredProfileFields: ['birthDate'],
    subscriptionFeature: 'numerology_report',
    cooldown: 1800000,
    errorMessages: {
      incomplete: 'Numerology reports require your birth date.',
      limitReached: 'You have reached your numerology report limit.'
    }
  },
};

const DIVINATION_CONFIG = {
  get_palmistry_analysis: {
    // displayName removed
    requiredProfileFields: [],
    subscriptionFeature: 'palmistry_analysis',
    cooldown: 3600000,
    errorMessages: {
      incomplete: '',
      limitReached: 'Palmistry analysis requires hand images (available in Premium).'
    }
  }
};

// MENU_CONFIG will be removed or significantly reduced (e.g., only for internal action routing if needed)
// For menu navigation actions (e.g., 'show_main_menu'), the action mapper can directly handle them without ActionConfig.

module.exports = {
  ASTROLOGY_CONFIG,
  PROFILE_CONFIG,
  NUMEROLOGY_CONFIG,
  DIVINATION_CONFIG,

  getActionConfig(actionId) {
    return (
      ASTROLOGY_CONFIG[actionId] ||
      PROFILE_CONFIG[actionId] ||
      NUMEROLOGY_CONFIG[actionId] ||
      DIVINATION_CONFIG[actionId] ||
      {} // Return empty object for unknown actions or menu navigation actions
    );
  },

  defaults: {
    cooldown: 300000,
    dailyLimit: 10,
    monthlyLimit: 50
  }
};
```

### Step 4: Implement a Generic Menu Renderer

Create a generic menu renderer (e.g., `astro-whatsapp-bot/src/utils/genericMenuRenderer.js`) as previously outlined.

```javascript
// astro-whatsapp-bot/src/utils/genericMenuRenderer.js
class GenericMenuRenderer {
  static render(menuDefinition, platformContext) {
    return {
      menuId: menuDefinition.menuId,
      type: menuDefinition.type,
      body: menuDefinition.body,
      sections: menuDefinition.sections,
      buttons: menuDefinition.buttons,
      navigation: menuDefinition.navigation, // Include navigation options
      platformContext: platformContext
    };
  }
}

module.exports = GenericMenuRenderer;
```

### Step 5: Develop WhatsApp Menu Adapter

The WhatsApp-specific adapter (e.g., `astro-whatsapp-bot/src/services/whatsapp/whatsappMenuAdapter.js`) will now fetch menu definitions and render them.

```javascript
// astro-whatsapp-bot/src/services/whatsapp/whatsappMenuAdapter.js
const MenuLoader = require('../../utils/menuLoader');
const GenericMenuRenderer = require('../../utils/genericMenuRenderer');
const { WhatsAppMessageSender } = require('./whatsappMessageSender'); // Assuming you have this

class WhatsAppMenuAdapter {
  static async sendMenu(user, phoneNumber, menuId) {
    try {
      const menuDefinition = await MenuLoader.loadMenu(menuId);
      const genericMenu = GenericMenuRenderer.render(menuDefinition, 'whatsapp');

      let whatsappMessage;

      if (genericMenu.type === 'list') {
        const sections = genericMenu.sections.map(section => ({
          title: section.title,
          rows: section.rows.map(row => ({
            id: row.actionId,
            title: row.label,
            description: row.description || ''
          }))
        }));

        // Add navigation section if present
        if (genericMenu.navigation && genericMenu.navigation.length > 0) {
          sections.push({
            title: "Navigation",
            rows: genericMenu.navigation.map(nav => ({
              id: nav.actionId,
              title: nav.label,
              description: nav.description || ''
            }))
          });
        }

        whatsappMessage = {
          type: 'interactive',
          interactive: {
            type: 'list',
            header: { // Optional: A header for the list message
              type: "text",
              text: genericMenu.menuId // Or a more descriptive header if needed
            },
            body: { text: genericMenu.body },
            action: {
              button: 'Select an option', // Generic button text for the list trigger
              sections: sections
            }
          }
        };
      } else if (genericMenu.type === 'buttons') {
        const buttons = genericMenu.buttons.map(button => ({
          type: 'reply',
          reply: {
            id: button.actionId,
            title: button.label
          }
        }));

        // Add navigation buttons directly if present
        if (genericMenu.navigation && genericMenu.navigation.length > 0) {
          buttons.push(...genericMenu.navigation.map(nav => ({
            type: 'reply',
            reply: {
              id: nav.actionId,
              title: nav.label
            }
          })));
        }

        whatsappMessage = {
          type: 'interactive',
          interactive: {
            type: 'button',
            body: { text: genericMenu.body },
            action: {
              buttons: buttons
            }
          }
        };
      } else {
        throw new Error(`Unsupported menu type: ${genericMenu.type}`);
      }

      await WhatsAppMessageSender.sendMessage(phoneNumber, whatsappMessage);
      return true;
    } catch (error) {
      logger.error('Error sending WhatsApp menu:', error);
      // Fallback to text-based menu if interactive fails
      await WhatsAppMessageSender.sendTextMessage(phoneNumber, `I apologize, there was an error loading the menu. Please try again or type 'menu'.
Error: ${error.message}`);
      return false;
    }
  }
}

module.exports = WhatsAppMenuAdapter;
```

### Step 6: Refactor Existing Menu Action Files

These files will now become lean wrappers around the `WhatsAppMenuAdapter`.

**Example: `astro-whatsapp-bot/src/services/whatsapp/actions/menu/ShowMainMenuAction.js`**

```javascript
// astro-whatsapp-bot/src/services/whatsapp/actions/menu/ShowMainMenuAction.js
const BaseAction = require('../BaseAction');
const WhatsAppMenuAdapter = require('../../whatsappMenuAdapter');

class ShowMainMenuAction extends BaseAction {
  constructor() {
    super('show_main_menu');
  }

  async execute(user, phoneNumber) {
    return await WhatsAppMenuAdapter.sendMenu(user, phoneNumber, 'main_menu');
  }
}

module.exports = ShowMainMenuAction;
```
*(You will need to create/update similar action files for all high-level menus (e.g., `show_western_astrology_menu`, `show_vedic_astrology_menu`, etc.) to call `WhatsAppMenuAdapter.sendMenu` with the appropriate `menuId`.)*

### Step 7: Update `MessageRouter` and `InteractiveMessageProcessor`

These modules will now interact with the new `ActionMapper` (which will call the adapters and services).

**Example: `astro-whatsapp-bot/src/services/whatsapp/processors/InteractiveMessageProcessor.js`**

```javascript
// astro-whatsapp-bot/src/services/whatsapp/processors/InteractiveMessageProcessor.js
// ... (other imports)
const ActionMapper = require('../ActionMapper');

class InteractiveMessageProcessor {
  // ...
  async processInteractiveReply(user, phoneNumber, message) {
    const actionId = message.interactive.list_reply?.id || message.interactive.button_reply?.id;

    if (actionId) {
      await ActionMapper.executeAction(actionId, user, phoneNumber);
    } else {
      await WhatsAppMessageSender.sendTextMessage(phoneNumber, "I didn't understand that. Please select an option from the menu.");
    }
  }
  // ...
}
```

**Example: `astro-whatsapp-bot/src/services/whatsapp/processors/MessageRouter.js`**

```javascript
// astro-whatsapp-bot/src/services/whatsapp/processors/MessageRouter.js
// ... (other imports)
const ActionMapper = require('../ActionMapper');

class MessageRouter {
  // ...
  async routeMessage(user, phoneNumber, message) {
    // ... (existing keyword mapping logic that identifies a mappedActionId)

    if (mappedActionId) {
      await ActionMapper.executeAction(mappedActionId, user, phoneNumber);
    } else {
      // If no specific action is mapped, show the main menu
      await ActionMapper.executeAction('show_main_menu', user, phoneNumber);
    }
    // Remove old hardcoded menu options lists (e.g., for numbered text menus)
  }
  // ...
}
```

### Step 8: Create an Action Mapper

This module will bridge the frontend action IDs to the backend service calls or menu navigation.

```javascript
// astro-whatsapp-bot/src/services/whatsapp/ActionMapper.js
const { getActionConfig } = require('./actions/config/ActionConfig');
const serviceRegistry = require('../../core/serviceRegistry'); // Assuming a registry for your 100 services
const WhatsAppMenuAdapter = require('./whatsappMenuAdapter');
const { WhatsAppMessageSender } = require('./whatsappMessageSender'); // For error messages

class ActionMapper {
  static async executeAction(actionId, user, phoneNumber, params = {}) {
    // Check if it's a menu navigation action (convention: show_ + menuId)
    if (actionId.startsWith('show_')) {
      const menuId = actionId.replace('show_', '');
      await WhatsAppMenuAdapter.sendMenu(user, phoneNumber, menuId);
      return;
    }

    // Check if it's a profile/settings button action (convention: btn_)
    if (actionId.startsWith('btn_')) {
      // Implement specific logic for profile/settings buttons
      // Example:
      // if (actionId === 'btn_update_profile') { /* ... call ProfileUpdateService ... */ }
      // else if (actionId === 'btn_view_profile') { /* ... call ProfileViewService ... */ }
      console.log(`Executing profile action: ${actionId}`);
      // After processing, generally return to the settings menu
      await WhatsAppMenuAdapter.sendMenu(user, phoneNumber, 'settings_profile_menu');
      return;
    }

    // Assume it's a direct backend service invocation (e.g., get_daily_horoscope, calculateSunSign)
    const actionConfig = getActionConfig(actionId);

    if (!actionConfig) {
      logger.warn(`Unknown actionId received: ${actionId}`);
      await WhatsAppMessageSender.sendTextMessage(phoneNumber, "I apologize, I don't know how to handle that request. Please select an option from the menu.");
      return;
    }

    try {
      // This is where service invocation logic resides.
      // 1. Validate user profile fields based on actionConfig.requiredProfileFields
      // 2. Check subscriptionFeature for the user
      // 3. Check cooldowns to prevent spamming
      // (These checks are important. They will likely involve a UserService or similar.)
      // ... (Placeholder for these checks) ...

      // 4. Invoke the corresponding backend service
      const service = serviceRegistry.getService(actionId);
      if (service && typeof service.processCalculation === 'function') {
        const result = await service.processCalculation(user.birthData, params); // Assuming user.birthData and params
        // 5. Format and send result back to user
        await WhatsAppMessageSender.sendTextMessage(phoneNumber, service.formatResult(result)); // Assuming service provides formatResult
      } else {
        throw new Error(`Service for action '${actionId}' not found or does not have a processCalculation method.`);
      }
    } catch (error) {
      logger.error(`Error executing action '${actionId}':`, error);
      await WhatsAppMessageSender.sendTextMessage(phoneNumber, `Error processing your request: ${error.message}`);
    }
  }
}

module.exports = ActionMapper;
```

*(You will need a `serviceRegistry` to map `actionId`s to actual service instances. This can be a simple object mapping or a more sophisticated dependency injection container.)*

## 5. Benefits of this Architecture

*   **Easy Menu Tree Changes:** Modifying menu labels, adding/removing items, or reordering sections *only* involves editing JSON/YAML files. No code changes are needed for menu structure updates.
*   **Frontend Agnostic Menu Definitions:** The core menu structure is defined once and can be rendered across WhatsApp, Web, Android, iOS, and Telegram by their respective adapters. This is crucial for future frontend expansion.
*   **Clear Separation of Concerns:**
    *   Menu structure (JSON/YAML)
    *   Menu rendering (Frontend Adapters)
    *   Action metadata (Streamlined `ActionConfig.js`)
    *   Backend service logic (Astro Services)
*   **Scalability:** Easily manage 100+ services. `ActionConfig.js` is reduced to service-specific metadata, preventing it from becoming a monolithic bottleneck.
*   **Future-Proofing:**
    *   **Multiple Frontends:** New frontend platforms only require a new adapter, reusing the same menu definitions and action mapping.
    *   **Monolith to Microservices:** The `ActionMapper` can seamlessly transition from invoking internal monolithic functions to calling external microservice APIs without affecting frontend logic, as long as the `actionId`s remain consistent.
*   **Redundancy Support:** Menu definitions can easily include the same `actionId` in multiple places, allowing for redundant access paths to popular services without duplicating configuration.
*   **Improved Maintainability:** Reduced code complexity, easier onboarding for new developers, and minimized risk of errors during menu updates.

## 6. Considerations / Future Work

*   **Internationalization (i18n):** Menu labels in JSON/YAML files (`label`, `title`, `body`) should be replaced with `i18n_key` references, and the `MenuLoader` or `WhatsAppMenuAdapter` would then retrieve the translated strings.
*   **Dynamic Menu Generation:** For highly personalized menus (e.g., showing different options based on user's subscription or location), the `MenuLoader` could incorporate logic to dynamically filter or construct menu definitions.
*   **Tooling for Menu Definition Management:** For very large menu trees, consider building a simple UI or scripting to manage, validate, and visualize the JSON/YAML menu definition files.
*   **Service Registry:** A robust `serviceRegistry` implementation is needed to abstract away how backend services are located and invoked (whether internal functions in a monolith or external microservice calls).
*   **WhatsApp MessageSender:** Ensure a `WhatsAppMessageSender` utility is robust and handles all message types (text, interactive, etc.).

This architecture provides a solid, future-proof foundation for a scalable, maintainable, and flexible bot experience across multiple platforms.
