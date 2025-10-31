/**
 * Significant Transits Service
 * Identifies and analyzes major planetary transits and their impacts
 */

const ServiceTemplate = require('../serviceTemplate');
const { validateCoordinates, validateDateTime } = require('../../../utils/validation');
const { formatDegree, formatTime } = require('../../../utils/formatters');

class SignificantTransitsService extends ServiceTemplate {
  constructor() {
    super('SignificantTransits', {
      description: 'Major planetary transit identification and impact analysis',
      version: '1.0.0',
      author: 'Vedic Astrology System',
      category: 'vedic',
      requiresLocation: true,
      requiresDateTime: true,
      supportedLanguages: ['en', 'hi', 'sa'],
      features: [
        'major_transits',
        'transit_timing',
        'impact_analysis',
        'retrograde_effects',
        'eclipse_transits',
        'station_periods',
        'transit_windows',
        'planetary_returns'
      ]
    });
  }

  /**
   * Calculate significant transits for date range
   */
  async calculateSignificantTransits(birthDatetime, birthLatitude, birthLongitude, startDate, endDate) {
    const birthChart = await VedicCalculator.calculateChart(birthDatetime, birthLatitude, birthLongitude);
    
    if (!endDate) {
      endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 12); // Default 1 year
      endDate = endDate.toISOString();
    }
    
    const transits = [];
    const currentDate = new Date(startDate);
    const end = new Date(endDate);
    
    // Check transits for each day (simplified - would use ephemeris in production)
    while (currentDate <= end) {
      const currentChart = await VedicCalculator.calculateChart(
        currentDate.toISOString(), 
        birthLatitude, 
        birthLongitude
      );
      
      const dayTransits = this.calculateDailyTransits(currentChart, birthChart, currentDate);
      transits.push(...dayTransits);
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return {
      birthChart,
      transits: this.filterSignificantTransits(transits),
      startDate,
      endDate
    };
  }

  /**
   * Calculate daily transits
   */
  calculateDailyTransits(currentChart, birthChart, date) {
    const transits = [];
    const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
    
    for (const transitPlanet of planets) {
      const transitLong = currentChart[transitPlanet.toLowerCase()];
      
      for (const natalPlanet of planets) {
        const natalLong = birthChart[natalPlanet.toLowerCase()];
        const aspect = this.calculateAspect(transitLong, natalLong);
        
        if (aspect.aspect !== 'none' && aspect.orb <= 3) {
          transits.push({
            date: date.toISOString(),
            transitPlanet,
            natalPlanet,
            aspect: aspect.aspect,
            orb: aspect.orb,
            strength: aspect.strength,
            type: this.getTransitType(transitPlanet, natalPlanet, aspect.aspect),
            significance: this.calculateTransitSignificance(transitPlanet, natalPlanet, aspect)
          });
        }
      }
    }
    
    return transits;
  }

  /**
   * Calculate aspect between two longitudes
   */
  calculateAspect(long1, long2) {
    const diff = Math.abs(long1 - long2);
    const normalizedDiff = diff > 180 ? 360 - diff : diff;
    
    const aspects = [
      { type: 'conjunction', angle: 0, orb: 3 },
      { type: 'opposition', angle: 180, orb: 3 },
      { type: 'trine', angle: 120, orb: 3 },
      { type: 'square', angle: 90, orb: 3 },
      { type: 'sextile', angle: 60, orb: 2 }
    ];
    
    for (const aspect of aspects) {
      const angleDiff = Math.abs(normalizedDiff - aspect.angle);
      if (angleDiff <= aspect.orb) {
        return {
          aspect: aspect.type,
          orb: angleDiff,
          strength: Math.max(0, 100 - (angleDiff / aspect.orb) * 100)
        };
      }
    }
    
    return { aspect: 'none', orb: 0, strength: 0 };
  }

  /**
   * Get transit type
   */
  getTransitType(transitPlanet, natalPlanet, aspect) {
    const benefic = ['Jupiter', 'Venus', 'Mercury'];
    const malefic = ['Mars', 'Saturn', 'Rahu', 'Ketu'];
    
    const isTransitBenefic = benefic.includes(transitPlanet);
    const isNatalBenefic = benefic.includes(natalPlanet);
    
    const aspectTypes = {
      conjunction: isTransitBenefic ? 'opportunity' : 'challenge',
      trine: 'support',
      sextile: 'assistance',
      square: 'activation',
      opposition: 'awareness'
    };
    
    return aspectTypes[aspect] || 'neutral';
  }

  /**
   * Calculate transit significance
   */
  calculateTransitSignificance(transitPlanet, natalPlanet, aspect) {
    let significance = 0;
    
    // Planet significance weights
    const planetWeights = {
      Sun: 10,
      Moon: 9,
      Mars: 8,
      Mercury: 7,
      Jupiter: 10,
      Venus: 8,
      Saturn: 10
    };
    
    // Aspect significance weights
    const aspectWeights = {
      conjunction: 10,
      opposition: 9,
      trine: 7,
      square: 8,
      sextile: 5
    };
    
    significance = (planetWeights[transitPlanet] || 5) + 
                  (planetWeights[natalPlanet] || 5) + 
                  (aspectWeights[aspect.aspect] || 3);
    
    // Outer planet transits are more significant
    if (['Jupiter', 'Saturn'].includes(transitPlanet)) {
      significance += 5;
    }
    
    // Personal planet transits to personal planets are significant
    if (['Sun', 'Moon', 'Mercury', 'Venus', 'Mars'].includes(transitPlanet) &&
        ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars'].includes(natalPlanet)) {
      significance += 3;
    }
    
    return significance;
  }

  /**
   * Filter significant transits
   */
  filterSignificantTransits(transits) {
    // Sort by significance and date
    const sortedTransits = transits.sort((a, b) => {
      if (b.significance !== a.significance) {
        return b.significance - a.significance;
      }
      return new Date(a.date) - new Date(b.date);
    });
    
    // Filter by significance threshold
    const significantTransits = sortedTransits.filter(t => t.significance >= 15);
    
    // Group similar transits
    const groupedTransits = this.groupSimilarTransits(significantTransits);
    
    return groupedTransits;
  }

  /**
   * Group similar transits
   */
  groupSimilarTransits(transits) {
    const groups = {};
    
    transits.forEach(transit => {
      const key = `${transit.transitPlanet}-${transit.natalPlanet}-${transit.aspect}`;
      
      if (!groups[key]) {
        groups[key] = {
          ...transit,
          startDate: transit.date,
          endDate: transit.date,
          peakDate: transit.date,
          maxStrength: transit.strength,
          occurrences: 1
        };
      } else {
        const group = groups[key];
        group.endDate = transit.date;
        group.occurrences++;
        
        if (transit.strength > group.maxStrength) {
          group.maxStrength = transit.strength;
          group.peakDate = transit.date;
        }
      }
    });
    
    return Object.values(groups);
  }

  /**
   * Calculate retrograde effects
   */
  calculateRetrogradeEffects(startDate, endDate, latitude, longitude) {
    const retrogradePeriods = [];
    const planets = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
    
    for (const planet of planets) {
      const retrogradeInfo = this.calculatePlanetRetrograde(
        planet, 
        startDate, 
        endDate, 
        latitude, 
        longitude
      );
      
      if (retrogradeInfo) {
        retrogradePeriods.push(retrogradeInfo);
      }
    }
    
    return retrogradePeriods;
  }

  /**
   * Calculate planet retrograde periods
   */
  calculatePlanetRetrograde(planet, startDate, endDate, latitude, longitude) {
    // Simplified retrograde calculation
    // In production, would use ephemeris data
    
    const retrogradePeriods = {
      Mercury: { frequency: '3-4 times per year', duration: '3 weeks' },
      Venus: { frequency: 'every 18 months', duration: '6 weeks' },
      Mars: { frequency: 'every 26 months', duration: '2-3 months' },
      Jupiter: { frequency: 'every 13 months', duration: '4 months' },
      Saturn: { frequency: 'every 12.5 months', duration: '4.5 months' }
    };
    
    const info = retrogradePeriods[planet];
    if (!info) return null;
    
    return {
      planet,
      frequency: info.frequency,
      duration: info.duration,
      effects: this.getRetrogradeEffects(planet),
      currentStatus: this.checkCurrentRetrogradeStatus(planet)
    };
  }

  /**
   * Get retrograde effects
   */
  getRetrogradeEffects(planet) {
    const effects = {
      Mercury: 'Communication delays, technology issues, reconsideration of decisions',
      Venus: 'Relationship reassessment, financial reconsideration, aesthetic reevaluation',
      Mars: 'Energy redirection, action delays, conflict reconsideration',
      Jupiter: 'Growth reconsideration, belief system review, opportunity reassessment',
      Saturn: 'Responsibility review, discipline reevaluation, structure reconsideration'
    };
    
    return effects[planet] || 'Retrograde influence requiring reflection';
  }

  /**
   * Check current retrograde status
   */
  checkCurrentRetrogradeStatus(planet) {
    // Simplified - would use actual ephemeris
    const retrogradePlanets = ['Mercury']; // Example
    return retrogradePlanets.includes(planet);
  }

  /**
   * Calculate planetary returns
   */
  calculatePlanetaryReturns(birthDatetime, birthLatitude, birthLongitude, startDate, endDate) {
    const returns = [];
    const planets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
    
    for (const planet of planets) {
      const returnInfo = this.calculatePlanetReturn(
        planet,
        birthDatetime,
        birthLatitude,
        birthLongitude,
        startDate,
        endDate
      );
      
      if (returnInfo) {
        returns.push(returnInfo);
      }
    }
    
    return returns;
  }

  /**
   * Calculate planet return
   */
  calculatePlanetReturn(planet, birthDatetime, birthLatitude, birthLongitude, startDate, endDate) {
    const birthChart = await VedicCalculator.calculateChart(birthDatetime, birthLatitude, birthLongitude);
    const birthPosition = birthChart[planet.toLowerCase()];
    
    // Simplified return calculation
    // In production, would use ephemeris to find exact return dates
    
    const returnPeriods = {
      Sun: { frequency: 'annually', significance: 'Solar Return - Personal New Year' },
      Moon: { frequency: 'monthly', significance: 'Lunar Return - Emotional Reset' },
      Mercury: { frequency: '4 times per year', significance: 'Mercury Return - Communication Cycle' },
      Venus: { frequency: 'annually', significance: 'Venus Return - Relationship Cycle' },
      Mars: { frequency: 'every 2 years', significance: 'Mars Return - Energy Cycle' },
      Jupiter: { frequency: 'every 12 years', significance: 'Jupiter Return - Growth Cycle' },
      Saturn: { frequency: 'every 29 years', significance: 'Saturn Return - Life Cycle' }
    };
    
    const info = returnPeriods[planet];
    if (!info) return null;
    
    return {
      planet,
      frequency: info.frequency,
      significance: info.significance,
      nextReturn: this.estimateNextReturn(planet, birthDatetime, startDate),
      interpretation: this.getReturnInterpretation(planet)
    };
  }

  /**
   * Estimate next return
   */
  estimateNextReturn(planet, birthDatetime, startDate) {
    const birthDate = new Date(birthDatetime);
    const start = new Date(startDate);
    
    const returnPeriods = {
      Sun: 365.25,
      Moon: 27.32,
      Mercury: 88,
      Venus: 224.7,
      Mars: 687,
      Jupiter: 4333,
      Saturn: 10759
    };
    
    const period = returnPeriods[planet];
    if (!period) return null;
    
    // Calculate approximate next return
    const ageInDays = (start - birthDate) / (1000 * 60 * 60 * 24);
    const cyclesCompleted = Math.floor(ageInDays / period);
    const nextReturnInDays = (cyclesCompleted + 1) * period - ageInDays;
    
    const nextReturnDate = new Date(start);
    nextReturnDate.setDate(nextReturnDate.getDate() + Math.floor(nextReturnInDays));
    
    return nextReturnDate.toISOString();
  }

  /**
   * Get return interpretation
   */
  getReturnInterpretation(planet) {
    const interpretations = {
      Sun: 'Personal renewal, new beginnings, birthday themes',
      Moon: 'Emotional reset, intuitive insights, domestic focus',
      Mercury: 'Communication cycle, learning phase, mental reset',
      Venus: 'Relationship cycle, values reassessment, pleasure focus',
      Mars: 'Energy cycle, initiative phase, action reset',
      Jupiter: 'Growth cycle, opportunity phase, expansion reset',
      Saturn: 'Life cycle, responsibility phase, structure reset'
    };
    
    return interpretations[planet] || 'Planetary cycle influence';
  }

  /**
   * Calculate eclipse transits
   */
  calculateEclipseTransits(startDate, endDate, latitude, longitude) {
    const eclipses = [];
    
    // Simplified eclipse calculation
    // In production, would use ephemeris for exact eclipse data
    
    const eclipseTypes = [
      { type: 'Solar Eclipse', frequency: '2-5 times per year', effect: 'New beginnings, major life changes' },
      { type: 'Lunar Eclipse', frequency: '2-5 times per year', effect: 'Emotional culmination, relationship changes' }
    ];
    
    eclipseTypes.forEach(eclipse => {
      eclipses.push({
        type: eclipse.type,
        frequency: eclipse.frequency,
        effect: eclipse.effect,
        nextEclipse: this.estimateNextEclipse(eclipse.type, startDate)
      });
    });
    
    return eclipses;
  }

  /**
   * Estimate next eclipse
   */
  estimateNextEclipse(eclipseType, startDate) {
    // Simplified estimation
    const start = new Date(startDate);
    const nextEclipse = new Date(start);
    
    if (eclipseType === 'Solar Eclipse') {
      nextEclipse.setMonth(nextEclipse.getMonth() + 2);
    } else {
      nextEclipse.setMonth(nextEclipse.getMonth() + 1);
    }
    
    return nextEclipse.toISOString();
  }

  /**
   * Main calculation method
   */
  async calculate(userData, options = {}) {
    try {
      this.validateInput(userData);
      
      const { 
        datetime, 
        latitude, 
        longitude, 
        startDate, 
        endDate 
      } = userData;
      
      if (!startDate) {
        startDate = new Date().toISOString();
      }
      
      const significantTransits = await this.calculateSignificantTransits(
        datetime, 
        latitude, 
        longitude, 
        startDate, 
        endDate
      );
      
      const retrogradeEffects = this.calculateRetrogradeEffects(
        startDate, 
        endDate, 
        latitude, 
        longitude
      );
      
      const planetaryReturns = await this.calculatePlanetaryReturns(
        datetime, 
        latitude, 
        longitude, 
        startDate, 
        endDate
      );
      
      const eclipseTransits = this.calculateEclipseTransits(
        startDate, 
        endDate, 
        latitude, 
        longitude
      );
      
      const analysis = {
        startDate,
        endDate: endDate || '1 year from start',
        significantTransits,
        retrogradeEffects,
        planetaryReturns,
        eclipseTransits,
        interpretations: this.generateInterpretations({
          significantTransits,
          retrogradeEffects,
          planetaryReturns,
          eclipseTransits
        })
      };
      
      return this.formatOutput(analysis, options.language || 'en');
      
    } catch (error) {
      throw new Error(`Significant transits calculation failed: ${error.message}`);
    }
  }

  /**
   * Generate interpretations
   */
  generateInterpretations(data) {
    const { significantTransits, retrogradeEffects, planetaryReturns, eclipseTransits } = data;
    
    const interpretations = {
      majorInfluences: this.identifyMajorInfluences(data),
      timing: this.analyzeTiming(data),
      challenges: this.identifyChallenges(data),
      opportunities: this.identifyOpportunities(data),
      overall: this.generateOverallAnalysis(data)
    };
    
    return interpretations;
  }

  /**
   * Identify major influences
   */
  identifyMajorInfluences(data) {
    const influences = [];
    const { significantTransits, retrogradeEffects } = data;
    
    // Strong transits
    const strongTransits = significantTransits.filter(t => t.significance >= 20);
    strongTransits.forEach(transit => {
      influences.push(`${transit.transitPlanet} ${transit.aspect} ${transit.natalPlanet}`);
    });
    
    // Retrograde effects
    retrogradeEffects.forEach(retrograde => {
      if (retrograde.currentStatus) {
        influences.push(`${retrograde.planet} retrograde`);
      }
    });
    
    return influences;
  }

  /**
   * Analyze timing
   */
  analyzeTiming(data) {
    const { significantTransits, planetaryReturns } = data;
    
    const activatingTransits = significantTransits.filter(t => 
      t.aspect === 'square' || t.aspect === 'opposition'
    );
    
    const harmoniousTransits = significantTransits.filter(t => 
      t.aspect === 'trine' || t.aspect === 'sextile'
    );
    
    const upcomingReturns = planetaryReturns.filter(r => 
      new Date(r.nextReturn) <= new Date()
    );
    
    return {
      phase: activatingTransits.length > harmoniousTransits.length ? 'challenging' : 'growth',
      intensity: significantTransits.length > 5 ? 'high' : 'moderate',
      returns: upcomingReturns.length > 0 ? 'return period' : 'normal transit'
    };
  }

  /**
   * Identify challenges
   */
  identifyChallenges(data) {
    const challenges = [];
    const { significantTransits, retrogradeEffects } = data;
    
    // Challenging transits
    const challengingTransits = significantTransits.filter(t => 
      (t.aspect === 'square' || t.aspect === 'opposition') && t.significance >= 20
    );
    
    challengingTransits.forEach(transit => {
      challenges.push(`${transit.transitPlanet} ${transit.aspect} ${transit.natalPlanet} - requires awareness`);
    });
    
    // Retrograde challenges
    retrogradeEffects.forEach(retrograde => {
      if (retrograde.currentStatus) {
        challenges.push(`${retrograde.planet} retrograde - ${retrograde.effects}`);
      }
    });
    
    return challenges;
  }

  /**
   * Identify opportunities
   */
  identifyOpportunities(data) {
    const opportunities = [];
    const { significantTransits, planetaryReturns } = data;
    
    // Harmonious transits
    const harmoniousTransits = significantTransits.filter(t => 
      (t.aspect === 'trine' || t.aspect === 'sextile') && t.significance >= 15
    );
    
    harmoniousTransits.forEach(transit => {
      opportunities.push(`${transit.transitPlanet} ${transit.aspect} ${transit.natalPlanet} - favorable timing`);
    });
    
    // Return opportunities
    planetaryReturns.forEach(returnInfo => {
      if (new Date(returnInfo.nextReturn) <= new Date()) {
        opportunities.push(`${returnInfo.planet} return - ${returnInfo.interpretation}`);
      }
    });
    
    return opportunities;
  }

  /**
   * Generate overall analysis
   */
  generateOverallAnalysis(data) {
    const { significantTransits, retrogradeEffects, eclipseTransits } = data;
    
    return {
      summary: `Significant transit period with ${significantTransits.length} major influences`,
      intensity: this.calculateTransitIntensity(data),
      focus: this.identifyTransitFocus(data),
      recommendations: this.generateTransitRecommendations(data)
    };
  }

  /**
   * Calculate transit intensity
   */
  calculateTransitIntensity(data) {
    const { significantTransits } = data;
    
    if (significantTransits.length === 0) return 'Low';
    
    const totalSignificance = significantTransits.reduce((sum, t) => sum + t.significance, 0);
    const averageSignificance = totalSignificance / significantTransits.length;
    
    if (averageSignificance > 25) return 'High';
    if (averageSignificance > 18) return 'Medium';
    return 'Low';
  }

  /**
   * Identify transit focus
   */
  identifyTransitFocus(data) {
    const { significantTransits } = data;
    
    const planetCounts = {};
    significantTransits.forEach(transit => {
      planetCounts[transit.transitPlanet] = (planetCounts[transit.transitPlanet] || 0) + 1;
    });
    
    const sortedPlanets = Object.entries(planetCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);
    
    return sortedPlanets.map(([planet, count]) => `${planet} (${count} transits)`);
  }

  /**
   * Generate transit recommendations
   */
  generateTransitRecommendations(data) {
    const recommendations = [];
    const { significantTransits, retrogradeEffects } = data;
    
    // Based on challenging transits
    const challengingTransits = significantTransits.filter(t => 
      t.aspect === 'square' || t.aspect === 'opposition'
    );
    
    if (challengingTransits.length > 0) {
      recommendations.push('Navigate challenges with patience and awareness');
    }
    
    // Based on retrogrades
    const activeRetrogrades = retrogradeEffects.filter(r => r.currentStatus);
    if (activeRetrogrades.length > 0) {
      recommendations.push('Review and reconsider decisions before taking action');
    }
    
    // Based on harmonious transits
    const harmoniousTransits = significantTransits.filter(t => 
      t.aspect === 'trine' || t.aspect === 'sextile'
    );
    
    if (harmoniousTransits.length > 0) {
      recommendations.push('Take advantage of favorable timing for new initiatives');
    }
    
    return recommendations;
  }

  /**
   * Format output for display
   */
  formatOutput(analysis, language = 'en') {
    const translations = {
      en: {
        title: 'Significant Transits Analysis',
        startDate: 'Start Date',
        endDate: 'End Date',
        significantTransits: 'Significant Transits',
        retrogradeEffects: 'Retrograde Effects',
        planetaryReturns: 'Planetary Returns',
        eclipseTransits: 'Eclipse Transits',
        interpretations: 'Interpretations',
        majorInfluences: 'Major Influences',
        timing: 'Timing Analysis',
        challenges: 'Challenges',
        opportunities: 'Opportunities',
        overallAnalysis: 'Overall Analysis'
      },
      hi: {
        title: 'महत्वपूर्ण गोचर विश्लेषण',
        startDate: 'प्रारंभ तिथि',
        endDate: 'समाप्ति तिथि',
        significantTransits: 'महत्वपूर्ण गोचर',
        retrogradeEffects: 'वक्री प्रभाव',
        planetaryReturns: 'ग्रहीय वापसी',
        eclipseTransits: 'ग्रहण गोचर',
        interpretations: 'व्याख्या',
        majorInfluences: 'प्रमुख प्रभाव',
        timing: 'समय विश्लेषण',
        challenges: 'चुनौतियां',
        opportunities: 'अवसरों',
        overallAnalysis: 'समग्र विश्लेषण'
      }
    };
    
    const t = translations[language] || translations.en;
    
    return {
      metadata: this.getMetadata(),
      analysis: {
        title: t.title,
        sections: {
          [t.startDate]: analysis.startDate,
          [t.endDate]: analysis.endDate,
          [t.significantTransits]: analysis.significantTransits,
          [t.retrogradeEffects]: analysis.retrogradeEffects,
          [t.planetaryReturns]: analysis.planetaryReturns,
          [t.eclipseTransits]: analysis.eclipseTransits,
          [t.interpretations]: analysis.interpretations
        }
      }
    };
  }
  async getHealthStatus() {
    try {
      const baseHealth = await super.getHealthStatus();
      return {
        ...baseHealth,
        features: {
          // Add service-specific features here
        },
        supportedAnalyses: [
          // Add supported analyses here
        ]
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = new SignificantTransitsService();