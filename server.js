require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const incomeRoutes = require("./routes/incomeRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || "https://expense-tracker-eta-ashy-39.vercel.app",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    mongoUriSet: !!process.env.MONGO_URI,
    jwtSecretSet: !!process.env.JWT_SECRET,
  });
});

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ error: "DB connection failed", detail: err.message });
  }
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/income", incomeRoutes);
app.use("/api/v1/expense", expenseRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

module.exports = app;
