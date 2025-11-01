const BaseAction = require('../BaseAction');
const { JaiminiAstrologyService } = require('../../../../core/services');

class JaiminiAstrologyAction extends BaseAction {
  constructor() {
    super('jaimini_astrology', {
      description: 'Jaimini system astrology analysis',
      parameters: ['datetime', 'latitude', 'longitude'],
      examples: ['jaimini analysis', 'jaimini astrology', 'chara karakas']
    });
  }

  async execute(context, params = {}) {
    try {
      const { user } = context;
      const userData = {
        datetime: params.datetime || user.birthDatetime,
        latitude: params.latitude || user.birthLatitude,
        longitude: params.longitude || user.birthLongitude,
        language: params.language || user.language || 'en'
      };

      const result = await JaiminiAstrologyService.calculate(userData, {
        language: userData.language,
        includeDetails: params.includeDetails || false
      });

      return this.formatResponse(result, userData.language);
    } catch (error) {
      return this.handleError(error, context);
    }
  }

  formatResponse(result, language) {
    const { analysis } = result;

    const responses = {
      en: {
        header: '🔮 *Jaimini Astrology Analysis*\n\n',
        charaKarakas: '*Chara Karakas (Variable Significators):*\n',
        sthiraKarakas: '*Sthira Karakas (Fixed Significators):*\n',
        arudhaLagna: '*Arudha Lagna (Public Image):* House ',
        upapada: '*Upapada (Marriage Indicator):* House ',
        ishtaKashta: '*Ishta-Kashta (Spiritual-Material Balance):*\n',
        interpretations: '*Interpretations:*\n',
        atmaKaraka: '• Atma Karaka: ',
        overallAnalysis: '*Overall Analysis:*\n',
        strengths: '• Strengths: ',
        challenges: '• Challenges: ',
        recommendations: '• Recommendations: ',
        footer: '\n\n_This analysis provides insights into your soul\'s journey and karmic patterns according to Jaimini system._'
      },
      hi: {
        header: '🔮 *जैमिनी ज्योतिष विश्लेषण*\n\n',
        charaKarakas: '*चर कारक (परिवर्तनशील कारक):*\n',
        sthiraKarakas: '*स्थिर कारक (स्थिर कारक):*\n',
        arudhaLagna: '*आरूढ लग्न (सार्वजनिक छवि):* भाव ',
        upapada: '*उपपद (विवाह सूचक):* भाव ',
        ishtaKashta: '*इष्ट-कष्ट (आध्यात्मिक-भौतिक संतुलन):*\n',
        interpretations: '*व्याख्या:*\n',
        atmaKaraka: '• आत्मा कारक: ',
        overallAnalysis: '*समग्र विश्लेषण:*\n',
        strengths: '• शक्तियां: ',
        challenges: '• चुनौतियां: ',
        recommendations: '• सिफारिशें: ',
        footer: '\n\n_यह विश्लेषण जैमिनी प्रणाली के अनुसार आपकी आत्मा की यात्रा और कर्मिक पैटर्न में अंतर्दृष्टि प्रदान करता है।_'
      }
    };

    const t = responses[language] || responses.en;
    let response = t.header;

    // Chara Karakas
    if (analysis.sections['Chara Karakas (Variable Significators)']) {
      response += t.charaKarakas;
      const charaKarakas = analysis.sections['Chara Karakas (Variable Significators)'];
      Object.entries(charaKarakas).forEach(([karaka, planet]) => {
        response += `• ${karaka}: ${planet}\n`;
      });
      response += '\n';
    }

    // Sthira Karakas
    if (analysis.sections['Sthira Karakas (Fixed Significators)']) {
      response += t.sthiraKarakas;
      const sthiraKarakas = analysis.sections['Sthira Karakas (Fixed Significators)'];
      Object.entries(sthiraKarakas).forEach(([karaka, planet]) => {
        response += `• ${karaka}: ${planet}\n`;
      });
      response += '\n';
    }

    // Arudha Lagna
    if (analysis.sections['Arudha Lagna (Public Image)']) {
      response += `${t.arudhaLagna + analysis.sections['Arudha Lagna (Public Image)']}\n\n`;
    }

    // Upapada
    if (analysis.sections['Upapada (Marriage Indicator)']) {
      response += `${t.upapada + analysis.sections['Upapada (Marriage Indicator)']}\n\n`;
    }

    // Ishta-Kashta
    if (analysis.sections['Ishta-Kashta (Spiritual-Material Balance)']) {
      response += t.ishtaKashta;
      const ishtaKashta = analysis.sections['Ishta-Kashta (Spiritual-Material Balance)'];
      response += `• Ishta: ${ishtaKashta.ishta}\n`;
      response += `• Kashta: ${ishtaKashta.kashta}\n`;
      response += `• Balance: ${ishtaKashta.balance}\n\n`;
    }

    // Interpretations
    if (analysis.sections['Interpretations']) {
      const interpretations = analysis.sections['Interpretations'];

      if (interpretations.atmaKaraka) {
        response += `${t.atmaKaraka + interpretations.atmaKaraka}\n\n`;
      }

      if (interpretations.overall) {
        response += t.overallAnalysis;
        const { overall } = interpretations;

        if (overall.summary) {
          response += `• ${overall.summary}\n`;
        }

        if (overall.strengths && overall.strengths.length > 0) {
          response += `${t.strengths + overall.strengths.join(', ')}\n`;
        }

        if (overall.challenges && overall.challenges.length > 0) {
          response += `${t.challenges + overall.challenges.join(', ')}\n`;
        }

        if (overall.recommendations && overall.recommendations.length > 0) {
          response += `${t.recommendations + overall.recommendations.join(', ')}\n`;
        }
      }
    }

    response += t.footer;

    return {
      text: response,
      type: 'jaimini_analysis'
    };
  }

  validateParams(params) {
    const required = ['datetime', 'latitude', 'longitude'];
    const missing = required.filter(param => !params[param]);

    if (missing.length > 0) {
      throw new Error(`Missing required parameters: ${missing.join(', ')}`);
    }

    if (params.latitude < -90 || params.latitude > 90) {
      throw new Error('Latitude must be between -90 and 90 degrees');
    }

    if (params.longitude < -180 || params.longitude > 180) {
      throw new Error('Longitude must be between -180 and 180 degrees');
    }

    return true;
  }
}

module.exports = JaiminiAstrologyAction;
