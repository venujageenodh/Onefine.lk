const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    transactionNumber: { type: String, unique: true },
    type: { type: String, enum: ['income', 'expense'], required: true },
    category: {
        type: String,
        enum: ['sales', 'purchase', 'salary', 'rent', 'utilities', 'asset', 'liability', 'other_income', 'other_expense'],
        required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    paymentMethod: {
        type: String,
        enum: ['cash', 'bank', 'online', 'cheque'],
        default: 'cash',
    },
    accountType: { type: String, enum: ['cash', 'bank'], default: 'cash' }, // which account is affected
    date: { type: Date, default: Date.now },
    note: { type: String, default: '' },
    // Link to source document if auto-generated
    sourceType: { type: String, enum: ['order', 'invoice', 'expense', 'manual', 'inventory'], default: 'manual' },
    sourceId: { type: mongoose.Schema.Types.ObjectId, default: null },
    // Who recorded it
    recordedBy: {
        adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser' },
        adminName: { type: String },
    },
}, { timestamps: true });

transactionSchema.pre('save', async function () {
    if (!this.transactionNumber) {
        const year = new Date().getFullYear();
        const prefix = this.type === 'income' ? 'INC' : 'EXP';
        const last = await this.constructor
            .findOne({ transactionNumber: new RegExp(`^${prefix}-${year}-`) })
            .sort({ transactionNumber: -1 });
        let count = 0;
        if (last) {
            const parts = last.transactionNumber.split('-');
            if (parts.length === 3) count = parseInt(parts[2], 10);
        }
        this.transactionNumber = `${prefix}-${year}-${String(count + 1).padStart(4, '0')}`;
    }
});

module.exports = mongoose.model('Transaction', transactionSchema);
