const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    itemName: {
        type: String,
        required: true,
        unique: true
    },
    startingStock: {
        type: Number,
        default: 0
    },
    currentStock: {
        type: Number,
        default: 0
    },
    unit: {
        type: String,
        default: 'kg'
    },
    usageHistory: [{
        date: { type: Date, default: Date.now },
        quantity: { type: Number, required: true },
        type: { type: String, enum: ['add', 'use'], required: true },
        notes: { type: String }
    }],
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    collection: 'inventory'
});

// Virtual for calculating total used
inventorySchema.virtual('totalUsed').get(function () {
    return this.usageHistory
        .filter(h => h.type === 'use')
        .reduce((sum, h) => sum + h.quantity, 0);
});

// Virtual for calculating total added
inventorySchema.virtual('totalAdded').get(function () {
    return this.usageHistory
        .filter(h => h.type === 'add')
        .reduce((sum, h) => sum + h.quantity, 0);
});

module.exports = mongoose.model('Inventory', inventorySchema);
