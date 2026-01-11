const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const path = require('path');
const fs = require('fs');

console.log('🔄 Initializing WhatsApp Clients with LocalAuth (Two Phone Support)...');

// Define session directories for two phones
const SESSION_DIR_1 = path.join(__dirname, '..', '.wwebjs_auth_1');
const SESSION_DIR_2 = path.join(__dirname, '..', '.wwebjs_auth_2');

// Ensure session directories exist
[SESSION_DIR_1, SESSION_DIR_2].forEach((dir, index) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Created session directory for Phone ${index + 1}:`, dir);
    }
});

// Client 1 (Primary Phone)
const client1 = new Client({
    authStrategy: new LocalAuth({
        dataPath: SESSION_DIR_1
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
    },
    restartOnAuthFail: true
});

// Client 2 (Secondary Phone)
const client2 = new Client({
    authStrategy: new LocalAuth({
        dataPath: SESSION_DIR_2
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
    },
    restartOnAuthFail: true
});

let isReady1 = false;
let isReady2 = false;
let latestQr1 = "";
let latestQr2 = "";
let qrShown1 = false;
let qrShown2 = false;

// Helper function to handle client events
function setupClientEvents(client, clientNumber, readyVar, qrVar, qrShownVar, sessionDir) {
    // QR Code generation
    client.on('qr', (qr) => {
        if (!qrShownVar) {
            qrVar = qr;
            console.log(`\n📱 ============================================================`);
            console.log(`📱 PHONE ${clientNumber}: ACTION REQUIRED: Scan this QR Code with WhatsApp (Linked Devices)`);
            console.log(`📱 ============================================================\n`);
            qrcode.generate(qr, { small: true });
            qrShownVar = true;
        }
    });

    // Ready event
    client.on('ready', () => {
        console.log(`\n✅ WhatsApp Phone ${clientNumber} is READY! Session restored successfully.\n`);
        readyVar = true;
        qrVar = "";
        qrShownVar = false;
    });

    // Authenticated
    client.on('authenticated', () => {
        console.log(`🔐 WhatsApp Phone ${clientNumber} Authenticated successfully!`);
    });

    // Auth failure
    client.on('auth_failure', msg => {
        console.error(`❌ WhatsApp Phone ${clientNumber} Authentication Failed:`, msg);
        readyVar = false;
        qrShownVar = false;
    });

    // Disconnected
    client.on('disconnected', (reason) => {
        console.log(`❌ WhatsApp Phone ${clientNumber} Disconnected:`, reason);
        readyVar = false;
        if (reason === 'LOGOUT') {
            console.log(`👋 Phone ${clientNumber} logged out. Clearing session...`);
            qrShownVar = false;
            try {
                if (fs.existsSync(sessionDir)) {
                    fs.rmSync(sessionDir, { recursive: true, force: true });
                    fs.mkdirSync(sessionDir, { recursive: true });
                    console.log(`🗑️ Phone ${clientNumber} session cleared. Will show QR on next start.`);
                }
            } catch (err) {
                console.error(`Error clearing Phone ${clientNumber} session:`, err);
            }
        } else {
            console.log(`🔄 Phone ${clientNumber}: Attempting to reconnect...`);
            setTimeout(() => {
                client.initialize();
            }, 5000);
        }
    });
}

// Setup events for both clients
setupClientEvents(client1, 1, isReady1, latestQr1, qrShown1, SESSION_DIR_1);
setupClientEvents(client2, 2, isReady2, latestQr2, qrShown2, SESSION_DIR_2);

// Helper functions
const getLatestQr = (phoneNumber = 1) => phoneNumber === 1 ? latestQr1 : latestQr2;
const isClientReady = (phoneNumber = 1) => phoneNumber === 1 ? isReady1 : isReady2;

// Start the clients (non-blocking)
(async () => {
    try {
        await Promise.all([
            client1.initialize(),
            client2.initialize()
        ]);
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
    // Auto-select phone: 'business' uses Phone 1 (9500591897), 'admin' uses Phone 2 (9159659711)
    const phoneNumber = messageType === 'business' ? 1 : 2;
    const client = phoneNumber === 1 ? client1 : client2;
    const ready = phoneNumber === 1 ? isReady1 : isReady2;

    if (!ready) {
        console.log(`⚠️ WhatsApp Phone ${phoneNumber} (${messageType}) not ready. Queued message to ${contactNumber}: ${message}`);
        return { success: false, message: `Phone ${phoneNumber} (${messageType}) not ready` };
    }

    try {
        const chatId = formatPhone(contactNumber);
        await client.sendMessage(chatId, message);
        console.log(`✅ Text sent to ${contactNumber} via Phone ${phoneNumber} (${messageType})`);
        return { success: true };
    } catch (error) {
        console.error(`❌ Failed to send to ${contactNumber} via Phone ${phoneNumber} (${messageType}):`, error.message);
        return { success: false, error: error.message };
    }
};

const sendImage = async (contactNumber, base64Image, caption, messageType = 'business') => {
    // Auto-select phone: 'business' uses Phone 1 (9500591897), 'admin' uses Phone 2 (9159659711)
    const phoneNumber = messageType === 'business' ? 1 : 2;
    const client = phoneNumber === 1 ? client1 : client2;
    const ready = phoneNumber === 1 ? isReady1 : isReady2;

    if (!ready) {
        console.log(`⚠️ WhatsApp Phone ${phoneNumber} (${messageType}) not ready. Cannot send image to ${contactNumber}`);
        return { success: false, message: `Phone ${phoneNumber} (${messageType}) not ready` };
    }
    try {
        const chatId = formatPhone(contactNumber);
        // Remove data:image/png;base64, prefix if present
        const cleanBase64 = base64Image.replace(/^data:image\/[a-z]+;base64,/, "");
        const media = new MessageMedia('image/png', cleanBase64, 'bill.png');

        await client.sendMessage(chatId, media, { caption: caption });
        console.log(`✅ Image sent to ${contactNumber} via Phone ${phoneNumber} (${messageType})`);
        return { success: true };
    } catch (error) {
        console.error(`❌ Failed to send Image to ${contactNumber}:`, error.message);
        return { success: false, error: error.message };
    }
};

const sendLoyaltyNotification = async (contactNumber, message, messageType = 'business') => {
    return sendMessage(contactNumber, message, messageType);
};

const sendDigitalBill = async (contactNumber, imageDataBase64, customerName, messageType = 'business') => {
    // Bills are always business messages
    const phoneNumber = 1; // Always use business phone for bills
    const client = client1;
    const ready = isReady1;

    if (!ready) {
        console.log(`⚠️ WhatsApp Phone ${phoneNumber} (business) not ready. Cannot send bill to ${contactNumber}`);
        return { success: false, message: `Phone ${phoneNumber} (business) not ready` };
    }

    try {
        const chatId = formatPhone(contactNumber);

        // Convert data URI to raw base64 if needed
        const base64Data = imageDataBase64.replace(/^data:image\/\w+;base64,/, "");
        const media = new MessageMedia('image/png', base64Data, 'bill.png');

        await client.sendMessage(chatId, media, { caption: `🧾 Dear ${customerName}, here is your bill. Thank you!` });
        console.log(`✅ Bill sent to ${contactNumber} via Phone ${phoneNumber} (business)`);
        return { success: true };
    } catch (error) {
        console.error(`❌ Failed to send bill to ${contactNumber} via Phone ${phoneNumber} (business):`, error.message);
        return { success: false, error: error.message };
    }
};

module.exports = { sendMessage, sendLoyaltyNotification, sendDigitalBill, client1, client2, getLatestQr, isClientReady, sendImage };
