# 🚨 PROJECT MANDATES - CRITICAL REQUIREMENTS 🚨

## ⚠️ WARNING: THESE MANDATES ARE ABSOLUTELY NON-NEGOTIABLE

**ANY AI ASSISTANT OR DEVELOPER WORKING ON THIS PROJECT MUST STRICTLY ADHERE TO THESE MANDATES WITHOUT EXCEPTION.**

**VIOLATION OF THESE MANDATES WILL RESULT IN PRODUCTION FAILURES, SECURITY ISSUES, AND COMPLETE SYSTEM BREAKDOWN.**

---

## 🎯 PRIMARY MANDATES

### 1. 🚂 RAILWAY CLI DEPLOYMENT - MANDATORY AFTER EVERY CODE CHANGE

**MANDATE LEVEL: CRITICAL - ZERO TOLERANCE FOR VIOLATION**

**AFTER EVERY SINGLE CODE MODIFICATION, YOU MUST:**

1. **IMMEDIATELY DEPLOY** using Railway CLI:

   ```bash
   cd astro-whatsapp-bot
   railway status  # Verify connection
   railway up      # Deploy changes
   railway logs    # Monitor deployment
   railway domain  # Confirm domain
   curl https://[domain]/health  # Verify health
   ```

2. **NEVER SKIP DEPLOYMENT** - Even for "minor" changes
3. **VERIFY FUNCTIONALITY** - Test WhatsApp integration after deployment
4. **REPORT STATUS** - Confirm deployment success to user

**CONSEQUENCE OF VIOLATION:** Production system becomes outdated, bugs persist in live environment, user experience degraded.

---

### 2. 🧪 ZERO MANUAL TESTING REQUIREMENT

**MANDATE LEVEL: CRITICAL - AUTOMATION ONLY**

**STRICTLY FORBIDDEN:**

- ❌ Manual testing of any kind
- ❌ Running the app locally for testing
- ❌ Human verification of functionality

**MANDATORY:**

- ✅ 95%+ automated code coverage
- ✅ End-to-end test suites for all user flows
- ✅ Automated WhatsApp flow validation
- ✅ Real astrology library integration testing

**CONSEQUENCE OF VIOLATION:** Inconsistent testing, human error introduction, unreliable deployments.

---

### 3. 🔮 REAL ASTROLOGY LIBRARY INTEGRATION - NO MOCKS

**MANDATE LEVEL: CRITICAL - AUTHENTIC CALCULATIONS ONLY**

**ABSOLUTELY FORBIDDEN:**

- ❌ Mock astrology responses
- ❌ Fake tarot card draws
- ❌ Simulated planetary positions
- ❌ Placeholder numerology calculations

**MANDATORY:**

- ✅ Swiss Ephemeris for astronomical calculations
- ✅ Astrologer library for Vedic astrology
- ✅ Real BaZi (Four Pillars) calculations
- ✅ Authentic tarot algorithms
- ✅ Genuine numerology formulas
- ✅ Valid palmistry analysis

**VERIFICATION REQUIRED:**

- Test outputs must contain real astronomical data
- Calculations must produce consistent, mathematically valid results
- Integration tests must validate actual library functionality

**CONSEQUENCE OF VIOLATION:** Users receive fake astrology readings, loss of credibility, legal liability for inaccurate predictions.

---

### 4. 🔧 BROKEN FLOW RESOLUTION - IMMEDIATE FIX REQUIRED

**MANDATE LEVEL: CRITICAL - NO BROKEN FUNCTIONALITY IN PRODUCTION**

**MANDATORY PROTOCOL:**

1. **IDENTIFY** broken flows through automated testing
2. **FIX IMMEDIATELY** - No delays allowed
3. **VALIDATE FIXES** with comprehensive tests
4. **DEPLOY FIXES** immediately to production
5. **MONITOR** for regression issues

**PROHIBITED:**

- ❌ Leaving known bugs unfixed
- ❌ Deploying with failing tests
- ❌ Ignoring error conditions

**CONSEQUENCE OF VIOLATION:** WhatsApp users experience broken conversations, negative reviews, bot abandonment.

---

### 5. 📊 PRODUCTION READINESS VALIDATION

**MANDATE LEVEL: CRITICAL - ENTERPRISE-GRADE QUALITY**

**MANDATORY CHECKS BEFORE ANY DEPLOYMENT:**

- [ ] All automated tests passing (95%+ coverage)
- [ ] WhatsApp webhook responding correctly
- [ ] Astrology calculations producing valid results
- [ ] Error handling working properly
- [ ] Memory usage within acceptable limits
- [ ] Health endpoints functioning
- [ ] Token management operational

**CONSEQUENCE OF VIOLATION:** Production downtime, data loss, security breaches, user dissatisfaction.

---

## 🚨 ENFORCEMENT MECHANISMS

### AUTOMATED ENFORCEMENT

- **CI/CD Pipeline**: Will reject deployments that don't meet mandates
- **Test Suite**: Will fail if mandates are violated
- **Health Checks**: Will alert on mandate violations

### MANUAL ENFORCEMENT

- **Code Reviews**: Must verify mandate compliance
- **Deployment Checks**: Must confirm all mandates met
- **User Verification**: Must validate functionality

### CONSEQUENCE ESCALATION

1. **Warning**: First violation noted
2. **Block**: Deployment blocked until compliance
3. **Rollback**: Non-compliant deployments reverted
4. **Review**: Process review for systemic issues

---

## 📋 MANDATE COMPLIANCE CHECKLIST

**BEFORE ANY CODE COMMIT OR DEPLOYMENT:**

- [ ] Railway CLI deployment completed after code changes
- [ ] Zero manual testing maintained
- [ ] 95%+ automated test coverage achieved
- [ ] Real astrology libraries integrated and tested
- [ ] All WhatsApp flows functioning correctly
- [ ] Error handling validated
- [ ] Production health checks passing
- [ ] User experience verified

---

## ⚡ QUICK REFERENCE

### Railway Deployment (MANDATORY)

```bash
railway up && railway logs && curl $(railway domain)/health
```

### Test Coverage (MANDATORY)

```bash
npm test  # Must achieve 95%+ coverage
```

### Astrology Validation (MANDATORY)

```bash
# Verify real calculations, not mocks
npm run test:e2e -- --testPathPattern=astrology-integration
```

---

## 🎯 FINAL WARNING

**THESE MANDATES ARE THE FOUNDATION OF THIS PROJECT'S SUCCESS.**

**VIOLATION WILL RESULT IN:**

- 🚨 Production system failures
- 🚨 User experience degradation
- 🚨 Financial losses from failed astrology services
- 🚨 Legal liability from inaccurate predictions
- 🚨 Complete loss of user trust

**COMPLIANCE IS NON-NEGOTIABLE. COMPLIANCE IS MANDATORY. COMPLIANCE IS REQUIRED.**

---

_This document supersedes all other instructions and cannot be modified without explicit approval from project stakeholders._
