const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const config = require("../config");
const emailService = require("../services/emailService");
const logger = require("../utils/logger");

// 📧 Send Password Reset Email
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Find user
    const user = await pool.query(
      "SELECT id, name FROM users WHERE email = $1",
      [email]
    );

    if (user.rows.length === 0) {
      // Don't reveal if user exists — always show success
      return res.json({ message: "If this email is registered, you'll receive a password reset link." });
    }

    // Generate reset token (valid for 15 minutes)
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Delete any existing tokens for this user
    await pool.query("DELETE FROM password_reset WHERE user_id = $1", [user.rows[0].id]);

    // Save reset token to database
    await pool.query(
      `INSERT INTO password_reset (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [user.rows[0].id, resetToken, expiresAt]
    );

    // Send email with reset link
    const frontendUrl = config.frontendUrl || "http://localhost:3000";
    const resetLink = `${frontendUrl}/reset-password/${resetToken}`;

    try {
      await emailService.sendPasswordResetEmail(email, user.rows[0].name, resetLink);
      logger.info("Password reset email sent", { email, userId: user.rows[0].id });
    } catch (emailErr) {
      logger.error("Failed to send password reset email", { email, error: emailErr.message });
      // Still log the link for development
      logger.info("Reset Link (dev fallback):", { resetLink });
    }

    res.json({
      message: "If this email is registered, you'll receive a password reset link."
    });
  } catch (err) {
    logger.error("Forgot Password Error:", { error: err.message });
    res.status(500).json({ message: "An error occurred. Please try again." });
  }
});

// ✅ Verify Reset Token (check if token is valid before showing reset form)
router.post("/verify-reset-token", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    const resetRecord = await pool.query(
      `SELECT user_id FROM password_reset 
       WHERE token = $1 AND expires_at > NOW()`,
      [token]
    );

    if (resetRecord.rows.length === 0) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    res.json({ valid: true, message: "Token is valid" });
  } catch (err) {
    logger.error("Token Verification Error:", { error: err.message });
    res.status(500).json({ message: "Verification failed" });
  }
});

// 🔑 Reset Password
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: "Token and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
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

    // Delete all reset tokens for this user
    await pool.query(
      "DELETE FROM password_reset WHERE user_id = $1",
      [resetRecord.rows[0].user_id]
    );

    logger.info("Password reset successful", { userId: resetRecord.rows[0].user_id });

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    logger.error("Reset Password Error:", { error: err.message });
    res.status(500).json({ message: "Failed to reset password" });
  }
});

module.exports = router;
