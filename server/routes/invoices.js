const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const { requireAdminAuth, requirePermission } = require('../middleware/auth');

// GET /api/invoices
router.get('/', requireAdminAuth, requirePermission('invoices.view'), async (req, res) => {
    try {
        const { paymentStatus, q, page = 1, limit = 30 } = req.query;
        const filter = {};
        if (paymentStatus) filter.paymentStatus = paymentStatus;
        if (q) filter.$or = [
            { 'customer.name': { $regex: q, $options: 'i' } },
            { invoiceNumber: { $regex: q, $options: 'i' } },
        ];
        const total = await Invoice.countDocuments(filter);
        const invoices = await Invoice.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));
        res.json({ invoices, total });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/invoices — create standalone invoice
router.post('/', requireAdminAuth, requirePermission('invoices.view'), async (req, res) => {
    try {
        const { customer, items, discountAmount = 0, deliveryCharge = 0, tax = 0, notes, dueDate, orderId } = req.body;
        const subtotal = items.reduce((s, i) => {
            const l = i.unitPrice * i.qty;
            return s + l - l * (i.discount || 0) / 100;
        }, 0);
        const taxAmount = (subtotal - discountAmount) * tax / 100;
        const total = subtotal - Number(discountAmount) + taxAmount + Number(deliveryCharge);

        const invoice = await Invoice.create({
            customer, items, subtotal,
            discountAmount: Number(discountAmount),
            deliveryCharge: Number(deliveryCharge),
            tax: Number(tax), taxAmount, total,
            notes, dueDate, orderId,
            createdBy: req.admin._id,
        });
        res.status(201).json(invoice);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/invoices/:id
router.get('/:id', requireAdminAuth, requirePermission('invoices.view'), async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);
        if (!invoice) return res.status(404).json({ error: 'Not found' });
        const payments = await Payment.find({ invoiceId: req.params.id }).sort({ date: -1 });
        res.json({ invoice, payments });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/invoices/:id/payment — record a payment against invoice
router.post('/:id/payment', requireAdminAuth, requirePermission('payments.create'), async (req, res) => {
    try {
        const { amount, method, reference, slipUrl, notes, date } = req.body;
        const invoice = await Invoice.findById(req.params.id);
        if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

        const payment = await Payment.create({
            invoiceId: invoice._id,
            amount: Number(amount),
            method, reference, slipUrl,
            notes, date: date || new Date(),
            adminId: req.admin._id,
        });

        // Update invoice amountPaid
        const allPayments = await Payment.find({ invoiceId: invoice._id });
        invoice.amountPaid = allPayments.reduce((s, p) => s + p.amount, 0);
        await invoice.save(); // pre-save hook updates paymentStatus and balanceDue

        res.status(201).json({ payment, invoice });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
