const mongoose = require('mongoose');

const climateSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    temperature: { type: Number, required: true },
    moisture: { type: Number, required: true },
    notes: { type: String }
}, { collection: 'climate' });

module.exports = mongoose.model('Climate', climateSchema);
