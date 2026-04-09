// ============================================================
//  routes/quizzes.js — Quiz CRUD Routes
//  GET    /api/quizzes
//  GET    /api/quizzes/:id
//  POST   /api/quizzes
//  PUT    /api/quizzes/:id
//  DELETE /api/quizzes/:id
//  PATCH  /api/quizzes/:id/publish
//  GET    /api/quizzes/:id/stats
// ============================================================

const router  = require("express").Router();
const Quiz    = require("../models/Quiz");
const { authenticate, optionalAuth, requireAdmin } = require("../middleware/auth");

// ── GET /api/quizzes — list quizzes
router.get("/", optionalAuth, async (req, res) => {
  try {
    const isAdmin     = req.user?.role === "admin";
    const publishedOnly = !isAdmin; // students only see published
    const quizzes     = await Quiz.getAll({ publishedOnly });
    res.json({ success: true, data: quizzes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch quizzes." });
  }
});

// ── GET /api/quizzes/:id — single quiz with questions
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const quiz = await Quiz.getById(Number(req.params.id));
    if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found." });
    // Students can only see published
    if (!quiz.published && req.user?.role !== "admin") {
      return res.status(403).json({ success: false, message: "This quiz is not published yet." });
    }
    res.json({ success: true, data: quiz });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch quiz." });
  }
});

// ── POST /api/quizzes — create (admin only)
router.post("/", authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, category, duration, passing_score, published, questions } = req.body;
    if (!title?.trim()) {
      return res.status(400).json({ success: false, message: "Quiz title is required." });
    }
    if (!questions?.length) {
      return res.status(400).json({ success: false, message: "At least one question is required." });
    }
    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text?.trim()) return res.status(400).json({ success: false, message: `Question ${i+1}: text is required.` });
      if (!q.options || q.options.length !== 4 || q.options.some(o => !o?.trim())) {
        return res.status(400).json({ success: false, message: `Question ${i+1}: all four options are required.` });
      }
    }
    const quiz = await Quiz.create({ title, category, duration, passing_score, published, created_by: req.user.id, questions });
    res.status(201).json({ success: true, message: "Quiz created!", data: quiz });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to create quiz." });
  }
});

// ── PUT /api/quizzes/:id — update (admin only)
router.put("/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const id   = Number(req.params.id);
    const quiz = await Quiz.getById(id);
    if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found." });

    const { questions } = req.body;
    if (questions) {
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (!q.text?.trim()) return res.status(400).json({ success: false, message: `Question ${i+1}: text is required.` });
        if (!q.options || q.options.length !== 4 || q.options.some(o => !o?.trim())) {
          return res.status(400).json({ success: false, message: `Question ${i+1}: all four options are required.` });
        }
      }
    }
    const updated = await Quiz.update(id, req.body);
    res.json({ success: true, message: "Quiz updated!", data: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to update quiz." });
  }
});

// ── DELETE /api/quizzes/:id (admin only)
router.delete("/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const quiz = await Quiz.getById(id);
    if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found." });
    await Quiz.delete(id);
    res.json({ success: true, message: "Quiz deleted." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to delete quiz." });
  }
});

// ── PATCH /api/quizzes/:id/publish — toggle publish (admin only)
router.patch("/:id/publish", authenticate, requireAdmin, async (req, res) => {
  try {
    const quiz = await Quiz.togglePublish(Number(req.params.id));
    if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found." });
    res.json({ success: true, message: `Quiz ${quiz.published ? "published" : "unpublished"}.`, data: quiz });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to toggle publish." });
  }
});

// ── GET /api/quizzes/:id/stats (admin only)
router.get("/:id/stats", authenticate, requireAdmin, async (req, res) => {
  try {
    const stats = await Quiz.getStats(Number(req.params.id));
    res.json({ success: true, data: stats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch stats." });
  }
});

module.exports = router;
