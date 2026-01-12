const mongoose = require('mongoose');
const dns = require('dns');
require('dotenv').config();

async function fixConnection() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error('❌ MONGODB_URI not found');
        return;
    }

    console.log('🔍 Analyzing URI...');

    // 1. Check for special characters in password
    const match = uri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@/);
    if (match) {
        const user = match[1];
        const pass = match[2];
        if (pass.includes('#') || pass.includes('@') || pass.includes('$')) {
            console.log('⚠️ Password contains special characters. Encoding...');
            const encodedPass = encodeURIComponent(pass);
            const newUri = uri.replace(pass, encodedPass);
            console.log('✅ New Encoded URI generated.');

            console.log('📡 Testing encoded URI...');
            try {
                await mongoose.connect(newUri, { serverSelectionTimeoutMS: 10000 });
                console.log('🚀 SUCCESS with encoding! Please update your .env with the encoded password.');
                return;
            } catch (e) {
                console.log('❌ Still failed with encoding.');
            }
        }
    }

    // 2. Try direct hosts (bypass SRV)
    console.log('📡 Trying direct host connection...');
    const hosts = [
        'ac-ogvdy4k-shard-00-00.dcqsomw.mongodb.net:27017',
        'ac-ogvdy4k-shard-00-01.dcqsomw.mongodb.net:27017',
        'ac-ogvdy4k-shard-00-02.dcqsomw.mongodb.net:27017'
    ];

    const dbName = uri.split('/').pop().split('?')[0] || 'managementDB';
    const auth = uri.match(/\/\/([^@]+)@/)[1];
    const directUri = `mongodb://${auth}@${hosts.join(',')}/${dbName}?replicaSet=atlas-ogvdy4k-shard-0&ssl=true&authSource=admin`;

    console.log('📡 Testing Direct URI...');
    try {
        await mongoose.connect(directUri, { serverSelectionTimeoutMS: 10000 });
        console.log('🚀 SUCCESS with Direct Hosts! You can use this connection string.');
        console.log('Direct URI (Encoded):', directUri.replace(/:([^@]+)@/, ':****@'));
    } catch (e) {
        console.error('❌ All connection methods failed.');
        console.error(e.message);
    }
}

fixConnection();
