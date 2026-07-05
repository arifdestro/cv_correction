/* ============================================
   CV Assessment Pro — Settings Manager
   Dark/light theme, region, strict mode,
   persisted to localStorage
   ============================================ */

window.SettingsManager = class SettingsManager {
  constructor() {
    this.settings = {
      theme: 'dark',
      region: 'US',
      strict: true
    };

    this.load();
    this.bindEvents();
    this.applyTheme();
    this.applyRegion();
    this.applyStrict();
  }

  // ── Persistence ───────────────────────────────

  load() {
    try {
      const saved = localStorage.getItem('cv-assessment-settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.settings = { ...this.settings, ...parsed };
      }
    } catch (e) {
      // Ignore corrupt storage
    }
  }

  save() {
    try {
      localStorage.setItem('cv-assessment-settings', JSON.stringify(this.settings));
    } catch (e) {
      // Ignore quota errors
    }
  }

  // ── Event Binding ─────────────────────────────

  bindEvents() {
    // Settings panel open/close
    const btnSettings = document.getElementById('btn-settings');
    const btnClose = document.getElementById('btn-close-settings');
    const overlay = document.getElementById('settings-overlay');

    if (btnSettings) btnSettings.addEventListener('click', () => this.openPanel());
    if (btnClose) btnClose.addEventListener('click', () => this.closePanel());
    if (overlay) overlay.addEventListener('click', () => this.closePanel());

    // Theme toggle (switch in settings)
    const toggleTheme = document.getElementById('toggle-theme');
    if (toggleTheme) {
      toggleTheme.addEventListener('click', () => this.toggleTheme());
    }

    // Theme button (header)
    const btnTheme = document.getElementById('btn-theme');
    if (btnTheme) {
      btnTheme.addEventListener('click', () => this.toggleTheme());
    }

    // Strict mode toggle
    const toggleStrict = document.getElementById('toggle-strict');
    if (toggleStrict) {
      toggleStrict.addEventListener('click', () => this.toggleStrict());
    }

    // Region selector buttons
    const regionSelector = document.getElementById('region-selector');
    if (regionSelector) {
      regionSelector.addEventListener('click', (e) => {
        const btn = e.target.closest('.region-option');
        if (!btn) return;
        const region = btn.dataset.region;
        if (region) this.setRegion(region);
      });
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closePanel();
    });
  }

  // ── Theme ─────────────────────────────────────

  toggleTheme() {
    this.settings.theme = this.settings.theme === 'dark' ? 'light' : 'dark';
    this.applyTheme();
    this.save();
  }

  applyTheme() {
    const html = document.documentElement;
    html.setAttribute('data-theme', this.settings.theme);

    // Update toggle switch state
    const toggle = document.getElementById('toggle-theme');
    if (toggle) {
      if (this.settings.theme === 'dark') {
        toggle.classList.add('active');
      } else {
        toggle.classList.remove('active');
      }
    }

    // Update header button emoji
    const btnTheme = document.getElementById('btn-theme');
    if (btnTheme) {
      btnTheme.textContent = this.settings.theme === 'dark' ? '🌙' : '☀️';
      btnTheme.style.transition = 'transform 0.3s ease';
      btnTheme.style.transform = 'rotate(360deg)';
      setTimeout(() => { btnTheme.style.transform = 'rotate(0deg)'; }, 300);
    }
  }

  // ── Region ────────────────────────────────────

  setRegion(region) {
    this.settings.region = region;
    this.applyRegion();
    this.save();
  }

  applyRegion() {
    const buttons = document.querySelectorAll('#region-selector .region-option');
    buttons.forEach(btn => {
      if (btn.dataset.region === this.settings.region) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // ── Strict Mode ───────────────────────────────

  toggleStrict() {
    this.settings.strict = !this.settings.strict;
    this.applyStrict();
    this.save();
  }

  applyStrict() {
    const toggle = document.getElementById('toggle-strict');
    if (toggle) {
      if (this.settings.strict) {
        toggle.classList.add('active');
      } else {
        toggle.classList.remove('active');
      }
    }
  }

  // ── Panel Open / Close ────────────────────────

  openPanel() {
    const panel = document.getElementById('settings-panel');
    const overlay = document.getElementById('settings-overlay');
    if (panel) panel.classList.add('open');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closePanel() {
    const panel = document.getElementById('settings-panel');
    const overlay = document.getElementById('settings-overlay');
    if (panel) panel.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  // ── Getters ───────────────────────────────────

  getSettings() {
    return { ...this.settings };
  }
};
