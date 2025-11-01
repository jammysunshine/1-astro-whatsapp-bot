const BaseAction = require('../BaseAction');
const { VarshaphalService } = require('../../../../core/services');

class VarshaphalAction extends BaseAction {
  constructor() {
    super('varshaphal', {
      description: 'Annual horoscope predictions (Varshaphal)',
      parameters: ['datetime', 'latitude', 'longitude', 'year'],
      examples: ['varshaphal 2024', 'annual horoscope', 'yearly predictions']
    });
  }

  async execute(context, params = {}) {
    try {
      const { user } = context;
      const currentYear = new Date().getFullYear();

      const userData = {
        datetime: params.datetime || user.birthDatetime,
        latitude: params.latitude || user.birthLatitude,
        longitude: params.longitude || user.birthLongitude,
        year: params.year || currentYear,
        language: params.language || user.language || 'en'
      };

      const result = await VarshaphalService.calculate(userData, {
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
        header: `📅 *Annual Horoscope (Varshaphal) - ${analysis.year}*\n\n`,
        muntha: '*Muntha (Year Focus):*\n',
        tajikaYogas: '*Tajika Yogas:*\n',
        sahams: '*Significant Points (Sahams):*\n',
        patyayiniDasa: '*Annual Dasa Periods:*\n',
        interpretations: '*Interpretations:*\n',
        yearFocus: '• Year Focus: ',
        majorYogas: '• Major Yogas: ',
        significantPoints: '• Significant Points: ',
        dasaInfluence: '• Current Dasa Influence: ',
        overallAnalysis: '*Overall Analysis:*\n',
        summary: '• Summary: ',
        strengths: '• Strengths: ',
        challenges: '• Challenges: ',
        recommendations: '• Recommendations: ',
        footer: `\n\n_This annual horoscope provides insights and predictions for the year ${analysis.year} according to Varshaphal system._`
      },
      hi: {
        header: `📅 *वार्षिक कुंडली (वर्षफल) - ${analysis.year}*\n\n`,
        muntha: '*मुंथा (वर्ष केंद्र):*\n',
        tajikaYogas: '*ताजिका योग:*\n',
        sahams: '*महत्वपूर्ण बिंदु (साहम):*\n',
        patyayiniDasa: '*वार्षिक दशा अवधि:*\n',
        interpretations: '*व्याख्या:*\n',
        yearFocus: '• वर्ष केंद्र: ',
        majorYogas: '• प्रमुख योग: ',
        significantPoints: '• महत्वपूर्ण बिंदु: ',
        dasaInfluence: '• वर्तमान दशा प्रभाव: ',
        overallAnalysis: '*समग्र विश्लेषण:*\n',
        summary: '• सारांश: ',
        strengths: '• शक्तियां: ',
        challenges: '• चुनौतियां: ',
        recommendations: '• सिफारिशें: ',
        footer: `\n\n_यह वार्षिक कुंडली वर्षफल प्रणाली के अनुसार वर्ष ${analysis.year} के लिए अंतर्दृष्टि और भविष्यवाणियां प्रदान करती है।_`
      }
    };

    const t = responses[language] || responses.en;
    let response = t.header;

    // Muntha
    if (analysis.sections['Muntha (Year Focus)']) {
      response += t.muntha;
      const muntha = analysis.sections['Muntha (Year Focus)'];
      response += `• House ${muntha.house} (${muntha.sign}): ${muntha.effects}\n\n`;
    }

    // Tajika Yogas
    if (analysis.sections['Tajika Yogas'] && analysis.sections['Tajika Yogas'].length > 0) {
      response += t.tajikaYogas;
      const yogas = analysis.sections['Tajika Yogas'].slice(0, 4); // Limit to 4 major yogas
      yogas.forEach(yoga => {
        response += `• ${yoga.type}: ${yoga.planets.join(' + ')} - ${yoga.effects}\n`;
      });
      response += '\n';
    }

    // Sahams
    if (analysis.sections['Sahams (Significant Points)']) {
      response += t.sahams;
      const sahams = analysis.sections['Sahams (Significant Points)'];
      Object.entries(sahams).forEach(([name, saham]) => {
        response += `• ${name}: ${saham.effects} (${saham.sign})\n`;
      });
      response += '\n';
    }

    // Patyayini Dasa
    if (analysis.sections['Patyayini Dasa'] && analysis.sections['Patyayini Dasa'].length > 0) {
      response += t.patyayiniDasa;
      const dasaPeriods = analysis.sections['Patyayini Dasa'].slice(0, 6); // Show first 6 periods
      dasaPeriods.forEach(dasa => {
        response += `• ${dasa.planet}: Day ${dasa.startDay}-${dasa.endDay} - ${dasa.effects}\n`;
      });
      response += '\n';
    }

    // Interpretations
    if (analysis.sections['Interpretations']) {
      const interpretations = analysis.sections['Interpretations'];

      response += t.interpretations;

      if (interpretations.yearFocus) {
        response += `${t.yearFocus + interpretations.yearFocus}\n`;
      }

      if (interpretations.majorYogas) {
        response += `${t.majorYogas + interpretations.majorYogas}\n`;
      }

      if (interpretations.significantPoints) {
        response += `${t.significantPoints + interpretations.significantPoints}\n`;
      }

      if (interpretations.dasaInfluence) {
        response += `${t.dasaInfluence + interpretations.dasaInfluence}\n`;
      }

      if (interpretations.overall) {
        response += `\n${t.overallAnalysis}`;
        const { overall } = interpretations;

        if (overall.summary) {
          response += `${t.summary + overall.summary}\n`;
        }

        if (overall.strengths && overall.strengths.length > 0) {
          response += `${t.strengths + overall.strengths.join(', ')}\n`;
        }

        if (overall.challenges && overall.challenges.length > 0) {
          response += `${t.challenges + overall.challenges.join(', ')}\n`;
        }

        if (overall.recommendations && overall.recommendations.length > 0) {
          response += `${t.recommendations + overall.recommendations.slice(0, 3).join(', ')}\n`;
        }
      }
    }

    response += t.footer;

    return {
      text: response,
      type: 'varshaphal_analysis'
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

    if (params.year && (params.year < 1900 || params.year > 2100)) {
      throw new Error('Year must be between 1900 and 2100');
    }

    return true;
  }
}

module.exports = VarshaphalAction;
