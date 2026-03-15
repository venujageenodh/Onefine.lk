const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { requireAdminAuth, requirePermission } = require('../middleware/auth');
const { adjustStock } = require('./inventory');
const { logAction } = require('../utils/logger');
const { deductStockForOrder, generateInvoiceForOrder } = require('../services/orderService');
const { syncCustomerFromOrder } = require('../services/customerService');

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

        // Auto-deduct stock, generate invoice and sync customer
        await deductStockForOrder(order);
        await generateInvoiceForOrder(order, req.admin);
        await syncCustomerFromOrder(order);

        await logAction({
            action: 'CREATE_ORDER',
            admin: req.admin,
            resourceType: 'Order',
            resourceId: order._id,
            details: `Order ${order.orderNumber} created via ${order.source}`
        });

        res.status(201).json(order);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

/**
 * NEW: POST /api/biz/orders/admin — Create order directly from Admin Panel
 */
router.post('/admin', requireAdminAuth, requirePermission('orders.edit'), async (req, res) => {
    try {
        const { customer, items, deliveryCharge = 0, notes, paymentMethod, orderStatus = 'CONFIRMED' } = req.body;
        
        if (!customer?.name) return res.status(400).json({ error: 'Customer details required' });
        if (!items?.length) return res.status(400).json({ error: 'At least one item required' });

        const subtotal = items.reduce((s, i) => s + (Number(i.unitPrice) * Number(i.qty)), 0);
        const total = subtotal + Number(deliveryCharge);

        const order = await Order.create({
            source: 'ADMIN',
            orderType: 'BULK',
            customer,
            items: items.map(i => ({
                productId: i.productId || null,
                name: i.name,
                qty: i.qty,
                unitPrice: i.unitPrice
            })),
            subtotal,
            deliveryCharge: Number(deliveryCharge),
            total,
            notes,
            orderStatus,
            paymentStatus: 'UNPAID',
            paymentMethod: paymentMethod || 'CASH',
            assignedAdminId: req.admin._id,
            timeline: [{ 
                status: orderStatus, 
                note: 'Direct order created via Admin Panel', 
                adminId: req.admin._id,
                adminName: req.admin.name,
                at: new Date() 
            }]
        });

        // Trigger business workflows
        await deductStockForOrder(order);
        await generateInvoiceForOrder(order, req.admin);
        await syncCustomerFromOrder(order);

        await logAction({
            action: 'ADMIN_CREATE_ORDER',
            admin: req.admin,
            resourceType: 'Order',
            resourceId: order._id,
            details: `Admin ${req.admin.name} created direct order ${order.orderNumber}`
        });

        res.status(201).json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
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

        await logAction({
            action: 'UPDATE_ORDER_STATUS',
            admin: req.admin,
            resourceType: 'Order',
            resourceId: order._id,
            details: `Status changed to ${status}`,
            metadata: { note }
        });

        res.json(order);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/orders/:id — general update (assign admin, notes, customer, items, etc.)
router.put('/:id', requireAdminAuth, requirePermission('orders.edit'), async (req, res) => {
    try {
        const { 
            assignedAdminId, adminNotes, paymentStatus, paymentMethod, 
            deliveryCharge, customer, items, notes, orderStatus 
        } = req.body;
        
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ error: 'Order not found' });

        if (assignedAdminId !== undefined) order.assignedAdminId = assignedAdminId;
        if (adminNotes !== undefined) order.adminNotes = adminNotes;
        if (notes !== undefined) order.notes = notes;
        if (paymentStatus !== undefined) order.paymentStatus = paymentStatus;
        if (paymentMethod !== undefined) order.paymentMethod = paymentMethod;
        if (orderStatus !== undefined) order.orderStatus = orderStatus;
        
        if (customer) {
            order.customer = { ...order.customer, ...customer };
        }

        if (items) {
            order.items = items;
            const subtotal = items.reduce((s, i) => s + (Number(i.unitPrice) * Number(i.qty)), 0);
            order.subtotal = subtotal;
            order.total = subtotal + (deliveryCharge !== undefined ? Number(deliveryCharge) : order.deliveryCharge);
        }

        if (deliveryCharge !== undefined) {
            order.deliveryCharge = Number(deliveryCharge);
            order.total = order.subtotal + order.deliveryCharge;
        }

        await order.save();

        await logAction({
            action: 'UPDATE_ORDER',
            admin: req.admin,
            resourceType: 'Order',
            resourceId: order._id,
            details: `Order ${order.orderNumber} details updated by ${req.admin.name}`
        });

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
