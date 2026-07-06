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
    const btnWord = document.getElementById('btn-builder-download-word');
    const btnPdf = document.getElementById('btn-builder-download-pdf');

    if (btnBuild) btnBuild.addEventListener('click', () => this.open(window.app.currentCvData, window.app.currentResults));
    if (btnBack) btnBack.addEventListener('click', () => this.close());
    if (btnWord) btnWord.addEventListener('click', () => this.downloadWord());
    if (btnPdf) btnPdf.addEventListener('click', () => this.downloadPDF());
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
        placeholder: 'Results-driven software engineer with 5+ years of experience...',
        hint: '2-4 sentences. Include measurable achievements, years of experience, and key skills. No personal pronouns.'
      },
      {
        key: 'experience',
        label: 'Work Experience',
        icon: '💼',
        placeholder: 'Senior Software Engineer | Company | Jan 2021 – Present\n• Achievement 1\n• Achievement 2',
        hint: 'Reverse chronological. Start each bullet with an action verb. Include measurable results (%, $, numbers).'
      },
      {
        key: 'education',
        label: 'Education',
        icon: '🎓',
        placeholder: 'Bachelor of Computer Science | University | 2014 – 2018\nGPA: 3.75/4.00',
        hint: 'Include degree, institution, graduation year. Add GPA if > 3.5 (for fresh graduates).'
      },
      {
        key: 'skills',
        label: 'Skills',
        icon: '⚡',
        placeholder: 'Programming: Python, JavaScript\nFrameworks: React, Node.js',
        hint: 'Group skills by category. List specific tools and technologies, not vague traits.'
      },
      {
        key: 'other',
        label: 'Additional (Certifications, Awards, Languages)',
        icon: '🏆',
        placeholder: 'Certifications:\n• AWS Certified (2023)',
        hint: 'Include certifications, awards, publications, volunteer work, or language proficiencies.'
      }
    ];

    let html = '';

    sectionDefs.forEach((def, index) => {
      const content = this.correctedSections[def.key] !== undefined 
        ? this.correctedSections[def.key] 
        : (this.cvData.sections?.[def.key] || '');
      
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
      `;

      if (def.key === 'contact') {
        html += `
          <textarea
            class="builder-textarea"
            id="builder-field-${def.key}"
            data-section="${def.key}"
            placeholder="${def.placeholder}"
            rows="${this._getRows(def.key)}"
          >${this._escapeHTML(content)}</textarea>
        </div>`;
      } else {
        html += `
          <div class="builder-quill-container">
            <div id="builder-field-${def.key}" data-section="${def.key}">${this._textToHTML(content)}</div>
          </div>
        </div>`;
      }
    });

    container.innerHTML = html;

    // Initialize Quill Editors
    this.editors = {};
    if (typeof Quill !== 'undefined') {
      sectionDefs.forEach(def => {
        if (def.key !== 'contact') {
          this.editors[def.key] = new Quill(`#builder-field-${def.key}`, {
            theme: 'snow',
            modules: {
              toolbar: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'align': [] }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                ['link'],
                ['clean']
              ]
            },
            placeholder: def.placeholder.split('\n')[0] + '...'
          });
        }
      });
    }
  }

  // ── Collect Edited Data ───────────────────────

  collectData() {
    const data = {};
    
    // Collect contact textarea
    const contactField = document.getElementById('builder-field-contact');
    if (contactField) {
      data.contact = contactField.value.trim();
    }
    
    // Collect Quill editors
    Object.keys(this.editors).forEach(key => {
      const editor = this.editors[key];
      // Get HTML directly from Quill
      data[key] = editor.root.innerHTML;
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
      if (!content || !content.trim() || content === '<p><br></p>') return '';
      return `
        <div style="margin-bottom:16px;">
          <h2>${title}</h2>
          <div class="section-content">
            ${content}
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
    #print-area ul { list-style-type: disc; margin: 4px 0 8px 18px; padding: 0; }
    #print-area li { margin-bottom: 3px; }
    #print-area .section-content a { color: #6c63ff; text-decoration: none; border-bottom: 1px dotted #6c63ff; }
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

  downloadPDF() {
    const sections = this.collectData();
    const htmlFragment = this.generateHTML(sections);

    // Build a full standalone HTML page for the PDF
    const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CV - Resume</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
      color: #2d2d3a;
      background: #fff;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 50px;
      line-height: 1.5;
    }
    h1 { font-size: 24pt; font-weight: 800; color: #1a1a2e; margin-bottom: 4px; }
    h2 { font-size: 13px; font-weight: 700; text-transform: uppercase; color: #6c63ff; border-bottom: 2px solid #6c63ff; padding-bottom: 4px; margin-bottom: 8px; margin-top: 16px; }
    .contact-bar { font-size: 10pt; color: #555; margin-bottom: 20px; }
    .contact-bar a { color: #6c63ff; text-decoration: none; }
    ul { list-style-type: disc; margin: 4px 0 8px 18px; padding: 0; }
    li { margin-bottom: 3px; }
    p { margin: 2px 0; }
    .section-content a { color: #6c63ff; text-decoration: none; border-bottom: 1px dotted #6c63ff; }
    @media print {
      body { padding: 0; max-width: 100%; }
      @page { margin: 0.6in; size: A4; }
    }
  </style>
</head>
<body>
  ${htmlFragment}
</body>
</html>`;

    // Open in a new tab as a real HTML page
    const blob = new Blob([fullHTML], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');

    if (win) {
      win.addEventListener('load', () => {
        setTimeout(() => win.print(), 500);
      });
      if (window.app) window.app.showToast('CV opened — choose "Save as PDF" in the print dialog', '📄');
    } else {
      // Popup blocked — download HTML file instead
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Improved-CV.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      if (window.app) window.app.showToast('Open the downloaded HTML file in browser, then Print → Save as PDF', '📄');
    }

    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  // ── Download Word ─────────────────────────────

  downloadWord() {
    const sections = this.collectData();
    const htmlFragment = this.generateHTML(sections);

    // Wrap in a Word-compatible HTML document with XML namespaces
    const wordHTML = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page {
      size: A4;
      margin: 2.54cm;
    }
    body {
      font-family: 'Calibri', 'Segoe UI', Arial, sans-serif;
      font-size: 11pt;
      color: #2d2d3a;
      line-height: 1.5;
    }
    h1 {
      font-family: 'Calibri', 'Segoe UI', Arial, sans-serif;
      font-size: 22pt;
      font-weight: bold;
      color: #1a1a2e;
      margin-bottom: 4px;
    }
    h2 {
      font-family: 'Calibri', 'Segoe UI', Arial, sans-serif;
      font-size: 12pt;
      font-weight: bold;
      text-transform: uppercase;
      color: #6c63ff;
      border-bottom: 2px solid #6c63ff;
      padding-bottom: 4px;
      margin-top: 16px;
      margin-bottom: 8px;
    }
    p {
      margin: 2px 0;
    }
    ul {
      margin: 4px 0 8px 18px;
      padding: 0;
    }
    li {
      margin-bottom: 3px;
    }
    a {
      color: #6c63ff;
      text-decoration: underline;
    }
    .contact-bar {
      font-size: 10pt;
      color: #555;
      margin-bottom: 16px;
    }
    .contact-bar a {
      color: #6c63ff;
      text-decoration: none;
    }
    table {
      border-collapse: collapse;
    }
  </style>
</head>
<body>
  ${htmlFragment}
</body>
</html>`;

    // Create blob with Word MIME type
    const blob = new Blob(['\ufeff' + wordHTML], {
      type: 'application/msword'
    });

    // Trigger download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Improved-CV.doc';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);

    if (window.app) window.app.showToast('Word document downloaded! Open in Word to edit.', '✅');
  }

  // ── Helpers ───────────────────────────────────

  _textToHTML(text) {
    if (!text) return '';
    const lines = text.split('\n');
    let html = '';
    let inList = false;

    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) {
        if (inList) { html += '</ul>'; inList = false; }
        html += '<p><br></p>';
        return;
      }

      // Convert manual bullets to HTML list
      const bulletMatch = trimmed.match(/^[•●○◦▪▸►\-–—*→➤➜✓✔☑■]\s*(.*)/);
      if (bulletMatch) {
        if (!inList) { html += '<ul>'; inList = true; }
        html += `<li>${this._escapeHTML(bulletMatch[1])}</li>`;
        return;
      }
      
      if (inList) { html += '</ul>'; inList = false; }
      
      // Convert bold headers like "Job | Company"
      if (/[|–—]/.test(trimmed) && trimmed.length < 120) {
        html += `<p><strong>${this._escapeHTML(trimmed)}</strong></p>`;
        return;
      }
      
      html += `<p>${this._escapeHTML(trimmed)}</p>`;
    });

    if (inList) html += '</ul>';
    return html;
  }

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
