# Astro WhatsApp Bot

An advanced, comprehensive multi-channel astrology service platform that starts with a fully comprehensive WhatsApp-based service as the primary channel and expands to additional platforms, positioning itself as a **Personal Cosmic Coach**—your trusted guide for clarity, confidence, and control in uncertain times.

## 🌟 Features

### Core Astrology Services
- **Hindu/Vedic Astrology**: Birth chart, planetary periods, compatibility analysis
- **Western Astrology**: Sun/Moon/Ascendant readings, transits
- **Chinese Astrology**: Animal signs, elemental analysis
- **Tarot Card Readings**: Single card, three-card spread, Celtic cross
- **Numerology**: Life Path, Destiny, Expression numbers
- **Palmistry**: Hand reading analysis
- **Nadi Astrology**: Palm leaf readings specific to India
- **Other Systems**: Kabbalistic, Mayan, Celtic, I Ching, Astrocartography, Horary

### Advanced AI Features
- **AI Twin System**: Personalized AI astrologer that learns communication style and life patterns
- **Transit Timing Engine**: Precision life planning with decision timing calculator
- **Astro-Social Network**: Chart-based matching and community wisdom platform
- **Astro-Productivity Suite**: Integration with daily life apps and decision-making tools
- **Predictive Relationship Analyzer**: Advanced compatibility with real-time matching
- **Future Self Simulator**: Long-term life timeline visualization and alternative pathway analysis

### Subscription Tiers
- **Free Tier**: Daily micro-prediction, personal birth chart visualization, 7-day transit summary
- **Essential Tier**: Daily personalized horoscope, weekly video predictions, monthly group Q&A
- **Premium Tier**: Unlimited questions to AI, priority access to human astrologers, personalized monthly reports
- **VIP Tier**: Dedicated human astrologer, quarterly life planning sessions, exclusive community access

### User Engagement Features
- **Personalized Daily/Weekly/Monthly Forecasts**
- **Relationship and Compatibility Analysis**
- **Multi-Language Support**: English, Hindi, Arabic, Malayalam, Telugu, Tamil, Kannada, Punjabi
- **Life Pattern Recognition**: AI identifies how astrological patterns manifest in actual life experiences
- **Prediction Tracking**: Users can rate how accurate predictions were for validation and build investment
- **Behavioral Adaptation**: AI learns what types of insights users value most
- **Shareable Birth Charts**: Generate beautiful, personalized kundli images to share via WhatsApp
- **Compatibility Matching**: Easy way to check astrological compatibility with friends/partners
- **Achievement System**: Badges and progression for engagement milestones
- **Community Features**: Connect with others with similar charts or life patterns

## 🚀 Quick Start

### Prerequisites
- Node.js 14+
- npm or yarn
- WhatsApp Business Account
- API keys for required services

### Railway Deployment

The bot is currently deployed on Railway with the following project configuration:

#### Current Railway Project Information
- **Project Name**: `w1`
- **Service Name**: `w1`
- **Environment**: `production`
- **Project ID**: `3f657984-40ed-4aeb-b74b-384fd8afa7a8`
- **Service ID**: `bab4b523-2de5-4213-8607-4a67d51286fa`
- **Public Domain**: `https://w1-production-a9c7.up.railway.app`
- **Private Domain**: `w1.railway.internal`

#### Quick Railway Commands
```bash
# Link to existing project (already done)
railway link --project w1

# Deploy latest changes
railway up

# View logs
railway logs

# Check environment variables
railway variables
```

#### Recent Fixes (v1.0.1 & Code Refactoring)
- ✅ **Architecture Refactoring**: Complete action classes code duplication elimination (1,338+ lines removed)
- ✅ **Container Stability**: Fixed memory leaks and restart issues
- ✅ **Health Monitoring**: Added `/health` and `/ready` endpoints
- ✅ **Memory Optimization**: Lazy-loaded astrology libraries, automatic cleanup
- ✅ **Clean Direct Infrastructure**: Zero facade patterns, direct API calls only
- ✅ **Enterprise Validation**: Unified error handling and profile validation
- ✅ **Template-Based Development**: New actions created in minutes vs hours

#### Environment Variables for Railway
All environment variables are configured in Railway dashboard including:
```bash
WHATSAPP_ACCESS_TOKEN=EAA...
WHATSAPP_PHONE_NUMBER_ID=883508911504885
WHATSAPP_APP_SECRET=fcc...
W1_SKIP_WEBHOOK_SIGNATURE=true
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
OPENAI_API_KEY=sk-...
# + all other configured variables
```

#### Monitoring Deployment
```bash
# Start monitoring (runs continuously)
npm run monitor

# Or run directly
node scripts/monitor-deployment.js
```

The monitor will:
- Check health every 30 seconds
- Alert after 3 consecutive failures
- Track container restarts
- Monitor memory usage
- Generate hourly reports

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/astro-whatsapp-bot.git
cd astro-whatsapp-bot

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your actual credentials

# Start development server
npm run dev
```

### Environment Variables
Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# WhatsApp Business API
WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_VERIFY_TOKEN=your_webhook_verification_token

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/astro-whatsapp-bot

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h

# Payment Gateways
STRIPE_SECRET_KEY=your_stripe_secret_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# External APIs
OPENAI_API_KEY=your_openai_api_key
ASTROLOGY_API_KEY=your_astrology_api_key

# Twilio (for SMS)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

### Running the Application
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 🏗️ Architecture

### Technology Stack
- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcrypt
- **Logging**: Winston for structured logging
- **Testing**: Jest for unit, integration, and end-to-end tests
- **Validation**: Joi for request validation
- **Payment Processing**: Stripe and Razorpay
- **Messaging**: Twilio and WhatsApp Business API
- **AI Services**: OpenAI API for AI Twin functionality
- **Deployment**: Docker with Kubernetes orchestration

### Core Components
1. **WhatsApp Integration Layer**: Handles all WhatsApp Business API communications
2. **User Management System**: Authentication, authorization, and profile management
3. **Astrology Engine**: Core calculation and interpretation services
4. **AI Twin System**: Personalized AI astrologer with conversational memory
5. **Payment Processing**: Subscription management and payment processing
6. **Notification System**: Push notifications, email, and SMS services
7. **Analytics Engine**: User behavior tracking and insights generation
8. **Compatibility Engine**: Relationship and compatibility analysis system

## 🧪 Testing

### Test Structure
- **Unit Tests**: Test individual functions and modules (95%+ coverage target)
- **Integration Tests**: Test interactions between different services
- **End-to-End Tests**: Test complete user flows and business processes
- **Mocking Framework**: Comprehensive mocking for external dependencies
- **Security Tests**: Vulnerability scanning and penetration testing
- **Performance Tests**: Load testing and benchmarking
- **Regression Tests**: Automated regression testing suite

### Running Tests
```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run end-to-end tests only
npm run test:e2e

# Run tests with coverage report
npm run test:coverage

# Watch mode for development
npm run test:watch
```

### WhatsApp Integration Testing

The bot includes a comprehensive WhatsApp testing suite for validating API integration:

```bash
# Validate WhatsApp access token
./whatsapp-test-suite.sh validate-token

# Send a test message
./whatsapp-test-suite.sh test-message

# Trigger bot menu response
./whatsapp-test-suite.sh trigger-menu

# Send interactive menu with buttons
./whatsapp-test-suite.sh interactive-menu

# Run all WhatsApp tests
./whatsapp-test-suite.sh all

# Show help
./whatsapp-test-suite.sh help
```

**Features:**
- Reads configuration from `.env` file (no hardcoded values)
- Validates WhatsApp access token
- Tests message sending capabilities
- Tests interactive menu functionality
- Comprehensive error handling and reporting

## 🛡️ Security

### Security Measures
- **Authentication**: JWT-based authentication with secure token handling
- **Authorization**: Role-based access control (RBAC)
- **Data Encryption**: AES-256 encryption for sensitive data
- **Input Validation**: Strict input validation and sanitization
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Configuration**: Secure CORS policy implementation
- **Security Headers**: Implementation of security headers (CSP, HSTS, etc.)
- **Dependency Scanning**: Regular security scanning of dependencies
- **Vulnerability Management**: Automated vulnerability detection and patching

## 📊 Monitoring & Observability

### Monitoring Features
- **Application Performance Monitoring**: Real-time performance metrics
- **Log Aggregation**: Centralized logging with structured logging
- **Error Tracking**: Comprehensive error tracking and alerting
- **Health Checks**: Automated health check endpoints
- **Metrics Collection**: Key performance metrics collection
- **Alerting System**: Automated alerting for critical issues
- **Dashboard**: Real-time monitoring dashboards

## 📈 Performance Optimization

### Optimization Strategies
- **Caching**: Redis-based caching for frequently accessed data
- **Database Optimization**: Proper indexing and query optimization
- **Connection Pooling**: Database connection pooling
- **Asynchronous Processing**: Background job processing with queues
- **CDN Usage**: Content delivery network for static assets
- **Compression**: Gzip compression for API responses
- **Minification**: Asset minification for web clients
- **Lazy Loading**: Lazy loading for non-critical resources

## 🔄 CI/CD Pipeline

### Pipeline Features
- **Automated Testing**: All tests run on every commit
- **Code Quality Checks**: ESLint and Prettier integration
- **Security Scanning**: Automated security vulnerability scanning
- **Deployment Automation**: Automated deployment to staging and production
- **Rollback Mechanisms**: Automated rollback on failed deployments
- **Environment Promotion**: Automated promotion between environments
- **Quality Gates**: Automated quality gates with coverage thresholds

## 📚 Documentation

### Documentation Standards
- **API Documentation**: OpenAPI/Swagger documentation for all endpoints
- **Architecture Diagrams**: System architecture and component diagrams
- **Deployment Guides**: Detailed deployment and setup guides
- **User Guides**: Comprehensive user documentation
- **Technical Design**: Low-level and high-level technical design documents
- **ADR**: Architecture Decision Records for major design choices
- **Changelog**: Detailed changelog with version history

## 📁 Project Structure

This project follows a modular and organized structure to facilitate development, testing, and maintenance. Below is an overview of the main directories:

### Root Directory
- **`README.md`**: Project overview and documentation
- **`package.json`**: Project dependencies and scripts
- **`package-lock.json`**: Locked dependency versions
- **`.env.example`**: Example environment variables configuration
- **`.gitignore`**: Files and directories to be ignored by Git
- **`.prettierrc`**: Prettier configuration for code formatting
- **`Dockerfile`**: Docker configuration for containerization
- **`docker-compose.yml`**: Docker Compose configuration for multi-container setup
- **`babel.config.js`**: Babel configuration for JavaScript transpilation
- **`jest.e2e.config.js`**: Jest configuration for end-to-end tests
- **`start.sh`**: Startup script for the application
- **`railway.json`**, **`railway-cron.json`**, **`railway.toml`**: Railway deployment configuration
- **`render-env-vars.txt`**: Render environment variables configuration
- **`sonar-project.properties`**: SonarQube analysis configuration
- **`newepics.txt`**: Feature epics roadmap
- **`RAILWAY_DEPLOYMENT_STATUS.md`**: Deployment status documentation

### Source Directory (`src/`)
The core application source code organized in a modular structure:
- **`src/server.js`**: The main entry point for the Express.js application
- **`src/config/`**: Environment-specific configurations (e.g., database.js, environment.js)
- **`src/controllers/`**: Handles incoming requests and orchestrates responses (e.g., whatsappController.js, userController.js)
- **`src/conversation/`**: Houses the modular conversation engine, flow configurations, and menu definitions (e.g., conversationEngine.js, flowConfig.json)
- **`src/models/`**: Defines data models and interacts with the database (e.g., User.js, Session.js)
- **`src/services/`**: Contains business logic and integrations with external services:
  - **`src/services/astrology/`**: Astrology-related logic and calculations (e.g., vedicCalculator.js, astrologyEngine.js)
  - **`src/services/payment/`**: Manages payment processing and subscription logic (e.g., paymentService.js)
  - **`src/services/whatsapp/`**: WhatsApp API integrations (e.g., whatsappService.js, messageProcessor.js)
- **`src/utils/`**: Provides utility functions (e.g., logger.js, errorHandler.js, inputValidator.js)

### Testing Directory (`tests/`)
Contains all automated tests for the application:
- **`tests/unit/`**: Unit tests for individual functions and modules
- **`tests/integration/`**: Integration tests for interactions between different services
- **`tests/e2e/`**: End-to-End tests for critical user flows
- **`tests/performance/`**: Performance tests and benchmarks
- **`tests/security/`**: Security tests and vulnerability assessments
- **`tests/helpers/`**: Helper functions and setup for tests
- **`tests/reports/`**: Generated test reports (coverage, HTML, JUnit)

### Documentation Directory (`docs/`)
Comprehensive project documentation:
- **`docs/README-ARCHIVED.md`**: Previously archived project documentation
- **`docs/epics-and-stories/`**: High-level epics and detailed user stories outlining major features and architectural components
- **`docs/prd/`**: Product Requirements Documents
- **`docs/ASTROLOGY_ENHANCEMENT_ROADMAP.md`**: Roadmap for astrology feature enhancements
- **`docs/PROJECT_MANDATES.md`**: Critical project requirements and mandates
- **`docs/MENU_REFERENCE.md`**: WhatsApp menu configuration reference
- **`docs/REDIS_IMPLEMENTATION_PLAN.md`**: Redis implementation planning document
- **`docs/TEST_REFACTORING_PLAN.md`**: Test refactoring planning document
- **`docs/ACTION_CLASSES_DUPLICATION_REFACTORING_PLAN.md`**: Action classes refactoring plan

### GitHub Directory (`.github/`)
- **`.github/workflows/`**: GitHub Actions CI/CD pipeline definitions

### Other Key Directories
- **`artillery/`**: Performance testing scripts and configurations
- **`ephe/`**: Ephemeris data for astronomical calculations
- **`logs/`**: Application logs storage
- **`node_modules/`**: NPM dependencies
- **`owasp-zap/`**: OWASP ZAP security scanning configurations
- **`prometheus/`**: Prometheus monitoring configurations
- **`scripts/`**: Utility scripts (e.g., deployment, setup, testing, monitoring)

## 📋 WhatsApp Development Standards

This project follows strict WhatsApp development standards to ensure consistent user experience and maintainable code. All contributors must adhere to the [WhatsApp Development Guidelines](whatsapp-development-guidelines.md) which cover:

- Message type architecture (buttons vs text messages)
- Date/time format standards (DDMMYY/DDMMYYYY and HHMM formats)
- Conversation flow patterns and state management
- Multilingual support standards (27+ languages)
- Error handling and validation requirements
- Menu configuration and API integration standards
- Testing, security, and deployment guidelines

**Please review the [WhatsApp Development Guidelines](whatsapp-development-guidelines.md) before implementing any WhatsApp-related features.**

## 🤝 Contributing

We welcome contributions from the community! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) and [WhatsApp Development Guidelines](whatsapp-development-guidelines.md) for details on our code of conduct and development standards.

### Development Guidelines
1. Fork the repository
2. Create a feature branch
3. **Review and follow [WhatsApp Development Guidelines](whatsapp-development-guidelines.md)**
4. Make your changes following established patterns
5. Write tests for your changes
6. Ensure all tests pass and standards are met
7. Submit a pull request with reference to relevant guidelines

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Thanks to all contributors who have helped build this project
- Special thanks to the open-source community for providing amazing tools and libraries
- Gratitude to the astrology community for their wisdom and insights

## 📞 Support

For support, please open an issue on our [GitHub Issues](https://github.com/your-username/astro-whatsapp-bot/issues) page or contact our team at support@astro-whatsapp-bot.com.

---

*Built with ❤️ using BMAD Methodology and AI Agents*