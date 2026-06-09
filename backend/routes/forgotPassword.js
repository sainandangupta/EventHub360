const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// 📧 Send Password Reset Email
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Find user
    const user = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    // Generate reset token (valid for 15 minutes)
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Save reset token to database
    await pool.query(
      `INSERT INTO password_reset (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [user.rows[0].id, resetToken, expiresAt]
    );

    // TODO: Send email with reset link
    const resetLink = `http://localhost:3000/reset-password/${resetToken}`;
    console.log("Reset Link:", resetLink); // For testing

    res.json({
      message: "Reset link sent to your email",
      resetToken // Remove in production
    });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ message: err.message });
  }
});

// 🔑 Reset Password
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: "Token and password are required" });
    }

    // Find valid reset token
    const resetRecord = await pool.query(
      `SELECT user_id FROM password_reset 
       WHERE token = $1 AND expires_at > NOW()`,
      [token]
    );

    if (resetRecord.rows.length === 0) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user password
    await pool.query(
      "UPDATE users SET password = $1 WHERE id = $2",
      [hashedPassword, resetRecord.rows[0].user_id]
    );

    // Delete used reset token
    await pool.query(
      "DELETE FROM password_reset WHERE token = $1",
      [token]
    );

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
