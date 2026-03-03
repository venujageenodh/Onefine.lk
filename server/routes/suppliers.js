const express = require('express');
const router = express.Router();
const Supplier = require('../models/Supplier');
const { requireAdminAuth, requirePermission } = require('../middleware/auth');

// GET /api/suppliers
router.get('/', requireAdminAuth, requirePermission('suppliers.view'), async (req, res) => {
    try {
        const suppliers = await Supplier.find({ isActive: true }).sort({ name: 1 });
        res.json(suppliers);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/suppliers
router.post('/', requireAdminAuth, requirePermission('suppliers.create'), async (req, res) => {
    try {
        const supplier = await Supplier.create(req.body);
        res.status(201).json(supplier);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/suppliers/:id
router.put('/:id', requireAdminAuth, requirePermission('suppliers.edit'), async (req, res) => {
    try {
        const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!supplier) return res.status(404).json({ error: 'Not found' });
        res.json(supplier);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/suppliers/:id (soft delete)
router.delete('/:id', requireAdminAuth, requirePermission('suppliers.edit'), async (req, res) => {
    try {
        await Supplier.findByIdAndUpdate(req.params.id, { isActive: false });
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
