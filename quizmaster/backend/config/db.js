// ============================================================
//  config/db.js — MySQL Connection Pool
//  QuizMaster Pro
// ============================================================

const mysql = require("mysql2/promise");

// ── Connection pool (reuses connections, much faster than single connection)
const pool = mysql.createPool({
  host:               process.env.DB_HOST     || "localhost",
  port:               process.env.DB_PORT     || 3306,
  user:               process.env.DB_USER     || "root",
  password:           process.env.DB_PASSWORD || "",          // ← change this
  database:           process.env.DB_NAME     || "quizmaster_db",
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  timezone:           "+00:00",
});

// ── Test connection on startup
async function testConnection() {
  try {
    const conn = await pool.getConnection();
    console.log("✅ MySQL connected successfully");
    conn.release();
  } catch (err) {
    console.error("❌ MySQL connection failed:", err.message);
    console.error("   Check your .env file and make sure MySQL is running.");
    process.exit(1);
  }
}

module.exports = { pool, testConnection };
