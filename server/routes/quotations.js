const express = require('express');
const router = express.Router();
const Quotation = require('../models/Quotation');
const Invoice = require('../models/Invoice');
const { requireAdminAuth, requirePermission } = require('../middleware/auth');

function calcTotals(items, discountAmount = 0, deliveryCharge = 0, taxPct = 0) {
    const subtotal = items.reduce((s, i) => {
        const lineTotal = i.unitPrice * i.qty;
        const lineDiscount = lineTotal * (i.discount || 0) / 100;
        return s + lineTotal - lineDiscount;
    }, 0);
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = afterDiscount * taxPct / 100;
    const total = afterDiscount + taxAmount + Number(deliveryCharge);
    return { subtotal, taxAmount, total };
}

// GET /api/quotations
router.get('/', requireAdminAuth, requirePermission('quotations.view'), async (req, res) => {
    try {
        const { status, q, page = 1, limit = 30 } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (q) filter.$or = [
            { 'customer.name': { $regex: q, $options: 'i' } },
            { qNumber: { $regex: q, $options: 'i' } },
        ];
        const total = await Quotation.countDocuments(filter);
        const quotations = await Quotation.find(filter)
            .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));
        res.json({ quotations, total });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/quotations
router.post('/', requireAdminAuth, requirePermission('quotations.create'), async (req, res) => {
    try {
        const { customer, items, discountAmount = 0, deliveryCharge = 0, tax = 0, notes, validUntil } = req.body;
        const { subtotal, taxAmount, total } = calcTotals(items, discountAmount, deliveryCharge, tax);
        const quotation = await Quotation.create({
            customer, items,
            subtotal, discountAmount: Number(discountAmount),
            deliveryCharge: Number(deliveryCharge),
            tax: Number(tax), taxAmount, total,
            notes, validUntil: validUntil || undefined,
            createdBy: req.admin._id || null,
        });
        res.status(201).json(quotation);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/quotations/:id
router.get('/:id', requireAdminAuth, requirePermission('quotations.view'), async (req, res) => {
    try {
        const q = await Quotation.findById(req.params.id);
        if (!q) return res.status(404).json({ error: 'Not found' });
        res.json(q);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/quotations/:id
router.put('/:id', requireAdminAuth, requirePermission('quotations.edit'), async (req, res) => {
    try {
        const { customer, items, discountAmount = 0, deliveryCharge = 0, tax = 0, notes, validUntil, status } = req.body;
        const updates = { customer, items, discountAmount, deliveryCharge, tax, notes, validUntil: validUntil || undefined, status };
        if (items) {
            const c = calcTotals(items, discountAmount, deliveryCharge, tax);
            Object.assign(updates, c);
        }
        const q = await Quotation.findByIdAndUpdate(req.params.id, updates, { new: true });
        res.json(q);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/quotations/:id/convert-to-order — convert quotation to order
router.post('/:id/convert-to-order', requireAdminAuth, requirePermission('orders.create'), async (req, res) => {
    try {
        const quotation = await Quotation.findById(req.params.id);
        if (!quotation) return res.status(404).json({ error: 'Quotation not found' });
        if (quotation.status === 'CONVERTED') return res.status(400).json({ error: 'Already converted' });

        const Order = require('../models/Order');
        const order = await Order.create({
            quotationId: quotation._id,
            source: 'ADMIN',
            orderType: 'BULK', // Assuming quotations are usually bulk
            customer: quotation.customer,
            items: quotation.items.map(item => ({
                productId: item.productId,
                name: item.name,
                qty: item.qty,
                unitPrice: item.unitPrice,
                customization: item.description || ''
            })),
            subtotal: quotation.subtotal,
            deliveryCharge: quotation.deliveryCharge,
            total: quotation.total,
            notes: quotation.notes,
            timeline: [{ status: 'NEW', note: `Converted from Quotation ${quotation.qNumber}`, at: new Date() }],
        });

        quotation.status = 'CONVERTED';
        quotation.convertedToInvoiceId = order._id; // Reusing field for simplicity or should add convertedToOrderId
        await quotation.save();

        res.status(201).json({ order, quotation });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/quotations/:id/convert — convert quotation to invoice (Legacy, keeping for now)
    try {
        const quotation = await Quotation.findById(req.params.id);
        if (!quotation) return res.status(404).json({ error: 'Quotation not found' });
        if (quotation.status === 'CONVERTED') return res.status(400).json({ error: 'Already converted' });

        const invoice = await Invoice.create({
            quotationId: quotation._id,
            customer: quotation.customer,
            items: quotation.items,
            subtotal: quotation.subtotal,
            discountAmount: quotation.discountAmount,
            deliveryCharge: quotation.deliveryCharge,
            tax: quotation.tax,
            taxAmount: quotation.taxAmount,
            total: quotation.total,
            dueDate: req.body.dueDate,
            notes: quotation.notes,
            createdBy: req.admin._id || null,
        });

        quotation.status = 'CONVERTED';
        quotation.convertedToInvoiceId = invoice._id;
        await quotation.save();

        res.status(201).json({ invoice, quotation });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
