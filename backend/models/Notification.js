const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false }, // To track if the notification is read
    type: { type: String, enum: ['request', 'alert', 'system'], required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
