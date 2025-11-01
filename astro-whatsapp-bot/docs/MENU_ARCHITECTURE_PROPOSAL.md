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
*   **Future-Proofing:** Design for seamless integration with future frontends (Web, Android, iOS, Telegram, PWA, etc.) and the transition from a monolithic backend to individual microservices.
*   **Redundancy Support:** Acknowledge and explicitly support redundancy in menu options (e.g., a popular service appearing in multiple menus) as a UX feature, not a design flaw.
*   **Internationalization (i18n) as a First-Class Citizen:** Emphasize that all user-facing strings (labels, titles, body text) will be externalized and managed via i18n keys, ensuring zero hardcoding of language-specific content.
*   **Platform-Agnostic Core Logic:** The central menu processing logic (loading, rendering to a generic format, action mapping) must be entirely independent of any specific frontend platform.
*   **Clear API Contracts:** Define explicit and stable interfaces between architectural layers (e.g., between the Generic Menu Renderer and Frontend Adapters) to facilitate independent development and evolution.
*   **Scalable Directory Structure:** Implement a logical and intuitive directory structure that clearly separates core logic, platform-specific implementations, and configuration files, promoting modularity and ease of navigation.

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
*   **Implementation:** A dedicated directory (e.g., `astro-whatsapp-bot/menu_definitions/`) containing JSON or YAML files. Each file defines a specific menu or a logical group of menu items. Additionally, a new `i18n_keys/` directory will store language-specific string files (e.g., `en.json`, `es.json`).
*   **Key Concepts:**
    *   **Menu ID:** A unique identifier for each menu (e.g., `main_menu`, `vedic_astrology_menu`).
    *   **Action ID:** A unique identifier for each selectable option within a menu (e.g., `get_daily_horoscope`, `show_vedic_predictive_specialized_menu`). These map directly to backend service calls or other menu actions.
    *   **Menu Item Structure:** Each item will include:
        *   `i18nKey`: A key to retrieve the display text for the menu option from the i18n files (e.g., `"menu.main.western_astrology"`).
        *   `actionId`: The unique ID that triggers a specific backend service or navigates to another menu.
        *   `type`: (Optional) `service` or `menu` to indicate if it's a direct service call or a navigation to a sub-menu.
        *   `descriptionI18nKey`: (Optional) A key for a short description for list items.
    *   **Menu Structure:**
        *   `menuId`: Unique ID.
        *   `type`: `buttons` or `list`.
        *   `bodyI18nKey`: A key for the main text/header for the menu.
        *   `sections`: (For lists) Array of sections, each with a `titleI18nKey` and `rows` (array of menu items).
        *   `buttons`: (For buttons) Array of menu items.
        *   `navigation`: (Optional) Common navigation options like "Back to Main Menu" using `i18nKey`.

### 3.2. Menu Loader/Parser

A utility responsible for loading, parsing, and caching the menu definition files and associated internationalization (i18n) string files.

*   **Purpose:** Provide a centralized, efficient way to access menu structures and their corresponding translated strings based on the user's locale.
*   **Implementation:** A module that reads the JSON/YAML menu definition files and the i18n string files, validates their structure, and stores them in memory for quick retrieval. The loader will need to be aware of the user's preferred locale to fetch the correct language strings.

### 3.3. Frontend Abstraction Layer (Generic Menu Renderer)

A generic interface or base class that defines how menus are rendered, independent of the specific frontend platform.

*   **Purpose:** Provide a consistent API for frontend adapters to interact with menu data, incorporating internationalization.
*   **Implementation:** A function or class that takes a `menuId`, a `platformContext` (e.g., `whatsapp`, `web`), and the `userLocale` as parameters. It will use the `i18nKey` from the menu definition and the `userLocale` to retrieve the correct translated strings for `body`, `section` titles, and `menu item labels` before returning a generic representation of the menu (e.g., an array of buttons, a list object with sections and rows).

### 3.4. Frontend-Specific Adapters/Renderers

Platform-specific implementations that translate the generic menu representation (which now includes translated strings) into the native UI elements of each frontend.

*   **Purpose:** Handle platform-specific UI rendering and message formatting using the already translated strings provided by the Generic Menu Renderer.
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
  "bodyI18nKey": "menu.main.body",
  "sections": [
    {
      "titleI18nKey": "menu.main.sections.main_astrology.title",
      "rows": [
        { "i18nKey": "menu.main.sections.main_astrology.western_astrology", "actionId": "show_western_astrology_menu" },
        { "i18nKey": "menu.main.sections.main_astrology.vedic_astrology", "actionId": "show_vedic_astrology_menu" },
        { "i18nKey": "menu.main.sections.main_astrology.divination_mystic_arts", "actionId": "show_divination_mystic_menu" }
      ]
    },
    {
      "titleI18nKey": "menu.main.sections.key_life_areas.title",
      "rows": [
        { "i18nKey": "menu.main.sections.key_life_areas.relationships_group_astrology", "actionId": "show_relationships_groups_menu" },
        { "i18nKey": "menu.main.sections.key_life_areas.numerology_life_patterns", "actionId": "show_numerology_lifepatterns_menu" },
        { "i18nKey": "menu.main.sections.key_life_areas.calendar_astrological_timings", "actionId": "show_calendar_timings_menu" },
        { "i18nKey": "menu.main.sections.key_life_areas.health_remedies_doshas", "actionId": "show_health_remedies_menu" }
      ]
    },
    {
      "titleI18nKey": "menu.main.sections.user_management.title",
      "rows": [
        { "i18nKey": "menu.main.sections.user_management.settings_profile", "actionId": "show_settings_profile_menu" }
      ]
    }
  ],
  "navigation": [
    { "i18nKey": "menu.navigation.back_to_main", "actionId": "show_main_menu" }
  ]
}
```

**Example: `astro-whatsapp-bot/menu_definitions/vedic_astrology_menu.json`**
*(Note: This is one of the larger menus, requiring internal navigation which will be handled by the adapter constructing the actual message content)*

```json
{
  "menuId": "vedic_astrology_menu",
  "type": "list",
  "bodyI18nKey": "menu.vedic_astrology.body",
  "sections": [
    {
      "titleI18nKey": "menu.vedic_astrology.sections.core_readings.title",
      "rows": [
        { "i18nKey": "menu.vedic_astrology.sections.core_readings.vedic_birth_chart", "actionId": "get_hindu_astrology_analysis" },
        { "i18nKey": "menu.vedic_astrology.sections.core_readings.nadi_astrology_reading", "actionId": "show_nadi_flow" },
        { "i18nKey": "menu.vedic_astrology.sections.core_readings.detailed_chart_analysis", "actionId": "generateDetailedChartAnalysis" },
        { "i18nKey": "menu.vedic_astrology.sections.core_readings.basic_birth_chart", "actionId": "generateBasicBirthChart" },
        { "i18nKey": "menu.vedic_astrology.sections.core_readings.sun_sign_analysis", "actionId": "calculateSunSign" },
        { "i18nKey": "menu.vedic_astrology.sections.core_readings.moon_sign_analysis", "actionId": "calculateMoonSign" },
        { "i18nKey": "menu.vedic_astrology.sections.core_readings.rising_sign_analysis", "actionId": "calculateRisingSign" },
        { "i18nKey": "menu.vedic_astrology.sections.core_readings.nakshatra_analysis", "actionId": "calculateNakshatra" }
      ]
    },
    {
      "titleI18nKey": "menu.vedic_astrology.sections.navigation_advanced_vedic.title",
      "rows": [
        { "i18nKey": "menu.vedic_astrology.sections.navigation_advanced_vedic.predictive_specialized", "actionId": "show_vedic_predictive_specialized_menu" },
        { "i18nKey": "menu.navigation.back_to_main", "actionId": "show_main_menu" }
      ]
    }
  ],
  "navigation": [
    { "i18nKey": "menu.navigation.back_to_main", "actionId": "show_main_menu" }
  ]
}
```

*(Continue creating similar JSON/YAML files for all menus and sub-menus as per the proposed structure in the previous turns, ensuring all 100 services are covered and WhatsApp limits are respected. Add `navigation` section where appropriate for back buttons.)*

### Step 2: Create a Menu Loader/Parser

Create a utility module (e.g., `astro-whatsapp-bot/src/utils/menuLoader.js`) to load these definitions and their associated i18n strings.

```javascript
// astro-whatsapp-bot/src/utils/menuLoader.js
const fs = require('fs');
const path = require('path');
const logger = require('./logger'); // Assuming you have a logger utility
const i18n = require('./i18n'); // New i18n utility

const MENU_DEFINITIONS_DIR = path.join(__dirname, '../../../menu_definitions');
const menuCache = {};

class MenuLoader {
  static async loadMenu(menuId, locale = 'en') {
    const cacheKey = `${menuId}-${locale}`;
    if (menuCache[cacheKey]) {
      return menuCache[cacheKey];
    }

    const menuFilePath = path.join(MENU_DEFINITIONS_DIR, `${menuId}.json`);
    try {
      const menuData = await fs.promises.readFile(menuFilePath, 'utf8');
      const menu = JSON.parse(menuData);
      // Basic validation (can be expanded)
      if (!menu.menuId || !menu.type || !menu.bodyI18nKey) {
        throw new Error(`Invalid menu definition in ${menuFilePath}`);
      }

      // Translate menu components
      menu.body = i18n.t(menu.bodyI18nKey, locale);
      if (menu.sections) {
        menu.sections.forEach(section => {
          section.title = i18n.t(section.titleI18nKey, locale);
          section.rows.forEach(row => {
            row.label = i18n.t(row.i18nKey, locale);
            if (row.descriptionI18nKey) {
              row.description = i18n.t(row.descriptionI18nKey, locale);
            }
          });
        });
      }
      if (menu.buttons) {
        menu.buttons.forEach(button => {
          button.label = i18n.t(button.i18nKey, locale);
        });
      }
      if (menu.navigation) {
        menu.navigation.forEach(nav => {
          nav.label = i18n.t(nav.i18nKey, locale);
        });
      }

      menuCache[cacheKey] = menu;
      logger.info(`Menu '${menuId}' for locale '${locale}' loaded and cached.`);
      return menu;
    } catch (error) {
      logger.error(`Failed to load menu '${menuId}' for locale '${locale}':`, error);
      throw new Error(`Menu '${menuId}' not found or invalid for locale '${locale}'.`);
    }
  }

  static clearCache() {
    Object.keys(menuCache).forEach(key => delete menuCache[key]);
    logger.info('Menu cache cleared.');
  }

  // Optional: Load all menus at startup
  static async loadAllMenus(locale = 'en') {
    try {
      const files = await fs.promises.readdir(MENU_DEFINITIONS_DIR);
      const jsonFiles = files.filter(file => file.endsWith('.json'));
      for (const file of jsonFiles) {
        const menuId = file.replace('.json', '');
        await MenuLoader.loadMenu(menuId, locale);
      }
      logger.info(`All menus loaded for locale '${locale}': ${Object.keys(menuCache).join(', ')}`);
    } catch (error) {
      logger.error('Failed to load all menus:', error);
      throw error;
    }
  }
}

module.exports = MenuLoader;
```

### Step 3: Refactor `ActionConfig.js`

`ActionConfig.js` should now exclusively contain metadata for the *backend services* (the 100 astro services), not menu display logic. Menu display names will be read from the menu definition files via `i18nKey`.

*(This will involve a manual process of going through `ActionConfig.js` and removing `displayName` from `ASTROLOGY_CONFIG`, `NUMEROLOGY_CONFIG`, `DIVINATION_CONFIG`, `PROFILE_CONFIG` if these display names refer to menu items. Only retain `displayName` if it's used for internal logging or non-menu display purposes for the backend service itself. If a service requires a user-facing name for internal messages (e.g., in an error log that is shown to the user), consider replacing `displayName` with an `i18nKey` that can be translated. The `MENU_CONFIG` object can be significantly streamlined or removed entirely if menu actions are handled by the `MenuLoader`.)*

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

Create a generic menu renderer (e.g., `astro-whatsapp-bot/src/utils/genericMenuRenderer.js`) as previously outlined. This renderer will now receive already translated strings from the `MenuLoader`.

```javascript
// astro-whatsapp-bot/src/utils/genericMenuRenderer.js
class GenericMenuRenderer {
  static render(menuDefinition, platformContext) {
    // menuDefinition now contains already translated 'body', 'title', 'label', 'description' fields
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
  static async sendMenu(user, phoneNumber, menuId, locale = 'en') {
    try {
      const menuDefinition = await MenuLoader.loadMenu(menuId, locale);
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
            title: i18n.t('menu.navigation.title', locale), // Translate navigation title
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
              button: i18n.t('menu.select_option_button', locale), // Translate button text
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
      await WhatsAppMessageSender.sendTextMessage(phoneNumber, i18n.t('error.menu_load_failure', locale, { errorMessage: error.message }));
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
    // Assuming user object contains a locale property
    const userLocale = user.locale || 'en'; 
    return await WhatsAppMenuAdapter.sendMenu(user, phoneNumber, 'main_menu', userLocale);
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
    const userLocale = user.locale || 'en';

    if (actionId) {
      await ActionMapper.executeAction(actionId, user, phoneNumber, userLocale);
    } else {
      await WhatsAppMessageSender.sendTextMessage(phoneNumber, i18n.t('error.unrecognized_interactive_reply', userLocale));
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
    const userLocale = user.locale || 'en';

    if (mappedActionId) {
      await ActionMapper.executeAction(mappedActionId, user, phoneNumber, userLocale);
    } else {
      // If no specific action is mapped, show the main menu
      await ActionMapper.executeAction('show_main_menu', user, phoneNumber, userLocale);
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
const i18n = require('../../utils/i18n'); // New i18n utility

class ActionMapper {
  static async executeAction(actionId, user, phoneNumber, locale = 'en', params = {}) {
    // Check if it's a menu navigation action (convention: show_ + menuId)
    if (actionId.startsWith('show_')) {
      const menuId = actionId.replace('show_', '');
      await WhatsAppMenuAdapter.sendMenu(user, phoneNumber, menuId, locale);
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
      await WhatsAppMenuAdapter.sendMenu(user, phoneNumber, 'settings_profile_menu', locale);
      return;
    }

    // Assume it's a direct backend service invocation (e.g., get_daily_horoscope, calculateSunSign)
    const actionConfig = getActionConfig(actionId);

    if (!actionConfig) {
      logger.warn(`Unknown actionId received: ${actionId}`);
      await WhatsAppMessageSender.sendTextMessage(phoneNumber, i18n.t('error.unknown_request', locale));
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
        await WhatsAppMessageSender.sendTextMessage(phoneNumber, service.formatResult(result, locale)); // Assuming service provides formatResult and accepts locale
      } else {
        throw new Error(i18n.t('error.service_not_found', locale, { actionId }));
      }
    } catch (error) {
      logger.error(`Error executing action '${actionId}':`, error);
      await WhatsAppMessageSender.sendTextMessage(phoneNumber, i18n.t('error.processing_request', locale, { errorMessage: error.message }));
    }
  }
}

module.exports = ActionMapper;
```

### Step 9: Implement an i18n Utility

Create a dedicated utility module (e.g., `astro-whatsapp-bot/src/utils/i18n.js`) for managing and retrieving translated strings. This module will load language-specific JSON files from the `i18n_keys/` directory.

```javascript
// astro-whatsapp-bot/src/utils/i18n.js
const path = require('path');
const fs = require('fs');
const logger = require('./logger');

const I18N_DIR = path.join(__dirname, '../../i18n_keys');
const translations = {};

class I18n {
  static async loadTranslations(locale) {
    if (translations[locale]) {
      return translations[locale];
    }
    const langFilePath = path.join(I18N_DIR, `${locale}.json`);
    try {
      const langData = await fs.promises.readFile(langFilePath, 'utf8');
      translations[locale] = JSON.parse(langData);
      logger.info(`Translations for locale '${locale}' loaded.`);
      return translations[locale];
    } catch (error) {
      logger.error(`Failed to load translations for locale '${locale}':`, error);
      // Fallback to default locale if specific locale fails
      if (locale !== 'en') {
        logger.warn(`Falling back to 'en' locale for translations.`);
        return I18n.loadTranslations('en');
      }
      throw new Error(`Translations for locale '${locale}' not found or invalid.`);
    }
  }

  static t(key, locale = 'en', replacements = {}) {
    const lang = translations[locale] || translations['en']; // Fallback to English
    if (!lang) {
      logger.error(`No translations loaded for locale '${locale}' or default 'en'.`);
      return key; // Return key if no translations are available
    }

    let translatedString = key.split('.').reduce((obj, i) => obj && obj[i], lang);

    if (typeof translatedString === 'string') {
      // Apply replacements
      for (const placeholder in replacements) {
        translatedString = translatedString.replace(new RegExp(`{{${placeholder}}}`, 'g'), replacements[placeholder]);
      }
      return translatedString;
    }

    logger.warn(`Translation key '${key}' not found for locale '${locale}'.`);
    return key; // Return the key if translation not found
  }
}

module.exports = I18n;
```

*(You will need to create the `astro-whatsapp-bot/i18n_keys/` directory and add language files like `en.json` and `es.json` with your translated strings.)*

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

*   **i18n_keys Directory:** Populate the `astro-whatsapp-bot/i18n_keys/` directory with language-specific JSON files (e.g., `en.json`, `es.json`) containing all user-facing strings referenced by `i18nKey` in the menu definitions.
*   **Dynamic Menu Generation:** For highly personalized menus (e.g., showing different options based on user's subscription or location), the `MenuLoader` could incorporate logic to dynamically filter or construct menu definitions.
*   **Tooling for Menu Definition Management:** For very large menu trees, consider building a simple UI or scripting to manage, validate, and visualize the JSON/YAML menu definition files.
*   **Service Registry:** A robust `serviceRegistry` implementation is needed to abstract away how backend services are located and invoked (whether internal functions in a monolith or external microservice calls).
*   **WhatsApp MessageSender:** Ensure a `WhatsAppMessageSender` utility is robust and handles all message types (text, interactive, etc.).

This architecture provides a solid, future-proof foundation for a scalable, maintainable, and flexible bot experience across multiple platforms.
