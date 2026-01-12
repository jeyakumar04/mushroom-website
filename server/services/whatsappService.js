const { Client, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');
const path = require('path');

/**
 * WhatsApp Service - OFFICIAL SESSION PERSISTENCE VERSION
 * Uses unique clientId for permanent login.
 */

const client = new Client({
    authStrategy: new LocalAuth({
        clientId: 'TJP_OFFICIAL',
        dataPath: './.wwebjs_auth' // Explicit path to save login
    }),
    puppeteer: {
        headless: false, // QR scan panna false-ve irukkatum
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage'
        ]
    }
});

let isReady = false;
const ADMIN_1 = '919159659711';
const ADMIN_2 = '919500591897';

client.on('ready', () => {
    isReady = true;
    console.log('✅ SESSION LOCKED & READY!');
});

client.on('authenticated', () => {
    console.log('🔐 WhatsApp Authenticated (Session Saved)');
});

// Initialization with new stable session
async function startTJPService() {
    try {
        console.log('📡 WhatsApp initialization DISABLED temporarily');
        // client.initialize(); // COMMENTED OUT - causing server crashes

        // Pairing code removed to rely on QR scan / Session Persistence
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
        await client.sendMessage(chatId, message);
        console.log(`✅ WhatsApp sent to: ${cleanNumber}`);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

/**
 * Utility: Send Image
 */
const sendImage = async (contactNumber, imageBase64, caption) => {
    try {
        if (!isReady) return { success: false, error: 'Client not ready' };
        const { MessageMedia } = require('whatsapp-web.js');
        let cleanNumber = contactNumber.replace(/\D/g, '');
        if (cleanNumber.length === 10) cleanNumber = `91${cleanNumber}`;
        const chatId = `${cleanNumber}@c.us`;
        const media = new MessageMedia('image/png', imageBase64.replace(/^data:image\/\w+;base64,/, ''), 'bill.png');
        await client.sendMessage(chatId, media, { caption });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendMessage,
    sendImage,
    sendDigitalBill: (phone, img, name) => sendImage(phone, img, name),
    sendLoyaltyNotification: (phone, msg) => sendMessage(phone, msg),
    isClientReady: () => isReady,
    getLatestQr: () => "",
    ADMIN_1,
    ADMIN_2
};
