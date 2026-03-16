const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    qty: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0 }, // percentage
    customization: { type: String, default: '' },
}, { _id: false });

const timelineEventSchema = new mongoose.Schema({
    status: { type: String, required: true },
    note: { type: String, default: '' },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser', default: null },
    adminName: { type: String, default: '' },
    at: { type: Date, default: Date.now },
}, { _id: false });

const orderSchema = new mongoose.Schema({
    orderNumber: { type: String, unique: true },          // e.g. ORD-2024-001
    orderType: { type: String, enum: ['SINGLE', 'BULK'], default: 'SINGLE' },
    source: { type: String, enum: ['WEBSITE', 'ADMIN', 'WHATSAPP'], default: 'WEBSITE' },
    customer: {
        name: { type: String, required: true },
        phone: { type: String, default: '' },
        email: { type: String, default: '' },
        address: { type: String, default: '' },
        city: { type: String, default: '' },
        company: { type: String, default: '' },
    },
    items: [orderItemSchema],
    subtotal: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    deliveryCharge: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },               // percentage
    taxAmount: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    notes: { type: String, default: '' },
    description: { type: String, default: '' },
    adminNotes: { type: String, default: '' },
    orderStatus: {
        type: String,
        enum: ['PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED', 'DISPATCHED', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'REFUNDED'],
        default: 'PENDING',
    },
    paymentStatus: { type: String, enum: ['UNPAID', 'PART_PAID', 'PAID'], default: 'UNPAID' },
    paymentMethod: { type: String, enum: ['PAYHERE', 'BANK', 'CASH', 'COD', 'WHATSAPP', ''], default: '' },
    timeline: [timelineEventSchema],
    assignedAdminId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser', default: null },
    quotationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quotation', default: null },
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', default: null },
    deliveryNoteId: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryNote', default: null },
    payhereOrderId: { type: String, default: '' },
    codAllowed: { type: Boolean, default: true },
}, { timestamps: true });

orderSchema.pre('save', async function () {
    if (!this.orderNumber) {
        const year = new Date().getFullYear();
        const count = await mongoose.model('Order').countDocuments();
        this.orderNumber = `ORD-${year}-${String(count + 1).padStart(4, '0')}`;
    }
});

module.exports = mongoose.model('Order', orderSchema);
