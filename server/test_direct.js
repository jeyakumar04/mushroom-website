require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;
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

const directUri = getDirectURI(uri);
console.log("Direct URI:", directUri.replace(/:[^@]+@/, ':****@'));

mongoose.connect(directUri, { serverSelectionTimeoutMS: 10000 })
    .then(() => {
        console.log("✅ SUCCESS with Direct URI!");
        process.exit(0);
    })
    .catch(err => {
        console.log("❌ FAILED with Direct URI:", err.message);
        process.exit(1);
    });
