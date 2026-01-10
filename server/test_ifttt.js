const axios = require('axios');
require('dotenv').config();

const testIFTTT = async () => {
    const key = process.env.IFTTT_WEBHOOK_KEY;
    const event = process.env.IFTTT_EVENT_NAME || 'tjp_alert';
    const phones = (process.env.ADMIN_PHONE || '').split(',');

    console.log(`Testing IFTTT with Event: ${event}`);

    for (const phone of phones) {
        const p = phone.trim();
        const message = `TJP Alert: Testing call for ${p}`;

        try {
            const url = `https://maker.ifttt.com/trigger/${event}/with/key/${key}`;
            const response = await axios.post(url, {
                value1: message,
                value2: p
            });
            console.log(`✅ IFTTT Trigger Success for ${p}!`);
        } catch (error) {
            console.error(`❌ IFTTT Trigger Failed for ${p}:`, error.message);
        }
    }
};

testIFTTT();
