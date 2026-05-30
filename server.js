require("dotenv").config();
const express = require("express");

const app = express();

app.get("*", (req, res) => {
  res.json({
    url: req.originalUrl,
    path: req.path
  });
});

module.exports = app;
