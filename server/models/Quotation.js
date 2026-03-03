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
        email: { type: String, default: '' },
        address: { type: String, default: '' },
        city: { type: String, default: '' },
        company: { type: String, default: '' },
    },
    items: [quotationItemSchema],
    subtotal: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    deliveryCharge: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },               // percentage
    taxAmount: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    notes: { type: String, default: '' },
    validUntil: { type: Date },
    status: {
        type: String,
        enum: ['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'CONVERTED'],
        default: 'DRAFT',
    },
    convertedToInvoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser', default: null },
}, { timestamps: true });

// Auto-generate qNumber before saving
quotationSchema.pre('save', async function (next) {
    if (!this.qNumber) {
        const year = new Date().getFullYear();
        const count = await mongoose.model('Quotation').countDocuments();
        this.qNumber = `QT-${year}-${String(count + 1).padStart(4, '0')}`;
    }
    next();
});

module.exports = mongoose.model('Quotation', quotationSchema);
