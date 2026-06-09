const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const crypto = require("crypto");

// 📧 Send Verification Email (called during signup)
router.post("/send-verification", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Generate verification token (valid for 24 hours)
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Save verification token
    await pool.query(
      `INSERT INTO email_verification (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [userId, verificationToken, expiresAt]
    );

    // TODO: Send email with verification link
    const verificationLink = `http://localhost:3000/verify-email/${verificationToken}`;
    console.log("Verification Link:", verificationLink); // For testing

    res.json({
      message: "Verification email sent",
      verificationToken // Remove in production
    });
  } catch (err) {
    console.error("Send Verification Error:", err);
    res.status(500).json({ message: err.message });
  }
});

// ✅ Verify Email Token
router.post("/verify-email", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    // Find valid verification token
    const verifyRecord = await pool.query(
      `SELECT user_id FROM email_verification 
       WHERE token = $1 AND expires_at > NOW()`,
      [token]
    );

    if (verifyRecord.rows.length === 0) {
      return res.status(400).json({ message: "Invalid or expired verification token" });
    }

    const userId = verifyRecord.rows[0].user_id;

    // Mark user as verified
    await pool.query(
      "UPDATE users SET verified = TRUE WHERE id = $1",
      [userId]
    );

    // Delete used verification token
    await pool.query(
      "DELETE FROM email_verification WHERE token = $1",
      [token]
    );

    res.json({ message: "Email verified successfully" });
  } catch (err) {
    console.error("Verify Email Error:", err);
    res.status(500).json({ message: err.message });
  }
});

// 🔍 Check if email is verified
router.get("/is-verified/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await pool.query(
      "SELECT verified FROM users WHERE id = $1",
      [userId]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ verified: user.rows[0].verified });
  } catch (err) {
    console.error("Check Verified Error:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
