/* ============================================
   CV Assessment Pro — ATS Scorer
   Max: 10 points
   ============================================ */

window.ATSScorer = class ATSScorer {
  constructor() {
    this.maxScore = 10;
  }

  score(cvData, options = {}) {
    const details = [];
    const fullText = cvData.rawText || '';
    
    // 1. Standard section headers detected (3 pts)
    const expectedSections = ['experience', 'education', 'skills'];
    const detectedSections = Object.keys(cvData.sections || {}).filter(key => 
      expectedSections.includes(key) && cvData.sections[key].length > 10
    );
    
    let sectionPoints = 0;
    if (detectedSections.length === 3) sectionPoints = 3;
    else if (detectedSections.length === 2) sectionPoints = 2;
    else if (detectedSections.length === 1) sectionPoints = 1;
    
    details.push({
      criterion: 'Standard Section Headers',
      passed: sectionPoints === 3,
      points: sectionPoints,
      maxPoints: 3,
      explanation: sectionPoints === 3
        ? 'All critical ATS section headers detected (Experience, Education, Skills).'
        : `Only found ${detectedSections.length}/3 core sections. Use standard headers like "Professional Experience" instead of creative ones like "My Journey" so ATS software can parse your CV.`
    });
    
    // 2. No special characters overuse (1 pt)
    // Look for unusual unicode symbols, emoji, or excessive ASCII art styling
    const specialCharRegex = /[^\x00-\x7F\xA9\xAE\u2000-\u206F\u2122\u2190-\u21FF]/g;
    const specialChars = fullText.match(specialCharRegex) || [];
    
    const noSpecialChars = specialChars.length < 5;
    
    details.push({
      criterion: 'Clean Characters',
      passed: noSpecialChars,
      points: noSpecialChars ? 1 : 0,
      maxPoints: 1,
      explanation: noSpecialChars
        ? 'No problematic special characters detected.'
        : `Found non-standard characters. ATS systems may mangle these, leading to parsing errors. Stick to standard bullet points (•, -, *) and basic text.`
    });
    
    // 3. Keyword density appropriate (2 pts)
    // Check if the CV repeats certain words too many times (keyword stuffing)
    const words = fullText.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/);
    const wordCounts = {};
    let maxRepeats = 0;
    
    const stopWords = new Set(['the', 'and', 'a', 'to', 'of', 'in', 'i', 'is', 'that', 'it', 'on', 'you', 'this', 'for', 'but', 'with', 'are', 'have', 'be', 'at', 'or', 'as', 'was', 'so', 'if', 'out', 'not']);
    
    words.forEach(w => {
      if (w.length > 3 && !stopWords.has(w)) {
        wordCounts[w] = (wordCounts[w] || 0) + 1;
        if (wordCounts[w] > maxRepeats) maxRepeats = wordCounts[w];
      }
    });
    
    // If a word appears more than 15 times, might be stuffing or poorly written
    let keywordPoints = 2;
    if (maxRepeats > 20) keywordPoints = 0;
    else if (maxRepeats > 15) keywordPoints = 1;
    
    details.push({
      criterion: 'Keyword Density',
      passed: keywordPoints === 2,
      points: keywordPoints,
      maxPoints: 2,
      explanation: keywordPoints === 2
        ? 'Keyword density looks natural without obvious keyword stuffing.'
        : 'Possible keyword stuffing detected. Ensure you repeat keywords naturally and contextually.'
    });
    
    // 4. File format assessment (2 pts)
    let formatPoints = 2;
    let formatMsg = 'Optimal file format detected (PDF or DOCX).';
    
    if (cvData.fileType === 'pdf') {
      formatPoints = 2;
    } else if (cvData.fileType === 'docx') {
      formatPoints = 2;
    } else if (cvData.fileType === 'txt') {
      formatPoints = 1;
      formatMsg = 'TXT format is parseable but lacks visual structure for human readers.';
    } else {
      formatPoints = 0;
      formatMsg = 'Unknown file format. Always use standard PDF or DOCX.';
    }
    
    details.push({
      criterion: 'File Format',
      passed: formatPoints === 2,
      points: formatPoints,
      maxPoints: 2,
      explanation: formatMsg
    });
    
    // 5. Structure & Layout Parsability (1 pt)
    // A simple heuristic: are lines a reasonable length?
    const averageLineLength = cvData.rawText.length / (cvData.lineCount || 1);
    const parseableLayout = averageLineLength > 20 && averageLineLength < 250;
    
    details.push({
      criterion: 'Linear Layout Structure',
      passed: parseableLayout,
      points: parseableLayout ? 1 : 0,
      maxPoints: 1,
      explanation: parseableLayout
        ? 'Text extraction yielded a linear, parseable structure.'
        : 'Text appears fragmented (e.g., heavy columns or text boxes). ATS systems often fail to read complex column layouts correctly. Use a single-column format.'
    });
    
    // 6. Contact info at top (1 pt)
    const contactAtTop = cvData.sections?.contact && cvData.sections.contact.length > 5;
    
    details.push({
      criterion: 'Contact Info Parsability',
      passed: contactAtTop,
      points: contactAtTop ? 1 : 0,
      maxPoints: 1,
      explanation: contactAtTop
        ? 'Contact information detected at the top of the document.'
        : 'Contact information was not clearly detected at the very top. ATS may fail to parse your email/phone correctly. Avoid placing it in headers/footers.'
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
