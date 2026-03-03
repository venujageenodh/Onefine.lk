const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
    {
        // Customer info
        customerName: { type: String, required: true, trim: true },
        customerPhone: { type: String, required: true, trim: true },
        customerAddress: { type: String, required: true, trim: true },
        customerCity: { type: String, required: true, trim: true },
        customerNotes: { type: String, default: '' },

        // Order items
        items: [
            {
                productId: { type: String },
                name: { type: String, required: true },
                price: { type: String, required: true },
                quantity: { type: Number, default: 1 },
                image: { type: String, default: '' },
            },
        ],

        // Pricing
        subtotal: { type: Number, required: true },
        deliveryCharge: { type: Number, default: 350 },
        total: { type: Number, required: true },

        // Payment
        paymentMethod: {
            type: String,
            enum: ['payhere', 'bank_transfer', 'cod', 'whatsapp'],
            required: true,
        },
        paymentStatus: {
            type: String,
            enum: ['Pending', 'Paid', 'Failed'],
            default: 'Pending',
        },
        payhereOrderId: { type: String, default: '' },

        // Order status
        orderStatus: {
            type: String,
            enum: ['New', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
            default: 'New',
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
