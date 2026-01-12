const wa = require('./services/whatsappService');

async function test() {
    console.log('Checking WhatsApp Client status...');
    setTimeout(async () => {
        const ready = wa.isClientReady();
        console.log('WhatsApp Ready Status:', ready);
        if (ready) {
            console.log('Attempting to send test message to ADMIN_1:', wa.ADMIN_1);
            const res = await wa.sendMessage(wa.ADMIN_1, '🤖 TJP WHATSAPP TEST: Force Mode Link Successful! ✅');
            console.log('Send Result:', res);
            process.exit(0);
        } else {
            console.log('WhatsApp NOT ready yet. Please wait...');
            process.exit(1);
        }
    }, 5000);
}

test();
