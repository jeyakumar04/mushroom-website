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
        const batches = await Batch.find({ soakingStatus: 'Soaking' });
        console.log(`Found ${batches.length} soaking batches:`);
        batches.forEach(b => {
            const finishTime = new Date(new Date(b.soakingTime).getTime() + 18 * 60 * 60 * 1000);
            console.log(`- ${b.batchName}: Started at ${b.soakingTime.toISOString()}, Expected Finish: ${finishTime.toISOString()}, AlertSent: ${b.soakingAlertSent}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkBatches();
