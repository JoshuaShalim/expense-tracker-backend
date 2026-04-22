// api/index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const serverless = require("serverless-http");

const connectDB = require("../config/db");
const authRoutes = require("../routes/authRoutes");
const incomeRoutes = require("../routes/incomeRoutes");
const expenseRoutes = require("../routes/expenseRoutes");
const dashboardRoutes = require("../routes/dashboardRoutes");

const app = express();

// ✅ Allowed origins
const allowedOrigins = [
  "http://localhost:5173",
  "https://expense-tracker-eta-ashy-39.vercel.app"
];

// ✅ CORS Configuration with ALL required headers
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.) OR from allowed origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed for origin: " + origin));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  exposedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 86400, // 24 hours - cache preflight results
  optionsSuccessStatus: 200
};

// ✅ Apply CORS to all routes
app.use(cors(corsOptions));

// ✅ Handle preflight OPTIONS requests for all routes (instant response, no DB)
app.options("*", cors(corsOptions));

// ✅ Middleware
app.use(express.json());

// ✅ DB connection for each request
app.use(async (req, res, next) => {
  // Skip DB connection for OPTIONS requests (preflight)
  if (req.method === "OPTIONS") {
    return next();
  }
  
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("DB connection error:", err);
    return res.status(500).json({ message: "Database connection failed" });
  }
});

// ✅ Routes
app.use("/v1/auth", authRoutes);
app.use("/v1/income", incomeRoutes);
app.use("/v1/expense", expenseRoutes);
app.use("/v1/dashboard", dashboardRoutes);

// ✅ Static uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ✅ Export for Vercel
module.exports = serverless(app);