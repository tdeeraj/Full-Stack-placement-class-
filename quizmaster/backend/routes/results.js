// ============================================================
//  routes/results.js — Quiz Results Routes
//  GET  /api/results
//  GET  /api/results/:id
//  POST /api/results/submit
//  DELETE /api/results/:id
//  GET  /api/results/analytics
// ============================================================

const router = require("express").Router();
const Result = require("../models/Result");
const { authenticate, optionalAuth, requireAdmin } = require("../middleware/auth");

// ── GET /api/results/analytics — dashboard stats (admin)
router.get("/analytics", authenticate, requireAdmin, async (req, res) => {
  try {
    const data = await Result.getAnalytics();
    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch analytics." });
  }
});

// ── GET /api/results — list results (admin sees all, student sees own)
router.get("/", authenticate, async (req, res) => {
  try {
    const filters = {};
    if (req.query.quizId) filters.quizId = Number(req.query.quizId);
    if (req.query.passed !== undefined) filters.passed = req.query.passed === "true";
    // Students can only see their own results
    if (req.user.role !== "admin") filters.userId = req.user.id;
    const results = await Result.getAll(filters);
    res.json({ success: true, data: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch results." });
  }
});

// ── GET /api/results/:id — single result with answers
router.get("/:id", authenticate, async (req, res) => {
  try {
    const result = await Result.getById(Number(req.params.id));
    if (!result) return res.status(404).json({ success: false, message: "Result not found." });
    // Students can only see their own
    if (req.user.role !== "admin" && result.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }
    res.json({ success: true, data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch result." });
  }
});

// ── POST /api/results/submit — submit a quiz attempt
router.post("/submit", optionalAuth, async (req, res) => {
  try {
    const { quizId, userName, userEmail, timeTaken, answers } = req.body;
    if (!quizId)    return res.status(400).json({ success: false, message: "quizId is required." });
    if (!userName?.trim()) return res.status(400).json({ success: false, message: "userName is required." });

    const result = await Result.submit({
      quizId:    Number(quizId),
      userId:    req.user?.id || null,
      userName:  userName.trim(),
      userEmail: userEmail || req.user?.email || null,
      timeTaken: timeTaken || 0,
      answers:   answers || {},
    });
    res.status(201).json({
      success: true,
      message: result.passed ? "Quiz passed! Certificate issued." : "Quiz submitted.",
      data: result,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || "Failed to submit quiz." });
  }
});

// ── DELETE /api/results/:id (admin only)
router.delete("/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await Result.getById(Number(req.params.id));
    if (!result) return res.status(404).json({ success: false, message: "Result not found." });
    await Result.delete(Number(req.params.id));
    res.json({ success: true, message: "Result deleted." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to delete result." });
  }
});

module.exports = router;
