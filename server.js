require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const incomeRoutes = require("./routes/incomeRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

app.disable("x-powered-by");

// Allowed frontend addresses
const allowedOrigins = [
  "http://localhost:5173",
  "https://expense-tracker-eta-ashy-39.vercel.app",
];

// Also accept CLIENT_URL from Vercel
if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL.replace(/\/$/, ""));
}

const corsOptions = {
  origin(origin, callback) {
    const normalizedOrigin = origin
      ? origin.replace(/\/$/, "")
      : null;

    // Allow requests without an Origin header and approved browser origins
    if (!origin || allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    console.error(`CORS blocked origin: ${origin}`);
    return callback(new Error("Not allowed by CORS"));
  },

  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],

  optionsSuccessStatus: 204,
};

// CORS must run before every other middleware
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Parse JSON requests
app.use(express.json());

// Health check does not require MongoDB connection
app.get("/health", (req, res) => {
  return res.status(200).json({
    status: "ok",
    mongoUriSet: Boolean(process.env.MONGO_URI),
    jwtSecretSet: Boolean(process.env.JWT_SECRET),
  });
});

// Connect to MongoDB before application routes
app.use(async (req, res, next) => {
  try {
    await connectDB();
    return next();
  } catch (error) {
    console.error("MongoDB connection error:", error.message);

    return res.status(500).json({
      message: "Database connection failed",
    });
  }
});

// Application routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/income", incomeRoutes);
app.use("/api/v1/expense", expenseRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);

// CORS error handler
app.use((error, req, res, next) => {
  if (error.message === "Not allowed by CORS") {
    return res.status(403).json({
      message: "Origin not allowed",
    });
  }

  return next(error);
});

// General error handler
app.use((error, req, res, next) => {
  console.error("Server error:", error);

  return res.status(500).json({
    message: "Internal server error",
  });
});

// Route not found
app.use((req, res) => {
  return res.status(404).json({
    message: "Route not found",
    path: req.originalUrl,
  });
});

// Export directly for Vercel
module.exports = app;
