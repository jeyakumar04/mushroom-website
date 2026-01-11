require('dotenv').config();
const { sendMessage, client1 } = require('./services/whatsappService');

const testFanNotifications = async () => {
    const adminPhones = (process.env.ADMIN_PHONE || '9500591897,9159659711').split(',');

    console.log("⏳ Waiting for WhatsApp Client to be ready...");

    await new Promise((resolve) => {
        client1.on('ready', () => {
            console.log("✅ Client connected! Starting test...");
            resolve();
        });

        // Timeout fallback if already ready or taking too long
        setTimeout(() => {
            console.log("⚠️ Timeout waiting for 'ready' event. Checking if proceeding is possible...");
            resolve();
        }, 15000);
    });

    const scenarios = [
        {
            title: "💨 FAN STATUS: INTAKE ON",
            msg: "✅ Fresh Air Fan (Fan In) has been turned ON.\nReason: CO2 levels high intent.",
        },
        {
            title: "🛑 FAN STATUS: EXHAUST ON",
            msg: "⚠️ Exhaust Fan (Fan Out) has been turned ON.\nReason: Temperature above limit (30°C).",
        },
        {
            title: "🔕 FAN STATUS: ALL OFF",
            msg: "✅ All Fans have been turned OFF.\nClimate conditions are stable.",
        }
    ];

    console.log(`🚀 Starting Fan Notification Test for ${adminPhones.length} numbers...\n`);

    for (const phone of adminPhones) {
        const p = phone.trim();
        console.log(`--- Sending to Admin: ${p} ---`);

        for (const scenario of scenarios) {
            const waMessage = `🔔 *TJP ALERT: ${scenario.title}*\n\n${scenario.msg}\n\nTime: ${new Date().toLocaleTimeString()}`;

            try {
                const result = await sendMessage(p, waMessage);
                if (result.success) {
                    console.log(`✅ Sent: ${scenario.title}`);
                } else {
                    console.log(`⚠️ Send failed or queued: ${result.message || result.error}`);
                }
            } catch (error) {
                console.error(`❌ Failed: ${scenario.title}`, error.message);
            }

            // Small delay
            await new Promise(r => setTimeout(r, 2000));
        }
    }
    console.log(`\n✨ Fan notification test completed!`);

    setTimeout(() => {
        console.log("👋 Exiting...");
        process.exit(0);
    }, 5000);
};

testFanNotifications();
