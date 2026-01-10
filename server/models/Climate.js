const mongoose = require('mongoose');

const climateSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    temperature: { type: Number, required: true },
    moisture: { type: Number }, // Soil moisture
    humidity: { type: Number }, // Air humidity
    co2: { type: Number }, // CO2 Level
    fanStatus: { type: String, default: 'OFF' }, // 'Intake ON', 'Exhaust ON', 'OFF'
    notes: { type: String }
}, { collection: 'climate' });

module.exports = mongoose.model('Climate', climateSchema);
