const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorize");

// 👥 Get All Users (Admin Only)
router.get("/users", protect, authorize(["admin"]), async (req, res) => {
  try {
    const users = await pool.query(
      "SELECT id, name, email, role, verified, created_at FROM users"
    );
    res.json(users.rows);
  } catch (err) {
    console.error("Get Users Error:", err);
    res.status(500).json({ message: err.message });
  }
});

// 👤 Update User Role (Admin Only)
router.put("/users/:userId/role", protect, authorize(["admin"]), async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!["user", "admin", "manager", "hr"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const result = await pool.query(
      "UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role",
      [role, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User role updated", user: result.rows[0] });
  } catch (err) {
    console.error("Update Role Error:", err);
    res.status(500).json({ message: err.message });
  }
});

// 🗑️ Delete User (Admin Only)
router.delete("/users/:userId", protect, authorize(["admin"]), async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING id, email",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted", user: result.rows[0] });
  } catch (err) {
    console.error("Delete User Error:", err);
    res.status(500).json({ message: err.message });
  }
});

// 📊 Get Dashboard Stats (Admin Only)
router.get("/stats", protect, authorize(["admin"]), async (req, res) => {
  try {
    const stats = await pool.query(
      `SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN verified = true THEN 1 ELSE 0 END) as verified_users,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admin_count
       FROM users`
    );

    res.json(stats.rows[0]);
  } catch (err) {
    console.error("Stats Error:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
