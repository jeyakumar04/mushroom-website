const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Customer = require('./models/Customer');

async function search() {
    try {
        const LOCAL_URI = 'mongodb://localhost:27017/tjp_mushroom_local';
        await mongoose.connect(LOCAL_URI);
        const customers = await Customer.find({ name: /Partha/i });
        console.log('Search Results:', customers.map(c => ({ name: c.name, phone: c.contactNumber, cycle: c.cycleCount })));
        process.exit(0);
    } catch (err) {
        process.exit(1);
    }
}
search();
