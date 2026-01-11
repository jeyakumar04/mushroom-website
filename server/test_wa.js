require('dotenv').config();
const { sendMessage } = require('./services/whatsappService');
const { sendPipedreamWebhook } = require('./services/voiceService');

const testSystemAlerts = async () => {
    const adminPhones = (process.env.ADMIN_PHONE || '9500591897,9159659711').split(',');

    // Define scenarios based on user request
    const scenarios = [
        {
            title: "🛑 CRITICAL: Climate Control",
            msg: "⚠️ High Temperature Alert! (32°C)\nAction: Exhaust Fan Turned ON automatically.\nMist system activated.",
            type: "climate"
        },
        {
            title: "💧 WATER LEVEL LOW",
            msg: "⚠️ Water Drum 1 is below 20%.\nPlease refill immediately to ensure misting works.",
            type: "water"
        },
        {
            title: "🍄 BED TRACKING",
            msg: "📅 Batch A-1 Recommendation:\nIt is Day 16. Inspect beds for pinhead formation today.",
            type: "bed"
        }
    ];

    console.log(`🚀 Starting Full System Alert Test for ${adminPhones.length} numbers...\n`);

    for (const phone of adminPhones) {
        const p = phone.trim();
        console.log(`--- Testing for Admin: ${p} ---`);

        for (const scenario of scenarios) {
            // 1. WhatsApp Notification (Text)
            const waMessage = `🔔 *TJP ALERT: ${scenario.title}*\n\n${scenario.msg}\n\nTime: ${new Date().toLocaleTimeString()}`;
            await sendMessage(p, waMessage, 'admin'); // This will mock if no keys

            // 2. Pipedream Trigger (Call/Phone Alert)
            // We combine title and msg for the payload
            const alertText = `TJP Alert: ${scenario.title}. ${scenario.msg.replace(/\n/g, ' ')}`;
            await sendPipedreamWebhook(p, alertText);

            // Artificial delay between alerts
            await new Promise(r => setTimeout(r, 2000));
        }
        console.log(`✅ All scenarios sent to ${p}\n`);
    }
};

testSystemAlerts();
