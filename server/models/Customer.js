const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    contactNumber: { type: String, required: true, unique: true },
    loyaltyCount: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
}, { collection: 'customers' });

module.exports = mongoose.model('Customer', customerSchema);
