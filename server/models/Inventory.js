const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    itemName: { type: String, required: true, unique: true },
    stock: { type: Number, default: 0 },
    unit: { type: String, default: 'kg' },
    lastUpdated: { type: Date, default: Date.now }
}, { collection: 'inventory' });

module.exports = mongoose.model('Inventory', inventorySchema);
