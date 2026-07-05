/* ============================================
   CV Assessment Pro — File Parser
   Extracts text from PDF, DOCX, TXT and
   detects CV sections + metadata
   ============================================ */

window.FileParser = class FileParser {
  constructor() {
    // Configure PDF.js worker
    if (typeof pdfjsLib !== 'undefined') {
      try {
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      } catch (e) {
        console.warn('PDF.js worker config failed, will use workerless mode:', e);
      }
    }

    // Section header patterns grouped by semantic meaning
    this.sectionPatterns = {
      contact: /^(contact\s*(info(rmation)?)?|personal\s*(info(rmation)?|details)?|address)/i,
      summary: /^(summary|professional\s*summary|executive\s*summary|objective|career\s*objective|profile|about(\s*me)?|personal\s*statement|overview)/i,
      experience: /^(experience|work\s*(experience|history)|professional\s*experience|employment(\s*history)?|career\s*history|relevant\s*experience|positions?\s*held)/i,
      education: /^(education|academic(\s*background|s)?|qualifications?|degrees?|training|academic\s*credentials)/i,
      skills: /^(skills?|technical\s*skills?|core\s*competenc(ies|y)|key\s*skills?|areas?\s*of\s*expertise|proficienc(ies|y)|technologies|tools?(\s*&\s*technologies)?|competenc(ies|y))/i,
      projects: /^(projects?|key\s*projects?|notable\s*projects?|portfolio)/i,
      certifications: /^(certifications?|licenses?(\s*&\s*certifications?)?|professional\s*certifications?|accreditations?|credentials?)/i,
      awards: /^(awards?(\s*&\s*honors?)?|honors?(\s*&\s*awards?)?|achievements?|recognitions?|accomplishments?)/i,
      publications: /^(publications?|research(\s*papers?)?|papers?|presentations?|conference\s*papers?)/i,
      languages: /^(languages?|language\s*skills?|language\s*proficienc(ies|y))/i,
      interests: /^(interests?|hobbies(\s*&\s*interests?)?|activities|extracurricular(\s*activities)?|personal\s*interests?)/i,
      volunteer: /^(volunteer(ing)?(\s*(experience|work))?|community\s*(service|involvement)|civic\s*activities)/i,
      references: /^(references?|referees?|recommendations?)/i
    };
  }

  // ── Main Entry Point ──────────────────────────

  async parseFile(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    let rawText = '';

    switch (ext) {
      case 'pdf':
        rawText = await this.extractPDF(file);
        break;
      case 'docx':
      case 'doc':
        rawText = await this.extractDOCX(file);
        break;
      case 'txt':
        rawText = await this.extractTXT(file);
        break;
      default:
        throw new Error(`Unsupported file type: .${ext}`);
    }

    // Clean up the text
    rawText = this._cleanText(rawText);

    const lines = rawText.split('\n');
    const sections = this.detectSections(rawText);
    const metadata = this.extractMetadata(rawText);
    const bulletPoints = this._extractBulletPoints(lines);
    const words = rawText.split(/\s+/).filter(w => w.length > 0);

    return {
      rawText,
      fileName: file.name,
      fileSize: file.size,
      fileType: ext === 'doc' ? 'docx' : ext,
      sections,
      wordCount: words.length,
      lineCount: lines.length,
      lines,
      bulletPoints,
      hasPhoto: this._inferHasPhoto(rawText, ext),
      emails: metadata.emails,
      phones: metadata.phones,
      urls: metadata.urls,
      dates: metadata.dates
    };
  }

  // ── PDF Extraction ────────────────────────────

  async extractPDF(file) {
    if (typeof pdfjsLib === 'undefined') {
      throw new Error('PDF.js library failed to load. Please use a local server (e.g., VS Code Live Server) instead of opening the file directly, or upload a .txt / .docx file instead.');
    }
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pages = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map(item => item.str);
      pages.push(strings.join(' '));
    }

    return pages.join('\n\n');
  }

  // ── DOCX Extraction ───────────────────────────

  async extractDOCX(file) {
    if (typeof mammoth === 'undefined') {
      throw new Error('Mammoth.js library failed to load. Please use a local server (e.g., VS Code Live Server) instead of opening the file directly, or upload a .txt file instead.');
    }
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }

  // ── TXT Extraction ────────────────────────────

  async extractTXT(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Failed to read text file'));
      reader.readAsText(file);
    });
  }

  // ── Section Detection ─────────────────────────

  detectSections(text) {
    const lines = text.split('\n');
    const detected = [];

    // Find all section headers and their line positions
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // A header candidate: short line (< 80 chars), possibly
      // with decorations like --- === *** or ALL CAPS
      const cleanLine = line
        .replace(/^[\-=*_#|►▪•→:.\s]+/, '')
        .replace(/[\-=*_#|►▪•→:.\s]+$/, '')
        .trim();

      if (!cleanLine || cleanLine.length > 80) continue;

      for (const [section, pattern] of Object.entries(this.sectionPatterns)) {
        if (pattern.test(cleanLine)) {
          detected.push({ section, line: i, label: cleanLine });
          break;
        }
      }
    }

    // Build section content by slicing between detected headers
    const sections = {
      contact: '',
      summary: '',
      experience: '',
      education: '',
      skills: '',
      other: ''
    };

    // If no sections detected, use heuristics
    if (detected.length === 0) {
      return this._heuristicSections(lines);
    }

    // Content before the first header → contact
    if (detected[0].line > 0) {
      sections.contact = lines.slice(0, detected[0].line).join('\n').trim();
    }

    // Assign content for each detected section
    for (let i = 0; i < detected.length; i++) {
      const startLine = detected[i].line + 1;
      const endLine = i + 1 < detected.length ? detected[i + 1].line : lines.length;
      const content = lines.slice(startLine, endLine).join('\n').trim();
      const key = detected[i].section;

      // Map to our known section keys, or append to other
      if (key in sections) {
        sections[key] = sections[key]
          ? sections[key] + '\n\n' + content
          : content;
      } else {
        // projects, certifications, awards, publications, languages,
        // interests, volunteer, references → all go to other
        sections.other = sections.other
          ? sections.other + '\n\n' + `[${detected[i].label}]\n` + content
          : `[${detected[i].label}]\n` + content;
      }
    }

    return sections;
  }

  // ── Metadata Extraction ───────────────────────

  extractMetadata(text) {
    const emails = text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g) || [];
    const phones = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g) || [];
    const urls = text.match(/(?:https?:\/\/|www\.)[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}(?:\/[^\s)]*)?/gi) || [];

    // Date patterns: YYYY, MM/YYYY, Month YYYY, YYYY-MM, present/current
    const datePattern = /(?:\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s*[,.]?\s*\d{4}\b|\b\d{1,2}[\/\-]\d{4}\b|\b\d{4}\s*[-–—]\s*(?:\d{4}|[Pp]resent|[Cc]urrent|[Nn]ow)\b|\b(?:19|20)\d{2}\b)/g;
    const dates = text.match(datePattern) || [];

    // Deduplicate
    return {
      emails: [...new Set(emails)],
      phones: [...new Set(phones.filter(p => p.replace(/\D/g, '').length >= 7))],
      urls: [...new Set(urls)],
      dates: [...new Set(dates)]
    };
  }

  // ── Private Helpers ───────────────────────────

  _cleanText(text) {
    return text
      .replace(/\r\n/g, '\n')      // Normalize line endings
      .replace(/\r/g, '\n')
      .replace(/\t/g, '  ')        // Tabs → spaces
      .replace(/\n{4,}/g, '\n\n\n') // Collapse excessive blank lines
      .trim();
  }

  _extractBulletPoints(lines) {
    const bulletPattern = /^\s*(?:[•●○◦▪▸►\-–—*→➤➜✓✔☑■]|\d+[.)]\s|[a-zA-Z][.)]\s)/;
    return lines
      .map(l => l.trim())
      .filter(l => bulletPattern.test(l));
  }

  _inferHasPhoto(text, ext) {
    // Very basic heuristic — can't detect images in plain text,
    // but in PDFs the presence of "Photo" or image-related text
    // might hint at it. This is a rough guess.
    if (ext === 'pdf') {
      return /photo|headshot|portrait|picture/i.test(text);
    }
    return false;
  }

  _heuristicSections(lines) {
    // If no formal sections detected, do a best-effort split
    const sections = {
      contact: '',
      summary: '',
      experience: '',
      education: '',
      skills: '',
      other: ''
    };

    // First 5 non-empty lines → contact
    const nonEmpty = lines.filter(l => l.trim());
    const contactEnd = Math.min(5, nonEmpty.length);
    sections.contact = nonEmpty.slice(0, contactEnd).join('\n');

    // Everything else → treat as combined content (experience)
    if (nonEmpty.length > contactEnd) {
      const rest = nonEmpty.slice(contactEnd).join('\n');
      sections.experience = rest;
    }

    return sections;
  }
};
