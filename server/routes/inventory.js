const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');
const StockMovement = require('../models/StockMovement');
const Product = require('../models/Product');
const { requireAdminAuth, requirePermission } = require('../middleware/auth');

// Helper: adjust inventory and record movement
async function adjustStock({ productId, type, qty, reason, orderId, supplierId, adminId, unitCost }) {
    let inv = await Inventory.findOne({ productId });
    if (!inv) inv = await Inventory.create({ productId, stockQty: 0, minStockQty: 5 });

    const qtyBefore = inv.stockQty;
    if (type === 'IN') inv.stockQty += qty;
    else if (type === 'OUT') inv.stockQty = Math.max(0, inv.stockQty - qty);
    else inv.stockQty = Math.max(0, inv.stockQty + qty); // ADJUST (qty can be negative)
    const qtyAfter = inv.stockQty;
    await inv.save();

    const totalCost = (unitCost || 0) * qty;
    await StockMovement.create({ productId, type, qty, qtyBefore, qtyAfter, reason, orderId, supplierId, adminId, unitCost, totalCost });

    // Auto-update Product costPrice on IN movement if unitCost is provided
    if (type === 'IN' && unitCost !== undefined) {
        await Product.findByIdAndUpdate(productId, { costPrice: unitCost });
    }

    return inv;
}

// GET /api/inventory — all products with their inventory
router.get('/', requireAdminAuth, requirePermission('inventory.view'), async (req, res) => {
    try {
        const products = await Product.find({ isActive: { $ne: false } }).lean();
        const inventories = await Inventory.find().lean();
        const invMap = {};
        inventories.forEach(i => { invMap[i.productId.toString()] = i; });

        const result = products.map(p => ({
            ...p,
            inventory: invMap[p._id.toString()] || { stockQty: 0, minStockQty: 5, reservedQty: 0 },
        }));
        res.json(result);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/inventory/low-stock
router.get('/low-stock', requireAdminAuth, async (req, res) => {
    try {
        const inventories = await Inventory.find().populate('productId').lean();
        const low = inventories.filter(i => i.stockQty <= i.minStockQty && i.productId);
        res.json(low);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/inventory/movements — stock movement history
router.get('/movements', requireAdminAuth, requirePermission('inventory.view'), async (req, res) => {
    try {
        const { productId, limit = 50 } = req.query;
        const filter = productId ? { productId } : {};
        const movements = await StockMovement.find(filter)
            .populate('productId', 'name')
            .sort({ createdAt: -1 })
            .limit(Number(limit));
        res.json(movements);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/inventory/:productId — update minStockQty or directly adjust
router.put('/:productId', requireAdminAuth, requirePermission('inventory.edit'), async (req, res) => {
    try {
        const { minStockQty, stockQty, reason } = req.body;
        let inv = await Inventory.findOne({ productId: req.params.productId });
        if (!inv) inv = await Inventory.create({ productId: req.params.productId, stockQty: 0, minStockQty: 5 });

        if (minStockQty !== undefined) inv.minStockQty = minStockQty;
        if (stockQty !== undefined) {
            const diff = stockQty - inv.stockQty;
            const type = diff >= 0 ? 'ADJUST' : 'ADJUST';
            await adjustStock({ productId: req.params.productId, type, qty: diff, reason: reason || 'Manual adjust', adminId: req.admin._id });
        } else {
            await inv.save();
        }
        const updated = await Inventory.findOne({ productId: req.params.productId });
        res.json(updated);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/inventory/stock-in — receive stock from supplier
router.post('/stock-in', requireAdminAuth, requirePermission('inventory.edit'), async (req, res) => {
    try {
        const { productId, qty, supplierId, reason, unitCost } = req.body;
        if (!productId || !qty) return res.status(400).json({ error: 'productId and qty required' });

        const inv = await adjustStock({
            productId, type: 'IN', qty: Number(qty),
            reason: reason || `Stock received from supplier`,
            supplierId, adminId: req.admin._id,
            unitCost: unitCost !== undefined && unitCost !== '' ? Number(unitCost) : undefined
        });

        // Optionally update product costPrice
        if (costPrice) await Product.findByIdAndUpdate(productId, { costPrice });

        res.json({ success: true, inventory: inv });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
module.exports.adjustStock = adjustStock;
