const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const Booking = require('./models/Booking');
const Admin = require('./models/Admin');
const Order = require('./models/Order');
const Inventory = require('./models/Inventory');
const Customer = require('./models/Customer');
const Sales = require('./models/Sales');
const Expenditure = require('./models/Expenditure');
const Alert = require('./models/Alert');
const Batch = require('./models/Batch');
const { sendDigitalBill, sendLoyaltyNotification } = require('./services/whatsappService');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'tjp_secret_key_2026';

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

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

// --- AUTH & ADMIN ---
app.post('/api/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const admin = await Admin.findOne({ username });
        if (!admin || !(await admin.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: admin._id }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, username: admin.username });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
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
        const { productType, quantity, unit, pricePerUnit, customerName, contactNumber } = req.body;
        const totalAmount = quantity * pricePerUnit;

        const newSale = new Sales({
            productType,
            quantity,
            unit: unit || (productType === 'Mushroom' ? 'pockets' : 'kg'),
            pricePerUnit,
            totalAmount,
            customerName,
            contactNumber
        });
        await newSale.save();

        let loyaltyUpdate = null;
        if (productType === 'Mushroom' && pricePerUnit >= 50) {
            let customer = await Customer.findOne({ contactNumber });
            if (!customer) {
                customer = new Customer({ name: customerName, contactNumber });
            }

            // TJP 20-Pocket Cycle Logic
            customer.loyaltyCycleCount += quantity;
            customer.lifetimePockets += quantity; // Permanent record
            customer.totalOrders += 1;

            // Bulk Offer: 20 pockets in one go = 2 Free Pockets
            let bulkOffer = quantity >= 20;

            // Cycle Reset Logic: Every 20 pockets reset counter
            let reachedCycle = customer.loyaltyCycleCount >= 20;
            if (reachedCycle) {
                customer.loyaltyCycleCount = customer.loyaltyCycleCount % 20;
            }

            await customer.save();

            newSale.isLoyaltyCustomer = true;
            await newSale.save();

            loyaltyUpdate = {
                currentCycle: customer.loyaltyCycleCount,
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
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Sale recording failed' });
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

// Generic Edit/Delete for Models
app.patch('/api/edit/:model/:id', auth, async (req, res) => {
    try {
        const { model, id } = req.params;
        let Model;
        if (model === 'sales') Model = Sales;
        else if (model === 'expenditure') Model = Expenditure;
        else if (model === 'inventory') Model = Inventory;
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
        else return res.status(400).json({ message: 'Invalid model' });

        await Model.findByIdAndDelete(id);
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Delete failed' });
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

        const loyaltyIncrement = pricePerPocket >= 50 ? quantity : 0;

        let customer = await Customer.findOne({ contactNumber });
        if (!customer) {
            customer = new Customer({ name: customerName, contactNumber });
        }

        const oldLoyalty = customer.loyaltyCount;
        customer.loyaltyCount += loyaltyIncrement;
        customer.totalOrders += 1;
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

        const reachedTen = oldLoyalty < 10 && customer.loyaltyCount >= 10;

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

        res.json({
            totalRevenue: totalRevenue + totalSalesAmount,
            bookingCount,
            pendingOrders,
            orderCount: orders.length,
            totalSales: totalSalesAmount,
            totalExpenditure,
            netProfit: totalSalesAmount - totalExpenditure
        });
    } catch (error) {
        res.status(500).json({ message: 'Stats failed' });
    }
});

// Initialize default alerts
const initializeAlerts = async () => {
    const alertCount = await Alert.countDocuments();
    if (alertCount === 0) {
        await Alert.insertMany([
            {
                title: 'Morning Mushroom Check',
                message: 'Mushroom Check & Water Spray',
                scheduledTime: '06:00',
                type: 'daily',
                icon: '🍄💧'
            },
            {
                title: 'Exhaust Fan Status',
                message: 'Exhaust Fan Status Change',
                scheduledTime: '06:30',
                type: 'daily',
                icon: '🌀'
            }
        ]);
        console.log('✅ Default alerts created');
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

const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI)
    .then(async () => {
        console.log('✅ Connected to managementDB');
        const adminCount = await Admin.countDocuments();
        if (adminCount === 0) await new Admin({ username: 'admin', password: 'password123' }).save();
        await initializeAlerts();
        await initializeInventory();
        app.listen(PORT, () => console.log(`🚀 Server is live on port ${PORT}`));
    })
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err.message);
        process.exit(1);
    });
