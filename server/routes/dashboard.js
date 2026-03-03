const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Invoice = require('../models/Invoice');
const Inventory = require('../models/Inventory');
const { requireAdminAuth } = require('../middleware/auth');

function startOfDay(d) { d.setHours(0, 0, 0, 0); return d; }
function startOfWeek(d) { const day = d.getDay(); d.setDate(d.getDate() - day); d.setHours(0, 0, 0, 0); return d; }

// GET /api/dashboard/stats
router.get('/stats', requireAdminAuth, async (req, res) => {
    try {
        const now = new Date();
        const todayStart = startOfDay(new Date());
        const weekStart = startOfWeek(new Date());

        const [
            ordersToday,
            ordersThisWeek,
            pendingDeliveries,
            newOrders,
            cancelledOrders,
            unpaidInvoices,
            partPaidInvoices,
            lowStockItems,
            revenueToday,
            revenueWeek,
        ] = await Promise.all([
            Order.countDocuments({ createdAt: { $gte: todayStart }, orderStatus: { $ne: 'CANCELLED' } }),
            Order.countDocuments({ createdAt: { $gte: weekStart }, orderStatus: { $ne: 'CANCELLED' } }),
            Order.countDocuments({ orderStatus: { $in: ['CONFIRMED', 'IN_PRODUCTION', 'PACKED', 'SHIPPED'] } }),
            Order.countDocuments({ orderStatus: 'NEW' }),
            Order.countDocuments({ orderStatus: 'CANCELLED' }),
            Invoice.countDocuments({ paymentStatus: 'UNPAID' }),
            Invoice.countDocuments({ paymentStatus: 'PART_PAID' }),
            Inventory.countDocuments({ $expr: { $lte: ['$stockQty', '$minStockQty'] } }),
            Order.aggregate([
                { $match: { createdAt: { $gte: todayStart }, orderStatus: { $ne: 'CANCELLED' } } },
                { $group: { _id: null, total: { $sum: '$total' } } },
            ]),
            Order.aggregate([
                { $match: { createdAt: { $gte: weekStart }, orderStatus: { $ne: 'CANCELLED' } } },
                { $group: { _id: null, total: { $sum: '$total' } } },
            ]),
        ]);

        res.json({
            orders: { today: ordersToday, thisWeek: ordersThisWeek, pending: pendingDeliveries, new: newOrders, cancelled: cancelledOrders },
            payments: { unpaidInvoices, partPaidInvoices },
            inventory: { lowStockItems },
            revenue: {
                today: revenueToday[0]?.total || 0,
                thisWeek: revenueWeek[0]?.total || 0,
            },
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/dashboard/recent-orders
router.get('/recent-orders', requireAdminAuth, async (req, res) => {
    try {
        const orders = await Order.find({ orderStatus: { $ne: 'CANCELLED' } })
            .sort({ createdAt: -1 }).limit(10).select('orderNumber customer.name orderStatus paymentStatus total createdAt');
        res.json(orders);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
