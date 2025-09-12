const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { getDashboardData } = require("../controllers/dashboardController");

const router = express.Router();

// --- Existing dashboard route ---
router.get("/", protect, getDashboardData);

// --- Optional separate insights route (if you want direct access) ---
// You can remove this if you only plan to use insights via getDashboardData
// const { getInsights } = require("../controllers/dashboardController");
// router.get("/insights", protect, getInsights);

module.exports = router;
