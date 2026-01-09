const mongoose = require('mongoose');

const expenditureSchema = new mongoose.Schema({
    category: {
        type: String,
        enum: ['Hay', 'Spawns', 'Covers', 'Seeds', 'Electricity', 'Labor', 'Transport', 'Other'],
        required: true
    },
    description: {
        type: String
    },
    quantity: {
        type: Number,
        default: 0
    },
    unit: {
        type: String
    },
    amount: {
        type: Number,
        required: true
    },
    addToInventory: {
        type: Boolean,
        default: false // When true and category is Seeds, adds to inventory
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {
    collection: 'expenditures',
    timestamps: true
});

module.exports = mongoose.model('Expenditure', expenditureSchema);
