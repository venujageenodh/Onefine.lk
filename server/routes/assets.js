const express = require('express');
const router = express.Router();
const Asset = require('../models/Asset');
const Transaction = require('../models/Transaction');
const { updateAccountBalance } = require('./transactions');
const { requireAdminAuth, requirePermission } = require('../middleware/auth');

// GET /api/assets
router.get('/', requireAdminAuth, requirePermission('finance.view'), async (req, res) => {
    try {
        const assets = await Asset.find({ isActive: true }).sort({ createdAt: -1 });
        const totalValue = assets.reduce((s, a) => s + a.value, 0);
        res.json({ assets, totalValue });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/assets
router.post('/', requireAdminAuth, requirePermission('finance.edit'), async (req, res) => {
    try {
        const { name, type, value, purchaseDate, description } = req.body;
        const asset = new Asset({
            name, type, value: Number(value),
            purchaseDate: purchaseDate || new Date(),
            description,
            addedBy: { adminId: req.admin._id, adminName: req.admin.name },
        });
        await asset.save();
        
        // Optionally record expense for purchase
        if (req.body.recordExpense && asset.value > 0) {
            try {
                const tx = new Transaction({
                    type: 'expense',
                    category: 'asset',
                    amount: asset.value,
                    paymentMethod: 'cash',
                    accountType: 'cash',
                    date: asset.purchaseDate || new Date(),
                    note: `Asset Purchase: ${asset.name}`,
                    sourceType: 'asset',
                    sourceId: asset._id,
                    recordedBy: { adminId: req.admin._id, adminName: req.admin.name },
                });
                await tx.save();
                await updateAccountBalance('cash', asset.value, 'expense');
            } catch (txErr) {
                console.error('⚠️ Failed to record asset purchase expense:', txErr.message);
            }
        }

        res.status(201).json(asset);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/assets/:id
router.put('/:id', requireAdminAuth, requirePermission('finance.edit'), async (req, res) => {
    try {
        const { name, type, value, purchaseDate, description } = req.body;
        const asset = await Asset.findByIdAndUpdate(
            req.params.id,
            { name, type, value: Number(value), purchaseDate, description },
            { new: true }
        );
        if (!asset) return res.status(404).json({ error: 'Asset not found' });
        res.json(asset);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/assets/:id (soft delete)
router.delete('/:id', requireAdminAuth, requirePermission('finance.delete'), async (req, res) => {
    try {
        await Asset.findByIdAndUpdate(req.params.id, { isActive: false });
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
