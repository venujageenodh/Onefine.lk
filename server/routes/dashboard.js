const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Invoice = require('../models/Invoice');
const Inventory = require('../models/Inventory');
const Quotation = require('../models/Quotation');
const { requireAdminAuth } = require('../middleware/auth');

function startOfDay(d) { d.setHours(0, 0, 0, 0); return d; }
function startOfWeek(d) { const day = d.getDay(); d.setDate(d.getDate() - day); d.setHours(0, 0, 0, 0); return d; }
function startOfMonth(d) { d.setDate(1); d.setHours(0, 0, 0, 0); return d; }

// GET /api/dashboard/stats
router.get('/stats', requireAdminAuth, async (req, res) => {
    try {
        const now = new Date();
        const todayStart = startOfDay(new Date());
        const monthStart = startOfMonth(new Date());

        const [
            ordersToday,
            ordersThisMonth,
            pendingDeliveries,
            newOrders,
            cancelledOrders,
            completedOrders,
            unpaidInvoices,
            partPaidInvoices,
            lowStockItems,
            revenueToday,
            revenueMonth,
            salesTrend,
            topProducts,
            recentQuotations,
        ] = await Promise.all([
            Order.countDocuments({ createdAt: { $gte: todayStart }, orderStatus: { $nin: ['CANCELLED', 'REFUNDED'] } }),
            Order.countDocuments({ createdAt: { $gte: monthStart }, orderStatus: { $nin: ['CANCELLED', 'REFUNDED'] } }),
            Order.countDocuments({ orderStatus: { $in: ['CONFIRMED', 'PROCESSING', 'PACKED', 'DISPATCHED'] } }),
            Order.countDocuments({ orderStatus: 'PENDING' }),
            Order.countDocuments({ orderStatus: 'CANCELLED' }),
            Order.countDocuments({ orderStatus: 'COMPLETED' }),
            Invoice.countDocuments({ paymentStatus: 'UNPAID' }),
            Invoice.countDocuments({ paymentStatus: 'PARTIALLY_PAID' }),
            Inventory.countDocuments({ $expr: { $lte: ['$stockQty', '$minStockQty'] } }),
            Order.aggregate([
                { $match: { createdAt: { $gte: todayStart }, orderStatus: { $nin: ['CANCELLED', 'REFUNDED'] } } },
                { $group: { _id: null, total: { $sum: '$total' } } },
            ]),
            Order.aggregate([
                { $match: { createdAt: { $gte: monthStart }, orderStatus: { $nin: ['CANCELLED', 'REFUNDED'] } } },
                { $group: { _id: null, total: { $sum: '$total' } } },
            ]),
            Order.aggregate([
                { $match: { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, orderStatus: { $nin: ['CANCELLED', 'REFUNDED'] } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        total: { $sum: "$total" },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]),
            Order.aggregate([
                { $match: { orderStatus: 'COMPLETED' } },
                { $unwind: "$items" },
                { $group: { _id: "$items.name", totalSold: { $sum: "$items.qty" }, revenue: { $sum: { $multiply: ["$items.qty", "$items.unitPrice"] } } } },
                { $sort: { totalSold: -1 } },
                { $limit: 5 }
            ]),
            Quotation.find().sort({ createdAt: -1 }).limit(5).select('qNumber customer.name total status createdAt'),
        ]);

        res.json({
            orders: { 
                today: ordersToday, 
                thisMonth: ordersThisMonth, 
                pending: pendingDeliveries, 
                new: newOrders, 
                cancelled: cancelledOrders,
                completed: completedOrders
            },
            payments: { unpaidInvoices, partPaidInvoices },
            inventory: { lowStockItems },
            revenue: {
                today: revenueToday[0]?.total || 0,
                thisMonth: revenueMonth[0]?.total || 0,
            },
            salesTrend: salesTrend || [],
            topProducts: topProducts || [],
            recentQuotations: recentQuotations || []
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
