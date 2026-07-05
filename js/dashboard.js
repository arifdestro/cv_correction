/* ============================================
   CV Assessment Pro — Dashboard
   Renders score circle, category breakdowns,
   detail panels, tabs, and animated visuals
   ============================================ */

window.Dashboard = class Dashboard {
  constructor() {
    this.canvas = document.getElementById('score-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.scoreNumber = document.getElementById('score-number');
    this.categoriesList = document.getElementById('categories-list');
    this.detailsContainer = document.getElementById('details-container');
    this.animationId = null;
  }

  // ── Main Render ───────────────────────────────

  render(results) {
    this.drawScoreCircle(results.totalScore, results.maxScore || 100);
    this.animateScore(results.totalScore);
    this.renderGrade(results.grade, results.gradeLabel);
    this.renderCategories(results.categories);
    this.renderDetails(results.categories);
    this.renderMeta(results);
    this.setupTabs();
  }

  // ── Score Circle (Canvas) ─────────────────────

  drawScoreCircle(score, maxScore) {
    if (!this.ctx) return;

    const canvas = this.canvas;
    const dpr = window.devicePixelRatio || 1;
    const size = 400;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    this.ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const radius = size / 2 - 30;
    const lineWidth = 18;
    const percentage = Math.min(score / maxScore, 1);

    // Read CSS variable for background ring
    const cs = getComputedStyle(document.documentElement);
    const surface3 = cs.getPropertyValue('--surface-3').trim() || '#334155';

    // Determine arc color based on score
    const arcColor = this._getScoreGradientColors(percentage);

    // Animate the arc drawing
    let currentAngle = 0;
    const targetAngle = percentage * Math.PI * 2;
    const startAngle = -Math.PI / 2;
    const duration = 1400; // ms
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      currentAngle = targetAngle * eased;

      this.ctx.clearRect(0, 0, size, size);

      // Background ring
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      this.ctx.strokeStyle = surface3;
      this.ctx.lineWidth = lineWidth;
      this.ctx.lineCap = 'round';
      this.ctx.stroke();

      // Foreground arc with gradient
      if (currentAngle > 0.01) {
        const gradient = this.ctx.createLinearGradient(
          cx - radius, cy - radius,
          cx + radius, cy + radius
        );
        gradient.addColorStop(0, arcColor.start);
        gradient.addColorStop(1, arcColor.end);

        // Glow effect
        this.ctx.save();
        this.ctx.shadowColor = arcColor.glow;
        this.ctx.shadowBlur = 20;
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, radius, startAngle, startAngle + currentAngle);
        this.ctx.strokeStyle = gradient;
        this.ctx.lineWidth = lineWidth;
        this.ctx.lineCap = 'round';
        this.ctx.stroke();
        this.ctx.restore();

        // Bright tip dot at the end of the arc
        const tipAngle = startAngle + currentAngle;
        const tipX = cx + Math.cos(tipAngle) * radius;
        const tipY = cy + Math.sin(tipAngle) * radius;
        this.ctx.save();
        this.ctx.shadowColor = arcColor.glow;
        this.ctx.shadowBlur = 15;
        this.ctx.beginPath();
        this.ctx.arc(tipX, tipY, lineWidth / 2 + 2, 0, Math.PI * 2);
        this.ctx.fillStyle = arcColor.end;
        this.ctx.fill();
        this.ctx.restore();
      }

      if (progress < 1) {
        this.animationId = requestAnimationFrame(animate);
      }
    };

    if (this.animationId) cancelAnimationFrame(this.animationId);
    this.animationId = requestAnimationFrame(animate);
  }

  // ── Animated Score Counter ────────────────────

  animateScore(target) {
    if (!this.scoreNumber) return;

    const duration = 1400;
    const startTime = performance.now();
    let current = 0;

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      current = Math.round(target * eased);

      this.scoreNumber.textContent = current;

      // Apply color based on score
      const pct = current / 100;
      if (pct >= 0.8) {
        this.scoreNumber.style.color = 'var(--accent-400)';
      } else if (pct >= 0.6) {
        this.scoreNumber.style.color = 'var(--primary-400)';
      } else if (pct >= 0.4) {
        this.scoreNumber.style.color = 'var(--warning-400)';
      } else {
        this.scoreNumber.style.color = 'var(--danger-400)';
      }

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  }

  // ── Grade Badge ───────────────────────────────

  renderGrade(grade, gradeLabel) {
    const badge = document.getElementById('grade-badge');
    if (!badge) return;

    // Remove previous grade classes
    badge.className = 'grade-badge grade-badge-lg';
    badge.classList.add(`grade-${grade}`);
    badge.textContent = grade;
    badge.title = gradeLabel || '';

    // Entrance animation
    badge.style.animation = 'none';
    badge.offsetHeight; // trigger reflow
    badge.style.animation = 'scaleIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards';
  }

  // ── Category Scores ───────────────────────────

  renderCategories(categories) {
    if (!this.categoriesList) return;
    this.categoriesList.innerHTML = '';

    categories.forEach((cat, index) => {
      const pct = cat.maxScore > 0 ? (cat.score / cat.maxScore) * 100 : 0;
      const colorClass = this._getProgressClass(pct);
      const icon = cat.icon || '📊';

      const row = document.createElement('div');
      row.className = 'category-row animate-fade-in-up';
      row.style.animationDelay = `${index * 0.06}s`;
      row.style.animationFillMode = 'both';

      row.innerHTML = `
        <div class="category-icon" style="background: var(--surface-2);">
          ${icon}
        </div>
        <div class="category-info">
          <div class="category-name">${cat.name}</div>
          <div class="category-detail">${cat.score}/${cat.maxScore} pts</div>
        </div>
        <div class="category-score" style="color: var(${this._getScoreColorVar(pct)});">
          ${Math.round(pct)}%
        </div>
        <div class="category-bar">
          <div class="progress-bar">
            <div class="progress-bar-fill ${colorClass}"
                 style="width: 0%; transition-delay: ${index * 0.1}s;"></div>
          </div>
        </div>
      `;

      this.categoriesList.appendChild(row);

      // Animate progress bar after a tick
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const fill = row.querySelector('.progress-bar-fill');
          if (fill) fill.style.width = `${pct}%`;
        });
      });
    });
  }

  // ── Detail Panels ─────────────────────────────

  renderDetails(categories) {
    if (!this.detailsContainer) return;
    this.detailsContainer.innerHTML = '';

    categories.forEach((cat, catIdx) => {
      const pct = cat.maxScore > 0 ? (cat.score / cat.maxScore) * 100 : 0;
      const icon = cat.icon || '📊';

      const panel = document.createElement('div');
      panel.className = 'detail-panel animate-fade-in-up';
      panel.style.animationDelay = `${catIdx * 0.08}s`;
      panel.style.animationFillMode = 'both';

      let criteriaHTML = '';

      if (cat.details && cat.details.length > 0) {
        cat.details.forEach(detail => {
          const passed = detail.points > 0;
          const statusIcon = detail.passed ? '✅' : '❌';
          const pointsClass = passed ? 'points-positive' : (detail.points === 0 && detail.maxPoints === 0 ? 'points-neutral' : 'points-negative');
          const pointsText = passed
            ? `+${detail.points}`
            : (detail.maxPoints > 0 ? `0/${detail.maxPoints}` : '—');

          criteriaHTML += `
            <div class="detail-criterion">
              <span class="detail-criterion-icon">${statusIcon}</span>
              <span class="detail-criterion-text">
                <strong>${detail.criterion}</strong><br>
                <span style="font-size: 0.85em; color: var(--text-tertiary);">${detail.explanation || ''}</span>
              </span>
              <span class="detail-criterion-points ${pointsClass}">${pointsText}</span>
            </div>
          `;
        });
      } else {
        criteriaHTML = `
          <div class="detail-criterion">
            <span class="detail-criterion-icon">ℹ️</span>
            <span class="detail-criterion-text">No detailed breakdown available</span>
            <span class="detail-criterion-points points-neutral">—</span>
          </div>
        `;
      }

      panel.innerHTML = `
        <div class="detail-panel-header">
          <span>${icon}</span>
          <span class="detail-panel-title">${cat.name}</span>
          <span class="detail-panel-score" style="color: var(${this._getScoreColorVar(pct)});">
            ${cat.score}/${cat.maxScore}
          </span>
        </div>
        <div class="detail-panel-body">
          ${criteriaHTML}
        </div>
      `;

      this.detailsContainer.appendChild(panel);
    });
  }

  // ── Meta Info ─────────────────────────────────

  renderMeta(results) {
    const elStrengths = document.getElementById('meta-strengths');
    const elIssues = document.getElementById('meta-issues');
    const elRegion = document.getElementById('meta-region');

    if (elStrengths) {
      const strengths = this._countPassedCriteria(results.categories);
      elStrengths.textContent = strengths;
      elStrengths.style.color = 'var(--accent-400)';
    }

    if (elIssues) {
      const issues = this._countFailedCriteria(results.categories);
      elIssues.textContent = issues;
      elIssues.style.color = issues > 0 ? 'var(--danger-400)' : 'var(--accent-400)';
    }

    if (elRegion) {
      const settings = window.SettingsManager
        ? (window.app && window.app.settings ? window.app.settings.getSettings() : null)
        : null;
      elRegion.textContent = settings ? settings.region : 'US';
    }
  }

  // ── Tab Switching ─────────────────────────────

  setupTabs() {
    const tabDetails = document.getElementById('tab-details');
    const tabRecs = document.getElementById('tab-recommendations');
    const panelDetails = document.getElementById('panel-details');
    const panelRecs = document.getElementById('panel-recommendations');

    if (!tabDetails || !tabRecs) return;

    const activate = (activeTab, inactiveTab, showPanel, hidePanel) => {
      activeTab.classList.add('active');
      inactiveTab.classList.remove('active');
      showPanel.style.display = 'block';
      showPanel.style.animation = 'fadeInUp 0.35s ease-out';
      hidePanel.style.display = 'none';
    };

    tabDetails.addEventListener('click', () => {
      activate(tabDetails, tabRecs, panelDetails, panelRecs);
    });

    tabRecs.addEventListener('click', () => {
      activate(tabRecs, tabDetails, panelRecs, panelDetails);
    });
  }

  // ── Color Helpers ─────────────────────────────

  _getScoreGradientColors(percentage) {
    if (percentage >= 0.8) {
      return { start: '#34d399', end: '#10b981', glow: 'rgba(16, 185, 129, 0.5)' };
    }
    if (percentage >= 0.6) {
      return { start: '#818cf8', end: '#6366f1', glow: 'rgba(99, 102, 241, 0.5)' };
    }
    if (percentage >= 0.4) {
      return { start: '#fcd34d', end: '#f59e0b', glow: 'rgba(245, 158, 11, 0.5)' };
    }
    return { start: '#fca5a5', end: '#ef4444', glow: 'rgba(239, 68, 68, 0.5)' };
  }

  _getProgressClass(pct) {
    if (pct >= 80) return 'progress-excellent';
    if (pct >= 60) return 'progress-good';
    if (pct >= 40) return 'progress-average';
    return 'progress-poor';
  }

  _getScoreColorVar(pct) {
    if (pct >= 80) return '--accent-400';
    if (pct >= 60) return '--primary-400';
    if (pct >= 40) return '--warning-400';
    return '--danger-400';
  }

  _countPassedCriteria(categories) {
    let count = 0;
    categories.forEach(cat => {
      if (cat.details) {
        cat.details.forEach(d => { if (d.passed) count++; });
      }
    });
    return count;
  }

  _countFailedCriteria(categories) {
    let count = 0;
    categories.forEach(cat => {
      if (cat.details) {
        cat.details.forEach(d => { if (!d.passed && d.maxPoints > 0) count++; });
      }
    });
    return count;
  }
};
