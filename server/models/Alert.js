const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    scheduledTime: {
        type: String, // Format: "HH:MM" (24hr)
        required: true
    },
    type: {
        type: String,
        enum: ['daily', 'growth', 'reminder'],
        default: 'daily'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    icon: {
        type: String,
        default: '🔔'
    }
}, {
    collection: 'alerts',
    timestamps: true
});

module.exports = mongoose.model('Alert', alertSchema);
