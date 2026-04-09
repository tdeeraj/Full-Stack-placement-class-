// ============================================================
//  routes/certificates.js — Certificate Routes
//  GET /api/certificates
//  GET /api/certificates/:certUid  — public verification
// ============================================================

const router      = require("express").Router();
const Certificate = require("../models/Certificate");
const { authenticate, requireAdmin } = require("../middleware/auth");

// ── GET /api/certificates — all certs (admin) or own certs (student)
router.get("/", authenticate, async (req, res) => {
  try {
    let certs;
    if (req.user.role === "admin") {
      certs = await Certificate.getAll();
    } else {
      certs = await Certificate.getByUserId(req.user.id);
    }
    res.json({ success: true, data: certs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch certificates." });
  }
});

// ── GET /api/certificates/verify/:certUid — public certificate verification
router.get("/verify/:certUid", async (req, res) => {
  try {
    const cert = await Certificate.getByCertUid(req.params.certUid);
    if (!cert) {
      return res.status(404).json({ success: false, message: "Certificate not found or invalid." });
    }
    res.json({ success: true, data: cert });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Verification failed." });
  }
});

module.exports = router;
