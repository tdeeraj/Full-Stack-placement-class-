// ============================================================
//  routes/auth.js — Authentication Routes
//  POST /api/auth/register
//  POST /api/auth/login
//  GET  /api/auth/me
//  PUT  /api/auth/me
//  PUT  /api/auth/change-password
// ============================================================

const router   = require("express").Router();
const User     = require("../models/User");
const { signToken, authenticate } = require("../middleware/auth");

// ── POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email, and password are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
    }
    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, message: "An account with that email already exists." });
    }
    // Only allow admin creation if explicitly set (e.g. first user, or by another admin)
    const safeRole = role === "admin" ? "admin" : "student";
    const user  = await User.create({ name, email, password, role: safeRole });
    const token = signToken({ id: user.id, role: user.role });
    res.status(201).json({ success: true, message: "Account created!", data: { user, token } });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ success: false, message: "Registration failed. Please try again." });
  }
});

// ── POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }
    const valid = await User.verifyPassword(password, user.password);
    if (!valid) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }
    const token = signToken({ id: user.id, role: user.role });
    // Don't return hashed password
    delete user.password;
    res.json({ success: true, message: "Login successful!", data: { user, token } });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Login failed. Please try again." });
  }
});

// ── GET /api/auth/me — get logged-in user's profile
router.get("/me", authenticate, async (req, res) => {
  res.json({ success: true, data: req.user });
});

// ── PUT /api/auth/me — update profile
router.put("/me", authenticate, async (req, res) => {
  try {
    const { name, email } = req.body;
    const updated = await User.update(req.user.id, { name, email });
    res.json({ success: true, message: "Profile updated.", data: updated });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ success: false, message: "Failed to update profile." });
  }
});

// ── PUT /api/auth/change-password
router.put("/change-password", authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Both current and new password are required." });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "New password must be at least 6 characters." });
    }
    const fullUser = await User.findByEmail(req.user.email);
    const valid    = await User.verifyPassword(currentPassword, fullUser.password);
    if (!valid) {
      return res.status(401).json({ success: false, message: "Current password is incorrect." });
    }
    await User.changePassword(req.user.id, newPassword);
    res.json({ success: true, message: "Password changed successfully." });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ success: false, message: "Failed to change password." });
  }
});

module.exports = router;
