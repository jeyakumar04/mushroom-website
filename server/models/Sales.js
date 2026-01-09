const mongoose = require('mongoose');

const salesSchema = new mongoose.Schema({
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
        default: 'pockets' // pockets for mushroom, kg for seeds
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
    date: {
        type: Date,
        default: Date.now
    }
}, {
    collection: 'sales',
    timestamps: true
});

module.exports = mongoose.model('Sales', salesSchema);
