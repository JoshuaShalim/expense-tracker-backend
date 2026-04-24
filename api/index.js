const serverless = require("serverless-http");
const app = require("../server");
const connectDB = require("../config/db");

// Initialize DB connection at module level (outside handler scope)
// This ensures connection is reused across warm invocations
let dbInitialized = false;

const initDB = async () => {
  if (dbInitialized) return;
  
  try {
    await connectDB();
    dbInitialized = true;
    console.log("Database initialized for serverless");
  } catch (err) {
    console.error("Failed to initialize database:", err);
    throw err;
  }
};

// Middleware to ensure DB is connected before each request
// With connection retry logic for cold starts
app.use(async (req, res, next) => {
  try {
    // Add timeout to prevent hanging requests
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("DB connection timeout")), 8000)
    );
    
    const connectPromise = connectDB();
    
    await Promise.race([connectPromise, timeoutPromise]);
    next();
  } catch (err) {
    console.error("DB error:", err.message);
    res.status(500).json({ error: "Database connection failed" });
  }
});

module.exports = serverless(app, {
  request: {
    base: "/api",
    async: true // Enable async support
  }
});