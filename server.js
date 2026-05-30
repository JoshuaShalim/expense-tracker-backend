require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// TEST ROUTE
app.get("/test", (req, res) => {
  res.json({
    message: "test route works"
  });
});

// HEALTH ROUTE
app.get("/health", (req, res) => {
  res.json({
    status: "ok"
  });
});

// AUTH ROUTES
app.use("/api/v1/auth", authRoutes);

module.exports = app;
