require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { swaggerUi, swaggerSpec } = require("./swagger");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/userRoutes");
const forgotPasswordRoutes = require("./routes/forgotPassword");
const emailVerificationRoutes = require("./routes/emailVerification");
const tokenRoutes = require("./routes/tokenRoutes");
const adminRoutes = require("./routes/adminRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const skillRoutes = require("./routes/skillRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const leaveRoutes = require("./routes/leaveRoutes");

const app = express();
app.use(cors());
app.use(express.json());
app.use(helmet());

// Rate limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: "Too many requests, please try again later" }
});
app.use("/api/auth", authLimiter);

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
app.use("/api/leave", leaveRoutes);

// Swagger API docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Serve uploads folder
app.use("/uploads", express.static("uploads"));

const PORT = process.env.PORT || 5000;
console.log("Swagger docs available at http://localhost:5000/api-docs");
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});