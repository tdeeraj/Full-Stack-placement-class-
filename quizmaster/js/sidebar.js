/* ============================================================
   sidebar.js — Sidebar Role Toggle & Active Link Logic
   QuizMaster Pro
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  const settings   = Store.getSettings();
  const roleToggle = document.getElementById("roleToggle");
  const roleBadge  = document.getElementById("roleBadge");

  /* Apply current mode */
  function applyMode(isAdmin) {
    document.body.classList.toggle("student-mode", !isAdmin);
    if (roleToggle) roleToggle.textContent = isAdmin ? "→ Switch to Student" : "→ Switch to Admin";
    if (roleBadge) {
      roleBadge.textContent  = isAdmin ? "👑 Admin" : "🎓 Student";
      roleBadge.className    = `badge ${isAdmin ? "badge-blue" : "badge-green"}`;
    }
  }

  applyMode(settings.adminMode);

  /* Toggle on click */
  if (roleToggle) {
    roleToggle.addEventListener("click", () => {
      settings.adminMode = !settings.adminMode;
      Store.saveSettings(settings);
      applyMode(settings.adminMode);
    });
  }

  /* Highlight active nav link */
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-item").forEach(link => {
    const href = link.getAttribute("href").split("/").pop();
    if (href === currentPage) link.classList.add("active");
    else link.classList.remove("active");
  });
});
