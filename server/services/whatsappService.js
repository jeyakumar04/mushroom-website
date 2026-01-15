const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

/**
 * WhatsApp Service - PERMANENT SESSION VERSION
 * Uses unique clientId for permanent login with QR fallback.
 */

let latestQR = null;

const client = new Client({
    authStrategy: new LocalAuth({
        clientId: 'TJP_PERMANENT',
        dataPath: path.join(__dirname, '../.wwebjs_auth') // Absolute path for session
    }),
    puppeteer: {
        headless: "new", // 🔥 Updated to new headless mode to avoid detection
        timeout: 60000,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--disable-extensions',
            '--no-default-browser-check',
            '--disable-gpu',
            '--disable-software-rasterizer',
            '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ]
    }
});

let isReady = false;
const ADMIN_1 = '919159659711';
const ADMIN_2 = '919500591897';

// QR Code Event - Shows when session expired or first login
client.on('qr', (qr) => {
    latestQR = qr;
    console.log('\n');
    console.log('╔════════════════════════════════════════════════════╗');
    console.log('║    📱 WHATSAPP QR CODE - SCAN TO LOGIN PERMANENTLY ║');
    console.log('╠════════════════════════════════════════════════════╣');
    qrcode.generate(qr, { small: true });
    console.log('╚════════════════════════════════════════════════════╝');
    console.log('⏳ Waiting for QR scan... Session will be saved permanently.');
    console.log('\n');
});

client.on('ready', () => {
    isReady = true;
    latestQR = null;
    console.log('\n');
    console.log('╔════════════════════════════════════════════════════╗');
    console.log('║  ✅ WHATSAPP CONNECTED - SESSION SAVED PERMANENTLY ║');
    console.log('╠════════════════════════════════════════════════════╣');
    console.log('║  📱 Messages will now be sent via WhatsApp         ║');
    console.log('║  🔒 No QR needed on next server restart            ║');
    console.log('╚════════════════════════════════════════════════════╝');
    console.log('\n');
});

client.on('authenticated', () => {
    console.log('🔐 WhatsApp Authenticated - Session Locked!');
});

client.on('auth_failure', (msg) => {
    console.error('❌ WhatsApp Auth Failed:', msg);
    isReady = false;
    latestQR = null;
    // Retry immediately with a fresh session attempt if possible, or wait for QR
    setTimeout(() => {
        console.log('🔄 Auth failed. Re-initializing...');
        client.initialize();
    }, 2000);
});

client.on('disconnected', (reason) => {
    console.warn('⚠️ WhatsApp Disconnected:', reason);
    isReady = false;
    latestQR = null;
    // Try to reconnect faster
    setTimeout(() => {
        console.log('🔄 Disconnected. Attempting to reconnect...');
        client.initialize();
    }, 2000); // Reduced from 5000
});

// Initialization
async function startTJPService() {
    try {
        console.log('📡 Initializing WhatsApp (Permanent Session Mode)...');
        await client.initialize();
    } catch (err) {
        console.log('🔥 Initialization Error: ' + err.message);
    }
}

startTJPService();

/**
 * Utility: Send WhatsApp Message
 */
const sendMessage = async (contactNumber, message) => {
    try {
        if (!isReady) return { success: false, error: 'Client not ready' };
        let cleanNumber = contactNumber.replace(/\D/g, '');
        if (cleanNumber.length === 10) cleanNumber = `91${cleanNumber}`;
        const chatId = `${cleanNumber}@c.us`;

        // Try multiple approaches to bypass internal WhatsApp errors
        try {
            // Wake up chat session
            const chat = await client.getChatById(chatId);
            await chat.sendStateTyping();

            // Method 1: Direct send with link preview disabled
            await client.sendMessage(chatId, message, { linkPreview: false });
            console.log(`✅ WhatsApp sent to: ${cleanNumber}`);
            return { success: true };
        } catch (err1) {
            console.log(`⚠️ Method 1 failed (${err1.message}), trying Method 2...`);

            try {
                // Method 2: Create MessageMedia text fallback
                const numberObj = await client.getNumberId(cleanNumber);
                const target = numberObj ? numberObj._serialized : chatId;
                await client.sendMessage(target, message);
                console.log(`✅ WhatsApp sent to: ${cleanNumber} (Method 2)`);
                return { success: true };
            } catch (err2) {
                console.log(`⚠️ Method 2 failed, giving up...`);
                throw err2;
            }
        }
    } catch (error) {
        console.error(`🔥 Send Failed to ${contactNumber}:`, error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Utility: Send Image
 */
const sendImage = async (contactNumber, imageBase64, caption) => {
    try {
        if (!isReady) {
            console.error('❌ WhatsApp SendImage Failed: Client not ready');
            return { success: false, error: 'Client not ready' };
        }
        const { MessageMedia } = require('whatsapp-web.js');
        let cleanNumber = contactNumber.replace(/\D/g, '');
        if (cleanNumber.length === 10) cleanNumber = `91${cleanNumber}`;
        const chatId = `${cleanNumber}@c.us`;

        // Ensure Base64 is clean
        const base64Content = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
        const media = new MessageMedia('image/png', base64Content, 'bill.png');

        console.log(`📤 Attempting to send WhatsApp Bill to: ${cleanNumber}`);

        // Retry logic for images
        for (let attempt = 1; attempt <= 2; attempt++) {
            try {
                const chat = await client.getChatById(chatId);
                // 🚀 TJP ANTI-GRAVITY FIX: Use chat.sendMessage to bypass client-level 'markedUnread' error
                await chat.sendMessage(media, { caption });
                console.log(`✅ WhatsApp Bill sent to: ${cleanNumber} (Attempt ${attempt})`);
                return { success: true };
            } catch (err) {
                console.warn(`⚠️ Attempt ${attempt} failed for ${cleanNumber}: ${err.message}`);
                if (attempt === 2) throw err;
                await new Promise(r => setTimeout(r, 2000));
            }
        }
    } catch (error) {
        console.error(`🔥 WhatsApp SendImage CRITICAL FAIL for ${contactNumber}:`, error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Utility: Send Document/File
 */
const sendFile = async (contactNumber, filePath, caption) => {
    try {
        if (!isReady) return { success: false, error: 'Client not ready' };
        const { MessageMedia } = require('whatsapp-web.js');
        let cleanNumber = contactNumber.replace(/\D/g, '');
        if (cleanNumber.length === 10) cleanNumber = `91${cleanNumber}`;
        const chatId = `${cleanNumber}@c.us`;

        const media = MessageMedia.fromFilePath(filePath);
        await client.sendMessage(chatId, media, { caption });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendMessage,
    sendImage,
    sendFile,
    sendDigitalBill: (phone, img, name) => sendImage(phone, img, name),
    sendLoyaltyNotification: (phone, msg) => sendMessage(phone, msg),
    isClientReady: () => isReady,
    getLatestQr: () => latestQR,
    destroyClient: async () => {
        try {
            if (client && client.pupBrowser) {
                await client.destroy();
            }
        } catch (e) {
            console.error('Error destroying WA client:', e.message);
        }
    },
    client,
    ADMIN_1,
    ADMIN_2
};
