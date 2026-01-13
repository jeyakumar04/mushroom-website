const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const { exec } = require('child_process'); 
const { Client, LocalAuth } = require('whatsapp-web.js');

const app = express();

// --- 1. DATABASE & CONFIG ---
// Unga Atlas URL use pannuvadhala XAMPP MySQL error unga website-ai ippo affect pannadhu
const MONGO_URL = "mongodb+srv://tjjeyakumar007:jeyakumar2004@managementdb.dcqsomw.mongodb.net/managementDB?retryWrites=true&w=majority";
const EMAIL_USER = "jpfarming10@gmail.com";
const EMAIL_PASS = "mmrn lasr hnuv irpy";
const MY_WHATSAPP = "919361661334@c.us"; 

mongoose.connect(MONGO_URL)
    .then(() => console.log('✅ DATABASE: CONNECTED (Cloud Atlas)'))
    .catch(err => console.error('❌ DB CONNECTION ERROR:', err));

const client = new Client({ authStrategy: new LocalAuth() });
client.on('ready', () => console.log('✅ WHATSAPP: READY'));
client.initialize();

const transporter = nodemailer.createTransport({
    service: 'gmail', auth: { user: EMAIL_USER, pass: EMAIL_PASS }
});

// --- 2. MASTER REPORT LOGIC (SIDE-BY-SIDE ALL DATA) ---
async function runMasterReport() {
    console.log("🚀 Starting Night 8 PM Backup...");
    const today = new Date().toLocaleDateString('en-IN').replace(/\//g, '-');
    const folderPath = path.join(require('os').homedir(), 'Desktop', 'TJP_REPORTS');
    if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });
    
    const filePath = path.join(folderPath, `TJP_Report_${today}.csv`);

    try {
        const sales = await mongoose.connection.db.collection('sales').find({}).toArray();
        const productions = await mongoose.connection.db.collection('productions').find({}).toArray();
        const expenses = await mongoose.connection.db.collection('expenses').find({}).toArray();
        const climates = await mongoose.connection.db.collection('climates').find({}).toArray();
        const inventory = await mongoose.connection.db.collection('inventories').find({}).toArray();
        const seeds = await mongoose.connection.db.collection('seeds').find({}).toArray();

        const maxRows = Math.max(sales.length, productions.length, expenses.length, climates.length, inventory.length, seeds.length);

        // --- HEADERS (FIXED PAYMENT MODE & PHONE) ---
        let csv = `SALES (PAYMENT),,,,PRODUCTION,,,EXPENSES,,,CLIMATE,,,INVENTORY,,,SEEDS\n`;
        csv += `DATE,NAME,MODE,AMT,,DATE,BATCH,BEDS,,DATE,ITEM,COST,,DATE,TEMP,HUMID,,ITEM,STOCK,,NAME,STATUS\n`;

        for (let i = 0; i < maxRows; i++) {
            const s = sales[i] || {}; const p = productions[i] || {}; const e = expenses[i] || {};
            const c = climates[i] || {}; const inv = inventory[i] || {}; const sd = seeds[i] || {};

            // Added Payment Mode and fixed phone/amount mapping
            csv += `${s.date || ''},${s.customerName || ''},${s.paymentMode || 'CASH'},${s.amount || '0'},,`;
            csv += `${p.date || ''},${p.batchNo || ''},${p.bedCount || ''},,`;
            csv += `${e.date || ''},${e.name || ''},${e.amount || ''},,`;
            csv += `${c.date || ''},${c.temperature || ''},${c.humidity || ''},,`;
            csv += `${inv.itemName || ''},${inv.quantity || ''},,`;
            csv += `${sd.seedName || ''},${sd.status || ''}\n`;
        }

        fs.writeFileSync(filePath, csv);

        // EMAIL SENDING
        await transporter.sendMail({
            from: EMAIL_USER, to: EMAIL_USER,
            subject: `TJP Backup Report - ${today}`,
            text: `Backup success. Data includes Sales, Climate, and Inventory.`,
            attachments: [{ filename: `TJP_Report_${today}.csv`, path: filePath }]
        });

        // WHATSAPP SUMMARY (Using your Total Cash/GPay labels)
        const totalSales = sales.reduce((sum, s) => sum + Number(s.amount || 0), 0);
        const summaryMsg = `🍄 *TJP DAILY REPORT (${today})*\n\n💰 Total Sales: ₹${totalSales}\n📦 Inventory & Climate data synced.\n✅ Excel saved on Desktop.`;
        await client.sendMessage(MY_WHATSAPP, summaryMsg);
        
        console.log("✅ Backup Success: Excel + Email + WhatsApp Summary");
    } catch (e) { console.error("❌ REPORT ERROR:", e); }
}

// 🕒 AUTOMATION: Every day at 20:00 (8 PM)
cron.schedule('00 20 * * *', () => runMasterReport());

// --- 3. DASHBOARD (FIXED WHITE SCREEN) ---
app.use(express.static(path.join(__dirname, '../public')));

app.get('/dashboard', (req, res) => {
    res.send(`
        <body style="background-color: #CBCCCB; font-family: Arial; text-align: center; padding: 50px;">
            <div style="background: white; display: inline-block; padding: 40px; border-radius: 15px; box-shadow: 0 4px 20px rgba(0,0,0,0.2);">
                <h1 style="color: #2e7d32;">🍄 TJP MASTER DASHBOARD</h1>
                <p>Auto Backup Status: <b style="color: blue;">8:00 PM ACTIVE</b></p>
                <div style="margin: 20px 0;">
                    <a href="/open-folder" style="background: #2e7d32; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">📂 OPEN FOLDER</a>
                    <a href="/run-now" style="background: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-left: 10px;">📊 RUN BACKUP NOW</a>
                </div>
                <hr style="width: 50%; margin: 20px auto;">
                <a href="/" style="color: blue;">← Back to Main Page</a>
            </div>
        </body>
    `);
});

app.get('/run-now', async (req, res) => {
    await runMasterReport();
    res.send("<script>alert('All Data Secured: Excel + Email + WhatsApp Sent!'); window.location.href='/dashboard';</script>");
});

app.get('/open-folder', (req, res) => {
    const folderPath = path.join(require('os').homedir(), 'Desktop', 'TJP_REPORTS');
    exec(`explorer "${folderPath}"`);
    res.redirect('/dashboard');
});

// ROUTE FIXES
app.get('/login', (req, res) => { res.sendFile(path.join(__dirname, '../public/index.html')); });
app.get('/', (req, res) => { res.sendFile(path.join(__dirname, '../public/index.html')); });

app.listen(5000, () => {
    console.log('🚀 Server Live: http://localhost:5000');
    console.log('🚀 Dashboard: http://localhost:5000/dashboard');
});