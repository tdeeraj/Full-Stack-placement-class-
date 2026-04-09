// ============================================================
//  routes/users.js — User Management Routes (Admin)
//  GET    /api/users
//  GET    /api/users/:id
//  DELETE /api/users/:id
// ============================================================

const router = require("express").Router();
const User   = require("../models/User");
const Result = require("../models/Result");
const { authenticate, requireAdmin } = require("../middleware/auth");

// All routes require admin
router.use(authenticate, requireAdmin);

// ── GET /api/users — list all users
router.get("/", async (req, res) => {
  try {
    const users = await User.getAll();
    res.json({ success: true, data: users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch users." });
  }
});

// ── GET /api/users/:id — user detail + their results
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(Number(req.params.id));
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    const results = await Result.getAll({ userId: user.id });
    res.json({ success: true, data: { ...user, results } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch user." });
  }
});

// ── DELETE /api/users/:id
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (id === req.user.id) {
      return res.status(400).json({ success: false, message: "You cannot delete your own account." });
    }
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    await User.delete(id);
    res.json({ success: true, message: "User deleted." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to delete user." });
  }
});

module.exports = router;
