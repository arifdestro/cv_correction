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
    this.editors = {};
    this.photoDataURL = null;
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
        key: 'photo',
        label: 'Profile Photo',
        icon: '📸',
        placeholder: '',
        hint: 'Upload a professional headshot (JPG/PNG, max 2MB). Recommended: square crop, neutral background.'
      },
      {
        key: 'contact',
        label: 'Contact Information',
        icon: '📇',
        placeholder: 'Full Name\nemail@example.com\n+62 812 3456 7890\nlinkedin.com/in/yourname\nJakarta, Indonesia',
        hint: 'Include name, email, phone with country code, LinkedIn URL, and city.'
      },
      {
        key: 'tagline',
        label: 'Tagline / Job Title',
        icon: '💎',
        placeholder: 'Senior Software Engineer | Full Stack Developer',
        hint: 'A short tagline that appears below your name. Use your current job title or desired position.'
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
        placeholder: 'JavaScript, Python, React, Node.js, PostgreSQL, Docker, AWS, Git, Agile, CI/CD',
        hint: 'Enter skills separated by commas. They will be displayed as visual tags/pills in the final CV.'
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
      const content = def.key === 'photo' || def.key === 'tagline'
        ? (this.correctedSections[def.key] || '')
        : (this.correctedSections[def.key] !== undefined 
            ? this.correctedSections[def.key] 
            : (this.cvData.sections?.[def.key] || ''));
      
      const hasContent = def.key === 'photo' ? !!this.photoDataURL : content.trim().length > 0;
      const autoFixApplied = def.key !== 'photo' && def.key !== 'tagline' && content !== (this.cvData.sections?.[def.key] || '');

      html += `
        <div class="builder-section animate-fade-in-up" style="animation-delay: ${index * 0.06}s; animation-fill-mode: both;">
          <div class="builder-section-header">
            <span class="builder-section-icon">${def.icon}</span>
            <span class="builder-section-label">${def.label}</span>
            ${def.key === 'photo' && !hasContent ? '<span class="builder-badge builder-badge-missing">Optional</span>' : ''}
            ${def.key !== 'photo' && !hasContent ? '<span class="builder-badge builder-badge-missing">Missing</span>' : ''}
            ${autoFixApplied && hasContent ? '<span class="builder-badge builder-badge-fixed">Auto-fixed</span>' : ''}
          </div>
          <div class="builder-hint">${def.hint}</div>
      `;

      if (def.key === 'photo') {
        html += `
          <div class="builder-photo-upload" id="builder-photo-upload">
            <div class="photo-preview-container" id="photo-preview-container" style="display: ${this.photoDataURL ? 'flex' : 'none'};">
              <img id="photo-preview" src="${this.photoDataURL || ''}" alt="Profile Photo" class="photo-preview-img">
              <button class="btn btn-ghost btn-sm photo-remove-btn" id="btn-remove-photo" type="button">✕ Remove</button>
            </div>
            <label class="photo-upload-label" id="photo-upload-label" style="display: ${this.photoDataURL ? 'none' : 'flex'};">
              <span class="photo-upload-icon">📷</span>
              <span class="photo-upload-text">Click to upload photo</span>
              <span class="photo-upload-subtext">JPG or PNG, max 2MB</span>
              <input type="file" accept="image/jpeg,image/png,image/webp" id="photo-input" class="photo-input-hidden">
            </label>
          </div>
        </div>`;
      } else if (def.key === 'contact' || def.key === 'tagline') {
        const rows = def.key === 'tagline' ? 2 : this._getRows(def.key);
        html += `
          <textarea
            class="builder-textarea"
            id="builder-field-${def.key}"
            data-section="${def.key}"
            placeholder="${def.placeholder}"
            rows="${rows}"
          >${this._escapeHTML(content)}</textarea>
        </div>`;
      } else if (def.key === 'skills') {
        html += `
          <textarea
            class="builder-textarea"
            id="builder-field-${def.key}"
            data-section="${def.key}"
            placeholder="${def.placeholder}"
            rows="4"
          >${this._escapeHTML(content)}</textarea>
          <div class="skills-preview" id="skills-preview"></div>
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
    const quillSections = ['summary', 'experience', 'education', 'other'];
    if (typeof Quill !== 'undefined') {
      sectionDefs.forEach(def => {
        if (quillSections.includes(def.key)) {
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

    // Bind photo events
    this._bindPhotoEvents();

    // Bind skills preview
    this._bindSkillsPreview();
  }

  // ── Photo Handling ─────────────────────────────

  _bindPhotoEvents() {
    const photoInput = document.getElementById('photo-input');
    const removeBtn = document.getElementById('btn-remove-photo');

    if (photoInput) {
      photoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
          if (window.app) window.app.showToast('Please upload a JPG or PNG image', '⚠️');
          return;
        }
        if (file.size > 2 * 1024 * 1024) {
          if (window.app) window.app.showToast('Image must be under 2MB', '⚠️');
          return;
        }

        const reader = new FileReader();
        reader.onload = (ev) => {
          this.photoDataURL = ev.target.result;
          const preview = document.getElementById('photo-preview');
          const previewContainer = document.getElementById('photo-preview-container');
          const uploadLabel = document.getElementById('photo-upload-label');

          if (preview) preview.src = this.photoDataURL;
          if (previewContainer) previewContainer.style.display = 'flex';
          if (uploadLabel) uploadLabel.style.display = 'none';

          if (window.app) window.app.showToast('Photo uploaded successfully', '📸');
        };
        reader.readAsDataURL(file);
      });
    }

    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        this.photoDataURL = null;
        const preview = document.getElementById('photo-preview');
        const previewContainer = document.getElementById('photo-preview-container');
        const uploadLabel = document.getElementById('photo-upload-label');
        const photoInput2 = document.getElementById('photo-input');

        if (preview) preview.src = '';
        if (previewContainer) previewContainer.style.display = 'none';
        if (uploadLabel) uploadLabel.style.display = 'flex';
        if (photoInput2) photoInput2.value = '';
      });
    }
  }

  // ── Skills Preview ─────────────────────────────

  _bindSkillsPreview() {
    const skillsField = document.getElementById('builder-field-skills');
    const skillsPreview = document.getElementById('skills-preview');

    if (skillsField && skillsPreview) {
      const updatePreview = () => {
        const val = skillsField.value.trim();
        if (!val) {
          skillsPreview.innerHTML = '<span style="color:var(--text-tertiary); font-size: var(--text-xs);">Skills preview will appear here...</span>';
          return;
        }
        const skills = val.split(/[,;\n]+/).map(s => s.trim()).filter(s => s.length > 0);
        skillsPreview.innerHTML = skills.map(s => `<span class="skill-pill">${this._escapeHTML(s)}</span>`).join('');
      };

      skillsField.addEventListener('input', updatePreview);
      updatePreview();
    }
  }

  // ── Collect Edited Data ───────────────────────

  collectData() {
    const data = {};
    
    const contactField = document.getElementById('builder-field-contact');
    if (contactField) data.contact = contactField.value.trim();

    const taglineField = document.getElementById('builder-field-tagline');
    if (taglineField) data.tagline = taglineField.value.trim();

    const skillsField = document.getElementById('builder-field-skills');
    if (skillsField) data.skills = skillsField.value.trim();
    
    Object.keys(this.editors).forEach(key => {
      const editor = this.editors[key];
      data[key] = editor.root.innerHTML;
    });

    data._photo = this.photoDataURL || null;

    return data;
  }

  // ── Generate Clean HTML ───────────────────────

  generateHTML(sections) {
    const contact = sections.contact || '';
    const contactLines = contact.split('\n').filter(l => l.trim());
    const name = contactLines[0] || 'Your Name';
    const tagline = sections.tagline || '';

    const emails = contact.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g) || [];
    const phones = contact.match(/(?:\+?\d{1,3}[\-.\s]?)?\(?\d{2,4}\)?[\-.\s]?\d{3,4}[\-.\s]?\d{3,4}/g) || [];
    const urls = contact.match(/(?:https?:\/\/|www\.)[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}(?:\/[^\s)]*)?/gi) || [];
    const locations = contactLines.filter(l => !emails.some(e => l.includes(e)) && !phones.some(p => l.includes(p)) && !urls.some(u => l.includes(u)) && l !== name);

    const photoHTML = sections._photo 
      ? `<img src="${sections._photo}" alt="Profile Photo" style="width:100px; height:100px; border-radius:50%; object-fit:cover; border: 3px solid #6c63ff; flex-shrink:0;">`
      : '';

    const sectionHTML = (title, content, icon) => {
      if (!content || !content.trim() || content === '<p><br></p>') return '';
      return `
        <div class="cv-section">
          <h2><span class="section-icon">${icon || ''}</span> ${title}</h2>
          <div class="section-content">
            ${content}
          </div>
        </div>
      `;
    };

    const skillsRaw = sections.skills || '';
    const skillsList = skillsRaw.split(/[,;\n]+/).map(s => s.trim()).filter(s => s.length > 0);
    const skillsHTML = skillsList.length > 0
      ? `<div class="cv-section">
          <h2><span class="section-icon">⚡</span> Skills</h2>
          <div class="skills-container">
            ${skillsList.map(s => `<span class="skill-tag">${this._escapeHTML(s)}</span>`).join('')}
          </div>
        </div>`
      : '';

    const contactItems = [];
    if (emails.length) contactItems.push(...emails.map(e => `<span class="contact-item"><span class="ci-icon">✉</span> <a href="mailto:${e}">${e}</a></span>`));
    if (phones.length) contactItems.push(...phones.map(p => `<span class="contact-item"><span class="ci-icon">📱</span> ${p}</span>`));
    if (urls.length) contactItems.push(...urls.map(u => `<span class="contact-item"><span class="ci-icon">🔗</span> <a href="${u.startsWith('http') ? u : 'https://' + u}" target="_blank">${u}</a></span>`));
    if (locations.length) contactItems.push(...locations.map(l => `<span class="contact-item"><span class="ci-icon">📍</span> ${this._escapeHTML(l)}</span>`));

    return `<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    .cv-page {
      font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
      color: #2d2d3a;
      background: #fff;
      max-width: 800px;
      margin: 0 auto;
      line-height: 1.55;
      font-size: 10.5pt;
    }
    .cv-header {
      display: flex;
      align-items: center;
      gap: 20px;
      padding-bottom: 16px;
      border-bottom: 3px solid #6c63ff;
      margin-bottom: 20px;
    }
    .cv-header-info { flex: 1; }
    .cv-header h1 {
      font-size: 26pt;
      font-weight: 800;
      color: #1a1a2e;
      margin-bottom: 2px;
      letter-spacing: -0.5px;
    }
    .cv-header .tagline {
      font-size: 12pt;
      font-weight: 600;
      color: #6c63ff;
      margin-bottom: 10px;
    }
    .contact-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 6px 16px;
      font-size: 9pt;
      color: #555;
    }
    .contact-item { display: inline-flex; align-items: center; gap: 4px; }
    .ci-icon { font-size: 10px; }
    .contact-bar a { color: #6c63ff; text-decoration: none; }
    .cv-section { margin-bottom: 16px; }
    .cv-section h2 {
      font-size: 11pt;
      font-weight: 700;
      text-transform: uppercase;
      color: #6c63ff;
      border-bottom: 2px solid #e8e8f0;
      padding-bottom: 4px;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .section-icon { font-size: 12px; }
    .section-content { font-size: 10.5pt; }
    .section-content p { margin: 2px 0; }
    .section-content strong { color: #1a1a2e; }
    .section-content ul { list-style-type: disc; margin: 4px 0 8px 18px; padding: 0; }
    .section-content li { margin-bottom: 3px; }
    .section-content a { color: #6c63ff; text-decoration: none; border-bottom: 1px dotted #6c63ff; }
    .skills-container { display: flex; flex-wrap: wrap; gap: 6px; }
    .skill-tag {
      background: #f0eeff;
      color: #4a42d0;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 9pt;
      font-weight: 600;
      border: 1px solid #ddd8ff;
    }
  </style>

  <div class="cv-page">
    <header class="cv-header">
      ${photoHTML}
      <div class="cv-header-info">
        <h1>${this._escapeHTML(name)}</h1>
        ${tagline ? `<div class="tagline">${this._escapeHTML(tagline)}</div>` : ''}
        <div class="contact-bar">
          ${contactItems.join('')}
        </div>
      </div>
    </header>

    ${sectionHTML('Professional Summary', sections.summary, '🎯')}
    ${sectionHTML('Professional Experience', sections.experience, '💼')}
    ${sectionHTML('Education', sections.education, '🎓')}
    ${skillsHTML}
    ${sectionHTML('Additional', sections.other, '🏆')}
  </div>`;
  }

  // ── Download ──────────────────────────────────

  downloadPDF() {
    const sections = this.collectData();
    const htmlFragment = this.generateHTML(sections);

    const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CV - Resume</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
      color: #2d2d3a;
      background: #fff;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 50px;
      line-height: 1.55;
    }
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

    const blob = new Blob([fullHTML], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');

    if (win) {
      win.addEventListener('load', () => {
        setTimeout(() => win.print(), 500);
      });
      if (window.app) window.app.showToast('CV opened — choose "Save as PDF" in the print dialog', '📄');
    } else {
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
    @page { size: A4; margin: 2.54cm; }
    body {
      font-family: 'Calibri', 'Segoe UI', Arial, sans-serif;
      font-size: 11pt;
      color: #2d2d3a;
      line-height: 1.5;
    }
    h1 {
      font-size: 22pt;
      font-weight: bold;
      color: #1a1a2e;
      margin-bottom: 4px;
    }
    h2 {
      font-size: 12pt;
      font-weight: bold;
      text-transform: uppercase;
      color: #6c63ff;
      border-bottom: 2px solid #6c63ff;
      padding-bottom: 4px;
      margin-top: 16px;
      margin-bottom: 8px;
    }
    p { margin: 2px 0; }
    ul { margin: 4px 0 8px 18px; padding: 0; }
    li { margin-bottom: 3px; }
    a { color: #6c63ff; text-decoration: underline; }
    .contact-bar { font-size: 10pt; color: #555; margin-bottom: 16px; }
    .contact-bar a { color: #6c63ff; text-decoration: none; }
    .tagline { font-size: 12pt; font-weight: bold; color: #6c63ff; margin-bottom: 8px; }
    .skill-tag {
      display: inline-block;
      background: #f0eeff;
      color: #4a42d0;
      padding: 3px 10px;
      border-radius: 12px;
      font-size: 9pt;
      font-weight: bold;
      margin: 2px 3px 2px 0;
      border: 1px solid #ddd8ff;
    }
    .skills-container { margin-top: 4px; }
    table { border-collapse: collapse; }
  </style>
</head>
<body>
  ${htmlFragment}
</body>
</html>`;

    const blob = new Blob(['\ufeff' + wordHTML], { type: 'application/msword' });
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

      const bulletMatch = trimmed.match(/^[•●○◦▪▸►\-–—*→➤➜✓✔☑■]\s*(.*)/);
      if (bulletMatch) {
        if (!inList) { html += '<ul>'; inList = true; }
        html += `<li>${this._escapeHTML(bulletMatch[1])}</li>`;
        return;
      }
      
      if (inList) { html += '</ul>'; inList = false; }
      
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
    const rowMap = { contact: 5, summary: 4, experience: 14, education: 5, skills: 4, other: 6, tagline: 2 };
    return rowMap[key] || 6;
  }
};
