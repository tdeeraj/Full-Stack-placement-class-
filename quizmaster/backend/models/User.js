// ============================================================
//  models/User.js — User Database Queries
//  QuizMaster Pro
// ============================================================

const { pool } = require("../config/db");
const bcrypt   = require("bcryptjs");

const User = {

  // ── Find user by email
  async findByEmail(email) {
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE email = ? LIMIT 1", [email]
    );
    return rows[0] || null;
  },

  // ── Find user by ID
  async findById(id) {
    const [rows] = await pool.query(
      "SELECT id, name, email, role, avatar, created_at FROM users WHERE id = ? LIMIT 1", [id]
    );
    return rows[0] || null;
  },

  // ── Get all users (admin)
  async getAll() {
    const [rows] = await pool.query(
      "SELECT id, name, email, role, avatar, created_at FROM users ORDER BY created_at DESC"
    );
    return rows;
  },

  // ── Create new user
  async create({ name, email, password, role = "student" }) {
    const hashed = await bcrypt.hash(password, 10);
    const avatar = name.trim().charAt(0).toUpperCase();
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password, role, avatar) VALUES (?, ?, ?, ?, ?)",
      [name.trim(), email.toLowerCase().trim(), hashed, role, avatar]
    );
    return { id: result.insertId, name, email, role, avatar };
  },

  // ── Verify password
  async verifyPassword(plainText, hash) {
    return bcrypt.compare(plainText, hash);
  },

  // ── Update user profile
  async update(id, { name, email }) {
    const avatar = name?.trim().charAt(0).toUpperCase();
    await pool.query(
      "UPDATE users SET name = COALESCE(?, name), email = COALESCE(?, email), avatar = COALESCE(?, avatar) WHERE id = ?",
      [name || null, email || null, avatar || null, id]
    );
    return this.findById(id);
  },

  // ── Change password
  async changePassword(id, newPassword) {
    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password = ? WHERE id = ?", [hashed, id]);
  },

  // ── Delete user
  async delete(id) {
    await pool.query("DELETE FROM users WHERE id = ?", [id]);
  },

  // ── Count users
  async count() {
    const [rows] = await pool.query("SELECT COUNT(*) AS total FROM users");
    return rows[0].total;
  },
};

module.exports = User;
