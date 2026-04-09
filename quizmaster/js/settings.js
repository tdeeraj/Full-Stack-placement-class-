/* ============================================================
   settings.js — Settings Page Logic
   QuizMaster Pro
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  const s = Store.getSettings();
  document.getElementById("sDisplayName").value  = s.displayName  || "Admin User";
  document.getElementById("sEmail").value        = s.email        || "admin@quizmaster.pro";
  document.getElementById("sInstitution").value  = s.institution  || "QuizMaster Pro";
  document.getElementById("sAuthorized").value   = s.authorizedBy || "Dr. Admin User";
  document.getElementById("adminToggleInput").checked = s.adminMode !== false;
});

function saveAccount() {
  const s = Store.getSettings();
  s.displayName = document.getElementById("sDisplayName").value.trim() || "Admin User";
  s.email       = document.getElementById("sEmail").value.trim();
  Store.saveSettings(s);
  // Update sidebar name
  const sn = document.getElementById("sidebarName");
  if (sn) sn.textContent = s.displayName;
  flashSaved("accountSaved");
}

function saveCertSettings() {
  const s = Store.getSettings();
  s.institution  = document.getElementById("sInstitution").value.trim() || "QuizMaster Pro";
  s.authorizedBy = document.getElementById("sAuthorized").value.trim()  || "Dr. Admin User";
  Store.saveSettings(s);
  flashSaved("certSaved");
}

function toggleAdmin(checkbox) {
  const s = Store.getSettings();
  s.adminMode = checkbox.checked;
  Store.saveSettings(s);
  document.body.classList.toggle("student-mode", !s.adminMode);
  const badge  = document.getElementById("roleBadge");
  const toggle = document.getElementById("roleToggle");
  if (badge)  { badge.textContent = s.adminMode ? "👑 Admin" : "🎓 Student"; badge.className = `badge ${s.adminMode?"badge-blue":"badge-green"}`; }
  if (toggle) toggle.textContent  = s.adminMode ? "→ Switch to Student" : "→ Switch to Admin";
}

function resetAll() {
  if (!confirm("This will delete all custom quizzes, results, and settings. Are you sure?")) return;
  Store.resetAll();
  location.reload();
}

function flashSaved(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = "block";
  setTimeout(() => { el.style.display = "none"; }, 3000);
}
