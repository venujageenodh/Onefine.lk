const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const Quotation = require('../models/Quotation');
const { requireAdminAuth, requirePermission } = require('../middleware/auth');

// GET /api/customers
router.get('/', requireAdminAuth, requirePermission('customers.view'), async (req, res) => {
    try {
        const { q, page = 1, limit = 20 } = req.query;
        const filter = {};
        if (q) {
            filter.$or = [
                { name: { $regex: q, $options: 'i' } },
                { email: { $regex: q, $options: 'i' } },
                { phone: { $regex: q, $options: 'i' } },
                { company: { $regex: q, $options: 'i' } },
            ];
        }
        
        const total = await Customer.countDocuments(filter);
        const customers = await Customer.find(filter)
            .sort({ totalSpend: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));
            
        res.json({ customers, total, page: Number(page), pages: Math.ceil(total / limit) });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/customers/:id
router.get('/:id', requireAdminAuth, requirePermission('customers.view'), async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) return res.status(404).json({ error: 'Customer not found' });
        
        // Fetch history
        const [orders, quotations] = await Promise.all([
            Order.find({ $or: [{ 'customer.email': customer.email }, { 'customer.phone': customer.phone }] }).sort({ createdAt: -1 }),
            Quotation.find({ $or: [{ 'customer.email': customer.email }, { 'customer.phone': customer.phone }] }).sort({ createdAt: -1 }),
        ]);
        
        res.json({ customer, orders, quotations });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/customers/:id
router.put('/:id', requireAdminAuth, requirePermission('customers.edit'), async (req, res) => {
    try {
        const { notes, tags } = req.body;
        const customer = await Customer.findByIdAndUpdate(req.params.id, { notes, tags }, { new: true });
        res.json(customer);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
