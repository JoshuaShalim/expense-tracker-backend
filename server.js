require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());

app.get("/health", (req, res) => {
  res.json({
    status: "ok"
  });
});

module.exports = app;
