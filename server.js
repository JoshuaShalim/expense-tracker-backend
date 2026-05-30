require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/test", (req, res) => {
  res.json({
    message: "test route works"
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok"
  });
});

try {
  const authRoutes = require("./routes/authRoutes");

  app.get("/auth-loaded", (req, res) => {
    res.json({
      authRoutesLoaded: true
    });
  });

  app.use("/api/v1/auth", authRoutes);

} catch (err) {
  console.error("AUTH ROUTE LOAD ERROR:", err);

  app.get("/auth-loaded", (req, res) => {
    res.status(500).json({
      authRoutesLoaded: false,
      error: err.message
    });
  });
}

module.exports = app;
