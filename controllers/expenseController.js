// controllers/expenseController.js
const xlsx = require('xlsx');
const Expense = require("../models/Expense");
const { suggestCategory } = require("../utils/simple-categorizer");

// Add Expense (with auto-categorization)
exports.addExpense = async (req, res) => {
  const userId = req.user.id;
  try {
    const { icon, category, amount, date, description, merchant } = req.body;

    // Validation
    if (!amount || !date) {
      return res.status(400).json({ message: "Amount and Date are required" });
    }

    // Run category suggestion
    const suggestedCategory = suggestCategory(description, merchant);

    const newExpense = new Expense({
      userId,
      icon,
      description: description || "",
      merchant: merchant || "",
      amount,
      date: new Date(date),
      // Use given category or fallback to suggestion
      category: category && category !== "" ? category : suggestedCategory,
      suggestedCategory,
    });

    await newExpense.save();
    res.status(200).json(newExpense);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get All Expenses
exports.getAllExpenses = async (req, res) => {
  const userId = req.user.id;
  try {
    const expense = await Expense.find({ userId }).sort({ date: -1 });
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Delete Expense
exports.deleteExpense = async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Download Excel
exports.downloadExpenseExcel = async (req, res) => {
  const userId = req.user.id;
  try {
    const expense = await Expense.find({ userId }).sort({ date: -1 });
    // Prepare data for Excel
    const data = expense.map((item) => ({
      category: item.category,
      Amount: item.amount,
      Date: item.date,
    }));

    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(wb, ws, "Expense");
    xlsx.writeFile(wb, "expense_details.xlsx");
    res.download("expense_details.xlsx");
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Suggest category endpoint (no save, just suggestion)
exports.suggestCategoryHandler = async (req, res) => {
  try {
    const { description = "", merchant = "" } = req.body;
    const suggestedCategory = suggestCategory(description, merchant);
    res.status(200).json({ suggestedCategory });
  } catch (err) {
    console.error("suggestCategoryHandler error:", err);
    res.status(500).json({ message: err.message });
  }
};
    