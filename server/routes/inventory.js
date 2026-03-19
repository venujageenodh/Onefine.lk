const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');
const StockMovement = require('../models/StockMovement');
const Product = require('../models/Product');
const Transaction = require('../models/Transaction');
const { updateAccountBalance } = require('./transactions');
const { requireAdminAuth, requirePermission } = require('../middleware/auth');

// Helper: adjust inventory and record movement
async function adjustStock({ productId, type, qty, reason, orderId, supplierId, adminId, unitCost }) {
    // Atomic Upsert: Ensure inventory record exists and update it in one go to avoid duplicate key errors
    const numQty = Number(qty) || 0;
    const inv = await Inventory.findOneAndUpdate(
        { productId },
        { $setOnInsert: { stockQty: 0, minStockQty: 5 } },
        { upsert: true, new: true, runValidators: true }
    );

    const qtyBefore = inv.stockQty;
    if (type === 'IN') inv.stockQty += numQty;
    else if (type === 'OUT') inv.stockQty = Math.max(0, inv.stockQty - numQty);
    else inv.stockQty = Math.max(0, inv.stockQty + numQty); // ADJUST (qty can be negative)
    const qtyAfter = inv.stockQty;
    await inv.save();

    const totalCost = (Number(unitCost) || 0) * numQty;
    await StockMovement.create({
        productId, type, qty: numQty, qtyBefore, qtyAfter,
        reason: reason || '',
        orderId: orderId || null,
        supplierId: supplierId || null,
        adminId: adminId || null,
        unitCost: Number(unitCost) || 0,
        totalCost
    });

    // Auto-update Product costPrice on IN movement if unitCost is provided
    if (type === 'IN' && unitCost !== undefined && !isNaN(unitCost)) {
        await Product.findByIdAndUpdate(productId, { costPrice: Number(unitCost) });
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
        const { productId, qty, supplierId, reason, unitCost, recordExpense } = req.body;
        if (!productId || !qty) return res.status(400).json({ error: 'productId and qty required' });

        // Sanitation
        const numQty = Number(qty) || 0;
        const numUnitCost = unitCost !== undefined && unitCost !== '' ? Number(unitCost) : undefined;
        const safeSupplierId = (supplierId && supplierId !== '' && supplierId !== 'None') ? supplierId : null;
        const safeAdminId = req.admin?._id || null;

        const inv = await adjustStock({
            productId,
            type: 'IN',
            qty: numQty,
            reason: reason || `Stock received from supplier`,
            supplierId: safeSupplierId,
            adminId: safeAdminId,
            unitCost: numUnitCost
        });

        // Optionally update product costPrice
        if (numUnitCost !== undefined && !isNaN(numUnitCost)) {
            await Product.findByIdAndUpdate(productId, { costPrice: numUnitCost });
        }

        // Auto-record expense if requested
        if (recordExpense && numUnitCost > 0) {
            try {
                const totalAmt = numQty * numUnitCost;
                const prod = await Product.findById(productId);
                const tx = new Transaction({
                    type: 'expense',
                    category: 'purchase',
                    amount: totalAmt,
                    paymentMethod: 'cash',
                    accountType: 'cash',
                    date: new Date(),
                    note: `Stock In: ${prod?.name || 'Unknown'} x ${numQty}`,
                    sourceType: 'inventory',
                    sourceId: productId,
                    recordedBy: { adminId: safeAdminId, adminName: req.admin?.name || 'Admin' },
                });
                await tx.save();
                await updateAccountBalance('cash', totalAmt, 'expense');
            } catch (txErr) {
                console.error('⚠️ Finance Mirroring Failed:', txErr.message);
            }
        }

        res.json({ success: true, inventory: inv });
    } catch (err) {
        console.error('❌ STOCK-IN ERROR:', err);
        res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
});

module.exports = router;
module.exports.adjustStock = adjustStock;
