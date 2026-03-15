const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    action: { type: String, required: true },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser' },
    adminName: { type: String },
    resourceType: { type: String, required: true }, // e.g. 'Quotation', 'Order', 'Invoice'
    resourceId: { type: mongoose.Schema.Types.ObjectId, required: true },
    details: { type: String },
    metadata: { type: Object },
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
