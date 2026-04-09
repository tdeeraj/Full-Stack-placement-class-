/* ============================================================
   manage-quizzes.js — Quiz Editor & Management Logic
   QuizMaster Pro
   ============================================================ */

let currentFilter   = "all";
let editingQuiz     = null;
let editorQuestions = [];

document.addEventListener("DOMContentLoaded", renderGrid);

/* ── GRID ── */
function renderGrid() {
  const search = (document.getElementById("searchInput")?.value || "").toLowerCase();
  const all = Store.getQuizzes().filter(q => {
    if (currentFilter === "published" && !q.published) return false;
    if (currentFilter === "draft"     &&  q.published) return false;
    if (search && !q.title.toLowerCase().includes(search) && !q.category.toLowerCase().includes(search)) return false;
    return true;
  });

  const grid = document.getElementById("quizGrid");
  if (!all.length) {
    grid.innerHTML = `<div class="empty-state"><div class="empty-icon">📭</div>No quizzes found.</div>`;
    return;
  }
  grid.innerHTML = all.map(q => `
    <div class="quiz-card">
      <div style="display:flex;gap:8px;justify-content:space-between;margin-bottom:10px">
        <span class="badge badge-blue">${q.category}</span>
        <span class="badge ${q.published ? "badge-green" : "badge-gray"}">${q.published ? "● Live" : "○ Draft"}</span>
      </div>
      <div class="quiz-card-title">${q.title}</div>
      <div class="quiz-card-meta">
        <span>⏱ ${q.duration}m</span>
        <span>❓ ${q.questions.length}q</span>
        <span>🎯 ${q.passingScore}%</span>
        <span>📅 ${q.createdAt}</span>
      </div>
      <div class="quiz-card-actions">
        ${q.published ? `<a href="take-quiz.html" class="btn btn-primary btn-sm" onclick="Store.setActiveQuiz(Store.getQuizById(${q.id}))">▶ Preview</a>` : ""}
        <button class="btn btn-secondary btn-sm" onclick="openEditor(${q.id})">✎ Edit</button>
        <button class="btn btn-ghost btn-sm"     onclick="togglePublish(${q.id})">${q.published ? "⊘ Unpublish" : "◎ Publish"}</button>
        <button class="btn btn-danger btn-sm"    onclick="deleteQuiz(${q.id})">✕ Delete</button>
      </div>
    </div>`).join("");
}

function setFilter(f, btn) {
  currentFilter = f;
  document.querySelectorAll("#filterTabs .tab").forEach(t => t.classList.remove("active"));
  btn.classList.add("active");
  renderGrid();
}

function togglePublish(id) {
  const q = Store.getQuizById(id);
  if (!q) return;
  q.published = !q.published;
  Store.updateQuiz(q);
  renderGrid();
}

function deleteQuiz(id) {
  if (!confirm("Delete this quiz? This cannot be undone.")) return;
  Store.deleteQuiz(id);
  renderGrid();
}

/* ── EDITOR ── */
function openEditor(id) {
  editingQuiz = id ? Store.getQuizById(id) : null;
  editorQuestions = editingQuiz ? JSON.parse(JSON.stringify(editingQuiz.questions)) : [];

  document.getElementById("editorTitle").textContent = editingQuiz ? "✎ Edit Quiz" : "✦ Create New Quiz";
  document.getElementById("fTitle").value     = editingQuiz?.title      || "";
  document.getElementById("fCategory").value  = editingQuiz?.category   || "Programming";
  document.getElementById("fDuration").value  = editingQuiz?.duration   || 20;
  document.getElementById("fPassScore").value = editingQuiz?.passingScore|| 70;
  document.getElementById("fStatus").value    = editingQuiz?.published  ? "published" : "draft";
  document.getElementById("editorError").style.display = "none";

  renderEditorQuestions();
  document.getElementById("editorModal").classList.add("open");
}

function closeEditor() {
  document.getElementById("editorModal").classList.remove("open");
}

/* ── QUESTION EDITOR ── */
function renderEditorQuestions() {
  const container = document.getElementById("questionsContainer");
  document.getElementById("qCount").textContent = editorQuestions.length;

  if (!editorQuestions.length) {
    container.innerHTML = `<div class="empty-state" style="padding:28px"><div class="empty-icon">❓</div>Click "+ Add Question" to start building your quiz.</div>`;
    return;
  }

  container.innerHTML = editorQuestions.map((q, qi) => `
    <div class="q-editor" id="qed-${qi}">
      <div class="q-editor-header">
        <span class="q-number">QUESTION ${qi+1}</span>
        <div style="display:flex;align-items:center;gap:8px">
          <label style="font-size:12px;color:var(--tx3)">pts:</label>
          <input type="number" min="1" max="100" class="pts-input" value="${q.points}"
            onchange="editorQuestions[${qi}].points = +this.value"/>
          <button class="btn btn-danger btn-xs" onclick="removeQuestion(${qi})">✕ Remove</button>
        </div>
      </div>
      <input class="form-input" style="margin-bottom:10px" placeholder="Question ${qi+1} text…"
        value="${q.text}" oninput="editorQuestions[${qi}].text = this.value"/>
      <div class="q-options-grid">
        ${q.options.map((opt, oi) => `
          <div class="q-option-row">
            <input type="radio" name="correct-${qi}" ${q.correct===oi?"checked":""} onchange="editorQuestions[${qi}].correct=${oi}" title="Mark as correct answer"/>
            <input class="form-input" value="${opt}" placeholder="Option ${["A","B","C","D"][oi]}"
              style="font-size:13px" oninput="editorQuestions[${qi}].options[${oi}]=this.value"/>
            ${q.correct===oi ? `<span class="q-correct-mark">✓</span>` : ""}
          </div>`).join("")}
      </div>
      <div class="q-correct-hint">○ Select the radio button next to the correct answer</div>
    </div>`).join("");
}

function addQuestion() {
  editorQuestions.push({ id: Date.now(), text: "", options: ["","","",""], correct: 0, points: 20 });
  renderEditorQuestions();
  // scroll to new question
  const container = document.getElementById("questionsContainer");
  container.lastElementChild?.scrollIntoView({ behavior: "smooth", block: "center" });
}

function removeQuestion(idx) {
  editorQuestions.splice(idx, 1);
  renderEditorQuestions();
}

/* ── SAVE ── */
function saveQuiz() {
  const errEl = document.getElementById("editorError");
  const title  = document.getElementById("fTitle").value.trim();

  if (!title) { showEditorError("Quiz title is required."); return; }
  if (!editorQuestions.length) { showEditorError("Add at least one question."); return; }
  for (let i = 0; i < editorQuestions.length; i++) {
    if (!editorQuestions[i].text.trim()) { showEditorError(`Question ${i+1}: text cannot be empty.`); return; }
    if (editorQuestions[i].options.some(o => !o.trim())) { showEditorError(`Question ${i+1}: all four options must be filled.`); return; }
  }

  const quiz = {
    ...(editingQuiz || {}),
    title,
    category:     document.getElementById("fCategory").value,
    duration:    +document.getElementById("fDuration").value,
    passingScore:+document.getElementById("fPassScore").value,
    published:    document.getElementById("fStatus").value === "published",
    questions:    editorQuestions,
  };

  if (editingQuiz) { Store.updateQuiz(quiz); }
  else             { Store.addQuiz(quiz); }

  closeEditor();
  renderGrid();
}

function showEditorError(msg) {
  const el = document.getElementById("editorError");
  el.textContent    = "⚠ " + msg;
  el.style.display  = "block";
}
