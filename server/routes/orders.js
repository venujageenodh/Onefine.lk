const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { requireAdminAuth, requirePermission } = require('../middleware/auth');
const { adjustStock } = require('./inventory');

// GET /api/orders
router.get('/', requireAdminAuth, requirePermission('orders.view'), async (req, res) => {
    try {
        const { status, paymentStatus, source, from, to, q, page = 1, limit = 30 } = req.query;
        const filter = {};
        if (status) filter.orderStatus = status;
        if (paymentStatus) filter.paymentStatus = paymentStatus;
        if (source) filter.source = source;
        if (from || to) {
            filter.createdAt = {};
            if (from) filter.createdAt.$gte = new Date(from);
            if (to) filter.createdAt.$lte = new Date(to);
        }
        if (q) filter.$or = [
            { 'customer.name': { $regex: q, $options: 'i' } },
            { 'customer.phone': { $regex: q, $options: 'i' } },
            { orderNumber: { $regex: q, $options: 'i' } },
        ];
        const total = await Order.countDocuments(filter);
        const orders = await Order.find(filter)
            .populate('assignedAdminId', 'name')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));
        res.json({ orders, total, page: Number(page), pages: Math.ceil(total / limit) });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/orders — create order (also called from website checkout)
router.post('/', async (req, res) => {
    try {
        const {
            orderType, source, customer, items, deliveryCharge = 0,
            paymentMethod, notes, adminId, codAllowed,
        } = req.body;

        if (!customer?.name) return res.status(400).json({ error: 'Customer name required' });
        if (!items?.length) return res.status(400).json({ error: 'Order must have at least one item' });

        const subtotal = items.reduce((s, i) => s + i.unitPrice * i.qty, 0);
        const total = subtotal + Number(deliveryCharge);

        const order = await Order.create({
            orderType: orderType || 'SINGLE',
            source: source || 'WEBSITE',
            customer,
            items,
            subtotal,
            deliveryCharge: Number(deliveryCharge),
            total,
            paymentMethod: paymentMethod || '',
            notes: notes || '',
            assignedAdminId: adminId || null,
            codAllowed: codAllowed !== false,
            timeline: [{ status: 'NEW', note: 'Order placed', at: new Date() }],
        });

        // Auto-deduct stock for each item
        for (const item of items) {
            if (item.productId) {
                try {
                    await adjustStock({
                        productId: item.productId,
                        type: 'OUT',
                        qty: item.qty,
                        reason: `Order ${order.orderNumber}`,
                        orderId: order._id,
                    });
                } catch (e) { /* non-fatal — log only */ console.warn('Stock deduct failed:', e.message); }
            }
        }

        res.status(201).json(order);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/orders/:id
router.get('/:id', requireAdminAuth, requirePermission('orders.view'), async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('assignedAdminId', 'name email')
            .populate('items.productId', 'name image');
        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.json(order);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/orders/:id/status — update order status + add timeline entry
router.put('/:id/status', requireAdminAuth, requirePermission('orders.edit'), async (req, res) => {
    try {
        const { status, note } = req.body;
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ error: 'Order not found' });

        order.orderStatus = status;
        order.timeline.push({
            status,
            note: note || '',
            adminId: req.admin._id || null,
            adminName: req.admin.name || 'Admin',
            at: new Date(),
        });
        await order.save();
        res.json(order);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/orders/:id — general update (assign admin, notes, etc.)
router.put('/:id', requireAdminAuth, requirePermission('orders.edit'), async (req, res) => {
    try {
        const { assignedAdminId, adminNotes, paymentStatus, paymentMethod, deliveryCharge } = req.body;
        const update = {};
        if (assignedAdminId !== undefined) update.assignedAdminId = assignedAdminId;
        if (adminNotes !== undefined) update.adminNotes = adminNotes;
        if (paymentStatus !== undefined) update.paymentStatus = paymentStatus;
        if (paymentMethod !== undefined) update.paymentMethod = paymentMethod;
        if (deliveryCharge !== undefined) update.deliveryCharge = Number(deliveryCharge);

        const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true });
        if (!order) return res.status(404).json({ error: 'Not found' });
        res.json(order);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/orders/:id (cancel)
router.delete('/:id', requireAdminAuth, requirePermission('orders.edit'), async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(req.params.id,
            { orderStatus: 'CANCELLED', $push: { timeline: { status: 'CANCELLED', note: 'Cancelled by admin', at: new Date() } } },
            { new: true }
        );
        res.json(order);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// PayHere notify_url callback (no auth — called by PayHere server)
router.post('/payhere-notify', async (req, res) => {
    try {
        const { order_id, status_code, payment_id, status_message } = req.body;
        if (status_code === '2') { // 2 = SUCCESS
            await Order.findOneAndUpdate(
                { payhereOrderId: order_id },
                { paymentStatus: 'PAID', paymentMethod: 'PAYHERE', 'timeline.$[].note': status_message }
            );
        }
        res.sendStatus(200);
    } catch (err) { res.sendStatus(200); } // Always 200 to PayHere
});

module.exports = router;
