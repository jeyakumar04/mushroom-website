const axios = require('axios');

/**
 * WhatsApp Service - QR-FREE VERSION
 * Uses Twilio or Pipedream for background notifications.
 * Bill images are handled via Frontend (wa.me + Copy/Paste).
 */

const sendMessage = async (contactNumber, message) => {
    // Standardize phone number format (+91XXXXXXXXXX)
    const formattedNumber = contactNumber.startsWith('+')
        ? contactNumber
        : `+91${contactNumber.replace(/\D/g, '').slice(-10)}`;

    console.log(`📡 Sending QR-free WhatsApp to ${formattedNumber}...`);
    let pipedreamSuccess = false;
    let twilioSuccess = false;

    // 1. Try Pipedream (If configured)
    if (process.env.PIPEDREAM_WEBHOOK_URL) {
        try {
            await axios.post(process.env.PIPEDREAM_WEBHOOK_URL, {
                phone: formattedNumber,
                message: message,
                source: 'TJP Mushroom Farm'
            }, { timeout: 10000 }); // 10s timeout
            console.log(`✅ WhatsApp sent via Pipedream to ${formattedNumber}`);
            pipedreamSuccess = true;
            return { success: true };
        } catch (e) {
            console.error(`❌ Pipedream WhatsApp Error:`, e.message);
        }
    }

    // 2. Try Twilio WhatsApp (If configured)
    if (!pipedreamSuccess && process.env.TWILIO_SID && process.env.TWILIO_TOKEN && process.env.TWILIO_WHATSAPP_NUMBER) {
        try {
            const twilio = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
            await twilio.messages.create({
                from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
                to: `whatsapp:${formattedNumber}`,
                body: message
            });
            console.log(`✅ WhatsApp sent via Twilio to ${formattedNumber}`);
            twilioSuccess = true;
            return { success: true };
        } catch (e) {
            console.error(`❌ Twilio WhatsApp Error:`, e.message);
        }
    }

    // 3. Fallback: Mock if both fail
    if (!pipedreamSuccess && !twilioSuccess) {
        console.log(`📢 [MOCK WHATSAPP] To: ${formattedNumber}, Msg: ${message}`);
        return { success: true, mock: true };
    }

    return { success: false, error: 'All WhatsApp providers failed' };
};

// These are now handled by the frontend or mocked
const getLatestQr = () => "";
const isClientReady = () => true;
const sendImage = async (phone, img, cap) => {
    console.log(`📸 Image sending via server is disabled. Use Dashboard frontend instead.`);
    return { success: false, message: 'Server-side images disabled. Use Dashboard.' };
};
const sendDigitalBill = async (phone, img, name) => sendImage(phone, img, name);
const sendLoyaltyNotification = async (phone, msg) => sendMessage(phone, msg);

module.exports = {
    sendMessage,
    sendLoyaltyNotification,
    sendDigitalBill,
    getLatestQr,
    isClientReady,
    sendImage
};
