require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const incomeRoutes = require("./routes/incomeRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

// ✅ Allowed origins
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://expense-tracker-eta-ashy-39.vercel.app",
];

// ✅ CORS (CLEAN + RELIABLE FOR VERCEL)
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  })
);

// ✅ Handle preflight globally
app.options("*", cors());

// Middleware
app.use(express.json());

// DB connection (safe for serverless use)
connectDB();

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/income", incomeRoutes);
app.use("/api/v1/expense", expenseRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);

module.exports = app;