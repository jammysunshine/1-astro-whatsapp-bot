// tests/integration/whatsapp/astrologyButtonIntegration.test.js
// Integration tests for astrology button interactions

const request = require('supertest');
const app = require('../../../src/server');
const {
  processIncomingMessage
} = require('../../../src/services/whatsapp/messageProcessor');
const {
  validateWebhookSignature
} = require('../../../src/services/whatsapp/webhookValidator');

// Mock dependencies
jest.mock('../../../src/services/whatsapp/messageProcessor');
jest.mock('../../../src/services/whatsapp/webhookValidator');

describe('Astrology Button Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    processIncomingMessage.mockResolvedValue();
    validateWebhookSignature.mockReturnValue(true);
  });

  describe('Tarot Reading Buttons', () => {
    it('should process single card tarot reading button', async() => {
      const webhookPayload = {
        entry: [
          {
            changes: [
              {
                value: {
                  messaging_product: 'whatsapp',
                  contacts: [
                    {
                      profile: { name: 'Test User' },
                      wa_id: '1234567890'
                    }
                  ],
                  messages: [
                    {
                      from: '1234567890',
                      id: 'message-id-tarot',
                      timestamp: '1234567890',
                      type: 'interactive',
                      interactive: {
                        type: 'button_reply',
                        button_reply: {
                          id: 'btn_tarot_single',
                          title: 'Single Card'
                        }
                      }
                    }
                  ]
                }
              }
            ]
          }
        ]
      };

      const response = await request(app)
        .post('/webhook')
        .send(webhookPayload)
        .set('Content-Type', 'application/json')
        .set('x-hub-signature-256', 'sha256=test-signature')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(processIncomingMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'interactive',
          interactive: expect.objectContaining({
            button_reply: expect.objectContaining({
              id: 'btn_tarot_single'
            })
          })
        }),
        expect.any(Object)
      );
    });

    it('should process three-card spread tarot reading button', async() => {
      const webhookPayload = {
        entry: [
          {
            changes: [
              {
                value: {
                  messaging_product: 'whatsapp',
                  contacts: [
                    {
                      profile: { name: 'Test User' },
                      wa_id: '1234567890'
                    }
                  ],
                  messages: [
                    {
                      from: '1234567890',
                      id: 'message-id-tarot-3',
                      timestamp: '1234567890',
                      type: 'interactive',
                      interactive: {
                        type: 'button_reply',
                        button_reply: {
                          id: 'btn_tarot_three_card',
                          title: 'Three Card Spread'
                        }
                      }
                    }
                  ]
                }
              }
            ]
          }
        ]
      };

      const response = await request(app)
        .post('/webhook')
        .send(webhookPayload)
        .set('Content-Type', 'application/json')
        .set('x-hub-signature-256', 'sha256=test-signature')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(processIncomingMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          interactive: expect.objectContaining({
            button_reply: expect.objectContaining({
              id: 'btn_tarot_three_card'
            })
          })
        }),
        expect.any(Object)
      );
    });
  });

  describe('Palmistry Reading Buttons', () => {
    it('should process palmistry reading button', async() => {
      const webhookPayload = {
        entry: [
          {
            changes: [
              {
                value: {
                  messaging_product: 'whatsapp',
                  contacts: [
                    {
                      profile: { name: 'Test User' },
                      wa_id: '1234567890'
                    }
                  ],
                  messages: [
                    {
                      from: '1234567890',
                      id: 'message-id-palmistry',
                      timestamp: '1234567890',
                      type: 'interactive',
                      interactive: {
                        type: 'button_reply',
                        button_reply: {
                          id: 'btn_palmistry_reading',
                          title: 'Palmistry Reading'
                        }
                      }
                    }
                  ]
                }
              }
            ]
          }
        ]
      };

      const response = await request(app)
        .post('/webhook')
        .send(webhookPayload)
        .set('Content-Type', 'application/json')
        .set('x-hub-signature-256', 'sha256=test-signature')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(processIncomingMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          interactive: expect.objectContaining({
            button_reply: expect.objectContaining({
              id: 'btn_palmistry_reading'
            })
          })
        }),
        expect.any(Object)
      );
    });
  });

  describe('Nadi Astrology Buttons', () => {
    it('should process Nadi reading button', async() => {
      const webhookPayload = {
        entry: [
          {
            changes: [
              {
                value: {
                  messaging_product: 'whatsapp',
                  contacts: [
                    {
                      profile: { name: 'Test User' },
                      wa_id: '1234567890'
                    }
                  ],
                  messages: [
                    {
                      from: '1234567890',
                      id: 'message-id-nadi',
                      timestamp: '1234567890',
                      type: 'interactive',
                      interactive: {
                        type: 'button_reply',
                        button_reply: {
                          id: 'btn_nadi_reading',
                          title: 'Nadi Reading'
                        }
                      }
                    }
                  ]
                }
              }
            ]
          }
        ]
      };

      const response = await request(app)
        .post('/webhook')
        .send(webhookPayload)
        .set('Content-Type', 'application/json')
        .set('x-hub-signature-256', 'sha256=test-signature')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(processIncomingMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          interactive: expect.objectContaining({
            button_reply: expect.objectContaining({
              id: 'btn_nadi_reading'
            })
          })
        }),
        expect.any(Object)
      );
    });
  });

  describe('Compatibility Check Buttons', () => {
    it('should process compatibility check button', async() => {
      const webhookPayload = {
        entry: [
          {
            changes: [
              {
                value: {
                  messaging_product: 'whatsapp',
                  contacts: [
                    {
                      profile: { name: 'Test User' },
                      wa_id: '1234567890'
                    }
                  ],
                  messages: [
                    {
                      from: '1234567890',
                      id: 'message-id-compatibility',
                      timestamp: '1234567890',
                      type: 'interactive',
                      interactive: {
                        type: 'button_reply',
                        button_reply: {
                          id: 'btn_compatibility_check',
                          title: 'Check Compatibility'
                        }
                      }
                    }
                  ]
                }
              }
            ]
          }
        ]
      };

      const response = await request(app)
        .post('/webhook')
        .send(webhookPayload)
        .set('Content-Type', 'application/json')
        .set('x-hub-signature-256', 'sha256=test-signature')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(processIncomingMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          interactive: expect.objectContaining({
            button_reply: expect.objectContaining({
              id: 'btn_compatibility_check'
            })
          })
        }),
        expect.any(Object)
      );
    });
  });

  describe('Subscription and Payment Buttons', () => {
    it('should process subscription upgrade button', async() => {
      const webhookPayload = {
        entry: [
          {
            changes: [
              {
                value: {
                  messaging_product: 'whatsapp',
                  contacts: [
                    {
                      profile: { name: 'Test User' },
                      wa_id: '1234567890'
                    }
                  ],
                  messages: [
                    {
                      from: '1234567890',
                      id: 'message-id-subscription',
                      timestamp: '1234567890',
                      type: 'interactive',
                      interactive: {
                        type: 'button_reply',
                        button_reply: {
                          id: 'btn_upgrade_premium',
                          title: 'Upgrade to Premium'
                        }
                      }
                    }
                  ]
                }
              }
            ]
          }
        ]
      };

      const response = await request(app)
        .post('/webhook')
        .send(webhookPayload)
        .set('Content-Type', 'application/json')
        .set('x-hub-signature-256', 'sha256=test-signature')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(processIncomingMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          interactive: expect.objectContaining({
            button_reply: expect.objectContaining({
              id: 'btn_upgrade_premium'
            })
          })
        }),
        expect.any(Object)
      );
    });

    it('should process payment method selection button', async() => {
      const webhookPayload = {
        entry: [
          {
            changes: [
              {
                value: {
                  messaging_product: 'whatsapp',
                  contacts: [
                    {
                      profile: { name: 'Test User' },
                      wa_id: '1234567890'
                    }
                  ],
                  messages: [
                    {
                      from: '1234567890',
                      id: 'message-id-payment',
                      timestamp: '1234567890',
                      type: 'interactive',
                      interactive: {
                        type: 'button_reply',
                        button_reply: {
                          id: 'btn_pay_upi',
                          title: 'Pay with UPI'
                        }
                      }
                    }
                  ]
                }
              }
            ]
          }
        ]
      };

      const response = await request(app)
        .post('/webhook')
        .send(webhookPayload)
        .set('Content-Type', 'application/json')
        .set('x-hub-signature-256', 'sha256=test-signature')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(processIncomingMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          interactive: expect.objectContaining({
            button_reply: expect.objectContaining({
              id: 'btn_pay_upi'
            })
          })
        }),
        expect.any(Object)
      );
    });
  });
});
