// Mock implementation for messageSender
const mockSendMessage = jest.fn().mockResolvedValue({
  data: {
    messages: [{ id: 'test-message-id' }]
  },
  success: true
});

const mockSendTextMessage = jest.fn().mockResolvedValue({
  data: {
    messages: [{ id: 'test-text-message-id' }]
  },
  success: true
});

const mockSendInteractiveButtons = jest.fn().mockResolvedValue({
  data: {
    messages: [{ id: 'test-interactive-message-id' }]
  },
  success: true
});

const mockSendListMessage = jest.fn().mockResolvedValue({
  data: {
    messages: [{ id: 'test-list-message-id' }]
  },
  success: true
});

const mockSendTemplateMessage = jest.fn().mockResolvedValue({
  data: {
    messages: [{ id: 'test-template-message-id' }]
  },
  success: true
});

const mockSendMediaMessage = jest.fn().mockResolvedValue({
  data: {
    messages: [{ id: 'test-media-message-id' }]
  },
  success: true
});

const mockMarkMessageAsRead = jest.fn().mockResolvedValue({
  data: {
    success: true
  },
  success: true
});

module.exports = {
  sendMessage: mockSendMessage,
  sendTextMessage: mockSendTextMessage,
  sendInteractiveButtons: mockSendInteractiveButtons,
  sendListMessage: mockSendListMessage,
  sendTemplateMessage: mockSendTemplateMessage,
  sendMediaMessage: mockSendMediaMessage,
  markMessageAsRead: mockMarkMessageAsRead,
  mockSendMessage,
  mockSendTextMessage,
  mockSendInteractiveButtons,
  mockSendListMessage,
  mockSendTemplateMessage,
  mockSendMediaMessage,
  mockMarkMessageAsRead
};
