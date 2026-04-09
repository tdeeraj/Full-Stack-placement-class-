/* ============================================================
   dashboard.js — Dashboard Page Logic
   QuizMaster Pro
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  const quizzes = Store.getQuizzes();
  const results = Store.getResults();

  const published  = quizzes.filter(q => q.published);
  const passed     = results.filter(r => r.passed);
  const passRate   = results.length ? Math.round(passed.length / results.length * 100) : 0;
  const avgScore   = results.length ? Math.round(results.reduce((a,r) => a+r.score, 0) / results.length) : 0;

  /* ── STATS ── */
  document.getElementById("stat-published").textContent = published.length;
  document.getElementById("stat-attempts").textContent  = results.length;
  document.getElementById("stat-passrate").textContent  = passRate + "%";
  document.getElementById("stat-certs").textContent     = passed.length;

  /* ── RECENT ATTEMPTS TABLE ── */
  const tbody = document.getElementById("recentAttemptsTable");
  if (tbody) {
    const recent = results.slice(0, 5);
    tbody.innerHTML = recent.length === 0
      ? `<tr><td colspan="4" style="text-align:center;color:var(--tx3);padding:24px">No attempts yet</td></tr>`
      : recent.map(r => `
        <tr>
          <td><strong style="color:var(--tx)">${r.userName}</strong></td>
          <td style="font-size:13px">${r.quizTitle}</td>
          <td><strong class="${r.score >= 70 ? "text-green" : "text-red"}">${r.score}%</strong></td>
          <td><span class="badge ${r.passed ? "badge-green" : "badge-red"}">${r.passed ? "Pass" : "Fail"}</span></td>
        </tr>`).join("");
  }

  /* ── PERFORMANCE BARS ── */
  const perfContainer = document.getElementById("performanceChart");
  if (perfContainer) {
    const bars = quizzes.map(q => {
      const qResults = results.filter(r => r.quizId === q.id);
      const pct = qResults.length ? Math.round(qResults.filter(r => r.passed).length / qResults.length * 100) : 0;
      return `
        <div class="perf-item">
          <div class="perf-header">
            <span class="perf-title">${q.title}</span>
            <span class="perf-stats">${qResults.length} attempts · ${pct}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width:${pct}%"></div>
          </div>
        </div>`;
    }).join("");

    perfContainer.innerHTML = bars + `
      <div class="divider"></div>
      <div class="info-grid">
        <div class="info-box"><div class="info-box-val" style="color:var(--ind2)">${avgScore}%</div><div class="info-box-label">Avg Score</div></div>
        <div class="info-box"><div class="info-box-val" style="color:var(--gold)">${passed.length}</div><div class="info-box-label">Certs Issued</div></div>
      </div>`;
  }

  /* ── QUIZ GRID ── */
  const grid = document.getElementById("dashboardQuizGrid");
  if (grid) {
    grid.innerHTML = published.slice(0, 3).map(q => `
      <div class="quiz-card">
        <div class="quiz-card-category">${q.category}</div>
        <div class="quiz-card-title">${q.title}</div>
        <div class="quiz-card-meta">
          <span>⏱ ${q.duration}m</span>
          <span>❓ ${q.questions.length}q</span>
          <span>🎯 ${q.passingScore}%</span>
        </div>
        <div class="quiz-card-actions">
          <button class="btn btn-primary btn-sm" onclick="startQuiz(${q.id})">▶ Start</button>
        </div>
      </div>`).join("");
  }
});

function startQuiz(id) {
  const quiz = Store.getQuizById(id);
  if (!quiz) return;
  Store.setActiveQuiz(quiz);
  window.location.href = "pages/take-quiz.html";
}
