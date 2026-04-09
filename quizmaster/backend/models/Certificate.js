// ============================================================
//  models/Certificate.js — Certificate Queries
//  QuizMaster Pro
// ============================================================

const { pool } = require("../config/db");

const Certificate = {

  // ── Get by result ID
  async getByResultId(resultId) {
    const [[row]] = await pool.query(
      "SELECT * FROM certificates WHERE result_id = ? LIMIT 1", [resultId]
    );
    return row || null;
  },

  // ── Get by cert UID (public verification)
  async getByCertUid(certUid) {
    const [[row]] = await pool.query(
      `SELECT c.*, r.user_name, r.score, r.submitted_at,
              q.title AS quiz_title, q.category
       FROM   certificates c
       JOIN   results r ON r.id = c.result_id
       JOIN   quizzes q ON q.id = r.quiz_id
       WHERE  c.cert_uid = ? LIMIT 1`, [certUid]
    );
    return row || null;
  },

  // ── Get all certificates for a user
  async getByUserId(userId) {
    const [rows] = await pool.query(
      `SELECT c.*, r.user_name, r.score, r.submitted_at,
              q.title AS quiz_title, q.category, q.id AS quiz_id
       FROM   certificates c
       JOIN   results r ON r.id = c.result_id
       JOIN   quizzes q ON q.id = r.quiz_id
       WHERE  r.user_id = ?
       ORDER  BY c.issued_at DESC`, [userId]
    );
    return rows;
  },

  // ── Get all certificates (admin)
  async getAll() {
    const [rows] = await pool.query(
      `SELECT c.*, r.user_name, r.user_email, r.score,
              DATE_FORMAT(r.submitted_at, '%Y-%m-%d') AS date,
              q.title AS quiz_title, q.id AS quiz_id
       FROM   certificates c
       JOIN   results r ON r.id = c.result_id
       JOIN   quizzes q ON q.id = r.quiz_id
       ORDER  BY c.issued_at DESC`
    );
    return rows;
  },
};

module.exports = Certificate;
