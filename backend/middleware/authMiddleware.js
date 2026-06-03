const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  // 🪙 Extract the token from the Authorization header box
  const token = req.header("Authorization");

  // If no token is provided, deny access immediately
  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    // 🔍 Decode and verify the token using your secret key signature
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
    req.user = decoded; // Attach user payload (like the user's database ID) to the request
    next(); // Pass control to the next route handler (the profile endpoint)
  } catch (err) {
    res.status(400).json({ message: "Invalid token structure." });
  }
};