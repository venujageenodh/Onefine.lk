const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, unique: true },
    stockQty: { type: Number, default: 0, min: 0 },
    reservedQty: { type: Number, default: 0, min: 0 }, // qty held by pending orders
    minStockQty: { type: Number, default: 5 },
}, { timestamps: true });

inventorySchema.virtual('isLowStock').get(function () {
    return this.stockQty <= this.minStockQty;
});
inventorySchema.virtual('availableQty').get(function () {
    return Math.max(0, this.stockQty - this.reservedQty);
});

inventorySchema.set('toJSON', { virtuals: true });
inventorySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Inventory', inventorySchema);
