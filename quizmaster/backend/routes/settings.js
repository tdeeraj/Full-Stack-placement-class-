// ============================================================
//  routes/settings.js — App Settings Routes
//  GET /api/settings
//  PUT /api/settings
// ============================================================

const router = require("express").Router();
const { pool } = require("../config/db");
const { authenticate, requireAdmin } = require("../middleware/auth");

// ── GET /api/settings — read all settings
router.get("/", authenticate, requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT setting_key, setting_value FROM settings");
    const settings = {};
    rows.forEach(r => { settings[r.setting_key] = r.setting_value; });
    res.json({ success: true, data: settings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch settings." });
  }
});

// ── PUT /api/settings — update one or more settings
router.put("/", authenticate, requireAdmin, async (req, res) => {
  try {
    const updates = req.body; // { institution: "...", authorized_by: "..." }
    for (const [key, value] of Object.entries(updates)) {
      await pool.query(
        "INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?",
        [key, value, value]
      );
    }
    res.json({ success: true, message: "Settings saved." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to save settings." });
  }
});

module.exports = router;
