class CompatibilityReport {
  constructor(data) {
    this.person1 = data.person1;
    this.person2 = data.person2;
    this.analysis = data.analysis;
    this.score = data.score;
    this.recommendation = data.recommendation;
    this.generatedAt = new Date();
    this.version = '1.0';
  }

  getCompatibilityLevel() {
    if (this.score >= 80) {
      return 'Excellent';
    }
    if (this.score >= 60) {
      return 'Good';
    }
    if (this.score >= 40) {
      return 'Moderate';
    }
    if (this.score >= 20) {
      return 'Challenging';
    }
    return 'Poor';
  }

  toDetailedReport() {
    return {
      compatibility: {
        level: this.getCompatibilityLevel(),
        score: this.score,
        recommendation: this.recommendation
      },
      analysis: this.analysis,
      individuals: {
        person1: this.person1,
        person2: this.person2
      },
      metadata: {
        generatedAt: this.generatedAt,
        version: this.version
      }
    };
  }
}

module.exports = CompatibilityReport;
