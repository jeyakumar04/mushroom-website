const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
    batchName: { type: String, required: true },
    bedDate: { type: Date, required: true },
    soakingTime: { type: Date }, // Time of soaking
    soakingStatus: { type: String, enum: ['Not Started', 'Soaking', 'Completed'], default: 'Not Started' },
    soakingAlertSent: { type: Boolean, default: false },
    harvestAlertDate: { type: Date }, // Day 10-13
    roomChangeDate: { type: Date }, // Day 19-20
    lifetimeFinishDate: { type: Date }, // Day 20 or specific date
    status: {
        type: String,
        enum: ['Growing', 'Ready for Harvest', 'Room Change', 'Finished'],
        default: 'Growing'
    },
    seedsUsed: { type: Number, default: 0 },
    notes: { type: String },
    harvestedQuantity: { type: Number, default: 0 },
    harvestedDate: { type: Date },
    createdAt: { type: Date, default: Date.now }
}, { collection: 'batches' });

// Auto-calculate alerts based on TJP requirements
batchSchema.pre('save', function (next) {
    if (this.bedDate) {
        // Harvest alert (Day 11 - middle of 10-13)
        const harvest = new Date(this.bedDate);
        harvest.setDate(harvest.getDate() + 11);
        this.harvestAlertDate = harvest;

        // Room change (Day 19)
        const roomChange = new Date(this.bedDate);
        roomChange.setDate(roomChange.getDate() + 19);
        this.roomChangeDate = roomChange;

        // Lifetime finish (Day 20)
        const lifetime = new Date(this.bedDate);
        lifetime.setDate(lifetime.getDate() + 20);
        this.lifetimeFinishDate = lifetime;
    }
    next();
});

module.exports = mongoose.model('Batch', batchSchema);
