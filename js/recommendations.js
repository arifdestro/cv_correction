/* ============================================
   CV Assessment Pro — Recommendations Engine
   Generates actionable, prioritized
   recommendations from scoring results
   ============================================ */

window.RecommendationsEngine = class RecommendationsEngine {

  // ── Generate Recommendations ──────────────────

  generate(results) {
    const recs = [];
    const cats = {};

    // Index categories by name for quick access
    if (results.categories) {
      results.categories.forEach(c => { cats[c.name] = c; });
    }

    const cvData = results.cvData || {};
    const rawText = cvData.rawText || '';
    const sections = cvData.sections || {};
    const wordCount = cvData.wordCount || 0;

    // ── Critical Recommendations ──────────────

    // Very short CV
    if (wordCount > 0 && wordCount < 150) {
      recs.push({
        priority: 'critical',
        category: 'Content',
        title: 'Your CV is critically short',
        body: `Your CV contains only ~${wordCount} words. Most successful resumes have 400–700 words. A very short CV signals to recruiters that you lack experience or haven't invested effort. Add more detail to your work experience, skills, and achievements.`,
        icon: '🚨'
      });
    }

    // Missing experience section
    if (!sections.experience || sections.experience.trim().length < 30) {
      recs.push({
        priority: 'critical',
        category: 'Work Experience',
        title: 'Add a Work Experience section',
        body: 'Your CV appears to be missing a dedicated Work Experience section. This is the single most important section recruiters look for. Include your job titles, company names, dates, and bullet-pointed achievements for each role.',
        icon: '💼'
      });
    }

    // No contact email
    if (!cvData.emails || cvData.emails.length === 0) {
      recs.push({
        priority: 'critical',
        category: 'Contact Information',
        title: 'Include an email address',
        body: 'No email address was detected. Without contact info, a recruiter literally cannot reach you. Place your professional email prominently at the top of your CV.',
        icon: '📧'
      });
    }

    // No phone number
    if (!cvData.phones || cvData.phones.length === 0) {
      recs.push({
        priority: 'critical',
        category: 'Contact Information',
        title: 'Add a phone number',
        body: 'No phone number was detected. Many recruiters prefer to call candidates directly. Include a mobile number with your country code.',
        icon: '📱'
      });
    }

    // Missing education section
    if (!sections.education || sections.education.trim().length < 20) {
      recs.push({
        priority: 'critical',
        category: 'Education',
        title: 'Include your Education',
        body: 'No education section was found. Even if you\'re self-taught, include relevant coursework, bootcamps, or certifications. For experienced professionals, a brief education section is still expected.',
        icon: '🎓'
      });
    }

    // ── Important Recommendations ─────────────

    // Missing skills section
    if (!sections.skills || sections.skills.trim().length < 15) {
      recs.push({
        priority: 'important',
        category: 'Skills',
        title: 'Add a dedicated Skills section',
        body: 'A clear skills section helps both ATS systems and recruiters quickly assess your capabilities. List technical skills, tools, and methodologies. Group them into categories (e.g., "Programming: Python, JavaScript, SQL").',
        icon: '🛠️'
      });
    }

    // No summary/objective
    if (!sections.summary || sections.summary.trim().length < 20) {
      recs.push({
        priority: 'important',
        category: 'Professional Summary',
        title: 'Write a Professional Summary',
        body: 'A 2–3 sentence summary at the top of your CV immediately tells the reader who you are and what value you bring. Example:\n\n✅ "Results-driven software engineer with 5+ years building scalable web applications. Expert in React and Node.js with a track record of reducing load times by 40%."\n\n❌ "Looking for a challenging position to utilize my skills."',
        icon: '📝'
      });
    }

    // No action verbs
    const actionVerbs = ['led', 'managed', 'developed', 'created', 'designed', 'built', 'implemented', 'increased', 'decreased', 'reduced', 'improved', 'delivered', 'launched', 'spearheaded', 'orchestrated', 'achieved', 'generated', 'optimized', 'streamlined', 'established'];
    const textLower = rawText.toLowerCase();
    const foundVerbs = actionVerbs.filter(v => textLower.includes(v));
    if (foundVerbs.length < 3 && wordCount > 100) {
      recs.push({
        priority: 'important',
        category: 'Language',
        title: 'Use stronger action verbs',
        body: 'Your CV lacks impactful action verbs. Start each bullet point with a powerful verb:\n\n✅ "Spearheaded migration to cloud infrastructure, reducing costs by 35%"\n❌ "Was responsible for cloud migration"\n\nGreat verbs to use: Led, Developed, Implemented, Optimized, Delivered, Achieved, Generated, Streamlined.',
        icon: '💪'
      });
    }

    // No quantified results
    const hasNumbers = /\d+%|\$[\d,]+|\d+\+?\s*(users?|clients?|projects?|team|people|revenue|sales)/i.test(rawText);
    if (!hasNumbers && wordCount > 100) {
      recs.push({
        priority: 'important',
        category: 'Content Quality',
        title: 'Quantify your achievements',
        body: 'Your CV lacks measurable results. Numbers make your impact concrete and believable:\n\n✅ "Increased user engagement by 47% through A/B testing"\n✅ "Managed a team of 12 engineers across 3 time zones"\n✅ "Reduced customer support tickets by 30% with automated FAQ system"\n\n❌ "Improved user engagement"\n❌ "Managed a large team"',
        icon: '📊'
      });
    }

    // No LinkedIn or URLs
    if (!cvData.urls || cvData.urls.length === 0) {
      recs.push({
        priority: 'important',
        category: 'Contact Information',
        title: 'Add your LinkedIn profile',
        body: 'Over 87% of recruiters use LinkedIn to evaluate candidates. Include your LinkedIn URL (use a custom URL like linkedin.com/in/yourname). If relevant, also add a GitHub, portfolio, or personal website link.',
        icon: '🔗'
      });
    }

    // Too many pages (by word count heuristic)
    if (wordCount > 1200) {
      recs.push({
        priority: 'important',
        category: 'Format',
        title: 'Consider shortening your CV',
        body: `Your CV is quite long (~${wordCount} words). For most professionals with under 10 years of experience, a 1-page resume (400–700 words) performs best. Focus on your most recent and relevant roles. Remove outdated skills and early-career positions.`,
        icon: '✂️'
      });
    }

    // ── Nice-to-Have Recommendations ──────────

    // No bullet points
    const bulletCount = cvData.bulletPoints ? cvData.bulletPoints.length : 0;
    if (bulletCount < 3 && wordCount > 200) {
      recs.push({
        priority: 'nice',
        category: 'Format',
        title: 'Use bullet points for readability',
        body: 'Bullet points make your CV scannable — recruiters spend an average of 7 seconds on initial review. Convert paragraph text into concise, impactful bullet points. Aim for 3–6 bullets per role.',
        icon: '📋'
      });
    }

    // No dates found
    if (!cvData.dates || cvData.dates.length === 0) {
      recs.push({
        priority: 'important',
        category: 'Content',
        title: 'Include dates for your roles',
        body: 'No employment dates were detected. Dates provide essential context about your career timeline. Use a consistent format like "Jan 2020 – Present" or "2018 – 2021". Gaps are less concerning than missing dates entirely.',
        icon: '📅'
      });
    }

    // Suggest portfolio/GitHub
    const hasGithub = /github\.com/i.test(rawText);
    const hasPortfolio = /portfolio|personal\s*website/i.test(rawText);
    if (!hasGithub && !hasPortfolio) {
      recs.push({
        priority: 'nice',
        category: 'Online Presence',
        title: 'Add a portfolio or GitHub link',
        body: 'For technical and creative roles, a portfolio or GitHub profile can set you apart. It shows real work, not just claims. Even 2–3 well-documented projects can make a strong impression.',
        icon: '🌐'
      });
    }

    // Suggest skill categorization
    if (sections.skills && sections.skills.length > 100 && !/[:|\-–—]/.test(sections.skills.substring(0, 200))) {
      recs.push({
        priority: 'nice',
        category: 'Skills',
        title: 'Categorize your skills',
        body: 'Grouping skills into categories improves readability and ATS matching:\n\n✅ "Languages: Python, JavaScript, TypeScript\nFrameworks: React, Django, Express\nTools: Docker, AWS, Git"\n\n❌ "Python JavaScript TypeScript React Django Express Docker AWS Git"',
        icon: '🗂️'
      });
    }

    // Keyword optimization
    recs.push({
      priority: 'nice',
      category: 'ATS Optimization',
      title: 'Tailor keywords to the job description',
      body: 'ATS systems rank candidates by keyword match. Before applying, review the job posting and incorporate relevant keywords naturally into your experience and skills sections. Mirror the exact phrases used in the posting.',
      icon: '🔑'
    });

    // Check category-level scores for additional recs
    if (cats['Format & Layout'] && cats['Format & Layout'].score < cats['Format & Layout'].maxScore * 0.5) {
      recs.push({
        priority: 'important',
        category: 'Format & Layout',
        title: 'Improve your CV formatting',
        body: 'Your format score is low. Use clear section headers, consistent spacing, a professional font (like Calibri, Arial, or Garamond), and adequate margins (0.5–1 inch). Avoid tables, images, and fancy templates that confuse ATS systems.',
        icon: '📐'
      });
    }

    if (cats['Language & Grammar'] && cats['Language & Grammar'].score < cats['Language & Grammar'].maxScore * 0.5) {
      recs.push({
        priority: 'important',
        category: 'Language & Grammar',
        title: 'Fix grammar and language issues',
        body: 'Multiple language issues were detected. Spelling errors and grammar mistakes are among the top reasons recruiters reject CVs. Use a tool like Grammarly or have a friend proofread your document. Write in third person and use past tense for previous roles.',
        icon: '📖'
      });
    }

    // Sort: critical → important → nice
    const priorityOrder = { critical: 0, important: 1, nice: 2 };
    recs.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return recs;
  }

  // ── Render Recommendations ────────────────────

  render(recommendations) {
    const container = document.getElementById('recommendations-list');
    if (!container) return;
    container.innerHTML = '';

    if (recommendations.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🎉</div>
          <h3 class="empty-state-title">Excellent!</h3>
          <p class="empty-state-desc">No major issues detected. Your CV is in great shape.</p>
        </div>
      `;
      return;
    }

    recommendations.forEach((rec, index) => {
      const card = document.createElement('div');
      card.className = `rec-card rec-${rec.priority} animate-fade-in-up`;
      card.style.animationDelay = `${index * 0.06}s`;
      card.style.animationFillMode = 'both';

      const priorityLabels = {
        critical: 'Critical',
        important: 'Important',
        nice: 'Nice to have'
      };

      card.innerHTML = `
        <div class="rec-header">
          <span style="font-size: 1.4rem;">${rec.icon}</span>
          <span class="rec-priority">${priorityLabels[rec.priority]}</span>
          <span class="rec-category">• ${rec.category}</span>
        </div>
        <div class="rec-title">${rec.title}</div>
        <div class="rec-body">${this._formatBody(rec.body)}</div>
      `;

      container.appendChild(card);
    });
  }

  // ── Helpers ───────────────────────────────────

  _formatBody(text) {
    // Convert ✅ / ❌ lines into styled spans, and \n into <br>
    return text
      .replace(/\n/g, '<br>')
      .replace(/✅\s*"([^"]+)"/g, '<span style="color: var(--accent-400); font-family: var(--font-mono); font-size: 0.85em;">✅ "$1"</span>')
      .replace(/❌\s*"([^"]+)"/g, '<span style="color: var(--danger-400); font-family: var(--font-mono); font-size: 0.85em;">❌ "$1"</span>');
  }
};
