const serverless = require("serverless-http");
const app = require("../server");
const connectDB = require("../config/db");

// Simple sync middleware - async middleware doesn't work well with serverless-http
app.use((req, res, next) => {
  // Try to connect but don't block - let the route handlers manage DB connection
  connectDB().then(() => next()).catch(err => {
    console.error("DB connection error:", err.message);
    // Don't block the request - let it proceed and fail at DB level if needed
    next();
  });
});

module.exports = serverless(app);