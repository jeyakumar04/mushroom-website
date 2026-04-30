const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const batchSchema = new mongoose.Schema({
    batchName: String,
    soakingTime: Date,
    soakingStatus: String,
    soakingAlertSent: { type: Boolean, default: false }
});
const Batch = mongoose.model('Batch', batchSchema);

const checkBatches = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/tjp_mushroom_local');
        const batches = await Batch.find().sort({ soakingTime: -1 }).limit(5);
        console.log(`Latest 5 batches:`);
        batches.forEach(b => {
            console.log(`- ${b.batchName}: Status: ${b.soakingStatus}, SoakingTime: ${b.soakingTime ? b.soakingTime.toISOString() : 'N/A'}, AlertSent: ${b.soakingAlertSent}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkBatches();
