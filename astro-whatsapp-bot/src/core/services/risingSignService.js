const ServiceTemplate = require('../ServiceTemplate');
const logger = require('../../../utils/logger');
const {
  validateCoordinates,
  validateDateTime
} = require('../../../utils/validation');

/**
 * RisingSignService - Service for Rising sign (Ascendant) calculation and interpretation
 *
 * Calculates the ascendant (rising sign) based on precise birth time and location,
 * determining the zodiac sign that was rising on the eastern horizon at birth.
 */
class RisingSignService extends ServiceTemplate {
  constructor() {
    super('ChartGenerator'); // Primary calculator for this service
    this.serviceName = 'RisingSignService';
    this.calculatorPath =
      '../../../services/astrology/vedic/calculators/SignCalculator';
    logger.info('RisingSignService initialized');
  }

  /**
   * Main entry point for executing Rising sign calculation and analysis.
   * @param {Object} birthData - Birth data for Rising sign calculation.
   * @param {Object} [options] - Calculation options.
   * @returns {Promise<Object>} Rising sign analysis result.
   */
  async processCalculation(birthData, options = {}) {
    try {
      this._validateInput(birthData);

      const { birthDate, birthTime, birthPlace } = birthData;
      const chartType = options.chartType || 'sidereal';

      // Calculate Rising sign using the dynamically loaded calculator
      const risingSignData = await this.calculator.calculateRisingSign(
        birthDate,
        birthTime,
        birthPlace,
        chartType
      );

      // Generate additional analysis
      const risingSignTraits = this._getRisingSignTraits(risingSignData.sign);
      const physicalAppearance = this._analyzePhysicalAppearance(
        risingSignData.sign
      );
      const firstImpressions = this._assessFirstImpressions(
        risingSignData.sign
      );
      const lifeApproach = this._determineLifeApproach(risingSignData.sign);
      const healthTendencies = this._identifyHealthTendencies(
        risingSignData.sign
      );

      return {
        risingSignData,
        risingSignTraits,
        physicalAppearance,
        firstImpressions,
        lifeApproach,
        healthTendencies,
        chartType,
        interpretation: this._createRisingSignInterpretation(
          risingSignData,
          risingSignTraits,
          firstImpressions
        )
      };
    } catch (error) {
      logger.error('RisingSignService processCalculation error:', error);
      throw new Error(`Rising sign calculation failed: ${error.message}`);
    }
  }

  /**
   * Get zodiac sign from longitude.
   * @param {number} longitude - Longitude in degrees.
   * @returns {string} Zodiac sign.
   * @private
   */
  _getSignFromLongitude(longitude) {
    const signs = [
      'Aries',
      'Taurus',
      'Gemini',
      'Cancer',
      'Leo',
      'Virgo',
      'Libra',
      'Scorpio',
      'Sagittarius',
      'Capricorn',
      'Aquarius',
      'Pisces'
    ];
    const signIndex = Math.floor(longitude / 30) % 12;
    return signs[signIndex];
  }

  /**
   * Get Rising sign personality traits and characteristics.
   * @param {string} risingSign - Rising sign name.
   * @returns {Object} Rising sign traits.
   * @private
   */
  _getRisingSignTraits(risingSign) {
    const traits = {
      Aries: {
        mask: 'Confident and assertive',
        behavior: 'Direct and action-oriented',
        socialStyle: 'Bold and competitive',
        defenseMechanism: 'Confrontation and direct action',
        naturalApproach: 'Pioneering and independent',
        leadershipStyle: 'Dynamic and decisive',
        communication: 'Straightforward and honest'
      },
      Taurus: {
        mask: 'Reliable and sensual',
        behavior: 'Steady and patient',
        socialStyle: 'Warm and dependable',
        defenseMechanism: 'Stubborn resistance to change',
        naturalApproach: 'Practical and sensual',
        leadershipStyle: 'Steady and supportive',
        communication: 'Calm and reassuring'
      },
      Gemini: {
        mask: 'Versatile and communicative',
        behavior: 'Adaptable and curious',
        socialStyle: 'Friendly and engaging',
        defenseMechanism: 'Mental distraction and humor',
        naturalApproach: 'Intellectual and social',
        leadershipStyle: 'Innovative and communicative',
        communication: 'Witty and informative'
      },
      Cancer: {
        mask: 'Nurturing and sensitive',
        behavior: 'Protective and intuitive',
        socialStyle: 'Caring and empathetic',
        defenseMechanism: 'Emotional withdrawal',
        naturalApproach: 'Emotional and familial',
        leadershipStyle: 'Supportive and intuitive',
        communication: 'Gentle and understanding'
      },
      Leo: {
        mask: 'Charismatic and proud',
        behavior: 'Dramatic and generous',
        socialStyle: 'Warm and attention-seeking',
        defenseMechanism: 'Pride and self-expression',
        naturalApproach: 'Creative and confident',
        leadershipStyle: 'Inspiring and charismatic',
        communication: 'Expressive and enthusiastic'
      },
      Virgo: {
        mask: 'Helpful and analytical',
        behavior: 'Practical and detail-oriented',
        socialStyle: 'Modest and service-oriented',
        defenseMechanism: 'Critical analysis',
        naturalApproach: 'Methodical and health-conscious',
        leadershipStyle: 'Efficient and detail-focused',
        communication: 'Precise and helpful'
      },
      Libra: {
        mask: 'Diplomatic and charming',
        behavior: 'Balanced and fair-minded',
        socialStyle: 'Gracious and cooperative',
        defenseMechanism: 'Avoiding conflict',
        naturalApproach: 'Harmonious and aesthetic',
        leadershipStyle: 'Diplomatic and inclusive',
        communication: 'Polite and considerate'
      },
      Scorpio: {
        mask: 'Intense and mysterious',
        behavior: 'Deep and transformative',
        socialStyle: 'Magnetic and private',
        defenseMechanism: 'Emotional intensity',
        naturalApproach: 'Powerful and investigative',
        leadershipStyle: 'Transformative and intense',
        communication: 'Penetrating and direct'
      },
      Sagittarius: {
        mask: 'Optimistic and adventurous',
        behavior: 'Freedom-loving and philosophical',
        socialStyle: 'Enthusiastic and open',
        defenseMechanism: 'Humor and deflection',
        naturalApproach: 'Expansive and truth-seeking',
        leadershipStyle: 'Visionary and inspirational',
        communication: 'Honest and philosophical'
      },
      Capricorn: {
        mask: 'Responsible and ambitious',
        behavior: 'Disciplined and structured',
        socialStyle: 'Serious and professional',
        defenseMechanism: 'Emotional control',
        naturalApproach: 'Practical and goal-oriented',
        leadershipStyle: 'Structured and responsible',
        communication: 'Serious and authoritative'
      },
      Aquarius: {
        mask: 'Independent and humanitarian',
        behavior: 'Progressive and unconventional',
        socialStyle: 'Friendly and detached',
        defenseMechanism: 'Intellectual distance',
        naturalApproach: 'Innovative and community-focused',
        leadershipStyle: 'Visionary and egalitarian',
        communication: 'Original and intellectual'
      },
      Pisces: {
        mask: 'Compassionate and dreamy',
        behavior: 'Gentle and imaginative',
        socialStyle: 'Kind and elusive',
        defenseMechanism: 'Fantasy and escape',
        naturalApproach: 'Spiritual and creative',
        leadershipStyle: 'Inspirational and compassionate',
        communication: 'Gentle and intuitive'
      }
    };
    return (
      traits[risingSign] || {
        mask: 'Unique personal presentation',
        behavior: 'Individual behavioral patterns',
        socialStyle: 'Personal social approach',
        defenseMechanism: 'Personal coping strategies',
        naturalApproach: 'Individual life approach',
        leadershipStyle: 'Personal leadership qualities',
        communication: 'Unique communication style'
      }
    );
  }

  /**
   * Analyzes physical appearance tendencies.
   * @param {string} risingSign - Rising sign.
   * @returns {Object} Physical appearance analysis.
   * @private
   */
  _analyzePhysicalAppearance(risingSign) {
    const appearances = {
      Aries: {
        build: 'Athletic and muscular',
        features: 'Strong facial features, direct gaze',
        energy: 'Dynamic and active presence',
        style: 'Bold and sporty clothing'
      },
      Taurus: {
        build: 'Solid and sturdy',
        features: 'Full features, sensual mouth, steady eyes',
        energy: 'Grounded and calm presence',
        style: 'Comfortable and high-quality clothing'
      },
      Gemini: {
        build: 'Slim and agile',
        features: 'Expressive eyes, quick smile, youthful appearance',
        energy: 'Restless and animated presence',
        style: 'Versatile and trendy clothing'
      },
      Cancer: {
        build: 'Soft and rounded',
        features: 'Large eyes, sensitive mouth, nurturing expression',
        energy: 'Gentle and approachable presence',
        style: 'Comfortable and homey clothing'
      },
      Leo: {
        build: 'Strong and dignified',
        features: 'Commanding presence, warm smile, thick hair',
        energy: 'Radiant and confident presence',
        style: 'Dramatic and eye-catching clothing'
      },
      Virgo: {
        build: 'Neat and proportional',
        features: 'Clear eyes, modest expression, tidy appearance',
        energy: 'Refined and helpful presence',
        style: 'Practical and well-groomed clothing'
      },
      Libra: {
        build: 'Graceful and balanced',
        features: 'Symmetrical features, charming smile, elegant bearing',
        energy: 'Harmonious and diplomatic presence',
        style: 'Elegant and balanced clothing'
      },
      Scorpio: {
        build: 'Intense and magnetic',
        features: 'Penetrating eyes, strong features, mysterious aura',
        energy: 'Powerful and intense presence',
        style: 'Striking and transformative clothing'
      },
      Sagittarius: {
        build: 'Tall and athletic',
        features: 'Open expression, enthusiastic eyes, adventurous look',
        energy: 'Expansive and optimistic presence',
        style: 'Casual and adventurous clothing'
      },
      Capricorn: {
        build: 'Structured and disciplined',
        features:
          'Serious expression, strong bone structure, reserved demeanor',
        energy: 'Responsible and mature presence',
        style: 'Professional and classic clothing'
      },
      Aquarius: {
        build: 'Unique and unconventional',
        features: 'Alert eyes, independent expression, distinctive features',
        energy: 'Innovative and detached presence',
        style: 'Individualistic and progressive clothing'
      },
      Pisces: {
        build: 'Soft and ethereal',
        features: 'Dreamy eyes, gentle features, compassionate expression',
        energy: 'Gentle and spiritual presence',
        style: 'Flowing and artistic clothing'
      }
    };
    return (
      appearances[risingSign] || {
        build: 'Unique physical characteristics',
        features: 'Individual facial features',
        energy: 'Personal energetic presence',
        style: 'Individual fashion preferences'
      }
    );
  }

  /**
   * Assesses first impressions and social mask.
   * @param {string} risingSign - Rising sign.
   * @returns {Object} First impressions analysis.
   * @private
   */
  _assessFirstImpressions(risingSign) {
    const impressions = {
      Aries: {
        firstImpression: 'Confident and energetic',
        socialMask: 'Bold and assertive personality',
        initialApproach: 'Direct and enthusiastic',
        underlyingTruth: 'Needs to prove capability and courage'
      },
      Taurus: {
        firstImpression: 'Reliable and sensual',
        socialMask: 'Steady and trustworthy presence',
        initialApproach: 'Calm and reassuring',
        underlyingTruth: 'Values stability and material security'
      },
      Gemini: {
        firstImpression: 'Friendly and communicative',
        socialMask: 'Versatile and engaging personality',
        initialApproach: 'Curious and conversational',
        underlyingTruth: 'Needs mental stimulation and variety'
      },
      Cancer: {
        firstImpression: 'Kind and approachable',
        socialMask: 'Nurturing and sensitive nature',
        initialApproach: 'Gentle and caring',
        underlyingTruth: 'Protects emotional vulnerability'
      },
      Leo: {
        firstImpression: 'Charismatic and warm',
        socialMask: 'Confident and generous personality',
        initialApproach: 'Enthusiastic and expressive',
        underlyingTruth: 'Needs recognition and appreciation'
      },
      Virgo: {
        firstImpression: 'Helpful and competent',
        socialMask: 'Practical and detail-oriented nature',
        initialApproach: 'Modest and service-oriented',
        underlyingTruth: 'Values precision and usefulness'
      },
      Libra: {
        firstImpression: 'Charming and diplomatic',
        socialMask: 'Harmonious and fair-minded personality',
        initialApproach: 'Gracious and balanced',
        underlyingTruth: 'Seeks peace and aesthetic beauty'
      },
      Scorpio: {
        firstImpression: 'Intense and magnetic',
        socialMask: 'Powerful and mysterious presence',
        initialApproach: 'Penetrating and direct',
        underlyingTruth: 'Guards deep emotional intensity'
      },
      Sagittarius: {
        firstImpression: 'Optimistic and open',
        socialMask: 'Adventurous and philosophical nature',
        initialApproach: 'Enthusiastic and expansive',
        underlyingTruth: 'Values freedom and exploration'
      },
      Capricorn: {
        firstImpression: 'Responsible and mature',
        socialMask: 'Disciplined and professional presence',
        initialApproach: 'Serious and structured',
        underlyingTruth: 'Builds security through achievement'
      },
      Aquarius: {
        firstImpression: 'Independent and unique',
        socialMask: 'Progressive and humanitarian personality',
        initialApproach: 'Friendly and detached',
        underlyingTruth: 'Values intellectual freedom'
      },
      Pisces: {
        firstImpression: 'Gentle and compassionate',
        socialMask: 'Dreamy and spiritual nature',
        initialApproach: 'Kind and intuitive',
        underlyingTruth: 'Connects through empathy and imagination'
      }
    };
    return (
      impressions[risingSign] || {
        firstImpression: 'Unique initial presentation',
        socialMask: 'Individual social persona',
        initialApproach: 'Personal approach to others',
        underlyingTruth: 'Core motivation and needs'
      }
    );
  }

  /**
   * Determines life approach and orientation.
   * @param {string} risingSign - Rising sign.
   * @returns {Object} Life approach analysis.
   * @private
   */
  _determineLifeApproach(risingSign) {
    const approaches = {
      Aries: {
        lifeOrientation: 'Action and achievement focused',
        decisionMaking: 'Quick and decisive',
        problemSolving: 'Direct confrontation',
        goalOrientation: 'Short-term objectives with immediate results'
      },
      Taurus: {
        lifeOrientation: 'Stability and comfort focused',
        decisionMaking: 'Careful and practical',
        problemSolving: 'Steady persistence',
        goalOrientation: 'Long-term security and material success'
      },
      Gemini: {
        lifeOrientation: 'Communication and learning focused',
        decisionMaking: 'Flexible and adaptable',
        problemSolving: 'Mental analysis and discussion',
        goalOrientation: 'Multiple interests and intellectual growth'
      },
      Cancer: {
        lifeOrientation: 'Emotional security and family focused',
        decisionMaking: 'Intuitive and feeling-based',
        problemSolving: 'Emotional support and nurturing',
        goalOrientation: 'Creating safe emotional foundations'
      },
      Leo: {
        lifeOrientation: 'Self-expression and creativity focused',
        decisionMaking: 'Confident and dramatic',
        problemSolving: 'Creative solutions and leadership',
        goalOrientation: 'Personal recognition and creative fulfillment'
      },
      Virgo: {
        lifeOrientation: 'Service and improvement focused',
        decisionMaking: 'Analytical and practical',
        problemSolving: 'Detailed analysis and helpful action',
        goalOrientation: 'Perfection through service and organization'
      },
      Libra: {
        lifeOrientation: 'Harmony and relationships focused',
        decisionMaking: 'Balanced and diplomatic',
        problemSolving: 'Mediation and compromise',
        goalOrientation: 'Creating beauty and balanced partnerships'
      },
      Scorpio: {
        lifeOrientation: 'Transformation and depth focused',
        decisionMaking: 'Intense and thorough',
        problemSolving: 'Deep investigation and powerful action',
        goalOrientation: 'Personal transformation and profound change'
      },
      Sagittarius: {
        lifeOrientation: 'Exploration and truth focused',
        decisionMaking: 'Optimistic and philosophical',
        problemSolving: 'Broad perspective and adventure',
        goalOrientation: 'Personal freedom and expansive experiences'
      },
      Capricorn: {
        lifeOrientation: 'Achievement and structure focused',
        decisionMaking: 'Practical and long-term',
        problemSolving: 'Systematic planning and discipline',
        goalOrientation: 'Career success and lasting accomplishments'
      },
      Aquarius: {
        lifeOrientation: 'Innovation and community focused',
        decisionMaking: 'Progressive and independent',
        problemSolving: 'Creative innovation and group solutions',
        goalOrientation: 'Humanitarian contribution and progressive change'
      },
      Pisces: {
        lifeOrientation: 'Compassion and spirituality focused',
        decisionMaking: 'Intuitive and compassionate',
        problemSolving: 'Empathetic understanding and creative solutions',
        goalOrientation: 'Spiritual growth and helping others'
      }
    };
    return (
      approaches[risingSign] || {
        lifeOrientation: 'Personal life focus',
        decisionMaking: 'Individual decision style',
        problemSolving: 'Personal problem-solving approach',
        goalOrientation: 'Unique goal orientation'
      }
    );
  }

  /**
   * Identifies health tendencies and constitution.
   * @param {string} risingSign - Rising sign.
   * @returns {Object} Health tendencies analysis.
   * @private
   */
  _identifyHealthTendencies(risingSign) {
    const tendencies = {
      Aries: {
        constitution: 'Athletic and energetic',
        strengths: 'Strong vitality and quick recovery',
        vulnerabilities: 'Head, eyes, accidents from impulsiveness',
        approach: 'Physical activity and stress management'
      },
      Taurus: {
        constitution: 'Strong and stable',
        strengths: 'Good endurance and sensual appreciation',
        vulnerabilities: 'Throat, neck, overindulgence in pleasures',
        approach: 'Regular routine and sensual balance'
      },
      Gemini: {
        constitution: 'Agile and adaptable',
        strengths: 'Quick mental processing and versatility',
        vulnerabilities: 'Nervous system, lungs, respiratory issues',
        approach: 'Mental relaxation and respiratory health'
      },
      Cancer: {
        constitution: 'Nurturing and sensitive',
        strengths: 'Strong intuition and emotional resilience',
        vulnerabilities: 'Stomach, breasts, emotional eating',
        approach: 'Emotional balance and digestive health'
      },
      Leo: {
        constitution: 'Dramatic and vital',
        strengths: 'Strong heart and creative energy',
        vulnerabilities: 'Heart, back, pride-related stress',
        approach: 'Cardiovascular health and self-expression'
      },
      Virgo: {
        constitution: 'Analytical and precise',
        strengths: 'Detail orientation and practical health habits',
        vulnerabilities: 'Digestive system, anxiety, perfectionism',
        approach: 'Digestive health and stress management'
      },
      Libra: {
        constitution: 'Balanced and aesthetic',
        strengths: 'Natural harmony and beauty appreciation',
        vulnerabilities: 'Kidneys, lower back, indecision stress',
        approach: 'Balance maintenance and kidney health'
      },
      Scorpio: {
        constitution: 'Intense and regenerative',
        strengths: 'Powerful healing ability and emotional depth',
        vulnerabilities: 'Reproductive system, intense emotions',
        approach: 'Emotional processing and regenerative practices'
      },
      Sagittarius: {
        constitution: 'Adventurous and optimistic',
        strengths: 'Good mobility and philosophical outlook',
        vulnerabilities: 'Liver, hips, over-optimism',
        approach: 'Liver health and balanced activity'
      },
      Capricorn: {
        constitution: 'Disciplined and structured',
        strengths: 'Strong bones and long-term endurance',
        vulnerabilities: 'Bones, joints, work-related stress',
        approach: 'Structural health and work-life balance'
      },
      Aquarius: {
        constitution: 'Innovative and humanitarian',
        strengths: 'Progressive health approaches and community support',
        vulnerabilities: 'Circulatory system, nervous tension',
        approach: 'Circulatory health and nervous system balance'
      },
      Pisces: {
        constitution: 'Compassionate and intuitive',
        strengths: 'Strong imagination and spiritual healing',
        vulnerabilities: 'Feet, immune system, boundary issues',
        approach: 'Immune health and spiritual grounding'
      }
    };
    return (
      tendencies[risingSign] || {
        constitution: 'Unique health constitution',
        strengths: 'Individual health strengths',
        vulnerabilities: 'Personal health considerations',
        approach: 'Individualized health approach'
      }
    );
  }

  /**
   * Creates comprehensive Rising sign interpretation.
   * @param {Object} risingSignData - Rising sign data.
   * @param {Object} traits - Rising sign traits.
   * @param {Object} firstImpressions - First impressions analysis.
   * @returns {string} Complete interpretation.
   * @private
   */
  _createRisingSignInterpretation(risingSignData, traits, firstImpressions) {
    let interpretation = `Your Rising sign is ${risingSignData.sign}, creating a ${traits.mask.toLowerCase()} first impression. `;
    interpretation += `You approach life with ${traits.naturalApproach.toLowerCase()} energy, and others see you as ${firstImpressions.socialMask.toLowerCase()}. `;
    interpretation += `Your ${traits.communication.toLowerCase()} communication style and ${traits.leadershipStyle.toLowerCase()} leadership approach shape how you present yourself to the world. `;
    interpretation += `This ascendant suggests you naturally ${firstImpressions.underlyingTruth.toLowerCase()} in your interactions with others.`;
    return interpretation;
  }

  /**
   * Validates input data.
   * @param {Object} input - Input data to validate.
   * @private
   */
  _validateInput(input) {
    if (!input) {
      throw new Error('Birth data is required for Rising Sign analysis.');
    }
    const { BirthData } = require('../../models');
    const validatedData = new BirthData(input);
    validatedData.validate();
  }

  /**
   * Formats result for presentation.
   * @param {Object} result - Raw Rising sign result.
   * @returns {Object} Formatted result.
   */
  formatResult(result) {
    return {
      success: true,
      data: result,
      summary: result.interpretation,
      metadata: {
        serviceName: this.serviceName,
        calculationType: 'Rising Sign Analysis',
        timestamp: new Date().toISOString()
      },
      disclaimer:
        'Rising sign analysis describes your social persona and first impressions. The ascendant represents your outward personality and approach to life. Complete birth chart analysis provides deeper understanding of your complete astrological profile.'
    };
  }

  /**
   * Returns metadata for the service.
   * @returns {Object} Service metadata.
   */
  getMetadata() {
    return {
      name: this.serviceName,
      version: '1.0.0',
      category: 'vedic',
      methods: ['processCalculation', 'getRisingSignTraits'],
      dependencies: [], // Managed by ServiceTemplate
      description: 'Calculates and interprets the Rising sign (Ascendant).'
    };
  }

  /**
   * Returns help information for the service.
   * @returns {string} Help text.
   */
  getHelp() {
    return `
🌅 **Rising Sign Service - Your Astrological Mask**

**Purpose:** Calculates and interprets your Rising sign (Ascendant), which represents your social persona, first impressions, and how you approach the world. This is based on your precise birth time and location.

**Required Inputs:**
• Birth date (DD/MM/YYYY)
• Birth time (HH:MM)
• Birth place (city)

**Analysis Includes:**
• **Ascendant Sign:** The zodiac sign that was rising on the eastern horizon at your birth.
• **Personality Traits:** Your outer demeanor, social style, and initial reactions.
• **Physical Appearance:** Tendencies related to your physical build and facial features.
• **First Impressions:** How others typically perceive you upon first meeting.
• **Life Approach:** Your natural orientation to life, decision-making, and problem-solving.
• **Health Tendencies:** Predispositions related to health and constitution.
• **Interpretation:** A comprehensive overview of your Rising sign's influence.

**Example Usage:**
"Calculate my Rising sign for birth date 15/06/1990, time 06:45, in New Delhi."
"What is my ascendant and what does it mean about my outward personality?"

**Output Format:**
Detailed report with Rising sign data, traits, interpretations, and practical insights.
    `.trim();
  }
}

module.exports = RisingSignService;
