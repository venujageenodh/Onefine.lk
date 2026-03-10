const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    category: { type: String, default: '', trim: true },
    capacity: { type: String, default: '', trim: true },  // e.g. "550ml"
    sku: { type: String, default: '', trim: true, sparse: true },
    price: { type: String, default: '' },                 // legacy display price (e.g. "Rs. 4,950")
    sellingPrice: { type: Number, default: 0 },           // numeric selling price
    costPrice: { type: Number, default: 0 },              // purchase cost
    otherCharges: { type: Number, default: 0 },           // e.g. branding, packaging
    image: { type: String, default: '' },
    images: [{ type: String }],                           // additional photos
    rating: { type: Number, default: 5, min: 1, max: 5 },
    isBestSeller: { type: Boolean, default: false },
    codAllowed: { type: Boolean, default: true },
    collectionSlug: { type: String, default: '' },
    isPublic: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
