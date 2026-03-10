const jwt = require('jsonwebtoken');
const AdminUser = require('../models/AdminUser');

const JWT_SECRET = process.env.JWT_SECRET || 'onefine_secret';

// Default permissions per role
const ROLE_PERMISSIONS = {
    OWNER: ['*'], // all permissions
    DEVELOPER: ['*'],
    SALES_ADMIN: [
        'orders.view', 'orders.edit', 'orders.create',
        'quotations.view', 'quotations.edit', 'quotations.create',
        'invoices.view', 'dashboard.view',
    ],
    INVENTORY_ADMIN: [
        'products.view', 'products.edit', 'products.create',
        'inventory.view', 'inventory.edit',
        'suppliers.view', 'suppliers.edit', 'suppliers.create',
        'dashboard.view',
    ],
    ACCOUNT_ADMIN: [
        'invoices.view', 'invoices.edit',
        'payments.view', 'payments.create',
        'dashboard.view',
    ],
};

// Verify JWT and attach admin to request
async function requireAdminAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }
    const token = authHeader.slice(7);
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        // Support both legacy single-admin token (password-only) and new multi-admin token
        if (decoded.adminId) {
            const admin = await AdminUser.findById(decoded.adminId).lean();
            if (!admin || !admin.isActive) return res.status(401).json({ error: 'Admin account inactive or not found' });
            req.admin = admin;
            req.adminRole = admin.role;
            req.adminPermissions = admin.permissions.length > 0 ? admin.permissions : (ROLE_PERMISSIONS[admin.role] || []);
        } else if (decoded.role === 'admin') {
            // Legacy single-admin token — treat as OWNER
            req.admin = { _id: null, name: 'Legacy Admin', role: 'OWNER' };
            req.adminRole = 'OWNER';
            req.adminPermissions = ['*'];
        } else {
            return res.status(401).json({ error: 'Invalid token' });
        }
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Token expired or invalid' });
    }
}

// Check a specific permission (or bypass if OWNER with wildcard)
function requirePermission(permission) {
    return (req, res, next) => {
        const perms = req.adminPermissions || [];
        if (perms.includes('*') || perms.includes(permission)) return next();
        return res.status(403).json({ error: `Permission denied: ${permission}` });
    };
}

// OWNER or DEVELOPER only
function requireOwner(req, res, next) {
    if (req.adminRole !== 'OWNER' && req.adminRole !== 'DEVELOPER') {
        return res.status(403).json({ error: 'Owner access required' });
    }
    next();
}

module.exports = { requireAdminAuth, requirePermission, requireOwner, ROLE_PERMISSIONS };
