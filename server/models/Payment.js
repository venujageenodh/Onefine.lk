const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', default: null },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
    amount: { type: Number, required: true, min: 0.01 },
    method: {
        type: String,
        enum: ['PAYHERE', 'BANK', 'CASH', 'COD'],
        required: true,
    },
    reference: { type: String, default: '' },   // bank ref, PayHere order_id, etc.
    slipUrl: { type: String, default: '' },     // Cloudinary URL for bank slip image
    date: { type: Date, default: Date.now },
    notes: { type: String, default: '' },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser', default: null },
    payhereStatus: { type: String, default: '' }, // raw PayHere status_message
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
