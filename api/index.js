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

// ✅ CORS
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://expense-tracker-eta-ashy-39.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

// ✅ Proper CORS
app.use(cors(corsOptions));

// ✅ Proper preflight handling
app.options("*", cors(corsOptions));


// ✅ Middleware
app.use(express.json());

// ✅ DB connection for each request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("DB connection error:", err);
    return res.status(500).json({ message: "Database connection failed" });
  }
});

// ✅ Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/income", incomeRoutes);
app.use("/api/v1/expense", expenseRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);

// ✅ Static uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ✅ Export for Vercel
module.exports = serverless(app);