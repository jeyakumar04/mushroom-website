const mongoose = require('mongoose');

const kadanLedgerSchema = new mongoose.Schema({
    order_id: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Paid', 'Unpaid'],
        default: 'Unpaid'
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {
    collection: 'kadan_ledger',
    timestamps: true
});

module.exports = mongoose.model('KadanLedger', kadanLedgerSchema);
