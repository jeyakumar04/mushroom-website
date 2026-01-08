const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    place: {
        type: String,
        required: true
    },
    dateTime: {
        type: Date,
        required: true
    },
    contactNumber: { type: String, required: true },
    paymentType: { type: String, enum: ['Cash', 'GPay'], required: true },
    paymentScreenshot: { type: String }, // Base64 or URL
    status: { type: String, enum: ['Pending', 'Confirmed'], default: 'Pending' },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { collection: 'trainings' });

module.exports = mongoose.model('Booking', bookingSchema);
