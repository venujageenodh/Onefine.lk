const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
        description: { type: String, default: '' },
        coverImage: { type: String, default: '' },
        isActive: { type: Boolean, default: true },
        sortOrder: { type: Number, default: 0 },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Collection', collectionSchema);
