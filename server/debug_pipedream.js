const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const PIPEDREAM_URL = process.env.PIPEDREAM_WEBHOOK_URL;
const PHONE = '9159659711';
const MSG = 'TJP TEST: If you see this, Pipedream is working for this number.';

async function test() {
    console.log('Testing Pipedream for:', PHONE);
    console.log('Webhook URL:', PIPEDREAM_URL);

    if (!PIPEDREAM_URL) {
        console.error('❌ PIPEDREAM_WEBHOOK_URL not found in .env');
        return;
    }

    try {
        const response = await axios.post(PIPEDREAM_URL, {
            phone: PHONE,
            message: MSG,
            source: 'TJP Debug'
        }, { timeout: 15000 });

        console.log('Status:', response.status);
        console.log('Data:', response.data);
        console.log('✅ Pipedream request accepted.');
    } catch (error) {
        console.error('❌ Pipedream Error:', error.message);
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', error.response.data);
        }
    }
}

test();
