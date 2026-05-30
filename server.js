require("dotenv").config();
const express = require("express");

const app = express();

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

app.get("/ping", (req, res) => {
  res.json({
    route: "/ping"
  });
});

module.exports = app;
