const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const jwt = require("jsonwebtoken");

// 🔄 Refresh Access Token
router.post("/refresh-token", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    // Find valid refresh token in database
    const tokenRecord = await pool.query(
      `SELECT user_id FROM refresh_tokens 
       WHERE token = $1 AND expires_at > NOW()`,
      [refreshToken]
    );

    if (tokenRecord.rows.length === 0) {
      return res.status(401).json({ message: "Invalid or expired refresh token" });
    }

    // Get user data
    const user = await pool.query(
      "SELECT id, email, role FROM users WHERE id = $1",
      [tokenRecord.rows[0].user_id]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate new access token (15 minutes)
    const newAccessToken = jwt.sign(
      { id: user.rows[0].id, email: user.rows[0].email, role: user.rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({
      message: "Access token refreshed",
      accessToken: newAccessToken
    });
  } catch (err) {
    console.error("Refresh Token Error:", err);
    res.status(500).json({ message: err.message });
  }
});

// ❌ Logout (Invalidate Refresh Token)
router.post("/logout", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    // Delete refresh token from database
    await pool.query(
      "DELETE FROM refresh_tokens WHERE token = $1",
      [refreshToken]
    );

    res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout Error:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
