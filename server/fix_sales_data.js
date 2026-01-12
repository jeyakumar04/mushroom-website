const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Sales = require('./models/Sales');

async function fixPaymentTypes() {
    try {
        console.log('🔄 Connecting to LOCAL MongoDB...');
        await mongoose.connect('mongodb://localhost:27017/mushroom_db');
        console.log('✅ Connected to LOCAL.');

        // 1. Force UPDATE: Set any 'Paid' sales with 'Credit' status to 'Cash' (or GPay if we knew, but defaulting to Cash for safety)
        // OR better: if settledBy exists, use that.

        console.log('🛠 Scanning for inconsistent records (Paid but marked as Credit)...');

        const inconsistentSales = await Sales.find({
            paymentStatus: 'Paid',
            paymentType: 'Credit'
        });

        console.log(`Found ${inconsistentSales.length} inconsistent records.`);

        for (const sale of inconsistentSales) {
            // If settledBy is set, use it. Otherwise default to Cash.
            const newType = sale.settledBy || 'Cash';
            console.log(`Updating Sale ${sale.orderId || sale._id}: Credit -> ${newType}`);

            sale.paymentType = newType;
            // Ensure paymentStatus is definitely Paid
            sale.paymentStatus = 'Paid';

            await sale.save();
        }

        console.log('✅ Fix Complete!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

fixPaymentTypes();
