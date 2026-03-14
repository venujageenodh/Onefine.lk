const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const { requireAdminAuth, requirePermission } = require('../middleware/auth');

// GET /api/payments — fetch all payments for the receipts table
router.get('/', requireAdminAuth, requirePermission('invoices.view'), async (req, res) => {
    try {
        const { method, q, page = 1, limit = 30 } = req.query;
        const filter = {};
        if (method) filter.method = method;
        if (q) filter.$or = [
            { reference: { $regex: q, $options: 'i' } },
            { notes: { $regex: q, $options: 'i' } },
        ];
        
        const total = await Payment.countDocuments(filter);
        const payments = await Payment.find(filter)
            .sort({ date: -1, createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .populate('invoiceId', 'invoiceNumber customer')
            .populate('orderId', 'orderNumber customer customerName');

        res.json({ payments, total });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
