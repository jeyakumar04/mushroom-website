const twilio = require('twilio');
const axios = require('axios');

/**
 * Technical Trigger: Sends a Voice Call alert via Twilio.
 */
const sendVoiceCall = async (toPhone, message) => {
    const accountSid = process.env.TWILIO_SID;
    const authToken = process.env.TWILIO_TOKEN;
    const fromPhone = process.env.TWILIO_PHONE;

    if (!accountSid || !authToken || !fromPhone) {
        // Fallback to IFTTT if Twilio is not configured
        if (process.env.IFTTT_WEBHOOK_KEY) {
            return await sendIFTTTCall(message);
        }
        console.log(`⚠️ [MOCK CALL] To: ${toPhone}, Msg: ${message}`);
        return { success: true, mock: true };
    }

    try {
        const client = twilio(accountSid, authToken);
        const call = await client.calls.create({
            twiml: `<Response><Say voice="alice">${message}</Say></Response>`,
            to: (toPhone.startsWith('+') ? toPhone : `+91${toPhone.replace(/\D/g, '')}`),
            from: fromPhone
        });
        console.log(`✅ Twilio Voice call initiated: ${call.sid}`);
        return { success: true, sid: call.sid };
    } catch (error) {
        console.error('❌ Twilio Voice Error:', error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Technical Trigger: Sends a Voice Call alert via IFTTT Webhook (Free solution).
 * The user must set up an IFTTT Applet: 
 * If Webhook 'tjp_alert', then Phone Call (VoIP).
 */
const sendIFTTTCall = async (message) => {
    const key = process.env.IFTTT_WEBHOOK_KEY;
    const event = process.env.IFTTT_EVENT_NAME || 'tjp_alert';

    if (!key) {
        console.log(`⚠️ [IFTTT MOCK] Msg: ${message}`);
        return { success: true, mock: true };
    }

    try {
        // IFTTT allows value1, value2, value3 to be passed
        await axios.post(`https://maker.ifttt.com/trigger/${event}/with/key/${key}`, {
            value1: message
        });
        console.log(`✅ IFTTT Alert Triggered: ${event}`);
        return { success: true };
    } catch (error) {
        console.error('❌ IFTTT Error:', error.message);
        return { success: false, error: error.message };
    }
};

module.exports = { sendVoiceCall, sendIFTTTCall };
