const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const dns = require('dns');

// Fix for Node 18+ SRV lookup issues
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const XLSX = require('xlsx-js-style');
const fs = require('fs');

console.log('🔥 Environment status:');
console.log(' - MONGODB_URI:', process.env.MONGODB_URI ? 'Set (Hidden)' : '❌ NOT SET');
console.log(' - JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : '⚠️ Using Default');
console.log(' - ADMIN_PHONE:', process.env.ADMIN_PHONE ? 'Set' : '⚠️ Using Defaults');

const Booking = require('./models/Booking');
const Admin = require('./models/Admin');
const Order = require('./models/Order');
const Inventory = require('./models/Inventory');
const Customer = require('./models/Customer');
const Sales = require('./models/Sales');
const Expenditure = require('./models/Expenditure');
const Alert = require('./models/Alert');
const Batch = require('./models/Batch');
const Climate = require('./models/Climate');
const Contact = require('./models/Contact');
const WaterLog = require('./models/WaterLog');
const OTP = require('./models/OTP');
const Settings = mongoose.model('Settings', new mongoose.Schema({ key: String, value: mongoose.Schema.Types.Mixed }));

// --- NOTIFICATION HISTORY TRACKING ---
const notificationLogSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    type: { type: String, enum: ['WhatsApp', 'VoiceCall', 'Email'] },
    recipient: String,
    title: String,
    message: String,
    status: { type: String, default: 'Sent' },
    error: String
});
const NotificationLog = mongoose.model('NotificationLog', notificationLogSchema);

const { sendDigitalBill, sendLoyaltyNotification, sendMessage, sendImage, getLatestQr, isClientReady, ADMIN_1, ADMIN_2 } = require('./services/whatsappService');
const { sendVoiceCall } = require('./services/voiceService');
const { sendMonthlyReport, sendDailyReport } = require('./services/reportService');
const { sendSMSOtp } = require('./services/smsService');
const cron = require('node-cron');

// --- 🔄 POCKET SYNC FUNCTION (Limit 10) ---
const syncSaleToLoyalty = async (customerPhone, pocketsSold, customerName) => {
    try {
        let customer = await Customer.findOne({ contactNumber: customerPhone });
        if (!customer) {
            customer = new Customer({ name: customerName, contactNumber: customerPhone });
        }

        // 🌌 ANTI-GRAVITY ENGINE v5.0
        // Logic: 10 pockets = 1 Free. Balance starts again (Carry-forward).
        let total = (Number(customer.cycleCount) || 0) + pocketsSold;
        let freePocketsEarned = 0;

        while (total >= 10) {
            customer.freePocketsClaimed = (Number(customer.freePocketsClaimed) || 0) + 1;
            total -= 10; // 10 minus aagi balance thirumba start aagum
            freePocketsEarned += 1;
        }

        customer.cycleCount = total; // PARTHASARATHI: 11-10 = 1 (Cycle starts at 1)
        customer.totalLifetime = (Number(customer.totalLifetime) || 0) + pocketsSold;

        await customer.save();
        console.log(`✅ Anti-gravity Sync: ${customerPhone} -> Balance: ${customer.cycleCount}/10 (New Rewards: ${freePocketsEarned})`);

        return {
            customer,
            freePocketsEarned,
            currentCycle: customer.cycleCount,
            totalLifetime: customer.totalLifetime,
            reachedCycle: freePocketsEarned > 0
        };
    } catch (error) {
        console.error("Γ¥î Anti-gravity Error:", error);
        return null;
    }
};

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'tjp_secret_key_2026';

// --- AUTH MIDDLEWARE (Basic) ---
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) throw new Error('No token provided');
        const decoded = jwt.verify(token, JWT_SECRET);
        const admin = await Admin.findOne({ _id: decoded.id });
        if (!admin) throw new Error('Admin not found');
        req.admin = admin;
        req.decoded = decoded; // Store decoded info for OTP check
        next();
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate.' });
    }
};

// --- STRICT AUTH MIDDLEWARE (Requires OTP Verification) ---
const strictAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) throw new Error('No token provided');
        const decoded = jwt.verify(token, JWT_SECRET);

        // Strict check: token must contain otpVerified: true
        if (!decoded.otpVerified) {
            return res.status(403).json({
                error: 'Security verification required',
                message: 'Please complete the WhatsApp OTP verification to access this data.'
            });
        }

        const admin = await Admin.findOne({ _id: decoded.id });
        if (!admin) throw new Error('Admin not found');

        req.admin = admin;
        next();
    } catch (e) {
        res.status(401).send({ error: 'Authentication failed' });
    }
};

// --- SIMPLE RATE LIMITER (In-Memory) ---
const contactAttempts = new Map();
const contactRateLimit = (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const now = Date.now();
    const timeframe = 15 * 60 * 1000; // 15 minutes
    const maxRequests = 3;

    if (!contactAttempts.has(ip)) {
        contactAttempts.set(ip, []);
    }

    const attempts = contactAttempts.get(ip).filter(timestamp => (now - timestamp) < timeframe);
    attempts.push(now);
    contactAttempts.set(ip, attempts);

    if (attempts.length > maxRequests) {
        return res.status(429).json({ message: 'Too many messages. Please try again after 15 minutes.' });
    }
    next();
};

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
});
app.use('/public', express.static('public'));

// --- SETTINGS (Water Check & Others) ---
app.post('/api/settings/water-check', auth, async (req, res) => {
    try {
        const now = new Date();
        await Settings.findOneAndUpdate(
            { key: 'lastWaterCheck' },
            { value: now },
            { upsert: true, new: true }
        );
        res.json({ message: 'Water check recorded', date: now });
    } catch (error) {
        res.status(500).json({ message: 'Failed to record water check' });
    }
});

app.get('/api/settings/water-check', auth, async (req, res) => {
    try {
        const setting = await Settings.findOne({ key: 'lastWaterCheck' });
        res.json({ lastCheck: setting ? setting.value : null });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch settings' });
    }
});

app.post('/api/settings/soaking', auth, async (req, res) => {
    try {
        const { startTime } = req.body;
        await Settings.findOneAndUpdate(
            { key: 'soakingStartTime' },
            { value: startTime },
            { upsert: true, new: true }
        );
        res.json({ message: 'Soaking start time saved', startTime });
    } catch (error) {
        res.status(500).json({ message: 'Failed to save soaking time' });
    }
});

app.get('/api/settings/soaking', auth, async (req, res) => {
    try {
        const setting = await Settings.findOne({ key: 'soakingStartTime' });
        res.json({ startTime: setting ? setting.value : null });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch soaking time' });
    }
});


// --- WATER SYSTEM ENDPOINTS ---
app.get('/api/water/status', auth, async (req, res) => {
    try {
        const capacity = 5000;
        const levelSetting = await Settings.findOne({ key: 'currentWaterLevel' });
        const lastCheck = await Settings.findOne({ key: 'lastWaterCheck' });

        const currentLevel = levelSetting ? Number(levelSetting.value) : capacity;
        const percentage = (currentLevel / capacity) * 100;

        res.json({
            currentLevel,
            capacity,
            percentage: Math.round(percentage),
            lastCheck: lastCheck ? lastCheck.value : null,
            isLow: percentage < 20
        });
    } catch (err) {
        res.status(500).json({ message: 'Water status failed' });
    }
});

app.post('/api/water/refill', auth, async (req, res) => {
    try {
        const capacity = 5000;
        await Settings.findOneAndUpdate({ key: 'currentWaterLevel' }, { value: capacity }, { upsert: true });
        await Settings.findOneAndUpdate({ key: 'lastRefillDate' }, { value: new Date() }, { upsert: true });

        // Log refill
        const log = new WaterLog({
            type: 'refill',
            liters: capacity,
            remainingLevel: capacity,
            percentage: 100,
            notes: 'Manual Tank Refill to 5000L'
        });
        await log.save();

        // Notify admin about water refill
        const adminPhones = (process.env.ADMIN_PHONE || '9500591897,9159659711').split(',');
        const msg = `≡ƒÆº *TJP WATER UPDATE*\n\nTank Refilled to *5000L* (100%)\nStatus: Full Γ£à`;
        for (const p of adminPhones) await sendMessage(p.trim(), msg, 'admin');

        res.json({ message: 'Tank Refilled to 5000L', currentLevel: capacity });
    } catch (err) {
        res.status(500).json({ message: 'Refill failed' });
    }
});

app.get('/api/water/logs', auth, async (req, res) => {
    try {
        const logs = await WaterLog.find().sort({ date: -1 }).limit(100);
        res.json(logs);
    } catch (err) {
        res.status(500).json({ message: 'Fetch logs failed' });
    }
});

app.post('/api/water/spray', auth, async (req, res) => {
    try {
        const capacity = 5000;
        const sprayUsage = 20;

        let levelSetting = await Settings.findOne({ key: 'currentWaterLevel' });
        let currentLevel = levelSetting ? Number(levelSetting.value) : capacity;

        currentLevel = Math.max(0, currentLevel - sprayUsage);

        await Settings.findOneAndUpdate(
            { key: 'currentWaterLevel' },
            { value: currentLevel },
            { upsert: true }
        );

        // Log the manual spray
        const log = new WaterLog({
            type: 'usage',
            liters: sprayUsage,
            remainingLevel: currentLevel,
            percentage: Math.round((currentLevel / capacity) * 100),
            notes: 'Manual Spray Trigger'
        });
        await log.save();

        // Notify admin about water spray update
        const adminPhones = (process.env.ADMIN_PHONE || '9500591897,9159659711').split(',');
        const msg = `≡ƒÆº *TJP WATER UPDATE*\n\nManual Spray Triggered ≡ƒÜ┐\nRemaining Level: *${currentLevel}L* (${Math.round((currentLevel / capacity) * 100)}%)`;
        for (const p of adminPhones) await sendMessage(p.trim(), msg, 'admin');

        res.json({ message: 'Manual spray triggered', currentLevel, percentage: Math.round((currentLevel / capacity) * 100) });
    } catch (err) {
        res.status(500).json({ message: 'Spray failed' });
    }
});



// --- CLIMATE TRACKING ---
// Duplicate removed. Unified with endpoint at line 426.

// --- AUTH & ADMIN ---


// ... (other routes)

// --- SEND DIGITAL BILL (SERVER-SIDE) ---
app.post('/api/send-digital-bill', async (req, res) => {
    try {
        const { image, contactNumber, customerName } = req.body;

        if (!image || !contactNumber) {
            return res.status(400).json({ success: false, message: 'Missing image or contact' });
        }

        const caption = `Γ£à *TJP DIGITAL BILL*\nα«╡α«úα«òα»ìα«òα««α»ì ${customerName}! ≡ƒæï\n\n(Generated Automatically ≡ƒñû)\n\n"α«çα«»α«▒α»ìα«òα»êα«»α»ïα«ƒα»ü α«çα«úα»êα«¿α»ìα«ñ α«Üα»üα«╡α»ê!" ≡ƒìä`;

        const result = await sendImage(contactNumber, image, caption, 'business');

        if (result.success) {
            res.json({ success: true, message: 'Bill Sent Successfully' });
        } else {
            res.status(500).json({ success: false, message: result.error || 'Failed to send' });
        }
    } catch (error) {
        console.error("Bill Send API Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});
app.get('/api/admin/whatsapp-status', async (req, res) => {
    try {
        if (isClientReady()) {
            return res.json({ status: 'connected', message: 'WhatsApp is active' });
        }

        const qr = getLatestQr();
        if (qr) {
            return res.json({ status: 'scan_needed', qrCode: qr });
        }

        res.json({ status: 'initializing', message: 'Please wait for QR generation...' });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

app.post('/api/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const admin = await Admin.findOne({ username });
        if (!admin || !(await admin.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Return basic token - OTP verification NOT YET done
        const token = jwt.sign({ id: admin._id, otpVerified: false }, JWT_SECRET, { expiresIn: '1h' });
        res.json({
            success: true,
            requireOtp: true,
            token,
            username: admin.username,
            phoneNumber: admin.phoneNumber,
            message: 'Credentials valid. OTP required.'
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/admin/request-otp', async (req, res) => {
    try {
        const { phoneNumber } = req.body;
        // Standardize to 10 digits
        const cleanPhone = phoneNumber?.toString().trim().replace(/\D/g, '').slice(-10);
        const fullPhone = `+91 ${cleanPhone}`;

        console.log(`≡ƒöæ OTP Requested for: ${fullPhone}`);

        const ADMIN_NUMBERS = ['9500591897', '9159659711'];

        // Verify if this is a master admin number OR is in DB
        const isMasterAdmin = ADMIN_NUMBERS.includes(cleanPhone);
        const adminInDB = await Admin.findOne({ phoneNumber: new RegExp(cleanPhone, 'i') });

        if (!isMasterAdmin && !adminInDB) {
            console.warn(`≡ƒ¢æ Unauthorized OTP attempt from: ${phoneNumber}`);
            return res.status(401).json({ success: false, message: 'Unauthorized Admin Phone' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        console.log(`≡ƒöæ DEBUG: OTP for ${fullPhone} is: ${otp}`);

        await OTP.findOneAndUpdate(
            { phoneNumber: cleanPhone },
            { otp, createdAt: new Date() },
            { upsert: true }
        );

        // --- 1. SEND DUAL WHATSAPP OTP ---
        const msg = `≡ƒöÉ *TJP ADMIN ACCESS*\n\nYour OTP for login is: *${otp}*\n\n(Valid for 10 minutes) ΓÅ│\n\nRequested from: ${fullPhone}`;

        console.log(`≡ƒôñ Sending Dual WhatsApp OTP...`);
        const waResults = await Promise.allSettled([
            sendMessage(ADMIN_1, msg),
            sendMessage(ADMIN_2, msg)
        ]);

        const anySent = waResults.some(r => r.status === 'fulfilled' && r.value.success);

        if (anySent) {
            // Log to Notification History
            await NotificationLog.create({
                type: 'WhatsApp',
                recipient: `${ADMIN_1}, ${ADMIN_2}`,
                title: 'Admin OTP Login',
                message: `OTP: ${otp} sent to ${ADMIN_1} & ${ADMIN_2}`,
                status: 'Sent'
            });

            res.json({ success: true, message: 'OTP sent to Admin WhatsApp numbers' });
        } else {
            res.status(503).json({ success: false, message: 'WhatsApp OTP delivery failed. Please check server WhatsApp connection.' });
        }
    } catch (error) {
        console.error('≡ƒöÑ OTP Request Server Error:', error);
        res.status(500).json({ message: 'Internal Server Error: ' + error.message });
    }
});

app.post('/api/admin/verify-otp', async (req, res) => {
    try {
        const { phoneNumber, otp } = req.body;
        const cleanPhone = phoneNumber?.toString().trim().replace(/\D/g, '').slice(-10);

        const otpRecord = await OTP.findOne({ phoneNumber: cleanPhone, otp });

        if (!otpRecord) {
            return res.status(401).json({ success: false, message: 'Invalid or expired OTP' });
        }

        let admin = await Admin.findOne({ phoneNumber: new RegExp(cleanPhone, 'i') });
        if (!admin) {
            // Fallback to primary admin account
            admin = await Admin.findOne({ username: 'admin' });
        }

        // --- SHORT-TERM SESSION (24 HOURS) ---
        const token = jwt.sign(
            { id: admin._id, otpVerified: true },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Delete OTP after successful verification
        await OTP.deleteOne({ _id: otpRecord._id });

        res.json({ success: true, token, username: admin.username, message: 'OTP Verified. Session active for 24 hours.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// --- BOOKINGS ---
app.post('/api/bookings', async (req, res) => {
    try {
        const newBooking = new Booking(req.body);
        await newBooking.save();
        res.status(201).json(newBooking);
    } catch (error) {
        res.status(500).json({ message: 'Booking failed' });
    }
});

app.get('/api/bookings', auth, async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Fetch bookings failed' });
    }
});

app.patch('/api/bookings/:id/status', auth, async (req, res) => {
    try {
        const { status } = req.body;
        const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true });
        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Status update failed' });
    }
});

// 1. 🌌 TJP ANTI-GRAVITY ULTIMATE FIX
app.post('/api/sales', auth, async (req, res) => {
    try {
        const { customerName, quantity, contactNumber, productType, pricePerUnit } = req.body;

        // Save the Sale First (Required for Dashboard tables)
        const saleData = {
            ...req.body,
            orderId: `TJP-${Date.now()}`,
            totalAmount: (Number(quantity) || 0) * (Number(pricePerUnit) || 0),
            paymentStatus: (req.body.paymentType === 'Credit') ? 'Unpaid' : 'Paid',
            unit: req.body.unit || (productType === 'Mushroom' ? 'pockets' : 'kg'),
            date: req.body.date || Date.now()
        };
        const newSale = new Sales(saleData);
        await newSale.save();

        let user = await Customer.findOne({ contactNumber: contactNumber });
        let loyaltyUpdate = null;

        if (user && productType === 'Mushroom') {
            const pocketsBought = parseInt(quantity) || 0;

            // 🛠️ THE ACTUAL LOGIC: 11 bought -> 10 + 1
            let totalTemp = user.cycleCount + pocketsBought;
            let freeEarnedCount = 0;

            while (totalTemp >= 10) {
                freeEarnedCount += 1;
                totalTemp -= 10; // 11 vaanguna 10-ai "spend" panni 1 free koduthuttu balance 1-ai veikkum
            }

            user.cycleCount = totalTemp;
            user.freePocketsClaimed += freeEarnedCount;
            await user.save();

            loyaltyUpdate = {
                currentCycle: user.cycleCount,
                freePocketsEarned: freeEarnedCount,
                totalAvailable: user.freePocketsClaimed,
                reachedCycle: freeEarnedCount > 0
            };
        }

        // Bill message-la "Balance: 1/10" nu kaatta logic
        const finalBalance = user ? user.cycleCount : 0;
        const totalPurchasedSoFar = user ? (user.totalLifetime || (user.cycleCount + (user.freePocketsClaimed * 10))) : 0;

        const billMsg = `🍄 *TJP BILL*
--------------------------
👤 Customer: ${customerName}
🔢 Qty: ${quantity} Pockets
💵 Total: *₹${saleData.totalAmount}*
--------------------------
🎁 *LOYALTY UPDATE*
TOTAL PURCHASED: ${totalPurchasedSoFar} Pockets 🍄
CURRENT CYCLE: ${finalBalance}/10
${loyaltyUpdate && loyaltyUpdate.freePocketsEarned > 0 ? `வாழ்த்துக்கள்! நீங்கள் ${loyaltyUpdate.freePocketsEarned} Free Pocket வென்றுள்ளீர்கள்! ✨` : ''}`;

        if (contactNumber) {
            sendMessage(contactNumber, billMsg);
        }

        res.status(201).json({ success: true, sale: newSale, loyaltyUpdate, message: billMsg });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Logic failed" });
    }
});

// 2. 🗑️ THE "WIPE EVERYTHING" RESET ROUTE
// Idhu dhaan andha "6 AVAILABLE" data-vai delete pannum
app.post('/api/loyalty/reset', auth, async (req, res) => {
    const { customerId } = req.body;
    try {
        await Customer.findByIdAndUpdate(customerId, {
            cycleCount: 0,
            freePocketsClaimed: 0
        });
        res.status(200).json({ success: true, message: "Data Wiped Clean!" });
    } catch (err) {
        res.status(500).json({ error: "Reset Failed" });
    }
});

/// 🎁 REWARD CLAIM API: Syncs redeemed count with earned count to reset available rewards to 0
app.post('/api/loyalty/claim-reward', auth, async (req, res) => {
    const { contactNumber } = req.body;
    try {
        let user = await Customer.findOne({ contactNumber });
        if (user) {
            const available = (user.freePocketsClaimed || 0) - (user.rewardsRedeemed || 0);
            if (available > 0) {
                // Wipe the available balance by setting redeemed = claimed (History preserved)
                // OR as per user requested: "setting freePocketsClaimed to 0"
                // To keep math clean, we set both to 0 if they want a hard reset of ready pockets
                user.freePocketsClaimed = 0;
                user.rewardsRedeemed = 0;
                await user.save();
                res.status(200).json({ success: true, message: "Reward Claimed! Ready pockets reset to 0.", available: 0 });
            } else {
                res.status(400).json({ error: "No rewards to claim" });
            }
        } else {
            res.status(404).json({ error: "Customer not found" });
        }
    } catch (err) {
        console.error("Claim Error:", err);
        res.status(500).json({ error: "Claim function failed" });
    }
});
// --- GOOGLE DRIVE / WHATSAPP BILL UPLOAD ---
app.post('/api/send-bill', auth, async (req, res) => {
    try {
        const { image, customerName, contactNumber } = req.body;
        if (!image || !contactNumber) {
            return res.status(400).json({ message: 'Missing Image or Phone Number' });
        }

        // 1. Save Image Locally
        const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
        const fileName = `bill_${Date.now()}.png`;
        const uploadDir = path.join(__dirname, 'public', 'uploads');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        const filePath = path.join(uploadDir, fileName);

        fs.writeFileSync(filePath, base64Data, 'base64');

        // 2. Send via WhatsApp
        const caption = `🍄 *TJP DIGITAL BILL*\n\nவணக்கம் ${customerName}! 👋\nஉங்கள் காளான் பில் இங்கே இணைக்கப்பட்டுள்ளது.\n\n"இயற்கையோடு இணைந்த சுவை!" 🌱\n📍 Location: TJP Farm`;
        const result = await sendImage(contactNumber, image, caption, 'business');

        const baseUrl = process.env.PUBLIC_URL || `${req.protocol}://${req.get('host')}`;
        const imageUrl = `${baseUrl}/public/uploads/${fileName}`;

        res.json({
            success: true,
            message: result.success ? 'Bill sent successfully!' : 'Bill saved but WhatsApp link issue',
            imageUrl,
            waResult: result
        });
    } catch (error) {
        console.error('Bill Process Error:', error);
        res.status(500).json({ message: 'Server error processing bill' });
    }
});

// --- GENERIC WHATSAPP MESSAGE (Text Only) ---
app.post('/api/send-message', auth, async (req, res) => {
    try {
        const { contactNumber, message } = req.body;
        if (!contactNumber || !message) {
            return res.status(400).json({ message: 'Missing Data' });
        }
        const result = await sendMessage(contactNumber, message, 'business');
        res.json({ success: result.success, message: 'Message queued' });
    } catch (error) {
        res.status(500).json({ message: 'Message sending failed' });
    }
});

// Customer search for auto-fill
app.get('/api/customers/search', auth, async (req, res) => {
    try {
        const { name } = req.query;
        const customers = await Customer.find({ name: new RegExp(name, 'i') }).limit(5);
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: 'Search failed' });
    }
});

// --- KADAN/CREDIT SETTLEMENT - SECURE ---
app.patch('/api/sales/:id/settle', strictAuth, async (req, res) => {
    try {
        const { settledBy } = req.body; // 'Cash' or 'GPay'
        const sale = await Sales.findById(req.params.id);

        if (!sale) {
            return res.status(404).json({ message: 'Sale not found' });
        }

        // --- DATABASE SYNC & TRIGGER LOGIC ---
        // One Source of Truth: Update initial 'Credit' to the final payment mode
        sale.paymentStatus = 'Paid';
        sale.paymentType = settledBy; // The "The Trigger" logic: Auto-update Sales table
        sale.settledDate = new Date();
        sale.settledBy = settledBy;

        // Force Mongoose to register the change
        sale.markModified('paymentStatus');
        sale.markModified('paymentType');

        await sale.save();

        res.json({
            success: true,
            message: `Kadan settled via ${settledBy}. Sales record ${sale.orderId} updated! ✅`,
            sale
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Settlement failed' });
    }
});

// --- GET KADAN LIST (Unpaid Sales) - SECURE ---
app.get('/api/sales/kadan', strictAuth, async (req, res) => {
    try {
        const kadanList = await Sales.find({ paymentStatus: 'Unpaid' }).sort({ date: -1 });
        res.json(kadanList);
    } catch (error) {
        res.status(500).json({ message: 'Fetch kadan failed' });
    }
});

// Loyalty Reset (Free Pocket Given)
app.post('/api/customers/:id/reset-loyalty', auth, async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) return res.status(404).json({ message: 'Customer not found' });

        // Increment redeemed count
        customer.rewardsRedeemed = (Number(customer.rewardsRedeemed) || 0) + 1;
        await customer.save();

        res.json({ message: 'Reward marked as redeemed', customer });
    } catch (error) {
        res.status(500).json({ message: 'Redeem failed' });
    }
});

// --- CLIMATE TRACKING ---
app.post('/api/climate', auth, async (req, res) => {
    try {
        const { temperature, humidity, co2, notes } = req.body;
        const newEntry = new Climate(req.body);

        // --- AUTOMATION ALERTS ---
        if (temperature > 32) {
            const adminPhones = (process.env.ADMIN_PHONE || '9500591897,9159659711').split(',');
            const msg = `≡ƒ¢æ *HIGH TEMP ALERT*\n\nTemp: ${temperature}┬░C\nNotes: ${notes || 'No data'}\n\nPlease check the farm!`;
            for (const p of adminPhones) await sendMessage(p.trim(), msg, 'admin');
        }

        await newEntry.save();
        res.status(201).json(newEntry);
    } catch (error) {
        console.error("Climate Save Error:", error);
        res.status(500).json({ message: 'Climate entry failed' });
    }
});

app.get('/api/climate', auth, async (req, res) => {
    try {
        const data = await Climate.find().sort({ date: -1 }).limit(30);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Fetch failed' });
    }
});

// Generic Edit/Delete for Models
app.patch('/api/edit/:model/:id', auth, async (req, res) => {
    try {
        const { model, id } = req.params;
        let Model;
        if (model === 'sales') Model = Sales;
        else if (model === 'expenditure') Model = Expenditure;
        else if (model === 'inventory') Model = Inventory;
        else if (model === 'climate') Model = Climate;
        else if (model === 'alerts') Model = Alert;
        else if (model === 'batches') Model = Batch;
        else return res.status(400).json({ message: 'Invalid model' });

        const updated = await Model.findByIdAndUpdate(id, req.body, { new: true });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Update failed' });
    }
});

app.delete('/api/delete/:model/:id', auth, async (req, res) => {
    try {
        const { model, id } = req.params;
        let Model;
        if (model === 'sales') Model = Sales;
        else if (model === 'expenditure') Model = Expenditure;
        else if (model === 'climate') Model = Climate;
        else if (model === 'alerts') Model = Alert;
        else if (model === 'batches') Model = Batch;
        else return res.status(400).json({ message: 'Invalid model' });

        await Model.findByIdAndDelete(id);
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Delete failed' });
    }
});

// --- PUBLIC CONTACT FORM (Secured with Honeypot, Encryption & Rate Limit) ---
app.post('/api/contact', contactRateLimit, async (req, res) => {
    try {
        const { payload } = req.body;
        if (!payload) return res.status(400).json({ message: 'No payload' });

        // Decrypt
        const CryptoJS = require('crypto-js');
        const secretKey = 'tjp_encryption_key_2026';
        let decryptedData;

        try {
            const bytes = CryptoJS.AES.decrypt(payload, secretKey);
            decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        } catch (e) {
            return res.status(400).json({ message: 'Security verification failed. Invalid payload.' });
        }

        // Honeypot check
        if (decryptedData.website) {
            console.log('≡ƒñû Bot detected via Honeypot field');
            return res.status(200).json({ message: 'Message sent successfully!' }); // Fake success for bots
        }

        const newMessage = new Contact(decryptedData);
        await newMessage.save();
        res.status(201).json({ message: 'Message sent successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to send message' });
    }
});

// --- GET ALL SALES - SECURE ---
app.get('/api/sales', strictAuth, async (req, res) => {
    try {
        const { startDate, endDate, productType } = req.query;
        let query = {};

        if (startDate && endDate) {
            query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }
        if (productType) {
            query.productType = productType;
        }

        const sales = await Sales.find(query).sort({ date: -1 });
        const totalSales = sales.reduce((sum, s) => sum + s.totalAmount, 0);

        res.json({ sales, totalSales });
    } catch (error) {
        res.status(500).json({ message: 'Fetch sales failed' });
    }
});

// --- EXPENDITURE (Selavu) ---
app.post('/api/expenditure', auth, async (req, res) => {
    try {
        const { category, description, quantity, unit, amount, addToInventory } = req.body;

        const newExpenditure = new Expenditure({
            category,
            description,
            quantity,
            unit,
            amount,
            addToInventory
        });
        await newExpenditure.save();

        // If Seeds purchase and addToInventory is true, add to inventory
        if (category === 'Seeds' && addToInventory && quantity > 0) {
            let seedsInventory = await Inventory.findOne({ itemName: 'Seeds' });
            if (!seedsInventory) {
                seedsInventory = new Inventory({
                    itemName: 'Seeds',
                    startingStock: 0,
                    currentStock: 0,
                    unit: 'kg'
                });
            }
            seedsInventory.currentStock += quantity;
            seedsInventory.usageHistory.push({
                quantity,
                type: 'add',
                notes: `Purchased: ${description || 'Seeds purchase'}`
            });
            seedsInventory.lastUpdated = Date.now();
            await seedsInventory.save();
        }

        res.status(201).json({
            message: 'Expenditure recorded',
            expenditure: newExpenditure
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Expenditure recording failed' });
    }
});

app.get('/api/expenditure', auth, async (req, res) => {
    try {
        const { startDate, endDate, category } = req.query;
        let query = {};

        if (startDate && endDate) {
            query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }
        if (category) {
            query.category = category;
        }

        const expenditures = await Expenditure.find(query).sort({ date: -1 });
        const totalExpenditure = expenditures.reduce((sum, e) => sum + e.amount, 0);

        res.json({ expenditures, totalExpenditure });
    } catch (error) {
        res.status(500).json({ message: 'Fetch expenditure failed' });
    }
});

// 🛠️ INVENTORY EDIT API
app.put('/api/inventory/:id', auth, async (req, res) => {
    try {
        const { itemName, startingStock, currentStock, unit } = req.body;
        const updatedProduct = await Inventory.findByIdAndUpdate(
            req.params.id,
            { itemName, startingStock, currentStock, unit },
            { new: true }
        );
        res.status(200).json({ success: true, product: updatedProduct });
    } catch (err) {
        res.status(500).json({ error: "Update Failed" });
    }
});

// --- SMART INVENTORY ---
app.get('/api/inventory', auth, async (req, res) => {
    try {
        const items = await Inventory.find();
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Fetch inventory failed' });
    }
});

app.post('/api/inventory', auth, async (req, res) => {
    try {
        const { itemName, startingStock, unit } = req.body;
        const newItem = new Inventory({
            itemName,
            startingStock,
            currentStock: startingStock,
            unit: unit || 'kg'
        });
        await newItem.save();
        res.status(201).json(newItem);
    } catch (error) {
        res.status(500).json({ message: 'Inventory creation failed' });
    }
});

app.patch('/api/inventory/:id/use', auth, async (req, res) => {
    try {
        const { quantity, notes } = req.body;
        const item = await Inventory.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        item.currentStock -= quantity;
        item.usageHistory.push({
            quantity,
            type: 'use',
            notes: notes || 'Daily usage'
        });
        item.lastUpdated = Date.now();
        await item.save();

        res.json({
            message: `Used ${quantity} ${item.unit} of ${item.itemName}`,
            item
        });
    } catch (error) {
        res.status(500).json({ message: 'Inventory update failed' });
    }
});

app.patch('/api/inventory/:id/add', auth, async (req, res) => {
    try {
        const { quantity, notes } = req.body;
        const item = await Inventory.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        item.currentStock += quantity;
        item.usageHistory.push({
            quantity,
            type: 'add',
            notes: notes || 'Stock added'
        });
        item.lastUpdated = Date.now();
        await item.save();

        res.json({
            message: `Added ${quantity} ${item.unit} to ${item.itemName}`,
            item
        });
    } catch (error) {
        res.status(500).json({ message: 'Inventory update failed' });
    }
});

app.patch('/api/inventory/:id/starting-stock', auth, async (req, res) => {
    try {
        const { startingStock } = req.body;
        const item = await Inventory.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        item.startingStock = startingStock;
        item.currentStock = startingStock;
        item.usageHistory = []; // Reset history when starting stock changes
        item.lastUpdated = Date.now();
        await item.save();

        res.json({
            message: `Starting stock set to ${startingStock} ${item.unit}`,
            item
        });
    } catch (error) {
        res.status(500).json({ message: 'Starting stock update failed' });
    }
});

// Delete Usage History Item
app.delete('/api/inventory/:id/usage/:usageId', auth, async (req, res) => {
    try {
        const item = await Inventory.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found' });

        const usageIndex = item.usageHistory.findIndex(h => h._id.toString() === req.params.usageId);
        if (usageIndex === -1) return res.status(404).json({ message: 'Usage record not found' });

        const usage = item.usageHistory[usageIndex];
        // Reverse stock change
        if (usage.type === 'use') item.currentStock += usage.quantity;
        else if (usage.type === 'add') item.currentStock -= usage.quantity;

        item.usageHistory.splice(usageIndex, 1);
        await item.save();
        res.json({ message: 'Usage record deleted and stock adjusted', item });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Delete failed' });
    }
});

// Update Usage History Item
app.patch('/api/inventory/:id/usage/:usageId', auth, async (req, res) => {
    try {
        const item = await Inventory.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found' });

        const usage = item.usageHistory.id(req.params.usageId);
        if (!usage) return res.status(404).json({ message: 'Usage record not found' });

        const { quantity, notes } = req.body;
        const newQty = Number(quantity);

        // Adjust stock based on OLD and NEW quantity
        if (usage.type === 'use') {
            item.currentStock += usage.quantity; // undo old
            item.currentStock -= newQty; // apply new
        } else if (usage.type === 'add') {
            item.currentStock -= usage.quantity; // undo old
            item.currentStock += newQty; // apply new
        }

        usage.quantity = newQty;
        usage.notes = notes;
        if (req.body.date) usage.date = new Date(req.body.date);

        await item.save();
        res.json({ message: 'Usage record updated and stock adjusted', item });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Update failed' });
    }
});

// 🛠️ MASTER INVENTORY UPDATE (User Request Style)
app.put('/api/inventory/usage/:usageId', auth, async (req, res) => {
    try {
        const { quantity, notes, date } = req.body;
        const item = await Inventory.findOne({ "usageHistory._id": req.params.usageId });
        if (!item) return res.status(404).json({ error: "Inventory Record Not Found" });

        const usage = item.usageHistory.id(req.params.usageId);
        const oldQty = usage.quantity;
        const newQty = Number(quantity);

        // Adjust master stock
        if (usage.type === 'use') {
            item.currentStock = item.currentStock + oldQty - newQty;
        } else {
            item.currentStock = item.currentStock - oldQty + newQty;
        }

        usage.quantity = newQty;
        usage.notes = notes;
        if (date) usage.date = new Date(date);

        await item.save();
        res.status(200).json({ success: true, item });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Inventory Save Failed" });
    }
});

// 🗑️ INVENTORY RESET: One-click Wipe
app.post('/api/inventory/reset-all', auth, async (req, res) => {
    try {
        await Inventory.deleteMany({}); // Wipes all categories/entries
        console.log("≡ƒÿ⌐ Inventory Hard Reset performed.");
        res.status(200).json({ success: true, message: "Inventory Reset Done!" });
    } catch (err) {
        res.status(500).json({ error: "Reset Failed" });
    }
});
// --- ROUTINE ALERTS ---
app.get('/api/alerts', auth, async (req, res) => {
    try {
        const alerts = await Alert.find({ isActive: true }).sort({ scheduledTime: 1 });
        res.json(alerts);
    } catch (error) {
        res.status(500).json({ message: 'Fetch alerts failed' });
    }
});

app.post('/api/alerts', auth, async (req, res) => {
    try {
        const newAlert = new Alert(req.body);
        await newAlert.save();
        res.status(201).json(newAlert);
    } catch (error) {
        res.status(500).json({ message: 'Alert creation failed' });
    }
});

app.patch('/api/alerts/:id/toggle', auth, async (req, res) => {
    try {
        const alert = await Alert.findById(req.params.id);
        alert.isActive = !alert.isActive;
        await alert.save();
        res.json(alert);
    } catch (error) {
        res.status(500).json({ message: 'Alert toggle failed' });
    }
});

app.patch('/api/alerts/:id', auth, async (req, res) => {
    try {
        const updatedAlert = await Alert.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedAlert);
    } catch (error) {
        res.status(500).json({ message: 'Alert update failed' });
    }
});

app.delete('/api/alerts/:id', auth, async (req, res) => {
    try {
        await Alert.findByIdAndDelete(req.params.id);
        res.json({ message: 'Alert deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Alert deletion failed' });
    }
});

// --- LOYALTY (Customer Tracking) ---
app.get('/api/customers', auth, async (req, res) => {
    try {
        const customers = await Customer.find().sort({ totalLifetime: -1 });
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: 'Fetch customers failed' });
    }
});

app.post('/api/customers/:id/reset', auth, async (req, res) => {
    try {
        console.log(`📡 Reset Request for Customer ID: ${req.params.id}`);
        const customer = await Customer.findByIdAndUpdate(req.params.id, { cycleCount: 0 }, { new: true });
        if (customer) {
            console.log(`✅ Reset Success for: ${customer.name}`);
            res.json(customer);
        } else {
            res.status(404).json({ message: 'Customer not found' });
        }
    } catch (error) {
        console.error('❌ Reset Error:', error);
        res.status(500).json({ message: 'Reset failed' });
    }
});

// 2. 🗑️ THE "WIPE EVERYTHING" RESET ROUTE (Erases "4 Available" kind of errors)
app.post('/api/loyalty/reset', auth, async (req, res) => {
    const { customerId } = req.body;
    try {
        await Customer.findByIdAndUpdate(customerId, {
            cycleCount: 0,
            freePocketsClaimed: 0
        });
        res.json({ success: true, message: "Data Wiped Clean!" });
    } catch (error) {
        res.status(500).json({ message: 'Reset failed' });
    }
});

// 🌌 ANTI-GRAVITY MANUAL RESET LOGIC (User Request Version)
app.post('/api/reset-loyalty', auth, async (req, res) => {
    const { customerId } = req.body;
    try {
        console.log(`📡 Manual Reset Triggered for ID: ${customerId}`);
        const customer = await Customer.findById(customerId);
        if (customer) {
            customer.cycleCount = 0;
            await customer.save();
            console.log(`🔄 Manual Reset Success for: ${customer.name}`);
            res.status(200).json({ message: "Cycle Reset Success!", customer });
        } else {
            res.status(404).json({ message: "Customer not found" });
        }
    } catch (err) {
        console.error('❌ Reset-Loyalty Error:', err);
        res.status(500).json({ error: "Reset Failed!" });
    }
});

// --- FINANCE DASHBOARD STATS ---
app.get('/api/finance/summary', auth, async (req, res) => {
    try {
        const { month, year } = req.query;

        let dateQuery = {};
        if (month && year) {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0, 23, 59, 59);
            dateQuery = { $gte: startDate, $lte: endDate };
        }

        // Get sales for the period
        const salesQuery = month && year ? { date: dateQuery } : {};
        const sales = await Sales.find(salesQuery);
        const totalSales = sales.reduce((sum, s) => sum + s.totalAmount, 0);

        // Get expenditure for the period
        const expQuery = month && year ? { date: dateQuery } : {};
        const expenditures = await Expenditure.find(expQuery);
        const totalExpenditure = expenditures.reduce((sum, e) => sum + e.amount, 0);

        // Net Profit
        const netProfit = totalSales - totalExpenditure;

        // Category breakdown
        const categoryBreakdown = {};
        expenditures.forEach(e => {
            categoryBreakdown[e.category] = (categoryBreakdown[e.category] || 0) + e.amount;
        });

        res.json({
            totalSales,
            totalExpenditure,
            netProfit,
            salesCount: sales.length,
            categoryBreakdown,
            sales,
            expenditures
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Finance summary failed' });
    }
});

// --- MANUAL REPORT TRIGGER (For testing) ---
app.post('/api/admin/send-monthly-report', auth, async (req, res) => {
    try {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const sales = await Sales.find({ date: { $gte: startDate, $lte: endDate } });
        const expenditures = await Expenditure.find({ date: { $gte: startDate, $lte: endDate } });
        const inventory = await Inventory.find();
        const climate = await Climate.find({ date: { $gte: startDate, $lte: endDate } });
        const customers = await Customer.find();

        await sendMonthlyReport(sales, expenditures, inventory, climate, customers, month, year);
        res.json({ message: 'Monthly report generation triggered' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to trigger report' });
    }
});

app.get('/api/admin/reports-list', auth, async (req, res) => {
    try {
        const reportsDir = path.join(__dirname, 'public', 'reports');
        if (!fs.existsSync(reportsDir)) return res.json([]);

        const files = fs.readdirSync(reportsDir)
            .filter(file => file.endsWith('.xlsx'))
            .map(file => ({
                name: file,
                url: `/public/reports/${file}`,
                date: fs.statSync(path.join(reportsDir, file)).birthtime
            }))
            .sort((a, b) => b.date - a.date);

        res.json(files);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch reports list' });
    }
});

// --- SHOP & LOYALTY (Legacy Support) ---
app.post('/api/orders', async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        await newOrder.save();

        let customer = await Customer.findOne({ contactNumber: req.body.contactNumber });
        if (!customer) {
            customer = new Customer({
                name: req.body.customerName,
                contactNumber: req.body.contactNumber
            });
        }
        customer.totalOrders += 1;
        await customer.save();

        res.status(201).json(newOrder);
    } catch (error) {
        res.status(500).json({ message: 'Order failed' });
    }
});

app.get('/api/orders', auth, async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Fetch orders failed' });
    }
});

app.patch('/api/orders/:id/status', auth, async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Order update failed' });
    }
});

// --- MANUAL SALES & LOYALTY LOGIC (Legacy) ---
app.post('/api/sales/manual', auth, async (req, res) => {
    try {
        const { customerName, contactNumber, pricePerPocket, quantity } = req.body;
        const qty = Number(quantity) || 0;
        const price = Number(pricePerPocket) || 0;

        let loyaltyUpdate = null;
        if (price >= 50) {
            loyaltyUpdate = await syncSaleToLoyalty(contactNumber, qty, customerName);
        }

        // Also create a Sales record
        const newSale = new Sales({
            productType: 'Mushroom',
            quantity: qty,
            unit: 'pockets',
            pricePerUnit: price,
            totalAmount: qty * price,
            customerName,
            contactNumber,
            isLoyaltyCustomer: loyaltyUpdate ? true : false,
            date: Date.now()
        });
        await newSale.save();

        if (loyaltyUpdate && loyaltyUpdate.freePocketsEarned > 0) {
            const rewardMsg = `🎁 *LOYALTY REWARD!* 🎁\nவாழ்த்துக்கள் ${customerName}!\nYou have earned *${loyaltyUpdate.freePocketsEarned} FREE pocket(s)*! 🍄\n\nCurrent Balance: ${loyaltyUpdate.currentCycle}/10 towards next reward.`;
            sendLoyaltyNotification(contactNumber, rewardMsg);
        }

        res.json({
            message: 'Manual sale recorded',
            sale: newSale,
            loyaltyUpdate
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Manual sale failed' });
    }
});

app.post('/api/bills/send', auth, async (req, res) => {
    try {
        const { contactNumber, imageData, customerName } = req.body;
        const result = await sendDigitalBill(contactNumber, imageData, customerName);
        res.json({ message: 'Bill process triggered', result });
    } catch (error) {
        res.status(500).json({ message: 'Bill send failed' });
    }
});

// --- ANALYTICS - SECURE ---
app.get('/api/admin/stats', strictAuth, async (req, res) => {
    try {
        const orders = await Order.find({ status: 'Delivered' });
        const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
        const bookingCount = await Booking.countDocuments();
        const pendingOrders = await Order.countDocuments({ status: 'Pending' });

        // Add sales data
        const sales = await Sales.find();
        const totalSalesAmount = sales.reduce((sum, s) => sum + s.totalAmount, 0);

        // Add expenditure data
        const expenditures = await Expenditure.find();
        const totalExpenditure = expenditures.reduce((sum, e) => sum + e.amount, 0);

        // Calculate YTD Beds
        const currentYear = new Date().getFullYear();
        const startOfYear = new Date(currentYear, 0, 1);
        const ytdBeds = await Batch.countDocuments({
            bedDate: { $gte: startOfYear }
        });

        res.json({
            totalRevenue: totalRevenue + totalSalesAmount,
            bookingCount,
            pendingOrders,
            orderCount: orders.length,
            totalSales: totalSalesAmount,
            totalExpenditure,
            ytdBeds,
            netProfit: totalSalesAmount - totalExpenditure
        });
    } catch (error) {
        res.status(500).json({ message: 'Stats failed' });
    }
});

// --- EXCEL UTILITIES ---
const createSheetWithHeader = (json, sheetTitle, subtitleContext) => {
    const headerTitle = "TJP MUSHROOM FARMING";
    const subTitle = `REPORT - ${subtitleContext} - ${sheetTitle.toUpperCase()}`;

    // create upper case headers for data
    const rows = json.map(row => {
        const newRow = {};
        for (let key in row) {
            newRow[key.toUpperCase()] = row[key];
        }
        return newRow;
    });

    // Styles
    const titleStyle = { font: { bold: true, sz: 16 } };
    const subTitleStyle = { font: { bold: true, sz: 12 } };
    const headerStyle = { font: { bold: true }, fill: { fgColor: { rgb: "EEEEEE" } } };

    // Create initial sheet with Styled Cells
    const wsData = [
        [{ v: headerTitle, s: titleStyle }],
        [{ v: subTitle, s: subTitleStyle }],
        [] // spacer
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(wsData);

    // Append JSON data starting from A4 (headers will be at A4)
    XLSX.utils.sheet_add_json(worksheet, rows, { origin: "A4" });

    // Apply style to the Header Row (Row 4 which is index 3)
    const range = worksheet['!ref'] ? XLSX.utils.decode_range(worksheet['!ref']) : { s: { r: 0, c: 0 }, e: { r: 3, c: 0 } };
    for (let C = range.s.c; C <= range.e.c; ++C) {
        const address = XLSX.utils.encode_cell({ r: 3, c: C }); // Row 4
        if (!worksheet[address]) continue;
        worksheet[address].s = headerStyle;
    }

    // Adjust column widths (auto-width basic approx)
    const wscols = Object.keys(rows[0] || {}).map(() => ({ wch: 20 }));
    if (wscols.length > 0) worksheet['!cols'] = wscols;

    return worksheet;
};

// Initialize default alerts
// Initialize default alerts (STRICT: 4 Water Checks ONLY)
const initializeAlerts = async () => {
    try {
        await Alert.deleteMany({}); // Strictly wipe everything first
        await Alert.insertMany([
            { title: 'WATER CHECK', message: '1st Water Check', scheduledTime: '06:00', type: 'daily', icon: '💧' },
            { title: 'WATER CHECK', message: '2nd Water Check', scheduledTime: '12:00', type: 'daily', icon: '💧' },
            { title: 'WATER CHECK', message: '3rd Water Check', scheduledTime: '18:00', type: 'daily', icon: '💧' },
            { title: 'WATER CHECK', message: '4th Water Check', scheduledTime: '21:00', type: 'daily', icon: '💧' }
        ]);
        console.log('✅ STRICT: 4 Water Checks Initialized.');
    } catch (err) {
        console.error('Failed to initialize alerts:', err);
    }
};

// Initialize default inventory items
const initializeInventory = async () => {
    const invCount = await Inventory.countDocuments();
    if (invCount === 0) {
        await Inventory.insertMany([
            { itemName: 'Seeds', startingStock: 10, currentStock: 10, unit: 'kg' },
            { itemName: 'Vaikol Bags', startingStock: 50, currentStock: 50, unit: 'bags' },
            { itemName: 'Hanging Bags (Pockets)', startingStock: 100, currentStock: 100, unit: 'pockets' }
        ]);
        console.log('✅ Default inventory items created');
    }

    // Initialize Water Level (5000L)
    const waterSetting = await Settings.findOne({ key: 'currentWaterLevel' });
    if (!waterSetting) {
        await new Settings({ key: 'currentWaterLevel', value: 5000 }).save();
        console.log('✅ Default water level (5000L) initialized');
    }
};

// --- PRODUCTION BATCH MANAGEMENT ---
app.post('/api/batches', auth, async (req, res) => {
    try {
        const { batchName, bedDate, seedsUsed, notes } = req.body;
        const newBatch = new Batch({
            batchName,
            bedDate: new Date(bedDate),
            seedsUsed,
            notes
        });
        await newBatch.save();

        // Deduct seeds from inventory if applicable
        if (seedsUsed > 0) {
            const seedsInventory = await Inventory.findOne({ itemName: 'Seeds' });
            if (seedsInventory) {
                seedsInventory.currentStock -= seedsUsed;
                seedsInventory.usageHistory.push({
                    quantity: seedsUsed,
                    type: 'use',
                    notes: `Used for batch: ${batchName}`
                });
                await seedsInventory.save();
            }
        }

        res.status(201).json({
            message: 'New batch created',
            batch: newBatch,
            expectedHarvest: newBatch.expectedHarvestDate
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Batch creation failed' });
    }
});

app.get('/api/batches', auth, async (req, res) => {
    try {
        const batches = await Batch.find().sort({ bedDate: -1 });

        // Check and update status for batches ready for harvest
        const today = new Date();
        for (let batch of batches) {
            if (batch.status === 'Growing' && batch.expectedHarvestDate <= today) {
                batch.status = 'Ready for Harvest';
                await batch.save();
            }
        }

        res.json(batches);
    } catch (error) {
        res.status(500).json({ message: 'Fetch batches failed' });
    }
});

app.get('/api/batches/ready', auth, async (req, res) => {
    try {
        const today = new Date();
        const readyBatches = await Batch.find({
            status: { $in: ['Growing', 'Ready for Harvest'] },
            expectedHarvestDate: { $lte: today }
        });

        // Update status to 'Ready for Harvest'
        for (let batch of readyBatches) {
            if (batch.status === 'Growing') {
                batch.status = 'Ready for Harvest';
                await batch.save();
            }
        }

        res.json(readyBatches);
    } catch (error) {
        res.status(500).json({ message: 'Fetch ready batches failed' });
    }
});

app.patch('/api/batches/:id/harvest', auth, async (req, res) => {
    try {
        const { harvestedQuantity } = req.body;
        const batch = await Batch.findByIdAndUpdate(
            req.params.id,
            {
                status: 'Harvested',
                harvestedQuantity,
                harvestedDate: new Date()
            },
            { new: true }
        );
        res.json(batch);
    } catch (error) {
        res.status(500).json({ message: 'Harvest update failed' });
    }
});

// Start Soaking Route
app.post('/api/batches/:id/start-soak', auth, async (req, res) => {
    try {
        const batch = await Batch.findById(req.params.id);
        if (!batch) return res.status(404).json({ message: 'Batch not found' });

        batch.soakingTime = new Date();
        batch.soakingStatus = 'Soaking';
        batch.soakingAlertSent = false;
        await batch.save();

        // --- SOAKING INTIMATION NOTIFICATION ---
        const adminPhones = (process.env.ADMIN_PHONE || '9500591897,9159659711').split(',');
        const finishTime = new Date(batch.soakingTime.getTime() + 18 * 60 * 60 * 1000).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        const intimationMsg = `≡ƒº╝ *TJP SOAKING STARTED*\n\nBatch: *${batch.batchName}*\nStart Time: ${batch.soakingTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}\n\n≡ƒÜ¿ *18-Hour Alert Schedule:* \nTarget Finish: *${finishTime}*\n\nSystem will notify you automatically when complete! ≡ƒìä`;

        for (const phone of adminPhones) {
            await sendMessage(phone.trim(), intimationMsg, 'admin');
        }

        res.json({ message: 'Soaking started and intimation sent', soakingTime: batch.soakingTime, finishTime });
    } catch (error) {
        res.status(500).json({ message: 'Failed to start soaking' });
    }
});

// --- CUSTOMER LOGIN (Loyalty Card) ---
app.post('/api/customer/register', async (req, res) => {
    try {
        const { name, contactNumber, password } = req.body;

        let customer = await Customer.findOne({ contactNumber });
        if (customer) {
            // Update existing customer with password
            customer.password = password;
            await customer.save();
        } else {
            customer = new Customer({ name, contactNumber, password });
            await customer.save();
        }

        res.status(201).json({
            message: 'Customer registered successfully',
            customerId: customer.customerId,
            name: customer.name
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Registration failed' });
    }
});

app.post('/api/customer/login', async (req, res) => {
    try {
        const { contactNumber, password } = req.body;
        const customer = await Customer.findOne({ contactNumber });

        if (!customer || !(await customer.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: customer._id, type: 'customer' }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            token,
            customer: {
                customerId: customer.customerId,
                name: customer.name,
                contactNumber: customer.contactNumber,
                loyaltyCount: customer.loyaltyCount,
                totalOrders: customer.totalOrders,
                freePocketsRedeemed: customer.freePocketsRedeemed
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Login failed' });
    }
});

app.get('/api/customer/loyalty/:contactNumber', async (req, res) => {
    try {
        const customer = await Customer.findOne({ contactNumber: req.params.contactNumber });
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        const freePocketEligible = customer.loyaltyCount >= 10;
        const pocketsToGo = freePocketEligible ? 0 : 10 - (customer.loyaltyCount % 10);

        res.json({
            customerId: customer.customerId,
            name: customer.name,
            loyaltyCount: customer.loyaltyCount,
            totalOrders: customer.totalOrders,
            freePocketEligible,
            pocketsToGo,
            freePocketsRedeemed: customer.freePocketsRedeemed
        });
    } catch (error) {
        res.status(500).json({ message: 'Loyalty fetch failed' });
    }
});

// --- WHATSAPP WEBHOOK ---
app.post('/api/webhook/whatsapp/loyalty', auth, async (req, res) => {
    try {
        const { customerId, contactNumber, customerName } = req.body;

        const customer = await Customer.findOne({
            $or: [{ customerId }, { contactNumber }]
        });

        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        if (customer.loyaltyCount >= 10) {
            // Tamil loyalty notification message
            const message = `≡ƒÄë α«╡α«╛α«┤α»ìα«ñα»ìα«ñα»üα«òα»ìα«òα«│α»ì ${customer.name}!

TJP α««α«╖α»ìα«░α»éα««α»ì α«¬α«╛α«░α»ìα««α«┐α«Öα»ì loyalty program-α«▓α»ì 10 α«¬α«╛α«òα»ìα«òα»åα«ƒα»ìα«òα«│α»ì complete α«åα«òα«┐α«╡α«┐α«ƒα»ìα«ƒα«ñα»ü!

≡ƒìä α«ëα«Öα»ìα«òα«│α»ì α«àα«ƒα»üα«ñα»ìα«ñ order-α«▓α»ì 1 FREE POCKET α«¬α»åα«▒α«▓α«╛α««α»ì!

α«ëα«Öα»ìα«òα«│α»ì Loyalty ID: ${customer.customerId}

≡ƒô₧ Order α«Üα»åα«»α»ìα«»: 7010322499

α«¿α«⌐α»ìα«▒α«┐! - TJP Mushroom Farming`;

            // Update last notification sent
            customer.lastNotificationSent = new Date();
            await customer.save();

            // Trigger WhatsApp (placeholder - will open WhatsApp Web)
            const result = await sendLoyaltyNotification(customer.contactNumber, message);

            res.json({
                message: 'Loyalty notification triggered',
                whatsappUrl: `https://wa.me/91${customer.contactNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`,
                result
            });
        } else {
            res.json({
                message: `Customer has ${customer.loyaltyCount} pockets. Needs ${10 - customer.loyaltyCount} more for free pocket.`,
                eligible: false
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Webhook trigger failed' });
    }
});

// Auto-check loyalty notifications (can be called by scheduler)
app.get('/api/webhook/check-loyalty', auth, async (req, res) => {
    try {
        const eligibleCustomers = await Customer.find({
            loyaltyCount: { $gte: 10 },
            $or: [
                { lastNotificationSent: { $exists: false } },
                { lastNotificationSent: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } } // Not notified in 24 hours
            ]
        });

        res.json({
            eligibleCount: eligibleCustomers.length,
            customers: eligibleCustomers.map(c => ({
                customerId: c.customerId,
                name: c.name,
                contactNumber: c.contactNumber,
                loyaltyCount: c.loyaltyCount
            }))
        });
    } catch (error) {
        res.status(500).json({ message: 'Check failed' });
    }
});

// --- BACKGROUND ALARM SCHEDULER ---
const startAlarmScheduler = () => {
    console.log('ΓÅ░ Alarm Scheduler started...');
    setInterval(async () => {
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        // Supports multiple numbers separated by comma (e.g., "9500591897,9159659711")
        const adminPhones = (process.env.ADMIN_PHONE || '9500591897').split(',').map(p => p.trim());

        try {
            // 1. Check Daily Alerts (HH:MM)
            const activeAlerts = await Alert.find({ scheduledTime: currentTime, isActive: true, type: 'daily' });
            for (const alert of activeAlerts) {
                const message = `≡ƒöö *TJP ALARM* ≡ƒöö\n\nTitle: ${alert.title}\nMessage: ${alert.message}\nTime: ${alert.scheduledTime}`;
                for (const phone of adminPhones) {
                    try {
                        await sendMessage(phone, message, 'admin');
                        await NotificationLog.create({ type: 'WhatsApp', recipient: phone, title: alert.title, message: alert.message });
                        if (alert.title.includes('WATER')) {
                            await sendVoiceCall(phone, `Sir, TJP Mushroom Alert. ${alert.title}. ${alert.message}`);
                            await NotificationLog.create({ type: 'VoiceCall', recipient: phone, title: alert.title, message: `System Call triggered` });
                        }
                    } catch (e) {
                        await NotificationLog.create({ type: 'WhatsApp', recipient: phone, title: alert.title, status: 'Failed', error: e.message });
                    }
                }
            }

            // --- FAN AUTOMATION ---
            if (currentTime === '06:00') {
                const msg = `≡ƒÆ¿ *TJP FAN AUTOMATION*\n\nStatus: *INTAKE ON* (IN) Γ£à\nTime: 06:00 AM`;
                for (const p of adminPhones) await sendMessage(p, msg);
            } else if (currentTime === '06:30') {
                const msg = `≡ƒÆ¿ *TJP FAN AUTOMATION*\n\nStatus: *EXHAUST ON* (OUT) ≡ƒöä\nTime: 06:30 AM`;
                for (const p of adminPhones) await sendMessage(p, msg);
            } else if (currentTime === '07:00') {
                const msg = `≡ƒÆ¿ *TJP FAN AUTOMATION*\n\nStatus: *ALL FANS OFF* ≡ƒ¢æ\nTime: 07:00 AM`;
                for (const p of adminPhones) await sendMessage(p, msg);
            }

            // --- TANK REFILL ALERT (Every 2 Days) ---
            if (currentTime === '08:00') {
                const setting = await Settings.findOne({ key: 'lastRefillDate' });
                if (setting && setting.value) {
                    const lastRefill = new Date(setting.value);
                    const diffDays = Math.floor((now - lastRefill) / (1000 * 60 * 60 * 24));

                    if (diffDays >= 2) {
                        const msg = `≡ƒÆº *TJP WATER ALERT*\n\nStatus: *REFILL TANK* ΓÜá∩╕Å\nLast filled: ${lastRefill.toLocaleDateString()}\nDays passed: ${diffDays}`;
                        const alertNumbers = ['9159659711', '9500591897'];
                        for (const phone of alertNumbers) {
                            await sendMessage(phone, msg);
                            await sendVoiceCall(phone, "Sir, TJP Water Alert. Please refill the tank. Two days have passed since last refill.");
                        }
                    }
                }
            }

            // 3. Check Soaking Alert (18 hours check)
            const soakingBatches = await Batch.find({ soakingStatus: 'Soaking', soakingAlertSent: false });
            for (const batch of soakingBatches) {
                const alertTime = new Date(new Date(batch.soakingTime).getTime() + 18 * 60 * 60 * 1000);
                if (now >= alertTime) {
                    const msg = `≡ƒÜ¿ TJP SOAKING ALERT! ≡ƒÜ¿\nBatch: ${batch.batchName}\ncompleted 18 hours.`;

                    // Trigger IFTTT Webhook for Voice Call
                    const { sendIFTTTCall } = require('./services/voiceService');
                    await sendIFTTTCall(`Sir, TJP Soaking Alert for Batch ${batch.batchName} is complete.`);

                    for (const phone of adminPhones) {
                        await sendMessage(phone, msg);
                        await NotificationLog.create({ type: 'WhatsApp', recipient: phone, title: 'Soaking Alert', message: msg });
                        // Also doing standard voice call if configured
                        await sendVoiceCall(phone, `Sir, TJP Mushroom Soaking Alert. Batch ${batch.batchName} has completed 18 hours.`);
                        await NotificationLog.create({ type: 'VoiceCall', recipient: phone, title: 'Soaking Alert', message: `Call for batch ${batch.batchName}` });
                    }
                    batch.soakingAlertSent = true;
                    batch.soakingStatus = 'Completed';
                    await batch.save();
                }
            }
        } catch (error) { console.error('Scheduler Error:', error); }
    }, 60000);
};

app.get('/api/admin/notification-logs', auth, async (req, res) => {
    try {
        const logs = await NotificationLog.find().sort({ timestamp: -1 }).limit(10);
        res.json(logs);
    } catch (error) { res.status(500).json({ message: 'Failed to fetch logs' }); }
});

// --- TEST ALARM ENDPOINT ---
app.get('/api/test/fan', async (req, res) => {
    try {
        const adminPhones = (process.env.ADMIN_PHONE || '9500591897,9159659711').split(',');
        const scenarios = [
            { title: "≡ƒÆ¿ FAN STATUS: INTAKE ON", msg: "Γ£à Fresh Air Fan (Fan In) has been turned ON.\nReason: CO2 levels high." },
            { title: "≡ƒ¢æ FAN STATUS: EXHAUST ON", msg: "ΓÜá∩╕Å Exhaust Fan (Fan Out) has been turned ON.\nReason: Temperature above limit (30┬░C)." },
            { title: "≡ƒöò FAN STATUS: ALL OFF", msg: "Γ£à All Fans have been turned OFF.\nClimate conditions are stable." }
        ];

        console.log("≡ƒÜÇ Manually triggering Fan Notification Test...");

        for (const phone of adminPhones) {
            const p = phone.trim();
            for (const scenario of scenarios) {
                const waMessage = `≡ƒöö *TJP ALERT: ${scenario.title}*\n\n${scenario.msg}\n\nTime: ${new Date().toLocaleTimeString()}`;
                await sendMessage(p, waMessage);
                await new Promise(r => setTimeout(r, 2000));
            }
        }
        res.json({ success: true, message: "Fan notifications sent to " + adminPhones.join(', ') });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/test-alarm', async (req, res) => {
    const adminPhones = (process.env.ADMIN_PHONE || '9500591897').split(',').map(p => p.trim());
    const message = `≡ƒöö *TJP TEST ALARM* ≡ƒöö\n\nThis is a sample notification test.\nTime: ${new Date().toLocaleTimeString()}\n\nStatus: System working perfectly! ≡ƒìä`;

    try {
        for (const phone of adminPhones) {
            await sendMessage(phone, message);
        }
        res.json({ message: 'Test alarm sent to all phones!' });
    } catch (error) {
        res.status(500).json({ message: 'Test failed' });
    }
});

app.get('/api/test-all', async (req, res) => {
    const adminPhones = (process.env.ADMIN_PHONE || '9500591897,9159659711').split(',').map(p => p.trim());

    const scenarios = [
        {
            msg: "≡ƒ¢æ *CRITICAL: Climate Control*\n\nΓÜá∩╕Å High Temperature Alert! (32┬░C)\nAction: Exhaust Fan Turned ON automatically.\nMist system activated."
        },
        {
            msg: "≡ƒÆº *WATER LEVEL LOW*\n\nΓÜá∩╕Å Water Drum 1 is below 20%.\nPlease refill immediately to ensure misting works."
        },
        {
            msg: "≡ƒìä *BED TRACKING*\n\n≡ƒôà Batch A-1 Recommendation:\nIt is Day 16. Inspect beds for pinhead formation today."
        },
        {
            msg: "≡ƒÄë *LOYALTY REWARD*\n\nUser *Ravi* has reached 10 pockets!\nEligible for 1 FREE pocket."
        }
    ];

    try {
        let count = 0;
        for (const phone of adminPhones) {
            for (const scenario of scenarios) {
                await sendMessage(phone, scenario.msg);
                // Small delay to prevent spam block
                await new Promise(r => setTimeout(r, 2000));
            }
            count++;
        }
        res.json({ message: `Sent ${scenarios.length} sample alerts to ${count} admins!` });
    } catch (error) {
        res.status(500).json({ message: 'Full test failed' });
    }
});

// --- TEST CALL ENDPOINT ---
app.get('/api/test-call', async (req, res) => {
    const adminPhones = (process.env.ADMIN_PHONE || '9500591897').split(',').map(p => p.trim());
    const message = "Sir, this is a TJP Mushroom Farming test call alert. The system is working perfectly.";

    try {
        for (const phone of adminPhones) {
            await sendVoiceCall(phone, message);
        }
        res.json({ message: 'Test voice call triggered for all phones!' });
    } catch (error) {
        res.status(500).json({ message: 'Call test failed' });
    }
});

app.get('/api/test-ifttt', async (req, res) => {
    const { sendIFTTTCall } = require('./services/voiceService');
    const result = await sendIFTTTCall("TJP System Test: Free Voice Call via IFTTT working!");
    res.json(result);
});

// --- EXPORT MONTHLY REPORTS ---
app.get('/api/export/:section', async (req, res) => {
    try {
        const { section } = req.params;
        const { month, year } = req.query;

        if (!month || !year) {
            return res.status(400).json({ message: 'Month and year required' });
        }

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        let data = [];
        let sheetName = '';
        let fileName = '';

        if (section === 'master' || section === 'master-year') {
            const isYearly = section === 'master-year';
            if (isYearly) {
                // Override dates for full year (Jan 1 to Dec 31)
                month = 'Full Year';
                startDate.setMonth(0); startDate.setDate(1);
                startDate.setHours(0, 0, 0, 0);
                endDate.setMonth(11); endDate.setDate(31);
                endDate.setHours(23, 59, 59, 999);
            }

            sheetName = 'Master Report';
            fileName = `TJP_Master_Report_${isYearly ? 'YEAR_' + year : month + '_' + year}.xlsx`;
            const workbook = XLSX.utils.book_new();

            const subtitleContext = isYearly ? 'YEAR ' + year : month + '/' + year;

            // 1. SALES SHEET
            const salesData = await Sales.find({ date: { $gte: startDate, $lte: endDate } }).sort({ date: 1 });
            const salesSheet = createSheetWithHeader(salesData.map(s => {
                const d = new Date(s.date);
                return {
                    Date: d.getDate(),
                    Month: d.getMonth() + 1,
                    Year: d.getFullYear(),
                    Customer: s.customerName,
                    Product: s.productType,
                    Qty: s.quantity,
                    Unit: s.unit,
                    Price: s.pricePerUnit,
                    Total: s.totalAmount,
                    Payment: s.paymentType,
                    Status: s.paymentStatus
                };
            }), "Sales", subtitleContext);
            XLSX.utils.book_append_sheet(workbook, salesSheet, "Sales");

            // 2. EXPENDITURE SHEET
            const expData = await Expenditure.find({ date: { $gte: startDate, $lte: endDate } }).sort({ date: 1 });
            const expSheet = createSheetWithHeader(expData.map(e => {
                const d = new Date(e.date);
                return {
                    Date: d.getDate(),
                    Month: d.getMonth() + 1,
                    Year: d.getFullYear(),
                    Category: e.category,
                    Desc: e.description,
                    Amount: e.amount,
                    Qty: e.quantity,
                    Unit: e.unit
                };
            }), "Expenses", subtitleContext);
            XLSX.utils.book_append_sheet(workbook, expSheet, "Expenses");

            // 3. INVENTORY & SEEDS
            const invData = await Inventory.find();
            let invLog = [];
            invData.forEach(inv => {
                inv.usageHistory.forEach(h => {
                    const hDate = new Date(h.date);
                    if (hDate >= startDate && hDate <= endDate) {
                        invLog.push({
                            Date: hDate.getDate(),
                            Month: hDate.getMonth() + 1,
                            Year: hDate.getFullYear(),
                            Item: inv.itemName,
                            Type: h.type,
                            Qty: h.quantity,
                            Notes: h.notes
                        });
                    }
                });
            });
            const invSheet = createSheetWithHeader(invLog, "Inventory Log", subtitleContext);
            XLSX.utils.book_append_sheet(workbook, invSheet, "Inventory Log");

            // 4. CLIMATE
            const climData = await Climate.find({ date: { $gte: startDate, $lte: endDate } }).sort({ date: 1 });
            const climSheet = createSheetWithHeader(climData.map(c => {
                const d = new Date(c.date);
                return {
                    Date: d.getDate(),
                    Month: d.getMonth() + 1,
                    Year: d.getFullYear(),
                    Temp: c.temperature,
                    Moist: c.moisture,
                    Notes: c.notes
                };
            }), "Climate", subtitleContext);
            XLSX.utils.book_append_sheet(workbook, climSheet, "Climate");

            // 5. LOYALTY (Current Snapshot)
            const custData = await Customer.find();
            const loyalSheet = createSheetWithHeader(custData.map(c => ({
                Name: c.name, Phone: c.contactNumber, Cycle: c.cycleCount
            })), "Loyalty Snapshot", subtitleContext);
            XLSX.utils.book_append_sheet(workbook, loyalSheet, "Loyalty Snapshot");

            // 6. WATER LOGS
            const waterData = await WaterLog.find({ date: { $gte: startDate, $lte: endDate } }).sort({ date: 1 });
            const waterSheet = createSheetWithHeader(waterData.map(d => {
                const dt = new Date(d.date);
                return {
                    Date: dt.getDate(),
                    Month: dt.getMonth() + 1,
                    Year: dt.getFullYear(),
                    Type: d.type,
                    Liters: d.liters,
                    RemainingLevel: d.remainingLevel,
                    Percentage: d.percentage + '%',
                    Notes: d.notes || '-'
                };
            }), "Water Logs", subtitleContext);
            XLSX.utils.book_append_sheet(workbook, waterSheet, "Water Logs");

            // 7. SEED SPECIFIC USAGE
            const seedInv = await Inventory.findOne({ itemName: 'Seeds' });
            let seedLog = [];
            if (seedInv) {
                seedInv.usageHistory.forEach(h => {
                    const hDate = new Date(h.date);
                    if (hDate >= startDate && hDate <= endDate) {
                        seedLog.push({
                            Date: hDate.getDate(),
                            Month: hDate.getMonth() + 1,
                            Year: hDate.getFullYear(),
                            Type: h.type,
                            Qty: h.quantity,
                            Unit: seedInv.unit,
                            Notes: h.notes
                        });
                    }
                });
            }
            const seedSheet = createSheetWithHeader(seedLog, "Seed Usage", subtitleContext);
            XLSX.utils.book_append_sheet(workbook, seedSheet, "Seed Usage");

            // Send
            const buffer = XLSX.write(workbook, { type: 'buffer' });
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            return res.send(buffer);

        } else if (section === 'month-end') {
            // DAILY BREAKDOWN FOR THE MONTH
            sheetName = 'Month End Report';
            fileName = `TJP_Month_End_Report_${month}_${year}.xlsx`;
            const workbook = XLSX.utils.book_new();

            const daysInMonth = new Date(year, month, 0).getDate();
            const dailyData = [];

            // Fetch Data Range
            const start = new Date(year, month - 1, 1);
            const end = new Date(year, month, 0, 23, 59, 59);

            const sales = await Sales.find({ date: { $gte: start, $lte: end } });
            const batches = await Batch.find({ bedDate: { $gte: start, $lte: end } });
            // For Yield, we check harvestedDate.
            const harvests = await Batch.find({ harvestedDate: { $gte: start, $lte: end } });

            for (let i = 1; i <= daysInMonth; i++) {
                const dayDate = new Date(year, month - 1, i);
                const dateStr = dayDate.toLocaleDateString();

                // 1. Bed Count (batches made this day)
                const bedsMade = batches.filter(b => new Date(b.bedDate).getDate() === i).length;

                // 2. Yield (harvested this day)
                const dayYield = harvests
                    .filter(h => h.harvestedDate && new Date(h.harvestedDate).getDate() === i)
                    .reduce((sum, h) => sum + (h.harvestedQuantity || 0), 0);

                // 3. Sales
                const daySales = sales
                    .filter(s => new Date(s.date).getDate() === i)
                    .reduce((sum, s) => sum + s.totalAmount, 0);

                dailyData.push({
                    Date: dateStr,
                    'Beds Made': bedsMade,
                    'Yield (Qty)': dayYield,
                    'Sales (Γé╣)': daySales
                });
            }

            // Helper function logic duplicated here or accessible from scope? 
            // Since createSheetWithHeader is defined inside the 'master' block, I should probably copy logic or refactor. 
            // For safety and speed, I will use standard styled creation here.

            const ws = createSheetWithHeader(dailyData, "Daily Breakdown", `${month}/${year}`);
            XLSX.utils.book_append_sheet(workbook, ws, "Daily Breakdown");

            const buffer = XLSX.write(workbook, { type: 'buffer' });
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            return res.send(buffer);

        } else if (section === 'year-end') {
            // MONTHLY BREAKDOWN FOR THE YEAR
            sheetName = 'Yearly Summary';
            fileName = `TJP_Yearly_Summary_${year}.xlsx`;
            const workbook = XLSX.utils.book_new();

            const start = new Date(year, 0, 1);
            const end = new Date(year, 11, 31, 23, 59, 59);

            const sales = await Sales.find({ date: { $gte: start, $lte: end } });
            const batches = await Batch.find({ bedDate: { $gte: start, $lte: end } });
            const harvests = await Batch.find({ harvestedDate: { $gte: start, $lte: end } });

            const monthlyData = [];
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

            for (let i = 0; i < 12; i++) {
                // Filter by month (0-indexed)
                const bedsCount = batches.filter(b => new Date(b.bedDate).getMonth() === i).length;
                const yieldTotal = harvests
                    .filter(h => h.harvestedDate && new Date(h.harvestedDate).getMonth() === i)
                    .reduce((sum, h) => sum + (h.harvestedQuantity || 0), 0);
                const salesTotal = sales
                    .filter(s => new Date(s.date).getMonth() === i)
                    .reduce((sum, s) => sum + s.totalAmount, 0);

                monthlyData.push({
                    Month: months[i],
                    'Total Beds': bedsCount,
                    'Total Yield (Qty)': yieldTotal,
                    'Total Sales (Γé╣)': salesTotal
                });
            }

            const ws = createSheetWithHeader(monthlyData, "Yearly Summary", `${year}`);
            XLSX.utils.book_append_sheet(workbook, ws, "Yearly Summary");

            const buffer = XLSX.write(workbook, { type: 'buffer' });
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            return res.send(buffer);

        } else if (section === 'water') {
            data = await WaterLog.find({ date: { $gte: startDate, $lte: endDate } }).sort({ date: 1 });
            data = data.map(d => ({
                Date: new Date(d.date).toLocaleDateString(),
                Type: d.type,
                Liters: d.liters,
                RemainingLevel: d.remainingLevel,
                Percentage: d.percentage + '%',
                Notes: d.notes || '-'
            }));
            sheetName = 'Water Logs';
            fileName = `TJP_Water_Report_${month}_${year}.xlsx`;
        } else if (section === 'inventory') {
            // For Seed Taken, perhaps filter inventory with usageHistory in the month
            const inventories = await Inventory.find();
            data = [];
            inventories.forEach(inv => {
                inv.usageHistory.forEach(h => {
                    const hDate = new Date(h.date);
                    if (hDate >= startDate && hDate <= endDate) {
                        data.push({
                            Date: hDate.toLocaleDateString(),
                            Item: inv.itemName,
                            Type: h.type,
                            Quantity: h.quantity,
                            Unit: inv.unit,
                            Notes: h.notes || '-'
                        });
                    }
                });
            });
            sheetName = 'Inventory Usage';
            fileName = `TJP_Inventory_Report_${month}_${year}.xlsx`;
        } else if (section === 'seed') {
            const seedInv = await Inventory.findOne({ itemName: 'Seeds' });
            data = [];
            if (seedInv) {
                seedInv.usageHistory.forEach(h => {
                    const hDate = new Date(h.date);
                    if (hDate >= startDate && hDate <= endDate) {
                        data.push({
                            Date: hDate.toLocaleDateString(),
                            Type: h.type,
                            Quantity: h.quantity,
                            Unit: seedInv.unit,
                            Notes: h.notes || '-'
                        });
                    }
                });
            }
            sheetName = 'Seed Usage';
            fileName = `TJP_Seed_Report_${month}_${year}.xlsx`;
        } else if (section === 'climate') {
            data = await Climate.find({ date: { $gte: startDate, $lte: endDate } }).sort({ date: 1 });
            data = data.map(d => ({
                Date: new Date(d.date).toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: '2-digit', hour12: true }),
                Temperature: d.temperature + '┬░C',
                Moisture: d.moisture ? d.moisture + '%' : '-',
                Humidity: d.humidity ? d.humidity + '%' : '-',
                CO2: d.co2 ? d.co2 + ' ppm' : '-',
                FanStatus: d.fanStatus,
                Notes: d.notes || '-'
            }));
            sheetName = 'Climate Data';
            fileName = `TJP_Climate_Report_${month}_${year}.xlsx`;
        } else if (section === 'loyalty') {
            // For loyalty, perhaps customers with activity in the month, but since it's hub, all customers
            data = await Customer.find();
            data = data.map(d => ({
                CustomerID: d.customerId,
                Name: d.name,
                Phone: d.contactNumber,
                LoyaltyCycleCount: d.cycleCount,
                TotalOrders: d.totalOrders,
                FreePocketsRedeemed: d.freePocketsClaimed,
                CreatedAt: new Date(d.createdAt).toLocaleDateString()
            }));
            sheetName = 'Loyalty Hub';
            fileName = `TJP_Loyalty_Report_${month}_${year}.xlsx`;
        } else {
            return res.status(400).json({ message: 'Invalid section' });
        }

        // if (data.length === 0) {
        //     return res.status(404).json({ message: 'No data found for the selected month' });
        // }

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

        const buffer = XLSX.write(workbook, { type: 'buffer' });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.send(buffer);

    } catch (err) {
        console.error('Export error:', err);
        res.status(500).json({ message: 'Export failed' });
    }
});
// 🌌 TJP ANTI-GRAVITY ULTIMATE FIX

// 1. DAILY ROUTINE ALERTS: ONLY 4 (REMOVED UNNECESSARY)
const routineAlerts = [
    { task: "WATER CHECK", time: "06:00 AM" },
    { task: "WATER CHECK", time: "12:00 PM" },
    { task: "WATER CHECK", time: "06:00 PM" },
    { task: "WATER CHECK", time: "09:00 PM" }
];

app.get('/api/alerts', (req, res) => {
    res.json(routineAlerts);
});

// 2. SEED INTAKE: LOYALTY FIX + NOTES SAVE
app.post('/api/seed-intake', async (req, res) => {
    const { quantity, notes, customerId } = req.body;
    try {
        // Seed Stock-la notes save aagum
        const newEntry = new SeedStock({ quantity, notes, date: new Date() });
        await newEntry.save();

        // Seed vangi-na automatic 1 pocket add aagi loyalty update aagum
        if (customerId) {
            const user = await Customer.findById(customerId);
            user.cycleCount += 1;
            if (user.cycleCount >= 10) {
                user.freePocketsClaimed += 1;
                user.cycleCount = 0;
            }
            await user.save();
        }
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Seed Sync Failed" });
    }
});

// 3. LOYALTY RESET: ONLY RESET CYCLE (REMOVED LIFETIME MANIPULATION)
app.post('/api/loyalty/reset', async (req, res) => {
    const { customerId } = req.body;
    console.log(`📡 Manual Loyalty Reset Request for: ${customerId}`);
    try {
        // Lifetime remove pannittaen, only reset cycle to 0
        const customer = await Customer.findByIdAndUpdate(customerId, { cycleCount: 0 }, { new: true });
        if (customer) {
            console.log(`✅ Reset Success for Customer: ${customer.name}`);
            res.json({ success: true, customer });
        } else {
            console.log(`❌ Reset Failed: Customer ${customerId} not found`);
            res.status(404).json({ error: "Customer not found" });
        }
    } catch (err) {
        console.error('❌ Reset Error:', err);
        res.status(500).json({ error: "Reset failed" });
    }
});
// --- WATER SPRAY CALCULATION ---
// Deducts 20L per spray, 13 times daily
cron.schedule('0,2 0,1,3,5,7,9,11,12,14,16,18,20,22 * * *', async () => {
    try {
        const mins = new Date().getMinutes();
        const adminPhones = (process.env.ADMIN_PHONE || '9500591897,9159659711').split(',');

        if (mins === 0) {
            // WATER ON
            const msg = `≡ƒÆº *TJP WATER LOGIC*\n\nStatus: *MISTING ON* ≡ƒÜ┐\nDuration: 2 Minutes`;
            for (const p of adminPhones) await sendMessage(p.trim(), msg);
        } else if (mins === 2) {
            // WATER OFF
            const msg = `≡ƒÆº *TJP WATER LOGIC*\n\nStatus: *MISTING OFF* ≡ƒ¢æ`;
            for (const p of adminPhones) await sendMessage(p.trim(), msg);
            return; // Skip water deduction logic for "OFF" signal
        }

        const capacity = 5000;
        const sprayUsage = 20; // 20 Liters per spray

        let levelSetting = await Settings.findOne({ key: 'currentWaterLevel' });
        let currentLevel = levelSetting ? Number(levelSetting.value) : capacity;

        currentLevel = Math.max(0, currentLevel - sprayUsage);

        await Settings.findOneAndUpdate(
            { key: 'currentWaterLevel' },
            { value: currentLevel },
            { upsert: true }
        );

        const WaterLog = require('./models/WaterLog');
        const log = new WaterLog({
            type: 'usage',
            liters: sprayUsage,
            remainingLevel: currentLevel,
            percentage: (currentLevel / capacity) * 100,
            notes: 'Daily Automated Spray Usage (13 cycles)'
        });
        await log.save();

        console.log(`≡ƒÆº Daily Water Deducted: ${sprayUsage}L. Current: ${currentLevel}L`);

        // Alert if below 20%
        if (currentLevel < (capacity * 0.2)) {
            const adminPhones = (process.env.ADMIN_PHONE || '9500591897,9159659711').split(',');
            const msg = `ΓÜá∩╕Å *TJP WATER ALERT*\n\nTank Level is Low: *${Math.round((currentLevel / capacity) * 100)}%* (${currentLevel}L).\nPlease Refill Soon!`;
            const { sendMessage } = require('./services/whatsappService');
            for (const phone of adminPhones) {
                await sendMessage(phone.trim(), msg, 'admin');
            }
        }
    } catch (err) {
        console.error('Water Cron Error:', err);
    }
});

// --- DAILY AUTOMATED REPORT SCHEDULER (8:00 pM) ---
cron.schedule('0 20 * * *', async () => {
    console.log('≡ƒòÆ 8:00 PM: Generating daily sales & expenditure report...');
    try {
        const today = new Date();
        const start = new Date(today.setHours(0, 0, 0, 0));
        const end = new Date(today.setHours(23, 59, 59, 999));

        const sales = await Sales.find({ date: { $gte: start, $lte: end } });
        const expenditures = await Expenditure.find({ date: { $gte: start, $lte: end } });

        await sendDailyReport(sales, expenditures);
        console.log('Γ£à Daily 8 PM Report task completed.');
    } catch (error) {
        console.error('Γ¥î Daily Cron Error:', error);
    }
});

// --- MONTHLY AUTOMATED REPORT SCHEDULER ---
// Runs at 11:59 PM (23:59) on the last day of every month
cron.schedule('59 23 28-31 * *', async () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // If tomorrow is the 1st, then today is the last day of the month
    if (tomorrow.getDate() === 1) {
        console.log('≡ƒôà Last day of the month detected. Generating automated report...');
        try {
            const month = today.getMonth() + 1;
            const year = today.getFullYear();

            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0, 23, 59, 59);

            const sales = await Sales.find({ date: { $gte: startDate, $lte: endDate } });
            const expenditures = await Expenditure.find({ date: { $gte: startDate, $lte: endDate } });
            const inventory = await Inventory.find();
            const climate = await Climate.find({ date: { $gte: startDate, $lte: endDate } });
            const customers = await Customer.find();

            await sendMonthlyReport(sales, expenditures, inventory, climate, customers, month, year);
            console.log(`Γ£à Automated Report for ${month}/${year} sent.`);
        } catch (error) {
            console.error('Γ¥î Automated Report Error:', error);
        }
    }
});


// --- OFFLINE CACHE LOGIC ---
const OFFLINE_SALES_FILE = path.join(__dirname, 'offline_sales.json');

const saveSaleOffline = (saleData) => {
    try {
        let sales = [];
        if (fs.existsSync(OFFLINE_SALES_FILE)) {
            sales = JSON.parse(fs.readFileSync(OFFLINE_SALES_FILE));
        }
        sales.push({ ...saleData, offline: true, savedAt: new Date() });
        fs.writeFileSync(OFFLINE_SALES_FILE, JSON.stringify(sales, null, 2));
        console.log('≡ƒôª SAFE MODE: Sale saved to local cache (No Internet/DB)');
        return true;
    } catch (e) {
        console.error('Γ¥î Failed to save offline:', e.message);
        return false;
    }
};

const syncOfflineSales = async () => {
    if (mongoose.connection.readyState !== 1 || !fs.existsSync(OFFLINE_SALES_FILE)) return;
    try {
        const sales = JSON.parse(fs.readFileSync(OFFLINE_SALES_FILE));
        if (sales.length === 0) return;

        console.log(`≡ƒöä Syncing ${sales.length} offline sales to Atlas...`);
        for (const s of sales) {
            const { offline, savedAt, ...cleanData } = s;
            const sale = new Sales(cleanData);
            await sale.save();
        }
        fs.unlinkSync(OFFLINE_SALES_FILE);
        console.log('Γ£à Local cache cleared and synced to Atlas!');
    } catch (e) {
        console.warn('ΓÜá∩╕Å Sync partially failed. Will retry later.');
    }
};

// Sync every 5 minutes
setInterval(syncOfflineSales, 5 * 60 * 1000);

const MONGODB_URI = process.env.MONGODB_URI;
const LOCAL_MONGODB_URI = 'mongodb://localhost:27017/tjp_mushroom_local';

// --- DIRECT CONNECTION BYPASS ---
const getDirectURI = (uri) => {
    if (uri && uri.startsWith('mongodb+srv://')) {
        console.log('≡ƒöä Converting SRV to Standard Direct Connection (ISP Bypass)...');
        const match = uri.match(/mongodb\+srv:\/\/([^@]+)@([^/?]+)/);
        if (match) {
            const auth = match[1];
            const shards = [
                'ac-ogvdy4k-shard-00-00.dcqsomw.mongodb.net:27017',
                'ac-ogvdy4k-shard-00-01.dcqsomw.mongodb.net:27017',
                'ac-ogvdy4k-shard-00-02.dcqsomw.mongodb.net:27017'
            ];
            const dbPart = uri.split('/')[3] || 'managementDB';
            const dbName = dbPart.split('?')[0];
            // USER REQUEST: Add authSource, replicaSet, and tls
            return `mongodb://${auth}@${shards.join(',')}/${dbName}?authSource=admin&replicaSet=atlas-ogvdy4k-shard-0&tls=true&retryWrites=true&w=majority`;
        }
    }
    return uri;
};

const DIRECT_URI = getDirectURI(MONGODB_URI);

let isConnectedToLocal = false;

app.get('/api/status', (req, res) => {
    res.json({
        connected: mongoose.connection.readyState === 1,
        isLocal: isConnectedToLocal,
        mode: isConnectedToLocal ? 'LOCAL' : 'CLOUD'
    });
});

const startServer = (port) => {
    const server = app.listen(port, () => {
        console.log('\n-------------------------------------------');
        console.log(`≡ƒÜÇ TJP SERVER IS LIVE!`);
        console.log(`≡ƒîÉ Dashboard: http://localhost:${port}`);
        console.log(`≡ƒôè Mode: ${isConnectedToLocal ? 'LOCAL FAILOVER' : 'CLOUD ATLAS'}`);
        console.log(`≡ƒô▒ Offline Safety & Local Failover ACTIVE.`);
        console.log('-------------------------------------------\n');
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`ΓÜá∩╕Å Port ${port} is busy. Trying ${port + 1}...`);
            startServer(port + 1);
        } else {
            console.error('Γ¥î Server Error:', err);
        }
    });

    const shutdown = async () => {
        console.log('\n≡ƒ¢æ Shutting down TJP Server gracefully...');
        server.close(async () => {
            console.log('≡ƒôí Closing MongoDB Connection...');
            await mongoose.connection.close();
            console.log('Γ£à Shutdown Complete. Goodbye! ≡ƒìä');
            process.exit(0);
        });
    };

    process.once('SIGINT', shutdown);
    process.once('SIGTERM', shutdown);
};

const successCallback = async (isLocal = false) => {
    isConnectedToLocal = isLocal;
    console.log(`Γ£à Connected to ${isLocal ? 'LOCAL MongoDB' : 'CLOUD MongoDB Atlas'}`);

    // Ensure at least one admin exists
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
        await new Admin({
            username: 'admin',
            password: 'password123',
            phoneNumber: '9500591897' // Default from ADMIN_PHONE
        }).save();
        console.log('≡ƒæñ Default admin created (admin/password123)');
    }

    if (isLocal) {
        console.warn('ΓÜá∩╕Å WORKING IN LOCAL MODE: Data will be saved to your PC until internet/cloud restores.');
    }
    initializeInventory();
    initializeAlerts();
    syncOfflineSales();
    startAlarmScheduler();

    startServer(PORT);
};

const connectDB = async () => {
    const startTime = Date.now();
    let atlasSuccess = false;

    console.log('≡ƒôí Attempting Cloud Connection (Direct Mode)...');

    // Attempt Atlas First
    try {
        await mongoose.connect(DIRECT_URI, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 30000,
        });
        atlasSuccess = true;
        successCallback(false);
    } catch (err) {
        console.error('Γ¥î Cloud Connection Failed:', err.message);

        // Failover to Local MongoDB if requested or if 1 min passed
        console.log('≡ƒöä Switching to LOCAL MongoDB Failover (localhost:27017)...');
        try {
            await mongoose.connect(LOCAL_MONGODB_URI, {
                serverSelectionTimeoutMS: 5000
            });
            successCallback(true);
        } catch (localErr) {
            console.error('Γ¥î Local MongoDB also failed. (Is MongoDB Compass/Service running?)');
            console.log('≡ƒöä Retrying Cloud in 15 seconds...');
            setTimeout(connectDB, 15000);
        }
    }
};

// --- FRONTEND SERVING ---
const buildPath = path.join(__dirname, '../build');
app.use(express.static(buildPath));

app.get('/', (req, res) => {
    if (fs.existsSync(path.join(buildPath, 'index.html'))) {
        res.sendFile(path.join(buildPath, 'index.html'));
    } else {
        res.status(200).send(`
            <html>
                <body style="background: #CBCCCB; font-family: 'Outfit', sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
                    <div style="text-align: center; background: white; padding: 60px; border-radius: 40px; box-shadow: 0 20px 60px rgba(0,0,0,0.1); max-width: 500px;">
                        <h1 style="color: #022C22; font-size: 3rem; margin-bottom: 10px;">≡ƒìä TJP LIVE</h1>
                        <p style="color: #666; font-size: 1.2rem;">Server is active on Port 5000</p>
                        <div style="margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 20px; border: 2px solid #eee;">
                            <p style="font-weight: bold; color: ${isConnectedToLocal ? '#d97706' : '#059669'}; font-size: 1.1rem;">
                                ${isConnectedToLocal ? '≡ƒÜÇ LOCAL FAILOVER MODE' : 'Γ£à CLOUD ATLAS ONLINE'}
                            </p>
                        </div>
                        <p style="color: #888; font-size: 0.9rem; line-height: 1.5;">
                            Frontend build not detected. <br/> 
                            Please run <code style="background: #eee; padding: 2px 6px; border-radius: 4px;">npm run build</code> in the root.
                        </p>
                        <div style="margin-top: 30px;">
                             <a href="/api/status" style="display: inline-block; padding: 15px 30px; background: #022C22; color: white; text-decoration: none; border-radius: 15px; font-weight: bold;">Check System Status</a>
                        </div>
                    </div>
                </body>
            </html>
        `);
    }
});

// Catch-all for React Router
app.get('*', (req, res, next) => {
    // Skip if it's an API route
    if (req.path.startsWith('/api')) return next();

    const indexPath = path.join(buildPath, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        next();
    }
});

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is not set in .env');
    process.exit(1);
}

connectDB();