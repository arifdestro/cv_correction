/* ============================================
   CV Assessment Pro — Main Scoring Engine
   ============================================ */

window.ScoringEngine = class ScoringEngine {
  constructor() {
    // Initialize all sub-scorers
    this.scorers = [
      { name: 'Format & Layout', id: 'format', icon: '📄', instance: new window.FormatScorer() },
      { name: 'Contact Info', id: 'contact', icon: '📞', instance: new window.ContactScorer() },
      { name: 'Professional Summary', id: 'summary', icon: '🎯', instance: new window.SummaryScorer() },
      { name: 'Work Experience', id: 'experience', icon: '💼', instance: new window.ExperienceScorer() },
      { name: 'Education', id: 'education', icon: '🎓', instance: new window.EducationScorer() },
      { name: 'Skills', id: 'skills', icon: '⚡', instance: new window.SkillsScorer() },
      { name: 'Language & Writing', id: 'language', icon: '✍️', instance: new window.LanguageScorer() },
      { name: 'ATS Compatibility', id: 'ats', icon: '🤖', instance: new window.ATSScorer() }
    ];
  }

  analyze(cvData, options = { strict: true, region: 'US' }) {
    let totalScore = 0;
    let maxScore = 0;
    const categoryResults = [];
    const allStrengths = [];
    const allIssues = [];

    // Run each scorer
    for (const scorer of this.scorers) {
      const result = scorer.instance.score(cvData, options);
      
      let finalScore = result.score;
      if (options.strict && finalScore < result.maxScore) {
        // Apply strict penalty if they didn't get perfect score
        finalScore = Math.max(0, finalScore - (result.maxScore * 0.1));
      }
      
      // Round to 1 decimal place
      finalScore = Math.round(finalScore * 10) / 10;
      
      totalScore += finalScore;
      maxScore += result.maxScore;

      categoryResults.push({
        id: scorer.id,
        name: scorer.name,
        icon: scorer.icon,
        score: finalScore,
        maxScore: result.maxScore,
        percentage: Math.round((finalScore / result.maxScore) * 100),
        details: result.details
      });

      // Extract strengths and issues
      for (const detail of result.details) {
        if (detail.passed && detail.points === detail.maxPoints) {
          allStrengths.push({
            category: scorer.name,
            criterion: detail.criterion,
            explanation: detail.explanation
          });
        } else if (!detail.passed || detail.points === 0) {
          allIssues.push({
            category: scorer.name,
            criterion: detail.criterion,
            explanation: detail.explanation,
            priority: detail.points === 0 ? 'critical' : 'important'
          });
        }
      }
    }

    // Ensure total is clean integer for final display
    const finalTotalScore = Math.round(totalScore);
    const { grade, label } = this.calculateGrade(finalTotalScore);

    return {
      totalScore: finalTotalScore,
      maxScore,
      percentage: Math.round((finalTotalScore / maxScore) * 100),
      grade,
      gradeLabel: label,
      categories: categoryResults,
      strengths: allStrengths,
      issues: allIssues,
      region: options.region,
      strictMode: options.strict,
      timestamp: new Date().toISOString()
    };
  }

  calculateGrade(score) {
    if (score >= 95) return { grade: 'S', label: 'Exceptional' };
    if (score >= 85) return { grade: 'A', label: 'Excellent' };
    if (score >= 70) return { grade: 'B', label: 'Good' };
    if (score >= 55) return { grade: 'C', label: 'Average' };
    if (score >= 40) return { grade: 'D', label: 'Below Average' };
    return { grade: 'F', label: 'Poor' };
  }
};
