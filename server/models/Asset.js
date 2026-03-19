const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: {
        type: String,
        enum: ['inventory', 'equipment', 'vehicle', 'property', 'tool', 'other'],
        default: 'other',
    },
    value: { type: Number, required: true, min: 0 },
    purchaseDate: { type: Date, default: Date.now },
    description: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    addedBy: {
        adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser' },
        adminName: { type: String },
    },
}, { timestamps: true });

module.exports = mongoose.model('Asset', assetSchema);
