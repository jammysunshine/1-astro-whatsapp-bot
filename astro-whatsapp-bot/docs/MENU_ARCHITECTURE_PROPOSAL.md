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

The new architecture introduces several layers to achieve the desired modularity, flexibility, and future-proofing, clearly separating platform-agnostic core logic from platform-specific implementations:

```mermaid
graph TD
    subgraph Frontend Platforms
        WhatsAppFrontend[WhatsApp Frontend]
        WebFrontend[Web Frontend (PWA)]
        TelegramFrontend[Telegram Frontend]
        MobileAppFrontend[Mobile App (Android/iOS)]
    end

    subgraph Core Menu Logic
        MenuRenderer[Generic Menu Renderer]
        MenuLoader[Menu Loader/Parser]
        ActionMapper[Action Mapper]
    end

    subgraph Configuration & Data
        MenuDefinitions[Menu Definition Files (JSON/YAML)]
        I18NStrings[i18n Language Files]
    end

    subgraph Backend Services
        BackendServiceGateway[Backend Service Gateway]
        MonolithicMicroservice[Monolithic Astro Microservice]
        IndividualMicroservices[Individual Astro Microservices (Future Phase)]
        AstroServices[100 Astro Services (Internal)]
    end

    WhatsAppFrontend --> WhatsAppAdapter[WhatsApp Menu Adapter]
    WebFrontend --> WebAdapter[Web Menu Adapter]
    TelegramFrontend --> TelegramAdapter[Telegram Menu Adapter]
    MobileAppFrontend --> MobileAppAdapter[Mobile App Menu Adapter]

    WhatsAppAdapter --> MenuRenderer
    WebAdapter --> MenuRenderer
    TelegramAdapter --> MenuRenderer
    MobileAppAdapter --> MenuRenderer

    MenuRenderer --> MenuLoader
    MenuLoader --> MenuDefinitions
    MenuLoader --> I18NStrings

    WhatsAppAdapter --> ActionMapper
    WebAdapter --> ActionMapper
    TelegramAdapter --> ActionMapper
    MobileAppAdapter --> ActionMapper

    ActionMapper --> BackendServiceGateway

    BackendServiceGateway --> MonolithicMicroservice
    MonolithicMicroservice --> AstroServices

    BackendServiceGateway --> IndividualMicroservices
    IndividualMicroservices --> AstroServices
```

### 3.1. Menu Definition Layer (Frontend Agnostic)

This layer defines the entire menu tree structure, including menu types, actions, and hierarchy, using external data files. All user-facing text is referenced via i18n keys.

*   **Purpose:** Decouple menu structure from code, enable easy updates, and support multiple frontends with internationalization.
*   **Implementation:** A dedicated, shared configuration directory (e.g., `config/menu_definitions/`) containing JSON or YAML files. Each file defines a specific menu or a logical group of menu items. A parallel `config/i18n_keys/` directory will store language-specific string files (e.g., `en.json`, `es.json`). This ensures these critical configuration assets are accessible to all platforms and managed centrally.
*   **Key Concepts:**
    *   **Menu ID:** A unique identifier for each menu (e.g., `main_menu`, `vedic_astrology_menu`).
    *   **Action ID:** A unique identifier for each selectable option within a menu (e.g., `get_daily_horoscope`, `show_vedic_predictive_specialized_menu`). These map directly to backend service calls or other menu actions.
    *   **Menu Item Structure:** Each item will include:
        *   `i18nKey`: A mandatory key to retrieve the display text for the menu option from the i18n files (e.g., `"menu.main.western_astrology"`). This ensures no hardcoded strings.
        *   `actionId`: The unique ID that triggers a specific backend service or navigates to another menu.
        *   `type`: (Optional) `service` or `menu` to indicate if it's a direct service call or a navigation to a sub-menu.
        *   `descriptionI18nKey`: (Optional) A key for a short description for list items, also retrieved from i18n files.
    *   **Menu Structure:**
        *   `menuId`: Unique ID.
        *   `type`: `buttons` or `list`.
        *   `bodyI18nKey`: A mandatory key for the main text/header for the menu, retrieved from i18n files.
        *   `sections`: (For lists) Array of sections, each with a `titleI18nKey` (mandatory) and `rows` (array of menu items).
        *   `buttons`: (For buttons) Array of menu items.
        *   `navigation`: (Optional) Common navigation options like "Back to Main Menu" using `i18nKey`.

### 3.2. Menu Loader/Parser (Core Component)

A utility responsible for loading, parsing, and caching the menu definition files and associated internationalization (i18n) string files. This component is platform-agnostic and serves all frontends.

*   **Purpose:** Provide a centralized, efficient way to access menu structures and their corresponding translated strings based on the user's locale.
*   **Implementation:** A module that reads the JSON/YAML menu definition files and the i18n string files, validates their structure, and stores them in memory for quick retrieval. The loader will need to be aware of the user's preferred locale to fetch the correct language strings.

### 3.3. Frontend Abstraction Layer (Generic Menu Renderer) (Core Component)

A generic interface or base class that defines how menus are rendered into a platform-independent, abstract representation. This component is core to the system and is used by all frontend adapters.

*   **Purpose:** Provide a consistent API for frontend adapters to interact with menu data, incorporating internationalization, and returning a standardized menu object that can be easily translated into any platform's native UI.
*   **Implementation:** A function or class that takes a `menuId`, a `platformContext` (e.g., `whatsapp`, `web`), and the `userLocale` as parameters. It will use the `i18nKey` from the menu definition and the `userLocale` to retrieve the correct translated strings for `body`, `section` titles, and `menu item labels`. The output is a generic, structured menu object (e.g., an array of buttons, a list object with sections and rows) that frontend adapters can then consume and render.

### 3.4. Frontend-Specific Adapters/Renderers (Platform-Specific Components)

Platform-specific implementations that translate the generic menu representation (provided by the Generic Menu Renderer) into the native UI elements and message formats of each frontend.

*   **Purpose:** Handle platform-specific UI rendering, message formatting, and interaction paradigms. Each adapter acts as a translator between the generic menu structure and its specific frontend's capabilities.
*   **Implementation:**
    *   **WhatsApp Menu Adapter:** Translates the generic menu object into WhatsApp Interactive Buttons or Interactive Lists, adhering to character limits, button type restrictions, and formatting rules. This will replace the current hardcoded menu generation logic in `ShowMainMenuAction.js` and similar files.
    *   **Web Menu Adapter (PWA):** Renders the generic menu object as HTML/CSS elements, potentially using a framework like React or Vue. It handles web-specific interactions (e.g., clicks, form submissions) and navigation.
    *   **Telegram Menu Adapter:** Renders the generic menu object using Telegram's inline keyboards, reply keyboards, or custom commands, respecting Telegram's API limitations and interaction patterns.
    *   **Mobile App Adapters (Android/iOS):** Renders the generic menu object using native UI components (e.g., Jetpack Compose for Android, SwiftUI for iOS). These adapters would integrate with the app's navigation stack and UI toolkit.

Each adapter is responsible for:
    *   Receiving the platform-agnostic menu object from the Generic Menu Renderer.
    *   Mapping the generic menu elements (body, sections, rows, buttons) to the specific UI components available on its platform.
    *   Applying platform-specific styling and formatting.
    *   Handling platform-specific limitations (e.g., maximum number of buttons, text length, media support).
    *   Translating user interactions (e.g., button taps, list selections) back into `actionId`s for the `ActionMapper`.
### 3.5. Action Mapper (Core Component)

This layer is responsible for taking a selected `actionId` from any frontend and mapping it to the appropriate backend service invocation. This component is platform-agnostic.

*   **Purpose:** Decouple frontend actions from backend service implementation details.
*   **Implementation:** A module that uses the `ActionConfig.js` (now streamlined for service metadata) to determine which service to call and what parameters it requires.

### 3.6. Backend Service Layer

This layer consists of your actual astrological services.

*   **Initial Phase:** The existing monolithic microservice encapsulates all 100 astro services. The Action Mapper will invoke functions/methods within this monolith.
*   **Future Phase:** As services are decoupled into individual microservices, the Action Mapper will be updated to route requests to the appropriate microservice endpoints.

### 3.7. Recommended Directory Structure

To support modularity, extensibility, and clear separation of concerns across multiple frontends and backend services, the following directory structure is recommended:

```
/project-root
├── /config
│   ├── /menu_definitions       # JSON/YAML files defining menu structures
│   └── /i18n_keys              # JSON files for internationalization strings (e.g., en.json, es.json)
├── /src
│   ├── /core                   # Shared, platform-agnostic logic consumed by all parts of the application
│   │   ├── /menu               # Platform-agnostic menu logic (MenuLoader, GenericMenuRenderer, ActionMapper)
│   │   ├── /services           # Core service interfaces, registry, and common service utilities/abstractions
│   │   └── /utils              # General utilities (logger, common helpers, i18n, etc.)
│   ├── /frontend               # Platform-specific frontend implementations
│   │   ├── /whatsapp           # WhatsApp-specific adapters, message senders, processors, actions
│   │   ├── /telegram           # Telegram-specific adapters, message senders, processors, actions
│   │   ├── /web                # Web/PWA-specific adapters, UI components, routing
│   │   └── /mobile             # Mobile app (Android/iOS) specific adapters, UI components
│   ├── /backend                # (Optional) Backend API implementations, if co-located in this repository
│   │   └── /api                # Specific API endpoints and business logic
│   └── /models                 # Shared data models/schemas (used by frontend, backend, and core)
├── /tests                      # Unit, integration, and E2E tests
├── /docs                       # Project documentation (including this proposal)
├── package.json                # Project dependencies and scripts
└── README.md
```

This structure promotes:
*   **Clear Ownership:** Each frontend platform has its dedicated space, and core logic is clearly separated.
*   **Reusability:** Core logic and configurations are shared across all platforms.
*   **Scalability:** Easy to add new frontend platforms or backend services without major refactoring.
*   **Maintainability:** Developers can quickly locate relevant code based on its function and platform, reducing cognitive load.
*   **Decoupling:** Enforces a strong separation between platform-specific UI/interaction logic and the core business logic.

## 4. Detailed Implementation Instructions

### Step 1: Externalize Menu Definitions into JSON/YAML Files

Create a new directory `config/menu_definitions/`. Each menu (including sub-menus) will have its own file. Ensure `config/i18n_keys/` is also created for language files.

**Example: `config/menu_definitions/main_menu.json`**

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

Create a utility module (e.g., `src/core/menu/menuLoader.js`) to load these definitions and their associated i18n strings.

```javascript
// src/core/menu/menuLoader.js
const fs = require('fs');
const path = require('path');
const logger = require('../../utils/logger'); // Assuming logger is in src/utils
const i18n = require('../../utils/i18n'); // Assuming i18n is in src/utils

const MENU_DEFINITIONS_DIR = path.join(__dirname, '../../../config/menu_definitions');
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
// src/core/services/actions/config/ActionConfig.js
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

Create a generic menu renderer (e.g., `src/core/menu/genericMenuRenderer.js`) as previously outlined. This renderer will now receive already translated strings from the `MenuLoader`.

```javascript
// src/core/menu/genericMenuRenderer.js
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

The WhatsApp-specific adapter (e.g., `src/frontend/whatsapp/whatsappMenuAdapter.js`) will now fetch menu definitions and render them.

```javascript
// src/frontend/whatsapp/whatsappMenuAdapter.js
const MenuLoader = require('../../core/menu/menuLoader');
const GenericMenuRenderer = require('../../core/menu/genericMenuRenderer');
const { WhatsAppMessageSender } = require('./whatsappMessageSender'); // Assuming this is in the same frontend directory
const i18n = require('../../core/utils/i18n'); // i18n is now in core/utils

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

**Example: `src/frontend/whatsapp/actions/menu/ShowMainMenuAction.js`**

```javascript
// src/frontend/whatsapp/actions/menu/ShowMainMenuAction.js
const BaseAction = require('../../../../core/services/BaseAction'); // Assuming BaseAction is in core/services
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

**Example: `src/frontend/whatsapp/processors/InteractiveMessageProcessor.js`**

```javascript
// src/frontend/whatsapp/processors/InteractiveMessageProcessor.js
// ... (other imports)
const ActionMapper = require('../../../core/menu/ActionMapper');
const i18n = require('../../../core/utils/i18n');

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

**Example: `src/frontend/whatsapp/processors/MessageRouter.js`**

```javascript
// src/frontend/whatsapp/processors/MessageRouter.js
// ... (other imports)
const ActionMapper = require('../../../core/menu/ActionMapper');
const i18n = require('../../../core/utils/i18n');

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
// src/core/menu/ActionMapper.js
const { getActionConfig } = require('../../core/services/actions/config/ActionConfig');
const serviceRegistry = require('../../core/services/serviceRegistry'); // Assuming a registry for your 100 services
const WhatsAppMenuAdapter = require('../../frontend/whatsapp/whatsappMenuAdapter'); // Example for WhatsApp
const { WhatsAppMessageSender } = require('../../frontend/whatsapp/whatsappMessageSender'); // Example for WhatsApp
const i18n = require('../../core/utils/i18n'); // New i18n utility

class ActionMapper {
  static async executeAction(actionId, user, phoneNumber, locale = 'en', params = {}) {
    // Check if it's a menu navigation action (convention: show_ + menuId)
    if (actionId.startsWith('show_')) {
      const menuId = actionId.replace('show_', '');
      // This would dynamically call the correct adapter based on user's platform
      // For now, assuming WhatsApp for example
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

Create a dedicated utility module (e.g., `src/utils/i18n.js`) for managing and retrieving translated strings. This module will load language-specific JSON files from the `config/i18n_keys/` directory.

```javascript
// src/utils/i18n.js
const path = require('path');
const fs = require('fs');
const logger = require('./logger'); // Assuming logger is in src/utils

const I18N_DIR = path.join(__dirname, '../../../config/i18n_keys');
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

*(You will need to create the `config/i18n_keys/` directory and add language files like `en.json` and `es.json` with your translated strings.)*

## 5. Benefits of this Architecture

*   **Enhanced Modularity & Decoupling:** Achieves a high degree of separation between concerns, making individual components easier to develop, test, and maintain independently.
*   **True Frontend Agnosticism:** The core menu logic and definitions are entirely independent of any specific frontend platform. This means the same menu structure can power WhatsApp, Web (PWA), Telegram, and native mobile applications with minimal platform-specific code.
*   **Simplified Menu Management:** Modifying menu labels, adding/removing items, or reordering sections *only* involves editing JSON/YAML configuration files. No code changes are needed for menu structure updates, significantly reducing deployment cycles and risk.
*   **Scalability & Extensibility:** The architecture is designed to easily accommodate new frontend platforms or additional backend services. Adding a new frontend simply requires implementing a new adapter that conforms to the generic menu representation.
*   **Clear API Contracts:** Well-defined interfaces between layers (e.g., Generic Menu Renderer and Frontend Adapters) ensure predictable interactions and facilitate parallel development by different teams.
*   **Improved Maintainability:** Reduced code complexity, a logical directory structure, and clear separation of concerns make the codebase easier to understand, onboard new developers, and minimize the risk of errors during updates.
*   **Future-Proofing:**
    *   **Multiple Frontends:** New frontend platforms only require a new adapter, reusing the same menu definitions and action mapping.
    *   **Monolith to Microservices:** The `ActionMapper` can seamlessly transition from invoking internal monolithic functions to calling external microservice APIs without affecting frontend logic, as long as the `actionId`s remain consistent.
*   **Redundancy Support:** Menu definitions can easily include the same `actionId` in multiple places, allowing for redundant access paths to popular services without duplicating configuration.
*   **Internationalization Built-In:** All user-facing text is managed centrally through i18n keys, making it straightforward to add new languages and ensuring a consistent multilingual experience across all platforms.

## 6. Considerations / Future Work

*   **i18n_keys Directory:** Populate the `config/i18n_keys/` directory with language-specific JSON files (e.g., `en.json`, `es.json`) containing all user-facing strings referenced by `i18nKey` in the menu definitions.
*   **API Versioning for Menu Definitions:** As the menu structure evolves, consider implementing a versioning strategy for menu definition files to ensure backward compatibility for older frontend adapters.
*   **Schema Validation for Configuration Files:** Implement JSON Schema validation for `menu_definitions` and `i18n_keys` files to ensure their structural integrity and prevent runtime errors due to malformed configurations.
*   **CLI Tool for Menu Management:** For very large menu trees, consider building a command-line interface (CLI) tool to assist with creating, validating, translating, and visualizing menu definition files.
*   **Dynamic Menu Generation:** For highly personalized menus (e.g., showing different options based on user's subscription or location), the `MenuLoader` could incorporate logic to dynamically filter or construct menu definitions.
*   **Service Registry:** A robust `serviceRegistry` implementation is needed to abstract away how backend services are located and invoked (whether internal functions in a monolith or external microservice calls).
*   **Platform-Specific Message Senders:** Ensure robust message sender utilities (e.g., `WhatsAppMessageSender`, `TelegramMessageSender`, `WebPushNotificationSender`) are implemented for each platform, handling all message types (text, interactive, media, etc.) and platform-specific error handling.

This architecture provides a solid, future-proof foundation for a scalable, maintainable, and flexible bot experience across multiple platforms.
