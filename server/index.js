const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const XLSX = require('xlsx-js-style');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// --- SYSTEM TIMEZONE ---
process.env.TZ = 'Asia/Kolkata';

console.log('🔧 Environment loaded. MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'NOT SET');

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

const { sendDigitalBill, sendLoyaltyNotification, sendMessage, sendImage, getLatestQr, isClientReady } = require('./services/whatsappService');
const { sendVoiceCall } = require('./services/voiceService');
const { sendMonthlyReport } = require('./services/reportService');
const cron = require('node-cron');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'tjp_secret_key_2026';

// --- AUTH MIDDLEWARE ---
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) throw new Error();
        const decoded = jwt.verify(token, JWT_SECRET);
        const admin = await Admin.findOne({ _id: decoded.id });
        if (!admin) throw new Error();
        req.admin = admin;
        next();
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate.' });
    }
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

        // Log refill
        const log = new WaterLog({
            type: 'refill',
            liters: capacity,
            remainingLevel: capacity,
            percentage: 100,
            notes: 'Manual Tank Refill to 5000L'
        });
        await log.save();

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

        const caption = `✅ *TJP DIGITAL BILL*\nவணக்கம் ${customerName}! 👋\n\n(Generated Automatically 🤖)\n\n"இயற்கையோடு இணைந்த சுவை!" 🍄`;

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
        // No token here. Only return success.
        res.json({ success: true, username: admin.username, message: 'Step 1 successful' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/admin/request-otp', async (req, res) => {
    try {
        const { phoneNumber } = req.body;
        // Verify if this number belongs to an admin
        const admin = await Admin.findOne({ phoneNumber });
        if (!admin) {
            return res.status(401).json({ success: false, message: 'Unauthorized phone number' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await OTP.findOneAndUpdate(
            { phoneNumber },
            { otp, createdAt: new Date() },
            { upsert: true }
        );

        const msg = `🔐 *TJP ADMIN ACCESS*\n\nYour OTP for login is: *${otp}*\n\n(Valid for 10 minutes) ⏳\n\nRequested from: ${phoneNumber}`;
        
        // Send OTP to both admin phones for security
        const adminPhones = (process.env.ADMIN_PHONE || '9500591897,9159659711').split(',');
        let sendSuccess = false;
        
        for (const adminPhone of adminPhones) {
            const result = await sendMessage(adminPhone.trim(), msg, 'admin');
            if (result.success) {
                sendSuccess = true;
                console.log(`✅ OTP sent to admin phone: ${adminPhone.trim()}`);
            } else {
                console.log(`❌ Failed to send OTP to admin phone: ${adminPhone.trim()}`);
            }
        }

        if (sendSuccess) {
            res.json({ success: true, message: 'OTP sent to all admin WhatsApp numbers' });
        } else {
            res.status(500).json({ success: false, message: 'Failed to send OTP via WhatsApp. Is WhatsApp ready?' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/admin/verify-otp', async (req, res) => {
    try {
        const { phoneNumber, otp } = req.body;
        const otpRecord = await OTP.findOne({ phoneNumber, otp });

        if (!otpRecord) {
            return res.status(401).json({ success: false, message: 'Invalid or expired OTP' });
        }

        const admin = await Admin.findOne({ phoneNumber });
        const token = jwt.sign({ id: admin._id }, JWT_SECRET, { expiresIn: '24h' });

        // Delete OTP after successful verification
        await OTP.deleteOne({ _id: otpRecord._id });

        res.json({ success: true, token, username: admin.username });
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

// --- SALES TRACKING ---
app.post('/api/sales', auth, async (req, res) => {
    try {
        const { productType, quantity, unit, pricePerUnit, customerName, contactNumber, date, paymentType } = req.body;
        const totalAmount = quantity * pricePerUnit;

        // Auto-set payment status based on payment type
        const paymentStatus = (paymentType === 'Credit') ? 'Unpaid' : 'Paid';

        const newSale = new Sales({
            productType,
            quantity,
            unit: unit || (productType === 'Mushroom' ? 'pockets' : 'kg'),
            pricePerUnit,
            totalAmount,
            customerName,
            contactNumber,
            paymentType: paymentType || 'Cash',
            paymentStatus,
            date: date || Date.now()
        });
        await newSale.save();

        let loyaltyUpdate = null;
        if (productType === 'Mushroom' && pricePerUnit >= 50) {
            let customer = await Customer.findOne({ contactNumber });
            if (!customer) {
                customer = new Customer({ name: customerName, contactNumber });
            }

            // TJP 10-Pocket Cycle Logic (10 Pockets = 1 Free)
            const qty = Number(quantity) || 0;
            customer.loyaltyCycleCount = (Number(customer.loyaltyCycleCount) || 0) + qty;
            customer.loyaltyCount = (Number(customer.loyaltyCount) || 0) + qty;
            customer.lifetimePockets = (Number(customer.lifetimePockets) || 0) + qty;
            customer.totalOrders = (Number(customer.totalOrders) || 0) + 1;

            let bulkOffer = qty >= 10;
            let reachedCycle = customer.loyaltyCount >= 10;
            if (reachedCycle) {
                customer.loyaltyCount = customer.loyaltyCount % 10;
                customer.loyaltyCycleCount = customer.loyaltyCount;
            }

            await customer.save();

            newSale.isLoyaltyCustomer = true;
            await newSale.save();

            loyaltyUpdate = {
                currentCycle: customer.loyaltyCount,
                lifetime: customer.lifetimePockets,
                reachedCycle,
                bulkOffer
            };
        }

        res.status(201).json({
            message: 'Sale recorded successfully',
            sale: newSale,
            loyaltyUpdate
        });

        // --- AUTOMATIC WHATSAPP BILL ---
        if (contactNumber) {
            const billMsg = `🧾 *TJP MUSHROOM BILL*\n--------------------------\n👤 Customer: ${customerName}\n📦 Product: ${productType}\n🔢 Quantity: ${quantity} ${newSale.unit}\n💰 Price: ₹${pricePerUnit} per ${newSale.unit}\n💵 Total: *₹${totalAmount}*\n📅 Date: ${new Date().toLocaleDateString('en-IN')}\n--------------------------\n✅ Payment: ${paymentType}\n\n"இயற்கையோடு இணைந்த சுவை!" 🍄\nநன்றி! மீண்டும் வருக! 🙏`;
            await sendMessage(contactNumber, billMsg, 'business');
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Sale recording failed' });
    }
});

// --- GOOGLE DRIVE / WHATSAPP BILL UPLOAD ---
app.post('/api/upload-bill', async (req, res) => {
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
        const fs = require('fs');
        fs.writeFileSync(filePath, base64Data, 'base64');

        // 2. Send via WhatsApp
        const caption = `🧾 *TJP DIGITAL BILL*\n\nவணக்கம் ${customerName}! 👋\nஉங்கள் மஷ்ரூம் பில் இங்கே இணைக்கப்பட்டுள்ளது.\n\n"இயற்கையோடு இணைந்த சுவை!" 🌿\n📍 Location: TJP Farm`;
        const result = await sendImage(contactNumber, image, caption, 'business');

        const baseUrl = process.env.PUBLIC_URL || `${req.protocol}://${req.get('host')}`;
        const imageUrl = `${baseUrl}/public/uploads/${fileName}`;

        res.json({
            success: true,
            message: result.success ? 'Bill sent to WhatsApp!' : 'Bill saved but WhatsApp not ready',
            imageUrl,
            waResult: result
        });
    } catch (error) {
        console.error('Bill Process Error:', error);
        res.status(500).json({ message: 'Server error processing bill' });
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

// --- KADAN/CREDIT SETTLEMENT ---
app.patch('/api/sales/:id/settle', auth, async (req, res) => {
    try {
        const { settledBy } = req.body;
        const sale = await Sales.findById(req.params.id);

        if (!sale) {
            return res.status(404).json({ message: 'Sale not found' });
        }

        if (sale.paymentStatus === 'Paid') {
            return res.status(400).json({ message: 'Already settled' });
        }

        sale.paymentStatus = 'Paid';
        sale.settledDate = new Date();
        sale.settledBy = settledBy;
        await sale.save();

        res.json({ message: 'Kadan settled successfully', sale });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Settlement failed' });
    }
});

// --- GET KADAN LIST (Unpaid Sales) ---
app.get('/api/sales/kadan', auth, async (req, res) => {
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

        // Reset the cycle count to 0, but KEEP lifetime history
        customer.loyaltyCycleCount = 0;
        await customer.save();

        res.json({ message: 'Loyalty cycle reset to 0', customer });
    } catch (error) {
        res.status(500).json({ message: 'Reset failed' });
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
            const msg = `🛑 *HIGH TEMP ALERT*\n\nTemp: ${temperature}°C\nNotes: ${notes || 'No data'}\n\nPlease check the farm!`;
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

// --- PUBLIC CONTACT FORM ---
app.post('/api/contact', async (req, res) => {
    try {
        const { payload } = req.body;
        if (!payload) return res.status(400).json({ message: 'No payload' });

        // Decrypt
        const CryptoJS = require('crypto-js');
        const secretKey = 'tjp_encryption_key_2026';
        const bytes = CryptoJS.AES.decrypt(payload, secretKey);
        const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

        // Honeypot check
        if (decryptedData.website) {
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

app.get('/api/sales', auth, async (req, res) => {
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
        await item.save();
        res.json({ message: 'Usage record updated and stock adjusted', item });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Update failed' });
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
        const customers = await Customer.find().sort({ loyaltyCount: -1 });
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: 'Fetch customers failed' });
    }
});

app.post('/api/customers/:id/reset', auth, async (req, res) => {
    try {
        const customer = await Customer.findByIdAndUpdate(req.params.id, { loyaltyCount: 0 }, { new: true });
        res.json(customer);
    } catch (error) {
        res.status(500).json({ message: 'Reset failed' });
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
        const loyaltyIncrement = pricePerPocket >= 50 ? qty : 0;

        let customer = await Customer.findOne({ contactNumber });
        if (!customer) {
            customer = new Customer({ name: customerName, contactNumber });
        }

        const oldLoyalty = Number(customer.loyaltyCount) || 0;
        customer.loyaltyCount = oldLoyalty + loyaltyIncrement;
        customer.loyaltyCycleCount = customer.loyaltyCount; // Syncing
        customer.totalOrders = (Number(customer.totalOrders) || 0) + 1;

        const reachedTen = oldLoyalty < 10 && customer.loyaltyCount >= 10;

        await customer.save();

        // Also create a Sales record
        const newSale = new Sales({
            productType: 'Mushroom',
            quantity,
            unit: 'pockets',
            pricePerUnit: pricePerPocket,
            totalAmount: quantity * pricePerPocket,
            customerName,
            contactNumber,
            isLoyaltyCustomer: loyaltyIncrement > 0
        });
        await newSale.save();

        res.json({
            message: 'Sale recorded',
            customer,
            loyaltyAdded: loyaltyIncrement,
            triggerWhatsApp: reachedTen
        });
    } catch (error) {
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

// --- ANALYTICS (Legacy) ---
app.get('/api/admin/stats', auth, async (req, res) => {
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
const initializeAlerts = async () => {
    // Cleanup old default alerts to prevent duplicates/confusion
    await Alert.deleteMany({ scheduledTime: { $in: ['06:00', '06:30'] } });

    await Alert.insertMany([
        {
            title: 'FAN IN (ON)',
            message: 'Farming Fan IN - Turn ON now!',
            scheduledTime: '06:00',
            type: 'daily',
            icon: '🌀'
        },
        {
            title: 'FAN OUT (OFF)',
            message: 'Farming Fan OUT - Turn OFF now!',
            scheduledTime: '07:00',
            type: 'daily',
            icon: '🌀'
        }
    ]);
    console.log('✅ Fan IN/OUT alerts re-initialized');
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

        res.json({ message: 'Soaking started', soakingTime: batch.soakingTime });
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
            const message = `🎉 வாழ்த்துக்கள் ${customer.name}!

TJP மஷ்ரூம் பார்மிங் loyalty program-ல் 10 பாக்கெட்கள் complete ஆகிவிட்டது!

🍄 உங்கள் அடுத்த order-ல் 1 FREE POCKET பெறலாம்!

உங்கள் Loyalty ID: ${customer.customerId}

📞 Order செய்ய: 7010322499

நன்றி! - TJP Mushroom Farming`;

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
    console.log('⏰ Alarm Scheduler started...');
    setInterval(async () => {
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        // Supports multiple numbers separated by comma (e.g., "9500591897,9159659711")
        const adminPhones = (process.env.ADMIN_PHONE || '9500591897').split(',').map(p => p.trim());

        try {
            // 1. Check Daily Alerts (HH:MM)
            const activeAlerts = await Alert.find({ scheduledTime: currentTime, isActive: true, type: 'daily' });
            for (const alert of activeAlerts) {
                const message = `🔔 *TJP ALARM* 🔔\n\nTitle: ${alert.title}\nMessage: ${alert.message}\nTime: ${alert.scheduledTime}`;
                for (const phone of adminPhones) {
                    try {
                        await sendMessage(phone, message, 'admin');
                        await NotificationLog.create({ type: 'WhatsApp', recipient: phone, title: alert.title, message: alert.message });
                        if (alert.title.includes('FAN') || alert.title.includes('WATER')) {
                            await sendVoiceCall(phone, `Sir, TJP Mushroom Alert. ${alert.title}. ${alert.message}`);
                            await NotificationLog.create({ type: 'VoiceCall', recipient: phone, title: alert.title, message: `System Call triggered` });
                        }
                    } catch (e) {
                        await NotificationLog.create({ type: 'WhatsApp', recipient: phone, title: alert.title, status: 'Failed', error: e.message });
                    }
                }
            }

            // 2. Check Water Drum Cycle (Every 2 days)
            if (currentTime === '08:00') {
                const setting = await Settings.findOne({ key: 'lastWaterCheck' });
                if (setting && setting.value) {
                    const lastCheck = new Date(setting.value);
                    const diffDays = Math.ceil(Math.abs(now - lastCheck) / (1000 * 60 * 60 * 24));

                    if (diffDays >= 2) {
                        const msg = `💧 TJP WATER ALERT 💧\nWater Drum Check is due today!`;
                        for (const phone of adminPhones) {
                            await sendMessage(phone, msg, 'admin');
                            await NotificationLog.create({ type: 'WhatsApp', recipient: phone, title: 'Water Check', message: msg });
                            await sendVoiceCall(phone, "Sir, TJP Water Alert. Please check the water drum level today.");
                            await NotificationLog.create({ type: 'VoiceCall', recipient: phone, title: 'Water Check', message: 'Cycle Alert' });
                        }
                    }
                }
            }

            // 3. Check Soaking Alert (18 hours check)
            const soakingBatches = await Batch.find({ soakingStatus: 'Soaking', soakingAlertSent: false });
            for (const batch of soakingBatches) {
                const alertTime = new Date(new Date(batch.soakingTime).getTime() + 18 * 60 * 60 * 1000);
                if (now >= alertTime) {
                    const msg = `🚨 TJP SOAKING ALERT! 🚨\nBatch: ${batch.batchName}\ncompleted 18 hours.`;

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
            { title: "💨 FAN STATUS: INTAKE ON", msg: "✅ Fresh Air Fan (Fan In) has been turned ON.\nReason: CO2 levels high." },
            { title: "🛑 FAN STATUS: EXHAUST ON", msg: "⚠️ Exhaust Fan (Fan Out) has been turned ON.\nReason: Temperature above limit (30°C)." },
            { title: "🔕 FAN STATUS: ALL OFF", msg: "✅ All Fans have been turned OFF.\nClimate conditions are stable." }
        ];

        console.log("🚀 Manually triggering Fan Notification Test...");

        for (const phone of adminPhones) {
            const p = phone.trim();
            for (const scenario of scenarios) {
                const waMessage = `🔔 *TJP ALERT: ${scenario.title}*\n\n${scenario.msg}\n\nTime: ${new Date().toLocaleTimeString()}`;
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
    const message = `🔔 *TJP TEST ALARM* 🔔\n\nThis is a sample notification test.\nTime: ${new Date().toLocaleTimeString()}\n\nStatus: System working perfectly! 🍄`;

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
            msg: "🛑 *CRITICAL: Climate Control*\n\n⚠️ High Temperature Alert! (32°C)\nAction: Exhaust Fan Turned ON automatically.\nMist system activated."
        },
        {
            msg: "💧 *WATER LEVEL LOW*\n\n⚠️ Water Drum 1 is below 20%.\nPlease refill immediately to ensure misting works."
        },
        {
            msg: "🍄 *BED TRACKING*\n\n📅 Batch A-1 Recommendation:\nIt is Day 16. Inspect beds for pinhead formation today."
        },
        {
            msg: "🎉 *LOYALTY REWARD*\n\nUser *Ravi* has reached 10 pockets!\nEligible for 1 FREE pocket."
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
                Name: c.name, Phone: c.contactNumber, Cycle: c.loyaltyCycleCount, Lifetime: c.lifetimePockets
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
                    'Sales (₹)': daySales
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
                    'Total Sales (₹)': salesTotal
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
                Temperature: d.temperature + '°C',
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
                LoyaltyCycleCount: d.loyaltyCycleCount,
                LifetimePockets: d.lifetimePockets,
                TotalOrders: d.totalOrders,
                FreePocketsRedeemed: d.freePocketsRedeemed,
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

// --- WATER SPRAY CALCULATION ---
// Deducts 20L per spray, 13 times daily
cron.schedule('0 0,1,3,5,7,9,11,12,14,16,18,20,22 * * *', async () => {
    try {
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

        console.log(`💧 Daily Water Deducted: ${sprayUsage}L. Current: ${currentLevel}L`);

        // Alert if below 20%
        if (currentLevel < (capacity * 0.2)) {
            const adminPhones = (process.env.ADMIN_PHONE || '9500591897,9159659711').split(',');
            const msg = `⚠️ *TJP WATER ALERT*\n\nTank Level is Low: *${Math.round((currentLevel / capacity) * 100)}%* (${currentLevel}L).\nPlease Refill Soon!`;
            const { sendMessage } = require('./services/whatsappService');
            for (const phone of adminPhones) {
                await sendMessage(phone.trim(), msg, 'admin');
            }
        }
    } catch (err) {
        console.error('Water Cron Error:', err);
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
        console.log('📅 Last day of the month detected. Generating automated report...');
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
            console.log(`✅ Automated Report for ${month}/${year} sent.`);
        } catch (error) {
            console.error('❌ Automated Report Error:', error);
        }
    }
});


const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is not set in .env file');
    process.exit(1);
}

mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 30000, // Increased to 30s
    socketTimeoutMS: 45000,
    family: 4 // Force IPv4 to avoid DNS issues
})
    .then(async () => {
        console.log('✅ Connected to managementDB');
        const adminCount = await Admin.countDocuments();
        if (adminCount === 0) await new Admin({ username: 'admin', password: 'password123' }).save();
        await initializeAlerts();
        await initializeInventory();
        startAlarmScheduler();
        app.listen(PORT, () => {
            console.log(`🚀 Server is live on port ${PORT}`);
            console.log(`📱 NOTE: Check terminal for WhatsApp QR Code if not connected yet.`);
        });
    })
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err.message);
        if (err.message.includes('IP whitelist')) {
            console.error('👉 ACTION REQUIRED: Add 0.0.0.0/0 or your current IP to MongoDB Atlas Access List.');
        }
        process.exit(1);
    });
