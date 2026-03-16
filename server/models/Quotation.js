const mongoose = require('mongoose');

const quotationItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    qty: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0 }, // percentage
}, { _id: false });

const quotationSchema = new mongoose.Schema({
    qNumber: { type: String, unique: true },          // e.g. QT-2024-001
    customer: {
        name: { type: String, required: true },
        phone: { type: String, default: '' },
        email: { 
            type: String, 
            default: '',
            match: [/^\s*([^\s@]+@[^\s@]+\.[^\s@]+)?\s*$/, 'Please fill a valid email address']
        },
        address: { type: String, default: '' },
        city: { type: String, default: '' },
        company: { type: String, default: '' },
    },
    items: {
        type: [quotationItemSchema],
        validate: [v => Array.isArray(v) && v.length > 0, 'At least one line item is required']
    },
    subtotal: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    deliveryCharge: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },               // percentage
    taxAmount: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    notes: { type: String, default: '' },
    description: { type: String, default: '' },
    validUntil: { type: Date },
    status: {
        type: String,
        enum: ['DRAFT', 'SENT', 'VIEWED', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CONVERTED'],
        default: 'DRAFT',
    },
    timeline: [
        {
            status: String,
            note: String,
            adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser' },
            at: { type: Date, default: Date.now }
        }
    ],
    convertedToInvoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser', default: null },
}, { timestamps: true });

// Auto-generate qNumber before saving
quotationSchema.pre('save', async function () {
    if (!this.qNumber) {
        const year = new Date().getFullYear();
        const last = await mongoose.model('Quotation').findOne({ qNumber: new RegExp(`^QT-${year}-`) }).sort({ _id: -1 });
        let nextNum = 1;
        if (last && last.qNumber) {
            const parts = last.qNumber.split('-');
            if (parts.length === 3) {
                nextNum = parseInt(parts[2], 10) + 1;
            }
        }
        this.qNumber = `QT-${year}-${String(nextNum).padStart(4, '0')}`;
    }
});

module.exports = mongoose.model('Quotation', quotationSchema);
