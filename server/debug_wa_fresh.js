const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

console.log('--- WhatsApp Debug Start ---');

const client = new Client({
    authStrategy: new LocalAuth({
        clientId: "client-one",
        dataPath: './.wwebjs_auth'
    }),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    console.log('QR Code received!');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client is ready!');
});

console.log('Attempting to initialize client...');

client.initialize()
    .then(() => console.log('Initialize call finished.'))
    .catch(err => {
        console.error('Initialization Error Detail:');
        console.error(err);
    });
