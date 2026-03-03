const mongoose = require('mongoose');

const stockMovementSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    type: { type: String, enum: ['IN', 'OUT', 'ADJUST'], required: true },
    qty: { type: Number, required: true },           // positive for IN/ADJUST-up, negative for OUT/ADJUST-down
    qtyBefore: { type: Number },
    qtyAfter: { type: Number },
    reason: { type: String, default: '' },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', default: null },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser', default: null },
}, { timestamps: true });

module.exports = mongoose.model('StockMovement', stockMovementSchema);
