const mongoose = require('mongoose');

const waterLogSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    type: { type: String, enum: ['usage', 'refill'], required: true },
    liters: { type: Number, required: true },
    remainingLevel: { type: Number, required: true },
    percentage: { type: Number, required: true },
    notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('WaterLog', waterLogSchema);
