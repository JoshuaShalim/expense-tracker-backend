// routes/expenseRoutes.js
const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  addExpense,
  getAllExpenses,
  deleteExpense,
  downloadExpenseExcel,
  suggestCategoryHandler
} = require("../controllers/expenseController");

const router = express.Router();

router.post("/add", protect, addExpense);
router.get("/get", protect, getAllExpenses);
router.delete("/:id", protect, deleteExpense);
router.get("/download", protect, downloadExpenseExcel);

// ✅ New route to suggest category
router.post("/suggest", protect, suggestCategoryHandler);

module.exports = router;
