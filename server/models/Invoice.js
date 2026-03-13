const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    qty: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0 },
}, { _id: false });

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: { type: String, unique: true },    // e.g. INV-2024-001
    quotationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quotation', default: null },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
    customer: {
        name: { type: String, required: true },
        phone: { type: String, default: '' },
        email: { type: String, default: '' },
        address: { type: String, default: '' },
        city: { type: String, default: '' },
        company: { type: String, default: '' },
    },
    items: [invoiceItemSchema],
    subtotal: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    deliveryCharge: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    amountPaid: { type: Number, default: 0 },
    balanceDue: { type: Number, default: 0 },
    paymentStatus: {
        type: String,
        enum: ['UNPAID', 'PART_PAID', 'PAID'],
        default: 'UNPAID',
    },
    dueDate: { type: Date },
    notes: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser', default: null },
}, { timestamps: true });

invoiceSchema.pre('save', async function () {
    if (!this.invoiceNumber) {
        const year = new Date().getFullYear();
        const last = await mongoose.model('Invoice').findOne({ invoiceNumber: new RegExp(`^INV-${year}-`) }).sort({ _id: -1 });
        let nextNum = 1;
        if (last && last.invoiceNumber) {
            const parts = last.invoiceNumber.split('-');
            if (parts.length === 3) {
                nextNum = parseInt(parts[2], 10) + 1;
            }
        }
        this.invoiceNumber = `INV-${year}-${String(nextNum).padStart(4, '0')}`;
    }
    // Recalculate balance
    this.balanceDue = Math.max(0, this.total - this.amountPaid);
    // Update payment status
    if (this.amountPaid <= 0) this.paymentStatus = 'UNPAID';
    else if (this.amountPaid >= this.total) this.paymentStatus = 'PAID';
    else this.paymentStatus = 'PART_PAID';
});

module.exports = mongoose.model('Invoice', invoiceSchema);
