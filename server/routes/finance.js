const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const Asset = require('../models/Asset');
const Liability = require('../models/Liability');
const Order = require('../models/Order');
const Expense = require('../models/Expense');
const Inventory = require('../models/Inventory');
const { requireAdminAuth, requirePermission } = require('../middleware/auth');

// Build date filter from query
function buildDateFilter(from, to, field = 'date') {
    const filter = {};
    if (from || to) {
        filter[field] = {};
        if (from) filter[field].$gte = new Date(from);
        if (to) { const end = new Date(to); end.setHours(23, 59, 59, 999); filter[field].$lte = end; }
    }
    return filter;
}

// GET /api/finance/dashboard  — full financial overview
router.get('/dashboard', requireAdminAuth, requirePermission('finance.view'), async (req, res) => {
    try {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const yearStart = new Date(now.getFullYear(), 0, 1);

        const [
            allTimeAgg,
            thisMonthAgg,
            accounts,
            assets,
            liabilities,
            monthlyIncome,
            monthlyExpense,
            recentTransactions,
            lowStockItems,
        ] = await Promise.all([
            // All-time totals
            Transaction.aggregate([
                { $group: { _id: '$type', total: { $sum: '$amount' } } }
            ]),
            // Month totals
            Transaction.aggregate([
                { $match: { date: { $gte: monthStart } } },
                { $group: { _id: '$type', total: { $sum: '$amount' } } }
            ]),
            Account.find({ isActive: true }),
            Asset.find({ isActive: true }),
            Liability.find({ isSettled: false }),
            // Monthly trend - last 6 months
            Transaction.aggregate([
                { $match: { date: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) }, type: 'income' } },
                { $group: { _id: { year: { $year: '$date' }, month: { $month: '$date' } }, total: { $sum: '$amount' } } },
                { $sort: { '_id.year': 1, '_id.month': 1 } }
            ]),
            Transaction.aggregate([
                { $match: { date: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) }, type: 'expense' } },
                { $group: { _id: { year: { $year: '$date' }, month: { $month: '$date' } }, total: { $sum: '$amount' } } },
                { $sort: { '_id.year': 1, '_id.month': 1 } }
            ]),
            Transaction.find().sort({ date: -1, createdAt: -1 }).limit(10),
            // Low stock
            Inventory.find().populate('productId').lean().then(invs => invs.filter(i => i.stockQty <= i.minStockQty && i.productId).slice(0, 5)),
        ]);

        // Parse all-time income/expense
        const totals = {};
        allTimeAgg.forEach(r => { totals[r._id] = r.total; });

        // Parse monthly
        const monthTotals = {};
        thisMonthAgg.forEach(r => { monthTotals[r._id] = r.total; });

        const totalIncome = totals.income || 0;
        const totalExpense = totals.expense || 0;
        const monthlyIncomeTotal = monthTotals.income || 0;
        const monthlyExpenseTotal = monthTotals.expense || 0;

        const totalAssets = assets.reduce((s, a) => s + a.value, 0);
        const totalLiabilities = liabilities.reduce((s, l) => s + l.outstandingBalance, 0);
        const cashBalance = accounts.reduce((s, a) => s + a.balance, 0);

        res.json({
            allTime: {
                totalIncome, totalExpense,
                profit: totalIncome - totalExpense,
                netProfit: (totalIncome - totalExpense) - totalLiabilities,
            },
            thisMonth: {
                income: monthlyIncomeTotal,
                expense: monthlyExpenseTotal,
                profit: monthlyIncomeTotal - monthlyExpenseTotal,
            },
            cashBalance,
            totalAssets,
            totalLiabilities,
            accounts,
            monthlyIncomeTrend: monthlyIncome,
            monthlyExpenseTrend: monthlyExpense,
            recentTransactions,
            lowStockItems,
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/finance/profit-loss  — P&L for a date range
router.get('/profit-loss', requireAdminAuth, requirePermission('finance.view'), async (req, res) => {
    try {
        const { from, to } = req.query;
        const dateFilter = buildDateFilter(from, to);

        const [incomeAgg, expenseAgg, byCategory, liabilities, assets] = await Promise.all([
            Transaction.aggregate([
                { $match: { ...dateFilter, type: 'income' } },
                { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
            ]),
            Transaction.aggregate([
                { $match: { ...dateFilter, type: 'expense' } },
                { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
            ]),
            Transaction.aggregate([
                { $match: dateFilter },
                { $group: { _id: { type: '$type', paymentMethod: '$paymentMethod' }, total: { $sum: '$amount' } } }
            ]),
            Liability.find({ isSettled: false }),
            Asset.find({ isActive: true }),
        ]);

        const totalIncome = incomeAgg.reduce((s, r) => s + r.total, 0);
        const totalExpense = expenseAgg.reduce((s, r) => s + r.total, 0);
        const grossProfit = totalIncome - totalExpense;
        const totalLiabilities = liabilities.reduce((s, l) => s + l.outstandingBalance, 0);
        const totalAssets = assets.reduce((s, a) => s + a.value, 0);
        const netProfit = grossProfit - totalLiabilities;

        res.json({
            totalIncome, totalExpense, grossProfit, netProfit,
            isProfit: grossProfit >= 0,
            incomeByCategory: incomeAgg,
            expenseByCategory: expenseAgg,
            byPaymentMethod: byCategory,
            totalLiabilities, totalAssets,
            period: { from, to },
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/finance/report  — generate a detailed period report
router.get('/report', requireAdminAuth, requirePermission('finance.view'), async (req, res) => {
    try {
        const { from, to, period } = req.query;
        
        let fromDate = from ? new Date(from) : new Date();
        let toDate = to ? new Date(to) : new Date();
        
        if (period === 'daily') {
            fromDate = new Date(); fromDate.setHours(0, 0, 0, 0);
            toDate = new Date(); toDate.setHours(23, 59, 59, 999);
        } else if (period === 'weekly') {
            fromDate = new Date(); fromDate.setDate(fromDate.getDate() - 7); fromDate.setHours(0, 0, 0, 0);
            toDate = new Date(); toDate.setHours(23, 59, 59, 999);
        } else if (period === 'monthly') {
            fromDate = new Date(fromDate.getFullYear(), fromDate.getMonth(), 1);
            toDate = new Date(fromDate.getFullYear(), fromDate.getMonth() + 1, 0, 23, 59, 59, 999);
        }

        const filter = { date: { $gte: fromDate, $lte: toDate } };

        const [transactions, accounts, assets, liabilities] = await Promise.all([
            Transaction.find(filter).sort({ date: -1 }),
            Account.find({ isActive: true }),
            Asset.find({ isActive: true }),
            Liability.find({ isSettled: false }),
        ]);

        const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        const grossProfit = totalIncome - totalExpense;
        const totalLiabilities = liabilities.reduce((s, l) => s + l.outstandingBalance, 0);
        const totalAssets = assets.reduce((s, a) => s + a.value, 0);
        const cashBalance = accounts.reduce((s, a) => s + a.balance, 0);

        res.json({
            period: { from: fromDate, to: toDate, label: period || 'custom' },
            summary: {
                totalIncome, totalExpense, grossProfit,
                netProfit: grossProfit - totalLiabilities,
                cashBalance, totalAssets, totalLiabilities,
                isProfit: grossProfit >= 0,
            },
            transactions,
            accounts,
            assets,
            liabilities,
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
