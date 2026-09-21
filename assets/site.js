/* site.js — Helper dùng chung: render thanh tiến độ mini trên navbar */

function renderNavProgressChip(lessonId, totalSteps) {
  const chip = document.getElementById('nav-progress-chip');
  if (!chip) return;
  const pct = ProgressManager.getPercent(lessonId, totalSteps);
  chip.textContent = `${pct}% hoàn thành`;
}

function renderProgressBar(elId, percent, label) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.innerHTML = `
    <div class="progress-label-row"><span>${label || 'Tiến độ'}</span><b>${percent}%</b></div>
    <div class="progress-track"><div class="progress-fill" style="width:${percent}%"></div></div>
  `;
}
