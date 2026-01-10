const axios = require('axios');
require('dotenv').config();

const testPipedream = async () => {
    const url = process.env.PIPEDREAM_WEBHOOK_URL;
    const phones = (process.env.ADMIN_PHONE || '9500591897,9159659711').split(',');

    console.log(`Testing Pipedream Webhook: ${url}`);

    if (!url) {
        console.error("❌ PIPEDREAM_WEBHOOK_URL is missing in .env");
        return;
    }

    for (const phone of phones) {
        const p = phone.trim();
        const message = `TJP Alert: Testing Pipedream trigger for ${p}`;

        try {
            const response = await axios.post(url, {
                phone: p,
                message: message,
                timestamp: new Date().toISOString(),
                source: 'TJP Mushroom Farm'
            });
            console.log(`✅ Pipedream Success for ${p}!`);
        } catch (error) {
            console.error(`❌ Pipedream Failed for ${p}:`, error.message);
        }
    }
};

testPipedream();
