const jwt = require("jsonwebtoken");
const User = require("../models/User");
const connectDB = require("../config/db");

const protect = async (req, res, next) => {
  // ✅ SKIP OPTIONS preflight requests - they don't need authentication
  if (req.method === "OPTIONS") {
    return next();
  }

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      console.log("Token received:", token);

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded token:", decoded);

      // Ensure DB connection before querying User
      await connectDB();

      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      req.user = user;
      next();
    } catch (err) {
      console.error("JWT error:", err.message);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

module.exports = { protect };
