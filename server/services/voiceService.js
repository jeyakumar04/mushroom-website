/**
 * Technical Trigger: Sends a high-priority alert.
 * 
 * Note: Third-party APIs (Twilio, Pipedream) have been removed 
 * as per user request to use direct WhatsApp instead.
 */

const { sendMessage } = require('./whatsappService');

const sendVoiceCall = async (toPhone, message) => {
    console.log(`📡 Alert being sent via Direct WhatsApp instead of Voice Call: ${toPhone}`);
    return await sendMessage(toPhone, `🚨 *CRITICAL ALERT (VOICE FALLBACK)* 🚨\n\n${message}`);
};

const sendPipedreamWebhook = async (toPhone, message) => {
    console.log(`📡 Webhook replaced by Direct WhatsApp: ${toPhone}`);
    return await sendMessage(toPhone, `🔔 *SYSTEM NOTIFICATION* 🔔\n\n${message}`);
};

const sendIFTTTCall = async (toPhone, message) => {
    console.log(`📡 IFTTT replaced by Direct WhatsApp: ${toPhone}`);
    return await sendMessage(toPhone, `🔔 *IFTTT ALERT* 🔔\n\n${message}`);
};

module.exports = { sendVoiceCall, sendIFTTTCall, sendPipedreamWebhook };
