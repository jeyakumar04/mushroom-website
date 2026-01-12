const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const path = require('path');
const fs = require('fs');

console.log('🔄 Initializing WhatsApp Client with LocalAuth (Single Phone Support)...');

// Define session directory
const SESSION_DIR = path.join(__dirname, '..', '.wwebjs_auth');

// Ensure session directory exists
if (!fs.existsSync(SESSION_DIR)) {
    fs.mkdirSync(SESSION_DIR, { recursive: true });
    console.log(`📁 Created session directory:`, SESSION_DIR);
}

// Single WhatsApp Client
const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: SESSION_DIR,
        clientId: 'client'
    }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        ]
    },
    restartOnAuthFail: true,
    webVersionCache: {
        type: 'local'
    }
});

let isReady = false;
let latestQr = "";
let qrShown = false;

// Helper function to handle client events
function setupClientEvents(client, sessionDir) {
    // QR Code generation
    client.on('qr', (qr) => {
        if (!qrShown) {
            latestQr = qr;
            console.log(`\n📱 ============================================================`);
            console.log(`📱 WhatsApp: ACTION REQUIRED: Copy this QR string and generate QR at https://www.qr-code-generator.com/ then scan with WhatsApp`);
            console.log(`📱 QR String: ${qr}`);
            console.log(`📱 ============================================================\n`);
            // qrcode.generate(qr, { small: true });
            qrShown = true;
        }
    });

    // Ready event
    client.on('ready', () => {
        console.log(`\n✅ WhatsApp is READY! Session restored successfully.\n`);
        isReady = true;
        latestQr = "";
        qrShown = false;
    });

    // Authenticated
    client.on('authenticated', () => {
        console.log(`🔐 WhatsApp Authenticated successfully!`);
    });

    // Auth failure
    client.on('auth_failure', msg => {
        console.error(`❌ WhatsApp Authentication Failed:`, msg);
        isReady = false;
        qrShown = false;
    });

    // Disconnected
    client.on('disconnected', (reason) => {
        console.log(`❌ WhatsApp Disconnected:`, reason);
        isReady = false;
        if (reason === 'LOGOUT') {
            console.log(`👋 Logged out. Clearing session...`);
            qrShown = false;
            try {
                if (fs.existsSync(sessionDir)) {
                    fs.rmSync(sessionDir, { recursive: true, force: true });
                    fs.mkdirSync(sessionDir, { recursive: true });
                    console.log(`🗑️ Session cleared. Will show QR on next start.`);
                }
            } catch (err) {
                console.error(`Error clearing session:`, err);
            }
        } else {
            console.log(`🔄 Attempting to reconnect...`);
            setTimeout(() => {
                client.initialize();
            }, 5000);
        }
    });
}

// Setup events for the client
setupClientEvents(client, SESSION_DIR);

// Helper functions
const getLatestQr = () => latestQr;
const isClientReady = () => isReady;

// Start the client
(async () => {
    try {
        console.log('🚀 Initializing WhatsApp Client...');
        await client.initialize();
        console.log('✅ WhatsApp client initialized successfully.');
    } catch (e) {
        console.error("⚠️ WhatsApp initialization failed:", e.message);
        console.log("✅ Server will continue without WhatsApp. Other features work normally.");
    }
})();

// Helper: Format number to 91xxxxxxxxx@c.us
const formatPhone = (number) => {
    const cleaned = number.toString().replace(/\D/g, '');
    if (cleaned.length === 10) return `91${cleaned}@c.us`;
    if (cleaned.startsWith('91') && cleaned.length === 12) return `${cleaned}@c.us`;
    return `${cleaned}@c.us`; // Fallback
};

const sendMessage = async (contactNumber, message, messageType = 'business') => {
    const chatId = formatPhone(contactNumber);
    
    if (isReady) {
        try {
            await client.sendMessage(chatId, message);
            console.log(`✅ Message sent to ${contactNumber}`);
            return { success: true, message: 'Message sent successfully' };
        } catch (error) {
            console.error(`❌ Failed to send message to ${contactNumber}:`, error.message);
            return { success: false, error: error.message };
        }
    } else {
        console.log(`⚠️ WhatsApp not ready`);
        return { success: false, message: 'WhatsApp not ready' };
    }
};

const sendImage = async (contactNumber, base64Image, caption, messageType = 'business') => {
    const chatId = formatPhone(contactNumber);
    const cleanBase64 = base64Image.replace(/^data:image\/[a-z]+;base64,/, "");
    const media = new MessageMedia('image/png', cleanBase64, 'bill.png');
    
    if (isReady) {
        try {
            await client.sendMessage(chatId, media, { caption: caption });
            console.log(`✅ Image sent to ${contactNumber}`);
            return { success: true, message: 'Image sent successfully' };
        } catch (error) {
            console.error(`❌ Failed to send image to ${contactNumber}:`, error.message);
            return { success: false, error: error.message };
        }
    } else {
        console.log(`⚠️ WhatsApp not ready`);
        return { success: false, message: 'WhatsApp not ready' };
    }
};

const sendLoyaltyNotification = async (contactNumber, message, messageType = 'business') => {
    return sendMessage(contactNumber, message, messageType);
};

const sendDigitalBill = async (contactNumber, imageDataBase64, customerName, messageType = 'business') => {
    const chatId = formatPhone(contactNumber);
    const base64Data = imageDataBase64.replace(/^data:image\/\w+;base64,/, "");
    const media = new MessageMedia('image/png', base64Data, 'bill.png');
    const billCaption = `🧾 Dear ${customerName}, here is your bill. Thank you!`;
    
    if (isReady) {
        try {
            await client.sendMessage(chatId, media, { caption: billCaption });
            console.log(`✅ Bill sent to ${contactNumber}`);
            return { success: true, message: 'Bill sent successfully' };
        } catch (error) {
            console.error(`❌ Failed to send bill to ${contactNumber}:`, error.message);
            return { success: false, error: error.message };
        }
    } else {
        console.log(`⚠️ WhatsApp not ready`);
        return { success: false, message: 'WhatsApp not ready' };
    }
};

module.exports = { sendMessage, sendLoyaltyNotification, sendDigitalBill, client, getLatestQr, isClientReady, sendImage };
