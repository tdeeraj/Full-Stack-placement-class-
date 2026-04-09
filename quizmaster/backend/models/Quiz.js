// ============================================================
//  models/Quiz.js — Quiz & Question Database Queries
//  QuizMaster Pro
// ============================================================

const { pool } = require("../config/db");

const Quiz = {

  // ── Get all quizzes (with question count)
  async getAll({ publishedOnly = false } = {}) {
    let sql = `
      SELECT q.*, u.name AS created_by_name,
             COUNT(qs.id) AS question_count
      FROM   quizzes q
      LEFT   JOIN users u     ON u.id = q.created_by
      LEFT   JOIN questions qs ON qs.quiz_id = q.id
    `;
    const params = [];
    if (publishedOnly) { sql += " WHERE q.published = 1"; }
    sql += " GROUP BY q.id ORDER BY q.created_at DESC";
    const [rows] = await pool.query(sql, params);
    return rows;
  },

  // ── Get single quiz WITH its questions
  async getById(id) {
    const [[quiz]] = await pool.query(
      `SELECT q.*, u.name AS created_by_name
       FROM   quizzes q
       LEFT   JOIN users u ON u.id = q.created_by
       WHERE  q.id = ?`, [id]
    );
    if (!quiz) return null;

    const [questions] = await pool.query(
      `SELECT id, question_text, option_a, option_b, option_c, option_d,
              correct, points, sort_order
       FROM   questions
       WHERE  quiz_id = ?
       ORDER  BY sort_order ASC, id ASC`, [id]
    );

    // Reshape questions for frontend: options array + text field
    quiz.questions = questions.map(q => ({
      id:      q.id,
      text:    q.question_text,
      options: [q.option_a, q.option_b, q.option_c, q.option_d],
      correct: q.correct,
      points:  q.points,
    }));
    return quiz;
  },

  // ── Create quiz + its questions (transaction)
  async create({ title, category, duration, passing_score, published, created_by, questions }) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [res] = await conn.query(
        `INSERT INTO quizzes (title, category, duration, passing_score, published, created_by)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [title, category || "General", duration || 20, passing_score || 70,
         published ? 1 : 0, created_by || null]
      );
      const quizId = res.insertId;

      if (questions?.length) {
        const rows = questions.map((q, i) => [
          quizId, q.text, q.options[0], q.options[1], q.options[2], q.options[3],
          q.correct, q.points || 10, i
        ]);
        await conn.query(
          `INSERT INTO questions
           (quiz_id, question_text, option_a, option_b, option_c, option_d, correct, points, sort_order)
           VALUES ?`, [rows]
        );
      }

      await conn.commit();
      return this.getById(quizId);
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  // ── Update quiz + replace questions (transaction)
  async update(id, { title, category, duration, passing_score, published, questions }) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      await conn.query(
        `UPDATE quizzes
         SET    title = COALESCE(?, title),
                category = COALESCE(?, category),
                duration = COALESCE(?, duration),
                passing_score = COALESCE(?, passing_score),
                published = COALESCE(?, published)
         WHERE  id = ?`,
        [title || null, category || null, duration || null,
         passing_score || null, published !== undefined ? (published ? 1 : 0) : null, id]
      );

      if (questions) {
        // Replace all questions
        await conn.query("DELETE FROM questions WHERE quiz_id = ?", [id]);
        if (questions.length) {
          const rows = questions.map((q, i) => [
            id, q.text, q.options[0], q.options[1], q.options[2], q.options[3],
            q.correct, q.points || 10, i
          ]);
          await conn.query(
            `INSERT INTO questions
             (quiz_id, question_text, option_a, option_b, option_c, option_d, correct, points, sort_order)
             VALUES ?`, [rows]
          );
        }
      }

      await conn.commit();
      return this.getById(id);
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  // ── Toggle published
  async togglePublish(id) {
    await pool.query(
      "UPDATE quizzes SET published = NOT published WHERE id = ?", [id]
    );
    return this.getById(id);
  },

  // ── Delete quiz (cascades to questions, results)
  async delete(id) {
    await pool.query("DELETE FROM quizzes WHERE id = ?", [id]);
  },

  // ── Stats per quiz
  async getStats(quizId) {
    const [[stats]] = await pool.query(
      `SELECT COUNT(*)                                 AS total_attempts,
              SUM(passed)                              AS total_passed,
              AVG(score)                               AS avg_score,
              MIN(score)                               AS min_score,
              MAX(score)                               AS max_score
       FROM   results WHERE quiz_id = ?`, [quizId]
    );
    return stats;
  },
};

module.exports = Quiz;
