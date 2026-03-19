const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const { requireAdminAuth, requirePermission } = require('../middleware/auth');

// Helper: update account balance after a transaction
async function updateAccountBalance(accountType, amount, type) {
    // income → add to account, expense → deduct from account
    const delta = type === 'income' ? amount : -amount;
    await Account.findOneAndUpdate(
        { type: accountType },
        { $inc: { balance: delta } },
        { upsert: true }
    );
}

// GET /api/transactions  (with optional date range, type, category filters)
router.get('/', requireAdminAuth, requirePermission('finance.view'), async (req, res) => {
    try {
        const { type, category, from, to, paymentMethod, page = 1, limit = 50 } = req.query;
        const filter = {};
        if (type) filter.type = type;
        if (category) filter.category = category;
        if (paymentMethod) filter.paymentMethod = paymentMethod;
        if (from || to) {
            filter.date = {};
            if (from) filter.date.$gte = new Date(from);
            if (to) { const end = new Date(to); end.setHours(23, 59, 59, 999); filter.date.$lte = end; }
        }
        const total = await Transaction.countDocuments(filter);
        const transactions = await Transaction.find(filter)
            .sort({ date: -1, createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));
        res.json({ transactions, total, page: Number(page), pages: Math.ceil(total / limit) });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/transactions/summary  — total income, total expense, profit/loss for a period
router.get('/summary', requireAdminAuth, requirePermission('finance.view'), async (req, res) => {
    try {
        const { from, to } = req.query;
        const filter = {};
        if (from || to) {
            filter.date = {};
            if (from) filter.date.$gte = new Date(from);
            if (to) { const end = new Date(to); end.setHours(23, 59, 59, 999); filter.date.$lte = end; }
        }

        const [incomeAgg, expenseAgg, byCategoryAgg] = await Promise.all([
            Transaction.aggregate([
                { $match: { ...filter, type: 'income' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            Transaction.aggregate([
                { $match: { ...filter, type: 'expense' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            Transaction.aggregate([
                { $match: filter },
                { $group: { _id: { type: '$type', category: '$category' }, total: { $sum: '$amount' } } }
            ]),
        ]);

        const totalIncome = incomeAgg[0]?.total || 0;
        const totalExpense = expenseAgg[0]?.total || 0;
        const profit = totalIncome - totalExpense;

        const byCategory = {};
        byCategoryAgg.forEach(r => {
            if (!byCategory[r._id.type]) byCategory[r._id.type] = {};
            byCategory[r._id.type][r._id.category] = r.total;
        });

        res.json({ totalIncome, totalExpense, profit, isProfit: profit >= 0, byCategory });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/transactions  — manually record a transaction
router.post('/', requireAdminAuth, requirePermission('finance.create'), async (req, res) => {
    try {
        const { type, category, amount, paymentMethod, accountType, date, note } = req.body;

        const tx = new Transaction({
            type, category, amount: Number(amount),
            paymentMethod: paymentMethod || 'cash',
            accountType: accountType || paymentMethod || 'cash',
            date: date || new Date(),
            note: note || '',
            sourceType: 'manual',
            recordedBy: { adminId: req.admin._id, adminName: req.admin.name },
        });
        await tx.save();

        // Update account balance
        await updateAccountBalance(tx.accountType, tx.amount, tx.type);

        res.status(201).json(tx);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/transactions/:id
router.put('/:id', requireAdminAuth, requirePermission('finance.edit'), async (req, res) => {
    try {
        const old = await Transaction.findById(req.params.id);
        if (!old) return res.status(404).json({ error: 'Not found' });

        // Reverse old balance effect
        await updateAccountBalance(old.accountType, old.amount, old.type === 'income' ? 'expense' : 'income');

        const { type, category, amount, paymentMethod, accountType, date, note } = req.body;
        old.type = type || old.type;
        old.category = category || old.category;
        old.amount = amount !== undefined ? Number(amount) : old.amount;
        old.paymentMethod = paymentMethod || old.paymentMethod;
        old.accountType = accountType || old.accountType;
        old.date = date || old.date;
        old.note = note !== undefined ? note : old.note;
        await old.save();

        // Apply new balance effect
        await updateAccountBalance(old.accountType, old.amount, old.type);

        res.json(old);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/transactions/:id
router.delete('/:id', requireAdminAuth, requirePermission('finance.delete'), async (req, res) => {
    try {
        const tx = await Transaction.findById(req.params.id);
        if (!tx) return res.status(404).json({ error: 'Not found' });

        // Reverse balance effect
        await updateAccountBalance(tx.accountType, tx.amount, tx.type === 'income' ? 'expense' : 'income');

        await tx.deleteOne();
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
module.exports.updateAccountBalance = updateAccountBalance;
