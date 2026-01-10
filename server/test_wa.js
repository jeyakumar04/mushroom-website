require('dotenv').config();
const { sendMessage } = require('./services/whatsappService');

const test = async () => {
    const res = await sendMessage('9500591897', '🚀 TJP Direct Script Test - If you see this, WhatsApp is working!');
    console.log(res);
};

test();
