const Income = require("../models/Income");
const Expense = require("../models/Expense");
const { isValidObjectId, Types } = require("mongoose");

// Dashboard Data
exports.getDashboardData = async (req, res) => {
    try {
        const userId = req.user.id;
        const userObjectId = new Types.ObjectId(String(userId));

        // fetch total income and expenses
        const totalIncome = await Income.aggregate([
            { $match: { userId: userObjectId } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        const totalExpense = await Expense.aggregate([
            { $match: { userId: userObjectId } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        // Last 60 days income
        const last60DaysIncomeTransactions = await Income.find({
            userId,
            date: { $gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) },
        }).sort({ date: -1 });

        const incomeLast60Days = last60DaysIncomeTransactions.reduce((sum, txn) => sum + txn.amount, 0);

        // Last 30 days expense
        const last30DaysExpenseTransactions = await Expense.find({
            userId,
            date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        }).sort({ date: -1 });

        const expenseLast30Days = last30DaysExpenseTransactions.reduce((sum, txn) => sum + txn.amount, 0);

        // Last 5 Transactions
        const lastTransactions = [
            ...(await Income.find({ userId }).sort({ date: -1 }).limit(5)).map(
                txn => ({ ...txn.toObject(), type: "income" })
            ),
            ...(await Expense.find({ userId }).sort({ date: -1 }).limit(5)).map(
                txn => ({ ...txn.toObject(), type: "expense" })
            )
        ].sort((a, b) => b.date - a.date);

        // Insights Enhancements
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        const months = [
            { month: currentMonth - 2, year: currentMonth - 2 < 0 ? currentYear - 1 : currentYear },
            { month: currentMonth - 1, year: currentMonth - 1 < 0 ? currentYear - 1 : currentYear },
            { month: currentMonth, year: currentYear }
        ];

        // Per-category breakdown for current month
        const perCategoryData = await Expense.aggregate([
            {
                $match: {
                    userId: userObjectId,
                    date: {
                        $gte: new Date(currentYear, currentMonth, 1),
                        $lt: new Date(currentYear, currentMonth + 1, 1)
                    }
                }
            },
            { $group: { _id: "$category", total: { $sum: "$amount" } } },
            { $sort: { total: -1 } }
        ]);

        // Last month total
        const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
        const lastMonthTotalData = await Expense.aggregate([
            {
                $match: {
                    userId: userObjectId,
                    date: {
                        $gte: new Date(lastMonthDate.getFullYear(), lastMonthDate.getMonth(), 1),
                        $lt: new Date(lastMonthDate.getFullYear(), lastMonthDate.getMonth() + 1, 1)
                    }
                }
            },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        const lastMonthTotal = lastMonthTotalData[0]?.total || 0;
        const thisMonthTotal = expenseLast30Days;

        // Top category
        const topCategoryObj = perCategoryData[0] || { _id: "None", total: 0 };

        // Change percentage
        const changePercent = lastMonthTotal ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 : null;

        // Largest expense and income
        const largestExpense = await Expense.findOne({ userId }).sort({ amount: -1 }).limit(1);
        const largestIncome = await Income.findOne({ userId }).sort({ amount: -1 }).limit(1);

        // Income per category
        const incomePerCategory = await Income.aggregate([
            { $match: { userId: userObjectId } },
            { $group: { _id: "$category", total: { $sum: "$amount" } } },
            { $sort: { total: -1 } }
        ]);

        // 3-month expense trend
        const trendData = [];
        for (const m of months) {
            const start = new Date(m.year, (m.month + 12) % 12, 1);
            const end = new Date(m.year, (m.month + 12) % 12 + 1, 1);
            const monthTotalData = await Expense.aggregate([
                { $match: { userId: userObjectId, date: { $gte: start, $lt: end } } },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]);
            trendData.push(monthTotalData[0]?.total || 0);
        }

        // Final Response
        res.json({
            totalBalance: (totalIncome[0]?.total || 0) - (totalExpense[0]?.total || 0),
            totalIncome: totalIncome[0]?.total || 0,
            totalExpenses: totalExpense[0]?.total || 0,
            last30DaysExpenses: {
                total: expenseLast30Days,
                transactions: last30DaysExpenseTransactions,
            },
            last60DaysIncome: {
                total: incomeLast60Days,
                transactions: last60DaysIncomeTransactions,
            },
            recentTransactions: lastTransactions,
            insights: {
                perCategory: perCategoryData.map(c => ({ category: c._id, total: c.total })),
                thisMonth: thisMonthTotal,
                lastMonth: lastMonthTotal,
                topCategory: topCategoryObj._id,
                topCategoryAmount: topCategoryObj.total,
                changePercent,
                summary: `In ${currentDate.toLocaleString("default", { month: "long" })}, your top spending was ${topCategoryObj._id} ($${topCategoryObj.total}).${lastMonthTotal ? "" : " No data last month."}`,
                largestExpense: largestExpense ? { amount: largestExpense.amount, category: largestExpense.category } : null,
                largestIncome: largestIncome ? { amount: largestIncome.amount, source: largestIncome.source || largestIncome.category || "Unknown" } : null,
                incomePerCategory: incomePerCategory.map(i => ({ category: i._id, total: i.total })),
                trend3Months: trendData
            }
        });

    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};
// Optional: Separate insights endpoint if needed