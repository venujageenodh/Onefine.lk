const mongoose = require('mongoose');

const adminUserSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
        type: String,
        enum: ['OWNER', 'DEVELOPER', 'SALES_ADMIN', 'INVENTORY_ADMIN', 'ACCOUNT_ADMIN'],
        default: 'SALES_ADMIN',
    },
    permissions: [{ type: String }], // e.g. ['orders.view','orders.edit','inventory.view']
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('AdminUser', adminUserSchema);
