const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Sales = require('./models/Sales');

async function showAllSales() {
    try {
        console.log('🔄 Connecting to LOCAL MongoDB...');
        await mongoose.connect('mongodb://localhost:27017/mushroom_db');
        console.log('✅ Connected to LOCAL.');

        const allSales = await Sales.find({}).sort({ date: -1 }).limit(20);
        console.log(`\n📊 Latest 20 Sales Records:\n`);

        allSales.forEach((sale, idx) => {
            console.log(`${idx + 1}. ${sale.orderId || sale._id}`);
            console.log(`   Customer: ${sale.customerName}`);
            console.log(`   Amount: ₹${sale.totalAmount}`);
            console.log(`   Payment Type: ${sale.paymentType}`);
            console.log(`   Payment Status: ${sale.paymentStatus}`);
            console.log(`   Date: ${new Date(sale.date).toLocaleDateString()}`);
            console.log('');
        });

        // Count by payment type
        const cashCount = await Sales.countDocuments({ paymentType: 'Cash' });
        const gpayCount = await Sales.countDocuments({ paymentType: 'GPay' });
        const creditCount = await Sales.countDocuments({ paymentType: 'Credit' });

        console.log(`\n📈 Summary:`);
        console.log(`- Cash: ${cashCount}`);
        console.log(`- GPay: ${gpayCount}`);
        console.log(`- Credit (Kadan): ${creditCount}`);

        // Show unpaid specifically
        const unpaid = await Sales.find({ paymentStatus: 'Unpaid' });
        console.log(`\n🔴 Unpaid Sales: ${unpaid.length}`);
        unpaid.forEach(sale => {
            console.log(`   - ${sale.customerName}: ₹${sale.totalAmount} (${sale.paymentType})`);
        });

        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

showAllSales();
