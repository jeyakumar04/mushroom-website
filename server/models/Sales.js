const mongoose = require('mongoose');

const salesSchema = new mongoose.Schema({
    orderId: {
        type: String,
        unique: true
    },
    productType: {
        type: String,
        enum: ['Mushroom', 'Seeds'],
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    unit: {
        type: String,
        default: 'pockets'
    },
    pricePerUnit: {
        type: Number,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    customerName: {
        type: String,
        required: true
    },
    contactNumber: {
        type: String,
        required: true
    },
    isLoyaltyCustomer: {
        type: Boolean,
        default: false
    },
    // --- KADAN/CREDIT MANAGEMENT ---
    paymentType: {
        type: String,
        enum: ['Cash', 'GPay', 'Credit'],
        default: 'Cash'
    },
    paymentStatus: {
        type: String,
        enum: ['Paid', 'Unpaid'],
        default: 'Paid'
    },
    settledDate: {
        type: Date
    },
    settledBy: {
        type: String,
        enum: ['Cash', 'GPay']
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {
    collection: 'sales',
    timestamps: true
});

module.exports = mongoose.model('Sales', salesSchema);
