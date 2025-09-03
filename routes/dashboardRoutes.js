const express = require("express");
const {protect} = require("../middleware/authMiddleware");
const {getDashboardData} = require("../controllers/dashboardController");

const router = express.Router();

router.get("/", protect, getDashboardData);
// Define your dashboard routes here

module.exports = router;
