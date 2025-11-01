const BaseAction = require('../BaseAction');
const { GocharService } = require('../../../../core/services');

class GocharAction extends BaseAction {
  constructor() {
    super('gochar', {
      description: 'Planetary transit analysis (Gochar)',
      parameters: ['datetime', 'latitude', 'longitude', 'birthDatetime', 'birthLatitude', 'birthLongitude'],
      examples: ['gochar analysis', 'current transits', 'planetary transits']
    });
  }

  async execute(context, params = {}) {
    try {
      const { user } = context;
      const userData = {
        datetime: params.datetime || new Date().toISOString(),
        latitude: params.latitude || user.latitude,
        longitude: params.longitude || user.longitude,
        birthDatetime: params.birthDatetime || user.birthDatetime,
        birthLatitude: params.birthLatitude || user.birthLatitude,
        birthLongitude: params.birthLongitude || user.birthLongitude,
        language: params.language || user.language || 'en'
      };

      const result = await GocharService.calculate(userData, {
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
        header: '🌍 *Planetary Transit Analysis (Gochar)*\n\n',
        transitAspects: '*Active Transit Aspects:*\n',
        houseTransits: '*House Transits:*\n',
        retrogradeEffects: '*Retrograde Effects:*\n',
        majorPeriods: '*Major Transit Periods:*\n',
        interpretations: '*Interpretations:*\n',
        majorInfluences: '• Major Influences: ',
        timing: '• Timing Analysis: ',
        recommendations: '• Recommendations: ',
        overallAnalysis: '*Overall Analysis:*\n',
        summary: '• Summary: ',
        intensity: '• Intensity: ',
        keyThemes: '• Key Themes: ',
        footer: '\n\n_This transit analysis provides insights into current planetary influences and timing._'
      },
      hi: {
        header: '🌍 *ग्रह गोचर विश्लेषण*\n\n',
        transitAspects: '*सक्रिय गोचर पहलू:*\n',
        houseTransits: '*भाव गोचर:*\n',
        retrogradeEffects: '*वक्री प्रभाव:*\n',
        majorPeriods: '*प्रमुख गोचर अवधि:*\n',
        interpretations: '*व्याख्या:*\n',
        majorInfluences: '• प्रमुख प्रभाव: ',
        timing: '• समय विश्लेषण: ',
        recommendations: '• सिफारिशें: ',
        overallAnalysis: '*समग्र विश्लेषण:*\n',
        summary: '• सारांश: ',
        intensity: '• तीव्रता: ',
        keyThemes: '• मुख्य विषय: ',
        footer: '\n\n_यह गोचर विश्लेषण वर्तमान ग्रहीय प्रभावों और समय पर अंतर्दृष्टि प्रदान करता है।_'
      }
    };

    const t = responses[language] || responses.en;
    let response = t.header;

    // Transit Aspects
    if (analysis.sections['Transit Aspects'] && analysis.sections['Transit Aspects'].length > 0) {
      response += t.transitAspects;
      const aspects = analysis.sections['Transit Aspects'].slice(0, 5); // Limit to 5 most significant
      aspects.forEach(aspect => {
        response += `• ${aspect.transitPlanet} ${aspect.aspect} ${aspect.natalPlanet} (${aspect.strength.toFixed(0)}%)\n`;
      });
      response += '\n';
    }

    // House Transits
    if (analysis.sections['House Transits'] && analysis.sections['House Transits'].length > 0) {
      response += t.houseTransits;
      const houseTransits = analysis.sections['House Transits'].slice(0, 6); // Limit to 6 key transits
      houseTransits.forEach(transit => {
        response += `• ${transit.planet} in House ${transit.house} (${transit.sign})\n`;
      });
      response += '\n';
    }

    // Retrograde Effects
    if (analysis.sections['Retrograde Effects'] && analysis.sections['Retrograde Effects'].length > 0) {
      response += t.retrogradeEffects;
      const retrogrades = analysis.sections['Retrograde Effects'];
      retrogrades.forEach(retrograde => {
        response += `• ${retrograde.planet}: ${retrograde.effects}\n`;
      });
      response += '\n';
    }

    // Major Periods
    if (analysis.sections['Major Transit Periods'] && analysis.sections['Major Transit Periods'].length > 0) {
      response += t.majorPeriods;
      const periods = analysis.sections['Major Transit Periods'];
      periods.forEach(period => {
        response += `• ${period.type}: ${period.significance}\n`;
      });
      response += '\n';
    }

    // Interpretations
    if (analysis.sections['Interpretations']) {
      const interpretations = analysis.sections['Interpretations'];

      response += t.interpretations;

      if (interpretations.majorInfluences && interpretations.majorInfluences.length > 0) {
        response += `${t.majorInfluences + interpretations.majorInfluences.slice(0, 3).join(', ')}\n`;
      }

      if (interpretations.timing) {
        const { timing } = interpretations;
        let timingText = '';
        if (timing.favorable) { timingText = 'Favorable period for new initiatives'; } else if (timing.challenges) { timingText = 'Challenging period requiring patience'; } else { timingText = 'Balanced period with mixed influences'; }
        response += `${t.timing + timingText}\n`;
      }

      if (interpretations.recommendations && interpretations.recommendations.length > 0) {
        response += `${t.recommendations + interpretations.recommendations.slice(0, 2).join(', ')}\n`;
      }

      if (interpretations.overall) {
        response += `\n${t.overallAnalysis}`;
        const { overall } = interpretations;

        if (overall.summary) {
          response += `${t.summary + overall.summary}\n`;
        }

        if (overall.intensity) {
          response += `${t.intensity + overall.intensity}\n`;
        }

        if (overall.keyThemes && overall.keyThemes.length > 0) {
          response += `${t.keyThemes + overall.keyThemes.join(', ')}\n`;
        }
      }
    }

    response += t.footer;

    return {
      text: response,
      type: 'gochar_analysis'
    };
  }

  validateParams(params) {
    const required = ['datetime', 'latitude', 'longitude', 'birthDatetime', 'birthLatitude', 'birthLongitude'];
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

    if (params.birthLatitude < -90 || params.birthLatitude > 90) {
      throw new Error('Birth latitude must be between -90 and 90 degrees');
    }

    if (params.birthLongitude < -180 || params.birthLongitude > 180) {
      throw new Error('Birth longitude must be between -180 and 180 degrees');
    }

    return true;
  }
}

module.exports = GocharAction;
