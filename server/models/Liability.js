const mongoose = require('mongoose');

const liabilitySchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: {
        type: String,
        enum: ['loan', 'credit', 'payable', 'lease', 'other'],
        default: 'other',
    },
    originalAmount: { type: Number, required: true, min: 0 },
    outstandingBalance: { type: Number, required: true, min: 0 },
    dueDate: { type: Date },
    creditor: { type: String, default: '' }, // who we owe
    description: { type: String, default: '' },
    isSettled: { type: Boolean, default: false },
    repayments: [{
        amount: { type: Number },
        date: { type: Date, default: Date.now },
        note: { type: String },
    }],
    addedBy: {
        adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser' },
        adminName: { type: String },
    },
}, { timestamps: true });

module.exports = mongoose.model('Liability', liabilitySchema);
