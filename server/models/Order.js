const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    contactNumber: { type: String, required: true },
    address: { type: String, required: true },
    products: [{
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }
    }],
    totalPrice: { type: Number, required: true },
    status: { type: String, enum: ['Pending', 'Shipped', 'Delivered'], default: 'Pending' },
    createdAt: { type: Date, default: Date.now }
}, { collection: 'product_orders' });

module.exports = mongoose.model('Order', orderSchema);
