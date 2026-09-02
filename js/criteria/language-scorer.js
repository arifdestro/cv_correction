/* ============================================
   CV Assessment Pro — Language Scorer
   Max: 10 points
   ============================================ */

window.LanguageScorer = class LanguageScorer {
  constructor() {
    this.maxScore = 10;
  }

  score(cvData, options = {}) {
    const details = [];
    const fullText = (cvData.rawText || '').toLowerCase();
    
    // 1. Common spelling errors (3 pts)
    const commonErrors = window.COMMON_SPELLING_ERRORS || {};
    const foundErrors = [];
    
    for (const [error, correction] of Object.entries(commonErrors)) {
      const regex = new RegExp('\\b' + error + '\\b', 'i');
      if (regex.test(fullText)) {
        foundErrors.push(`${error} (should be ${correction})`);
      }
    }
    
    let spellingPoints = 3;
    if (foundErrors.length > 3) spellingPoints = 0;
    else if (foundErrors.length > 1) spellingPoints = 1;
    else if (foundErrors.length === 1) spellingPoints = 2;
    
    details.push({
      criterion: 'Spelling & Grammar',
      passed: spellingPoints === 3,
      points: spellingPoints,
      maxPoints: 3,
      explanation: foundErrors.length === 0 
        ? 'No common spelling errors detected.' 
        : `Found ${foundErrors.length} spelling error(s): ${foundErrors.join(', ')}.`
    });
    
    // 2. Professional tone (no casual language) (2 pts)
    const unprofessionalPhrases = window.UNPROFESSIONAL_PHRASES || [];
    const foundUnprofessional = unprofessionalPhrases.filter(phrase => {
      const regex = new RegExp('\\b' + phrase.replace(/\s+/g, '\\s+') + '\\b', 'i');
      return regex.test(fullText);
    });
    
    const hasProfessionalTone = foundUnprofessional.length === 0;
    details.push({
      criterion: 'Professional Tone',
      passed: hasProfessionalTone,
      points: hasProfessionalTone ? 2 : 0,
      maxPoints: 2,
      explanation: hasProfessionalTone
        ? 'Tone appears professional with no casual phrasing detected.'
        : `Found casual/unprofessional phrasing: "${foundUnprofessional.join('", "')}". Use formal, business-appropriate language.`
    });
    
    // 3. No personal pronouns (2 pts)
    // Looking for I, me, my, mine, we, our, us, saya, aku, kami, kita
    const pronounRegex = /\b(i|me|my|mine|we|our|us|saya|aku|kami|kita)\b/gi;
    const pronounMatches = fullText.match(pronounRegex) || [];
    
    let pronounPoints = 2;
    if (pronounMatches.length > 5) pronounPoints = 0;
    else if (pronounMatches.length > 0) pronounPoints = 1;
    
    details.push({
      criterion: 'Third-Person Voice',
      passed: pronounPoints === 2,
      points: pronounPoints,
      maxPoints: 2,
      explanation: pronounPoints === 2
        ? 'Good use of implied first-person without personal pronouns.'
        : `Found ${pronounMatches.length} personal pronoun(s) ("I", "my", "we", "saya", "aku", etc.). CVs should be written without personal pronouns (e.g., instead of "I managed a team", use "Managed a team").`
    });
    
    // 4. No filler words (1 pt)
    const fillerWords = window.FILLER_WORDS || [];
    const foundFillers = fillerWords.filter(word => {
      const regex = new RegExp('\\b' + word + '\\b', 'i');
      return regex.test(fullText);
    });
    
    const hasNoFillers = foundFillers.length <= 2; // allowance for small amount
    details.push({
      criterion: 'Concise Language',
      passed: hasNoFillers,
      points: hasNoFillers ? 1 : 0,
      maxPoints: 1,
      explanation: hasNoFillers
        ? 'Language is concise without excessive filler words.'
        : `Found filler words: "${foundFillers.slice(0, 3).join('", "')}". Remove these to make your writing more impactful and direct.`
    });
    
    // 5. Consistent tense usage (1 pt)
    // Very basic heuristic: check if mixing 'ing' and 'ed' endings heavily
    const ingWords = (fullText.match(/\b\w+ing\b/g) || []).length;
    const edWords = (fullText.match(/\b\w+ed\b/g) || []).length;
    
    // Ideally we want more 'ed' action words for past experience
    const tenseConsistency = (edWords > ingWords * 0.5) || (edWords === 0 && ingWords === 0);
    
    details.push({
      criterion: 'Tense Consistency',
      passed: tenseConsistency,
      points: tenseConsistency ? 1 : 0,
      maxPoints: 1,
      explanation: tenseConsistency
        ? 'Verb tenses appear reasonably consistent.'
        : 'Possible mixing of present ("-ing") and past ("-ed") tenses detected. Ensure past jobs use past tense, and current jobs use present tense.'
    });
    
    // 6. Sentence structure variety / active voice (1 pt)
    // Check if sentences start with "Responsible for" or "Duties included"
    const passiveStartsRegex = /\b(responsible for|duties included|tasked with|bertanggung jawab atas|tugasnya meliputi|ditugaskan untuk)\b/gi;
    const passiveStartsMatches = fullText.match(passiveStartsRegex) || [];
    
    const isActiveVoice = passiveStartsMatches.length === 0;
    
    details.push({
      criterion: 'Active Voice',
      passed: isActiveVoice,
      points: isActiveVoice ? 1 : 0,
      maxPoints: 1,
      explanation: isActiveVoice
        ? 'Sentences seem to use active voice constructions.'
        : `Found passive phrases like "${passiveStartsMatches[0]}". Start bullets directly with strong action verbs (e.g., "Led", "Developed") instead.`
    });
    
    // Calculate total
    const totalScore = details.reduce((sum, d) => sum + d.points, 0);
    
    return {
      score: Math.min(totalScore, this.maxScore),
      maxScore: this.maxScore,
      details
    };
  }
};
