// ============================================================
//  middleware/auth.js — JWT Authentication Middleware
//  QuizMaster Pro
// ============================================================

const jwt  = require("jsonwebtoken");
const User = require("../models/User");

const SECRET = process.env.JWT_SECRET || "quizmaster_super_secret_key_2024";

// ── Generate token
function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

// ── Verify token middleware (required)
async function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "No token provided. Please log in." });
  }
  const token = header.slice(7);
  try {
    const decoded = jwt.verify(token, SECRET);
    const user    = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ success: false, message: "User not found." });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
}

// ── Optional auth (attaches user if token present, but doesn't block)
async function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    try {
      const token   = header.slice(7);
      const decoded = jwt.verify(token, SECRET);
      req.user      = await User.findById(decoded.id);
    } catch { /* ignore */ }
  }
  next();
}

// ── Admin-only guard (use AFTER authenticate)
function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ success: false, message: "Admin access required." });
  }
  next();
}

module.exports = { signToken, authenticate, optionalAuth, requireAdmin };
