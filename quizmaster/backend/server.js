// ============================================================
//  server.js — Express REST API Backend
//  QuizMaster Pro
//
//  Run:   node server.js
//  Open:  http://localhost:3000
// ============================================================

const express = require("express");
const path    = require("path");
const fs      = require("fs");

const app  = express();
const PORT = process.env.PORT || 3000;

// ── In-memory data store (replace with a real DB in production) ──
let quizzesDB = require("./backend/seed-data").quizzes;
let resultsDB = require("./backend/seed-data").results;

// ── Middleware ──
app.use(express.json());
app.use(express.static(path.join(__dirname)));   // serves index.html & assets

// ── Logging ──
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ============================================================
//  QUIZ ROUTES
// ============================================================

/** GET /api/quizzes — list all quizzes */
app.get("/api/quizzes", (req, res) => {
  const { published } = req.query;
  let list = quizzesDB;
  if (published !== undefined) list = list.filter(q => q.published === (published === "true"));
  res.json({ success: true, data: list });
});

/** GET /api/quizzes/:id — single quiz */
app.get("/api/quizzes/:id", (req, res) => {
  const quiz = quizzesDB.find(q => q.id === Number(req.params.id));
  if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found" });
  res.json({ success: true, data: quiz });
});

/** POST /api/quizzes — create quiz */
app.post("/api/quizzes", (req, res) => {
  const { title, category, duration, passingScore, published, questions } = req.body;
  if (!title || !questions?.length) {
    return res.status(400).json({ success: false, message: "Title and at least one question are required." });
  }
  const quiz = {
    id: Date.now(),
    title, category: category || "General",
    duration: duration || 20,
    passingScore: passingScore || 70,
    published: published || false,
    createdAt: new Date().toISOString().split("T")[0],
    questions,
  };
  quizzesDB.push(quiz);
  res.status(201).json({ success: true, data: quiz });
});

/** PUT /api/quizzes/:id — update quiz */
app.put("/api/quizzes/:id", (req, res) => {
  const idx = quizzesDB.findIndex(q => q.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ success: false, message: "Quiz not found" });
  quizzesDB[idx] = { ...quizzesDB[idx], ...req.body, id: quizzesDB[idx].id };
  res.json({ success: true, data: quizzesDB[idx] });
});

/** DELETE /api/quizzes/:id — delete quiz */
app.delete("/api/quizzes/:id", (req, res) => {
  const before = quizzesDB.length;
  quizzesDB = quizzesDB.filter(q => q.id !== Number(req.params.id));
  if (quizzesDB.length === before) return res.status(404).json({ success: false, message: "Quiz not found" });
  res.json({ success: true, message: "Quiz deleted" });
});

/** PATCH /api/quizzes/:id/publish — toggle publish */
app.patch("/api/quizzes/:id/publish", (req, res) => {
  const quiz = quizzesDB.find(q => q.id === Number(req.params.id));
  if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found" });
  quiz.published = !quiz.published;
  res.json({ success: true, data: quiz });
});

// ============================================================
//  RESULTS ROUTES
// ============================================================

/** GET /api/results — list all results */
app.get("/api/results", (req, res) => {
  const { quizId, passed } = req.query;
  let list = resultsDB;
  if (quizId) list = list.filter(r => r.quizId === Number(quizId));
  if (passed !== undefined) list = list.filter(r => r.passed === (passed === "true"));
  res.json({ success: true, data: list });
});

/** GET /api/results/:id — single result */
app.get("/api/results/:id", (req, res) => {
  const result = resultsDB.find(r => r.id === Number(req.params.id));
  if (!result) return res.status(404).json({ success: false, message: "Result not found" });
  res.json({ success: true, data: result });
});

/** POST /api/results — submit a quiz attempt */
app.post("/api/results", (req, res) => {
  const { quizId, userName, email, answers } = req.body;
  const quiz = quizzesDB.find(q => q.id === Number(quizId));
  if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found" });
  if (!userName) return res.status(400).json({ success: false, message: "userName is required" });

  // Grade the attempt
  let earned = 0;
  quiz.questions.forEach((q, i) => {
    if (answers && answers[i] === q.correct) earned += q.points;
  });
  const total  = quiz.questions.reduce((a,q) => a + q.points, 0);
  const score  = total ? Math.round(earned / total * 100) : 0;
  const passed = score >= quiz.passingScore;

  const result = {
    id:        Date.now(),
    quizId:    quiz.id,
    quizTitle: quiz.title,
    userName,
    email:     email || `${userName.toLowerCase().replace(/ /g,".")}@quiz.local`,
    score,
    passed,
    date:      new Date().toISOString().split("T")[0],
    timeTaken: req.body.timeTaken || 0,
    answers:   answers || {},
  };
  resultsDB.unshift(result);
  res.status(201).json({ success: true, data: result });
});

/** DELETE /api/results/:id — delete a result */
app.delete("/api/results/:id", (req, res) => {
  const before = resultsDB.length;
  resultsDB = resultsDB.filter(r => r.id !== Number(req.params.id));
  if (resultsDB.length === before) return res.status(404).json({ success: false, message: "Result not found" });
  res.json({ success: true, message: "Result deleted" });
});

// ============================================================
//  ANALYTICS ROUTE
// ============================================================

/** GET /api/analytics — summary statistics */
app.get("/api/analytics", (req, res) => {
  const published  = quizzesDB.filter(q => q.published).length;
  const totalAtt   = resultsDB.length;
  const passed     = resultsDB.filter(r => r.passed).length;
  const passRate   = totalAtt ? Math.round(passed / totalAtt * 100) : 0;
  const avgScore   = totalAtt ? Math.round(resultsDB.reduce((a,r) => a+r.score, 0) / totalAtt) : 0;

  res.json({
    success: true,
    data: {
      publishedQuizzes: published,
      totalAttempts:    totalAtt,
      passRate:         passRate,
      avgScore:         avgScore,
      certsIssued:      passed,
    }
  });
});

// ── Catch-all: serve index.html for SPA navigation ──
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ── Start server ──
app.listen(PORT, () => {
  console.log("\n╔══════════════════════════════════════╗");
  console.log("║     QuizMaster Pro — Server Ready    ║");
  console.log(`║     http://localhost:${PORT}             ║`);
  console.log("╚══════════════════════════════════════╝\n");
  console.log("API Endpoints:");
  console.log("  GET    /api/quizzes");
  console.log("  POST   /api/quizzes");
  console.log("  PUT    /api/quizzes/:id");
  console.log("  DELETE /api/quizzes/:id");
  console.log("  PATCH  /api/quizzes/:id/publish");
  console.log("  GET    /api/results");
  console.log("  POST   /api/results");
  console.log("  GET    /api/analytics\n");
});

module.exports = app;
