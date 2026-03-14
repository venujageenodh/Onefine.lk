const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const { requireAdminAuth, requirePermission } = require('../middleware/auth');

// GET /api/expenses
router.get('/', requireAdminAuth, requirePermission('expenses.view'), async (req, res) => {
    try {
        const expenses = await Expense.find().sort({ date: -1, createdAt: -1 });
        res.json(expenses);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/expenses/summary
router.get('/summary', requireAdminAuth, requirePermission('expenses.view'), async (req, res) => {
    try {
        const expenses = await Expense.find();
        let total = 0;
        const byCategory = {};

        expenses.forEach(exp => {
            total += exp.amount;
            if (!byCategory[exp.category]) byCategory[exp.category] = 0;
            byCategory[exp.category] += exp.amount;
        });

        res.json({ total, byCategory });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/expenses
router.post('/', requireAdminAuth, requirePermission('expenses.create'), async (req, res) => {
    try {
        const { title, description, amount, category, date, receiptImage } = req.body;
        
        const expense = new Expense({
             title, description, amount, category, date, receiptImage,
             addedBy: {
                 adminId: req.admin.id,
                 adminName: req.admin.name
             }
        });
        
        await expense.save();
        res.status(201).json(expense);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/expenses/:id
router.put('/:id', requireAdminAuth, requirePermission('expenses.edit'), async (req, res) => {
    try {
        const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!expense) return res.status(404).json({ error: 'Not found' });
        res.json(expense);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/expenses/:id
router.delete('/:id', requireAdminAuth, requirePermission('expenses.delete'), async (req, res) => {
    try {
        await Expense.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
