/* ============================================
   CV Assessment Pro — Main Application
   Orchestrates all modules and manages the
   full upload → parse → score → display flow
   ============================================ */

window.App = class App {
  constructor() {
    this.parser = new window.FileParser();
    this.engine = new window.ScoringEngine();
    this.dashboard = new window.Dashboard();
    this.recommendations = new window.RecommendationsEngine();
    this.settings = new window.SettingsManager();
    this.exportManager = new window.ExportManager();

    this.currentResults = null;
    this.currentFile = null;

    this.bindEvents();
  }

  // ── Event Binding ─────────────────────────────

  bindEvents() {
    // Upload area interactions
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');

    if (uploadArea) {
      uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.classList.add('drag-over');
      });

      uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.classList.remove('drag-over');
      });

      uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0) this.handleFile(files[0]);
      });

      uploadArea.addEventListener('click', () => {
        if (fileInput) fileInput.click();
      });
    }

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const files = e.target.files;
        if (files.length > 0) this.handleFile(files[0]);
      });
    }

    // Action buttons
    const btnAnalyze = document.getElementById('btn-analyze');
    const btnNewAnalysis = document.getElementById('btn-new-analysis');
    const btnExport = document.getElementById('btn-export');
    const btnRemove = document.getElementById('btn-remove-file');

    if (btnAnalyze) btnAnalyze.addEventListener('click', () => this.analyze());
    if (btnNewAnalysis) btnNewAnalysis.addEventListener('click', () => this.reset());
    if (btnExport) btnExport.addEventListener('click', () => this.export());
    if (btnRemove) btnRemove.addEventListener('click', () => this.removeFile());
  }

  // ── File Handling ─────────────────────────────

  handleFile(file) {
    // Validate type
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'text/plain'];
    const ext = file.name.split('.').pop().toLowerCase();
    const validExts = ['pdf', 'docx', 'doc', 'txt'];

    if (!validExts.includes(ext) && !validTypes.includes(file.type)) {
      this.showToast('Please upload a PDF, DOCX, or TXT file', '⚠️');
      return;
    }

    // Validate size (10 MB max)
    if (file.size > 10 * 1024 * 1024) {
      this.showToast('File is too large. Maximum size is 10 MB.', '⚠️');
      return;
    }

    this.currentFile = file;

    // Show file info bar
    const fileInfo = document.getElementById('file-info');
    const fileName = document.getElementById('file-name');
    const fileSize = document.getElementById('file-size');

    if (fileInfo) fileInfo.style.display = 'flex';
    if (fileName) fileName.textContent = file.name;
    if (fileSize) fileSize.textContent = this.formatFileSize(file.size);

    // Animate file info entrance
    if (fileInfo) {
      fileInfo.style.animation = 'none';
      fileInfo.offsetHeight;
      fileInfo.style.animation = 'fadeInUp 0.4s ease-out';
    }

    this.showToast('File ready for analysis', '📎');
  }

  removeFile() {
    this.currentFile = null;
    const fileInfo = document.getElementById('file-info');
    const fileInput = document.getElementById('file-input');
    if (fileInfo) fileInfo.style.display = 'none';
    if (fileInput) fileInput.value = '';
  }

  // ── Analysis Flow ─────────────────────────────

  async analyze() {
    if (!this.currentFile) {
      this.showToast('Please upload a file first', '⚠️');
      return;
    }

    try {
      this.showLoading();

      // Step 1: Parse document
      await this._updateStep('step-parse', 'active');
      await this._delay(400);
      const cvData = await this.parser.parseFile(this.currentFile);
      await this._updateStep('step-parse', 'done');

      // Step 2: Format evaluation
      await this._updateStep('step-format', 'active');
      await this._delay(350);
      await this._updateStep('step-format', 'done');

      // Step 3: Content analysis
      await this._updateStep('step-content', 'active');
      await this._delay(400);
      await this._updateStep('step-content', 'done');

      // Step 4: ATS check
      await this._updateStep('step-ats', 'active');
      await this._delay(300);

      // Run the scoring engine
      const settings = this.settings.getSettings();
      const results = this.engine.analyze(cvData, settings);
      results.cvData = cvData;  // attach cvData for recommendations engine
      this.currentResults = results;

      await this._updateStep('step-ats', 'done');

      // Step 5: Generate recommendations
      await this._updateStep('step-recommend', 'active');
      await this._delay(350);

      const recs = this.recommendations.generate(results);
      this.currentResults.recommendations = recs;

      await this._updateStep('step-recommend', 'done');

      // Final pause for effect
      await this._delay(500);

      // Render everything
      this.dashboard.render(results);
      this.recommendations.render(recs);

      this.hideLoading();
      this.showResults();

      this.showToast(`Analysis complete — Score: ${results.totalScore}/100`, '✅');

    } catch (err) {
      console.error('Analysis failed:', err);
      this.hideLoading();
      this.showUpload();
      this.showToast(`Analysis failed: ${err.message}`, '❌');
    }
  }

  // ── Loading State ─────────────────────────────

  showLoading() {
    const upload = document.getElementById('section-upload');
    const loading = document.getElementById('section-loading');
    const results = document.getElementById('section-results');

    if (upload) upload.style.display = 'none';
    if (results) results.classList.remove('active');
    if (loading) {
      loading.classList.add('active');
      loading.style.animation = 'fadeIn 0.3s ease-out';
    }

    // Reset all loading steps
    const steps = loading ? loading.querySelectorAll('.loading-step') : [];
    steps.forEach(step => {
      step.classList.remove('active', 'done');
      const icon = step.querySelector('.loading-step-icon');
      if (icon) icon.textContent = '⏳';
    });
  }

  hideLoading() {
    const loading = document.getElementById('section-loading');
    if (loading) loading.classList.remove('active');
  }

  // ── Results State ─────────────────────────────

  showResults() {
    const results = document.getElementById('section-results');
    if (results) {
      results.classList.add('active');
      results.style.animation = 'fadeInUp 0.5s ease-out';
      // Scroll to results
      results.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  hideResults() {
    const results = document.getElementById('section-results');
    if (results) results.classList.remove('active');
  }

  // ── Upload State ──────────────────────────────

  showUpload() {
    const upload = document.getElementById('section-upload');
    if (upload) {
      upload.style.display = '';
      upload.style.animation = 'fadeInUp 0.4s ease-out';
    }
  }

  // ── Reset ─────────────────────────────────────

  reset() {
    this.currentFile = null;
    this.currentResults = null;

    // Reset file input
    const fileInput = document.getElementById('file-input');
    if (fileInput) fileInput.value = '';

    // Hide file info
    const fileInfo = document.getElementById('file-info');
    if (fileInfo) fileInfo.style.display = 'none';

    // Hide results and loading
    this.hideResults();
    this.hideLoading();

    // Show upload
    this.showUpload();

    // Reset tabs to details
    const tabDetails = document.getElementById('tab-details');
    const tabRecs = document.getElementById('tab-recommendations');
    const panelDetails = document.getElementById('panel-details');
    const panelRecs = document.getElementById('panel-recommendations');

    if (tabDetails) tabDetails.classList.add('active');
    if (tabRecs) tabRecs.classList.remove('active');
    if (panelDetails) panelDetails.style.display = 'block';
    if (panelRecs) panelRecs.style.display = 'none';

    // Clear rendered content
    const categoriesList = document.getElementById('categories-list');
    const detailsContainer = document.getElementById('details-container');
    const recsList = document.getElementById('recommendations-list');
    if (categoriesList) categoriesList.innerHTML = '';
    if (detailsContainer) detailsContainer.innerHTML = '';
    if (recsList) recsList.innerHTML = '';

    // Reset score display
    const scoreNumber = document.getElementById('score-number');
    if (scoreNumber) {
      scoreNumber.textContent = '0';
      scoreNumber.style.color = '';
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ── Export ────────────────────────────────────

  export() {
    if (!this.currentResults) {
      this.showToast('No analysis to export', '⚠️');
      return;
    }
    this.exportManager.export(this.currentResults);
  }

  // ── Toast Notifications ───────────────────────

  showToast(message, icon = 'ℹ️') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);

    // Auto-remove after 3.5 seconds
    setTimeout(() => {
      toast.style.animation = 'fadeIn 0.3s ease-out reverse';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // ── Loading Step Helpers ──────────────────────

  async _updateStep(stepId, state) {
    const step = document.getElementById(stepId);
    if (!step) return;

    const icon = step.querySelector('.loading-step-icon');

    if (state === 'active') {
      step.classList.add('active');
      step.classList.remove('done');
      if (icon) icon.textContent = '⏳';
      // Add spinner-like pulse
      if (icon) icon.style.animation = 'pulse 1s ease-in-out infinite';
    } else if (state === 'done') {
      step.classList.remove('active');
      step.classList.add('done');
      if (icon) {
        icon.textContent = '✅';
        icon.style.animation = 'scaleIn 0.3s ease-out';
      }
    }
  }

  // ── Utilities ─────────────────────────────────

  formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = (bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0);
    return `${size} ${units[i]}`;
  }

  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
};

// ── Self-Initialize on DOM Ready ──────────────
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
