require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/userRoutes");
const forgotPasswordRoutes = require("./routes/forgotPassword");
const emailVerificationRoutes = require("./routes/emailVerification");
const tokenRoutes = require("./routes/tokenRoutes");
const adminRoutes = require("./routes/adminRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const skillRoutes = require("./routes/skillRoutes");
const employeeRoutes = require("./routes/employeeRoutes");

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/password", forgotPasswordRoutes);
app.use("/api/email", emailVerificationRoutes);
app.use("/api/token", tokenRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/employees", employeeRoutes);

// Serve uploads folder
app.use("/uploads", express.static("uploads"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});