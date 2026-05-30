require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    route: "/"
  });
});

app.get("/health", (req, res) => {
  res.json({
    route: "/health"
  });
});

app.get("/test", (req, res) => {
  res.json({
    route: "/test"
  });
});

// NO AUTH ROUTES
app.get("/api/v1/auth/ping", (req, res) => {
  res.json({
    route: "/api/v1/auth/ping"
  });
});

module.exports = app;
