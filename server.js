const express = require("express");

const app = express();

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "health route working."
  });
});

module.exports = app;
