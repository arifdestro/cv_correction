/* ============================================
   CV Assessment Pro — Export Manager
   Print-friendly report generation
   ============================================ */

window.ExportManager = class ExportManager {

  export(results) {
    if (!results) return;

    // Add print class for pre-print styling
    document.body.classList.add('printing');

    // Ensure results section is visible for printing
    const resultsSection = document.getElementById('section-results');
    if (resultsSection) {
      resultsSection.classList.add('active');
    }

    // Ensure both tabs' content is visible in print
    const panelDetails = document.getElementById('panel-details');
    const panelRecs = document.getElementById('panel-recommendations');
    if (panelDetails) panelDetails.style.display = 'block';
    if (panelRecs) panelRecs.style.display = 'block';

    // Build a print-friendly score summary since canvas doesn't print well
    this._injectPrintScoreSummary(results);

    // Small delay to let styles settle
    setTimeout(() => {
      window.print();

      // Restore UI state after print dialog closes
      setTimeout(() => {
        document.body.classList.remove('printing');

        // Restore tab state
        const activeTab = document.querySelector('.tab.active');
        if (activeTab) {
          const tabId = activeTab.dataset.tab;
          if (tabId === 'details' && panelRecs) {
            panelRecs.style.display = 'none';
          } else if (tabId === 'recommendations' && panelDetails) {
            panelDetails.style.display = 'none';
          }
        }

        // Remove print-only injected content
        this._removePrintScoreSummary();

        // Show toast confirmation
        if (window.app && window.app.showToast) {
          window.app.showToast('Report sent to printer', '🖨️');
        }
      }, 500);
    }, 200);
  }

  _injectPrintScoreSummary(results) {
    // Create a text-based score summary for print (canvas is hidden in print CSS)
    const existing = document.getElementById('print-score-summary');
    if (existing) existing.remove();

    const printDiv = document.createElement('div');
    printDiv.id = 'print-score-summary';
    printDiv.className = 'print-only';
    printDiv.style.cssText = 'text-align:center; padding: 1rem 0; margin-bottom: 1rem;';

    printDiv.innerHTML = `
      <div style="font-size: 3rem; font-weight: 900; margin-bottom: 0.25rem;">
        ${results.totalScore}<span style="font-size: 1.2rem; font-weight: 500; color: #666;">/100</span>
      </div>
      <div style="font-size: 1.2rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">
        Grade: ${results.grade} — ${results.gradeLabel || ''}
      </div>
    `;

    const scoreCircle = document.getElementById('score-circle');
    if (scoreCircle) {
      scoreCircle.parentNode.insertBefore(printDiv, scoreCircle.nextSibling);
    }
  }

  _removePrintScoreSummary() {
    const el = document.getElementById('print-score-summary');
    if (el) el.remove();
  }
};
