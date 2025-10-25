# Astro WhatsApp Bot Brownfield Architecture Document

## Introduction

This document captures the CURRENT STATE of the Astro WhatsApp Bot codebase, including patterns, workarounds, and real-world implementation details. It serves as a reference for AI agents working on enhancements to this astrology service platform.

### Document Scope

Comprehensive documentation of the entire Astro WhatsApp Bot system, which is a multi-channel astrology service starting with WhatsApp as the primary platform.

### Change Log

| Date   | Version | Description                 | Author    |
| ------ | ------- | --------------------------- | --------- |
| 2025-10-25 | 1.0     | Initial brownfield analysis | AI Agent |

## Quick Reference - Key Files and Entry Points

### Critical Files for Understanding the System

- **Main Entry**: `src/server.js` (Express app setup, health checks, webhook handling)
- **Configuration**: `src/config/database.js` (MongoDB connection with Mongoose)
- **Core Business Logic**: `src/services/astrology/astrologyEngine.js` (Main astrology response generation)
- **API Definitions**: `src/controllers/whatsappController.js` (WhatsApp webhook processing)
- **Database Models**: `src/models/userModel.js`, `src/models/User.js`, `src/models/Session.js`
- **Key Algorithms**: `src/services/astrology/vedicCalculator.js` (Vedic astrology calculations)
- **Payment Processing**: `src/services/payment/paymentService.js` (Subscription management)

### Enhancement Impact Areas

Since no specific PRD was provided, this documents the entire system for general enhancement work.

## High Level Architecture

### Technical Summary

The Astro WhatsApp Bot is a Node.js-based astrology service platform that provides personalized cosmic guidance through WhatsApp. It features modular architecture with extensive astrology calculation engines, subscription-based monetization, and comprehensive testing.

### Actual Tech Stack (from package.json)

| Category  | Technology | Version | Notes                      |
| --------- | ---------- | ------- | -------------------------- |
| Runtime   | Node.js    | >=14.0.0 | Railway deployment optimized |
| Framework | Express    | 4.18.2  | REST API with middleware   |
| Database  | MongoDB    | 7.6.3   | Mongoose ODM, Atlas hosting |
| Testing   | Jest       | 29.7.0  | 95% coverage requirement  |
| Logging   | Winston    | 3.11.0  | Structured logging        |
| Validation| Joi        | 17.11.0 | Request validation        |
| Astrology | astrologer | 1.0.2   | Vedic calculations        |
| Astrology | sweph      | 2.10.3-b-1 | Swiss Ephemeris         |
| Messaging | Twilio     | 4.19.0  | WhatsApp Business API     |
| Payment   | Stripe     | 14.5.0  | Payment processing        |
| Payment   | Razorpay   | -       | Indian payment gateway    |
| Security  | Helmet     | 8.1.0   | Security headers          |
| Auth      | JWT        | 9.0.2   | JSON Web Tokens           |

### Repository Structure Reality Check

- Type: Monorepo (single repository with modular structure)
- Package Manager: npm
- Notable: Extensive documentation in `docs/`, comprehensive test suite, Railway deployment scripts

## Source Tree and Module Organization

### Project Structure (Actual)

```
astro-whatsapp-bot/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection management
│   ├── controllers/
│   │   └── whatsappController.js # WhatsApp webhook handling
│   ├── conversation/
│   │   ├── conversationEngine.js # Flow-based conversation management
│   │   ├── flowLoader.js        # Menu flow loading
│   │   └── menuLoader.js        # Interactive menu handling
│   ├── models/
│   │   ├── Session.js           # User session management
│   │   ├── User.js              # User data model
│   │   └── userModel.js         # User operations and subscriptions
│   ├── services/
│   │   ├── astrology/           # Astrology calculation engines
│   │   │   ├── astrologyEngine.js    # Main response generator
│   │   │   ├── vedicCalculator.js    # Vedic astrology
│   │   │   ├── chineseCalculator.js  # BaZi/Four Pillars
│   │   │   ├── tarotReader.js        # Tarot card readings
│   │   │   ├── palmistryReader.js    # Palm analysis
│   │   │   ├── nadiReader.js         # Nadi astrology
│   │   │   └── [10+ other readers]   # Various astrology systems
│   │   ├── payment/
│   │   │   └── paymentService.js     # Subscription management
│   │   └── whatsapp/
│   │       ├── messageProcessor.js   # Message processing
│   │       ├── messageSender.js      # WhatsApp API calls
│   │       ├── webhookValidator.js   # Webhook security
│   │       └── whatsappService.js    # WhatsApp integration
│   ├── utils/
│   │   ├── errorHandler.js      # Error handling utilities
│   │   ├── inputValidator.js    # Input validation
│   │   └── logger.js           # Winston logging setup
│   └── server.js               # Express app entry point
├── tests/
│   ├── unit/                   # Unit tests (95% coverage)
│   ├── integration/            # Integration tests
│   ├── e2e/                    # End-to-end tests
│   └── helpers/                # Test utilities
├── docs/
│   ├── architecture/           # Architecture docs
│   ├── plans/                  # Development plans
│   ├── prd/                    # Product requirements
│   ├── qa/                     # Quality assurance
│   └── validation/             # Validation reports
├── scripts/
│   ├── monitor-deployment.js   # Railway monitoring
│   ├── whatsapp-token-manager.js # Token management
│   └── [other deployment scripts]
└── [config files, CI/CD, etc.]
```

### Key Modules and Their Purpose

- **WhatsApp Integration**: `src/services/whatsapp/` - Handles all WhatsApp Business API communications, webhooks, and message processing
- **Astrology Engine**: `src/services/astrology/astrologyEngine.js` - Main orchestration for all astrology calculations and responses
- **User Management**: `src/models/userModel.js` - User data operations, subscriptions, and loyalty points
- **Payment Processing**: `src/services/payment/paymentService.js` - Subscription management and micro-transactions
- **Conversation Engine**: `src/conversation/conversationEngine.js` - Flow-based conversation management with menu systems
- **Database Layer**: `src/config/database.js` - MongoDB connection with connection pooling and health checks

## Data Models and APIs

### Data Models

- **User Model**: See `src/models/User.js` and `src/models/userModel.js` - Contains user profile, birth details, subscription info, loyalty points
- **Session Model**: See `src/models/Session.js` - Manages user conversation sessions and state

### API Specifications

- **WhatsApp Webhooks**: Handled in `src/controllers/whatsappController.js` - Receives and processes WhatsApp messages
- **Health Endpoints**: `/health` and `/ready` in `src/server.js` - Application health monitoring
- **Manual Endpoints**: REST API endpoints for user management and astrology services (referenced in controllers)

## Technical Debt and Known Issues

### Critical Technical Debt

1. **Payment Service Simulation**: `src/services/payment/paymentService.js` uses simulated payments for MVP - needs integration with real Stripe/Razorpay APIs
2. **Astrology Calculations**: Heavy reliance on external libraries (`astrologer`, `sweph`) with potential performance and accuracy concerns
3. **Memory Management**: Astrology calculations may cause memory issues in production (noted in Railway monitoring)
4. **Error Handling**: Some astrology readers lack comprehensive error handling (seen in try-catch blocks)

### Workarounds and Gotchas

- **Environment Variables**: Extensive `.env` configuration required for WhatsApp tokens, database, and API keys
- **Database Connection**: Hardcoded connection pool size of 10 in `src/config/database.js` - may need adjustment for scale
- **Logging**: Winston logger only uses console transport to avoid file path issues in containerized environments
- **Token Management**: Complex WhatsApp token management scripts in `scripts/whatsapp-token-manager.js`

## Integration Points and External Dependencies

### External Services

| Service  | Purpose  | Integration Type | Key Files                      |
| -------- | -------- | ---------------- | ------------------------------ |
| WhatsApp Business API | Messaging | REST API via Twilio | `src/services/whatsapp/`     |
| MongoDB Atlas | Database | Mongoose ODM | `src/config/database.js` |
| Stripe | Payments | SDK (simulated) | `src/services/payment/paymentService.js` |
| Razorpay | Indian Payments | SDK (simulated) | `src/services/payment/paymentService.js` |
| OpenAI | AI Features | API (planned) | Not yet implemented |
| Astrology APIs | Calculations | Libraries | `src/services/astrology/` |

### Internal Integration Points

- **Conversation Flow**: Modular conversation engine integrates with astrology services for dynamic responses
- **User Data Flow**: User models integrate with payment service for subscription management
- **Health Monitoring**: Express routes provide health checks for Railway deployment monitoring

## Development and Deployment

### Local Development Setup

1. Install dependencies: `npm install`
2. Create `.env` file with all required variables (see `.env.example`)
3. Start development server: `npm run dev` (uses nodemon)
4. Run tests: `npm test` (Jest with 95% coverage requirement)

### Build and Deployment Process

- **Build Command**: `npm run build` (not explicitly defined, uses standard Node.js)
- **Development**: `npm run dev` with nodemon auto-reload
- **Production**: `npm start` runs `src/server.js`
- **Deployment**: Optimized for Railway with `railway.toml` config
- **Monitoring**: `npm run monitor` runs continuous health monitoring

### Environment Management

- **Development**: Local MongoDB or memory server for testing
- **Production**: MongoDB Atlas with connection pooling
- **Testing**: Jest with mongodb-memory-server for isolated tests

## Testing Reality

### Current Test Coverage

- Unit Tests: 95%+ coverage required (Jest configuration in package.json)
- Integration Tests: Basic integration tests in `tests/integration/`
- E2E Tests: WhatsApp API testing via scripts
- Performance Tests: Artillery load testing in `artillery/`
- Security Tests: OWASP ZAP scanning configuration

### Running Tests

```bash
npm test              # All tests with coverage
npm run test:unit     # Unit tests only
npm run test:integration # Integration tests
npm run test:e2e      # End-to-end tests
npm run test:coverage # Coverage report
```

### Test Structure

- **Unit Tests**: Test individual functions in `tests/unit/`
- **Integration Tests**: Test service interactions in `tests/integration/`
- **E2E Tests**: Full user flows in `tests/e2e/`
- **Helpers**: Test utilities and mocks in `tests/helpers/`

## Development Workflow

### Code Quality

- **Linting**: ESLint with `npm run lint`
- **Formatting**: Prettier with `npm run format`
- **Security**: `npm run security` for dependency scanning
- **CI/CD**: GitHub Actions workflow in `.github/workflows/ci-cd.yml`

### Documentation Standards

- **API Docs**: JSDoc generation with `npm run docs`
- **Architecture**: Extensive docs in `docs/architecture/`
- **PRD**: Product requirements in `docs/prd/`
- **Validation**: QA gates and validation reports in `docs/qa/` and `docs/validation/`

## Appendix - Useful Commands and Scripts

### Frequently Used Commands

```bash
npm run dev         # Development server with auto-reload
npm start           # Production server
npm test            # Run all tests
npm run lint        # Code linting
npm run format      # Code formatting
npm run monitor     # Deployment monitoring
npm run docs        # Generate documentation
```

### WhatsApp Testing

```bash
./scripts/whatsapp-token-manager.js check  # Check token health
./scripts/whatsapp-token-manager.js update # Update tokens
./whatsapp-test-suite.sh all              # Run WhatsApp tests
```

### Deployment Commands

```bash
npm run token-manager   # Manage WhatsApp tokens
npm run update-token    # Update WhatsApp token
npm run check-token     # Check token status
npm run token-health    # Token health check
```

This brownfield architecture document provides a comprehensive view of the Astro WhatsApp Bot's current implementation, enabling AI agents to understand the codebase structure, patterns, and areas for enhancement.