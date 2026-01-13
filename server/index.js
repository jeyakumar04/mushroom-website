const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const app = express();

// --- CONFIG ---
const MONGO_URL = "mongodb+srv://tjjeyakumar007:jeyakumar2004@managementdb.dcqsomw.mongodb.net/managementDB?retryWrites=true&w=majority";
const EMAIL_USER = "jpfarming10@gmail.com";
const EMAIL_PASS = "mmrn lasr hnuv irpy";
const ADMIN_PHONES = ["9500591897", "9159659711"];

mongoose.connect(MONGO_URL).then(() => console.log('✅ MONGODB: CONNECTED'));

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: true, args: ['--no-sandbox'] }
});

client.on('qr', (qr) => qrcode.generate(qr, { small: true }));
client.on('ready', () => {
    console.log('✅ WHATSAPP: READY');
    global.client = client;
});
client.initialize();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: EMAIL_USER, pass: EMAIL_PASS }
});

// --- FULL DATA EXTRACTION FUNCTION ---
async function runFullDetailedBackup() {
    console.log("🚀 Generating Full Detailed Master Backup...");
    const today = new Date().toLocaleDateString('en-IN');
    const desktopPath = path.join(require('os').homedir(), 'Desktop', 'TJP_FULL_DATABASE_BACKUP.csv');

    try {
        // 1. HEADER FOR EXCEL (All sections included)
        if (!fs.existsSync(desktopPath)) {
            const headers = "Date,Section,Category/Name,Quantity,Amount,Payment_Type,Customer_Phone,Remarks\n";
            fs.writeFileSync(desktopPath, headers);
        }

        // 2. DETAILED ROWS (Ippo dummy data-va poduraen, next step-la idhai unga collection kooda link pannuvom)
        let rows = "";
        rows += `${today},SALE,Parthasarathi,1 pocket,50,GPAY,9500591897,Successful Sale\n`;
        rows += `${today},SALE,JK,1 pocket,50,CASH,9159659711,Regular Customer\n`;
        rows += `${today},EXPENDITURE,Seeds,10kg,1200,CASH,-,Fresh Stocks\n`;
        rows += `${today},KADAN,Jeyanthi,-,3000,KADAN,9788481897,Pending Payment\n`;

        fs.appendFileSync(desktopPath, rows);
        console.log("✅ Excel Saved to Desktop: TJP_FULL_DATABASE_BACKUP.csv");

        // 3. WHATSAPP & EMAIL ATTACHMENT LOGIC
        const reportText = `🍄 *TJP MUSHROOM FARM - FULL DATA BACKUP*\n📅 Date: ${today}\n✅ Full Sales, Expense & Seed details are backed up in the attached file and sent to your email.`;

        // Send Email with CSV Attachment
        await transporter.sendMail({
            from: EMAIL_USER,
            to: EMAIL_USER,
            subject: `TJP FULL DATA BACKUP - ${today}`,
            text: reportText,
            attachments: [{ filename: 'TJP_Full_Backup.csv', path: desktopPath }]
        });
        console.log("✅ Email with Full Excel Attachment Sent!");

        // Send WhatsApp
        if (global.client) {
            for (let num of ADMIN_PHONES) {
                await global.client.sendMessage(`91${num}@c.us`, reportText);
            }
            console.log("✅ WhatsApp Alerts Sent!");
        }

    } catch (err) {
        console.error("❌ Backup Failed:", err);
    }
}

// 🕒 TEST TRIGGER (Set for 09:50 AM)
cron.schedule('40 09 * * *', () => {
    runFullDetailedBackup();
});

// 🕒 LIFETIME TRIGGER (Daily 08:30 AM)
cron.schedule('30 08 * * *', () => {
    runFullDetailedBackup();
});

app.listen(5000, () => console.log('🤖 TJP Full Data System Active... Waiting for 09:50 AM Test.'));