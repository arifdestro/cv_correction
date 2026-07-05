/* ============================================
   CV Assessment Pro — CV Builder / Converter
   Generates an improved, ATS-friendly CV from
   parsed data + scoring results
   ============================================ */

window.CVBuilder = class CVBuilder {
  constructor() {
    this.cvData = null;
    this.results = null;
    this.correctedSections = {};
    this.bindEvents();
  }

  // ── Event Binding ─────────────────────────────

  bindEvents() {
    const btnBuild = document.getElementById('btn-build-cv');
    const btnBack = document.getElementById('btn-builder-back');
    const btnDownload = document.getElementById('btn-builder-download');

    if (btnBuild) btnBuild.addEventListener('click', () => this.open(window.app.currentCvData, window.app.currentResults));
    if (btnBack) btnBack.addEventListener('click', () => this.close());
    if (btnDownload) btnDownload.addEventListener('click', () => this.download());
  }

  // ── Open Builder ──────────────────────────────

  open(cvData, results) {
    if (!cvData) {
      if (window.app) window.app.showToast('No CV data available. Analyze a CV first.', '⚠️');
      return;
    }

    this.cvData = cvData;
    this.results = results;
    this.correctedSections = this.autoCorrect(cvData, results);
    this.renderEditor();

    // Show builder, hide results
    const builder = document.getElementById('section-builder');
    const results_el = document.getElementById('section-results');
    if (results_el) results_el.classList.remove('active');
    if (builder) {
      builder.classList.add('active');
      builder.style.animation = 'fadeInUp 0.4s ease-out';
      builder.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // ── Close Builder ─────────────────────────────

  close() {
    const builder = document.getElementById('section-builder');
    const results_el = document.getElementById('section-results');
    if (builder) builder.classList.remove('active');
    if (results_el) {
      results_el.classList.add('active');
      results_el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // ── Auto-Correct ──────────────────────────────

  autoCorrect(cvData, results) {
    const sections = { ...cvData.sections };
    const corrected = {};

    for (const [key, text] of Object.entries(sections)) {
      let fixed = text || '';

      // 1. Fix common spelling errors
      const errors = window.COMMON_SPELLING_ERRORS || {};
      for (const [wrong, right] of Object.entries(errors)) {
        const regex = new RegExp('\\b' + wrong + '\\b', 'gi');
        fixed = fixed.replace(regex, right);
      }

      // 2. Remove personal pronouns at start of bullet lines
      //    "I managed a team" → "Managed a team"
      //    "I have developed" → "Developed"
      fixed = fixed.replace(/^[\s•\-–—*►▪]*\bI\s+(have\s+|had\s+|am\s+|was\s+)?/gim, (match) => {
        const bullet = match.match(/^[\s•\-–—*►▪]*/)?.[0] || '';
        return bullet;
      });

      // Clean up "my " at start of lines
      fixed = fixed.replace(/^([\s•\-–—*►▪]*)\bMy\s+/gim, '$1');

      // 3. Remove filler words
      const fillers = window.FILLER_WORDS || [];
      for (const filler of fillers) {
        const regex = new RegExp('\\b' + filler + '\\b\\s*', 'gi');
        fixed = fixed.replace(regex, ' ');
      }

      // 4. Remove unprofessional phrases
      const unprofessional = window.UNPROFESSIONAL_PHRASES || [];
      for (const phrase of unprofessional) {
        const regex = new RegExp('\\b' + phrase.replace(/\s+/g, '\\s+') + '\\b', 'gi');
        fixed = fixed.replace(regex, '');
      }

      // 5. Clean up multiple spaces
      fixed = fixed.replace(/  +/g, ' ').trim();

      corrected[key] = fixed;
    }

    return corrected;
  }

  // ── Render Editor ─────────────────────────────

  renderEditor() {
    const container = document.getElementById('builder-editor');
    if (!container) return;

    const sectionDefs = [
      {
        key: 'contact',
        label: 'Contact Information',
        icon: '📇',
        placeholder: 'Full Name\nemail@example.com\n+62 812 3456 7890\nlinkedin.com/in/yourname\nJakarta, Indonesia',
        hint: 'Include name, email, phone with country code, LinkedIn URL, and city.'
      },
      {
        key: 'summary',
        label: 'Professional Summary',
        icon: '🎯',
        placeholder: 'Results-driven software engineer with 5+ years of experience building scalable web applications. Expert in React and Node.js with a proven track record of reducing load times by 40% and increasing user engagement by 25%.',
        hint: '2-4 sentences. Include measurable achievements, years of experience, and key skills. No personal pronouns.'
      },
      {
        key: 'experience',
        label: 'Work Experience',
        icon: '💼',
        placeholder: 'Senior Software Engineer | PT Technology Indonesia | Jan 2021 – Present\n• Led migration of legacy monolith to microservices architecture, reducing deployment time by 60%\n• Managed a team of 8 developers across 3 projects with 100% on-time delivery\n• Implemented automated CI/CD pipeline using Jenkins and Docker\n\nSoftware Engineer | PT Digital Solutions | Mar 2018 – Dec 2020\n• Developed RESTful APIs serving 50,000+ daily active users\n• Reduced database query times by 45% through query optimization',
        hint: 'Reverse chronological. Start each bullet with an action verb. Include measurable results (%, $, numbers).'
      },
      {
        key: 'education',
        label: 'Education',
        icon: '🎓',
        placeholder: 'Bachelor of Computer Science | Universitas Indonesia | 2014 – 2018\nGPA: 3.75/4.00\nRelevant Coursework: Data Structures, Algorithms, Database Systems',
        hint: 'Include degree, institution, graduation year. Add GPA if > 3.5 (for fresh graduates).'
      },
      {
        key: 'skills',
        label: 'Skills',
        icon: '⚡',
        placeholder: 'Programming Languages: Python, JavaScript, TypeScript, Java\nFrameworks: React, Next.js, Express, Django\nDatabases: PostgreSQL, MongoDB, Redis\nTools & Platforms: Docker, AWS, Git, Jenkins, Jira\nMethodologies: Agile/Scrum, CI/CD, TDD',
        hint: 'Group skills by category. List specific tools and technologies, not vague traits.'
      },
      {
        key: 'other',
        label: 'Additional (Certifications, Awards, Languages)',
        icon: '🏆',
        placeholder: 'Certifications:\n• AWS Certified Solutions Architect – Associate (2023)\n• Google Cloud Professional Data Engineer (2022)\n\nLanguages:\n• English — Professional Proficiency\n• Indonesian — Native',
        hint: 'Include certifications, awards, publications, volunteer work, or language proficiencies.'
      }
    ];

    let html = '';

    sectionDefs.forEach((def, index) => {
      const content = this.correctedSections[def.key] || '';
      const hasContent = content.trim().length > 0;
      const autoFixApplied = content !== (this.cvData.sections?.[def.key] || '');

      html += `
        <div class="builder-section animate-fade-in-up" style="animation-delay: ${index * 0.06}s; animation-fill-mode: both;">
          <div class="builder-section-header">
            <span class="builder-section-icon">${def.icon}</span>
            <span class="builder-section-label">${def.label}</span>
            ${!hasContent ? '<span class="builder-badge builder-badge-missing">Missing</span>' : ''}
            ${autoFixApplied && hasContent ? '<span class="builder-badge builder-badge-fixed">Auto-fixed</span>' : ''}
          </div>
          <div class="builder-hint">${def.hint}</div>
          <textarea
            class="builder-textarea"
            id="builder-field-${def.key}"
            data-section="${def.key}"
            placeholder="${def.placeholder}"
            rows="${this._getRows(def.key)}"
          >${this._escapeHTML(content)}</textarea>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  // ── Collect Edited Data ───────────────────────

  collectData() {
    const data = {};
    const fields = document.querySelectorAll('.builder-textarea');
    fields.forEach(field => {
      data[field.dataset.section] = field.value.trim();
    });
    return data;
  }

  // ── Generate Clean HTML ───────────────────────

  generateHTML(sections) {
    const contact = sections.contact || '';
    const contactLines = contact.split('\n').filter(l => l.trim());
    const name = contactLines[0] || 'Your Name';
    const contactDetails = contactLines.slice(1).join(' • ');

    // Extract emails and phones for special formatting
    const emails = contact.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g) || [];
    const phones = contact.match(/(?:\+?\d{1,3}[\-.\s]?)?\(?\d{2,4}\)?[\-.\s]?\d{3,4}[\-.\s]?\d{3,4}/g) || [];
    const urls = contact.match(/(?:https?:\/\/|www\.)[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}(?:\/[^\s)]*)?/gi) || [];

    const sectionHTML = (title, content) => {
      if (!content || !content.trim()) return '';
      const lines = content.split('\n');
      let body = '';

      lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) {
          body += '<div style="height:6px;"></div>';
          return;
        }

        // Detect bullet points
        const bulletMatch = trimmed.match(/^[•●○◦▪▸►\-–—*→➤➜✓✔☑■]\s*(.*)/);
        if (bulletMatch) {
          body += `<li>${this._escapeHTML(bulletMatch[1])}</li>`;
          return;
        }

        // Detect sub-headers (lines with | or — separators, like "Job Title | Company | Date")
        if (/[|–—]/.test(trimmed) && trimmed.length < 120) {
          body += `<p style="font-weight:600; margin:10px 0 2px 0; color:#1a1a2e;">${this._escapeHTML(trimmed)}</p>`;
          return;
        }

        // Detect category labels (ending with :)
        if (trimmed.endsWith(':') && trimmed.length < 60) {
          body += `<p style="font-weight:600; margin:10px 0 2px 0; color:#1a1a2e;">${this._escapeHTML(trimmed)}</p>`;
          return;
        }

        body += `<p style="margin:2px 0;">${this._escapeHTML(trimmed)}</p>`;
      });

      // Wrap consecutive <li> in <ul>
      body = body.replace(/(<li>.*?<\/li>(\s*<li>.*?<\/li>)*)/gs, '<ul style="margin:4px 0 8px 18px; padding:0;">$1</ul>');

      return `
        <div style="margin-bottom:16px;">
          <h2 style="font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px; color:#6c63ff; border-bottom:2px solid #6c63ff; padding-bottom:4px; margin-bottom:8px;">${title}</h2>
          <div style="font-size:11pt; line-height:1.55; color:#2d2d3a;">
            ${body}
          </div>
        </div>
      `;
    };

    return `<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    #print-area * { box-sizing: border-box; }
    #print-area {
      font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
      color: #2d2d3a;
      background: #fff;
      max-width: 800px;
      margin: 0 auto;
      line-height: 1.5;
    }
    #print-area h1 { font-size: 24pt; font-weight: 800; color: #1a1a2e; margin-bottom: 4px; }
    #print-area .contact-bar { font-size: 10pt; color: #555; margin-bottom: 20px; word-break: break-all; }
    #print-area .contact-bar a { color: #6c63ff; text-decoration: none; }
    #print-area ul { list-style-type: disc; }
    #print-area li { margin-bottom: 3px; }
  </style>

  <header>
    <h1>${this._escapeHTML(name)}</h1>
    <div class="contact-bar">
      ${emails.map(e => `<a href="mailto:${e}">${e}</a>`).join(' • ')}
      ${phones.length ? ' • ' + phones.join(' • ') : ''}
      ${urls.map(u => ` • <a href="${u.startsWith('http') ? u : 'https://' + u}" target="_blank">${u}</a>`).join('')}
      ${contactLines.filter(l => !emails.some(e => l.includes(e)) && !phones.some(p => l.includes(p)) && !urls.some(u => l.includes(u)) && l !== name).map(l => ' • ' + this._escapeHTML(l)).join('')}
    </div>
  </header>

  ${sectionHTML('Professional Summary', sections.summary)}
  ${sectionHTML('Professional Experience', sections.experience)}
  ${sectionHTML('Education', sections.education)}
  ${sectionHTML('Skills', sections.skills)}
  ${sectionHTML('Additional', sections.other)}`;
  }

  // ── Download ──────────────────────────────────

  download() {
    const sections = this.collectData();
    const htmlFragment = this.generateHTML(sections);
    
    const printArea = document.getElementById('print-area');
    if (!printArea) {
      if (window.app) window.app.showToast('Print area not found.', '⚠️');
      return;
    }

    if (window.app) window.app.showToast('Opening print dialog. Save as PDF!', '📄');
    
    // Inject content
    printArea.innerHTML = htmlFragment;
    
    // Slight delay to ensure styles/fonts are applied before printing
    setTimeout(() => {
      window.print();
      // Clean up after print dialog closes
      setTimeout(() => {
        printArea.innerHTML = '';
      }, 1000);
    }, 300);
  // ── Helpers ───────────────────────────────────

  _escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  _getRows(key) {
    const rowMap = { contact: 5, summary: 4, experience: 14, education: 5, skills: 7, other: 6 };
    return rowMap[key] || 6;
  }
};
