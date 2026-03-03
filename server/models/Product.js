const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        price: { type: String, required: true, trim: true },
        rating: { type: Number, default: 5, min: 1, max: 5 },
        image: { type: String, default: '' },
        isBestSeller: { type: Boolean, default: false },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
