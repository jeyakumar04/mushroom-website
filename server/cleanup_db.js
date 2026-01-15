const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI;
const LOCAL_MONGODB_URI = 'mongodb://localhost:27017/tjp_mushroom_local';

const getDirectURI = (uri) => {
    if (uri && uri.startsWith('mongodb+srv://')) {
        const match = uri.match(/mongodb\+srv:\/\/([^@]+)@([^/?]+)/);
        if (match) {
            const auth = match[1];
            const shards = [
                'ac-ogvdy4k-shard-00-00.dcqsomw.mongodb.net:27017',
                'ac-ogvdy4k-shard-00-01.dcqsomw.mongodb.net:27017',
                'ac-ogvdy4k-shard-00-02.dcqsomw.mongodb.net:27017'
            ];
            const dbPart = uri.split('/')[3] || 'managementDB';
            const dbName = dbPart.split('?')[0];
            return `mongodb://${auth}@${shards.join(',')}/${dbName}?authSource=admin&replicaSet=atlas-ogvdy4k-shard-0&tls=true&retryWrites=true&w=majority`;
        }
    }
    return uri;
};

const DIRECT_URI = getDirectURI(MONGODB_URI);

const models = [
    { name: 'Sales', file: './models/Sales' },
    { name: 'Expenditure', file: './models/Expenditure' },
    { name: 'Alert', file: './models/Alert' },
    { name: 'WaterLog', file: './models/WaterLog' },
    { name: 'Contact', file: './models/Contact' },
    { name: 'Booking', file: './models/Booking' },
    { name: 'Order', file: './models/Order' },
    { name: 'Batch', file: './models/Batch' },
    { name: 'KadanLedger', file: './models/KadanLedger' },
    { name: 'OTP', file: './models/OTP' },
    { name: 'Climate', file: './models/Climate' },
    { name: 'Customer', file: './models/Customer' }
];

async function cleanupCollection(dbName) {
    console.log(`\n🧹 Cleaning up ${dbName}...`);
    for (const modelInfo of models) {
        try {
            const Model = require(modelInfo.file);
            const result = await Model.deleteMany({});
            console.log(`🗑️  Deleted ${result.deletedCount} records from ${modelInfo.name}`);
        } catch (err) {
            console.error(`❌ Error clearing ${modelInfo.name}:`, err.message);
        }
    }

    // Special models
    const Blog = mongoose.models.Blog || mongoose.model('Blog', new mongoose.Schema({ title: String }));
    const blogResult = await Blog.deleteMany({});
    console.log(`🗑️  Deleted ${blogResult.deletedCount} records from Blog`);

    const NotificationLog = mongoose.models.NotificationLog || mongoose.model('NotificationLog', new mongoose.Schema({ timestamp: Date }));
    const notifResult = await NotificationLog.deleteMany({});
    console.log(`🗑️  Deleted ${notifResult.deletedCount} records from NotificationLog`);

    const Settings = mongoose.models.Settings || mongoose.model('Settings', new mongoose.Schema({ key: String, value: mongoose.Schema.Types.Mixed }));
    await Settings.deleteMany({ key: { $in: ['lastWaterCheck', 'soakingStartTime', 'soakingAlertSent', 'lastRefillDate'] } });
    await Settings.findOneAndUpdate({ key: 'currentWaterLevel' }, { value: 5000 }, { upsert: true });
    console.log('⚙️  Settings reset.');
}

async function start() {
    // 1. Try Cloud
    console.log('☁️  Attempting Cloud Cleanup...');
    try {
        await mongoose.connect(DIRECT_URI, { serverSelectionTimeoutMS: 10000 });
        console.log('✅ Connected to Cloud Atlas');
        await cleanupCollection('Cloud Atlas');
        await mongoose.disconnect();
    } catch (err) {
        console.error('❌ Cloud Cleanup Failed:', err.message);
    }

    // 2. Try Local
    console.log('\n🏠 Attempting Local Cleanup...');
    try {
        await mongoose.connect(LOCAL_MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
        console.log('✅ Connected to Local MongoDB');
        await cleanupCollection('Local MongoDB');
        await mongoose.disconnect();
    } catch (err) {
        console.error('❌ Local Cleanup Failed:', err.message);
    }

    // 3. Clear local files
    console.log('\n📂 Clearing Local Cache Files...');
    const cacheFiles = ['offline_sales.json', 'daily_report_sent.flag', 'monthly_report_sent.flag'];
    cacheFiles.forEach(file => {
        const filePath = path.join(__dirname, file);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`🗑️  Deleted ${file}`);
        }
    });

    console.log('\n✨ All Available Temporary Data Cleared!');
    process.exit(0);
}

start();
