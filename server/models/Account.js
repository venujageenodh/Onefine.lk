const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }, // "Cash", "Bank"
    type: { type: String, enum: ['cash', 'bank', 'online'], required: true },
    balance: { type: Number, default: 0 },
    description: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Account', accountSchema);
