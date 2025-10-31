const BaseAction = require('../whatsapp/actions/BaseAction');
const { incrementCompatibilityChecks } = require('../../models/userModel');
const { SwissEphemerisCalculator } = require('./compatibility/SwissEphemerisCalculator');
const { SynastryEngine } = require('./compatibility/SynastryEngine');
const { CompatibilityScorer } = require('./compatibility/CompatibilityScorer');
const { RelationshipInsightsGenerator } = require('./compatibility/RelationshipInsightsGenerator');
const { CompatibilityFormatter } = require('./compatibility/CompatibilityFormatter');
const { CompatibilityWorkflowManager } = require('./compatibility/CompatibilityWorkflowManager');
const { SubscriptionManager } = require('../../models/SubscriptionManager');

/**
 * CompatibilityAction - Ultra-Lean Synastry Analysis Orchestrator
 * Delegates all compatibility analysis to specialized modules
 */
class CompatibilityAction extends BaseAction {
  constructor(user, phoneNumber, data = {}) {
    super(user, phoneNumber, data);
    this.partnerData = data.partnerData;

    // Initialize specialized modules
    this.calculator = new SwissEphemerisCalculator();
    this.synastryEngine = new SynastryEngine(this.calculator);
    this.scorer = new CompatibilityScorer();
    this.insightsGen = new RelationshipInsightsGenerator();
    this.formatter = new CompatibilityFormatter();
    this.workflowManager = new CompatibilityWorkflowManager(
      user, phoneNumber, null, new SubscriptionManager()
    );
  }

  static get actionId() {
    return 'initiate_compatibility_flow';
  }

  /**
   * Execute the compatibility action workflow
   * @returns {Promise<Object>} Action result
   */
  async execute() {
    return this.workflowManager.executeAction();
  }

  /**
   * Core analysis method - delegates to specialized modules
   * @param {Object} partnerData - Partner's birth data
   * @returns {Promise<Object>} Analysis result
   */
  async performCompatibilityAnalysis(partnerData) {
    try {
      // Calculate comprehensive synastry using specialized engine
      const synastryAnalysis = await this.synastryEngine.performSynastryAnalysis(
        await this.calculator.calculateChartPositions(this.user),
        await this.calculator.calculateChartPositions(partnerData)
      );

      // Generate compatibility scores using scorer
      synastryAnalysis.compatibilityScores = this.scorer.calculateCompatibilityScores(
        synastryAnalysis.interchartAspects, synastryAnalysis.houseOverlays
      );

      // Generate relationship insights using insights generator
      const insights = await this.insightsGen.generateRelationshipInsights(synastryAnalysis, partnerData);

      // Send formatted results using formatter
      await this.workflowManager.sendSynastryResults(synastryAnalysis, insights, partnerData, this.formatter);

      // Update usage counters
      await incrementCompatibilityChecks(this.phoneNumber);

      return synastryAnalysis;
    } catch (error) {
      this.logger.error('Compatibility analysis delegation error:', error);
      throw error;
    }
  }

  /**
   * Get action metadata for registration
   * @returns {Object} Action metadata
   */
  static getMetadata() {
    return {
      id: this.actionId,
      description: 'Analyze relationship compatibility through synastry charts',
      keywords: ['compatibility', 'synastry', 'relationship', 'match', 'partner'],
      category: 'astrology',
      subscriptionRequired: true,
      cooldown: 300000, // 5 minutes between compatibility analyses
      maxUsage: 10 // Per month for free users
    };
  }
}

module.exports = CompatibilityAction;
