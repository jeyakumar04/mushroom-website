const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const notificationLogSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    type: { type: String, enum: ['WhatsApp', 'VoiceCall', 'Email'] },
    recipient: String,
    title: String,
    message: String,
    status: { type: String, default: 'Sent' },
    error: String
});
const NotificationLog = mongoose.model('NotificationLog', notificationLogSchema);

const checkLogs = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/tjp_mushroom_local');
        console.log('Connected to local DB');
        const logs = await NotificationLog.find().sort({ timestamp: -1 }).limit(20);
        console.log('Latest 20 Logs:');
        logs.forEach(log => {
            console.log(`[${log.timestamp.toISOString()}] ${log.type} to ${log.recipient} - ${log.title} | Status: ${log.status} ${log.error ? '| Error: ' + log.error : ''}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkLogs();
