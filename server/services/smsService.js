const axios = require('axios');

/**
 * SMS Service for TJP Mushroom Farming
 * Primarily using Fast2SMS for OTP delivery (India)
 * Secondary: Twilio (can be configured)
 */

const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY;
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_FROM = process.env.TWILIO_PHONE_NUMBER;

/**
 * Sends a 6-digit OTP via Normal SMS
 * @param {string} phoneNumber - 10-digit number
 * @param {string} otp - 6-digit code
 */
const sendSMSOtp = async (phoneNumber, otp) => {
    const cleanPhone = phoneNumber.replace(/\D/g, '').slice(-10);

    // 1. FAST2SMS (Bulk V2 - OTP Route)
    if (FAST2SMS_API_KEY) {
        try {
            console.log(`📡 Sending Normal SMS OTP (Fast2SMS) to: ${cleanPhone}...`);
            const response = await axios.post('https://www.fast2sms.com/dev/bulkV2', {
                route: 'otp',
                variables_values: otp,
                numbers: cleanPhone
            }, {
                headers: {
                    "authorization": FAST2SMS_API_KEY,
                    "Content-Type": "application/json"
                }
            });

            if (response.data && response.data.return) {
                console.log(`✅ SMS Sent via Fast2SMS to ${cleanPhone}`);
                return { success: true, provider: 'Fast2SMS' };
            }
        } catch (error) {
            console.error(`❌ Fast2SMS Error:`, error.response?.data || error.message);
        }
    }

    // 2. TWILIO (Fallback)
    if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
        try {
            console.log(`📡 Sending Normal SMS OTP (Twilio) to: ${cleanPhone}...`);
            const client = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
            const message = await client.messages.create({
                body: `Your TJP Admin Login OTP is: ${otp}`,
                from: TWILIO_FROM,
                to: `+91${cleanPhone}`
            });

            if (message.sid) {
                console.log(`✅ SMS Sent via Twilio to ${cleanPhone}`);
                return { success: true, provider: 'Twilio' };
            }
        } catch (error) {
            console.error(`❌ Twilio Error:`, error.message);
        }
    }

    if (!FAST2SMS_API_KEY && !TWILIO_ACCOUNT_SID) {
        console.warn('⚠️ No SMS Provider configured (Missing Fast2SMS/Twilio keys in .env)');
    }

    return { success: false, error: 'SMS delivery failed' };
};

module.exports = { sendSMSOtp };
