const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AdminUser = require('../models/AdminUser');
const { requireAdminAuth, requireOwner, ROLE_PERMISSIONS } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'onefine_secret';
const LEGACY_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'onefine';

// POST /api/auth/admin-login — multi-admin login (also supports legacy single-admin password)
router.post('/admin-login', async (req, res) => {
    const { email, password } = req.body;
    try {
        // Check if any AdminUsers exist in DB
        const adminCount = await AdminUser.countDocuments();

        if (adminCount === 0 || (!email && password)) {
            // Legacy mode: single password
            if (password !== LEGACY_ADMIN_PASSWORD) {
                return res.status(401).json({ error: 'Incorrect password' });
            }
            const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
            return res.json({
                token,
                admin: { name: 'Admin', role: 'OWNER', permissions: ['*'] },
            });
        }

        // Multi-admin mode: email + password
        if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
        const admin = await AdminUser.findOne({ email: email.toLowerCase(), isActive: true });
        if (!admin) return res.status(401).json({ error: 'Invalid credentials' });

        const match = await bcrypt.compare(password, admin.passwordHash);
        if (!match) return res.status(401).json({ error: 'Invalid credentials' });

        const permissions = admin.permissions.length > 0 ? admin.permissions : (ROLE_PERMISSIONS[admin.role] || []);
        const token = jwt.sign(
            { adminId: admin._id, role: admin.role, permissions },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        res.json({
            token,
            admin: { _id: admin._id, name: admin.name, email: admin.email, role: admin.role, permissions },
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Legacy route: POST /api/auth/login (kept for backward compat with existing frontend)
router.post('/login', async (req, res) => {
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: 'Password required' });
    if (password !== LEGACY_ADMIN_PASSWORD) return res.status(401).json({ error: 'Incorrect password' });
    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token });
});

// GET /api/admins — list all admin users (OWNER only)
router.get('/admins', requireAdminAuth, requireOwner, async (req, res) => {
    try {
        const admins = await AdminUser.find().select('-passwordHash').sort({ createdAt: -1 });
        res.json(admins);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/admins — create admin (OWNER only)
router.post('/admins', requireAdminAuth, requireOwner, async (req, res) => {
    const { name, email, password, role, permissions } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, password required' });
    try {
        const exists = await AdminUser.findOne({ email: email.toLowerCase() });
        if (exists) return res.status(400).json({ error: 'Email already in use' });
        const passwordHash = await bcrypt.hash(password, 12);
        const admin = await AdminUser.create({
            name, email, passwordHash,
            role: role || 'SALES_ADMIN',
            permissions: permissions || [],
        });
        res.status(201).json({ _id: admin._id, name: admin.name, email: admin.email, role: admin.role, permissions: admin.permissions });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/admins/:id — update admin (OWNER only)
router.put('/admins/:id', requireAdminAuth, requireOwner, async (req, res) => {
    const { name, email, password, role, permissions, isActive } = req.body;
    try {
        const update = { name, email, role, permissions, isActive };
        if (password) update.passwordHash = await bcrypt.hash(password, 12);
        const admin = await AdminUser.findByIdAndUpdate(req.params.id, update, { new: true }).select('-passwordHash');
        if (!admin) return res.status(404).json({ error: 'Admin not found' });
        res.json(admin);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/admins/:id (OWNER only, cannot delete self)
router.delete('/admins/:id', requireAdminAuth, requireOwner, async (req, res) => {
    try {
        if (req.admin._id && req.admin._id.toString() === req.params.id) {
            return res.status(400).json({ error: 'Cannot delete your own account' });
        }
        await AdminUser.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
