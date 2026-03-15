const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    company: { type: String, default: '' },
    totalSpend: { type: Number, default: 0 },
    orderCount: { type: Number, default: 0 },
    quotationCount: { type: Number, default: 0 },
    lastOrderAt: { type: Date },
    tags: [String],
    notes: String,
}, { timestamps: true });

// Use email or phone as a way to find same customer
customerSchema.index({ phone: 1 });
customerSchema.index({ email: 1 });

module.exports = mongoose.model('Customer', customerSchema);
