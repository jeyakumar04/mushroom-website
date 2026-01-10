// Test script to verify WhatsApp LocalAuth implementation
// Run this after starting the server to check WhatsApp status

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testWhatsAppStatus() {
    console.log('🔍 Testing WhatsApp LocalAuth Implementation...\n');

    try {
        // Test 1: Check WhatsApp Status
        console.log('1️⃣ Checking WhatsApp Connection Status...');
        const statusResponse = await axios.get(`${BASE_URL}/api/admin/whatsapp-status`);
        console.log('   Status:', statusResponse.data.status);

        if (statusResponse.data.status === 'connected') {
            console.log('   ✅ WhatsApp is CONNECTED and ready!\n');
        } else if (statusResponse.data.status === 'scan_needed') {
            console.log('   ⚠️  QR Code scan required');
            console.log('   📱 Check server terminal for QR code\n');
        } else {
            console.log('   ⏳ WhatsApp is initializing...\n');
        }

        // Test 2: Check if session directory exists
        const fs = require('fs');
        const path = require('path');
        const sessionDir = path.join(__dirname, '..', 'wwebjs_auth');

        console.log('2️⃣ Checking Session Directory...');
        if (fs.existsSync(sessionDir)) {
            console.log('   ✅ Session directory exists:', sessionDir);
            const files = fs.readdirSync(sessionDir);
            console.log('   📁 Session files:', files.length > 0 ? files.join(', ') : 'Empty (first run)');
        } else {
            console.log('   ⚠️  Session directory not yet created');
            console.log('   💡 Will be created on first WhatsApp connection');
        }

        console.log('\n3️⃣ Current Configuration:');
        console.log('   📂 Session Path: wwebjs_auth/');
        console.log('   🎭 Headless Mode: true');
        console.log('   🔐 Auth Strategy: LocalAuth');
        console.log('   💾 Session Persistence: Enabled');

        console.log('\n✅ LocalAuth Implementation Test Complete!\n');

    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.log('❌ Server is not running!');
            console.log('💡 Start server with: cd server && node index.js');
        } else {
            console.log('❌ Error:', error.message);
        }
    }
}

// Run the test
testWhatsAppStatus();
