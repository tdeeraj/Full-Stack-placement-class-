// ============================================================
//  models/Result.js — Quiz Results & Answers Database Queries
//  QuizMaster Pro
// ============================================================

const { pool }   = require("../config/db");
const Certificate = require("./Certificate");

const Result = {

  // ── Get all results (with quiz title)
  async getAll({ quizId, userId, passed } = {}) {
    let sql = `
      SELECT r.*, q.title AS quiz_title, q.passing_score,
             c.cert_uid
      FROM   results r
      JOIN   quizzes q ON q.id = r.quiz_id
      LEFT   JOIN certificates c ON c.result_id = r.id
      WHERE  1 = 1
    `;
    const params = [];
    if (quizId !== undefined) { sql += " AND r.quiz_id = ?";  params.push(quizId); }
    if (userId !== undefined) { sql += " AND r.user_id = ?";  params.push(userId); }
    if (passed !== undefined) { sql += " AND r.passed = ?";   params.push(passed ? 1 : 0); }
    sql += " ORDER BY r.submitted_at DESC";

    const [rows] = await pool.query(sql, params);
    return rows;
  },

  // ── Get single result with per-question breakdown
  async getById(id) {
    const [[result]] = await pool.query(
      `SELECT r.*, q.title AS quiz_title, q.passing_score, c.cert_uid
       FROM   results r
       JOIN   quizzes q ON q.id = r.quiz_id
       LEFT   JOIN certificates c ON c.result_id = r.id
       WHERE  r.id = ?`, [id]
    );
    if (!result) return null;

    const [answers] = await pool.query(
      `SELECT ra.*, qs.question_text, qs.option_a, qs.option_b, qs.option_c, qs.option_d,
              qs.correct AS correct_answer, qs.points, qs.sort_order
       FROM   result_answers ra
       JOIN   questions qs ON qs.id = ra.question_id
       WHERE  ra.result_id = ?
       ORDER  BY qs.sort_order ASC`, [id]
    );
    result.answers = answers;
    return result;
  },

  // ── Submit a quiz attempt (grade it, store everything)
  async submit({ quizId, userId, userName, userEmail, timeTaken, answers }) {
    // Load quiz with questions
    const Quiz = require("./Quiz");
    const quiz = await Quiz.getById(quizId);
    if (!quiz) throw new Error("Quiz not found");

    // Grade
    let earned = 0;
    const gradedAnswers = quiz.questions.map((q, i) => {
      const chosen    = answers[i] !== undefined ? Number(answers[i]) : null;
      const isCorrect = chosen === q.correct ? 1 : 0;
      if (isCorrect) earned += q.points;
      return { questionId: q.id, chosen, isCorrect };
    });

    const total   = quiz.questions.reduce((a, q) => a + q.points, 0);
    const score   = total ? Math.round(earned / total * 100) : 0;
    const passed  = score >= quiz.passing_score ? 1 : 0;

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Insert result
      const [res] = await conn.query(
        `INSERT INTO results (quiz_id, user_id, user_name, user_email, score, passed, time_taken)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [quizId, userId || null, userName, userEmail || null, score, passed, timeTaken || 0]
      );
      const resultId = res.insertId;

      // Insert per-question answers
      if (gradedAnswers.length) {
        const rows = gradedAnswers.map(a => [resultId, a.questionId, a.chosen, a.isCorrect]);
        await conn.query(
          "INSERT INTO result_answers (result_id, question_id, chosen, is_correct) VALUES ?", [rows]
        );
      }

      // Auto-issue certificate if passed
      let certUid = null;
      if (passed) {
        certUid = `QMP-${quizId}-${resultId}-${String(score).padStart(3,"0")}`;
        await conn.query(
          "INSERT INTO certificates (result_id, cert_uid) VALUES (?, ?)",
          [resultId, certUid]
        );
      }

      await conn.commit();
      return { id: resultId, score, passed: !!passed, certUid };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  // ── Delete result
  async delete(id) {
    await pool.query("DELETE FROM results WHERE id = ?", [id]);
  },

  // ── Analytics summary
  async getAnalytics() {
    const [[stats]] = await pool.query(
      `SELECT COUNT(*)          AS total_attempts,
              SUM(passed)       AS total_passed,
              AVG(score)        AS avg_score
       FROM   results`
    );
    const [[quizCount]] = await pool.query(
      "SELECT COUNT(*) AS total FROM quizzes WHERE published = 1"
    );
    const [[certCount]] = await pool.query(
      "SELECT COUNT(*) AS total FROM certificates"
    );
    return {
      totalAttempts:    stats.total_attempts   || 0,
      totalPassed:      stats.total_passed     || 0,
      avgScore:         Math.round(stats.avg_score || 0),
      passRate:         stats.total_attempts
                          ? Math.round((stats.total_passed / stats.total_attempts) * 100)
                          : 0,
      publishedQuizzes: quizCount.total        || 0,
      certsIssued:      certCount.total        || 0,
    };
  },
};

module.exports = Result;
