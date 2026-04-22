require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const incomeRoutes = require("./routes/incomeRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

// ✅ Allowed origins (LOCAL + PRODUCTION)
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://expense-tracker-eta-ashy-39.vercel.app",
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
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  exposedHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400, // 24 hours - cache preflight results
  optionsSuccessStatus: 200
};

// ✅ Apply CORS to all routes
app.use(cors(corsOptions));

// ✅ Handle preflight OPTIONS requests for all routes (instant response, no DB)
app.options("*", cors(corsOptions));

// ✅ Middleware
app.use(express.json());

// ✅ DB
connectDB();

// ✅ Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/income", incomeRoutes);
app.use("/api/v1/expense", expenseRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);

// ✅ Static uploads removed (using Cloudinary instead for serverless compatibility)

// ✅ Start
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));