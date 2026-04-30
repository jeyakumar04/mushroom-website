const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const Customer = require('./models/Customer');
const Sales = require('./models/Sales');
const Inventory = require('./models/Inventory');

async function inspectData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const customers = await Customer.find().limit(5);
        console.log('Customers:', customers.map(c => c.name));

        const sales = await Sales.find().limit(5).sort({ date: -1 });
        console.log('Recent Sales:', sales.map(s => `${s.customerName} - ${s.totalAmount}`));

        const inventory = await Inventory.find().limit(5);
        console.log('Inventory:', inventory.map(i => i.productName));

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

inspectData();
