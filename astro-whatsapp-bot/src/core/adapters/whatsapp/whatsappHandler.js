const logger = require('../../utils/logger');

class WhatsAppHandler {
  constructor(serviceManager) {
    this.serviceManager = serviceManager;
    this.messageProcessor = new MessageProcessor(this.serviceManager);
  }

  async handleIncomingMessage(messageData) {
    try {
      logger.info('Processing WhatsApp message:', messageData);

      const { from, body, type } = messageData;

      // Determine service based on message content
      const serviceRequest = this.messageProcessor.processMessage(body);

      if (!serviceRequest) {
        return this._handleUnknownRequest();
      }

      // Execute the requested service
      const result = await this._executeService(serviceRequest);

      return {
        success: true,
        data: result,
        request: serviceRequest
      };
    } catch (error) {
      logger.error('WhatsApp handler error:', error);
      throw error;
    }
  }

  async _executeService(request) {
    const { service, data } = request;

    const serviceInstance = this.serviceManager.getService(service);
    if (!serviceInstance) {
      throw new Error(`Service '${service}' not found`);
    }

    return await serviceInstance.execute(data);
  }

  _handleUnknownRequest() {
    return {
      success: false,
      message: 'Unknown request. Please try a valid command.',
      options: [
        'Birth chart: "chart DD/MM/YYYY HH:MM Place"',
        'Dasha analysis: "dasha DD/MM/YYYY HH:MM Place"',
        'Compatibility: "compatibility DD/MM/YYYY HH:MM Place"'
        // Add other supported commands
      ]
    };
  }
}

class MessageProcessor {
  constructor(serviceManager) {
    this.serviceManager = serviceManager;
    this.patterns = this._initializePatterns();
  }

  processMessage(message) {
    const lowerMessage = message.toLowerCase().trim();

    for (const [patternName, pattern] of Object.entries(this.patterns)) {
      const match = lowerMessage.match(pattern.regex);
      if (match) {
        const parsedData = pattern.parseFn(...match);
        if (parsedData) {
          return {
            service: pattern.service,
            data: parsedData
          };
        }
      }
    }

    return null;
  }

  _initializePatterns() {
    return {
      birthChart: {
        regex: /chart\s+(\d{2}\/\d{2}\/\d{4})\s+(\d{1,2}:\d{2})\s+(.+)/i,
        service: 'birthChartService',
        parseFn: (full, date, time, place) => ({
          birthDate: date,
          birthTime: time,
          birthPlace: place
        })
      },
      dashaAnalysis: {
        regex: /dasha\s+(\d{2}\/\d{2}\/\d{4})\s+(\d{1,2}:\d{2})\s+(.+)/i,
        service: 'vimshottariDashaService',
        parseFn: (full, date, time, place) => ({
          birthDate: date,
          birthTime: time,
          birthPlace: place
        })
      }
      // Add more patterns for other services
    };
  }
}

module.exports = WhatsAppHandler;
