# **Proposed Menu Architecture: Modular, Flexible, and Frontend-Agnostic**

## 1. Introduction

The current approach to defining and managing the bot's interactive menu tree, primarily through a single `ActionConfig.js` file, presents significant challenges:

*   **Monolithic Configuration:** `ActionConfig.js` is becoming excessively large and complex, making it difficult to manage, update, and debug.
*   **Tight Coupling:** Menu structure, display labels, and action mappings are tightly coupled within code, requiring code changes and deployments for simple menu updates.
*   **Lack of Flexibility:** Adapting the menu tree for frequent changes or A/B testing is cumbersome.
*   **Frontend Dependency:** The current structure is inherently tied to the WhatsApp frontend, making expansion to Web, Android, iOS, and Telegram frontends difficult and redundant.
*   **Backend Integration:** The mapping between frontend actions and backend services is not clearly abstracted, hindering the transition from a monolithic microservice to individual microservices.

This document proposes a new architecture designed to address these issues, ensuring modularity, flexibility, easy configurability, and maintainability for menu tree changes, while future-proofing the system for multiple frontends and evolving backend services.

### 1.1 Current State Analysis

Before diving into the proposed architecture, it's crucial to understand the existing components and patterns that this proposal aims to evolve or replace:

*   **`ActionConfig.js`:** This is the central, monolithic configuration file (currently 870+ lines) that defines menu items, their display names, associated actions, required profile fields, subscription features, cooldowns, and error messages for over 100 astrological services. Its size and tight coupling of display logic with service metadata are primary drivers for this architectural change.
*   **Existing `menuLoader.js`:** A rudimentary `menuLoader.js` already exists, which includes some form of translation caching. The new `MenuLoader` will build upon or replace this, ensuring that existing caching mechanisms are either integrated or superseded by a more robust i18n-aware caching strategy.
*   **`BaseAction.js` Inheritance Patterns:** The current system utilizes a `BaseAction.js` from which many action-specific classes inherit. This inheritance pattern is valuable for standardizing action execution. The proposed architecture will maintain this pattern, with action classes becoming lean wrappers around the new `WhatsAppMenuAdapter` (and other frontend adapters) or directly invoking the `ActionMapper`.
*   **`ResponseBuilder.js` Patterns:** The `ResponseBuilder.js` is currently responsible for constructing platform-specific messages (e.g., WhatsApp interactive messages). The new `Frontend-Specific Adapters/Renderers` will take over this responsibility, effectively replacing or refactoring `ResponseBuilder.js` to work with the generic menu object and i18n-translated strings. This ensures that message construction is handled by the platform-specific layer, aligning with the principle of clear separation of concerns.
*   **`MessageCoordinator.js` Tight Coupling:** The existing `MessageCoordinator.js` exhibits tight coupling due to direct `require` statements and internal instantiation of numerous dependencies (processors, models, conversation engine, message senders). This makes the `MessageCoordinator` difficult to test in isolation and reduces its modularity. The proposed solution involves refactoring `MessageCoordinator.js` to utilize **Dependency Injection (DI)**, where all collaborators are passed into its constructor. This significantly improves testability, flexibility, and adherence to the Dependency Inversion Principle.

Understanding these existing components is vital for planning a smooth transition to the new architecture.

### 1.2 Migration Strategy

Migrating from the current tightly coupled, hardcoded menu system to the proposed modular and data-driven architecture requires a carefully planned, gradual approach to minimize disruption and ensure backward compatibility.

*   **Gradual Migration Path:**
    1.  **Identify Pilot Menus:** Start by selecting a small, isolated, and less critical menu (e.g., a specific sub-menu with limited user interaction) for the initial migration. This allows for testing the new architecture in a controlled environment.
    2.  **Implement New Architecture for Pilot:** Fully implement the new menu definition, loader, renderer, and adapter for the chosen pilot menu.
    3.  **Feature Flagging/A/B Testing:** Deploy both the old and new menu systems in parallel, using feature flags to control which users experience the new architecture. This enables A/B testing, gradual rollout, and quick rollback if issues arise.
    4.  **Iterative Rollout:** Once the pilot is stable, gradually migrate more menus, prioritizing based on complexity and user impact. This iterative approach allows for continuous learning and refinement.

*   **Backward Compatibility Plan:**
    1.  **Action ID Consistency:** Ensure that `actionId`s remain consistent between the old and new systems during the transition. This is crucial for the `ActionMapper` to correctly identify and route actions, regardless of whether they originated from an old or new menu.
    2.  **Message Router Fallback:** The `MessageRouter` should be enhanced to intelligently detect whether an incoming message corresponds to an old hardcoded menu interaction or a new data-driven menu interaction. It should gracefully fall back to the old rendering logic for users still on the legacy system.
    3.  **Dual Rendering (Temporary):** During the transition, it might be necessary for some parts of the system to temporarily support rendering both old and new menu formats, especially if users can navigate between migrated and un-migrated sections.

*   **Data Migration Strategy for Existing User Sessions:**
    1.  **Session Invalidation/Reset:** For users with active sessions during the migration, the simplest approach might be to invalidate or reset their session data, forcing them to start fresh. This should be communicated clearly to the user.
    2.  **Graceful Fallback:** If session data contains menu state (e.g., `currentMenuId`), the system should be designed to handle cases where this `currentMenuId` might refer to an old, un-migrated menu. A graceful fallback to the main menu or a default menu should be implemented.
    3.  **Data Transformation (Complex):** For more complex scenarios where preserving session state is critical, a data migration script could be developed to transform old session data into the new format. This would require careful planning and testing.

This migration strategy aims to provide a clear roadmap for transitioning to the new architecture with minimal risk and disruption.

### 1.3 Service Integration

The current system comprises 100+ astrological services, predominantly located within `/src/core/services/` (or similar location within the monolithic structure). Integrating these existing services seamlessly into the new, action-driven menu architecture is paramount, with a clear path from monolithic integration to microservice consumption.

*   **Acknowledging Existing Services (Monolithic Phase):** The `ActionMapper` will be the primary gateway to these services. Initially, the existing services will not be rewritten but rather adapted to be callable as internal functions or classes within the monolithic backend.

*   **Mapping Existing Services to New Action IDs:**
    1.  **Direct Mapping (Monolithic Phase):** For most services, a direct one-to-one mapping between the `actionId` defined in the menu (e.g., `get_daily_horoscope`) and the existing service identifier (e.g., a function name or class instance within the monolith) can be established.
    2.  **Configuration-Driven Mapping:** The `serviceRegistry` (as mentioned in Step 8 of the implementation instructions) will be central to this. It will act as a lookup mechanism, mapping `actionId`s to the concrete service implementations. In the monolithic phase, these implementations are internal references. In the microservice phase, they will evolve to be network endpoints or client proxies.
    3.  **Convention over Configuration:** Where possible, adopt naming conventions that make it intuitive to map `actionId`s directly to existing service classes or functions within the monolith.

*   **Analysis of Current Service Method Signatures:**
    1.  **Standardized Invocation (Monolithic Phase):** The `ActionMapper` will invoke services via a standardized method (e.g., `service.processCalculation(userData, params)`). Existing services within the monolith should be refactored to expose this standardized interface, making them easier to extract later.
    2.  **Wrapper Classes/Adapters (for legacy services):** For services with highly custom or inconsistent method signatures within the monolith, it may be necessary to create thin wrapper classes or adapters. These wrappers would conform to the standardized invocation interface, translating generic parameters from the `ActionMapper` into the specific arguments required by the legacy service. This avoids modifying the core business logic of existing services.
    3.  **Parameter Transformation:** The `ActionMapper` (or a component it delegates to) will be responsible for extracting and transforming relevant parameters from the `User` object and the incoming request into a format expected by the invoked service.

*   **Transition to Microservices:** The `serviceRegistry` and the standardized invocation interface are designed to abstract the underlying service implementation. When a service is extracted into a microservice, the `serviceRegistry` entry for its `actionId` will simply be updated to point to the microservice's API endpoint or a client library, without requiring changes to the `ActionMapper` or frontend logic.

This approach ensures that the valuable business logic encapsulated in the existing 100+ services is preserved and easily integrated into the new modular framework, with a clear migration path to a microservice architecture.

### 1.4 Configuration Complexity and Refactoring `ActionConfig.js`

The existing `ActionConfig.js` stands as a substantial file (870+ lines), serving as a monolithic repository for both menu display details and critical service metadata (e.g., `requiredProfileFields`, `subscriptionFeature`, `cooldown`, `errorMessages`). Refactoring this file is a key objective of the new architecture.

*   **Streamlining `ActionConfig.js`:** The core principle is to remove all menu-centric display information from `ActionConfig.js`. This includes `displayName` (which will be replaced by `i18nKey` in menu definitions) and any other fields solely used for presenting options to the user. The `ActionConfig.js` should be streamlined to contain *only* metadata directly relevant to the *execution and validation* of backend services.

*   **Strategy for Existing Fields:**
    1.  **Remove Display-Only Fields:** Fields like `displayName` that are purely for user-facing labels will be removed and their information will reside solely in the `menu_definitions` (via `i18nKey`).
    2.  **Retain Service-Specific Metadata:** Fields crucial for service execution, validation, and control (e.g., `requiredProfileFields`, `subscriptionFeature`, `cooldown`, `errorMessages`) will remain in `ActionConfig.js`. These are essential for the `ActionMapper` to perform pre-execution checks.
    3.  **Handle Dual-Purpose Fields:** For fields that currently serve both display and service metadata purposes (if any exist beyond `displayName`), a decision must be made: either split them into separate fields (one with an `i18nKey` for display, one for internal logic) or clarify their primary role.

*   **Integrating Subscription/Permission Logic:**
    1.  **Placement in `ActionMapper`:** The `ActionMapper` is the logical place to centralize subscription and permission checks. Before invoking any service, the `ActionMapper` will consult the `actionConfig` associated with the `actionId` to determine required `subscriptionFeature` or `requiredProfileFields`.
    2.  **Dedicated Policy/Guard Services:** For more complex permission schemes, the `ActionMapper` could delegate checks to a dedicated `PermissionService` or `SubscriptionService`. These services would analyze the `actionConfig` fields (`subscriptionFeature`, `requiredProfileFields`) alongside the `User` object's properties to grant or deny access.
    3.  **i18n for Error Messages:** `errorMessages` defined in `ActionConfig.js` will likely continue to store keys for i18n lookup, ensuring that permission denial messages are also localized and user-friendly.

By following this strategy, `ActionConfig.js` will transform from a sprawling, dual-purpose file into a concise, backend-service metadata repository, significantly reducing configuration complexity and improving maintainability.

## 2. Core Principles

The proposed architecture is built upon the following principles:

*   **Modularity & Decoupling:** Separate menu definitions from rendering logic and action handling.
*   **Single Responsibility Principle (SRP):** Each module, class, or function should have one, and only one, reason to change. This prevents components from becoming overly large or complex and improves maintainability.
*   **Dependency Inversion Principle (DIP):** High-level modules should not depend on low-level modules. Both should depend on abstractions. Abstractions should not depend on details. Details should depend on abstractions. This is crucial for achieving loose coupling and making components easily testable and interchangeable.
*   **Data-Driven Configuration:** Define menu structures using external, human-readable data files (e.g., JSON/YAML).
*   **Frontend Agnostic Menu Definitions:** The core menu structure should be independent of any specific frontend platform.
*   **Clear Separation of Concerns:** Distinct layers for menu definition, frontend rendering, action mapping, and backend service invocation.
*   **Flexibility & Configurability:** Menu changes should ideally require only data file modifications, not code changes.
*   **Maintainability:** Simplify updates, reduce cognitive load, and minimize the risk of errors.
*   **Future-Proofing & Phased Evolution:** Design for seamless integration with future frontends (Web, Android, iOS, Telegram, PWA, etc.) and explicitly support a phased transition from a single monolithic backend service (encapsulating all 100 astro services today) to individual microservices in the future. The architecture must facilitate this evolution without requiring a complete rewrite of frontend logic.
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
        AndroidAppFrontend[Android App]
        iOSAppFrontend[iOS App]
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
    AndroidAppFrontend --> AndroidAdapter[Android App Menu Adapter]
    iOSAppFrontend --> iOSAdapter[iOS App Menu Adapter]

    WhatsAppAdapter --> MenuRenderer
    WebAdapter --> MenuRenderer
    TelegramAdapter --> MenuRenderer
    AndroidAdapter --> MenuRenderer
    iOSAdapter --> MenuRenderer

    MenuRenderer --> MenuLoader
    MenuLoader --> MenuDefinitions
    MenuLoader --> I18NStrings

    WhatsAppAdapter --> ActionMapper
    WebAdapter --> ActionMapper
    TelegramAdapter --> ActionMapper
    AndroidAdapter --> ActionMapper
    iOSAdapter --> ActionMapper

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
        *   `version`: (Optional) Semantic version of the menu definition (e.g., "1.0.0").
        *   `lastModified`: (Optional) Timestamp of the last modification (e.g., "2025-11-01").
        *   `supportedPlatforms`: (Optional) Array of platforms this menu is designed for (e.g., `["whatsapp", "web"]`).
        *   `compatibility`: (Optional) Object defining compatibility rules (e.g., `minFrontendVersion`, `deprecatedFields`).
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
*   **Generic Menu Object API Contract:**
    The `GenericMenuRenderer` will return a standardized menu object with the following guaranteed structure:
    ```javascript
    {
      menuId: string, // Unique identifier of the menu
      type: 'list' | 'buttons', // Type of menu to render
      body: string, // Translated main text/header of the menu
      sections?: Array<{ // Present if type is 'list'
        title: string, // Translated title of the section
        rows: Array<{ // Menu items within the section
          id: string, // actionId
          title: string, // Translated display text for the row
          description?: string // Translated optional description
        }>
      }>,
      buttons?: Array<{ // Present if type is 'buttons'
        id: string, // actionId
        title: string // Translated display text for the button
      }>,
      navigation?: Array<{ // Common navigation options
        id: string, // actionId
        title: string // Translated display text for the navigation option
      }>,
      platformContext: string // The platform for which the menu was rendered (e.g., 'whatsapp', 'web')
    }
    ```
*   **Implementation Examples:**
    *   **WhatsApp Menu Adapter:** Translates the generic menu object into WhatsApp Interactive Buttons or Interactive Lists, adhering to character limits, button type restrictions, and formatting rules. This will replace the current hardcoded menu generation logic in `ShowMainMenuAction.js` and similar files.
        ```javascript
        // Example: WhatsApp adapter translating a generic 'list' menu
        const genericMenu = { /* ... generic menu object ... */ };
        const whatsappSections = genericMenu.sections.map(section => ({
          title: section.title,
          rows: section.rows.map(row => ({
            id: row.id,
            title: row.title.substring(0, 24), // WhatsApp row title limit
            description: row.description ? row.description.substring(0, 72) : '' // WhatsApp description limit
          }))
        }));
        // ... construct WhatsApp interactive message payload ...
        ```
    *   **Web Menu Adapter (PWA):** Renders the generic menu object as HTML/CSS elements, potentially using a framework like React or Vue. It handles web-specific interactions (e.g., clicks, form submissions) and navigation.
        ```javascript
        // Example: Web adapter translating a generic 'buttons' menu
        const genericMenu = { /* ... generic menu object ... */ };
        return (
          <div>
            <h2>{genericMenu.body}</h2>
            {genericMenu.buttons.map(button => (
              <button key={button.id} onClick={() => handleAction(button.id)}>
                {button.title}
              </button>
            ))}
          </div>
        );
        ```
    *   **Telegram Menu Adapter:** Renders the generic menu object using Telegram's inline keyboards, reply keyboards, or custom commands, respecting Telegram's API limitations and interaction patterns.
        ```javascript
        // Example: Telegram adapter translating a generic 'list' menu into inline keyboard
        const genericMenu = { /* ... generic menu object ... */ };
        const inlineKeyboard = genericMenu.sections.flatMap(section => 
          section.rows.map(row => [{
            text: row.title,
            callback_data: row.id
          }])
        );
        // ... send Telegram message with inline keyboard ...
        ```
    *   **Android App Menu Adapter:** Renders the generic menu object using native Android UI components (e.g., Jetpack Compose or XML layouts). This adapter integrates with Android's navigation system and handles platform-specific UI/UX guidelines.
        ```kotlin
        // Example: Android (Compose) adapter translating a generic 'list' menu
        // fun MenuScreen(genericMenu: GenericMenu, onAction: (String) -> Unit) {
        //   Column { 
        //     Text(genericMenu.body)
        //     genericMenu.sections?.forEach { section ->
        //       Text(section.title, style = MaterialTheme.typography.h6)
        //       section.rows.forEach { row ->
        //         Button(onClick = { onAction(row.id) }) { Text(row.title) }
        //       }
        //     }
        //   }
        // }
        ```
    *   **iOS App Menu Adapter:** Renders the generic menu object using native iOS UI components (e.g., SwiftUI or UIKit). This adapter integrates with iOS's navigation system and handles platform-specific UI/UX guidelines.
        ```swift
        // Example: iOS (SwiftUI) adapter translating a generic 'buttons' menu
        // struct MenuScreen: View {
        //   let genericMenu: GenericMenu
        //   var body: some View {
        //     VStack {
        //       Text(genericMenu.body)
        //       ForEach(genericMenu.buttons, id: \.id) { button in
        //         Button(button.title) {
        //           // handleAction(button.id)
        //         }
        //       }
        //     }
        //   }
        // }
        ```

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

This layer consists of your actual astrological services, with a clear distinction between the current monolithic implementation and the future microservices architecture.

*   **Initial Phase (Today): Monolithic Microservice:** The existing monolithic microservice encapsulates all 100 astro services. In this phase, the `ActionMapper` will invoke functions or methods *directly within this monolith*.
*   **Future Phase (Tomorrow): Individual Microservices:** As services are decoupled into individual microservices, the `ActionMapper` will be updated to route requests to the appropriate microservice endpoints (e.g., via HTTP calls to separate service APIs). The design of the `ActionMapper` and `serviceRegistry` is intended to abstract this transition, minimizing impact on frontend logic.

### 3.7. User Context Management

Effective management of user context is critical for providing personalized and seamless experiences across multiple platforms. User context includes information such as the user's identity, preferred locale, current platform, session state, and any platform-specific identifiers.

*   **Purpose:** To ensure that all layers of the application have access to necessary user-specific information to process requests, render appropriate menus, and interact correctly with backend services.
*   **Implementation:**
    *   **Centralized User Object:** A standardized `User` object should encapsulate all relevant user data, including a `locale` property, a `platform` identifier (e.g., 'whatsapp', 'telegram', 'web'), and potentially platform-specific IDs (e.g., `whatsappPhoneNumber`, `telegramChatId`).
    *   **Context Propagation:** This `User` object (or relevant parts of it) should be consistently passed through the call chain, from the initial frontend interaction (e.g., `MessageRouter`, `InteractiveMessageProcessor`) down to the `ActionMapper`, `MenuLoader`, `GenericMenuRenderer`, and ultimately to backend service invocations.
    *   **Session Management:** For platforms that are inherently stateless (like many messaging apps), a session management mechanism (e.g., using Redis or a database) will be necessary to persist user state (like the current menu context, previous menu for 'back' functionality, or ongoing multi-step interactions) between requests.
    *   **Platform-Specific Identifiers:** Frontend adapters are responsible for extracting platform-specific user identifiers from incoming messages and mapping them to a canonical user ID within the system.

### 3.8. Architectural Enforcement Mechanisms

To actively prevent the recurrence of issues like tight coupling, monolithic files, and complex, difficult-to-maintain components, the architecture incorporates the following enforcement mechanisms and guidelines:

*   **Strict Adherence to Single Responsibility Principle (SRP):**
    *   **Guideline:** Each class, module, or function must have one, and only one, clearly defined responsibility. If a component starts accumulating multiple responsibilities, it must be refactored.
    *   **Example:** The `MenuLoader`'s sole responsibility is to load and parse menu definitions and i18n strings. It does not render menus or execute actions. Frontend adapters are responsible for platform-specific rendering, not for core menu logic.
*   **Dependency Inversion Principle (DIP) through Dependency Injection (DI):**
    *   **Guideline:** High-level modules (like `MessageCoordinator`) should not depend on low-level modules (like specific processors or models). Instead, both should depend on abstractions. Dependencies should be injected (e.g., via constructor injection) rather than directly `require`d or instantiated within a module.
    *   **Benefit:** This promotes loose coupling, making components easier to test in isolation, swap out implementations, and prevents a single change in a low-level module from rippling through high-level modules.
*   **Clear Module Boundaries and API Contracts:**
    *   **Guideline:** Each module (e.g., `src/core/menu`, `src/frontend/whatsapp`) must have a well-defined public interface (API). Internal implementation details should be encapsulated and not exposed.
    *   **Benefit:** This limits the surface area for dependencies, making it harder for components to become tightly coupled and easier to understand individual parts of the system.
*   **Configuration over Code for Volatile Aspects:**
    *   **Guideline:** Aspects of the system that are expected to change frequently (e.g., menu structures, user-facing text) must be externalized into configuration files (JSON/YAML) rather than hardcoded in logic.
    *   **Benefit:** This reduces the need for code deployments for simple content updates, minimizing risk and increasing agility.
*   **Automated Tooling and Code Reviews:**
    *   **Guideline:** Implement static analysis tools (linters, complexity analyzers) and enforce rigorous code review processes to identify and flag violations of these architectural principles (e.g., overly large files, high cyclomatic complexity, direct instantiation of dependencies where injection is preferred).
    *   **Benefit:** Provides an automated and human-driven safety net to maintain architectural integrity over time.

These mechanisms, combined with the recommended directory structure, are designed to guide developers towards building a maintainable, scalable, and extensible system, actively preventing the accumulation of technical debt.

### 3.9. Recommended Directory Structure

To enforce strict modularity, extensibility, and clear separation of concerns, particularly between backend core logic and frontend implementations, the following directory structure is recommended:

```
/project-root
├── /config
│   ├── /menu_definitions       # JSON/YAML files defining menu structures
│   └── /i18n_keys              # JSON files for internationalization strings (e.g., en.json, es.json)
├── /src
│   ├── /core                   # Core backend application logic (platform-agnostic, but not directly frontend-facing)
│   │   ├── /services           # All 100+ backend services (e.g., birthChartService.js, calculators/, etc.)
│   │   ├── /models             # Core data models/schemas (e.g., userModel.js, birthData.js)
│   │   ├── /utils              # Core backend utilities (logger, dateUtils, formatters, validationUtils)
│   │   ├── /interfaces         # Service interfaces for backend services
│   │   └── /middleware         # Core backend middleware (validation, error handling)
│   ├── /frontends              # All platform-specific frontend implementations
│   │   ├── /whatsapp           # WhatsApp-specific adapters, message senders, processors, actions
│   │   ├── /telegram           # Telegram-specific adapters, message senders, processors, actions
│   │   ├── /web                # Web/PWA-specific adapters, UI components, routing
│   │   ├── /android            # Android app specific adapters, UI components
│   │   └── /ios                # iOS app specific adapters, UI components
│   └── /shared                 # Truly shared, platform-agnostic code consumed by both core backend and frontends
│       ├── /menu               # Platform-agnostic menu logic (MenuLoader, GenericMenuRenderer, ActionMapper)
│       └── /utils              # Shared utilities (e.g., i18n utility, common data structures)
├── /tests                      # Unit, integration, and E2E tests
├── /docs                       # Project documentation (including this proposal)
├── package.json                # Project dependencies and scripts
└── README.md
```

This revised structure rigorously promotes:
*   **Strict Separation of Concerns:** Frontend and backend codebases are distinctly separated, preventing accidental coupling.
*   **Clear Ownership:** Each frontend platform has its dedicated space, and core backend logic is isolated.
*   **Maximized Reusability:** Truly shared logic and configurations are centralized in `/src/shared`, accessible to all necessary components.
*   **Enhanced Scalability:** Easier to add new frontend platforms or backend services without cross-contaminating concerns.
*   **Improved Maintainability:** Developers can quickly locate relevant code based on its function and platform, significantly reducing cognitive load and preventing monolithic files.
*   **Enforced Decoupling:** Actively prevents tight coupling by design, making components easier to test and evolve independently.

## 4. Detailed Implementation Instructions

This section outlines the step-by-step process for implementing the proposed menu architecture. Each step is designed to adhere to the core architectural principles, particularly the **Single Responsibility Principle (SRP)** and the **Dependency Inversion Principle (DIP)**, to ensure that the resulting codebase is modular, loosely coupled, testable, and maintainable. By following these instructions, we actively prevent the creation of large, complex, and tightly coupled files, ensuring a robust and future-proof system.

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
// src/shared/menu/menuLoader.js
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger'); // Assuming shared logger
const i18n = require('../utils/i18n');     // Assuming shared i18n utility

class MenuLoader {
  constructor(configPath) {
    this.configPath = configPath;
    this.menuCache = {};
  }

  loadMenu(menuId, lang = 'en') {
    const cacheKey = `${menuId}-${lang}`;
    if (this.menuCache[cacheKey]) {
      return this.menuCache[cacheKey];
    }

    try {
      const menuFilePath = path.join(this.configPath, `${menuId}.json`);
      const menuConfig = JSON.parse(fs.readFileSync(menuFilePath, 'utf8'));
      const translatedMenu = this._translateMenu(menuConfig, lang);
      this.menuCache[cacheKey] = translatedMenu;
      return translatedMenu;
    } catch (error) {
      logger.error(`Failed to load menu ${menuId}:`, error);
      return null; // Or throw a custom error
    }
  }

  _translateMenu(menuConfig, lang) {
    // Recursively translate menu items using i18n utility
    const translate = (item) => {
      if (item.i18nKey) {
        item.text = i18n.t(item.i18nKey, lang);
      }
      if (item.options) {
        item.options = item.options.map(translate);
      }
      return item;
    };
    return translate(menuConfig);
  }
}

module.exports = MenuLoader;
```

### Step 3: Refactor `ActionConfig.js`

`ActionConfig.js` should now exclusively contain metadata for the *backend services* (the 100 astro services), not menu display logic. Menu display names will be read from the menu definition files via `i18nKey`. This refactoring is a direct application of the **Single Responsibility Principle (SRP)**, ensuring `ActionConfig.js` has only one reason to change: updates to service metadata.

*(This will involve a manual process of going through `ActionConfig.js` and removing `displayName` from `ASTROLOGY_CONFIG`, `NUMEROLOGY_CONFIG`, `DIVINATION_CONFIG`, `PROFILE_CONFIG` if these display names refer to menu items. Only retain `displayName` if it's used for internal logging or non-menu display purposes for the backend service itself. If a service requires a user-facing name for internal messages (e.g., in an error log that is shown to the user), consider replacing `displayName` with an `i18nKey` that can be translated. The `MENU_CONFIG` object can be significantly streamlined or removed entirely if menu actions are handled by the `MenuLoader`.)*

**Applying Dependency Inversion Principle (DIP):** The `ActionMapper` (a high-level module) will depend on an abstraction (e.g., a `getActionConfig` function or an interface) to retrieve service configuration, rather than directly on the concrete `ActionConfig.js` file. This ensures that changes to the internal structure of `ActionConfig.js` do not directly impact the `ActionMapper`.

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
// src/shared/menu/genericMenuRenderer.js
class GenericMenuRenderer {
  constructor(actionMapper) {
    this.actionMapper = actionMapper;
  }

  renderMenu(menuData, platformContext) {
    // This is a generic rendering logic. Specific platforms will adapt this.
    // For example, a platform might convert menuData into a series of buttons or a list.
    const renderedItems = menuData.options.map(option => ({
      text: option.text,
      action: this.actionMapper.mapAction(option.actionId, platformContext)
    }));

    return {
      title: menuData.title,
      description: menuData.description,
      items: renderedItems
    };
  }
}

module.exports = GenericMenuRenderer;
```

### Step 5: Develop WhatsApp Menu Adapter

The WhatsApp-specific adapter (e.g., `src/frontend/whatsapp/whatsappMenuAdapter.js`) will now fetch menu definitions and render them. This adapter adheres to the **Single Responsibility Principle (SRP)** by focusing solely on translating the generic menu object into WhatsApp's native interactive message formats. It demonstrates the **Dependency Inversion Principle (DIP)** by depending on the abstractions provided by `MenuLoader` and `GenericMenuRenderer`, rather than their concrete implementations.

```javascript
// src/frontends/whatsapp/whatsappMenuAdapter.js
const MenuLoader = require('../../shared/menu/menuLoader');
const GenericMenuRenderer = require('../../shared/menu/genericMenuRenderer');
const i18n = require('../../shared/utils/i18n');

class WhatsAppMenuAdapter {
  constructor(menuConfigPath, actionMapper) {
    this.menuLoader = new MenuLoader(menuConfigPath);
    this.genericRenderer = new GenericMenuRenderer(actionMapper);
  }

  renderWhatsAppMenu(menuId, userLanguage, platformContext) {
    const menuData = this.menuLoader.loadMenu(menuId, userLanguage);
    if (!menuData) {
      return { text: i18n.t('menu_not_found', userLanguage) };
    }

    const renderedMenu = this.genericRenderer.renderMenu(menuData, platformContext);

    // Adapt the generic rendered menu to WhatsApp-specific format
    let whatsappMessage = `*${renderedMenu.title}*\n`;
    if (renderedMenu.description) {
      whatsappMessage += `${renderedMenu.description}\n`;
    }

    renderedMenu.items.forEach((item, index) => {
      whatsappMessage += `\n${index + 1}. ${item.text}`;
    });

    whatsappMessage += `\n\n${i18n.t('menu_footer', userLanguage)}`;

    return { text: whatsappMessage };
  }
}

module.exports = WhatsAppMenuAdapter;
```

### Step 6: Refactor Existing Menu Action Files

These files will now become lean wrappers around the `WhatsAppMenuAdapter`. This is a direct application of the **Single Responsibility Principle (SRP)**, as each action file's sole responsibility is to trigger a specific menu display via the adapter. They demonstrate the **Dependency Inversion Principle (DIP)** by depending on the `WhatsAppMenuAdapter` abstraction, not its internal implementation details.

**Example: `src/frontend/whatsapp/actions/menu/ShowMainMenuAction.js`**

```javascript
// src/frontends/whatsapp/actions/menu/ShowMainMenuAction.js
const BaseAction = require('./BaseAction'); // Assuming BaseAction will be co-located or in a backend shared module
const WhatsAppMenuAdapter = require('../whatsappMenuAdapter');

class ShowMainMenuAction extends BaseAction {
  constructor() {
    super('show_main_menu');
  }

  async execute(user, phoneNumber) {
    // The user object is now expected to contain the locale and other context
    const userLocale = user.locale || 'en'; 
    return await WhatsAppMenuAdapter.sendMenu(user, phoneNumber, 'main_menu', userLocale);
  }
}

module.exports = ShowMainMenuAction;
```
*(You will need to create/update similar action files for all high-level menus (e.g., `show_western_astrology_menu`, `show_vedic_astrology_menu`, etc.) to call `WhatsAppMenuAdapter.sendMenu` with the appropriate `menuId`.)*

### Step 7: Update `MessageRouter` and `InteractiveMessageProcessor`

These modules will now interact with the new `ActionMapper` (which will call the adapters and services). This demonstrates the **Dependency Inversion Principle (DIP)**, as these high-level modules depend on the `ActionMapper` abstraction (its public `executeAction` method) rather than directly on the concrete implementations of individual actions or services. Their primary responsibility is routing, adhering to **SRP**.

**Example: `src/frontend/whatsapp/processors/InteractiveMessageProcessor.js`**

```javascript
// src/frontends/whatsapp/processors/InteractiveMessageProcessor.js
// ... (other imports)
const ActionMapper = require('../../../shared/menu/actionMapper');
const i18n = require('../../../shared/utils/i18n');

class InteractiveMessageProcessor {
  // ...
  async processInteractiveReply(user, phoneNumber, message) {
    const actionId = message.interactive.list_reply?.id || message.interactive.button_reply?.id;
    // The user object is now expected to contain the locale and other context
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

**Example: `src/frontends/whatsapp/processors/MessageRouter.js`**

```javascript
// src/frontends/whatsapp/processors/MessageRouter.js
// ... (other imports)
const ActionMapper = require('../../../shared/menu/actionMapper');
const i18n = require('../../../shared/utils/i18n');

class MessageRouter {
  // ...
  async routeMessage(user, phoneNumber, message) {
    // ... (existing keyword mapping logic that identifies a mappedActionId)
    // The user object is now expected to contain the locale and other context
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

This module will bridge the frontend action IDs to the backend service calls or menu navigation. It is designed to abstract the underlying service implementation, allowing for a seamless transition from monolithic services to microservices. The `ActionMapper` adheres to the **Single Responsibility Principle (SRP)** by focusing solely on mapping and executing actions. It demonstrates the **Dependency Inversion Principle (DIP)** by depending on abstractions like the `serviceRegistry` and the interfaces of the frontend adapters (e.g., `WhatsAppMenuAdapter.sendMenu`), rather than their concrete implementations.

```javascript
// src/shared/menu/actionMapper.js
const logger = require('../../shared/utils/logger');

class ActionMapper {
  constructor(serviceRegistry) {
    this.serviceRegistry = serviceRegistry; // Central registry of all available services
  }

  mapAction(actionId, platformContext) {
    // Logic to map a generic actionId to a platform-specific executable action
    // This could involve looking up a service in the serviceRegistry
    // and returning a function or an object that the frontend adapter can use.
    logger.info(`Mapping action: ${actionId} for platform: ${platformContext.platform}`);

    const service = this.serviceRegistry.getService(actionId);

    if (service) {
      return { type: 'service_invocation', serviceId: actionId, payload: platformContext.payload };
    } else {
      logger.warn(`No service found for actionId: ${actionId}`);
      return { type: 'unsupported_action', actionId: actionId };
    }
  }
}

module.exports = ActionMapper;
```

### Step 9: Implement an i18n Utility

Create a dedicated utility module (e.g., `src/core/utils/i18n.js`) for managing and retrieving translated strings. This module adheres to the **Single Responsibility Principle (SRP)** by focusing solely on internationalization concerns, such as loading language files and providing a translation function. It does not concern itself with how these translations are used in menus or other parts of the application.

```javascript
// src/shared/utils/i18n.js
const path = require('path');
const fs = require('fs');
const logger = require('./logger'); // Assuming logger is in the same shared/utils directory

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

*   **Enhanced Modularity & Decoupling:** Achieves a high degree of separation between concerns, making individual components easier to develop, test, and maintain independently. **Active enforcement of SRP and DIP, coupled with clear module boundaries, directly prevents files from becoming overly large, complex, or tightly coupled.**
*   **True Frontend Agnosticism:** The core menu logic and definitions are entirely independent of any specific frontend platform. This means the same menu structure can power WhatsApp, Web (PWA), Telegram, **distinct Android native applications, and distinct iOS native applications** with minimal platform-specific code.
*   **Simplified Menu Management:** Modifying menu labels, adding/removing items, or reordering sections *only* involves editing JSON/YAML configuration files. No code changes are needed for menu structure updates, significantly reducing deployment cycles and risk.
*   **Scalability & Extensibility:** The architecture is designed to easily accommodate new frontend platforms or additional backend services. Adding a new frontend simply requires implementing a new adapter that conforms to the generic menu representation.
*   **Clear API Contracts:** Well-defined interfaces between layers (e.g., Generic Menu Renderer and Frontend Adapters) ensure predictable interactions and facilitate parallel development by different teams.
*   **Improved Maintainability:** Reduced code complexity, a logical directory structure, and clear separation of concerns make the codebase easier to understand, onboard new developers, and minimize the risk of errors during updates. **The architectural enforcement mechanisms actively combat technical debt and ensure long-term maintainability.**
*   **Future-Proofing & Phased Evolution:** The architecture is explicitly designed to support a phased evolution. The `ActionMapper` and `serviceRegistry` abstract the underlying service implementation, allowing for a seamless transition from invoking internal monolithic functions (today) to calling external microservice APIs (tomorrow) without requiring changes to frontend logic or menu definitions. This significantly reduces the risk and complexity of future refactoring.
*   **Redundancy Support:** Menu definitions can easily include the same `actionId` in multiple places, allowing for redundant access paths to popular services without duplicating configuration.
*   **Internationalization Built-In:** All user-facing text is managed centrally through i18n keys, making it straightforward to add new languages and ensuring a consistent multilingual experience across all platforms.

## 6. Considerations / Future Work

*   **i18n_keys Directory:** Populate the `config/i18n_keys/` directory with language-specific JSON files (e.g., `en.json`, `es.json`) containing all user-facing strings referenced by `i18nKey` in the menu definitions.
*   **API Versioning for Menu Definitions:** As the menu structure evolves, implementing a versioning strategy for menu definition files is crucial to ensure backward compatibility for older frontend adapters and to manage changes effectively. The `MenuLoader` can use the `version`, `supportedPlatforms`, and `compatibility` fields (as introduced in Section 3.1) to load the correct menu definition for a given frontend version and platform, or to provide graceful degradation/error messages if a menu is incompatible. This allows for independent evolution of menu content and frontend clients.
*   **Schema Validation for Configuration Files:** Implement JSON Schema validation for `menu_definitions` and `i18n_keys` files to ensure their structural integrity and prevent runtime errors due to malformed configurations. The `MenuLoader` should utilize these schemas during menu loading.
    ```json
    // config/menu_definitions/schema.json (Example)
    {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "type": "object",
      "required": ["menuId", "type", "bodyI18nKey"],
      "properties": {
        "menuId": { "type": "string", "pattern": "^[a-z_]+$" },
        "type": { "enum": ["buttons", "list"] },
        "bodyI18nKey": { "type": "string" }
      }
    }
    ```
*   **CLI Tool for Menu Management:** For very large menu trees, consider building a command-line interface (CLI) tool to assist with creating, validating, translating, and visualizing menu definition files.
*   **Dynamic Menu Generation:** For highly personalized menus (e.g., showing different options based on user's subscription or location), the `MenuLoader` could incorporate logic to dynamically filter or construct menu definitions.
*   **Service Registry:** A robust `serviceRegistry` implementation is needed to abstract away how backend services are located and invoked (whether internal functions in a monolith or external microservice calls).
*   **Platform-Specific Message Senders:** Ensure robust message sender utilities (e.g., `WhatsAppMessageSender`, `TelegramMessageSender`, `WebPushNotificationSender`, `AndroidNotificationSender`, `iOSNotificationSender`) are implemented for each platform, handling all message types (text, interactive, media, etc.) and platform-specific error handling.
*   **Cross-Layer Error Handling Strategy:** Define a consistent strategy for error handling, logging, and user notification across all layers. This includes how errors are caught, transformed (e.g., to be i18n-ready messages), and presented to the user via frontend adapters, and how critical errors are logged for system monitoring. Implement a custom error hierarchy for better error classification and handling.
    ```javascript
    // Proposed error handling hierarchy
    class MenuError extends Error {
      constructor(code, message, details = {}) {
        super(message);
        this.name = 'MenuError';
        this.code = code; // e.g., 'MENU_NOT_FOUND', 'I18N_MISSING'
        this.details = details;
      }
    }

    // Error codes for different failure scenarios
    const ERROR_CODES = {
      MENU_NOT_FOUND: 'MENU_NOT_FOUND',
      I18N_MISSING: 'I18N_MISSING',
      PLATFORM_UNSUPPORTED: 'PLATFORM_UNSUPPORTED',
      SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
      INVALID_MENU_DEFINITION: 'INVALID_MENU_DEFINITION'
    };
    ```
    These custom errors should be thrown by core components (like `MenuLoader`, `ActionMapper`) and caught by frontend adapters, which then translate them into user-friendly, i18n-localized messages.
*   **Monolith to Microservices Breakdown Strategy:** Develop a detailed plan for incrementally breaking down the monolithic service into individual microservices. This should include identifying service boundaries, defining clear APIs for each new microservice, and establishing a robust communication mechanism (e.g., message queues, gRPC) between them. Consider strategies like the Strangler Fig pattern for a safe and gradual transition.
*   **Automated Architectural Enforcement:** Implement static analysis tools (e.g., ESLint with custom rules, SonarQube, dependency-graph analyzers) and integrate them into the CI/CD pipeline. These tools should automatically flag violations of architectural principles, such as excessive file size, high cyclomatic complexity, direct instantiation of dependencies where DI is expected, or unauthorized cross-layer dependencies. This provides an objective and continuous mechanism to maintain architectural integrity.
*   **Monitoring & Observability:** Implement comprehensive monitoring and observability for the menu system to track its performance, reliability, and user experience. This includes collecting metrics, logs, and traces across all layers.
    ```javascript
    // Proposed metrics to track
    const MENU_METRICS = {
      menuLoadTime: 'histogram', // Time taken to load a menu definition
      menuRenderSuccess: 'counter', // Count of successful menu renders
      menuRenderErrors: 'counter', // Count of failed menu renders
      actionExecutionTime: 'histogram', // Time taken for an action to execute
      i18nCacheHitRate: 'gauge', // Cache hit rate for i18n translations
      menuDefinitionValidationErrors: 'counter' // Errors during schema validation
    };
    ```
    These metrics will provide insights into system health, identify bottlenecks, and help in proactive issue resolution.
*   **Security Considerations:**
    To ensure the integrity and security of the menu system, the following considerations are crucial:
    *   **Input Validation for Menu Definitions:** Beyond schema validation, implement strict content validation for menu definition files to prevent injection attacks (e.g., malicious scripts in labels) or unintended behavior. This should be part of the `MenuLoader`'s validation process.
    *   **Access Control for Menu Configuration:** Implement robust access control mechanisms for managing menu definition files and i18n strings. Only authorized personnel or automated processes should have write access to these critical configuration assets.
    *   **Audit Logging for Menu Changes:** Maintain comprehensive audit logs for all changes made to menu definitions and i18n files, including who made the change, when, and what was changed. This is essential for accountability and troubleshooting.
*   **Testing Strategy:**
    A comprehensive testing strategy is vital to ensure the reliability, correctness, and performance of the menu architecture:
    *   **Unit Testing:** Implement thorough unit tests for each individual component (e.g., `MenuLoader`, `GenericMenuRenderer`, `ActionMapper`, `i18n` utility, individual frontend adapters). These tests should cover all logic paths, edge cases, and error conditions, adhering to the SRP.
    *   **Integration Testing:** Conduct integration tests to verify the correct interaction between interconnected components (e.g., `MenuLoader` with `GenericMenuRenderer`, `ActionMapper` with `serviceRegistry`, frontend adapters with the generic menu object). This ensures that the API contracts between layers are correctly implemented.
    *   **End-to-End (E2E) Testing:** Develop E2E tests that simulate complete user flows across different frontend platforms. These tests should validate the entire menu interaction, from user input to backend service invocation and the final response, ensuring a seamless user experience.
    *   **Performance Testing:** Establish performance testing guidelines to measure and optimize key metrics such as menu load times, response times for action execution, and overall system throughput. This is crucial for identifying bottlenecks and ensuring the system scales effectively.
    *   **Contract Testing:** For the transition to microservices, implement contract testing between the `ActionMapper` and the microservices to ensure that the API contracts are maintained as services evolve independently.

This architecture provides a solid, future-proof foundation for a scalable, maintainable, and flexible bot experience across multiple platforms.
