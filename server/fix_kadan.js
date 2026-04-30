const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const Sales = require('./models/Sales');

const LOCAL_MONGODB_URI = 'mongodb://localhost:27017/tjp_mushroom_local';

async function fixKadan() {
    try {
        await mongoose.connect(LOCAL_MONGODB_URI);
        console.log('Connected to Local DB');

        const result = await Sales.updateMany(
            { paymentType: 'Credit', paymentStatus: 'Paid' },
            { $set: { paymentStatus: 'Unpaid' } }
        );

        console.log(`Updated ${result.modifiedCount} sales from Paid to Unpaid (Credit type).`);

        const allKadan = await Sales.find({ paymentType: 'Credit', paymentStatus: 'Unpaid' });
        console.log('Current Unpaid Kadan records:');
        allKadan.forEach(s => {
            console.log(`- ${s.date.toISOString().split('T')[0]}: ${s.customerName} (₹${s.totalAmount})`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fixKadan();
