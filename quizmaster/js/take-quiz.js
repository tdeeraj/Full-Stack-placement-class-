/* ============================================================
   take-quiz.js — Quiz Taking Engine
   QuizMaster Pro
   ============================================================ */

let activeQuiz    = null;
let answers       = {};
let currentQ      = 0;
let timerInterval = null;
let timeLeft      = 0;
let startTime     = null;
let quizDone      = false;
let lastResult    = null;

document.addEventListener("DOMContentLoaded", () => {
  const preloaded = Store.getActiveQuiz();
  if (preloaded) {
    activeQuiz = preloaded;
    Store.clearActiveQuiz();
    populatePickGrid();
    showNameGate(activeQuiz);
  } else {
    populatePickGrid();
    showStep("pick");
  }
});

/* ── STEP NAVIGATION ── */
function showStep(step) {
  ["pick","name","quiz","score"].forEach(s => {
    document.getElementById("step" + s.charAt(0).toUpperCase() + s.slice(1)).style.display = "none";
  });
  document.getElementById("step" + step.charAt(0).toUpperCase() + step.slice(1)).style.display = "";
  document.getElementById("pageTitle").textContent =
    step === "pick"  ? "Take a Quiz"   :
    step === "name"  ? (activeQuiz?.title || "Take a Quiz") :
    step === "quiz"  ? (activeQuiz?.title || "Quiz") :
    "Your Result";
}

/* ── QUIZ PICK GRID ── */
function populatePickGrid() {
  const grid = document.getElementById("pickGrid");
  const quizzes = Store.getQuizzes().filter(q => q.published);
  if (!quizzes.length) {
    grid.innerHTML = `<div class="empty-state"><div class="empty-icon">📭</div>No published quizzes available.</div>`;
    return;
  }
  grid.innerHTML = quizzes.map(q => `
    <div class="quiz-card" onclick="selectQuiz(${q.id})" style="cursor:pointer">
      <div class="quiz-card-category">${q.category}</div>
      <div class="quiz-card-title">${q.title}</div>
      <div class="quiz-card-meta">
        <span>⏱ ${q.duration}m</span>
        <span>❓ ${q.questions.length}q</span>
        <span>🎯 ${q.passingScore}% pass</span>
      </div>
      <div class="quiz-card-actions">
        <button class="btn btn-primary btn-sm">▶ Start Quiz</button>
      </div>
    </div>`).join("");
}

function selectQuiz(id) {
  activeQuiz = Store.getQuizById(id);
  if (!activeQuiz) return;
  showNameGate(activeQuiz);
}

/* ── NAME GATE ── */
function showNameGate(quiz) {
  document.getElementById("nameGateTitle").textContent = quiz.title;
  document.getElementById("nameGateSub").textContent   = `${quiz.category} · ${quiz.questions.length} questions`;
  document.getElementById("studentNameInput").value    = Store.getStudentName();
  document.getElementById("nameError").style.display   = "none";
  const total = quiz.questions.reduce((a,q) => a + q.points, 0);
  document.getElementById("nameGateInfo").innerHTML = `
    <div class="info-box"><div class="info-box-val" style="color:var(--ind2)">${quiz.questions.length}</div><div class="info-box-label">Questions</div></div>
    <div class="info-box"><div class="info-box-val" style="color:var(--gold)">${quiz.duration}m</div><div class="info-box-label">Time Limit</div></div>
    <div class="info-box"><div class="info-box-val" style="color:var(--grn)">${quiz.passingScore}%</div><div class="info-box-label">Passing Score</div></div>
    <div class="info-box"><div class="info-box-val" style="color:var(--ind2)">${total}</div><div class="info-box-label">Total Points</div></div>`;
  showStep("name");
  setTimeout(() => document.getElementById("studentNameInput").focus(), 100);
}

document.addEventListener("keydown", e => {
  if (e.key === "Enter" && document.getElementById("stepName").style.display !== "none") startQuiz();
});

function startQuiz() {
  const name = document.getElementById("studentNameInput").value.trim();
  if (!name) {
    document.getElementById("nameError").textContent = "Please enter your full name. It will appear on your certificate.";
    document.getElementById("nameError").style.display = "block";
    return;
  }
  Store.setStudentName(name);
  answers   = {};
  currentQ  = 0;
  quizDone  = false;
  timeLeft  = activeQuiz.duration * 60;
  startTime = Date.now();
  renderQuestion();
  startTimer();
  showStep("quiz");
}

/* ── QUIZ ENGINE ── */
function renderQuestion() {
  const q   = activeQuiz.questions[currentQ];
  const n   = activeQuiz.questions.length;
  const labels = ["A","B","C","D"];

  document.getElementById("questionCounter").textContent = `Q${currentQ+1} of ${n}`;
  document.getElementById("quizProgressFill").style.width = `${(currentQ / n) * 100}%`;
  document.getElementById("answeredCount").textContent = `${Object.keys(answers).length}/${n} answered`;
  document.getElementById("btnPrev").disabled = currentQ === 0;

  const isLast = currentQ === n - 1;
  document.getElementById("btnNext").style.display   = isLast ? "none"  : "";
  document.getElementById("btnSubmit").style.display = isLast ? "inline-flex" : "none";

  /* Options */
  const block = document.getElementById("questionBlock");
  block.innerHTML = `
    <div class="question-number">Q${currentQ+1} · ${q.points} pts</div>
    <div class="question-text">${q.text}</div>
    ${q.options.map((opt, i) => `
      <button class="option-btn ${answers[currentQ] === i ? "selected" : ""}" onclick="selectAnswer(${i})">
        <span class="opt-label">${labels[i]}</span>${opt}
      </button>`).join("")}`;

  /* Question map */
  const map = document.getElementById("questionMap");
  map.innerHTML = activeQuiz.questions.map((_,i) => `
    <button class="q-map-btn ${i===currentQ?"current":""} ${answers[i]!==undefined?"answered":""}" onclick="jumpTo(${i})">${i+1}</button>`
  ).join("");
}

function selectAnswer(optIdx) {
  answers[currentQ] = optIdx;
  renderQuestion();
}

function navigate(dir) {
  currentQ = Math.max(0, Math.min(activeQuiz.questions.length - 1, currentQ + dir));
  renderQuestion();
}

function jumpTo(i) {
  currentQ = i;
  renderQuestion();
}

/* ── TIMER ── */
function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    if (timeLeft <= 0) { clearInterval(timerInterval); submitQuiz(); }
  }, 1000);
}

function updateTimerDisplay() {
  const m = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const s = String(timeLeft % 60).padStart(2, "0");
  const el = document.getElementById("quizTimer");
  el.textContent = `${timeLeft < 120 ? "🔴" : "⏱"} ${m}:${s}`;
  el.className   = `timer${timeLeft < 120 ? " urgent" : ""}`;
}

/* ── SUBMIT ── */
function submitQuiz() {
  if (quizDone) return;
  quizDone = true;
  clearInterval(timerInterval);

  let earned = 0;
  activeQuiz.questions.forEach((q, i) => { if (answers[i] === q.correct) earned += q.points; });
  const total     = activeQuiz.questions.reduce((a,q) => a + q.points, 0);
  const score     = total ? Math.round(earned / total * 100) : 0;
  const passed    = score >= activeQuiz.passingScore;
  const timeTaken = Math.max(1, Math.round((Date.now() - startTime) / 60000));
  const grade     = getGrade(score);

  lastResult = Store.addResult({
    quizId:    activeQuiz.id,
    quizTitle: activeQuiz.title,
    userName:  Store.getStudentName(),
    email:     Store.getStudentName().toLowerCase().replace(/ /g,".") + "@quiz.local",
    score, passed,
    date:      new Date().toISOString().split("T")[0],
    timeTaken,
    answers:   {...answers},
  });

  showScoreScreen(lastResult, grade, timeTaken);
}

/* ── SCORE SCREEN ── */
function showScoreScreen(result, grade, timeTaken) {
  const ring = document.getElementById("scoreRing");
  ring.className = `score-ring ${result.passed ? "pass" : "fail"}`;
  document.getElementById("scorePercent").textContent = result.score + "%";
  document.getElementById("scoreStatus").textContent  = result.passed ? "PASSED" : "FAILED";
  document.getElementById("scoreTitle").textContent   = result.passed ? "🎉 Congratulations!" : "😔 Keep Practicing!";
  document.getElementById("scoreSubtitle").textContent = result.passed
    ? `You passed "${result.quizTitle}" — great work, ${result.userName}!`
    : `You scored ${result.score}%. You need ${activeQuiz.passingScore}% to pass.`;

  document.getElementById("scoreInfoGrid").innerHTML = `
    <div class="info-box"><div class="info-box-val ${result.passed?"text-green":"text-red"}">${result.score}%</div><div class="info-box-label">Score</div></div>
    <div class="info-box"><div class="info-box-val text-gold">${grade}</div><div class="info-box-label">Grade</div></div>
    <div class="info-box"><div class="info-box-val text-accent">${timeTaken}m</div><div class="info-box-label">Time</div></div>
    <div class="info-box"><div class="info-box-val ${result.passed?"text-green":"text-red"}">${result.passed?"✓":"✕"}</div><div class="info-box-label">Passed</div></div>`;

  /* Answer Review */
  const labels = ["A","B","C","D"];
  document.getElementById("reviewContent").innerHTML = activeQuiz.questions.map((q, i) => {
    const ua = result.answers?.[i];
    const ok = ua === q.correct;
    return `
      <div class="review-item">
        <div class="review-question">${i+1}. ${q.text}</div>
        ${q.options.map((opt, oi) => `
          <div class="option-btn ${oi===q.correct?"correct":oi===ua&&!ok?"wrong":"dimmed"}" style="cursor:default;margin-bottom:5px;padding:9px 14px">
            <span class="opt-label">${labels[oi]}</span>
            <span style="flex:1">${opt}</span>
            ${oi===q.correct ? `<span style="font-size:11px;margin-left:auto;flex-shrink:0">✓ Correct</span>` : ""}
            ${oi===ua&&!ok   ? `<span style="font-size:11px;margin-left:auto;flex-shrink:0;color:var(--red)">✗ Your answer</span>` : ""}
          </div>`).join("")}
      </div>`;
  }).join("");

  document.getElementById("btnGetCert").style.display = result.passed ? "inline-flex" : "none";
  showStep("score");
}

function getCertificate() {
  if (lastResult) openCertModal(lastResult);
}

function retakeQuiz() {
  if (!activeQuiz) return;
  answers  = {};
  currentQ = 0;
  quizDone = false;
  timeLeft = activeQuiz.duration * 60;
  startTime = Date.now();
  renderQuestion();
  startTimer();
  showStep("quiz");
}
