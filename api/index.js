const serverless = require("serverless-http");
const app = require("../server");
const connectDB = require("../config/db");

// Lazy DB connection (IMPORTANT FIX)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ error: "Database connection failed" });
  }
});

module.exports = serverless(app);