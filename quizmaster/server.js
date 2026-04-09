// ============================================================
//  server.js — QuizMaster Pro Main Server
//  
//  Setup:
//    1. cp .env.example .env  →  fill in your MySQL details
//    2. mysql -u root -p < backend/schema.sql
//    3. npm install
//    4. npm start
//  
//  Open: http://localhost:3000
// ============================================================

require("dotenv").config();

const express = require("express");
const cors    = require("cors");
const path    = require("path");

const { testConnection }    = require("./backend/config/db");
const authRoutes            = require("./backend/routes/auth");
const quizRoutes            = require("./backend/routes/quizzes");
const resultRoutes          = require("./backend/routes/results");
const certificateRoutes     = require("./backend/routes/certificates");
const userRoutes            = require("./backend/routes/users");
const settingsRoutes        = require("./backend/routes/settings");

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Request logger ────────────────────────────────────────────
app.use((req, res, next) => {
  if (!req.path.startsWith("/api")) return next(); // skip static file logs
  console.log(`[${new Date().toISOString()}]  ${req.method.padEnd(7)} ${req.path}`);
  next();
});

// ── Serve frontend static files ───────────────────────────────
app.use(express.static(path.join(__dirname)));

// ── API Routes ────────────────────────────────────────────────
app.use("/api/auth",         authRoutes);
app.use("/api/quizzes",      quizRoutes);
app.use("/api/results",      resultRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/users",        userRoutes);
app.use("/api/settings",     settingsRoutes);

// ── Health check ──────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "QuizMaster Pro API is running.", timestamp: new Date() });
});

// ── Global error handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, message: "An unexpected error occurred." });
});

// ── SPA fallback — serve index.html for all non-API routes ────
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ── Start server ──────────────────────────────────────────────
async function start() {
  await testConnection();   // verifies MySQL is reachable before accepting traffic
  app.listen(PORT, () => {
    console.log("\n╔══════════════════════════════════════════╗");
    console.log("║      QuizMaster Pro  —  Server Ready     ║");
    console.log(`║      http://localhost:${PORT}                ║`);
    console.log("╚══════════════════════════════════════════╝\n");
    console.log("API Endpoints:");
    console.log("  POST   /api/auth/register");
    console.log("  POST   /api/auth/login");
    console.log("  GET    /api/auth/me");
    console.log("  GET    /api/quizzes");
    console.log("  POST   /api/quizzes          (admin)");
    console.log("  PUT    /api/quizzes/:id       (admin)");
    console.log("  DELETE /api/quizzes/:id       (admin)");
    console.log("  PATCH  /api/quizzes/:id/publish (admin)");
    console.log("  POST   /api/results/submit");
    console.log("  GET    /api/results           (admin/own)");
    console.log("  GET    /api/results/analytics (admin)");
    console.log("  GET    /api/certificates");
    console.log("  GET    /api/certificates/verify/:uid");
    console.log("  GET    /api/users             (admin)");
    console.log("  GET    /api/settings          (admin)");
    console.log("  PUT    /api/settings          (admin)\n");
  });
}

start();
