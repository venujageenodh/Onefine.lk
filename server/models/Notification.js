const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['INFO', 'SUCCESS', 'WARNING', 'ERROR'], default: 'INFO' },
    resourceType: { type: String },
    resourceId: { type: mongoose.Schema.Types.ObjectId },
    isRead: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
