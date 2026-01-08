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
const { sendDigitalBill } = require('./services/whatsappService');

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

// --- SHOP & LOYALTY ---
app.post('/api/orders', async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        await newOrder.save();

        // Update or Create Customer
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

// --- MANUAL SALES & LOYALTY LOGIC ---
app.post('/api/sales/manual', auth, async (req, res) => {
    try {
        const { customerName, contactNumber, pricePerPocket, quantity } = req.body;

        // 1. Logic: Pocket Price >= ₹50 triggers loyalty count
        const loyaltyIncrement = pricePerPocket >= 50 ? quantity : 0;

        let customer = await Customer.findOne({ contactNumber });
        if (!customer) {
            customer = new Customer({ name: customerName, contactNumber });
        }

        const oldLoyalty = customer.loyaltyCount;
        customer.loyaltyCount += loyaltyIncrement;
        customer.totalOrders += 1;
        await customer.save();

        // Check if 10th pocket reached
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

app.post('/api/bills/send', auth, async (req, res) => {
    try {
        const { contactNumber, imageData, customerName } = req.body;
        // In a real API scenario,imageData (base64) would be used.
        const result = await sendDigitalBill(contactNumber, imageData, customerName);
        res.json({ message: 'Bill process triggered', result });
    } catch (error) {
        res.status(500).json({ message: 'Bill send failed' });
    }
});

// --- INVENTORY ---
app.get('/api/inventory', auth, async (req, res) => {
    try {
        const items = await Inventory.find();
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Fetch inventory failed' });
    }
});

app.patch('/api/inventory/:id', auth, async (req, res) => {
    try {
        const item = await Inventory.findByIdAndUpdate(req.params.id, { stock: req.body.stock, lastUpdated: Date.now() }, { new: true });
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: 'Inventory update failed' });
    }
});

// --- ANALYTICS ---
app.get('/api/admin/stats', auth, async (req, res) => {
    try {
        const orders = await Order.find({ status: 'Delivered' });
        const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
        const bookingCount = await Booking.countDocuments();
        const pendingOrders = await Order.countDocuments({ status: 'Pending' });
        res.json({ totalRevenue, bookingCount, pendingOrders, orderCount: orders.length });
    } catch (error) {
        res.status(500).json({ message: 'Stats failed' });
    }
});

const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI)
    .then(async () => {
        console.log('✅ Successfully connected to MongoDB Atlas');
        const adminCount = await Admin.countDocuments();
        if (adminCount === 0) await new Admin({ username: 'admin', password: 'password123' }).save();
        const invCount = await Inventory.countDocuments();
        if (invCount === 0) {
            await Inventory.insertMany([
                { itemName: 'Mushroom Seeds', stock: 100, unit: 'bags' },
                { itemName: 'Spawn Bags', stock: 50, unit: 'bags' }
            ]);
        }
        app.listen(PORT, () => console.log(`🚀 Server is live on port ${PORT}`));
    })
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err.message);
        process.exit(1);
    });
