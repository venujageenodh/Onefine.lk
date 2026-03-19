const express = require('express');
const router = express.Router();
const Liability = require('../models/Liability');
const Transaction = require('../models/Transaction');
const { updateAccountBalance } = require('./transactions');
const { requireAdminAuth, requirePermission } = require('../middleware/auth');

// GET /api/liabilities
router.get('/', requireAdminAuth, requirePermission('finance.view'), async (req, res) => {
    try {
        const liabilities = await Liability.find().sort({ createdAt: -1 });
        const totalOutstanding = liabilities.filter(l => !l.isSettled).reduce((s, l) => s + l.outstandingBalance, 0);
        const totalOriginal = liabilities.reduce((s, l) => s + l.originalAmount, 0);
        res.json({ liabilities, totalOutstanding, totalOriginal });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/liabilities
router.post('/', requireAdminAuth, requirePermission('finance.edit'), async (req, res) => {
    try {
        const { name, type, originalAmount, dueDate, creditor, description } = req.body;
        const amt = Number(originalAmount);
        const liability = new Liability({
            name, type, originalAmount: amt, outstandingBalance: amt,
            dueDate: dueDate || null, creditor, description,
            addedBy: { adminId: req.admin._id, adminName: req.admin.name },
        });
        await liability.save();
        res.status(201).json(liability);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/liabilities/:id/repay  — record a repayment
router.post('/:id/repay', requireAdminAuth, requirePermission('finance.edit'), async (req, res) => {
    try {
        const { amount, note } = req.body;
        const payAmt = Number(amount);
        const liability = await Liability.findById(req.params.id);
        if (!liability) return res.status(404).json({ error: 'Not found' });
        if (liability.isSettled) return res.status(400).json({ error: 'Already settled' });

        liability.outstandingBalance = Math.max(0, liability.outstandingBalance - payAmt);
        liability.repayments.push({ amount: payAmt, date: new Date(), note: note || '' });
        if (liability.outstandingBalance === 0) liability.isSettled = true;
        await liability.save();

        // Record repayment as a transaction (expense)
        try {
            const tx = new Transaction({
                type: 'expense',
                category: 'liability',
                amount: payAmt,
                paymentMethod: 'cash', // Default to cash, can be extended later
                accountType: 'cash',
                date: new Date(),
                note: `Repayment for liability: ${liability.name}${note ? ' - ' + note : ''}`,
                sourceType: 'liability',
                sourceId: liability._id,
                recordedBy: { adminId: req.admin._id, adminName: req.admin.name },
            });
            await tx.save();
            await updateAccountBalance('cash', payAmt, 'expense');
        } catch (txErr) {
            console.error('⚠️ Failed to record liability repayment transaction:', txErr.message);
        }

        res.json(liability);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/liabilities/:id
router.put('/:id', requireAdminAuth, requirePermission('finance.edit'), async (req, res) => {
    try {
        const { name, type, outstandingBalance, dueDate, creditor, description, isSettled } = req.body;
        const liability = await Liability.findByIdAndUpdate(
            req.params.id,
            { name, type, outstandingBalance, dueDate, creditor, description, isSettled },
            { new: true }
        );
        if (!liability) return res.status(404).json({ error: 'Not found' });
        res.json(liability);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/liabilities/:id
router.delete('/:id', requireAdminAuth, requirePermission('finance.delete'), async (req, res) => {
    try {
        await Liability.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
