const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const path = require('path');

console.log('🔄 Initializing WhatsApp Client with LocalAuth...');

// Define session directory path
const SESSION_DIR = path.join(__dirname, '..', 'wwebjs_auth');

const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: SESSION_DIR
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
            '--disable-gpu'
        ]
    }
});

let isReady = false;

let latestQr = "";

// Generate QR Code for scanning
client.on('qr', (qr) => {
    latestQr = qr; // Store for API access
    console.log('\n📱 ============================================================');
    console.log('📱 ACTION REQUIRED: Scan this QR Code with WhatsApp (Linked Devices)');
    console.log('📱 ============================================================\n');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('\n✅ WhatsApp is READY! Notifications will be sent automatically.\n');
    isReady = true;
    latestQr = ""; // Clear QR once connected
});

// Helper to get QR
const getLatestQr = () => latestQr;
const isClientReady = () => isReady;


client.on('auth_failure', msg => {
    console.error('❌ WhatsApp Authentication Failed:', msg);
});

client.on('disconnected', (reason) => {
    console.log('❌ WhatsApp Disconnected:', reason);
    isReady = false;
    client.initialize(); // Try to reconnect
});

// Start the client (non-blocking)
(async () => {
    try {
        await client.initialize();
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

const sendMessage = async (contactNumber, message) => {
    if (!isReady) {
        console.log(`⚠️ WhatsApp not ready. Queued message to ${contactNumber}: ${message}`);
        return { success: false, message: 'Client not ready' };
    }

    try {
        const chatId = formatPhone(contactNumber);
        await client.sendMessage(chatId, message);
        console.log(`✅ Text sent to ${contactNumber}`);
        return { success: true };
    } catch (error) {
        console.error(`❌ Failed to send to ${contactNumber}:`, error.message);
        return { success: false, error: error.message };
    }
};

const sendImage = async (contactNumber, base64Image, caption) => {
    if (!isReady) {
        console.log(`⚠️ WhatsApp not ready. Cannot send image to ${contactNumber}`);
        return { success: false, message: 'Client not ready' };
    }
    try {
        const chatId = formatPhone(contactNumber);
        // Remove data:image/png;base64, prefix if present
        const cleanBase64 = base64Image.replace(/^data:image\/[a-z]+;base64,/, "");
        const media = new MessageMedia('image/png', cleanBase64, 'bill.png');

        await client.sendMessage(chatId, media, { caption: caption });
        console.log(`✅ Image sent to ${contactNumber}`);
        return { success: true };
    } catch (error) {
        console.error(`❌ Failed to send Image to ${contactNumber}:`, error.message);
        return { success: false, error: error.message };
    }
};

const sendLoyaltyNotification = async (contactNumber, message) => {
    return sendMessage(contactNumber, message);
};

const sendDigitalBill = async (contactNumber, imageDataBase64, customerName) => {
    if (!isReady) {
        console.log(`⚠️ WhatsApp not ready. Cannot send bill to ${contactNumber}`);
        return { success: false, message: 'Client not ready' };
    }

    try {
        const chatId = formatPhone(contactNumber);

        // Convert data URI to raw base64 if needed
        const base64Data = imageDataBase64.replace(/^data:image\/\w+;base64,/, "");
        const media = new MessageMedia('image/png', base64Data, 'bill.png');

        await client.sendMessage(chatId, media, { caption: `🧾 Dear ${customerName}, here is your bill. Thank you!` });
        console.log(`✅ Bill sent to ${contactNumber}`);
        return { success: true };
    } catch (error) {
        console.error(`❌ Failed to send bill to ${contactNumber}:`, error.message);
        return { success: false, error: error.message };
    }
};

module.exports = { sendMessage, sendLoyaltyNotification, sendDigitalBill, client, getLatestQr, isClientReady, sendImage };
