// tests/unit/models/Session.test.js
// Unit tests for Session model

const Session = require('../../../src/models/Session');
const mongoose = require('mongoose');

describe('Session Model', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Session.deleteMany({});
  });

  describe('Session Creation', () => {
    it('should create a new session with valid data', async () => {
      const sessionData = {
        sessionId: 'session-123',
        phoneNumber: '+1234567890',
        currentFlow: 'onboarding',
        flowData: { step: 1 },
        lastActivity: new Date(),
      };

      const session = new Session(sessionData);
      const savedSession = await session.save();

      expect(savedSession.phoneNumber).toBe(sessionData.phoneNumber);
      expect(savedSession.currentFlow).toBe('onboarding');
    });
  });

  describe('Session Queries', () => {
    it('should find session by phone number', async () => {
      const sessionData = {
        sessionId: 'session-123',
        phoneNumber: '+1234567890',
        currentFlow: 'onboarding',
        flowData: { step: 1 },
        lastActivity: new Date(),
      };

      await new Session(sessionData).save();

      const foundSession = await Session.findOne({ phoneNumber: '+1234567890' });

      expect(foundSession).toBeTruthy();
      expect(foundSession.currentFlow).toBe('onboarding');
    });

    it('should update session flow data', async () => {
      const sessionData = {
        sessionId: 'session-456',
        phoneNumber: '+1234567890',
        currentFlow: 'onboarding',
        flowData: { step: 1 },
        lastActivity: new Date(),
      };

      const session = await new Session(sessionData).save();

      session.flowData.step = 2;
      session.markModified('flowData');
      await session.save();

      const updatedSession = await Session.findById(session._id);
      expect(updatedSession.flowData.step).toBe(2);
    });
  });
});