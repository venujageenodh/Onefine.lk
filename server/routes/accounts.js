const express = require('express');
const router = express.Router();
const Account = require('../models/Account');
const { requireAdminAuth, requirePermission } = require('../middleware/auth');

// Seed default accounts if they don't exist
async function seedAccounts() {
    const count = await Account.countDocuments();
    if (count === 0) {
        await Account.insertMany([
            { name: 'Cash', type: 'cash', balance: 0, description: 'Physical cash on hand' },
            { name: 'Bank', type: 'bank', balance: 0, description: 'Primary business bank account' },
        ]);
    }
}
seedAccounts().catch(console.error);

// GET /api/accounts
router.get('/', requireAdminAuth, requirePermission('finance.view'), async (req, res) => {
    try {
        const accounts = await Account.find({ isActive: true });
        const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
        res.json({ accounts, totalBalance });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/accounts  — create new account
router.post('/', requireAdminAuth, requirePermission('finance.edit'), async (req, res) => {
    try {
        const { name, type, balance, description } = req.body;
        const account = await Account.create({ name, type, balance: Number(balance) || 0, description });
        res.status(201).json(account);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/accounts/:id  — update balance or info
router.put('/:id', requireAdminAuth, requirePermission('finance.edit'), async (req, res) => {
    try {
        const { name, balance, description } = req.body;
        const account = await Account.findByIdAndUpdate(
            req.params.id,
            { ...(name && { name }), ...(balance !== undefined && { balance: Number(balance) }), ...(description !== undefined && { description }) },
            { new: true }
        );
        if (!account) return res.status(404).json({ error: 'Account not found' });
        res.json(account);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/accounts/adjust  — manually adjust balance (top-up / correction)
router.post('/adjust', requireAdminAuth, requirePermission('finance.edit'), async (req, res) => {
    try {
        const { accountId, adjustment, note } = req.body;
        const account = await Account.findByIdAndUpdate(
            accountId,
            { $inc: { balance: Number(adjustment) } },
            { new: true }
        );
        if (!account) return res.status(404).json({ error: 'Account not found' });
        res.json(account);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
