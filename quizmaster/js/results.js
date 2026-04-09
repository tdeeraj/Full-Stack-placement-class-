/* ============================================================
   results.js — Results Page Logic
   QuizMaster Pro
   ============================================================ */

let resultFilter = "all";

document.addEventListener("DOMContentLoaded", () => {
  renderStats();
  renderTable();
});

function renderStats() {
  const results = Store.getResults();
  const passed  = results.filter(r => r.passed);
  const avg     = results.length ? Math.round(results.reduce((a,r) => a+r.score, 0) / results.length) : 0;
  document.getElementById("s-total").textContent  = results.length;
  document.getElementById("s-passed").textContent = passed.length;
  document.getElementById("s-failed").textContent = results.length - passed.length;
  document.getElementById("s-avg").textContent    = avg + "%";
}

function setFilter(f, btn) {
  resultFilter = f;
  document.querySelectorAll(".tabs .tab").forEach(t => t.classList.remove("active"));
  btn.classList.add("active");
  renderTable();
}

function renderTable() {
  const search  = (document.getElementById("searchInput")?.value || "").toLowerCase();
  const results = Store.getResults().filter(r => {
    if (resultFilter === "pass" && !r.passed) return false;
    if (resultFilter === "fail" &&  r.passed) return false;
    if (search && !r.userName.toLowerCase().includes(search) && !r.quizTitle.toLowerCase().includes(search)) return false;
    return true;
  });

  const tbody = document.getElementById("resultsBody");
  if (!results.length) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:var(--tx3);padding:32px">No results found</td></tr>`;
    return;
  }

  tbody.innerHTML = results.map(r => {
    const g = getGrade(r.score);
    const gradeCls = g.startsWith("A") ? "badge-green" : g === "B" ? "badge-blue" : g === "C" ? "badge-orange" : "badge-red";
    return `
      <tr>
        <td>
          <div style="font-weight:600;color:var(--tx)">${r.userName}</div>
          <div style="font-size:12px;color:var(--tx3)">${r.email}</div>
        </td>
        <td style="font-size:13px">${r.quizTitle}</td>
        <td><strong style="font-size:15px;color:${r.score>=70?"var(--grn)":"var(--red)"}">${r.score}%</strong></td>
        <td><span class="badge ${gradeCls}">${g}</span></td>
        <td><span class="badge ${r.passed ? "badge-green" : "badge-red"}">${r.passed ? "✓ Pass" : "✕ Fail"}</span></td>
        <td style="font-size:13px;color:var(--tx2)">${r.date}</td>
        <td style="font-size:13px;color:var(--tx2)">${r.timeTaken}m</td>
        <td>${r.passed ? `<button class="btn btn-gold btn-xs" onclick='openCertModal(${JSON.stringify(r).replace(/'/g,"&apos;")})'>🏆 Cert</button>` : ""}</td>
      </tr>`;
  }).join("");
}
