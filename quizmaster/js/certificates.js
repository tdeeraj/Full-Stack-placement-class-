/* ============================================================
   certificates.js — Certificates Page Logic
   QuizMaster Pro
   ============================================================ */

document.addEventListener("DOMContentLoaded", renderCerts);

function renderCerts() {
  const passed = Store.getResults().filter(r => r.passed);
  const grid   = document.getElementById("certsGrid");

  if (!passed.length) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="empty-icon">🏆</div>
        <div>No certificates yet.</div>
        <div style="font-size:13px;margin-top:8px">Pass a quiz to earn your first certificate!</div>
        <a href="take-quiz.html" class="btn btn-primary btn-sm" style="margin-top:16px">▶ Take a Quiz</a>
      </div>`;
    return;
  }

  grid.innerHTML = passed.map(r => `
    <div class="cert-card" onclick='openCertModal(${JSON.stringify(r).replace(/'/g,"&apos;")})'>
      <div class="cert-card-icon">🏆</div>
      <div class="cert-card-title">${r.quizTitle}</div>
      <div class="cert-card-name">${r.userName}</div>
      <div class="cert-card-footer">
        <span class="badge badge-gold">Score: ${r.score}%</span>
        <span style="font-size:12px;color:var(--tx3)">${r.date}</span>
      </div>
      <button class="btn btn-gold btn-sm" style="width:100%">🏆 View &amp; Download</button>
    </div>`).join("");
}
