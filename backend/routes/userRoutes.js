const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const protect = require("../middleware/authMiddleware");

// 🔒 Secure Profile Endpoint -> matches http://localhost:5000/api/user/profile
router.get("/profile", protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch user from database
    const user = await pool.query(
      "SELECT id, name, email, role, verified, last_login, created_at FROM users WHERE id = $1",
      [userId]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.rows[0]);
  } catch (err) {
    console.error("Profile Error:", err);
    res.status(500).json({ message: "Server Error fetching profile data." });
  }
});

module.exports = router;